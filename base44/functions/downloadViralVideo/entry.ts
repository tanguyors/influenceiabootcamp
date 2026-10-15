import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const MAX_BYTES = 15000000;
const MAX_CANDIDATES = 3;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Clés JSON qui portent une adresse de fichier vidéo sur les pages des plateformes.
const VIDEO_KEYS = /^(playaddr|downloadaddr|play_addr|download_addr|video_url|videourl|contenturl|playable_url|playable_url_quality_hd|browser_native_hd_url|browser_native_sd_url|hd_src|sd_src|hdplay|play|url|urllist)$/i;

// Les URL trouvées dans un JSON embarqué sont échappées (\/, \u0026) : on les remet en clair.
function unescapeUrl(value: string) {
  return String(value)
    .replace(/\\u0026/gi, "&")
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/");
}

function decodeEntities(value: string) {
  const code = (n: number) => (Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "");
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => code(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => code(Number(num)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#0?39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");
}

// Page lue avec les en-têtes d'un navigateur : la plupart des plateformes ne servent
// leur lecteur (et donc l'adresse du fichier) qu'à ce prix.
async function fetchText(url: string, timeout = 30000) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "Sec-Fetch-Mode": "navigate",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

function absolute(url: string) {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://www.tikwm.com${url}`;
  return url;
}

// Balise méta d'une page (titre, image, lecteur…).
function meta(html: string, property: string) {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decodeEntities(unescapeUrl(m[1]));
  }
  return "";
}

// Adresses de fichier vidéo présentes dans le JSON embarqué d'une page, dans l'ordre du document.
// TikTok et Instagram n'exposent pas toujours le même champ : on garde plusieurs candidats.
function pageVideos(html: string) {
  if (!html) return [];
  const found: string[] = [];
  // Certaines pages échappent les barres obliques en \/ ou \u002F : on lit la valeur brute.
  const re = /"([a-zA-Z_]+)"\s*:\s*"(https?:[^"]{10,})"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const url = unescapeUrl(m[2]);
    if (!/^https?:\/\//i.test(url)) continue;
    const looksAudio = /\.(mp3|m4a|aac|wav|ogg)(\?|$|&)/i.test(url) || /music|audio|sound/i.test(m[1]);
    const looksVideo = !looksAudio && (
      /\.(mp4|m4v|mov|webm)(\?|$|&)/i.test(url)
      || /mime_type=video/i.test(url)
      || /\/video\/tos\//i.test(url)
      || (VIDEO_KEYS.test(m[1]) && /video|tiktokcdn|tikwm\.com/i.test(url)));
    if (looksVideo) found.push(url);
    if (found.length >= MAX_CANDIDATES) break;
  }
  return Array.from(new Set(found));
}

function cleanTitle(value: string) {
  return decodeEntities(value)
    .replace(/\s+/g, " ")
    .replace(/^.*?\b(?:on|sur) Instagram\s*:\s*/i, "")
    .replace(/^["“]|["”]$/g, "")
    .trim()
    .slice(0, 120);
}

// TikTok : l'API publique TikWM renvoie le fichier sans filigrane, sans clé ni compte.
// En cas d'indisponibilité, la page publique fournit d'autres adresses.
async function fromTikTok(url: string) {
  let videos: string[] = [];
  let thumb = "";
  let title = "";
  let duration = 0;
  try {
    const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(30000),
    });
    const body: any = res.ok ? await res.json().catch(() => null) : null;
    const data = body && body.data;
    if (data) {
      videos = [absolute(String(data.hdplay || "")), absolute(String(data.play || ""))].filter(Boolean);
      thumb = absolute(String(data.cover || data.origin_cover || ""));
      title = cleanTitle(data.title || "");
      duration = Math.round(Number(data.duration) || 0);
    }
  } catch {
    /* on retombe sur la page publique */
  }

  if (!videos.length) {
    const html = await fetchText(url);
    videos = pageVideos(html);
    if (!thumb) thumb = meta(html, "og:image");
    if (!title) title = cleanTitle(meta(html, "og:title"));
  }
  return videos.length ? { videos, thumb, title, duration } : null;
}

// Instagram : la page « embed » de la publication expose l'adresse du fichier dans son JSON interne.
async function fromInstagram(url: string) {
  const m = url.match(/instagram\.com\/(?:[^/]+\/)?(p|reels?|tv)\/([A-Za-z0-9_-]+)/i);
  if (!m) return null;
  const kind = /^reel/i.test(m[1]) ? "reel" : m[1].toLowerCase();
  const html = await fetchText(`https://www.instagram.com/${kind}/${m[2]}/embed/captioned/`);
  if (!html) return null;
  const videos = pageVideos(html).concat(meta(html, "og:video") ? [meta(html, "og:video")] : []);
  if (!videos.length) return null;
  return {
    videos: Array.from(new Set(videos)),
    thumb: meta(html, "og:image"),
    title: cleanTitle(meta(html, "og:title")),
    duration: 0,
  };
}

// Facebook : la page publique puis le lecteur intégré, qui expose le fichier plus volontiers.
async function fromFacebook(url: string) {
  const html = await fetchText(url);
  let videos = pageVideos(html);
  let source = html;
  if (!videos.length) {
    source = await fetchText(`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`);
    videos = pageVideos(source);
  }
  if (!videos.length) return null;
  return {
    videos,
    thumb: meta(source, "og:image"),
    title: cleanTitle(meta(source, "og:title")),
    duration: 0,
  };
}

// Dernier recours pour une plateforme reconnue : la page publique elle-même.
async function fromPage(url: string) {
  const html = await fetchText(url);
  if (!html) return null;
  const videos = [meta(html, "og:video:secure_url"), meta(html, "og:video")].filter(Boolean).concat(pageVideos(html));
  if (!videos.length) return null;
  return {
    videos: Array.from(new Set(videos)),
    thumb: meta(html, "og:image"),
    title: cleanTitle(meta(html, "og:title")),
    duration: 0,
  };
}

// Plateformes reconnues : la vidéo est extraite directement depuis la publication publique,
// sans acteur ni service payant, exactement comme le ferait un navigateur.
const SOURCES = [
  { host: /instagram\.com/i, platform: "instagram", extract: fromInstagram },
  { host: /tiktok\.com/i, platform: "tiktok", extract: fromTikTok },
  { host: /facebook\.com|fb\.watch/i, platform: "facebook", extract: fromFacebook },
];

const isFile = (url: string) => /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url);

// Range un fichier distant dans le stockage privé de l'app : la banque de modèles n'utilise que du privé.
async function storeRemote(base44: any, url: string, kind: "video" | "image", stamp: number) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "*/*" }, signal: AbortSignal.timeout(120000) });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") || "").split(";")[0].trim();
    if (!type.startsWith(`${kind}/`)) return null;
    const buffer = await res.arrayBuffer();
    if (!buffer.byteLength || buffer.byteLength > MAX_BYTES) return null;
    const ext = kind === "video"
      ? (type.includes("webm") ? "webm" : type.includes("quicktime") ? "mov" : "mp4")
      : (type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg");
    const file = new File([buffer], `modele-${stamp}.${ext}`, { type });
    const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
    return upload && upload.file_uri ? upload.file_uri : null;
  } catch {
    return null;
  }
}

// Certaines adresses sont refusées aux serveurs : on essaie les candidats dans l'ordre.
async function storeFirst(base44: any, urls: string[], stamp: number) {
  for (const url of urls.slice(0, MAX_CANDIDATES)) {
    const stored = await storeRemote(base44, url, "video", stamp);
    if (stored) return stored;
  }
  return null;
}

export default async function (req: any) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const url = String(body.url || "").trim();
    if (!/^https?:\/\//i.test(url)) {
      return Response.json({ error: "Lien invalide : collez un lien complet (https://…)." }, { status: 400 });
    }

    const source = SOURCES.find((s) => s.host.test(url));
    let found: any = null;
    let platform = "direct";

    if (source) {
      platform = source.platform;
      found = await source.extract(url);
      if (!found) found = await fromPage(url);
    } else if (isFile(url)) {
      found = { videos: [url], thumb: "", title: "", duration: 0 };
    } else {
      return Response.json({ error: "Lien non pris en charge : Instagram, TikTok, Facebook ou un lien direct .mp4." }, { status: 400 });
    }

    // TikTok refuse les téléchargements demandés par des serveurs : le message doit rester actionnable.
    const videoFailure = platform === "tiktok"
      ? "TikTok refuse la récupération de cette vidéo, ou elle dépasse 15 Mo. Téléchargez-la sur votre téléphone puis ajoutez le fichier mp4 au modèle."
      : "";

    if (!found || !found.videos.length) {
      return Response.json(
        { error: videoFailure || "Aucune vidéo téléchargeable sur ce lien. Vérifiez que la publication est publique et accessible sans connexion." },
        { status: 400 },
      );
    }

    const stamp = Date.now();
    const video_file_uri = await storeFirst(base44, found.videos, stamp);
    if (!video_file_uri) {
      return Response.json(
        { error: videoFailure || "Téléchargement impossible : fichier inaccessible ou trop lourd (15 Mo maximum)." },
        { status: 502 },
      );
    }
    const thumbnail_url = found.thumb ? await storeRemote(base44, found.thumb, "image", stamp) : null;

    return Response.json({
      video_file_uri,
      thumbnail_url: thumbnail_url || "",
      duration: Math.round(Number(found.duration) || 0),
      title: cleanTitle(found.title),
      platform,
      source_url: url,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
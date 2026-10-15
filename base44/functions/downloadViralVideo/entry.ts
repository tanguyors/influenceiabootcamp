import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const MAX_BYTES = 15000000;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Plateforme reconnue -> acteur Apify qui renvoie l'URL directe du fichier vidéo.
const SOURCES = [
  { host: /instagram\.com/i, platform: "instagram", actor: "apify~instagram-scraper", input: (url: string) => ({ directUrls: [url], resultsType: "posts", resultsLimit: 1 }) },
  { host: /tiktok\.com/i, platform: "tiktok", actor: "clockworks~free-tiktok-scraper", input: (url: string) => ({ postURLs: [url], resultsPerPage: 1 }) },
  { host: /facebook\.com|fb\.watch/i, platform: "facebook", actor: "apify~facebook-posts-scraper", input: (url: string) => ({ startUrls: [{ url }], resultsLimit: 1 }) },
];

const VIDEO_KEY = /video.*(url|link)|download.*url|downloadaddr|playaddr|contenturl|hdurl|sdurl/i;
const THUMB_KEY = /thumbnail|displayurl|cover|picture|image/i;
const TITLE_KEYS = ["caption", "text", "title", "description", "alt"];

// Toutes les chaînes URL d'une réponse Apify, avec le nom du champ qui les porte.
function collectUrls(value: any, path = "", out: Array<[string, string]> = []) {
  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value)) out.push([path, value]);
    return out;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectUrls(v, path, out);
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) collectUrls(v, path ? `${path}.${key}` : key, out);
  }
  return out;
}

const isFile = (url: string) => /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url);

// Fichier vidéo : champ explicite, sinon premier fichier vidéo trouvé.
function pickVideo(item: any): string {
  const urls = collectUrls(item);
  const named = urls.find(([key, url]) => VIDEO_KEY.test(key) && (isFile(url) || /video/i.test(url)));
  if (named) return named[1];
  const anyFile = urls.find(([, url]) => isFile(url));
  return anyFile ? anyFile[1] : "";
}

function pickThumb(item: any): string {
  const urls = collectUrls(item);
  const named = urls.find(([key, url]) => THUMB_KEY.test(key) && /\.(jpe?g|png|webp)(\?|$)/i.test(url));
  if (named) return named[1];
  const anyImage = urls.find(([, url]) => /\.(jpe?g|png|webp)(\?|$)/i.test(url));
  return anyImage ? anyImage[1] : "";
}

function pickTitle(item: any): string {
  for (const key of TITLE_KEYS) {
    const value = item && item[key];
    if (typeof value === "string" && value.trim()) return value.replace(/\s+/g, " ").trim().slice(0, 120);
  }
  return "";
}

// Durée annoncée par la source (les millisecondes sont ramenées en secondes).
function pickDuration(item: any): number {
  const values: number[] = [];
  const scan = (value: any) => {
    if (!value || typeof value !== "object") return;
    for (const [key, v] of Object.entries(value)) {
      if (/duration/i.test(key) && typeof v === "number" && v > 0) values.push(v);
      scan(v);
    }
  };
  scan(item);
  if (!values.length) return 0;
  const first = values[0];
  return Math.round(first > 600 ? first / 1000 : first);
}

async function apifyItems(actor: string, input: any, token: string) {
  const res = await fetch(
    `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&timeout=180&format=json`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(240000),
    },
  );
  if (!res.ok) {
    const detail = await res.text();
    // La limite mensuelle du compte Apify bloque toute récupération : message explicite.
    if (res.status === 402 || /hard limit|usage limit|platform-feature-disabled/i.test(detail)) {
      throw new Error("Quota Apify atteint : augmentez la limite mensuelle sur console.apify.com, ou réessayez après le renouvellement.");
    }
    throw new Error(`Source injoignable (${res.status}). ${detail.slice(0, 160)}`);
  }
  const items = await res.json();
  return Array.isArray(items) ? items : [];
}

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

    const token = secrets.get("APIFY_TOKEN");
    if (!token) return Response.json({ error: "Jeton de récupération absent." }, { status: 500 });

    const source = SOURCES.find((s) => s.host.test(url));
    let videoUrl = "";
    let thumbUrl = "";
    let title = "";
    let duration = 0;
    let platform = "direct";

    if (source) {
      platform = source.platform;
      const items = await apifyItems(source.actor, source.input(url), token);
      if (!items.length) {
        return Response.json({ error: "Aucune vidéo trouvée pour ce lien. Vérifiez que la publication est publique." }, { status: 400 });
      }
      const item = items[0];
      videoUrl = pickVideo(item);
      thumbUrl = pickThumb(item);
      title = pickTitle(item);
      duration = pickDuration(item);
      if (!videoUrl) return Response.json({ error: "Ce lien ne contient pas de vidéo téléchargeable." }, { status: 400 });
    } else if (isFile(url)) {
      videoUrl = url;
    } else {
      return Response.json({ error: "Lien non pris en charge : Instagram, TikTok, Facebook ou un lien direct .mp4." }, { status: 400 });
    }

    const stamp = Date.now();
    const video_file_uri = await storeRemote(base44, videoUrl, "video", stamp);
    if (!video_file_uri) {
      return Response.json({ error: "Téléchargement impossible : fichier inaccessible ou trop lourd (15 Mo maximum)." }, { status: 502 });
    }
    const thumbnail_url = thumbUrl ? await storeRemote(base44, thumbUrl, "image", stamp) : null;

    return Response.json({
      video_file_uri,
      thumbnail_url: thumbnail_url || "",
      duration,
      title,
      platform,
      source_url: url,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
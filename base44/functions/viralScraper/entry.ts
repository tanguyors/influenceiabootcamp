import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const TIKTOK_ACTOR = "clockworks~tiktok-scraper";
const INSTAGRAM_ACTOR = "apify~instagram-scraper";

// Seuil de viralit\u00e9 : seules les vid\u00e9os d\u00e9passant ce nombre de vues sont conserv\u00e9es.
const MIN_VIEWS = 1000000;

// Hashtags de découverte par catégorie de la bibliothèque.
const CATEGORY_HASHTAGS = {
  danse: ["dance", "dancechallenge"],
  lifestyle: ["lifestyle", "dayinmylife"],
  humour: ["humour", "funny"],
  beaute: ["beauty", "makeup"],
  fitness: ["fitness", "workout"],
  mode: ["fashion", "ootd"],
  food: ["food", "recipe"],
  voyage: ["travel", "voyage"],
  tech: ["tech", "gadget"],
};

async function runActor(actor, input, token, limit) {
  const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?limit=${limit}&timeout=110`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(120000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Apify ${res.status} : ${text.slice(0, 200)}`);
  }
  const data = JSON.parse(text);
  return Array.isArray(data) ? data : (data.items || []);
}

function mapTikTok(item, category) {
  const url = item.webVideoUrl || item.videoUrl || "";
  if (!url) return null;
  return {
    title: String(item.text || "Vidéo TikTok").slice(0, 180),
    platform: "tiktok",
    source_url: url,
    thumbnail_url: (item.covers && item.covers.default) || (item.videoMeta && item.videoMeta.coverUrl) || "",
    duration: (item.videoMeta && item.videoMeta.duration) || null,
    published_date: item.createTimeISO || (item.createTime ? new Date(item.createTime * 1000).toISOString() : new Date().toISOString()),
    category,
    stats: {
      views: item.playCount ?? null,
      likes: item.diggCount ?? null,
      shares: item.shareCount ?? null,
    },
    is_manual: false,
    is_demo: false,
  };
}

function isViral(video) {
  const views = video.stats && video.stats.views;
  return typeof views === "number" && views >= MIN_VIEWS;
}

/* ------------------- Fichier source (transfert de mouvement) ---------------- */

function candidateMediaUrls(item) {
  const list = [];
  if (Array.isArray(item.mediaUrls)) list.push(...item.mediaUrls);
  for (const key of ["videoUrl", "downloadUrl", "video_url"]) if (item[key]) list.push(item[key]);
  return list.filter((u) => typeof u === "string" && /^https?:\/\//.test(u));
}

// Télécharge le fichier vidéo d'une publication et le stocke avec la vidéo de la bibliothèque.
async function storeSourceFile(base44, video, token) {
  const isTikTok = video.platform === "tiktok";
  const items = isTikTok
    ? await runActor(TIKTOK_ACTOR, {
        postURLs: [video.source_url],
        resultsPerPage: 1,
        shouldDownloadVideos: true,
        shouldDownloadCovers: false,
        proxyCountryCode: "None",
      }, token, 1)
    : await runActor(INSTAGRAM_ACTOR, {
        directUrls: [video.source_url],
        resultsType: "posts",
        resultsLimit: 1,
        addParentData: false,
      }, token, 1);

  const item = items[0];
  if (!item) throw new Error("Publication introuvable chez le fournisseur.");
  const candidates = candidateMediaUrls(item);
  if (!candidates.length) throw new Error("Cette publication n'expose aucun fichier vidéo.");

  let failure = "";
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": isTikTok ? "https://www.tiktok.com/" : "https://www.instagram.com/",
        },
        signal: AbortSignal.timeout(90000),
      });
      if (!res.ok) { failure = `Téléchargement refusé (${res.status})`; continue; }
      const blob = await res.blob();
      if (blob.size < 20000) { failure = "Fichier vidéo illisible"; continue; }
      if (blob.size > 45 * 1024 * 1024) { failure = "Fichier vidéo trop volumineux"; continue; }
      const file = new File([blob], "source.mp4", { type: blob.type || "video/mp4" });
      const { file_uri } = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
      const duration = Number((item.videoMeta && item.videoMeta.duration) || item.videoDuration || 0) || null;
      const patch = { video_file_uri: file_uri };
      if (duration) patch.duration = duration;
      if (!video.thumbnail_url) patch.thumbnail_url = (item.covers && item.covers.default) || item.displayUrl || "";
      await base44.entities.ViralVideo.update(video.id, patch);
      return { video_file_uri: file_uri, duration };
    } catch (e) {
      failure = e.message;
    }
  }
  throw new Error(failure || "Téléchargement impossible.");
}

function mapInstagram(item, category) {
  const url = item.url || (item.shortCode ? `https://www.instagram.com/p/${item.shortCode}/` : "");
  if (!url) return null;
  const isVideo = item.type === "Video" || item.productType === "clips" || Boolean(item.videoUrl);
  if (!isVideo) return null;
  return {
    title: String(item.caption || `Reel Instagram${item.ownerUsername ? " @" + item.ownerUsername : ""}`).slice(0, 180),
    platform: "instagram",
    source_url: url,
    thumbnail_url: item.displayUrl || (item.images && item.images[0]) || "",
    duration: item.videoDuration || null,
    published_date: item.timestamp || new Date().toISOString(),
    category,
    stats: {
      views: item.videoPlayCount ?? item.videoViewCount ?? item.igPlayCount ?? null,
      likes: item.likesCount ?? null,
      shares: item.sharesCount ?? null,
    },
    is_manual: false,
    is_demo: false,
  };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const token = secrets.get("APIFY_TOKEN");
    if (!token) {
      return Response.json({
        error: "Clé Apify absente. Ajoutez le secret APIFY_TOKEN depuis le tableau de bord (Réglages → Secrets) pour activer la récupération automatique.",
      }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));

    // Récupère le fichier source d'une vidéo déjà en bibliothèque (requis pour reprendre le mouvement).
    if (body.action === "fetchSource") {
      const id = String(body.viral_video_id || "");
      if (!id) return Response.json({ error: "viral_video_id requis" }, { status: 400 });
      const vp = await base44.entities.ViralVideo.filter({ id }, { limit: 1 });
      const video = (vp.items || [])[0];
      if (!video) return Response.json({ error: "Vidéo introuvable dans la bibliothèque." }, { status: 404 });
      if (video.video_file_uri) {
        return Response.json({ ok: true, video_file_uri: video.video_file_uri, duration: video.duration || null });
      }
      try {
        return Response.json({ ok: true, ...(await storeSourceFile(base44, video, token)) });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 502 });
      }
    }

    const category = String(body.category || "");
    const hashtags = CATEGORY_HASHTAGS[category];
    if (!hashtags) {
      return Response.json({ error: "Catégorie inconnue ou non précisée." }, { status: 400 });
    }

    const requested = Array.isArray(body.platforms) ? body.platforms : ["tiktok", "instagram"];
    const platforms = requested.filter((p) => p === "tiktok" || p === "instagram");
    if (!platforms.length) {
      return Response.json({ error: "Le scraper couvre TikTok et Instagram Reels." }, { status: 400 });
    }

    const limit = Math.min(Math.max(parseInt(body.limit, 10) || 12, 4), 30);

    // On r\u00e9cup\u00e8re large pour ne garder ensuite que les vid\u00e9os vraiment virales.
    const fetchCount = Math.min(limit * 5, 60);

    const jobs = platforms.map(async (platform) => {
      if (platform === "tiktok") {
        const items = await runActor(TIKTOK_ACTOR, {
          hashtags,
          resultsPerPage: fetchCount,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
          excludePinnedPosts: false,
          proxyCountryCode: "None",
        }, token, fetchCount);
        return items.map((i) => mapTikTok(i, category)).filter(Boolean).filter(isViral);
      }
      const items = await runActor(INSTAGRAM_ACTOR, {
        directUrls: hashtags.map((h) => `https://www.instagram.com/explore/tags/${h}/`),
        resultsType: "reels",
        resultsLimit: fetchCount,
        addParentData: false,
      }, token, fetchCount);
      return items.map((i) => mapInstagram(i, category)).filter(Boolean).filter(isViral);
    });

    const settled = await Promise.allSettled(jobs);
    const records = [];
    const errors = [];
    for (const r of settled) {
      if (r.status === "fulfilled") records.push(...r.value);
      else errors.push(String(r.reason && r.reason.message ? r.reason.message : r.reason));
    }

    const seen = new Set();
    const unique = records.filter((r) => {
      if (seen.has(r.source_url)) return false;
      seen.add(r.source_url);
      return true;
    });

    // Les plus vues d'abord, puis on s'arr\u00eate au nombre demand\u00e9.
    unique.sort((a, b) => (b.stats.views || 0) - (a.stats.views || 0));
    const selected = unique.slice(0, limit);

    let created = 0;
    let updated = 0;
    if (selected.length) {
      const result = await base44.entities.ViralVideo.upsert(selected, { key: "source_url" });
      created = (result && result.created) || 0;
      updated = (result && result.updated) || 0;
    }

    return Response.json({ created, updated, total: selected.length, minViews: MIN_VIEWS, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
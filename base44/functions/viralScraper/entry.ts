import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const TIKTOK_ACTOR = "clockworks~tiktok-scraper";
const INSTAGRAM_ACTOR = "apify~instagram-scraper";

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

    const jobs = platforms.map(async (platform) => {
      if (platform === "tiktok") {
        const items = await runActor(TIKTOK_ACTOR, {
          hashtags,
          resultsPerPage: limit,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
          excludePinnedPosts: false,
          proxyCountryCode: "None",
        }, token, limit);
        return items.map((i) => mapTikTok(i, category)).filter(Boolean);
      }
      const items = await runActor(INSTAGRAM_ACTOR, {
        directUrls: hashtags.map((h) => `https://www.instagram.com/explore/tags/${h}/`),
        resultsType: "reels",
        resultsLimit: limit,
        addParentData: false,
      }, token, limit);
      return items.map((i) => mapInstagram(i, category)).filter(Boolean);
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

    let created = 0;
    let updated = 0;
    if (unique.length) {
      const result = await base44.entities.ViralVideo.upsert(unique, { key: "source_url" });
      created = (result && result.created) || 0;
      updated = (result && result.updated) || 0;
    }

    return Response.json({ created, updated, total: unique.length, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
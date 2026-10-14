import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getAccessToken, callTool } from "../../shared/higgsfield.ts";

/* ----------------------------- Utilitaires MCP ---------------------------- */

function resultText(res) {
  if (!res) return "";
  if (typeof res === "string") return res;
  if (Array.isArray(res.content)) return res.content.map((c) => (c && c.text) || "").join(" ");
  if (res.text) return res.text;
  return "";
}

// Les URLs du résultat uniquement : le sous-objet "params" ne contient que l'écho de la requête
// (les médias importés), jamais la vidéo produite.
function collectStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) collectStrings(v, out);
  else if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      if (key === "params") continue;
      collectStrings(v, out);
    }
  }
  return out;
}

const VIDEO_RE = /https?:\/\/[^\s"'<>]+\.(mp4|mov|webm)(\?[^\s"'<>]*)?/i;

function mapStatus(raw) {
  const s = String(raw || "").toLowerCase();
  if (["completed", "complete", "succeeded", "success", "ready", "done", "finished"].includes(s)) return "ready";
  if (["failed", "error", "canceled", "cancelled", "rejected"].includes(s)) return "failed";
  return s ? "processing" : "";
}

// Lit un résultat MCP (soumission ou état de tâche) quelle que soit sa forme.
// Higgsfield imbrique l'état réel dans structuredContent.generation.
function readJob(res) {
  const sc = (res && res.structuredContent) || {};
  const layers = [sc, sc.generation, sc.job, sc.data, sc.result].filter((l) => l && typeof l === "object");
  const strings = collectStrings(res);
  const text = resultText(res);

  const found = strings.map((s) => (s.match(VIDEO_RE) || [])[0]).find(Boolean) || "";

  let status = "";
  let jobId = "";
  let failure = "";
  for (const layer of layers) {
    if (!status) status = layer.status || layer.job_status || layer.state || "";
    if (!jobId) jobId = layer.job_id || layer.jobId || layer.id || "";
    if (!failure) failure = layer.error || layer.error_message || layer.failure_reason || "";
  }
  if (!jobId) {
    const m = text.match(/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/);
    if (m) jobId = m[0];
  }

  const error = (res && res.isError)
    ? (text || "Appel refusé par Higgsfield").slice(0, 500)
    : String(failure || "").slice(0, 500);

  const mapped = mapStatus(status);
  // Une URL n'est retenue que si la tâche est terminée : tant qu'elle tourne, les seules
  // vidéos présentes sont celles des médias d'entrée.
  return { status: mapped, videoUrl: mapped === "ready" ? found : "", jobId, error };
}

// Importe un média (URL signée) dans Higgsfield : les outils de génération n'acceptent que des media_id confirmés.
async function importMedia(token, url, type) {
  const res = await callTool(token, "media_import_url", { url, ...(type ? { type } : {}) });
  const sc = (res && res.structuredContent) || {};
  if (sc.media_id) return sc.media_id;
  const m = resultText(res).match(/media_id\s+([0-9a-fA-F-]{36})/);
  if (m) return m[1];
  throw new Error(`Import du média refusé : ${(resultText(res) || "réponse inattendue").slice(0, 200)}`);
}

function supportsDuration(model, seconds) {
  if (!seconds) return true;
  const range = model.duration_range;
  if (range && range.min && range.max) return seconds >= range.min && seconds <= range.max;
  if (Array.isArray(model.durations) && model.durations.length) return model.durations.includes(seconds);
  return true;
}

function modelRoles(model) {
  return Array.from(new Set((model.medias || []).flatMap((x) => x.roles || [])));
}

async function listVideoModels(token) {
  const res = await callTool(token, "models_explore", { action: "list", type: "video", limit: 60 });
  let items = ((res && res.structuredContent) || {}).items;
  if (!items) {
    try { items = JSON.parse(resultText(res)).items; } catch { items = []; }
  }
  return items || [];
}

// Modèles capables de reprendre la vidéo source (cadre, caméra, décor, mouvement)
// tout en utilisant le personnage fourni comme référence.
const REFERENCE_MODELS = ["seedance_2_5", "seedance_2_0", "minimax_h3_max", "minimax_h3", "wan2_6", "flux_3_video"];

function referenceRank(model) {
  const i = REFERENCE_MODELS.indexOf(String(model.id || "").toLowerCase());
  return i < 0 ? 0 : REFERENCE_MODELS.length - i;
}

function pickReferenceModel(models, seconds) {
  const usable = models.filter((m) => {
    const roles = modelRoles(m);
    return roles.includes("video_references") && (roles.includes("image_references") || roles.includes("image"));
  }).sort((a, b) => referenceRank(b) - referenceRank(a));
  return usable.find((m) => supportsDuration(m, seconds)) || usable[0] || null;
}

function scoreModel(model) {
  const id = String(model.id || "").toLowerCase();
  const tags = (model.tags || []).map((t) => String(t).toLowerCase());
  let score = 0;
  if (id.includes("kling")) score += 10;
  if (id.includes("soul")) score += 9;
  if (id.includes("seedance")) score += 8;
  if (id.includes("veo")) score += 7;
  if (id.includes("cinematic_studio")) score += 5;
  if (tags.includes("sota")) score += 3;
  if (tags.includes("best-quality")) score += 2;
  return score;
}

// Sélectionne un modèle vidéo acceptant une image de référence.
function pickImageModel(models, seconds) {
  const usable = models.filter((m) => {
    const roles = modelRoles(m);
    return roles.includes("image") || roles.includes("start_image");
  }).sort((a, b) => scoreModel(b) - scoreModel(a));
  if (!seconds) return usable[0] || null;
  return usable.find((m) => supportsDuration(m, seconds)) || usable[0] || null;
}

// Rafraîchit l'état des générations en cours auprès de Higgsfield.
async function refreshProcessing(base44, token) {
  const page = await base44.entities.Creation.filter({ status: "processing" }, { sort: "-created_date", limit: 20 });
  const pending = (page.items || []).filter((c) => c.higgsfield_job_id);
  // Générations lancées sans tâche suivie : elles ne peuvent plus aboutir.
  const untracked = (page.items || []).filter((c) => !c.higgsfield_job_id
    && Date.now() - new Date(c.created_date).getTime() > 120000);
  let updated = 0;
  for (const creation of untracked) {
    try {
      await base44.entities.Creation.update(creation.id, {
        status: "failed",
        error: "Aucune tâche Higgsfield associée : relancez la génération.",
      });
      updated++;
    } catch { /* ignoré */ }
  }
  for (const creation of pending) {
    try {
      const res = await callTool(token, "job_status", { jobId: creation.higgsfield_job_id });
      const job = readJob(res);
      const patch = {};
      if (job.error) { patch.status = "failed"; patch.error = job.error; }
      else if (job.videoUrl) { patch.status = "ready"; patch.result_video_url = job.videoUrl; }
      // Tâche terminée mais résultat illisible : on garde le suivi en cours pour la relire.
      else if (job.status === "processing") patch.status = "processing";
      if (Object.keys(patch).length) {
        await base44.entities.Creation.update(creation.id, patch);
        updated++;
      }
    } catch { /* nouvelle tentative au prochain rafraîchissement */ }
  }
  return { checked: pending.length, updated };
}

/* ---------------------------------- Action -------------------------------- */

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    const token = await getAccessToken(base44);
    if (!token) {
      return Response.json({
        error: "Compte Higgsfield non connecté. Connectez-le depuis la page Connexion Higgsfield.",
      }, { status: 400 });
    }

    if (body.action === "refresh") {
      return Response.json(await refreshProcessing(base44, token));
    }

    const { influencer_id, viral_video_id, aspect_ratio, resolution, wardrobe, setting, instructions } = body;
    if (!influencer_id) return Response.json({ error: "influencer_id requis" }, { status: 400 });

    const infPage = await base44.entities.Influencer.filter({ id: influencer_id }, { limit: 1 });
    const influencer = (infPage.items || [])[0];
    if (!influencer) return Response.json({ error: "Influenceur introuvable" }, { status: 404 });

    const photoUris = (Array.isArray(influencer.reference_images) && influencer.reference_images.length
      ? influencer.reference_images
      : [influencer.reference_image]).filter(Boolean).slice(0, 8);
    if (!photoUris.length) {
      return Response.json({ error: "Cet influenceur n'a aucune photo de référence." }, { status: 400 });
    }

    let viralVideo = null;
    if (viral_video_id) {
      const vp = await base44.entities.ViralVideo.filter({ id: viral_video_id }, { limit: 1 });
      viralVideo = (vp.items || [])[0];
    }

    // Durée : toujours celle de la vidéo d'origine (jamais un choix manuel).
    const sourceDuration = Number(viralVideo && viralVideo.duration) > 0 ? Number(viralVideo.duration) : null;

    // Higgsfield télécharge lui-même les médias : URLs signées temporaires.
    const imageUrls = (await Promise.all(photoUris.map(async (uri) => {
      try {
        // 3600 s est le maximum autorisé pour une URL signée.
        const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
          file_uri: uri, expires_in: 3600,
        });
        return signed_url;
      } catch { return ""; }
    }))).filter(Boolean);
    if (!imageUrls.length) {
      return Response.json({ error: "Impossible de préparer les photos de référence." }, { status: 400 });
    }

    let videoUrl = "";
    if (viralVideo && viralVideo.video_file_uri) {
      try {
        const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
          file_uri: viralVideo.video_file_uri, expires_in: 3600,
        });
        videoUrl = signed_url;
      } catch { /* on continue sans vidéo source */ }
    }

    const parts = [];
    if (videoUrl) parts.push("Reprendre la vidéo de référence en remplaçant uniquement la personne filmée par le personnage principal : conserver à l'identique le cadrage, les mouvements de caméra, le décor, la lumière, le montage et le rythme de la vidéo ; seules l'identité et l'apparence de la personne changent.");
    else if (viralVideo) parts.push(`Reprendre la direction visuelle (cadrage, mise en scène, rythme) de la vidéo de référence « ${viralVideo.title} » (${viralVideo.platform}, ${viralVideo.category}).`);
    parts.push(`Personnage principal : ${influencer.name}, conserver son visage et son apparence.`);
    if (imageUrls.length > 1) {
      parts.push(`Le personnage est fourni sous ${imageUrls.length} angles différents : garder exactement le même visage, la même coiffure et la même morphologie.`);
    }
    if (influencer.notes) parts.push(`Notes du personnage : ${influencer.notes}`);
    if (wardrobe) parts.push(`Tenue : ${wardrobe}.`);
    if (setting) parts.push(`Décor : ${setting}.`);
    if (instructions) parts.push(instructions);
    parts.push(`Format ${aspect_ratio || "9:16"}, résolution ${resolution || "1080p"}.`);
    parts.push(sourceDuration
      ? `Durée stricte : ${sourceDuration} secondes, exactement comme la vidéo d'origine.`
      : "Conserver exactement la durée de la vidéo d'origine.");
    const prompt = parts.join(" ");

    const creation = await base44.entities.Creation.create({
      influencer_id,
      influencer_name: influencer.name,
      viral_video_id: viral_video_id || "",
      viral_video_title: viralVideo ? viralVideo.title : "",
      status: "processing",
      model: "",
      duration: sourceDuration || undefined,
      aspect_ratio: aspect_ratio || "9:16",
      resolution: resolution || "1080p",
      prompt,
    });

    try {
      // 1. Import des médias : Higgsfield n'accepte que des media_id confirmés.
      const imageMediaId = await importMedia(token, imageUrls[0], "image");
      let motionMediaId = "";
      if (videoUrl) {
        try { motionMediaId = await importMedia(token, videoUrl, "video"); } catch { motionMediaId = ""; }
      }

      // 2. La vidéo source sert de référence (cadre, caméra, décor, rythme) : seule la personne est remplacée.
      const videoModels = motionMediaId ? await listVideoModels(token) : [];
      const referenceModel = motionMediaId ? pickReferenceModel(videoModels, sourceDuration) : null;

      let toolName = "";
      let result = null;
      if (referenceModel && motionMediaId) {
        toolName = `generate_video:${referenceModel.id}`;
        const medias = [
          { value: motionMediaId, role: "video_references" },
          { value: imageMediaId, role: "image_references" },
        ];
        // Une seconde photo aide le modèle à garder le visage.
        if (imageUrls[1]) {
          try { medias.push({ value: await importMedia(token, imageUrls[1], "image"), role: "image_references" }); } catch { /* une référence suffit */ }
        }
        result = await callTool(token, "generate_video", {
          params: {
            model: referenceModel.id,
            prompt,
            aspect_ratio: aspect_ratio || "9:16",
            ...(sourceDuration ? { duration: sourceDuration } : {}),
            medias,
          },
        });
      } else if (motionMediaId) {
        // Repli : transfert de mouvement, le décor de la vidéo source est conservé.
        toolName = "motion_control";
        result = await callTool(token, toolName, {
          params: {
            image_id: imageMediaId,
            motion_video_id: motionMediaId,
            resolution: resolution === "720p" ? "720p" : "1080p",
            scene_control: "video",
          },
        });
      } else {
        const model = pickImageModel(videoModels.length ? videoModels : await listVideoModels(token), sourceDuration);
        if (!model) throw new Error("Aucun modèle vidéo compatible n'est disponible sur votre compte Higgsfield.");
        toolName = `generate_video:${model.id}`;
        result = await callTool(token, "generate_video", {
          params: {
            model: model.id,
            prompt,
            aspect_ratio: aspect_ratio || "9:16",
            ...(sourceDuration ? { duration: sourceDuration } : {}),
            medias: [{ value: imageMediaId, role: "image" }],
          },
        });
      }

      const job = readJob(result);
      if (job.error) {
        await base44.entities.Creation.update(creation.id, { status: "failed", error: job.error, model: toolName });
        return Response.json({ error: job.error, creation_id: creation.id }, { status: 400 });
      }
      if (!job.videoUrl && !job.jobId) {
        const msg = `Higgsfield n'a renvoyé aucune tâche à suivre (outil ${toolName}).`;
        await base44.entities.Creation.update(creation.id, { status: "failed", error: msg, model: toolName });
        return Response.json({ error: msg, creation_id: creation.id }, { status: 502 });
      }

      await base44.entities.Creation.update(creation.id, {
        status: job.videoUrl ? "ready" : "processing",
        result_video_url: job.videoUrl,
        higgsfield_job_id: job.jobId,
        model: toolName,
      });
      return Response.json({ creation_id: creation.id, status: job.videoUrl ? "ready" : "processing", tool: toolName });
    } catch (e) {
      await base44.entities.Creation.update(creation.id, { status: "failed", error: e.message });
      return Response.json({ error: e.message, creation_id: creation.id }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
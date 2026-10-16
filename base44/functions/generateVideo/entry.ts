import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getAccessToken, callTool } from "../../shared/higgsfield.ts";
import { resultText, collectStrings } from "../../shared/mcp.ts";
import { prepareMotionReference } from "../../shared/motionReference.ts";
import { characterPhotos, replacementModelId, replacementParams, outputVideoUrl, requestVideo } from "../../shared/characterReplacement.ts";

function mapStatus(raw) {
  const s = String(raw || "").toLowerCase();
  if (["completed", "complete", "succeeded", "success", "ready", "done", "finished"].includes(s)) return "ready";
  if (["failed", "error", "canceled", "cancelled", "rejected"].includes(s)) return "failed";
  return s ? "processing" : "";
}

// Higgsfield bloque certaines générations pour contenu protégé (personne réelle,
// contenu sous droits) : ces états ne progressent jamais.
const MODERATION_STATUSES = [
  "ip_detected", "ip_detection", "moderated", "moderation", "blocked", "policy_violation",
  "nsfw", "flagged", "content_blocked", "copyright", "copyrighted",
];

function moderationMessage(raw) {
  if (String(raw).toLowerCase().startsWith("ip_detect")) {
    return "Higgsfield a détecté du contenu protégé (personne réelle ou contenu sous droits) dans la vidéo de référence : la génération a été bloquée. Choisissez une autre vidéo de référence.";
  }
  return `Génération refusée par Higgsfield (${raw}).`;
}

// Lit un résultat MCP (soumission ou état de tâche) quelle que soit sa forme.
// Higgsfield imbrique l'état réel dans structuredContent.generation.
function readJob(res) {
  const sc = (res && res.structuredContent) || {};
  // Certaines soumissions (édition vidéo) renvoient une liste « results » : la tâche est le
  // premier élément, jamais un champ de premier niveau.
  const first = (v) => (Array.isArray(v) ? v[0] : v);
  const layers = [sc, sc.generation, sc.job, sc.data, sc.result, first(sc.results), first(sc.generations)]
    .filter((l) => l && typeof l === "object");
  const strings = collectStrings(res);
  const text = resultText(res);

  const found = outputVideoUrl(res);

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

  let error = (res && res.isError)
    ? (text || "Appel refusé par Higgsfield").slice(0, 500)
    : String(failure || "").slice(0, 500);

  // Un état de modération doit être traité comme un échec, sinon la génération
  // resterait « en cours » indéfiniment dans l'interface.
  const blocked = MODERATION_STATUSES.includes(String(status || "").toLowerCase());
  if (blocked) error = moderationMessage(status);

  const badFraming = /upper[\s_-]*body[\s_-]*not[\s_-]*detected/i.test(strings.join(" "));
  if (badFraming) error = "Higgsfield ne détecte pas le haut du corps : utilisez une photo individuelle montrant la tête, les épaules, le torse et les bras, et non un portrait serré ou une planche.";
  const mapped = blocked || badFraming ? "failed" : mapStatus(status);
  // Une URL n'est retenue que si la tâche est terminée : tant qu'elle tourne, les seules
  // vidéos présentes sont celles des médias d'entrée.
  return { status: mapped, videoUrl: mapped === "ready" ? found : "", jobId, error, blocked };
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



// Ne pas attribuer sans preuve un refus à la durée : le MCP peut omettre le motif
// que le site Higgsfield affiche, notamment une référence au cadrage trop serré.
function interruptionMessage() {
  return "Higgsfield a interrompu cette génération sans transmettre le motif à l'application. Consultez le détail de l'échec sur Higgsfield avant de relancer.";
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

// Consigne reprise par toutes les générations à partir d'une vidéo source : le plan d'origine
// n'est pas réinterprété, seule la personne principale change de visage.
const KEEP_CAST = "Toutes les autres personnes présentes dans le plan (partenaire, figurants, passants, groupes et couples qui dansent) restent à l'identique : ne jamais les supprimer, les déplacer, les dupliquer ni les remplacer, et ne jamais isoler le personnage principal en plan solo ; garder ses interactions avec les personnes autour de lui, ainsi que le décor, la lumière, le cadrage et les mouvements de caméra d'origine.";

// Aucun repli automatique vers le transfert de mouvement : il peut supprimer les
// partenaires, et un refus ne doit jamais déclencher une nouvelle dépense.

// Rafraîchit l'état des générations en cours auprès de Higgsfield.
async function refreshProcessing(base44, token) {
  const page = await base44.entities.Creation.filter({ status: "processing" }, { sort: "-created_date", limit: 20 });
  const age = (c) => Date.now() - new Date(c.created_date).getTime();
  const pending = (page.items || []).filter((c) => c.higgsfield_job_id);
  // Générations lancées sans tâche suivie : elles ne peuvent plus aboutir.
  const untracked = (page.items || []).filter((c) => !c.higgsfield_job_id && age(c) > 120000);
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
      // Tâche interrompue sans message : l'utilisateur doit le voir tout de suite.
      else if (job.status === "failed") {
        patch.status = "failed";
        patch.error = interruptionMessage(creation);
      }
      // Tâche sans réponse depuis 45 minutes : on libère la liste au lieu d'attendre sans fin.
      else if (age(creation) > 2700000) {
        patch.status = "failed";
        patch.error = "Aucune réponse de Higgsfield après 45 minutes : relancez la génération.";
      }
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

    const photoUris = characterPhotos(influencer);
    if (!photoUris.length) {
      return Response.json({ error: "Cet influenceur n'a aucune photo de référence." }, { status: 400 });
    }
    if (body.action === "prepare_reference") {
      const uri = await prepareMotionReference(base44, influencer);
      return Response.json({ reference_image: uri, source: photoUris[0] });
    }

    let viralVideo = null;
    if (viral_video_id) {
      const vp = await base44.entities.ViralVideo.filter({ id: viral_video_id }, { limit: 1 });
      viralVideo = (vp.items || [])[0];
    }

    // Le remplacement utilise les vraies photos du personnage, portrait compris,
    // jamais une référence plein pied recréée pour le transfert de mouvement.

    // Durée : toujours celle de la vidéo d'origine (jamais un choix manuel).
    const sourceDuration = Number(viralVideo && viralVideo.duration) > 0 ? Number(viralVideo.duration) : null;

    // Higgsfield télécharge lui-même les médias : URLs signées temporaires.
    const imageUrls = (await Promise.all(photoUris.map(async (uri) => {
      try {
        if (/^https:\/\//i.test(uri)) return uri;
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
      } catch {
        return Response.json({ error: "Impossible de préparer la vidéo source. Aucune génération n'a été lancée." }, { status: 400 });
      }
    }

    const parts = [];
    if (videoUrl) parts.push(`Replace ONLY the main foreground performer in the source video with the person shown in the reference photos. The FIRST image is the identity portrait; the other images show the SAME character. Use that exact face, facial markings, skin tone, hair and physical identity throughout every frame. Do not keep the original performer's face or blend the two identities. Track the SAME foreground person throughout the shot, including turns and occlusions. Preserve their original dance, pose, timing, position and interactions. Every other person must remain unchanged. Keep the original setting, lighting, framing, camera movement, cuts and duration. ${KEEP_CAST}`);
    else if (viralVideo) parts.push(`Reprendre la direction visuelle (cadrage, mise en scène, rythme) de la vidéo de référence « ${viralVideo.title} » (${viralVideo.platform}, ${viralVideo.category}).`);
    parts.push(`Personnage principal : ${influencer.name}, conserver son visage et son apparence.`);
    if (imageUrls.length > 1) {
      parts.push(`Le personnage est fourni sous ${imageUrls.length} angles différents : garder exactement le même visage, la même coiffure et la même morphologie.`);
    }
    if (!videoUrl && influencer.notes) parts.push(`Notes du personnage : ${influencer.notes}`);
    if (wardrobe) parts.push(`Tenue : ${wardrobe}.`);
    if (setting) parts.push(`Décor : ${setting}.`);
    if (instructions) parts.push(instructions);
    parts.push(`Format ${aspect_ratio || "9:16"}, résolution ${resolution || "1080p"}.`);
    parts.push(sourceDuration
      ? `Durée stricte : ${sourceDuration} secondes, exactement comme la vidéo d'origine.`
      : "Conserver exactement la durée de la vidéo d'origine.");
    const prompt = parts.join(" ");

    let creation = null;
    try {
      let toolName;
      let params;
      if (videoUrl) {
        const catalog = await callTool(token, "models_explore", { action: "get", model_id: replacementModelId });
        if (catalog?.isError) throw new Error("Le mode de remplacement de personnage n'est pas disponible sur ce compte. Aucune génération n'a été lancée.");
        // Portrait et photos originales sont tous transmis, pas seulement la première image.
        const imageMediaIds = await Promise.all(imageUrls.map((url) => importMedia(token, url, "image")));
        const videoMediaId = await importMedia(token, videoUrl, "video");
        toolName = `character_replace:${replacementModelId}`;
        params = replacementParams(prompt, imageMediaIds, videoMediaId, resolution);
      } else {
        const model = pickImageModel(await listVideoModels(token), sourceDuration);
        if (!model) throw new Error("Aucun modèle vidéo compatible n'est disponible sur votre compte Higgsfield.");
        toolName = `generate_video:${model.id}`;
        params = {
          model: model.id,
          prompt,
          aspect_ratio: aspect_ratio || "9:16",
          ...(sourceDuration ? { duration: sourceDuration } : {}),
          medias: [{ value: await importMedia(token, imageUrls[0], "image"), role: "image" }],
        };
      }
      // Prévalidation sans soumission ni écriture, pour vérifier les médias et le mode.
      if (body.action === "estimate") {
        const estimate = await requestVideo(token, { ...params, get_cost: true });
        if (estimate?.isError) return Response.json({ error: resultText(estimate) }, { status: 400 });
        return Response.json({ tool: toolName, reference_count: imageUrls.length, estimate: estimate?.structuredContent || estimate });
      }
      creation = await base44.entities.Creation.create({
        influencer_id,
        influencer_name: influencer.name,
        viral_video_id: viral_video_id || "",
        viral_video_title: viralVideo ? viralVideo.title : "",
        status: "processing",
        model: toolName,
        duration: sourceDuration || undefined,
        aspect_ratio: aspect_ratio || "9:16",
        resolution: resolution || "1080p",
        prompt,
      });
      const result = await requestVideo(token, params);
      const job = readJob(result);
      // Un refus ne doit pas provoquer une deuxième soumission payante.
      if (job.error || job.status === "failed") {
        const message = job.error || "Higgsfield a interrompu cette génération sans préciser le motif.";
        await base44.entities.Creation.update(creation.id, { status: "failed", error: message, model: toolName });
        return Response.json({ error: message, creation_id: creation.id }, { status: 400 });
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
      if (creation) await base44.entities.Creation.update(creation.id, { status: "failed", error: e.message });
      return Response.json({ error: e.message, creation_id: creation?.id }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
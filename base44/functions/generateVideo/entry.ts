import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getCredentials, submitMotionTransfer, ENGINE_LABEL } from "../../shared/higgsfield.ts";

function buildPrompt({ influencer, viralVideo, wardrobe, setting, instructions }) {
  const parts = [];
  parts.push("Conserver exactement le mouvement, le cadrage et le rythme de la vidéo source.");
  parts.push(`Personnage principal : ${influencer.name}. Conserver son visage et son apparence.`);
  if (viralVideo.category) parts.push(`Style de contenu : ${viralVideo.category}.`);
  if (influencer.notes) parts.push(`Notes du personnage : ${influencer.notes}`);
  if (wardrobe) parts.push(`Tenue : ${wardrobe}.`);
  if (setting) parts.push(`Décor : ${setting}.`);
  if (instructions) parts.push(instructions);
  return parts.join(" ").slice(0, 10000);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { influencer_id, viral_video_id, resolution, wardrobe, setting, instructions } = body;
    if (!influencer_id) return Response.json({ error: "influencer_id requis" }, { status: 400 });
    if (!viral_video_id) return Response.json({ error: "viral_video_id requis" }, { status: 400 });

    if (!getCredentials().configured) {
      return Response.json({
        error: "Identifiants Higgsfield non configurés. Ajoutez HIGGSFIELD_API_KEY_ID et HIGGSFIELD_API_KEY_SECRET dans la page Secrets de l'application.",
      }, { status: 400 });
    }

    const infPage = await base44.entities.Influencer.filter({ id: influencer_id }, { limit: 1 });
    const influencer = (infPage.items || [])[0];
    if (!influencer) return Response.json({ error: "Influenceur introuvable" }, { status: 404 });
    if (!influencer.reference_image) {
      return Response.json({ error: "Cet influenceur n'a pas d'image de référence." }, { status: 400 });
    }

    const vp = await base44.entities.ViralVideo.filter({ id: viral_video_id }, { limit: 1 });
    const viralVideo = (vp.items || [])[0];
    if (!viralVideo) return Response.json({ error: "Vidéo de référence introuvable" }, { status: 404 });
    if (!viralVideo.video_file_uri) {
      return Response.json({
        error: "Cette référence n'a pas de vidéo source. Ajoutez le fichier mp4 dans la bibliothèque (4 à 30 s) pour permettre le transfert de mouvement.",
      }, { status: 400 });
    }

    // Higgsfield télécharge lui-même les médias : on lui fournit des URLs signées temporaires.
    const [videoSigned, imageSigned] = await Promise.all([
      base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: viralVideo.video_file_uri, expires_in: 7200 }),
      base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: influencer.reference_image, expires_in: 7200 }),
    ]);

    const targetResolution = resolution || "1080p";
    const prompt = buildPrompt({ influencer, viralVideo, wardrobe, setting, instructions });

    const creation = await base44.entities.Creation.create({
      influencer_id,
      influencer_name: influencer.name,
      viral_video_id,
      viral_video_title: viralVideo.title,
      status: "pending",
      model: ENGINE_LABEL,
      resolution: targetResolution,
      prompt,
    });

    try {
      const request = await submitMotionTransfer({
        videoUrl: videoSigned.signed_url,
        imageUrls: [imageSigned.signed_url],
        prompt,
        resolution: targetResolution,
      });
      await base44.entities.Creation.update(creation.id, {
        status: "processing",
        higgsfield_job_id: request.request_id || "",
      });
      return Response.json({ creation_id: creation.id, status: "processing", request_id: request.request_id });
    } catch (e) {
      await base44.entities.Creation.update(creation.id, { status: "failed", error: e.message });
      return Response.json({ error: e.message, creation_id: creation.id }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
import { hasMotionFraming } from "./motionFraming.ts";

async function signedPhoto(base44, uri) {
  if (/^https:\/\//i.test(uri)) return uri;
  const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 });
  return signed_url;
}

// Une référence dédiée, conservée séparément du portrait et des planches de 9 vues.
// Les anciens personnages sont pris en charge sans devoir les recréer.
export async function prepareMotionReference(base44, influencer) {
  const source = influencer.reference_image || influencer.reference_images?.[0];
  if (!source) throw new Error("Cet influenceur n'a aucune photo de référence.");
  if (influencer.motion_reference_image && influencer.motion_reference_source === source) {
    return influencer.motion_reference_image;
  }

  const sourceUrl = await signedPhoto(base44, source);
  let uri = source;
  if (!(await hasMotionFraming(base44, sourceUrl))) {
    const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error("La photo du personnage est introuvable. Aucune vidéo n'a été lancée.");
    if (Number(response.headers.get("content-length")) > 20 * 1024 * 1024) throw new Error("La photo de référence dépasse 20 Mo.");
    const mime = response.headers.get("content-type")?.split(";")[0] || "image/png";
    if (!["image/png", "image/jpeg", "image/webp"].includes(mime)) throw new Error("La référence doit être une photo PNG, JPEG ou WebP.");

    const prompt = [
      "Create EXACTLY ONE full-length photograph of the SAME person as the reference. This is a motion-control reference, NOT a face portrait or contact sheet. If the input is a contact sheet, use its single character identity and output only one person in one continuous scene.",
      "CRITICAL COMPOSITION: camera far enough away to show the ENTIRE person from above the head to below both shoes, with empty margins on every side. The head occupies less than one fifth of image height. BOTH shoulders, the COMPLETE torso including abdomen, waist and hips, both arms, both hands, both legs and both feet must be clearly visible and entirely inside the frame. Never crop at the neck, chest, waist or knees. Do not zoom in on the face.",
      "Standing upright, facing the camera, arms relaxed and slightly separated from the sides so the body outline is easy to detect, hands visible, no obstructions, no other person, no reflections, no collage, no panels, no borders, no writing. Plain light gray studio background, even natural light, sharp throughout.",
      "Preserve the EXACT identity, age, facial features, hairstyle, skin tone, body proportions, signature details and eccentric or glamorous appearance visible in the selected reference. Do not beautify, smooth, normalize, caricature or redesign the face. Preserve skin pores and natural texture. Extend the clothing already visible coherently to the rest of the body, without adding accessories.",
      `Character context, subordinate to the reference identity and full-body framing: ${String(influencer.notes || "").slice(0, 3000)}`,
    ].join("\n\n");

    const generated = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt,
      existing_image_urls: [sourceUrl],
    });
    if (!generated?.url) throw new Error("L'IA n'a pas renvoyé de photo plein pied. Aucune vidéo n'a été lancée.");
    const rendered = await fetch(generated.url, { signal: AbortSignal.timeout(120000) });
    if (!rendered.ok) throw new Error("L'IA n'a pas renvoyé de photo plein pied. Aucune vidéo n'a été lancée.");
    const imageBytes = new Uint8Array(await rendered.arrayBuffer());
    const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
      file: new File([imageBytes], `motion-reference-${influencer.id}.png`, { type: "image/png" }),
    });
    uri = upload.file_uri;
    if (!uri || !(await hasMotionFraming(base44, await signedPhoto(base44, uri)))) {
      throw new Error("Le cadrage de la photo préparée n'est pas suffisamment lisible pour le transfert de mouvement. Aucune vidéo Higgsfield n'a été lancée. Réessayez avec une photo plein pied, bras visibles.");
    }
  }
  await base44.entities.Influencer.update(influencer.id, { motion_reference_image: uri, motion_reference_source: source });
  return uri;
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Retouche IA des photos de référence d'un personnage : la consigne décrite par
// l'utilisateur est appliquée à chacune de ses photos (visage + plan en pied),
// et chaque photo d'origine est remplacée dans le stockage privé de l'application.

const MAX_PHOTOS = 2;
const MAX_INSTRUCTION = 400;
const MAX_BYTES = 10 * 1024 * 1024;
const MEDIA_HOSTS = ["media.base44.com", "static.wixstatic.com"];
const IMAGE_TIMEOUT_MS = 60 * 1000;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function basename(value) {
  const parts = String(value || "").split("/");
  return parts[parts.length - 1] || "";
}

// La photo envoyée doit être la photo du personnage : même fichier que celui
// enregistré, servi par le service média de l'application.
function isOwnPhoto(url, uri) {
  let parsed = null;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" || !MEDIA_HOSTS.includes(parsed.hostname)) return false;
  return basename(parsed.pathname) === basename(uri);
}

async function storeEditedPhoto(base44, imageUrl, influencerId) {
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS) });
  if (!res.ok) throw new Error("Retouche impossible : image indisponible.");
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_BYTES) throw new Error("Image trop volumineuse.");
  const declared = String(res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const mime = declared === "image/png" ? "image/png" : declared === "image/webp" ? "image/webp" : "image/jpeg";
  const extension = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
    file: new File([bytes], `personnage-${influencerId}-ia.${extension}`, { type: mime }),
  });
  const uri = upload?.file_uri;
  if (!uri) throw new Error("Stockage indisponible.");
  return uri;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const influencerId = text(body?.influencer_id);
    const instruction = text(body?.instruction).slice(0, MAX_INSTRUCTION);
    const requested = Array.isArray(body?.photos) ? body.photos.slice(0, MAX_PHOTOS) : [];
    if (!influencerId || !instruction || !requested.length) {
      return Response.json({ error: "Demande incomplète." }, { status: 400 });
    }

    const influencer = await base44.entities.Influencer.get(influencerId);
    if (!influencer) return Response.json({ error: "Personnage introuvable." }, { status: 404 });

    const refs = Array.isArray(influencer.reference_images) ? influencer.reference_images : [];
    const isCharacterPhoto = (uri) => Boolean(uri)
      && (uri === influencer.reference_image || uri === influencer.face_reference_image || refs.includes(uri));

    // Une seule retouche par photo : une même photo ne part jamais deux fois.
    const sources = [];
    for (const item of requested) {
      const uri = text(item?.uri);
      if (!uri || sources.some((photo) => photo.uri === uri)) continue;
      sources.push({ uri, url: text(item?.url), role: item?.role === "face" ? "face" : "body" });
    }
    if (!sources.length) return Response.json({ error: "Photo invalide." }, { status: 400 });

    const description = String(influencer.notes || "").slice(0, 400);
    const replacements = {};

    // Chaque photo repart de sa propre image : le cadrage est conservé, seule la
    // modification demandée change.
    for (const photo of sources) {
      if (!isCharacterPhoto(photo.uri) || !isOwnPhoto(photo.url, photo.uri)) {
        return Response.json({ error: "Photo invalide." }, { status: 400 });
      }
      const prompt = [
        `Retouche d'une photo du personnage « ${influencer.name} ».`,
        description ? `Description du personnage : ${description}` : "",
        photo.role === "face" ? "Cette photo est son portrait de référence (visage)." : "Cette photo est sa photo de référence en pied.",
        "Conserve exactement son visage, son identité, sa morphologie, sa tenue et son style : seuls les éléments demandés changent.",
        `Modification demandée : ${instruction}`,
        "Rends une seule photo nette, bien exposée, bien cadrée, sans texte ni filigrane.",
      ].filter(Boolean).join(" ");

      const generated = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: [photo.url],
      });
      const imageUrl = text(generated?.url);
      if (!imageUrl) return Response.json({ error: "Retouche impossible : relancez." }, { status: 502 });
      replacements[photo.uri] = await storeEditedPhoto(base44, imageUrl, influencer.id);
    }

    const update = {};
    if (replacements[influencer.reference_image]) update.reference_image = replacements[influencer.reference_image];
    if (replacements[influencer.face_reference_image]) update.face_reference_image = replacements[influencer.face_reference_image];
    if (refs.length) {
      const next = refs.map((uri) => replacements[uri] || uri);
      if (next.some((uri, index) => uri !== refs[index])) update.reference_images = next;
    }
    if (!Object.keys(update).length) return Response.json({ error: "Photo invalide." }, { status: 400 });

    const updated = await base44.entities.Influencer.update(influencer.id, update);
    return Response.json({ influencer: updated, photos: Object.values(replacements) });
  } catch (error) {
    return Response.json({ error: error.message || "Retouche impossible." }, { status: 500 });
  }
}
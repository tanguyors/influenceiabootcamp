import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Retouche d'une photo de personnage par l'IA : la photo d'origine sert de référence
// (l'identité est conservée), la consigne décrit la modification demandée.
// Le résultat remplace la photo d'origine dans le stockage privé de l'application.

const MAX_INSTRUCTION = 400;
const MAX_BYTES = 10 * 1024 * 1024;
const MEDIA_HOSTS = ["media.base44.com", "static.wixstatic.com"];
const IMAGE_TIMEOUT_MS = 60 * 1000;

function basename(value) {
  const parts = String(value || "").split("/");
  return parts[parts.length - 1] || "";
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const influencerId = typeof body?.influencer_id === "string" ? body.influencer_id.trim() : "";
    const photoUri = typeof body?.photo_uri === "string" ? body.photo_uri.trim() : "";
    const photoUrl = typeof body?.photo_url === "string" ? body.photo_url.trim() : "";
    const instruction = typeof body?.instruction === "string" ? body.instruction.trim().slice(0, MAX_INSTRUCTION) : "";
    if (!influencerId || !photoUri || !photoUrl || !instruction) {
      return Response.json({ error: "Demande incomplète." }, { status: 400 });
    }

    // La photo retouchée doit être la photo du personnage : même fichier que celui
    // enregistré, servi par le service média de l'application.
    let parsed = null;
    try {
      parsed = new URL(photoUrl);
    } catch {
      parsed = null;
    }
    if (!parsed || parsed.protocol !== "https:" || !MEDIA_HOSTS.includes(parsed.hostname)) {
      return Response.json({ error: "Photo invalide." }, { status: 400 });
    }
    if (basename(parsed.pathname) !== basename(photoUri)) {
      return Response.json({ error: "Photo invalide." }, { status: 400 });
    }

    const influencer = await base44.entities.Influencer.get(influencerId);
    if (!influencer) return Response.json({ error: "Personnage introuvable." }, { status: 404 });

    const refs = Array.isArray(influencer.reference_images) ? influencer.reference_images : [];
    const field = influencer.reference_image === photoUri
      ? "reference_image"
      : influencer.face_reference_image === photoUri
        ? "face_reference_image"
        : refs.includes(photoUri)
          ? "reference_images"
          : "";
    if (!field) return Response.json({ error: "Cette photo n'appartient pas au personnage." }, { status: 400 });

    const description = String(influencer.notes || "").slice(0, 400);
    const prompt = [
      `Retouche d'une photo du personnage « ${influencer.name} ».`,
      description ? `Description du personnage : ${description}` : "",
      "Conserve exactement son visage, son identité, sa morphologie, sa tenue et son style : seuls les éléments demandés changent.",
      `Modification demandée : ${instruction}`,
      "Rends une seule photo nette, bien exposée, bien cadrée, sans texte ni filigrane.",
    ].filter(Boolean).join(" ");

    const generated = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt,
      existing_image_urls: [photoUrl],
    });
    const imageUrl = typeof generated?.url === "string" ? generated.url : "";
    if (!imageUrl) return Response.json({ error: "Retouche impossible : relancez." }, { status: 502 });

    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS) });
    if (!res.ok) return Response.json({ error: "Retouche impossible : image indisponible." }, { status: 502 });
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (!bytes.length || bytes.length > MAX_BYTES) {
      return Response.json({ error: "Image trop volumineuse." }, { status: 502 });
    }

    const declared = String(res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const mime = declared === "image/png" ? "image/png" : declared === "image/webp" ? "image/webp" : "image/jpeg";
    const extension = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
      file: new File([bytes], `personnage-${influencer.id}-ia.${extension}`, { type: mime }),
    });
    const uri = upload?.file_uri;
    if (!uri) return Response.json({ error: "Stockage indisponible." }, { status: 502 });

    const update = field === "reference_image"
      ? { reference_image: uri }
      : field === "face_reference_image"
        ? { face_reference_image: uri, reference_images: refs.map((value) => (value === photoUri ? uri : value)) }
        : { reference_images: refs.map((value) => (value === photoUri ? uri : value)) };

    const updated = await base44.entities.Influencer.update(influencer.id, update);
    return Response.json({ influencer: updated, photo_uri: uri });
  } catch (error) {
    return Response.json({ error: error.message || "Retouche impossible." }, { status: 500 });
  }
}
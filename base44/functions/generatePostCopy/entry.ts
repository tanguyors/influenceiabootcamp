import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Réseaux acceptés : borne l'entrée et évite qu'un texte libre parte dans le prompt.
const PLATFORMS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram Reels",
  youtube: "YouTube Shorts",
};

const COPY_SCHEMA = {
  type: "object",
  properties: {
    hook: { type: "string" },
    caption: { type: "string" },
    hashtags: { type: "string" },
  },
  required: ["hook", "caption", "hashtags"],
};

function clip(value: any, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export default async function (req: any) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const creationId = clip(body.creation_id, 64);
    const platform = PLATFORMS[clip(body.platform, 20)] || PLATFORMS.tiktok;
    if (!creationId) {
      return Response.json({ error: "Choisissez une vidéo de vos créations." }, { status: 400 });
    }

    const creation = await base44.entities.Creation.get(creationId).catch(() => null);
    if (!creation) return Response.json({ error: "Création introuvable." }, { status: 404 });
    if (creation.status !== "ready") {
      return Response.json({ error: "Cette vidéo n'est pas encore prête : attendez la fin de la génération." }, { status: 400 });
    }

    const influencer = creation.influencer_id
      ? await base44.entities.Influencer.get(creation.influencer_id).catch(() => null)
      : null;

    const prompt = [
      "Tu écris le texte de publication d'une vidéo courte pour un influenceur virtuel.",
      "",
      `Personnage : ${clip(influencer?.name || creation.influencer_name, 80) || "influenceur"}`,
      influencer?.notes ? `Description du personnage : ${clip(influencer.notes, 1200)}` : "",
      influencer?.story ? `Son histoire : ${clip(influencer.story, 600)}` : "",
      creation.prompt ? `Contenu de la vidéo : ${clip(creation.prompt, 1200)}` : "",
      creation.viral_video_title ? `Vidéo modèle reprise : ${clip(creation.viral_video_title, 120)}` : "",
      `Réseau visé : ${platform}`,
      "",
      "Rends uniquement ces trois textes, en français :",
      "- hook : l'accroche affichée en première ligne, 60 caractères maximum, sans hashtag, sans emoji, sans guillemets.",
      "- caption : 3 à 5 lignes courtes écrites dans la voix du personnage (respecte son ton et sa personnalité), 1 ou 2 emojis pertinents au maximum, en terminant par une question ou un appel à commenter.",
      "- hashtags : 12 hashtags sur une seule ligne, séparés par des espaces, en mélangeant quelques hashtags larges (#pourtoi #fyp) et des hashtags de niche liés au personnage et au sujet de cette vidéo précise.",
      "",
      "Contraintes : la légende doit coller à cette vidéo précise, jamais un texte générique réutilisable. N'invente aucune marque, aucun partenariat, aucun prix et aucune promesse. Pas de guillemets autour des textes, pas de titres ni de listes.",
    ].filter(Boolean).join("\n");

    const copy: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: COPY_SCHEMA,
    });

    const hook = clip(copy?.hook, 200);
    const caption = clip(copy?.caption, 2000);
    const hashtags = clip(copy?.hashtags, 600).replace(/\n+/g, " ");
    if (!hook && !caption) {
      return Response.json({ error: "L'IA n'a rien renvoyé : réessayez." }, { status: 502 });
    }
    return Response.json({ hook, caption, hashtags });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
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

    const videoUrl = clip(creation.result_video_url, 2000);
    if (!videoUrl) {
      return Response.json({ error: "Cette création n'a pas de fichier vidéo à analyser." }, { status: 400 });
    }

    // Le texte vient du contenu réel de la vidéo : aucune fiche de personnage n'est transmise.
    const prompt = [
      "Regarde la vidéo jointe (vidéo courte générée pour un influenceur virtuel) et écris son texte de publication, comme le ferait un créateur de contenu qui fait des vues.",
      "",
      "Point de départ : ce que montre réellement la vidéo (décor, action, tenue, lumière, ambiance). Ne le raconte jamais comme une description : transforme-le en texte de réseaux sociaux.",
      "",
      "Le ton doit être cool, spontané, actuel, avec de l'énergie : phrases très courtes, tutoiement, rythme, petites punchlines, une pointe d'humour ou de complicité. Le texte doit donner envie de regarder la vidéo et de commenter.",
      "",
      "À bannir : les phrases sages qui décrivent la scène (par exemple « une marche tranquille dans les rues bordées d'arbres »), les adjectifs de brochure, le vouvoiement, le ton corporate ou publicitaire sage.",
      "",
      "Rends uniquement ces trois textes, en français :",
      "- hook : 60 caractères maximum, une phrase qui donne envie de s'arrêter sur la vidéo (curiosité, surprise, punchline) — jamais une description de la scène, sans hashtag, sans emoji, sans guillemets.",
      "- caption : 2 à 4 lignes très courtes, ton décontracté et drôle, 3 à 5 emojis pertinents, se termine par une question courte ou un appel à commenter.",
      `- hashtags : 12 hashtags sur une seule ligne, séparés par des espaces, dans l'air du temps (quelques larges #pourtoi #fyp plus des hashtags de niche tirés de la vidéo : lieu, action, style, ambiance).`,
      "",
      `Le personnage s'appelle ${clip(creation.influencer_name, 80)} : tu peux citer ce nom une seule fois, dans les hashtags.`,
      `Réseau visé : ${platform}.`,
      "",
      "Contraintes : ne t'appuie sur aucune biographie, aucune description de personnage et aucun texte de brief. N'invente aucune marque, aucun partenariat, aucun prix et aucune promesse. Pas de guillemets autour des textes, pas de titres ni de listes.",
    ].filter(Boolean).join("\n");

    const copy: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [videoUrl],
      model: "gemini_3_8_flash",
      response_json_schema: COPY_SCHEMA,
    });

    const hook = clip(copy?.hook, 200);
    const caption = clip(copy?.caption, 2000);
    const hashtags = clip(copy?.hashtags, 600).replace(/\n+/g, " ");
    if (!hook && !caption) {
      return Response.json({ error: "L'analyse de la vidéo n'a rien renvoyé : réessayez." }, { status: 502 });
    }
    return Response.json({ hook, caption, hashtags });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
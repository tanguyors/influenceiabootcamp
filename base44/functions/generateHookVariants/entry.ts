import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Nombre d'accroches demandées : trois angles franchement différents.
const HOOK_COUNT = 3;

const HOOK_SCHEMA = {
  type: "object",
  properties: {
    hooks: {
      type: "array",
      items: { type: "string" },
      description: "Trois accroches différentes, dans l'ordre demandé",
    },
  },
  required: ["hooks"],
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

    // L'accroche vient du contenu réel de la vidéo : aucune fiche de personnage n'est transmise.
    const prompt = [
      "Regarde la vidéo jointe (courte vidéo de réseaux sociaux d'un influenceur virtuel) et écris ses accroches d'ouverture, celles qui font arrêter le scroll.",
      "",
      `Point de départ : ce que montre réellement la vidéo (décor, action, mouvement, tenue, lumière, ambiance). Ne la décris jamais : transforme-le en accroche de réseaux sociaux.`,
      "",
      "Une accroche = une phrase très courte (60 caractères maximum), en français, tutoiement, ton cool, spontané et actuel, avec de l'énergie.",
      "",
      "Chaque accroche doit s'appuyer sur un détail concret de CETTE vidéo (l'action, le mouvement, le moment de la journée, la lumière, l'énergie qui s'en dégage) : elle doit coller à cette vidéo et à aucune autre. Reste dans l'accroche, jamais dans la description.",
      "",
      "Les 3 accroches doivent prendre 3 angles franchement différents, dans cet ordre :",
      "1. la curiosité ou le suspense : on ne comprend pas tout de suite, on doit rester jusqu'à la fin ;",
      "2. la punchline relatable, en POV ou « quand tu… » : le spectateur se reconnaît et veut commenter ;",
      "3. le challenge ou la provocation légère : une prise de position qui donne envie de répondre.",
      "",
      "Contraintes : aucune description de la scène, aucun ton corporate ou publicitaire, aucun vouvoiement, aucun guillemet, aucun emoji, aucun hashtag, aucune marque, aucun prix, aucune promesse. Les 3 phrases ne doivent pas se ressembler.",
      "",
      "Rends uniquement les 3 phrases, dans cet ordre.",
    ].join("\n");

    const copy: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [videoUrl],
      model: "gemini_3_8_flash",
      response_json_schema: HOOK_SCHEMA,
    });

    const raw = Array.isArray(copy?.hooks) ? copy.hooks : [];
    const hooks: string[] = [];
    for (const item of raw) {
      const hook = clip(item, 90).replace(/^["'«\s]+|["'»\s]+$/g, "");
      if (hook && !hooks.includes(hook)) hooks.push(hook);
    }
    if (hooks.length < HOOK_COUNT) {
      return Response.json({ error: "L'analyse de la vidéo n'a rien renvoyé : réessayez." }, { status: 502 });
    }
    return Response.json({ hooks: hooks.slice(0, HOOK_COUNT) });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
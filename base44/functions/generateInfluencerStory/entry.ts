import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { aiJson, clean } from "../../shared/aiText.ts";

const SYSTEM = [
  "Tu écris la biographie d'un influenceur pour une agence française de création de contenu.",
  "Tu écris en français, au présent, à la troisième personne (ou au « je » uniquement dans la phrase d'accroche).",
  "Ton style est vivant, concret et complètement barré : situations absurdes, rebondissements improbables, détails délirants racontés très sérieusement, comme une anecdote qu'on n'attendait pas. Le récit doit donner envie de le lire à voix haute, jamais un CV lisse ni un résumé marketing.",
  "La niche du personnage reste le fil rouge : chaque folie découle de son sujet, de son métier ou de sa passion, jamais d'un délire hors sujet.",
  "Aucun emoji, aucun hashtag, aucune marque citée, et jamais l'idée qu'il s'agirait d'un personnage généré par IA.",
  "N'invente aucun détail physique (taille, corpulence, couleur des yeux, tatouage, coupe de cheveux) : l'apparence est fixée par les photos de référence.",
  "Déduis le genre uniquement du prénom et des notes fournis, sans jamais les contredire.",
].join(" ");

const SCHEMA = {
  type: "object",
  properties: {
    tagline: { type: "string" },
    story: { type: "string" },
  },
  required: ["tagline", "story"],
  additionalProperties: false,
};

// Le questionnaire fournit les choix ; ils orientent l'histoire sans jamais être recopiés tels quels.
function userPrompt(data: any) {
  const traits = (Array.isArray(data.personality) ? data.personality : [])
    .map((item: any) => clean(item, 60))
    .filter(Boolean)
    .slice(0, 8);

  return [
    `Personnage : ${data.name}.`,
    data.notes ? `Notes déjà saisies sur son style et son univers : ${data.notes}` : "",
    data.niche ? `Niche principale : ${data.niche}.` : "",
    data.platform ? `Plateforme de prédilection : ${data.platform}.` : "",
    data.audience ? `Public visé : ${data.audience}.` : "",
    data.tone ? `Ton de ses contenus : ${data.tone}.` : "",
    traits.length ? `Traits de personnalité à incarner : ${traits.join(", ")}.` : "",
    data.extra ? `Détails imposés par l'utilisateur, à intégrer fidèlement : ${data.extra}` : "",
    "",
    "Écris son histoire en trois paragraphes, 250 à 320 mots au total, en mode totalement wtf :",
    "1. Ses origines : un lieu précis, un milieu inattendu, et un événement fondateur absurde qui l'a mis sur la voie de sa niche.",
    "2. Son parcours : le déclic improbable qui l'a poussé à publier, puis une anecdote délirante mais racontée très sérieusement et directement liée à sa niche (un objet, un animal, un défi, une rivalité, un pari…), et la signature qui en découle.",
    "3. Aujourd'hui : sa communauté, ses rituels bizarres, et une ambition tellement exagérée qu'elle en devient drôle tout en restant liée à sa niche.",
    "Pousse l'absurde à fond, avec des détails concrets et un ton sérieux : pas d'humour de blague, pas de liste de qualités, pas de conclusion morale.",
    "Puis sa phrase d'accroche : une promesse courte de moins de douze mots, à la première personne, sans guillemets.",
    "N'utilise aucun titre, aucune puce, aucune mise en forme Markdown : uniquement le texte.",
  ].filter(Boolean).join("\n");
}

export default async function (req: any) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const data = {
      name: clean(body.name, 80),
      notes: clean(body.notes, 1500),
      niche: clean(body.niche, 80),
      platform: clean(body.platform, 60),
      audience: clean(body.audience, 60),
      tone: clean(body.tone, 60),
      personality: body.personality,
      extra: clean(body.extra, 800),
    };

    if (!data.name) return Response.json({ error: "Indiquez le nom du personnage." }, { status: 400 });
    if (!data.niche) return Response.json({ error: "Choisissez au moins sa niche principale." }, { status: 400 });

    const { data: parsed, error, status } = await aiJson(base44, {
      schema: SCHEMA,
      system: SYSTEM,
      user: userPrompt(data),
    });
    if (error) return Response.json({ error }, { status: status || 502 });

    const story = clean(parsed?.story, 6000);
    const tagline = clean(parsed?.tagline, 200);
    if (!story) return Response.json({ error: "L'IA n'a renvoyé aucune histoire : relancez." }, { status: 502 });

    return Response.json({ story, tagline });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
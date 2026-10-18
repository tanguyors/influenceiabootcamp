import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { aiJson, clean } from "../../shared/aiText.ts";

const SYSTEM = [
  "Tu écris la biographie de profil Instagram d'un influenceur pour une agence française de création de contenu.",
  "Tu produis les deux versions du même texte, à la première personne du singulier, comme le personnage qui remplit lui-même son profil : la version française dans `bio_fr`, et sa traduction anglaise fidèle dans `bio_en` (anglais naturel de réseaux sociaux, même ton, mêmes emojis, jamais du mot à mot).",
  "Format impératif pour chaque version : 3 lignes maximum séparées par des retours à la ligne, et 150 caractères au total au maximum (la limite Instagram).",
  "Structure : une accroche courte, une ligne qui dit ce qu'il fait et pour qui, une ligne de promesse ou d'appel à l'action.",
  "Style : punchy, cool, direct, typé réseaux sociaux, jamais corporate ni lisse.",
  "2 à 4 emojis pertinents et pas un de plus, aucun hashtag, aucun lien.",
  "N'invente aucun détail physique (taille, corpulence, couleur des yeux, tatouage, coupe de cheveux) : l'apparence est fixée par les photos de référence.",
  "Ne laisse jamais entendre qu'il s'agirait d'un personnage généré par IA.",
].join(" ");

const SCHEMA = {
  type: "object",
  properties: { bio_fr: { type: "string" }, bio_en: { type: "string" } },
  required: ["bio_fr", "bio_en"],
  additionalProperties: false,
};

// Une bio trop longue ne se colle pas sur Instagram : on coupe sur une ligne entière.
function fitBio(text: string, max = 150) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const br = cut.lastIndexOf("\n");
  return (br > 40 ? cut.slice(0, br) : cut).trim();
}

function userPrompt(inf: any) {
  const traits = (Array.isArray(inf.personality) ? inf.personality : [])
    .map((item: any) => clean(item, 60))
    .filter(Boolean)
    .slice(0, 8);

  return [
    `Personnage : ${inf.name}.`,
    inf.niche ? `Niche principale : ${inf.niche}.` : "",
    inf.platform ? `Plateforme de prédilection : ${inf.platform}.` : "",
    inf.audience ? `Public visé : ${inf.audience}.` : "",
    inf.tone ? `Ton de ses contenus : ${inf.tone}.` : "",
    traits.length ? `Traits de personnalité : ${traits.join(", ")}.` : "",
    inf.tagline ? `Sa phrase d'accroche : « ${inf.tagline} ».` : "",
    inf.story ? `Son histoire, à ne pas raconter mais à laisser transparaître : ${clean(inf.story, 1200)}` : "",
    inf.notes ? `Notes sur son style et son univers : ${clean(inf.notes, 600)}` : "",
  ].filter(Boolean).join(" ");
}

export default async function(req: any) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const influencerId = clean(body.influencer_id, 80);
    if (!influencerId) return Response.json({ error: "influencer_id requis" }, { status: 400 });

    const page = await base44.entities.Influencer.filter({ id: influencerId }, { limit: 1 });
    const influencer = (page.items || [])[0];
    if (!influencer) return Response.json({ error: "Influenceur introuvable" }, { status: 404 });
    if (!influencer.niche && !influencer.story && !influencer.notes) {
      return Response.json({ error: "Complétez d'abord sa niche ou son histoire." }, { status: 400 });
    }

    const { data: parsed, error, status } = await aiJson(base44, {
      schema: SCHEMA,
      system: SYSTEM,
      user: userPrompt(influencer),
    });
    if (error) return Response.json({ error }, { status: status || 502 });

    const bioFr = fitBio(clean(parsed?.bio_fr, 400));
    const bioEn = fitBio(clean(parsed?.bio_en, 400));
    if (!bioFr || !bioEn) return Response.json({ error: "L'IA n'a renvoyé aucune bio : relancez." }, { status: 502 });

    await base44.entities.Influencer.update(influencer.id, { instagram_bio: bioFr, instagram_bio_en: bioEn });
    return Response.json({ instagram_bio: bioFr, instagram_bio_en: bioEn });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
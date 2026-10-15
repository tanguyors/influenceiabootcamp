// Parcours du funnel de création : ordre des étapes, questions et visuels des choix.
import { groupLabel } from "@/lib/influencerTraits";
import { optionImage } from "@/lib/funnelAssets";

// Même ordre que le funnel de référence : du plus identitaire au plus accessoire.
const ORDER = [
  "gender", "ethnicity_origin_base", "age", "skin_tone", "body_type", "height", "proportions",
  "hair_colour", "hair", "eye_color", "eye_shape", "freak_head", "freak_neck", "freak_face",
  "facial_hair", "distinctive", "accessory", "aesthetic",
];

export function orderedGroups(groups) {
  const rank = (g) => {
    const i = ORDER.indexOf(g.id);
    return i < 0 ? ORDER.length : i;
  };
  return [...(groups || [])].sort((a, b) => rank(a) - rank(b));
}

// Étapes réellement proposées : les choix du funnel de référence, chacun avec le visuel du
// genre choisi. Un choix sans équivalent dans cette banque d'images n'est pas proposé.
export function funnelGroups(groups, gender) {
  return orderedGroups(groups)
    .map((g) => ({ ...g, options: (g.options || []).filter((o) => optionImage(g.id, o, gender)) }))
    .filter((g) => g.options.length);
}

const HINTS = {
  gender: "Qui est votre star ?",
  ethnicity_origin_base: "Quel look ?",
  age: "Quel âge ?",
  skin_tone: "Sa carnation",
  body_type: "Sa morphologie",
  height: "Sa taille",
  proportions: "Ses proportions",
  hair_colour: "Sa couleur de cheveux",
  hair: "Sa coupe de cheveux",
  eye_color: "La couleur de ses yeux",
  eye_shape: "La forme de ses yeux",
  freak_head: "La forme de sa tête",
  freak_neck: "Son cou",
  freak_face: "Ses traits",
  facial_hair: "Sa pilosité faciale",
  distinctive: "Ses signes particuliers",
  accessory: "Ses accessoires",
  aesthetic: "Son style",
};

export function stepHint(group) {
  return HINTS[group.id] || groupLabel(group);
}

// Visuel d'un choix : la photo du funnel de référence, pour le genre choisi.
export function optionVisual(groupId, option, gender) {
  return { image: optionImage(groupId, option, gender) };
}
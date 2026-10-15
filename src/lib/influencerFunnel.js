// Parcours du funnel de création : ordre des étapes, questions et visuels des choix.
import { groupLabel } from "@/lib/influencerTraits";

// Du plus identitaire au plus accessoire (comme les funnels de référence).
const ORDER = [
  "gender", "ethnicity_origin_base", "age", "skin_tone", "body_type", "height", "proportions",
  "hair", "hair_colour", "aesthetic", "eye_shape", "eye_color", "facial_hair", "distinctive", "accessory",
];

export function orderedGroups(groups) {
  const rank = (g) => {
    const i = ORDER.indexOf(g.id);
    return i < 0 ? ORDER.length : i;
  };
  return [...(groups || [])].sort((a, b) => rank(a) - rank(b));
}

const HINTS = {
  gender: "Qui est votre star ?",
  ethnicity_origin_base: "Quel look ?",
  age: "Quel âge ?",
  skin_tone: "Sa carnation",
  body_type: "Sa morphologie",
  height: "Sa taille",
  proportions: "Ses proportions",
  hair: "Sa coiffure",
  hair_colour: "Sa couleur de cheveux",
  aesthetic: "Son style",
  eye_shape: "La forme de ses yeux",
  eye_color: "La couleur de ses yeux",
  facial_hair: "Barbe ou pas ?",
  distinctive: "Ses signes particuliers",
  accessory: "Ses accessoires",
};

export function stepHint(group) {
  return HINTS[group.id] || groupLabel(group);
}

const FALLBACK = {
  gender: "🧑", ethnicity_origin_base: "🌍", age: "🎂", skin_tone: "🎨", body_type: "🧍", height: "📏",
  proportions: "🧍", hair: "💇", hair_colour: "🎨", aesthetic: "✨", eye_shape: "👁️", eye_color: "👁️",
  facial_hair: "🧔", distinctive: "✦", accessory: "🎒",
};

const ICONS = {
  gender: [[/female|femme/, "👩"], [/male|homme/, "👨"], [/non|fluid/, "🧑"]],
  ethnicity_origin_base: [
    [/east.?asian|asie de l/, "🧑🏻"], [/south.?asian|indo/, "🧑🏾"], [/african|afrique|noir/, "🧑🏿"],
    [/latin|hispan/, "🧑🏽"], [/middle|arab|moyen.?orient/, "🧑🏽"], [/western|occident|caucas/, "🧑🏼"],
  ],
  age: [[/teen|ado/, "🧒"], [/young|jeune/, "🧑"], [/adult|adulte/, "🧑‍🦱"], [/mature|mûr/, "🧑‍🦳"], [/senior|âgé|vieux/, "🧓"]],
  body_type: [
    [/slim|mince|thin|fin/, "🧍"], [/athletic|sport/, "🏃"], [/muscular|muscl/, "💪"],
    [/curvy|rond|round/, "🍐"], [/dad|papa/, "🧔"], [/lanky|élanc|haut/, "🦒"], [/plus|large/, "🧸"],
  ],
  height: [[/very.?tall|très grand/, "⬆️"], [/tall|grand/, "↗️"], [/average|moyen/, "↔️"], [/very.?short|très petit/, "⬇️"], [/short|petit/, "↘️"]],
  proportions: [[/shoulder|épaule/, "🏋️"], [/waist|taille/, "⏳"], [/limb|membre|long/, "🦵"], [/egg|œuf|ovo/, "🥚"], [/average|moyen/, "🧍"]],
  hair: [[/bald|chauve|rasé/, "👨‍🦲"], [/afro/, "🦱"], [/curly|boucl|ondul/, "🦱"], [/long/, "💇‍♀️"], [/short|court/, "💇‍♂️"], [/mohawk|crête|buzz/, "⚡"]],
  aesthetic: [
    [/lux|rich|chic/, "💎"], [/street|urban/, "🧢"], [/retro|vintage/, "📼"], [/sport|gym/, "🏋️"],
    [/minimal|sobre|clean/, "◽"], [/boho|nature/, "🕊️"], [/y2k|pop/, "💿"], [/edgy|rock|dark/, "🖤"],
  ],
  eye_shape: [[/almond|amande/, "👁️"], [/round|rond/, "⚪"], [/monolid|brid/, "➖"], [/hooded|paupière/, "🥺"], [/huge|grand/, "😳"], [/cat|félin/, "😼"]],
  facial_hair: [[/none|aucune|rasé|no/, "🧑"], [/beard|barbe/, "🧔"], [/stubble|trois/, "🧔‍♂️"], [/moustache|moust/, "👨"], [/goatee|bouc/, "🐐"]],
  distinctive: [[/ear|oreille/, "👂"], [/mole|grain/, "🔘"], [/freckle|tache/, "✨"], [/scar|cicatrice/, "⚡"], [/dimple|fossette/, "🙂"], [/teeth|dent/, "😁"]],
  accessory: [
    [/bag|sac/, "👜"], [/headphone|casque/, "🎧"], [/glass|lunette|sunglass/, "👓"], [/cap|casquette/, "🧢"],
    [/hat|chapeau|beanie|bonnet/, "👒"], [/watch|montre/, "⌚"], [/chain|chaîne|collier/, "📿"], [/jewel|boucle|bijou/, "💎"],
  ],
};

const SWATCHES = {
  skin_tone: [
    [/porcelain|porcelaine/, "#f4ded2"], [/ivory|ivoire/, "#eed3bc"], [/sand|sable/, "#ddb08a"],
    [/honey|miel/, "#c98e5f"], [/caramel/, "#a86b3d"], [/mocha|moka/, "#7d4a28"],
    [/espresso/, "#553020"], [/ebony|ébène|noir/, "#331f11"],
  ],
  hair_colour: [
    [/jet|black|noir/, "#141414"], [/dark.?brown|brun fonc/, "#3b2314"], [/chestnut|châtain/, "#6b4423"],
    [/auburn/, "#8b3a1e"], [/ginger|roux/, "#c05a1f"], [/strawberry|vénitien/, "#d98555"],
    [/platinum|platin/, "#e7dcc4"], [/blonde|blond/, "#e0b872"], [/silver|argent/, "#cfcfcf"],
    [/grey|gray|gris/, "#a9a9a9"], [/white|blanc/, "#f2f2f2"], [/pink|rose/, "#ea7bb0"],
    [/lilac|lavande|purple|violet/, "#c8a2e8"], [/blue|bleu/, "#3b82f6"], [/mint|turquoise/, "#7fdbc4"],
    [/teal/, "#2f9e9e"], [/red|rouge/, "#c62828"], [/burgundy|bordeaux/, "#6b1f2a"], [/green|vert/, "#3fae6a"],
  ],
  eye_color: [
    [/dark.?brown|brun fonc|noir/, "#3b2314"], [/brown|brun|marron/, "#5b3a1e"], [/amber|ambre/, "#b26a1f"],
    [/hazel|noisette/, "#8a7a3f"], [/green|vert/, "#3f7a4a"], [/ocean|deep.?blue/, "#2b6ca3"],
    [/ice|glac|light.?blue/, "#a8d4ea"], [/grey|gray|gris/, "#9aa0a6"], [/violet|purple/, "#7b5ea7"],
  ],
};

// Visuel d'un choix : pastille de couleur pour les teintes, emoji sinon.
export function optionVisual(groupId, option) {
  const key = `${option.id || ""} ${option.label || ""}`.toLowerCase();
  const swatch = (SWATCHES[groupId] || []).find(([re]) => re.test(key));
  if (swatch) return { swatch: swatch[1] };
  const icon = (ICONS[groupId] || []).find(([re]) => re.test(key));
  return { emoji: (icon && icon[1]) || FALLBACK[groupId] || "✦" };
}
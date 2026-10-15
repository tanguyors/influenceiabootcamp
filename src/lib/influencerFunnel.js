// Parcours du funnel de création : ordre des étapes, questions et visuels des choix.
import { groupLabel } from "@/lib/influencerTraits";
import { optionImage } from "@/lib/funnelAssets";

// Même ordre que le funnel de référence : du plus identitaire au plus accessoire.
const ORDER = [
  "gender", "ethnicity_origin_base", "age", "skin_tone", "body_type", "height", "proportions",
  "hair_colour", "hair", "eye_color", "eye_shape", "head", "face_features", "features",
  "facial_hair", "distinctive", "accessory", "aesthetic", "outfit", "niche",
];

// Certaines étapes n'ont de visuels que pour un genre donné : on ne les propose pas aux autres.
const FEMALE_HIDDEN_GROUPS = ["facial_hair"];
const MALE_ONLY = /(dad.?bod|man.?bun|beard|barbe|moustache|mustache|stubble|goatee|handlebar|mutton.?chops|dali|walrus|bushy|pencil)/i;
const FEMALE_ONLY = /(pigtail|couettes)/i;

export function isFemaleGender(gender) {
  return gender === "female" || gender === "trans_woman";
}

export function isMaleGender(gender) {
  return gender === "male" || gender === "trans_man";
}

function optionAllowed(option, gender) {
  const key = `${(option && option.id) || ""} ${(option && option.label) || ""}`;
  if (isFemaleGender(gender) && MALE_ONLY.test(key)) return false;
  if (isMaleGender(gender) && FEMALE_ONLY.test(key)) return false;
  return true;
}

export function orderedGroups(groups) {
  const rank = (g) => {
    const i = ORDER.indexOf(g.id);
    return i < 0 ? ORDER.length : i;
  };
  return [...(groups || [])].sort((a, b) => rank(a) - rank(b));
}

// Étapes réellement proposées : toutes les étapes renseignées par Higgsfield, celles dont les
// visuels ne correspondent pas au genre choisi étant écartées.
export function funnelGroups(groups, gender) {
  return orderedGroups(groups)
    .filter((g) => !(FEMALE_HIDDEN_GROUPS.includes(g.id) && isFemaleGender(gender)))
    .map((g) => ({ ...g, options: (g.options || []).filter((o) => optionAllowed(o, gender)) }))
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
  head: "La forme de son visage",
  face_features: "Ses traits",
  features: "Ses traits",
  facial_hair: "Sa pilosité faciale",
  distinctive: "Ses signes particuliers",
  accessory: "Ses accessoires",
  aesthetic: "Son style",
  vibe: "Son tempérament",
  outfit: "Sa tenue signature",
  niche: "Son univers de contenu",
};

export function stepHint(group) {
  return HINTS[group.id] || groupLabel(group);
}

const FALLBACK = {
  gender: "🧑", ethnicity_origin_base: "🌍", age: "🎂", skin_tone: "🎨", body_type: "🧍", height: "📏",
  proportions: "🧍", hair_colour: "🎨", hair: "💇", eye_color: "👁️", eye_shape: "👁️", head: "🙂",
  face_features: "✨", features: "✨", facial_hair: "🧔", distinctive: "✦", accessory: "🎒",
  aesthetic: "✨", vibe: "🎭", outfit: "👕", niche: "🎬",
};

const ICONS = {
  gender: [[/female|femme/, "👩"], [/male|homme/, "👨"], [/non|fluid/, "🧑"]],
  ethnicity_origin_base: [
    [/east.?asian|asie de l/, "🧑🏻"], [/south.?asian|indo|indien/, "🧑🏾"], [/african|afrique|noir/, "🧑🏿"],
    [/latin|hispan/, "🧑🏽"], [/middle|arab|moyen.?orient/, "🧑🏽"], [/western|occident|caucas|europ/, "🧑🏼"],
  ],
  age: [[/teen|ado/, "🧒"], [/young|jeune/, "🧑"], [/adult|adulte/, "🧑‍🦱"], [/mature|mûr/, "🧑‍🦳"], [/senior|âgé|vieux/, "🧓"]],
  body_type: [
    [/slim|mince|thin|fin/, "🧍"], [/athletic|sport/, "🏃"], [/muscular|muscl|ultra/, "💪"],
    [/curvy|rond|round/, "🍐"], [/dad|papa|heavy|lourd/, "🧔"], [/lanky|élanc|haut/, "🦒"], [/plus|large/, "🧸"],
  ],
  height: [[/very.?tall|très grand/, "⬆️"], [/tall|grand/, "↗️"], [/average|moyen/, "↔️"], [/very.?short|très petit/, "⬇️"], [/short|petit/, "↘️"]],
  proportions: [[/shoulder|épaule/, "🏋️"], [/waist|taille/, "⏳"], [/limb|membre|long/, "🦵"], [/egg|œuf|ovo/, "🥚"], [/average|moyen/, "🧍"]],
  hair: [
    [/wolf/, "🐺"], [/broccoli/, "🥦"], [/edgar/, "✂️"], [/butterfly/, "🦋"], [/jellyfish/, "🪼"],
    [/karen/, "💇‍♀️"], [/bleach|buzz|crête|mohawk/, "⚡"], [/pompadour|slick|french/, "💈"], [/cornrows|braids|tresses/, "🪢"],
    [/dreads|locs/, "🌿"], [/curls|boucl|ondul/, "🦱"], [/bun|chignon/, "🍡"], [/bald|chauve|rasé/, "👨‍🦲"],
    [/afro/, "🦱"], [/long/, "💇‍♀️"], [/short|court/, "💇‍♂️"], [/bowl/, "🥣"], [/mullet/, "🎸"],
  ],
  hair_colour: [[/black|noir/, "🖤"], [/brown|brun/, "🤎"], [/blonde|blond/, "💛"], [/ginger|roux|auburn/, "🧡"], [/grey|gray|gris|white|blanc|platinum|platin/, "🤍"], [/pink|rose|red|rouge/, "💗"]],
  head: [[/long face|visage long/, "📐"], [/neck|cou/, "🦒"], [/egg|œuf/, "🥚"], [/round|rond/, "⚪"], [/thick|épais/, "🧱"], [/normal|std/, "🙂"]],
  face_features: [[/freckle|tache/, "✨"], [/dimple|fossette/, "🙂"], [/bag|cernes/, "😴"], [/cheek|pommette/, "😊"], [/lips|lèvre/, "👄"], [/unibrow|sourcil/, "🤨"], [/mark|grain/, "🔘"], [/gap|dent/, "😁"], [/jug|oreille/, "👂"]],
  features: [[/freckle|tache/, "✨"], [/dimple|fossette/, "🙂"], [/lips|lèvre/, "👄"], [/mark|grain/, "🔘"]],
  eye_shape: [[/almond|amande/, "👁️"], [/round|rond/, "⚪"], [/monolid|brid/, "➖"], [/hooded|paupière/, "🥺"], [/huge|large|grand/, "😳"], [/cat|up|félin/, "😼"]],
  facial_hair: [[/none|aucune|rasé|clean|no/, "🧑"], [/beard|barbe/, "🧔"], [/stubble|trois/, "🧔‍♂️"], [/moustache|moust/, "👨"], [/goatee|bouc/, "🐐"]],
  distinctive: [[/ear|oreille|elf/, "👂"], [/mole|grain/, "🔘"], [/freckle|tache/, "✨"], [/scar|cicatrice/, "⚡"], [/dimple|fossette/, "🙂"], [/teeth|dent|grill/, "😁"], [/piercing/, "💎"], [/tattoo|tatou/, "🖋️"], [/eye|regard/, "👁️"], [/brow|sourcil/, "🤨"], [/gems|gem/, "💠"]],
  accessory: [
    [/bag|sac/, "👜"], [/headphone|casque/, "🎧"], [/glass|lunette|sunglass|monocle/, "👓"], [/cap|casquette/, "🧢"],
    [/hat|chapeau|beanie|bonnet|feather/, "👒"], [/watch|montre/, "⌚"], [/chain|chaîne|collier|jewel|pearl/, "📿"], [/bowtie|nœud/, "🎀"], [/none|aucun/, "🚫"],
  ],
  aesthetic: [
    [/lux|luxury|rich|chic/, "💎"], [/street|urban/, "🧢"], [/retro|vintage|disco/, "📼"], [/sport|gym|track/, "🏋️"],
    [/minimal|sobre|clean|knit/, "◽"], [/boho|nature/, "🕊️"], [/y2k|pop/, "💿"], [/edgy|rock|dark|goth/, "🖤"],
  ],
  vibe: [[/lux/, "💎"], [/funny|drole|drôle/, "😂"], [/inspir/, "🌟"], [/edgy|dark/, "🖤"], [/wholesome|douceur/, "🕊️"], [/savage|boss/, "🔥"], [/chill/, "😎"], [/romantic/, "🌹"], [/drama/, "🎭"]],
  outfit: [[/money|tweed/, "🧥"], [/knit|grandpa/, "🧶"], [/disco/, "🕺"], [/dandy/, "🎩"], [/riviera/, "🕶️"], [/robe/, "🥻"], [/suit|lilac|tailleur/, "👔"], [/safari/, "🧭"], [/fur|gold/, "🦊"], [/tunic|tunique/, "👘"], [/tracksuit|track|velour/, "👟"], [/djellaba/, "🧵"]],
  niche: [[/dance|danse/, "💃"], [/party|fête/, "🪩"], [/sing|chant/, "🎤"], [/romance/, "💘"], [/comedy|humour/, "😂"], [/fashion|mode/, "👗"], [/fitness|sport/, "🏋️"], [/finance|money|argent/, "💰"], [/food|cuisine/, "🍽️"]],
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

// Visuel d'un choix : photo du site pour le genre choisi, pastille de couleur, emoji sinon.
export function optionVisual(groupId, option, gender) {
  const image = optionImage(groupId, option, gender);
  if (image) return { image };

  const key = `${(option && option.id) || ""} ${(option && option.label) || ""}`.toLowerCase();
  const swatch = (SWATCHES[groupId] || []).find(([re]) => re.test(key));
  if (swatch) return { swatch: swatch[1] };
  const icon = (ICONS[groupId] || []).find(([re]) => re.test(key));
  return { emoji: (icon && icon[1]) || FALLBACK[groupId] || "✦" };
}
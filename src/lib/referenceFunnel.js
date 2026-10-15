// Funnel de création aligné sur le funnel de référence (cashfluencer.co/create) :
// 26 étapes, mêmes sections, mêmes intitulés, mêmes choix et mêmes visuels (en français).
// Chaque choix est relié à une option Higgsfield quand elle existe (champ `hf`).
import { GENDER_KEY } from "@/lib/funnelAssets";

// Cartes illustrées d'une étape (visuels du funnel de référence).
const cards = (screen, rows) =>
  rows.map(([id, label, hf, sub]) => ({ id, label, sub: sub || "", image: [screen, id], hf: hf || null }));

// Choix sans visuel : grandes options avec icône, ou vignettes d'icônes.
const rows = (items) =>
  items.map(([id, label, sub, icon, hf]) => ({ id, label, sub: sub || "", icon: icon || "", hf: hf || null }));

export const REFERENCE_STEPS = [
  {
    id: "q-goal",
    section: "Votre objectif",
    title: "Que voulez-vous ?",
    layout: "list",
    options: rows([
      ["cpm", "Être payé par les vues", "De l'argent quand on regarde", "play"],
      ["brands", "Partenariats", "Les marques vous paient", "handshake"],
      ["sell", "Vendre mes produits", "Ça vend à ma place", "shopping-bag"],
      ["viral", "Devenir viral", "Être célèbre", "rocket"],
    ]),
  },
  {
    id: "q-income",
    section: "Votre objectif de revenus",
    title: "Combien par mois ?",
    layout: "list",
    options: rows([
      ["500", "$500 / mois", "Argent plaisir", "banknote"],
      ["2k", "$2 000 / mois", "Payer les factures", "receipt"],
      ["10k", "$10 000 / mois", "Un vrai salaire", "briefcase"],
      ["quit", "Je quitte mon job", "Tout à fond", "flame"],
    ]),
  },
  {
    id: "q-time",
    section: "Votre temps",
    title: "Combien de temps par jour ?",
    hint: "Aucune caméra. Jamais.",
    layout: "list",
    options: rows([
      ["5", "5 minutes", "Tout est automatique", "zap"],
      ["30", "30 minutes", "Publier & répondre", "clock"],
      ["60", "1 heure et +", "Grandir vite", "timer"],
    ]),
  },
  {
    id: "s-1",
    section: "Identité",
    title: "Qui est-ce ?",
    layout: "cards",
    options: cards("s-gender", [
      ["male", "Homme", "gender:male"],
      ["female", "Femme", "gender:female"],
      ["nb", "Non binaire", "gender:non_binary"],
    ]),
  },
  {
    id: "s-2",
    section: "Origines",
    title: "Quel look ?",
    layout: "cards",
    options: cards("s-2", [
      ["western", "Occidental", "ethnicity_origin_base:european"],
      ["latina", "Latino/a", "ethnicity_origin_base:latin_american"],
      ["eastasian", "Est-asiatique", "ethnicity_origin_base:east_asian"],
      ["african", "Africain", "ethnicity_origin_base:african"],
      ["southasian", "Sud-asiatique", "ethnicity_origin_base:indian"],
      ["middleeast", "Moyen-Orient", "ethnicity_origin_base:middle_eastern"],
    ]),
  },
  {
    id: "q-age",
    section: "Âge",
    title: "Quel âge ?",
    layout: "cards",
    options: cards("q-age", [
      ["young", "Jeune · 20 ans", "age:adult"],
      ["adult", "Adulte · 30 ans", "age:adult"],
      ["mature", "Mature · 50 ans", "age:mature"],
      ["senior", "Senior · 70 ans", "age:senior"],
    ]),
  },
  {
    id: "s-3",
    section: "Apparence",
    title: "Peau",
    layout: "cards",
    options: cards("s-3", [
      ["porcelain", "Porcelaine", "skin_tone:st_porcelain"],
      ["ivory", "Ivoire", "skin_tone:st_fair"],
      ["sand", "Sable", "skin_tone:st_light"],
      ["honey", "Miel", "skin_tone:st_olive"],
      ["caramel", "Caramel", "skin_tone:st_tan"],
      ["mocha", "Moka", "skin_tone:st_brown"],
      ["espresso", "Espresso", "skin_tone:st_deep"],
      ["ebony", "Ébène", "skin_tone:st_ebony"],
    ]),
  },
  {
    id: "q-build",
    section: "Corps",
    title: "Corps",
    layout: "cards",
    options: cards("q-build", [
      ["slim", "Mince", "body_type:body_slim"],
      ["athletic", "Athlétique", "body_type:body_athletic"],
      ["muscular", "Musclé", "body_type:body_muscular"],
      ["curvy", "Pulpeuse", "body_type:body_curvy"],
      ["dad", "Bedaine", "body_type:body_heavy"],
      ["tall", "Grand & élancé", "body_type:body_slim"],
    ]),
  },
  {
    id: "q-height",
    section: "Corps",
    title: "Silhouette",
    layout: "cards",
    options: cards("q-height", [
      ["avg", "Moyenne", "height:h_average"],
      ["tall", "Grande", "height:h_tall"],
      ["longlimbs", "Membres longs", "proportions:pr_longlimbs"],
      ["shoulders", "Épaules larges", "proportions:pr_shoulders"],
      ["waist", "Taille fine", "proportions:pr_waist"],
      ["egg", "Corps œuf"],
    ]),
  },
  {
    id: "s-4",
    section: "Cheveux",
    title: "Couleur de cheveux",
    hint: "Même coiffure, nouvelle couleur",
    layout: "cards",
    options: cards("s-4", [
      ["black", "Noir de jais", "hair_colour:hc_black"],
      ["dark-brown", "Châtain foncé", "hair_colour:hc_darkbrown"],
      ["chestnut", "Châtain", "hair_colour:hc_chestnut"],
      ["auburn", "Auburn", "hair_colour:hc_red"],
      ["ginger", "Roux cuivré", "hair_colour:hc_ginger"],
      ["strawberry", "Fraise", "hair_colour:hc_ginger"],
      ["blonde", "Blond", "hair_colour:hc_blonde"],
      ["platinum", "Platine", "hair_colour:hc_platinum"],
      ["grey", "Gris", "hair_colour:hc_grey"],
      ["white", "Blanc", "hair_colour:hc_white"],
      ["pink", "Rose", "hair_colour:hc_pink"],
      ["bald", "Chauve", "hair:hair_bald"],
    ]),
  },
  {
    id: "s-4b",
    section: "Coiffure",
    title: "Coiffure",
    layout: "cards",
    options: cards("s-4b", [
      ["wolf", "Wolf cut", "hair:hair_long"],
      ["broccoli", "Permanente broccoli", "hair:hair_short"],
      ["mullet", "Mulet", "hair:hair_mullet"],
      ["butterfly", "Butterfly cut", "hair:hair_long"],
      ["edgar", "Edgar cut", "hair:hair_short"],
      ["afro", "Afro", "hair:hair_afro"],
      ["mohawk", "Crête", "hair:hair_punk"],
      ["bleach", "Buzz décoloré", "hair:hair_buzz"],
      ["bald", "Chauve", "hair:hair_bald"],
    ]),
  },
  {
    id: "s-5",
    section: "Yeux",
    title: "Couleur des yeux",
    layout: "cards",
    options: cards("s-5", [
      ["dark-brown", "Marron foncé", "eye_color:eye_brown"],
      ["amber", "Ambre", "eye_color:eye_amber"],
      ["hazel", "Noisette", "eye_color:eye_hazel"],
      ["green", "Vert", "eye_color:eye_green"],
      ["ocean", "Océan", "eye_color:eye_blue"],
      ["ice-blue", "Bleu glacé", "eye_color:eye_ice_blue"],
      ["grey", "Gris", "eye_color:eye_grey"],
      ["violet", "Violet"],
    ]),
  },
  {
    id: "q-eyes",
    section: "Yeux",
    title: "Forme des yeux",
    layout: "cards",
    options: cards("q-eyes", [
      ["almond", "Amandes", "eye_shape:es_almond"],
      ["round", "Ronds", "eye_shape:es_round"],
      ["monolid", "Monopli", "eye_shape:es_monolid"],
      ["hooded", "Paupières lourdes", "eye_shape:es_hooded"],
      ["huge", "Immenses", "eye_shape:es_large"],
      ["up", "Yeux de chat", "eye_shape:es_upturned"],
    ]),
  },
  {
    id: "q-head",
    section: "Visage",
    title: "Forme du visage",
    layout: "cards",
    options: cards("q-head", [
      ["std", "Normal", "freak_head:head_oval"],
      ["long", "Visage long", "freak_head:head_long"],
      ["neck", "Cou long"],
      ["thick", "Cou épais"],
      ["egg", "Tête d'œuf"],
      ["round", "Ronde", "freak_head:head_round"],
    ]),
  },
  {
    id: "q-feat",
    section: "Visage",
    title: "Détails du visage",
    hint: "Prenez-en plusieurs",
    layout: "cards",
    multi: true,
    options: cards("q-feat", [
      ["freckles", "Taches de rousseur", "freak_face:fn_freckles"],
      ["dimples", "Fossettes", "freak_face:fn_dimples"],
      ["bags", "Cernes", "freak_face:fn_eyebags"],
      ["cheek", "Pommettes hautes", "freak_face:fn_cheekbones"],
      ["lips", "Lèvres pulpeuses", "freak_face:fn_fulllips"],
      ["unibrow", "Monosourcil", "freak_face:fn_thickbrows"],
      ["mark", "Grain de beauté", "freak_face:fn_mole"],
      ["gap", "Dents du bonheur"],
      ["jug", "Grandes oreilles"],
    ]),
  },
  {
    id: "q-fh",
    section: "Visage",
    title: "Moustache & barbe",
    layout: "cards",
    options: cards("q-fh", [
      ["none", "Rasé de près", "facial_hair:fh_none"],
      ["stubble", "Barbe naissante", "facial_hair:fh_stubble"],
      ["stache", "Moustache", "facial_hair:fh_moustache"],
      ["goatee", "Bouc", "facial_hair:fh_goatee"],
      ["short", "Barbe courte", "facial_hair:fh_stubble"],
      ["full", "Barbe pleine", "facial_hair:fh_beard"],
      ["handle", "Moustache en guidon", "facial_hair:fh_moustache"],
      ["chops", "Favoris", "facial_hair:fh_beard"],
      ["dali", "Moustache Dalí", "facial_hair:fh_pencil"],
    ]),
  },
  {
    id: "q-df",
    section: "Détails",
    title: "Extras fun",
    hint: "Prenez ce que vous voulez. Bizarre = viral.",
    layout: "cards",
    multi: true,
    options: cards("q-df", [
      ["oddeyes", "Yeux vairons", "distinctive:df_hetero"],
      ["facetat", "Tatouage facial", "distinctive:df_facetattoo"],
      ["piercing", "Piercing", "distinctive:df_septum"],
      ["brow", "Entailles aux sourcils", "distinctive:df_slits"],
      ["grill", "Grill doré", "distinctive:df_grill"],
      ["freckles", "Tempête de taches"],
      ["gems", "Pierres sur le visage", "distinctive:df_gems"],
      ["elf", "Oreilles d'elfe", "distinctive:df_elf"],
      ["scar", "Cicatrice au sourcil", "distinctive:df_scar"],
    ]),
  },
  {
    id: "q-acc",
    section: "Détails",
    title: "Accessoire",
    layout: "cards",
    options: cards("q-acc", [
      ["none", "Aucun", "accessory:acc_none"],
      ["glasses", "Lunettes", "accessory:acc_glasses"],
      ["headphones", "Casque", "accessory:acc_headphones"],
      ["jewelry", "Bijoux dorés", "accessory:acc_jewelry"],
      ["hat", "Chapeau bob", "accessory:acc_hat"],
      ["monocle", "Monocle"],
      ["pearls", "Perles"],
      ["bowtie", "Nœud papillon"],
      ["feather", "Chapeau à plume"],
    ]),
  },
  {
    id: "s-6",
    section: "Personnalité",
    title: "Quel vibe ?",
    layout: "cards",
    options: cards("s-6", [
      ["luxury", "Luxe", "aesthetic:suits"],
      ["funny", "Drôle"],
      ["inspire", "Inspirant"],
      ["edgy", "Sombre & provoc", "aesthetic:goth"],
      ["wholesome", "Bienveillant"],
      ["savage", "Boss sauvage"],
      ["chill", "Zen", "aesthetic:casual"],
      ["romantic", "Romantique"],
      ["drama", "Drama", "aesthetic:theatrical"],
    ]),
  },
  {
    id: "s-7",
    section: "Style",
    title: "Tenue",
    layout: "cards",
    options: cards("s-7", [
      ["tweed", "Vieux argent", "aesthetic:suits"],
      ["djellaba", "Djellaba"],
      ["knit", "Pull de grand-père", "aesthetic:casual"],
      ["disco", "Disco 70s", "aesthetic:retro"],
      ["dandy", "Dandy", "aesthetic:suits"],
      ["riviera", "Chic Riviera"],
      ["robe", "Peignoir en soie"],
      ["lilac", "Costume lilas"],
      ["safari", "Safari"],
      ["fur", "Or & fourrure"],
      ["tunic", "Tunique rouge"],
      ["track", "Survêtement velours", "aesthetic:sporty"],
    ]),
  },
  {
    id: "s-8",
    section: "Contenu",
    title: "Quel sujet ?",
    layout: "cards",
    options: cards("s-8", [
      ["dance", "Danse"],
      ["party", "Fête"],
      ["sing", "Chant"],
      ["romance", "Romance"],
      ["comedy", "Comédie"],
      ["fashion", "Mode"],
      ["fitness", "Fitness"],
      ["finance", "Argent"],
      ["food", "Food"],
    ]),
  },
  {
    id: "s-9",
    section: "Plateforme",
    title: "Quelle appli ?",
    layout: "platform",
    options: rows([
      ["ig", "Instagram", "Reels", "instagram"],
      ["tt", "TikTok", "FYP viral", "tiktok"],
      ["yt", "YouTube", "Format long $$$", "youtube"],
      ["all", "Toutes", "Portée maximale", "globe"],
    ]),
  },
  {
    id: "q-brands",
    section: "Partenariats",
    title: "Quelles marques ?",
    hint: "Choisissez les types qui vous plaisent",
    layout: "tiles",
    multi: true,
    options: rows([
      ["fashion", "Mode", "", "shirt"],
      ["sneakers", "Sneakers", "", "footprints"],
      ["beauty", "Beauté", "", "sparkles"],
      ["tech", "Tech", "", "cpu"],
      ["apps", "Applications", "", "smartphone"],
      ["weight", "Perte de poids", "", "scale"],
      ["fitness", "Fitness", "", "dumbbell"],
      ["drinks", "Boissons", "", "cup-soda"],
      ["food", "Food", "", "utensils"],
    ]),
  },
  {
    id: "q-freq",
    section: "Publication",
    title: "À quelle fréquence ?",
    hint: "Plus vous publiez, plus vite ça grandit",
    layout: "list",
    options: rows([
      ["5d", "5× par jour", "Mode beast", "flame"],
      ["3d", "3× par jour", "Croissance rapide", "zap"],
      ["1d", "1× par jour", "Régulier", "calendar"],
      ["2w", "2× par semaine", "Tranquille", "calendar-days"],
    ]),
  },
  {
    id: "s-10",
    section: "Identité",
    title: "Donnez-lui un nom",
    hint: "Choisissez un nom qui nous plaît, ou le vôtre",
    layout: "name",
    options: [],
  },
  {
    id: "s-11",
    section: "Presque fini",
    title: "Prêt à lui donner vie ?",
    hint: "Votre star + 30 posts",
    layout: "recap",
    options: [],
  },
];

// Le funnel saute l'étape barbe pour un personnage féminin, comme le site de référence.
export function funnelSteps(choices) {
  const gender = (choices || {})["s-1"];
  return REFERENCE_STEPS.filter((step) => !(step.id === "q-fh" && gender === "female"));
}

export function stepGender(choices) {
  return (choices || {})["s-1"] || "female";
}

function picked(step, choices) {
  const value = (choices || {})[step.id];
  const ids = Array.isArray(value) ? value : value ? [value] : [];
  return ids.map((id) => (step.options || []).find((o) => o.id === id)).filter(Boolean);
}

// Groupes Higgsfield qui acceptent plusieurs options à la fois, et leur plafond.
const MULTI_GROUPS = new Set(["freak_face", "distinctive"]);
const GROUP_MAX = { proportions: 2, distinctive: 2, accessory: 3, freak_face: 2 };

// Étapes qui décrivent le personnage : elles seules alimentent le brief.
const CHARACTER_STEPS = new Set([
  "s-1", "s-2", "q-age", "s-3", "q-build", "q-height", "s-4", "s-4b", "s-5",
  "q-eyes", "q-head", "q-feat", "q-fh", "q-df", "q-acc", "s-6", "s-7", "s-8",
]);

// Réglages transmis à Higgsfield : les choix qui ont un équivalent, dans la limite
// du nombre de valeurs acceptées par groupe (une seule en général).
export function higgsfieldSelection(choices) {
  const selection = {};
  for (const step of REFERENCE_STEPS) {
    for (const option of picked(step, choices)) {
      if (!option.hf) continue;
      const [group, value] = option.hf.split(":");
      const max = MULTI_GROUPS.has(group) ? GROUP_MAX[group] || 4 : 1;
      const list = selection[group] || (selection[group] = []);
      if (list.includes(value)) continue;
      if (list.length < max) list.push(value);
      else if (max === 1) list[0] = value; // une étape plus tardive remplace le choix précédent
      // Au-delà du plafond, le choix part dans le brief (voir selectionExtras).
    }
  }
  return selection;
}

// Choix sans identifiant Higgsfield, ou écartés par le plafond du groupe : ils sont
// transmis en texte dans le brief au lieu d'être ignorés.
export function selectionExtras(choices) {
  const selection = higgsfieldSelection(choices);
  const extras = [];
  for (const step of REFERENCE_STEPS) {
    if (!CHARACTER_STEPS.has(step.id)) continue;
    for (const option of picked(step, choices)) {
      if (!option.hf) { extras.push(option.label); continue; }
      const [group, value] = option.hf.split(":");
      if (!(selection[group] || []).includes(value)) extras.push(option.label);
    }
  }
  return Array.from(new Set(extras));
}

// Brief envoyé à Higgsfield : l'univers saisi par l'utilisateur, puis tout ce qui
// n'est pas passé en identifiant de trait.
export function higgsfieldBrief(choices, brief) {
  const extras = selectionExtras(choices);
  return [
    String(brief || "").trim(),
    extras.length ? `Précisions à respecter : ${extras.join(", ")}.` : "",
  ].filter(Boolean).join("\n").slice(0, 4000);
}

// Étapes dont un trait peut apparaître ou non sur le personnage. Leurs options non
// choisies sont interdites au moteur, qui sinon les invente (grandes oreilles, piercing…).
const OPTIONAL_STEPS = new Set(["q-feat", "q-df", "q-acc", "q-fh"]);

function forbiddenTraits(choices) {
  const out = [];
  for (const step of REFERENCE_STEPS) {
    if (!OPTIONAL_STEPS.has(step.id)) continue;
    const value = (choices || {})[step.id];
    const chosen = new Set((Array.isArray(value) ? value : value ? [value] : []));
    for (const option of step.options) if (!chosen.has(option.id)) out.push(option.label);
  }
  return Array.from(new Set(out));
}

// Brief transmis au moteur de génération : TOUS les choix du parcours (aucun n'est écarté),
// les traits non choisis à ne pas inventer, le nom du personnage, les marques ajoutées à la
// main, puis l'univers saisi par l'utilisateur. Les choix passent en premier pour qu'une
// saisie libre très longue ne puisse jamais les écraser.
export function influencerBrief(choices, brief, brands = [], name = "") {
  const lines = REFERENCE_STEPS
    .map((step) => [step.title, picked(step, choices).map((o) => o.label).join(", ")])
    .filter(([, values]) => values)
    .map(([title, values]) => `${title} : ${values}`);
  if (name) lines.push(`Nom du personnage : ${name}`);
  if (brands.length) lines.push(`Marques souhaitées : ${brands.join(", ")}`);

  const forbidden = forbiddenTraits(choices);
  const universe = String(brief || "").trim();
  return [
    lines.length ? `Choix à respecter :\n- ${lines.join("\n- ")}` : "",
    forbidden.length ? `Traits absents du personnage, à ne pas ajouter : ${forbidden.join(", ")}.` : "",
    universe ? `Univers souhaité : ${universe}` : "",
  ].filter(Boolean).join("\n\n").slice(0, 6000);
}

// Traits retenus, affichés sur le récapitulatif.
export function referenceTraits(choices) {
  return REFERENCE_STEPS.map((step) => ({
    group: step.section,
    values: picked(step, choices).map((o) => o.label).join(", "),
  })).filter((t) => t.values);
}

// Notes de l'influenceur : réinjectées ensuite dans les prompts de génération vidéo.
export function referenceNotes(choices, name, brief) {
  const traits = referenceTraits(choices).map((t) => `${t.group} : ${t.values}`).join(" · ");
  return [String(brief || "").trim(), name ? `Nom : ${name}` : "", traits].filter(Boolean).join(" · ");
}

// Idées de prénoms et noms proposées par le funnel de référence.
export const NAME_IDEAS = {
  m: [["Harold", "Jean", "Benny", "Marcel", "Teddy", "Rico", "Bruno", "Gustave", "Omar", "Lorenzo"], ["Puddington", "Lebon", "Velvet", "Goldsworth", "Montclair", "Bellamy", "Moustachio", "Delacroix", "Fontaine", "Rossi"]],
  f: [["Monique", "Bianca", "Gloria", "Lola", "Coco", "Rosa", "Nadia", "Odette", "Ines", "Marisol"], ["Lavigne", "Duchamp", "Bellini", "Rivera", "Montclair", "Fontaine", "Delorme", "Sterling", "Valentine", "Moreau"]],
  nb: [["Nova", "Rex", "Kai", "Sacha", "Remy", "Juno", "Ziggy", "Robin", "Alex", "Sky"], ["Starling", "Velvet", "Moon", "Lebon", "Sterling", "Fontaine", "Bellamy", "Rivers", "Nightingale", "Gold"]],
};

export function nameIdeas(gender, count = 4) {
  // Le genre arrive sous forme d'identifiant de choix (male, female, nb…).
  const key = GENDER_KEY[gender] || gender;
  const pool = NAME_IDEAS[key] || NAME_IDEAS.nb;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const first = pool[0][Math.floor(Math.random() * pool[0].length)];
    const last = pool[1][Math.floor(Math.random() * pool[1].length)];
    const name = `${first} ${last}`;
    if (!out.includes(name)) out.push(name);
  }
  return out;
}
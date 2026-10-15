// Intitulés du funnel de création : Higgsfield les renvoie en anglais, on les affiche en français.
// La clé de recherche ignore la casse, les accents et la ponctuation ("Non-binary" -> "nonbinary").
const LABELS = {
  // Genre
  "Female": "Femme",
  "Male": "Homme",
  "Trans man": "Homme trans",
  "Trans woman": "Femme trans",
  "Non-binary": "Non-binaire",

  // Morphologie
  "Slim": "Mince",
  "Athletic": "Athlétique",
  "Muscular": "Musclé",
  "Curvy": "Pulpeuse",
  "Heavy": "Fort",
  "Ultra Muscular": "Ultra musclé",

  // Coiffure
  "Bald": "Chauve",
  "Buzz cut": "Coupe rasée",
  "Bowl cut": "Coupe au bol",
  "Bob": "Carré",
  "Mullet": "Mulet",
  "Braids": "Tresses",
  "Pigtails": "Couettes",
  "Afro": "Afro",
  "Mohawk": "Crête",
  "Long hair": "Cheveux longs",
  "Short hair": "Cheveux courts",
  "Volume waves": "Ondulations",
  "Beehive": "Chignon banane",
  "Perm": "Permanente",
  "Hair horns": "Cornes",
  "Soft-serve swirl": "Torsade",
  "Curl sphere": "Boule de boucles",
  "Mouse-ear puffs": "Couettes souris",
  "Hair wings": "Ailes",
  "Hedgehog spikes": "Pics de hérisson",
  "Side tufts": "Touffes sur les côtés",
  "Stair steps": "Marches",
  "Shelf bob": "Carré étagé",
  "Corkscrews": "Tire-bouchons",
  "Side coil": "Spirale latérale",
  "Mushroom": "Champignon",

  // Couleur de cheveux
  "Jet black": "Noir de jais",
  "Dark brown": "Châtain foncé",
  "Chestnut": "Châtain",
  "Ginger": "Roux cuivré",
  "Red": "Roux",
  "Blonde": "Blond",
  "Platinum": "Platine",
  "Grey": "Gris",
  "White": "Blanc",
  "Pastel pink": "Rose pastel",
  "Lilac": "Lilas",
  "Blue": "Bleu",
  "Green": "Vert",

  // Style
  "Retro": "Rétro",
  "Sporty": "Sport",
  "Y2K": "Y2K",
  "Theatre": "Théâtre",
  "Goth": "Gothique",
  "Suits": "Costume",
  "Streetstyle": "Streetwear",
  "Casual": "Décontracté",

  // Origine
  "African": "Africaine",
  "Asian": "Asiatique",
  "European": "Européenne",
  "Indian": "Indienne",
  "Middle Eastern": "Moyen-orientale",
  "Mixed": "Métissée",

  // Âge
  "Adult": "Adulte",
  "Mature": "Mûr",
  "Senior": "Senior",

  // Carnation
  "Porcelain": "Porcelaine",
  "Fair": "Très claire",
  "Light": "Claire",
  "Olive": "Olive",
  "Tan": "Halée",
  "Brown": "Brune",
  "Deep brown": "Brun foncé",
  "Ebony": "Ébène",

  // Taille et proportions
  "Average": "Moyenne",
  "Tall": "Grande",
  "Very tall": "Très grande",
  "Long limbs": "Membres longs",
  "Short legs": "Jambes courtes",
  "Broad shoulders": "Épaules larges",
  "Tiny waist": "Taille fine",
  "Egg body": "Silhouette œuf",

  // Forme de la tête et du cou
  "Standard": "Standard",
  "Long": "Long",
  "Round": "Ronde",
  "Square": "Carrée",
  "Heart": "Cœur",
  "Tiny": "Minuscule",
  "High forehead": "Front haut",
  "Short": "Court",
  "Column": "Colonne",

  // Forme des yeux
  "Almond": "Amandes",
  "Large": "Grands",
  "Hooded": "Paupières lourdes",
  "Upturned": "Relevés",
  "Downturned": "Abaissés",
  "Close-set": "Rapprochés",
  "Wide-set": "Écartés",
  "Uneven": "Asymétriques",
  "Huge": "Immenses",

  // Couleur des yeux
  "Black": "Noirs",
  "Hazel": "Noisette",
  "Ice blue": "Bleu glacé",
  "Amber": "Ambre",

  // Traits du visage
  "Freckles": "Taches de rousseur",
  "Dimples": "Fossettes",
  "Heavy eye bags": "Cernes marqués",
  "High cheekbones": "Pommettes hautes",
  "Full lips": "Lèvres pulpeuses",
  "Thick brows": "Sourcils épais",
  "Beauty mark": "Grain de beauté",
  "Tiny nose": "Petit nez",
  "Wide mouth": "Grande bouche",
  "Pointy chin": "Menton pointu",
  "Blush": "Teint rosé",
  "Potato nose": "Nez bulbeux",
  "Button nose": "Nez retroussé",
  "Pointy nose": "Nez pointu",
  "Pouty lips": "Lèvres boudeuses",
  "Tiny pursed mouth": "Petite bouche pincée",
  "Unibrow": "Monosourcil",
  "Thin high brows": "Sourcils fins et hauts",
  "Brush brows": "Sourcils broussailleux",
  "Jug ears": "Oreilles décollées",
  "Uneven ears": "Oreilles asymétriques",
  "Gap teeth": "Dents du bonheur",
  "Buck teeth": "Dents en avant",
  "Weak chin": "Menton fuyant",
  "Big forehead": "Grand front",

  // Pilosité faciale
  "Clean": "Rasé",
  "Stubble": "Barbe naissante",
  "Full beard": "Barbe pleine",
  "Goatee": "Bouc",
  "Moustache": "Moustache",
  "Pencil": "Fine moustache",
  "Push-broom": "Moustache brosse",
  "Braided": "Barbe tressée",

  // Signes particuliers
  "Odd eyes": "Yeux vairons",
  "Face tattoo": "Tatouage facial",
  "Piercing": "Piercing",
  "Ear piercing": "Piercing d'oreille",
  "Brow slits": "Entailles aux sourcils",
  "Bleached": "Sourcils décolorés",
  "No brows": "Sans sourcils",
  "Gold grill": "Grill doré",
  "Braces": "Appareil dentaire",
  "Brow scar": "Cicatrice au sourcil",
  "Face gems": "Pierres sur le visage",
  "Elf ears": "Oreilles d'elfe",
  "Big lashes": "Cils XXL",
  "Nose tape": "Bandeau nasal",

  // Accessoires
  "None": "Aucun",
  "Glasses": "Lunettes",
  "Headphones": "Casque",
  "Jewelry": "Bijoux",
  "Hat": "Chapeau",
  "Bag": "Sac",
};

// Un même mot anglais n'a pas le même sens selon l'étape (carnation « Brown », yeux « Brown »).
const BY_GROUP = {
  skin_tone: { "Brown": "Brune" },
  eye_color: { "Brown": "Marrons", "Green": "Verts", "Grey": "Gris", "Blue": "Bleus", "Black": "Noirs" },
  eye_shape: { "Round": "Ronds" },
  hair_colour: { "Green": "Vert" },
  freak_head: { "Long": "Allongée" },
  freak_neck: { "Long": "Long" },
};

function key(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const BY_KEY = Object.fromEntries(Object.entries(LABELS).map(([en, fr]) => [key(en), fr]));
const GROUP_KEYS = Object.fromEntries(
  Object.entries(BY_GROUP).map(([groupId, map]) => [
    groupId,
    Object.fromEntries(Object.entries(map).map(([en, fr]) => [key(en), fr])),
  ]),
);

// Intitulé français d'un choix ; à défaut, l'intitulé d'origine est conservé tel quel.
export function frChoiceLabel(label, groupId) {
  const text = String(label || "").trim();
  if (!text) return "";
  const group = GROUP_KEYS[groupId];
  if (group && group[key(text)]) return group[key(text)];
  return BY_KEY[key(text)] || text;
}
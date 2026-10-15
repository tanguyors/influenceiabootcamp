// Visuels des choix du funnel : photos du site de référence (cashfluencer.co/create/i/<hash>.webp).
// Le site fournit un jeu d'images par genre (f = femme, m = homme, nb = non-binaire) sur la
// plupart des étapes ; sinon on retombe sur le jeu de base, qui est le jeu féminin par défaut.
const A = (hash) => `https://cashfluencer.co/create/i/${hash}.webp`;

// Étape -> genre -> option -> hash.
const BY_GENDER = {
  "s-2": {
    m: { western: "44d092117fc6", latina: "5b79e0b0de5c", eastasian: "a045b2ad1828", african: "49b3a709c9dd", southasian: "bda853ca1e23", middleeast: "bf35f1f29965" },
  },
  "q-age": {
    m: { young: "2907e1a8cd7c", adult: "6794214ab8ac", mature: "bd9069ca0b53", senior: "d08144098d5c" },
    nb: { young: "de52c3cb87c8", adult: "f8e17e39aef5", mature: "3982612a61ae", senior: "9d90419a1f77" },
  },
  "q-build": {
    f: { slim: "9e528512da29", athletic: "c30d9ba188b4", muscular: "e3d7f4960c7d", curvy: "b4896531fbae", dad: "45457ff9cb51", tall: "76e3e9050137" },
    nb: { slim: "7dead818184e", athletic: "cc2ac5dce13e", muscular: "1816609c619e", curvy: "5430bf90bf19", dad: "dd5b9780a91c", tall: "92825aa06cd6" },
  },
  "q-height": {
    f: { avg: "2d1a4f27e9f9", tall: "85b5fa2a7c8d", longlimbs: "4d840af5c090", shoulders: "24e0dfb025f3", waist: "088d33be813a", egg: "dbabe266e579" },
    nb: { avg: "c47a37ade876", tall: "627425d54b95", longlimbs: "2e97c1f848d1", shoulders: "34d03c28d681", waist: "016d9c4e58e5", egg: "19ae851bd634" },
  },
  "s-4b": {
    f: { wolf: "c8809b743a7d", broccoli: "f8c769f333cd", mullet: "fbb1f5ba388d", butterfly: "c0993a353638", edgar: "7f607bb971c1", afro: "207d2e273048", mohawk: "f3695f2d349c", bleach: "68b775bd1a0b", bald: "d3787c55b303" },
    nb: { wolf: "bea5b26d1aaf", broccoli: "d1fb9427d3f3", mullet: "506e2e5ed287", butterfly: "e534e1a05b74", edgar: "2fdd6f4a0b98", afro: "cab8efe8fbbc", mohawk: "1458f3c7ee0e", bleach: "0fbc8a5e5824", bald: "a46419709186" },
  },
  "q-eyes": {
    f: { almond: "5536e3e97da5", round: "0a065f0a0b18", monolid: "2c201ef3585c", hooded: "e34470c3d7e7", huge: "7511dab12947", up: "6cdf024034e8" },
    nb: { almond: "8a0ce88b0c95", round: "02c77f2ccf5b", monolid: "2b8d1441f404", hooded: "b87dd90af463", huge: "12709a9f2a62", up: "10e0f655edad" },
  },
  "q-head": {
    f: { std: "f63949c065f1", long: "2da0eeb1365d", neck: "5bbd4a7c25f2", thick: "00dc88dada02", egg: "62abd2717402", round: "f1d9f7b07e34" },
    nb: { std: "4bac993415c2", long: "b4b45e90f26e", neck: "3c180eaaff10", thick: "9357a35d477b", egg: "31e1951632b6", round: "b5afa1888943" },
  },
  "q-feat": {
    f: { freckles: "450a508f4962", dimples: "4e08daf7a34e", bags: "c6eea9202a0b", cheek: "8ee0e4375113", lips: "1a979c042fbf", unibrow: "8592a5bbdceb", mark: "a83cc05ad8e1", gap: "5c7bcfdec3fb", jug: "a0a0bd9c9f82" },
    nb: { freckles: "8e5e011ee618", dimples: "a62b361763d5", bags: "53b92234c091", cheek: "fff75ceb2813", lips: "461d588b0a5e", unibrow: "f34d81eecda0", mark: "4c9c580469f4", gap: "ea6679772b04", jug: "cc437b2dada4" },
  },
  "q-df": {
    m: { oddeyes: "204d912893c1", facetat: "3bebaa6c8c9a", piercing: "4d7d022f3386", brow: "0793a602af03", grill: "7036d942d939", freckles: "f68f491895c2", gems: "52b2541a85e7", elf: "80483b16d01d", scar: "e9d7c4f5cf71" },
    nb: { oddeyes: "7922a3fc1d55", facetat: "c591c64d747a", piercing: "ebd70a4dc9c2", brow: "b3eb8a267d22", grill: "dd01b547cf80", freckles: "02f3433d2e1c", gems: "d4275e5e8b87", elf: "58ed15b2d5ea", scar: "8582b9a0a29f" },
  },
  "q-acc": {
    f: { none: "92a21cdf0520", glasses: "31ba1fde21fb", headphones: "a699fa38d0ec", jewelry: "d019b9efbb91", hat: "67e87dba6e26", monocle: "c6afa1b7fdc4", pearls: "145e7e983405", bowtie: "c7b908f8aeed", feather: "e81314358665" },
    nb: { none: "392269b302eb", glasses: "4f3dedb3f331", headphones: "972b6263e06f", jewelry: "1d346b392d14", hat: "12e18142d20a", monocle: "49e4847f52f9", pearls: "8b50b4ba3bc7", bowtie: "f15d8bd04017", feather: "de26faf86d10" },
  },
  "s-6": {
    f: { luxury: "7a14191bf2ed", funny: "5c093d760836", inspire: "21eec0073d1a", edgy: "66eeb246855e", wholesome: "7e15bec9e315", savage: "8efaeefe27e9", chill: "fd3e70f85158", romantic: "411442033cd1", drama: "55e35748cf10" },
    nb: { luxury: "efb2cd0d9654", funny: "b59083abc285", inspire: "d1475a4ece60", edgy: "8dc5a86e374c", wholesome: "941edacb98c0", savage: "035b96b1398c", chill: "695957a94dfd", romantic: "2a2de81b2494", drama: "cdcb5357d861" },
  },
  "q-fh": {
    m: { clean: "e4b5f58d6d10", handlebar: "9d30d63c507e", seventies: "b40581069e26", walrus: "6a508095aad3", twirl: "16a8e3fbe178", bushy: "b8a1e1356d8c", goatee: "bdec809eee11", stubble: "dc731f6d54d0", full: "c58721f5a005" },
    nb: { clean: "df54def37a7f", handlebar: "d5008f2ccc7c", seventies: "c1735d2603f7", walrus: "714db17489d2", twirl: "f0248d34c952", bushy: "0473735af9df", goatee: "4d9ab9c8a710", stubble: "c04c9469b607", full: "930f5fc6be31" },
  },
  "s-7": {
    m: { tweed: "494a0cea26f3", djellaba: "dcd12320c76b", knit: "687a8d533bec", disco: "0859482e9538", dandy: "09ea591b3356", riviera: "b4504e148825", robe: "8d555047abe1", lilac: "52e1db91e0d8", safari: "4fdf704ecc14", fur: "cc8717b08510", tunic: "1ab71e012999", track: "fb26bd1dd386" },
    f: { tweed: "70a64f017615", djellaba: "aaede5731875", knit: "4ef46b4518dd", disco: "3c02dd2d103a", dandy: "abc916ce77ec", riviera: "bdb20893ce2f", robe: "b3eaef61cd93", lilac: "1e8fd9e3eb3c", safari: "9cbd54d13cb6", fur: "64f4d3dd00c1", tunic: "6e41d5697672", track: "aee7eb957d84" },
    nb: { tweed: "40b77337ebc0", djellaba: "2b57853b590f", knit: "89ac7ab55d73", disco: "846a9a4eb37a", dandy: "a1ae56edeece", riviera: "11740f4a312a", robe: "3c1379c1f099", lilac: "d95d2e955bb4", safari: "f067fc334715", fur: "d5cb6e030c04", tunic: "18ef0a5b8609", track: "6661ec8eabd6" },
  },
};

// Jeu de base (celui du site pour une star féminine) : étape -> option -> hash.
const BASE = {
  "s-gender": { female: "31627b2c1ce5", male: "c15e17cfe6eb", nb: "6329de5b4d4b" },
  "s-2": { western: "2bb4ef197fbf", latina: "0331275e5aff", eastasian: "1dde242aa8a9", african: "a6f69b173c05", southasian: "7257412ece87", middleeast: "9a5fdf9c21dd" },
  "q-age": { young: "059976328c24", adult: "ba9989c8953d", mature: "863ee2a48b95", senior: "b7baabdd924c" },
  "s-3": { porcelain: "ea5f96108ca1", ivory: "18d4f66b2bb3", sand: "370699f86e27", honey: "e9efad0dcd11", caramel: "e16de3379763", mocha: "e11c770dfaa0", espresso: "6a672d78d701", ebony: "7b6202de2fe7" },
  "q-build": { slim: "a19dc8dd2737", athletic: "f6156fac7066", muscular: "801529af30d7", curvy: "e5295db586af", dad: "f71f044a2171", tall: "a68bb46136dc" },
  "q-height": { avg: "c04661829387", tall: "01ec4101162f", longlimbs: "3343d2ec5e0d", shoulders: "61442ab776fc", waist: "970df3d609fd", egg: "c054c348c70c" },
  "s-4": { black: "f922c5d2619c", chestnut: "48dbc5773fdc", auburn: "705993a1014a", ginger: "06a98a0dbe39", strawberry: "2b4eb2ef1ff9", blonde: "0bdbb536db04", platinum: "5abae7432a44", grey: "37171cfc51d7", white: "6e94bd2cc63f", pink: "38dc5ff64778", bald: "290a6f40bc4f" },
  "s-4b": { wolf: "7e5c2fca5d05", broccoli: "f99bb6edaa05", mullet: "31ff4003b89c", butterfly: "86abc86fa28c", edgar: "a55e523a12a3", afro: "04274b19b273", mohawk: "ce037f59f2df", bleach: "8ebdd0ffba38", bald: "f4af54b8d120" },
  "q-eyec": { amber: "95e968a03c19", hazel: "c588112738b5", green: "3e3c5121f9a1", ocean: "66e0f2e7cd23", grey: "0bc3f2b713ae", violet: "28d40116398c" },
  "q-eyes": { almond: "5a05db2357bd", round: "1a7f2be65eaa", monolid: "f398acdd1b04", hooded: "aa851efc01f0", huge: "05594a9c7196", up: "8e6d57572884" },
  "q-head": { std: "5acc2e5d37b6", long: "58405690ec4e", neck: "0604c8aac450", thick: "5f6c0ed2dcfe", egg: "821e8c5fdc68", round: "2856d8d687fd" },
  "q-fh": { none: "76cb738531e4", stubble: "e49bfe330522", stache: "3e7f9c85e7d0", goatee: "66f7a76f1d25", short: "341b2c28947d", full: "c91cbf2794e7", handle: "43b347e36e40", chops: "c4187fa58c92", dali: "bcd00a9fd227" },
  "q-acc": { none: "4d730f09576e", glasses: "469d25b06ad6", headphones: "03ff83ab926e", jewelry: "e2cf2a960654", hat: "74cd653b7c8d", monocle: "54593a6abc48", pearls: "4e2a06c904da", bowtie: "d22cc769fc4b", feather: "634e37da3b93" },
  "s-6": { luxury: "9e1f32c142f8", funny: "d17e8f29e648", inspire: "db1f5a2655d8", edgy: "693f9d9edb2c", wholesome: "64b2e21a977c", savage: "d565ae6d98f2", chill: "3a93abeb8976", romantic: "48f29b4c7615", drama: "fa6a91e416d3" },
  "s-7": { tweed: "494a0cea26f3", djellaba: "dcd12320c76b", knit: "687a8d533bec", disco: "0859482e9538", dandy: "09ea591b3356", riviera: "b4504e148825", robe: "8d555047abe1", lilac: "52e1db91e0d8", safari: "4fdf704ecc14", fur: "cc8717b08510", tunic: "1ab71e012999", track: "fb26bd1dd386" },
  "s-8": { dance: "3c442b88ff5c", party: "c3fdb5ee6bd4", sing: "b7a9f5e92b3e", romance: "0acbefd765db", comedy: "e8e6b6dc04cc", fashion: "d0084d4fb9c1", fitness: "fa64e2adaddb", finance: "7456f4f176e5", food: "074b7c759f69" },
};

// Nos étapes Higgsfield -> étapes du site de référence.
const GROUPS = {
  gender: { screen: "s-gender" },
  ethnicity_origin_base: { screen: "s-2" },
  age: { screen: "q-age" },
  skin_tone: { screen: "s-3" },
  body_type: { screen: "q-build" },
  height: { screen: "q-height" },
  proportions: { screen: "q-height" },
  hair_colour: { screen: "s-4" },
  hair: { screen: "s-4b" },
  eye_color: { screen: "q-eyec" },
  eye_shape: { screen: "q-eyes" },
  head: { screen: "q-head" },
  face_shape: { screen: "q-head" },
  face_features: { screen: "q-feat" },
  features: { screen: "q-feat" },
  distinctive: { screens: ["q-df", "q-feat"] },
  facial_hair: { screen: "q-fh" },
  accessory: { screen: "q-acc" },
  aesthetic: { screen: "s-6" },
  vibe: { screen: "s-6" },
  outfit: { screen: "s-7" },
  niche: { screen: "s-8" },
};

// Correspondances explicites là où les identifiants diffèrent d'une étape à l'autre.
const OVERRIDES = {
  "gender:non_binary": ["s-gender", "nb"],
  "gender:trans_woman": ["s-gender", "female"],
  "gender:trans_man": ["s-gender", "male"],
  "ethnicity_origin_base:european": ["s-2", "western"],
  "ethnicity_origin_base:indian": ["s-2", "southasian"],
  "ethnicity_origin_base:middle_eastern": ["s-2", "middleeast"],
  "ethnicity_origin_base:latin_american": ["s-2", "latina"],
  "ethnicity_origin_base:east_asian": ["s-2", "eastasian"],
  "skin_tone:st_fair": ["s-3", "ivory"],
  "skin_tone:st_light": ["s-3", "sand"],
  "skin_tone:st_olive": ["s-3", "honey"],
  "skin_tone:st_tan": ["s-3", "caramel"],
  "skin_tone:st_brown": ["s-3", "mocha"],
  "skin_tone:st_deep": ["s-3", "espresso"],
  "hair:hair_buzz": ["s-4b", "bleach"],
  "hair:hair_bowl": ["s-4b", "broccoli"],
  "hair:hair_punk": ["s-4b", "mohawk"],
  "hair:hair_long": ["s-4b", "butterfly"],
  "hair:hair_short": ["s-4b", "edgar"],
  "hair:hair_braids": ["s-4b", "cornrows"],
  "hair_colour:hc_darkbrown": ["s-4", "chestnut"],
  "hair_colour:hc_red": ["s-4", "auburn"],
  "body_type:body_heavy": ["q-build", "dad"],
  "body_type:body_ultra": ["q-build", "muscular"],
  "height:h_very_tall": ["q-height", "longlimbs"],
  "eye_color:eye_blue": ["q-eyec", "ocean"],
  "eye_color:eye_ice_blue": ["q-eyec", "grey"],
  "eye_shape:es_large": ["q-eyes", "huge"],
  "eye_shape:es_upturned": ["q-eyes", "up"],
  "facial_hair:fh_beard": ["q-fh", "full"],
  "facial_hair:fh_moustache": ["q-fh", "stache"],
  "facial_hair:fh_pencil": ["q-fh", "dali"],
  "aesthetic:retro": ["s-7", "disco"],
  "aesthetic:sporty": ["s-7", "track"],
  "aesthetic:suits": ["s-7", "lilac"],
  "aesthetic:casual": ["s-7", "knit"],
  "aesthetic:theatrical": ["s-6", "drama"],
  "aesthetic:goth": ["s-6", "edgy"],
};

// Les options de barbe n'ont pas les mêmes clés selon le genre : on aligne sur le jeu par genre.
const ALIAS = {
  "q-fh": { none: "clean", stache: "walrus", dali: "twirl", short: "seventies", chops: "bushy", handle: "handlebar" },
};

const PREFIX = /^(hair_|hc_|body_|eye_|es_|fh_|acc_|st_|pr_|h_)/;

// Libellés du site, pour retrouver un visuel par son intitulé quand l'identifiant diffère.
const SITE_LABELS = {
  "s-gender": { female: "Female", male: "Male", nb: "Non-binary" },
  "s-2": { western: "Western", latina: "Latina/o", eastasian: "East Asian", african: "African", southasian: "South Asian", middleeast: "Middle East" },
  "q-age": { young: "Young", adult: "Adult", mature: "Mature", senior: "Senior" },
  "s-3": { porcelain: "Porcelain", ivory: "Ivory", sand: "Sand", honey: "Honey", caramel: "Caramel", mocha: "Mocha", espresso: "Espresso", ebony: "Ebony" },
  "q-build": { slim: "Slim", athletic: "Athletic", muscular: "Muscular", curvy: "Curvy", dad: "Dad bod", tall: "Tall" },
  "q-height": { avg: "Average", tall: "Tall", longlimbs: "Long limbs", shoulders: "Big shoulders", waist: "Tiny waist", egg: "Egg body" },
  "s-4": { black: "Jet black", "dark-brown": "Dark brown", chestnut: "Chestnut", auburn: "Auburn", ginger: "Ginger", strawberry: "Strawberry", blonde: "Blonde", platinum: "Platinum", grey: "Grey", white: "White", pink: "Pink", bald: "Bald" },
  "s-4b": {
    wolf: "Wolf cut", broccoli: "Broccoli perm", edgar: "Edgar cut", curtains: "Curtains", butterfly: "Butterfly cut",
    jellyfish: "Jellyfish cut", karen: "Karen bob", bleach: "Bleached buzz", pompadour: "Pompadour", french: "French crop",
    cornrows: "Cornrows", dreads: "Locs", bowl: "Bowl cut", mullet: "Mullet", afro: "Afro", slick: "Slick back",
    mohawk: "Mohawk", bun: "Man bun", curls: "Curls", buzz: "Buzz cut", bald: "Bald",
  },
  "q-eyec": { amber: "Amber", hazel: "Hazel", green: "Green", ocean: "Blue", grey: "Grey", violet: "Violet" },
  "q-eyes": { almond: "Almond", round: "Round", monolid: "Monolid", hooded: "Hooded", huge: "Large", up: "Upturned" },
  "q-head": { std: "Normal", long: "Long face", neck: "Long neck", thick: "Big neck", egg: "Egg head", round: "Round face" },
  "q-feat": { freckles: "Freckles", dimples: "Dimples", bags: "Under-eye bags", cheek: "Cheekbones", lips: "Full lips", unibrow: "Unibrow", mark: "Birthmark", gap: "Tooth gap", jug: "Jug ears" },
  "q-df": { oddeyes: "Odd eyes", facetat: "Face tattoo", piercing: "Piercing", brow: "Split brow", grill: "Grillz", freckles: "Freckles", gems: "Face gems", elf: "Elf ears", scar: "Scar" },
  "q-fh": { none: "Clean-shaven", stubble: "Stubble", stache: "Moustache", goatee: "Goatee", short: "Short beard", full: "Full beard", handle: "Handlebar", chops: "Mutton chops", dali: "Dalí", clean: "Clean-shaven" },
  "q-acc": { none: "None", glasses: "Glasses", headphones: "Headphones", jewelry: "Gold jewelry", hat: "Bucket hat", monocle: "Monocle", pearls: "Pearls", bowtie: "Bow tie", feather: "Feather hat" },
  "s-6": { luxury: "Luxury", funny: "Funny", inspire: "Inspiring", edgy: "Dark & Edgy", wholesome: "Wholesome", savage: "Savage Boss", chill: "Chill", romantic: "Romantic", drama: "Drama" },
  "s-7": { tweed: "Old money", djellaba: "Djellaba", knit: "Grandpa knit", disco: "70s Disco", dandy: "Dandy", riviera: "Riviera chic", robe: "Silk robe", lilac: "Lilac suit", safari: "Safari", fur: "Gold & fur", tunic: "Red tunic", track: "Velvet tracksuit" },
  "s-8": { dance: "Dance", party: "Party", sing: "Singing", romance: "Romance", comedy: "Comedy", fashion: "Fashion", fitness: "Fitness", finance: "Money", food: "Food" },
};

// Genre Higgsfield -> clé de jeu du site.
const GENDER_KEY = { female: "f", trans_woman: "f", male: "m", trans_man: "m", non_binary: "nb" };

// Ordre de repli : une star féminine ne voit jamais de visuel masculin, et inversement.
const GENDER_FALLBACK = {
  f: ["f", "base", "nb"],
  m: ["m", "nb", "base"],
  nb: ["nb", "base", "f"],
  base: ["f", "base", "nb"],
};

function labelKey(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

// Clé du site pour une option : identifiant, alias, puis intitulé.
function siteKey(screen, rawKey, label) {
  if ((BASE[screen] || {})[rawKey]) return rawKey;
  if ((ALIAS[screen] || {})[rawKey]) return ALIAS[screen][rawKey];
  const wanted = labelKey(label);
  if (!wanted) return "";
  const labels = SITE_LABELS[screen] || {};
  for (const key of Object.keys(labels)) {
    if (labelKey(labels[key]) === wanted) return (ALIAS[screen] || {})[key] || key;
  }
  return "";
}

function hashFor(screen, key, gender) {
  if (!key) return "";
  const order = GENDER_FALLBACK[GENDER_KEY[gender] || "base"];
  for (const g of order) {
    if (g === "base") {
      if ((BASE[screen] || {})[key]) return BASE[screen][key];
      continue;
    }
    const hash = ((BY_GENDER[screen] || {})[g] || {})[key];
    if (hash) return hash;
  }
  // Clé absente de ce jeu : on retente avec l'alias de l'autre jeu.
  const alias = (ALIAS[screen] || {})[key];
  return alias ? hashFor(screen, alias, gender) : "";
}

// Photo d'un choix pour le genre choisi, ou chaîne vide si le site n'a pas d'équivalent.
export function optionImage(groupId, option, gender) {
  const group = GROUPS[groupId];
  if (!group) return "";
  const id = (option && option.id) || "";
  const label = (option && option.label) || "";

  const override = OVERRIDES[`${groupId}:${id}`];
  if (override) {
    const hash = hashFor(override[0], override[1], gender);
    return hash ? A(hash) : "";
  }

  const bare = id.replace(PREFIX, "");
  for (const screen of group.screens || [group.screen]) {
    const hash = hashFor(screen, siteKey(screen, bare, label), gender);
    if (hash) return A(hash);
  }
  return "";
}
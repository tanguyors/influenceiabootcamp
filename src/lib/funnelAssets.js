// Visuels du funnel de référence (cashfluencer.co/create/i/<hash>.webp), par écran,
// par jeu de visuels (féminin, masculin, non binaire, base) et par choix.
const A = (hash) => `https://cashfluencer.co/create/i/${hash}.webp`;

const SETS = {
  "s-gender": { base: { female: "31627b2c1ce5", male: "c15e17cfe6eb", nb: "6329de5b4d4b" } },

  "s-2": {
    f: { western: "dc8ac3a37089", latina: "08edc20a61b8", eastasian: "65fafeb88bb6", african: "76413910cf69", southasian: "5898f394f088", middleeast: "7272ffcc26ba" },
    m: { western: "44d092117fc6", latina: "5b79e0b0de5c", eastasian: "a045b2ad1828", african: "49b3a709c9dd", southasian: "bda853ca1e23", middleeast: "bf35f1f29965" },
    nb: { western: "2bb4ef197fbf", latina: "0331275e5aff", eastasian: "1dde242aa8a9", african: "a6f69b173c05", southasian: "7257412ece87", middleeast: "9a5fdf9c21dd" },
  },

  "q-age": {
    base: { young: "059976328c24", adult: "ba9989c8953d", mature: "863ee2a48b95", senior: "b7baabdd924c" },
    m: { young: "2907e1a8cd7c", adult: "6794214ab8ac", mature: "bd9069ca0b53", senior: "d08144098d5c" },
    nb: { young: "de52c3cb87c8", adult: "f8e17e39aef5", mature: "3982612a61ae", senior: "9d90419a1f77" },
  },

  "s-3": {
    base: { porcelain: "ea5f96108ca1", ivory: "18d4f66b2bb3", sand: "370699f86e27", honey: "e9efad0dcd11", caramel: "e16de3379763", mocha: "e11c770dfaa0", espresso: "6a672d78d701", ebony: "7b6202de2fe7" },
  },

  "q-build": {
    base: { slim: "a19dc8dd2737", athletic: "f6156fac7066", muscular: "801529af30d7", curvy: "e5295db586af", dad: "f71f044a2171", tall: "a68bb46136dc" },
    f: { slim: "9e528512da29", athletic: "c30d9ba188b4", muscular: "e3d7f4960c7d", curvy: "b4896531fbae", dad: "45457ff9cb51", tall: "76e3e9050137" },
    nb: { slim: "7dead818184e", athletic: "cc2ac5dce13e", muscular: "1816609c619e", curvy: "5430bf90bf19", dad: "dd5b9780a91c", tall: "92825aa06cd6" },
  },

  "q-height": {
    base: { avg: "c04661829387", tall: "01ec4101162f", longlimbs: "3343d2ec5e0d", shoulders: "61442ab776fc", waist: "970df3d609fd", egg: "c054c348c70c" },
    f: { avg: "2d1a4f27e9f9", tall: "85b5fa2a7c8d", longlimbs: "4d840af5c090", shoulders: "24e0dfb025f3", waist: "088d33be813a", egg: "dbabe266e579" },
    nb: { avg: "c47a37ade876", tall: "627425d54b95", longlimbs: "2e97c1f848d1", shoulders: "34d03c28d681", waist: "016d9c4e58e5", egg: "19ae851bd634" },
  },

  "s-4": {
    base: { black: "f922c5d2619c", "dark-brown": "0b75afe0488d", chestnut: "48dbc5773fdc", auburn: "705993a1014a", ginger: "06a98a0dbe39", strawberry: "2b4eb2ef1ff9", blonde: "0bdbb536db04", platinum: "5abae7432a44", grey: "37171cfc51d7", white: "6e94bd2cc63f", pink: "38dc5ff64778", bald: "290a6f40bc4f" },
  },

  "s-4b": {
    base: { wolf: "7e5c2fca5d05", broccoli: "f99bb6edaa05", mullet: "31ff4003b89c", butterfly: "86abc86fa28c", edgar: "a55e523a12a3", afro: "04274b19b273", mohawk: "ce037f59f2df", bleach: "8ebdd0ffba38", bald: "f4af54b8d120" },
    f: { wolf: "c8809b743a7d", broccoli: "f8c769f333cd", mullet: "fbb1f5ba388d", butterfly: "c0993a353638", edgar: "7f607bb971c1", afro: "207d2e273048", mohawk: "f3695f2d349c", bleach: "68b775bd1a0b", bald: "d3787c55b303" },
    nb: { wolf: "bea5b26d1aaf", broccoli: "d1fb9427d3f3", mullet: "506e2e5ed287", butterfly: "e534e1a05b74", edgar: "2fdd6f4a0b98", afro: "cab8efe8fbbc", mohawk: "1458f3c7ee0e", bleach: "0fbc8a5e5824", bald: "a46419709186" },
  },

  "s-5": {
    base: { "dark-brown": "4e9faa69a984", amber: "95e968a03c19", hazel: "c588112738b5", green: "3e3c5121f9a1", ocean: "66e0f2e7cd23", "ice-blue": "bd78fe6142e8", grey: "0bc3f2b713ae", violet: "28d40116398c" },
  },

  "q-eyes": {
    base: { almond: "5a05db2357bd", round: "1a7f2be65eaa", monolid: "f398acdd1b04", hooded: "aa851efc01f0", huge: "05594a9c7196", up: "8e6d57572884" },
    f: { almond: "5536e3e97da5", round: "0a065f0a0b18", monolid: "2c201ef3585c", hooded: "e34470c3d7e7", huge: "7511dab12947", up: "6cdf024034e8" },
    nb: { almond: "8a0ce88b0c95", round: "02c77f2ccf5b", monolid: "2b8d1441f404", hooded: "b87dd90af463", huge: "12709a9f2a62", up: "10e0f655edad" },
  },

  "q-head": {
    base: { std: "5acc2e5d37b6", long: "58405690ec4e", neck: "0604c8aac450", thick: "5f6c0ed2dcfe", egg: "821e8c5fdc68", round: "2856d8d687fd" },
    f: { std: "f63949c065f1", long: "2da0eeb1365d", neck: "5bbd4a7c25f2", thick: "00dc88dada02", egg: "62abd2717402", round: "f1d9f7b07e34" },
    nb: { std: "4bac993415c2", long: "b4b45e90f26e", neck: "3c180eaaff10", thick: "9357a35d477b", egg: "31e1951632b6", round: "b5afa1888943" },
  },

  "q-feat": {
    base: { freckles: "812c5271bea7", dimples: "5ea8ce83e5f9", bags: "87e7a4f73fe1", cheek: "df413736566a", lips: "7331c3e3fa9d", unibrow: "59eac0a025c6", mark: "3762dfbce4ca", gap: "baab5f75c06b", jug: "b7bf3b170b5e" },
    f: { freckles: "450a508f4962", dimples: "4e08daf7a34e", bags: "c6eea9202a0b", cheek: "8ee0e4375113", lips: "1a979c042fbf", unibrow: "8592a5bbdceb", mark: "a83cc05ad8e1", gap: "5c7bcfdec3fb", jug: "a0a0bd9c9f82" },
    nb: { freckles: "8e5e011ee618", dimples: "a62b361763d5", bags: "53b92234c091", cheek: "fff75ceb2813", lips: "461d588b0a5e", unibrow: "f34d81eecda0", mark: "4c9c580469f4", gap: "ea6679772b04", jug: "cc437b2dada4" },
  },

  "q-fh": {
    base: { none: "76cb738531e4", stubble: "e49bfe330522", stache: "3e7f9c85e7d0", goatee: "66f7a76f1d25", short: "341b2c28947d", full: "c91cbf2794e7", handle: "43b347e36e40", chops: "c4187fa58c92", dali: "bcd00a9fd227" },
    m: { none: "e4b5f58d6d10", stubble: "dc731f6d54d0", stache: "6a508095aad3", goatee: "bdec809eee11", short: "b40581069e26", full: "c58721f5a005", handle: "9d30d63c507e", chops: "b8a1e1356d8c", dali: "16a8e3fbe178" },
    nb: { none: "df54def37a7f", stubble: "c04c9469b607", stache: "714db17489d2", goatee: "4d9ab9c8a710", short: "c1735d2603f7", full: "930f5fc6be31", handle: "d5008f2ccc7c", chops: "0473735af9df", dali: "f0248d34c952" },
  },

  "q-df": {
    base: { oddeyes: "d1690c337c95", facetat: "b4bcdd378ff5", piercing: "c0043b9ab9c9", brow: "008fc48b46e3", grill: "57ed0c9ba984", freckles: "d14780ebd292", gems: "c22f82e7a76e", elf: "0799f047ed95", scar: "761adba0f43b" },
    m: { oddeyes: "204d912893c1", facetat: "3bebaa6c8c9a", piercing: "4d7d022f3386", brow: "0793a602af03", grill: "7036d942d939", freckles: "f68f491895c2", gems: "52b2541a85e7", elf: "80483b16d01d", scar: "e9d7c4f5cf71" },
    nb: { oddeyes: "7922a3fc1d55", facetat: "c591c64d747a", piercing: "ebd70a4dc9c2", brow: "b3eb8a267d22", grill: "dd01b547cf80", freckles: "02f3433d2e1c", gems: "d4275e5e8b87", elf: "58ed15b2d5ea", scar: "8582b9a0a29f" },
  },

  "q-acc": {
    base: { none: "4d730f09576e", glasses: "469d25b06ad6", headphones: "03ff83ab926e", jewelry: "e2cf2a960654", hat: "74cd653b7c8d", monocle: "54593a6abc48", pearls: "4e2a06c904da", bowtie: "d22cc769fc4b", feather: "634e37da3b93" },
    f: { none: "92a21cdf0520", glasses: "31ba1fde21fb", headphones: "a699fa38d0ec", jewelry: "d019b9efbb91", hat: "67e87dba6e26", monocle: "c6afa1b7fdc4", pearls: "145e7e983405", bowtie: "c7b908f8aeed", feather: "e81314358665" },
    nb: { none: "392269b302eb", glasses: "4f3dedb3f331", headphones: "972b6263e06f", jewelry: "1d346b392d14", hat: "12e18142d20a", monocle: "49e4847f52f9", pearls: "8b50b4ba3bc7", bowtie: "f15d8bd04017", feather: "de26faf86d10" },
  },

  "s-6": {
    base: { luxury: "9e1f32c142f8", funny: "d17e8f29e648", inspire: "db1f5a2655d8", edgy: "693f9d9edb2c", wholesome: "64b2e21a977c", savage: "d565ae6d98f2", chill: "3a93abeb8976", romantic: "48f29b4c7615", drama: "fa6a91e416d3" },
    f: { luxury: "7a14191bf2ed", funny: "5c093d760836", inspire: "21eec0073d1a", edgy: "66eeb246855e", wholesome: "7e15bec9e315", savage: "8efaeefe27e9", chill: "fd3e70f85158", romantic: "411442033cd1", drama: "55e35748cf10" },
    nb: { luxury: "efb2cd0d9654", funny: "b59083abc285", inspire: "d1475a4ece60", edgy: "8dc5a86e374c", wholesome: "941edacb98c0", savage: "035b96b1398c", chill: "695957a94dfd", romantic: "2a2de81b2494", drama: "cdcb5357d861" },
  },

  "s-7": {
    base: { tweed: "494a0cea26f3", djellaba: "dcd12320c76b", knit: "687a8d533bec", disco: "0859482e9538", dandy: "09ea591b3356", riviera: "b4504e148825", robe: "8d555047abe1", lilac: "52e1db91e0d8", safari: "4fdf704ecc14", fur: "cc8717b08510", tunic: "1ab71e012999", track: "fb26bd1dd386" },
    f: { tweed: "70a64f017615", djellaba: "aaede5731875", knit: "4ef46b4518dd", disco: "3c02dd2d103a", dandy: "abc916ce77ec", riviera: "bdb20893ce2f", robe: "b3eaef61cd93", lilac: "1e8fd9e3eb3c", safari: "9cbd54d13cb6", fur: "64f4d3dd00c1", tunic: "6e41d5697672", track: "aee7eb957d84" },
    nb: { tweed: "40b77337ebc0", djellaba: "2b57853b590f", knit: "89ac7ab55d73", disco: "846a9a4eb37a", dandy: "a1ae56edeece", riviera: "11740f4a312a", robe: "3c1379c1f099", lilac: "d95d2e955bb4", safari: "f067fc334715", fur: "d5cb6e030c04", tunic: "18ef0a5b8609", track: "6661ec8eabd6" },
  },

  "s-8": {
    base: { dance: "3c442b88ff5c", party: "c3fdb5ee6bd4", sing: "b7a9f5e92b3e", romance: "0acbefd765db", comedy: "e8e6b6dc04cc", fashion: "d0084d4fb9c1", fitness: "fa64e2adaddb", finance: "7456f4f176e5", food: "074b7c759f69" },
  },
};

// Genre choisi -> jeu de visuels du site.
export const GENDER_KEY = { female: "f", trans_woman: "f", male: "m", trans_man: "m", nb: "nb", non_binary: "nb" };

// Ordre de repli : on ne montre jamais les visuels de l'autre genre.
const GENDER_ORDER = {
  f: ["f", "base", "nb"],
  m: ["m", "base", "nb"],
  nb: ["nb", "base", "f"],
  base: ["base", "f", "nb"],
};

// Photo d'un choix du funnel de référence, pour le genre choisi.
export function refImage(screen, key, gender) {
  if (!screen || !key) return "";
  const sets = SETS[screen] || {};
  for (const g of GENDER_ORDER[GENDER_KEY[gender] || "base"]) {
    const set = sets[g];
    if (set && set[key]) return A(set[key]);
  }
  return "";
}
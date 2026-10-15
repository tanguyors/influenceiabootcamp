// Visuels des choix du funnel : les photos proviennent du site de référence.
// Correspondance entre nos options Higgsfield et les fichiers image du site.
const A = (hash) => `https://cashfluencer.co/create/i/${hash}.webp`;

export const CHOICE_IMAGES = {
  gender: {
    female: A("31627b2c1ce5"),
    male: A("c15e17cfe6eb"),
    non_binary: A("6329de5b4d4b"),
  },
  body_type: {
    body_slim: A("a19dc8dd2737"),
    body_athletic: A("f6156fac7066"),
    body_muscular: A("801529af30d7"),
    body_curvy: A("e5295db586af"),
    body_heavy: A("f71f044a2171"),
  },
  hair: {
    hair_bald: A("290a6f40bc4f"),
    hair_buzz: A("8ebdd0ffba38"),
    hair_bowl: A("f99bb6edaa05"),
    hair_mullet: A("31ff4003b89c"),
    hair_afro: A("04274b19b273"),
    hair_punk: A("ce037f59f2df"),
    hair_long: A("86abc86fa28c"),
    hair_short: A("a55e523a12a3"),
  },
  hair_colour: {
    hc_black: A("f922c5d2619c"),
    hc_darkbrown: A("0b75afe0488d"),
    hc_chestnut: A("48dbc5773fdc"),
    hc_ginger: A("06a98a0dbe39"),
    hc_red: A("705993a1014a"),
    hc_blonde: A("0bdbb536db04"),
    hc_platinum: A("5abae7432a44"),
    hc_grey: A("37171cfc51d7"),
    hc_white: A("6e94bd2cc63f"),
    hc_pink: A("38dc5ff64778"),
  },
  aesthetic: {
    retro: A("0859482e9538"),
    sporty: A("fb26bd1dd386"),
    theatrical: A("fa6a91e416d3"),
    goth: A("693f9d9edb2c"),
    suits: A("52e1db91e0d8"),
    casual: A("687a8d533bec"),
  },
  ethnicity_origin_base: {
    african: A("76413910cf69"),
    east_asian: A("65fafeb88bb6"),
    european: A("dc8ac3a37089"),
    indian: A("5898f394f088"),
    middle_eastern: A("7272ffcc26ba"),
    latin_american: A("08edc20a61b8"),
  },
  age: {
    adult: A("ba9989c8953d"),
    mature: A("863ee2a48b95"),
    senior: A("b7baabdd924c"),
  },
  skin_tone: {
    st_porcelain: A("ea5f96108ca1"),
    st_fair: A("18d4f66b2bb3"),
    st_light: A("370699f86e27"),
    st_olive: A("e9efad0dcd11"),
    st_tan: A("e16de3379763"),
    st_brown: A("e11c770dfaa0"),
    st_deep: A("6a672d78d701"),
    st_ebony: A("7b6202de2fe7"),
  },
  height: {
    h_average: A("c04661829387"),
    h_tall: A("a68bb46136dc"),
    h_very_tall: A("01ec4101162f"),
  },
  proportions: {
    pr_longlimbs: A("3343d2ec5e0d"),
    pr_shoulders: A("61442ab776fc"),
    pr_waist: A("970df3d609fd"),
  },
  eye_shape: {
    es_almond: A("5a05db2357bd"),
    es_round: A("1a7f2be65eaa"),
    es_monolid: A("f398acdd1b04"),
    es_large: A("05594a9c7196"),
    es_hooded: A("aa851efc01f0"),
    es_upturned: A("8e6d57572884"),
  },
  eye_color: {
    eye_brown: A("4e9faa69a984"),
    eye_amber: A("95e968a03c19"),
    eye_hazel: A("c588112738b5"),
    eye_green: A("3e3c5121f9a1"),
    eye_blue: A("66e0f2e7cd23"),
    eye_ice_blue: A("bd78fe6142e8"),
    eye_grey: A("0bc3f2b713ae"),
  },
  facial_hair: {
    fh_none: A("76cb738531e4"),
    fh_stubble: A("e49bfe330522"),
    fh_beard: A("c91cbf2794e7"),
    fh_goatee: A("66f7a76f1d25"),
    fh_moustache: A("3e7f9c85e7d0"),
    fh_pencil: A("bcd00a9fd227"),
  },
  accessory: {
    acc_none: A("4d730f09576e"),
    acc_glasses: A("469d25b06ad6"),
    acc_headphones: A("03ff83ab926e"),
    acc_jewelry: A("e2cf2a960654"),
    acc_hat: A("74cd653b7c8d"),
  },
};

// Photo d'un choix, ou chaîne vide si le site n'a pas d'équivalent.
export function optionImage(groupId, option) {
  const map = CHOICE_IMAGES[groupId];
  return (map && map[(option && option.id) || ""]) || "";
}
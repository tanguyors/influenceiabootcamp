// Traits fins du visage traduits en anglais physique, étape par étape.
// Le moteur d'images comprend et retient bien mieux ces formulations que les libellés
// français : sans elles, il lisse le visage et oublie les détails (dents du bonheur,
// paupières lourdes, grill doré…).
export const TRAIT_DETAILS_EN = {
  "q-eyes": {
    almond: "almond-shaped eyes",
    round: "round wide-open eyes",
    monolid: "monolid eyes without a visible crease",
    hooded: "heavy hooded eyelids: the droopy upper lids hang low and partially cover the eyes, clearly visible in the close-up views",
    huge: "unusually large eyes",
    up: "upturned cat-like eyes",
  },
  "q-feat": {
    freckles: "light freckles scattered across the nose and cheeks",
    dimples: "visible dimples when smiling",
    bags: "pronounced under-eye bags and dark circles",
    cheek: "high prominent cheekbones",
    lips: "full plump lips",
    unibrow: "thick eyebrows joined into a single unibrow",
    mark: "a visible dark beauty mark on the face",
    gap: "a clear gap between the two upper front teeth (diastema); in the smiling view the teeth are visible and the gap is unmistakable",
    jug: "large prominent ears sticking out",
  },
  "q-df": {
    oddeyes: "heterochromia: one eye is a different colour from the other",
    facetat: "a small dark facial tattoo on the cheek",
    piercing: "a metal septum piercing in the nose",
    brow: "thin shaved slits cut into one eyebrow",
    grill: "a shiny gold grill covering the upper front teeth, visible when smiling",
    freckles: "a dense storm of freckles covering the whole face",
    gems: "small gemstones glued onto the face",
    elf: "pointed elf-like ears",
    scar: "a vertical scar crossing one eyebrow",
  },
  "q-acc": {
    glasses: "wearing framed glasses",
    headphones: "wearing over-ear headphones",
    jewelry: "wearing heavy gold jewellery",
    hat: "wearing a bucket hat",
    monocle: "wearing a monocle over one eye",
    pearls: "wearing a pearl necklace",
    bowtie: "wearing a bow tie",
    feather: "wearing a feathered hat",
  },
  "q-fh": {
    none: "completely clean-shaven face, no beard and no stubble",
    stubble: "light stubble beard",
    stache: "a moustache",
    goatee: "a goatee",
    short: "a short beard",
    full: "a full thick beard",
    handle: "a handlebar moustache",
    chops: "thick sideburns",
    dali: "a thin pencil moustache curled upward, Salvador Dalí style",
  },
};

// Traits retenus par l'utilisateur, dans l'ordre des étapes du parcours.
export function traitDetailsEn(choices = {}) {
  const out = [];
  for (const [stepId, options] of Object.entries(TRAIT_DETAILS_EN)) {
    const value = (choices || {})[stepId];
    const ids = Array.isArray(value) ? value : value ? [value] : [];
    for (const id of ids) if (options[id]) out.push(options[id]);
  }
  return out;
}
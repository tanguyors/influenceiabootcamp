// Libellés français des traits du générateur d'influenceurs Higgsfield.
export const TRAIT_LABELS = {
  gender: "Genre",
  body_type: "Morphologie",
  hair: "Coiffure",
  hair_colour: "Couleur de cheveux",
  aesthetic: "Style",
  ethnicity_origin_base: "Origine",
  age: "Âge",
  skin_tone: "Carnation",
  height: "Taille",
  proportions: "Proportions",
  eye_shape: "Forme des yeux",
  eye_color: "Couleur des yeux",
  facial_hair: "Barbe",
  distinctive: "Signes particuliers",
  accessory: "Accessoires",
};

export function groupLabel(group) {
  if (!group) return "";
  return TRAIT_LABELS[group.id] || group.label || group.id;
}

function optionLabel(groups, groupId, optionId) {
  const group = (groups || []).find((g) => g.id === groupId);
  const option = ((group && group.options) || []).find((o) => o.id === optionId);
  return (option && option.label) || optionId;
}

// Traits finalement retenus par Higgsfield (les groupes non choisis sont complétés par lui).
export function traitsOf(params, groups) {
  const selection = (params && params.selection) || {};
  return Object.entries(selection).map(([groupId, ids]) => ({
    group: groupLabel((groups || []).find((g) => g.id === groupId) || { id: groupId }),
    values: (ids || []).map((id) => optionLabel(groups, groupId, id)).join(", "),
  }));
}

// Notes de l'influenceur : ce texte est réinjecté dans les prompts de génération vidéo.
export function traitSummary(params, groups, brief) {
  const traits = traitsOf(params, groups).map((t) => `${t.group} : ${t.values}`).join(" · ");
  return [String(brief || "").trim(), traits].filter(Boolean).join("\n");
}
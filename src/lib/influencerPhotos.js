// Photos d'un influenceur : la planche de référence si elle existe, sinon la photo principale.
export function photosOf(inf) {
  if (Array.isArray(inf?.reference_images) && inf.reference_images.length) return inf.reference_images;
  return inf?.reference_image ? [inf.reference_image] : [];
}

// Les deux visuels mis en avant sur la carte : le visage et le plan en pied.
// Pour un personnage importé de la banque, ce sont ses deux photos d'origine
// (portrait + plan en pied) ; sinon le portrait principal et une autre photo de la planche.
export function cardPhotosOf(inf) {
  const list = photosOf(inf);
  const face = inf?.face_reference_image || list[0] || inf?.reference_image || "";
  let body = inf?.reference_image || "";
  if (!body || body === face) body = list.find((uri) => uri && uri !== face) || "";
  return {
    face,
    body,
    extras: list.filter((uri) => uri && uri !== face && uri !== body),
  };
}
// Lien d'import de la banque de personnages : vérification côté navigateur, avant tout
// appel, avec les mêmes règles que la fonction serveur. Le lien n'est ni conservé ni
// transmis ailleurs qu'à cette fonction.

const BANK_HOST = "characters.cashfluenceur.com";
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export const BANK_HOME = `https://${BANK_HOST}`;

export const IMPORT_STEPS = [
  "Vérification du lien",
  "Récupération du personnage",
  "Préparation des photos",
  "Personnage prêt",
];

export const IMPORT_MESSAGES = {
  INVALID_LINK: "Ce lien semble incomplet. Copiez à nouveau votre lien depuis la banque.",
  LINK_NOT_FOUND: "Ce lien n'est plus disponible. Retrouvez votre lien sur la banque de personnages.",
  UNAVAILABLE: "La connexion est momentanément indisponible. Votre personnage reste réservé. Réessayez.",
  PHOTOS: "Les photos n'ont pas pu être préparées. Réessayez pour terminer l'import.",
  UNEXPECTED: "Cette fiche n'a pas pu être lue sur la banque. Réessayez, ou copiez un nouveau lien depuis la banque.",
};

export function isValidImportLink(link) {
  const raw = String(link || "").trim();
  if (!raw) return false;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.hostname !== BANK_HOST) return false;
  if (url.username || url.password) return false;
  if (url.port) return false;
  if (url.pathname !== "/import" && url.pathname !== "/import/") return false;
  if (url.search) return false;
  if (!url.hash.startsWith("#token=")) return false;
  return TOKEN_PATTERN.test(url.hash.slice("#token=".length));
}

export function messageForCode(code) {
  return IMPORT_MESSAGES[code] || IMPORT_MESSAGES.UNAVAILABLE;
}
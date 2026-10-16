import { readZip } from "@/lib/zipReader";

// Lecture de l'export d'un personnage téléchargé depuis le site de la banque de caractères :
// on en sort son nom, sa fiche (âge, origine, tenue…) et toutes ses photos.

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|bmp|tiff?|heic|heif)$/i;
const DATA_EXT = /\.(json|csv|txt|md|ya?ml)$/i;

const MIMES = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif",
  gif: "image/gif", bmp: "image/bmp", tif: "image/tiff", tiff: "image/tiff",
  heic: "image/heic", heif: "image/heif",
};

// Clés possibles de la fiche → libellé français. Le nom exact des clés dépend du site
// qui a produit l'export, on reste donc tolérant.
const FIELDS = [
  [["id", "num", "number", "no", "character_id", "characterid"], "N°"],
  [["name", "nom", "full_name", "fullname", "character_name", "charactername", "display_name", "displayname", "title"]],
  [["age", "years", "age_years"], "Âge"],
  [["gender", "sexe", "genre"], "Genre"],
  [["nationality", "nationalite", "nationalité", "origin", "origine", "country", "pays"], "Origine"],
  [["outfit", "tenue", "clothing", "clothes", "wardrobe"], "Tenue"],
  [["style", "look"], "Style"],
  [["niche", "category", "categorie", "catégorie"], "Niche"],
  [["platform", "plateforme"], "Plateforme"],
  [["audience", "cible", "target"], "Audience"],
  [["tone", "ton"], "Ton"],
  [["personality", "traits", "personnalite", "personnalité"], "Personnalité"],
  [["story", "histoire", "bio", "biography", "biographie"], "Histoire"],
  [["description", "notes", "resume", "résumé", "summary"], "Description"],
];

const NAME_KEYS = FIELDS[1][0];

function mimeOf(filename) {
  return MIMES[(filename.split(".").pop() || "").toLowerCase()] || "application/octet-stream";
}

function tidy(value) {
  return String(value == null ? "" : value).replace(/_+/g, " ").replace(/\s+/g, " ").trim();
}

// « 301‑rory‑copperline » → « Rory Copperline » : dernier recours quand la fiche est absente.
function prettyName(text) {
  return tidy(text)
    .replace(/^[\d]+[\s.\-–·]*/, "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Toutes les paires clé / valeur de la fiche, même imbriquées, en minuscules.
function leaves(node, out = {}, depth = 0) {
  if (!node || typeof node !== "object" || depth > 3) return out;
  Object.entries(node).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) leaves(value, out, depth + 1);
    if (value === null || value === undefined || typeof value === "object") return;
    const lower = key.toLowerCase();
    if (!(lower in out)) out[lower] = value;
  });
  return out;
}

function fieldValue(value) {
  if (Array.isArray(value)) return value.filter((v) => v !== null && typeof v !== "object").join(", ");
  if (typeof value === "boolean") return value ? "oui" : "non";
  return tidy(value);
}

function readFields(raw) {
  const found = leaves(raw);
  const nameKey = NAME_KEYS.find((key) => found[key] !== undefined);
  const name = nameKey ? fieldValue(found[nameKey]) : "";

  const notes = FIELDS.slice(2).flatMap(([keys, label]) => {
    const key = keys.find((k) => found[k] !== undefined);
    if (!key) return [];
    const text = fieldValue(found[key]);
    return text ? [`${label} : ${text}`] : [];
  });

  const idKey = FIELDS[0][0].find((key) => found[key] !== undefined);
  const id = idKey ? fieldValue(found[idKey]) : "";
  if (id) notes.unshift(`N° ${id}`);

  return { name, notes: notes.join(" · ") };
}

function fromJson(text) {
  const data = JSON.parse(text);
  const root = Array.isArray(data) ? data[0] : data;
  if (!root || typeof root !== "object") return null;
  const wrapper = ["character", "personnage", "character_data", "data", "infos", "profile"]
    .map((key) => root[key])
    .find((value) => value && typeof value === "object");
  return readFields(wrapper && !Array.isArray(wrapper) ? wrapper : root);
}

function fromCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return null;
  const cut = (line) => line.split(/[,;\t]/).map((cell) => cell.trim().replace(/^"|"$/g, ""));
  const headers = cut(lines[0]);
  const values = cut(lines[1]);
  const raw = {};
  headers.forEach((header, i) => { raw[header] = values[i]; });
  return readFields(raw);
}

function fileFromEntry(entry) {
  const name = entry.path.split("/").pop();
  return new File([entry.bytes], name, { type: mimeOf(name) });
}

// files : soit l'archive ZIP téléchargée depuis le site, soit ses photos et son fichier
// de données déposés séparément.
export async function readCharacterExport(files) {
  const list = Array.from(files || []);
  const archive = list.find((file) => /\.zip$/i.test(file.name || ""));

  let images = [];
  let chunks = [];
  let label = "";

  if (archive) {
    const entries = await readZip(await archive.arrayBuffer());
    images = entries.filter((entry) => IMAGE_EXT.test(entry.path)).map(fileFromEntry);
    chunks = entries
      .filter((entry) => DATA_EXT.test(entry.path))
      .map((entry) => ({ path: entry.path, text: new TextDecoder().decode(entry.bytes) }));
    label = archive.name.replace(/\.zip$/i, "");
    // Export d'un seul personnage : son dossier porte son nom.
    const folders = new Set(entries.map((entry) => entry.path.split("/").slice(0, -1).join("/")).filter(Boolean));
    if (folders.size === 1) label = [...folders][0].split("/").pop();
  } else {
    images = list.filter((file) => (file.type || "").startsWith("image/") || IMAGE_EXT.test(file.name || ""));
    chunks = await Promise.all(
      list.filter((file) => DATA_EXT.test(file.name || ""))
        .map(async (file) => ({ path: file.name, text: await file.text() })),
    );
    label = list.length === 1 ? list[0].name.replace(/\.[^.]+$/, "") : "";
  }

  // Ordre naturel (1, 2, …, 10) : la première photo sert de référence principale.
  images.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));

  let name = "";
  let notes = "";
  chunks.forEach((chunk) => {
    if (name) return;
    try {
      const parsed = /\.json$/i.test(chunk.path) ? fromJson(chunk.text) : /\.csv$/i.test(chunk.path) ? fromCsv(chunk.text) : null;
      if (parsed && (parsed.name || parsed.notes)) {
        name = parsed.name;
        notes = parsed.notes;
      }
    } catch (e) {
      // Fiche illisible : on retombera sur le nom du dossier.
    }
  });

  return { name: name || prettyName(label), notes, images };
}
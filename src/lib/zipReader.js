// Lecture d'une archive ZIP côté navigateur : les exports téléchargés depuis un site
// arrivent sous cette forme (les photos et la fiche du personnage dans un seul fichier).

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const MAX_COMMENT = 66000;

// Fin du répertoire central : il est suivi du commentaire de l'archive, dont la taille varie.
function endOfCentralDirectory(view, total) {
  const floor = Math.max(0, total - MAX_COMMENT);
  for (let i = total - 22; i >= floor; i -= 1) {
    if (view.getUint32(i, true) === EOCD_SIGNATURE) return i;
  }
  return -1;
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("Votre navigateur ne sait pas ouvrir cette archive ZIP.");
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// Renvoie [{ path, bytes }] pour chaque fichier de l'archive, dossiers et fichiers
// techniques (macOS) exclus.
export async function readZip(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const eocd = endOfCentralDirectory(view, bytes.length);
  if (eocd < 0) throw new Error("Archive illisible : ce fichier n'est pas un ZIP valide.");

  const count = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const entries = [];

  for (let i = 0; i < count; i += 1) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== CENTRAL_SIGNATURE) break;

    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const path = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));

    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLength + localExtraLength;

    const junk = path.startsWith("__MACOSX/") || (path.split("/").pop() || "").startsWith(".");
    if (!path.endsWith("/") && !junk) {
      const raw = bytes.subarray(start, start + compressedSize);
      if (raw.length) {
        entries.push({ path, bytes: method === 0 ? raw : await inflateRaw(raw) });
      }
    }

    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}
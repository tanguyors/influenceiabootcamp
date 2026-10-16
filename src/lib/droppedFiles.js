const IMAGE_EXT = /\.(jpe?g|png|webp|avif|heic|heif|gif|bmp|tiff?)$/i;

function isImage(file) {
  return (file.type && file.type.startsWith("image/")) || IMAGE_EXT.test(file.name || "");
}

// Un dossier déposé n'est pas une liste de fichiers : il faut descendre dans son arborescence.
// readEntries ne renvoie que 100 entrées par appel, d'où la boucle jusqu'à un lot vide.
function readEntry(entry) {
  if (!entry) return Promise.resolve([]);

  if (entry.isFile) {
    return new Promise((resolve) => entry.file((file) => resolve([file]), () => resolve([])));
  }

  if (entry.isDirectory) {
    const reader = entry.createReader();
    const children = [];
    return new Promise((resolve) => {
      const readBatch = () => {
        reader.readEntries(
          (batch) => {
            if (!batch.length) {
              Promise.all(children.map(readEntry)).then((nested) => resolve(nested.flat()));
              return;
            }
            children.push(...batch);
            readBatch();
          },
          () => resolve([]),
        );
      };
      readBatch();
    });
  }

  return Promise.resolve([]);
}

// Fichiers images contenus dans ce qui vient d'être déposé (dossier, sous-dossiers ou fichiers seuls).
export async function filesFromDataTransfer(dataTransfer) {
  const entries = Array.from(dataTransfer.items || [])
    .filter((item) => item.kind === "file")
    .map((item) => (item.webkitGetAsEntry ? item.webkitGetAsEntry() : null));

  const nested = await Promise.all(entries.map(readEntry));
  const found = nested.flat().filter(isImage);
  if (found.length) return found;

  // Navigateur sans accès à l'arborescence : on retombe sur la liste classique.
  return Array.from(dataTransfer.files || []).filter(isImage);
}
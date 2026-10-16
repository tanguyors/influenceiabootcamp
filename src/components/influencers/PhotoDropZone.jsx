import { useState } from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import { filesFromDataTransfer } from "@/lib/droppedFiles";

// Zone de dépôt : on y glisse un dossier entier, toutes ses images sont récupérées.
export default function PhotoDropZone({ onFiles, count = 0 }) {
  const [over, setOver] = useState(false);
  const [reading, setReading] = useState(false);

  async function handleDrop(e) {
    e.preventDefault();
    setOver(false);
    setReading(true);
    try {
      const { files, folderName } = await filesFromDataTransfer(e.dataTransfer);
      onFiles(files, folderName);
    } finally {
      setReading(false);
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition ${
        over ? "border-primary bg-primary/5" : "border-border bg-secondary/40"
      }`}
    >
      {reading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <FolderOpen className={`h-6 w-6 ${over ? "text-primary" : "text-muted-foreground"}`} />
      )}
      <p className="mt-3 text-sm font-semibold">
        {reading ? "Lecture du dossier…" : over ? "Déposez le dossier ici" : "Glissez le dossier de ses photos ici"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Toutes les images du dossier (et de ses sous-dossiers) sont ajoutées d'un coup, et le nom du dossier
        devient celui du personnage{count ? ` · ${count} photo(s) prête(s)` : ""}.
      </p>
    </div>
  );
}
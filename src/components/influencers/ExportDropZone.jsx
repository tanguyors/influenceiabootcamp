import { useState } from "react";
import { FileArchive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dépôt de l'export téléchargé depuis la banque de caractères.
export default function ExportDropZone({ onFiles, busy = false, error = "" }) {
  const [over, setOver] = useState(false);

  function pick(list) {
    const files = Array.from(list || []);
    if (files.length) onFiles(files);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files); }}
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition ${
        over ? "border-primary bg-primary/5" : "border-border bg-secondary/40"
      }`}
    >
      {busy ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <FileArchive className={`h-6 w-6 ${over ? "text-primary" : "text-muted-foreground"}`} />
      )}
      <p className="mt-3 text-sm font-semibold">
        {busy ? "Lecture de l'export…" : "Glissez ici l'export téléchargé depuis votre site"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Fichier .zip du personnage, ou ses photos et son fichier .json / .csv ensemble.
      </p>

      <Button asChild variant="outline" className="mt-4 font-semibold">
        <label>
          Choisir un fichier
          <input
            type="file"
            multiple
            accept=".zip,.json,.csv,image/*"
            className="hidden"
            onChange={(e) => { pick(e.target.files); e.target.value = ""; }}
          />
        </label>
      </Button>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}
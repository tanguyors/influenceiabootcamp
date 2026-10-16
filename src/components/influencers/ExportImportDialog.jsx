import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import ExportDropZone from "@/components/influencers/ExportDropZone";
import ExportPreview from "@/components/influencers/ExportPreview";
import { readCharacterExport } from "@/lib/characterExport";

// Import direct de l'export d'un élève : le personnage sorti du site arrive ici avec
// ses photos et sa fiche, prêt à générer des vidéos.
export default function ExportImportDialog({ open, onOpenChange, onCreated }) {
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    setBusy("");
    setCharacter(null);
  }, [open]);

  async function handleFiles(files) {
    setBusy("reading");
    setError("");
    try {
      const parsed = await readCharacterExport(files);
      if (!parsed.images.length) throw new Error("Aucune photo trouvée dans cet export.");
      setCharacter({
        name: parsed.name,
        notes: parsed.notes,
        images: parsed.images.map((file) => ({ file, url: URL.createObjectURL(file) })),
      });
    } catch (e) {
      setError(e.message || "Export illisible.");
    } finally {
      setBusy("");
    }
  }

  async function save() {
    const name = (character?.name || "").trim();
    if (!name) {
      setError("Le nom du personnage est requis.");
      return;
    }
    setBusy("saving");
    setError("");
    try {
      const uploaded = await Promise.all(character.images.map(({ file }) => base44.integrations.Core.UploadPrivateFile({ file })));
      const uris = uploaded.map((u) => u.file_uri).filter(Boolean);
      const created = await base44.entities.Influencer.create({
        name,
        notes: (character.notes || "").trim(),
        reference_image: uris[0] || "",
        reference_images: uris,
      });
      onCreated(created);
      toast({ title: `${name} rejoint vos influenceurs` });
      onOpenChange(false);
    } catch (e) {
      setError(e.message || "Import impossible.");
    } finally {
      setBusy("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Importer un personnage exporté</DialogTitle>
          <DialogDescription>
            L'export vient de votre site de caractères : il contient ses photos et sa fiche. Photos conservées de façon privée (stored privately).
          </DialogDescription>
        </DialogHeader>

        {character ? (
          <ExportPreview
            character={character}
            saving={busy === "saving"}
            error={error}
            onChange={(patch) => setCharacter((c) => ({ ...c, ...patch }))}
            onImport={save}
            onReset={() => { setCharacter(null); setError(""); }}
          />
        ) : (
          <ExportDropZone onFiles={handleFiles} busy={busy === "reading"} error={error} />
        )}
      </DialogContent>
    </Dialog>
  );
}
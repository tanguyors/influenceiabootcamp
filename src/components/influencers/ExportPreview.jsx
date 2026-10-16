import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Personnage reconnu dans l'export : on relit son nom et sa fiche avant de l'enregistrer.
export default function ExportPreview({ character, saving, error, onChange, onImport, onReset }) {
  const { name, notes, images } = character;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap gap-2">
          {images.map((item) => (
            <img key={item.url} src={item.url} alt="" className="h-16 w-16 rounded-lg border border-border bg-secondary object-cover" />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {images.length} photo(s) de référence récupérée(s) dans l'export.
        </p>
      </div>

      <div>
        <Label htmlFor="export-name">Nom du personnage</Label>
        <Input id="export-name" value={name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Ex. Rory Copperline" />
      </div>

      <div>
        <Label htmlFor="export-notes">Sa fiche</Label>
        <Textarea id="export-notes" rows={4} value={notes} onChange={(e) => onChange({ notes: e.target.value })} placeholder="Âge, origine, tenue…" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="ghost" onClick={onReset} disabled={saving} className="font-semibold">
          Choisir un autre export
        </Button>
        <Button onClick={onImport} disabled={saving} className="font-semibold">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Importer ce personnage
        </Button>
      </div>
    </div>
  );
}
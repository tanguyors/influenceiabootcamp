import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function PhotoInfluencerForm({ onCreated }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", notes: "", files: [], previews: [] });

  function onFile(e) {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    setForm((s) => ({
      ...s,
      files: [...s.files, ...picked],
      previews: [...s.previews, ...picked.map((f) => URL.createObjectURL(f))],
    }));
    e.target.value = "";
  }

  function removePhoto(index) {
    setForm((s) => ({
      ...s,
      files: s.files.filter((_, i) => i !== index),
      previews: s.previews.filter((_, i) => i !== index),
    }));
  }

  async function save() {
    if (!form.name.trim() || !form.files.length) {
      toast({ title: "Nom et au moins une photo requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const uploaded = await Promise.all(form.files.map((file) => base44.integrations.Core.UploadPrivateFile({ file })));
      const uris = uploaded.map((u) => u.file_uri).filter(Boolean);
      const created = await base44.entities.Influencer.create({
        name: form.name.trim(),
        notes: form.notes.trim(),
        reference_image: uris[0] || "",
        reference_images: uris,
      });
      setForm({ name: "", notes: "", files: [], previews: [] });
      onCreated(created);
    } catch (e) {
      toast({ title: "Erreur lors de la création", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Photos de référence</Label>
        <p className="mb-2 text-xs text-black/45">
          Ajoutez plusieurs photos du personnage (visage de face, profil, plan large). Plus il y en a, mieux Higgsfield le reproduit. Stockées de façon privée (stored privately).
        </p>
        {form.previews.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {form.previews.map((src, i) => (
              <div key={src} className="relative">
                <img src={src} alt="" className="h-20 w-20 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-black p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Input type="file" accept="image/*" multiple onChange={onFile} />
        <p className="mt-1 text-xs text-black/40">
          {form.files.length ? `${form.files.length} photo(s) sélectionnée(s)` : "Aucune photo sélectionnée"}
        </p>
      </div>
      <div>
        <Label htmlFor="photo-name">Nom</Label>
        <Input id="photo-name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Ex. Léa" />
      </div>
      <div>
        <Label htmlFor="photo-notes">Notes (optionnel)</Label>
        <Textarea id="photo-notes" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Style, tenue habituelle, ton…" rows={3} />
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-black text-white hover:bg-black/85">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Créer
        </Button>
      </div>
    </div>
  );
}
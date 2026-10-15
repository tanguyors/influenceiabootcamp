import { useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { readVideoDuration } from "@/lib/videoDuration";

const EMPTY = {
  title: "",
  duration: null,
  reading: false,
  thumbnailFile: null,
  thumbnailPreview: "",
  videoFile: null,
};

export default function ReferenceFormDialog({ open, onOpenChange, onCreated }) {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  function onThumbnail(e) {
    const file = e.target.files?.[0];
    if (file) setForm((s) => ({ ...s, thumbnailFile: file, thumbnailPreview: URL.createObjectURL(file) }));
  }

  // La durée n'est jamais saisie : elle est lue directement dans le fichier mp4.
  async function onVideo(e) {
    const file = e.target.files?.[0] || null;
    setForm((s) => ({ ...s, videoFile: file, duration: null, reading: Boolean(file) }));
    if (!file) return;
    const duration = await readVideoDuration(file);
    setForm((s) => (s.videoFile === file ? { ...s, duration, reading: false } : s));
  }

  async function save() {
    if (!form.title.trim() || !form.videoFile) {
      toast({ title: "Titre et fichier mp4 requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let thumbnail_url = "";
      if (form.thumbnailFile) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: form.thumbnailFile });
        thumbnail_url = file_uri;
      }
      let video_file_uri = "";
      if (form.videoFile) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: form.videoFile });
        video_file_uri = file_uri;
      }
      const created = await base44.entities.ViralVideo.create({
        title: form.title.trim(),
        duration: form.duration || undefined,
        thumbnail_url,
        video_file_uri,
        published_date: new Date().toISOString(),
        is_manual: true,
        is_demo: false,
      });
      onCreated(created);
      setForm(EMPTY);
      onOpenChange(false);
      toast({ title: "Modèle ajouté" });
    } catch (e) {
      toast({ title: "Ajout impossible", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Ajouter un modèle</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="rtitle">Titre</Label>
            <Input id="rtitle" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="Description courte" />
          </div>
          <div>
            <Label>Vignette (optionnel)</Label>
            <div className="flex items-center gap-3">
              {form.thumbnailPreview && <img src={form.thumbnailPreview} alt="" className="h-16 w-16 rounded-lg object-cover" />}
              <Input type="file" accept="image/*" onChange={onThumbnail} />
            </div>
            <p className="mt-1 text-xs text-black/45">La vignette est stockée de façon privée (stored privately).</p>
          </div>
          <div>
            <Label>Vidéo mp4</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="video/mp4" onChange={onVideo} />
              {form.videoFile && <span className="text-xs font-medium text-green-700">{form.videoFile.name}</span>}
            </div>
            <p className="mt-1 text-xs text-black/45">Le transfert de mouvement reprend le mouvement de ce fichier (4 à 30 s). Il est stocké de façon privée (stored privately).</p>
            <p className="mt-1 text-xs font-medium text-black/60">
              {form.reading
                ? "Lecture de la durée…"
                : form.duration
                  ? `Durée détectée : ${form.duration} s — la génération reprendra exactement cette durée.`
                  : "La durée sera lue automatiquement dans le fichier."}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Annuler</Button>
          <Button onClick={save} disabled={saving} className="bg-black text-white hover:bg-black/85">
            {saving ? <Loader2 className="mr-2 animate-spin" /> : null}
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
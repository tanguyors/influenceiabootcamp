import { useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CATEGORIES, PLATFORMS, platformLabel } from "@/lib/referenceOptions";

const EMPTY = {
  title: "",
  platform: "tiktok",
  category: "lifestyle",
  duration: "",
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
        platform: form.platform,
        category: form.category,
        duration: form.duration ? Number(form.duration) : undefined,
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Plateforme</Label>
              <Select value={form.platform} onValueChange={(v) => setForm((s) => ({ ...s, platform: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{platformLabel(p)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm((s) => ({ ...s, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="rduration">Durée de la vidéo (secondes)</Label>
            <Input
              id="rduration"
              type="number"
              min="1"
              value={form.duration}
              onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))}
              placeholder="Ex. 12"
            />
            <p className="mt-1 text-xs text-black/45">La génération reprendra exactement cette durée.</p>
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
            <Label>Vidéo source mp4 (requise pour recréer)</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="video/mp4" onChange={(e) => setForm((s) => ({ ...s, videoFile: e.target.files?.[0] || null }))} />
              {form.videoFile && <span className="text-xs font-medium text-green-700">{form.videoFile.name}</span>}
            </div>
            <p className="mt-1 text-xs text-black/45">Le transfert de mouvement reprend le mouvement de ce fichier (4 à 30 s). Il est stocké de façon privée (stored privately).</p>
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
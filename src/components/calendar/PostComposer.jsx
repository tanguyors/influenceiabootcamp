import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { POST_PLATFORMS } from "@/lib/postPlatforms";

function emptyForm(date) {
  return {
    creation_id: "",
    platform: "tiktok",
    scheduled_date: date,
    scheduled_time: "18:00",
    hook: "",
    caption: "",
    hashtags: "",
    status: "planned",
  };
}

export default function PostComposer({ open, onOpenChange, post, date, onSaved }) {
  const { toast } = useToast();
  const [creations, setCreations] = useState(null);
  const [form, setForm] = useState(() => emptyForm(date));
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(post ? { ...emptyForm(post.scheduled_date), ...post } : emptyForm(date));
    if (creations === null) {
      base44.entities.Creation.filter({ status: "ready" }, { sort: "-created_date", limit: 100 })
        .then((page) => setCreations(page.items || []))
        .catch(() => setCreations([]));
    }
  }, [open, post, date]);

  const selected = (creations || []).find((creation) => creation.id === form.creation_id);

  async function generate() {
    if (!form.creation_id) {
      toast({ title: "Choisissez d'abord une vidéo", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const { data } = await base44.functions.invoke("generatePostCopy", {
        creation_id: form.creation_id,
        platform: form.platform,
      });
      if (data?.error) throw new Error(data.error);
      setForm((current) => ({ ...current, hook: data.hook, caption: data.caption, hashtags: data.hashtags }));
      toast({ title: "Légende rédigée à partir de la vidéo" });
    } catch (error) {
      toast({ title: "Rédaction impossible", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!form.creation_id || !form.scheduled_date) {
      toast({ title: "Choisissez une vidéo et une date", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      creation_id: form.creation_id,
      influencer_id: selected?.influencer_id || "",
      influencer_name: selected?.influencer_name || "",
      video_url: selected?.result_video_url || "",
      platform: form.platform,
      scheduled_date: form.scheduled_date,
      scheduled_time: form.scheduled_time,
      hook: form.hook,
      caption: form.caption,
      hashtags: form.hashtags,
      status: form.status,
    };
    try {
      if (post) await base44.entities.ScheduledPost.update(post.id, payload);
      else await base44.entities.ScheduledPost.create(payload);
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Enregistrement impossible", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    try {
      await base44.entities.ScheduledPost.delete(post.id);
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Suppression impossible", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{post ? "Modifier le post" : "Programmer un post"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Vidéo de mes créations</Label>
            {creations === null ? (
              <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
            ) : creations.length === 0 ? (
              <p className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                Aucune vidéo prête. Générez d'abord une vidéo dans « Mes créations ».
              </p>
            ) : (
              <Select value={form.creation_id} onValueChange={(value) => setForm((c) => ({ ...c, creation_id: value }))}>
                <SelectTrigger><SelectValue placeholder="Choisir une vidéo" /></SelectTrigger>
                <SelectContent>
                  {creations.map((creation) => (
                    <SelectItem key={creation.id} value={creation.id}>
                      {creation.influencer_name || "Création"} · {new Date(creation.created_date).toLocaleDateString("fr-FR")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selected?.result_video_url && (
              <video src={selected.result_video_url} muted loop autoPlay playsInline className="mt-2 aspect-[9/16] h-32 rounded-lg border border-border object-cover" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Réseau</Label>
              <Select value={form.platform} onValueChange={(value) => setForm((c) => ({ ...c, platform: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POST_PLATFORMS.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>{platform.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.scheduled_date} onChange={(event) => setForm((c) => ({ ...c, scheduled_date: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Heure</Label>
              <Input type="time" value={form.scheduled_time} onChange={(event) => setForm((c) => ({ ...c, scheduled_time: event.target.value }))} />
            </div>
          </div>

          <Button variant="secondary" className="w-full" onClick={generate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {generating ? "Rédaction…" : "Générer accroche, légende et hashtags"}
          </Button>

          <div className="space-y-2">
            <Label>Accroche</Label>
            <Input value={form.hook} onChange={(event) => setForm((c) => ({ ...c, hook: event.target.value }))} placeholder="La première ligne qui arrête le scroll" />
          </div>
          <div className="space-y-2">
            <Label>Légende</Label>
            <Textarea rows={5} value={form.caption} onChange={(event) => setForm((c) => ({ ...c, caption: event.target.value }))} placeholder="Rédigée automatiquement à partir de la vidéo" />
          </div>
          <div className="space-y-2">
            <Label>Hashtags</Label>
            <Textarea rows={2} value={form.hashtags} onChange={(event) => setForm((c) => ({ ...c, hashtags: event.target.value }))} />
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={form.status === "published"}
              onChange={(event) => setForm((c) => ({ ...c, status: event.target.checked ? "published" : "planned" }))}
            />
            Marquer comme publié
          </label>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {post ? (
            <Button variant="ghost" size="sm" onClick={remove} disabled={saving} className="text-destructive">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Supprimer
            </Button>
          ) : <span />}
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {post ? "Enregistrer" : "Programmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Users, Trash2, Check, Loader2, Image as ImageIcon } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Image as ContentImage } from "@/components/ui/image";

const ACTIVE_KEY = "influenceia.activeInfluencer";

export default function Influencers() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState(null);
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_KEY) || "");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", notes: "", file: null, preview: "" });

  async function load() {
    try {
      const page = await base44.entities.Influencer.filter({}, { sort: "-created_date", limit: 100 });
      setItems(page.items || []);
    } catch (e) {
      setItems([]);
    }
  }

  useEffect(() => { load(); }, []);

  function selectActive(id) {
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((s) => ({ ...s, file: f, preview: URL.createObjectURL(f) }));
  }

  async function save() {
    if (!form.name.trim() || !form.file) {
      toast({ title: "Nom et image requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: form.file });
      const created = await base44.entities.Influencer.create({
        name: form.name.trim(),
        notes: form.notes.trim(),
        reference_image: file_uri,
      });
      setItems((s) => [created, ...(s || [])]);
      selectActive(created.id);
      setOpen(false);
      setForm({ name: "", notes: "", file: null, preview: "" });
      toast({ title: "Influenceur créé" });
    } catch (e) {
      toast({ title: "Erreur lors de la création", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer cet influenceur ?")) return;
    try {
      await base44.entities.Influencer.delete(id);
      setItems((s) => (s || []).filter((i) => i.id !== id));
      if (activeId === id) { setActiveId(""); localStorage.removeItem(ACTIVE_KEY); }
    } catch (e) {
      toast({ title: "Suppression impossible", variant: "destructive" });
    }
  }

  const list = items || [];

  return (
    <PageShell
      title="Mes influenceurs"
      subtitle="Importez l'image de votre personnage et nommez-le. Son apparence est conservée pour chaque génération, selon les capacités du modèle."
      actions={
        <Button onClick={() => setOpen(true)} className="bg-black text-white hover:bg-black/85">
          <Plus className="mr-2 h-4 w-4" /> Nouvel influenceur
        </Button>
      }
    >
      {items === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-black/30" /></div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun influenceur pour le moment"
          description="Importez une image de votre personnage pour commencer. Vous pourrez ensuite le réutiliser à chaque génération."
          action={<Button onClick={() => setOpen(true)} className="bg-black text-white hover:bg-black/85"><Plus className="mr-2 h-4 w-4" /> Créer mon premier influenceur</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((inf) => (
            <div key={inf.id} className={`group relative overflow-hidden rounded-xl border bg-white ${activeId === inf.id ? "border-black ring-2 ring-black" : "border-black/10"}`}>
              <button onClick={() => selectActive(inf.id)} className="block w-full text-left">
                <div className="relative aspect-[3/4] bg-black/5">
                  {inf.reference_image ? (
                    <ContentImage src={inf.reference_image} fittingType="fill" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-black/20" /></div>
                  )}
                  {activeId === inf.id && (
                    <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-base font-semibold tracking-tight">{inf.name}</h3>
                  {inf.notes && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-black/50">{inf.notes}</p>}
                </div>
              </button>
              <button onClick={() => remove(inf.id)} className="absolute bottom-3 right-3 rounded-md bg-white/80 p-1.5 text-black/40 opacity-0 transition hover:text-red-600 group-hover:opacity-100">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un influenceur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Image de référence</Label>
              <p className="mb-2 text-xs text-black/45">Photo claire du visage. Stockée de façon privée (stored privately).</p>
              <div className="flex items-center gap-3">
                {form.preview && <img src={form.preview} alt="" className="h-20 w-20 rounded-lg object-cover" />}
                <Input type="file" accept="image/*" onChange={onFile} />
              </div>
            </div>
            <div>
              <Label htmlFor="name">Nom</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Ex. Léa" />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Style, tenue habituelle, ton…" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving} className="bg-black text-white hover:bg-black/85">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
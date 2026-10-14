import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Users, Trash2, Check, Loader2, Image as ImageIcon, X } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import SignedImage from "@/components/SignedImage";

const ACTIVE_KEY = "influenceia.activeInfluencer";

export default function Influencers() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState(null);
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_KEY) || "");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", notes: "", files: [], previews: [] });

  // Photos de référence d'un influenceur (les anciens n'en ont qu'une).
  const photosOf = (inf) => (Array.isArray(inf.reference_images) && inf.reference_images.length
    ? inf.reference_images
    : (inf.reference_image ? [inf.reference_image] : []));

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
      setItems((s) => [created, ...(s || [])]);
      selectActive(created.id);
      setOpen(false);
      setForm({ name: "", notes: "", files: [], previews: [] });
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
      subtitle="Importez plusieurs photos de votre personnage et nommez-le. Plus il y a d'angles, mieux son apparence est conservée à chaque génération."
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
          description="Importez plusieurs photos de votre personnage pour commencer. Vous pourrez ensuite le réutiliser à chaque génération."
          action={<Button onClick={() => setOpen(true)} className="bg-black text-white hover:bg-black/85"><Plus className="mr-2 h-4 w-4" /> Créer mon premier influenceur</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((inf) => (
            <div key={inf.id} className={`group relative overflow-hidden rounded-xl border bg-white ${activeId === inf.id ? "border-black ring-2 ring-black" : "border-black/10"}`}>
              <button onClick={() => selectActive(inf.id)} className="block w-full text-left">
                <div className="relative aspect-[3/4] bg-black/5">
                  {photosOf(inf).length ? (
                    <SignedImage src={photosOf(inf)[0]} fittingType="fill" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-black/20" /></div>
                  )}
                  {photosOf(inf).length > 1 && (
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                      {photosOf(inf).length} photos
                    </span>
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
                  {photosOf(inf).length > 1 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {photosOf(inf).slice(1).map((uri) => (
                        <SignedImage key={uri} src={uri} fittingType="fill" className="h-12 w-12 rounded-md border border-black/10 bg-black/5" />
                      ))}
                    </div>
                  )}
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
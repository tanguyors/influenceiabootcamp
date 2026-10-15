import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Users, Trash2, Check, Loader2, Image as ImageIcon } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import SignedImage from "@/components/SignedImage";
import CreateInfluencerFunnel from "@/components/influencers/CreateInfluencerFunnel";
import CreateInfluencerDialog from "@/components/influencers/CreateInfluencerDialog";

const ACTIVE_KEY = "influenceia.activeInfluencer";

export default function Influencers() {
  const { toast } = useToast();
  const [items, setItems] = useState(null);
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_KEY) || "");
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);

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

  function handleCreated(created) {
    setItems((s) => [created, ...(s || [])]);
    selectActive(created.id);
    setFunnelOpen(false);
    setPhotosOpen(false);
    toast({ title: "Influenceur créé" });
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
      subtitle="Générez un personnage par IA ou importez vos propres photos. Plus il y a d'angles, mieux son apparence est conservée à chaque génération."
      actions={
        <Button onClick={() => setFunnelOpen(true)} className="bg-black text-white hover:bg-black/85">
          <Plus className="mr-2 h-4 w-4" /> Créer ma star
        </Button>
      }
    >
      {items === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-black/30" /></div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun influenceur pour le moment"
          description="Créez votre personnage en quelques choix, ou importez vos propres photos. Il sera réutilisable à chaque génération."
          action={<Button onClick={() => setFunnelOpen(true)} className="bg-black text-white hover:bg-black/85"><Plus className="mr-2 h-4 w-4" /> Créer mon premier influenceur</Button>}
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

      <CreateInfluencerFunnel
        open={funnelOpen}
        onClose={() => setFunnelOpen(false)}
        onCreated={handleCreated}
        onImportPhotos={() => { setFunnelOpen(false); setPhotosOpen(true); }}
      />
      <CreateInfluencerDialog open={photosOpen} onOpenChange={setPhotosOpen} onCreated={handleCreated} />
    </PageShell>
  );
}
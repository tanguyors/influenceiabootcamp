import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Users, Trash2, Check, Loader2, Image as ImageIcon, Upload, FileArchive } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import SignedImage from "@/components/SignedImage";
import CreateInfluencerFunnel from "@/components/influencers/CreateInfluencerFunnel";
import CreateInfluencerDialog from "@/components/influencers/CreateInfluencerDialog";
import ImportInfluencerFlow from "@/components/influencers/ImportInfluencerFlow";
import ExportImportDialog from "@/components/influencers/ExportImportDialog";

const ACTIVE_KEY = "influenceia.activeInfluencer";

export default function Influencers() {
  const { toast } = useToast();
  const [items, setItems] = useState(null);
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_KEY) || "");
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

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

  // Import : la fiche est d'abord créée avec ses photos, puis complétée par le
  // questionnaire (niche, ton…) et l'histoire générée pour ce personnage.
  function handleImported(influencer) {
    setItems((s) => {
      const list = s || [];
      return list.some((i) => i.id === influencer.id)
        ? list.map((i) => (i.id === influencer.id ? influencer : i))
        : [influencer, ...list];
    });
    if (!activeId) selectActive(influencer.id);
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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setExportOpen(true)} className="font-semibold">
            <FileArchive className="mr-2 h-4 w-4" /> Importer un export
          </Button>
          <Button variant="outline" onClick={() => setImportOpen(true)} className="font-semibold">
            <Upload className="mr-2 h-4 w-4" /> Importer un influenceur
          </Button>
          <Button onClick={() => setFunnelOpen(true)} className="font-semibold">
            <Plus className="mr-2 h-4 w-4" /> Créer ma star
          </Button>
        </div>
      }
    >
      {items === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun influenceur pour le moment"
          description="Créez votre personnage en quelques choix, ou importez vos propres photos. Il sera réutilisable à chaque génération."
          action={<Button onClick={() => setFunnelOpen(true)} className="font-semibold"><Plus className="mr-2 h-4 w-4" /> Créer mon premier influenceur</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((inf) => (
            <div key={inf.id} className={`group relative overflow-hidden rounded-xl border bg-card ${activeId === inf.id ? "border-primary ring-2 ring-primary" : "border-border"}`}>
              <button onClick={() => selectActive(inf.id)} className="block w-full text-left">
                <div className="relative aspect-[3/4] bg-secondary">
                  {photosOf(inf).length ? (
                    <SignedImage src={photosOf(inf)[0]} fittingType="fit" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground/50" /></div>
                  )}
                  {photosOf(inf).length > 1 && (
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                      {photosOf(inf).length} photos
                    </span>
                  )}
                  {activeId === inf.id && (
                    <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-base font-semibold tracking-tight">{inf.name}</h3>
                    {inf.niche && (
                      <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">{inf.niche}</span>
                    )}
                  </div>
                  {inf.tagline && <p className="mt-1.5 text-xs italic text-primary/90">« {inf.tagline} »</p>}
                  {inf.story ? (
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{inf.story}</p>
                  ) : inf.notes ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{inf.notes}</p>
                  ) : null}
                  {photosOf(inf).length > 1 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {photosOf(inf).slice(1).map((uri) => (
                        <SignedImage key={uri} src={uri} fittingType="fill" className="h-12 w-12 rounded-md border border-border bg-secondary" />
                      ))}
                    </div>
                  )}
                </div>
              </button>
              <button onClick={() => remove(inf.id)} className="absolute bottom-3 right-3 rounded-md bg-card/80 p-1.5 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100">
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
      <ImportInfluencerFlow open={importOpen} onClose={() => setImportOpen(false)} onSaved={handleImported} />
      <ExportImportDialog open={exportOpen} onOpenChange={setExportOpen} onCreated={handleCreated} />
    </PageShell>
  );
}
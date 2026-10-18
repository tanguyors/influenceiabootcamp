import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Trash2, Check, Loader2, Upload } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import SignedImage from "@/components/SignedImage";
import CreateInfluencerFunnel from "@/components/influencers/CreateInfluencerFunnel";
import CreateInfluencerDialog from "@/components/influencers/CreateInfluencerDialog";
import ImportInfluencerFlow from "@/components/influencers/ImportInfluencerFlow";
import InstagramBioPanel from "@/components/influencers/InstagramBioPanel";
import InfluencerPhotoPane from "@/components/influencers/InfluencerPhotoPane";
import PhotoEditDialog from "@/components/influencers/PhotoEditDialog";
import { cardPhotosOf, photosOf } from "@/lib/influencerPhotos";
import Base44PromptCard from "@/components/Base44PromptCard";
import { promptGroup } from "@/lib/base44Prompts";
import { useI18n } from "@/lib/i18n";

const ACTIVE_KEY = "influenceia.activeInfluencer";

export default function Influencers() {
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const [items, setItems] = useState(null);
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_KEY) || "");
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [edit, setEdit] = useState(null);

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
    toast({ title: t("influencers.created") });
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

  function handleInfluencerUpdated(updated) {
    setItems((s) => (s || []).map((i) => (i.id === updated.id ? updated : i)));
  }

  async function remove(id) {
    if (!confirm(t("influencers.deleteConfirm"))) return;
    try {
      await base44.entities.Influencer.delete(id);
      setItems((s) => (s || []).filter((i) => i.id !== id));
      if (activeId === id) { setActiveId(""); localStorage.removeItem(ACTIVE_KEY); }
    } catch (e) {
      toast({ title: t("influencers.deleteFailed"), variant: "destructive" });
    }
  }

  const list = items || [];

  return (
    <PageShell
      title={t("influencers.title")}
      subtitle={t("influencers.subtitle")}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)} className="font-semibold">
            <Upload className="mr-2 h-4 w-4" /> {t("influencers.import")}
          </Button>
        </div>
      }
    >
      <Base44PromptCard group={promptGroup("bio", lang)} className="mb-6" />

      {items === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("influencers.emptyTitle")}
          description={t("influencers.emptyDesc")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((inf) => {
            const photos = cardPhotosOf(inf);
            return (
            <div key={inf.id} className={`group relative overflow-hidden rounded-xl border bg-card ${activeId === inf.id ? "border-primary ring-2 ring-primary" : "border-border"}`}>
              <div className="relative grid grid-cols-2 gap-px bg-border">
                <InfluencerPhotoPane
                  uri={photos.face}
                  label={t("influencers.face")}
                  onSelect={() => selectActive(inf.id)}
                  onModify={() => { selectActive(inf.id); setEdit({ id: inf.id, target: "face", uri: photos.face }); }}
                />
                <InfluencerPhotoPane
                  uri={photos.body}
                  label={t("influencers.fullBody")}
                  onSelect={() => selectActive(inf.id)}
                  onModify={() => { selectActive(inf.id); setEdit({ id: inf.id, target: "body", uri: photos.body }); }}
                />
                {photosOf(inf).length > 1 && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                    {t("influencers.photos", { n: photosOf(inf).length })}
                  </span>
                )}
                {activeId === inf.id && (
                  <div className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <button type="button" onClick={() => selectActive(inf.id)} className="block w-full text-left">
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
                      {photos.extras.map((uri) => (
                        <SignedImage key={uri} src={uri} fittingType="fill" className="h-12 w-12 rounded-md border border-border bg-secondary" />
                      ))}
                    </div>
                  )}
                </div>
              </button>
              <InstagramBioPanel influencer={inf} onUpdated={handleInfluencerUpdated} />
              <button onClick={() => remove(inf.id)} className="absolute right-3 top-3 rounded-md bg-card/80 p-1.5 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            );
          })}
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
      <PhotoEditDialog
        open={Boolean(edit)}
        onOpenChange={(value) => { if (!value) setEdit(null); }}
        influencer={list.find((item) => item.id === edit?.id)}
        target={edit?.target}
        uri={edit?.uri}
        onUpdated={handleInfluencerUpdated}
      />
    </PageShell>
  );
}
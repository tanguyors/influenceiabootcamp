import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Flame, Heart, Plus, Loader2, ExternalLink, Star, Filter, Search } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import SignedImage from "@/components/SignedImage";

const PLATFORMS = ["tiktok", "instagram", "youtube"];
const CATEGORIES = ["danse", "lifestyle", "humour", "beaute", "fitness", "mode", "food", "voyage", "tech"];
const PERIODS = [
  { value: "6h", label: "6 dernières heures" },
  { value: "12h", label: "12 dernières heures" },
  { value: "24h", label: "24 dernières heures" },
  { value: "7j", label: "7 derniers jours" },
];

import { DEMO_VIDEOS } from "@/lib/demoVideos";

function periodToMs(period) {
  const h = { "6h": 6, "12h": 12, "24h": 24 }[period];
  if (h) return h * 3600 * 1000;
  return 7 * 24 * 3600 * 1000;
}

function platformBadge(p) {
  const map = { tiktok: "TikTok", instagram: "Reels", youtube: "Shorts" };
  return map[p] || p;
}

export default function ViralLibrary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState(null);
  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [period, setPeriod] = useState("7j");
  const [q, setQ] = useState("");
  const [favorites, setFavorites] = useState(() => new Set(JSON.parse(localStorage.getItem("influenceia.favs") || "[]")));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", platform: "tiktok", source_url: "", category: "lifestyle", thumbnailFile: null, thumbnailPreview: "", videoFile: null });

  async function load() {
    try {
      const page = await base44.entities.ViralVideo.filter({}, { sort: "-published_date", limit: 100 });
      setItems(page.items || []);
    } catch (e) {
      setItems([]);
    }
  }
  useEffect(() => { load(); }, []);

  function toggleFav(id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("influenceia.favs", JSON.stringify([...next]));
      return next;
    });
  }

  const real = items || [];
  const onlyFav = false;

  const filtered = useMemo(() => {
    const all = [...real, ...DEMO_VIDEOS];
    const cutoff = Date.now() - periodToMs(period);
    return all.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (platform !== "all" && v.platform !== platform) return false;
      if (q && !(v.title || "").toLowerCase().includes(q.toLowerCase())) return false;
      if (new Date(v.published_date).getTime() < cutoff) return false;
      return true;
    });
  }, [real, category, platform, period, q]);

  async function onThumb(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((s) => ({ ...s, thumbnailFile: f, thumbnailPreview: URL.createObjectURL(f) }));
  }

  function onVideo(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((s) => ({ ...s, videoFile: f }));
  }

  async function saveManual() {
    if (!form.title.trim() || !form.source_url.trim()) {
      toast({ title: "Titre et lien requis", variant: "destructive" });
      return;
    }
    try {
      let thumb = "";
      if (form.thumbnailFile) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: form.thumbnailFile });
        thumb = file_uri;
      }
      let videoUri = "";
      if (form.videoFile) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: form.videoFile });
        videoUri = file_uri;
      }
      const created = await base44.entities.ViralVideo.create({
        title: form.title.trim(),
        platform: form.platform,
        source_url: form.source_url.trim(),
        category: form.category,
        thumbnail_url: thumb,
        video_file_uri: videoUri,
        published_date: new Date().toISOString(),
        is_manual: true,
        is_demo: false,
      });
      setItems((s) => [created, ...(s || [])]);
      setOpen(false);
      setForm({ title: "", platform: "tiktok", source_url: "", category: "lifestyle", thumbnailFile: null, thumbnailPreview: "", videoFile: null });
      toast({ title: "Référence ajoutée" });
    } catch (e) {
      toast({ title: "Ajout impossible", description: e.message, variant: "destructive" });
    }
  }

  return (
    <PageShell
      title="Vidéos virales"
      subtitle="Bibliothèque de références ayant percé sur TikTok, Reels et Shorts. Importez vos propres références ou utilisez les exemples signalés pour démarrer."
      actions={
        <Button onClick={() => setOpen(true)} className="bg-black text-white hover:bg-black/85">
          <Plus className="mr-2 h-4 w-4" /> Importer une référence
        </Button>
      }
    >
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-black/10 bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Plateforme" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes plateformes</SelectItem>
            {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{platformBadge(p)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {items === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-black/30" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Flame} title="Aucune référence" description="Ajustez les filtres ou importez une référence manuellement." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <div key={v.id} className="group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white">
              <div className="relative aspect-[9/16] max-h-[280px] bg-black/5">
                {v.thumbnail_url ? (
                  <SignedImage src={v.thumbnail_url} className="h-full w-full" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-black/5 to-black/10">
                    <Flame className="h-8 w-8 text-black/20" />
                  </div>
                )}
                <div className="absolute left-2 top-2 flex gap-1.5">
                  <span className="rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-medium text-white">{platformBadge(v.platform)}</span>
                  {v.is_demo && <span className="rounded-md bg-amber-400/90 px-2 py-0.5 text-[11px] font-medium text-amber-900">Démo</span>}
                </div>
                <button onClick={() => toggleFav(v.id)} className="absolute right-2 top-2 rounded-md bg-white/80 p-1.5 text-black/50 hover:text-red-500">
                  <Heart className={`h-4 w-4 ${favorites.has(v.id) ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 font-heading text-sm font-semibold tracking-tight">{v.title}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-black/45">
                  <span>{new Date(v.published_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                  <span className="rounded bg-black/5 px-1.5 py-0.5">{v.category}</span>
                  <span className={`rounded px-1.5 py-0.5 ${v.video_file_uri ? "bg-green-100 text-green-800" : "bg-black/5 text-black/45"}`}>
                    {v.video_file_uri ? "Vidéo source" : "Lien seul"}
                  </span>
                  {v.stats?.views != null && <span>{v.stats.views} vues</span>}
                </div>
                <div className="mt-auto flex items-center gap-2 pt-4">
                  <Button onClick={() => navigate(`/recreer?video=${v.id}`)} className="flex-1 bg-black text-white hover:bg-black/85">
                    Recréer avec mon influenceur
                  </Button>
                  <a href={v.source_url} target="_blank" rel="noreferrer" className="rounded-lg border border-black/15 p-2 text-black/60 hover:bg-black/5">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Importer une référence</DialogTitle></DialogHeader>
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
                  <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{platformBadge(p)}</SelectItem>)}</SelectContent>
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
              <Label htmlFor="rurl">Lien de la publication</Label>
              <Input id="rurl" value={form.source_url} onChange={(e) => setForm((s) => ({ ...s, source_url: e.target.value }))} placeholder="https://…" />
            </div>
            <div>
              <Label>Vignette (optionnel)</Label>
              <div className="flex items-center gap-3">
                {form.thumbnailPreview && <img src={form.thumbnailPreview} alt="" className="h-16 w-16 rounded-lg object-cover" />}
                <Input type="file" accept="image/*" onChange={onThumb} />
              </div>
              <p className="mt-1 text-xs text-black/45">La vignette est stockée de façon privée (stored privately).</p>
            </div>
            <div>
              <Label>Vidéo source mp4 (requise pour recréer)</Label>
              <div className="flex items-center gap-3">
                <Input type="file" accept="video/mp4" onChange={onVideo} />
                {form.videoFile && <span className="text-xs font-medium text-green-700">{form.videoFile.name}</span>}
              </div>
              <p className="mt-1 text-xs text-black/45">Le transfert de mouvement reprend le mouvement de ce fichier (4 à 30 s). Il est stocké de façon privée (stored privately).</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={saveManual} className="bg-black text-white hover:bg-black/85">Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
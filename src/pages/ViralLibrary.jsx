import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Flame, Loader2, Plus, Search } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import ReferenceCard from "@/components/library/ReferenceCard";
import ReferenceFormDialog from "@/components/library/ReferenceFormDialog";
import Base44Logo from "@/components/Base44Logo";

const PERIODS = [
  { value: "6h", label: "6 dernières heures" },
  { value: "12h", label: "12 dernières heures" },
  { value: "24h", label: "24 dernières heures" },
  { value: "7j", label: "7 derniers jours" },
  { value: "all", label: "Toutes périodes" },
];

function periodToMs(period) {
  if (period === "all") return Number.POSITIVE_INFINITY;
  const h = { "6h": 6, "12h": 12, "24h": 24 }[period];
  if (h) return h * 3600 * 1000;
  return 7 * 24 * 3600 * 1000;
}

export default function ViralLibrary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState(null);
  const [period, setPeriod] = useState("all");
  const [q, setQ] = useState("");
  const [favorites, setFavorites] = useState(() => new Set(JSON.parse(localStorage.getItem("influenceia.favs") || "[]")));
  const [open, setOpen] = useState(false);
  const [attachingId, setAttachingId] = useState("");

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

  // Le fichier mp4 est stocké de façon privée (stored privately) : il sert au transfert de mouvement.
  async function attachSource(video, file) {
    setAttachingId(video.id);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.ViralVideo.update(video.id, { video_file_uri: file_uri });
      setItems((s) => (s || []).map((v) => (v.id === video.id ? { ...v, video_file_uri: file_uri } : v)));
      toast({ title: "Vidéo source ajoutée", description: "Le cadre et le mouvement de ce modèle seront repris." });
    } catch (e) {
      toast({ title: "Ajout impossible", description: e.message, variant: "destructive" });
    } finally {
      setAttachingId("");
    }
  }

  const filtered = useMemo(() => {
    const cutoff = Date.now() - periodToMs(period);
    return (items || []).filter((v) => {
      if (q && !(v.title || "").toLowerCase().includes(q.toLowerCase())) return false;
      if (new Date(v.published_date).getTime() < cutoff) return false;
      return true;
    });
  }, [items, period, q]);

  const addButton = (
    <Button onClick={() => setOpen(true)} className="font-semibold">
      <Plus className="mr-2 h-4 w-4" /> Ajouter un modèle
    </Button>
  );

  return (
    <PageShell
      title="Banque de modèles"
      subtitle="Vos propres modèles vidéo : ajoutez les références à recréer, avec leur fichier mp4. Ce fichier permet de reprendre le cadre, la caméra et le mouvement de l'original."
      actions={addButton}
    >
      {/* Le plus puissant : l'IA repère ce qui buzz */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/15 p-1.5">
            <Base44Logo className="h-full w-full" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold tracking-tight">
              Le plus puissant : Base44 repère ce qui buzz en ce moment
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Demande à ton cerveau Base44 de trouver les vidéos qui font le buzz aujourd'hui, puis colle le lien ici : le modèle rejoint ta banque et ton stock grandit à chaque trouvaille.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="shrink-0">
          Coller un lien
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="pl-9" />
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {items === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        items.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="Votre banque est vide"
            description="Ajoutez vos propres modèles vidéo : titre et fichier mp4 pour reprendre le mouvement de la référence."
            action={addButton}
          />
        ) : (
          <EmptyState icon={Flame} title="Aucun modèle" description="Ajustez les filtres pour retrouver vos modèles." />
        )
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <ReferenceCard
              key={v.id}
              video={v}
              favorite={favorites.has(v.id)}
              onToggleFavorite={toggleFav}
              onRecreate={(item) => navigate(`/recreer?video=${item.id}`)}
              onAttachSource={attachSource}
              attaching={attachingId === v.id}
            />
          ))}
        </div>
      )}

      <ReferenceFormDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={(created) => setItems((s) => [created, ...(s || [])])}
      />
    </PageShell>
  );
}
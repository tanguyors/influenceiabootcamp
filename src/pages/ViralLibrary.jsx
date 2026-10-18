import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Flame, Loader2, Search } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import ReferenceCard from "@/components/library/ReferenceCard";
import LibraryImportCard from "@/components/library/LibraryImportCard";
import ModelsInstaller from "@/components/library/ModelsInstaller";
import Base44PromptCard from "@/components/Base44PromptCard";
import { promptGroup } from "@/lib/base44Prompts";
import { useI18n } from "@/lib/i18n";

const PERIODS = [
  { value: "6h", key: "library.period6h" },
  { value: "12h", key: "library.period12h" },
  { value: "24h", key: "library.period24h" },
  { value: "7j", key: "library.period7d" },
  { value: "all", key: "library.periodAll" },
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
  const { t, lang } = useI18n();
  const [items, setItems] = useState(null);
  const [period, setPeriod] = useState("all");
  const [q, setQ] = useState("");
  const [favorites, setFavorites] = useState(() => new Set(JSON.parse(localStorage.getItem("influenceia.favs") || "[]")));
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
      toast({ title: t("library.sourceAdded"), description: t("library.sourceAddedDesc") });
    } catch (e) {
      toast({ title: t("library.addFailed"), description: e.message, variant: "destructive" });
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

  return (
    <PageShell
      title={t("library.title")}
      subtitle={t("library.subtitle")}
    >
      <Base44PromptCard group={promptGroup("buzz", lang)} className="mb-6" />

      <LibraryImportCard
        title={t("library.add")}
        onCreated={(created) => setItems((s) => [created, ...(s || [])])}
      />

      {items && items.length === 0 && <ModelsInstaller onProgress={load} />}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("library.search")} className="pl-9" />
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{t(p.key)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {items === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        items.length === 0 ? (
          <EmptyState
            icon={Flame}
            title={t("library.emptyTitle")}
            description={t("library.emptyDesc")}
          />
        ) : (
          <EmptyState icon={Flame} title={t("library.noMatchTitle")} description={t("library.noMatchDesc")} />
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

    </PageShell>
  );
}
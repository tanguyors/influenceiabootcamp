import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Film, Loader2, Download, RefreshCw, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const STATUS = {
  draft: { label: "Brouillon", icon: Clock, cls: "text-black/50 bg-black/5" },
  pending: { label: "En file d'attente", icon: Clock, cls: "text-amber-700 bg-amber-100" },
  processing: { label: "Génération…", icon: Loader2, cls: "text-blue-700 bg-blue-100", spin: true },
  ready: { label: "Prête", icon: CheckCircle2, cls: "text-green-700 bg-green-100" },
  failed: { label: "Échec", icon: XCircle, cls: "text-red-700 bg-red-100" },
};

export default function Creations() {
  const { toast } = useToast();
  const [items, setItems] = useState(null);

  async function load() {
    try {
      const page = await base44.entities.Creation.filter({}, { sort: "-created_date", limit: 100 });
      setItems(page.items || []);
      // Interroge Higgsfield pour l'état réel des générations en cours.
      if ((page.items || []).some((c) => c.status === "processing" && c.higgsfield_job_id)) {
        const { checked } = (await base44.functions.invoke("generateVideo", { action: "refresh" })).data || {};
        if (checked) {
          const fresh = await base44.entities.Creation.filter({}, { sort: "-created_date", limit: 100 });
          setItems(fresh.items || []);
        }
      }
    } catch (e) {
      setItems([]);
    }
  }
  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  const list = items || [];

  return (
    <PageShell title="Mes créations" subtitle="Vidéos générées et générations en cours. L'état réel est conservé entre vos visites.">
      {items === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-black/30" /></div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Film}
          title="Aucune création"
          description="Choisissez une vidéo virale dans la bibliothèque, sélectionnez votre influenceur, puis lancez la génération."
        />
      ) : (
        <div className="space-y-4">
          {list.map((c) => {
            const st = STATUS[c.status] || STATUS.draft;
            const Icon = st.icon;
            return (
              <div key={c.id} className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-4 sm:flex-row">
                <div className="relative aspect-[9/16] w-full max-w-[140px] flex-none overflow-hidden rounded-lg bg-black/5">
                  {c.result_video_url && c.status === "ready" ? (
                    <video src={c.result_video_url} controls className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Icon className={`h-7 w-7 ${st.spin ? "animate-spin" : ""} text-black/30`} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                      <Icon className={`h-3 w-3 ${st.spin ? "animate-spin" : ""}`} /> {st.label}
                    </span>
                    <span className="text-xs text-black/40">{new Date(c.created_date).toLocaleString("fr-FR")}</span>
                  </div>
                  <h3 className="mt-2 font-heading text-base font-semibold tracking-tight">{c.prompt || "Génération"}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/50">
                    {c.model && <span>Modèle : {c.model}</span>}
                    {c.duration && <span>Durée : {c.duration}s</span>}
                    {c.aspect_ratio && <span>Format : {c.aspect_ratio}</span>}
                    {c.resolution && <span>Résolution : {c.resolution}</span>}
                    {c.is_upscaled && <span className="text-amber-600">mise à l'échelle</span>}
                  </div>
                  {c.error && <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600"><AlertCircle className="h-3.5 w-3.5" />{c.error}</p>}
                  <div className="mt-3 flex gap-2">
                    {c.result_video_url && c.status === "ready" && (
                      <a href={c.result_video_url} download className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5">
                        <Download className="h-3.5 w-3.5" /> Télécharger
                      </a>
                    )}
                    {c.status === "ready" && (
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Variante bientôt disponible" })}>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Créer une variante
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
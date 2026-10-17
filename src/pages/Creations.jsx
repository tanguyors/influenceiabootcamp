import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Film, Loader2, Download, RefreshCw, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Base44PromptCard from "@/components/Base44PromptCard";
import { promptGroup } from "@/lib/base44Prompts";
import { useI18n } from "@/lib/i18n";

const STATUS = {
  draft: { key: "creations.statusDraft", icon: Clock, cls: "text-muted-foreground bg-secondary" },
  pending: { key: "creations.statusPending", icon: Clock, cls: "text-amber-300 bg-amber-500/15" },
  processing: { key: "creations.statusProcessing", icon: Loader2, cls: "text-sky-300 bg-sky-500/15", spin: true },
  ready: { key: "creations.statusReady", icon: CheckCircle2, cls: "text-primary bg-primary/15" },
  failed: { key: "creations.statusFailed", icon: XCircle, cls: "text-red-300 bg-red-500/15" },
};

export default function Creations() {
  const { toast } = useToast();
  const { t, lang, locale } = useI18n();
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
    const timer = setInterval(load, 8000);
    return () => clearInterval(timer);
  }, []);

  const list = items || [];

  return (
    <PageShell title={t("creations.title")} subtitle={t("creations.subtitle")}>
      <Base44PromptCard group={promptGroup("textes", lang)} className="mb-6" />

      {items === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Film}
          title={t("creations.emptyTitle")}
          description={t("creations.emptyDesc")}
        />
      ) : (
        <div className="space-y-4">
          {list.map((c) => {
            const st = STATUS[c.status] || STATUS.draft;
            const Icon = st.icon;
            return (
              <div key={c.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row">
                <div className="relative aspect-[9/16] w-full max-w-[140px] flex-none overflow-hidden rounded-lg bg-secondary">
                  {c.result_video_url && c.status === "ready" ? (
                    <video src={c.result_video_url} controls className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Icon className={`h-7 w-7 ${st.spin ? "animate-spin" : ""} text-muted-foreground/70`} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                      <Icon className={`h-3 w-3 ${st.spin ? "animate-spin" : ""}`} /> {t(st.key)}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(c.created_date).toLocaleString(locale)}</span>
                  </div>
                  <h3 className="mt-2 font-heading text-base font-semibold tracking-tight">{c.prompt || t("creations.generation")}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {c.model && <span>{t("creations.model")} : {c.model}</span>}
                    {c.duration && <span>{t("creations.duration")} : {c.duration}s</span>}
                    {c.aspect_ratio && <span>{t("creations.format")} : {c.aspect_ratio}</span>}
                    {c.resolution && <span>{t("creations.resolution")} : {c.resolution}</span>}
                    {c.is_upscaled && <span className="text-amber-300">{t("creations.upscaled")}</span>}
                  </div>
                  {c.error && <p className="mt-2 flex items-center gap-1.5 text-xs text-red-300"><AlertCircle className="h-3.5 w-3.5" />{c.error}</p>}
                  <div className="mt-3 flex gap-2">
                    {c.result_video_url && c.status === "ready" && (
                      <a href={c.result_video_url} download className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary">
                        <Download className="h-3.5 w-3.5" /> {t("creations.download")}
                      </a>
                    )}
                    {c.status === "ready" && (
                      <Button variant="outline" size="sm" onClick={() => toast({ title: t("creations.variantSoon") })}>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> {t("creations.variant")}
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
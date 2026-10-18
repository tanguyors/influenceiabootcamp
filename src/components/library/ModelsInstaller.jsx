import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Les modèles de référence ne font pas partie des données livrées avec une copie de l'app :
// une nouvelle copie démarre avec une banque vide. Ce bloc repère les modèles manquants
// (vérification sans téléchargement) et les installe, par petits lots, avec leur vidéo source
// (stored privately).
const BATCH = 4;
const MAX_PASSES = 40;
const DONE_KEY = "influenceia.modelsInstalled";

export default function ModelsInstaller({ onProgress }) {
  const { t } = useI18n();
  const [state, setState] = useState({ phase: "hidden", done: 0, total: 0, failed: 0, error: "" });

  async function run() {
    setState((s) => ({ ...s, phase: "running", error: "" }));
    let failed = 0;
    let remaining = 0;
    try {
      for (let pass = 0; pass < MAX_PASSES; pass += 1) {
        const res = await base44.functions.invoke("importDriveModels", { limit: BATCH });
        const data = res.data || {};
        if (data.error) throw new Error(data.error);
        const total = Number(data.found) || 0;
        remaining = Number(data.remaining) || 0;
        failed += (data.failed || []).length;
        setState({ phase: "running", total, done: Math.max(0, total - remaining), failed, error: "" });
        onProgress?.();
        if (!remaining) break;
      }
      if (!remaining && !failed) localStorage.setItem(DONE_KEY, "1");
      setState((s) => ({ ...s, phase: "done" }));
    } catch (e) {
      setState((s) => ({
        ...s,
        phase: "done",
        error: e?.response?.data?.error || e?.response?.data?.message || e.message || "",
      }));
    } finally {
      onProgress?.();
    }
  }

  useEffect(() => {
    if (localStorage.getItem(DONE_KEY)) return;
    base44.functions
      .invoke("importDriveModels", { dry: true })
      .then((res) => {
        const remaining = Number(res.data?.remaining) || 0;
        if (!remaining) {
          localStorage.setItem(DONE_KEY, "1");
          return;
        }
        setState({ phase: "ready", total: Number(res.data?.found) || 0, done: 0, failed: 0, error: "" });
        run();
      })
      .catch(() => {});
  }, []);

  // Rien à installer (ou installé sans incident) : le bloc reste invisible.
  if (state.phase === "hidden") return null;
  if (state.phase === "done" && !state.failed && !state.error) return null;

  const running = state.phase === "running";
  const label = running
    ? state.total
      ? t("library.installRunning", { done: state.done, total: state.total })
      : t("library.installWorking")
    : t("library.installCta");

  return (
    <div className="mb-6 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-heading text-sm font-semibold tracking-tight">{t("library.installTitle")}</h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">{t("library.installDesc")}</p>
          {state.failed > 0 && (
            <p className="mt-1.5 text-xs text-amber-400">
              {t("library.installFailedCount", { count: state.failed })}
            </p>
          )}
          {state.error && <p className="mt-1.5 text-xs text-destructive">{state.error}</p>}
        </div>
        <Button onClick={run} disabled={running} className="font-semibold">
          {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {running ? label : t("library.installRetry")}
        </Button>
      </div>
    </div>
  );
}
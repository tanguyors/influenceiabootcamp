import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Les modèles de référence ne sont pas des données livrées avec la copie de l'app : une
// nouvelle copie démarre avec une banque vide. Ce bouton les installe une fois pour toutes.
const BATCH = 4;
const MAX_PASSES = 20;

export default function ModelsInstaller({ onProgress }) {
  const { t } = useI18n();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");

  async function install() {
    setRunning(true);
    setError("");
    setProgress({ done: 0, total: 0 });
    try {
      for (let pass = 0; pass < MAX_PASSES; pass += 1) {
        const res = await base44.functions.invoke("importDriveModels", { limit: BATCH });
        const data = res.data || {};
        if (data.error) throw new Error(data.error);
        const total = Number(data.found) || 0;
        const remaining = Number(data.remaining) || 0;
        setProgress({ total, done: Math.max(0, total - remaining) });
        onProgress?.();
        if (!remaining) break;
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || e.message || "");
    } finally {
      setRunning(false);
      onProgress?.();
    }
  }

  const label = running
    ? progress.total
      ? t("library.installRunning", progress)
      : t("library.installWorking")
    : t("library.installCta");

  return (
    <div className="mb-6 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-heading text-sm font-semibold tracking-tight">{t("library.installTitle")}</h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">{t("library.installDesc")}</p>
          {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        </div>
        <Button onClick={install} disabled={running} className="font-semibold">
          {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {label}
        </Button>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plug, Loader2, CheckCircle2, XCircle, Wrench, RefreshCw, ShieldCheck, ExternalLink } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function HiggsfieldConnection() {
  const { toast } = useToast();
  const [status, setStatus] = useState(null); // null | { connected, server_url, message }
  const [tools, setTools] = useState(null); // null | [] | error
  const [loading, setLoading] = useState(false);

  async function discover() {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("higgsfieldGateway", { action: "list_tools" });
      setStatus({ connected: true, server_url: res.server_url, message: res.message });
      setTools(res.tools || []);
    } catch (e) {
      setStatus({ connected: false, message: e.message || "Connexion impossible" });
      setTools([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { discover(); }, []);

  return (
    <PageShell title="Connexion Higgsfield" subtitle="Configuration sécurisée de votre serveur MCP Higgsfield. Les identifiants restent côté serveur et ne transitent jamais par votre navigateur.">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-black/60" />
              <h2 className="font-heading text-base font-semibold tracking-tight">État de la connexion</h2>
            </div>
            <div className="mt-4">
              {loading && status === null ? (
                <div className="flex items-center gap-2 text-sm text-black/50"><Loader2 className="h-4 w-4 animate-spin" /> Vérification…</div>
              ) : status?.connected ? (
                <div className="flex items-center gap-2 text-sm font-medium text-green-700"><CheckCircle2 className="h-5 w-5" /> Connecté</div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-red-600"><XCircle className="h-5 w-5" /> Non connecté</div>
              )}
              {status?.server_url && <p className="mt-2 break-all text-xs text-black/45">{status.server_url}</p>}
              {status?.message && !status?.connected && <p className="mt-2 text-xs leading-relaxed text-black/50">{status.message}</p>}
            </div>
            <Button onClick={discover} disabled={loading} variant="outline" className="mt-4 w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Actualiser
            </Button>
          </div>

          <div className="mt-4 rounded-xl border border-black/10 bg-white p-6">
            <h3 className="font-heading text-sm font-semibold tracking-tight">Configuration requise</h3>
            <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-black/60">
              <li><strong>1.</strong> Serveur MCP distant Higgsfield : <code className="rounded bg-black/5 px-1">https://mcp.higgsfield.ai/mcp</code></li>
              <li><strong>2.</strong> Une clé API Higgsfield (<code className="rounded bg-black/5 px-1">HIGGSFIELD_API_KEY</code>) définie comme secret serveur de l'application.</li>
              <li><strong>3.</strong> La passerelle serveur découvre automatiquement les outils disponibles.</li>
            </ol>
            <a href="https://higgsfield.ai/mcp" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-black underline">
              Documentation Higgsfield MCP <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Tools */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-black/60" />
              <h2 className="font-heading text-base font-semibold tracking-tight">Outils MCP disponibles</h2>
            </div>
            <p className="mt-1.5 text-xs text-black/50">Découverts automatiquement via <code className="rounded bg-black/5 px-1">tools/list</code>. Seuls les outils réellement exposés par votre serveur sont utilisés pour la génération.</p>

            <div className="mt-5">
              {tools === null ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-black/30" /></div>
              ) : tools.length === 0 ? (
                <div className="rounded-lg border border-dashed border-black/15 px-4 py-10 text-center">
                  <Plug className="mx-auto h-8 w-8 text-black/25" />
                  <p className="mt-3 text-sm text-black/50">Aucun outil découvert. Vérifiez que la clé API est configurée côté serveur.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tools.map((t) => (
                    <div key={t.name} className="rounded-lg border border-black/10 p-3">
                      <div className="font-mono text-xs font-semibold text-black">{t.name}</div>
                      {t.description && <p className="mt-1 text-xs leading-relaxed text-black/55">{t.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
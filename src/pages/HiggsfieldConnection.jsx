import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, XCircle, RefreshCw, ShieldCheck, Wrench, Plug, Link2, Unlink } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function HiggsfieldConnection() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [account, setAccount] = useState(null); // null | { connected, account, mcp_url }
  const [tools, setTools] = useState(null); // null | []
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  async function loadStatus() {
    try {
      const res = await base44.functions.invoke("higgsfieldConnect", { action: "status" });
      setAccount(res.data || { connected: false });
    } catch (e) {
      setAccount({ connected: false });
    }
  }

  async function loadTools() {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("higgsfieldGateway", {});
      const data = res.data || {};
      setAccount((s) => ({ ...(s || {}), connected: Boolean(data.connected), mcp_url: data.mcp_url }));
      setTools(data.tools || []);
      if (!data.connected && data.message) toast({ title: "Serveur MCP injoignable", description: data.message, variant: "destructive" });
    } catch (e) {
      setTools([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const done = searchParams.get("higgsfield");
    const failed = searchParams.get("higgsfield_error");
    if (done === "connected") {
      toast({ title: "Compte Higgsfield connecté" });
    } else if (failed) {
      toast({ title: "Connexion Higgsfield interrompue", description: failed.replace(/_/g, " "), variant: "destructive" });
    }
    if (done || failed) {
      searchParams.delete("higgsfield");
      searchParams.delete("higgsfield_error");
      setSearchParams(searchParams, { replace: true });
    }
    (async () => { await loadStatus(); await loadTools(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect() {
    setConnecting(true);
    try {
      const res = await base44.functions.invoke("higgsfieldConnect", { action: "start" });
      const authorizeUrl = res.data?.authorize_url;
      if (!authorizeUrl) throw new Error("Autorisation impossible à préparer");
      window.location.href = authorizeUrl;
    } catch (e) {
      toast({ title: "Connexion impossible", description: e.message, variant: "destructive" });
      setConnecting(false);
    }
  }

  async function disconnect() {
    setConnecting(true);
    try {
      await base44.functions.invoke("higgsfieldConnect", { action: "disconnect" });
      setTools([]);
      await loadStatus();
      toast({ title: "Compte Higgsfield déconnecté" });
    } catch (e) {
      toast({ title: "Déconnexion impossible", description: e.message, variant: "destructive" });
    } finally {
      setConnecting(false);
    }
  }

  return (
    <PageShell
      title="Connexion Higgsfield"
      subtitle="L'application utilise le serveur MCP Higgsfield avec votre propre compte. Aucune clé API n'est nécessaire : vous autorisez l'accès une fois, et les identifiants restent côté serveur."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compte */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-black/60" />
              <h2 className="font-heading text-base font-semibold tracking-tight">Mon compte</h2>
            </div>
            <div className="mt-4">
              {account === null ? (
                <div className="flex items-center gap-2 text-sm text-black/50"><Loader2 className="h-4 w-4 animate-spin" /> Vérification…</div>
              ) : account?.connected ? (
                <div className="flex items-center gap-2 text-sm font-medium text-green-700"><CheckCircle2 className="h-5 w-5" /> Connecté</div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-red-600"><XCircle className="h-5 w-5" /> Non connecté</div>
              )}
              {account?.connected && account?.account && (
                <p className="mt-2 text-xs text-black/60">Compte : <strong>{account.account}</strong></p>
              )}
              {account?.mcp_url && <p className="mt-2 break-all text-xs text-black/40">{account.mcp_url}</p>}
            </div>

            {account?.connected ? (
              <div className="mt-4 space-y-2">
                <Button onClick={loadTools} disabled={loading} variant="outline" className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Actualiser les outils
                </Button>
                <Button onClick={disconnect} disabled={connecting} variant="ghost" className="w-full text-black/60">
                  <Unlink className="mr-2 h-4 w-4" /> Déconnecter
                </Button>
              </div>
            ) : (
              <Button onClick={connect} disabled={connecting} className="mt-4 w-full bg-black text-white hover:bg-black/85">
                {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                {connecting ? "Redirection…" : "Connecter mon compte Higgsfield"}
              </Button>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-black/10 bg-white p-6">
            <h3 className="font-heading text-sm font-semibold tracking-tight">Comment ça marche</h3>
            <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-black/60">
              <li><strong>1.</strong> Vous êtes redirigé vers Higgsfield pour vous connecter et autoriser l'application.</li>
              <li><strong>2.</strong> Le serveur MCP Higgsfield devient accessible avec votre compte et votre offre en cours.</li>
              <li><strong>3.</strong> Les outils de génération disponibles sont détectés automatiquement — aucune clé API à créer.</li>
            </ol>
            <p className="mt-3 text-xs leading-relaxed text-black/45">Les jetons d'accès sont stockés côté serveur et ne sont jamais exposés au navigateur.</p>
          </div>
        </div>

        {/* Outils */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-black/60" />
              <h2 className="font-heading text-base font-semibold tracking-tight">Outils MCP disponibles</h2>
            </div>
            <p className="mt-1.5 text-xs text-black/50">
              Découverts automatiquement via <code className="rounded bg-black/5 px-1">tools/list</code>. La génération utilise les outils réellement exposés par votre compte.
            </p>

            <div className="mt-5">
              {tools === null ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-black/30" /></div>
              ) : tools.length === 0 ? (
                <div className="rounded-lg border border-dashed border-black/15 px-4 py-10 text-center">
                  <Plug className="mx-auto h-8 w-8 text-black/25" />
                  <p className="mt-3 text-sm text-black/50">
                    {account?.connected ? "Aucun outil retourné par le serveur MCP." : "Connectez votre compte Higgsfield pour découvrir les outils."}
                  </p>
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
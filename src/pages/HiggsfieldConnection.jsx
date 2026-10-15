import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, XCircle, RefreshCw, ShieldCheck, Wrench, Plug, Link2, Unlink, AlertCircle } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function HiggsfieldConnection() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [account, setAccount] = useState(null); // null | { connected, account, mcp_url }
  const [tools, setTools] = useState(null); // null | []
  const [balance, setBalance] = useState(null); // { credits, plan }
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
      setBalance(data.balance || null);
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
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-heading text-base font-semibold tracking-tight">Mon compte</h2>
            </div>
            <div className="mt-4">
              {account === null ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Vérification…</div>
              ) : account?.connected ? (
                <div className="flex items-center gap-2 text-sm font-medium text-primary"><CheckCircle2 className="h-5 w-5" /> Connecté</div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-red-400"><XCircle className="h-5 w-5" /> Non connecté</div>
              )}
              {account?.connected && account?.account && (
                <p className="mt-2 text-xs text-muted-foreground">Compte : <strong className="text-foreground">{account.account}</strong></p>
              )}
              {account?.mcp_url && <p className="mt-2 break-all text-xs text-muted-foreground/70">{account.mcp_url}</p>}
              {balance && (
                <p className={`mt-2 text-xs ${balance.credits > 0 ? "text-muted-foreground" : "text-amber-300"}`}>
                  Crédits Higgsfield : <strong className="text-foreground">{balance.credits}</strong>{balance.plan ? ` (offre ${balance.plan})` : ""}
                </p>
              )}
            </div>

            {account?.connected && balance && balance.credits === 0 && (
              <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-amber-400" />
                <p className="text-xs leading-relaxed text-amber-200/90">
                  Aucun crédit disponible : les générations vidéo échoueront. Rechargez votre compte Higgsfield, puis relancez une génération.
                </p>
              </div>
            )}

            {account?.connected ? (
              <div className="mt-4 space-y-2">
                <Button onClick={loadTools} disabled={loading} variant="outline" className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Actualiser les outils
                </Button>
                <Button onClick={disconnect} disabled={connecting} variant="ghost" className="w-full text-muted-foreground">
                  <Unlink className="mr-2 h-4 w-4" /> Déconnecter
                </Button>
              </div>
            ) : (
              <Button onClick={connect} disabled={connecting} className="mt-4 w-full font-semibold">
                {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                {connecting ? "Redirection…" : "Connecter mon compte Higgsfield"}
              </Button>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-6">
            <h3 className="font-heading text-sm font-semibold tracking-tight">Comment ça marche</h3>
            <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
              <li><strong className="text-foreground">1.</strong> Vous êtes redirigé vers Higgsfield pour vous connecter et autoriser l'application.</li>
              <li><strong className="text-foreground">2.</strong> Le serveur MCP Higgsfield devient accessible avec votre compte et votre offre en cours.</li>
              <li><strong className="text-foreground">3.</strong> Les outils de génération disponibles sont détectés automatiquement — aucune clé API à créer.</li>
            </ol>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">Les jetons d'accès sont stockés côté serveur et ne sont jamais exposés au navigateur.</p>
          </div>
        </div>

        {/* Outils */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-heading text-base font-semibold tracking-tight">Outils MCP disponibles</h2>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Découverts automatiquement via <code className="rounded bg-secondary px-1">tools/list</code>. La génération utilise les outils réellement exposés par votre compte.
            </p>

            <div className="mt-5">
              {tools === null ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : tools.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
                  <Plug className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {account?.connected ? "Aucun outil retourné par le serveur MCP." : "Connectez votre compte Higgsfield pour découvrir les outils."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tools.map((t) => (
                    <div key={t.name} className="rounded-lg border border-border p-3">
                      <div className="font-mono text-xs font-semibold text-foreground">{t.name}</div>
                      {t.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.description}</p>}
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
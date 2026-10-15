import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageShell from "@/components/PageShell";
import AccountSetupStep from "@/components/higgsfield/AccountSetupStep";
import ConnectionStep from "@/components/higgsfield/ConnectionStep";
import McpToolsCard from "@/components/higgsfield/McpToolsCard";
import { useToast } from "@/components/ui/use-toast";

// Lien d'affiliation utilisé à l'étape 1.
const AFFILIATE_URL = "https://higgsfield.ai?fpr=thibault-e42228";

export default function HiggsfieldConnection() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [account, setAccount] = useState(null); // null | { connected, account, mcp_url }
  const [tools, setTools] = useState(null); // null | []
  const [balance, setBalance] = useState(null); // { credits, plan }
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [accountCreated, setAccountCreated] = useState(null); // étape 1 : compte Higgsfield créé

  async function loadStatus() {
    try {
      const res = await base44.functions.invoke("higgsfieldConnect", { action: "status" });
      setAccount(res.data || { connected: false });
    } catch (e) {
      setAccount({ connected: false });
    }
  }

  // L'étape 1 est mémorisée sur le compte : la connexion reste bloquée tant qu'elle n'est pas faite.
  async function loadAccountCreated() {
    try {
      const me = await base44.auth.me();
      setAccountCreated(Boolean(me?.higgsfield_account_created));
    } catch (e) {
      setAccountCreated(false);
    }
  }

  async function openAccountCreation() {
    window.open(AFFILIATE_URL, "_blank", "noopener,noreferrer");
    if (accountCreated) return;
    setAccountCreated(true);
    try {
      await base44.auth.updateMe({ higgsfield_account_created: true });
    } catch (e) {
      // L'étape reste validée pour la session en cours.
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
    (async () => { await loadAccountCreated(); await loadStatus(); await loadTools(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect() {
    if (!accountCreated) {
      toast({ title: "Créez d'abord votre compte", description: "L'étape 1 doit être validée avant de connecter Higgsfield.", variant: "destructive" });
      return;
    }
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
      title="Setup Higgsfield"
      subtitle="Deux étapes : créez votre compte Higgsfield, puis connectez-le. L'application utilise ensuite le serveur MCP avec votre compte, sans clé API."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Setup en deux étapes */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <AccountSetupStep
              done={Boolean(account?.connected) || Boolean(accountCreated)}
              onOpen={openAccountCreation}
            />
            <ConnectionStep
              account={account}
              balance={balance}
              loading={loading}
              connecting={connecting}
              locked={accountCreated === null || !accountCreated}
              onConnect={connect}
              onDisconnect={disconnect}
              onRefresh={loadTools}
            />
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-6">
            <h3 className="font-heading text-sm font-semibold tracking-tight">Comment ça marche</h3>
            <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
              <li><strong className="text-foreground">1.</strong> Vous créez votre compte Higgsfield depuis notre lien.</li>
              <li><strong className="text-foreground">2.</strong> Vous autorisez l'application une seule fois, puis le serveur MCP devient accessible avec votre offre en cours.</li>
              <li><strong className="text-foreground">3.</strong> Les outils de génération disponibles sont détectés automatiquement — aucune clé API à créer.</li>
            </ol>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">Les jetons d'accès sont stockés côté serveur et ne sont jamais exposés au navigateur.</p>
          </div>
        </div>

        {/* Outils */}
        <div className="lg:col-span-2">
          <McpToolsCard tools={tools} connected={Boolean(account?.connected)} />
        </div>
      </div>
    </PageShell>
  );
}
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageShell from "@/components/PageShell";
import AccountSetupStep from "@/components/higgsfield/AccountSetupStep";
import ConnectionStep from "@/components/higgsfield/ConnectionStep";
import McpSetupGuide from "@/components/higgsfield/McpSetupGuide";
import { useToast } from "@/components/ui/use-toast";

// Lien d'affiliation utilisé à l'étape 1.
const AFFILIATE_URL = "https://higgsfield.ai?fpr=thibault-e42228";

export default function HiggsfieldConnection() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [account, setAccount] = useState(null); // null | { connected, account, mcp_url }
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

  // État du compte connecté : offre, crédits et URL du serveur MCP.
  async function refreshAccount() {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("higgsfieldGateway", {});
      const data = res.data || {};
      setAccount((s) => ({ ...(s || {}), connected: Boolean(data.connected), mcp_url: data.mcp_url }));
      setBalance(data.balance || null);
      if (!data.connected && data.message) toast({ title: "Serveur MCP injoignable", description: data.message, variant: "destructive" });
    } catch (e) {
      // L'état précédent reste affiché.
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
    (async () => { await loadAccountCreated(); await loadStatus(); await refreshAccount(); })();
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
      subtitle="Quatre étapes : créez votre compte Higgsfield (1), publiez l'application (2), ouvrez-la (3), puis connectez la connexion MCP (4). La connexion se termine depuis l'application publiée, hors Base44, et sans clé API."
    >
      <div className="space-y-5">
        <AccountSetupStep
          done={Boolean(account?.connected) || Boolean(accountCreated)}
          onOpen={openAccountCreation}
        />

        <McpSetupGuide className="space-y-5" />

        <ConnectionStep
          account={account}
          balance={balance}
          loading={loading}
          connecting={connecting}
          locked={accountCreated === null || !accountCreated}
          onConnect={connect}
          onDisconnect={disconnect}
          onRefresh={refreshAccount}
        />
      </div>

      <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground/80">
        <ShieldCheck className="h-4 w-4 flex-none" /> Les jetons d'accès sont stockés côté serveur et ne sont jamais
        exposés au navigateur.
      </p>
    </PageShell>
  );
}
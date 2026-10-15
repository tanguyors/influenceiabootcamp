import { AlertCircle, CheckCircle2, Link2, Loader2, RefreshCw, Unlink, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SetupStepCard from "@/components/higgsfield/SetupStepCard";

// Étape 2 : connexion du compte Higgsfield (OAuth) et suivi de l'état.
export default function ConnectionStep({ account, balance, loading, connecting, onConnect, onDisconnect, onRefresh }) {
  const connected = Boolean(account?.connected);

  return (
    <SetupStepCard
      num={2}
      done={connected}
      title="Connecter votre compte"
      text="Autorisez l'accès une fois : l'application travaille ensuite avec votre compte Higgsfield, sans clé API, et les identifiants restent côté serveur."
    >
      {account === null ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Vérification…
        </div>
      ) : connected ? (
        <>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <CheckCircle2 className="h-5 w-5" /> Connecté
          </div>
          {account.account && (
            <p className="mt-2 text-xs text-muted-foreground">
              Compte : <strong className="text-foreground">{account.account}</strong>
            </p>
          )}
          {account.mcp_url && <p className="mt-2 break-all text-xs text-muted-foreground/70">{account.mcp_url}</p>}
          {balance && (
            <p className={`mt-2 text-xs ${balance.credits > 0 ? "text-muted-foreground" : "text-amber-300"}`}>
              Crédits Higgsfield : <strong className="text-foreground">{balance.credits}</strong>
              {balance.plan ? ` (offre ${balance.plan})` : ""}
            </p>
          )}

          {balance && balance.credits === 0 && (
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-200/90">
                Aucun crédit disponible : les générations vidéo échoueront. Rechargez votre compte Higgsfield, puis relancez une génération.
              </p>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <Button onClick={onRefresh} disabled={loading} variant="outline" className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Actualiser les outils
            </Button>
            <Button onClick={onDisconnect} disabled={connecting} variant="ghost" className="w-full text-muted-foreground">
              <Unlink className="mr-2 h-4 w-4" /> Déconnecter
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm font-medium text-red-400">
            <XCircle className="h-5 w-5" /> Non connecté
          </div>
          <Button onClick={onConnect} disabled={connecting} className="mt-4 w-full font-semibold">
            {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
            {connecting ? "Redirection…" : "Connecter mon compte Higgsfield"}
          </Button>
        </>
      )}
    </SetupStepCard>
  );
}
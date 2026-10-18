import { AlertCircle, CheckCircle2, Link2, Loader2, Plug, RefreshCw, Unlink, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SetupStepCard from "@/components/higgsfield/SetupStepCard";

// Étape 2 : connexion du compte Higgsfield (OAuth) et suivi de l'état.
export default function ConnectionStep({ account, balance, loading, connecting, locked, onConnect, onDisconnect, onRefresh }) {
  const connected = Boolean(account?.connected);

  return (
    <SetupStepCard
      num={2}
      icon={Plug}
      done={connected}
      title="Connecter votre compte"
      text="Étape réservée aux comptes Higgsfield existants. Autorisez l'accès une fois : l'application travaille ensuite avec votre compte Higgsfield, sans clé API, et les identifiants restent côté serveur."
    >
      {account === null ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Vérification…
        </div>
      ) : connected ? (
        <>
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" /> Connecté
            </div>
            <dl className="mt-3 space-y-2 text-xs">
              {account.account && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Compte</dt>
                  <dd className="truncate font-medium text-foreground">{account.account}</dd>
                </div>
              )}
              {balance && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Crédits Higgsfield</dt>
                  <dd className={`font-semibold ${balance.credits > 0 ? "text-foreground" : "text-amber-300"}`}>
                    {balance.credits}
                    {balance.plan ? ` · offre ${balance.plan}` : ""}
                  </dd>
                </div>
              )}
            </dl>
            {account.mcp_url && (
              <p className="mt-3 break-all border-t border-border pt-3 text-[11px] text-muted-foreground/60">
                {account.mcp_url}
              </p>
            )}
          </div>

          {balance && balance.credits === 0 && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-200/90">
                Aucun crédit disponible : les générations vidéo échoueront. Rechargez votre compte Higgsfield, puis relancez une génération.
              </p>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <Button onClick={onRefresh} disabled={loading} variant="outline" className="h-11 w-full rounded-xl">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Actualiser l'état
            </Button>
            <Button onClick={onDisconnect} disabled={connecting} variant="ghost" className="w-full text-muted-foreground">
              <Unlink className="mr-2 h-4 w-4" /> Déconnecter
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <XCircle className="h-4 w-4 text-red-400" /> Non connecté
          </div>
          <Button onClick={onConnect} disabled={connecting || locked} className="mt-4 h-11 w-full rounded-xl font-semibold">
            {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
            {connecting ? "Redirection…" : "Connecter mon compte Higgsfield"}
          </Button>
          {locked ? (
            <p className="mt-3 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-center text-[11px] leading-relaxed text-muted-foreground">
              Terminez d'abord l'étape 1 : créez votre compte Higgsfield pour débloquer la connexion.
            </p>
          ) : (
            <p className="mt-3 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-center text-[11px] leading-relaxed text-muted-foreground">
              À faire depuis l'application publiée, hors de l'aperçu Base44.
            </p>
          )}
        </>
      )}
    </SetupStepCard>
  );
}
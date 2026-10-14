import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, XCircle, RefreshCw, ShieldCheck, ExternalLink, Wand2, AlertTriangle } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";

export default function HiggsfieldConnection() {
  const [status, setStatus] = useState(null); // null | { connected, message, api_base, engine, key_id }
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("higgsfieldGateway", { action: "status" });
      setStatus(res.data || {});
    } catch (e) {
      setStatus({ connected: false, message: e.message || "Vérification impossible." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { check(); }, []);

  return (
    <PageShell
      title="Connexion Higgsfield"
      subtitle="Cette application utilise l'API développeur Higgsfield (clé ID + secret). Les identifiants restent côté serveur et ne transitent jamais par votre navigateur."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Statut */}
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
              {status?.message && <p className="mt-2 text-xs leading-relaxed text-black/55">{status.message}</p>}
            </div>
            <Button onClick={check} disabled={loading} variant="outline" className="mt-4 w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Tester la connexion
            </Button>
          </div>

          <div className="mt-4 rounded-xl border border-black/10 bg-white p-6">
            <h3 className="font-heading text-sm font-semibold tracking-tight">Configuration requise</h3>
            <ol className="mt-3 space-y-3 text-xs leading-relaxed text-black/60">
              <li><strong>1.</strong> Créez un compte sur la console développeur Higgsfield et ajoutez un moyen de paiement (l'API est facturée à l'usage, séparément d'un abonnement higgsfield.ai).</li>
              <li><strong>2.</strong> Générez une clé API : vous obtenez un <em>key ID</em> et un <em>secret</em> (affiché une seule fois).</li>
              <li><strong>3.</strong> Ajoutez-les comme secrets de l'application, dans la page <strong>Secrets</strong> du tableau de bord : <code className="rounded bg-black/5 px-1">HIGGSFIELD_API_KEY_ID</code> et <code className="rounded bg-black/5 px-1">HIGGSFIELD_API_KEY_SECRET</code>.</li>
            </ol>
            <a href="https://console.higgsfield.ai/dashboard" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-black underline">
              Ouvrir la console Higgsfield <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Moteur */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-black/60" />
              <h2 className="font-heading text-base font-semibold tracking-tight">Moteur de génération</h2>
            </div>
            <p className="mt-1.5 text-xs text-black/50">
              Le transfert de mouvement de Higgsfield conserve le mouvement, le cadrage et le rythme de la vidéo source, et remplace le personnage par votre influenceur.
            </p>

            <div className="mt-5 space-y-2">
              <div className="rounded-lg border border-black/10 p-3">
                <div className="font-mono text-xs font-semibold text-black">Genjutsu — motion transfer</div>
                <p className="mt-1 text-xs leading-relaxed text-black/55">
                  Entrée : une vidéo source (4 à 30 s) et 1 à 8 images du personnage. Sortie : une vidéo qui reprend le mouvement de la source.
                </p>
              </div>
              <div className="rounded-lg border border-black/10 p-3">
                <div className="font-mono text-xs font-semibold text-black">{status?.api_base || "https://api.higgsfield.ai"}</div>
                <p className="mt-1 break-all text-xs leading-relaxed text-black/55">{status?.endpoint || "higgsfield/genjutsu/motion-transfer/v1.0"}</p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
              <div className="text-xs leading-relaxed text-amber-900">
                <p><strong>Coût :</strong> facturé à la seconde par Higgsfield, selon la résolution choisie. Le solde est en dollars et n'est pas couvert par une offre illimitée higgsfield.ai.</p>
                <p className="mt-1"><strong>Durée de conservation :</strong> les vidéos générées sont hébergées 7 jours par Higgsfield ; téléchargez-les pour les conserver.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
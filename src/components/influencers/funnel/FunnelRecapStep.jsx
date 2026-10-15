import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FunnelRecapStep({ traits, credits, ready, busy, onRefresh, onGenerate }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/40">Dernière étape</p>
      <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Prêt à lui donner vie ?
      </h2>

      {!ready ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-primary-foreground/50">
          <Loader2 className="h-4 w-4 animate-spin" /> Higgsfield prépare le personnage…
        </p>
      ) : (
        <>
          {traits.length ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {traits.map((t) => (
                <span key={t.group} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-primary-foreground/70">
                  {t.group} : {t.values}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-primary-foreground/55">
              Aucun trait imposé : Higgsfield compose votre star au hasard.
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Button
              onClick={onGenerate}
              disabled={busy !== ""}
              className="h-12 rounded-full bg-primary-foreground px-8 text-primary hover:bg-primary-foreground/90"
            >
              Générer mon influenceur
            </Button>
            <button
              type="button"
              onClick={onRefresh}
              disabled={busy !== ""}
              className="text-sm text-primary-foreground/45 underline-offset-4 transition hover:text-primary-foreground hover:underline"
            >
              Autre proposition
            </button>
            <span className="text-xs text-primary-foreground/40">
              {credits ? `${credits} crédit(s) Higgsfield estimé(s)` : "Coût communiqué par Higgsfield"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
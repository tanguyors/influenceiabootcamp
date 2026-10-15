import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FunnelRecapStep({ traits, credits, ready, busy, onRefresh, onGenerate }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Dernière étape</p>
      <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Prêt à lui donner vie ?
      </h2>

      {!ready ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Higgsfield prépare le personnage…
        </p>
      ) : (
        <>
          {traits.length ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {traits.map((t) => (
                <span key={t.group} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  {t.group} : {t.values}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              Aucun trait imposé : Higgsfield compose votre star au hasard.
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Button
              onClick={onGenerate}
              disabled={busy !== ""}
              className="h-12 rounded-full px-8 font-semibold"
            >
              Générer mon influenceur
            </Button>
            <button
              type="button"
              onClick={onRefresh}
              disabled={busy !== ""}
              className="text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
            >
              Autre proposition
            </button>
            <span className="text-xs text-muted-foreground/80">
              {credits ? `${credits} crédit(s) Higgsfield estimé(s)` : "Coût communiqué par Higgsfield"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
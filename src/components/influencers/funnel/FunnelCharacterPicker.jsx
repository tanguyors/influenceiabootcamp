import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignedImage from "@/components/SignedImage";

// Les 9 propositions de personnage, en trois familles : fidèle au brief, glamour, déjanté.
// Celle qui est retenue sert ensuite de modèle à la planche de référence.
export default function FunnelCharacterPicker({ options, value, onChange, busy, onConfirm }) {
  return (
    <div className="text-center">
      <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Choisissez votre personnage</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
        {options.length} propositions issues de votre parcours : trois fidèles à vos choix, trois version glamour, trois
        version déjantée. Sa planche de référence de 9 vues sera générée à partir de celle que vous retenez.
      </p>

      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
        {options.map((option) => {
          const selected = value === option.uri;
          return (
            <button
              key={option.uri}
              type="button"
              onClick={() => onChange(option.uri)}
              aria-pressed={selected}
              className={`relative overflow-hidden rounded-xl border transition ${
                selected ? "border-primary ring-2 ring-primary" : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <SignedImage src={option.uri} fittingType="fill" className="aspect-[3/4] w-full" />
              {option.style && (
                <span className="absolute inset-x-0 bottom-0 bg-background/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {option.style}
                </span>
              )}
              {selected && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Button onClick={onConfirm} disabled={!value || busy} className="mt-10 h-12 rounded-full px-8 font-semibold">
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Générer sa planche de référence
      </Button>
    </div>
  );
}
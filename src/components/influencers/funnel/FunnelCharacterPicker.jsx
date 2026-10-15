import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignedImage from "@/components/SignedImage";

// Les 9 propositions de personnage : celle qui est retenue sert ensuite de modèle à la planche.
export default function FunnelCharacterPicker({ options, value, onChange, busy, onConfirm }) {
  return (
    <div className="text-center">
      <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Choisissez votre personnage</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
        9 propositions issues de votre parcours. Sa planche de référence de 9 vues sera générée à partir de celle
        que vous retenez.
      </p>

      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
        {options.map((uri) => {
          const selected = value === uri;
          return (
            <button
              key={uri}
              type="button"
              onClick={() => onChange(uri)}
              aria-pressed={selected}
              className={`relative overflow-hidden rounded-xl border transition ${
                selected ? "border-primary ring-2 ring-primary" : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <SignedImage src={uri} fittingType="fill" className="aspect-[3/4] w-full" />
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
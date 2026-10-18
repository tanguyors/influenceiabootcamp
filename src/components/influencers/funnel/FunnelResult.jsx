import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignedImage from "@/components/SignedImage";

export default function FunnelResult({ images, name, phase = "sheet", saving, onSave }) {
  if (!images.length) {
    const proposing = phase === "options";
    return (
      <div className="py-24 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h2 className="mt-6 font-heading text-2xl font-semibold tracking-tight">
          {proposing ? "L'IA imagine 9 personnages" : `L'IA compose la planche de ${name || "votre star"}`}…
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {proposing
            ? "Vous choisirez celui qui vous plaît avant la planche finale."
            : "Une à deux minutes. Cette page se met à jour toute seule."}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Voici {name}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
        Ces planches deviennent ses photos de référence : plus il y en a, plus son visage reste fidèle d'une
        génération à l'autre.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {images.map((uri) => (
          <SignedImage
            key={uri}
            src={uri}
            fittingType="fit"
            className="h-72 w-56 rounded-2xl border border-border bg-secondary"
          />
        ))}
      </div>

      <Button
        onClick={onSave}
        disabled={saving}
        className="mt-10 h-12 rounded-full px-8 font-semibold"
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Enregistrer mon influenceur
      </Button>
    </div>
  );
}
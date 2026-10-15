import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignedImage from "@/components/SignedImage";

export default function FunnelResult({ images, name, saving, onSave }) {
  if (!images.length) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-foreground/50" />
        <h2 className="mt-6 font-heading text-2xl font-semibold tracking-tight">
          Higgsfield compose {name || "votre star"}…
        </h2>
        <p className="mt-2 text-sm text-primary-foreground/50">
          Une à deux minutes. Cette page se met à jour toute seule.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Voici {name}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/55">
        Ces planches deviennent ses photos de référence : plus il y en a, plus son visage reste fidèle d'une
        génération à l'autre.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {images.map((uri) => (
          <SignedImage
            key={uri}
            src={uri}
            fittingType="fit"
            className="h-72 w-56 rounded-2xl border border-white/15 bg-white/[0.04]"
          />
        ))}
      </div>

      <Button
        onClick={onSave}
        disabled={saving}
        className="mt-10 h-12 rounded-full bg-primary-foreground px-8 text-primary hover:bg-primary-foreground/90"
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Enregistrer mon influenceur
      </Button>
    </div>
  );
}
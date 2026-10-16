import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignedImage from "@/components/SignedImage";

// Personnage importé : sa photo entière, son portrait et son numéro, tels qu'ils ont été
// enregistrés dans le studio.
export default function BankImportResult({ influencer, already, onStart }) {
  return (
    <div className="rounded-xl border border-primary/40 bg-card p-5">
      <div className="flex flex-wrap gap-5">
        <div className="flex gap-3">
          <div className="w-28">
            <SignedImage
              src={influencer.reference_image}
              fittingType="fit"
              className="h-40 w-28 rounded-lg border border-border bg-secondary"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">Photo entière</p>
          </div>
          <div className="w-24">
            <SignedImage
              src={influencer.face_reference_image}
              fittingType="fill"
              className="h-32 w-24 rounded-lg border border-border bg-secondary"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">Portrait</p>
          </div>
        </div>

        <div className="min-w-[240px] flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {already ? "Votre personnage est déjà prêt" : "Votre personnage est prêt"}
          </p>
          <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight">{influencer.name}</h3>
          {influencer.source_character_id ? (
            <p className="mt-1 text-sm text-muted-foreground">N° {influencer.source_character_id}</p>
          ) : null}
          {influencer.notes ? (
            <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-muted-foreground">{influencer.notes}</p>
          ) : null}
          <Button onClick={onStart} className="mt-4 font-semibold">
            Créer ma première vidéo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
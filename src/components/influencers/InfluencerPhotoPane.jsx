import { Image as ImageIcon } from "lucide-react";
import SignedImage from "@/components/SignedImage";

// Un visuel de la carte d'un influenceur : la photo affichée en entier (jamais rognée)
// et son intitulé. La retouche IA travaille sur la paire, jamais sur une seule photo :
// aucun bouton ici, la carte n'a qu'une seule action de retouche.
export default function InfluencerPhotoPane({ uri, label, onSelect }) {
  return (
    <div onClick={onSelect} className="cursor-pointer bg-secondary">
      <div className="relative aspect-[3/4] bg-secondary">
        {uri ? (
          <SignedImage src={uri} fittingType="fit" className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground/50" /></div>
        )}
      </div>
      <div className="flex items-center gap-1 px-2 py-1.5">
        <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
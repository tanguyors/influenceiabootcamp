import { Image as ImageIcon, Wand2 } from "lucide-react";
import SignedImage from "@/components/SignedImage";
import { useI18n } from "@/lib/i18n";

// Un visuel de la carte d'un influenceur : la photo affichée en entier (jamais rognée),
// son intitulé, et la retouche par l'IA quand une photo est présente.
export default function InfluencerPhotoPane({ uri, label, onSelect, onModify }) {
  const { t } = useI18n();

  return (
    <div onClick={onSelect} className="cursor-pointer bg-secondary">
      <div className="relative aspect-[3/4] bg-secondary">
        {uri ? (
          <SignedImage src={uri} fittingType="fit" className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground/50" /></div>
        )}
      </div>
      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
        <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        {uri ? (
          <button
            type="button"
            title={t("influencers.editPhoto")}
            onClick={(event) => { event.stopPropagation(); onModify(); }}
            className="flex shrink-0 items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <Wand2 className="h-3 w-3" /> {t("influencers.editPhotoShort")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
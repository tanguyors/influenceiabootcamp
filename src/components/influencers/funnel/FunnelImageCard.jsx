import { useState } from "react";
import { cn } from "@/lib/utils";
import { Image as ContentImage } from "@/components/ui/image";
import { refImage } from "@/lib/funnelAssets";

// Carte illustrée du funnel de référence : visuel carré, coche et intitulé en bas.
// Les visuels en portrait (personnage entier) sont affichés en entier, jamais rognés.
export default function FunnelImageCard({ option, gender, selected, zoomed, onSelect }) {
  const [portrait, setPortrait] = useState(false);
  const src = refImage(option.image[0], option.image[1], gender);

  function measure(event) {
    const el = event.currentTarget;
    if (el.naturalWidth && el.naturalHeight) {
      setPortrait(Math.abs(el.naturalWidth / el.naturalHeight - 1) > 0.04);
    }
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative aspect-square overflow-hidden rounded-xl border-2 bg-secondary transition",
        selected ? "border-primary shadow-[0_0_0_1px_hsl(var(--primary))]" : "border-border hover:border-primary/35"
      )}
    >
      <span
        className={cn(
          "absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground transition",
          selected ? "opacity-100" : "opacity-0"
        )}
      >
        ✓
      </span>
      {src ? (
        <ContentImage
          src={src}
          alt={option.label}
          onLoad={measure}
          fittingType={portrait ? "fit" : "fill"}
          className={cn(
            "absolute inset-0 h-full w-full",
            portrait ? "object-contain" : "object-cover",
            zoomed && !portrait && "origin-[50%_38%] scale-[1.65]"
          )}
        />
      ) : null}
      <span className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 to-transparent px-1 pb-1 pt-4 text-center text-[11px] font-bold text-white">
        {option.label}
      </span>
    </button>
  );
}
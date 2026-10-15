import { Check } from "lucide-react";
import { Image } from "@/components/ui/image";
import { optionVisual } from "@/lib/influencerFunnel";

export default function FunnelChoiceCard({ option, groupId, gender, selected, onSelect }) {
  const { image } = optionVisual(groupId, option, gender);

  if (image) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`relative overflow-hidden rounded-2xl border text-left transition ${
          selected
            ? "border-primary ring-2 ring-primary"
            : "border-border hover:border-muted-foreground/40"
        }`}
      >
        <Image src={image} alt={option.label} fittingType="fill" className="aspect-[4/5] w-full object-cover object-top" />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-3 pt-10 text-sm font-medium leading-snug text-white">
          {option.label}
        </span>
        {selected && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition ${
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-card/50 text-foreground hover:border-muted-foreground/40 hover:bg-secondary"
      }`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-muted-foreground">
        {option.label.slice(0, 1).toUpperCase()}
      </span>
      <span className="text-sm font-medium leading-snug">{option.label}</span>
      {selected && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />}
    </button>
  );
}
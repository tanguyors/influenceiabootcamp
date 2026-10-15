import { Check } from "lucide-react";
import { optionVisual } from "@/lib/influencerFunnel";

export default function FunnelChoiceCard({ option, groupId, selected, onSelect }) {
  const { emoji, swatch } = optionVisual(groupId, option);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition ${
        selected
          ? "border-primary-foreground bg-primary-foreground text-primary"
          : "border-white/10 bg-white/[0.03] text-primary-foreground hover:border-white/30 hover:bg-white/[0.07]"
      }`}
    >
      {swatch ? (
        <span className="h-14 w-14 rounded-full ring-1 ring-inset ring-black/10" style={{ backgroundColor: swatch }} />
      ) : (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-3xl leading-none">
          {emoji}
        </span>
      )}
      <span className="text-sm font-medium leading-snug">{option.label}</span>
      {selected && <Check className="absolute right-3 top-3 h-4 w-4" />}
    </button>
  );
}
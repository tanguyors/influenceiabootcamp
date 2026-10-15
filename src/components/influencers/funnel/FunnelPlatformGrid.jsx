import { cn } from "@/lib/utils";
import PlatformMark from "@/components/influencers/funnel/PlatformMark";

export default function FunnelPlatformGrid({ options, selected, onPick }) {
  const chosen = Array.isArray(selected) ? selected : selected ? [selected] : [];

  return (
    <div className="mx-auto mt-6 grid w-full max-w-[380px] grid-cols-2 gap-2">
      {options.map((option) => {
        const on = chosen.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onPick(option.id)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-[1.5px] bg-secondary px-2 py-3 transition",
              on ? "border-primary shadow-[0_0_0_1px_hsl(var(--primary))]" : "border-border hover:border-primary/30"
            )}
          >
            <PlatformMark name={option.icon} />
            <span className="font-heading text-[13px] font-bold">{option.label}</span>
            <span className="text-[9px] font-semibold text-primary">{option.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
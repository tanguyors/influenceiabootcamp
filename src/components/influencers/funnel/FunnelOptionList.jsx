import { cn } from "@/lib/utils";
import StepIcon from "@/components/influencers/funnel/StepIcon";

export default function FunnelOptionList({ options, selected, onPick }) {
  const chosen = Array.isArray(selected) ? selected : selected ? [selected] : [];

  return (
    <div className="mx-auto mt-6 flex w-full max-w-[380px] flex-col gap-2">
      {options.map((option) => {
        const on = chosen.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onPick(option.id)}
            className={cn(
              "flex min-h-[64px] items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left transition",
              on ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-primary/35"
            )}
          >
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-background text-primary">
              <StepIcon name={option.icon} className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block font-heading text-base font-bold">{option.label}</span>
              {option.sub ? <span className="block text-[13px] text-muted-foreground">{option.sub}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
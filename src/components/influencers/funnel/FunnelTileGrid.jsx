import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import StepIcon from "@/components/influencers/funnel/StepIcon";
import FunnelNextButton from "@/components/influencers/funnel/FunnelNextButton";

// Étape « marques » : vignettes d'icônes + ajout de ses propres marques, comme le site de référence.
export default function FunnelTileGrid({ step, selected, custom, onPick, onAddCustom, onNext }) {
  const chosen = Array.isArray(selected) ? selected : [];
  const [value, setValue] = useState("");

  function add() {
    const text = value.trim();
    if (!text) return;
    onAddCustom(text);
    setValue("");
  }

  return (
    <div>
      <div className="mx-auto mt-6 grid w-full max-w-[400px] grid-cols-3 gap-2">
        {step.options.map((option) => {
          const on = chosen.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onPick(option.id)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 bg-secondary p-2 transition",
                on ? "border-primary shadow-[0_0_0_1px_hsl(var(--primary))]" : "border-border hover:border-primary/35"
              )}
            >
              <span
                className={cn(
                  "absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground transition",
                  on ? "opacity-100" : "opacity-0"
                )}
              >
                ✓
              </span>
              <StepIcon name={option.icon} className="h-6 w-6 text-primary" />
              <span className="text-center text-[11px] font-bold leading-tight">{option.label}</span>
            </button>
          );
        })}
      </div>

      {custom.length ? (
        <div className="mx-auto mt-3 flex max-w-[400px] flex-wrap justify-center gap-2">
          {custom.map((brand) => (
            <span key={brand} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
              {brand}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mx-auto mt-4 flex max-w-[400px] gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          placeholder="Vos propres marques"
          className="border-border bg-secondary placeholder:text-muted-foreground/60"
        />
        <button type="button" onClick={add} className="rounded-md border border-border px-3 text-sm text-muted-foreground transition hover:text-foreground">
          Ajouter
        </button>
      </div>

      <FunnelNextButton onClick={onNext} />
    </div>
  );
}
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import FunnelNextButton from "@/components/influencers/funnel/FunnelNextButton";
import { nameIdeas } from "@/lib/referenceFunnel";

const FIELD = "h-[52px] border-[1.5px] border-border bg-secondary text-center font-heading font-bold placeholder:font-body placeholder:font-normal placeholder:text-muted-foreground/60";

export default function FunnelNameStep({ gender, value, onChange, onNext }) {
  const [ideas, setIdeas] = useState(() => nameIdeas(gender));
  const ready = String(value.first || "").trim().length > 1;

  // Les idées de prénom suivent le genre choisi, y compris après un retour en arrière.
  useEffect(() => {
    setIdeas(nameIdeas(gender));
  }, [gender]);

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {ideas.map((idea) => {
          const [first, ...rest] = idea.split(" ");
          const last = rest.join(" ");
          const on = value.first === first && value.last === last;
          return (
            <button
              key={idea}
              type="button"
              onClick={() => onChange({ first, last })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {idea}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setIdeas(nameIdeas(gender))}
        className="mx-auto mt-3 block text-xs text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
      >
        Plus d'idées ↻
      </button>

      <p className="mt-6 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">ou le vôtre</p>

      <div className="mt-3 flex gap-2">
        <Input
          value={value.first || ""}
          onChange={(e) => onChange({ first: e.target.value })}
          placeholder="Prénom"
          maxLength={20}
          className={FIELD}
        />
        <Input
          value={value.last || ""}
          onChange={(e) => onChange({ last: e.target.value })}
          placeholder="Nom"
          maxLength={24}
          className={FIELD}
        />
      </div>

      <FunnelNextButton onClick={onNext} disabled={!ready} />
    </div>
  );
}
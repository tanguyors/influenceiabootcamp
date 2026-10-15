import FunnelChoiceCard from "@/components/influencers/funnel/FunnelChoiceCard";
import { stepHint } from "@/lib/influencerFunnel";
import { groupLabel } from "@/lib/influencerTraits";

export default function FunnelTraitStep({ group, selected, onSelect, onSkip }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary">{groupLabel(group)}</p>
      <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{stepHint(group)}</h2>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {group.options.map((o) => (
          <FunnelChoiceCard
            key={o.id}
            option={o}
            groupId={group.id}
            selected={selected === o.id}
            onSelect={() => onSelect(o.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="mt-8 text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
      >
        Laisser Higgsfield choisir
      </button>
    </div>
  );
}
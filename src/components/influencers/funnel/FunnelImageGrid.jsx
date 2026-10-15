import FunnelImageCard from "@/components/influencers/funnel/FunnelImageCard";
import FunnelNextButton from "@/components/influencers/funnel/FunnelNextButton";

export default function FunnelImageGrid({ step, gender, selected, onPick, onNext }) {
  const chosen = Array.isArray(selected) ? selected : selected ? [selected] : [];
  const zoomed = step.id === "q-feat" || step.id === "q-df";

  return (
    <div>
      <div className="mx-auto mt-6 grid w-full max-w-[400px] grid-cols-3 gap-2">
        {step.options.map((option) => (
          <FunnelImageCard
            key={option.id}
            option={option}
            gender={gender}
            zoomed={zoomed}
            selected={chosen.includes(option.id)}
            onSelect={() => onPick(option.id)}
          />
        ))}
      </div>

      {step.multi ? (
        <>
          <p className="mt-3 text-center text-[10px] font-bold text-primary">
            {chosen.length ? `${chosen.length} sélectionné(s)` : ""}
          </p>
          <FunnelNextButton disabled={!chosen.length} onClick={onNext} />
        </>
      ) : null}
    </div>
  );
}
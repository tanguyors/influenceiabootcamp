export default function FunnelStepHead({ index, total, step }) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
        {index + 1} / {total} — {step.section}
      </p>
      <h2 className="mx-auto mt-2 max-w-[340px] font-heading text-2xl font-extrabold leading-tight sm:text-3xl">
        {step.title}
      </h2>
      {step.hint ? (
        <p className="mx-auto mt-1 max-w-[340px] text-[13px] text-muted-foreground">{step.hint}</p>
      ) : null}
    </div>
  );
}
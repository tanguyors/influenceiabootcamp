export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-black/15 bg-white/50 px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/5">
          <Icon className="h-6 w-6 text-black/40" />
        </div>
      )}
      <h3 className="font-heading text-lg font-semibold tracking-tight text-black">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-black/50">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
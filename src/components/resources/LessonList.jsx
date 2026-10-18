// Liste numérotée d'un chapitre de la leçon : chaque point porte son intitulé, et sa raison d'être
// quand elle mérite d'être expliquée. `danger` marque les points qui font bannir un compte.
export default function LessonList({ title, lead, items }) {
  return (
    <section className="mb-12">
      <h3 className="font-heading text-xl font-semibold tracking-tight">{title}</h3>
      {lead && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{lead}</p>}
      <ol className="mt-5 space-y-3">
        {items.map((item, index) => (
          <li
            key={item.text}
            className={
              item.danger
                ? "flex gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4"
                : "flex gap-3 rounded-xl border border-border bg-card p-4"
            }
          >
            <span className={item.danger ? "mt-0.5 font-mono text-xs text-destructive" : "mt-0.5 font-mono text-xs text-muted-foreground/70"}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className={item.danger ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-foreground"}>
                {item.text}
              </p>
              {item.detail && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
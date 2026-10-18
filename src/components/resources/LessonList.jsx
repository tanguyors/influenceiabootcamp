import LessonChapterHead from "@/components/resources/LessonChapterHead";

// Chapitre en liste numérotée : chaque point porte son intitulé et, quand elle existe, sa raison d'être.
// `danger` marque les points qui font bannir un compte.
export default function LessonList({ id, ordinal, title, lead, items }) {
  return (
    <section id={id} className="scroll-mt-24">
      <LessonChapterHead ordinal={ordinal} title={title} lead={lead} />
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={item.text}
            className={
              item.danger
                ? "flex gap-3.5 rounded-xl border border-destructive/40 bg-destructive/5 p-5"
                : "flex gap-3.5 rounded-xl border border-border bg-card p-5"
            }
          >
            <span className={item.danger ? "mt-0.5 font-mono text-xs text-destructive" : "mt-0.5 font-mono text-xs text-muted-foreground/70"}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className={item.danger ? "text-[15px] font-semibold leading-snug text-destructive" : "text-[15px] font-semibold leading-snug text-foreground"}>
                {item.text}
              </p>
              {item.detail && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
// Titre d'un chapitre de leçon : un numéro discret, le titre, et l'intention du chapitre.
// `tone="danger"` réserve le rouge aux chapitres qui parlent des règles qui font bannir un compte.
export default function LessonChapterHead({ ordinal, title, lead, tone = "plain", icon: Icon }) {
  const danger = tone === "danger";
  return (
    <header className="mb-5">
      <span className={danger ? "font-mono text-xs text-destructive" : "font-mono text-xs text-muted-foreground/70"}>{ordinal}</span>
      <h3
        className={`mt-2 flex items-center gap-2.5 font-heading text-xl font-semibold tracking-tight ${
          danger ? "text-destructive" : "text-foreground"
        }`}
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" />}
        {title}
      </h3>
      {lead && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{lead}</p>}
    </header>
  );
}
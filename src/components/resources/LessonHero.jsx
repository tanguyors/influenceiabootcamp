import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";

// En-tête d'une leçon : le retour à la liste, le numéro, l'intention, puis le rappel des points rouges.
export default function LessonHero({ badge, backLabel, lesson }) {
  return (
    <header className="mb-12">
      <Link
        to="/ressources"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          {badge}
        </span>
        {lesson.tag && (
          <span className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground">{lesson.tag}</span>
        )}
      </div>

      <h2 className="mt-5 max-w-3xl font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{lesson.title}</h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{lesson.lead}</p>
      <p className="mt-6 flex max-w-2xl items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm font-medium leading-relaxed text-destructive">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        {lesson.redNote}
      </p>
    </header>
  );
}
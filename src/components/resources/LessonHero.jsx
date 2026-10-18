import { AlertTriangle } from "lucide-react";

// En-tête d'une leçon : son numéro, son titre, son intention, puis le rappel qui cadre tout le reste.
export default function LessonHero({ badge, lesson }) {
  return (
    <header className="mb-10">
      <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
        {badge}
      </span>
      <h2 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{lesson.title}</h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{lesson.lead}</p>
      <p className="mt-5 flex max-w-2xl items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm font-medium leading-relaxed text-destructive">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        {lesson.redNote}
      </p>
    </header>
  );
}
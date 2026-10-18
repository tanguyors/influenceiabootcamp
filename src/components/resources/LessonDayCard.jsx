import { AlertTriangle } from "lucide-react";
import CopyPromptRow from "@/components/CopyPromptRow";

// Une journée du plan : ce qu'on fait ce jour-là, la règle qui coûte le compte, et les phrases
// prêtes à recopier (bio, story) que l'élève adapte à son compte.
export default function LessonDayCard({ day }) {
  return (
    <article className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-secondary px-2.5 py-1 font-heading text-[11px] font-semibold uppercase tracking-wider text-foreground">
          {day.label}
        </span>
        <h4 className="font-heading text-lg font-semibold tracking-tight text-foreground">{day.title}</h4>
      </div>

      <div className="mt-4 space-y-2.5">
        {(day.body || []).map((line) => (
          <p key={line} className="text-sm leading-relaxed text-muted-foreground">{line}</p>
        ))}
      </div>

      {day.danger && (
        <div className="mt-4 flex gap-2.5 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">{day.danger.text}</p>
            {day.danger.detail && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{day.danger.detail}</p>}
          </div>
        </div>
      )}

      {day.examples && (
        <div className="mt-4 space-y-2">
          {day.examples.map((text) => <CopyPromptRow key={text} text={text} />)}
          {day.examplesNote && <p className="pt-1 text-xs leading-relaxed text-muted-foreground">{day.examplesNote}</p>}
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {(day.body2 || []).map((line) => (
          <p key={line} className="text-sm leading-relaxed text-muted-foreground">{line}</p>
        ))}
      </div>
    </article>
  );
}
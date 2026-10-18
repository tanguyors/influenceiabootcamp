import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Une leçon dans la liste : on l'ouvre pour lire la procédure complète.
export default function LessonCard({ lesson, content }) {
  const { t } = useI18n();

  return (
    <Link
      to={`/ressources/${lesson.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground/70">{lesson.code}</span>
        {content.tag && (
          <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{content.tag}</span>
        )}
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
        {content.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{content.excerpt}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        {t("resources.openLesson")}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
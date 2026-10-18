import PageShell from "@/components/PageShell";
import LessonCard from "@/components/resources/LessonCard";
import { LESSONS, lessonContent } from "@/lib/lessons";
import { useI18n } from "@/lib/i18n";

// La liste des leçons : elles s'ouvrent une par une, la première est le lancement TikTok en 7 jours.
export default function Resources() {
  const { t, lang } = useI18n();

  return (
    <PageShell title={t("resources.title")} subtitle={t("resources.subtitle")}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LESSONS.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} content={lessonContent(lesson, lang)} />
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground/70">{t("resources.more")}</p>
    </PageShell>
  );
}
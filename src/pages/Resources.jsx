import PageShell from "@/components/PageShell";
import LessonHero from "@/components/resources/LessonHero";
import LessonList from "@/components/resources/LessonList";
import LessonDayCard from "@/components/resources/LessonDayCard";
import LessonNeverRules from "@/components/resources/LessonNeverRules";
import LessonSummaryTable from "@/components/resources/LessonSummaryTable";
import { LESSONS, lessonContent } from "@/lib/lessons";
import { useI18n } from "@/lib/i18n";

export default function Resources() {
  const { t, lang } = useI18n();
  const lesson = LESSONS[0];
  const content = lessonContent(lesson, lang);

  return (
    <PageShell title={t("resources.title")} subtitle={t("resources.subtitle")}>
      <LessonHero badge={t("resources.lesson", { n: lesson.code })} lesson={content} />

      <LessonList title={content.setupTitle} items={content.setup} />

      <section className="mb-12">
        <h3 className="font-heading text-xl font-semibold tracking-tight">{content.weekTitle}</h3>
        <div className="mt-5 space-y-4">
          {content.days.map((day) => (
            <LessonDayCard key={day.label} day={day} />
          ))}
        </div>
      </section>

      <LessonList title={content.routineTitle} lead={content.routineLead} items={content.routine} />
      <LessonNeverRules title={content.neverTitle} items={content.never} />
      <LessonSummaryTable title={content.summaryTitle} head={content.summaryHead} rows={content.summary} />
    </PageShell>
  );
}
import { useParams } from "react-router-dom";
import LessonHero from "@/components/resources/LessonHero";
import LessonOutline from "@/components/resources/LessonOutline";
import LessonChapterHead from "@/components/resources/LessonChapterHead";
import LessonList from "@/components/resources/LessonList";
import LessonDayCard from "@/components/resources/LessonDayCard";
import LessonNeverRules from "@/components/resources/LessonNeverRules";
import LessonSummaryTable from "@/components/resources/LessonSummaryTable";
import { getLesson, lessonContent } from "@/lib/lessons";
import { useI18n } from "@/lib/i18n";

// Une leçon ouverte : le sommaire accompagne la lecture, les chapitres s'enchaînent dans l'ordre
// de la procédure, du premier jour jusqu'à l'aide-mémoire.
export default function Lesson() {
  const { lessonId } = useParams();
  const { t, lang } = useI18n();
  const lesson = getLesson(lessonId);
  const content = lessonContent(lesson, lang);

  const chapters = [
    { id: "avant", label: content.setupTitle },
    {
      id: "jours",
      label: content.weekTitle,
      children: content.days.map((day, index) => ({ id: `jour-${index}`, label: day.label })),
    },
    { id: "routine", label: content.routineTitle },
    { id: "interdits", label: content.neverTitle },
    { id: "memo", label: content.summaryTitle },
  ];

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <LessonHero badge={t("resources.lesson", { n: lesson.code })} backLabel={t("resources.all")} lesson={content} />

      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <LessonOutline title={t("resources.outline")} chapters={chapters} />

        <div className="max-w-3xl space-y-14">
          <LessonList id="avant" ordinal="01" title={content.setupTitle} items={content.setup} />

          <section id="jours" className="scroll-mt-24">
            <LessonChapterHead ordinal="02" title={content.weekTitle} />
            <ol className="mt-6 space-y-6">
              {content.days.map((day, index) => (
                <LessonDayCard
                  key={day.label}
                  id={`jour-${index}`}
                  day={day}
                  last={index === content.days.length - 1}
                />
              ))}
            </ol>
          </section>

          <LessonList id="routine" ordinal="03" title={content.routineTitle} lead={content.routineLead} items={content.routine} />
          <LessonNeverRules id="interdits" ordinal="04" title={content.neverTitle} items={content.never} />
          <LessonSummaryTable id="memo" ordinal="05" title={content.summaryTitle} head={content.summaryHead} rows={content.summary} />
        </div>
      </div>
    </div>
  );
}
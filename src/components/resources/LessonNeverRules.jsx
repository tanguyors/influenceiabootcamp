import { ShieldAlert } from "lucide-react";
import LessonChapterHead from "@/components/resources/LessonChapterHead";

// Le chapitre des règles qui coûtent le compte : encadré rouge, une règle par ligne.
export default function LessonNeverRules({ id, ordinal, title, items }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-destructive/40 bg-destructive/5 p-6">
      <LessonChapterHead ordinal={ordinal} title={title} tone="danger" icon={ShieldAlert} />
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
            <span className="text-sm leading-relaxed text-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
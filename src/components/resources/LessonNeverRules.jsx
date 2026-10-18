import { ShieldAlert } from "lucide-react";

// Les règles qui coûtent le compte, rappelées en rouge à la fin de la leçon.
export default function LessonNeverRules({ title, items }) {
  return (
    <section className="mb-12 rounded-xl border border-destructive/40 bg-destructive/5 p-6">
      <h3 className="flex items-center gap-2.5 font-heading text-xl font-semibold tracking-tight text-destructive">
        <ShieldAlert className="h-5 w-5" />
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
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
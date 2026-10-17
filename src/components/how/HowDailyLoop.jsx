import { Sunrise, MessageSquare, CalendarDays, Repeat } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const moments = [
  { key: "1", icon: Sunrise },
  { key: "2", icon: MessageSquare },
  { key: "3", icon: CalendarDays },
  { key: "4", icon: Repeat },
];

export default function HowDailyLoop() {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {moments.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.key} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Icon className="h-4 w-4" />
              {t(`how.loop${m.key}Time`)}
            </div>
            <h3 className="mt-3 font-heading text-base font-semibold tracking-tight">{t(`how.loop${m.key}Title`)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`how.loop${m.key}Desc`)}</p>
          </div>
        );
      })}
    </div>
  );
}
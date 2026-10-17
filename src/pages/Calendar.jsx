import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import CalendarGrid, { dayKey, monthCells } from "@/components/calendar/CalendarGrid";
import PostDetailDialog from "@/components/calendar/PostDetailDialog";
import Base44PromptCard from "@/components/Base44PromptCard";
import { promptGroup } from "@/lib/base44Prompts";
import { useI18n } from "@/lib/i18n";

export default function Calendar() {
  const { t, lang, locale } = useI18n();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [posts, setPosts] = useState(null);
  const [detail, setDetail] = useState(null);

  // Bornes du mois affiché (semaines complètes) : seuls les posts visibles sont lus.
  const range = useMemo(() => {
    const dates = monthCells(cursor.year, cursor.month).filter(Boolean);
    const last = dates[dates.length - 1];
    return {
      from: dayKey(dates[0]),
      to: dayKey(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)),
    };
  }, [cursor]);

  async function load() {
    try {
      const page = await base44.entities.ScheduledPost.filter(
        { scheduled_date: { $gte: range.from, $lt: range.to } },
        { sort: "scheduled_date", limit: 200 }
      );
      setPosts(page.items || []);
    } catch {
      setPosts([]);
    }
  }

  useEffect(() => {
    setPosts(null);
    load();
  }, [range.from, range.to]);

  function shift(step) {
    setCursor((current) => {
      const date = new Date(current.year, current.month + step, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(cursor.year, cursor.month, 1)),
    [cursor, locale]
  );

  return (
    <PageShell title={t("calendar.title")} subtitle={t("calendar.subtitle")}>
      <Base44PromptCard group={promptGroup("planning", lang)} className="mb-6" />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label={t("calendar.prevMonth")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label={t("calendar.nextMonth")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="font-heading text-lg font-semibold capitalize tracking-tight">
          {monthLabel} {cursor.year}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const now = new Date();
            setCursor({ year: now.getFullYear(), month: now.getMonth() });
          }}
        >
          {t("calendar.today")}
        </Button>
      </div>

      {posts === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <CalendarGrid
          year={cursor.year}
          month={cursor.month}
          posts={posts}
          onPickDay={(date) => setDetail({ date, posts: posts.filter((post) => post.scheduled_date === date) })}
          onPickPost={(post) => setDetail({ date: post.scheduled_date, posts: [post] })}
        />
      )}

      <PostDetailDialog
        open={!!detail}
        onOpenChange={(open) => !open && setDetail(null)}
        date={detail?.date}
        posts={detail?.posts || []}
      />
    </PageShell>
  );
}
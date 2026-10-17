import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import CalendarGrid, { dayKey, monthCells } from "@/components/calendar/CalendarGrid";
import PostComposer from "@/components/calendar/PostComposer";
import Base44PromptCard from "@/components/Base44PromptCard";
import { promptGroup } from "@/lib/base44Prompts";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export default function Calendar() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [posts, setPosts] = useState(null);
  const [draft, setDraft] = useState(null);

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

  const today = dayKey(new Date());

  return (
    <PageShell
      title="Calendrier"
      subtitle="Programmez les vidéos de vos créations : l'accroche, la légende et les hashtags sont rédigés à partir de la vidéo choisie."
      actions={
        <Button onClick={() => setDraft({ date: today })}>
          <Plus className="mr-1.5 h-4 w-4" /> Programmer un post
        </Button>
      }
    >
      <Base44PromptCard group={promptGroup("planning")} className="mb-6" />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Mois précédent">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Mois suivant">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="font-heading text-lg font-semibold capitalize tracking-tight">
          {MONTHS[cursor.month]} {cursor.year}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const now = new Date();
            setCursor({ year: now.getFullYear(), month: now.getMonth() });
          }}
        >
          Aujourd'hui
        </Button>
      </div>

      {posts === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <CalendarGrid
          year={cursor.year}
          month={cursor.month}
          posts={posts}
          onPickDay={(date) => setDraft({ date })}
          onPickPost={(post) => setDraft({ post })}
        />
      )}

      <PostComposer
        open={!!draft}
        onOpenChange={(open) => !open && setDraft(null)}
        post={draft?.post || null}
        date={draft?.date || today}
        onSaved={load}
      />
    </PageShell>
  );
}
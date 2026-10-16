import { cn } from "@/lib/utils";
import { platformOf } from "@/lib/postPlatforms";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Cases du mois affiché : lundi en premier, semaines complètes.
export function monthCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < (firstDay.getDay() + 6) % 7; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarGrid({ year, month, posts, onPickDay, onPickPost }) {
  const today = dayKey(new Date());

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-secondary/40">
        {WEEKDAYS.map((day) => (
          <div key={day} className="px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthCells(year, month).map((date, index) => {
          const key = date ? dayKey(date) : `vide-${index}`;
          const dayPosts = date ? posts.filter((post) => post.scheduled_date === key) : [];
          return (
            <div
              key={key}
              role={date ? "button" : undefined}
              tabIndex={date ? 0 : undefined}
              onClick={() => date && onPickDay(key)}
              className={cn(
                "min-h-[118px] border-b border-r border-border p-1.5 transition-colors",
                date ? "cursor-pointer hover:bg-secondary/40" : "bg-secondary/10"
              )}
            >
              {date && (
                <>
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      key === today ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {date.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayPosts.map((post) => {
                      const { Icon } = platformOf(post.platform);
                      return (
                        <button
                          key={post.id}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onPickPost(post);
                          }}
                          className={cn(
                            "flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-[11px] leading-tight transition-colors",
                            post.status === "published" ? "bg-primary/15 text-primary" : "bg-secondary text-foreground hover:bg-accent"
                          )}
                        >
                          <Icon className="h-3 w-3 flex-none" />
                          <span className="truncate">
                            {post.scheduled_time ? `${post.scheduled_time} · ` : ""}
                            {post.hook || post.influencer_name || "Post"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
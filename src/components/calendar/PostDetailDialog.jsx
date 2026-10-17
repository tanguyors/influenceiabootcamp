import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CopyPromptRow from "@/components/CopyPromptRow";
import { platformOf } from "@/lib/postPlatforms";
import { useI18n } from "@/lib/i18n";

function formatDay(value, locale, fallback) {
  if (!value) return fallback;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Lecture seule : on consulte ce qui est prévu, on ne remplit plus de formulaire.
export default function PostDetailDialog({ open, onOpenChange, date, posts }) {
  const { t, locale } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="capitalize">{formatDay(date, locale, t("calendar.publication"))}</DialogTitle>
        </DialogHeader>

        {posts.length === 0 ? (
          <p className="rounded-lg border border-border bg-secondary/40 p-3 text-sm leading-relaxed text-muted-foreground">
            {t("calendar.emptyDay")}
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const { Icon, label } = platformOf(post.platform);
              return (
                <div key={post.id} className="space-y-3 rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                    {post.scheduled_time && <span className="text-muted-foreground">· {post.scheduled_time}</span>}
                    <span
                      className={
                        post.status === "published"
                          ? "ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"
                          : "ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {post.status === "published" ? t("calendar.published") : t("calendar.planned")}
                    </span>
                  </div>

                  {post.influencer_name && (
                    <p className="text-xs text-muted-foreground">{t("calendar.character", { name: post.influencer_name })}</p>
                  )}

                  {post.video_url && (
                    <video
                      src={post.video_url}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="aspect-[9/16] w-32 rounded-lg border border-border object-cover"
                    />
                  )}

                  {post.hook && <CopyPromptRow text={post.hook} />}
                  {post.caption && <CopyPromptRow text={post.caption} />}
                  {post.hashtags && <CopyPromptRow text={post.hashtags} />}

                  {!post.hook && !post.caption && !post.hashtags && (
                    <p className="text-sm text-muted-foreground">{t("calendar.noText")}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
import { useRef } from "react";
import { ExternalLink, Film, Heart, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignedImage from "@/components/SignedImage";
import { platformLabel } from "@/lib/referenceOptions";


export default function ReferenceCard({ video, favorite, onToggleFavorite, onRecreate, onAttachSource, attaching }) {
  const fileRef = useRef(null);

  function pickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onAttachSource(video, file);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-[9/16] max-h-[280px] bg-secondary">
        {video.thumbnail_url ? (
          <SignedImage src={video.thumbnail_url} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-accent">
            <Film className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1.5">
          {video.platform ? <span className="rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-medium text-white">{platformLabel(video.platform)}</span> : null}
          {video.duration ? <span className="rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">{video.duration} s</span> : null}
        </div>
        <button onClick={() => onToggleFavorite(video.id)} className="absolute right-2 top-2 rounded-md bg-card/80 p-1.5 text-muted-foreground transition-colors hover:text-red-400">
          <Heart className={`h-4 w-4 ${favorite ? "fill-red-400 text-red-400" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-heading text-sm font-semibold tracking-tight">{video.title}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span>{new Date(video.published_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
          {video.category ? <span className="rounded bg-secondary px-1.5 py-0.5">{video.category}</span> : null}
          <span className={`rounded px-1.5 py-0.5 ${video.video_file_uri ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
            {video.video_file_uri ? "Vidéo source" : "Lien seul"}
          </span>
          {video.stats?.views != null && <span>{video.stats.views} vues</span>}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <Button onClick={() => onRecreate(video)} className="flex-1 font-semibold">
            Recréer avec mon influenceur
          </Button>
          {video.source_url && (
            <a href={video.source_url} target="_blank" rel="noreferrer" className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary">
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {!video.video_file_uri && (
          <>
            <Button variant="outline" size="sm" className="mt-2 w-full" disabled={attaching} onClick={() => fileRef.current?.click()}>
              {attaching ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
              {attaching ? "Envoi…" : "Ajouter la vidéo source"}
            </Button>
            <input ref={fileRef} type="file" accept="video/mp4" className="hidden" onChange={pickFile} />
          </>
        )}
      </div>
    </div>
  );
}
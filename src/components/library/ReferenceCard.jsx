import { useRef } from "react";
import { Film, Heart, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignedImage from "@/components/SignedImage";
import SignedVideo from "@/components/SignedVideo";


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
        {video.video_file_uri ? (
          <SignedVideo src={video.video_file_uri} className="h-full w-full object-cover" />
        ) : video.thumbnail_url ? (
          <SignedImage src={video.thumbnail_url} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-accent">
            <Film className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
        {video.duration ? (
          <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">{video.duration} s</span>
        ) : null}
        <button onClick={() => onToggleFavorite(video.id)} className="absolute right-2 top-2 rounded-md bg-card/80 p-1.5 text-muted-foreground transition-colors hover:text-red-400">
          <Heart className={`h-4 w-4 ${favorite ? "fill-red-400 text-red-400" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-heading text-sm font-semibold tracking-tight">{video.title}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {video.video_file_uri ? <span className="rounded bg-primary/15 px-1.5 py-0.5 text-primary">Vidéo source</span> : null}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <Button onClick={() => onRecreate(video)} className="flex-1 font-semibold">
            Recréer avec mon influenceur
          </Button>
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
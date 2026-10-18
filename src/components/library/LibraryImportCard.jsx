import { useState } from "react";
import { Link2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { readVideoDuration } from "@/lib/videoDuration";

// Plateformes acceptées par l'entité ViralVideo.
const PLATFORMS = ["tiktok", "instagram", "youtube"];

// Un seul champ suffit : le titre, la durée, la vignette et le fichier mp4 sont récupérés
// puis stockés de façon privée (stored privately), sans rien télécharger sur l'appareil.
export default function LibraryImportCard({ title, onCreated }) {
  const { toast } = useToast();
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function importModel() {
    if (busy) return;
    const url = link.trim();
    if (!/^https?:\/\//i.test(url)) {
      setError("Collez un lien complet (https://…).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("downloadViralVideo", { url });
      const data = res.data || {};
      if (data.error) throw new Error(data.error);

      // La durée n'est jamais saisie : elle vient de la source, sinon du fichier récupéré.
      let duration = Number(data.duration) || 0;
      if (!duration && data.video_file_uri) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: data.video_file_uri });
        if (signed_url) duration = (await readVideoDuration(signed_url)) || 0;
      }

      const created = await base44.entities.ViralVideo.create({
        title: data.title || "Modèle importé",
        duration: duration || undefined,
        thumbnail_url: data.thumbnail_url || "",
        video_file_uri: data.video_file_uri,
        source_url: url,
        platform: PLATFORMS.includes(data.platform) ? data.platform : undefined,
        published_date: new Date().toISOString(),
        is_manual: true,
        is_demo: false,
      });
      onCreated(created);
      setLink("");
      toast({ title: "Modèle ajouté", description: "Sa vignette et son fichier mp4 sont prêts pour la recréation." });
    } catch (e) {
      const payload = (e && e.response && e.response.data) || {};
      setError(payload.error || (e && e.message) || "Téléchargement impossible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Link2 className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Collez le lien de la vidéo : Instagram, TikTok, Facebook ou un lien direct .mp4. Le titre, la vignette et le
            fichier mp4 sont récupérés automatiquement.
          </p>
        </div>
      </div>

      <div className="mt-5 max-w-2xl">
        <Label htmlFor="model-link">Lien de la vidéo</Label>
        <div className="mt-1.5 flex flex-wrap gap-3">
          <Input
            id="model-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") importModel(); }}
            placeholder="https://www.instagram.com/reel/…"
            disabled={busy}
            className="min-w-[260px] flex-1"
          />
          <Button onClick={importModel} disabled={busy || !link.trim()} className="font-semibold">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importer le modèle
          </Button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          La vidéo est récupérée puis stockée de façon privée (stored privately), sans rien télécharger sur votre appareil.
        </p>
        {busy && <p className="mt-2 text-xs text-muted-foreground">Récupération de la vidéo… comptez 10 à 30 secondes.</p>}
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>
    </section>
  );
}
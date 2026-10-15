import { useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignedImage from "@/components/SignedImage";
import { readVideoDuration } from "@/lib/videoDuration";

// Récupère une vidéo depuis un lien (Instagram, TikTok, Facebook…) et la prépare pour la banque.
export default function VideoLinkField({ remote, onLoaded }) {
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
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
      onLoaded({ ...data, duration });
      setLink("");
    } catch (e) {
      const payload = (e && e.response && e.response.data) || {};
      setError(payload.error || (e && e.message) || "Téléchargement impossible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Label htmlFor="rlink">Télécharger depuis un lien</Label>
      <div className="flex items-center gap-2">
        <Input
          id="rlink"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://www.instagram.com/reel/…"
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={download} disabled={busy || !link.trim()} className="shrink-0">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Télécharger
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Instagram, TikTok ou Facebook. La vidéo est récupérée puis stockée de façon privée (stored privately), sans
        rien télécharger sur votre appareil.
      </p>

      {busy && <p className="mt-2 text-xs text-muted-foreground">Récupération de la vidéo… comptez 10 à 30 secondes.</p>}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      {remote && !busy && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-secondary p-3">
          {remote.thumbnail_url ? (
            <SignedImage src={remote.thumbnail_url} fittingType="fill" className="h-12 w-12 rounded-md" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-background">
              <Check className="h-4 w-4 text-primary" />
            </div>
          )}
          <div className="text-xs">
            <p className="font-medium text-primary">Vidéo prête à être ajoutée</p>
            <p className="text-muted-foreground">
              {remote.duration ? `Durée détectée : ${remote.duration} s` : "Durée non lue dans ce fichier"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
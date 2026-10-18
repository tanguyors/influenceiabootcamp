import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import SignedImage from "@/components/SignedImage";
import { signedUrlFor } from "@/lib/signedFiles";
import { useI18n } from "@/lib/i18n";
import { cardPhotosOf } from "@/lib/influencerPhotos";

// Retouche IA d'un personnage : la consigne s'applique à ses photos de référence
// (visage + plan en pied), qui sont toutes remplacées.
export default function PhotoEditDialog({ open, onOpenChange, influencer, onUpdated }) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);

  const photos = cardPhotosOf(influencer);
  // Les deux visuels du personnage, sans doublon si une seule photo existe.
  const targets = [{ role: "face", uri: photos.face }, { role: "body", uri: photos.body }]
    .filter((item, index, list) => item.uri && list.findIndex((other) => other.uri === item.uri) === index);

  async function submit() {
    const value = instruction.trim();
    if (!value) return;
    setBusy(true);
    try {
      const signed = await Promise.all(targets.map(async (item) => ({ ...item, url: await signedUrlFor(item.uri) })));
      const payload = signed.filter((item) => item.url);
      if (!payload.length) throw new Error(t("photoEdit.failed"));
      const res = await base44.functions.invoke("editInfluencerPhoto", {
        influencer_id: influencer.id,
        instruction: value,
        photos: payload,
      });
      const data = res.data || {};
      if (data.error) throw new Error(data.error);
      onUpdated(data.influencer);
      toast({ title: t("photoEdit.done") });
      setInstruction("");
      onOpenChange(false);
    } catch (e) {
      toast({ title: e.message || t("photoEdit.failed"), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  if (!influencer) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!busy) onOpenChange(value); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("photoEdit.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3">
          <div className="flex shrink-0 gap-2">
            {targets.map((item) => (
              <SignedImage key={item.uri} src={item.uri} fittingType="fit" className="h-28 w-20 rounded-lg border border-border bg-secondary" />
            ))}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {influencer.name} · {t("photoEdit.hint")}
          </p>
        </div>

        <Textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          rows={3}
          disabled={busy}
          placeholder={t("photoEdit.placeholder")}
        />

        <Button onClick={submit} disabled={busy || !instruction.trim()} className="font-semibold">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          {busy ? t("photoEdit.running") : t("photoEdit.submit")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
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

// Retouche d'une photo du personnage par l'IA : la photo actuelle sert de référence,
// la consigne décrit la modification souhaitée.
export default function PhotoEditDialog({ open, onOpenChange, influencer, target, uri, onUpdated }) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const text = instruction.trim();
    if (!text) return;
    setBusy(true);
    try {
      const photoUrl = await signedUrlFor(uri);
      if (!photoUrl) throw new Error(t("photoEdit.failed"));
      const res = await base44.functions.invoke("editInfluencerPhoto", {
        influencer_id: influencer.id,
        photo_uri: uri,
        photo_url: photoUrl,
        instruction: text,
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

  if (!influencer || !uri) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!busy) onOpenChange(value); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("photoEdit.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3">
          <SignedImage src={uri} fittingType="fit" className="h-32 w-24 shrink-0 rounded-lg border border-border bg-secondary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {influencer.name} · {target === "face" ? t("photoEdit.faceHint") : t("photoEdit.bodyHint")}
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
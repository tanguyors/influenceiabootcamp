import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Copy, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function InstagramBioPanel({ influencer, onUpdated }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState(influencer.instagram_bio || "");

  async function generate() {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke("generateInstagramBio", { influencer_id: influencer.id });
      if (!data?.instagram_bio) throw new Error(data?.error || "Génération impossible");
      setBio(data.instagram_bio);
      onUpdated({ ...influencer, instagram_bio: data.instagram_bio });
    } catch (e) {
      toast({ title: e.message || "Génération impossible", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(bio);
      toast({ title: "Bio copiée" });
    } catch (e) {
      toast({ title: "Copie impossible", variant: "destructive" });
    }
  }

  return (
    <div className="border-t border-border px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Bio Instagram</span>
        {bio ? (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={copy} className="h-7 px-2 text-[11px]">
              <Copy className="mr-1 h-3.5 w-3.5" /> Copier
            </Button>
            <Button size="sm" variant="ghost" onClick={generate} disabled={loading} className="h-7 px-2 text-[11px]">
              {loading ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 h-3.5 w-3.5" />} Régénérer
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={generate} disabled={loading} className="h-7 px-2 text-[11px] font-semibold">
            {loading ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />} Générer
          </Button>
        )}
      </div>
      {bio ? (
        <p className="whitespace-pre-line rounded-lg border border-border bg-secondary/50 p-3 text-xs leading-relaxed text-foreground">{bio}</p>
      ) : (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Une bio Instagram prête à coller, écrite depuis sa niche, son ton et son histoire.
        </p>
      )}
    </div>
  );
}
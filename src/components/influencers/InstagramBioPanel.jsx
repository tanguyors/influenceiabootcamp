import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Copy, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const LANGS = ["fr", "en"];

export default function InstagramBioPanel({ influencer, onUpdated }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("fr");
  const [bios, setBios] = useState({
    fr: influencer.instagram_bio || "",
    en: influencer.instagram_bio_en || "",
  });

  const bio = bios[lang];

  async function generate() {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke("generateInstagramBio", { influencer_id: influencer.id });
      const next = { fr: data?.instagram_bio || "", en: data?.instagram_bio_en || "" };
      if (!next.fr || !next.en) throw new Error(data?.error || "Génération impossible");
      setBios(next);
      onUpdated({ ...influencer, instagram_bio: next.fr, instagram_bio_en: next.en });
    } catch (e) {
      toast({ title: e.message || "Génération impossible", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(bio);
      toast({ title: lang === "fr" ? "Bio FR copiée" : "Bio EN copiée" });
    } catch (e) {
      toast({ title: "Copie impossible", variant: "destructive" });
    }
  }

  return (
    <div className="border-t border-border px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Bio Instagram</span>
          <div className="flex items-center rounded-full border border-border p-0.5">
            {LANGS.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors",
                  lang === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
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
          {bios.fr || bios.en
            ? "Cette version n'est pas encore écrite : lancez la génération pour l'avoir en français et en anglais."
            : "Une bio Instagram prête à coller, en français et en anglais, écrite depuis sa niche, son ton et son histoire."}
        </p>
      )}
    </div>
  );
}
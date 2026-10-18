import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { masterPrompt } from "@/lib/masterPrompt";

export default function MasterPromptCard({ className }) {
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState(false);
  const text = masterPrompt(lang);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={cn("rounded-xl border border-primary/25 bg-primary/5 p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/15">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight">{t("master.title")}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("master.intro")}</p>
          </div>
        </div>
        <Button onClick={copy} className="shrink-0 font-semibold">
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? t("common.copied") : t("master.copy")}
        </Button>
      </div>

      <Textarea
        readOnly
        value={text}
        rows={10}
        className="mt-4 resize-y font-mono text-[11px] leading-relaxed text-muted-foreground"
      />

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("master.note")}</p>
    </section>
  );
}
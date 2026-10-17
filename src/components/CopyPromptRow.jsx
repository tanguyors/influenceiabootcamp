import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyPromptRow({ text }) {
  const [copied, setCopied] = useState(false);

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
    <button
      type="button"
      onClick={copy}
      className="group flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-muted-foreground/40"
    >
      <span className="text-sm leading-relaxed text-foreground">{text}</span>
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-primary">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copié" : "Copier"}
      </span>
    </button>
  );
}
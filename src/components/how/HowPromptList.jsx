import { useState } from "react";
import { Copy, Check } from "lucide-react";

const prompts = [
  "Crée une bio TikTok de 3 lignes pour mon influenceur, ton direct et drôle.",
  "Quel est le meilleur jour et la meilleure heure pour poster cette semaine, et pourquoi ?",
  "Remplis mon calendrier avec 5 publications dans les 7 prochains jours.",
  "Écris 3 accroches différentes pour ma dernière vidéo générée.",
  "Propose-moi 5 idées de vidéos qui marchent en ce moment dans la niche de mon personnage.",
  "Garde mon personnage mais change le décor en studio néon pour la prochaine génération.",
];

export default function HowPromptList() {
  const [copied, setCopied] = useState(null);

  const copy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(index);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="space-y-2">
      {prompts.map((p, i) => (
        <button
          key={p}
          type="button"
          onClick={() => copy(p, i)}
          className="group flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-muted-foreground/40"
        >
          <span className="text-sm leading-relaxed text-foreground">{p}</span>
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-primary">
            {copied === i ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === i ? "Copié" : "Copier"}
          </span>
        </button>
      ))}
    </div>
  );
}
import { CheckCircle2 } from "lucide-react";

// Carte d'une étape du setup : numéro, titre, explication et contenu.
export default function SetupStepCard({ num, title, text, done, children }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold ${
            done ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
          }`}
        >
          {done ? <CheckCircle2 className="h-4 w-4" /> : num}
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
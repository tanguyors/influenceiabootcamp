import { Check, Loader2 } from "lucide-react";
import { IMPORT_STEPS } from "@/lib/bankImport";

// Étapes réellement effectuées pendant l'import : vérification du lien, récupération de la
// fiche, préparation des photos, personnage prêt.
export default function BankImportSteps({ current, failed = false }) {
  return (
    <ol className="mt-4 space-y-2">
      {IMPORT_STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        const broken = failed && active;
        return (
          <li key={label} className="flex items-center gap-2.5 text-sm">
            <span
              className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border text-[11px] font-semibold ${
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : broken
                    ? "border-destructive text-destructive"
                    : active
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : active && !broken ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : index + 1}
            </span>
            <span className={done || active ? "font-medium" : "text-muted-foreground"}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
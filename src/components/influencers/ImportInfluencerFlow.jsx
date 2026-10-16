import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import PhotoInfluencerForm from "@/components/influencers/PhotoInfluencerForm";
import InfluencerQuestionnaire from "@/components/influencers/InfluencerQuestionnaire";

const STEPS = ["Ses photos", "Son histoire"];

// Import d'un influenceur en deux temps : les photos, puis le petit questionnaire
// qui sert de brief pour écrire son histoire.
export default function ImportInfluencerFlow({ open, onClose, onSaved }) {
  const [step, setStep] = useState(0);
  const [influencer, setInfluencer] = useState(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setInfluencer(null);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground">
      <header className="flex items-start gap-4 px-5 pb-2 pt-5 sm:px-8">
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Import · {STEPS[step]}</p>
          <div className="mt-3 flex items-center gap-2">
            {STEPS.map((label, i) => (
              <span key={label} className="flex items-center gap-2 text-xs">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold ${i <= step ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={i <= step ? "font-semibold" : "text-muted-foreground"}>{label}</span>
                {i < STEPS.length - 1 && <span className="mx-1 h-[2px] w-6 rounded-full bg-border" />}
              </span>
            ))}
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: step === 0 ? "50%" : "100%" }} />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="mt-1 rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-20 pt-8 sm:px-8">
        <div className="mx-auto w-full max-w-2xl">
          {step === 0 ? (
            <>
              <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Importez votre influenceur</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Ajoutez ses photos de référence : visage de face, profil, plan large. Juste après, quelques questions rapides nous serviront à écrire son histoire.
              </p>
              <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <PhotoInfluencerForm
                  submitLabel="Importer cet influenceur"
                  onCreated={(created) => {
                    setInfluencer(created);
                    onSaved(created);
                    setStep(1);
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Un mot sur {influencer?.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Répondez à ces quelques questions et nous écrirons son histoire : ses origines, son parcours, sa communauté. Vous pourrez la relire et la modifier avant de l'enregistrer.
              </p>
              <div className="mt-6">
                <InfluencerQuestionnaire
                  influencer={influencer}
                  onSaved={(updated) => {
                    onSaved(updated);
                    onClose();
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
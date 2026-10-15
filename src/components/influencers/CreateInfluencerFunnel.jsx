import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import FunnelStepHead from "@/components/influencers/funnel/FunnelStepHead";
import FunnelImageGrid from "@/components/influencers/funnel/FunnelImageGrid";
import FunnelOptionList from "@/components/influencers/funnel/FunnelOptionList";
import FunnelTileGrid from "@/components/influencers/funnel/FunnelTileGrid";
import FunnelPlatformGrid from "@/components/influencers/funnel/FunnelPlatformGrid";
import FunnelNameStep from "@/components/influencers/funnel/FunnelNameStep";
import FunnelRecapStep from "@/components/influencers/funnel/FunnelRecapStep";
import FunnelResult from "@/components/influencers/funnel/FunnelResult";
import {
  funnelSteps,
  influencerBrief,
  referenceNotes,
  referenceTraits,
  stepGender,
} from "@/lib/referenceFunnel";

// Message lisible même quand le serveur renvoie une erreur HTTP (le texte utile est dans la réponse).
function errorText(e) {
  const data = (e && e.response && e.response.data) || null;
  return (data && (data.error || data.message)) || (e && e.message) || "Erreur inconnue";
}

export default function CreateInfluencerFunnel({ open, onClose, onCreated, onImportPhotos }) {
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState({});
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState({ first: "", last: "" });
  const [brief, setBrief] = useState("");
  const [sheets, setSheets] = useState(1);
  const [busy, setBusy] = useState("");
  const [images, setImages] = useState([]);

  // Chaque ouverture repart d'un parcours vierge.
  useEffect(() => {
    if (!open) return;
    setError(""); setIndex(0); setChoices({}); setBrands([]); setName({ first: "", last: "" });
    setBrief(""); setSheets(1); setBusy(""); setImages([]);
  }, [open]);

  const steps = useMemo(() => funnelSteps(choices), [choices]);
  const step = steps[Math.min(index, steps.length - 1)] || null;
  const gender = stepGender(choices);
  const fullName = `${name.first || ""} ${name.last || ""}`.trim();
  const running = busy === "start";

  function pick(stepId, optionId) {
    setChoices((s) => ({ ...s, [stepId]: optionId }));
    window.setTimeout(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), 240);
  }

  function toggle(stepId, optionId) {
    setChoices((s) => {
      const list = Array.isArray(s[stepId]) ? s[stepId] : [];
      return { ...s, [stepId]: list.includes(optionId) ? list.filter((id) => id !== optionId) : [...list, optionId] };
    });
  }

  function goNext() {
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  // Le personnage est généré par l'API OpenAI à partir de tous les choix du parcours.
  async function generate() {
    setBusy("start");
    setError("");
    try {
      const res = await base44.functions.invoke("generateInfluencerGpt", {
        brief: influencerBrief(choices, brief, brands, fullName),
        count: sheets,
      });
      const data = res.data || {};
      if (data.error) throw new Error(data.error);
      if (!(data.images || []).length) throw new Error("Aucune image renvoyée par OpenAI.");
      setImages(data.images);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  }

  async function save() {
    if (!fullName || !images.length) return;
    setBusy("save");
    setError("");
    try {
      const notes = [
        referenceNotes(choices, fullName, brief),
        brands.length ? `Marques citées : ${brands.join(", ")}` : "",
      ].filter(Boolean).join(" · ");
      const created = await base44.entities.Influencer.create({
        name: fullName,
        notes,
        reference_image: images[0],
        reference_images: images,
      });
      onCreated(created);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  }

  if (!open) return null;

  const total = steps.length || 1;
  const progress = images.length || running ? 100 : Math.round(((index + 1) / total) * 100);
  const canGoBack = index > 0 && !running && !images.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground">
      <header className="flex items-start gap-4 px-5 pb-2 pt-5 sm:px-8">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={!canGoBack}
          aria-label="Étape précédente"
          className="mt-1 rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-25"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-primary">
            <span>{running || images.length ? "Génération" : ""}</span>
            {onImportPhotos && !running && !images.length && (
              <button type="button" onClick={onImportPhotos} className="normal-case tracking-normal text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Importer mes photos
              </button>
            )}
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
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
        <div className="mx-auto w-full max-w-3xl">
          {!step ? (
            <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Préparation du parcours…
            </div>
          ) : running || images.length ? (
            <FunnelResult images={images} name={fullName} saving={busy === "save"} onSave={save} />
          ) : (
            <>
              <FunnelStepHead index={index} total={total} step={step} />

              {step.layout === "cards" && (
                <FunnelImageGrid
                  step={step}
                  gender={gender}
                  selected={choices[step.id]}
                  onPick={(id) => (step.multi ? toggle(step.id, id) : pick(step.id, id))}
                  onNext={goNext}
                />
              )}

              {step.layout === "list" && (
                <FunnelOptionList
                  options={step.options}
                  selected={choices[step.id]}
                  onPick={(id) => pick(step.id, id)}
                />
              )}

              {step.layout === "tiles" && (
                <FunnelTileGrid
                  step={step}
                  selected={choices[step.id]}
                  custom={brands}
                  onPick={(id) => toggle(step.id, id)}
                  onAddCustom={(text) => setBrands((list) => (list.includes(text) ? list : [...list, text]))}
                  onNext={goNext}
                />
              )}

              {step.layout === "platform" && (
                <FunnelPlatformGrid
                  options={step.options}
                  selected={choices[step.id]}
                  onPick={(id) => pick(step.id, id)}
                />
              )}

              {step.layout === "name" && (
                <FunnelNameStep
                  gender={gender}
                  value={name}
                  onChange={(patch) => setName((n) => ({ ...n, ...patch }))}
                  onNext={goNext}
                />
              )}

              {step.layout === "recap" && (
                <FunnelRecapStep
                  traits={referenceTraits(choices)}
                  busy={busy}
                  brief={brief}
                  sheets={sheets}
                  onChange={(patch) => {
                    if (patch.brief !== undefined) setBrief(patch.brief);
                    if (patch.sheets !== undefined) setSheets(patch.sheets);
                  }}
                  onGenerate={generate}
                />
              )}
            </>
          )}

          {error && <p className="mt-8 text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
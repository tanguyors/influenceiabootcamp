import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  higgsfieldBrief,
  higgsfieldSelection,
  referenceNotes,
  referenceTraits,
  stepGender,
} from "@/lib/referenceFunnel";

const POLL_MS = 5000;
const MAX_POLLS = 60;

// Message lisible même quand le serveur renvoie une erreur HTTP (le texte utile est dans la réponse).
function errorText(e) {
  const data = (e && e.response && e.response.data) || null;
  return (data && (data.error || data.message)) || (e && e.message) || "Erreur inconnue";
}

export default function CreateInfluencerFunnel({ open, onClose, onCreated, onImportPhotos }) {
  const [connected, setConnected] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState({});
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState({ first: "", last: "" });
  const [brief, setBrief] = useState("");
  const [sheets, setSheets] = useState(1);
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState("");
  const [jobId, setJobId] = useState("");
  const [images, setImages] = useState([]);
  const [engine, setEngine] = useState("higgsfield");

  // Chaque ouverture repart d'un parcours vierge.
  useEffect(() => {
    if (!open) return;
    setError(""); setIndex(0); setChoices({}); setBrands([]); setName({ first: "", last: "" });
    setBrief(""); setSheets(1); setQuote(null); setBusy(""); setJobId(""); setImages([]); setEngine("higgsfield");
  }, [open]);

  // Le parcours mène à Higgsfield : on vérifie la connexion avant de commencer.
  useEffect(() => {
    if (!open || connected !== null) return;
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("higgsfieldGateway", {});
        const data = res.data || {};
        if (!alive) return;
        if (data.connected) setConnected(true);
        else setLoadError(data.message || "Compte Higgsfield non connecté.");
      } catch (e) {
        if (alive) setLoadError(errorText(e));
      }
    })();
    return () => { alive = false; };
  }, [open, connected]);

  // Suivi de la génération : les planches sont copiées dans le stockage privé dès qu'elles sont prêtes.
  useEffect(() => {
    if (!jobId) return;
    let alive = true;
    let tries = 0;
    let timer;
    const tick = async () => {
      tries += 1;
      try {
        const res = await base44.functions.invoke("generateInfluencer", { action: "status", job_id: jobId });
        const data = res.data || {};
        if (!alive) return;
        if (data.error) { setError(data.error); setJobId(""); setBusy(""); return; }
        if ((data.images || []).length) { setImages(data.images); setJobId(""); setBusy(""); return; }
      } catch (e) {
        if (alive && tries > 3) { setError(errorText(e)); setJobId(""); setBusy(""); return; }
      }
      if (!alive) return;
      if (tries >= MAX_POLLS) { setError("Génération trop longue : relancez."); setJobId(""); setBusy(""); return; }
      timer = setTimeout(tick, POLL_MS);
    };
    timer = setTimeout(tick, POLL_MS);
    return () => { alive = false; clearTimeout(timer); };
  }, [jobId]);

  const steps = useMemo(() => funnelSteps(choices), [choices]);
  const step = steps[Math.min(index, steps.length - 1)] || null;
  const gender = stepGender(choices);
  const fullName = `${name.first || ""} ${name.last || ""}`.trim();
  const running = busy === "start" || busy === "poll" || Boolean(jobId);

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

  // Devis : Higgsfield compose le personnage et chiffre la génération sans rien dépenser.
  async function prepare() {
    setBusy("quote");
    setError("");
    setQuote(null);
    try {
      const selection = higgsfieldSelection(choices);
      const res = await base44.functions.invoke("generateInfluencer", {
        action: "quote",
        tier: "normal",
        // Tous les choix partent : en identifiant de trait quand Higgsfield en a un,
        // sinon en texte dans le brief.
        brief: higgsfieldBrief(choices, brief),
        batch_size: sheets,
        selection,
        // Tous les choix sont transmis : Higgsfield complète seulement ce qui n'a pas d'équivalent.
        randomize: Object.keys(selection).length === 0,
      });
      const data = res.data || {};
      if (data.error) throw new Error(data.error);
      setQuote({ params: data.params, credits: Number(data.credits) || 0, sheets, brief: brief.trim() });
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  }

  // Le devis est demandé dès l'arrivée sur la dernière étape, puis recalculé dès que la
  // description ou le nombre de planches change : Higgsfield reçoit toujours la version à jour.
  useEffect(() => {
    if (!open || !step || step.layout !== "recap" || !fullName) return;
    // Le moteur GPT n'a pas besoin de devis Higgsfield.
    if (engine === "gpt") return;
    if (quote && quote.sheets === sheets && quote.brief === brief.trim()) return;
    const timer = window.setTimeout(prepare, 600);
    return () => window.clearTimeout(timer);
  }, [open, step, quote, sheets, fullName, brief, engine]);

  // GPT (clé OpenAI de l'utilisateur) : une seule requête, aucune tâche à suivre.
  async function generateWithGpt() {
    setBusy("start");
    setError("");
    try {
      const res = await base44.functions.invoke("generateInfluencerGpt", {
        brief: higgsfieldBrief(choices, brief),
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

  async function generate() {
    if (engine === "gpt") return generateWithGpt();
    if (!quote) return;
    setBusy("start");
    setError("");
    try {
      const res = await base44.functions.invoke("generateInfluencer", {
        action: "start",
        params: quote.params,
        max_credits: Math.ceil(quote.credits) + 1,
      });
      const data = res.data || {};
      if (data.error) throw new Error(data.error);
      if ((data.images || []).length) { setImages(data.images); setBusy(""); return; }
      if (!data.job_id) throw new Error("Aucune tâche renvoyée par Higgsfield.");
      setJobId(data.job_id);
      setBusy("poll");
    } catch (e) {
      setError(errorText(e));
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
          {loadError ? (
            <div className="py-24 text-center">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">Higgsfield n'est pas connecté</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{loadError}</p>
              <Link to="/connexion" onClick={onClose} className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground">
                Connecter Higgsfield
              </Link>
            </div>
          ) : !step ? (
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
                  credits={quote && quote.credits}
                  engine={engine}
                  onEngineChange={setEngine}
                  ready={engine === "gpt" ? true : Boolean(quote)}
                  busy={busy}
                  brief={brief}
                  sheets={sheets}
                  onChange={(patch) => {
                    if (patch.brief !== undefined) setBrief(patch.brief);
                    if (patch.sheets !== undefined) setSheets(patch.sheets);
                  }}
                  onRefresh={prepare}
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
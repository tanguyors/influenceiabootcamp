import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import FunnelTraitStep from "@/components/influencers/funnel/FunnelTraitStep";
import FunnelDetailsStep from "@/components/influencers/funnel/FunnelDetailsStep";
import FunnelRecapStep from "@/components/influencers/funnel/FunnelRecapStep";
import FunnelResult from "@/components/influencers/funnel/FunnelResult";
import { orderedGroups } from "@/lib/influencerFunnel";
import { traitSummary, traitsOf } from "@/lib/influencerTraits";

const POLL_MS = 5000;
const MAX_POLLS = 60;

export default function CreateInfluencerFunnel({ open, onClose, onCreated, onImportPhotos }) {
  const [groups, setGroups] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState({});
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [sheets, setSheets] = useState(1);
  const [quote, setQuote] = useState(null);
  const [quoteTried, setQuoteTried] = useState(false);
  const [busy, setBusy] = useState("");
  const [jobId, setJobId] = useState("");
  const [images, setImages] = useState([]);

  // Chaque ouverture repart d'un parcours vierge.
  useEffect(() => {
    if (!open) return;
    setError(""); setIndex(0); setChoices({}); setName(""); setBrief(""); setSheets(1);
    setQuote(null); setQuoteTried(false); setBusy(""); setJobId(""); setImages([]);
  }, [open]);

  useEffect(() => {
    if (!open || groups) return;
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("generateInfluencer", { action: "options", tier: "normal" });
        const data = res.data || {};
        if (!alive) return;
        if (data.error) setLoadError(data.error);
        else setGroups(data.groups || []);
      } catch (e) {
        if (alive) setLoadError(e.message);
      }
    })();
    return () => { alive = false; };
  }, [open, groups]);

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
        if (alive && tries > 3) { setError(e.message); setJobId(""); setBusy(""); return; }
      }
      if (!alive) return;
      if (tries >= MAX_POLLS) { setError("Génération trop longue : relancez."); setJobId(""); setBusy(""); return; }
      timer = setTimeout(tick, POLL_MS);
    };
    timer = setTimeout(tick, POLL_MS);
    return () => { alive = false; clearTimeout(timer); };
  }, [jobId]);

  const steps = useMemo(() => {
    const traits = orderedGroups(groups || []).map((g) => ({ kind: "trait", group: g }));
    return [...traits, { kind: "details" }, { kind: "recap" }];
  }, [groups]);

  const step = steps[index] || null;
  const running = busy === "start" || busy === "poll" || Boolean(jobId);

  async function prepare() {
    setBusy("quote");
    setError("");
    setQuote(null);
    try {
      const selection = {};
      for (const [id, value] of Object.entries(choices)) if (value) selection[id] = [value];
      const res = await base44.functions.invoke("generateInfluencer", {
        action: "quote",
        tier: "normal",
        brief: brief.trim(),
        batch_size: sheets,
        selection,
        // Traits choisis : Higgsfield s'en tient là. Aucun choix : personnage complet au hasard.
        randomize: Object.keys(selection).length === 0,
      });
      const data = res.data || {};
      if (data.error) throw new Error(data.error);
      setQuote({ params: data.params, credits: Number(data.credits) || 0 });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }

  // Le devis est demandé dès l'arrivée sur le récapitulatif.
  useEffect(() => {
    if (!open || !step || step.kind !== "recap" || quote || quoteTried || !name.trim()) return;
    setQuoteTried(true);
    prepare();
  }, [open, step, quote, quoteTried, name]);

  async function generate() {
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
      setError(e.message);
      setBusy("");
    }
  }

  async function save() {
    if (!name.trim() || !images.length) return;
    setBusy("save");
    setError("");
    try {
      const created = await base44.entities.Influencer.create({
        name: name.trim(),
        notes: traitSummary(quote && quote.params, groups, brief),
        reference_image: images[0],
        reference_images: images,
      });
      onCreated(created);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }

  if (!open) return null;

  const total = steps.length || 1;
  const progress = images.length || running ? 100 : Math.round(((index + 1) / total) * 100);
  const traits = quote ? traitsOf(quote.params, groups) : [];
  const canGoBack = index > 0 && !running && !images.length;

  function selectOption(groupId, optionId) {
    setChoices((s) => ({ ...s, [groupId]: optionId }));
    window.setTimeout(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), 200);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-primary text-primary-foreground">
      <header className="flex items-start gap-4 px-5 pb-2 pt-5 sm:px-8">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={!canGoBack}
          aria-label="Étape précédente"
          className="mt-1 rounded-full p-2 text-primary-foreground/60 transition hover:bg-white/10 hover:text-primary-foreground disabled:opacity-25"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-primary-foreground/40">
            <span>{running || images.length ? "Génération" : `Étape ${index + 1} / ${total}`}</span>
            {onImportPhotos && !running && !images.length && (
              <button type="button" onClick={onImportPhotos} className="normal-case tracking-normal underline-offset-4 hover:text-primary-foreground hover:underline">
                Importer mes photos
              </button>
            )}
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-primary-foreground transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="mt-1 rounded-full p-2 text-primary-foreground/60 transition hover:bg-white/10 hover:text-primary-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-20 pt-8 sm:px-8">
        <div className="mx-auto w-full max-w-3xl">
          {loadError ? (
            <div className="py-24 text-center">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">Higgsfield n'est pas connecté</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/55">{loadError}</p>
              <Link to="/connexion" onClick={onClose} className="mt-6 inline-block rounded-full bg-primary-foreground px-8 py-3 text-sm font-medium text-primary">
                Connecter Higgsfield
              </Link>
            </div>
          ) : !step ? (
            <div className="flex items-center gap-3 py-24 text-sm text-primary-foreground/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Préparation du parcours…
            </div>
          ) : running || images.length ? (
            <FunnelResult images={images} name={name} saving={busy === "save"} onSave={save} />
          ) : step.kind === "trait" ? (
            <FunnelTraitStep
              group={step.group}
              selected={choices[step.group.id]}
              onSelect={(optionId) => selectOption(step.group.id, optionId)}
              onSkip={() => setIndex((i) => Math.min(i + 1, steps.length - 1))}
            />
          ) : step.kind === "details" ? (
            <FunnelDetailsStep
              name={name}
              brief={brief}
              sheets={sheets}
              onChange={(patch) => {
                if (patch.name !== undefined) setName(patch.name);
                if (patch.brief !== undefined) setBrief(patch.brief);
                if (patch.sheets !== undefined) setSheets(patch.sheets);
              }}
              onContinue={() => setIndex((i) => Math.min(i + 1, steps.length - 1))}
            />
          ) : (
            <FunnelRecapStep
              traits={traits}
              credits={quote && quote.credits}
              ready={Boolean(quote)}
              busy={busy}
              onRefresh={prepare}
              onGenerate={generate}
            />
          )}

          {error && <p className="mt-8 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
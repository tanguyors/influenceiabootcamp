import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { storyQuizQuestions } from "@/lib/influencerStoryQuiz";

// Message lisible même quand le serveur renvoie une erreur HTTP (le texte utile est dans la réponse).
function errorText(e) {
  const data = (e && e.response && e.response.data) || null;
  return (data && (data.error || data.message)) || (e && e.message) || "Erreur inconnue";
}

export default function InfluencerQuestionnaire({ influencer, onSaved }) {
  const [answers, setAnswers] = useState({ personality: [] });
  const [extra, setExtra] = useState("");
  const [story, setStory] = useState("");
  const [tagline, setTagline] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  function pick(question, option) {
    setAnswers((s) => {
      if (!question.multi) return { ...s, [question.id]: option };
      const list = Array.isArray(s[question.id]) ? s[question.id] : [];
      return { ...s, [question.id]: list.includes(option) ? list.filter((o) => o !== option) : [...list, option] };
    });
  }

  async function generate() {
    setBusy("generate");
    setError("");
    try {
      const res = await base44.functions.invoke("generateInfluencerStory", {
        name: influencer?.name || "",
        notes: influencer?.notes || "",
        ...answers,
        extra,
      });
      const data = res.data || {};
      if (data.error) throw new Error(data.error);
      setStory(data.story || "");
      setTagline(data.tagline || "");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  }

  // Les réponses du questionnaire restent attachées au personnage : elles servent ensuite de repère.
  async function save() {
    if (!story.trim()) return;
    setBusy("save");
    setError("");
    try {
      const updated = await base44.entities.Influencer.update(influencer.id, {
        niche: answers.niche || "",
        platform: answers.platform || "",
        audience: answers.audience || "",
        tone: answers.tone || "",
        personality: answers.personality || [],
        tagline: tagline.trim(),
        story: story.trim(),
      });
      onSaved(updated);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  }

  if (story) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Son histoire</p>
          <p className="mt-1 font-heading text-lg font-semibold tracking-tight">{influencer?.name}</p>
          {answers.niche && <p className="mt-0.5 text-xs text-muted-foreground">Niche : {answers.niche}</p>}
        </div>

        <div>
          <Label htmlFor="story-tagline">Phrase d'accroche</Label>
          <Input id="story-tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Ex. Je teste tout pour que tu ne perdes pas ton temps." />
        </div>

        <div>
          <Label htmlFor="story-text">Son histoire</Label>
          <Textarea id="story-text" rows={12} value={story} onChange={(e) => setStory(e.target.value)} className="leading-relaxed" />
          <p className="mt-1 text-xs text-muted-foreground">Relisez, corrigez si besoin : ce texte est modifiable avant l'enregistrement.</p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={!!busy}
            className="text-[13px] font-semibold text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline disabled:opacity-50"
          >
            {busy === "generate" ? "Nouvelle version en cours…" : "Régénérer une autre version"}
          </button>
          <Button onClick={save} disabled={!!busy || !story.trim()} className="font-semibold">
            {busy === "save" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Enregistrer cette histoire
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {storyQuizQuestions.map((question) => (
        <div key={question.id} className="space-y-3">
          <div>
            <p className="font-heading text-sm font-semibold">
              {question.label}
              {question.required && <span className="text-primary"> *</span>}
            </p>
            {question.hint && <p className="text-xs text-muted-foreground">{question.hint}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => {
              const selected = question.multi
                ? (answers[question.id] || []).includes(option)
                : answers[question.id] === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => pick(question, option)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                    selected
                      ? "border-primary bg-primary/10 font-semibold text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <Label htmlFor="story-extra">À ajouter à son histoire (optionnel)</Label>
        <Textarea
          id="story-extra"
          rows={3}
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="Ex. elle vient de Bali, elle a un frère jumeau, elle déteste les salles de sport…"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={generate} disabled={!!busy || !answers.niche} className="font-semibold">
          {busy === "generate" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Créer son histoire
        </Button>
        {busy === "generate" ? (
          <span className="text-xs text-muted-foreground">Écriture de son histoire, quelques secondes…</span>
        ) : !answers.niche ? (
          <span className="text-xs text-muted-foreground">Choisissez d'abord sa niche principale.</span>
        ) : null}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SignedImage from "@/components/SignedImage";
import { groupLabel, traitSummary, traitsOf } from "@/lib/influencerTraits";

const RANDOM = "non_precise";
const POLL_MS = 5000;
const MAX_POLLS = 60;

export default function AiInfluencerForm({ onCreated }) {
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [choices, setChoices] = useState({});
  const [sheets, setSheets] = useState(1);
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState("");
  const [jobId, setJobId] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("generateInfluencer", { action: "options", tier: "normal" });
        const data = res.data || {};
        if (!alive) return;
        if (data.error) setError(data.error);
        else setGroups(data.groups || []);
      } catch (e) {
        if (alive) setError(e.message);
      }
    })();
    return () => { alive = false; };
  }, []);

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

  async function prepare() {
    setBusy("quote");
    setError("");
    setImages([]);
    setQuote(null);
    try {
      const selection = {};
      for (const [id, value] of Object.entries(choices)) if (value && value !== RANDOM) selection[id] = [value];
      const chosen = Object.keys(selection).length > 0;
      const res = await base44.functions.invoke("generateInfluencer", {
        action: "quote",
        tier: "normal",
        brief: brief.trim(),
        batch_size: sheets,
        selection,
        // Traits choisis : Higgsfield s'en tient là. Aucun choix : personnage complet au hasard.
        randomize: !chosen,
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

  const traits = quote ? traitsOf(quote.params, groups) : [];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ai-name">Nom</Label>
        <Input id="ai-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Léa" />
      </div>
      <div>
        <Label htmlFor="ai-brief">Univers du personnage (optionnel)</Label>
        <Textarea
          id="ai-brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Ex. créatrice lifestyle française, voyage et mode, ton complice"
          rows={2}
        />
      </div>

      <div>
        <Label>Apparence</Label>
        <p className="mb-2 text-xs text-black/45">
          Choisissez ce qui compte : Higgsfield s'en tient là. Sans aucun choix, il compose un personnage complet au hasard. Les traits retenus sont enregistrés avec l'influenceur.
        </p>
        {!groups ? (
          <div className="flex items-center gap-2 py-4 text-xs text-black/45">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement des traits disponibles…
          </div>
        ) : (
          <div className="grid max-h-[38vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {groups.map((g) => (
              <div key={g.id}>
                <Label className="text-xs text-black/60">{groupLabel(g)}</Label>
                <Select
                  value={choices[g.id] || RANDOM}
                  onValueChange={(v) => setChoices((s) => ({ ...s, [g.id]: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RANDOM}>Non précisé</SelectItem>
                    {g.options.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-end gap-3">
        <div className="w-40">
          <Label>Planches générées</Label>
          <Select value={String(sheets)} onValueChange={(v) => setSheets(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={prepare} disabled={busy !== "" || !groups || !name.trim()} className="flex-1">
          {busy === "quote" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {quote ? "Autre proposition" : "Préparer le personnage"}
        </Button>
      </div>

      {traits.length > 0 && (
        <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3">
          <p className="text-xs font-medium text-black/70">Personnage retenu</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {traits.map((t) => (
              <span key={t.group} className="rounded-md bg-white px-2 py-0.5 text-[11px] text-black/60 ring-1 ring-black/10">
                {t.group} : {t.values}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-black/45">
              {quote.credits ? `${quote.credits} crédit(s) Higgsfield estimé(s)` : "Coût communiqué par Higgsfield à la génération"}
            </span>
            <Button onClick={generate} disabled={busy !== ""} className="bg-black text-white hover:bg-black/85">
              {busy === "start" || busy === "poll" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {busy === "poll" ? "Génération…" : "Générer"}
            </Button>
          </div>
        </div>
      )}

      {busy === "poll" && (
        <p className="flex items-center gap-2 text-xs text-black/45">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Higgsfield compose le personnage, cela prend une à deux minutes.
        </p>
      )}

      {images.length > 0 && (
        <div>
          <Label>Planches générées</Label>
          <div className="mt-2 flex flex-wrap gap-3">
            {images.map((uri) => (
              <SignedImage key={uri} src={uri} fittingType="fit" className="h-40 w-32 rounded-lg border border-black/10 bg-black/5" />
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={save} disabled={busy !== "" || !name.trim() || !images.length} className="bg-black text-white hover:bg-black/85">
          {busy === "save" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Créer l'influenceur
        </Button>
      </div>
    </div>
  );
}
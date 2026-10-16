import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Link2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BankImportSteps from "@/components/bank/BankImportSteps";
import BankImportResult from "@/components/bank/BankImportResult";
import { BANK_HOME, IMPORT_MESSAGES, isValidImportLink, messageForCode } from "@/lib/bankImport";

const ACTIVE_KEY = "influenceia.activeInfluencer";

// Import du personnage réservé sur la banque de personnages, à partir du lien personnel.
// Le lien n'est jamais conservé : il n'est transmis qu'à la fonction d'import de cette copie.
export default function BankImportCard() {
  const navigate = useNavigate();
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function finish(influencer, already) {
    localStorage.setItem(ACTIVE_KEY, influencer.id);
    setResult({ influencer, already });
    setLink("");
    setStep(3);
  }

  async function run() {
    if (busy) return;
    setError("");
    if (!isValidImportLink(link)) {
      setStep(0);
      setError(IMPORT_MESSAGES.INVALID_LINK);
      return;
    }

    setBusy(true);
    setStep(1);
    try {
      const resolved = await base44.functions.invoke("importCharacterFromLink", { link: link.trim(), step: "resolve" });
      const first = resolved?.data || {};
      if (first.status === "ready" && first.influencer) {
        finish(first.influencer, true);
        return;
      }

      setStep(2);
      const prepared = await base44.functions.invoke("importCharacterFromLink", { link: link.trim(), step: "prepare" });
      const second = prepared?.data || {};
      if (second.status !== "ready" || !second.influencer) throw new Error("incomplete");
      finish(second.influencer, false);
    } catch (e) {
      // Le champ garde le lien pour reprendre l'import sans le recopier.
      setError(messageForCode(e?.response?.data?.code));
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <section className="mb-12">
        <BankImportResult
          influencer={result.influencer}
          already={result.already}
          onStart={() => navigate(`/recreer?influencer=${result.influencer.id}`)}
        />
      </section>
    );
  }

  return (
    <section className="mb-12 rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Link2 className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">Importer mon personnage</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Collez le lien copié sur la banque de personnages. Vos deux photos et votre fiche seront ajoutées à votre studio.
          </p>
        </div>
      </div>

      <div className="mt-5 max-w-2xl">
        <Label htmlFor="bank-import-link">Votre lien d'import</Label>
        <div className="mt-1.5 flex flex-wrap gap-3">
          <Input
            id="bank-import-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://characters.cashfluenceur.com/import#token=…"
            disabled={busy}
            className="min-w-[260px] flex-1"
          />
          <Button onClick={run} disabled={busy} className="font-semibold">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importer mon personnage
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={BANK_HOME}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Retrouver mon lien <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="text-xs text-muted-foreground">
            Pour retrouver votre lien, ouvrez la banque dans le navigateur utilisé pour réserver.
          </p>
        </div>

        {step >= 0 && <BankImportSteps current={step} failed={Boolean(error)} />}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </section>
  );
}
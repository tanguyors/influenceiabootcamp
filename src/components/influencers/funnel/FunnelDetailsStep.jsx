import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FIELD = "border-white/15 bg-white/[0.04] text-primary-foreground placeholder:text-primary-foreground/30";
const SHEETS = [1, 2, 3, 4];

export default function FunnelDetailsStep({ name, brief, sheets, onChange, onContinue }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/40">Dernier détail</p>
      <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Comment s'appelle votre star ?
      </h2>

      <div className="mt-8 max-w-lg space-y-6">
        <div>
          <Label htmlFor="funnel-name" className="text-primary-foreground/70">Nom</Label>
          <Input
            id="funnel-name"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ex. Léa"
            className={FIELD}
          />
        </div>

        <div>
          <Label htmlFor="funnel-brief" className="text-primary-foreground/70">Univers (facultatif)</Label>
          <Textarea
            id="funnel-brief"
            rows={3}
            value={brief}
            onChange={(e) => onChange({ brief: e.target.value })}
            placeholder="Ex. créatrice lifestyle française, voyage et mode, ton complice"
            className={FIELD}
          />
        </div>

        <div>
          <Label className="text-primary-foreground/70">Planches générées</Label>
          <div className="mt-2 flex gap-2">
            {SHEETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ sheets: n })}
                className={`h-10 w-10 rounded-full text-sm font-medium transition ${
                  sheets === n
                    ? "bg-primary-foreground text-primary"
                    : "border border-white/15 text-primary-foreground/60 hover:border-white/35 hover:text-primary-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={onContinue}
          disabled={!String(name || "").trim()}
          className="h-12 rounded-full bg-primary-foreground px-8 text-primary hover:bg-primary-foreground/90"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
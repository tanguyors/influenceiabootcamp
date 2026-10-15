import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FIELD = "border-border bg-secondary text-foreground placeholder:text-muted-foreground/60";
const SHEETS = [1, 2, 3, 4];

export default function FunnelDetailsStep({ name, brief, sheets, onChange, onContinue }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Dernier détail</p>
      <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Comment s'appelle votre star ?
      </h2>

      <div className="mt-8 max-w-lg space-y-6">
        <div>
          <Label htmlFor="funnel-name" className="text-muted-foreground">Nom</Label>
          <Input
            id="funnel-name"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ex. Léa"
            className={FIELD}
          />
        </div>

        <div>
          <Label htmlFor="funnel-brief" className="text-muted-foreground">Univers (facultatif)</Label>
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
          <Label className="text-muted-foreground">Planches générées</Label>
          <div className="mt-2 flex gap-2">
            {SHEETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ sheets: n })}
                className={`h-10 w-10 rounded-full text-sm font-medium transition ${
                  sheets === n
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
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
          className="h-12 rounded-full px-8 font-semibold"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
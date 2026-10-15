import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SHEETS = [1, 2, 3, 4];

export default function FunnelRecapStep({ traits, busy, brief, sheets, onChange, onGenerate }) {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      {traits.length ? (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {traits.map((t) => (
            <span key={t.group} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
              {t.group} : {t.values}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-7">
        <Label htmlFor="funnel-brief" className="text-muted-foreground">Univers (facultatif)</Label>
        <Textarea
          id="funnel-brief"
          rows={3}
          value={brief}
          onChange={(e) => onChange({ brief: e.target.value })}
          placeholder="Ex. créatrice lifestyle française, voyage et mode, ton complice"
          className="mt-1 border-border bg-secondary placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="mt-5">
        <Label className="text-muted-foreground">Planches générées</Label>
        <p className="mt-1 text-xs text-muted-foreground/80">
          Chaque planche réunit 9 vues du personnage : visage de face et de trois-quarts, profils, dos et plans larges.
        </p>
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

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Button onClick={onGenerate} disabled={busy !== ""} className="h-12 rounded-full px-8 font-semibold">
          Générer mon influenceur
        </Button>
        <span className="text-xs text-muted-foreground/80">
          {sheets} planche(s) de 9 vues, facturée(s) sur votre compte OpenAI
        </span>
      </div>
    </div>
  );
}
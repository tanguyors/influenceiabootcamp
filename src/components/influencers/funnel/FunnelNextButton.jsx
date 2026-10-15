import { Loader2 } from "lucide-react";

export default function FunnelNextButton({ onClick, disabled, busy, label = "Suivant →" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="mx-auto mt-6 flex min-h-[54px] w-full max-w-[380px] items-center justify-center rounded-full bg-primary font-heading text-base font-extrabold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
    </button>
  );
}
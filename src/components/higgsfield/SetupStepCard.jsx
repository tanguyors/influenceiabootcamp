// Carte d'une étape du setup : icône, numéro, état, titre, explication et contenu.
export default function SetupStepCard({ num, title, text, done, hideStatus = false, icon: Icon, children }) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border p-6 ${
        done ? "border-primary/35 bg-primary/[0.04]" : "border-border bg-card"
      }`}
    >
      <span
        className={`pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full blur-3xl ${
          done ? "bg-primary/15" : "bg-secondary/70"
        }`}
      />
      <div className="relative flex items-start gap-4">
        <span
          className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl border ${
            done ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-secondary text-foreground"
          }`}
        >
          {Icon ? <Icon className="h-5 w-5" /> : <span className="text-sm font-bold">{num}</span>}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Étape {num}
            </span>
            {!hideStatus && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  done ? "bg-primary/15 text-primary" : "border border-border text-muted-foreground"
                }`}
              >
                {done ? "Validé" : "À faire"}
              </span>
            )}
          </div>
          <h2 className="mt-2 font-heading text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{text}</p>
        </div>
      </div>
      <div className="relative mt-5">{children}</div>
    </section>
  );
}
import { Globe, Rocket, ShieldCheck } from "lucide-react";

// Les étapes de la connexion MCP : l'application doit être publiée, et la connexion
// se termine sur l'application publiée, hors de l'aperçu Base44.
const STEPS = [
  {
    title: "Publiez l'application",
    text: "Dans Base44, cliquez sur Publier : l'application obtient son adresse publique. C'est cette adresse qui porte la connexion MCP.",
  },
  {
    title: "Ouvrez l'app publiée, hors Base44",
    text: "Reprenez la même page depuis cette adresse, dans un navigateur normal. L'aperçu Base44 ne peut pas terminer la connexion.",
  },
  {
    title: "Créez votre compte Higgsfield",
    text: "Validez l'étape 1 ci-dessus : la connexion reste verrouillée tant que votre compte Higgsfield n'est pas créé.",
  },
  {
    title: "Autorisez la connexion",
    text: "Cliquez sur « Connecter mon compte Higgsfield » et autorisez une seule fois : l'application récupère votre offre et vos crédits, sans clé API.",
  },
];

export default function McpSetupGuide({ className = "" }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-primary">
          <Rocket className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            Connexion MCP : app publiée, et hors Base44
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            La connexion MCP ne se fait pas dans Base44. Publiez d'abord l'application, puis connectez votre compte
            Higgsfield depuis l'application publiée : l'autorisation revient sur l'adresse publique de l'app.
          </p>
        </div>
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3 rounded-xl border border-border bg-background/40 p-4">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h4 className="font-heading text-sm font-semibold tracking-tight">{step.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5">
        <Globe className="mt-0.5 h-4 w-4 flex-none text-amber-400" />
        <p className="text-xs leading-relaxed text-amber-200/90">
          Sans publication, ou depuis l'aperçu Base44, la connexion reste bloquée : elle doit se terminer sur l'adresse
          publique de l'application.
        </p>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/80">
        <ShieldCheck className="h-4 w-4 flex-none" /> Les jetons d'accès sont stockés côté serveur et ne sont jamais
        exposés au navigateur.
      </p>
    </section>
  );
}
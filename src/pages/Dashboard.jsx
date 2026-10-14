import { Link } from "react-router-dom";
import { Users, Flame, Film, ArrowRight, Sparkles, Image as ImageIcon, Wand2, Download } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Mon influenceur",
    desc: "Importez une image de votre personnage, nommez-le. Son visage et son apparence sont conservés pour chaque vidéo.",
    icon: ImageIcon,
    to: "/influenceurs",
  },
  {
    n: "02",
    title: "Une vidéo virale",
    desc: "Parcourez une bibliothèque de références ayant percé sur TikTok, Reels et Shorts. Filtrez, importez, favorisez.",
    icon: Flame,
    to: "/videos",
  },
  {
    n: "03",
    title: "Ma version",
    desc: "Reprenez la direction visuelle de la référence avec votre influenceur. Ajustez tenue, décor, lancez la génération.",
    icon: Wand2,
    to: "/creations",
  },
];

const sampleStats = [
  { label: "Influenceurs", value: "0", icon: Users },
  { label: "Références virales", value: "0", icon: Flame },
  { label: "Créations", value: "0", icon: Film },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      {/* Hero */}
      <section className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">
          <Sparkles className="h-3.5 w-3.5" />
          Parcours : Mon influenceur → Une vidéo virale → Ma version
        </div>
        <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Créez un influenceur IA,
          <br />
          <span className="text-black/40">recréez les vidéos qui performent.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-black/60">
          Importez l'image de votre personnage, choisissez une vidéo virale de référence, puis
          générez votre propre version via votre serveur MCP Higgsfield. Format vertical 9:16,
          résolution 1080p lorsque le modèle le permet.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/influenceurs"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Créer mon influenceur <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/videos"
            className="inline-flex items-center gap-2 rounded-lg border border-black/15 bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-black/5"
          >
            Explorer les vidéos virales
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {sampleStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-black/10 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-black/50">{s.label}</span>
                <Icon className="h-4 w-4 text-black/30" />
              </div>
              <div className="mt-2 font-heading text-3xl font-semibold tracking-tight">{s.value}</div>
            </div>
          );
        })}
      </section>

      {/* Steps */}
      <section>
        <h2 className="mb-5 font-heading text-xl font-semibold tracking-tight">Le parcours en 3 étapes</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.n}
                to={s.to}
                className="group flex flex-col rounded-xl border border-black/10 bg-white p-6 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-black/30">{s.n}</span>
                  <Icon className="h-5 w-5 text-black/40 transition-colors group-hover:text-black" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-black/55">{s.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-black">
                  Ouvrir <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Demo notice */}
      <div className="mt-10 flex items-start gap-3 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4">
        <div className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-amber-400/30 text-[10px] font-bold text-amber-700">
          !
        </div>
        <p className="text-[13px] leading-relaxed text-amber-800">
          <strong>Données de démonstration.</strong> Tant qu'aucune clé Higgsfield n'est configurée
          (page « Connexion Higgsfield ») et qu'aucune référence n'est importée, les listes
          présentent des exemples signalés. Aucune vidéo, statistique ou connexion réseau n'est
          inventée.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-black/35">
        <Download className="h-3.5 w-3.5" />
        Génération asynchrone · État conservé entre les visites · Pas de lancement en double
      </div>
    </div>
  );
}
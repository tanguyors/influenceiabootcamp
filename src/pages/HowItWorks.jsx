import { Link } from "react-router-dom";
import { ArrowRight, Layers, MessageSquare, Database, Sparkles, CalendarDays, Wand2 } from "lucide-react";
import HowDailyLoop from "@/components/how/HowDailyLoop";
import HowPromptList from "@/components/how/HowPromptList";

const pillars = [
  {
    n: "01",
    title: "Ton studio",
    desc: "Tu dupliques la plateforme et elle devient la tienne : tes influenceurs, ta banque de vidéos, tes créations, ton calendrier. Personne d'autre ne touche à ton contenu.",
    icon: Layers,
  },
  {
    n: "02",
    title: "Ton copilote IA",
    desc: "À côté de ton studio, l'IA Base44 discute avec toi tous les jours. Tu écris ce que tu veux en français, elle le fait : bio, accroche, légende, planning, nouvelle vidéo.",
    icon: MessageSquare,
  },
  {
    n: "03",
    title: "Tes données en contexte",
    desc: "Elle connaît tes personnages, leurs histoires, tes vidéos et ton calendrier. Ses réponses parlent de TES contenus, pas de généralités.",
    icon: Database,
  },
];

const notes = [
  "Tu ouvres la plateforme quand tu veux, l'IA est là chaque fois : c'est un rendez-vous quotidien, pas un outil qu'on installe une fois.",
  "Tu peux discuter avant de valider : rien ne change dans ton studio tant que tu n'as pas accepté la modification proposée.",
  "Les bios, légendes et hashtags sont aussi générables directement dans l'app, depuis la fiche de ton personnage et le calendrier.",
  "Les vidéos se génèrent avec ton propre compte Higgsfield, en arrière-plan : tu lances, tu reviens plus tard, la création t'attend.",
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      {/* Hero */}
      <section className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Ton studio + ton copilote IA
        </div>
        <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Une plateforme que tu ouvres
          <br />
          <span className="text-muted-foreground">chaque jour, avec l'IA à côté de toi.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Ici, tu ne remplis pas des formulaires en solo : tu discutes avec l'IA Base44, qui connaît
          tes personnages et tes contenus. Elle écrit tes bios, te dit quand poster, remplit ton
          calendrier et lance tes vidéos. Toi, tu valides et tu publies.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/influenceurs"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Créer mon premier personnage <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/calendrier"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Voir mon calendrier <CalendarDays className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Piliers */}
      <section className="mb-14">
        <h2 className="mb-5 font-heading text-xl font-semibold tracking-tight">Le principe en 3 temps</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.n} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground/60">{p.n}</span>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Boucle quotidienne */}
      <section className="mb-14">
        <h2 className="mb-2 font-heading text-xl font-semibold tracking-tight">Ton quotidien</h2>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          La promesse est simple : à chaque fois que tu ouvres la plateforme, il y a quelque chose à
          faire, et tu n'as jamais à te demander quoi.
        </p>
        <HowDailyLoop />
      </section>

      {/* Exemples de demandes */}
      <section className="mb-14">
        <h2 className="mb-2 font-heading text-xl font-semibold tracking-tight">
          Ce que tu peux lui demander
        </h2>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Clique sur une phrase pour la copier, puis colle-la dans le chat Base44. Tu écriras vite
          les tiennes : parle-lui comme à un partenaire, pas comme à un logiciel.
        </p>
        <HowPromptList />
      </section>

      {/* Bon à savoir */}
      <section className="mb-14">
        <h2 className="mb-5 font-heading text-xl font-semibold tracking-tight">Bon à savoir</h2>
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-sm leading-relaxed text-muted-foreground">{n}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA final */}
      <section className="rounded-xl border border-border bg-card p-8">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Ta seule vraie question, c'est celle que tu vas lui poser aujourd'hui.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Commence par un personnage, garde un rythme de publication, et laisse l'IA gérer le reste.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/recreer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Générer une vidéo <Wand2 className="h-4 w-4" />
          </Link>
          <Link
            to="/creations"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Voir mes créations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
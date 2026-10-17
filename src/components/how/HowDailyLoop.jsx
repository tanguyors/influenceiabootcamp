import { Sunrise, MessageSquare, CalendarDays, Repeat } from "lucide-react";

const moments = [
  {
    time: "Le matin",
    title: "Tu regardes ce qui est prêt",
    desc: "Tes vidéos générées pendant la nuit sont là. Tu écoutes, tu gardes les meilleures.",
    icon: Sunrise,
  },
  {
    time: "Ensuite",
    title: "Tu demandes les textes à l'IA Base44",
    desc: "Bio, accroche, légende, hashtags : tu écris ce que tu veux dans le chat, elle rédige avec le ton de ton personnage.",
    icon: MessageSquare,
  },
  {
    time: "Puis",
    title: "Tu remplis ton calendrier",
    desc: "Elle te dit quand poster et pose les créations aux bons créneaux, pour tenir le rythme d'une publication par jour.",
    icon: CalendarDays,
  },
  {
    time: "Et tu recommences",
    title: "Chaque jour, une raison de revenir",
    desc: "Nouvelle vidéo, nouveau texte, nouveau créneau. Ta chaîne avance sans que tu réfléchisses à quoi faire.",
    icon: Repeat,
  },
];

export default function HowDailyLoop() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {moments.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.time} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Icon className="h-4 w-4" />
              {m.time}
            </div>
            <h3 className="mt-3 font-heading text-base font-semibold tracking-tight">{m.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
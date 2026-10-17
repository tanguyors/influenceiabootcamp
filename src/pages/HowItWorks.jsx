import { Link } from "react-router-dom";
import { ArrowRight, Layers, MessageSquare, Database, Sparkles, CalendarDays, Wand2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import Base44Logo from "@/components/Base44Logo";
import HowDailyLoop from "@/components/how/HowDailyLoop";
import HowPromptList from "@/components/how/HowPromptList";
import { useI18n } from "@/lib/i18n";

const BASE44_BRAIN = "https://media.base44.com/images/public/6acf818406c8aa81ac77512c/80857f9ba_generated_image.png";

const pillars = [
  { n: "01", titleKey: "how.pillar1Title", descKey: "how.pillar1Desc", icon: Layers },
  { n: "02", titleKey: "how.pillar2Title", descKey: "how.pillar2Desc", icon: MessageSquare },
  { n: "03", titleKey: "how.pillar3Title", descKey: "how.pillar3Desc", icon: Database },
];

const noteKeys = ["how.note1", "how.note2", "how.note3", "how.note4"];

export default function HowItWorks() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      {/* Hero */}
      <section className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {t("how.badge")}
        </div>
        <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("how.title1")}
          <br />
          <span className="text-muted-foreground">{t("how.title2")}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{t("how.lead")}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/influenceurs"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("how.ctaCharacter")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/calendrier"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {t("how.ctaCalendar")} <CalendarDays className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Le cerveau de tout ça, c'est Base44 */}
      <section className="mb-14 overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          <div className="p-6 sm:p-8 lg:self-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary p-2">
                <Base44Logo className="h-full w-full" />
              </div>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                Base44 Brain
              </span>
            </div>
            <h2 className="mt-5 font-heading text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {t("how.brainTitle")}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("how.brainP1")}</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("how.brainP2")}</p>
          </div>
          <div className="relative aspect-square w-full overflow-hidden border-t border-border lg:self-center lg:border-l lg:border-t-0">
            <Image
              src={BASE44_BRAIN}
              alt={t("how.brainAlt")}
              fittingType="cover"
              className="h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* Piliers */}
      <section className="mb-14">
        <h2 className="mb-5 font-heading text-xl font-semibold tracking-tight">{t("how.pillarsTitle")}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.n} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground/60">{p.n}</span>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">{t(p.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(p.descKey)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Boucle quotidienne */}
      <section className="mb-14">
        <h2 className="mb-2 font-heading text-xl font-semibold tracking-tight">{t("how.loopTitle")}</h2>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("how.loopLead")}</p>
        <HowDailyLoop />
      </section>

      {/* Exemples de demandes */}
      <section className="mb-14">
        <h2 className="mb-2 font-heading text-xl font-semibold tracking-tight">{t("how.promptsTitle")}</h2>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("how.promptsLead")}</p>
        <HowPromptList />
      </section>

      {/* Bon à savoir */}
      <section className="mb-14">
        <h2 className="mb-5 font-heading text-xl font-semibold tracking-tight">{t("how.notesTitle")}</h2>
        <ul className="space-y-3">
          {noteKeys.map((key) => (
            <li key={key} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-sm leading-relaxed text-muted-foreground">{t(key)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA final */}
      <section className="rounded-xl border border-border bg-card p-8">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">{t("how.ctaTitle")}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("how.ctaLead")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/recreer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("how.ctaVideo")} <Wand2 className="h-4 w-4" />
          </Link>
          <Link
            to="/creations"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {t("how.ctaCreations")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
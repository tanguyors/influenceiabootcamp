import { Link } from "react-router-dom";
import { Users, Flame, Film, ArrowRight, Sparkles, Image as ImageIcon, Wand2, Download } from "lucide-react";
import BankImportCard from "@/components/bank/BankImportCard";
import MasterPromptCard from "@/components/MasterPromptCard";
import { useI18n } from "@/lib/i18n";

const steps = [
  { n: "01", titleKey: "dashboard.step1Title", descKey: "dashboard.step1Desc", icon: ImageIcon, to: "/influenceurs" },
  { n: "02", titleKey: "dashboard.step2Title", descKey: "dashboard.step2Desc", icon: Flame, to: "/videos" },
  { n: "03", titleKey: "dashboard.step3Title", descKey: "dashboard.step3Desc", icon: Wand2, to: "/creations" },
];

export default function Dashboard() {
  const { t } = useI18n();

  const stats = [
    { label: t("dashboard.statInfluencers"), value: "0", icon: Users },
    { label: t("dashboard.statReferences"), value: "0", icon: Flame },
    { label: t("dashboard.statCreations"), value: "0", icon: Film },
  ];

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      {/* Hero */}
      <section className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {t("dashboard.badge")}
        </div>
        <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("dashboard.title1")}
          <br />
          <span className="text-muted-foreground">{t("dashboard.title2")}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {t("dashboard.lead")}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/influenceurs"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("dashboard.ctaCreate")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/videos"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {t("dashboard.ctaExplore")}
          </Link>
        </div>
      </section>

      {/* Import depuis la banque de personnages */}
      <BankImportCard />

      {/* Stats */}
      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <div className="mt-2 font-heading text-3xl font-semibold tracking-tight">{s.value}</div>
            </div>
          );
        })}
      </section>

      {/* Steps */}
      <section>
        <h2 className="mb-5 font-heading text-xl font-semibold tracking-tight">{t("dashboard.stepsTitle")}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.n}
                to={s.to}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted-foreground/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground/60">{s.n}</span>
                  <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">{t(s.titleKey)}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t(s.descKey)}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {t("dashboard.open")} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <MasterPromptCard className="mt-10" />

      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground/60">
        <Download className="h-3.5 w-3.5" />
        {t("dashboard.footer")}
      </div>
    </div>
  );
}
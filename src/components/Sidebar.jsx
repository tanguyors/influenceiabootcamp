import { NavLink } from "react-router-dom";
import { Users, Flame, Film, Plug, Sparkles, LayoutDashboard, CalendarDays, HelpCircle, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import LanguageSwitch from "@/components/LanguageSwitch";

const navItems = [
  { to: "/", key: "nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/influenceurs", key: "nav.influencers", icon: Users },
  { to: "/videos", key: "nav.library", icon: Flame },
  { to: "/creations", key: "nav.creations", icon: Film },
  { to: "/calendrier", key: "nav.calendar", icon: CalendarDays },
  { to: "/comment-ca-marche", key: "nav.how", icon: HelpCircle },
  { to: "/ressources", key: "nav.resources", icon: GraduationCap },
  { to: "/connexion", key: "nav.setup", icon: Plug },
];

export default function Sidebar() {
  const { t } = useI18n();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card text-foreground">
      <div className="flex items-center gap-2.5 border-b border-border px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-heading text-[15px] font-semibold tracking-tight">CAI ⚜️</div>
          <div className="text-[11px] text-muted-foreground">{t("sidebar.tagline")}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {t(item.key)}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t("sidebar.language")}
          </span>
          <LanguageSwitch />
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground/70">{t("sidebar.footer")}</p>
      </div>
    </aside>
  );
}
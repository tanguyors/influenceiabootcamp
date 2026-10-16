import { NavLink } from "react-router-dom";
import { Users, Flame, Film, Plug, Sparkles, LayoutDashboard, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/influenceurs", label: "Mes influenceurs", icon: Users },
  { to: "/videos", label: "Banque de modèles", icon: Flame },
  { to: "/creations", label: "Mes créations", icon: Film },
  { to: "/calendrier", label: "Calendrier", icon: CalendarDays },
  { to: "/connexion", label: "Setup Higgsfield", icon: Plug },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card text-foreground">
      <div className="flex items-center gap-2.5 border-b border-border px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-heading text-[15px] font-semibold tracking-tight">InfluenceIA</div>
          <div className="text-[11px] text-muted-foreground">Influenceur IA · Vidéos virales</div>
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
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border px-6 py-5">
        <p className="text-[11px] leading-relaxed text-muted-foreground/70">
          Propulsé par votre serveur MCP Higgsfield. Identifiants protégés côté serveur.
        </p>
      </div>
    </aside>
  );
}
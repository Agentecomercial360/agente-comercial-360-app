import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Headphones,
  Users,
  MessageSquare,
  UserCog,
  BookOpen,
  Sparkles,
  BarChart3,
  Settings,
  RefreshCw,
  Bot,
  Calendar,
} from "lucide-react";
import { type ReactNode } from "react";
import acLogo from "@/assets/ac-logo-full.png";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, enabled: true },
  { label: "Atendimentos", to: "/dashboard", icon: Headphones },
  { label: "Leads", to: "/dashboard", icon: Users },
  { label: "Conversas", to: "/dashboard", icon: MessageSquare },
  { label: "Responsáveis", to: "/dashboard", icon: UserCog },
  { label: "Base de Conhecimento", to: "/dashboard", icon: BookOpen },
  { label: "IA", to: "/dashboard", icon: Sparkles },
  { label: "Relatórios", to: "/dashboard", icon: BarChart3 },
  { label: "Configurações", to: "/dashboard", icon: Settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className="hidden md:flex md:w-64 lg:w-72 flex-col sticky top-0 h-screen"
        style={{
          background: "var(--sidebar-brand)",
          color: "var(--sidebar-brand-foreground)",
        }}
      >
        <div
          className="flex items-center justify-center px-4 py-4 border-b"
          style={{ borderColor: "var(--sidebar-brand-border)" }}
        >
          <div className="bg-white/95 rounded-xl px-4 py-2.5 w-full flex items-center justify-center shadow-sm shadow-black/10" style={{ maxHeight: "100px" }}>
            <img
              src={acLogo}
              alt="Agente Comercial 360"
              className="w-full max-w-[200px] h-auto max-h-[84px] object-contain"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          {navItems.map((item, i) => {
            const active = item.enabled && path === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={i}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active
                    ? "text-white shadow-lg shadow-blue-900/30"
                    : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                }`}
                style={
                  active
                    ? { background: "var(--sidebar-brand-active)" }
                    : undefined
                }
              >
                <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div
          className="px-6 py-4 border-t text-[11px] tracking-wide text-white/45"
          style={{ borderColor: "var(--sidebar-brand-border)" }}
        >
          v1.0 · União Auto Peças
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="sticky top-0 z-10 backdrop-blur"
          style={{
            background: "var(--topbar)",
            borderBottom: "1px solid var(--border-premium)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Empresa ativa</div>
                <div className="font-display text-sm font-bold text-foreground">União Auto Peças</div>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <Bot className="h-3.5 w-3.5 text-emerald-700" />
                <span className="text-xs font-semibold text-emerald-700">IA Ativa</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="capitalize">{today}</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Sistema online
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 transition"
                style={{ background: "var(--gradient-brand)" }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Atualizar
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

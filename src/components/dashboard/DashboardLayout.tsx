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
import acLogo from "@/assets/ac-logo.png";

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
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-[oklch(0.18_0.06_262)] text-white sticky top-0 h-screen">
        <div className="flex items-center justify-center px-6 py-5 border-b border-white/10">
          <div className="bg-white rounded-xl p-3 shadow-md w-full flex items-center justify-center">
            <img
              src={acLogo}
              alt="Agente Comercial 360"
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item, i) => {
            const active = item.enabled && path === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={i}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-[oklch(0.55_0.22_258)] to-[oklch(0.45_0.2_262)] text-white shadow-lg shadow-blue-900/30"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 text-xs text-white/50">
          v1.0 · União Auto Peças
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Empresa ativa</div>
                <div className="text-sm font-semibold text-foreground">União Auto Peças</div>
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
              <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition">
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

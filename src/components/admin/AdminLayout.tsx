import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  Layers,
  ShieldCheck,
  CreditCard,
  Settings,
  RefreshCw,
  Bell,
  Search,
  ChevronRight,
  LogOut,
  Lock,
  Calendar
} from "lucide-react";
import { type ReactNode, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import acLogo from "@/assets/ac-logo.png";
import { useModuleGuard } from "@/lib/use-module-guard";

const navGroups = [
  {
    title: "ADMINISTRAÇÃO INTERNA",
    items: [
      { label: "Dashboard Admin", to: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Empresas", to: "/admin/empresas", icon: Building2 },
      { label: "Usuários", to: "/admin/usuarios", icon: Users },
      { label: "Módulos", to: "/admin/modulos", icon: Layers },
      { label: "Acessos", to: "/admin/acessos", icon: Lock },
      { label: "Planos", to: "/admin/planos", icon: CreditCard },
      { label: "Configurações", to: "/admin/configuracoes", icon: Settings },
    ],
  },
] as const;

export function AdminLayout({ children }: { children: ReactNode }) {
  const { allowed, checking } = useModuleGuard("admin");
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [today, setToday] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date())
    );
  }, []);

  const handleRefresh = useCallback(() => {
    if (isUpdating) return;
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      toast.success("Dados administrativos atualizados.");
    }, 1000);
  }, [isUpdating]);

  if (checking || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Validando acesso…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar Admin */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col sticky top-0 h-screen bg-slate-900 text-slate-300 border-r border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <img
            src={acLogo}
            alt="Agente Comercial 360"
            className="h-10 w-10 object-contain shrink-0 brightness-110"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
              Painel Interno
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              ADMIN<span className="text-blue-500">.</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {navGroups.map((group, gi) => (
            <div key={gi} className="space-y-3">
              <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {group.title}
              </div>
              <nav className="space-y-1">
                {group.items.map((item, i) => {
                  const active = path === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={i}
                      to={item.to}
                      className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                          : "hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-blue-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      {active && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 mb-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">Administrador</span>
              <span className="text-[10px] text-slate-500 truncate text-uppercase tracking-wider">Super Admin</span>
            </div>
          </div>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors">
            <LogOut className="h-4 w-4" />
            Sair do Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Admin */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 border border-blue-100">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Ambiente Administrativo Seguro</span>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium ml-2">
                <Calendar className="h-3.5 w-3.5" />
                <span className="capitalize">{today}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden xl:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar empresas ou usuários..." 
                  className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              
              <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-white" />
              </button>

              <button
                onClick={handleRefresh}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? "animate-spin" : ""}`} />
                {isUpdating ? "Atualizando..." : "Sincronizar"}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          {children}
        </main>
        
        <footer className="px-6 py-4 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-medium">
            Agente Comercial 360 · Sistema Interno de Gestão · v2.4.0
          </p>
        </footer>
      </div>
    </div>
  );
}

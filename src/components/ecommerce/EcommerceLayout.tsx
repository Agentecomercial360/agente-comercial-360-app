import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  UserCog,
  Settings,
  RefreshCw,
  Bot,
  Calendar,
  Store,
  ShoppingCart,
  ShieldAlert,
  Boxes,
  Zap,
  ListTodo,
  TrendingUp,
  BrainCircuit,
  BarChart3,
  LogOut,
} from "lucide-react";
import { type ReactNode, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import acLogo from "@/assets/ac-logo.png";

const navGroups = [
  {
    title: "E-COMMERCE",
    items: [
      { label: "Visão Geral", to: "/ecommerce/dashboard", icon: Store },
      { label: "Contas ML", to: "/ecommerce/contas", icon: UserCog },
      { label: "Produto Unificado", to: "/ecommerce/produtos", icon: ShoppingCart },
      { label: "Produtos Travados", to: "/ecommerce/produtos-travados", icon: ShieldAlert },
      { label: "Estoque Unificado", to: "/ecommerce/estoque", icon: Boxes },
      { label: "Ads Inteligente", to: "/ecommerce/ads", icon: Zap },
      { label: "Prioridades", to: "/ecommerce/prioridades", icon: TrendingUp },
      { label: "Tarefas", to: "/ecommerce/tarefas", icon: ListTodo },
      { label: "Consultor IA", to: "/ecommerce/consultor-ia", icon: BrainCircuit },
      { label: "Resultados das Ações", to: "/ecommerce/resultados", icon: BarChart3 },
      { label: "Configurações", to: "/ecommerce/configuracoes", icon: Settings },
    ],
  },
] as const;

export function EcommerceLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      navigate({ to: "/ecommerce/login" });
    } catch {
      toast.error("Não foi possível encerrar a sessão. Tente novamente.");
      setSigningOut(false);
    }
  }, [navigate, signingOut]);

  const [today, setToday] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [lastUpdateText, setLastUpdateText] = useState("");

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

  useEffect(() => {
    if (!lastUpdate) return;
    setLastUpdateText("Última atualização: agora");
    const t = setTimeout(() => {
      setLastUpdateText("Última atualização: há poucos segundos");
    }, 8000);
    return () => clearTimeout(t);
  }, [lastUpdate]);

  const handleRefresh = useCallback(() => {
    if (isUpdating) return;
    setIsUpdating(true);
    const delay = 800 + Math.random() * 400;
    setTimeout(() => {
      setIsUpdating(false);
      setLastUpdate(new Date().toISOString());
      toast.success("Dados atualizados com sucesso.");
    }, delay);
  }, [isUpdating]);

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
          className="flex items-center gap-3 px-5 py-3.5 border-b"
          style={{ borderColor: "var(--sidebar-brand-border)" }}
        >
          <img
            src={acLogo}
            alt="Agente Comercial 360"
            className="h-12 w-12 object-contain shrink-0"
          />
          <div className="flex flex-col leading-[1.05]">
            <span className="text-[12.5px] font-medium tracking-wide text-white/80">
              AC360 E-commerce
            </span>
            <span className="text-[22px] font-bold tracking-tight text-white">
              Intelligence
            </span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              <div className="px-3.5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item, i) => {
                  const active = path === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={i}
                      to={item.to}
                      className={`relative flex items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
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
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-blue-300" />
                      )}
                      <Icon className="h-4 w-4 shrink-0" size={16} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              {gi < navGroups.length - 1 && (
                <div
                  className="mx-3.5 mt-3 h-px"
                  style={{ background: "var(--sidebar-brand-border)" }}
                />
              )}
            </div>
          ))}
        </nav>
        <div
          className="border-t px-3 py-3 space-y-2"
          style={{ borderColor: "var(--sidebar-brand-border)" }}
        >
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>{signingOut ? "Saindo…" : "Sair"}</span>
          </button>
          <div className="px-3.5 text-[11px] tracking-wide text-white/40">
            v1.0 · E-commerce Intelligence
          </div>
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
              <Link to="/modulos" className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                <span>Módulos</span>
                <span>/</span>
              </Link>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Operação Ativa</div>
                <div className="font-display text-sm font-bold text-foreground">Mercado Livre</div>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 border border-blue-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                </span>
                <Bot className="h-3.5 w-3.5 text-blue-700" />
                <span className="text-xs font-semibold text-blue-700">IA Inteligente</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="capitalize">{today}</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Sincronizado
              </div>
              {lastUpdateText && (
                <div className="hidden lg:flex items-center text-[11px] text-muted-foreground/80">
                  {lastUpdateText}
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "var(--gradient-brand)" }}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? "animate-spin" : ""}`} />
                {isUpdating ? "Sincronizando..." : "Sincronizar"}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

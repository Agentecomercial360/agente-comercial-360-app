import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  RefreshCw,
  Bot,
  Calendar,
  Store,
  Map,
  ShoppingCart,
  Boxes,
  Zap,
  TrendingUp,
  BrainCircuit,
  Radar,
  BarChart3,
  BookOpen,
  LogOut,
  Menu,
  CheckCircle2,
  Link2,
  ChevronDown,
  DollarSign,
  ClipboardList,
  GraduationCap,

} from "lucide-react";
import { type ReactNode, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import acLogo from "@/assets/ac-logo.png";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  EcommerceActiveAccountProvider,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { runSmartAccountSync, formatSmartSyncMessage } from "@/lib/ml-sync";

const navGroups = [
  {
    title: "Visão Executiva",
    items: [
      { label: "Visão Geral", to: "/ecommerce/dashboard", icon: Store },
      { label: "Central de Ações", to: "/ecommerce/prioridades", icon: TrendingUp },
      { label: "Resultados das Ações", to: "/ecommerce/resultados", icon: BarChart3 },
    ],
  },
  {
    title: "Operação Mercado Livre",
    items: [
      { label: "Contas Mercado Livre", to: "/ecommerce/contas", icon: Link2 },
      { label: "Produtos e Anúncios", to: "/ecommerce/produtos", icon: ShoppingCart },
      { label: "Custos e Margem", to: "/ecommerce/custos-margem", icon: DollarSign },
      { label: "Estoque e Compras", to: "/ecommerce/estoque", icon: Boxes },
      { label: "Mapa de Vendas", to: "/ecommerce/mapa-vendas", icon: Map },
    ],
  },
  {
    title: "Crescimento",
    items: [
      { label: "Anúncios e Ads", to: "/ecommerce/ads", icon: Zap },
    ],
  },
  {
    title: "Execução",
    items: [
      { label: "Tarefas da Operação", to: "/ecommerce/tarefas", icon: ClipboardList },
    ],
  },
  {
    title: "Inteligência",
    items: [
      { label: "Diagnóstico Inteligente", to: "/ecommerce/radar-ia", icon: Radar },
      { label: "Assistente Estratégico", to: "/ecommerce/consultor-ia", icon: BrainCircuit },
      { label: "Regras da Operação", to: "/ecommerce/base-ia", icon: BookOpen },
    ],
  },
] as const;

type SidebarNavProps = {
  path: string;
  signingOut: boolean;
  onSignOut: () => void;
  onNavigate?: () => void;
};

function SidebarNav({ path, signingOut, onSignOut, onNavigate }: SidebarNavProps) {
  return (
    <div
      className="flex h-full w-full flex-col"
      style={{
        background: "var(--sidebar-brand)",
        color: "var(--sidebar-brand-foreground)",
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3.5 border-b shrink-0"
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
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-7">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            <div className="px-3.5 mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item, i) => {
                const active = path === item.to || path.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={i}
                    to={item.to}
                    onClick={onNavigate}
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
          </div>
        ))}
      </nav>
      <div
        className="border-t px-3 py-3 space-y-2 shrink-0"
        style={{ borderColor: "var(--sidebar-brand-border)" }}
      >
        <button
          onClick={onSignOut}
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
    </div>
  );
}

function ActiveAccountSelector() {
  const { accounts, loading, activeAccountId, activeAccount, isActiveConnected, setActiveAccountId } =
    useEcommerceActiveAccount();

  if (loading && accounts.length === 0) {
    return (
      <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground">
        <Store className="h-3.5 w-3.5" />
        Carregando contas…
      </div>
    );
  }
  if (accounts.length === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-2.5 py-1.5 shadow-[var(--shadow-soft)]">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-700 text-white shrink-0">
        <Store className="h-3.5 w-3.5" />
      </div>
      <div className="hidden md:flex flex-col leading-tight pr-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          Conta ativa
        </span>
      </div>
      <div className="relative">
        <select
          aria-label="Conta Mercado Livre ativa"
          value={activeAccountId ?? ""}
          onChange={(e) => setActiveAccountId(e.target.value || null)}
          className="appearance-none rounded-lg bg-transparent pl-2 pr-7 py-1 text-xs font-semibold text-foreground outline-none cursor-pointer hover:bg-muted/60 focus:bg-muted/60 max-w-[200px]"
        >
          <option value="">Todas as contas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.account_name || a.nickname || a.id}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      </div>
      {activeAccount && (
        isActiveConnected ? (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Conectada
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            <Link2 className="h-3 w-3" />
            Aguardando conexão
          </span>
        )
      )}
    </div>
  );
}

function EcommerceLayoutInner({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeAccountId, activeAccount } = useEcommerceActiveAccount();

  const handleSignOut = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      setMobileOpen(false);
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

  const handleRefresh = useCallback(async () => {
    if (isUpdating) return;
    if (!activeAccountId) {
      toast.error("Selecione uma conta Mercado Livre para sincronizar.");
      return;
    }
    setIsUpdating(true);
    try {
      const result = await runSmartAccountSync(activeAccountId, { days: 1 });
      console.log("Resposta sync-account-smart:", result.raw);
      setLastUpdate(new Date().toISOString());
      window.dispatchEvent(new CustomEvent("mercadolivre-products-synced"));
      toast.success(formatSmartSyncMessage(result), {
        description: activeAccount?.account_name || activeAccount?.nickname || undefined,
      });
    } catch (e: any) {
      toast.error(
        e?.message
          ? `Não foi possível sincronizar: ${e.message}`
          : "Não foi possível sincronizar agora. Tente novamente em instantes.",
      );
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, activeAccountId, activeAccount]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col sticky top-0 h-screen">
        <SidebarNav
          path={path}
          signingOut={signingOut}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-[85vw] max-w-[320px] border-0"
        >
          <VisuallyHidden>
            <SheetTitle>Menu de navegação</SheetTitle>
          </VisuallyHidden>
          <SidebarNav
            path={path}
            signingOut={signingOut}
            onSignOut={handleSignOut}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

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
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-3.5">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border/60 text-foreground hover:bg-muted transition"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link
                to="/modulos"
                className="hidden sm:flex text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors items-center gap-1"
              >
                <span>Módulos</span>
                <span>/</span>
              </Link>
              <div className="min-w-0">
                <div className="text-[10px] md:text-[11px] uppercase tracking-wider text-muted-foreground">
                  Operação Ativa
                </div>
                <div className="font-display text-sm font-bold text-foreground truncate">
                  Mercado Livre
                </div>
              </div>
              <ActiveAccountSelector />
              <div className="hidden xl:flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 border border-blue-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                </span>
                <Bot className="h-3.5 w-3.5 text-blue-700" />
                <span className="text-xs font-semibold text-blue-700">IA Inteligente</span>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
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
                className="inline-flex items-center gap-2 rounded-xl px-3 md:px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "var(--gradient-brand)" }}
                aria-label="Sincronizar"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">
                  {isUpdating ? "Sincronizando..." : "Sincronizar"}
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-6 py-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function EcommerceLayout({ children }: { children: ReactNode }) {
  return (
    <EcommerceActiveAccountProvider>
      <EcommerceLayoutInner>{children}</EcommerceLayoutInner>
    </EcommerceActiveAccountProvider>
  );
}

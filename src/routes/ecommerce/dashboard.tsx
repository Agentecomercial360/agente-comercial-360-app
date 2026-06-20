import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  BrainCircuit,
  DollarSign,
  ShoppingBag,
  Receipt,
  Percent,
  AlertTriangle,
  Flame,
  Package,
  Boxes,
  Megaphone,
  ListChecks,
  ArrowRight,
  Info,
  BarChart3,
  Award,
  Target,
  Map,
  CheckCircle2,
  Activity,
  Lightbulb,
  Tag,
  PauseCircle,
  PlayCircle,
  Link2,
  RefreshCcw,
  Clock,
  PlugZap,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/dashboard")({
  component: VisaoGeral,
  head: () => ({
    meta: [{ title: "Visão Geral | Agente Comercial 360" }],
  }),
});

type Listing = {
  id: string;
  product_id: string | null;
  ml_item_id: string | null;
  title: string | null;
  price: number | null;
  status: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

const monitoringKpis = [
  { label: "Faturamento do período", icon: DollarSign, accent: "from-emerald-600 to-emerald-800" },
  { label: "Pedidos", icon: ShoppingBag, accent: "from-blue-700 to-blue-900" },
  { label: "Ticket médio", icon: Receipt, accent: "from-indigo-600 to-indigo-800" },
  { label: "Margem estimada", icon: Percent, accent: "from-violet-600 to-violet-800" },
] as const;

const saude = [
  { label: "Produtos", desc: "Identifica oportunidades, produtos problema e concentração de faturamento.", icon: Package, to: "/ecommerce/produtos", accent: "from-blue-700 to-blue-900" },
  { label: "Estoque", desc: "Monitora cobertura, giro, ruptura e necessidade de reposição.", icon: Boxes, to: "/ecommerce/estoque", accent: "from-indigo-600 to-indigo-800" },
  { label: "Ads", desc: "Avalia investimento, retorno, eficiência e campanhas com potencial de escala.", icon: Megaphone, to: "/ecommerce/ads", accent: "from-emerald-600 to-emerald-800" },
  { label: "Execução", desc: "Organiza prioridades, tarefas e resultados das ações da equipe.", icon: ListChecks, to: "/ecommerce/prioridades", accent: "from-violet-600 to-violet-800" },
] as const;

const atalhos = [
  { label: "Curva ABC", to: "/ecommerce/curva-abc", icon: Award },
  { label: "Inteligência de Produtos", to: "/ecommerce/produtos", icon: Sparkles },
  { label: "Produtos Problema", to: "/ecommerce/produtos-travados", icon: AlertTriangle },
  { label: "Estoque e Compras", to: "/ecommerce/estoque", icon: Boxes },
  { label: "Anúncios e Ads", to: "/ecommerce/ads", icon: Megaphone },
  { label: "Central de Ações", to: "/ecommerce/prioridades", icon: Target },
  { label: "Resultados das Ações", to: "/ecommerce/resultados", icon: BarChart3 },
  { label: "Mapa de Vendas", to: "/ecommerce/mapa-vendas", icon: Map },
] as const;

const currencyFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const numberFmt = new Intl.NumberFormat("pt-BR");

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function VisaoGeral() {
  const { activeAccount, activeAccountId, isActiveConnected, loading: accountLoading } =
    useEcommerceActiveAccount();

  const [listings, setListings] = useState<Listing[]>([]);
  const [linkedCount, setLinkedCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!activeAccountId || !isActiveConnected) {
        setListings([]);
        setLinkedCount(0);
        return;
      }
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await supabase
          .from("ecommerce_listings")
          .select("id, product_id, ml_item_id, title, price, status, is_active, updated_at")
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .eq("account_id", activeAccountId);
        if (error) throw error;
        if (cancelled) return;
        const list = (data as Listing[]) ?? [];
        setListings(list);
        const linked = new Set(
          list.filter((l) => l.product_id).map((l) => l.product_id as string),
        );
        setLinkedCount(linked.size);
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : "Erro ao carregar dados");
          setListings([]);
          setLinkedCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeAccountId, isActiveConnected]);

  const metrics = useMemo(() => {
    const total = listings.length;
    const isActiveStatus = (l: Listing) =>
      (l.status ?? "").toLowerCase() === "active" || l.is_active === true;
    const isPausedStatus = (l: Listing) =>
      (l.status ?? "").toLowerCase() === "paused";
    const active = listings.filter(isActiveStatus).length;
    const paused = listings.filter(isPausedStatus).length;
    const inactive = listings.filter(
      (l) => !isActiveStatus(l) && !isPausedStatus(l),
    ).length;
    const prices = listings
      .map((l) => (typeof l.price === "number" ? l.price : Number(l.price)))
      .filter((n) => Number.isFinite(n) && n > 0) as number[];
    const avgPrice = prices.length
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : 0;
    const alertCount = paused + inactive;
    const lastListingSync = listings.reduce<string | null>((acc, l) => {
      if (!l.updated_at) return acc;
      if (!acc || new Date(l.updated_at) > new Date(acc)) return l.updated_at;
      return acc;
    }, null);
    return { total, active, paused, inactive, avgPrice, alertCount, lastListingSync };
  }, [listings]);

  const accountName =
    activeAccount?.account_name || activeAccount?.nickname || "—";
  const lastSync =
    activeAccount?.last_sync_at || metrics.lastListingSync || null;

  const showEmptyState =
    !accountLoading && (!activeAccount || !isActiveConnected || (!loading && metrics.total === 0));

  const realKpis = [
    { label: "Total de anúncios", value: numberFmt.format(metrics.total), icon: Tag, accent: "from-blue-700 to-blue-900" },
    { label: "Anúncios ativos", value: numberFmt.format(metrics.active), icon: PlayCircle, accent: "from-emerald-600 to-emerald-800" },
    { label: "Anúncios pausados", value: numberFmt.format(metrics.paused), icon: PauseCircle, accent: "from-amber-600 to-orange-700" },
    { label: "Produtos vinculados", value: numberFmt.format(linkedCount), icon: Link2, accent: "from-indigo-600 to-indigo-800" },
    { label: "Preço médio dos anúncios", value: metrics.avgPrice > 0 ? currencyFmt.format(metrics.avgPrice) : "—", icon: DollarSign, accent: "from-sky-600 to-sky-800" },
    { label: "Produtos em alerta", value: numberFmt.format(metrics.alertCount), icon: AlertTriangle, accent: "from-rose-700 to-red-900" },
    { label: "Ações prioritárias", value: numberFmt.format(metrics.paused), icon: Flame, accent: "from-red-700 to-red-900" },
    { label: "Última sincronização", value: formatDateTime(lastSync), icon: Clock, accent: "from-slate-600 to-slate-800", small: true },
  ];

  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <Activity className="h-3.5 w-3.5" />
            Inteligência Executiva
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Visão Geral{accountName !== "—" ? ` — ${accountName}` : ""}
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Acompanhe a saúde da operação, os principais riscos, oportunidades
            e ações prioritárias do e-commerce.
          </p>
          {activeAccount && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span
                className={
                  isActiveConnected
                    ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700"
                    : "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700"
                }
              >
                <PlugZap className="h-3 w-3" />
                {isActiveConnected ? "Conta conectada" : "Aguardando conexão"}
              </span>
              {lastSync && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <RefreshCcw className="h-3 w-3" />
                  Última sincronização: {formatDateTime(lastSync)}
                </span>
              )}
            </div>
          )}
        </header>

        {showEmptyState ? (
          <section className="rounded-2xl border border-border/60 bg-card p-10 shadow-[var(--shadow-soft)] text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <PlugZap className="h-7 w-7" />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-foreground">
              Esta conta ainda não possui dados sincronizados.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Conecte a conta Mercado Livre e realize a primeira sincronização
              para visualizar a visão geral da operação.
            </p>
            <Link
              to="/ecommerce/contas"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Ir para contas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        ) : (
          <>
            {/* KPIs reais */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {realKpis.map((k) => {
                const Icon = k.icon;
                return (
                  <div
                    key={k.label}
                    className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]"
                  >
                    <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${k.accent} opacity-10`} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {k.label}
                        </div>
                        <div
                          className={`font-display font-bold text-foreground truncate ${
                            k.small ? "text-base md:text-lg" : "text-3xl"
                          }`}
                          title={k.value}
                        >
                          {loading ? "…" : k.value}
                        </div>
                      </div>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${k.accent} text-white shadow-md`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* KPIs em monitoramento (vendas/faturamento) */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
                  Em monitoramento
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  Dados de vendas e faturamento serão exibidos após a integração de pedidos.
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {monitoringKpis.map((k) => {
                  const Icon = k.icon;
                  return (
                    <div
                      key={k.label}
                      className="relative overflow-hidden rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {k.label}
                          </div>
                          <div className="font-display text-3xl font-bold text-foreground/40">
                            —
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Em monitoramento.
                          </div>
                        </div>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${k.accent} text-white shadow-md opacity-70`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {errorMsg && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMsg}
              </div>
            )}
          </>
        )}

        {/* Resumo da IA Executiva */}
        <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-white p-5 shadow-[var(--shadow-soft)]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-md">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Resumo da IA Executiva
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                  <Sparkles className="h-3 w-3" />
                  Inteligência
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
                Após a sincronização completa dos dados de vendas, esta área
                apresentará uma leitura objetiva da operação: principais
                riscos, oportunidades de crescimento, produtos críticos e
                ações que merecem prioridade.
              </p>
            </div>
          </div>
        </section>

        {/* Saúde da Operação */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Saúde da Operação
            </h2>
            <p className="text-xs text-muted-foreground">
              Diagnóstico geral dos quatro pilares estratégicos do e-commerce.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {saude.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex flex-col rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.accent} text-white shadow-sm`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {s.label}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug flex-1">
                    {s.desc}
                  </p>
                  <Link
                    to={s.to}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    Abrir
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Ações prioritárias da semana */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
                <Target className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Ações prioritárias da semana
                </h2>
                <p className="text-xs text-muted-foreground max-w-2xl">
                  Resumo executivo das ações mais importantes vindas da Central
                  de Ações.
                </p>
              </div>
            </div>
            <Link
              to="/ecommerce/prioridades"
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Abrir Central de Ações
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5 py-16 text-center">
            <div className="mx-auto max-w-md space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="font-display text-base font-semibold text-foreground">
                Aguardando geração automática
              </div>
              <p className="text-sm text-muted-foreground">
                As ações prioritárias serão exibidas após a geração automática
                da Central de Ações.
              </p>
            </div>
          </div>
        </section>

        {/* Atalhos estratégicos */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Atalhos estratégicos
            </h2>
            <p className="text-xs text-muted-foreground">
              Acesso rápido às telas que compõem a inteligência operacional.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {atalhos.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.label}
                  to={a.to}
                  className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-sm">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-sm font-bold text-foreground">
                    {a.label}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Como interpretar */}
        <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-blue-50/60 to-transparent p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
              <Lightbulb className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-display text-sm font-bold text-foreground">
              Como interpretar
            </h3>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
            A Visão Geral concentra os principais sinais da operação. Ela não
            substitui as telas detalhadas, mas ajuda o gestor a entender
            rapidamente onde existem riscos, oportunidades e prioridades de
            execução.
          </p>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-white/60 p-3 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-700" />
            <span>
              Indicadores financeiros (faturamento, pedidos, ticket médio e
              margem) permanecem em monitoramento até a integração dos dados
              de vendas.
            </span>
          </div>
        </section>
      </div>
    </EcommerceLayout>
  );
}

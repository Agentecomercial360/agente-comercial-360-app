import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  BrainCircuit,
  DollarSign,
  ShoppingBag,
  Receipt,
  Percent,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
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
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/dashboard")({
  component: VisaoGeral,
  head: () => ({
    meta: [{ title: "Visão Geral | Agente Comercial 360" }],
  }),
});

const kpis = [
  { label: "Faturamento do período", icon: DollarSign, accent: "from-emerald-600 to-emerald-800" },
  { label: "Pedidos", icon: ShoppingBag, accent: "from-blue-700 to-blue-900" },
  { label: "Ticket médio", icon: Receipt, accent: "from-indigo-600 to-indigo-800" },
  { label: "Margem estimada", icon: Percent, accent: "from-violet-600 to-violet-800" },
  { label: "Crescimento mensal", icon: TrendingUp, accent: "from-sky-600 to-sky-800" },
  { label: "Produtos em alerta", icon: AlertTriangle, accent: "from-amber-600 to-orange-700" },
  { label: "Risco de ruptura", icon: ShieldAlert, accent: "from-rose-700 to-red-900" },
  { label: "Ações prioritárias", icon: Flame, accent: "from-red-700 to-red-900" },
];

const saude = [
  {
    label: "Produtos",
    desc: "Identifica oportunidades, produtos problema e concentração de faturamento.",
    icon: Package,
    to: "/ecommerce/produtos",
    accent: "from-blue-700 to-blue-900",
  },
  {
    label: "Estoque",
    desc: "Monitora cobertura, giro, ruptura e necessidade de reposição.",
    icon: Boxes,
    to: "/ecommerce/estoque",
    accent: "from-indigo-600 to-indigo-800",
  },
  {
    label: "Ads",
    desc: "Avalia investimento, retorno, eficiência e campanhas com potencial de escala.",
    icon: Megaphone,
    to: "/ecommerce/ads",
    accent: "from-emerald-600 to-emerald-800",
  },
  {
    label: "Execução",
    desc: "Organiza prioridades, tarefas e resultados das ações da equipe.",
    icon: ListChecks,
    to: "/ecommerce/prioridades",
    accent: "from-violet-600 to-violet-800",
  },
] as const;

const alertas = [
  { label: "Ruptura de estoque", dot: "bg-rose-600", badge: "text-rose-700", ring: "border-rose-200 bg-rose-50/60" },
  { label: "Produto sem venda", dot: "bg-slate-500", badge: "text-slate-700", ring: "border-slate-200 bg-slate-50/60" },
  { label: "Queda de desempenho", dot: "bg-orange-600", badge: "text-orange-700", ring: "border-orange-200 bg-orange-50/60" },
  { label: "Ads com baixo retorno", dot: "bg-amber-500", badge: "text-amber-700", ring: "border-amber-200 bg-amber-50/60" },
  { label: "Ação atrasada", dot: "bg-red-700", badge: "text-red-700", ring: "border-red-200 bg-red-50/60" },
  { label: "Oportunidade de crescimento", dot: "bg-emerald-600", badge: "text-emerald-700", ring: "border-emerald-200 bg-emerald-50/60" },
];

const colsAcoes = [
  "Prioridade",
  "Origem",
  "Ação sugerida",
  "Responsável",
  "Prazo",
  "Status",
];

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

function VisaoGeral() {
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
            Visão Geral
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Acompanhe a saúde da operação, os principais riscos, oportunidades
            e ações prioritárias do e-commerce.
          </p>
        </header>

        {/* KPIs executivos */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${k.accent} opacity-10`}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {k.label}
                    </div>
                    <div className="font-display text-3xl font-bold text-foreground/40">
                      —
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Será calculado após sincronização dos dados reais da
                      operação.
                    </div>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${k.accent} text-white shadow-md`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

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
                Após a sincronização dos dados, esta área apresentará uma
                leitura objetiva da operação: principais riscos, oportunidades
                de crescimento, produtos críticos e ações que merecem
                prioridade.
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
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.accent} text-white shadow-sm`}
                    >
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

        {/* Principais alertas */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-700 text-white">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Principais alertas
              </h2>
              <p className="text-xs text-muted-foreground">
                Categorias de alerta que o sistema poderá emitir após a
                leitura dos dados reais.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {alertas.map((a) => (
              <div key={a.label} className={`rounded-xl border p-4 ${a.ring}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${a.dot}`} />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${a.badge}`}
                  >
                    {a.label}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Aguardando dados reais para geração automática.
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Nenhum alerta gerado ainda. Os alertas serão criados após a
              leitura dos dados reais da operação.
            </span>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {colsAcoes.map((c) => (
                    <th
                      key={c}
                      className="px-5 py-3 text-left font-semibold whitespace-nowrap"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={colsAcoes.length}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto max-w-md space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="font-display text-base font-semibold text-foreground">
                        Aguardando geração automática
                      </div>
                      <p className="text-sm text-muted-foreground">
                        As ações prioritárias serão exibidas após a geração
                        automática da Central de Ações.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
              Tela preparada. Nenhum dado fictício é exibido até a primeira
              sincronização da operação.
            </span>
          </div>
        </section>
      </div>
    </EcommerceLayout>
  );
}

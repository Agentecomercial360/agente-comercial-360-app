import { createFileRoute } from "@tanstack/react-router";
import {
  Zap,
  DollarSign,
  TrendingUp,
  Target,
  MousePointerClick,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Lightbulb,
  Info,
  Calculator,
  Megaphone,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { AdsActions } from "@/components/ecommerce/ActionButtons";

export const Route = createFileRoute("/ecommerce/ads")({
  component: AnunciosAds,
  head: () => ({
    meta: [{ title: "Anúncios e Ads | Agente Comercial 360" }],
  }),
});

const kpis = [
  { label: "Investimento total", icon: DollarSign, accent: "from-blue-700 to-blue-900" },
  { label: "Receita atribuída aos anúncios", icon: TrendingUp, accent: "from-emerald-600 to-emerald-800" },
  { label: "ROAS médio", icon: Target, accent: "from-sky-600 to-sky-800" },
  { label: "ACOS médio", icon: Percent, accent: "from-amber-600 to-orange-700" },
  { label: "CTR médio", icon: MousePointerClick, accent: "from-violet-600 to-violet-800" },
  { label: "CPC médio", icon: DollarSign, accent: "from-slate-600 to-slate-800" },
  { label: "Campanhas com potencial de escala", icon: ArrowUpRight, accent: "from-emerald-700 to-emerald-900" },
  { label: "Campanhas com baixa eficiência", icon: ArrowDownRight, accent: "from-rose-600 to-rose-800" },
];

const leitura = [
  {
    label: "Escalar",
    desc: "Campanhas com bom retorno e espaço para aumento de orçamento.",
    dot: "bg-emerald-600",
    ring: "border-emerald-200 bg-emerald-50/60",
    badge: "text-emerald-700",
  },
  {
    label: "Otimizar",
    desc: "Campanhas com resultado intermediário que exigem ajuste.",
    dot: "bg-amber-500",
    ring: "border-amber-200 bg-amber-50/60",
    badge: "text-amber-700",
  },
  {
    label: "Reduzir",
    desc: "Campanhas com baixa eficiência ou custo alto.",
    dot: "bg-rose-600",
    ring: "border-rose-200 bg-rose-50/60",
    badge: "text-rose-700",
  },
  {
    label: "Oportunidade",
    desc: "Produtos rentáveis que ainda podem receber Ads.",
    dot: "bg-blue-700",
    ring: "border-blue-200 bg-blue-50/60",
    badge: "text-blue-700",
  },
];

const campCols = [
  "Campanha",
  "Produto / SKU",
  "Investimento",
  "Vendas geradas",
  "ROAS",
  "ACOS",
  "CTR",
  "CPC",
  "Status",
  "Ação sugerida",
];

const regras = [
  "Investimento",
  "Receita atribuída",
  "ROAS",
  "ACOS",
  "CTR",
  "CPC",
  "Conversão",
  "Relação entre produto rentável e presença em Ads",
];

function AnunciosAds() {
  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <Zap className="h-3.5 w-3.5" />
            Inteligência de Performance
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Anúncios e Ads
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Analise investimento, retorno, eficiência e oportunidades de escala
            nas campanhas.
          </p>
        </header>
        <AdsActions />


        {/* KPIs */}
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
                      Será calculado após sincronização de campanhas, vendas e
                      performance.
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

        {/* Leitura estratégica */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Leitura estratégica
            </h2>
            <p className="text-xs text-muted-foreground">
              Categorias usadas para priorizar decisões de investimento e ajuste
              de campanhas.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {leitura.map((c) => (
              <div key={c.label} className={`rounded-xl border p-4 ${c.ring}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${c.badge}`}>
                    {c.label}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-snug">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tabela Campanhas */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Campanhas
              </h2>
              <p className="text-xs text-muted-foreground">
                Visão consolidada de cada campanha com indicadores de retorno e
                eficiência.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
              Aguardando sincronização
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {campCols.map((c) => (
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
                  <td colSpan={campCols.length} className="px-5 py-16 text-center">
                    <div className="mx-auto max-w-md space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <Megaphone className="h-6 w-6" />
                      </div>
                      <div className="font-display text-base font-semibold text-foreground">
                        Nenhuma campanha sincronizada
                      </div>
                      <p className="text-sm text-muted-foreground">
                        A análise será exibida após integração dos dados de Ads.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Ações sugeridas pela IA */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-700" />
                Ações sugeridas pela IA
              </h2>
              <p className="text-xs text-muted-foreground">
                Recomendações automáticas baseadas em retorno, eficiência e
                oportunidades.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {[
              "Aumentar orçamento",
              "Reduzir orçamento",
              "Pausar campanha",
              "Testar criativo",
              "Revisar preço",
              "Ativar Ads em produto rentável",
              "Revisar baixa conversão",
            ].map((a) => (
              <span
                key={a}
                className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground text-center"
              >
                {a}
              </span>
            ))}
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              As ações automáticas serão sugeridas após leitura de performance
              das campanhas.
            </p>
          </div>
        </section>

        {/* Regras + Como ajuda */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-white">
                <Calculator className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-display text-sm font-bold text-foreground">
                Regras de análise
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              A análise considerará, quando os dados estiverem sincronizados:
            </p>
            <ul className="space-y-1.5 text-sm text-foreground/80">
              {regras.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-blue-50/60 to-transparent p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
                <Lightbulb className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-display text-sm font-bold text-foreground">
                Como essa análise ajuda a operação
              </h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              O objetivo desta tela é indicar quais campanhas devem ser
              escaladas, otimizadas ou reduzidas, além de revelar oportunidades
              de crescimento com base em retorno e eficiência.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-white/60 p-3 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-700" />
              <span>
                Tela preparada. Nenhum dado fictício é exibido até a primeira
                sincronização das campanhas.
              </span>
            </div>
          </div>
        </section>
      </div>
    </EcommerceLayout>
  );
}

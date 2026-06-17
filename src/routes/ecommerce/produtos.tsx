import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  TrendingUp,
  Rocket,
  Flame,
  MousePointerClick,
  Megaphone,
  PackagePlus,
  Star,
  ShoppingCart,
  Boxes,
  Eye,
  ShieldCheck,
  Percent,
  Tag,
  ListChecks,
  Lightbulb,
  Calculator,
  Info,
  Target,
  Award,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/produtos")({
  component: InteligenciaProdutos,
  head: () => ({
    meta: [{ title: "Inteligência de Produtos | Agente Comercial 360" }],
  }),
});

const kpis = [
  { label: "Produtos com alto potencial", icon: Sparkles, accent: "from-blue-700 to-blue-900" },
  { label: "Produtos em crescimento", icon: TrendingUp, accent: "from-emerald-600 to-emerald-800" },
  { label: "Novos sucessos", icon: Rocket, accent: "from-violet-600 to-violet-800" },
  { label: "Alta conversão", icon: MousePointerClick, accent: "from-sky-600 to-sky-800" },
  { label: "Potencial para Ads", icon: Megaphone, accent: "from-amber-600 to-orange-700" },
  { label: "Oportunidade de reposição", icon: PackagePlus, accent: "from-indigo-600 to-indigo-800" },
];

const cols = [
  "SKU",
  "Produto",
  "Vendas recentes",
  "Crescimento",
  "Conversão",
  "Estoque atual",
  "Potencial identificado",
  "Ação sugerida",
  "Prioridade",
];

const tipos = [
  { label: "Produto em crescimento", desc: "Produto com vendas acima da média recente.", dot: "bg-emerald-600", ring: "border-emerald-200 bg-emerald-50/60", badge: "text-emerald-700", icon: TrendingUp },
  { label: "Novo sucesso", desc: "Produto recém-lançado que vendeu rapidamente.", dot: "bg-violet-600", ring: "border-violet-200 bg-violet-50/60", badge: "text-violet-700", icon: Rocket },
  { label: "Alta conversão", desc: "Produto que transforma visitas em vendas com boa eficiência.", dot: "bg-sky-600", ring: "border-sky-200 bg-sky-50/60", badge: "text-sky-700", icon: MousePointerClick },
  { label: "Potencial para Ads", desc: "Produto com bom desempenho orgânico e espaço para escala paga.", dot: "bg-amber-500", ring: "border-amber-200 bg-amber-50/60", badge: "text-amber-700", icon: Megaphone },
  { label: "Reposição estratégica", desc: "Produto com boa saída e necessidade de compra antecipada.", dot: "bg-indigo-600", ring: "border-indigo-200 bg-indigo-50/60", badge: "text-indigo-700", icon: PackagePlus },
  { label: "Produto Classe A", desc: "Produto que concentra faturamento, lucro ou prioridade operacional.", dot: "bg-blue-700", ring: "border-blue-200 bg-blue-50/60", badge: "text-blue-700", icon: Award },
];

const colsNovos = [
  "SKU",
  "Produto",
  "Estoque inicial",
  "Vendas no período",
  "Dias até vender",
  "Classificação",
  "Sugestão",
];

const acoes = [
  { label: "Aumentar compra", icon: ShoppingCart, accent: "from-blue-700 to-blue-900" },
  { label: "Escalar Ads", icon: Rocket, accent: "from-emerald-600 to-emerald-800" },
  { label: "Repor estoque", icon: Boxes, accent: "from-indigo-600 to-indigo-800" },
  { label: "Destacar produto", icon: Star, accent: "from-amber-600 to-orange-700" },
  { label: "Proteger estoque", icon: ShieldCheck, accent: "from-sky-600 to-sky-800" },
  { label: "Monitorar margem", icon: Percent, accent: "from-violet-600 to-violet-800" },
  { label: "Revisar preço para escala", icon: Tag, accent: "from-rose-600 to-rose-800" },
  { label: "Criar prioridade para operador", icon: ListChecks, accent: "from-slate-700 to-slate-900" },
];

const regras = [
  "Vendas recentes",
  "Histórico de vendas",
  "Crescimento percentual",
  "Conversão",
  "Estoque atual",
  "Giro",
  "Margem",
  "Curva ABC",
  "Performance orgânica",
  "Performance em Ads",
  "Velocidade de venda após lançamento",
];

function InteligenciaProdutos() {
  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <Target className="h-3.5 w-3.5" />
            Diagnóstico de Oportunidades
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Inteligência de Produtos
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Identifique produtos com maior potencial de crescimento, escala,
            reposição e ganho de performance.
          </p>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                      Será calculado após sincronização dos produtos, pedidos,
                      estoque e métricas de desempenho.
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

        {/* Oportunidades por produto */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Oportunidades por produto
                </h2>
                <p className="text-xs text-muted-foreground max-w-2xl">
                  Produtos com sinais positivos, potencial identificado e ação
                  recomendada para escala.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {cols.map((c) => (
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
                  <td colSpan={cols.length} className="px-5 py-16 text-center">
                    <div className="mx-auto max-w-md space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div className="font-display text-base font-semibold text-foreground">
                        Nenhuma oportunidade identificada ainda
                      </div>
                      <p className="text-sm text-muted-foreground">
                        A análise será gerada após a leitura dos dados reais da
                        operação.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Tipos de oportunidade */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Tipos de oportunidade
            </h2>
            <p className="text-xs text-muted-foreground">
              Categorias usadas pelo sistema para classificar produtos com
              potencial de crescimento.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {tipos.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className={`rounded-xl border p-4 ${t.ring}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${t.badge}`}
                    >
                      {t.label}
                    </span>
                    <Icon className={`ml-auto h-3.5 w-3.5 ${t.badge}`} />
                  </div>
                  <p className="text-sm text-foreground/80 leading-snug">
                    {t.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Detecção de novos sucessos */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 text-white">
                <Flame className="h-3.5 w-3.5" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Detecção de novos sucessos
              </h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-3xl">
              O sistema poderá identificar produtos que venderam rápido logo
              após o lançamento e classificá-los como oportunidades de compra
              ampliada.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {colsNovos.map((c) => (
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
                    colSpan={colsNovos.length}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto max-w-md space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                        <Rocket className="h-6 w-6" />
                      </div>
                      <div className="font-display text-base font-semibold text-foreground">
                        Nenhum novo sucesso detectado ainda
                      </div>
                      <p className="text-sm text-muted-foreground">
                        A detecção será realizada após a sincronização dos
                        lançamentos e vendas recentes.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Ações recomendadas */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Ações recomendadas
            </h2>
            <p className="text-xs text-muted-foreground">
              Categorias de ação que o sistema poderá sugerir para escalar
              produtos com potencial.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {acoes.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.label}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${a.accent} text-white shadow-sm`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {a.label}
                    </div>
                  </div>
                </div>
              );
            })}
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
              A identificação de oportunidades considerará, quando os dados
              estiverem sincronizados:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-foreground/80">
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
                Como essa tela ajuda a operação
              </h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Essa tela ajuda a equipe a enxergar onde estão as melhores
              oportunidades da operação. Em vez de olhar apenas produtos com
              problema, o sistema identifica produtos com potencial para
              crescer, escalar vendas, receber investimento em Ads ou
              antecipar compras.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-white/60 p-3 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-700" />
              <span>
                Tela preparada. Nenhuma oportunidade fictícia é exibida até a
                primeira sincronização e análise dos dados reais.
              </span>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                Foco em crescimento: o sistema também observa produtos novos
                com alta velocidade de venda.
              </span>
            </div>
          </div>
        </section>
      </div>
    </EcommerceLayout>
  );
}

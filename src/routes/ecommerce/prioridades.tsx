import { createFileRoute } from "@tanstack/react-router";
import {
  ListChecks,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CircleDot,
  TrendingUp,
  ShoppingCart,
  PenSquare,
  Tag,
  Rocket,
  ArrowDownRight,
  Flame,
  Lightbulb,
  Calculator,
  Info,
  Target,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/prioridades")({
  component: CentralAcoes,
  head: () => ({
    meta: [{ title: "Central de Ações | Agente Comercial 360" }],
  }),
});

const kpis = [
  { label: "Ações de alta prioridade", icon: Flame, accent: "from-rose-600 to-rose-800" },
  { label: "Ações de média prioridade", icon: CircleDot, accent: "from-amber-600 to-orange-700" },
  { label: "Ações de baixa prioridade", icon: ListChecks, accent: "from-slate-600 to-slate-800" },
  { label: "Ações vencidas", icon: AlertTriangle, accent: "from-red-700 to-red-900" },
  { label: "Ações concluídas na semana", icon: CheckCircle2, accent: "from-emerald-600 to-emerald-800" },
  { label: "Impacto estimado", icon: TrendingUp, accent: "from-blue-700 to-blue-900" },
];

const cols = [
  "Prioridade",
  "Origem",
  "Produto / SKU",
  "Ação sugerida",
  "Motivo",
  "Responsável",
  "Prazo",
  "Status",
];

const origens = ["Estoque", "Curva ABC", "Ads", "Produto Problema", "Oportunidade"];

const tipos = [
  { label: "Comprar", desc: "Sugerir reposição quando houver risco de ruptura.", icon: ShoppingCart, accent: "from-blue-700 to-blue-900" },
  { label: "Corrigir anúncio", desc: "Indicar melhorias em título, foto, descrição ou campos obrigatórios.", icon: PenSquare, accent: "from-sky-600 to-sky-800" },
  { label: "Revisar preço", desc: "Apontar produtos fora da faixa ideal de margem ou competitividade.", icon: Tag, accent: "from-violet-600 to-violet-800" },
  { label: "Escalar Ads", desc: "Identificar campanhas com bom retorno e potencial de aumento de orçamento.", icon: Rocket, accent: "from-emerald-600 to-emerald-800" },
  { label: "Reduzir Ads", desc: "Apontar campanhas com baixo retorno ou custo elevado.", icon: ArrowDownRight, accent: "from-rose-600 to-rose-800" },
  { label: "Liquidar estoque", desc: "Identificar produtos parados ou com baixo giro.", icon: Tag, accent: "from-amber-600 to-orange-700" },
];

const priorizacao = [
  { label: "Alta prioridade", desc: "Impacta venda, ruptura, margem ou campanha crítica.", dot: "bg-rose-600", ring: "border-rose-200 bg-rose-50/60", badge: "text-rose-700" },
  { label: "Média prioridade", desc: "Melhorias importantes, mas sem risco imediato.", dot: "bg-amber-500", ring: "border-amber-200 bg-amber-50/60", badge: "text-amber-700" },
  { label: "Baixa prioridade", desc: "Ajustes operacionais e melhorias de cadastro.", dot: "bg-slate-500", ring: "border-slate-200 bg-slate-50/60", badge: "text-slate-700" },
];

const regras = [
  "Vendas recentes",
  "Estoque atual",
  "Giro",
  "Curva ABC",
  "Margem",
  "ROAS",
  "ACOS",
  "Queda de vendas",
  "Produtos parados",
  "Risco de ruptura",
  "Oportunidades de crescimento",
];

function CentralAcoes() {
  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <Target className="h-3.5 w-3.5" />
            Execução Orientada por Dados
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Central de Ações
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Priorize o que precisa ser feito na operação com base em dados de
            vendas, estoque, anúncios e desempenho dos produtos.
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
                      Será calculado após a sincronização dos dados e geração
                      automática das prioridades.
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

        {/* Fila de prioridades */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Fila de prioridades
              </h2>
              <p className="text-xs text-muted-foreground">
                Tarefas geradas automaticamente a partir das análises do
                sistema.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {origens.map((o) => (
                <span
                  key={o}
                  className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {o}
                </span>
              ))}
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
                        <ListChecks className="h-6 w-6" />
                      </div>
                      <div className="font-display text-base font-semibold text-foreground">
                        Nenhuma prioridade gerada
                      </div>
                      <p className="text-sm text-muted-foreground">
                        As prioridades serão geradas automaticamente após a
                        leitura dos dados reais da operação.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Tipos de ações */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Tipos de ações que o sistema poderá gerar
            </h2>
            <p className="text-xs text-muted-foreground">
              Categorias de tarefas que serão sugeridas automaticamente.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {tipos.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.label}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${t.accent} text-white shadow-sm`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-foreground">
                        {t.label}
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {t.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Priorização */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Priorização
            </h2>
            <p className="text-xs text-muted-foreground">
              Lógica usada para classificar a urgência das ações geradas.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {priorizacao.map((p) => (
              <div key={p.label} className={`rounded-xl border p-4 ${p.ring}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${p.badge}`}>
                    {p.label}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-snug">
                  {p.desc}
                </p>
              </div>
            ))}
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
                Regras de geração
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              A geração de prioridades considerará, quando os dados estiverem
              sincronizados:
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
              O objetivo da Central de Ações é transformar análises em tarefas
              claras para os operadores. Em vez de cada pessoa decidir pelo
              achismo, o sistema indica o que fazer, por que fazer e qual
              prioridade seguir.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-white/60 p-3 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-700" />
              <span>
                Tela preparada. Nenhuma prioridade fictícia é exibida até a
                primeira sincronização e geração automática.
              </span>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                Lista semanal de prioridades pensada para execução pelos
                operadores.
              </span>
            </div>
          </div>
        </section>
      </div>
    </EcommerceLayout>
  );
}

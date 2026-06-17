import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Minus,
  DollarSign,
  ShieldCheck,
  Rocket,
  ArrowLeftRight,
  History,
  Lightbulb,
  Calculator,
  Info,
  Activity,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/resultados")({
  component: ResultadosAcoes,
  head: () => ({
    meta: [{ title: "Resultados das Ações | Agente Comercial 360" }],
  }),
});

const kpis = [
  { label: "Ações concluídas", icon: CheckCircle2, accent: "from-emerald-600 to-emerald-800" },
  { label: "Ações com impacto positivo", icon: TrendingUp, accent: "from-emerald-700 to-green-900" },
  { label: "Ações sem impacto", icon: Minus, accent: "from-slate-600 to-slate-800" },
  { label: "Receita estimada gerada", icon: DollarSign, accent: "from-blue-700 to-blue-900" },
  { label: "Estoque protegido", icon: ShieldCheck, accent: "from-indigo-600 to-indigo-800" },
  { label: "Campanhas otimizadas", icon: Rocket, accent: "from-violet-600 to-violet-800" },
];

const colsAntesDepois = [
  "Produto / SKU",
  "Ação executada",
  "Indicador analisado",
  "Antes da ação",
  "Depois da ação",
  "Variação",
  "Resultado",
];

const colsHistorico = [
  "Data",
  "Ação executada",
  "Origem",
  "Produto / SKU",
  "Responsável",
  "Status",
  "Impacto identificado",
  "Observação da IA",
];

const classificacao = [
  {
    label: "Impacto positivo",
    desc: "A ação melhorou vendas, margem, estoque ou eficiência.",
    dot: "bg-emerald-600",
    ring: "border-emerald-200 bg-emerald-50/60",
    badge: "text-emerald-700",
    icon: TrendingUp,
  },
  {
    label: "Sem impacto",
    desc: "A ação foi executada, mas ainda não apresentou melhora relevante.",
    dot: "bg-slate-500",
    ring: "border-slate-200 bg-slate-50/60",
    badge: "text-slate-700",
    icon: Minus,
  },
  {
    label: "Impacto negativo",
    desc: "A ação pode ter reduzido desempenho e exige revisão.",
    dot: "bg-rose-600",
    ring: "border-rose-200 bg-rose-50/60",
    badge: "text-rose-700",
    icon: AlertTriangle,
  },
  {
    label: "Em observação",
    desc: "O sistema ainda está aguardando dados suficientes para avaliar.",
    dot: "bg-amber-500",
    ring: "border-amber-200 bg-amber-50/60",
    badge: "text-amber-700",
    icon: Eye,
  },
];

const regras = [
  "Vendas antes e depois",
  "Estoque antes e depois",
  "ROAS antes e depois",
  "ACOS antes e depois",
  "Conversão",
  "Margem",
  "Giro",
  "Receita gerada",
  "Redução de risco de ruptura",
];

function ResultadosAcoes() {
  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <Activity className="h-3.5 w-3.5" />
            Medição de Impacto
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Resultados das Ações
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Acompanhe o impacto das ações executadas pela equipe em vendas,
            estoque, anúncios e desempenho dos produtos.
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
                      Será calculado após execução das tarefas e leitura dos
                      resultados.
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

        {/* Antes e Depois */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Antes e Depois
                </h2>
                <p className="text-xs text-muted-foreground max-w-2xl">
                  Comparativo do desempenho de cada produto antes e depois da
                  ação executada.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {colsAntesDepois.map((c) => (
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
                    colSpan={colsAntesDepois.length}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto max-w-md space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div className="font-display text-base font-semibold text-foreground">
                        Aguardando execução das ações
                      </div>
                      <p className="text-sm text-muted-foreground">
                        A comparação antes e depois será exibida após a
                        execução das ações e sincronização dos novos dados.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Histórico */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-white">
                <History className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Histórico de ações executadas
                </h2>
                <p className="text-xs text-muted-foreground max-w-2xl">
                  Registro completo das ações concluídas pela equipe e seus
                  efeitos observados na operação.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {colsHistorico.map((c) => (
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
                    colSpan={colsHistorico.length}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto max-w-md space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="font-display text-base font-semibold text-foreground">
                        Nenhuma ação executada ainda
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Quando a equipe começar a concluir tarefas, o
                        histórico aparecerá aqui com o impacto identificado.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Classificação */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Classificação do resultado
            </h2>
            <p className="text-xs text-muted-foreground">
              Como o sistema classifica cada ação após avaliar o impacto.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {classificacao.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className={`rounded-xl border p-4 ${c.ring}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${c.badge}`}
                    >
                      {c.label}
                    </span>
                    <Icon className={`ml-auto h-3.5 w-3.5 ${c.badge}`} />
                  </div>
                  <p className="text-sm text-foreground/80 leading-snug">
                    {c.desc}
                  </p>
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
              A avaliação do impacto considerará, quando os dados estiverem
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
                Como essa tela ajuda a gestão
              </h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Essa tela mostra se as ações recomendadas realmente geraram
              resultado. Assim, a operação deixa de apenas executar tarefas e
              passa a aprender com os dados, entendendo o que funcionou, o que
              precisa ser ajustado e onde existe maior impacto.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-white/60 p-3 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-700" />
              <span>
                Tela preparada. Nenhum resultado fictício é exibido até a
                execução das ações e a leitura dos novos dados da operação.
              </span>
            </div>
          </div>
        </section>
      </div>
    </EcommerceLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarX,
  CalendarOff,
  CalendarClock,
  TrendingDown,
  MousePointerClick,
  PackageX,
  Image as ImageIcon,
  Type,
  FileText,
  Tag,
  Megaphone,
  PackageOpen,
  PauseCircle,
  Ban,
  Stethoscope,
  Lightbulb,
  Calculator,
  Info,
  Eye,
  Percent,
  Activity,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/produtos-travados")({
  component: ProdutosProblema,
  head: () => ({
    meta: [{ title: "Produtos Problema | Agente Comercial 360" }],
  }),
});

const kpis = [
  { label: "Sem venda há 30 dias", icon: CalendarClock, accent: "from-amber-600 to-orange-700" },
  { label: "Sem venda há 60 dias", icon: CalendarOff, accent: "from-orange-700 to-rose-700" },
  { label: "Sem venda há 90 dias", icon: CalendarX, accent: "from-rose-700 to-red-900" },
  { label: "Queda de vendas", icon: TrendingDown, accent: "from-rose-600 to-rose-800" },
  { label: "Baixa conversão", icon: MousePointerClick, accent: "from-violet-600 to-violet-800" },
  { label: "Estoque parado", icon: PackageX, accent: "from-slate-600 to-slate-800" },
];

const cols = [
  "SKU",
  "Produto",
  "Última venda",
  "Dias sem venda",
  "Estoque atual",
  "Conversão",
  "Tendência",
  "Problema identificado",
  "Ação sugerida",
];

const tipos = [
  { label: "Sem venda", desc: "Produto sem pedidos recentes dentro do período analisado.", dot: "bg-rose-600", ring: "border-rose-200 bg-rose-50/60", badge: "text-rose-700", icon: CalendarX },
  { label: "Queda de desempenho", desc: "Produto que perdeu vendas em relação ao histórico anterior.", dot: "bg-orange-600", ring: "border-orange-200 bg-orange-50/60", badge: "text-orange-700", icon: TrendingDown },
  { label: "Baixa conversão", desc: "Produto com visitas, mas pouca ou nenhuma venda.", dot: "bg-violet-600", ring: "border-violet-200 bg-violet-50/60", badge: "text-violet-700", icon: MousePointerClick },
  { label: "Estoque parado", desc: "Produto com estoque disponível, mas baixo giro.", dot: "bg-slate-500", ring: "border-slate-200 bg-slate-50/60", badge: "text-slate-700", icon: PackageX },
  { label: "Perda de relevância", desc: "Produto com queda de exposição, visitas ou competitividade.", dot: "bg-amber-500", ring: "border-amber-200 bg-amber-50/60", badge: "text-amber-700", icon: Eye },
  { label: "Margem comprometida", desc: "Produto que vende, mas pode não gerar resultado suficiente.", dot: "bg-blue-600", ring: "border-blue-200 bg-blue-50/60", badge: "text-blue-700", icon: Percent },
];

const acoes = [
  { label: "Melhorar foto", icon: ImageIcon, accent: "from-sky-600 to-sky-800" },
  { label: "Melhorar título", icon: Type, accent: "from-blue-700 to-blue-900" },
  { label: "Melhorar descrição", icon: FileText, accent: "from-indigo-600 to-indigo-800" },
  { label: "Revisar preço", icon: Tag, accent: "from-violet-600 to-violet-800" },
  { label: "Revisar Ads", icon: Megaphone, accent: "from-emerald-600 to-emerald-800" },
  { label: "Liquidar estoque", icon: PackageOpen, accent: "from-amber-600 to-orange-700" },
  { label: "Pausar compra", icon: PauseCircle, accent: "from-slate-600 to-slate-800" },
  { label: "Descontinuar produto", icon: Ban, accent: "from-rose-700 to-red-900" },
];

const regras = [
  "Vendas recentes",
  "Histórico de vendas",
  "Dias sem venda",
  "Estoque atual",
  "Visitas",
  "Conversão",
  "Preço",
  "Ads",
  "Giro",
  "Margem",
  "Tendência de queda",
];

function ProdutosProblema() {
  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <Activity className="h-3.5 w-3.5" />
            Diagnóstico de Performance
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Produtos Problema
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Identifique produtos sem venda, com queda de desempenho, baixa
            conversão ou risco de estoque parado.
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

        {/* Diagnóstico */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
                <Stethoscope className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Diagnóstico por produto
                </h2>
                <p className="text-xs text-muted-foreground max-w-2xl">
                  Lista dos produtos com sinais de problema, motivo identificado
                  e ação recomendada.
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
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div className="font-display text-base font-semibold text-foreground">
                        Nenhum produto problema identificado ainda
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

        {/* Tipos de problema */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Tipos de problema
            </h2>
            <p className="text-xs text-muted-foreground">
              Categorias usadas pelo sistema para classificar produtos com
              baixo desempenho.
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

        {/* Ações recomendadas */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Ações recomendadas
            </h2>
            <p className="text-xs text-muted-foreground">
              Categorias de ação que o sistema poderá sugerir para recuperar
              ou descontinuar produtos.
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
              A identificação de produtos problema considerará, quando os
              dados estiverem sincronizados:
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
              Essa tela ajuda a equipe a agir antes que produtos ruins consumam
              estoque, verba de Ads ou atenção operacional. O sistema
              identifica sinais de queda e sugere ações para recuperar
              desempenho, liquidar estoque ou evitar novas compras equivocadas.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-white/60 p-3 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-700" />
              <span>
                Tela preparada. Nenhum produto fictício é exibido até a
                primeira sincronização e análise dos dados reais.
              </span>
            </div>
          </div>
        </section>
      </div>
    </EcommerceLayout>
  );
}

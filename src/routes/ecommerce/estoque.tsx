import { createFileRoute } from "@tanstack/react-router";
import {
  Boxes,
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  TrendingDown,
  Clock,
  PackageCheck,
  Truck,
  Info,
  Calculator,
  Lightbulb,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { EstoqueActions } from "@/components/ecommerce/ActionButtons";

export const Route = createFileRoute("/ecommerce/estoque")({
  component: EstoqueCompras,
  head: () => ({
    meta: [{ title: "Estoque e Compras | Agente Comercial 360" }],
  }),
});

const kpis = [
  { label: "SKUs em risco de ruptura", icon: AlertTriangle, accent: "from-rose-600 to-rose-800" },
  { label: "Estoque crítico", icon: ShieldAlert, accent: "from-amber-600 to-orange-700" },
  { label: "Estoque parado", icon: Clock, accent: "from-slate-600 to-slate-800" },
  { label: "Cobertura média", icon: Boxes, accent: "from-blue-700 to-blue-900" },
  { label: "Valor estimado de reposição", icon: DollarSign, accent: "from-emerald-600 to-emerald-800" },
  { label: "Produtos com excesso", icon: TrendingDown, accent: "from-orange-600 to-orange-800" },
];

const classifications = [
  {
    label: "Crítico",
    desc: "Produto com risco de ruptura nos próximos dias.",
    dot: "bg-rose-600",
    ring: "border-rose-200 bg-rose-50/60",
    badge: "text-rose-700",
  },
  {
    label: "Atenção",
    desc: "Produto com cobertura baixa ou giro acima da reposição.",
    dot: "bg-amber-500",
    ring: "border-amber-200 bg-amber-50/60",
    badge: "text-amber-700",
  },
  {
    label: "Saudável",
    desc: "Produto com estoque compatível com a média de vendas.",
    dot: "bg-emerald-600",
    ring: "border-emerald-200 bg-emerald-50/60",
    badge: "text-emerald-700",
  },
  {
    label: "Excesso",
    desc: "Produto com estoque alto e baixo giro.",
    dot: "bg-slate-500",
    ring: "border-slate-200 bg-slate-50/60",
    badge: "text-slate-700",
  },
];

const previsaoCols = [
  "SKU",
  "Produto",
  "Estoque atual",
  "Média de vendas diária",
  "Cobertura em dias",
  "Lead time estimado",
  "Data prevista de ruptura",
  "Quantidade sugerida",
  "Valor estimado de reposição",
  "Prioridade",
];

const transitoCols = [
  "Pedido",
  "Fornecedor",
  "SKU",
  "Quantidade",
  "Data prevista de chegada",
  "Status",
];

const regras = [
  "Estoque atual",
  "Média de vendas",
  "Giro",
  "Pedidos em trânsito",
  "Lead time da China (inicialmente 90 dias)",
  "Margem de segurança",
  "Histórico de vendas",
];

function EstoqueCompras() {
  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <PackageCheck className="h-3.5 w-3.5" />
            Inteligência Operacional
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Estoque e Compras
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Controle cobertura, giro, risco de ruptura e necessidade de
            reposição com base em dados reais da operação.
          </p>
        </header>
        <EstoqueActions />


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
                      Será calculado após sincronização de produtos, pedidos e
                      estoque.
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

        {/* Classificação de Estoque */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Classificação de Estoque
            </h2>
            <p className="text-xs text-muted-foreground">
              Categorias usadas para priorizar ações de compra e liquidação.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {classifications.map((c) => (
              <div
                key={c.label}
                className={`rounded-xl border p-4 ${c.ring}`}
              >
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

        {/* Previsão de Compra */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Previsão de Compra
              </h2>
              <p className="text-xs text-muted-foreground">
                Sugestões de reposição calculadas a partir do giro, cobertura e
                lead time.
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
                  {previsaoCols.map((c) => (
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
                  <td colSpan={previsaoCols.length} className="px-5 py-16 text-center">
                    <div className="mx-auto max-w-md space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <Calculator className="h-6 w-6" />
                      </div>
                      <div className="font-display text-base font-semibold text-foreground">
                        Nenhuma previsão calculada
                      </div>
                      <p className="text-sm text-muted-foreground">
                        A previsão de compra será calculada após a sincronização
                        dos pedidos, estoque e configuração de lead time.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Pedidos em Trânsito */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Pedidos em Trânsito
              </h2>
              <p className="text-xs text-muted-foreground">
                Compras e importações em andamento que afetam a cobertura
                futura.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <Truck className="h-3 w-3" />
              Sem registros
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {transitoCols.map((c) => (
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
                  <td colSpan={transitoCols.length} className="px-5 py-14 text-center">
                    <div className="mx-auto max-w-md space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                        <Truck className="h-6 w-6" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Nenhum pedido em trânsito cadastrado ainda.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
                Regras de Cálculo
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
              O objetivo desta tela é indicar quando comprar, quanto comprar,
              quais produtos estão em risco de ruptura e quais produtos estão
              parados ou com excesso de estoque.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-white/60 p-3 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-700" />
              <span>
                Tela preparada. Nenhum dado fictício é exibido até a primeira
                sincronização de produtos, pedidos e estoque.
              </span>
            </div>
          </div>
        </section>
      </div>
    </EcommerceLayout>
  );
}

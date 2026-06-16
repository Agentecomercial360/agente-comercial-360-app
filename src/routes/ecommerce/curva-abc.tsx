import { createFileRoute } from "@tanstack/react-router";
import { PieChart, TrendingUp, Layers, Target, Info } from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/curva-abc")({
  component: CurvaABC,
  head: () => ({
    meta: [{ title: "Curva ABC e Pareto | Agente Comercial 360" }],
  }),
});

type CardDef = {
  label: string;
  hint: string;
  icon: typeof PieChart;
  accent: string;
};

const cards: CardDef[] = [
  {
    label: "Produtos Classe A",
    hint: "Alta concentração de faturamento",
    icon: TrendingUp,
    accent: "from-blue-700 to-blue-900",
  },
  {
    label: "Produtos Classe B",
    hint: "Faturamento intermediário",
    icon: Layers,
    accent: "from-sky-600 to-sky-800",
  },
  {
    label: "Produtos Classe C",
    hint: "Cauda longa do catálogo",
    icon: PieChart,
    accent: "from-slate-600 to-slate-800",
  },
  {
    label: "Itens que representam 80% do faturamento",
    hint: "Princípio de Pareto",
    icon: Target,
    accent: "from-amber-600 to-orange-700",
  },
];

const columns = [
  "SKU",
  "Produto",
  "Faturamento",
  "Lucro estimado",
  "Participação %",
  "Classe ABC",
  "Ação sugerida",
];

function CurvaABC() {
  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <PieChart className="h-3.5 w-3.5" />
            Inteligência Estratégica
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Curva ABC e Pareto
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Identifique os produtos que concentram faturamento, lucro e
            prioridade operacional.
          </p>
        </header>

        {/* Resumo */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${c.accent} opacity-10`}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {c.label}
                    </div>
                    <div className="font-display text-3xl font-bold text-foreground/40">
                      —
                    </div>
                    <div className="text-xs text-muted-foreground">{c.hint}</div>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.accent} text-white shadow-md`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Aviso preparado */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <strong className="font-semibold">Tela preparada.</strong>{" "}
            A classificação ABC depende da sincronização dos pedidos e produtos
            reais. Nenhum dado fictício é exibido até a primeira análise.
          </div>
        </div>

        {/* Tabela */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Classificação por produto
              </h2>
              <p className="text-xs text-muted-foreground">
                Ranking calculado por faturamento acumulado (Pareto 80/20).
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
                  {columns.map((c) => (
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
                    colSpan={columns.length}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto max-w-md space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <PieChart className="h-6 w-6" />
                      </div>
                      <div className="font-display text-base font-semibold text-foreground">
                        Nenhuma classificação disponível
                      </div>
                      <p className="text-sm text-muted-foreground">
                        A análise ABC será calculada automaticamente após a
                        sincronização dos pedidos e produtos reais.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </EcommerceLayout>
  );
}

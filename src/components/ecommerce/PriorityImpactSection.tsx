import { useMemo } from "react";
import {
  DollarSign,
  Flame,
  Layers,
  Package,
  Target,
  Zap,
} from "lucide-react";
import type { PendingCostRow } from "@/components/ecommerce/PendingCostsTable";

type Props = {
  /** Mesma lista usada pela tabela "Produtos com custo pendente". */
  rows: PendingCostRow[];
  loading: boolean;
  scopeLabel: string;
  /** DOM id da seção "Produtos com custo pendente" para foco/scroll. */
  pendingCostsAnchorId?: string;
};

type PriorityBucket = "critical" | "high" | "medium";

type RankedRow = PendingCostRow & {
  priority: PriorityBucket;
  reason: string;
};

function formatBRL(v: number | null | undefined): string {
  const n = Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PriorityImpactSection({
  rows,
  loading,
  scopeLabel,
  pendingCostsAnchorId = "pending-costs-table",
}: Props) {
  const ranked: RankedRow[] = useMemo(() => {
    const sorted = [...rows].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    return sorted.map((r, idx) => {
      const priority: PriorityBucket =
        idx < 5 ? "critical" : idx < 15 ? "high" : "medium";
      let reason = "SKU recorrente sem custo";
      if (idx === 0) reason = "Maior faturamento bloqueado";
      else if (priority === "critical" && r.orders >= 5)
        reason = "Muitos pedidos afetados";
      else if (priority === "critical") reason = "Alto faturamento bloqueado";
      else if (r.orders >= 5) reason = "Muitos pedidos afetados";
      else if (r.accountNames.length >= 2)
        reason = "Destrava margem em várias contas";
      return { ...r, priority, reason };
    });
  }, [rows]);

  const summary = useMemo(() => {
    const totalBlocked = ranked.reduce((s, r) => s + (r.revenue || 0), 0);
    const totalOrders = ranked.reduce((s, r) => s + (r.orders || 0), 0);
    const biggest = ranked[0];
    return {
      totalBlocked,
      totalOrders,
      totalProducts: ranked.length,
      biggestName: biggest?.product_name ?? biggest?.sku ?? "—",
      biggestValue: biggest?.revenue ?? 0,
    };
  }, [ranked]);

  function focusPendingCosts() {
    if (typeof document === "undefined") return;
    const el = document.getElementById(pendingCostsAnchorId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    const focusable = el.querySelector<HTMLElement>(
      "input, button, [tabindex]:not([tabindex='-1'])",
    );
    focusable?.focus({ preventScroll: true });
  }

  const cards = [
    {
      label: "Faturamento bloqueado total",
      value: formatBRL(summary.totalBlocked),
      icon: DollarSign,
      accent: "from-rose-600 to-rose-800",
      tone: "text-rose-700",
    },
    {
      label: "Produtos prioritários",
      value: summary.totalProducts.toLocaleString("pt-BR"),
      icon: Package,
      accent: "from-orange-600 to-rose-700",
      tone: "text-orange-700",
    },
    {
      label: "Pedidos afetados",
      value: summary.totalOrders.toLocaleString("pt-BR"),
      icon: Layers,
      accent: "from-amber-600 to-orange-700",
      tone: "text-amber-700",
    },
    {
      label: "Maior oportunidade",
      value: formatBRL(summary.biggestValue),
      hint: summary.biggestName,
      icon: Target,
      accent: "from-emerald-600 to-emerald-800",
      tone: "text-emerald-700",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)] overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4 md:px-6 md:py-5 bg-gradient-to-r from-slate-50/80 to-white">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-700 to-slate-900 text-white shadow-md">
            <Flame className="h-5 w-5" />
          </div>
          <div className="space-y-1 max-w-3xl">
            <h2 className="font-display text-lg md:text-xl font-bold text-slate-900">
              Produtos Prioritários por Impacto
            </h2>
            <p className="text-xs md:text-[13px] text-slate-600">
              Mesma base da tabela “Produtos com custo pendente”, ordenada por
              faturamento afetado para você saber por onde começar.
              <span className="ml-1 text-slate-500">Escopo: {scopeLabel}.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-5 md:p-6">
        {cards.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-soft)]"
            >
              <div
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${k.accent} opacity-10`}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {k.label}
                  </div>
                  <div
                    className={`font-display text-2xl md:text-[26px] font-bold ${k.tone} tabular-nums whitespace-nowrap leading-none`}
                  >
                    {loading ? "—" : k.value}
                  </div>
                  {"hint" in k && k.hint ? (
                    <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                      {k.hint}
                    </div>
                  ) : null}
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
      </div>

      <div className="border-t border-slate-200 px-5 py-4 md:px-6 md:py-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-display text-base md:text-lg font-bold text-slate-900">
            Ranking de produtos por impacto
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
            {ranked.length} produto(s)
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Calculando prioridades…
          </div>
        ) : ranked.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Não há produtos prioritários no período. Todos os produtos vendidos possuem custo
            cadastrado.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600">
                  <th className="text-left px-3 py-3 font-semibold">Prioridade</th>
                  <th className="text-left px-3 py-3 font-semibold">Produto</th>
                  <th className="text-left px-3 py-3 font-semibold">SKU</th>
                  <th className="text-left px-3 py-3 font-semibold">Conta ML</th>
                  <th className="text-right px-3 py-3 font-semibold">Qtd vendida</th>
                  <th className="text-right px-3 py-3 font-semibold">Pedidos afetados</th>
                  <th className="text-right px-3 py-3 font-semibold">Faturamento bloqueado</th>
                  <th className="text-left px-3 py-3 font-semibold">Motivo da prioridade</th>
                  <th className="text-right px-3 py-3 font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ranked.map((r) => (
                  <tr key={r.product_id} className="hover:bg-slate-50/60 transition align-top">
                    <td className="px-3 py-3">
                      <PriorityBadge p={r.priority} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {r.product_name ?? "Produto sem nome"}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-500">
                      {r.sku ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {r.accountNames.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {r.accountNames.slice(0, 2).map((n, i) => (
                            <span
                              key={i}
                              className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-700"
                            >
                              {n}
                            </span>
                          ))}
                          {r.accountNames.length > 2 && (
                            <span className="text-[10px] text-slate-500">
                              +{r.accountNames.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {r.units.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {r.orders.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-rose-700 whitespace-nowrap">
                      {formatBRL(r.revenue)}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-700">
                      <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5">
                        <Zap className="h-3 w-3 text-amber-600" />
                        {r.reason}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={focusPendingCosts}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-700 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-800 transition"
                      >
                        Cadastrar custo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function PriorityBadge({ p }: { p: PriorityBucket }) {
  if (p === "critical") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
        <Flame className="h-3 w-3" />
        Crítica
      </span>
    );
  }
  if (p === "high") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
        Alta
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
      Média
    </span>
  );
}

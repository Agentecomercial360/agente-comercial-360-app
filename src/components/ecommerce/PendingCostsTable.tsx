import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, DollarSign, Loader2, Package, Save, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export type PendingCostRow = {
  product_id: string;
  sku: string | null;
  product_name: string | null;
  cost_price: number | null;
  orders: number;
  units: number;
  revenue: number;
  accountNames: string[];
};

function formatBRL(v: number | null | undefined): string {
  const n = Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseBRLInput(v: string): number | null {
  const norm = v.trim().replace(/\./g, "").replace(",", ".");
  if (!norm) return null;
  const n = Number(norm);
  return Number.isFinite(n) && n > 0 ? n : null;
}

type Props = {
  rows: PendingCostRow[];
  loading: boolean;
  companyId: string;
  scopeLabel: string;
  onSaved: () => Promise<void> | void;
};

export function PendingCostsTable({ rows, loading, companyId, scopeLabel, onSaved }: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [releasedRevenue, setReleasedRevenue] = useState(0);
  const [releasedCount, setReleasedCount] = useState(0);

  const summary = useMemo(() => {
    const productsCount = rows.length;
    const affectedOrders = rows.reduce((s, r) => s + r.orders, 0);
    const affectedRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    return { productsCount, affectedOrders, affectedRevenue };
  }, [rows]);

  async function handleSave(row: PendingCostRow) {
    const raw = inputs[row.product_id] ?? "";
    const parsed = parseBRLInput(raw);
    if (parsed == null) {
      toast.error("Informe um custo válido maior que zero.");
      return;
    }
    setSavingId(row.product_id);
    try {
      const upd = await supabase
        .from("ecommerce_products")
        .update({ cost_price: parsed, updated_at: new Date().toISOString() })
        .eq("id", row.product_id)
        .eq("company_id", companyId);
      if (upd.error) throw upd.error;

      const recalc = await supabase.rpc("recalculate_ecommerce_profit_v1", {
        p_company_id: companyId,
        p_product_id: row.product_id,
      });
      if (recalc.error) {
        toast.success("Custo salvo. Sincronize novamente para recalcular os pedidos.");
      } else {
        toast.success("Custo salvo e pedidos recalculados.");
      }

      setReleasedRevenue((v) => v + (row.revenue || 0));
      setReleasedCount((c) => c + 1);
      setInputs((prev) => {
        const n = { ...prev };
        delete n[row.product_id];
        return n;
      });
      await onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar custo.");
    } finally {
      setSavingId(null);
    }
  }

  const cards = [
    {
      label: "Produtos sem custo",
      value: summary.productsCount.toLocaleString("pt-BR"),
      icon: Package,
      accent: "from-orange-600 to-rose-700",
      tone: "text-orange-700",
    },
    {
      label: "Pedidos afetados",
      value: summary.affectedOrders.toLocaleString("pt-BR"),
      icon: AlertTriangle,
      accent: "from-amber-600 to-orange-700",
      tone: "text-amber-700",
    },
    {
      label: "Faturamento com custo pendente",
      value: formatBRL(summary.affectedRevenue),
      icon: DollarSign,
      accent: "from-rose-600 to-rose-800",
      tone: "text-rose-700",
    },
    {
      label: "Lucro confiável liberado",
      value: formatBRL(releasedRevenue),
      hint: `${releasedCount} produto(s) atualizados nesta sessão`,
      icon: CheckCircle2,
      accent: "from-emerald-600 to-emerald-800",
      tone: "text-emerald-700",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)] overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4 md:px-6 md:py-5 bg-gradient-to-r from-slate-50/80 to-white">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-slate-900 text-white shadow-md">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="space-y-1 max-w-3xl">
            <h2 className="font-display text-lg md:text-xl font-bold text-slate-900">
              Custos e Margem
            </h2>
            <p className="text-xs md:text-[13px] text-slate-600">
              Cadastre os custos dos produtos para liberar lucro líquido real, margem e análise confiável.
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
              <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${k.accent} opacity-10`} />
              <div className="relative flex items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {k.label}
                  </div>
                  <div className={`font-display text-2xl md:text-[26px] font-bold ${k.tone} tabular-nums whitespace-nowrap leading-none`}>
                    {loading ? "—" : k.value}
                  </div>
                  {"hint" in k && k.hint ? (
                    <div className="text-[11px] text-slate-500">{k.hint}</div>
                  ) : null}
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${k.accent} text-white shadow-md`}>
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
            Produtos com custo pendente
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
            {rows.length} produto(s)
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Carregando produtos pendentes de custo…
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Todos os produtos vendidos no período possuem custo cadastrado.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600">
                  <th className="text-left px-3 py-3 font-semibold">Produto</th>
                  <th className="text-left px-3 py-3 font-semibold">SKU</th>
                  <th className="text-left px-3 py-3 font-semibold">Conta ML</th>
                  <th className="text-right px-3 py-3 font-semibold">Qtd vendida</th>
                  <th className="text-right px-3 py-3 font-semibold">Faturamento afetado</th>
                  <th className="text-right px-3 py-3 font-semibold">Custo atual</th>
                  <th className="text-right px-3 py-3 font-semibold">Novo custo (R$)</th>
                  <th className="text-center px-3 py-3 font-semibold">Status</th>
                  <th className="text-right px-3 py-3 font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const isSaving = savingId === r.product_id;
                  const inputVal = inputs[r.product_id] ?? "";
                  const parsed = parseBRLInput(inputVal);
                  return (
                    <tr key={r.product_id} className="hover:bg-slate-50/60 transition">
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
                      <td className="px-3 py-3 text-right tabular-nums font-semibold text-rose-700 whitespace-nowrap">
                        {formatBRL(r.revenue)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-500">
                        {r.cost_price && r.cost_price > 0 ? formatBRL(r.cost_price) : "—"}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={inputVal}
                          onChange={(e) =>
                            setInputs((prev) => ({ ...prev, [r.product_id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && parsed != null) void handleSave(r);
                          }}
                          placeholder="0,00"
                          disabled={isSaving}
                          className="w-28 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          Pendente
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => handleSave(r)}
                          disabled={isSaving || parsed == null}
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-800 disabled:opacity-50 transition"
                        >
                          {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                          Salvar custo
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

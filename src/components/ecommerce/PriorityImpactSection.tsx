import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  Flame,
  Layers,
  Package,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Props = {
  companyId: string;
  selectedAccountId: string | null;
  scopeLabel: string;
  reloadKey?: number;
  /** DOM id of the "Produtos com custo pendente" section to focus/scroll on click. */
  pendingCostsAnchorId?: string;
};

type OrderRow = {
  id: string;
  account_id: string | null;
  is_cancelled: boolean | null;
};

type ItemRow = {
  order_id: string | null;
  product_id: string | null;
  sku: string | null;
  product_name: string | null;
  quantity: number | null;
  total_price: number | null;
  profit_status: string | null;
};

type ProductRow = {
  id: string;
  sku: string | null;
  product_name: string | null;
  cost_price: number | null;
};

type AccountRow = {
  id: string;
  account_name: string | null;
  nickname: string | null;
};

type PriorityBucket = "critical" | "high" | "medium";

type Row = {
  product_id: string;
  sku: string | null;
  product_name: string | null;
  cost_price: number | null;
  quantity: number;
  orders: number;
  blockedRevenue: number;
  accountNames: string[];
  reason: string;
  priority: PriorityBucket;
};

function formatBRL(v: number | null | undefined): string {
  const n = Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function fetchAll<T>(
  build: (from: number, to: number) => any,
  pageSize = 1000,
): Promise<T[]> {
  const out: T[] = [];
  let from = 0;
  for (let i = 0; i < 50; i++) {
    const to = from + pageSize - 1;
    const { data, error } = await build(from, to);
    if (error) throw error;
    const rows = (data || []) as T[];
    out.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

export function PriorityImpactSection({
  companyId,
  selectedAccountId,
  scopeLabel,
  reloadKey = 0,
  pendingCostsAnchorId = "pending-costs-table",
}: Props) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let oq = supabase
        .from("ecommerce_orders")
        .select("id,account_id,is_cancelled")
        .eq("company_id", companyId)
        .or("is_cancelled.is.null,is_cancelled.eq.false");
      if (selectedAccountId) oq = oq.eq("account_id", selectedAccountId);
      const orders = await fetchAll<OrderRow>((f, t) => oq.range(f, t));
      const orderMap = new Map<string, OrderRow>();
      orders.forEach((o) => orderMap.set(o.id, o));
      const orderIds = Array.from(orderMap.keys());

      if (orderIds.length === 0) {
        setRows([]);
        return;
      }

      const chunks: string[][] = [];
      for (let i = 0; i < orderIds.length; i += 500) chunks.push(orderIds.slice(i, i + 500));
      const itemsAll: ItemRow[] = [];
      for (const c of chunks) {
        const items = await fetchAll<ItemRow>((f, t) =>
          supabase
            .from("ecommerce_order_items")
            .select(
              "order_id,product_id,sku,product_name,quantity,total_price,profit_status",
            )
            .eq("company_id", companyId)
            .in("order_id", c)
            .range(f, t),
        );
        itemsAll.push(...items);
      }

      const productIds = Array.from(
        new Set(itemsAll.map((i) => i.product_id).filter((x): x is string => !!x)),
      );
      const productMap = new Map<string, ProductRow>();
      for (let i = 0; i < productIds.length; i += 500) {
        const slice = productIds.slice(i, i + 500);
        const { data, error } = await supabase
          .from("ecommerce_products")
          .select("id,sku,product_name,cost_price")
          .eq("company_id", companyId)
          .in("id", slice);
        if (error) throw error;
        (data || []).forEach((p: any) => productMap.set(p.id, p as ProductRow));
      }

      const { data: accData } = await supabase
        .from("ecommerce_accounts")
        .select("id,account_name,nickname")
        .eq("company_id", companyId);
      const accMap = new Map<string, AccountRow>();
      (accData || []).forEach((a: any) => accMap.set(a.id, a as AccountRow));

      type Acc = {
        product_id: string;
        sku: string | null;
        product_name: string | null;
        cost_price: number | null;
        quantity: number;
        orderIds: Set<string>;
        blockedRevenue: number;
        accountIds: Set<string>;
      };
      const grouped = new Map<string, Acc>();

      for (const it of itemsAll) {
        if (!it.product_id) continue;
        const prod = productMap.get(it.product_id);
        const prodCost = Number(prod?.cost_price ?? 0);
        const status = (it.profit_status ?? "").toLowerCase();
        const isBlocked =
          !prod?.cost_price || prodCost === 0 || status === "pending_calculation";
        if (!isBlocked) continue;

        const order = it.order_id ? orderMap.get(it.order_id) : undefined;
        if (!order) continue;

        const key = it.product_id;
        let acc = grouped.get(key);
        if (!acc) {
          acc = {
            product_id: key,
            sku: prod?.sku ?? it.sku ?? null,
            product_name: prod?.product_name ?? it.product_name ?? null,
            cost_price: prod?.cost_price ?? null,
            quantity: 0,
            orderIds: new Set(),
            blockedRevenue: 0,
            accountIds: new Set(),
          };
          grouped.set(key, acc);
        }
        acc.quantity += Number(it.quantity ?? 0);
        acc.blockedRevenue += Number(it.total_price ?? 0);
        if (order.id) acc.orderIds.add(order.id);
        if (order.account_id) acc.accountIds.add(order.account_id);
      }

      const list = Array.from(grouped.values())
        .map((a) => ({
          product_id: a.product_id,
          sku: a.sku,
          product_name: a.product_name,
          cost_price: a.cost_price,
          quantity: a.quantity,
          orders: a.orderIds.size,
          blockedRevenue: a.blockedRevenue,
          accountNames: Array.from(a.accountIds)
            .map((id) => {
              const ac = accMap.get(id);
              return ac?.account_name || ac?.nickname || "";
            })
            .filter(Boolean),
        }))
        .sort((a, b) => b.blockedRevenue - a.blockedRevenue);

      const withPriority: Row[] = list.map((r, idx) => {
        const priority: PriorityBucket =
          idx < 5 ? "critical" : idx < 15 ? "high" : "medium";
        let reason = "SKU recorrente sem custo";
        if (idx === 0) reason = "Maior faturamento bloqueado";
        else if (priority === "critical" && r.orders >= 5) reason = "Muitos pedidos afetados";
        else if (priority === "critical") reason = "Alto faturamento bloqueado";
        else if (r.orders >= 5) reason = "Muitos pedidos afetados";
        else if (r.accountNames.length >= 2) reason = "Destrava margem em várias contas";
        return { ...r, priority, reason };
      });

      setRows(withPriority);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao carregar produtos prioritários.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, selectedAccountId]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  const summary = useMemo(() => {
    const totalBlocked = rows.reduce((s, r) => s + r.blockedRevenue, 0);
    const totalOrders = rows.reduce((s, r) => s + r.orders, 0);
    const biggest = rows[0];
    return {
      totalBlocked,
      totalOrders,
      totalProducts: rows.length,
      biggestName: biggest?.product_name ?? biggest?.sku ?? "—",
      biggestValue: biggest?.blockedRevenue ?? 0,
    };
  }, [rows]);

  function focusPendingCosts() {
    if (typeof document === "undefined") return;
    const el = document.getElementById(pendingCostsAnchorId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Best-effort focus for keyboard/AT users.
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
              Visão de diagnóstico: quais SKUs destravam mais faturamento, pedidos e margem
              quando o custo é cadastrado.
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
            {rows.length} produto(s)
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Calculando prioridades…
          </div>
        ) : rows.length === 0 ? (
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
                {rows.map((r) => (
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
                      {r.quantity.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {r.orders.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-rose-700 whitespace-nowrap">
                      {formatBRL(r.blockedRevenue)}
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
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
        <TrendingUp className="h-3 w-3" />
        Alta
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
      <AlertTriangle className="h-3 w-3" />
      Média
    </span>
  );
}

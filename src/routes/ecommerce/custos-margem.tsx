import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Package,
  Info,
  TrendingUp,
  Pencil,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import { useEcommerceActiveAccount } from "@/lib/ecommerce-active-account";

export const Route = createFileRoute("/ecommerce/custos-margem")({
  component: CustosMargem,
  head: () => ({
    meta: [{ title: "Custos e Margem | Agente Comercial 360" }],
  }),
});

const COMPANY_ID = "ac7d24b9-5227-46ac-9ced-b66473422a17";

type ProductRow = {
  id: string;
  sku: string | null;
  product_name: string | null;
  category: string | null;
  sale_price: number | null;
  cost_price: number | null;
  status: string | null;
};

type ListingRow = {
  id: string;
  product_id: string | null;
  account_id: string | null;
  status: string | null;
};

type AccountRow = {
  id: string;
  account_name: string | null;
  marketplace: string | null;
  nickname: string | null;
};

type FilterKey =
  | "all"
  | "without_cost"
  | "with_cost"
  | "active_without_cost"
  | "high_priority"
  | "paused";

type OrderItemRow = {
  order_id: string | null;
  product_id: string | null;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
};

type OrderLiteRow = {
  id: string;
  account_id: string | null;
};

type SoldNoCost = {
  product: ProductRow;
  orders: number;
  units: number;
  revenue: number;
  accountNames: string[];
  priority: "high" | "medium" | "low";
};

type BlockingProduct = {
  ranking: number;
  product_id: string;
  sku: string | null;
  product_name: string | null;
  sale_price: number | null;
  cost_price: number | null;
  pedidos: number;
  unidades_vendidas: number;
  faturamento_bloqueado: number;
  percentual_do_bloqueado: number;
  contas: string[] | string | null;
  prioridade: string | null;
  status_acao: string | null;
};


function formatBRL(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function isActiveStatus(s: string | null | undefined): boolean {
  const k = (s ?? "").toLowerCase();
  return k === "active" || k === "ativo" || k === "ativa";
}

function isPausedStatus(s: string | null | undefined): boolean {
  const k = (s ?? "").toLowerCase();
  return k === "paused" || k === "pausado" || k === "pausada" || k === "inactive";
}

function CustosMargem() {
  return (
    <EcommerceLayout>
      <CustosMargemContent />
    </EcommerceLayout>
  );
}

function CustosMargemContent() {
  const {
    activeAccountId,
    activeAccount,
    loading: accountsLoading,
  } = useEcommerceActiveAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [accounts, setAccounts] = useState<Map<string, AccountRow>>(new Map());
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [ordersById, setOrdersById] = useState<Map<string, OrderLiteRow>>(new Map());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [pendingCostOrders, setPendingCostOrders] = useState<number>(0);
  const [highConfOrders, setHighConfOrders] = useState<number>(0);
  const [impactSummary, setImpactSummary] = useState<{
    faturamento_bloqueado: number;
    pedidos_pendentes_custo: number;
    produtos_vendidos_sem_custo: number;
    pedidos_lucro_confiavel: number;
  } | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [blockingProducts, setBlockingProducts] = useState<BlockingProduct[]>([]);
  const [blockingLoading, setBlockingLoading] = useState(false);
  const [impactReloadKey, setImpactReloadKey] = useState(0);
  const [dailySeries, setDailySeries] = useState<DailyPoint[]>([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const selectedAccountId = activeAccountId ?? null;
  const isAllAccounts = !selectedAccountId;
  const selectedAccountName = selectedAccountId
    ? activeAccount?.account_name ||
      activeAccount?.nickname ||
      accounts.get(selectedAccountId)?.account_name ||
      accounts.get(selectedAccountId)?.nickname ||
      "Conta ativa"
    : "Todas as contas";
  const isFilteringByAccount = Boolean(selectedAccountId);


  const load = useCallback(async () => {
    if (accountsLoading) return;
    setLoading(true);
    setError(null);
    try {
      const [{ data: prod, error: ep }, { data: list, error: el }, { data: accs, error: ea }] =
        await Promise.all([
          supabase
            .from("ecommerce_products")
            .select("id,sku,product_name,category,sale_price,cost_price,status")
            .eq("company_id", COMPANY_ID)
            .limit(50000),
          supabase
            .from("ecommerce_listings")
            .select("id,product_id,account_id,status")
            .eq("company_id", COMPANY_ID)
            .limit(50000),
          supabase
            .from("ecommerce_accounts")
            .select("id,account_name,marketplace,nickname")
            .eq("company_id", COMPANY_ID),
        ]);
      if (ep) throw ep;
      if (el) throw el;
      if (ea) throw ea;
      setProducts((prod || []) as ProductRow[]);
      setListings((list || []) as ListingRow[]);
      const am = new Map<string, AccountRow>();
      (accs || []).forEach((a: any) => am.set(a.id, a as AccountRow));
      setAccounts(am);

      // Pedidos filtrados pelo ID interno da conta ativa quando houver.
      let ordersQuery = supabase
        .from("ecommerce_orders")
        .select("id,account_id")
        .eq("company_id", COMPANY_ID)
        .limit(20000);
      if (selectedAccountId) ordersQuery = ordersQuery.eq("account_id", selectedAccountId);
      const { data: ords, error: eo } = await ordersQuery;
      if (eo) throw eo;
      const ordMap = new Map<string, OrderLiteRow>();
      (ords || []).forEach((o: any) => ordMap.set(o.id, o as OrderLiteRow));
      setOrdersById(ordMap);

      // Itens sempre passam por ecommerce_orders: o account_id está no pedido, não no item.
      const orderIds = Array.from(ordMap.keys());
      if (orderIds.length === 0) {
        setOrderItems([]);
      } else {
        // Supabase `in()` limita lista — chunk se necessário.
        const chunks: string[][] = [];
        for (let i = 0; i < orderIds.length; i += 1000) {
          chunks.push(orderIds.slice(i, i + 1000));
        }
        const results = await Promise.all(
          chunks.map((c) =>
            supabase
              .from("ecommerce_order_items")
              .select("order_id,product_id,quantity,unit_price,total_price")
              .eq("company_id", COMPANY_ID)
              .in("order_id", c)
              .limit(50000),
          ),
        );
        const all: OrderItemRow[] = [];
        for (const r of results) {
          if (r.error) throw r.error;
          all.push(...((r.data || []) as OrderItemRow[]));
        }
        setOrderItems(all);
      }

      // Contagem de pedidos por nível de confiança de lucro, respeitando o ID da conta ativa.
      const baseCount = () =>
        supabase
          .from("ecommerce_orders")
          .select("id", { count: "exact", head: true })
          .eq("company_id", COMPANY_ID);
      const pendQ = baseCount().eq("profit_confidence", "pending_cost");
      const highQ = baseCount().eq("profit_confidence", "high");
      const [pendingResult, highResult] = await Promise.all([
        selectedAccountId ? pendQ.eq("account_id", selectedAccountId) : pendQ,
        selectedAccountId ? highQ.eq("account_id", selectedAccountId) : highQ,
      ]);
      if (pendingResult.error) throw pendingResult.error;
      if (highResult.error) throw highResult.error;
      setPendingCostOrders(pendingResult.count ?? 0);
      setHighConfOrders(highResult.count ?? 0);
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }, [accountsLoading, selectedAccountId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Impacto financeiro bloqueado por falta de custo — somente via RPC.
  useEffect(() => {
    if (accountsLoading) return;
    let cancelled = false;
    const p_account_id = isAllAccounts ? null : selectedAccountId;
    setImpactLoading(true);
    supabase
      .rpc("get_ecommerce_cost_impact_summary_v1", {
        p_company_id: COMPANY_ID,
        p_account_id,
      })

      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("get_ecommerce_cost_impact_summary_v1 error", error);
          setImpactSummary(null);
        } else {
          const row = Array.isArray(data) ? data[0] : data;
          setImpactSummary(
            row
              ? {
                  faturamento_bloqueado: Number(row.faturamento_bloqueado ?? 0),
                  pedidos_pendentes_custo: Number(row.pedidos_pendentes_custo ?? 0),
                  produtos_vendidos_sem_custo: Number(row.produtos_vendidos_sem_custo ?? 0),
                  pedidos_lucro_confiavel: Number(row.pedidos_lucro_confiavel ?? 0),
                }
              : null,
          );
        }
        setImpactLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accountsLoading, selectedAccountId, isAllAccounts, selectedAccountName, impactReloadKey]);

  // Produtos que mais bloqueiam lucro real — somente via RPC.
  useEffect(() => {
    if (accountsLoading) return;
    let cancelled = false;
    const p_account_id = isAllAccounts ? null : selectedAccountId;
    setBlockingLoading(true);
    supabase
      .rpc("get_ecommerce_cost_blocking_products_v1", {
        p_company_id: COMPANY_ID,
        p_account_id,
        p_limit: 20,
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("get_ecommerce_cost_blocking_products_v1 error", error);
          setBlockingProducts([]);
        } else {
          setBlockingProducts((data || []) as BlockingProduct[]);
        }
        setBlockingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accountsLoading, selectedAccountId, isAllAccounts, impactReloadKey]);




  const listingsByProduct = useMemo(() => {
    const m = new Map<string, ListingRow[]>();
    for (const l of listings) {
      if (!l.product_id) continue;
      const arr = m.get(l.product_id) ?? [];
      arr.push(l);
      m.set(l.product_id, arr);
    }
    return m;
  }, [listings]);

  type Enriched = {
    product: ProductRow;
    totalListings: number;
    activeListings: number;
    accountNames: string[];
    hasCost: boolean;
    priority: "high" | "medium" | "low" | "ok";
    margin: number | null;
  };

  const enriched: Enriched[] = useMemo(() => {
    return products.map((p) => {
      const ls = listingsByProduct.get(p.id) ?? [];
      const totalListings = ls.length;
      const activeListings = ls.filter((l) => isActiveStatus(l.status)).length;
      const accountIds = Array.from(
        new Set(ls.map((l) => l.account_id).filter(Boolean)),
      ) as string[];
      const accountNames = accountIds.map((id) => {
        const a = accounts.get(id);
        return a?.account_name || a?.nickname || id;
      });
      const cost = p.cost_price ?? 0;
      const hasCost = cost > 0;
      let priority: Enriched["priority"];
      if (!hasCost && activeListings > 0) priority = "high";
      else if (!hasCost) priority = "medium";
      else priority = "ok";
      const margin =
        hasCost && p.sale_price && p.sale_price > 0
          ? ((p.sale_price - cost) / p.sale_price) * 100
          : null;
      return { product: p, totalListings, activeListings, accountNames, hasCost, priority, margin };
    });
  }, [products, listingsByProduct, accounts]);

  const soldNoCost: SoldNoCost[] = useMemo(() => {
    if (orderItems.length === 0 || products.length === 0) return [];
    const productsById = new Map(products.map((p) => [p.id, p]));
    type Agg = {
      orders: Set<string>;
      units: number;
      revenue: number;
      accountIds: Set<string>;
    };
    const map = new Map<string, Agg>();
    for (const it of orderItems) {
      if (!it.product_id) continue;
      const p = productsById.get(it.product_id);
      if (!p) continue;
      const cost = p.cost_price ?? 0;
      if (cost > 0) continue;
      const qty = Number(it.quantity ?? 0) || 0;
      const unit = Number(it.unit_price ?? 0) || 0;
      const rev = qty * unit;
      const agg = map.get(it.product_id) ?? {
        orders: new Set<string>(),
        units: 0,
        revenue: 0,
        accountIds: new Set<string>(),
      };
      if (it.order_id) {
        agg.orders.add(it.order_id);
        const ord = ordersById.get(it.order_id);
        if (ord?.account_id) agg.accountIds.add(ord.account_id);
      }
      agg.units += qty;
      agg.revenue += rev;
      map.set(it.product_id, agg);
    }
    const rows: SoldNoCost[] = [];
    for (const [pid, agg] of map.entries()) {
      const p = productsById.get(pid)!;
      const accountNames = Array.from(agg.accountIds).map((id) => {
        const a = accounts.get(id);
        return a?.account_name || a?.nickname || id;
      });
      let priority: SoldNoCost["priority"];
      if (agg.revenue > 500 || agg.units > 20) priority = "high";
      else if (agg.revenue >= 100) priority = "medium";
      else priority = "low";
      rows.push({
        product: p,
        orders: agg.orders.size,
        units: agg.units,
        revenue: agg.revenue,
        accountNames,
        priority,
      });
    }
    rows.sort((a, b) => b.revenue - a.revenue);
    return rows;
  }, [orderItems, ordersById, products, accounts]);

  // Diagnóstico de impacto financeiro bloqueado por falta de custo.
  const blockedImpact = useMemo(() => {
    const productsById = new Map(products.map((p) => [p.id, p]));
    let blockedRevenue = 0;
    const soldNoCostIds = new Set<string>();
    const soldWithCostIds = new Set<string>();
    for (const it of orderItems) {
      if (!it.product_id) continue;
      const p = productsById.get(it.product_id);
      if (!p) continue;
      const cost = p.cost_price ?? 0;
      if (cost > 0) {
        soldWithCostIds.add(it.product_id);
      } else {
        soldNoCostIds.add(it.product_id);
        const total =
          Number(it.total_price ?? 0) ||
          (Number(it.quantity ?? 0) || 0) * (Number(it.unit_price ?? 0) || 0);
        blockedRevenue += total;
      }
    }
    return {
      blockedRevenue,
      soldNoCostCount: soldNoCostIds.size,
      soldWithCostCount: soldWithCostIds.size,
    };
  }, [orderItems, products]);

  const totals = useMemo(() => {
    const total = enriched.length;
    const withCost = enriched.filter((e) => e.hasCost).length;
    const withoutCost = total - withCost;
    const activeWithoutCost = enriched.filter(
      (e) => !e.hasCost && e.activeListings > 0,
    ).length;
    return { total, withCost, withoutCost, activeWithoutCost };
  }, [enriched]);

  const counts = useMemo(() => {
    return {
      all: enriched.length,
      without_cost: enriched.filter((e) => !e.hasCost).length,
      with_cost: enriched.filter((e) => e.hasCost).length,
      active_without_cost: enriched.filter((e) => !e.hasCost && e.activeListings > 0).length,
      high_priority: enriched.filter((e) => e.priority === "high").length,
      paused: enriched.filter((e) => isPausedStatus(e.product.status)).length,
    } as Record<FilterKey, number>;
  }, [enriched]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "without_cost":
        return enriched.filter((e) => !e.hasCost);
      case "with_cost":
        return enriched.filter((e) => e.hasCost);
      case "active_without_cost":
        return enriched.filter((e) => !e.hasCost && e.activeListings > 0);
      case "high_priority":
        return enriched.filter((e) => e.priority === "high");
      case "paused":
        return enriched.filter((e) => isPausedStatus(e.product.status));
      default:
        return enriched;
    }
  }, [enriched, filter]);

  const kpis = [
    {
      label: "Total de produtos",
      value: totals.total.toString(),
      icon: Package,
      accent: "from-blue-600 to-blue-800",
    },
    {
      label: "Produtos com custo",
      value: totals.withCost.toString(),
      icon: CheckCircle2,
      accent: "from-emerald-600 to-emerald-800",
    },
    {
      label: "Produtos sem custo",
      value: totals.withoutCost.toString(),
      icon: AlertTriangle,
      accent: "from-amber-600 to-orange-700",
    },
    {
      label: "Ativos sem custo",
      value: totals.activeWithoutCost.toString(),
      icon: Flame,
      accent: "from-rose-600 to-rose-800",
    },
  ];

  const filterChips: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "without_cost", label: "Sem custo" },
    { key: "with_cost", label: "Com custo" },
    { key: "active_without_cost", label: "Ativos sem custo" },
    { key: "high_priority", label: "Maior prioridade" },
    { key: "paused", label: "Pausados" },
  ];

  return (
    <>
      <div className="space-y-6">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <TrendingUp className="h-3.5 w-3.5" />
            Inteligência Financeira
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Custos e Margem
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Diagnóstico de produtos sem custo cadastrado. Sem custo, o sistema não calcula
            lucro líquido, margem real, curva ABC financeira nem Radar IA de rentabilidade.
          </p>
          <div className="inline-flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 max-w-3xl">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Atualize os custos dos produtos para liberar lucro líquido, margem real,
              curva ABC financeira e Radar IA de rentabilidade.
            </span>
          </div>
        </header>

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
                    <div className="font-display text-3xl font-bold text-foreground">
                      {loading ? "—" : k.value}
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

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Impacto financeiro bloqueado por falta de custo */}
        <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-rose-50/40 shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="border-b border-amber-200/70 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-rose-700 text-white shadow-md">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="space-y-1 max-w-3xl">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Impacto financeiro bloqueado por falta de custo
                </h2>
                <p className="text-xs md:text-[13px] text-muted-foreground">
                  Esses valores representam vendas reais que ainda não podem ter lucro e
                  margem calculados com segurança porque falta o custo unitário dos
                  produtos.
                </p>
              </div>
            </div>
          </div>

          {impactLoading || !impactSummary ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              {impactLoading ? "Carregando diagnóstico financeiro…" : "Sem dados retornados pela RPC."}
            </div>
          ) : impactSummary.faturamento_bloqueado === 0 &&
            impactSummary.pedidos_pendentes_custo === 0 &&
            impactSummary.produtos_vendidos_sem_custo === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Todos os produtos vendidos possuem custo cadastrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-5">
              {[
                {
                  label: "Faturamento bloqueado",
                  value: formatBRL(impactSummary.faturamento_bloqueado),
                  hint: "Receita sem lucro calculável",
                  icon: DollarSign,
                  accent: "from-rose-600 to-rose-800",
                  tone: "text-rose-700",
                },
                {
                  label: "Pedidos pendentes de custo",
                  value: impactSummary.pedidos_pendentes_custo.toLocaleString("pt-BR"),
                  hint: "profit_confidence = pending_cost",
                  icon: AlertTriangle,
                  accent: "from-amber-600 to-orange-700",
                  tone: "text-amber-700",
                },
                {
                  label: "Produtos vendidos sem custo",
                  value: impactSummary.produtos_vendidos_sem_custo.toLocaleString("pt-BR"),
                  hint: "SKUs aguardando custo",
                  icon: Package,
                  accent: "from-orange-600 to-rose-700",
                  tone: "text-orange-700",
                },
                {
                  label: "Pedidos com lucro confiável",
                  value: impactSummary.pedidos_lucro_confiavel.toLocaleString("pt-BR"),
                  hint: "profit_confidence = high",
                  icon: CheckCircle2,
                  accent: "from-emerald-600 to-emerald-800",
                  tone: "text-emerald-700",
                },
              ].map((c) => {

                const Icon = c.icon;
                return (
                  <div
                    key={c.label}
                    className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 backdrop-blur-sm p-5 shadow-[var(--shadow-soft)]"
                  >
                    <div
                      className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${c.accent} opacity-10`}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {c.label}
                        </div>
                        <div
                          className={`font-display text-xl sm:text-2xl md:text-3xl font-bold ${c.tone} tabular-nums whitespace-nowrap leading-tight`}
                        >
                          {c.value}
                        </div>

                        <div className="text-[11px] text-muted-foreground">{c.hint}</div>
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
            </div>
          )}
        </section>

        {/* Produtos que mais bloqueiam lucro real */}
        <section className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40 shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-orange-200/70 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-rose-700 text-white shadow-md">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-1 max-w-3xl">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Produtos que mais bloqueiam lucro real
                </h2>
                <p className="text-xs md:text-[13px] text-muted-foreground">
                  Esses produtos concentram o maior faturamento ainda sem custo cadastrado.
                  Atualizar esses custos libera lucro real, margem real e ranking de
                  rentabilidade.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-orange-700">
              Top {blockingProducts.length}
            </span>
          </div>

          {blockingLoading ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Carregando ranking…
            </div>
          ) : blockingProducts.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Nenhum produto bloqueando lucro real no filtro atual.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="text-center px-3 py-3 font-semibold">#</th>
                    <th className="text-left px-3 py-3 font-semibold">SKU</th>
                    <th className="text-left px-3 py-3 font-semibold">Produto</th>
                    <th className="text-right px-3 py-3 font-semibold">Faturamento bloqueado</th>
                    <th className="text-right px-3 py-3 font-semibold">% do bloqueado</th>
                    <th className="text-right px-3 py-3 font-semibold">Unidades</th>
                    <th className="text-right px-3 py-3 font-semibold">Pedidos</th>
                    <th className="text-left px-3 py-3 font-semibold">Contas</th>
                    <th className="text-center px-3 py-3 font-semibold">Prioridade</th>
                    <th className="text-center px-3 py-3 font-semibold">Status</th>
                    <th className="text-right px-3 py-3 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {blockingProducts.map((b) => {
                    const isTop10 = b.ranking <= 10;
                    const prioRaw = (b.prioridade ?? "").toLowerCase();
                    const isHigh = isTop10 || prioRaw.includes("alta") || prioRaw === "high";
                    const isMed = !isHigh && (prioRaw.includes("med") || prioRaw === "medium");
                    const prio = isHigh
                      ? { label: "Alta", cls: "bg-rose-100 text-rose-700 border-rose-200" }
                      : isMed
                        ? { label: "Média", cls: "bg-amber-100 text-amber-800 border-amber-200" }
                        : {
                            label: b.prioridade || "Baixa",
                            cls: "bg-slate-100 text-slate-700 border-slate-200",
                          };
                    const contasList = Array.isArray(b.contas)
                      ? b.contas
                      : typeof b.contas === "string" && b.contas
                        ? b.contas.split(",").map((s) => s.trim()).filter(Boolean)
                        : [];
                    const pct = Number(b.percentual_do_bloqueado ?? 0);
                    return (
                      <tr
                        key={b.product_id}
                        className={`transition hover:bg-white/70 ${
                          isTop10 ? "bg-orange-50/40" : ""
                        }`}
                      >
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                              isHigh
                                ? "bg-gradient-to-br from-orange-600 to-rose-700 text-white"
                                : "bg-muted text-foreground/70"
                            }`}
                          >
                            {b.ranking}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                          {b.sku ?? "—"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-foreground leading-tight">
                            {b.product_name ?? "Produto sem nome"}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                            Preço {formatBRL(b.sale_price)}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-bold text-rose-700 whitespace-nowrap">
                          {formatBRL(b.faturamento_bloqueado)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-semibold text-foreground">
                          {pct.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {Number(b.unidades_vendidas ?? 0).toLocaleString("pt-BR")}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {Number(b.pedidos ?? 0).toLocaleString("pt-BR")}
                        </td>
                        <td className="px-3 py-3 text-xs">
                          {contasList.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {contasList.slice(0, 3).map((n, i) => (
                                <span
                                  key={i}
                                  className="rounded-md border border-border bg-white/70 px-1.5 py-0.5 text-[10px] text-foreground/80"
                                >
                                  {n}
                                </span>
                              ))}
                              {contasList.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{contasList.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${prio.cls}`}
                          >
                            {prio.label}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white/70 px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                            {b.status_acao || "Pendente"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => {
                              const existing = products.find((p) => p.id === b.product_id);
                              setEditing(
                                existing ?? {
                                  id: b.product_id,
                                  sku: b.sku,
                                  product_name: b.product_name,
                                  category: null,
                                  sale_price: b.sale_price,
                                  cost_price: b.cost_price,
                                  status: null,
                                },
                              );
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold text-white transition ${
                              isHigh
                                ? "bg-rose-700 hover:bg-rose-800"
                                : "bg-blue-700 hover:bg-blue-800"
                            }`}
                          >
                            <Pencil className="h-3 w-3" />
                            Atualizar custo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Produtos vendidos sem custo */}

        <section className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/60 to-amber-50/40 shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rose-200/70 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 text-white shadow-md">
                <Flame className="h-5 w-5" />
              </div>
              <div className="space-y-1 max-w-2xl">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Produtos vendidos sem custo
                </h2>
                <p className="text-xs md:text-[13px] text-muted-foreground">
                  Esses produtos já venderam, mas ainda não possuem custo cadastrado.
                  Preencha primeiro os itens com maior faturamento para liberar lucro real
                  e margem confiável.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-rose-700">
              {soldNoCost.length} produto(s)
            </span>
          </div>
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Carregando vendas…
            </div>
          ) : soldNoCost.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Nenhum produto vendido está sem custo. Excelente trabalho.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-4 py-3 font-semibold">SKU</th>
                    <th className="text-left px-4 py-3 font-semibold">Produto</th>
                    <th className="text-right px-4 py-3 font-semibold">Preço venda</th>
                    <th className="text-right px-4 py-3 font-semibold">Pedidos</th>
                    <th className="text-right px-4 py-3 font-semibold">Unidades</th>
                    <th className="text-right px-4 py-3 font-semibold">Faturamento</th>
                    <th className="text-left px-4 py-3 font-semibold">Contas</th>
                    <th className="text-center px-4 py-3 font-semibold">Status</th>
                    <th className="text-center px-4 py-3 font-semibold">Prioridade</th>
                    <th className="text-right px-4 py-3 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {soldNoCost.map((r) => {
                    const pm =
                      r.priority === "high"
                        ? { label: "Alta", cls: "bg-rose-100 text-rose-700 border-rose-200" }
                        : r.priority === "medium"
                          ? { label: "Média", cls: "bg-amber-100 text-amber-800 border-amber-200" }
                          : { label: "Baixa", cls: "bg-slate-100 text-slate-700 border-slate-200" };
                    return (
                      <tr key={r.product.id} className="hover:bg-white/60 transition">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {r.product.sku ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground leading-tight">
                            {r.product.product_name ?? "Produto sem nome"}
                          </div>
                          {r.product.category && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {r.product.category}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatBRL(r.product.sale_price)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{r.orders}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{r.units}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">
                          {formatBRL(r.revenue)}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {r.accountNames.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {r.accountNames.slice(0, 3).map((n, i) => (
                                <span
                                  key={i}
                                  className="rounded-md border border-border bg-white/70 px-1.5 py-0.5 text-[10px] text-foreground/80"
                                >
                                  {n}
                                </span>
                              ))}
                              {r.accountNames.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{r.accountNames.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                            <AlertTriangle className="h-3 w-3" />
                            Sem custo
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${pm.cls}`}
                          >
                            {pm.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setEditing(r.product)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-rose-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-800 transition"
                          >
                            <Pencil className="h-3 w-3" />
                            Atualizar custo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Lista */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Produtos e status de custo
              </h2>
              <p className="text-xs text-muted-foreground">
                Cruzamento de produtos com anúncios e contas vinculadas.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filterChips.map((c) => {
                const active = filter === c.key;
                const n = counts[c.key] ?? 0;
                return (
                  <button
                    key={c.key}
                    onClick={() => setFilter(c.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "border-blue-700 bg-blue-700 text-white"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.label}
                    <span
                      className={`rounded-full px-1.5 text-[10px] font-semibold ${
                        active ? "bg-white/20" : "bg-muted text-foreground/70"
                      }`}
                    >
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-14 text-center text-sm text-muted-foreground">
              Carregando produtos…
            </div>
          ) : products.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto max-w-md space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                  <Package className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nenhum produto encontrado para análise de custos.
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Nenhum produto neste filtro.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-4 py-3 font-semibold">Produto</th>
                    <th className="text-left px-4 py-3 font-semibold">SKU</th>
                    <th className="text-right px-4 py-3 font-semibold">Preço de venda</th>
                    <th className="text-right px-4 py-3 font-semibold">Custo</th>
                    <th className="text-right px-4 py-3 font-semibold">Margem est.</th>
                    <th className="text-center px-4 py-3 font-semibold">Status custo</th>
                    <th className="text-center px-4 py-3 font-semibold">Anúncios</th>
                    <th className="text-left px-4 py-3 font-semibold">Contas</th>
                    <th className="text-center px-4 py-3 font-semibold">Prioridade</th>
                    <th className="text-right px-4 py-3 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((e) => {
                    const p = e.product;
                    const priorityMeta =
                      e.priority === "high"
                        ? {
                            label: "Alta",
                            cls: "bg-rose-100 text-rose-700 border-rose-200",
                          }
                        : e.priority === "medium"
                          ? {
                              label: "Média",
                              cls: "bg-amber-100 text-amber-800 border-amber-200",
                            }
                          : e.priority === "low"
                            ? {
                                label: "Baixa",
                                cls: "bg-slate-100 text-slate-700 border-slate-200",
                              }
                            : {
                                label: "OK",
                                cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
                              };
                    return (
                      <tr key={p.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground leading-tight">
                            {p.product_name ?? "Produto sem nome"}
                          </div>
                          {p.category && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {p.category}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {p.sku ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatBRL(p.sale_price)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {e.hasCost ? (
                            formatBRL(p.cost_price)
                          ) : (
                            <span className="text-rose-600 font-semibold">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {e.margin != null ? (
                            <span
                              className={
                                e.margin >= 20
                                  ? "text-emerald-700 font-semibold"
                                  : e.margin >= 5
                                    ? "text-amber-700 font-semibold"
                                    : "text-rose-700 font-semibold"
                              }
                            >
                              {e.margin.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">
                              Pendente de custo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {e.hasCost ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Custo cadastrado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                              <AlertTriangle className="h-3 w-3" />
                              Sem custo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-xs">
                          <div className="font-semibold text-foreground">
                            {e.totalListings}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {e.activeListings} ativo(s)
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {e.accountNames.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {e.accountNames.slice(0, 3).map((n, i) => (
                                <span
                                  key={i}
                                  className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-foreground/80"
                                >
                                  {n}
                                </span>
                              ))}
                              {e.accountNames.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{e.accountNames.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${priorityMeta.cls}`}
                          >
                            {priorityMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setEditing(p)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition"
                          >
                            <Pencil className="h-3 w-3" />
                            Atualizar custo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-md">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-foreground">
                Próxima etapa
              </h3>
              <p className="text-sm text-muted-foreground">
                Após preencher o custo dos produtos prioritários, o sistema poderá calcular
                lucro líquido por anúncio, margem real, curva ABC financeira e ativar o
                Radar IA de rentabilidade.
              </p>
            </div>
          </div>
        </section>
      </div>

      {editing && (
        <EditCostModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            setImpactReloadKey((k) => k + 1);
            await load();
          }}
        />
      )}
    </>
  );
}

function EditCostModal({
  product,
  onClose,
  onSaved,
}: {
  product: ProductRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const currentCost = product.cost_price ?? 0;
  const salePrice = product.sale_price ?? 0;
  const [value, setValue] = useState<string>(
    currentCost > 0 ? String(currentCost).replace(".", ",") : "",
  );
  
  const [saving, setSaving] = useState(false);

  const parsed = useMemo(() => {
    const normalized = value.trim().replace(/\./g, "").replace(",", ".");
    if (!normalized) return null;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }, [value]);

  const marginBefore =
    salePrice > 0 && currentCost > 0
      ? ((salePrice - currentCost) / salePrice) * 100
      : null;
  const marginAfter =
    salePrice > 0 && parsed != null && parsed > 0
      ? ((salePrice - parsed) / salePrice) * 100
      : null;

  async function handleSave() {
    if (parsed == null) {
      toast.error("Informe um valor de custo válido.");
      return;
    }
    if (!(parsed > 0)) {
      toast.error("O custo precisa ser maior que zero.");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc(
        "update_ecommerce_product_cost_v2",
        {
          p_company_id: COMPANY_ID,
          p_product_id: product.id,
          p_cost_price: parsed,
          p_changed_by: "AC360 painel",
          p_notes: "Custo atualizado pela tela de Custos e Margem",
        },
      );
      if (error) throw error;

      const result = (Array.isArray(data) ? data[0] : data) as
        | {
            success?: boolean;
            message?: string;
            sku?: string;
            product_name?: string;
            old_cost_price?: number | string;
            new_cost_price?: number | string;
            items_recalculated?: number;
            orders_recalculated?: number;
            orders_high_confidence?: number;
            orders_pending_cost?: number;
          }
        | null;

      if (result && result.success === false) {
        toast.error(result.message || "Erro ao atualizar custo.");
        return;
      }

      const oldCost = Number(result?.old_cost_price ?? currentCost) || 0;
      const newCost = Number(result?.new_cost_price ?? parsed) || parsed;
      const items = result?.items_recalculated ?? 0;
      const orders = result?.orders_recalculated ?? 0;

      toast.success(
        "Custo atualizado com sucesso. Pedidos impactados recalculados.",
        {
          description: `SKU ${result?.sku ?? product.sku ?? "—"} • ${formatBRL(oldCost)} → ${formatBRL(newCost)} • ${items} itens / ${orders} pedidos recalculados`,
        },
      );
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao atualizar custo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-card shadow-2xl border border-border/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Atualizar custo
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {product.product_name ?? "Produto sem nome"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                SKU
              </div>
              <div className="font-mono text-xs text-foreground">
                {product.sku ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Preço de venda
              </div>
              <div className="tabular-nums font-semibold text-foreground">
                {formatBRL(salePrice)}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Custo atual
              </div>
              <div className="tabular-nums font-semibold text-foreground">
                {currentCost > 0 ? formatBRL(currentCost) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Margem antes
              </div>
              <div className="tabular-nums font-semibold text-foreground">
                {marginBefore != null ? `${marginBefore.toFixed(1)}%` : "—"}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Novo custo (R$)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
              autoFocus
            />
            <div className="text-[11px] text-muted-foreground">
              Margem estimada depois:{" "}
              <span className="font-semibold text-foreground">
                {marginAfter != null ? `${marginAfter.toFixed(1)}%` : "—"}
              </span>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 px-5 py-3 bg-muted/20">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || parsed == null}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3 w-3 animate-spin" />}
            Salvar custo
          </button>
        </div>
      </div>
    </div>
  );
}

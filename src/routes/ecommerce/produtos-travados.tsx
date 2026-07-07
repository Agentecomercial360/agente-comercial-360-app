import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  PauseCircle,
  Ban,
  Tag,
  Hash,
  PackageX,
  Search,
  ExternalLink,
  Loader2,
  Store,
  CheckCircle2,
  Link2,
  Activity,
  DollarSign,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import {
  useEcommerceActiveAccount,
  ECOMMERCE_COMPANY_ID,
} from "@/lib/ecommerce-active-account";
import { isCancelled } from "@/lib/ecommerce-metrics";

export const Route = createFileRoute("/ecommerce/produtos-travados")({
  component: ProdutosProblemaPage,
  head: () => ({
    meta: [{ title: "Produtos Problema | Agente Comercial 360" }],
  }),
});

type Listing = {
  id: string;
  product_id: string | null;
  ml_item_id: string | null;
  title: string | null;
  price: number | null;
  status: string | null;
  is_active: boolean | null;
  listing_url: string | null;
  external_url: string | null;
  updated_at: string | null;
};

type Product = {
  id: string;
  sku: string | null;
  product_name: string | null;
  is_active: boolean | null;
  cost_price: number | null;
  updated_at: string | null;
};

type OrderLite = {
  id: string;
  account_id: string | null;
  order_status: string | null;
};

type OrderItem = {
  order_id: string | null;
  product_id: string | null;
  quantity: number | null;
  total_price: number | null;
  cost_price_at_sale: number | null;
  profit_status: string | null;
};

type ProductSales = {
  units: number;
  revenue: number;
  orders: number;
  hasPendingItem: boolean;
};

type ProblemKind =
  | "paused"
  | "inactive"
  | "no_price"
  | "bad_sku"
  | "disabled"
  | "no_cost"
  | "blocked_revenue"
  | "unlinked";

type Priority = "critical" | "high" | "medium";

type FilterKey =
  | "all"
  | "paused"
  | "inactive"
  | "no_price"
  | "bad_sku"
  | "no_cost"
  | "blocked_revenue"
  | "unlinked";

type Row = {
  listing: Listing;
  product: Product | null;
  problems: ProblemKind[];
  sales: ProductSales;
  priority: Priority;
  suggestedAction: "register_cost" | "open_listing" | "link_product" | null;
};

function fmtPrice(v: number | null | undefined) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

const BLOCKED_REVENUE_THRESHOLD = 500; // R$ mínimo para elevar sem-custo a "faturamento bloqueado"
const BLOCKED_ORDERS_THRESHOLD = 3;

function classify(
  l: Listing,
  p: Product | null,
  sales: ProductSales,
): { problems: ProblemKind[]; priority: Priority; suggested: Row["suggestedAction"] } {
  const out: ProblemKind[] = [];
  const status = (l.status || "").toLowerCase();
  const paused = status === "paused" || status === "pausado";
  const active = status === "active" || status === "ativo";
  if (paused) out.push("paused");
  else if (!active && status) out.push("inactive");

  if (l.price == null || l.price <= 0) out.push("no_price");

  if (!l.product_id) out.push("unlinked");

  const sku = (p?.sku || "").trim();
  if (!sku || (l.ml_item_id && sku.toLowerCase() === l.ml_item_id.toLowerCase())) {
    out.push("bad_sku");
  }

  if (l.is_active === false || p?.is_active === false) out.push("disabled");

  // Financeiros — precisam de product vinculado
  if (p) {
    const noCost =
      (p.cost_price == null || Number(p.cost_price) <= 0) || sales.hasPendingItem;
    const hasSales = sales.units > 0 || sales.revenue > 0;
    if (noCost && hasSales) {
      out.push("no_cost");
      if (sales.revenue >= BLOCKED_REVENUE_THRESHOLD || sales.orders >= BLOCKED_ORDERS_THRESHOLD) {
        out.push("blocked_revenue");
      }
    }
  }

  // Prioridade
  let priority: Priority = "medium";
  if (out.includes("blocked_revenue")) priority = "critical";
  else if (out.includes("no_cost") || out.includes("unlinked") || (paused && sales.revenue > 0))
    priority = "high";
  else if (out.length > 0) priority = "medium";

  // Ação sugerida
  let suggested: Row["suggestedAction"] = null;
  if (out.includes("no_cost") || out.includes("blocked_revenue")) suggested = "register_cost";
  else if (out.includes("unlinked")) suggested = "link_product";
  else if (l.listing_url || l.external_url) suggested = "open_listing";

  return { problems: out, priority, suggested };
}

const PROBLEM_META: Record<ProblemKind, { label: string; cls: string; icon: any; reason: string }> = {
  paused:   { label: "Pausado",           cls: "bg-amber-50 text-amber-700 border-amber-200",   icon: PauseCircle, reason: "Anúncio pausado no marketplace." },
  inactive: { label: "Inativo",           cls: "bg-rose-50 text-rose-700 border-rose-200",      icon: Ban,         reason: "Anúncio inativo." },
  no_price: { label: "Sem preço",         cls: "bg-violet-50 text-violet-700 border-violet-200", icon: Tag,        reason: "Preço não informado." },
  bad_sku:  { label: "SKU inconsistente",  cls: "bg-blue-50 text-blue-700 border-blue-200",     icon: Hash,        reason: "SKU ausente ou igual ao ID do ML." },
  disabled: { label: "Produto desativado", cls: "bg-slate-100 text-slate-700 border-slate-200", icon: PackageX,    reason: "Produto marcado como inativo." },
  no_cost:  { label: "Sem custo",          cls: "bg-orange-50 text-orange-700 border-orange-200", icon: DollarSign, reason: "Produto vendido sem custo, margem bloqueada." },
  blocked_revenue: { label: "Faturamento bloqueado", cls: "bg-rose-50 text-rose-700 border-rose-200", icon: TrendingDown, reason: "Este produto está bloqueando a análise de lucro real." },
  unlinked: { label: "Sem vínculo",        cls: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", icon: Link2,   reason: "Análise de margem comprometida por falta de vínculo." },
};

const PRIORITY_META: Record<Priority, { label: string; cls: string }> = {
  critical: { label: "Crítica", cls: "bg-rose-600 text-white" },
  high:     { label: "Alta",    cls: "bg-amber-500 text-white" },
  medium:   { label: "Média",   cls: "bg-slate-500 text-white" },
};

function ProblemBadge({ kind }: { kind: ProblemKind }) {
  const m = PROBLEM_META[kind];
  const Icon = m.icon;
  return (
    <span
      title={m.reason}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${m.cls}`}
    >
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

function ProdutosProblemaPage() {
  return (
    <EcommerceLayout>
      <ProdutosProblemaInner />
    </EcommerceLayout>
  );
}

function ProdutosProblemaInner() {
  const {
    activeAccount,
    activeAccountId,
    isActiveConnected,
    loading: loadingAccount,
  } = useEcommerceActiveAccount();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Map<string, ProductSales>>(new Map());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!activeAccountId) {
      setListings([]);
      setProducts([]);
      setSales(new Map());
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: ls, error: el } = await supabase
          .from("ecommerce_listings")
          .select("id,product_id,ml_item_id,title,price,status,is_active,listing_url,external_url,updated_at")
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .eq("account_id", activeAccountId)
          .order("updated_at", { ascending: false });
        if (el) throw el;
        const listingsData = (ls || []) as Listing[];

        const productIds = Array.from(
          new Set(listingsData.map((l) => l.product_id).filter(Boolean)),
        ) as string[];

        // Produtos (com cost_price para diagnóstico financeiro)
        let productsData: Product[] = [];
        if (productIds.length) {
          const { data: pr, error: ep } = await supabase
            .from("ecommerce_products")
            .select("id,sku,product_name,is_active,cost_price,updated_at")
            .eq("company_id", ECOMMERCE_COMPANY_ID)
            .in("id", productIds);
          if (ep) throw ep;
          productsData = (pr || []) as Product[];
        }

        // Pedidos (não cancelados) da conta ativa + itens agregados por produto
        const { data: ords, error: eo } = await supabase
          .from("ecommerce_orders")
          .select("id,account_id,order_status")
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .eq("account_id", activeAccountId)
          .limit(20000);
        if (eo) throw eo;
        const validOrders = ((ords || []) as OrderLite[]).filter((o) => !isCancelled(o.order_status));
        const orderIds = validOrders.map((o) => o.id);

        const salesMap = new Map<string, ProductSales>();
        if (orderIds.length && productIds.length) {
          const chunks: string[][] = [];
          for (let i = 0; i < orderIds.length; i += 800) chunks.push(orderIds.slice(i, i + 800));
          const results = await Promise.all(
            chunks.map((c) =>
              supabase
                .from("ecommerce_order_items")
                .select("order_id,product_id,quantity,total_price,cost_price_at_sale,profit_status")
                .eq("company_id", ECOMMERCE_COMPANY_ID)
                .in("order_id", c)
                .limit(50000),
            ),
          );
          const items: OrderItem[] = [];
          for (const r of results) {
            if (r.error) throw r.error;
            items.push(...((r.data || []) as OrderItem[]));
          }
          const ordersByProduct = new Map<string, Set<string>>();
          for (const it of items) {
            const pid = it.product_id;
            if (!pid) continue;
            const cur = salesMap.get(pid) ?? { units: 0, revenue: 0, orders: 0, hasPendingItem: false };
            cur.units += Number(it.quantity ?? 0);
            cur.revenue += Number(it.total_price ?? 0);
            const costAtSale = Number(it.cost_price_at_sale ?? 0);
            if (costAtSale <= 0 || (it.profit_status ?? "") === "pending_calculation") {
              cur.hasPendingItem = true;
            }
            salesMap.set(pid, cur);
            if (it.order_id) {
              const s = ordersByProduct.get(pid) ?? new Set<string>();
              s.add(it.order_id);
              ordersByProduct.set(pid, s);
            }
          }
          for (const [pid, s] of ordersByProduct.entries()) {
            const cur = salesMap.get(pid);
            if (cur) cur.orders = s.size;
          }
        }

        if (cancelled) return;
        setListings(listingsData);
        setProducts(productsData);
        setSales(salesMap);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Erro ao carregar dados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  const productById = useMemo(() => {
    const m = new Map<string, Product>();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  const allRows: Row[] = useMemo(() => {
    const empty: ProductSales = { units: 0, revenue: 0, orders: 0, hasPendingItem: false };
    return listings
      .map((l) => {
        const p = l.product_id ? productById.get(l.product_id) ?? null : null;
        const s = (l.product_id ? sales.get(l.product_id) : null) ?? empty;
        const { problems, priority, suggested } = classify(l, p, s);
        return { listing: l, product: p, problems, sales: s, priority, suggestedAction: suggested };
      })
      .filter((r) => r.problems.length > 0);
  }, [listings, productById, sales]);

  const counts = useMemo(() => {
    const c = {
      total: allRows.length,
      paused: 0,
      inactive: 0,
      no_price: 0,
      bad_sku: 0,
      no_cost: 0,
      blocked_revenue: 0,
      unlinked: 0,
      blocked_revenue_sum: 0,
    };
    const countedBlocked = new Set<string>();
    for (const r of allRows) {
      if (r.problems.includes("paused")) c.paused++;
      if (r.problems.includes("inactive")) c.inactive++;
      if (r.problems.includes("no_price")) c.no_price++;
      if (r.problems.includes("bad_sku")) c.bad_sku++;
      if (r.problems.includes("no_cost")) c.no_cost++;
      if (r.problems.includes("blocked_revenue")) c.blocked_revenue++;
      if (r.problems.includes("unlinked")) c.unlinked++;
      // Somar faturamento bloqueado por produto único
      if (r.problems.includes("no_cost") && r.product && !countedBlocked.has(r.product.id)) {
        c.blocked_revenue_sum += r.sales.revenue;
        countedBlocked.add(r.product.id);
      }
    }
    return c;
  }, [allRows]);

  const q = search.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2 };
    return allRows
      .filter((r) => {
        if (filter !== "all" && !r.problems.includes(filter as ProblemKind)) return false;
        if (!q) return true;
        const hay = [
          r.product?.product_name || "",
          r.listing.title || "",
          r.product?.sku || "",
          r.listing.ml_item_id || "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (pd !== 0) return pd;
        return b.sales.revenue - a.sales.revenue;
      });
  }, [allRows, filter, q]);

  const kpis = [
    { label: "Total de problemas",     value: counts.total,                          icon: AlertTriangle, accent: "from-rose-600 to-rose-800" },
    { label: "Pausados",               value: counts.paused,                         icon: PauseCircle,   accent: "from-amber-600 to-orange-700" },
    { label: "Sem custo",              value: counts.no_cost,                        icon: DollarSign,    accent: "from-orange-600 to-rose-700" },
    { label: "Faturamento bloqueado",  value: fmtPrice(counts.blocked_revenue_sum),  icon: Wallet,        accent: "from-rose-700 to-red-900" },
    { label: "SKU inconsistente",      value: counts.bad_sku,                        icon: Hash,          accent: "from-blue-700 to-blue-900" },
  ];

  const filters: { k: FilterKey; label: string }[] = [
    { k: "all", label: "Todos" },
    { k: "paused", label: "Pausados" },
    { k: "inactive", label: "Inativos" },
    { k: "no_price", label: "Sem preço" },
    { k: "bad_sku", label: "SKU inconsistente" },
    { k: "no_cost", label: "Sem custo" },
    { k: "blocked_revenue", label: "Faturamento bloqueado" },
    { k: "unlinked", label: "Sem vínculo" },
  ];

  const showPendingState = !loadingAccount && activeAccount && !isActiveConnected;
  const showEmptyState =
    !loading && !showPendingState && activeAccount && isActiveConnected && allRows.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
          <Activity className="h-3.5 w-3.5" />
          Central de Diagnóstico
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Produtos Problema
        </h1>
        <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
          Identifique produtos que estão travando vendas, margem ou operação.
        </p>
      </header>

      {/* Active account summary */}
      <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)] flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
            <Store className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Conta analisada
            </span>
            <span className="text-sm font-bold text-foreground">
              {loadingAccount
                ? "Carregando…"
                : activeAccount?.account_name || activeAccount?.nickname || "Nenhuma conta selecionada"}
            </span>
          </div>
        </div>
        {activeAccount && (
          isActiveConnected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Conectada
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              <Link2 className="h-3.5 w-3.5" />
              Aguardando conexão
            </span>
          )
        )}
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)]"
            >
              <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${k.accent} opacity-10`} />
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {k.label}
                  </div>
                  <div className="font-display text-2xl font-bold text-foreground tabular-nums truncate">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : k.value}
                  </div>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${k.accent} text-white shadow-md`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {showPendingState ? (
        <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700 mb-3">
            <Link2 className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Esta conta ainda não está conectada.
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Conecte a conta Mercado Livre para analisar produtos com problema.
          </p>
        </section>
      ) : showEmptyState ? (
        <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Nenhum problema crítico encontrado nesta conta.
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Os anúncios sincronizados estão sem alertas nos critérios atuais.
          </p>
        </section>
      ) : (
        <>
          {/* Filters */}
          <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)] flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, título, SKU ou ML Item ID"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="inline-flex flex-wrap rounded-lg border border-border bg-muted/30 p-1">
              {filters.map((opt) => (
                <button
                  key={opt.k}
                  type="button"
                  onClick={() => setFilter(opt.k)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    filter === opt.k
                      ? "bg-blue-700 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Table */}
          <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Produto / Anúncio</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">SKU</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">ML Item ID</th>
                    <th className="px-5 py-3 text-right font-semibold whitespace-nowrap">Preço</th>
                    <th className="px-5 py-3 text-right font-semibold whitespace-nowrap">Qtd vendida</th>
                    <th className="px-5 py-3 text-right font-semibold whitespace-nowrap">Faturamento afetado</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Tipo de problema</th>
                    <th className="px-5 py-3 text-center font-semibold whitespace-nowrap">Prioridade</th>
                    <th className="px-5 py-3 text-right font-semibold whitespace-nowrap">Ação sugerida</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-16 text-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-16 text-center">
                        <div className="mx-auto max-w-md space-y-2">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                            <AlertTriangle className="h-6 w-6" />
                          </div>
                          <div className="font-display text-base font-semibold text-foreground">
                            Nenhum item corresponde aos filtros atuais.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((r) => {
                      const url = r.listing.listing_url || r.listing.external_url;
                      const pMeta = PRIORITY_META[r.priority];
                      return (
                        <tr key={r.listing.id} className="border-t border-border/60 hover:bg-muted/20">
                          <td className="px-5 py-3 align-top">
                            <div className="font-semibold text-foreground line-clamp-2">
                              {r.product?.product_name || r.listing.title || "—"}
                            </div>
                            {r.product?.product_name && r.listing.title && (
                              <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                {r.listing.title}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 align-top text-foreground/80 whitespace-nowrap">
                            {r.product?.sku || <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-5 py-3 align-top text-foreground/80 whitespace-nowrap">
                            {r.listing.ml_item_id || "—"}
                          </td>
                          <td className="px-5 py-3 align-top text-right whitespace-nowrap tabular-nums">
                            {fmtPrice(r.listing.price)}
                          </td>
                          <td className="px-5 py-3 align-top text-right whitespace-nowrap tabular-nums">
                            {r.sales.units > 0 ? r.sales.units.toLocaleString("pt-BR") : "—"}
                          </td>
                          <td className="px-5 py-3 align-top text-right whitespace-nowrap tabular-nums font-semibold">
                            {r.sales.revenue > 0 ? (
                              <span className={r.problems.includes("no_cost") ? "text-rose-700" : "text-foreground"}>
                                {fmtPrice(r.sales.revenue)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3 align-top">
                            <div className="flex flex-wrap gap-1">
                              {r.problems.map((p) => (
                                <ProblemBadge key={p} kind={p} />
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-3 align-top text-center">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${pMeta.cls}`}>
                              {pMeta.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 align-top text-right whitespace-nowrap">
                            {r.suggestedAction === "register_cost" ? (
                              <Link
                                to="/ecommerce/custos-margem"
                                hash="pending-costs-table"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                              >
                                <DollarSign className="h-3.5 w-3.5" />
                                Cadastrar custo
                              </Link>
                            ) : r.suggestedAction === "link_product" ? (
                              url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-fuchsia-200 bg-fuchsia-50 px-2.5 py-1.5 text-xs font-semibold text-fuchsia-700 hover:bg-fuchsia-100"
                                >
                                  <Link2 className="h-3.5 w-3.5" />
                                  Vincular produto/SKU
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-fuchsia-200 bg-fuchsia-50 px-2.5 py-1.5 text-xs font-semibold text-fuchsia-700">
                                  <Link2 className="h-3.5 w-3.5" />
                                  Vincular produto/SKU
                                </span>
                              )
                            ) : url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Abrir anúncio
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

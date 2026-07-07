import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Target,
  Search,
  ExternalLink,
  Loader2,
  Store,
  CheckCircle2,
  Link2,
  Pause,
  XCircle,
  Tag,
  Hash,
  Activity,
  AlertTriangle,
  ListChecks,
  DollarSign,
  Flame,
  TrendingUp,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import {
  useEcommerceActiveAccount,
  ECOMMERCE_COMPANY_ID,
} from "@/lib/ecommerce-active-account";

export const Route = createFileRoute("/ecommerce/prioridades")({
  component: CentralAcoesPage,
  head: () => ({
    meta: [{ title: "Central de Ações | Agente Comercial 360" }],
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
  account_id: string | null;
};

type Product = {
  id: string;
  sku: string | null;
  product_name: string | null;
  is_active: boolean | null;
  cost_price: number | null;
  updated_at: string | null;
};

type OrderLite = { id: string; account_id: string | null };
type OrderItem = {
  order_id: string | null;
  product_id: string | null;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
};
type Account = { id: string; account_name: string | null; nickname: string | null };

type Priority = "critical" | "high" | "medium" | "low";
type ActionType =
  | "review_pause"
  | "review_listing"
  | "fix_price"
  | "standardize_sku"
  | "follow_product"
  | "register_cost"
  | "prioritize_cost"
  | "release_margin";

type Action = {
  id: string;
  listing: Listing | null;
  product: Product | null;
  priority: Priority;
  type: ActionType;
  typeLabel: string;
  reason: string;
  recommendation: string;
  accountNames: string[];
  affectedRevenue: number | null;
  updatedAt: string | null;
  ctaHref?: string;
  ctaLabel?: string;
  ctaExternal?: boolean;
};

type FilterKey =
  | "all"
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "paused"
  | "registration"
  | "cost";

function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function fmtBRL(v: number | null | undefined) {
  const n = Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function classifyListing(l: Listing, p: Product | null, accountNames: string[]): Action[] {
  const acts: Action[] = [];
  const status = (l.status || "").toLowerCase();
  const sku = (p?.sku || "").trim();
  const url = l.listing_url || l.external_url || undefined;

  // Paused
  if (status === "paused") {
    acts.push({
      id: `${l.id}:pause`,
      listing: l,
      product: p,
      priority: "medium",
      type: "review_pause",
      typeLabel: "Revisar pausa",
      reason: "Anúncio pausado no Mercado Livre.",
      recommendation:
        "Revisar motivo da pausa e reativar se houver estoque disponível.",
      accountNames,
      affectedRevenue: null,
      updatedAt: l.updated_at,
      ctaHref: url,
      ctaLabel: "Abrir anúncio",
      ctaExternal: true,
    });
  } else if (status && status !== "active" && status !== "ativo") {
    acts.push({
      id: `${l.id}:inactive`,
      listing: l,
      product: p,
      priority: "high",
      type: "review_listing",
      typeLabel: "Revisar anúncio",
      reason: `Produto/anúncio desativado (status "${l.status}").`,
      recommendation:
        "Abrir anúncio no Mercado Livre e verificar o motivo da desativação.",
      accountNames,
      affectedRevenue: null,
      updatedAt: l.updated_at,
      ctaHref: url,
      ctaLabel: "Abrir anúncio",
      ctaExternal: true,
    });
  }

  if (l.price == null || l.price <= 0) {
    acts.push({
      id: `${l.id}:price`,
      listing: l,
      product: p,
      priority: "high",
      type: "fix_price",
      typeLabel: "Corrigir preço",
      reason: "Anúncio sem preço definido ou com valor inválido.",
      recommendation: "Corrigir preço do anúncio antes de ativar ou sincronizar.",
      accountNames,
      affectedRevenue: null,
      updatedAt: l.updated_at,
      ctaHref: url,
      ctaLabel: "Abrir anúncio",
      ctaExternal: true,
    });
  }

  const skuInvalid =
    !sku || (l.ml_item_id && sku.toLowerCase() === l.ml_item_id.toLowerCase());
  if (skuInvalid) {
    acts.push({
      id: `${l.id}:sku`,
      listing: l,
      product: p,
      priority: "medium",
      type: "standardize_sku",
      typeLabel: "Padronizar SKU",
      reason: !sku
        ? "Produto sem SKU cadastrado."
        : "SKU está igual ao ML Item ID.",
      recommendation:
        "Padronizar SKU para facilitar controle de estoque, integração e relatórios.",
      accountNames,
      affectedRevenue: null,
      updatedAt: l.updated_at,
      ctaHref: url,
      ctaLabel: "Abrir anúncio",
      ctaExternal: true,
    });
  }

  const isActive = status === "active" || status === "ativo";
  if (
    isActive &&
    l.is_active !== false &&
    (l.price || 0) > 0 &&
    sku &&
    !(l.ml_item_id && sku.toLowerCase() === l.ml_item_id.toLowerCase())
  ) {
    acts.push({
      id: `${l.id}:follow`,
      listing: l,
      product: p,
      priority: "low",
      type: "follow_product",
      typeLabel: "Acompanhar produto",
      reason: "Anúncio ativo e bem estruturado.",
      recommendation:
        "Acompanhar produto ativo e manter pronto para análise comercial futura.",
      accountNames,
      affectedRevenue: null,
      updatedAt: l.updated_at,
      ctaHref: url,
      ctaLabel: "Abrir anúncio",
      ctaExternal: true,
    });
  }

  return acts;
}

function CentralAcoesPage() {
  return (
    <EcommerceLayout>
      <CentralAcoesInner />
    </EcommerceLayout>
  );
}

function CentralAcoesInner() {
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
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [ordersById, setOrdersById] = useState<Map<string, OrderLite>>(new Map());
  const [accountsMap, setAccountsMap] = useState<Map<string, Account>>(new Map());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!activeAccountId) {
      setListings([]);
      setProducts([]);
      setOrderItems([]);
      setOrdersById(new Map());
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ data: ls, error: el }, { data: accs, error: ea }] = await Promise.all([
          supabase
            .from("ecommerce_listings")
            .select(
              "id,product_id,ml_item_id,title,price,status,is_active,listing_url,external_url,updated_at,account_id",
            )
            .eq("company_id", ECOMMERCE_COMPANY_ID)
            .eq("account_id", activeAccountId)
            .order("updated_at", { ascending: false }),
          supabase
            .from("ecommerce_accounts")
            .select("id,account_name,nickname")
            .eq("company_id", ECOMMERCE_COMPANY_ID),
        ]);
        if (el) throw el;
        if (ea) throw ea;
        const listingsData = (ls || []) as Listing[];
        const am = new Map<string, Account>();
        (accs || []).forEach((a: any) => am.set(a.id, a as Account));

        const { data: pr, error: ep } = await supabase
          .from("ecommerce_products")
          .select("id,sku,product_name,is_active,cost_price,updated_at")
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .limit(50000);
        if (ep) throw ep;
        const productsData = (pr || []) as Product[];

        const { data: ords, error: eo } = await supabase
          .from("ecommerce_orders")
          .select("id,account_id")
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .eq("account_id", activeAccountId)
          .limit(20000);
        if (eo) throw eo;
        const ordMap = new Map<string, OrderLite>();
        (ords || []).forEach((o: any) => ordMap.set(o.id, o as OrderLite));

        const orderIds = Array.from(ordMap.keys());
        let items: OrderItem[] = [];
        if (orderIds.length > 0) {
          const chunks: string[][] = [];
          for (let i = 0; i < orderIds.length; i += 1000)
            chunks.push(orderIds.slice(i, i + 1000));
          const results = await Promise.all(
            chunks.map((c) =>
              supabase
                .from("ecommerce_order_items")
                .select("order_id,product_id,quantity,unit_price,total_price")
                .eq("company_id", ECOMMERCE_COMPANY_ID)
                .in("order_id", c)
                .limit(50000),
            ),
          );
          for (const r of results) {
            if (r.error) throw r.error;
            items.push(...((r.data || []) as OrderItem[]));
          }
        }

        if (cancelled) return;
        setListings(listingsData);
        setProducts(productsData);
        setOrderItems(items);
        setOrdersById(ordMap);
        setAccountsMap(am);
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

  // Aggregate sold-without-cost per product from real order items.
  type CostAgg = {
    product: Product;
    orders: number;
    units: number;
    revenue: number;
    accountNames: string[];
  };
  const costAggs: CostAgg[] = useMemo(() => {
    if (orderItems.length === 0 || products.length === 0) return [];
    type Agg = {
      orders: Set<string>;
      units: number;
      revenue: number;
      accountIds: Set<string>;
    };
    const map = new Map<string, Agg>();
    for (const it of orderItems) {
      if (!it.product_id) continue;
      const p = productById.get(it.product_id);
      if (!p) continue;
      const cost = p.cost_price ?? 0;
      if (cost > 0) continue;
      const qty = Number(it.quantity ?? 0) || 0;
      const unit = Number(it.unit_price ?? 0) || 0;
      const rev =
        Number(it.total_price ?? 0) > 0 ? Number(it.total_price) : qty * unit;
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
    const out: CostAgg[] = [];
    for (const [pid, agg] of map.entries()) {
      const p = productById.get(pid)!;
      const accountNames = Array.from(agg.accountIds).map((id) => {
        const a = accountsMap.get(id);
        return a?.account_name || a?.nickname || id;
      });
      out.push({
        product: p,
        orders: agg.orders.size,
        units: agg.units,
        revenue: agg.revenue,
        accountNames,
      });
    }
    out.sort((a, b) => b.revenue - a.revenue);
    return out;
  }, [orderItems, ordersById, productById, products, accountsMap]);

  // Which listing accounts each product sells through — for listing actions.
  const listingAccountNames = (l: Listing): string[] => {
    if (!l.account_id) return [];
    const a = accountsMap.get(l.account_id);
    return a ? [a.account_name || a.nickname || l.account_id] : [l.account_id];
  };

  const costActions: Action[] = useMemo(() => {
    const acts: Action[] = [];
    costAggs.forEach((agg, idx) => {
      const p = agg.product;
      const isTop5 = idx < 5;
      const highImpact = agg.revenue >= 500 || agg.units >= 20;
      let priority: Priority;
      let type: ActionType;
      let typeLabel: string;
      let reason: string;
      let recommendation: string;
      if (isTop5) {
        priority = "critical";
        type = "prioritize_cost";
        typeLabel = "Priorizar custo";
        reason = "Produto bloqueia alto faturamento.";
        recommendation = "Cadastrar custo deste SKU primeiro.";
      } else if (highImpact) {
        priority = "high";
        type = "release_margin";
        typeLabel = "Liberar margem";
        reason = "Faturamento vendido ainda não possui lucro real calculado.";
        recommendation = "Cadastrar custo para liberar análise financeira.";
      } else {
        priority = agg.revenue >= 100 ? "high" : "medium";
        type = "register_cost";
        typeLabel = "Cadastrar custo";
        reason = "Produto vendido sem custo, margem bloqueada.";
        recommendation = "Cadastrar custo para liberar lucro real e margem.";
      }
      acts.push({
        id: `cost:${p.id}`,
        listing: null,
        product: p,
        priority,
        type,
        typeLabel,
        reason,
        recommendation,
        accountNames: agg.accountNames,
        affectedRevenue: agg.revenue,
        updatedAt: p.updated_at,
        ctaHref: "/ecommerce/custos-margem#pending-costs-table",
        ctaLabel: "Cadastrar custo",
        ctaExternal: false,
      });
    });
    return acts;
  }, [costAggs]);

  const listingActions: Action[] = useMemo(() => {
    const out: Action[] = [];
    for (const l of listings) {
      const p = l.product_id ? productById.get(l.product_id) ?? null : null;
      out.push(...classifyListing(l, p, listingAccountNames(l)));
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, productById, accountsMap]);

  const allActions: Action[] = useMemo(() => {
    const rank: Record<Priority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    const rows = [...costActions, ...listingActions];
    rows.sort((a, b) => {
      const r = rank[a.priority] - rank[b.priority];
      if (r !== 0) return r;
      return (b.affectedRevenue ?? 0) - (a.affectedRevenue ?? 0);
    });
    return rows;
  }, [costActions, listingActions]);

  const counts = useMemo(() => {
    const total = allActions.length;
    const critical = allActions.filter((a) => a.priority === "critical").length;
    const high = allActions.filter((a) => a.priority === "high").length;
    const medium = allActions.filter((a) => a.priority === "medium").length;
    const low = allActions.filter((a) => a.priority === "low").length;
    const paused = allActions.filter((a) => a.type === "review_pause").length;
    const costOnes = allActions.filter(
      (a) =>
        a.type === "register_cost" ||
        a.type === "prioritize_cost" ||
        a.type === "release_margin",
    );
    const blockedRevenue = costOnes.reduce((s, a) => s + (a.affectedRevenue ?? 0), 0);
    return {
      total,
      critical,
      high,
      medium,
      low,
      paused,
      cost: costOnes.length,
      blockedRevenue,
    };
  }, [allActions]);

  const q = search.trim().toLowerCase();
  const filteredActions = useMemo(() => {
    let rows = allActions.slice();
    if (filter === "critical") rows = rows.filter((a) => a.priority === "critical");
    else if (filter === "high") rows = rows.filter((a) => a.priority === "high");
    else if (filter === "medium") rows = rows.filter((a) => a.priority === "medium");
    else if (filter === "low") rows = rows.filter((a) => a.priority === "low");
    else if (filter === "paused") rows = rows.filter((a) => a.type === "review_pause");
    else if (filter === "registration")
      rows = rows.filter(
        (a) =>
          a.type === "review_listing" ||
          a.type === "fix_price" ||
          a.type === "standardize_sku",
      );
    else if (filter === "cost")
      rows = rows.filter(
        (a) =>
          a.type === "register_cost" ||
          a.type === "prioritize_cost" ||
          a.type === "release_margin",
      );
    if (!q) return rows;
    return rows.filter((a) => {
      const hay = [
        a.product?.product_name || "",
        a.listing?.title || "",
        a.product?.sku || "",
        a.listing?.ml_item_id || "",
        a.accountNames.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [allActions, filter, q]);

  const kpis = [
    { label: "Total de ações", value: counts.total.toLocaleString("pt-BR"), icon: ListChecks, accent: "from-blue-700 to-blue-900" },
    { label: "Críticas", value: counts.critical.toLocaleString("pt-BR"), icon: Flame, accent: "from-red-700 to-rose-900" },
    { label: "Alta prioridade", value: counts.high.toLocaleString("pt-BR"), icon: AlertTriangle, accent: "from-rose-600 to-rose-800" },
    { label: "Média prioridade", value: counts.medium.toLocaleString("pt-BR"), icon: Activity, accent: "from-amber-600 to-orange-700" },
    { label: "Ações de custo", value: counts.cost.toLocaleString("pt-BR"), icon: DollarSign, accent: "from-indigo-600 to-blue-800" },
    { label: "Pausados para revisar", value: counts.paused.toLocaleString("pt-BR"), icon: Pause, accent: "from-slate-600 to-slate-800" },
    { label: "Faturamento bloqueado", value: fmtBRL(counts.blockedRevenue), icon: TrendingUp, accent: "from-rose-600 to-red-800" },
  ];

  const filters: { k: FilterKey; label: string }[] = [
    { k: "all", label: "Todas" },
    { k: "critical", label: "Críticas" },
    { k: "high", label: "Alta prioridade" },
    { k: "medium", label: "Média prioridade" },
    { k: "low", label: "Baixa prioridade" },
    { k: "cost", label: "Custo" },
    { k: "paused", label: "Pausados" },
    { k: "registration", label: "Cadastro" },
  ];

  const showPendingState = !loadingAccount && activeAccount && !isActiveConnected;
  const showEmptyState =
    !loading && !showPendingState && activeAccount && isActiveConnected && allActions.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
          <Target className="h-3.5 w-3.5" />
          Operação Inteligente
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Central de Ações
        </h1>
        <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
          O que o operador precisa fazer primeiro hoje. Ações consolidadas de Produtos Problema, Custos e Margem, Produtos Prioritários por Impacto e Anúncios.
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
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
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
                  <div className="font-display text-xl xl:text-2xl font-bold text-foreground tabular-nums whitespace-nowrap">
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
            Conecte a conta Mercado Livre para gerar ações operacionais.
          </p>
        </section>
      ) : showEmptyState ? (
        <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Nenhuma ação pendente encontrada.
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Anúncios e custos da conta selecionada estão em dia nos critérios atuais.
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
                placeholder="Buscar por nome, título, SKU, conta ou ML Item ID"
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
          <ScrollableTableSection>
            <table className="w-full text-sm min-w-[1400px]">
              <thead>
                <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="sticky left-0 z-20 bg-muted/60 backdrop-blur px-4 py-3 text-left font-semibold whitespace-nowrap shadow-[1px_0_0_0_var(--color-border)]">Prioridade</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Produto / Anúncio</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Conta ML</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Tipo de ação</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Motivo</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Ação recomendada</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Faturamento afetado</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Atualização</th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Ação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-16 text-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredActions.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-16 text-center">
                      <div className="mx-auto max-w-md space-y-2">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                          <ListChecks className="h-6 w-6" />
                        </div>
                        <div className="font-display text-base font-semibold text-foreground">
                          Nenhuma ação corresponde aos filtros atuais.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredActions.map((a) => {
                    const isCostAction =
                      a.type === "register_cost" ||
                      a.type === "prioritize_cost" ||
                      a.type === "release_margin";
                    return (
                      <tr key={a.id} className="group border-t border-border/60 hover:bg-muted/20 align-top">
                        <td className="sticky left-0 z-10 bg-card group-hover:bg-muted/40 px-4 py-3 shadow-[1px_0_0_0_var(--color-border)]">
                          <PriorityBadge p={a.priority} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground line-clamp-2">
                            {a.product?.product_name || a.listing?.title || "—"}
                          </div>
                          {a.listing?.ml_item_id && (
                            <div className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {a.listing.ml_item_id}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {a.product?.sku ? (
                            <span className="inline-flex items-center gap-1 font-mono text-foreground/80">
                              <Hash className="h-3 w-3" />
                              {a.product.sku}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {a.accountNames.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {a.accountNames.slice(0, 2).map((n, i) => (
                                <span
                                  key={i}
                                  className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground/80"
                                >
                                  {n}
                                </span>
                              ))}
                              {a.accountNames.length > 2 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{a.accountNames.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <ActionTypeBadge type={a.type} label={a.typeLabel} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[240px]">
                          {a.reason}
                        </td>
                        <td className="px-4 py-3 text-foreground max-w-[280px]">
                          {a.recommendation}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isCostAction ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                              <AlertTriangle className="h-3 w-3" />
                              Sem custo
                            </span>
                          ) : (
                            <StatusBadge status={a.listing?.status ?? null} />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                          {a.affectedRevenue != null ? (
                            <span className="font-semibold text-rose-700">
                              {fmtBRL(a.affectedRevenue)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {fmtDate(a.updatedAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {a.ctaHref ? (
                            a.ctaExternal ? (
                              <a
                                href={a.ctaHref}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40"
                              >
                                {a.ctaLabel}
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            ) : (
                              <Link
                                to="/ecommerce/custos-margem"
                                hash="pending-costs-table"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                              >
                                {a.ctaLabel}
                              </Link>
                            )
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
          </ScrollableTableSection>

        </>
      )}
    </div>
  );
}

function PriorityBadge({ p }: { p: Priority }) {
  if (p === "critical")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-800">
        <Flame className="h-3 w-3" />
        Crítica
      </span>
    );
  if (p === "high")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
        <AlertTriangle className="h-3 w-3" />
        Alta
      </span>
    );
  if (p === "medium")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Activity className="h-3 w-3" />
        Média
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      <CheckCircle2 className="h-3 w-3" />
      Baixa
    </span>
  );
}

function ActionTypeBadge({ type, label }: { type: ActionType; label: string }) {
  const map: Record<ActionType, string> = {
    review_pause: "border-slate-200 bg-slate-50 text-slate-700",
    review_listing: "border-rose-200 bg-rose-50 text-rose-700",
    fix_price: "border-violet-200 bg-violet-50 text-violet-700",
    standardize_sku: "border-indigo-200 bg-indigo-50 text-indigo-700",
    follow_product: "border-blue-200 bg-blue-50 text-blue-700",
    register_cost: "border-emerald-200 bg-emerald-50 text-emerald-700",
    prioritize_cost: "border-red-200 bg-red-50 text-red-800",
    release_margin: "border-orange-200 bg-orange-50 text-orange-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${map[type]}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "ativo")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Ativo
      </span>
    );
  if (s === "paused")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Pause className="h-3 w-3" />
        Pausado
      </span>
    );
  if (!s)
    return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      <XCircle className="h-3 w-3" />
      {status}
    </span>
  );
}

function ScrollableTableSection({ children }: { children: React.ReactNode }) {
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const topProxyRef = useRef<HTMLDivElement | null>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const syncingRef = useRef<"top" | "bottom" | null>(null);

  const updateFades = useCallback(() => {
    const el = tableWrapRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 4);
    setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;
    const measure = () => {
      setContentWidth(el.scrollWidth);
      updateFades();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [updateFades, children]);

  const handleBottomScroll = () => {
    if (syncingRef.current === "top") { syncingRef.current = null; return; }
    const bottom = tableWrapRef.current;
    const top = topProxyRef.current;
    if (bottom && top && top.scrollLeft !== bottom.scrollLeft) {
      syncingRef.current = "bottom";
      top.scrollLeft = bottom.scrollLeft;
    }
    updateFades();
  };

  const handleTopScroll = () => {
    if (syncingRef.current === "bottom") { syncingRef.current = null; return; }
    const bottom = tableWrapRef.current;
    const top = topProxyRef.current;
    if (bottom && top && bottom.scrollLeft !== top.scrollLeft) {
      syncingRef.current = "top";
      bottom.scrollLeft = top.scrollLeft;
    }
  };

  return (
    <section className="relative rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
      {/* Sticky top scrollbar synced with table */}
      <div
        ref={topProxyRef}
        onScroll={handleTopScroll}
        className="sticky top-[64px] z-30 overflow-x-auto overflow-y-hidden rounded-t-2xl border-b border-border/60 bg-card/95 backdrop-blur"
        style={{ height: 14 }}
        aria-hidden="true"
      >
        <div style={{ width: contentWidth, height: 1 }} />
      </div>

      <div className="relative">
        {/* Edge fades */}
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 w-8 z-10 bg-gradient-to-r from-card to-transparent transition-opacity ${showLeftFade ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 w-10 z-10 bg-gradient-to-l from-card to-transparent transition-opacity ${showRightFade ? "opacity-100" : "opacity-0"}`}
        />

        <div
          ref={tableWrapRef}
          onScroll={handleBottomScroll}
          className="overflow-x-auto overflow-y-visible"
        >
          {children}
        </div>
      </div>

      {/* Sticky bottom scrollbar (always accessible) */}
      <div
        ref={(el) => {
          // secondary sticky-bottom proxy uses same width — mount as separate div
          if (!el) return;
        }}
        className="sticky bottom-0 z-30 overflow-x-auto overflow-y-hidden rounded-b-2xl border-t border-border/60 bg-card/95 backdrop-blur"
        style={{ height: 14 }}
        aria-hidden="true"
        onScroll={(e) => {
          if (syncingRef.current === "top") { syncingRef.current = null; return; }
          const bottom = tableWrapRef.current;
          const top = topProxyRef.current;
          const src = e.currentTarget;
          if (bottom && bottom.scrollLeft !== src.scrollLeft) {
            syncingRef.current = "bottom";
            bottom.scrollLeft = src.scrollLeft;
          }
          if (top && top.scrollLeft !== src.scrollLeft) {
            top.scrollLeft = src.scrollLeft;
          }
        }}
      >
        <div style={{ width: contentWidth, height: 1 }} />
      </div>
    </section>
  );
}


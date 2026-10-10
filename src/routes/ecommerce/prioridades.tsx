import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Target,
  Search,
  ExternalLink,
  Store,
  CheckCircle2,
  Link2,
  Pause,
  XCircle,
  Tag,
  Activity,
  AlertTriangle,
  ListChecks,
  DollarSign,
  Flame,
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

  const filters: { k: FilterKey; label: string }[] = [
    { k: "all", label: "Todas" },
    { k: "critical", label: "Críticas" },
    { k: "high", label: "Alta prioridade" },
    { k: "cost", label: "Custos" },
    { k: "paused", label: "Pausados" },
  ];

  const topImpactAction = useMemo(() => {
    return (
      allActions
        .filter((action) => typeof action.affectedRevenue === "number" && (action.affectedRevenue ?? 0) > 0)
        .slice()
        .sort((a, b) => (b.affectedRevenue ?? 0) - (a.affectedRevenue ?? 0))[0] ?? null
    );
  }, [allActions]);

  const showPendingState = !loadingAccount && activeAccount && !isActiveConnected;
  const showEmptyState =
    !loading && !showPendingState && activeAccount && isActiveConnected && allActions.length === 0;

  const accountLabel = loadingAccount
    ? "Carregando…"
    : activeAccount?.account_name || activeAccount?.nickname || "Nenhuma conta selecionada";

  return (
    <div className="space-y-6">
      {/* Header executivo */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-700">
            <Target className="h-3.5 w-3.5" />
            Operação inteligente
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[#0A1F44] md:text-[30px]">
              Central de Ações
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Veja o que precisa ser resolvido primeiro e concentre esforço no que mais impacta resultado.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white px-3.5 py-2 text-xs shadow-[0_12px_30px_-24px_rgba(10,31,68,.38)]">
          <Store className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{accountLabel}</span>
          {activeAccount &&
            (isActiveConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Conectada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                <Link2 className="h-3 w-3" />
                Aguardando
              </span>
            ))}
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Hero operacional premium */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071B45] via-[#103878] to-[#1E5EFF] p-4 shadow-[0_30px_70px_-42px_rgba(7,27,69,.9)] sm:p-5">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/[0.07] blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-[-90px] left-[20%] h-56 w-56 rounded-full bg-cyan-300/[0.07] blur-3xl" />

        <div className="relative grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="flex min-w-0 flex-col justify-between rounded-[22px] border border-white/[0.10] bg-white/[0.04] p-4 backdrop-blur-sm sm:p-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.07] px-3 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F5C842]" />
                Prioridade financeira
              </div>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/62">
                Faturamento que exige atenção
              </p>
              {loading ? (
                <span className="mt-3 block h-12 w-52 animate-pulse rounded-lg bg-white/15" />
              ) : (
                <div className="mt-1.5 font-display text-[38px] font-bold tracking-[-0.045em] text-white sm:text-[44px]">
                  {fmtBRL(counts.blockedRevenue)}
                </div>
              )}
              <p className="mt-1.5 max-w-md text-[11.5px] leading-relaxed text-white/68">
                Receita associada às ações de custo e prioridade que merecem intervenção primeiro.
              </p>
            </div>

            {topImpactAction && (
              <div className="mt-5 rounded-2xl border border-white/[0.10] bg-black/[0.10] px-4 py-3.5">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[8.5px] font-semibold uppercase tracking-[0.15em] text-white/60">
                        Maior impacto agora
                      </span>
                      <PriorityBadge p={topImpactAction.priority} />
                    </div>
                    <p className="mt-1.5 truncate text-[13px] font-semibold text-white" title={topImpactAction.product?.product_name || topImpactAction.listing?.title || "Ação prioritária"}>
                      {topImpactAction.product?.product_name || topImpactAction.listing?.title || "Ação prioritária"}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[10.5px] text-white/62">
                      {topImpactAction.recommendation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    {topImpactAction.affectedRevenue != null && (
                      <div className="text-right">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/45">
                          Faturamento afetado
                        </p>
                        <p className="mt-0.5 text-[13px] font-bold text-white">
                          {fmtBRL(topImpactAction.affectedRevenue)}
                        </p>
                      </div>
                    )}
                    {topImpactAction.ctaHref &&
                      (topImpactAction.ctaExternal ? (
                        <a
                          href={topImpactAction.ctaHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.10] px-3 text-[10.5px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.16]"
                        >
                          Resolver
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <Link
                          to="/ecommerce/custos-margem"
                          hash="pending-costs-table"
                          className="inline-flex h-9 items-center rounded-xl bg-white px-3.5 text-[10.5px] font-semibold text-[#0A1F44] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          Resolver
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PremiumActionMetric
              label="Ações abertas"
              value={counts.total}
              loading={loading}
              hint="Fila total"
            />
            <PremiumActionMetric
              label="Críticas"
              value={counts.critical}
              loading={loading}
              hint="Resolver primeiro"
              tone="danger"
              icon={<Flame className="h-4 w-4" />}
            />
            <PremiumActionMetric
              label="Alta prioridade"
              value={counts.high}
              loading={loading}
              hint="Atenção imediata"
              tone="warning"
              icon={<AlertTriangle className="h-4 w-4" />}
            />
            <PremiumActionMetric
              label="Ações de custo"
              value={counts.cost}
              loading={loading}
              hint="Impactam margem"
              tone="info"
              icon={<DollarSign className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      {showPendingState ? (
        <section className="rounded-[24px] border border-dashed border-border bg-card p-10 text-center shadow-[0_18px_44px_-36px_rgba(10,31,68,.4)]">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <Link2 className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Esta conta ainda não está conectada.
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Conecte a conta Mercado Livre para gerar ações operacionais.
          </p>
        </section>
      ) : showEmptyState ? (
        <EmptyState />
      ) : (
        <>
          {/* Busca + filtros */}
          <section className="flex flex-wrap items-center gap-3 rounded-[22px] border border-border/60 bg-card p-2.5 shadow-[0_16px_36px_-32px_rgba(10,31,68,.40)]">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto, SKU, título ou ID..."
                className="w-full rounded-xl border border-transparent bg-muted/35 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/30 focus:bg-background"
              />
            </div>
            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-muted/45 p-1">
              {filters.map((opt) => (
                <button
                  key={opt.k}
                  type="button"
                  onClick={() => setFilter(opt.k)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    filter === opt.k
                      ? "bg-white text-[#0A1F44] shadow-sm ring-1 ring-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Lista de ações — sem aparência de planilha */}
          <section className="overflow-hidden rounded-[24px] border border-border/60 bg-card shadow-[0_20px_50px_-40px_rgba(10,31,68,.45)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Fila priorizada
                </p>
                <h2 className="mt-1 text-base font-semibold text-[#0A1F44]">
                  Ações recomendadas
                </h2>
              </div>
              <span className="rounded-full bg-[#EEF4FF] px-3 py-1.5 text-[10px] font-semibold text-[#1E5EFF]">
                {loading ? "Carregando…" : `${filteredActions.length.toLocaleString("pt-BR")} ações`}
              </span>
            </div>

            <div className="divide-y divide-border/50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid gap-4 px-5 py-5 lg:grid-cols-[110px_1.1fr_1fr_170px] lg:items-center">
                    <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-56 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-36 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="ml-auto h-9 w-28 animate-pulse rounded-xl bg-muted" />
                  </div>
                ))
              ) : filteredActions.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <ListChecks className="h-6 w-6" />
                  </div>
                  <div className="mt-3 font-display text-base font-semibold text-foreground">
                    Nenhuma ação corresponde aos filtros atuais.
                  </div>
                </div>
              ) : (
                filteredActions.map((a) => {
                  const isCostAction =
                    a.type === "register_cost" ||
                    a.type === "prioritize_cost" ||
                    a.type === "release_margin";
                  const title = a.product?.product_name || a.listing?.title || "—";
                  const subId = a.product?.sku || a.listing?.ml_item_id || null;

                  return (
                    <article
                      key={a.id}
                      className="group grid gap-4 px-5 py-5 transition-colors hover:bg-[#F8FAFD] lg:grid-cols-[110px_1.1fr_1fr_170px] lg:items-center"
                    >
                      <div className="flex items-center lg:block">
                        <PriorityBadge p={a.priority} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground transition group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600">
                            <Tag className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#0A1F44]" title={title}>
                              {title}
                            </p>
                            <p className="mt-1 truncate text-[10.5px] text-muted-foreground">
                              {subId ? <span className="font-mono">{subId}</span> : "Sem SKU"}
                              {a.accountNames[0] ? ` · ${a.accountNames[0]}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 lg:hidden">
                          <ActionTypeBadge type={a.type} label={a.typeLabel} />
                          {a.affectedRevenue != null && (
                            <span className="text-[11px] font-semibold text-rose-700">
                              {fmtBRL(a.affectedRevenue)} afetados
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="hidden lg:block">
                          <ActionTypeBadge type={a.type} label={a.typeLabel} />
                        </div>
                        <p className="mt-2 line-clamp-2 text-[12px] font-semibold leading-relaxed text-foreground" title={a.recommendation}>
                          {a.recommendation}
                        </p>
                        <p className="mt-1 line-clamp-1 text-[10.5px] text-muted-foreground" title={a.reason}>
                          {a.reason}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                        <div className="text-left lg:text-right">
                          <p className="text-[8.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Faturamento afetado
                          </p>
                          <p className="mt-1 text-[13px] font-bold tabular-nums text-[#0A1F44]">
                            {a.affectedRevenue != null ? fmtBRL(a.affectedRevenue) : "—"}
                          </p>
                          <p className="mt-0.5 text-[9.5px] text-muted-foreground">
                            {isCostAction ? "Custo pendente" : `Atualizado ${fmtDate(a.updatedAt)}`}
                          </p>
                        </div>

                        {a.ctaHref ? (
                          a.ctaExternal ? (
                            <a
                              href={a.ctaHref}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-white px-3 text-[11px] font-semibold text-[#0A1F44] shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
                            >
                              Resolver
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <Link
                              to="/ecommerce/custos-margem"
                              hash="pending-costs-table"
                              className="inline-flex h-9 items-center rounded-xl bg-[#0A1F44] px-3.5 text-[11px] font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#123266] hover:shadow-md"
                            >
                              Executar ação
                            </Link>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function PremiumActionMetric({
  label,
  value,
  loading,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: number;
  loading: boolean;
  hint: string;
  tone?: "default" | "danger" | "warning" | "info";
  icon?: React.ReactNode;
}) {
  const toneClass =
    tone === "danger"
      ? "text-rose-200"
      : tone === "warning"
        ? "text-amber-200"
        : tone === "info"
          ? "text-blue-200"
          : "text-white";

  return (
    <div className="group flex min-h-[112px] flex-col justify-between rounded-[20px] border border-white/[0.12] bg-white/[0.075] p-3.5 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.11]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/68">
          {label}
        </p>
        {icon && <span className={toneClass}>{icon}</span>}
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded-lg bg-white/15" />
        ) : (
          <p className={`font-display text-[28px] font-bold tracking-tight tabular-nums ${toneClass}`}>
            {value.toLocaleString("pt-BR")}
          </p>
        )}
        <p className="mt-0.5 text-[9.5px] text-white/58">{hint}</p>
      </div>
    </div>
  );
}

function KpiItem({
  label,
  loading,
  align = "left",
  children,
}: {
  label: string;
  loading: boolean;
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${align === "right" ? "items-end" : "items-start"}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {loading ? (
        <span className="h-6 w-16 animate-pulse rounded-md bg-muted" />
      ) : (
        children
      )}
    </div>
  );
}

function KpiCompact({
  label,
  value,
  loading,
  tone = "default",
  icon,
}: {
  label: string;
  value: number;
  loading: boolean;
  tone?: "default" | "danger" | "warning" | "info";
  icon?: React.ReactNode;
}) {
  const toneClass =
    tone === "danger"
      ? "text-rose-700"
      : tone === "warning"
        ? "text-amber-700"
        : tone === "info"
          ? "text-blue-700"
          : "text-[#0A1F44]";
  return (
    <div className="border-b border-r border-border/50 px-4 py-4 last:border-r-0 lg:[&:nth-child(n+3)]:border-b-0">
      <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      {loading ? (
        <span className="mt-2 block h-6 w-12 animate-pulse rounded-md bg-muted" />
      ) : (
        <div className={`mt-1.5 flex items-center gap-1.5 font-display text-xl font-bold tabular-nums ${toneClass}`}>
          {icon}
          {value.toLocaleString("pt-BR")}
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/50">
      <td className="px-4 py-3">
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-48 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-1.5">
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-3.5 w-56 animate-pulse rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="ml-auto h-3.5 w-20 animate-pulse rounded bg-muted" />
      </td>
      <td className="px-4 py-3">
        <div className="ml-auto h-7 w-24 animate-pulse rounded-md bg-muted" />
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-[var(--shadow-soft)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h3 className="font-display text-lg font-bold text-foreground">
        Nenhuma ação pendente. Sua operação está otimizada!
      </h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
        Anúncios e custos da conta selecionada estão em dia nos critérios atuais.
      </p>
    </section>
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

    </section>
  );
}


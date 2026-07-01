import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Map as MapIcon,
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  Link2Off,
  Search,
  AlertCircle,
  X,
  MapPin,
  Building2,
  Trophy,
  Truck,
  Lightbulb,
  Target,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { SalesMap, type CityPoint } from "@/components/ecommerce/SalesMap";
import { supabase } from "@/lib/supabase";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { normalizeLocation, cityKey, type CanonicalLocation } from "@/lib/br-locations";

export const Route = createFileRoute("/ecommerce/mapa-vendas")({
  component: MapaVendas,
  head: () => ({
    meta: [{ title: "Mapa de Vendas | Agente Comercial 360" }],
  }),
});

type OrderRow = {
  id: string;
  account_id: string | null;
  external_order_id: string | null;
  order_date: string | null;
  buyer_name: string | null;
  buyer_nickname: string | null;
  buyer_city: string | null;
  buyer_state: string | null;
  order_status: string | null;
  payment_status: string | null;
  shipping_status: string | null;
  total_amount: number | null;
  profit_status: string | null;
  profit_confidence: string | null;
};

type ItemRow = {
  id: string;
  order_id: string;
  sku: string | null;
  product_name: string | null;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
  product_id: string | null;
};

type FlatRow = {
  order: OrderRow;
  item: ItemRow;
  accountName: string;
  loc: CanonicalLocation;
};

const BRL = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const fmtDateTime = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

function translateStatus(s: string | null | undefined): string {
  const k = (s ?? "").toLowerCase();
  const map: Record<string, string> = {
    paid: "Pago",
    approved: "Aprovado",
    cancelled: "Cancelado",
    canceled: "Cancelado",
    pending: "Pendente",
    ready_to_ship: "Pronto para enviar",
    shipped: "Enviado",
    delivered: "Entregue",
    handling: "Em preparação",
    in_transit: "Em trânsito",
    not_delivered: "Não entregue",
  };
  return map[k] ?? (s ?? "—");
}

function statusTone(_kind: "payment" | "shipping", s: string | null | undefined): string {
  const k = (s ?? "").toLowerCase();
  if (["paid", "approved", "delivered", "shipped"].includes(k))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (["cancelled", "canceled", "not_delivered"].includes(k))
    return "bg-red-50 text-red-700 border-red-200";
  if (["pending", "handling", "ready_to_ship", "in_transit"].includes(k))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function MapaVendas() {
  return (
    <EcommerceLayout>
      <MapaVendasContent />
    </EcommerceLayout>
  );
}

function MapaVendasContent() {
  const { accounts, activeAccountId, activeAccount, loading: accLoading } =
    useEcommerceActiveAccount();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);

  const [period, setPeriod] = useState<"today" | "7d" | "30d">("30d");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [shippingFilter, setShippingFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FlatRow | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ city: string; uf: string } | null>(null);
  const [mapPick, setMapPick] = useState<
    | { kind: "city"; city: string; uf: string }
    | { kind: "state"; uf: string }
    | null
  >(null);
  const [activeTab, setActiveTab] = useState<"map" | "cities" | "products" | "orders">("map");
  const [productQuery, setProductQuery] = useState("");

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccountId, period]);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const since = new Date(now);
      if (period === "today") since.setHours(0, 0, 0, 0);
      else if (period === "7d") since.setDate(now.getDate() - 7);
      else since.setDate(now.getDate() - 30);

      let q = supabase
        .from("ecommerce_orders")
        .select(
          "id, account_id, external_order_id, order_date, buyer_name, buyer_nickname, buyer_city, buyer_state, order_status, payment_status, shipping_status, total_amount, profit_status, profit_confidence",
        )
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .gte("order_date", since.toISOString())
        .order("order_date", { ascending: false })
        .limit(1000);

      if (activeAccountId) q = q.eq("account_id", activeAccountId);

      const oRes = await q;
      if (oRes.error) throw oRes.error;
      const oRows = (oRes.data as OrderRow[]) ?? [];
      setOrders(oRows);

      if (oRows.length === 0) {
        setItems([]);
        return;
      }
      const orderIds = oRows.map((o) => o.id);
      const iRes = await supabase
        .from("ecommerce_order_items")
        .select("id, order_id, sku, product_name, quantity, unit_price, total_price, product_id")
        .in("order_id", orderIds);
      if (iRes.error) throw iRes.error;
      setItems((iRes.data as ItemRow[]) ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }

  const accountsById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of accounts) m.set(a.id, a.account_name ?? a.nickname ?? "—");
    return m;
  }, [accounts]);

  const accountFallbackName =
    activeAccount?.account_name ?? activeAccount?.nickname ?? null;

  function resolveAccountName(accountId: string | null): string {
    if (accountId && accountsById.get(accountId)) return accountsById.get(accountId)!;
    if (activeAccountId && accountId === activeAccountId && accountFallbackName)
      return accountFallbackName;
    if (activeAccountId && accountFallbackName) return accountFallbackName;
    return "—";
  }

  const flat: FlatRow[] = useMemo(() => {
    const ordersById = new Map(orders.map((o) => [o.id, o]));
    const locByOrder = new Map<string, CanonicalLocation>();
    for (const o of orders) {
      locByOrder.set(o.id, normalizeLocation(o.buyer_state, o.buyer_city));
    }
    const rows: FlatRow[] = [];
    for (const it of items) {
      const o = ordersById.get(it.order_id);
      if (!o) continue;
      rows.push({
        order: o,
        item: it,
        accountName: resolveAccountName(o.account_id),
        loc: locByOrder.get(o.id)!,
      });
    }
    for (const o of orders) {
      if (!items.some((i) => i.order_id === o.id)) {
        rows.push({
          order: o,
          item: {
            id: `empty-${o.id}`,
            order_id: o.id,
            sku: null,
            product_name: null,
            quantity: null,
            unit_price: null,
            total_price: null,
            product_id: null,
          },
          accountName: resolveAccountName(o.account_id),
          loc: locByOrder.get(o.id)!,
        });
      }
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, items, accountsById, activeAccountId, accountFallbackName]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return flat.filter((r) => {
      if (paymentFilter !== "all" && (r.order.payment_status ?? "") !== paymentFilter)
        return false;
      if (shippingFilter !== "all" && (r.order.shipping_status ?? "") !== shippingFilter)
        return false;
      if (!q) return true;
      const hay = [
        r.order.external_order_id,
        r.order.buyer_nickname,
        r.order.buyer_name,
        r.item.sku,
        r.item.product_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [flat, search, paymentFilter, shippingFilter]);

  const kpis = useMemo(() => {
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(
      (o) => o.order_date && new Date(o.order_date) >= startToday,
    );
    const todayOrderIds = new Set(todayOrders.map((o) => o.id));
    const todayItems = items.filter((i) => todayOrderIds.has(i.order_id));

    const totalToday = todayOrders.reduce((s, o) => s + Number(o.total_amount ?? 0), 0);
    const unitsToday = todayItems.reduce((s, i) => s + Number(i.quantity ?? 0), 0);
    const buyers = new Set(
      todayOrders
        .map((o) => (o.buyer_nickname || o.buyer_name || "").trim())
        .filter(Boolean),
    );
    const unlinked = items.filter((i) => !i.product_id).length;

    return {
      ordersToday: todayOrders.length,
      revenueToday: totalToday,
      unitsToday,
      buyersToday: buyers.size,
      unlinked,
    };
  }, [orders, items]);

  // Geographic aggregations — canonical stateCode + normalized city.
  // "geo.states[].key" is the UF code (e.g. "GO"), also used to match SalesMap state paths.
  // "geo.cities[].key" is `${city}/${UF}` for display; cityKeyCanon is the accent-insensitive folding.
  const geo = useMemo(() => {
    const uniqueOrdersMap = new Map<string, { order: OrderRow; loc: CanonicalLocation }>();
    for (const r of filtered) {
      if (!uniqueOrdersMap.has(r.order.id))
        uniqueOrdersMap.set(r.order.id, { order: r.order, loc: r.loc });
    }
    const uniqueOrders = Array.from(uniqueOrdersMap.values());
    const totalRevenue = uniqueOrders.reduce(
      (s, { order }) => s + Number(order.total_amount ?? 0),
      0,
    );

    type Agg = { key: string; label: string; orders: number; revenue: number };
    const byState = new Map<string, Agg>();
    const byCity = new Map<string, Agg>();

    for (const { order, loc } of uniqueOrders) {
      const code = loc.stateCode;
      const cityName = loc.cityName;
      if (code) {
        const st = byState.get(code) ?? { key: code, label: code, orders: 0, revenue: 0 };
        st.orders += 1;
        st.revenue += Number(order.total_amount ?? 0);
        byState.set(code, st);
      }
      if (code && cityName) {
        const cKey = `${cityKey(cityName)}||${code}`;
        const cy = byCity.get(cKey) ?? {
          key: `${cityName}/${code}`,
          label: `${cityName}/${code}`,
          orders: 0,
          revenue: 0,
        };
        cy.orders += 1;
        cy.revenue += Number(order.total_amount ?? 0);
        byCity.set(cKey, cy);
      }
    }
    const states = Array.from(byState.values()).sort((a, b) => b.revenue - a.revenue);
    const cities = Array.from(byCity.values()).sort((a, b) => b.revenue - a.revenue);
    return { states, cities, totalRevenue, ordersCount: uniqueOrders.length };
  }, [filtered]);

  const cityPoints: CityPoint[] = useMemo(() => {
    const map = new Map<string, CityPoint>();
    const seen = new Set<string>();
    for (const r of filtered) {
      if (!r.loc.stateCode || !r.loc.cityName) continue;
      if (seen.has(r.order.id)) continue;
      seen.add(r.order.id);
      const key = `${cityKey(r.loc.cityName)}||${r.loc.stateCode}`;
      const cur = map.get(key) ?? {
        city: r.loc.cityName,
        uf: r.loc.stateCode,
        orders: 0,
        revenue: 0,
      };
      cur.orders += 1;
      cur.revenue += Number(r.order.total_amount ?? 0);
      map.set(key, cur);
    }
    return Array.from(map.values());
  }, [filtered]);

  const cityRows: FlatRow[] = useMemo(() => {
    if (!selectedCity) return [];
    const ck = cityKey(selectedCity.city);
    const uf = selectedCity.uf.toUpperCase();
    return filtered.filter(
      (r) => r.loc.stateCode === uf && cityKey(r.loc.cityName) === ck,
    );
  }, [filtered, selectedCity]);

  // City-level SKU aggregation (used both for city modal and executive insights)
  const cityProductAgg = useMemo(() => {
    // key: `${city}||${uf}` -> Map<sku|name, { name, sku, qty, revenue }>
    const map = new Map<
      string,
      Map<string, { sku: string; name: string; qty: number; revenue: number; linked: boolean }>
    >();
    for (const r of filtered) {
      const o = r.order;
      if (!o.buyer_city || !o.buyer_state) continue;
      const cityKey = `${o.buyer_city}||${o.buyer_state}`;
      const skuKey = r.item.sku || r.item.product_name || "—";
      const bucket = map.get(cityKey) ?? new Map();
      const cur = bucket.get(skuKey) ?? {
        sku: r.item.sku ?? "—",
        name: r.item.product_name ?? "—",
        qty: 0,
        revenue: 0,
        linked: false,
      };
      cur.qty += Number(r.item.quantity ?? 0);
      cur.revenue += Number(r.item.total_price ?? 0);
      if (r.item.product_id) cur.linked = true;
      bucket.set(skuKey, cur);
      map.set(cityKey, bucket);
    }
    return map;
  }, [filtered]);

  // Product × region aggregation (canonical UF + city label)
  const productRegions = useMemo(() => {
    type Bucket = {
      sku: string;
      name: string;
      qty: number;
      revenue: number;
      orders: Set<string>;
      byCity: Map<string, { orders: Set<string>; qty: number; revenue: number }>;
      byState: Map<string, { orders: Set<string>; qty: number; revenue: number }>;
    };
    const map = new Map<string, Bucket>();
    for (const r of filtered) {
      const key = r.item.sku || r.item.product_name || "—";
      if (!r.item.sku && !r.item.product_name) continue;
      const b: Bucket =
        map.get(key) ?? {
          sku: r.item.sku ?? "—",
          name: r.item.product_name ?? "—",
          qty: 0,
          revenue: 0,
          orders: new Set(),
          byCity: new Map(),
          byState: new Map(),
        };
      b.qty += Number(r.item.quantity ?? 0);
      b.revenue += Number(r.item.total_price ?? 0);
      b.orders.add(r.order.id);
      const uf = r.loc.stateCode ?? "—";
      const cityLabel = `${r.loc.cityName ?? "—"}/${uf}`;
      const cy = b.byCity.get(cityLabel) ?? { orders: new Set<string>(), qty: 0, revenue: 0 };
      cy.orders.add(r.order.id);
      cy.qty += Number(r.item.quantity ?? 0);
      cy.revenue += Number(r.item.total_price ?? 0);
      b.byCity.set(cityLabel, cy);
      const st = b.byState.get(uf) ?? { orders: new Set<string>(), qty: 0, revenue: 0 };
      st.orders.add(r.order.id);
      st.qty += Number(r.item.quantity ?? 0);
      st.revenue += Number(r.item.total_price ?? 0);
      b.byState.set(uf, st);
      map.set(key, b);
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  // Executive insights
  const insights = useMemo(() => {
    const topState = geo.states[0] ?? null;
    const topCityByOrders = [...geo.cities].sort((a, b) => b.orders - a.orders)[0] ?? null;
    const topCityByAvg = [...geo.cities]
      .filter((c) => c.orders > 0)
      .sort((a, b) => b.revenue / b.orders - a.revenue / a.orders)[0] ?? null;

    // Top product by region (per top state)
    let topProductRegion: { region: string; product: string; qty: number } | null = null;
    if (topState) {
      let best: { product: string; qty: number } | null = null;
      for (const p of productRegions) {
        const st = p.byState.get(topState.key);
        if (!st) continue;
        if (!best || st.qty > best.qty) best = { product: p.name, qty: st.qty };
      }
      if (best) topProductRegion = { region: topState.key, ...best };
    }

    // Regions with pending shipping (canonical UF)
    const pendingShippingStates = new Map<string, number>();
    const unlinkedStates = new Map<string, number>();
    for (const r of filtered) {
      const uf = r.loc.stateCode ?? "—";
      const sh = (r.order.shipping_status ?? "").toLowerCase();
      if (["pending", "handling", "ready_to_ship"].includes(sh)) {
        pendingShippingStates.set(uf, (pendingShippingStates.get(uf) ?? 0) + 1);
      }
      if (!r.item.product_id) {
        unlinkedStates.set(uf, (unlinkedStates.get(uf) ?? 0) + 1);
      }
    }
    const topPendingShip = Array.from(pendingShippingStates.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const topUnlinked = Array.from(unlinkedStates.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const top3StateShare =
      geo.totalRevenue > 0
        ? (geo.states.slice(0, 3).reduce((s, x) => s + x.revenue, 0) / geo.totalRevenue) * 100
        : 0;
    const top3CityShare =
      geo.totalRevenue > 0
        ? (geo.cities.slice(0, 3).reduce((s, x) => s + x.revenue, 0) / geo.totalRevenue) * 100
        : 0;

    return {
      topState,
      topCityByOrders,
      topCityByAvg,
      topProductRegion,
      topPendingShip,
      topUnlinked,
      top3StateShare,
      top3CityShare,
    };
  }, [filtered, geo, productRegions]);



  const paymentOptions = useMemo(() => {
    const s = new Set<string>();
    orders.forEach((o) => o.payment_status && s.add(o.payment_status));
    return Array.from(s);
  }, [orders]);
  const shippingOptions = useMemo(() => {
    const s = new Set<string>();
    orders.forEach((o) => o.shipping_status && s.add(o.shipping_status));
    return Array.from(s);
  }, [orders]);

  const activeAccountLabel = activeAccountId
    ? accountFallbackName ?? "—"
    : "Todas as contas";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            <MapIcon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Mapa de Vendas
              </h1>
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-blue-700">
                Dados reais do Mercado Livre
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Veja onde estão acontecendo as vendas, quais compradores compraram,
              quais produtos foram vendidos e o status operacional por conta.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-muted-foreground">
          Conta em foco:{" "}
          <span className="font-semibold text-foreground">{activeAccountLabel}</span>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Kpi icon={<ShoppingCart className="h-4 w-4" />} label="Pedidos hoje" value={String(kpis.ordersToday)} accent="primary" />
        <Kpi icon={<DollarSign className="h-4 w-4" />} label="Faturamento hoje" value={BRL(kpis.revenueToday)} accent="success" />
        <Kpi icon={<Package className="h-4 w-4" />} label="Unidades vendidas hoje" value={String(kpis.unitsToday)} accent="info" />
        <Kpi icon={<Users className="h-4 w-4" />} label="Compradores identificados" value={String(kpis.buyersToday)} accent="primary" />
        <Kpi icon={<Link2Off className="h-4 w-4" />} label="Produtos não vinculados" value={String(kpis.unlinked)} accent="warning" />
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-card p-4 shadow-[var(--shadow-soft)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1fr_180px_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por pedido, comprador, SKU ou produto…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400"
          >
            <option value="today">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400"
          >
            <option value="all">Pagamento: todos</option>
            {paymentOptions.map((s) => (
              <option key={s} value={s}>
                {translateStatus(s)}
              </option>
            ))}
          </select>
          <select
            value={shippingFilter}
            onChange={(e) => setShippingFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400"
          >
            <option value="all">Envio: todos</option>
            {shippingOptions.map((s) => (
              <option key={s} value={s}>
                {translateStatus(s)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Leitura executiva do mapa */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-6 py-3">
          <Lightbulb className="h-4 w-4 text-slate-500" />
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Leitura executiva do mapa
          </div>
        </div>
        {loading || accLoading ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            Calculando insights…
          </div>
        ) : geo.ordersCount === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            Sem dados suficientes para gerar leitura executiva.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-slate-100 md:grid-cols-2 lg:grid-cols-3">
            <InsightCell
              icon={<Trophy className="h-3.5 w-3.5" />}
              label="Estado com maior faturamento"
              main={insights.topState ? insights.topState.key : "—"}
              detail={
                insights.topState
                  ? `${BRL(insights.topState.revenue)} · ${insights.topState.orders} pedidos`
                  : ""
              }
            />
            <InsightCell
              icon={<Building2 className="h-3.5 w-3.5" />}
              label="Cidade com mais pedidos"
              main={insights.topCityByOrders ? insights.topCityByOrders.key : "—"}
              detail={
                insights.topCityByOrders
                  ? `${insights.topCityByOrders.orders} pedidos · ${BRL(insights.topCityByOrders.revenue)}`
                  : ""
              }
            />
            <InsightCell
              icon={<Target className="h-3.5 w-3.5" />}
              label="Cidade com maior ticket médio"
              main={insights.topCityByAvg ? insights.topCityByAvg.key : "—"}
              detail={
                insights.topCityByAvg
                  ? BRL(insights.topCityByAvg.revenue / insights.topCityByAvg.orders)
                  : ""
              }
            />
            <InsightCell
              icon={<Package className="h-3.5 w-3.5" />}
              label={`Produto mais vendido${insights.topProductRegion ? ` em ${insights.topProductRegion.region}` : ""}`}
              main={insights.topProductRegion ? insights.topProductRegion.product : "—"}
              detail={
                insights.topProductRegion
                  ? `${insights.topProductRegion.qty} unidades vendidas`
                  : ""
              }
            />
            <InsightCell
              icon={<Truck className="h-3.5 w-3.5" />}
              label="Regiões com envio pendente"
              main={
                insights.topPendingShip.length
                  ? insights.topPendingShip.map(([uf]) => uf).join(" · ")
                  : "Nenhuma"
              }
              detail={
                insights.topPendingShip.length
                  ? insights.topPendingShip
                      .map(([uf, n]) => `${uf}: ${n}`)
                      .join(" · ")
                  : "Todos os envios em dia"
              }
            />
            <InsightCell
              icon={<Link2Off className="h-3.5 w-3.5" />}
              label="Regiões com produtos não vinculados"
              main={
                insights.topUnlinked.length
                  ? insights.topUnlinked.map(([uf]) => uf).join(" · ")
                  : "Nenhuma"
              }
              detail={
                insights.topUnlinked.length
                  ? insights.topUnlinked
                      .map(([uf, n]) => `${uf}: ${n} itens`)
                      .join(" · ")
                  : "Todos os itens vinculados"
              }
            />
            <InsightCell
              icon={<MapPin className="h-3.5 w-3.5" />}
              label="Concentração top 3 estados"
              main={`${insights.top3StateShare.toFixed(1)}%`}
              detail="do faturamento no período"
            />
            <InsightCell
              icon={<Building2 className="h-3.5 w-3.5" />}
              label="Concentração top 3 cidades"
              main={`${insights.top3CityShare.toFixed(1)}%`}
              detail="do faturamento no período"
            />
          </div>
        )}
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {(
          [
            { k: "map", label: "Mapa" },
            { k: "cities", label: "Cidades" },
            { k: "products", label: "Produtos por região" },
            { k: "orders", label: "Pedidos" },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => setActiveTab(t.k)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === t.k
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "map" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-6 py-4">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Mapa Inteligente de Vendas
            </div>
            <div className="font-display text-base font-semibold text-foreground">
              Painel geográfico — onde saíram os pedidos
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ranking à esquerda · mapa real do Brasil no centro · detalhes da localidade à direita.
            </p>
          </div>
          {loading || accLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Carregando mapa…</div>
          ) : cityPoints.length === 0 && geo.states.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Sem pedidos com localização no período/conta selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[260px_1fr_300px] lg:divide-x lg:divide-slate-200">
              {/* Left: rankings */}
              <div className="max-h-[560px] overflow-auto p-4">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Top estados por faturamento
                </div>
                <ul className="mb-5 space-y-1.5">
                  {geo.states.slice(0, 8).map((s) => {
                    const share = geo.totalRevenue > 0 ? (s.revenue / geo.totalRevenue) * 100 : 0;
                    const active = mapPick?.kind === "state" && mapPick.uf === s.key;
                    return (
                      <li key={s.key}>
                        <button
                          onClick={() => setMapPick({ kind: "state", uf: s.key })}
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                            active
                              ? "border-blue-300 bg-blue-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">{s.key}</span>
                            <span className="tabular-nums text-slate-700">{BRL(s.revenue)}</span>
                          </div>
                          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${Math.min(100, share)}%` }}
                            />
                          </div>
                          <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{s.orders} {s.orders === 1 ? "pedido" : "pedidos"}</span>
                            <span>{share.toFixed(1)}%</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <Building2 className="h-3 w-3" /> Top cidades por pedidos
                </div>
                <ul className="space-y-1.5">
                  {[...geo.cities].sort((a, b) => b.orders - a.orders).slice(0, 8).map((c) => {
                    const [city, uf] = c.key.split("/");
                    const share = geo.totalRevenue > 0 ? (c.revenue / geo.totalRevenue) * 100 : 0;
                    const active =
                      mapPick?.kind === "city" && mapPick.city === city && mapPick.uf === uf;
                    return (
                      <li key={c.key}>
                        <button
                          onClick={() => setMapPick({ kind: "city", city, uf })}
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                            active
                              ? "border-blue-300 bg-blue-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="truncate font-semibold text-slate-800" title={c.key}>
                              {city}
                            </span>
                            <span className="ml-2 shrink-0 text-[10px] font-semibold text-slate-500">
                              {uf}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{c.orders} {c.orders === 1 ? "pedido" : "pedidos"}</span>
                            <span className="tabular-nums">{BRL(c.revenue)}</span>
                          </div>
                          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-slate-400"
                              style={{ width: `${Math.min(100, share)}%` }}
                            />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Center: real Brazil map */}
              <div className="p-4">
                <SalesMap
                  points={cityPoints}
                  stateStats={geo.states.map((s) => ({
                    uf: s.key,
                    orders: s.orders,
                    revenue: s.revenue,
                  }))}
                  selected={mapPick}
                  onSelectCity={(city, uf) => setMapPick({ kind: "city", city, uf })}
                  onSelectState={(uf) => setMapPick({ kind: "state", uf })}
                />
              </div>

              {/* Right: selection summary */}
              <div className="max-h-[560px] overflow-auto p-4">
                <MapSelectionPanel
                  pick={mapPick}
                  filtered={filtered}
                  onOpenCityModal={(city, uf) => setSelectedCity({ city, uf })}
                  onClear={() => setMapPick(null)}
                />
              </div>
            </div>
          )}
        </section>
      )}



      {activeTab === "cities" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-6 py-4">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Distribuição geográfica das vendas
            </div>
            <div className="font-display text-base font-semibold text-foreground">
              Vendas por cidade e estado
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ranking executivo com base nos pedidos reais do período e da conta selecionada.
            </p>
          </div>
          {loading || accLoading ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              Calculando distribuição…
            </div>
          ) : geo.ordersCount === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              Sem pedidos no período para gerar a distribuição geográfica.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2 lg:divide-x lg:divide-slate-200">
              <GeoRankingTable
                title="Estados"
                icon={<MapPin className="h-4 w-4" />}
                rows={geo.states.slice(0, 10)}
                total={geo.totalRevenue}
              />
              <GeoRankingTable
                title="Cidades"
                icon={<Building2 className="h-4 w-4" />}
                rows={geo.cities.slice(0, 10)}
                total={geo.totalRevenue}
              />
            </div>
          )}
        </section>
      )}

      {activeTab === "products" && (
        <ProductRegionView
          products={productRegions}
          query={productQuery}
          onQuery={setProductQuery}
          loading={loading || accLoading}
        />
      )}

      {activeTab === "orders" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-6 py-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Pedidos reais
              </div>
              <div className="font-display text-base font-semibold text-foreground">
                {filtered.length.toLocaleString("pt-BR")}{" "}
                {filtered.length === 1 ? "linha" : "linhas"}
              </div>
            </div>
          </div>

          {loading || accLoading ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              Carregando pedidos…
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhum pedido encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] text-sm">
                <thead>
                  <tr className="bg-slate-50/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Conta</th>
                    <th className="px-4 py-3 font-medium">Pedido</th>
                    <th className="px-4 py-3 font-medium">Comprador</th>
                    <th className="px-4 py-3 font-medium">Cidade/UF</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="px-4 py-3 font-medium text-right">Qtd</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                    <th className="px-4 py-3 font-medium">Pagamento</th>
                    <th className="px-4 py-3 font-medium">Envio</th>
                    <th className="px-4 py-3 font-medium">Lucro</th>
                    <th className="px-4 py-3 font-medium">Vínculo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {filtered.slice(0, 300).map((r) => (
                    <tr
                      key={`${r.order.id}-${r.item.id}`}
                      className="cursor-pointer hover:bg-slate-50/60"
                      onClick={() => setSelected(r)}
                    >
                      <td className="px-4 py-3 text-xs text-foreground/90 whitespace-nowrap">
                        {fmtDate(r.order.order_date)}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/90 whitespace-nowrap">
                        {r.accountName}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">
                        #{r.order.external_order_id ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/90">
                        {r.order.buyer_nickname ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/90 whitespace-nowrap">
                        {r.order.buyer_city ? `${r.order.buyer_city}/${r.order.buyer_state ?? ""}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/90">{r.item.sku ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-foreground/90 max-w-[260px] truncate">
                        {r.item.product_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-foreground/90">
                        {r.item.quantity ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-medium text-foreground whitespace-nowrap">
                        {BRL(r.item.total_price ?? r.order.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusTone("payment", r.order.payment_status)}`}>
                          {translateStatus(r.order.payment_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusTone("shipping", r.order.shipping_status)}`}>
                          {translateStatus(r.order.shipping_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.order.profit_confidence === "pending_cost" ? (
                          <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            Aguardando custo
                          </span>
                        ) : (
                          <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            {r.order.profit_status ?? "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.item.product_id ? (
                          <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            Vinculado
                          </span>
                        ) : (
                          <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            Não vinculado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 300 && (
                <div className="border-t border-slate-200 px-6 py-3 text-center text-xs text-muted-foreground">
                  Mostrando 300 de {filtered.length.toLocaleString("pt-BR")} linhas. Refine os filtros para ver mais.
                </div>
              )}
            </div>
          )}
        </section>
      )}


      {selected && (
        <DetailModal row={selected} onClose={() => setSelected(null)} />
      )}

      {selectedCity && (
        <CityOrdersModal
          city={selectedCity.city}
          uf={selectedCity.uf}
          rows={cityRows}
          onClose={() => setSelectedCity(null)}
          onOpenRow={(r) => {
            setSelectedCity(null);
            setSelected(r);
          }}
        />
      )}
    </div>
  );
}

function GeoRankingTable({
  title,
  icon,
  rows,
  total,
}: {
  title: string;
  icon: React.ReactNode;
  rows: { key: string; orders: number; revenue: number }[];
  total: number;
}) {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
        {icon}
        {title}
      </div>
      {rows.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">Sem dados.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-2 font-medium">#</th>
              <th className="py-2 pr-2 font-medium">{title === "Estados" ? "UF" : "Cidade/UF"}</th>
              <th className="py-2 pr-2 font-medium text-right">Pedidos</th>
              <th className="py-2 pr-2 font-medium text-right">Faturamento</th>
              <th className="py-2 pr-2 font-medium text-right">Ticket médio</th>
              <th className="py-2 pl-2 font-medium text-right">Participação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => {
              const share = total > 0 ? (r.revenue / total) * 100 : 0;
              const avg = r.orders > 0 ? r.revenue / r.orders : 0;
              return (
                <tr key={r.key} className="text-xs">
                  <td className="py-2 pr-2 text-slate-500">{i + 1}</td>
                  <td className="py-2 pr-2 font-medium text-foreground">{r.key}</td>
                  <td className="py-2 pr-2 text-right text-foreground/90">{r.orders}</td>
                  <td className="py-2 pr-2 text-right font-semibold text-foreground whitespace-nowrap">
                    {BRL(r.revenue)}
                  </td>
                  <td className="py-2 pr-2 text-right text-foreground/90 whitespace-nowrap">
                    {BRL(avg)}
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${Math.min(100, share)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-semibold text-foreground">
                        {share.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "primary" | "info" | "success" | "warning";
}) {
  const accents: Record<string, string> = {
    primary: "before:bg-blue-600",
    info: "before:bg-sky-500",
    success: "before:bg-emerald-500",
    warning: "before:bg-amber-500",
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] ${accents[accent]}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="mt-2 font-display text-xl font-bold text-foreground whitespace-nowrap">
        {value}
      </div>
    </div>
  );
}

function DetailModal({ row, onClose }: { row: FlatRow; onClose: () => void }) {
  const { order, item, accountName } = row;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 px-6 py-4">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Detalhes do pedido
            </div>
            <div className="font-display text-lg font-bold text-foreground">
              #{order.external_order_id ?? "—"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
          <Field label="Conta" value={accountName} />
          <Field label="Data da compra" value={fmtDateTime(order.order_date)} />
          <Field label="Comprador" value={order.buyer_nickname ?? "—"} />
          <Field label="Nome" value={order.buyer_name ?? "—"} />
          <Field
            label="Cidade/UF"
            value={order.buyer_city ? `${order.buyer_city}/${order.buyer_state ?? ""}` : "—"}
          />
          <Field label="Status do pedido" value={translateStatus(order.order_status)} />
          <Field label="Status do pagamento" value={translateStatus(order.payment_status)} />
          <Field label="Status do envio" value={translateStatus(order.shipping_status)} />

          <div className="md:col-span-2 mt-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
              Produto comprado
            </div>
            <div className="font-semibold text-foreground">{item.product_name ?? "—"}</div>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Field label="SKU" value={item.sku ?? "—"} />
              <Field label="Quantidade" value={String(item.quantity ?? "—")} />
              <Field label="Valor unitário" value={BRL(item.unit_price)} />
              <Field label="Valor total" value={BRL(item.total_price)} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {order.profit_confidence === "pending_cost" ? (
                <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  Lucro aguardando custo
                </span>
              ) : (
                <span className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  Lucro: {order.profit_status ?? "—"}
                </span>
              )}
              {item.product_id ? (
                <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  Produto vinculado
                </span>
              ) : (
                <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  Produto não vinculado
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/60 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function CityOrdersModal({
  city,
  uf,
  rows,
  onClose,
  onOpenRow,
}: {
  city: string;
  uf: string;
  rows: FlatRow[];
  onClose: () => void;
  onOpenRow: (r: FlatRow) => void;
}) {
  const totalRevenue = rows.reduce(
    (s, r) => s + Number(r.item.total_price ?? r.order.total_amount ?? 0),
    0,
  );
  const uniqueOrders = new Set(rows.map((r) => r.order.id)).size;
  const avg = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 px-6 py-4">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Pedidos por localidade
            </div>
            <div className="font-display text-lg font-bold text-foreground">
              {city}/{uf}
            </div>
            <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>
                <b className="text-foreground">{uniqueOrders}</b>{" "}
                {uniqueOrders === 1 ? "pedido" : "pedidos"}
              </span>
              <span>
                Faturamento:{" "}
                <b className="text-foreground">{BRL(totalRevenue)}</b>
              </span>
              <span>
                Ticket médio: <b className="text-foreground">{BRL(avg)}</b>
              </span>
              <span>
                Produtos vendidos:{" "}
                <b className="text-foreground">
                  {rows.reduce((s, r) => s + Number(r.item.quantity ?? 0), 0)}
                </b>
              </span>
              <span>
                Contas:{" "}
                <b className="text-foreground">
                  {new Set(rows.map((r) => r.accountName)).size}
                </b>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* SKU summary */}
        {(() => {
          const skuMap = new Map<
            string,
            { sku: string; name: string; qty: number; revenue: number; linked: boolean }
          >();
          for (const r of rows) {
            const key = r.item.sku || r.item.product_name || "—";
            const cur =
              skuMap.get(key) ?? {
                sku: r.item.sku ?? "—",
                name: r.item.product_name ?? "—",
                qty: 0,
                revenue: 0,
                linked: false,
              };
            cur.qty += Number(r.item.quantity ?? 0);
            cur.revenue += Number(r.item.total_price ?? 0);
            if (r.item.product_id) cur.linked = true;
            skuMap.set(key, cur);
          }
          const skus = Array.from(skuMap.values()).sort((a, b) => b.revenue - a.revenue);
          if (skus.length === 0) return null;
          return (
            <div className="border-b border-slate-200 bg-slate-50/40 px-6 py-3">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                SKUs vendidos nesta cidade ({skus.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {skus.slice(0, 12).map((s) => (
                  <div
                    key={s.sku + s.name}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1"
                    title={s.name}
                  >
                    <span className="text-[11px] font-semibold text-foreground max-w-[200px] truncate">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {s.qty}× · {BRL(s.revenue)}
                    </span>
                    {!s.linked && (
                      <span className="rounded border border-amber-200 bg-amber-50 px-1 text-[9px] font-semibold text-amber-700">
                        s/ vínculo
                      </span>
                    )}
                  </div>
                ))}
                {skus.length > 12 && (
                  <span className="self-center text-[11px] text-muted-foreground">
                    +{skus.length - 12} outros
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        <div className="overflow-auto">

          <table className="w-full min-w-[1200px] text-sm">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Conta</th>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Comprador</th>
                <th className="px-4 py-3 font-medium">Cidade/UF</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium text-right">Qtd</th>
                <th className="px-4 py-3 font-medium text-right">Valor</th>
                <th className="px-4 py-3 font-medium">Pagamento</th>
                <th className="px-4 py-3 font-medium">Envio</th>
                <th className="px-4 py-3 font-medium">Vínculo</th>
                <th className="px-4 py-3 font-medium">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {rows.map((r) => (
                <tr
                  key={`${r.order.id}-${r.item.id}`}
                  className="cursor-pointer hover:bg-slate-50/60"
                  onClick={() => onOpenRow(r)}
                >
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {fmtDate(r.order.order_date)}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{r.accountName}</td>
                  <td className="px-4 py-3 text-xs font-medium">
                    #{r.order.external_order_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">{r.order.buyer_nickname ?? "—"}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {r.order.buyer_city}/{r.order.buyer_state}
                  </td>
                  <td className="px-4 py-3 text-xs">{r.item.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-xs max-w-[260px] truncate">
                    {r.item.product_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-xs">{r.item.quantity ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-xs font-medium whitespace-nowrap">
                    {BRL(r.item.total_price ?? r.order.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusTone(
                        "payment",
                        r.order.payment_status,
                      )}`}
                    >
                      {translateStatus(r.order.payment_status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusTone(
                        "shipping",
                        r.order.shipping_status,
                      )}`}
                    >
                      {translateStatus(r.order.shipping_status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.item.product_id ? (
                      <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Vinculado
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        Não vinculado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.order.profit_confidence === "pending_cost" ? (
                      <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        Aguardando custo
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {r.order.profit_status ?? "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/60 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function InsightCell({
  icon,
  label,
  main,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  main: string;
  detail: string;
}) {
  return (
    <div className="bg-white px-5 py-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 text-sm font-semibold text-foreground truncate" title={main}>
        {main}
      </div>
      {detail && (
        <div className="mt-0.5 text-[11px] text-muted-foreground truncate" title={detail}>
          {detail}
        </div>
      )}
    </div>
  );
}

type ProductBucket = {
  sku: string;
  name: string;
  qty: number;
  revenue: number;
  orders: Set<string>;
  byCity: Map<string, { orders: Set<string>; qty: number; revenue: number }>;
  byState: Map<string, { orders: Set<string>; qty: number; revenue: number }>;
};

function ProductRegionView({
  products,
  query,
  onQuery,
  loading,
}: {
  products: ProductBucket[];
  query: string;
  onQuery: (q: string) => void;
  loading: boolean;
}) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? products.filter(
        (p) =>
          (p.sku ?? "").toLowerCase().includes(q) ||
          (p.name ?? "").toLowerCase().includes(q),
      )
    : products;
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
      <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-6 py-4">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Produtos por região
        </div>
        <div className="font-display text-base font-semibold text-foreground">
          Onde cada produto está vendendo
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Clique em um produto para ver a distribuição por cidade e estado.
        </p>
      </div>

      <div className="border-b border-slate-200 px-6 py-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Filtrar por SKU ou produto…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="px-6 py-10 text-center text-sm text-muted-foreground">
          Calculando produtos por região…
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-muted-foreground">
          Nenhum produto encontrado para o filtro.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filtered.slice(0, 60).map((p) => {
            const key = `${p.sku}||${p.name}`;
            const isOpen = openKey === key;
            const avg = p.orders.size > 0 ? p.revenue / p.orders.size : 0;
            const topStates = Array.from(p.byState.entries())
              .map(([uf, v]) => ({ uf, orders: v.orders.size, qty: v.qty, revenue: v.revenue }))
              .sort((a, b) => b.revenue - a.revenue);
            const topCities = Array.from(p.byCity.entries())
              .map(([k, v]) => ({ key: k, orders: v.orders.size, qty: v.qty, revenue: v.revenue }))
              .sort((a, b) => b.revenue - a.revenue);
            return (
              <div key={key}>
                <button
                  onClick={() => setOpenKey(isOpen ? null : key)}
                  className="flex w-full items-center gap-4 px-6 py-3 text-left hover:bg-slate-50/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {p.name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      SKU: {p.sku} · {p.byState.size} UF · {p.byCity.size}{" "}
                      {p.byCity.size === 1 ? "cidade" : "cidades"}
                    </div>
                  </div>
                  <div className="hidden text-right md:block">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Unidades
                    </div>
                    <div className="text-xs font-semibold text-foreground">{p.qty}</div>
                  </div>
                  <div className="hidden text-right md:block">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Faturamento
                    </div>
                    <div className="text-xs font-semibold text-foreground whitespace-nowrap">
                      {BRL(p.revenue)}
                    </div>
                  </div>
                  <div className="hidden text-right md:block">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Ticket médio
                    </div>
                    <div className="text-xs font-semibold text-foreground whitespace-nowrap">
                      {BRL(avg)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{isOpen ? "−" : "+"}</div>
                </button>
                {isOpen && (
                  <div className="grid grid-cols-1 gap-0 border-t border-slate-100 bg-slate-50/40 lg:grid-cols-2 lg:divide-x lg:divide-slate-200">
                    <div className="p-4">
                      <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                        Por estado
                      </div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                            <th className="py-1.5 pr-2 font-medium">UF</th>
                            <th className="py-1.5 pr-2 font-medium text-right">Pedidos</th>
                            <th className="py-1.5 pr-2 font-medium text-right">Qtd</th>
                            <th className="py-1.5 pr-2 font-medium text-right">Faturamento</th>
                            <th className="py-1.5 pl-2 font-medium text-right">Ticket médio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {topStates.map((r) => (
                            <tr key={r.uf}>
                              <td className="py-1.5 pr-2 font-medium text-foreground">{r.uf}</td>
                              <td className="py-1.5 pr-2 text-right">{r.orders}</td>
                              <td className="py-1.5 pr-2 text-right">{r.qty}</td>
                              <td className="py-1.5 pr-2 text-right font-semibold whitespace-nowrap">
                                {BRL(r.revenue)}
                              </td>
                              <td className="py-1.5 pl-2 text-right whitespace-nowrap">
                                {BRL(r.orders > 0 ? r.revenue / r.orders : 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                        Por cidade
                      </div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                            <th className="py-1.5 pr-2 font-medium">Cidade/UF</th>
                            <th className="py-1.5 pr-2 font-medium text-right">Pedidos</th>
                            <th className="py-1.5 pr-2 font-medium text-right">Qtd</th>
                            <th className="py-1.5 pr-2 font-medium text-right">Faturamento</th>
                            <th className="py-1.5 pl-2 font-medium text-right">Ticket médio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {topCities.slice(0, 15).map((r) => (
                            <tr key={r.key}>
                              <td className="py-1.5 pr-2 font-medium text-foreground">{r.key}</td>
                              <td className="py-1.5 pr-2 text-right">{r.orders}</td>
                              <td className="py-1.5 pr-2 text-right">{r.qty}</td>
                              <td className="py-1.5 pr-2 text-right font-semibold whitespace-nowrap">
                                {BRL(r.revenue)}
                              </td>
                              <td className="py-1.5 pl-2 text-right whitespace-nowrap">
                                {BRL(r.orders > 0 ? r.revenue / r.orders : 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length > 60 && (
            <div className="border-t border-slate-200 px-6 py-3 text-center text-xs text-muted-foreground">
              Mostrando 60 de {filtered.length} produtos. Refine a busca para ver mais.
            </div>
          )}
        </div>
      )}
    </section>
  );
}


function MapSelectionPanel({
  pick,
  filtered,
  onOpenCityModal,
  onClear,
}: {
  pick:
    | { kind: "city"; city: string; uf: string }
    | { kind: "state"; uf: string }
    | null;
  filtered: FlatRow[];
  onOpenCityModal: (city: string, uf: string) => void;
  onClear: () => void;
}) {
  if (!pick) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center text-xs text-muted-foreground">
        <MapPin className="mb-2 h-6 w-6 text-slate-300" />
        <div className="font-semibold text-slate-700">Selecione um estado ou cidade</div>
        <div className="mt-1 max-w-[220px]">
          Clique no mapa ou no ranking à esquerda para ver os detalhes operacionais da localidade.
        </div>
      </div>
    );
  }

  const rowsInScope =
    pick.kind === "city"
      ? filtered.filter(
          (r) =>
            r.loc.stateCode === pick.uf.toUpperCase() &&
            cityKey(r.loc.cityName) === cityKey(pick.city),
        )
      : filtered.filter((r) => r.loc.stateCode === pick.uf.toUpperCase());

  // Unique orders in scope
  const uniqOrders = Array.from(
    new Map(rowsInScope.map((r) => [r.order.id, r.order] as const)).values(),
  );
  const orders = uniqOrders.length;
  const revenue = uniqOrders.reduce((s, o) => s + Number(o.total_amount ?? 0), 0);
  const avgTicket = orders > 0 ? revenue / orders : 0;
  const units = rowsInScope.reduce((s, r) => s + Number(r.item.quantity ?? 0), 0);
  const skus = new Set(rowsInScope.map((r) => r.item.sku || r.item.product_name || "—")).size;
  const pendingShip = uniqOrders.filter((o) =>
    ["pending", "handling", "ready_to_ship"].includes(
      (o.shipping_status ?? "").toLowerCase(),
    ),
  ).length;
  const unlinked = rowsInScope.filter((r) => !r.item.product_id).length;

  const topOrders = [...uniqOrders]
    .sort((a, b) => Number(b.total_amount ?? 0) - Number(a.total_amount ?? 0))
    .slice(0, 6);

  const title =
    pick.kind === "city" ? `${pick.city}/${pick.uf.toUpperCase()}` : `Estado ${pick.uf.toUpperCase()}`;
  const subtitle = pick.kind === "city" ? "Cidade selecionada" : "Estado selecionado";

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {subtitle}
          </div>
          <div className="font-display text-base font-semibold text-slate-900">{title}</div>
        </div>
        <button
          onClick={onClear}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-50"
        >
          Limpar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="text-[10px] text-muted-foreground">Pedidos</div>
          <div className="font-semibold text-slate-900">{orders}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="text-[10px] text-muted-foreground">Faturamento</div>
          <div className="font-semibold tabular-nums text-slate-900">{BRL(revenue)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="text-[10px] text-muted-foreground">Ticket médio</div>
          <div className="font-semibold tabular-nums text-slate-900">{BRL(avgTicket)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="text-[10px] text-muted-foreground">Unidades</div>
          <div className="font-semibold text-slate-900">{units}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="text-[10px] text-muted-foreground">SKUs distintos</div>
          <div className="font-semibold text-slate-900">{skus}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="text-[10px] text-muted-foreground">Envio pendente</div>
          <div className={`font-semibold ${pendingShip > 0 ? "text-amber-700" : "text-slate-900"}`}>
            {pendingShip}
          </div>
        </div>
        <div className="col-span-2 rounded-lg border border-slate-200 bg-white p-2">
          <div className="text-[10px] text-muted-foreground">Produtos não vinculados</div>
          <div className={`font-semibold ${unlinked > 0 ? "text-amber-700" : "text-slate-900"}`}>
            {unlinked} {unlinked === 1 ? "item" : "itens"}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Principais pedidos
        </div>
        {topOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-[11px] text-muted-foreground">
            Sem pedidos nesta localidade.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {topOrders.map((o) => (
              <li
                key={o.id}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-slate-800">
                    {o.buyer_nickname || "—"}
                  </span>
                  <span className="tabular-nums font-semibold text-slate-900">
                    {BRL(Number(o.total_amount ?? 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="truncate">{o.buyer_city || "—"}/{o.buyer_state || "—"}</span>
                  <span>{fmtDate(o.order_date)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pick.kind === "city" && (
        <button
          onClick={() => onOpenCityModal(pick.city, pick.uf)}
          className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
        >
          Ver detalhes completos da cidade
        </button>
      )}
    </div>
  );
}

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
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";

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
    const rows: FlatRow[] = [];
    for (const it of items) {
      const o = ordersById.get(it.order_id);
      if (!o) continue;
      rows.push({ order: o, item: it, accountName: resolveAccountName(o.account_id) });
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

  // Geographic aggregations (based on filtered orders scope: respects account + period)
  const geo = useMemo(() => {
    const filteredOrderIds = new Set(filtered.map((r) => r.order.id));
    const uniqueOrders = Array.from(
      new Map(
        filtered.map((r) => [r.order.id, r.order] as const),
      ).values(),
    ).filter((o) => filteredOrderIds.has(o.id));

    const totalRevenue = uniqueOrders.reduce(
      (s, o) => s + Number(o.total_amount ?? 0),
      0,
    );

    type Agg = { key: string; orders: number; revenue: number };
    const byState = new Map<string, Agg>();
    const byCity = new Map<string, Agg>();

    for (const o of uniqueOrders) {
      const uf = (o.buyer_state || "—").toUpperCase();
      const city = o.buyer_city || "—";
      const stKey = uf;
      const cityKey = `${city}/${uf}`;
      const stAgg = byState.get(stKey) ?? { key: stKey, orders: 0, revenue: 0 };
      stAgg.orders += 1;
      stAgg.revenue += Number(o.total_amount ?? 0);
      byState.set(stKey, stAgg);
      const cyAgg = byCity.get(cityKey) ?? { key: cityKey, orders: 0, revenue: 0 };
      cyAgg.orders += 1;
      cyAgg.revenue += Number(o.total_amount ?? 0);
      byCity.set(cityKey, cyAgg);
    }
    const states = Array.from(byState.values()).sort((a, b) => b.revenue - a.revenue);
    const cities = Array.from(byCity.values()).sort((a, b) => b.revenue - a.revenue);
    return { states, cities, totalRevenue, ordersCount: uniqueOrders.length };
  }, [filtered]);

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

      {/* Distribuição geográfica das vendas */}
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

      {/* Table */}
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
                      {r.order.buyer_nickname ?? r.order.buyer_name ?? "—"}
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

      {selected && (
        <DetailModal row={selected} onClose={() => setSelected(null)} />
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

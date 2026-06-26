import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Receipt,
  TrendingUp,
  Percent,
  Truck,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  Info,
  RefreshCcw,
  Users,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/dashboard")({
  component: DashboardEcommerce,
  head: () => ({
    meta: [{ title: "Visão Geral | Agente Comercial 360" }],
  }),
});

type Order = {
  id: string;
  account_id: string | null;
  order_date: string | null;
  total_amount: number | null;
  mercadolivre_fee: number | null;
  marketplace_fee: number | null;
  seller_shipping_cost: number | null;
  product_cost_total: number | null;
  net_profit: number | null;
  profit_confidence: string | null;
  order_status: string | null;
  payment_status: string | null;
};

type PeriodKey = "today" | "7d" | "30d";

const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: "today", label: "Hoje", days: 0 },
  { key: "7d", label: "7 dias", days: 7 },
  { key: "30d", label: "30 dias", days: 30 },
];

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});
const num = new Intl.NumberFormat("pt-BR");

function n(v: number | null | undefined): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : 0;
}

function startOfPeriod(period: PeriodKey): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "today") return d;
  const days = period === "7d" ? 6 : 29;
  d.setDate(d.getDate() - days);
  return d;
}

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fmtDayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function DashboardEcommerce() {
  const { accounts, activeAccount, activeAccountId } = useEcommerceActiveAccount();

  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [scope, setScope] = useState<"active" | "all">("active");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const since = startOfPeriod(period).toISOString();
        let q = supabase
          .from("ecommerce_orders")
          .select(
            "id, account_id, order_date, total_amount, mercadolivre_fee, marketplace_fee, seller_shipping_cost, product_cost_total, net_profit, profit_confidence, order_status, payment_status",
          )
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .gte("order_date", since)
          .order("order_date", { ascending: false })
          .limit(5000);
        if (scope === "active" && activeAccountId) {
          q = q.eq("account_id", activeAccountId);
        }
        const { data, error } = await q;
        if (error) throw error;
        if (!cancelled) setOrders((data as Order[]) ?? []);
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : "Erro ao carregar pedidos");
          setOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [period, scope, activeAccountId]);

  const accountNameById = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((a) =>
      map.set(a.id, a.account_name || a.nickname || "Conta sem nome"),
    );
    return map;
  }, [accounts]);

  const totals = useMemo(() => {
    let gross = 0;
    let fees = 0;
    let shipping = 0;
    let netParcial = 0;
    let pending = 0;
    let high = 0;
    for (const o of orders) {
      gross += n(o.total_amount);
      fees += n(o.mercadolivre_fee) + n(o.marketplace_fee);
      shipping += n(o.seller_shipping_cost);
      netParcial += n(o.net_profit);
      if ((o.profit_confidence ?? "").toLowerCase() === "pending_cost") pending += 1;
      if ((o.profit_confidence ?? "").toLowerCase() === "high") high += 1;
    }
    const count = orders.length;
    const ticket = count > 0 ? gross / count : 0;
    return { gross, fees, shipping, netParcial, pending, high, count, ticket };
  }, [orders]);

  const byDay = useMemo(() => {
    const map = new Map<string, { gross: number; count: number }>();
    const start = startOfPeriod(period);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (
      let d = new Date(start);
      d.getTime() <= today.getTime();
      d.setDate(d.getDate() + 1)
    ) {
      map.set(dayKey(d), { gross: 0, count: 0 });
    }
    for (const o of orders) {
      if (!o.order_date) continue;
      const k = dayKey(new Date(o.order_date));
      const cur = map.get(k) ?? { gross: 0, count: 0 };
      cur.gross += n(o.total_amount);
      cur.count += 1;
      map.set(k, cur);
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([key, v]) => ({ key, ...v }));
  }, [orders, period]);

  const maxDayGross = useMemo(
    () => byDay.reduce((m, d) => Math.max(m, d.gross), 0),
    [byDay],
  );

  const byAccount = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        count: number;
        gross: number;
        fees: number;
        shipping: number;
        net: number;
        pending: number;
      }
    >();
    for (const o of orders) {
      const id = o.account_id ?? "—";
      const cur =
        map.get(id) ??
        { id, count: 0, gross: 0, fees: 0, shipping: 0, net: 0, pending: 0 };
      cur.count += 1;
      cur.gross += n(o.total_amount);
      cur.fees += n(o.mercadolivre_fee) + n(o.marketplace_fee);
      cur.shipping += n(o.seller_shipping_cost);
      cur.net += n(o.net_profit);
      if ((o.profit_confidence ?? "").toLowerCase() === "pending_cost") cur.pending += 1;
      map.set(id, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.gross - a.gross);
  }, [orders]);

  const scopeLabel =
    scope === "all"
      ? "Todas as contas"
      : activeAccount?.account_name || activeAccount?.nickname || "Conta ativa";

  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <BarChart3 className="h-3.5 w-3.5" />
            Visão Geral — Dados Reais
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Dashboard E-commerce — {scopeLabel}
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Faturamento, pedidos, taxas e resultado parcial dos pedidos
            sincronizados do Mercado Livre.
          </p>
        </header>

        {/* Filtros */}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Período
            </span>
            {PERIODS.map((p) => {
              const active = period === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
                    (active
                      ? "bg-blue-700 text-white shadow-sm"
                      : "border border-border bg-muted/30 text-foreground hover:bg-muted/60")
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Escopo
            </span>
            <button
              type="button"
              onClick={() => setScope("active")}
              className={
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
                (scope === "active"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "border border-border bg-muted/30 text-foreground hover:bg-muted/60")
              }
              disabled={!activeAccountId}
              title={!activeAccountId ? "Nenhuma conta ativa" : undefined}
            >
              Conta ativa
            </button>
            <button
              type="button"
              onClick={() => setScope("all")}
              className={
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
                (scope === "all"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "border border-border bg-muted/30 text-foreground hover:bg-muted/60")
              }
            >
              <Users className="h-3.5 w-3.5" />
              Todas as contas
            </button>
          </div>
        </section>

        {/* Aviso de resultado parcial */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-700" />
          <p>
            Os resultados financeiros ainda são parciais enquanto os custos dos
            produtos não forem preenchidos. Atualize os custos para liberar
            lucro líquido real e margem confiável.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* KPIs principais */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Kpi
            label="Faturamento bruto"
            value={brl.format(totals.gross)}
            icon={DollarSign}
            accent="from-emerald-600 to-emerald-800"
            loading={loading}
          />
          <Kpi
            label="Total de pedidos"
            value={num.format(totals.count)}
            icon={ShoppingBag}
            accent="from-blue-700 to-blue-900"
            loading={loading}
          />
          <Kpi
            label="Ticket médio"
            value={brl.format(totals.ticket)}
            icon={Receipt}
            accent="from-indigo-600 to-indigo-800"
            loading={loading}
          />
          <Kpi
            label="Resultado parcial"
            sublabel="Antes do custo do produto"
            value={brl.format(totals.netParcial)}
            icon={TrendingUp}
            accent="from-violet-600 to-violet-800"
            loading={loading}
          />
        </section>

        {/* KPIs financeiros adicionais */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Kpi
            label="Taxas Mercado Livre"
            value={brl.format(totals.fees)}
            icon={Percent}
            accent="from-amber-600 to-orange-700"
            loading={loading}
          />
          <Kpi
            label="Frete vendedor"
            value={brl.format(totals.shipping)}
            icon={Truck}
            accent="from-sky-600 to-sky-800"
            loading={loading}
          />
          <Kpi
            label="Pedidos pendentes de custo"
            value={num.format(totals.pending)}
            icon={AlertTriangle}
            accent="from-rose-700 to-red-900"
            loading={loading}
          />
          <Kpi
            label="Pedidos com lucro confiável"
            value={num.format(totals.high)}
            icon={ShieldCheck}
            accent="from-emerald-600 to-emerald-800"
            loading={loading}
          />
        </section>

        {/* Gráfico faturamento por dia */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Faturamento por dia
              </h2>
              <p className="text-xs text-muted-foreground">
                Soma diária de faturamento bruto e número de pedidos no período
                selecionado.
              </p>
            </div>
            {loading && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                Carregando…
              </span>
            )}
          </div>
          {byDay.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Sem pedidos no período.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div
                className="flex items-end gap-2 min-w-full pt-2"
                style={{ height: 200 }}
              >
                {byDay.map((d) => {
                  const h = maxDayGross > 0 ? (d.gross / maxDayGross) * 170 : 0;
                  return (
                    <div
                      key={d.key}
                      className="flex flex-col items-center gap-1 flex-1 min-w-[36px] group"
                      title={`${fmtDayLabel(d.key)} — ${brl.format(d.gross)} (${d.count} pedidos)`}
                    >
                      <div className="text-[10px] font-semibold text-foreground/70 tabular-nums">
                        {d.gross > 0 ? brl.format(d.gross) : ""}
                      </div>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-blue-800 to-blue-500 transition-opacity group-hover:opacity-90"
                        style={{ height: Math.max(h, d.gross > 0 ? 4 : 0) }}
                      />
                      <div className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                        {fmtDayLabel(d.key)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {d.count}p
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Comparativo por conta */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Comparativo por conta
            </h2>
            <p className="text-xs text-muted-foreground">
              Desempenho de cada conta Mercado Livre no período selecionado.
            </p>
          </div>
          {byAccount.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Sem dados por conta no período.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2.5">Conta</th>
                    <th className="text-right px-4 py-2.5">Pedidos</th>
                    <th className="text-right px-4 py-2.5">Faturamento</th>
                    <th className="text-right px-4 py-2.5">Taxas ML</th>
                    <th className="text-right px-4 py-2.5">Frete vendedor</th>
                    <th className="text-right px-4 py-2.5">Resultado parcial</th>
                    <th className="text-right px-4 py-2.5">Pend. custo</th>
                  </tr>
                </thead>
                <tbody>
                  {byAccount.map((a) => (
                    <tr key={a.id} className="border-t border-border/60">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {accountNameById.get(a.id) || "Conta sem nome"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {num.format(a.count)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        {brl.format(a.gross)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-amber-700">
                        {brl.format(a.fees)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-sky-700">
                        {brl.format(a.shipping)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-violet-700">
                        {brl.format(a.net)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {a.pending > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[11px] font-semibold">
                            {num.format(a.pending)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </EcommerceLayout>
  );
}

function Kpi({
  label,
  sublabel,
  value,
  icon: Icon,
  accent,
  loading,
}: {
  label: string;
  sublabel?: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  loading?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-10`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div
            className="font-display text-2xl xl:text-3xl font-bold text-foreground truncate"
            title={value}
          >
            {loading ? "…" : value}
          </div>
          {sublabel && (
            <div className="text-[11px] text-muted-foreground">{sublabel}</div>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

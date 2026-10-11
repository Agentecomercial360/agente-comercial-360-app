import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeDollarSign,
  CheckCircle2,
  DollarSign,
  Megaphone,
  Package,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Truck,
  Percent,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  companyId: string;
  accountId: string | null;
  accountName: string;
};

type ProfitabilitySummary = {
  orders_total: number;
  orders_confirmed: number;
  orders_pending_cost: number;
  financial_review_orders: number;
  gross_revenue: number;
  refunded_amount: number;
  realized_revenue: number;
  marketplace_fees: number;
  shipping_cost: number;
  ads_order_cost: number;
  ads_synced_investment: number;
  ads_unallocated: number;
  ads_effective: number;
  taxes: number;
  product_cost: number;
  total_known_costs: number;
  result_after_known_costs: number;
  confirmed_revenue: number;
  blocked_revenue: number;
  confirmed_profit: number;
  cost_coverage_percent: number;
  confirmed_margin_percent: number;
  refund_orders: number;
  chargeback_orders: number;
  cancelled_orders: number;
};

type ProductProfitability = {
  ranking: number;
  product_id: string;
  sku: string | null;
  product_name: string | null;
  orders: number;
  units: number;
  revenue: number;
  refunded_amount: number;
  marketplace_fees: number;
  shipping_cost: number;
  taxes: number;
  product_cost: number;
  ads_order_cost: number;
  ads_synced_investment: number;
  ads_effective: number;
  net_profit: number;
  margin_percent: number;
  cost_coverage_percent: number;
  profit_status: "healthy" | "low_margin" | "negative" | "pending_cost";
};

type OrderAuditRow = {
  id: string;
  external_order_id: string | null;
  total_amount: number | null;
  marketplace_fee: number | null;
  mercadolivre_fee: number | null;
  mercadopago_fee: number | null;
  seller_shipping_cost: number | null;
  ads_cost: number | null;
  tax_amount: number | null;
  product_cost_total: number | null;
  discount_amount: number | null;
  refunded_amount: number | null;
  profit_confidence: string | null;
  financial_review_required: boolean | null;
  order_date: string;
};

const EMPTY_SUMMARY: ProfitabilitySummary = {
  orders_total: 0,
  orders_confirmed: 0,
  orders_pending_cost: 0,
  financial_review_orders: 0,
  gross_revenue: 0,
  refunded_amount: 0,
  realized_revenue: 0,
  marketplace_fees: 0,
  shipping_cost: 0,
  ads_order_cost: 0,
  ads_synced_investment: 0,
  ads_unallocated: 0,
  ads_effective: 0,
  taxes: 0,
  product_cost: 0,
  total_known_costs: 0,
  result_after_known_costs: 0,
  confirmed_revenue: 0,
  blocked_revenue: 0,
  confirmed_profit: 0,
  cost_coverage_percent: 0,
  confirmed_margin_percent: 0,
  refund_orders: 0,
  chargeback_orders: 0,
  cancelled_orders: 0,
};

function money(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function n(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeSummary(row: Record<string, unknown> | null): ProfitabilitySummary {
  if (!row) return EMPTY_SUMMARY;

  return Object.fromEntries(
    Object.keys(EMPTY_SUMMARY).map((key) => [
      key,
      n(row[key]),
    ]),
  ) as unknown as ProfitabilitySummary;
}

function normalizeProducts(rows: Record<string, unknown>[]): ProductProfitability[] {
  return rows.map((row) => ({
    ranking: n(row.ranking),
    product_id: String(row.product_id ?? ""),
    sku: row.sku == null ? null : String(row.sku),
    product_name: row.product_name == null ? null : String(row.product_name),
    orders: n(row.orders),
    units: n(row.units),
    revenue: n(row.revenue),
    refunded_amount: n(row.refunded_amount),
    marketplace_fees: n(row.marketplace_fees),
    shipping_cost: n(row.shipping_cost),
    taxes: n(row.taxes),
    product_cost: n(row.product_cost),
    ads_order_cost: n(row.ads_order_cost),
    ads_synced_investment: n(row.ads_synced_investment),
    ads_effective: n(row.ads_effective),
    net_profit: n(row.net_profit),
    margin_percent: n(row.margin_percent),
    cost_coverage_percent: n(row.cost_coverage_percent),
    profit_status: String(row.profit_status ?? "pending_cost") as ProductProfitability["profit_status"],
  }));
}

function statusMeta(status: ProductProfitability["profit_status"]) {
  if (status === "healthy") {
    return {
      label: "Confirmado",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }
  if (status === "low_margin") {
    return {
      label: "Margem baixa",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  if (status === "negative") {
    return {
      label: "Prejuízo",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }
  return {
    label: "Aguardando custo",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  };
}

export function ProfitabilityOverview({ companyId, accountId, accountName }: Props) {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<ProfitabilitySummary>(EMPTY_SUMMARY);
  const [products, setProducts] = useState<ProductProfitability[]>([]);
  const [orders, setOrders] = useState<OrderAuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const from = new Date();
      from.setDate(from.getDate() - (days - 1));
      from.setHours(0, 0, 0, 0);

      let ordersQuery = supabase
        .from("ecommerce_orders")
        .select(
          "id,external_order_id,total_amount,marketplace_fee,mercadolivre_fee,mercadopago_fee,seller_shipping_cost,ads_cost,tax_amount,product_cost_total,discount_amount,refunded_amount,profit_confidence,financial_review_required,order_date",
        )
        .eq("company_id", companyId)
        .eq("is_cancelled", false)
        .gte("order_date", from.toISOString())
        .order("order_date", { ascending: false })
        .limit(50);

      if (accountId) ordersQuery = ordersQuery.eq("account_id", accountId);

      const [summaryResult, productResult, ordersResult] = await Promise.all([
        supabase.rpc("get_ecommerce_profitability_summary_v2", {
          p_company_id: companyId,
          p_account_id: accountId,
          p_days: days,
        }),
        supabase.rpc("get_ecommerce_product_profitability_v2", {
          p_company_id: companyId,
          p_account_id: accountId,
          p_days: days,
          p_limit: 50,
        }),
        ordersQuery,
      ]);

      if (cancelled) return;

      if (summaryResult.error) {
        setError(summaryResult.error.message);
        setSummary(EMPTY_SUMMARY);
      } else {
        const row = Array.isArray(summaryResult.data)
          ? summaryResult.data[0]
          : summaryResult.data;
        setSummary(normalizeSummary((row ?? null) as Record<string, unknown> | null));
      }

      if (productResult.error) {
        console.error("get_ecommerce_product_profitability_v2", productResult.error);
        setProducts([]);
      } else {
        setProducts(
          normalizeProducts(
            ((productResult.data ?? []) as Record<string, unknown>[]),
          ),
        );
      }

      if (ordersResult.error) {
        console.error("profitability order audit", ordersResult.error);
        setOrders([]);
      } else {
        setOrders((ordersResult.data ?? []) as OrderAuditRow[]);
      }

      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [companyId, accountId, days]);

  const coverageTone =
    summary.cost_coverage_percent >= 99.99
      ? "text-emerald-700"
      : summary.cost_coverage_percent >= 70
        ? "text-amber-700"
        : "text-rose-700";

  const costItems = useMemo(
    () => [
      {
        label: "Taxas da plataforma",
        value: summary.marketplace_fees,
        icon: ReceiptText,
      },
      {
        label: "Frete do vendedor",
        value: summary.shipping_cost,
        icon: Truck,
      },
      {
        label: "Publicidade",
        value: summary.ads_effective,
        icon: Megaphone,
      },
      {
        label: "Impostos",
        value: summary.taxes,
        icon: BadgeDollarSign,
      },
      {
        label: "Custo dos produtos confirmado",
        value: summary.product_cost,
        icon: Package,
      },
      {
        label: "Reembolsos / devoluções",
        value: summary.refunded_amount,
        icon: RotateCcw,
      },
    ],
    [summary],
  );

  const maxCost = Math.max(...costItems.map((item) => item.value), 1);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-5 py-5 text-white md:px-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
            Rentabilidade Real v2 · {accountName}
          </div>
          <h2 className="mt-1 font-display text-xl font-bold md:text-2xl">
            Quanto realmente sobrou — e quanto ainda não pode ser confirmado
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-300 md:text-sm">
            O AC360 separa lucro confirmado de resultado parcial. Taxas, frete,
            publicidade, impostos, custo de produto e devoluções são conciliados sem
            descontar promoções duas vezes.
          </p>
        </div>

        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          {[1, 7, 30, 90].map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setDays(period)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                days === period
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {period === 1 ? "Hoje" : `${period} dias`}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Não foi possível carregar a rentabilidade v2: {error}
        </div>
      ) : (
        <>
          {summary.cost_coverage_percent < 100 ? (
            <div className="border-b border-amber-200 bg-amber-50 px-5 py-4 md:px-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <div className="text-sm font-bold text-amber-900">
                    O lucro final ainda não pode ser confirmado.
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    {summary.orders_pending_cost.toLocaleString("pt-BR")} pedido(s)
                    ainda dependem de custo de produto. O valor “resultado após custos
                    conhecidos” é um teto provisório, não lucro líquido definitivo.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-6 md:p-6">
            <MetricCard
              label="Faturamento"
              value={loading ? "—" : money(summary.gross_revenue)}
              icon={DollarSign}
              tone="neutral"
            />
            <MetricCard
              label="Lucro confirmado"
              value={loading ? "—" : money(summary.confirmed_profit)}
              icon={ShieldCheck}
              tone={summary.cost_coverage_percent >= 100 ? "success" : "neutral"}
            />
            <MetricCard
              label="Receita bloqueada"
              value={loading ? "—" : money(summary.blocked_revenue)}
              icon={AlertTriangle}
              tone={summary.blocked_revenue > 0 ? "warning" : "success"}
            />
            <MetricCard
              label="Cobertura de custo"
              value={
                loading
                  ? "—"
                  : `${summary.cost_coverage_percent.toFixed(1).replace(".", ",")}%`
              }
              icon={CheckCircle2}
              tone={summary.cost_coverage_percent >= 100 ? "success" : "warning"}
              valueClassName={coverageTone}
            />
            <MetricCard
              label="Custos conhecidos"
              value={loading ? "—" : money(summary.total_known_costs)}
              icon={ReceiptText}
              tone="danger"
            />
            <MetricCard
              label="Resultado após custos conhecidos"
              value={loading ? "—" : money(summary.result_after_known_costs)}
              icon={BadgeDollarSign}
              tone="neutral"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-200 p-5 lg:grid-cols-[1.25fr_0.75fr] md:p-6">
            <div className="rounded-2xl border border-slate-200 p-4 md:p-5">
              <div className="mb-4">
                <h3 className="font-display text-base font-bold text-slate-900">
                  Composição dos custos conhecidos
                </h3>
                <p className="text-xs text-slate-500">
                  Somente valores que já possuem fonte financeira identificada.
                </p>
                {summary.ads_unallocated > 0 ? (
                  <p className="mt-1 text-[11px] font-medium text-blue-700">
                    Product Ads acrescentou {money(summary.ads_unallocated)} que ainda
                    não estava atribuído diretamente aos pedidos, sem duplicar investimento.
                  </p>
                ) : null}
              </div>

              <div className="space-y-3">
                {costItems.map((item) => {
                  const Icon = item.icon;
                  const width = Math.max(2, (item.value / maxCost) * 100);

                  return (
                    <div key={item.label}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-2 font-medium text-slate-700">
                          <Icon className="h-3.5 w-3.5 text-slate-400" />
                          {item.label}
                        </span>
                        <span className="font-semibold tabular-nums text-slate-900">
                          {loading ? "—" : money(item.value)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-800 transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-[11px] leading-relaxed text-blue-800">
                Descontos ficam disponíveis para auditoria, mas não são subtraídos
                novamente aqui, porque podem já estar refletidos no valor final da venda.
              </div>
            </div>

            <div className="space-y-3">
              <QualityCard
                label="Pedidos confirmados"
                value={summary.orders_confirmed}
                helper="Com custo de produto e sem pendência financeira crítica."
                success
              />
              <QualityCard
                label="Pedidos aguardando custo"
                value={summary.orders_pending_cost}
                helper="Ainda não entram no lucro confirmado."
              />
              <QualityCard
                label="Pedidos com devolução"
                value={summary.refund_orders}
                helper={`${money(summary.refunded_amount)} devolvido no período.`}
                warning={summary.refund_orders > 0}
              />
              <QualityCard
                label="Pedidos cancelados"
                value={summary.cancelled_orders}
                helper="Excluídos do cálculo principal de rentabilidade."
              />
            </div>
          </div>

          <div className="border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-6">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Rentabilidade por produto / SKU
                </h3>
                <p className="text-xs text-slate-500">
                  Taxas, frete, impostos e devoluções são rateados proporcionalmente ao
                  valor de cada item. Ads usa o maior valor entre pedido e Product Ads para
                  evitar dupla contagem.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                Até 50 produtos
              </span>
            </div>

            <div className="overflow-x-auto border-t border-slate-100">
              <table className="w-full min-w-[1180px] text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3 text-left font-semibold">Produto / SKU</th>
                    <th className="px-4 py-3 text-right font-semibold">Pedidos</th>
                    <th className="px-4 py-3 text-right font-semibold">Faturamento</th>
                    <th className="px-4 py-3 text-right font-semibold">Taxas + frete</th>
                    <th className="px-4 py-3 text-right font-semibold">Ads</th>
                    <th className="px-4 py-3 text-right font-semibold">Custo produto</th>
                    <th className="px-4 py-3 text-right font-semibold">Resultado*</th>
                    <th className="px-4 py-3 text-right font-semibold">Cobertura</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((row) => {
                    const status = statusMeta(row.profit_status);
                    const pending = row.profit_status === "pending_cost";

                    return (
                      <tr key={row.product_id} className="border-t border-slate-100">
                        <td className="px-4 py-3">
                          <div className="max-w-[330px] truncate font-semibold text-slate-900">
                            {row.product_name || "Produto sem nome"}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-slate-500">
                            {row.sku || row.product_id.slice(0, 8)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                          {row.orders.toLocaleString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                          {money(row.revenue)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-rose-700">
                          {money(row.marketplace_fees + row.shipping_cost + row.taxes)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-rose-700">
                          {money(row.ads_effective)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-rose-700">
                          {pending ? "Pendente" : money(row.product_cost)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-bold tabular-nums ${
                            pending
                              ? "text-slate-500"
                              : row.net_profit >= 0
                                ? "text-emerald-700"
                                : "text-rose-700"
                          }`}
                        >
                          {money(row.net_profit)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-700">
                          {row.cost_coverage_percent.toFixed(0)}%
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {!loading && products.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                        Nenhum produto vendido no período selecionado.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-[11px] leading-relaxed text-slate-500 md:px-6">
              * Quando a cobertura de custo é menor que 100%, “Resultado” significa
              resultado após os custos já conhecidos e não deve ser interpretado como
              lucro líquido final.
            </div>
          </div>

          <div className="border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-6">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Auditoria por pedido
                </h3>
                <p className="text-xs text-slate-500">
                  Componentes financeiros separados nos 50 pedidos mais recentes do período.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border-t border-slate-100">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3 text-left font-semibold">Pedido</th>
                    <th className="px-4 py-3 text-right font-semibold">Venda</th>
                    <th className="px-4 py-3 text-right font-semibold">Taxas ML</th>
                    <th className="px-4 py-3 text-right font-semibold">Frete</th>
                    <th className="px-4 py-3 text-right font-semibold">Ads</th>
                    <th className="px-4 py-3 text-right font-semibold">Custo produto</th>
                    <th className="px-4 py-3 text-right font-semibold">Desconto</th>
                    <th className="px-4 py-3 text-right font-semibold">Devolução</th>
                    <th className="px-4 py-3 text-left font-semibold">Confiança</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((row) => {
                    const marketplace = n(row.marketplace_fee);
                    const fees =
                      marketplace > 0
                        ? marketplace
                        : n(row.mercadolivre_fee) + n(row.mercadopago_fee);

                    return (
                      <tr key={row.id} className="border-t border-slate-100">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {row.external_order_id || row.id.slice(0, 8)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(row.order_date).toLocaleDateString("pt-BR")}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                          {money(row.total_amount)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-rose-700">
                          {money(fees)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-rose-700">
                          {money(row.seller_shipping_cost)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-rose-700">
                          {money(row.ads_cost)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-rose-700">
                          {n(row.product_cost_total) > 0 ? money(row.product_cost_total) : "Pendente"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-amber-700">
                          {money(row.discount_amount)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-rose-700">
                          {money(row.refunded_amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                              row.profit_confidence === "high" &&
                              !row.financial_review_required
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : row.financial_review_required
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                          >
                            {row.profit_confidence === "high" &&
                            !row.financial_review_required
                              ? "Confirmado"
                              : row.financial_review_required
                                ? "Revisar"
                                : "Aguardando custo"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  valueClassName,
}: {
  label: string;
  value: string;
  icon: typeof DollarSign;
  tone: "success" | "warning" | "danger" | "neutral";
  valueClassName?: string;
}) {
  const iconClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700"
        : tone === "danger"
          ? "bg-rose-50 text-rose-700"
          : "bg-blue-50 text-blue-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div
        className={`mt-2 font-display text-xl font-bold tabular-nums ${
          valueClassName ||
          (tone === "success"
            ? "text-emerald-700"
            : tone === "warning"
              ? "text-amber-700"
              : tone === "danger"
                ? "text-rose-700"
                : "text-slate-900")
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function QualityCard({
  label,
  value,
  helper,
  success = false,
  warning = false,
}: {
  label: string;
  value: number;
  helper: string;
  success?: boolean;
  warning?: boolean;
}) {
  const className = success
    ? "border-emerald-200 bg-emerald-50"
    : warning
      ? "border-amber-200 bg-amber-50"
      : "border-slate-200 bg-slate-50";

  const Icon = success ? CheckCircle2 : warning ? AlertTriangle : Package;

  return (
    <div className={`rounded-2xl border p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900">
            {value.toLocaleString("pt-BR")}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{helper}</p>
        </div>
        <Icon className="h-5 w-5 text-slate-500" />
      </div>
    </div>
  );
}

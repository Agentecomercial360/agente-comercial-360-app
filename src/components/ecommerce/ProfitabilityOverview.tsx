import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeDollarSign,
  DollarSign,
  Megaphone,
  Package,
  ReceiptText,
  RotateCcw,
  Truck,
  Percent,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  companyId: string;
  accountId: string | null;
  accountName: string;
};

type OrderProfitRow = {
  id: string;
  total_amount: number | null;
  marketplace_fee: number | null;
  mercadolivre_fee: number | null;
  mercadopago_fee: number | null;
  seller_shipping_cost: number | null;
  ads_cost: number | null;
  tax_amount: number | null;
  product_cost_total: number | null;
  discount_amount: number | null;
  net_profit: number | null;
  refunded_amount: number | null;
  has_refund: boolean | null;
  financial_review_required: boolean | null;
  profit_confidence: string | null;
  order_date: string;
};

function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function n(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ProfitabilityOverview({ companyId, accountId, accountName }: Props) {
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<OrderProfitRow[]>([]);
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

      let query = supabase
        .from("ecommerce_orders")
        .select(
          "id,total_amount,marketplace_fee,mercadolivre_fee,mercadopago_fee,seller_shipping_cost,ads_cost,tax_amount,product_cost_total,discount_amount,net_profit,refunded_amount,has_refund,financial_review_required,profit_confidence,order_date",
        )
        .eq("company_id", companyId)
        .eq("is_cancelled", false)
        .gte("order_date", from.toISOString())
        .order("order_date", { ascending: false })
        .limit(20000);

      if (accountId) query = query.eq("account_id", accountId);

      const { data, error: queryError } = await query;
      if (cancelled) return;

      if (queryError) {
        setError(queryError.message);
        setRows([]);
      } else {
        setRows((data || []) as OrderProfitRow[]);
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [companyId, accountId, days]);

  const summary = useMemo(() => {
    let revenue = 0;
    let platformFees = 0;
    let shipping = 0;
    let ads = 0;
    let taxes = 0;
    let productCost = 0;
    let discounts = 0;
    let refunds = 0;
    let netProfit = 0;
    let reviewRequired = 0;
    let reliable = 0;

    for (const row of rows) {
      const rowRevenue = n(row.total_amount);
      const marketplace = n(row.marketplace_fee);
      const legacyFees = n(row.mercadolivre_fee) + n(row.mercadopago_fee);
      const rowFees = marketplace > 0 ? marketplace : legacyFees;
      const rowShipping = n(row.seller_shipping_cost);
      const rowAds = n(row.ads_cost);
      const rowTaxes = n(row.tax_amount);
      const rowProductCost = n(row.product_cost_total);
      const rowDiscounts = n(row.discount_amount);
      const rowRefunds = n(row.refunded_amount);

      revenue += rowRevenue;
      platformFees += rowFees;
      shipping += rowShipping;
      ads += rowAds;
      taxes += rowTaxes;
      productCost += rowProductCost;
      discounts += rowDiscounts;
      refunds += rowRefunds;

      if (row.net_profit != null) {
        netProfit += n(row.net_profit);
      } else {
        netProfit +=
          rowRevenue -
          rowFees -
          rowShipping -
          rowAds -
          rowTaxes -
          rowProductCost -
          rowRefunds;
      }

      if (row.financial_review_required) reviewRequired += 1;
      if (row.profit_confidence === "high") reliable += 1;
    }

    const totalCosts = platformFees + shipping + ads + taxes + productCost + refunds;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      revenue,
      platformFees,
      shipping,
      ads,
      taxes,
      productCost,
      discounts,
      refunds,
      totalCosts,
      netProfit,
      margin,
      reviewRequired,
      reliable,
      orders: rows.length,
    };
  }, [rows]);

  const costs = [
    { label: "Taxas da plataforma", value: summary.platformFees, icon: ReceiptText },
    { label: "Frete do vendedor", value: summary.shipping, icon: Truck },
    { label: "Publicidade", value: summary.ads, icon: Megaphone },
    { label: "Impostos", value: summary.taxes, icon: BadgeDollarSign },
    { label: "Custo dos produtos", value: summary.productCost, icon: Package },
    { label: "Descontos registrados", value: summary.discounts, icon: Percent },
    { label: "Reembolsos / devoluções", value: summary.refunds, icon: RotateCcw },
  ];

  const maxCost = Math.max(...costs.map((item) => item.value), 1);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-5 py-5 text-white md:px-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
            Rentabilidade Real · {accountName}
          </div>
          <h2 className="mt-1 font-display text-xl font-bold md:text-2xl">
            O que realmente sobrou das vendas
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-300 md:text-sm">
            Receita cruzada com taxas do Mercado Livre, frete, publicidade, impostos,
            custo dos produtos e reembolsos.
          </p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          {[7, 30, 90].map((period) => (
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
              {period} dias
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Não foi possível carregar a rentabilidade real: {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5 md:p-6">
            {[
              { label: "Faturamento", value: summary.revenue, icon: DollarSign, className: "text-slate-900" },
              { label: "Custos totais", value: summary.totalCosts, icon: ReceiptText, className: "text-rose-700" },
              { label: "Lucro líquido", value: summary.netProfit, icon: BadgeDollarSign, className: summary.netProfit >= 0 ? "text-emerald-700" : "text-rose-700" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {card.label}
                    </span>
                    <Icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className={`mt-2 font-display text-2xl font-bold tabular-nums ${card.className}`}>
                    {loading ? "—" : money(card.value)}
                  </div>
                </div>
              );
            })}

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Margem líquida
              </div>
              <div
                className={`mt-2 font-display text-2xl font-bold tabular-nums ${
                  summary.margin >= 15
                    ? "text-emerald-700"
                    : summary.margin >= 5
                      ? "text-amber-700"
                      : "text-rose-700"
                }`}
              >
                {loading ? "—" : `${summary.margin.toFixed(2).replace(".", ",")}%`}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Pedidos analisados
              </div>
              <div className="mt-2 font-display text-2xl font-bold tabular-nums text-slate-900">
                {loading ? "—" : summary.orders.toLocaleString("pt-BR")}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {summary.reliable.toLocaleString("pt-BR")} com lucro de alta confiança
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-200 p-5 lg:grid-cols-[1.4fr_0.6fr] md:p-6">
            <div className="rounded-2xl border border-slate-200 p-4 md:p-5">
              <div className="mb-4">
                <h3 className="font-display text-base font-bold text-slate-900">
                  Composição dos custos
                </h3>
                <p className="text-xs text-slate-500">
                  Detalhamento do valor consumido em cada camada da operação.
                </p>
              </div>
              <div className="space-y-3">
                {costs.map((item) => {
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
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                summary.reviewRequired > 0
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    summary.reviewRequired > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {summary.reviewRequired > 0 ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <BadgeDollarSign className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Qualidade financeira
                  </div>
                  <div className="mt-1 font-display text-xl font-bold text-slate-900">
                    {loading
                      ? "Analisando…"
                      : summary.reviewRequired > 0
                        ? `${summary.reviewRequired} pedido(s) para revisar`
                        : "Sem pendências críticas"}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    O AC360 considera como atenção pedidos com dados financeiros incompletos
                    ou marcados para revisão antes de tratar o lucro como definitivo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

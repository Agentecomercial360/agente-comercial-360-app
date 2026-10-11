import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  DollarSign,
  Loader2,
  Megaphone,
  MousePointerClick,
  Percent,
  RefreshCw,
  ShoppingCart,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  autoSyncMarketplaceIntelligence,
  runMarketplaceIntelligence,
} from "@/lib/ml-marketplace-intelligence";

export const Route = createFileRoute("/ecommerce/ads")({
  component: AdsIntelligencePage,
  head: () => ({
    meta: [{ title: "ADS Intelligence | Agente Comercial 360" }],
  }),
});

type AdsMetric = {
  id: string;
  account_id: string | null;
  product_id: string | null;
  listing_id: string | null;
  metric_date: string;
  campaign_id: string | null;
  campaign_name: string | null;
  ad_group_id: string | null;
  impressions: number | null;
  clicks: number | null;
  ads_sales_count: number | null;
  ads_units_sold: number | null;
  investment: number | null;
  ads_revenue: number | null;
  total_revenue: number | null;
  roas: number | null;
  acos: number | null;
  tacos: number | null;
  ctr: number | null;
  cpc: number | null;
  organic_sales_count: number | null;
  organic_units_sold: number | null;
  organic_revenue: number | null;
  organic_metrics_synced: boolean | null;
  direct_sales_count: number | null;
  indirect_sales_count: number | null;
  direct_units_sold: number | null;
  indirect_units_sold: number | null;
  direct_revenue: number | null;
  indirect_revenue: number | null;
  cvr: number | null;
  sov: number | null;
  impression_share: number | null;
  top_impression_share: number | null;
  lost_impression_share_by_budget: number | null;
  lost_impression_share_by_ad_rank: number | null;
  acos_benchmark: number | null;
  status: string | null;
  ai_action_suggestion: string | null;
};

type ProductLite = {
  id: string;
  sku: string | null;
  product_name: string | null;
};

function num(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(value: number): string {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

function AdsIntelligencePage() {
  return (
    <EcommerceLayout>
      <AdsIntelligenceContent />
    </EcommerceLayout>
  );
}

function AdsIntelligenceContent() {
  const {
    companyId, activeAccountId, activeAccount, loading: accountLoading } =
    useEcommerceActiveAccount();
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<AdsMetric[]>([]);
  const [products, setProducts] = useState<Map<string, ProductLite>>(new Map());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountLoading) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("ecommerce_ads_metrics")
        .select(
          "id,account_id,product_id,listing_id,metric_date,campaign_id,campaign_name,ad_group_id,impressions,clicks,ads_sales_count,ads_units_sold,investment,ads_revenue,total_revenue,roas,acos,tacos,ctr,cpc,organic_sales_count,organic_units_sold,organic_revenue,organic_metrics_synced,direct_sales_count,indirect_sales_count,direct_units_sold,indirect_units_sold,direct_revenue,indirect_revenue,cvr,sov,impression_share,top_impression_share,lost_impression_share_by_budget,lost_impression_share_by_ad_rank,acos_benchmark,status,ai_action_suggestion",
        )
        .eq("company_id", companyId)
        .eq("metric_scope", "product_period")
        .eq("period_days", days)
        .order("metric_date", { ascending: false })
        .limit(20000);

      if (activeAccountId) query = query.eq("account_id", activeAccountId);

      const { data, error: metricsError } = await query;
      if (cancelled) return;

      if (metricsError) {
        setError(metricsError.message);
        setRows([]);
        setLoading(false);
        return;
      }

      const rawMetrics = (data || []) as AdsMetric[];
      const latestDate = rawMetrics[0]?.metric_date ?? null;
      const metrics = latestDate
        ? rawMetrics.filter((row) => row.metric_date === latestDate)
        : [];
      setRows(metrics);

      const productIds = Array.from(
        new Set(metrics.map((row) => row.product_id).filter(Boolean)),
      ) as string[];

      if (productIds.length === 0) {
        setProducts(new Map());
        setLoading(false);
        return;
      }

      const { data: productRows, error: productError } = await supabase
        .from("ecommerce_products")
        .select("id,sku,product_name")
        .eq("company_id", companyId)
        .in("id", productIds);

      if (cancelled) return;
      if (productError) {
        setError(productError.message);
      } else {
        setProducts(
          new Map(
            ((productRows || []) as ProductLite[]).map((product) => [product.id, product]),
          ),
        );
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [activeAccountId, accountLoading, days, refreshTick]);

  useEffect(() => {
    if (accountLoading || !activeAccountId) return;
    let cancelled = false;

    void autoSyncMarketplaceIntelligence({
      action: "ads_sync",
      company_id: companyId,
      account_id: activeAccountId,
      days,
    })
      .then(({ executed }) => {
        if (executed && !cancelled) {
          setRefreshTick((value) => value + 1);
        }
      })
      .catch((autoError) => {
        console.warn("ads auto sync", autoError);
      });

    return () => {
      cancelled = true;
    };
  }, [activeAccountId, accountLoading, days]);

  async function handleSync() {
    if (!activeAccountId) {
      toast.error("Selecione uma conta Mercado Livre para atualizar o Ads.");
      return;
    }

    setSyncing(true);
    setError(null);
    try {
      const result = await runMarketplaceIntelligence<{
        rows?: number;
        ad_groups?: number;
        mapped_ad_groups?: number;
      }>({
        action: "ads_sync",
        company_id:
        account_id: activeAccountId,
        days,
      });
      toast.success(
        `Ads atualizado: ${Number(result.rows ?? 0).toLocaleString("pt-BR")} produto(s) com métricas do período.`,
      );
      setRefreshTick((value) => value + 1);
    } catch (syncError) {
      const message =
        syncError instanceof Error
          ? syncError.message
          : "Não foi possível atualizar o Product Ads.";
      setError(message);
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  }

  const totals = useMemo(() => {
    let impressions = 0;
    let clicks = 0;
    let investment = 0;
    let adsRevenue = 0;
    let totalRevenue = 0;
    let adsSales = 0;
    let adsUnits = 0;
    let organicSales = 0;
    let organicUnits = 0;
    let organicRevenue = 0;
    let organicSyncedRows = 0;

    for (const row of rows) {
      impressions += num(row.impressions);
      clicks += num(row.clicks);
      investment += num(row.investment);
      adsRevenue += num(row.ads_revenue);
      totalRevenue += num(row.total_revenue);
      adsSales += num(row.ads_sales_count);
      adsUnits += num(row.ads_units_sold);
      organicSales += num(row.organic_sales_count);
      organicUnits += num(row.organic_units_sold);
      organicRevenue += num(row.organic_revenue);
      if (row.organic_metrics_synced) organicSyncedRows += 1;
    }

    const totalUnits = adsUnits + organicUnits;
    const fallbackTotalRevenue = adsRevenue + organicRevenue;
    const revenue = totalRevenue > 0 ? totalRevenue : fallbackTotalRevenue;

    return {
      impressions,
      clicks,
      investment,
      adsRevenue,
      totalRevenue: revenue,
      adsSales,
      adsUnits,
      organicSales,
      organicUnits,
      organicRevenue,
      organicMetricsSynced: rows.length > 0 && organicSyncedRows === rows.length,
      organicSyncedRows,
      totalUnits,
      roas: investment > 0 ? adsRevenue / investment : 0,
      acos: adsRevenue > 0 ? (investment / adsRevenue) * 100 : 0,
      tacos: revenue > 0 ? (investment / revenue) * 100 : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? investment / clicks : 0,
      costPerAdSale: adsSales > 0 ? investment / adsSales : 0,
      adUnitShare: totalUnits > 0 ? (adsUnits / totalUnits) * 100 : 0,
      organicUnitShare: totalUnits > 0 ? (organicUnits / totalUnits) * 100 : 0,
    };
  }, [rows]);

  const productsReport = useMemo(() => {
    type Agg = {
      key: string;
      productId: string | null;
      listingId: string | null;
      campaignName: string;
      investment: number;
      adsRevenue: number;
      totalRevenue: number;
      adsSales: number;
      adsUnits: number;
      organicSales: number;
      organicUnits: number;
      organicRevenue: number;
      clicks: number;
      impressions: number;
      organicSynced: boolean;
    };

    const map = new Map<string, Agg>();

    for (const row of rows) {
      const key = row.product_id || row.listing_id || row.campaign_id || row.id;
      const current = map.get(key) ?? {
        key,
        productId: row.product_id,
        listingId: row.listing_id,
        campaignName: row.campaign_name || "Campanha sem nome",
        investment: 0,
        adsRevenue: 0,
        totalRevenue: 0,
        adsSales: 0,
        adsUnits: 0,
        organicSales: 0,
        organicUnits: 0,
        organicRevenue: 0,
        clicks: 0,
        impressions: 0,
        organicSynced: false,
      };

      current.investment += num(row.investment);
      current.adsRevenue += num(row.ads_revenue);
      current.totalRevenue += num(row.total_revenue);
      current.adsSales += num(row.ads_sales_count);
      current.adsUnits += num(row.ads_units_sold);
      current.organicSales += num(row.organic_sales_count);
      current.organicUnits += num(row.organic_units_sold);
      current.organicRevenue += num(row.organic_revenue);
      current.clicks += num(row.clicks);
      current.impressions += num(row.impressions);
      current.organicSynced = current.organicSynced || Boolean(row.organic_metrics_synced);
      map.set(key, current);
    }

    return Array.from(map.values())
      .map((item) => {
        const product = item.productId ? products.get(item.productId) : undefined;
        const totalUnits = item.adsUnits + item.organicUnits;
        const revenue =
          item.totalRevenue > 0
            ? item.totalRevenue
            : item.adsRevenue + item.organicRevenue;
        const adShare = totalUnits > 0 ? (item.adsUnits / totalUnits) * 100 : 0;
        const roas = item.investment > 0 ? item.adsRevenue / item.investment : 0;
        const tacos = revenue > 0 ? (item.investment / revenue) * 100 : 0;
        const costPerAdSale =
          item.adsSales > 0 ? item.investment / item.adsSales : 0;

        return {
          ...item,
          productName: product?.product_name || item.campaignName,
          sku: product?.sku || "—",
          totalUnits,
          revenue,
          adShare,
          organicShare: totalUnits > 0 ? 100 - adShare : 0,
          roas,
          tacos,
          costPerAdSale,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [rows, products]);

  const accountLabel =
    activeAccount?.account_name || activeAccount?.nickname || "Todas as contas";

  const kpis = [
    {
      label: "Investimento Ads",
      value: money(totals.investment),
      icon: DollarSign,
      tone: "text-slate-900",
    },
    {
      label: "Receita atribuída",
      value: money(totals.adsRevenue),
      icon: TrendingUp,
      tone: "text-emerald-700",
    },
    {
      label: "ROAS",
      value: `${totals.roas.toFixed(2).replace(".", ",")}x`,
      icon: Target,
      tone: "text-blue-700",
    },
    {
      label: "ACOS",
      value: pct(totals.acos),
      icon: Percent,
      tone: "text-amber-700",
    },
    {
      label: "TACOS",
      value: pct(totals.tacos),
      icon: BarChart3,
      tone: "text-violet-700",
    },
    {
      label: "Custo por venda Ads",
      value: money(totals.costPerAdSale),
      icon: ShoppingCart,
      tone: "text-rose-700",
    },
    {
      label: "CTR",
      value: pct(totals.ctr),
      icon: MousePointerClick,
      tone: "text-slate-900",
    },
    {
      label: "CPC",
      value: money(totals.cpc),
      icon: Activity,
      tone: "text-slate-900",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-5 py-6 text-white shadow-[var(--shadow-soft)] md:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
              <Zap className="h-3.5 w-3.5" />
              ADS Intelligence
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold md:text-3xl">
              Orgânico × Publicidade
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-300">
              Entenda quanto cada produto vende sozinho, quanto depende de mídia e
              quanto custa gerar cada venda patrocinada.
            </p>
            <div className="mt-3 text-xs text-slate-400">
              {accountLabel}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={syncing || !activeAccountId}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-300/20 bg-blue-400/10 px-3.5 py-2 text-xs font-semibold text-blue-100 transition hover:bg-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Atualizando Mercado Livre…" : "Atualizar do Mercado Livre"}
            </button>
            <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
              {[1, 7, 30, 90].map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setDays(period)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    days === period
                      ? "bg-white text-slate-900"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {period === 1 ? "Hoje" : `${period} dias`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Não foi possível carregar as métricas de Ads: {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {item.label}
                </div>
                <Icon className="h-4 w-4 text-slate-400" />
              </div>
              <div className={`mt-2 font-display text-2xl font-bold tabular-nums ${item.tone}`}>
                {loading ? "—" : item.value}
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Vendas orgânicas
              </div>
              <div className="mt-1 font-display text-3xl font-bold text-emerald-900">
                {loading
                  ? "—"
                  : totals.organicMetricsSynced
                    ? totals.organicUnits.toLocaleString("pt-BR")
                    : "Aguardando sync"}
              </div>
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-emerald-700">
              {loading ? "—" : totals.organicMetricsSynced ? pct(totals.organicUnitShare) : "—"}
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-emerald-800/80">
            {totals.organicMetricsSynced
              ? "Unidades vendidas sem atribuição de Product Ads no período selecionado."
              : "A leitura orgânica será liberada após a próxima sincronização do Product Ads com as métricas atuais."}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                Vendas por publicidade
              </div>
              <div className="mt-1 font-display text-3xl font-bold text-blue-900">
                {loading ? "—" : totals.adsUnits.toLocaleString("pt-BR")}
              </div>
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-blue-700">
              {loading ? "—" : totals.organicMetricsSynced ? pct(totals.adUnitShare) : "—"}
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-blue-800/80">
            {totals.organicMetricsSynced
              ? "Unidades atribuídas à publicidade, com custo por venda calculado a partir do investimento."
              : "As métricas já existentes de publicidade continuam disponíveis; a divisão orgânico × Ads aguarda sincronização."}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 md:px-6">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Resultado por produto
            </h2>
            <p className="text-xs text-slate-500">
              Origem das vendas, investimento e eficiência de publicidade por SKU.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
            {productsReport.length.toLocaleString("pt-BR")} produtos/campanhas
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando métricas…
          </div>
        ) : productsReport.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="mt-3 font-display text-base font-semibold text-slate-900">
              Ainda não há métricas de Ads neste período
            </div>
            <p className="mx-auto mt-1 max-w-xl text-sm text-slate-500">
              A tela já está pronta para receber as métricas atuais do Product Ads,
              incluindo vendas orgânicas e patrocinadas por produto.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Produto / SKU</th>
                  <th className="px-4 py-3 text-right font-semibold">Unidades</th>
                  <th className="px-4 py-3 text-right font-semibold">Orgânico</th>
                  <th className="px-4 py-3 text-right font-semibold">Publicidade</th>
                  <th className="px-4 py-3 text-right font-semibold">Investimento</th>
                  <th className="px-4 py-3 text-right font-semibold">Custo / venda</th>
                  <th className="px-4 py-3 text-right font-semibold">Receita Ads</th>
                  <th className="px-4 py-3 text-right font-semibold">ROAS</th>
                  <th className="px-4 py-3 text-right font-semibold">TACOS</th>
                  <th className="px-5 py-3 text-left font-semibold">Leitura</th>
                </tr>
              </thead>
              <tbody>
                {productsReport.map((item) => {
                  const diagnosis = !item.organicSynced
                    ? "Orgânico aguardando sync"
                    : item.totalUnits === 0
                      ? "Sem vendas no período"
                      : item.adShare >= 60
                        ? "Alta dependência de Ads"
                        : item.organicShare >= 60
                          ? "Orgânico forte"
                          : "Mix equilibrado";
                  const diagnosisClass = !item.organicSynced
                    ? "border-slate-200 bg-slate-50 text-slate-600"
                    : item.adShare >= 60
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : item.organicShare >= 60
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-blue-200 bg-blue-50 text-blue-700";

                  return (
                    <tr key={item.key} className="border-t border-slate-100 align-middle">
                      <td className="px-5 py-4">
                        <div className="max-w-[280px] font-semibold text-slate-900">
                          {item.productName}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          SKU {item.sku}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums text-slate-900">
                        {item.totalUnits.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-semibold tabular-nums text-emerald-700">
                          {item.organicSynced
                            ? item.organicUnits.toLocaleString("pt-BR")
                            : "—"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.organicSynced ? pct(item.organicShare) : "Aguardando sync"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-semibold tabular-nums text-blue-700">
                          {item.adsUnits.toLocaleString("pt-BR")}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.organicSynced ? pct(item.adShare) : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium tabular-nums text-slate-900">
                        {money(item.investment)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums text-rose-700">
                        {money(item.costPerAdSale)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium tabular-nums text-slate-900">
                        {money(item.adsRevenue)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums text-blue-700">
                        {item.roas.toFixed(2).replace(".", ",")}x
                      </td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums text-violet-700">
                        {pct(item.tacos)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${diagnosisClass}`}>
                          {diagnosis}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

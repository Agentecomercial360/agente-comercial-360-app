import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ecommerce/produtos")({
  component: ProdutosUnificado,
  head: () => ({
    meta: [{ title: "Produto Unificado | Agente Comercial 360" }],
  }),
});

type Product = {
  sku?: string | null;
  product_name?: string | null;
  category?: string | null;
  brand?: string | null;
  total_stock?: number | null;
  available_stock?: number | null;
  days_without_sale?: number | null;
  estimated_stock_value?: number | null;
  total_listings?: number | null;
  marketplaces?: string[] | string | null;
  total_visits?: number | null;
  total_sales_count?: number | null;
  total_gross_revenue?: number | null;
  total_ads_investment?: number | null;
  total_ads_revenue?: number | null;
  avg_roas?: number | null;
  open_tasks?: number | null;
  product_health_status?: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  critical: "Crítico",
  attention: "Atenção",
  no_traffic: "Sem tráfego",
  visits_no_sales: "Visitas sem venda",
  ads_wasting: "Ads desperdiçando",
  growth_opportunity: "Oportunidade",
  normal: "Normal",
};

const STATUS_TONE: Record<
  string,
  { dot: string; chip: string; ring: string; accent: string; surface: string }
> = {
  critical: {
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-rose-200",
    ring: "ring-rose-100",
    accent: "before:bg-rose-400",
    surface: "bg-[#FDFAFA]",
  },
  attention: {
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
    ring: "ring-amber-100",
    accent: "before:bg-amber-400",
    surface: "bg-[#FDFBF6]",
  },
  ads_wasting: {
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-rose-200",
    ring: "ring-rose-100",
    accent: "before:bg-rose-400",
    surface: "bg-[#FDFAFA]",
  },
  visits_no_sales: {
    dot: "bg-orange-500",
    chip: "bg-orange-50 text-orange-700 ring-orange-200",
    ring: "ring-orange-100",
    accent: "before:bg-orange-400",
    surface: "bg-[#FEFBF7]",
  },
  no_traffic: {
    dot: "bg-sky-500",
    chip: "bg-sky-50 text-sky-700 ring-sky-200",
    ring: "ring-sky-100",
    accent: "before:bg-sky-400",
    surface: "bg-[#F8FBFD]",
  },
  growth_opportunity: {
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ring: "ring-emerald-100",
    accent: "before:bg-emerald-400",
    surface: "bg-[#F8FCFA]",
  },
  normal: {
    dot: "bg-slate-400",
    chip: "bg-slate-50 text-slate-600 ring-slate-200",
    ring: "ring-slate-100",
    accent: "before:bg-slate-300",
    surface: "bg-white",
  },
};

const STATUS_READING: Record<string, string> = {
  critical:
    "Produto exige atenção imediata por apresentar sinais críticos de performance.",
  attention:
    "Produto em atenção, com indicadores que precisam ser acompanhados.",
  growth_opportunity:
    "Produto com sinais positivos e oportunidade de crescimento.",
  no_traffic:
    "Produto com baixa exposição e necessidade de gerar tráfego.",
  visits_no_sales:
    "Produto recebe visitas, mas não converte em vendas.",
  ads_wasting:
    "Produto com investimento em Ads sem retorno proporcional.",
  normal: "Produto com indicadores dentro do esperado.",
};

const MARKETPLACE_LABEL: Record<string, string> = {
  mercado_livre: "Mercado Livre",
  mercadolivre: "Mercado Livre",
  ml: "Mercado Livre",
  shopee: "Shopee",
  amazon: "Amazon",
  bling: "Bling",
  loja_propria: "Loja própria",
  outro: "Outro",
};

const fmtBRL = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(v ?? 0));
const fmtInt = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(v ?? 0));
const fmtNum = (v: number | null | undefined, d = 2) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(Number(v ?? 0));

function toMarketplacesList(v: Product["marketplaces"]): string[] {
  if (!v) return [];
  const raw = Array.isArray(v)
    ? (v.filter(Boolean) as string[])
    : String(v).split(",").map((s) => s.trim()).filter(Boolean);
  return raw.map((m) => MARKETPLACE_LABEL[m.toLowerCase()] ?? m);
}

function getTone(status: string) {
  return STATUS_TONE[status] ?? STATUS_TONE.normal;
}

function StatusChip({ status }: { status: string }) {
  const t = getTone(status);
  const label = STATUS_LABEL[status] ?? "Normal";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${t.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {label}
    </span>
  );
}

function Stat({
  label,
  value,
  hint,
  align = "left",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
        {value}
      </div>
      {hint ? (
        <div className="mt-0.5 text-[11px] text-slate-500">{hint}</div>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      {accent ? (
        <span
          className={`absolute left-0 top-0 h-full w-[3px] ${accent}`}
          aria-hidden
        />
      ) : null}
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
        {label}
      </div>
      <div className="mt-1.5 text-[22px] font-semibold tabular-nums text-slate-900">
        {value}
      </div>
    </div>
  );
}

function ProductRow({ p }: { p: Product }) {
  const status = p.product_health_status ?? "normal";
  const tone = getTone(status);
  const mkts = toMarketplacesList(p.marketplaces);
  const roas = Number(p.avg_roas ?? 0);
  const roasTone =
    roas >= 3
      ? "text-emerald-700"
      : roas >= 1.5
        ? "text-slate-900"
        : roas > 0
          ? "text-rose-700"
          : "text-slate-400";

  return (
    <div
      className={`relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_6px_24px_-12px_rgba(15,23,42,0.18)] before:absolute before:left-0 before:top-4 before:h-[calc(100%-2rem)] before:w-[3px] before:rounded-r-full ${tone.accent}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-slate-900">
              {p.product_name ?? "—"}
            </h3>
            <StatusChip status={status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="font-mono uppercase tracking-wider text-slate-600">
              {p.sku ?? "—"}
            </span>
            {p.category ? (
              <>
                <span className="text-slate-300">•</span>
                <span>{p.category}</span>
              </>
            ) : null}
            {p.brand ? (
              <>
                <span className="text-slate-300">•</span>
                <span>{p.brand}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {mkts.length === 0 ? (
            <span className="text-[11px] text-slate-400">Sem marketplace</span>
          ) : (
            mkts.map((m, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
              >
                {m}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-slate-100 pt-4 sm:grid-cols-4 lg:grid-cols-7">
        <Stat label="Estoque" value={fmtInt(p.total_stock)} hint={`${fmtInt(p.available_stock)} disp.`} />
        <Stat label="Dias s/ venda" value={fmtInt(p.days_without_sale)} />
        <Stat label="Valor estoque" value={fmtBRL(p.estimated_stock_value)} />
        <Stat label="Anúncios" value={fmtInt(p.total_listings)} />
        <Stat label="Visitas" value={fmtInt(p.total_visits)} />
        <Stat label="Vendas" value={fmtInt(p.total_sales_count)} />
        <Stat label="Receita" value={fmtBRL(p.total_gross_revenue)} />
      </div>

      {/* Ads block */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50/70 px-4 py-3 ring-1 ring-inset ring-slate-100 sm:grid-cols-4">
        <Stat label="Inv. Ads" value={fmtBRL(p.total_ads_investment)} />
        <Stat label="Rec. Ads" value={fmtBRL(p.total_ads_revenue)} />
        <Stat
          label="ROAS"
          value={
            <span className={roasTone}>
              {roas > 0 ? `${fmtNum(roas, 2)}x` : "—"}
            </span>
          }
        />
        <Stat
          label="Tarefas"
          value={
            <span
              className={
                Number(p.open_tasks ?? 0) > 0
                  ? "text-amber-700"
                  : "text-slate-900"
              }
            >
              {fmtInt(p.open_tasks)}
            </span>
          }
        />
      </div>

      {/* Footer actions */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="text-[11px] text-slate-400">
          Visão consolidada por SKU
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-slate-600 hover:text-slate-900">
            Ver detalhes
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-slate-600 hover:text-slate-900">
            Ver anúncios
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-slate-600 hover:text-slate-900">
            Ver histórico
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProdutosUnificado() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: ctx, error: ctxErr } = await supabase
          .from("vw_user_access_context")
          .select("company_id, has_ecommerce_access")
          .maybeSingle();

        if (ctxErr) throw ctxErr;
        if (!ctx) {
          navigate({ to: "/ecommerce/login" });
          return;
        }
        if (!ctx.has_ecommerce_access) {
          await supabase.auth.signOut();
          navigate({ to: "/ecommerce/login" });
          return;
        }

        const { data, error: pErr } = await supabase
          .from("vw_ecommerce_product_unified")
          .select("*")
          .eq("company_id", ctx.company_id);

        if (pErr) throw pErr;
        if (cancelled) return;
        setProducts((data as Product[]) ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Erro ao carregar produtos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const summary = useMemo(() => {
    const s = {
      total: products.length,
      critical: 0,
      attention: 0,
      opportunity: 0,
      normal: 0,
      stock: 0,
      stockValue: 0,
      openTasks: 0,
    };
    for (const p of products) {
      const st = p.product_health_status ?? "normal";
      if (st === "critical" || st === "ads_wasting") s.critical++;
      else if (st === "attention" || st === "visits_no_sales") s.attention++;
      else if (st === "growth_opportunity") s.opportunity++;
      else s.normal++;
      s.stock += Number(p.total_stock ?? 0);
      s.stockValue += Number(p.estimated_stock_value ?? 0);
      s.openTasks += Number(p.open_tasks ?? 0);
    }
    return s;
  }, [products]);

  const sorted = useMemo(() => {
    const weight: Record<string, number> = {
      critical: 0,
      ads_wasting: 1,
      attention: 2,
      visits_no_sales: 3,
      no_traffic: 4,
      growth_opportunity: 5,
      normal: 6,
    };
    return [...products].sort(
      (a, b) =>
        (weight[a.product_health_status ?? "normal"] ?? 9) -
        (weight[b.product_health_status ?? "normal"] ?? 9),
    );
  }, [products]);

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Executive header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
              AC360 · E-commerce Intelligence
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Produto Unificado
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Visão consolidada de estoque, vendas, anúncios e performance por SKU.
            </p>
          </div>

          {!loading && !error && products.length > 0 ? (
            <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Leitura dos produtos
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px]">
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  <span className="font-semibold tabular-nums">{summary.critical}</span>
                  <span className="text-slate-500">críticos</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span className="font-semibold tabular-nums">{summary.attention}</span>
                  <span className="text-slate-500">em atenção</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold tabular-nums">{summary.opportunity}</span>
                  <span className="text-slate-500">oportunidades</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span className="font-semibold tabular-nums">{summary.normal}</span>
                  <span className="text-slate-500">normais</span>
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Summary cards */}
        {!loading && !error && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <SummaryCard label="Total de produtos" value={fmtInt(summary.total)} accent="bg-slate-300" />
            <SummaryCard label="Críticos" value={fmtInt(summary.critical)} accent="bg-rose-400" />
            <SummaryCard label="Em atenção" value={fmtInt(summary.attention)} accent="bg-amber-400" />
            <SummaryCard label="Estoque total" value={fmtInt(summary.stock)} accent="bg-sky-400" />
            <SummaryCard label="Valor em estoque" value={fmtBRL(summary.stockValue)} accent="bg-emerald-400" />
            <SummaryCard label="Tarefas abertas" value={fmtInt(summary.openTasks)} accent="bg-violet-400" />
          </div>
        ) : null}

        {/* States */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Carregando produtos…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            Não foi possível carregar os produtos agora. Tente novamente em instantes.
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Nenhum produto encontrado para esta empresa.
          </div>
        )}

        {/* Product list */}
        {!loading && !error && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((p, i) => (
              <ProductRow key={(p.sku ?? "") + i} p={p} />
            ))}
          </div>
        )}
      </div>
    </EcommerceLayout>
  );
}

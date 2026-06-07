import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  accounts?: string[] | string | null;
  total_visits?: number | null;
  total_sales_count?: number | null;
  total_gross_revenue?: number | null;
  total_ads_investment?: number | null;
  total_ads_revenue?: number | null;
  avg_roas?: number | null;
  open_tasks?: number | null;
  product_health_status?: string | null;
};

type FilterKey =
  | "all"
  | "critical"
  | "attention"
  | "no_sales"
  | "no_visits"
  | "high_stock"
  | "low_stock"
  | "bad_ads"
  | "opportunity";

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
  critical: { dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 ring-rose-200", ring: "ring-rose-100", accent: "before:bg-rose-400", surface: "bg-[#FDFAFA]" },
  attention: { dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 ring-amber-200", ring: "ring-amber-100", accent: "before:bg-amber-400", surface: "bg-[#FDFBF6]" },
  ads_wasting: { dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 ring-rose-200", ring: "ring-rose-100", accent: "before:bg-rose-400", surface: "bg-[#FDFAFA]" },
  visits_no_sales: { dot: "bg-orange-500", chip: "bg-orange-50 text-orange-700 ring-orange-200", ring: "ring-orange-100", accent: "before:bg-orange-400", surface: "bg-[#FEFBF7]" },
  no_traffic: { dot: "bg-sky-500", chip: "bg-sky-50 text-sky-700 ring-sky-200", ring: "ring-sky-100", accent: "before:bg-sky-400", surface: "bg-[#F8FBFD]" },
  growth_opportunity: { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", ring: "ring-emerald-100", accent: "before:bg-emerald-400", surface: "bg-[#F8FCFA]" },
  normal: { dot: "bg-slate-400", chip: "bg-slate-50 text-slate-600 ring-slate-200", ring: "ring-slate-100", accent: "before:bg-slate-300", surface: "bg-white" },
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
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number(v ?? 0));
const fmtInt = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(v ?? 0));
const fmtNum = (v: number | null | undefined, d = 2) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(v ?? 0));

function toList(v: Product["marketplaces"]): string[] {
  if (!v) return [];
  const raw = Array.isArray(v)
    ? (v.filter(Boolean) as string[])
    : String(v).split(",").map((s) => s.trim()).filter(Boolean);
  return raw;
}

function toMarketplacesList(v: Product["marketplaces"]): string[] {
  return toList(v).map((m) => MARKETPLACE_LABEL[m.toLowerCase()] ?? m);
}

function getTone(status: string) {
  return STATUS_TONE[status] ?? STATUS_TONE.normal;
}

function StatusChip({ status }: { status: string }) {
  const t = getTone(status);
  const label = STATUS_LABEL[status] ?? "Normal";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${t.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {label}
    </span>
  );
}

function Stat({ label, value, align = "left" }: { label: string; value: React.ReactNode; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      {accent ? <span className={`absolute left-0 top-0 h-full w-[3px] ${accent}`} aria-hidden /> : null}
      <div className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="mt-1 text-[19px] font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

function MetricGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white/60 px-3.5 py-2.5 ring-1 ring-inset ring-slate-100">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">{title}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">{children}</div>
    </div>
  );
}

function tasksLabel(n: number) {
  if (!n || n <= 0) return "Sem tarefas abertas";
  return n === 1 ? "1 tarefa aberta" : `${fmtInt(n)} tarefas abertas`;
}

// Strategic reading derived from real metrics
function strategicReading(p: Product): string {
  const visits = Number(p.total_visits ?? 0);
  const sales = Number(p.total_sales_count ?? 0);
  const stock = Number(p.total_stock ?? 0);
  const days = Number(p.days_without_sale ?? 0);
  const adsInv = Number(p.total_ads_investment ?? 0);
  const roas = Number(p.avg_roas ?? 0);

  if (adsInv > 0 && roas > 0 && roas < 1.5) return "Investimento em Ads com retorno baixo. Revisar campanhas e segmentação.";
  if (sales > 0 && stock > 0 && stock < 5) return "Produto vendendo bem, mas com estoque baixo. Avalie reposição.";
  if (visits > 0 && sales === 0) return "Produto recebe visitas, mas não converte. Revisar título, fotos e preço.";
  if (visits === 0 && sales === 0) return "Produto sem tráfego. Considere ativar Ads ou melhorar exposição.";
  if (stock > 0 && days > 60) return "Estoque parado há muito tempo. Considere promoção ou liquidação.";
  if (sales > 0 && roas >= 3) return "Produto com performance forte e oportunidade de escalar investimento.";
  if (sales > 0) return "Produto com vendas saudáveis e indicadores dentro do esperado.";
  return "Produto sem movimentação relevante no período.";
}

function ProductRow({ p }: { p: Product }) {
  const status = p.product_health_status ?? "normal";
  const tone = getTone(status);
  const mkts = toMarketplacesList(p.marketplaces);
  const accounts = toList(p.accounts);
  const roas = Number(p.avg_roas ?? 0);
  const roasTone =
    roas >= 3 ? "text-emerald-700" : roas >= 1.5 ? "text-slate-900" : roas > 0 ? "text-rose-700" : "text-slate-400";

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200/80 ${tone.surface} px-5 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_28px_-14px_rgba(15,23,42,0.18)] before:absolute before:left-0 before:top-4 before:h-[calc(100%-2rem)] before:w-[3px] before:rounded-r-full ${tone.accent}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="truncate text-[15.5px] font-semibold tracking-tight text-slate-900">{p.product_name ?? "—"}</h3>
            <StatusChip status={status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500">
            <span className="font-mono uppercase tracking-wider text-slate-500">{p.sku ?? "—"}</span>
            {p.category ? (<><span className="text-slate-300">·</span><span>{p.category}</span></>) : null}
            {p.brand ? (<><span className="text-slate-300">·</span><span>{p.brand}</span></>) : null}
            {mkts.length > 0 ? (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex flex-wrap items-center gap-1">
                  {mkts.map((m, i) => (
                    <span key={i} className="inline-flex items-center rounded-md bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200">{m}</span>
                  ))}
                </span>
              </>
            ) : null}
            {accounts.length > 0 ? (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">{accounts.join(" · ")}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`mt-3 flex items-start gap-2.5 rounded-lg border border-slate-200/70 bg-white/70 px-3.5 py-2 ring-1 ring-inset ${tone.ring}`}>
        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">Leitura estratégica</div>
          <p className="mt-0.5 text-[12.5px] leading-snug text-slate-700">{strategicReading(p)}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 lg:grid-cols-3">
        <MetricGroup title="Estoque">
          <Stat label="Estoque" value={fmtInt(p.total_stock)} />
          <Stat label="Disponível" value={fmtInt(p.available_stock)} />
          <Stat label="Dias s/ venda" value={fmtInt(p.days_without_sale)} />
          <Stat label="Valor estoque" value={fmtBRL(p.estimated_stock_value)} />
        </MetricGroup>
        <MetricGroup title="Performance comercial">
          <Stat label="Visitas" value={fmtInt(p.total_visits)} />
          <Stat label="Vendas" value={fmtInt(p.total_sales_count)} />
          <Stat label="Receita" value={fmtBRL(p.total_gross_revenue)} />
        </MetricGroup>
        <MetricGroup title="Ads">
          <Stat label="Investimento" value={fmtBRL(p.total_ads_investment)} />
          <Stat label="Receita Ads" value={fmtBRL(p.total_ads_revenue)} />
          <Stat label="ROAS" value={<span className={roasTone}>{roas > 0 ? `${fmtNum(roas, 2)}x` : "—"}</span>} />
          <Stat label="Tarefas" value={<span className={Number(p.open_tasks ?? 0) > 0 ? "text-amber-700" : "text-slate-500"}>{tasksLabel(Number(p.open_tasks ?? 0))}</span>} />
        </MetricGroup>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5">
        <div className="text-[11px] text-slate-400">Visão consolidada por SKU</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-slate-600 hover:text-slate-900">Ver detalhes</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-slate-600 hover:text-slate-900">Ver anúncios</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-slate-600 hover:text-slate-900">Ver histórico</Button>
        </div>
      </div>
    </div>
  );
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "critical", label: "Críticos" },
  { key: "attention", label: "Em atenção" },
  { key: "no_sales", label: "Sem venda" },
  { key: "no_visits", label: "Sem visita" },
  { key: "high_stock", label: "Estoque alto" },
  { key: "low_stock", label: "Estoque baixo" },
  { key: "bad_ads", label: "Ads ruim" },
  { key: "opportunity", label: "Oportunidade" },
];

function matchFilter(p: Product, f: FilterKey): boolean {
  const status = p.product_health_status ?? "normal";
  const visits = Number(p.total_visits ?? 0);
  const sales = Number(p.total_sales_count ?? 0);
  const stock = Number(p.total_stock ?? 0);
  const adsInv = Number(p.total_ads_investment ?? 0);
  const roas = Number(p.avg_roas ?? 0);
  switch (f) {
    case "all": return true;
    case "critical": return status === "critical" || status === "ads_wasting";
    case "attention": return status === "attention" || status === "visits_no_sales";
    case "no_sales": return sales === 0;
    case "no_visits": return visits === 0;
    case "high_stock": return stock >= 50;
    case "low_stock": return stock > 0 && stock < 5;
    case "bad_ads": return adsInv > 0 && roas > 0 && roas < 1.5;
    case "opportunity": return status === "growth_opportunity" || (sales > 0 && roas >= 3);
  }
}

function ProdutosUnificado() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

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
        if (!ctx) { navigate({ to: "/ecommerce/login" }); return; }
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
    return () => { cancelled = true; };
  }, [navigate]);

  const summary = useMemo(() => {
    const s = {
      total: products.length,
      withSales: 0,
      noSales: 0,
      noVisits: 0,
      stock: 0,
      stockValue: 0,
      openTasks: 0,
    };
    for (const p of products) {
      const sales = Number(p.total_sales_count ?? 0);
      const visits = Number(p.total_visits ?? 0);
      if (sales > 0) s.withSales++; else s.noSales++;
      if (visits === 0) s.noVisits++;
      s.stock += Number(p.total_stock ?? 0);
      s.stockValue += Number(p.estimated_stock_value ?? 0);
      s.openTasks += Number(p.open_tasks ?? 0);
    }
    return s;
  }, [products]);

  const counts = useMemo(() => {
    const m = {} as Record<FilterKey, number>;
    for (const f of FILTERS) m[f.key] = 0;
    for (const p of products) {
      for (const f of FILTERS) if (matchFilter(p, f.key)) m[f.key]++;
    }
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const weight: Record<string, number> = {
      critical: 0, ads_wasting: 1, attention: 2, visits_no_sales: 3,
      no_traffic: 4, growth_opportunity: 5, normal: 6,
    };
    return [...products]
      .filter((p) => matchFilter(p, filter))
      .filter((p) => {
        if (!q) return true;
        const mkts = toMarketplacesList(p.marketplaces).join(" ").toLowerCase();
        const accs = toList(p.accounts).join(" ").toLowerCase();
        return (
          (p.product_name ?? "").toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q) ||
          mkts.includes(q) ||
          accs.includes(q)
        );
      })
      .sort(
        (a, b) =>
          (weight[a.product_health_status ?? "normal"] ?? 9) -
          (weight[b.product_health_status ?? "normal"] ?? 9),
      );
  }, [products, filter, search]);

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
              AC360 · E-commerce Intelligence
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Produto Unificado
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Central de análise de produtos: estoque, vendas, visitas, Ads e ações recomendadas.
            </p>
          </div>
        </div>

        {/* Summary cards */}
        {!loading && !error && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            <SummaryCard label="Total" value={fmtInt(summary.total)} accent="bg-slate-300" />
            <SummaryCard label="Com venda" value={fmtInt(summary.withSales)} accent="bg-emerald-400" />
            <SummaryCard label="Sem venda" value={fmtInt(summary.noSales)} accent="bg-rose-400" />
            <SummaryCard label="Sem visita" value={fmtInt(summary.noVisits)} accent="bg-sky-400" />
            <SummaryCard label="Estoque total" value={fmtInt(summary.stock)} accent="bg-indigo-400" />
            <SummaryCard label="Valor estoque" value={fmtBRL(summary.stockValue)} accent="bg-amber-400" />
            <SummaryCard label="Tarefas abertas" value={fmtInt(summary.openTasks)} accent="bg-violet-400" />
          </div>
        ) : null}

        {/* Filters + search */}
        {!loading && !error && products.length > 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                {FILTERS.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium ring-1 ring-inset transition-colors ${
                        active
                          ? "bg-slate-900 text-white ring-slate-900"
                          : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {f.label}
                      <span
                        className={`tabular-nums text-[10.5px] ${
                          active ? "text-white/70" : "text-slate-400"
                        }`}
                      >
                        {fmtInt(counts[f.key])}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="lg:w-72">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, SKU, marketplace ou conta…"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            {(filter !== "all" || search) && (
              <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11.5px] text-slate-500">
                <span>
                  Mostrando <span className="font-semibold tabular-nums text-slate-700">{fmtInt(filtered.length)}</span> de {fmtInt(products.length)} produtos
                </span>
                <button
                  onClick={() => { setFilter("all"); setSearch(""); }}
                  className="text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}
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

        {!loading && !error && products.length > 0 && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Nenhum produto corresponde ao filtro selecionado.
          </div>
        )}

        {/* Product list */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((p, i) => (
              <ProductRow key={(p.sku ?? "") + i} p={p} />
            ))}
          </div>
        )}
      </div>
    </EcommerceLayout>
  );
}

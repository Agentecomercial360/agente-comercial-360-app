import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/produtos-travados")({
  component: ProdutosTravados,
  head: () => ({
    meta: [{ title: "Produtos Travados | Agente Comercial 360" }],
  }),
});

type Stuck = {
  sku?: string | null;
  product_name?: string | null;
  account_name?: string | null;
  marketplace?: string | null;
  problem_label?: string | null;
  priority_level?: string | null;
  visits?: number | null;
  sales_count?: number | null;
  total_stock?: number | null;
  days_without_sale?: number | null;
  ads_investment?: number | null;
  ads_revenue?: number | null;
  roas?: number | null;
  task_title?: string | null;
  insight_title?: string | null;
  recommended_action?: string | null;
  metric_status?: string | null;
  stock_status?: string | null;
  ads_status?: string | null;
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Crítico",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const MARKETPLACE_LABEL: Record<string, string> = {
  mercado_livre: "Mercado Livre",
  mercadolivre: "Mercado Livre",
  shopee: "Shopee",
  amazon: "Amazon",
  bling: "Bling",
  loja_propria: "Loja própria",
  outro: "Outro",
};

const formatMarketplace = (m: string | null | undefined) => {
  if (!m) return "—";
  const k = m.toLowerCase().trim();
  return MARKETPLACE_LABEL[k] ?? m;
};

const STATUS_LABEL: Record<string, string> = {
  low_conversion: "Baixa conversão",
  visits_no_sales: "Visitas sem venda",
  no_visits: "Sem visitas",
  no_sales: "Sem venda",
  excess_stock: "Excesso de estoque",
  stopped: "Estoque parado",
  risk_of_stockout: "Risco de ruptura",
  low_stock: "Estoque baixo",
  high_tacos: "TACoS alto",
  high_acos: "ACOS alto",
  spending_no_sales: "Ads sem venda",
  reduce_budget: "Reduzir orçamento",
  scale: "Escalar",
  growth: "Crescimento",
  needs_review: "Precisa revisão",
  normal: "Normal",
  pause: "Pausar",
  ok: "Normal",
  healthy: "Normal",
};

const formatStatus = (s: string | null | undefined) => {
  if (!s) return "";
  const k = s.toLowerCase().trim();
  if (STATUS_LABEL[k]) return STATUS_LABEL[k];
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};


const fmtBRL = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number(v ?? 0));
const fmtInt = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(v ?? 0));
const fmtNum = (v: number | null | undefined, d = 2) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(v ?? 0));
const pad2 = (n: number) => n.toString().padStart(2, "0");

type Tone = "critical" | "attention" | "neutral" | "muted";

function classifyTone(p: Stuck): Tone {
  const prio = (p.priority_level ?? "").toLowerCase();
  if (prio === "critical") return "critical";
  if (prio === "high") return "attention";
  if (prio === "medium") return "neutral";
  return "muted";
}

const toneMap: Record<
  Tone,
  {
    surface: string;
    bar: string;
    badge: string;
    accentText: string;
    aiSurface: string;
    aiIcon: string;
    aiTitle: string;
    chip: string;
    metricPanel: string;
  }
> = {
  critical: {
    surface: "bg-[linear-gradient(180deg,#FFFDFD_0%,#FCF6F7_100%)] border-[#EFD9DE]",
    bar: "bg-[#C8324C]",
    badge: "bg-white text-[#C8324C] ring-1 ring-[#EFD9DE]",
    accentText: "text-[#C8324C]",
    aiSurface: "bg-white border-[#EFD9DE]",
    aiIcon: "bg-[#FBEAEE] text-[#C8324C] ring-1 ring-[#EFD9DE]",
    aiTitle: "text-[#9F1F35]",
    chip: "bg-white text-slate-600 ring-1 ring-[#EFD9DE]",
    metricPanel: "border-slate-200/70 bg-white",
  },
  attention: {
    surface: "bg-[linear-gradient(180deg,#FEFDFB_0%,#FBF7F0_100%)] border-[#EADDC2]",
    bar: "bg-[#B45309]",
    badge: "bg-white text-[#92400E] ring-1 ring-[#EADDC2]",
    accentText: "text-[#92400E]",
    aiSurface: "bg-white border-[#EADDC2]",
    aiIcon: "bg-[#F7ECD4] text-[#92400E] ring-1 ring-[#EADDC2]",
    aiTitle: "text-[#7C2D12]",
    chip: "bg-white text-slate-600 ring-1 ring-[#EADDC2]",
    metricPanel: "border-slate-200/70 bg-white",
  },
  neutral: {
    surface: "bg-[linear-gradient(180deg,#FCFDFE_0%,#F6F8FC_100%)] border-[#DCE3ED]",
    bar: "bg-[#2563EB]",
    badge: "bg-white text-[#1D4ED8] ring-1 ring-[#DCE3ED]",
    accentText: "text-[#1D4ED8]",
    aiSurface: "bg-white border-[#DCE3ED]",
    aiIcon: "bg-[#E7EEFA] text-[#1D4ED8] ring-1 ring-[#DCE3ED]",
    aiTitle: "text-[#1E3A8A]",
    chip: "bg-white text-slate-600 ring-1 ring-[#DCE3ED]",
    metricPanel: "border-slate-200/70 bg-white",
  },
  muted: {
    surface: "bg-[linear-gradient(180deg,#FCFCFD_0%,#F4F5F8_100%)] border-slate-200",
    bar: "bg-slate-400",
    badge: "bg-white text-slate-600 ring-1 ring-slate-200",
    accentText: "text-slate-700",
    aiSurface: "bg-white border-slate-200",
    aiIcon: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    aiTitle: "text-slate-700",
    chip: "bg-white text-slate-600 ring-1 ring-slate-200",
    metricPanel: "border-slate-200/70 bg-white/80",
  },
};

function ProdutosTravados() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Stuck[]>([]);

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

        const { data, error: sErr } = await supabase
          .from("vw_ecommerce_products_stuck")
          .select("*")
          .eq("company_id", ctx.company_id);

        if (sErr) throw sErr;
        if (cancelled) return;
        setItems((data as Stuck[]) ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Erro ao carregar produtos travados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const buckets = useMemo(() => {
    const has = (s: string | null | undefined, kw: string) =>
      (s ?? "").toLowerCase().includes(kw);
    let critical = 0;
    let high = 0;
    let noVisits = 0;
    let visitsNoSales = 0;
    let lowConversion = 0;
    let stockStuck = 0;
    for (const p of items) {
      const prio = (p.priority_level ?? "").toLowerCase();
      if (prio === "critical") critical++;
      if (prio === "high") high++;
      const v = Number(p.visits ?? 0);
      const s = Number(p.sales_count ?? 0);
      if (v === 0) noVisits++;
      else if (s === 0) visitsNoSales++;
      if (
        has(p.problem_label, "conversão") ||
        has(p.problem_label, "conversao") ||
        has(p.problem_label, "conversion")
      )
        lowConversion++;
      if (
        has(p.problem_label, "estoque") ||
        has(p.problem_label, "stock") ||
        Number(p.days_without_sale ?? 0) >= 30
      )
        stockStuck++;
    }
    return { critical, high, noVisits, visitsNoSales, lowConversion, stockStuck };
  }, [items]);

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header + Resumo da IA */}
        <header className="flex flex-col items-start justify-between gap-6 lg:flex-row">
          <div className="space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
              Diagnóstico de Produtos
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Produtos Travados
            </h1>
            <p className="max-w-xl text-base text-slate-500">
              Diagnóstico dos produtos com baixa tração, baixo giro ou perda de conversão.
            </p>
          </div>

          {!loading && !error && items.length > 0 && (
            <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1220] via-[#0F1B33] to-[#13294B] p-6 text-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)] ring-1 ring-white/5 lg:w-[460px]">
              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300/80">
                    Resumo da IA
                  </h3>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-slate-300 ring-1 ring-white/10">
                    Tempo real
                  </span>
                </div>
                <div className="grid grid-cols-4 divide-x divide-white/10">
                  <div className="pr-3">
                    <p className="text-[26px] font-semibold leading-none tabular-nums text-rose-300">{pad2(buckets.critical)}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">Críticos</p>
                  </div>
                  <div className="px-3">
                    <p className="text-[26px] font-semibold leading-none tabular-nums text-amber-300">{pad2(buckets.high)}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">Alta</p>
                  </div>
                  <div className="px-3">
                    <p className="text-[26px] font-semibold leading-none tabular-nums text-sky-300">{pad2(buckets.noVisits)}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">Sem visita</p>
                  </div>
                  <div className="pl-3">
                    <p className="text-[26px] font-semibold leading-none tabular-nums text-violet-300">{pad2(buckets.visitsNoSales)}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">Sem venda</p>
                </div>
                <p className="mt-5 border-t border-white/10 pt-4 text-[12.5px] leading-relaxed text-slate-300">
                  {(() => {
                    const parts: string[] = [];
                    const word = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;
                    if (buckets.critical) parts.push(word(buckets.critical, "produto crítico", "produtos críticos"));
                    if (buckets.high) parts.push(word(buckets.high, "de alta prioridade", "de alta prioridade"));
                    if (buckets.noVisits) parts.push(word(buckets.noVisits, "sem visita", "sem visitas"));
                    if (buckets.visitsNoSales) parts.push(word(buckets.visitsNoSales, "com visitas sem venda", "com visitas sem venda"));
                    if (!parts.length) return "Nenhum sinal crítico detectado no momento.";
                    const text = parts.length === 1 ? parts[0] : parts.slice(0, -1).join(", ") + " e " + parts.slice(-1);
                    return text.charAt(0).toUpperCase() + text.slice(1) + ".";
                  })()}
                </p>
              </div>
              </div>
              <div className="pointer-events-none absolute -bottom-6 -right-6 opacity-[0.07]">
                <Sparkles className="h-36 w-36" strokeWidth={1.25} />
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Carregando produtos travados...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            Não foi possível carregar os produtos travados agora. Tente novamente em instantes.
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Nenhum produto travado encontrado para esta empresa.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            {/* Cards de resumo */}
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              <SummaryCard label="Críticos" value={buckets.critical} accent="#C8324C" />
              <SummaryCard label="Alta prioridade" value={buckets.high} accent="#B45309" />
              <SummaryCard label="Sem visitas" value={buckets.noVisits} accent="#1D4ED8" />
              <SummaryCard label="Visitas sem venda" value={buckets.visitsNoSales} accent="#7C3AED" />
              <SummaryCard label="Baixa conversão" value={buckets.lowConversion} accent="#0F766E" />
              <SummaryCard label="Estoque parado" value={buckets.stockStuck} accent="#475569" />
            </section>

            {/* Lista */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  Diagnóstico Detalhado
                </h3>
                <span className="text-xs text-slate-500">
                  {items.length} {items.length === 1 ? "produto" : "produtos"}
                </span>
              </div>

              <div className="space-y-4">
                {items.map((p, i) => (
                  <StuckCard key={i} p={p} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </EcommerceLayout>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span
        className="absolute left-0 top-0 h-full w-[2px]"
        style={{ backgroundColor: accent }}
      />
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p
        className="mt-2 text-2xl font-semibold leading-none tabular-nums"
        style={{ color: accent }}
      >
        {pad2(value)}
      </p>
    </div>
  );
}

function deriveProblemBadges(p: Stuck): string[] {
  const out: string[] = [];
  const v = Number(p.visits ?? 0);
  const s = Number(p.sales_count ?? 0);
  const stock = Number(p.total_stock ?? 0);
  const inv = Number(p.ads_investment ?? 0);
  const rev = Number(p.ads_revenue ?? 0);
  const days = Number(p.days_without_sale ?? 0);

  if (v === 0) out.push("Sem visitas");
  else if (s === 0) out.push("Visitas sem venda");
  if (v > 30 && s > 0 && s / v < 0.02) out.push("Baixa conversão");
  if (days >= 30) out.push("Estoque parado");
  if (stock > 200) out.push("Excesso de estoque");
  if (inv > 0 && rev === 0) out.push("Ads gastando sem venda");

  return Array.from(new Set(out));
}

function diagnoseSignal(p: Stuck): string {
  const v = Number(p.visits ?? 0);
  const s = Number(p.sales_count ?? 0);
  const days = Number(p.days_without_sale ?? 0);
  const inv = Number(p.ads_investment ?? 0);
  const rev = Number(p.ads_revenue ?? 0);
  if (inv > 0 && rev === 0) return "Investimento em Ads sem retorno de vendas.";
  if (v === 0) return "Produto sem visitas no período analisado.";
  if (v > 0 && s === 0) return "Produto recebendo visitas, mas sem conversão em vendas.";
  if (v > 30 && s > 0 && s / v < 0.02) return "Tráfego presente, porém com conversão abaixo do esperado.";
  if (days >= 30) return `Estoque parado há ${days} dias sem nova venda.`;
  return p.problem_label ?? "Sinal de baixa performance detectado.";
}

function StuckCard({ p }: { p: Stuck }) {
  const prio = (p.priority_level ?? "low").toLowerCase();
  const tone = classifyTone(p);
  const t = toneMap[tone];
  const badges = deriveProblemBadges(p);
  const statusBadges = [p.metric_status, p.stock_status, p.ads_status]
    .filter(Boolean)
    .map((s) => formatStatus(s));

  return (
    <div
      className={`flex overflow-hidden rounded-xl border ${t.surface} shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_22px_-18px_rgba(15,23,42,0.16)]`}
    >
      <div className={`w-[3px] shrink-0 ${t.bar}`} />
      <div className="flex-1 px-5 py-4">
        {/* Header */}
        <div className="mb-3 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[15px] font-semibold tracking-tight text-slate-900">
              {p.product_name ?? "Produto sem nome"}
            </h4>
            <span
              className={`inline-flex items-center rounded px-1.5 py-[2px] text-[9.5px] font-semibold uppercase tracking-[0.08em] ${t.badge}`}
            >
              {PRIORITY_LABEL[prio] ?? prio}
            </span>
          </div>
          <p className="flex flex-wrap items-center gap-x-1.5 text-[12px] text-slate-500">
            {p.sku && <span className="tabular-nums">SKU {p.sku}</span>}
            {p.sku && (p.account_name || p.marketplace) && <span className="text-slate-300">·</span>}
            {p.account_name && <span className="text-slate-600">{p.account_name}</span>}
            {p.marketplace && <span className="text-slate-400">· {formatMarketplace(p.marketplace)}</span>}
          </p>
          {(p.problem_label || badges.length > 0 || statusBadges.length > 0) && (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {p.problem_label && (
                <span className={`inline-flex items-center rounded px-1.5 py-[2px] text-[9.5px] font-semibold uppercase tracking-[0.08em] ${t.badge}`}>
                  {formatStatus(p.problem_label)}
                </span>
              )}
              {badges.map((b) => (
                <span key={b} className={`inline-flex items-center rounded px-1.5 py-[2px] text-[9.5px] font-medium uppercase tracking-[0.06em] ${t.chip}`}>
                  {b}
                </span>
              ))}
              {statusBadges.map((b) => (
                <span key={`s-${b}`} className={`inline-flex items-center rounded px-1.5 py-[2px] text-[9.5px] font-medium uppercase tracking-[0.06em] ${t.chip}`}>
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className={`mb-3 grid grid-cols-2 gap-x-5 gap-y-2.5 rounded-lg border px-4 py-2.5 sm:grid-cols-4 lg:grid-cols-8 ${t.metricPanel}`}>
          <Metric label="Visitas" value={fmtInt(p.visits)} />
          <Metric label="Vendas" value={fmtInt(p.sales_count)} />
          <Metric label="Estoque" value={fmtInt(p.total_stock)} />
          <Metric label="Dias s/ venda" value={fmtInt(p.days_without_sale)} />
          <Metric label="Inv. Ads" value={fmtBRL(p.ads_investment)} />
          <Metric label="Rec. Ads" value={fmtBRL(p.ads_revenue)} />
          <Metric label="ROAS" value={fmtNum(p.roas, 2)} className={t.accentText} />
          <Metric label="Marketplace" value={formatMarketplace(p.marketplace)} />
        </div>

        {/* Diagnóstico + Próxima ação */}
        <div className="grid gap-2.5 md:grid-cols-5">
          <div className={`md:col-span-2 rounded-lg border ${t.aiSurface} px-3.5 py-2.5`}>
            <p className={`text-[9.5px] font-semibold uppercase tracking-[0.14em] ${t.aiTitle}`}>
              Sinal detectado
            </p>
            <p className="mt-1 text-[12.5px] leading-snug text-slate-700">
              {diagnoseSignal(p)}
            </p>
          </div>

          {(p.recommended_action || p.task_title || p.insight_title) && (
            <div className={`md:col-span-3 flex items-start gap-2.5 rounded-lg border ${t.aiSurface} px-3.5 py-2.5`}>
              <div className={`mt-0.5 shrink-0 rounded p-1 ${t.aiIcon}`}>
                <Zap className="h-3 w-3" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className={`text-[9.5px] font-semibold uppercase tracking-[0.14em] ${t.aiTitle}`}>
                  Próxima ação sugerida
                </p>
                <p className="text-[12.5px] font-medium leading-snug text-slate-800">
                  {p.task_title ?? p.recommended_action ?? p.insight_title}
                </p>
                {p.recommended_action && p.task_title && p.recommended_action !== p.task_title && (
                  <p className="text-[11.5px] leading-snug text-slate-500">{p.recommended_action}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="min-w-0 space-y-0.5">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`truncate text-[13px] font-semibold tabular-nums text-slate-800 ${className ?? ""}`}>{value}</p>
    </div>
  );
}

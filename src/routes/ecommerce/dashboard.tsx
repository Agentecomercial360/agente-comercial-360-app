import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/dashboard")({
  component: EcommerceDashboard,
  head: () => ({
    meta: [{ title: "Visão Geral E-commerce | Agente Comercial 360" }],
  }),
});

type Summary = {
  company_id?: string | null;
  total_gross_revenue?: number | null;
  total_sales_count?: number | null;
  total_accounts?: number | null;
  total_products?: number | null;
  products_low_conversion?: number | null;
  products_visits_no_sales?: number | null;
  products_no_visits?: number | null;
  total_ads_investment?: number | null;
  avg_roas?: number | null;
  critical_insights?: number | null;
  critical_tasks?: number | null;
  pending_tasks?: number | null;
  open_insights?: number | null;
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

type Tone = "neutral" | "info" | "success" | "attention" | "critical" | "ads";

const TONE: Record<Tone, { accent: string; dot: string; value: string }> = {
  neutral: { accent: "bg-slate-300", dot: "bg-slate-400", value: "text-slate-900" },
  info: { accent: "bg-sky-500", dot: "bg-sky-500", value: "text-slate-900" },
  success: { accent: "bg-emerald-500", dot: "bg-emerald-500", value: "text-slate-900" },
  attention: { accent: "bg-amber-500", dot: "bg-amber-500", value: "text-slate-900" },
  critical: { accent: "bg-rose-500", dot: "bg-rose-500", value: "text-rose-700" },
  ads: { accent: "bg-violet-500", dot: "bg-violet-500", value: "text-slate-900" },
};

type PeriodKey = "7d" | "15d" | "30d" | "mtd";
const PERIOD_LABEL: Record<PeriodKey, string> = {
  "7d": "Últimos 7 dias",
  "15d": "Últimos 15 dias",
  "30d": "Últimos 30 dias",
  mtd: "Este mês",
};

function PeriodTabs({
  value,
  onChange,
}: {
  value: PeriodKey;
  onChange: (p: PeriodKey) => void;
}) {
  const opts: { k: PeriodKey; label: string }[] = [
    { k: "7d", label: "7 dias" },
    { k: "15d", label: "15 dias" },
    { k: "30d", label: "30 dias" },
    { k: "mtd", label: "Este mês" },
  ];
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200/80 bg-white p-0.5 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
      {opts.map((o) => {
        const active = o.k === value;
        return (
          <button
            key={o.k}
            type="button"
            onClick={() => onChange(o.k)}
            className={`rounded-md px-2.5 py-1 text-[11.5px] font-medium tabular-nums transition-colors ${
              active
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

type Trend = { dir: "up" | "down" | "flat"; pct?: number; positiveIsGood?: boolean };

function TrendPill({ trend }: { trend?: Trend | null }) {
  if (!trend) {
    return (
      <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-400">
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        Histórico em formação
      </span>
    );
  }
  const positiveIsGood = trend.positiveIsGood ?? true;
  const isGood =
    trend.dir === "flat"
      ? null
      : (trend.dir === "up") === positiveIsGood;
  const color =
    isGood === null
      ? "text-slate-500 bg-slate-50 ring-slate-200"
      : isGood
        ? "text-emerald-700 bg-emerald-50 ring-emerald-100"
        : "text-rose-700 bg-rose-50 ring-rose-100";
  const arrow = trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "■";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums ring-1 ring-inset ${color}`}
    >
      <span className="text-[8px] leading-none">{arrow}</span>
      {trend.pct !== undefined ? `${trend.pct.toFixed(1)}%` : "—"}
    </span>
  );
}

function KpiCard({
  label,
  value,
  context,
  tone = "neutral",
  emphasis = false,
  trend,
  to,
  search,
}: {
  label: string;
  value: React.ReactNode;
  context?: string;
  tone?: Tone;
  emphasis?: boolean;
  trend?: Trend | null;
  to?: string;
  search?: Record<string, string>;
}) {
  const t = TONE[tone];
  const inner = (
    <>
      <span className={`absolute left-0 top-0 h-full w-[2px] ${t.accent}`} aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
          {label}
        </div>
        <TrendPill trend={trend} />
      </div>
      <div
        className={`mt-2 ${emphasis ? "text-[24px]" : "text-[20px]"} font-semibold leading-none tabular-nums tracking-tight ${t.value}`}
      >
        {value}
      </div>
      {context && (
        <div className="mt-2 text-[11.5px] leading-snug text-slate-500">{context}</div>
      )}
      {to && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10.5px] font-medium text-slate-400 transition-colors group-hover:text-slate-700">
          <span>Investigar</span>
          <span aria-hidden>→</span>
        </div>
      )}
    </>
  );

  const baseCls =
    "group relative block overflow-hidden rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-all";

  if (to) {
    return (
      <Link
        to={to as any}
        search={search as any}
        className={`${baseCls} cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.22)]`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={`${baseCls} hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.18)]`}>{inner}</div>
  );
}

function ReadingCard({
  title,
  tone,
  text,
}: {
  title: string;
  tone: Tone;
  text: string;
}) {
  const t = TONE[tone];
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <span className={`absolute left-0 top-0 h-full w-[3px] ${t.accent}`} aria-hidden />
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
          {title}
        </div>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}

function Shortcut({ to, label, hint }: { to: string; label: string; hint: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.18)]"
    >
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-slate-900">{label}</div>
        <div className="mt-0.5 text-[11.5px] text-slate-500">{hint}</div>
      </div>
      <span className="ml-3 text-[12px] text-slate-400 transition-colors group-hover:text-slate-700">
        →
      </span>
    </Link>
  );
}

type EvoTab = "rev_inv" | "sales_conv" | "clicks_imp" | "roas_acos";

const EVO_TABS: { k: EvoTab; label: string }[] = [
  { k: "rev_inv", label: "Receita x Investimento" },
  { k: "sales_conv", label: "Vendas x Conversão" },
  { k: "clicks_imp", label: "Cliques x Impressões" },
  { k: "roas_acos", label: "ROAS x ACOS" },
];

function PlaceholderChart({ variant }: { variant: EvoTab }) {
  // Two decorative curves with low opacity. Deterministic per-tab to avoid layout shifts.
  const seeds: Record<EvoTab, [number[], number[]]> = {
    rev_inv: [
      [38, 42, 36, 48, 52, 47, 58, 62, 55, 66, 71, 78],
      [22, 25, 24, 28, 27, 30, 32, 31, 34, 33, 36, 38],
    ],
    sales_conv: [
      [30, 34, 32, 40, 44, 42, 50, 48, 56, 58, 62, 68],
      [18, 20, 22, 21, 24, 26, 25, 28, 27, 30, 31, 32],
    ],
    clicks_imp: [
      [40, 46, 50, 48, 55, 60, 58, 64, 68, 72, 70, 76],
      [25, 28, 27, 30, 32, 31, 34, 36, 35, 38, 40, 42],
    ],
    roas_acos: [
      [50, 48, 54, 52, 58, 60, 56, 62, 64, 60, 66, 70],
      [38, 40, 36, 42, 40, 44, 42, 46, 44, 48, 46, 50],
    ],
  };
  const [a, b] = seeds[variant];
  const W = 800;
  const H = 220;
  const PAD = 24;
  const toPath = (arr: number[]) => {
    const max = 90;
    const stepX = (W - PAD * 2) / (arr.length - 1);
    return arr
      .map((v, i) => {
        const x = PAD + i * stepX;
        const y = H - PAD - (v / max) * (H - PAD * 2);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };
  const grid = Array.from({ length: 4 }, (_, i) => PAD + ((H - PAD * 2) / 4) * (i + 1));
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-[220px] w-full"
      role="img"
      aria-label="Gráfico placeholder de evolução — histórico em formação"
    >
      <defs>
        <linearGradient id="evoBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map((y, i) => (
        <line
          key={i}
          x1={PAD}
          x2={W - PAD}
          y1={y}
          y2={y}
          stroke="#e2e8f0"
          strokeDasharray="3 4"
          strokeWidth={1}
        />
      ))}
      <path
        d={`${toPath(a)} L${W - PAD},${H - PAD} L${PAD},${H - PAD} Z`}
        fill="url(#evoBlue)"
        opacity={0.6}
      />
      <path
        d={toPath(a)}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
      />
      <path
        d={toPath(b)}
        fill="none"
        stroke="#7c3aed"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 5"
        opacity={0.3}
      />
    </svg>
  );
}

function EvolutionSection({
  summary,
  period,
}: {
  summary: Summary;
  period: PeriodKey;
}) {
  const [tab, setTab] = useState<EvoTab>("rev_inv");
  const series = EVO_TAB_SERIES[tab];

  const adsRevenue =
    Number(summary.total_ads_investment ?? 0) > 0 &&
    Number(summary.avg_roas ?? 0) > 0
      ? Number(summary.total_ads_investment) * Number(summary.avg_roas)
      : 0;

  const readingText = `Com os dados atuais, a operação registra ${fmtBRL(
    summary.total_gross_revenue,
  )} em faturamento, ${fmtBRL(
    summary.total_ads_investment,
  )} em investimento Ads, ${fmtInt(summary.total_sales_count)} ${
    Number(summary.total_sales_count ?? 0) === 1 ? "venda" : "vendas"
  } e ROAS médio de ${
    Number(summary.avg_roas ?? 0) > 0 ? `${fmtNum(summary.avg_roas, 2)}x` : "—"
  }. O histórico comparativo será exibido conforme novas sincronizações forem registradas.`;

  return (
    <section className="space-y-2.5">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Análise temporal
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] lg:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
              Evolução da operação
            </h2>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              Acompanhe a relação entre receita, investimento, vendas e eficiência dos
              anúncios.
            </p>
          </div>
          <span className="inline-flex h-fit items-center gap-1.5 self-start rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Aguardando histórico
          </span>
        </div>

        {/* Tabs */}
        <div className="mt-4 -mx-1 flex flex-wrap items-center gap-1 border-b border-slate-100 pb-0">
          {EVO_TABS.map((t) => {
            const active = t.k === tab;
            return (
              <button
                key={t.k}
                type="button"
                onClick={() => setTab(t.k)}
                className={`relative px-3 py-2 text-[12px] font-medium transition-colors ${
                  active
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
                <span
                  className={`absolute inset-x-2 -bottom-px h-[2px] rounded-full transition-all ${
                    active ? "bg-slate-900" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Chart + legend */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
          <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50/60 to-white p-3">
            <PlaceholderChart variant={tab} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-lg border border-slate-200 bg-white/90 px-3.5 py-2 text-center shadow-sm backdrop-blur-sm">
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Histórico em formação
                </div>
                <div className="mt-0.5 text-[11.5px] text-slate-500">
                  Os gráficos serão preenchidos conforme novas sincronizações forem
                  registradas.
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[2px] w-3.5 rounded-full bg-[#3b82f6]" />
                {series.aLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[2px] w-3.5 rounded-full bg-[#7c3aed]" />
                {series.bLabel}
              </span>
              <span className="ml-auto text-[10.5px] text-slate-400">
                Período: {PERIOD_LABEL[period]}
              </span>
            </div>
          </div>

          {/* Leitura do período */}
          <aside className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              Leitura do período
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-slate-700">
              {readingText}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniStat label="Receita" value={fmtBRL(summary.total_gross_revenue)} />
              <MiniStat label="Investimento" value={fmtBRL(summary.total_ads_investment)} />
              <MiniStat label="Vendas" value={fmtInt(summary.total_sales_count)} />
              <MiniStat
                label="ROAS médio"
                value={
                  Number(summary.avg_roas ?? 0) > 0
                    ? `${fmtNum(summary.avg_roas, 2)}x`
                    : "—"
                }
              />
              {adsRevenue > 0 && (
                <MiniStat label="Receita Ads" value={fmtBRL(adsRevenue)} />
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

const EVO_TAB_SERIES: Record<EvoTab, { aLabel: string; bLabel: string }> = {
  rev_inv: { aLabel: "Receita", bLabel: "Investimento Ads" },
  sales_conv: { aLabel: "Vendas", bLabel: "Conversão (%)" },
  clicks_imp: { aLabel: "Cliques", bLabel: "Impressões" },
  roas_acos: { aLabel: "ROAS", bLabel: "ACOS" },
};

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
      <div className="text-[9.5px] font-medium uppercase tracking-[0.08em] text-slate-400">
        {label}
      </div>
      <div className="mt-0.5 text-[13px] font-semibold tabular-nums text-slate-900">
        {value}
      </div>
    </div>
  );
}

function EcommerceDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [period, setPeriod] = useState<PeriodKey>("30d");

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
          .from("vw_ecommerce_dashboard_summary")
          .select("*")
          .eq("company_id", ctx.company_id)
          .maybeSingle();

        if (sErr) throw sErr;
        if (cancelled) return;
        setSummary(data ?? null);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Erro ao carregar dados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const derived = useMemo(() => {
    const s = summary ?? {};
    const noVisits = Number(s.products_no_visits ?? 0);
    const visitsNoSales = Number(s.products_visits_no_sales ?? 0);
    const lowConv = Number(s.products_low_conversion ?? 0);
    const stuck = noVisits + visitsNoSales + lowConv;
    const criticalAlerts =
      Number(s.critical_insights ?? 0) + Number(s.critical_tasks ?? 0);
    return { noVisits, visitsNoSales, lowConv, stuck, criticalAlerts };
  }, [summary]);

  const wordTarefa = (n: number) =>
    n === 1 ? "tarefa pendente" : "tarefas pendentes";
  const wordInsight = (n: number) =>
    n === 1 ? "insight crítico" : "insights críticos";
  const wordProduto = (n: number) => (n === 1 ? "produto" : "produtos");

  const aiText = summary
    ? `Existem ${fmtInt(derived.noVisits)} ${wordProduto(derived.noVisits)} sem visita, ${fmtInt(
        derived.visitsNoSales,
      )} ${wordProduto(derived.visitsNoSales)} com visitas sem venda e ${fmtInt(
        derived.lowConv,
      )} ${wordProduto(derived.lowConv)} com baixa conversão. Há ${fmtInt(
        Number(summary.critical_insights ?? 0),
      )} ${wordInsight(Number(summary.critical_insights ?? 0))} e ${fmtInt(
        Number(summary.pending_tasks ?? 0),
      )} ${wordTarefa(Number(summary.pending_tasks ?? 0))} para análise.`
    : null;

  const healthyText = summary
    ? `Operação com ${fmtInt(summary.total_accounts)} ${
        Number(summary.total_accounts ?? 0) === 1 ? "conta conectada" : "contas conectadas"
      } e ${fmtInt(summary.total_products)} ${wordProduto(
        Number(summary.total_products ?? 0),
      )} ativos. Faturamento acumulado de ${fmtBRL(summary.total_gross_revenue)}.`
    : "—";

  const attentionText = summary
    ? derived.stuck > 0 || Number(summary.pending_tasks ?? 0) > 0
      ? `${fmtInt(derived.stuck)} ${wordProduto(derived.stuck)} com sinais de baixa performance e ${fmtInt(
          Number(summary.pending_tasks ?? 0),
        )} ${wordTarefa(Number(summary.pending_tasks ?? 0))} aguardando ação.`
      : "Nenhum ponto crítico identificado no momento."
    : "—";

  const priorityText = summary
    ? derived.criticalAlerts > 0
      ? `Revisar ${fmtInt(derived.criticalAlerts)} ${
          derived.criticalAlerts === 1 ? "alerta crítico" : "alertas críticos"
        } e analisar produtos travados e campanhas com baixo retorno.`
      : "Acompanhar campanhas de Ads e produtos com menor conversão para sustentar o ritmo."
    : "—";

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Executive header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
              AC360 · E-commerce Intelligence
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Visão Geral do E-commerce
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Acompanhe a performance das contas, produtos, campanhas e prioridades em um só lugar.
            </p>
          </div>

          <div className="lg:max-w-md">
            <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
              <span className="absolute left-0 top-0 h-full w-[3px] bg-[#1e3a5f]" aria-hidden />
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1e3a5f]" />
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Resumo da IA
                </div>
              </div>
              {aiText ? (
                <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{aiText}</p>
              ) : (
                <div className="mt-3 space-y-1.5" aria-label="Carregando resumo">
                  <div className="h-2.5 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 w-11/12 animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading / Error / Empty */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Carregando dados da operação…
          </div>
        )}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            Não foi possível carregar os dados agora. Tente novamente em instantes.
          </div>
        )}
        {!loading && !error && !summary && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Nenhum dado encontrado para esta empresa.
          </div>
        )}

        {!loading && !error && summary && (
          <>
            {/* Métricas — header + filtro de período */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Métricas da operação
                  </div>
                  <div className="mt-0.5 text-[12px] text-slate-500">
                    Período: <span className="font-medium text-slate-700">{PERIOD_LABEL[period]}</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    Comparativo histórico em formação
                  </div>
                </div>
                <PeriodTabs value={period} onChange={setPeriod} />
              </div>

              {/* Indicadores executivos */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard
                  label="Faturamento total"
                  value={fmtBRL(summary.total_gross_revenue)}
                  context="Receita acumulada no período"
                  tone="success"
                  emphasis
                  trend={null}
                  to="/ecommerce/produtos"
                />
                <KpiCard
                  label="Vendas totais"
                  value={fmtInt(summary.total_sales_count)}
                  context="Pedidos e vendas registrados"
                  tone="info"
                  emphasis
                  trend={null}
                  to="/ecommerce/produtos"
                />
                <KpiCard
                  label="Contas conectadas"
                  value={fmtInt(summary.total_accounts)}
                  context="Marketplaces integrados ao AC360"
                  tone="neutral"
                  emphasis
                  trend={null}
                  to="/ecommerce/contas"
                />
                <KpiCard
                  label="Produtos ativos"
                  value={fmtInt(summary.total_products)}
                  context="Anúncios em operação"
                  tone="neutral"
                  emphasis
                  trend={null}
                  to="/ecommerce/produtos"
                />
              </div>

              {/* Performance de Ads */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                <KpiCard
                  label="Investimento Ads"
                  value={fmtBRL(summary.total_ads_investment)}
                  context="Valor investido em campanhas"
                  tone="ads"
                  trend={null}
                  to="/ecommerce/ads"
                />
                <KpiCard
                  label="Receita Ads"
                  value={
                    Number(summary.total_ads_investment ?? 0) > 0 &&
                    Number(summary.avg_roas ?? 0) > 0
                      ? fmtBRL(
                          Number(summary.total_ads_investment) *
                            Number(summary.avg_roas),
                        )
                      : "—"
                  }
                  context="Receita atribuída a campanhas"
                  tone="ads"
                  trend={null}
                  to="/ecommerce/ads"
                />
                <KpiCard
                  label="ROAS médio"
                  value={
                    Number(summary.avg_roas ?? 0) > 0
                      ? `${fmtNum(summary.avg_roas, 2)}x`
                      : "—"
                  }
                  context="Retorno médio sobre anúncios"
                  tone={Number(summary.avg_roas ?? 0) >= 1.5 ? "success" : "critical"}
                  trend={null}
                  to="/ecommerce/ads"
                />
              </div>

              {/* Indicadores de atenção */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <KpiCard
                  label="Produtos travados"
                  value={fmtInt(derived.stuck)}
                  context="Itens exigindo análise"
                  tone="critical"
                  trend={null}
                  to="/ecommerce/produtos-travados"
                />
                <KpiCard
                  label="Produtos sem venda"
                  value={fmtInt(summary.products_visits_no_sales)}
                  context="Recebem visitas, mas não convertem"
                  tone="attention"
                  trend={null}
                  to="/ecommerce/produtos-travados"
                  search={{ filter: "no_sales" }}
                />
                <KpiCard
                  label="Produtos sem visita"
                  value={fmtInt(summary.products_no_visits)}
                  context="Produtos sem tráfego no período"
                  tone="info"
                  trend={null}
                  to="/ecommerce/produtos-travados"
                  search={{ filter: "no_visits" }}
                />
                <KpiCard
                  label="Alertas críticos"
                  value={fmtInt(derived.criticalAlerts)}
                  context="Sinais que exigem ação imediata"
                  tone="critical"
                  trend={null}
                  to="/ecommerce/prioridades"
                  search={{ priority: "critical" }}
                />
                <KpiCard
                  label="Tarefas pendentes"
                  value={fmtInt(summary.pending_tasks)}
                  context="Ações aguardando execução"
                  tone="attention"
                  trend={null}
                  to="/ecommerce/tarefas"
                  search={{ status: "pending" }}
                />
                <KpiCard
                  label="Insights abertos"
                  value={fmtInt(summary.open_insights)}
                  context="Recomendações da IA para revisão"
                  tone="info"
                  trend={null}
                  to="/ecommerce/consultor-ia"
                />
              </div>
            </section>

            {/* Evolução da operação */}
            <EvolutionSection summary={summary} period={period} />



            {/* Executive reading */}
            <section className="space-y-2.5">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Leitura executiva
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <ReadingCard title="O que está saudável" tone="success" text={healthyText} />
                <ReadingCard title="O que exige atenção" tone="attention" text={attentionText} />
                <ReadingCard title="Próxima prioridade" tone="critical" text={priorityText} />
              </div>
            </section>

            {/* Strategic shortcuts */}
            <section className="space-y-2.5">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Atalhos estratégicos
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Shortcut
                  to="/ecommerce/produtos-travados"
                  label="Produtos travados"
                  hint="Diagnóstico de SKUs sem performance"
                />
                <Shortcut
                  to="/ecommerce/ads"
                  label="Ads inteligente"
                  hint="Performance de campanhas e ROAS"
                />
                <Shortcut
                  to="/ecommerce/prioridades"
                  label="Prioridades"
                  hint="O que tratar primeiro nesta semana"
                />
                <Shortcut
                  to="/ecommerce/tarefas"
                  label="Tarefas"
                  hint="Ações pendentes da operação"
                />
              </div>
            </section>
          </>
        )}
      </div>
    </EcommerceLayout>
  );
}

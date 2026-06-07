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

const EVO_TAB_SERIES: Record<
  EvoTab,
  { aLabel: string; bLabel: string; aType: "bar" | "line"; bType: "bar" | "line" }
> = {
  rev_inv: { aLabel: "Receita", bLabel: "Investimento Ads", aType: "bar", bType: "line" },
  sales_conv: { aLabel: "Vendas", bLabel: "Conversão (%)", aType: "bar", bType: "line" },
  clicks_imp: { aLabel: "Cliques", bLabel: "Impressões", aType: "bar", bType: "bar" },
  roas_acos: { aLabel: "ROAS", bLabel: "ACOS", aType: "line", bType: "line" },
};

const PERIOD_POINTS: Record<PeriodKey, number> = {
  "7d": 7,
  "15d": 15,
  "30d": 30,
  mtd: new Date().getDate(),
};

// Deterministic in-formation shapes (NOT real data). Used only to convey
// the chart structure visually. Values are intentionally unitless and the
// series are rendered at low opacity with a clear "em formação" note.
function makeFormationSeries(points: number, variant: EvoTab): [number[], number[]] {
  const seed = variant === "rev_inv" ? 11 : variant === "sales_conv" ? 23 : variant === "clicks_imp" ? 37 : 53;
  const a: number[] = [];
  const b: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / Math.max(1, points - 1);
    a.push(0.45 + 0.35 * Math.sin(seed * 0.13 + t * Math.PI * 1.6) + 0.12 * t);
    b.push(0.32 + 0.28 * Math.cos(seed * 0.17 + t * Math.PI * 1.3) + 0.08 * t);
  }
  return [a, b];
}

function FormationChart({ variant, period }: { variant: EvoTab; period: PeriodKey }) {
  const points = PERIOD_POINTS[period];
  const [a, b] = makeFormationSeries(points, variant);
  const cfg = EVO_TAB_SERIES[variant];

  const W = 820;
  const H = 260;
  const PAD_L = 36;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 28;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  // X positions per index (center of slot)
  const slotW = innerW / points;
  const xCenter = (i: number) => PAD_L + slotW * (i + 0.5);
  const yOf = (v: number) => PAD_T + (1 - v) * innerH;

  const ticks = 4;
  const gridYs = Array.from({ length: ticks + 1 }, (_, i) => PAD_T + (innerH / ticks) * i);

  const colorA = "#2563eb"; // primary brand-ish
  const colorB = "#7c3aed";

  const linePath = (arr: number[]) =>
    arr
      .map((v, i) => `${i === 0 ? "M" : "L"}${xCenter(i).toFixed(1)},${yOf(v).toFixed(1)}`)
      .join(" ");

  // X-axis labels: show ~6 ticks
  const labelEvery = Math.max(1, Math.round(points / 6));
  const xLabels: { i: number; label: string }[] = [];
  for (let i = 0; i < points; i++) {
    if (i % labelEvery === 0 || i === points - 1) {
      xLabels.push({ i, label: `D${i + 1}` });
    }
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-[260px] w-full"
        role="img"
        aria-label="Estrutura do gráfico — histórico em formação"
      >
        <defs>
          <linearGradient id={`evoBarA-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorA} stopOpacity="0.55" />
            <stop offset="100%" stopColor={colorA} stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id={`evoBarB-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorB} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colorB} stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Y grid */}
        {gridYs.map((y, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y}
              y2={y}
              stroke="#eef2f7"
              strokeWidth={1}
            />
            <text
              x={PAD_L - 8}
              y={y + 3}
              textAnchor="end"
              className="fill-slate-300"
              style={{ fontSize: 9 }}
            >
              {/* axis ticks left blank to avoid implying real values */}
              {"·"}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1={PAD_L} x2={W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} stroke="#e2e8f0" />
        <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={H - PAD_B} stroke="#e2e8f0" />

        {/* Series A */}
        {cfg.aType === "bar" ? (
          <g opacity={0.45}>
            {a.map((v, i) => {
              const bw = Math.max(3, slotW * (cfg.bType === "bar" ? 0.35 : 0.55));
              const x = xCenter(i) - (cfg.bType === "bar" ? bw + 1 : bw / 2);
              const y = yOf(v);
              const h = H - PAD_B - y;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={bw}
                  height={Math.max(1, h)}
                  fill={`url(#evoBarA-${variant})`}
                  rx={2}
                />
              );
            })}
          </g>
        ) : (
          <path d={linePath(a)} fill="none" stroke={colorA} strokeWidth={1.75} opacity={0.5} />
        )}

        {/* Series B */}
        {cfg.bType === "bar" ? (
          <g opacity={0.4}>
            {b.map((v, i) => {
              const bw = Math.max(3, slotW * 0.35);
              const x = xCenter(i) + 1;
              const y = yOf(v);
              const h = H - PAD_B - y;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={bw}
                  height={Math.max(1, h)}
                  fill={`url(#evoBarB-${variant})`}
                  rx={2}
                />
              );
            })}
          </g>
        ) : (
          <path
            d={linePath(b)}
            fill="none"
            stroke={colorB}
            strokeWidth={1.5}
            strokeDasharray={cfg.aType === "line" ? "0" : "4 4"}
            opacity={0.5}
          />
        )}

        {/* X labels */}
        {xLabels.map(({ i, label }) => (
          <text
            key={i}
            x={xCenter(i)}
            y={H - PAD_B + 16}
            textAnchor="middle"
            className="fill-slate-400"
            style={{ fontSize: 10 }}
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function EvolutionSection({
  summary,
  period,
  onPeriodChange,
  derived,
  pendingTasks,
}: {
  summary: Summary;
  period: PeriodKey;
  onPeriodChange: (p: PeriodKey) => void;
  derived: { noVisits: number; visitsNoSales: number; stuck: number };
  pendingTasks: number;
}) {
  const [tab, setTab] = useState<EvoTab>("rev_inv");
  const series = EVO_TAB_SERIES[tab];

  const revenue = Number(summary.total_gross_revenue ?? 0);
  const invest = Number(summary.total_ads_investment ?? 0);
  const sales = Number(summary.total_sales_count ?? 0);
  const roas = Number(summary.avg_roas ?? 0);

  const readingText = `Com os dados atuais, a operação registra ${fmtBRL(
    revenue,
  )} em faturamento, ${fmtBRL(invest)} em investimento Ads, ${fmtInt(sales)} ${
    sales === 1 ? "venda" : "vendas"
  } e ROAS médio de ${roas > 0 ? `${fmtNum(roas, 2)}x` : "—"}. O histórico comparativo será ampliado conforme novas sincronizações forem registradas.`;

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
          <div className="flex items-center gap-2 self-start">
            <PeriodTabs value={period} onChange={onPeriodChange} />
            <span className="inline-flex h-fit items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              Aguardando histórico
            </span>
          </div>
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
                  active ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
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

        {/* Informative note above chart (replaces central overlay) */}
        <p className="mt-3 text-[11.5px] text-slate-500">
          Os gráficos comparativos serão preenchidos conforme novas sincronizações forem
          registradas. A estrutura abaixo mostra como a leitura será apresentada.
        </p>

        {/* Chart + side panel */}
        <div className="mt-3 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          <div className="rounded-xl border border-slate-100 bg-white p-3">
            <FormationChart variant={tab} period={period} />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-${series.aType === "bar" ? "sm" : "full"}`}
                  style={{ background: "#2563eb", opacity: 0.55 }}
                />
                {series.aLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-${series.bType === "bar" ? "sm" : "full"}`}
                  style={{ background: "#7c3aed", opacity: 0.5 }}
                />
                {series.bLabel}
              </span>
              <span className="ml-auto text-[10.5px] text-slate-400">
                Período: {PERIOD_LABEL[period]} · em formação
              </span>
            </div>
          </div>

          {/* Leitura do período */}
          <aside className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-4">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Leitura do período
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-slate-700">
                {readingText}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="Receita" value={fmtBRL(revenue)} />
              <MiniStat label="Investimento" value={fmtBRL(invest)} />
              <MiniStat label="Vendas" value={fmtInt(sales)} />
              <MiniStat
                label="ROAS médio"
                value={roas > 0 ? `${fmtNum(roas, 2)}x` : "—"}
              />
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Leitura da IA
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-700">
                {roas >= 1.5
                  ? `Eficiência saudável: cada R$ 1 em Ads retorna ${fmtNum(roas, 2)}x. Mantenha o ritmo de investimento e priorize escalar campanhas com melhor retorno.`
                  : roas > 0
                    ? `ROAS atual de ${fmtNum(roas, 2)}x sugere revisão de campanhas. Reavalie criativos, segmentação e palavras-chave para elevar o retorno.`
                    : `Sem ROAS consolidado no período. Conecte campanhas e aguarde a próxima sincronização para uma leitura precisa de eficiência.`}
              </p>
            </div>
          </aside>
        </div>

        {/* Leitura analítica */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            Leitura analítica
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2.5 md:grid-cols-3">
            <AnalyticalBlock
              tone="success"
              title="Eficiência"
              text={
                roas > 0
                  ? `ROAS atual de ${fmtNum(roas, 2)}x com ${fmtBRL(invest)} investidos em Ads.`
                  : `Aguardando dados de ROAS para leitura de eficiência.`
              }
            />
            <AnalyticalBlock
              tone="info"
              title="Escala"
              text={
                sales > 0
                  ? `${fmtInt(sales)} ${sales === 1 ? "venda registrada" : "vendas registradas"} na operação no período atual.`
                  : `Nenhuma venda registrada no período atual.`
              }
            />
            <AnalyticalBlock
              tone="warning"
              title="Atenção operacional"
              text={
                derived.stuck > 0 || pendingTasks > 0
                  ? `${fmtInt(derived.noVisits)} sem visita · ${fmtInt(derived.visitsNoSales)} sem venda · ${fmtInt(pendingTasks)} ${pendingTasks === 1 ? "tarefa pendente" : "tarefas pendentes"}.`
                  : `Operação sem alertas críticos no momento.`
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

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

function AnalyticalBlock({
  tone,
  title,
  text,
}: {
  tone: "success" | "info" | "warning";
  title: string;
  text: string;
}) {
  const toneCfg = {
    success: { dot: "bg-emerald-500", label: "text-emerald-700", ring: "border-emerald-100 bg-emerald-50/40" },
    info: { dot: "bg-blue-500", label: "text-blue-700", ring: "border-blue-100 bg-blue-50/40" },
    warning: { dot: "bg-amber-500", label: "text-amber-700", ring: "border-amber-100 bg-amber-50/40" },
  }[tone];
  return (
    <div className={`rounded-lg border ${toneCfg.ring} p-3`}>
      <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${toneCfg.label}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${toneCfg.dot}`} />
        {title}
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-slate-700">{text}</p>
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

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
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

const fmtBRL = (v: number | null | undefined) => {
  const n = Number(v ?? 0);
  const hasCents = Math.abs(n - Math.trunc(n)) > 0.0049;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(n);
};
const fmtInt = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(v ?? 0));
const fmtNum = (v: number | null | undefined, d = 2) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(Number(v ?? 0));

type Tone = "neutral" | "info" | "success" | "attention" | "critical" | "ads";

const TONE: Record<
  Tone,
  { accent: string; dot: string; value: string; soft: string; ring: string; chipText: string }
> = {
  neutral: {
    accent: "bg-slate-400",
    dot: "bg-slate-400",
    value: "text-slate-900",
    soft: "bg-slate-50",
    ring: "ring-slate-200",
    chipText: "text-slate-600",
  },
  info: {
    accent: "bg-sky-500",
    dot: "bg-sky-500",
    value: "text-slate-900",
    soft: "bg-sky-50",
    ring: "ring-sky-100",
    chipText: "text-sky-700",
  },
  success: {
    accent: "bg-emerald-500",
    dot: "bg-emerald-500",
    value: "text-slate-900",
    soft: "bg-emerald-50",
    ring: "ring-emerald-100",
    chipText: "text-emerald-700",
  },
  attention: {
    accent: "bg-amber-500",
    dot: "bg-amber-500",
    value: "text-slate-900",
    soft: "bg-amber-50",
    ring: "ring-amber-100",
    chipText: "text-amber-700",
  },
  critical: {
    accent: "bg-rose-500",
    dot: "bg-rose-500",
    value: "text-rose-700",
    soft: "bg-rose-50",
    ring: "ring-rose-100",
    chipText: "text-rose-700",
  },
  ads: {
    accent: "bg-violet-500",
    dot: "bg-violet-500",
    value: "text-slate-900",
    soft: "bg-violet-50",
    ring: "ring-violet-100",
    chipText: "text-violet-700",
  },
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
  impact,
  tone = "neutral",
  emphasis = false,
  trend,
  to,
  search,
}: {
  label: string;
  value: React.ReactNode;
  context?: string;
  impact?: string;
  tone?: Tone;
  emphasis?: boolean;
  trend?: Trend | null;
  to?: string;
  search?: Record<string, string>;
}) {
  const t = TONE[tone];
  const inner = (
    <>
      <span
        className={`absolute left-0 top-0 h-full w-[3px] ${t.accent}`}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden />
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            {label}
          </div>
        </div>
        <TrendPill trend={trend} />
      </div>

      <div
        className={`mt-2.5 ${emphasis ? "text-[26px]" : "text-[22px]"} font-semibold leading-none tabular-nums tracking-tight ${t.value} whitespace-nowrap`}
      >
        {value}
      </div>

      {context && (
        <div className="mt-2.5 text-[11.5px] leading-snug text-slate-600">
          {context}
        </div>
      )}

      {impact && (
        <div className="mt-1 flex items-start gap-1.5 text-[11px] leading-snug text-slate-400">
          <span
            className={`mt-[5px] h-[3px] w-[3px] flex-none rounded-full ${t.dot}`}
            aria-hidden
          />
          <span>{impact}</span>
        </div>
      )}

      {to && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400 transition-colors group-hover:text-slate-800">
          <span>Investigar</span>
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      )}
    </>
  );

  const baseCls =
    "group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white px-4 pt-3.5 pb-3 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-all";

  if (to) {
    return (
      <Link
        to={to as any}
        search={search as any}
        className={`${baseCls} cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_28px_-18px_rgba(15,23,42,0.28)]`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={`${baseCls} hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.18)]`}>{inner}</div>
  );
}

function GroupHeader({
  eyebrow,
  title,
  hint,
  tone = "neutral",
}: {
  eyebrow: string;
  title: string;
  hint?: string;
  tone?: Tone;
}) {
  const t = TONE[tone];
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className={`h-3.5 w-[3px] rounded-full ${t.accent}`} aria-hidden />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {eyebrow}
          </div>
          <div className="text-[13px] font-semibold tracking-tight text-slate-800">
            {title}
          </div>
        </div>
      </div>
      {hint && (
        <div className="hidden text-[11px] text-slate-400 sm:block">{hint}</div>
      )}
    </div>
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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_10px_28px_-18px_rgba(15,23,42,0.22)]">
      <span className={`absolute left-0 top-0 h-full w-[3px] ${t.accent}`} aria-hidden />
      <div className="flex items-center gap-2">
        <span className={`flex h-5 w-5 items-center justify-center rounded-md ${t.soft} ring-1 ring-inset ${t.ring}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
        </span>
        <div className={`text-[10.5px] font-semibold uppercase tracking-[0.12em] ${t.chipText}`}>
          {title}
        </div>
      </div>
      <p className="mt-2.5 text-[13px] leading-relaxed text-slate-700">{text}</p>
      <div className="mt-auto pt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
        Leitura do período atual
      </div>
    </div>
  );
}

function KpiHero({
  label,
  value,
  context,
  to,
  subStats,
}: {
  label: string;
  value: React.ReactNode;
  context?: string;
  to?: string;
  subStats?: { label: string; value: React.ReactNode; dot: string }[];
}) {
  const inner = (
    <>
      <span className="absolute left-0 top-0 h-full w-[3px] bg-emerald-500" aria-hidden />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/[0.06] blur-2xl" aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-inset ring-emerald-100">
          Destaque
        </span>
      </div>
      <div className="relative mt-3 whitespace-nowrap text-[30px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
        {value}
      </div>
      {context && (
        <div className="relative mt-2 text-[12px] leading-snug text-slate-500">{context}</div>
      )}
      {subStats && subStats.length > 0 && (
        <div className="relative mt-3.5 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-100 pt-3">
          {subStats.map((s, i) => (
            <div key={i} className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full" style={{ background: s.dot }} />
                <div className="truncate text-[9.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  {s.label}
                </div>
              </div>
              <div className="mt-0.5 truncate text-[14.5px] font-semibold tabular-nums text-slate-900">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}
      {to && (
        <div className="relative mt-auto flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400 transition-colors group-hover:text-slate-800">
          <span>Investigar receita</span>
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      )}
    </>
  );

  const baseCls =
    "group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-emerald-50/30 px-5 pt-4 pb-3 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-all";

  if (to) {
    return (
      <Link
        to={to as any}
        className={`${baseCls} cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_32px_-18px_rgba(15,23,42,0.28)]`}
      >
        {inner}
      </Link>
    );
  }
  return <div className={baseCls}>{inner}</div>;
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

type SeriesType = "bar" | "line";
const EVO_TAB_SERIES: Record<
  EvoTab,
  {
    aLabel: string;
    bLabel: string;
    aType: SeriesType;
    bType: SeriesType;
    aColor: string;
    bColor: string;
  }
> = {
  // Receita (azul forte) x Investimento Ads (roxo)
  rev_inv: {
    aLabel: "Receita",
    bLabel: "Investimento Ads",
    aType: "bar",
    bType: "line",
    aColor: "#2563eb",
    bColor: "#7c3aed",
  },
  // Vendas (verde) x Conversão (laranja)
  sales_conv: {
    aLabel: "Vendas",
    bLabel: "Conversão (%)",
    aType: "bar",
    bType: "line",
    aColor: "#16a34a",
    bColor: "#f97316",
  },
  // Cliques (azul-ciano) x Impressões (cinza-azulado, em linha para diferenciar)
  clicks_imp: {
    aLabel: "Cliques",
    bLabel: "Impressões",
    aType: "bar",
    bType: "line",
    aColor: "#06b6d4",
    bColor: "#64748b",
  },
  // ROAS (verde esmeralda) x ACOS (vermelho/rosa crítico)
  roas_acos: {
    aLabel: "ROAS",
    bLabel: "ACOS",
    aType: "line",
    bType: "line",
    aColor: "#059669",
    bColor: "#e11d48",
  },
};

const PERIOD_POINTS: Record<PeriodKey, number> = {
  "7d": 7,
  "15d": 15,
  "30d": 30,
  mtd: new Date().getDate(),
};

// Deterministic in-formation shapes (NOT real data). Used only to convey
// the chart structure visually. Values are intentionally unitless and the
// series are rendered with a clear "em formação" note.
function makeFormationSeries(points: number, variant: EvoTab): [number[], number[]] {
  const seed = variant === "rev_inv" ? 11 : variant === "sales_conv" ? 23 : variant === "clicks_imp" ? 37 : 53;
  const a: number[] = [];
  const b: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / Math.max(1, points - 1);
    a.push(0.45 + 0.32 * Math.sin(seed * 0.13 + t * Math.PI * 1.6) + 0.14 * t);
    b.push(0.32 + 0.26 * Math.cos(seed * 0.17 + t * Math.PI * 1.3) + 0.1 * t);
  }
  return [a, b];
}

function FormationChart({ variant, period }: { variant: EvoTab; period: PeriodKey }) {
  const points = PERIOD_POINTS[period];
  const [a, b] = makeFormationSeries(points, variant);
  const cfg = EVO_TAB_SERIES[variant];

  const W = 820;
  const H = 300;
  const PAD_L = 48;
  const PAD_R = 22;
  const PAD_T = 18;
  const PAD_B = 34;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const slotW = innerW / points;
  const xCenter = (i: number) => PAD_L + slotW * (i + 0.5);
  const yOf = (v: number) => PAD_T + (1 - v) * innerH;

  const ticks = 4;
  const gridYs = Array.from({ length: ticks + 1 }, (_, i) => ({
    y: PAD_T + (innerH / ticks) * i,
    pct: 1 - i / ticks,
  }));

  const colorA = cfg.aColor;
  const colorB = cfg.bColor;

  const linePath = (arr: number[]) =>
    arr
      .map((v, i) => `${i === 0 ? "M" : "L"}${xCenter(i).toFixed(1)},${yOf(v).toFixed(1)}`)
      .join(" ");

  const areaPath = (arr: number[]) => {
    const top = arr
      .map((v, i) => `${i === 0 ? "M" : "L"}${xCenter(i).toFixed(1)},${yOf(v).toFixed(1)}`)
      .join(" ");
    const baseY = H - PAD_B;
    return `${top} L${xCenter(arr.length - 1).toFixed(1)},${baseY} L${xCenter(0).toFixed(1)},${baseY} Z`;
  };

  const labelEvery = Math.max(1, Math.round(points / 6));
  const xLabels: { i: number; label: string }[] = [];
  for (let i = 0; i < points; i++) {
    if (i % labelEvery === 0 || i === points - 1) {
      xLabels.push({ i, label: `D${i + 1}` });
    }
  }

  const uid = variant;
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const xPx = xRatio * W;
    if (xPx < PAD_L || xPx > W - PAD_R) {
      setHover(null);
      return;
    }
    const i = Math.min(points - 1, Math.max(0, Math.floor((xPx - PAD_L) / slotW)));
    setHover(i);
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-[300px] w-full"
        role="img"
        aria-label="Estrutura do gráfico — histórico em formação"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`evoBarA-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorA} stopOpacity="0.95" />
            <stop offset="100%" stopColor={colorA} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`evoBarB-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorB} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colorB} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`evoAreaA-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorA} stopOpacity="0.18" />
            <stop offset="100%" stopColor={colorA} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`evoAreaB-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorB} stopOpacity="0.14" />
            <stop offset="100%" stopColor={colorB} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid + tick labels */}
        {gridYs.map(({ y, pct }, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y}
              y2={y}
              stroke="#eef2f7"
              strokeWidth={1}
              strokeDasharray={i === gridYs.length - 1 ? "0" : "2 5"}
            />
            <text
              x={PAD_L - 8}
              y={y + 3.5}
              textAnchor="end"
              className="fill-slate-400"
              style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.2 }}
            >
              {Math.round(pct * 100)}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1={PAD_L} x2={W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={H - PAD_B} stroke="#e2e8f0" />

        {/* Hover guide */}
        {hover !== null && (
          <line
            x1={xCenter(hover)}
            x2={xCenter(hover)}
            y1={PAD_T}
            y2={H - PAD_B}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            strokeWidth={1}
            opacity={0.7}
          />
        )}

        {/* Series A */}
        {cfg.aType === "bar" ? (
          <g>
            {a.map((v, i) => {
              const bw = Math.max(4, slotW * (cfg.bType === "bar" ? 0.36 : 0.58));
              const x = xCenter(i) - (cfg.bType === "bar" ? bw + 1.5 : bw / 2);
              const y = yOf(v);
              const h = H - PAD_B - y;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={bw}
                  height={Math.max(1, h)}
                  fill={`url(#evoBarA-${uid})`}
                  rx={3}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              );
            })}
          </g>
        ) : (
          <>
            <path d={areaPath(a)} fill={`url(#evoAreaA-${uid})`} />
            <path
              d={linePath(a)}
              fill="none"
              stroke={colorA}
              strokeWidth={2.25}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {a.map((v, i) => (
              <circle
                key={i}
                cx={xCenter(i)}
                cy={yOf(v)}
                r={hover === i ? 4 : 2.4}
                fill="#ffffff"
                stroke={colorA}
                strokeWidth={hover === i ? 2 : 1.5}
              />
            ))}
          </>
        )}

        {/* Series B */}
        {cfg.bType === "bar" ? (
          <g>
            {b.map((v, i) => {
              const bw = Math.max(4, slotW * 0.36);
              const x = xCenter(i) + 1.5;
              const y = yOf(v);
              const h = H - PAD_B - y;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={bw}
                  height={Math.max(1, h)}
                  fill={`url(#evoBarB-${uid})`}
                  rx={3}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              );
            })}
          </g>
        ) : (
          <>
            {cfg.aType === "line" && <path d={areaPath(b)} fill={`url(#evoAreaB-${uid})`} />}
            <path
              d={linePath(b)}
              fill="none"
              stroke={colorB}
              strokeWidth={2}
              strokeDasharray={cfg.aType === "line" ? "0" : "5 4"}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {b.map((v, i) => (
              <circle
                key={i}
                cx={xCenter(i)}
                cy={yOf(v)}
                r={hover === i ? 3.8 : 2.2}
                fill="#ffffff"
                stroke={colorB}
                strokeWidth={hover === i ? 1.8 : 1.4}
              />
            ))}
          </>
        )}

        {/* X labels */}
        {xLabels.map(({ i, label }) => (
          <text
            key={i}
            x={xCenter(i)}
            y={H - PAD_B + 20}
            textAnchor="middle"
            className="fill-slate-500"
            style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 0.2 }}
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {hover !== null && (() => {
        const svg = svgRef.current;
        const rect = svg?.getBoundingClientRect();
        if (!rect) return null;
        const leftPct = (xCenter(hover) / W) * 100;
        const flip = leftPct > 70;
        return (
          <div
            className="pointer-events-none absolute top-2 z-10 min-w-[150px] rounded-lg border border-slate-200/90 bg-white/95 px-2.5 py-2 text-[11px] shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)] backdrop-blur"
            style={{
              left: flip ? undefined : `calc(${leftPct}% + 10px)`,
              right: flip ? `calc(${100 - leftPct}% + 10px)` : undefined,
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Dia {hover + 1}
              </span>
              <span className="text-[9.5px] font-medium uppercase tracking-[0.08em] text-amber-600">
                em formação
              </span>
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <span
                    className="h-2 w-2 rounded-[2px]"
                    style={{ background: colorA }}
                  />
                  {cfg.aLabel}
                </span>
                <span className="font-mono text-slate-400">—</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <span
                    className="h-2 w-2 rounded-[2px]"
                    style={{ background: colorB }}
                  />
                  {cfg.bLabel}
                </span>
                <span className="font-mono text-slate-400">—</span>
              </div>
            </div>
          </div>
        );
      })()}
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
            <span className="inline-flex h-fit items-center gap-1.5 rounded-md border border-amber-200/80 bg-amber-50 px-2 py-1 text-[10.5px] font-medium text-amber-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
              </span>
              Histórico em formação
            </span>
          </div>
        </div>

        {/* Tabs — BI chip style */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200/70 bg-slate-50/70 p-1">
          {EVO_TABS.map((t) => {
            const active = t.k === tab;
            const cfgT = EVO_TAB_SERIES[t.k];
            return (
              <button
                key={t.k}
                type="button"
                onClick={() => setTab(t.k)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all ${
                  active
                    ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.05)]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="flex items-center -space-x-0.5">
                  <span
                    className="h-2 w-2 rounded-full ring-2 ring-white"
                    style={{ background: cfgT.aColor }}
                  />
                  <span
                    className="h-2 w-2 rounded-full ring-2 ring-white"
                    style={{ background: cfgT.bColor }}
                  />
                </span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Chart + side panel */}
        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          <div className="rounded-xl border border-slate-200/70 bg-white p-3">
            {/* Legend top — BI style with metric chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-1 pb-2.5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px]">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <span
                    className={series.aType === "bar" ? "h-2.5 w-2.5 rounded-[2px]" : "h-[3px] w-5 rounded-full"}
                    style={{ background: series.aColor }}
                  />
                  {series.aLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <span
                    className={series.bType === "bar" ? "h-2.5 w-2.5 rounded-[2px]" : "h-[3px] w-5 rounded-full"}
                    style={{ background: series.bColor }}
                  />
                  {series.bLabel}
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                {PERIOD_LABEL[period]} · escala relativa
              </span>
            </div>
            <FormationChart variant={tab} period={period} />
            <p className="mt-1 px-1 text-[11px] leading-relaxed text-slate-500">
              A estrutura acima reflete como a comparação será exibida. Os valores serão
              preenchidos conforme novas sincronizações forem registradas.
            </p>
          </div>


          {/* Leitura do período */}
          <aside className="flex flex-col gap-3.5 rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50/60 to-white p-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Leitura do período
                </div>
                <span className="text-[9.5px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  {PERIOD_LABEL[period]}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                {readingText}
              </p>
            </div>

            {/* Hero stat */}
            <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Receita do período
              </div>
              <div className="mt-1 whitespace-nowrap text-[19px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
                {fmtBRL(revenue)}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500">
                <span className="h-1 w-1 rounded-full bg-blue-500" />
                Faturamento bruto consolidado
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="Investimento" value={fmtBRL(invest)} dotColor="#7c3aed" />
              <MiniStat label="Vendas" value={fmtInt(sales)} dotColor="#16a34a" />
              <MiniStat
                label="ROAS médio"
                value={roas > 0 ? `${fmtNum(roas, 2)}x` : "—"}
                dotColor="#059669"
              />
              <MiniStat
                label="Ticket médio"
                value={sales > 0 ? fmtBRL(revenue / sales) : "—"}
                dotColor="#2563eb"
              />
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
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
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Leitura analítica
          </div>
          <div className="mt-2.5 grid grid-cols-1 gap-2.5 md:grid-cols-3">
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

function MiniStat({ label, value, dotColor }: { label: string; value: React.ReactNode; dotColor?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200/80 bg-white px-3 py-2 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
      <div className="flex items-center gap-1.5">
        {dotColor && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dotColor }} />
        )}
        <div className="truncate text-[9.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          {label}
        </div>
      </div>
      <div className="mt-1 whitespace-nowrap text-[14px] font-semibold tabular-nums leading-tight text-slate-900">
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
    success: {
      dot: "bg-emerald-500",
      label: "text-emerald-700",
      ring: "border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 to-white",
      accent: "before:bg-emerald-500",
    },
    info: {
      dot: "bg-blue-500",
      label: "text-blue-700",
      ring: "border-blue-200/70 bg-gradient-to-br from-blue-50/70 to-white",
      accent: "before:bg-blue-500",
    },
    warning: {
      dot: "bg-amber-500",
      label: "text-amber-700",
      ring: "border-amber-200/70 bg-gradient-to-br from-amber-50/70 to-white",
      accent: "before:bg-amber-500",
    },
  }[tone];
  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${toneCfg.ring} p-3 pl-3.5 shadow-[0_1px_0_rgba(15,23,42,0.03)] before:absolute before:inset-y-0 before:left-0 before:w-[3px] ${toneCfg.accent}`}
    >
      <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneCfg.label}`}>
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
            <section className="space-y-5">
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

              {/* Grupo 1 — Performance executiva (bento) */}
              <div>
                <GroupHeader
                  eyebrow="Bloco A"
                  title="Performance executiva"
                  hint="Tamanho atual da operação"
                  tone="success"
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Hero card — Faturamento ocupa 2 colunas em telas grandes */}
                  <div className="sm:col-span-2 lg:col-span-2">
                    <KpiHero
                      label="Faturamento total"
                      value={fmtBRL(summary.total_gross_revenue)}
                      context="Receita bruta acumulada no período analisado."
                      to="/ecommerce/produtos"
                      subStats={[
                        {
                          label: "Ticket médio",
                          value:
                            Number(summary.total_sales_count ?? 0) > 0
                              ? fmtBRL(
                                  Number(summary.total_gross_revenue ?? 0) /
                                    Number(summary.total_sales_count),
                                )
                              : "—",
                          dot: "#2563eb",
                        },
                        {
                          label: "Vendas no período",
                          value: fmtInt(summary.total_sales_count),
                          dot: "#16a34a",
                        },
                      ]}
                    />
                  </div>
                  <KpiCard
                    label="Contas conectadas"
                    value={fmtInt(summary.total_accounts)}
                    context="Marketplaces integrados ao AC360."
                    impact="Base de canais monitorados."
                    tone="info"
                    emphasis
                    trend={null}
                    to="/ecommerce/contas"
                  />
                  <KpiCard
                    label="Produtos ativos"
                    value={fmtInt(summary.total_products)}
                    context="Produtos e anúncios em operação."
                    impact="Base atual de itens analisados."
                    tone="neutral"
                    emphasis
                    trend={null}
                    to="/ecommerce/produtos"
                  />
                </div>
              </div>


              {/* Grupo 2 — Performance de Ads */}
              <div>
                <GroupHeader
                  eyebrow="Grupo 2"
                  title="Performance de Ads"
                  hint="Investimento, retorno e eficiência de campanhas"
                  tone="ads"
                />
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  <KpiCard
                    label="Investimento Ads"
                    value={fmtBRL(summary.total_ads_investment)}
                    context="Valor investido em campanhas."
                    impact="Deve ser acompanhado junto com o retorno."
                    tone="ads"
                    emphasis
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
                    context="Receita atribuída às campanhas."
                    impact="Mostra quanto os anúncios estão retornando."
                    tone="ads"
                    emphasis
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
                    context="Retorno médio sobre o investimento em anúncios."
                    impact="Ajuda a medir a eficiência das campanhas."
                    tone={Number(summary.avg_roas ?? 0) >= 1.5 ? "success" : "critical"}
                    emphasis
                    trend={null}
                    to="/ecommerce/ads"
                  />
                </div>
              </div>

              {/* Grupo 3 — Atenção operacional */}
              <div>
                <GroupHeader
                  eyebrow="Grupo 3"
                  title="Atenção operacional"
                  hint="Pontos que exigem revisão e ação"
                  tone="critical"
                />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
                  <KpiCard
                    label="Produtos travados"
                    value={fmtInt(derived.stuck)}
                    context="Itens exigindo análise por baixo desempenho."
                    impact="Podem estar segurando faturamento."
                    tone="critical"
                    trend={null}
                    to="/ecommerce/produtos-travados"
                  />
                  <KpiCard
                    label="Produtos sem venda"
                    value={fmtInt(summary.products_visits_no_sales)}
                    context="Produtos que não venderam no período."
                    impact="Exigem revisão de oferta, preço ou anúncio."
                    tone="attention"
                    trend={null}
                    to="/ecommerce/produtos-travados"
                    search={{ filter: "no_sales" }}
                  />
                  <KpiCard
                    label="Produtos sem visita"
                    value={fmtInt(summary.products_no_visits)}
                    context="Produtos sem tráfego relevante."
                    impact="Podem precisar de exposição, categoria ou campanha."
                    tone="info"
                    trend={null}
                    to="/ecommerce/produtos-travados"
                    search={{ filter: "no_visits" }}
                  />
                  <KpiCard
                    label="Alertas críticos"
                    value={fmtInt(derived.criticalAlerts)}
                    context="Sinais que exigem ação imediata."
                    impact="Prioridade para evitar perda de receita."
                    tone="critical"
                    trend={null}
                    to="/ecommerce/prioridades"
                    search={{ priority: "critical" }}
                  />
                  <KpiCard
                    label="Tarefas pendentes"
                    value={fmtInt(summary.pending_tasks)}
                    context="Ações aguardando execução."
                    impact="Quanto mais atrasar, maior o risco operacional."
                    tone="attention"
                    trend={null}
                    to="/ecommerce/tarefas"
                    search={{ status: "pending" }}
                  />
                  <KpiCard
                    label="Insights abertos"
                    value={fmtInt(summary.open_insights)}
                    context="Recomendações da IA ainda não tratadas."
                    impact="Podem virar ações comerciais ou operacionais."
                    tone="info"
                    trend={null}
                    to="/ecommerce/consultor-ia"
                  />
                </div>
              </div>
            </section>


            {/* Evolução da operação */}
            <EvolutionSection
              summary={summary}
              period={period}
              onPeriodChange={setPeriod}
              derived={{
                noVisits: derived.noVisits,
                visitsNoSales: derived.visitsNoSales,
                stuck: derived.stuck,
              }}
              pendingTasks={Number(summary.pending_tasks ?? 0)}
            />



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

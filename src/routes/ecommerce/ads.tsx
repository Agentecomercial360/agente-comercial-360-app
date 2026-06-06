import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  MousePointer2,
  BarChart3,
  Activity,
  Eye,
  BrainCircuit,
  AlertTriangle,
  Sparkles,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/ads")({
  component: AdsInteligente,
  head: () => ({
    meta: [{ title: "Ads Inteligente | Agente Comercial 360" }],
  }),
});

type AdRow = {
  marketplace?: string | null;
  account_name?: string | null;
  sku?: string | null;
  product_name?: string | null;
  campaign_name?: string | null;
  ad_type?: string | null;
  impressions?: number | null;
  clicks?: number | null;
  investment?: number | null;
  ads_revenue?: number | null;
  total_revenue?: number | null;
  roas?: number | null;
  acos?: number | null;
  tacos?: number | null;
  ctr?: number | null;
  cpc?: number | null;
  ads_status?: string | null;
  recommended_action?: string | null;
  priority_level?: string | null;
  ai_action_suggestion?: string | null;
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Crítico",
  high: "Alta",
  opportunity: "Oportunidade",
  normal: "Normal",
};

const PRIORITY_STYLE: Record<string, string> = {
  critical: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  high: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  opportunity: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  normal: "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
};

const ACTION_LABEL: Record<string, string> = {
  pause: "Pausar",
  reduce_budget: "Reduzir orçamento",
  scale: "Escalar",
  review_ad: "Revisar anúncio",
  keep_monitoring: "Manter monitoramento",
};

const ACTION_STYLE: Record<string, string> = {
  pause: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  reduce_budget: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  scale: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  review_ad: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  keep_monitoring: "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
};

function actionKey(value?: string | null): string | null {
  if (!value) return null;
  return value.toLowerCase();
}

function translateAction(value?: string | null): string | null {
  if (!value) return null;
  const key = value.toLowerCase();
  return ACTION_LABEL[key] ?? value;
}

const fmtBRL = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number(v ?? 0));
const fmtInt = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(v ?? 0));
const fmtNum = (v: number | null | undefined, d = 2) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(v ?? 0));
const fmtPct = (v: number | null | undefined, d = 1) => {
  if (v === null || v === undefined) return "0%";
  const num = Number(v);
  const pct = Math.abs(num) <= 1 ? num * 100 : num;
  return `${fmtNum(pct, d)}%`;
};

function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  primary = false,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow ${
        primary ? "border-slate-200" : "border-slate-200/70"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div
        className={`mt-2 font-bold tabular-nums text-slate-900 ${
          primary ? "text-2xl" : "text-xl"
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-slate-400">{hint}</div>}
    </div>
  );
}

function AdsInteligente() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AdRow[]>([]);

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

        const { data, error: aErr } = await supabase
          .from("vw_ecommerce_ads_performance")
          .select("*")
          .eq("company_id", ctx.company_id);

        if (aErr) throw aErr;
        if (cancelled) return;
        setRows((data as AdRow[]) ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Erro ao carregar campanhas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const totals = useMemo(() => {
    const t = { investment: 0, ads_revenue: 0, total_revenue: 0, clicks: 0, impressions: 0 };
    for (const r of rows) {
      t.investment += Number(r.investment ?? 0);
      t.ads_revenue += Number(r.ads_revenue ?? 0);
      t.total_revenue += Number(r.total_revenue ?? 0);
      t.clicks += Number(r.clicks ?? 0);
      t.impressions += Number(r.impressions ?? 0);
    }
    const roas = t.investment > 0 ? t.ads_revenue / t.investment : 0;
    const acos = t.ads_revenue > 0 ? (t.investment / t.ads_revenue) * 100 : 0;
    const tacos = t.total_revenue > 0 ? (t.investment / t.total_revenue) * 100 : 0;
    return { ...t, roas, acos, tacos };
  }, [rows]);

  const buckets = useMemo(() => {
    const critical: AdRow[] = [];
    const opportunity: AdRow[] = [];
    const actionable: AdRow[] = [];
    for (const r of rows) {
      const prio = (r.priority_level ?? "").toLowerCase();
      if (prio === "critical") critical.push(r);
      if (prio === "opportunity") opportunity.push(r);
      const aKey = (r.recommended_action ?? "").toLowerCase();
      if (aKey && aKey !== "keep_monitoring") actionable.push(r);
    }
    return { critical, opportunity, actionable };
  }, [rows]);

  const aiSummary = useMemo(() => {
    const c = buckets.critical.length;
    const o = buckets.opportunity.length;
    const a = buckets.actionable.length;
    if (rows.length === 0) return "Sem campanhas para análise no momento.";
    return `${c} ${c === 1 ? "campanha crítica" : "campanhas críticas"}, ${o} ${o === 1 ? "oportunidade de escala" : "oportunidades de escala"} e ${a} ${a === 1 ? "recomendação gerada" : "recomendações geradas"} pela IA.`;
  }, [buckets, rows.length]);

  const primaryKpis = [
    { label: "Investimento", value: fmtBRL(totals.investment), icon: DollarSign },
    { label: "Receita via Ads", value: fmtBRL(totals.ads_revenue), icon: TrendingUp },
    { label: "ROAS médio", value: fmtNum(totals.roas, 2), icon: BarChart3, hint: "Retorno sobre investimento" },
    { label: "ACOS", value: `${fmtNum(totals.acos, 1)}%`, icon: Target },
  ];

  const secondaryKpis = [
    { label: "TACoS", value: `${fmtNum(totals.tacos, 1)}%`, icon: Activity },
    { label: "Cliques", value: fmtInt(totals.clicks), icon: MousePointer2 },
    { label: "Impressões", value: fmtInt(totals.impressions), icon: Eye },
    { label: "Campanhas ativas", value: fmtInt(rows.length), icon: Sparkles },
  ];

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Cabeçalho executivo */}
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">
              Ads Intelligence
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Ads Inteligente
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Otimização e leitura estratégica das campanhas com base em performance real.
            </p>
          </div>

          {!loading && !error && rows.length > 0 && (
            <div className="flex-1 rounded-xl border border-slate-900/5 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm lg:max-w-md">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-white/10 p-1.5 ring-1 ring-inset ring-white/20">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200">
                  Resumo da IA
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-100">{aiSummary}</p>
              <div className="mt-4 flex flex-wrap gap-4 border-t border-white/10 pt-3 text-[11px] uppercase tracking-wider text-slate-300">
                <span>
                  <span className="font-bold text-rose-300">{buckets.critical.length}</span> críticas
                </span>
                <span>
                  <span className="font-bold text-emerald-300">{buckets.opportunity.length}</span> oportunidades
                </span>
                <span>
                  <span className="font-bold text-blue-300">{buckets.actionable.length}</span> ações sugeridas
                </span>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Carregando campanhas...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            Não foi possível carregar as campanhas agora. Tente novamente em instantes.
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Nenhuma campanha encontrada para esta empresa.
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            {/* KPIs principais */}
            <section className="space-y-3">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {primaryKpis.map((k, i) => (
                  <KpiCard key={i} {...k} primary />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {secondaryKpis.map((k, i) => (
                  <KpiCard key={i} {...k} />
                ))}
              </div>
            </section>

            {/* Priorização visual */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <PriorityBlock
                title="Campanhas críticas"
                count={buckets.critical.length}
                icon={AlertTriangle}
                accent="rose"
                items={buckets.critical.slice(0, 3)}
                emptyText="Nenhuma campanha crítica."
              />
              <PriorityBlock
                title="Oportunidades de escala"
                count={buckets.opportunity.length}
                icon={ArrowUpRight}
                accent="emerald"
                items={buckets.opportunity.slice(0, 3)}
                emptyText="Sem oportunidades neste ciclo."
              />
              <PriorityBlock
                title="Ações recomendadas pela IA"
                count={buckets.actionable.length}
                icon={Sparkles}
                accent="blue"
                items={buckets.actionable.slice(0, 3)}
                emptyText="Nenhuma ação recomendada."
                showAction
              />
            </section>

            {/* Listagem de campanhas */}
            <section className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Campanhas</h2>
                  <p className="text-xs text-slate-500">
                    {rows.length} {rows.length === 1 ? "campanha analisada" : "campanhas analisadas"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {rows.map((c, i) => {
                  const prio = (c.priority_level ?? "normal").toLowerCase();
                  const aKey = actionKey(c.recommended_action);
                  const aLabel = translateAction(c.recommended_action);
                  const accentBar =
                    prio === "critical"
                      ? "bg-rose-500"
                      : prio === "opportunity"
                        ? "bg-emerald-500"
                        : prio === "high"
                          ? "bg-amber-500"
                          : "bg-slate-200";

                  const metrics = [
                    { label: "Investimento", value: fmtBRL(c.investment) },
                    { label: "Receita Ads", value: fmtBRL(c.ads_revenue) },
                    { label: "Receita Total", value: fmtBRL(c.total_revenue) },
                    { label: "ROAS", value: fmtNum(c.roas, 2), emphasis: true },
                    { label: "ACOS", value: fmtPct(c.acos) },
                    { label: "TACoS", value: fmtPct(c.tacos) },
                    { label: "Cliques", value: fmtInt(c.clicks) },
                    { label: "Impressões", value: fmtInt(c.impressions) },
                  ];

                  return (
                    <div
                      key={i}
                      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      <span className={`absolute inset-y-0 left-0 w-1 ${accentBar}`} />
                      <div className="p-5 pl-6">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  PRIORITY_STYLE[prio] ?? "bg-slate-50 text-slate-700 ring-1 ring-slate-200"
                                }`}
                              >
                                {PRIORITY_LABEL[prio] ?? prio}
                              </span>
                              {c.ad_type && (
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                  {c.ad_type}
                                </span>
                              )}
                              {c.ads_status && (
                                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
                                  {c.ads_status}
                                </span>
                              )}
                            </div>
                            <h3
                              className="mt-2.5 truncate text-base font-bold leading-tight text-slate-900"
                              title={c.campaign_name ?? undefined}
                            >
                              {c.campaign_name ?? "Campanha sem nome"}
                            </h3>
                            <p
                              className="mt-0.5 truncate text-sm text-slate-600"
                              title={c.product_name ?? undefined}
                            >
                              {c.product_name ?? "—"}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                              {c.sku && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono uppercase tracking-wider text-slate-600">
                                  {c.sku}
                                </span>
                              )}
                              <span className="truncate">{c.account_name ?? "—"}</span>
                              {c.marketplace && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="uppercase tracking-wide">{c.marketplace}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-end">
                            {aLabel && (
                              <span
                                className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold ${
                                  ACTION_STYLE[aKey ?? ""] ?? "bg-slate-50 text-slate-700 ring-1 ring-slate-200"
                                }`}
                              >
                                {aLabel}
                              </span>
                            )}
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              Ver detalhes
                              <ArrowUpRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-4 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 sm:grid-cols-8">
                          {metrics.map((m, mi) => (
                            <div key={mi} className="min-w-0">
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                {m.label}
                              </div>
                              <div
                                className={`mt-0.5 text-sm font-bold tabular-nums ${
                                  m.emphasis ? "text-blue-700" : "text-slate-900"
                                }`}
                              >
                                {m.value}
                              </div>
                            </div>
                          ))}
                        </div>

                        {c.ai_action_suggestion && (
                          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                            <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                            <p className="text-[13px] leading-relaxed text-slate-700">
                              {c.ai_action_suggestion}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </EcommerceLayout>
  );
}

function PriorityBlock({
  title,
  count,
  icon: Icon,
  accent,
  items,
  emptyText,
  showAction = false,
}: {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: "rose" | "emerald" | "blue";
  items: AdRow[];
  emptyText: string;
  showAction?: boolean;
}) {
  const accentStyles = {
    rose: { iconBg: "bg-rose-50 text-rose-600 ring-rose-100", num: "text-rose-700" },
    emerald: { iconBg: "bg-emerald-50 text-emerald-600 ring-emerald-100", num: "text-emerald-700" },
    blue: { iconBg: "bg-blue-50 text-blue-600 ring-blue-100", num: "text-blue-700" },
  }[accent];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`rounded-lg p-1.5 ring-1 ring-inset ${accentStyles.iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-slate-900">{title}</span>
        </div>
        <span className={`text-2xl font-bold tabular-nums ${accentStyles.num}`}>{count}</span>
      </div>
      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400">{emptyText}</p>
        ) : (
          items.map((it, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-medium text-slate-700" title={it.campaign_name ?? ""}>
                {it.campaign_name ?? "—"}
              </span>
              <span className="shrink-0 text-slate-500 tabular-nums">
                {showAction
                  ? translateAction(it.recommended_action) ?? "—"
                  : `ROAS ${fmtNum(it.roas, 2)}`}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

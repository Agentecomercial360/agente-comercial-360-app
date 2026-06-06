import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Zap,
  TrendingUp,
  DollarSign,
  MousePointer2,
  BarChart3,
  Activity,
  Eye,
  BrainCircuit,
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
  critical: "bg-rose-100 text-rose-700",
  high: "bg-amber-100 text-amber-700",
  opportunity: "bg-emerald-100 text-emerald-700",
  normal: "bg-blue-100 text-blue-700",
};

const ACTION_LABEL: Record<string, string> = {
  pause: "Pausar",
  reduce_budget: "Reduzir orçamento",
  scale: "Escalar",
  review_ad: "Revisar anúncio",
  keep_monitoring: "Manter monitoramento",
};

const ACTION_STYLE: Record<string, string> = {
  pause: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  reduce_budget: "bg-orange-100 text-orange-700 ring-1 ring-orange-200",
  scale: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  review_ad: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  keep_monitoring: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
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
  // valores podem vir como fração (0.14) ou já em pontos percentuais (14)
  const pct = Math.abs(num) <= 1 ? num * 100 : num;
  return `${fmtNum(pct, d)}%`;
};

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
    const t = {
      investment: 0,
      ads_revenue: 0,
      total_revenue: 0,
      clicks: 0,
      impressions: 0,
    };
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

  const kpis = [
    { label: "Investimento", value: fmtBRL(totals.investment), icon: DollarSign, color: "bg-yellow-50 text-yellow-600" },
    { label: "Receita via Ads", value: fmtBRL(totals.ads_revenue), icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
    { label: "ROAS médio", value: fmtNum(totals.roas, 2), icon: BarChart3, color: "bg-blue-50 text-blue-600" },
    { label: "ACOS", value: `${fmtNum(totals.acos, 1)}%`, icon: Zap, color: "bg-amber-50 text-amber-600" },
    { label: "TACoS", value: `${fmtNum(totals.tacos, 1)}%`, icon: Activity, color: "bg-orange-50 text-orange-600" },
    { label: "Cliques", value: fmtInt(totals.clicks), icon: MousePointer2, color: "bg-indigo-50 text-indigo-600" },
    { label: "Impressões", value: fmtInt(totals.impressions), icon: Eye, color: "bg-violet-50 text-violet-600" },
    { label: "Campanhas ativas", value: fmtInt(rows.length), icon: Zap, color: "bg-rose-50 text-rose-600" },
  ];

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ads Inteligente</h1>
          <p className="text-slate-500">Otimização de campanhas publicitárias baseada em inteligência de dados.</p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            Carregando campanhas...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            Não foi possível carregar as campanhas agora. Tente novamente em instantes.
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            Nenhuma campanha encontrada para esta empresa.
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
                  <div className={`w-fit rounded-xl p-2.5 ${kpi.color} ring-1 ring-inset ring-black/5`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {rows.map((c, i) => {
                const prio = (c.priority_level ?? "normal").toLowerCase();
                const aKey = actionKey(c.recommended_action);
                const aLabel = translateAction(c.recommended_action);
                const metrics: { label: string; value: string; emphasis?: boolean }[] = [
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
                    className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              PRIORITY_STYLE[prio] ?? "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {PRIORITY_LABEL[prio] ?? prio}
                          </span>
                          {c.ad_type && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                              {c.ad_type}
                            </span>
                          )}
                          {c.ads_status && (
                            <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
                              {c.ads_status}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 text-lg font-bold leading-tight text-slate-900">
                          {c.campaign_name ?? "Campanha sem nome"}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{c.product_name ?? "—"}</span>
                          {c.sku && (
                            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                              {c.sku}
                            </span>
                          )}
                          <span className="text-slate-300">•</span>
                          <span>{c.account_name ?? "—"}</span>
                          {c.marketplace && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="uppercase tracking-wide">{c.marketplace}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {aLabel && (
                        <div className="shrink-0">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Ação recomendada
                          </div>
                          <span
                            className={`mt-1 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${
                              ACTION_STYLE[aKey ?? ""] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                            }`}
                          >
                            {aLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 sm:grid-cols-4 lg:grid-cols-8">
                      {metrics.map((m, mi) => (
                        <div key={mi} className="min-w-0">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            {m.label}
                          </div>
                          <div
                            className={`mt-0.5 truncate text-sm font-bold ${
                              m.emphasis ? "text-blue-700" : "text-slate-900"
                            }`}
                          >
                            {m.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {c.ai_action_suggestion && (
                      <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                        <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600 ring-1 ring-inset ring-blue-200">
                          <BrainCircuit className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                            Sugestão IA
                          </div>
                          <p className="mt-0.5 text-sm leading-relaxed text-slate-700">
                            {c.ai_action_suggestion}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </>
        )}
      </div>
    </EcommerceLayout>
  );
}

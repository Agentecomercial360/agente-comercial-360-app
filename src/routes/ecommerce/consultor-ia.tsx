import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BrainCircuit,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/consultor-ia")({
  component: ConsultorIA,
  head: () => ({
    meta: [{ title: "Consultor IA E-commerce | Agente Comercial 360" }],
  }),
});

type TaskRow = {
  task_title: string | null;
  priority: string | null;
  status_label: string | null;
  product_name: string | null;
  sku: string | null;
  marketplace: string | null;
  account_name: string | null;
  insight_title: string | null;
  diagnosis: string | null;
  probable_cause: string | null;
  recommended_action: string | null;
  expected_impact: string | null;
  confidence_score: number | null;
  due_date: string | null;
  is_overdue: boolean | null;
  priority_order: number | null;
};

type ResultRow = {
  result_status_label: string | null;
  task_title: string | null;
  product_name: string | null;
  marketplace: string | null;
  account_name: string | null;
  before_visits: number | null;
  after_visits: number | null;
  visits_difference: number | null;
  before_sales_count: number | null;
  after_sales_count: number | null;
  sales_difference: number | null;
  before_revenue: number | null;
  after_revenue: number | null;
  revenue_difference: number | null;
  before_conversion_rate: number | null;
  after_conversion_rate: number | null;
  conversion_difference: number | null;
  result_summary: string | null;
  ai_evaluation: string | null;
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const PRIORITY_STYLE: Record<string, string> = {
  critical: "bg-rose-50 text-rose-700 border-rose-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-700 border-slate-200",
};

const fmtBRL = (n: number | null) =>
  n == null
    ? "—"
    : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtInt = (n: number | null) => (n == null ? "—" : n.toLocaleString("pt-BR"));
const fmtPct = (n: number | null) =>
  n == null ? "—" : `${(n * 100).toFixed(1).replace(".", ",")}%`;
function formatConfidenceScore(value: number | null | undefined): string {
  const numeric = Number(value);
  if (value == null || !Number.isFinite(numeric)) return "Não calculado";
  let percentage = numeric;
  if (numeric >= 0 && numeric <= 1) percentage = numeric * 100;
  else if (numeric > 100) percentage = numeric / 100;
  percentage = Math.max(0, Math.min(percentage, 100));
  const formatted = percentage.toFixed(1).replace(".", ",").replace(/,0$/, "");
  return `${formatted}%`;
}
function confidenceTier(value: number | null | undefined): { label: string; cls: string } | null {
  const numeric = Number(value);
  if (value == null || !Number.isFinite(numeric)) return null;
  let pct = numeric;
  if (numeric >= 0 && numeric <= 1) pct = numeric * 100;
  else if (numeric > 100) pct = numeric / 100;
  pct = Math.max(0, Math.min(pct, 100));
  if (pct >= 90) return { label: "Alta confiança", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (pct >= 70) return { label: "Boa confiança", cls: "bg-blue-50 text-blue-700 border-blue-200" };
  if (pct >= 50) return { label: "Confiança moderada", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Baixa confiança", cls: "bg-rose-50 text-rose-700 border-rose-200" };
}

function DiffBadge({ value, format = "int" }: { value: number | null; format?: "int" | "brl" | "pct" }) {
  if (value == null) return <span className="text-xs text-slate-400">—</span>;
  const positive = value > 0;
  const neutral = value === 0;
  const Icon = neutral ? Minus : positive ? TrendingUp : TrendingDown;
  const cls = neutral
    ? "text-slate-500 bg-slate-50 border-slate-200"
    : positive
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : "text-rose-700 bg-rose-50 border-rose-200";
  const formatted =
    format === "brl" ? fmtBRL(value) : format === "pct" ? fmtPct(value) : fmtInt(value);
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      <Icon className="h-3 w-3" />
      {formatted}
    </span>
  );
}

function ConsultorIA() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data: ctx, error: ctxErr } = await supabase
          .from("vw_user_access_context")
          .select("company_id, has_ecommerce_access")
          .maybeSingle();
        if (ctxErr) throw ctxErr;
        if (!ctx || !ctx.has_ecommerce_access) {
          navigate({ to: "/dashboard" });
          return;
        }
        const companyId = ctx.company_id;

        const [{ data: taskData, error: taskErr }, { data: resData, error: resErr }] =
          await Promise.all([
            supabase
              .from("vw_ecommerce_tasks_priority")
              .select(
                "task_title, priority, status_label, product_name, sku, marketplace, account_name, insight_title, diagnosis, probable_cause, recommended_action, expected_impact, confidence_score, due_date, is_overdue, priority_order",
              )
              .eq("company_id", companyId)
              .order("priority_order", { ascending: true })
              .order("due_date", { ascending: true }),
            supabase
              .from("vw_ecommerce_action_results")
              .select(
                "result_status_label, task_title, product_name, marketplace, account_name, before_visits, after_visits, visits_difference, before_sales_count, after_sales_count, sales_difference, before_revenue, after_revenue, revenue_difference, before_conversion_rate, after_conversion_rate, conversion_difference, result_summary, ai_evaluation",
              )
              .eq("company_id", companyId),
          ]);

        if (taskErr) throw taskErr;
        if (resErr) throw resErr;
        if (cancelled) return;
        setTasks((taskData ?? []) as TaskRow[]);
        setResults((resData ?? []) as ResultRow[]);
      } catch (e) {
        if (cancelled) return;
        console.error("[ConsultorIA] erro:", e);
        setErrorMsg("Não foi possível carregar os dados do Consultor IA.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const recommendations = useMemo(
    () => tasks.filter((t) => t.diagnosis || t.probable_cause || t.recommended_action),
    [tasks],
  );

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-3 shadow-lg shadow-blue-600/20">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Consultor IA E-commerce
            </h1>
            <p className="text-slate-500">
              Diagnóstico avançado e resultados medidos das ações executadas.
            </p>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            Carregando dados do Consultor IA...
          </div>
        )}

        {!loading && errorMsg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && (
          <>
            {/* Bloco 1 — Recomendações da IA */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">Recomendações da IA</h2>
                <span className="text-xs text-slate-400">({recommendations.length})</span>
              </div>

              {recommendations.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                  Nenhuma recomendação encontrada para esta empresa.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {recommendations.map((t, i) => {
                    const pKey = (t.priority ?? "").toLowerCase();
                    return (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900">
                              {t.insight_title || t.task_title || "Recomendação"}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {t.product_name ?? "—"}
                              {t.sku ? ` · SKU ${t.sku}` : ""}
                            </p>
                            <p className="text-xs text-slate-400">
                              {t.marketplace ?? "—"} · {t.account_name ?? "—"}
                            </p>
                          </div>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                              PRIORITY_STYLE[pKey] ?? PRIORITY_STYLE.low
                            }`}
                          >
                            {PRIORITY_LABEL[pKey] ?? t.priority ?? "—"}
                          </span>
                        </div>

                        {t.diagnosis && (
                          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                              <Sparkles className="h-3.5 w-3.5" /> Diagnóstico IA
                            </div>
                            <p className="mt-1 text-sm text-slate-700">{t.diagnosis}</p>
                          </div>
                        )}

                        {t.probable_cause && (
                          <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/40 p-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                              <AlertCircle className="h-3.5 w-3.5" /> Causa provável
                            </div>
                            <p className="mt-1 text-sm text-slate-700">{t.probable_cause}</p>
                          </div>
                        )}

                        {t.recommended_action && (
                          <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Ação recomendada
                            </div>
                            <p className="mt-1 text-sm text-slate-700">{t.recommended_action}</p>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {t.expected_impact && (
                            <span>
                              <strong className="text-slate-700">Impacto:</strong>{" "}
                              {t.expected_impact}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-2">
                            <span>
                              <strong className="text-slate-700">Confiança IA:</strong>{" "}
                              {formatConfidenceScore(t.confidence_score)}
                            </span>
                            {confidenceTier(t.confidence_score) && (
                              <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${confidenceTier(t.confidence_score)!.cls}`}>
                                {confidenceTier(t.confidence_score)!.label}
                              </span>
                            )}
                          </span>
                          {t.status_label && (
                            <span>
                              <strong className="text-slate-700">Status:</strong> {t.status_label}
                            </span>
                          )}
                          {t.is_overdue && (
                            <span className="rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-700">
                              Atrasada
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Bloco 2 — Resultados das ações */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-bold text-slate-900">Resultados das ações</h2>
                <span className="text-xs text-slate-400">({results.length})</span>
              </div>

              {results.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                  Nenhum resultado de ação medido ainda.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900">
                            {r.task_title || "Ação executada"}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {r.product_name ?? "—"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {r.marketplace ?? "—"} · {r.account_name ?? "—"}
                          </p>
                        </div>
                        {r.result_status_label && (
                          <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                            {r.result_status_label}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Visitas
                          </div>
                          <div className="mt-1 text-sm font-bold text-slate-900">
                            {fmtInt(r.before_visits)} → {fmtInt(r.after_visits)}
                          </div>
                          <div className="mt-1">
                            <DiffBadge value={r.visits_difference} format="int" />
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Vendas
                          </div>
                          <div className="mt-1 text-sm font-bold text-slate-900">
                            {fmtInt(r.before_sales_count)} → {fmtInt(r.after_sales_count)}
                          </div>
                          <div className="mt-1">
                            <DiffBadge value={r.sales_difference} format="int" />
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Receita
                          </div>
                          <div className="mt-1 text-sm font-bold text-slate-900">
                            {fmtBRL(r.before_revenue)} → {fmtBRL(r.after_revenue)}
                          </div>
                          <div className="mt-1">
                            <DiffBadge value={r.revenue_difference} format="brl" />
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Conversão
                          </div>
                          <div className="mt-1 text-sm font-bold text-slate-900">
                            {fmtPct(r.before_conversion_rate)} → {fmtPct(r.after_conversion_rate)}
                          </div>
                          <div className="mt-1">
                            <DiffBadge value={r.conversion_difference} format="pct" />
                          </div>
                        </div>
                      </div>

                      {r.result_summary && (
                        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Resumo do resultado
                          </div>
                          <p className="mt-1 text-sm text-slate-700">{r.result_summary}</p>
                        </div>
                      )}

                      {r.ai_evaluation && (
                        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                            <BrainCircuit className="h-3.5 w-3.5" /> Avaliação da IA
                          </div>
                          <p className="mt-1 text-sm text-slate-700">{r.ai_evaluation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </EcommerceLayout>
  );
}

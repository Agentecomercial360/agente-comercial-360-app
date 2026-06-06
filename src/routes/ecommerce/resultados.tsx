import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/resultados")({
  component: ResultadosAcoes,
  head: () => ({
    meta: [{ title: "Resultados das Ações | Agente Comercial 360" }],
  }),
});

type ResultRow = {
  result_status_label: string | null;
  task_title: string | null;
  product_name: string | null;
  sku: string | null;
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
  evaluation_date: string | null;
};

const fmtBRL = (n: number | null) =>
  n == null
    ? "—"
    : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtInt = (n: number | null) => (n == null ? "—" : n.toLocaleString("pt-BR"));
const fmtPct = (n: number | null) =>
  n == null ? "—" : `${(n * 100).toFixed(1).replace(".", ",")}%`;
const fmtDate = (s: string | null) => {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

function statusStyle(label: string | null): string {
  const l = (label ?? "").toLowerCase();
  if (l.includes("melhor") || l.includes("sucesso") || l.includes("positivo"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (l.includes("piorou") || l.includes("negativo"))
    return "bg-rose-50 text-rose-700 border-rose-200";
  if (l.includes("neutro") || l.includes("estável") || l.includes("estavel"))
    return "bg-slate-50 text-slate-700 border-slate-200";
  return "bg-violet-50 text-violet-700 border-violet-200";
}

function DiffBadge({
  value,
  format = "int",
}: {
  value: number | null;
  format?: "int" | "brl" | "pct";
}) {
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
  const prefix = positive ? "+" : "";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {prefix}
      {formatted}
    </span>
  );
}

function ResultadosAcoes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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

        const { data, error } = await supabase
          .from("vw_ecommerce_action_results")
          .select(
            "result_status_label, task_title, product_name, sku, marketplace, account_name, before_visits, after_visits, visits_difference, before_sales_count, after_sales_count, sales_difference, before_revenue, after_revenue, revenue_difference, before_conversion_rate, after_conversion_rate, conversion_difference, result_summary, ai_evaluation, evaluation_date",
          )
          .eq("company_id", ctx.company_id)
          .order("evaluation_date", { ascending: false });

        if (error) throw error;
        if (cancelled) return;
        setResults((data ?? []) as ResultRow[]);
      } catch (e) {
        if (cancelled) return;
        console.error("[ResultadosAcoes] erro:", e);
        setErrorMsg("Não foi possível carregar os resultados das ações.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-700 p-3 shadow-lg shadow-violet-600/20">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Resultados das Ações
            </h1>
            <p className="text-slate-500">
              Impacto medido das ações executadas: antes, depois e avaliação da IA.
            </p>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            Carregando resultados...
          </div>
        )}

        {!loading && errorMsg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && results.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Nenhum resultado de ação medido ainda.
          </div>
        )}

        {!loading && !errorMsg && results.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {results.map((r, i) => {
              const improved = (r.revenue_difference ?? 0) > 0;
              return (
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
                        {r.sku ? ` · SKU ${r.sku}` : ""}
                      </p>
                      <p className="text-xs text-slate-400">
                        {r.marketplace ?? "—"} · {r.account_name ?? "—"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {r.result_status_label && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusStyle(r.result_status_label)}`}
                        >
                          {improved && <CheckCircle2 className="h-3 w-3" />}
                          {r.result_status_label}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {fmtDate(r.evaluation_date)}
                      </span>
                    </div>
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
                    <div
                      className={`rounded-xl border p-3 ${improved ? "border-emerald-200 bg-emerald-50/60" : "border-slate-100 bg-slate-50/60"}`}
                    >
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
              );
            })}
          </div>
        )}
      </div>
    </EcommerceLayout>
  );
}

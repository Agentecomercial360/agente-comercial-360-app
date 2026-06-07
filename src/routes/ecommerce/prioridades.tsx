import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  ArrowRight,
  Flame,
  Zap,
  Target,
  ShieldAlert,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/prioridades")({
  component: PrioridadesEcommerce,
  validateSearch: (s: Record<string, unknown>) => ({
    priority: s.priority === "critical" ? ("critical" as const) : undefined,
  }),
  head: () => ({
    meta: [{ title: "Prioridades E-commerce | Agente Comercial 360" }],
  }),
});

type TaskRow = {
  task_title?: string | null;
  task_description?: string | null;
  task_type?: string | null;
  priority?: string | null;
  status_label?: string | null;
  responsible_name?: string | null;
  due_date?: string | null;
  expected_impact?: string | null;
  product_name?: string | null;
  sku?: string | null;
  category?: string | null;
  marketplace?: string | null;
  account_name?: string | null;
  insight_title?: string | null;
  diagnosis?: string | null;
  probable_cause?: string | null;
  recommended_action?: string | null;
  confidence_score?: number | null;
  is_overdue?: boolean | null;
  priority_order?: number | null;
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Crítico",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const COLUMN_STYLE: Record<string, { border: string; bg: string; dot: string }> = {
  critical: { border: "border-rose-200", bg: "bg-rose-50/50", dot: "bg-rose-500" },
  high: { border: "border-rose-200", bg: "bg-rose-50/50", dot: "bg-rose-500" },
  medium: { border: "border-amber-200", bg: "bg-amber-50/50", dot: "bg-amber-500" },
  low: { border: "border-blue-200", bg: "bg-blue-50/50", dot: "bg-blue-500" },
};

function fmtDate(d?: string | null): string {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d));
  } catch {
    return String(d);
  }
}

function fmtConfidence(v?: number | null): string | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  const pct = Math.abs(n) <= 1 ? n * 100 : n;
  return `${Math.round(pct)}%`;
}

function PrioridadeCard({ task }: { task: TaskRow }) {
  const prio = (task.priority ?? "low").toLowerCase();
  const style = COLUMN_STYLE[prio] ?? COLUMN_STYLE.low;
  const confidence = fmtConfidence(task.confidence_score);

  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${style.border} ${style.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {task.account_name ?? "—"}
          {task.marketplace ? ` • ${task.marketplace}` : ""}
        </span>
        <div className="flex items-center gap-2">
          {task.is_overdue && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
              <Clock className="h-3 w-3" /> Atrasada
            </span>
          )}
          <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        </div>
      </div>

      <h3 className="mt-2 font-bold text-slate-900">{task.task_title ?? "Sem título"}</h3>
      {(task.product_name || task.sku) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600">
          {task.product_name && <span className="font-medium">{task.product_name}</span>}
          {task.sku && <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{task.sku}</span>}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {task.diagnosis && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Diagnóstico IA</p>
            <p className="text-sm font-medium text-slate-700">{task.diagnosis}</p>
          </div>
        )}
        {task.probable_cause && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Causa provável</p>
            <p className="text-xs italic text-slate-600">"{task.probable_cause}"</p>
          </div>
        )}
        {task.recommended_action && (
          <div className="rounded-xl border border-white/40 bg-white/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Ação recomendada</p>
            <p className="text-sm font-bold text-slate-900">{task.recommended_action}</p>
          </div>
        )}
        {task.expected_impact && (
          <div className="flex items-center gap-1.5 font-bold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-[11px] uppercase tracking-wider">Impacto: {task.expected_impact}</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          {task.status_label && (
            <span className="rounded-full bg-white/70 px-2 py-0.5 font-semibold text-slate-700 ring-1 ring-slate-200">
              {task.status_label}
            </span>
          )}
          <span>Prazo: <strong className="text-slate-700">{fmtDate(task.due_date)}</strong></span>
          {task.responsible_name && <span>• {task.responsible_name}</span>}
          {confidence && <span>• Confiança IA: <strong className="text-slate-700">{confidence}</strong></span>}
        </div>
      </div>

      <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
        Resolver agora
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function PrioridadesEcommerce() {
  const navigate = useNavigate();
  const { priority: priorityFilter } = Route.useSearch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TaskRow[]>([]);

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

        const { data, error: tErr } = await supabase
          .from("vw_ecommerce_tasks_priority")
          .select("*")
          .eq("company_id", ctx.company_id)
          .order("priority_order", { ascending: true })
          .order("due_date", { ascending: true });

        if (tErr) throw tErr;
        if (cancelled) return;
        setRows((data as TaskRow[]) ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Erro ao carregar prioridades.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const grouped = useMemo(() => {
    const high: TaskRow[] = [];
    const med: TaskRow[] = [];
    const low: TaskRow[] = [];
    for (const r of rows) {
      const p = (r.priority ?? "low").toLowerCase();
      if (p === "critical" || p === "high") high.push(r);
      else if (p === "medium") med.push(r);
      else low.push(r);
    }
    return { high, med, low };
  }, [rows]);

  const columns = [
    { id: "alta", label: "Alta Prioridade", icon: Flame, color: "text-rose-600", bg: "bg-rose-50", items: grouped.high },
    { id: "media", label: "Média Prioridade", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", items: grouped.med },
    { id: "baixa", label: "Baixa Prioridade", icon: Target, color: "text-blue-600", bg: "bg-blue-50", items: grouped.low },
  ];

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Painel de Prioridades</h1>
          <p className="text-slate-500">Ações recomendadas pela IA com base no impacto financeiro estimado.</p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            Carregando prioridades...
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            Não foi possível carregar as prioridades agora. Tente novamente em instantes.
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            <ShieldAlert className="h-4 w-4 text-slate-400" />
            Nenhuma prioridade encontrada para esta empresa.
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {columns.map((col) => (
              <div key={col.id} className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <div className={`rounded-lg ${col.bg} p-1.5`}>
                    <col.icon className={`h-5 w-5 ${col.color}`} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{col.label}</h2>
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                    {col.items.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {col.items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                      Sem itens
                    </div>
                  ) : (
                    col.items.map((item, i) => <PrioridadeCard key={i} task={item} />)
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </EcommerceLayout>
  );
}

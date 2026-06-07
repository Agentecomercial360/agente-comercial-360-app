import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  MoreVertical,
  Calendar,
  User,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/tarefas")({
  component: TarefasEcommerce,
  validateSearch: (s: Record<string, unknown>) => ({
    status: s.status === "pending" ? ("pending" as const) : undefined,
  }),
  head: () => ({
    meta: [{ title: "Tarefas Operacionais | Agente Comercial 360" }],
  }),
});

type TaskRow = {
  task_title?: string | null;
  task_description?: string | null;
  task_type?: string | null;
  priority?: string | null;
  status?: string | null;
  status_label?: string | null;
  responsible_name?: string | null;
  responsible_email?: string | null;
  due_date?: string | null;
  expected_impact?: string | null;
  result_summary?: string | null;
  completed_at?: string | null;
  product_name?: string | null;
  sku?: string | null;
  marketplace?: string | null;
  account_name?: string | null;
  recommended_action?: string | null;
  is_overdue?: boolean | null;
  priority_order?: number | null;
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
  blocked: "Bloqueada",
};

function priorityStyle(p?: string | null) {
  switch ((p ?? "").toLowerCase()) {
    case "critical":
      return "text-rose-700 font-bold";
    case "high":
      return "text-rose-600 font-bold";
    case "medium":
      return "text-amber-600 font-bold";
    case "low":
      return "text-blue-600 font-bold";
    default:
      return "text-slate-600";
  }
}

function statusStyle(s?: string | null) {
  switch ((s ?? "").toLowerCase()) {
    case "pending":
      return "bg-slate-100 text-slate-600";
    case "in_progress":
      return "bg-blue-100 text-blue-700";
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "cancelled":
      return "bg-slate-100 text-slate-500";
    case "blocked":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function fmtDate(d?: string | null) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(d));
  } catch {
    return String(d);
  }
}

function TarefasEcommerce() {
  const navigate = useNavigate();
  const { status: statusFilter } = Route.useSearch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);

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
        setTasks((data as TaskRow[]) ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Erro ao carregar tarefas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const counts = useMemo(() => {
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    for (const t of tasks) {
      const s = (t.status ?? "").toLowerCase();
      if (s === "pending") pending++;
      else if (s === "in_progress") inProgress++;
      else if (s === "completed") completed++;
    }
    return { pending, inProgress, completed };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (statusFilter === "pending") {
      return tasks.filter((t) => (t.status ?? "").toLowerCase() === "pending");
    }
    return tasks;
  }, [tasks, statusFilter]);

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tarefas Operacionais</h1>
            <p className="text-slate-500">Gestão de atividades geradas pela inteligência e pela equipe.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all">
            <ListTodo className="h-4 w-4" />
            Nova tarefa
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="rounded-xl bg-slate-100 p-2.5">
              <Clock className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pendentes</p>
              <p className="text-xl font-bold text-slate-900">{counts.pending}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-500">Em curso</p>
              <p className="text-xl font-bold text-slate-900">{counts.inProgress}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Concluídas</p>
              <p className="text-xl font-bold text-slate-900">{counts.completed}</p>
            </div>
          </div>
        </div>
        {statusFilter === "pending" && (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-600">
            <span>
              Filtro aplicado:{" "}
              <strong className="font-semibold text-slate-900">Tarefas pendentes</strong>
              <span className="ml-2 text-slate-400">
                ({filteredTasks.length} de {tasks.length})
              </span>
            </span>
            <button
              onClick={() => navigate({ to: "/ecommerce/tarefas", search: {} })}
              className="font-medium text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
            >
              Limpar filtro
            </button>
          </div>
        )}


        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            Carregando tarefas...
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            Não foi possível carregar as tarefas agora. Tente novamente em instantes.
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            Nenhuma tarefa encontrada para esta empresa.
          </div>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-900">Tarefa</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Contexto</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Prioridade</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Responsável</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Prazo</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Resultado Esperado</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map((t, i) => {
                    const prioKey = (t.priority ?? "").toLowerCase();
                    const statusKey = (t.status ?? "").toLowerCase();
                    const prioLabel = PRIORITY_LABEL[prioKey] ?? t.priority ?? "—";
                    const statusLabel = t.status_label ?? STATUS_LABEL[statusKey] ?? t.status ?? "—";
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{t.task_title ?? "Sem título"}</span>
                            {t.recommended_action && (
                              <span className="mt-0.5 text-[11px] text-slate-500">{t.recommended_action}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-700">{t.product_name ?? "—"}</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500">
                              {t.account_name ?? "—"}
                              {t.marketplace ? ` • ${t.marketplace}` : ""}
                            </span>
                            {t.sku && (
                              <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                                {t.sku}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs ${priorityStyle(t.priority)}`}>{prioLabel}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                              <User className="h-3 w-3 text-slate-500" />
                            </div>
                            <span className="text-xs font-medium text-slate-700">{t.responsible_name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-1.5 ${t.is_overdue ? "text-rose-600" : "text-slate-500"}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">{fmtDate(t.due_date)}</span>
                            {t.is_overdue && (
                              <span className="ml-1 rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-600">
                                Atrasada
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle(t.status)}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-emerald-600">{t.expected_impact ?? "—"}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 transition-colors">
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </EcommerceLayout>
  );
}

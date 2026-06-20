import { createFileRoute } from "@tanstack/react-router";
import {
  ListTodo,
  Clock,
  Activity,
  CheckCircle2,
  Flame,
  Search,
  Link2,
  Loader2,
  Users,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/tarefas")({
  component: TarefasOperadores,
  head: () => ({
    meta: [{ title: "Tarefas dos Operadores | Agente Comercial 360" }],
  }),
});

type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "blocked";

type TaskPriority = "critical" | "high" | "medium" | "low";

type EcommerceTask = {
  id: string;
  company_id: string;
  account_id: string | null;
  product_id: string | null;
  listing_id: string | null;
  insight_id: string | null;
  task_title: string | null;
  task_description: string | null;
  task_type: string | null;
  priority: TaskPriority | string | null;
  status: TaskStatus | string | null;
  responsible_name: string | null;
  responsible_email: string | null;
  due_date: string | null;
  expected_impact: string | null;
  result_summary: string | null;
  created_by: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const PRIORITY_STYLE: Record<string, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-rose-200 bg-rose-50 text-rose-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-slate-200 bg-slate-50 text-slate-700",
};

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
  blocked: "Bloqueada",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "border-slate-200 bg-slate-50 text-slate-700",
  in_progress: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-zinc-200 bg-zinc-50 text-zinc-600",
  blocked: "border-orange-200 bg-orange-50 text-orange-700",
};

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  in_progress: 1,
  blocked: 2,
  completed: 3,
  cancelled: 4,
};

const TYPE_LABEL: Record<string, string> = {
  review_stock: "Revisar estoque/anúncio pausado",
  review_price: "Revisar preço",
  review_description: "Revisar descrição",
  change_main_image: "Revisar imagem principal",
  create_kit: "Criar kit",
  activate_ads: "Ativar Ads",
  pause_ads: "Pausar Ads",
  increase_ads_budget: "Aumentar orçamento Ads",
  reduce_ads_budget: "Reduzir orçamento Ads",
  pause_listing: "Pausar anúncio",
  review_competition: "Revisar concorrência",
  other: "Outra ação",
};

const ORIGIN_LABEL: Record<string, string> = {
  central_acoes: "Central de Ações",
  ai: "IA",
  manual: "Manual",
};

const STATUS_OPTIONS: TaskStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "blocked",
  "cancelled",
];

type FilterKey =
  | "all"
  | "pending"
  | "in_progress"
  | "completed"
  | "high"
  | "central_acoes"
  | "ai";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendentes" },
  { key: "in_progress", label: "Em andamento" },
  { key: "completed", label: "Concluídas" },
  { key: "high", label: "Alta prioridade" },
  { key: "central_acoes", label: "Criadas pela Central de Ações" },
  { key: "ai", label: "Criadas por IA" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function TarefasOperadores() {
  const { activeAccount, activeAccountId, isActiveConnected, loading: accLoading } =
    useEcommerceActiveAccount();

  const [tasks, setTasks] = useState<EcommerceTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const loadTasks = useCallback(async () => {
    if (!activeAccountId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      // eslint-disable-next-line no-console
      console.debug("[tarefas] querying ecommerce_tasks", {
        company_id: ECOMMERCE_COMPANY_ID,
        account_id: activeAccountId,
      });
      const { data, error } = await supabase
        .from("ecommerce_tasks")
        .select(
          "id, company_id, account_id, product_id, listing_id, insight_id, task_title, task_description, task_type, priority, status, responsible_name, responsible_email, due_date, expected_impact, result_summary, created_by, completed_at, created_at, updated_at",
        )
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("account_id", activeAccountId)
        .order("created_at", { ascending: false });
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[tarefas] supabase error", error);
        throw error;
      }
      // eslint-disable-next-line no-console
      console.debug("[tarefas] rows returned:", data?.length ?? 0);
      setTasks((data as EcommerceTask[]) ?? []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[tarefas] load failed", err);
      toast.error("Não foi possível carregar as tarefas.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [activeAccountId]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleChangeStatus = useCallback(
    async (task: EcommerceTask, next: TaskStatus) => {
      if (next === task.status) return;
      setSavingId(task.id);
      const now = new Date().toISOString();
      const patch: Partial<EcommerceTask> = {
        status: next,
        updated_at: now,
        completed_at: next === "completed" ? now : null,
      };
      // Optimistic
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)),
      );
      try {
        const { error } = await supabase
          .from("ecommerce_tasks")
          .update(patch)
          .eq("id", task.id)
          .eq("company_id", ECOMMERCE_COMPANY_ID);
        if (error) throw error;
        toast.success("Status da tarefa atualizado.");
      } catch {
        toast.error("Não foi possível atualizar o status. Tente novamente.");
        // Revert
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? task : t)),
        );
      } finally {
        setSavingId(null);
      }
    },
    [],
  );

  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const sa = STATUS_ORDER[a.status ?? ""] ?? 99;
      const sb = STATUS_ORDER[b.status ?? ""] ?? 99;
      if (sa !== sb) return sa - sb;
      const pa = PRIORITY_ORDER[a.priority ?? ""] ?? 99;
      const pb = PRIORITY_ORDER[b.priority ?? ""] ?? 99;
      if (pa !== pb) return pa - pb;
      const da = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const db = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return da - db;
    });
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sorted.filter((t) => {
      if (filter === "pending" && t.status !== "pending") return false;
      if (filter === "in_progress" && t.status !== "in_progress") return false;
      if (filter === "completed" && t.status !== "completed") return false;
      if (filter === "high" && !(t.priority === "high" || t.priority === "critical"))
        return false;
      if (filter === "central_acoes" && t.created_by !== "central_acoes") return false;
      if (filter === "ai" && t.created_by !== "ai") return false;
      if (!q) return true;
      const hay = [
        t.task_title,
        t.task_description,
        t.responsible_name,
        t.task_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [sorted, filter, search]);

  const kpis = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const high = tasks.filter(
      (t) => t.priority === "high" || t.priority === "critical",
    ).length;
    return { total, pending, inProgress, completed, high };
  }, [tasks]);

  const accountName =
    activeAccount?.account_name || activeAccount?.nickname || "—";

  const showPending = !!activeAccount && !isActiveConnected;

  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <Users className="h-3.5 w-3.5" />
            Execução da Operação
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Tarefas dos Operadores
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Acompanhe as ações operacionais geradas para a conta selecionada.
          </p>
          {activeAccount && (
            <div className="text-xs text-muted-foreground">
              Conta analisada:{" "}
              <span className="font-semibold text-foreground">{accountName}</span>
            </div>
          )}
        </header>

        {/* Pending account state */}
        {showPending ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Link2 className="h-6 w-6" />
            </div>
            <div className="mt-3 font-display text-lg font-bold text-foreground">
              Esta conta ainda não está conectada.
            </div>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Conecte a conta Mercado Livre para gerar e acompanhar tarefas
              operacionais.
            </p>
          </section>
        ) : (
          <>
            {/* KPIs */}
            <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                {
                  label: "Total de tarefas",
                  value: kpis.total,
                  icon: ListTodo,
                  accent: "from-slate-700 to-slate-900",
                },
                {
                  label: "Pendentes",
                  value: kpis.pending,
                  icon: Clock,
                  accent: "from-slate-500 to-slate-700",
                },
                {
                  label: "Em andamento",
                  value: kpis.inProgress,
                  icon: Activity,
                  accent: "from-blue-700 to-blue-900",
                },
                {
                  label: "Concluídas",
                  value: kpis.completed,
                  icon: CheckCircle2,
                  accent: "from-emerald-600 to-emerald-800",
                },
                {
                  label: "Alta prioridade",
                  value: kpis.high,
                  icon: Flame,
                  accent: "from-red-700 to-red-900",
                },
              ].map((k) => {
                const Icon = k.icon;
                return (
                  <div
                    key={k.label}
                    className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)]"
                  >
                    <div
                      className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${k.accent} opacity-10`}
                    />
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {k.label}
                        </div>
                        <div className="font-display text-2xl font-bold text-foreground">
                          {loading ? "—" : k.value}
                        </div>
                      </div>
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${k.accent} text-white shadow-md`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Filters + search */}
            <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {FILTERS.map((f) => {
                    const active = filter === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                          active
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/60"
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar tarefa, responsável, tipo…"
                    className="w-72 max-w-full rounded-lg border border-border/60 bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:border-blue-300"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {[
                        "Prioridade",
                        "Tarefa",
                        "Tipo",
                        "Status",
                        "Responsável",
                        "Prazo",
                        "Impacto esperado",
                        "Origem",
                        "Ação",
                      ].map((c) => (
                        <th
                          key={c}
                          className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading || accLoading ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-16 text-center">
                          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-16 text-center">
                          <div className="mx-auto max-w-md space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                              <ListTodo className="h-6 w-6" />
                            </div>
                            <div className="font-display text-base font-semibold text-foreground">
                              Nenhuma tarefa encontrada para esta conta.
                            </div>
                            <p className="text-sm text-muted-foreground">
                              As tarefas serão geradas a partir da Central de
                              Ações ou pela IA.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((t) => {
                        const prio = (t.priority ?? "low") as string;
                        const status = (t.status ?? "pending") as string;
                        const type = t.task_type ?? "other";
                        const origin = t.created_by ?? "manual";
                        return (
                          <tr
                            key={t.id}
                            className="border-t border-border/60 hover:bg-muted/30"
                          >
                            <td className="px-4 py-3 align-top">
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  PRIORITY_STYLE[prio] ??
                                  "border-slate-200 bg-slate-50 text-slate-700"
                                }`}
                              >
                                {PRIORITY_LABEL[prio] ?? prio}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top max-w-[320px]">
                              <div className="font-semibold text-foreground text-sm">
                                {t.task_title || "Tarefa sem título"}
                              </div>
                              {t.task_description && (
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                  {t.task_description}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-foreground/80">
                              {TYPE_LABEL[type] ?? type}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    STATUS_STYLE[status] ??
                                    "border-slate-200 bg-slate-50 text-slate-700"
                                  }`}
                                >
                                  {STATUS_LABEL[status] ?? status}
                                </span>
                                {savingId === t.id && (
                                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-foreground/80">
                              {t.responsible_name || "—"}
                            </td>
                            <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-foreground/80">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {formatDate(t.due_date)}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top max-w-[220px] text-xs text-foreground/80">
                              {t.expected_impact || "—"}
                            </td>
                            <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-foreground/80">
                              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <ExternalLink className="h-3 w-3" />
                                {ORIGIN_LABEL[origin] ?? origin}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <select
                                aria-label="Alterar status da tarefa"
                                value={status}
                                disabled={savingId === t.id}
                                onChange={(e) =>
                                  handleChangeStatus(
                                    t,
                                    e.target.value as TaskStatus,
                                  )
                                }
                                className="rounded-lg border border-border/60 bg-background px-2 py-1 text-xs font-semibold text-foreground outline-none hover:bg-muted/60 focus:border-blue-300 disabled:opacity-50"
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>
                                    {STATUS_LABEL[s]}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </EcommerceLayout>
  );
}

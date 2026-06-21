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
  Eye,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  ECOMMERCE_COMPANY_ID,
  isAccountConnected,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

type EcommerceOperator = {
  id: string;
  operator_name: string;
  operator_email: string | null;
  role_name: string | null;
  is_active: boolean | null;
};

const NO_OPERATOR_VALUE = "__none__";

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

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}


const ROBOMIX_NIGHTLED_ACCOUNT_ID = "d2a28e18-e5d0-40e0-82cc-0bc0c0bcd8f4";

function TarefasOperadores() {
  return (
    <EcommerceLayout>
      <TarefasOperadoresContent />
    </EcommerceLayout>
  );
}

function TarefasOperadoresContent() {
  const {
    accounts,
    activeAccount,
    activeAccountId,
    isActiveConnected,
    loading: accLoading,
    setActiveAccountId,
  } = useEcommerceActiveAccount();

  const [tasks, setTasks] = useState<EcommerceTask[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [lastError, setLastError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<TaskStatus>("pending");
  const [draftResponsible, setDraftResponsible] = useState<string>("");
  const [draftResult, setDraftResult] = useState<string>("");
  const [saving, setSaving] = useState(false);


  const resolvedActiveAccountId = useMemo(() => {
    if (activeAccount?.id) return activeAccount.id;
    if (activeAccountId) return activeAccountId;

    const connectedNightled = accounts.find(
      (account) =>
        isAccountConnected(account) &&
        (account.account_name || account.nickname || "")
          .toLowerCase()
          .includes("nightled"),
    );
    if (connectedNightled?.id) return connectedNightled.id;

    const firstConnected = accounts.find(isAccountConnected);
    if (firstConnected?.id) return firstConnected.id;

    if (!accLoading && ECOMMERCE_COMPANY_ID === "ac7d24b9-5227-46ac-9ced-b66473422a17") {
      return ROBOMIX_NIGHTLED_ACCOUNT_ID;
    }

    return null;
  }, [accLoading, accounts, activeAccount, activeAccountId]);

  useEffect(() => {
    if (!activeAccountId && resolvedActiveAccountId) {
      setActiveAccountId(resolvedActiveAccountId);
    }
  }, [activeAccountId, resolvedActiveAccountId, setActiveAccountId]);

  const loadTasks = useCallback(async () => {
    if (accLoading) return;
    if (!resolvedActiveAccountId) {
      setTasks([]);
      setLastError(null);
      return;
    }
    setLoading(true);
    setLastError(null);
    try {
      // eslint-disable-next-line no-console
      console.debug("[tarefas] querying ecommerce_tasks", {
        company_id: ECOMMERCE_COMPANY_ID,
        account_id: resolvedActiveAccountId,
      });
      const { data, error } = await supabase
        .from("ecommerce_tasks")
        .select(
          "id, company_id, account_id, product_id, listing_id, insight_id, task_title, task_description, task_type, priority, status, responsible_name, responsible_email, due_date, expected_impact, result_summary, created_by, completed_at, created_at, updated_at",
        )
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("account_id", resolvedActiveAccountId)
        .order("created_at", { ascending: false });
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[tarefas] supabase error", error);
        setLastError(error.message || String(error));
        throw error;
      }
      // eslint-disable-next-line no-console
      console.debug("[tarefas] rows returned:", data?.length ?? 0);
      setTasks((data as EcommerceTask[]) ?? []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[tarefas] load failed", err);
      setLastError(err instanceof Error ? err.message : String(err));
      toast.error("Não foi possível carregar as tarefas.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [accLoading, resolvedActiveAccountId]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const currentDetail = useMemo(
    () => tasks.find((t) => t.id === detailId) ?? null,
    [tasks, detailId],
  );

  const openDetails = useCallback((task: EcommerceTask) => {
    setDetailId(task.id);
    setDraftStatus(((task.status ?? "pending") as TaskStatus));
    setDraftResponsible(task.responsible_name ?? "");
    setDraftResult(task.result_summary ?? "");
  }, []);

  const closeDetails = useCallback(() => {
    setDetailId(null);
  }, []);

  const handleSaveDetails = useCallback(async () => {
    if (!currentDetail) return;
    setSaving(true);
    const now = new Date().toISOString();
    const patch: Partial<EcommerceTask> = {
      status: draftStatus,
      responsible_name: draftResponsible.trim() || null,
      result_summary: draftResult.trim() || null,
      updated_at: now,
      completed_at: draftStatus === "completed" ? now : null,
    };
    try {
      const { error } = await supabase
        .from("ecommerce_tasks")
        .update(patch)
        .eq("id", currentDetail.id)
        .eq("company_id", ECOMMERCE_COMPANY_ID);
      if (error) throw error;
      toast.success("Tarefa atualizada.");
      setDetailId(null);
      await loadTasks();
    } catch {
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [currentDetail, draftStatus, draftResponsible, draftResult, loadTasks]);


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
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  STATUS_STYLE[status] ??
                                  "border-slate-200 bg-slate-50 text-slate-700"
                                }`}
                              >
                                {STATUS_LABEL[status] ?? status}
                              </span>
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
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 text-xs"
                                onClick={() => openDetails(t)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Ver detalhes
                              </Button>
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

        {/* Drawer de detalhes */}
        <Sheet
          open={!!detailId}
          onOpenChange={(open) => {
            if (!open) closeDetails();
          }}
        >
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            {currentDetail && (
              <>
                <SheetHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        PRIORITY_STYLE[currentDetail.priority ?? "low"] ??
                        "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {PRIORITY_LABEL[currentDetail.priority ?? "low"] ??
                        currentDetail.priority}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        STATUS_STYLE[currentDetail.status ?? "pending"] ??
                        "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {STATUS_LABEL[currentDetail.status ?? "pending"] ??
                        currentDetail.status}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      {ORIGIN_LABEL[currentDetail.created_by ?? "manual"] ??
                        currentDetail.created_by}
                    </span>
                  </div>
                  <SheetTitle className="font-display text-xl">
                    {currentDetail.task_title || "Tarefa sem título"}
                  </SheetTitle>
                  <SheetDescription>
                    {TYPE_LABEL[currentDetail.task_type ?? "other"] ??
                      currentDetail.task_type}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 py-5">
                  {currentDetail.task_description && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Descrição
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-line">
                        {currentDetail.task_description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Prazo
                      </div>
                      <div className="text-foreground/90">
                        {formatDate(currentDetail.due_date)}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Criada em
                      </div>
                      <div className="text-foreground/90">
                        {formatDateTime(currentDetail.created_at)}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Concluída em
                      </div>
                      <div className="text-foreground/90">
                        {formatDateTime(currentDetail.completed_at)}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Atualizada em
                      </div>
                      <div className="text-foreground/90">
                        {formatDateTime(currentDetail.updated_at)}
                      </div>
                    </div>
                  </div>

                  {currentDetail.expected_impact && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Impacto esperado
                      </div>
                      <p className="text-sm text-foreground/90">
                        {currentDetail.expected_impact}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="task-status">Status</Label>
                    <select
                      id="task-status"
                      value={draftStatus}
                      onChange={(e) =>
                        setDraftStatus(e.target.value as TaskStatus)
                      }
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-blue-300"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-responsible">Responsável</Label>
                    <Input
                      id="task-responsible"
                      value={draftResponsible}
                      onChange={(e) => setDraftResponsible(e.target.value)}
                      placeholder="Nome do responsável"
                      maxLength={120}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-result">Resultado registrado</Label>
                    <Textarea
                      id="task-result"
                      value={draftResult}
                      onChange={(e) => setDraftResult(e.target.value)}
                      placeholder="Ex.: Anúncio revisado e liberado para reativação."
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                </div>

                <SheetFooter className="gap-2 sm:gap-2">
                  <Button
                    variant="outline"
                    onClick={closeDetails}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveDetails} disabled={saving}>
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Salvar alterações
                  </Button>
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>

  );
}

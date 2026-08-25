import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  ShieldCheck,
  Rocket,
  History,
  Info,
  HelpCircle,
  Loader2,
  ExternalLink,
  ClipboardCheck,
  Eye,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/ecommerce/resultados")({
  component: ResultadosAcoes,
  head: () => ({
    meta: [{ title: "Resultados das Ações | Agente Comercial 360" }],
  }),
});

// ---------------- Types ----------------

type CompletedTask = {
  id: string;
  company_id: string;
  account_id: string | null;
  product_id: string | null;
  listing_id: string | null;
  insight_id: string | null;
  task_title: string | null;
  task_type: string | null;
  responsible_name: string | null;
  result_summary: string | null;
  created_by: string | null;
  completed_at: string | null;
  created_at: string | null;
};

type ActionResult = {
  id: string;
  company_id: string | null;
  account_id: string | null;
  task_id: string | null;
  task_title: string | null;
  task_status: string | null;
  product_id: string | null;
  product_name: string | null;
  listing_id: string | null;
  listing_title: string | null;
  result_status: string | null;
  result_status_label: string | null;
  result_summary: string | null;
  ai_evaluation: string | null;
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
  created_at: string | null;
  evaluated_at: string | null;
};

// ---------------- Helpers ----------------

const POSITIVE_STATUS = new Set(["improved", "positive", "positivo", "melhora", "melhorou"]);
const NEUTRAL_STATUS = new Set(["no_change", "neutral", "sem_impacto", "unchanged", "same"]);
const NEGATIVE_STATUS = new Set(["declined", "negative", "queda", "regrediu", "worsened", "worse"]);

const STOCK_KEYWORDS = ["estoque", "ruptura", "repos", "stock"];
const ADS_KEYWORDS = ["ads", "campanha", "anúncio publicit", "publicidade", "publicit"];

function isStockRelated(t: CompletedTask): boolean {
  const s = `${t.task_type ?? ""} ${t.task_title ?? ""}`.toLowerCase();
  return STOCK_KEYWORDS.some((k) => s.includes(k));
}
function isAdsRelated(t: CompletedTask): boolean {
  const s = `${t.task_type ?? ""} ${t.task_title ?? ""}`.toLowerCase();
  return ADS_KEYWORDS.some((k) => s.includes(k));
}

function fmtMoney(v: number | null | undefined): string {
  const n = typeof v === "number" && isFinite(v) ? v : 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(v: string | null | undefined): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return v;
  }
}

function originLabel(t: CompletedTask): string {
  const by = (t.created_by ?? "").toLowerCase();
  if (t.insight_id || by === "ai" || by === "diagnostico" || by.includes("insight")) {
    return "Diagnóstico Inteligente";
  }
  if (by === "central_acoes" || by.includes("central")) return "Central de Ações";
  if (by === "manual" || !by) return "Manual";
  return by;
}

type ImpactBucket = "positive" | "neutral" | "negative" | "pending";
function bucketOf(status: string | null | undefined): ImpactBucket {
  const s = (status ?? "").toLowerCase();
  if (POSITIVE_STATUS.has(s)) return "positive";
  if (NEUTRAL_STATUS.has(s)) return "neutral";
  if (NEGATIVE_STATUS.has(s)) return "negative";
  return "pending";
}

const IMPACT_LABEL: Record<ImpactBucket, string> = {
  positive: "Impacto Positivo",
  neutral: "Sem Impacto",
  negative: "Impacto Negativo",
  pending: "Aguardando Medição",
};

const IMPACT_VARIANT: Record<ImpactBucket, "default" | "secondary" | "destructive" | "outline"> = {
  positive: "default",
  neutral: "secondary",
  negative: "destructive",
  pending: "outline",
};

const IMPACT_ICON: Record<ImpactBucket, typeof TrendingUp> = {
  positive: TrendingUp,
  neutral: Minus,
  negative: TrendingDown,
  pending: HelpCircle,
};

const isDev = import.meta.env.DEV;

// ---------------- Component ----------------

function ResultadosAcoes() {
  return (
    <EcommerceLayout>
      <ResultadosAcoesContent />
    </EcommerceLayout>
  );
}

function ResultadosAcoesContent() {
  const { activeAccountId, activeAccount, loading: accLoading } =
    useEcommerceActiveAccount();

  const [tasks, setTasks] = useState<CompletedTask[]>([]);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalTasksCount, setTotalTasksCount] = useState<number>(0);
  const [results, setResults] = useState<ActionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultsAvailable, setResultsAvailable] = useState<boolean>(true);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (accLoading) return;
    if (!activeAccountId) {
      setTasks([]);
      setResults([]);
      setCompletedCount(0);
      setTotalTasksCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLastError(null);
    try {
      const { count: totalCount, error: totErr } = await supabase
        .from("ecommerce_tasks")
        .select("id", { count: "exact", head: true })
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("account_id", activeAccountId);
      if (totErr) {
        console.error("[resultados] total tasks count error", totErr);
        setLastError(`total tasks: ${totErr.message}`);
        setTotalTasksCount(0);
      } else {
        setTotalTasksCount(totalCount ?? 0);
      }

      const { count: cCount, error: cErr } = await supabase
        .from("ecommerce_tasks")
        .select("id", { count: "exact", head: true })
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("account_id", activeAccountId)
        .eq("status", "completed");
      if (cErr) {
        console.error("[resultados] completed count error", cErr);
        setLastError(`completed count: ${cErr.message}`);
        setCompletedCount(0);
      } else {
        setCompletedCount(cCount ?? 0);
      }

      const { data: tData, error: tErr } = await supabase
        .from("ecommerce_tasks")
        .select(
          "id, company_id, account_id, product_id, listing_id, insight_id, task_title, task_type, responsible_name, result_summary, created_by, completed_at, created_at",
        )
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("account_id", activeAccountId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });
      if (tErr) {
        console.error("[resultados] tasks error", tErr);
        setLastError(`tasks select: ${tErr.message}`);
        toast.error("Não foi possível carregar tarefas concluídas.");
        setTasks([]);
      } else {
        setTasks((tData as CompletedTask[]) ?? []);
      }

      const { data: rData, error: rErr } = await supabase
        .from("vw_ecommerce_action_results")
        .select("*")
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("account_id", activeAccountId);
      if (rErr) {
        console.warn("[resultados] action results indisponível:", rErr.message);
        setLastError(`vw_ecommerce_action_results: ${rErr.message}`);
        setResults([]);
        setResultsAvailable(false);
      } else {
        setResults((rData as ActionResult[]) ?? []);
        setResultsAvailable(true);
      }
    } finally {
      setLoading(false);
    }
  }, [accLoading, activeAccountId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const resultsByTask = useMemo(() => {
    const m = new Map<string, ActionResult>();
    for (const r of results) {
      if (r.task_id) m.set(r.task_id, r);
    }
    return m;
  }, [results]);

  const completedTaskIds = useMemo(
    () => new Set(tasks.map((t) => t.id)),
    [tasks],
  );

  const resultsCompleted = useMemo(
    () =>
      results.filter(
        (r) =>
          (r.task_status ?? "").toLowerCase() === "completed" ||
          (r.task_id && completedTaskIds.has(r.task_id)),
      ),
    [results, completedTaskIds],
  );

  const resultsPending = useMemo(
    () =>
      results.filter((r) => {
        const st = (r.task_status ?? "").toLowerCase();
        const linkedCompleted = r.task_id && completedTaskIds.has(r.task_id);
        return st !== "completed" && !linkedCompleted;
      }),
    [results, completedTaskIds],
  );

  const kpis = useMemo(() => {
    const completed = Math.max(completedCount, tasks.length);
    let positive = 0;
    let neutral = 0;
    let negative = 0;
    let revenue = 0;
    let stockCount = 0;
    let adsCount = 0;
    for (const r of resultsCompleted) {
      const b = bucketOf(r.result_status);
      if (b === "positive") positive += 1;
      else if (b === "neutral") neutral += 1;
      else if (b === "negative") negative += 1;
      if (
        b === "positive" &&
        r.revenue_difference &&
        r.revenue_difference > 0
      ) {
        revenue += r.revenue_difference;
      }
    }
    for (const t of tasks) {
      if (isStockRelated(t)) stockCount += 1;
      if (isAdsRelated(t)) adsCount += 1;
    }
    return { completed, positive, neutral, negative, revenue, stockCount, adsCount };
  }, [tasks, resultsCompleted, completedCount]);

  const hasCompleted = tasks.length > 0;
  const hasResults = results.length > 0;

  const detailTask = useMemo(
    () => tasks.find((t) => t.id === detailTaskId) ?? null,
    [tasks, detailTaskId],
  );
  const detailResult = detailTask ? resultsByTask.get(detailTask.id) ?? null : null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              <BarChart3 className="h-3.5 w-3.5" />
              Medição de Impacto
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Resultados das Ações
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-[15px]">
              Acompanhe o impacto real das ações concluídas pela operação —
              vendas, estoque, anúncios e desempenho dos produtos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RegistrarResultadoDialog
              tasks={tasks}
              activeAccountId={activeAccountId}
              measuredTaskIds={resultsByTask}
              onSaved={loadAll}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
              onClick={() => void loadAll()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <History className="mr-1.5 h-3.5 w-3.5" />
              )}
              Atualizar
            </Button>
          </div>
        </header>

        {!accLoading && !activeAccountId && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-900">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Conta ativa não identificada para medição de resultados.</span>
          </div>
        )}

        {hasCompleted && !hasResults && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Existem tarefas concluídas, mas ainda não há medição de impacto
              registrada. Use <strong>Registrar resultado manual</strong> para
              documentar o efeito observado.
            </span>
          </div>
        )}
        {!resultsAvailable && (
          <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              A tabela de resultados ainda não está disponível para esta conta.
              Os cards mostrarão zero até que a medição seja registrada.
            </span>
          </div>
        )}

        {resultsPending.length > 0 && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-900">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div className="space-y-1">
              <div>
                Existem <strong>{resultsPending.length}</strong> resultado(s) medido(s)
                vinculado(s) a tarefa(s) ainda não concluída(s). Esses valores
                <strong> não entram</strong> nos KPIs principais.
              </div>
              <ul className="list-disc space-y-0.5 pl-4">
                {resultsPending.slice(0, 5).map((r) => (
                  <li key={r.id}>
                    <span className="font-medium">{r.task_title ?? "Tarefa"}</span>
                    {" — status: "}
                    <span className="uppercase">{r.task_status ?? "—"}</span>
                    {" · resultado: "}
                    <span>{IMPACT_LABEL[bucketOf(r.result_status)]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Métricas de Impacto */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Card de destaque — Receita estimada gerada */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-[var(--shadow-soft)] lg:col-span-2">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/10" />
            <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                  <DollarSign className="h-3.5 w-3.5" />
                  Receita estimada gerada
                </div>
                <div className="font-display text-3xl font-bold text-emerald-900 md:text-4xl">
                  {fmtMoney(kpis.revenue)}
                </div>
                <p className="max-w-md text-xs text-emerald-800/80">
                  Soma das diferenças positivas de faturamento registradas nas
                  ações com impacto positivo.
                </p>
              </div>
              <div className="flex min-w-[140px] flex-col gap-1 rounded-xl border border-emerald-100/80 bg-white/70 p-3 backdrop-blur-sm">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800/70">
                  Estoque protegido
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <span className="font-display text-xl font-bold text-emerald-900">
                    {kpis.stockCount}
                  </span>
                  <span className="text-xs text-emerald-800/70">ações</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid secundário compacto */}
          <div className="grid grid-cols-2 gap-3">
            <CompactKpi label="Ações concluídas" value={String(kpis.completed)} />
            <CompactKpi label="Impacto positivo" value={String(kpis.positive)} accent="emerald" />
            <CompactKpi label="Sem impacto" value={String(kpis.neutral)} accent="slate" />
            <CompactKpi label="Campanhas otimizadas" value={String(kpis.adsCount)} accent="violet" />
          </div>
        </section>

        {/* Histórico de ações executadas */}
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-white">
                <History className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Histórico de ações executadas
                  </h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground">
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs text-xs">
                      Toda medição registrada aqui é interna e não altera nada no
                      Mercado Livre. O objetivo é aprender com os dados e melhorar as
                      próximas recomendações.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tarefas concluídas na operação e o impacto medido, quando já
                  registrado.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[26%] pl-5">Tarefa</TableHead>
                  <TableHead className="w-[12%]">Origem</TableHead>
                  <TableHead className="w-[20%]">Produto / Anúncio</TableHead>
                  <TableHead className="w-[13%] whitespace-nowrap">Concluída em</TableHead>
                  <TableHead className="w-[14%]">Resultado / Impacto</TableHead>
                  <TableHead className="w-[10%] text-right pr-5">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="hover:bg-transparent">
                      <TableCell className="pl-5">
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-[80%]" />
                          <Skeleton className="h-3 w-[40%]" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-[90%]" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                      <TableCell className="pr-5 text-right"><Skeleton className="ml-auto h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : tasks.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="py-14 text-center">
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((t) => {
                    const r = resultsByTask.get(t.id);
                    const b = bucketOf(r?.result_status);
                    const Icon = IMPACT_ICON[b];
                    const productName =
                      r?.product_name ?? r?.listing_title ?? t.task_title ?? "—";
                    const productCode =
                      t.listing_id ?? t.product_id ?? r?.listing_id ?? r?.product_id ?? null;
                    return (
                      <TableRow key={t.id} className="group">
                        <TableCell className="pl-5">
                          <div className="space-y-0.5">
                            <div className="font-medium text-foreground line-clamp-1">
                              {t.task_title ?? "Tarefa sem título"}
                            </div>
                            {t.responsible_name && (
                              <div className="text-xs text-muted-foreground">
                                Resp. {t.responsible_name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <span className="text-xs">{originLabel(t)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="max-w-[220px] truncate text-sm text-foreground" title={productName}>
                              {productName}
                            </div>
                            {productCode && (
                              <div className="font-mono text-[10px] text-muted-foreground">
                                {productCode}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(t.completed_at ?? t.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={IMPACT_VARIANT[b]}
                            className="gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                          >
                            <Icon className="h-3 w-3" />
                            {IMPACT_LABEL[b]}
                          </Badge>
                          {r?.result_summary && (
                            <div className="mt-1.5 max-w-[200px] truncate text-[11px] text-muted-foreground" title={r.result_summary}>
                              {r.result_summary}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => setDetailTaskId(t.id)}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Debug operacional da medição — apenas em desenvolvimento */}
        {isDev && (
          <details className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3 text-[11px] text-slate-700">
            <summary className="cursor-pointer font-semibold uppercase tracking-wider text-slate-600">
              Debug operacional da medição
            </summary>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 font-mono md:grid-cols-2">
              <div><span className="text-slate-500">company_id:</span> {ECOMMERCE_COMPANY_ID}</div>
              <div><span className="text-slate-500">account_id:</span> {activeAccountId ?? "—"}</div>
              <div><span className="text-slate-500">conta ativa:</span> {activeAccount?.account_name ?? activeAccount?.nickname ?? "—"}</div>
              <div><span className="text-slate-500">total de tarefas encontradas:</span> {totalTasksCount}</div>
              <div><span className="text-slate-500">total de tarefas completed encontradas:</span> {completedCount}</div>
              <div><span className="text-slate-500">total de resultados medidos:</span> {results.length}</div>
              <div><span className="text-slate-500">fonte Ações concluídas:</span> ecommerce_tasks (status=completed)</div>
              <div><span className="text-slate-500">fonte impactos:</span> vw_ecommerce_action_results</div>
              <div className="md:col-span-2">
                <span className="text-slate-500">último erro Supabase:</span>{" "}
                {lastError ? <span className="text-rose-700">{lastError}</span> : "nenhum"}
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              Bloco de diagnóstico apenas leitura. Não altera dados, não cria registros, não envia nada ao Mercado Livre.
            </p>
          </details>
        )}
      </div>

      {/* Drawer de detalhes */}
      <Sheet open={!!detailTaskId} onOpenChange={(v) => !v && setDetailTaskId(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          {detailTask && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">
                  {detailTask.task_title ?? "Tarefa"}
                </SheetTitle>
                <SheetDescription className="text-left">
                  Detalhes da ação concluída e do impacto medido.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <MetaLine label="Origem" value={originLabel(detailTask)} />
                <MetaLine
                  label="Conta"
                  value={activeAccount?.account_name ?? "—"}
                />
                <MetaLine
                  label="Produto / Anúncio"
                  value={
                    detailResult?.product_name ??
                    detailResult?.listing_title ??
                    detailTask.listing_id ??
                    detailTask.product_id ??
                    "—"
                  }
                />
                <MetaLine
                  label="Responsável"
                  value={detailTask.responsible_name ?? "—"}
                />
                <MetaLine
                  label="Concluída em"
                  value={formatDate(detailTask.completed_at)}
                />
                {detailTask.result_summary && (
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Resultado registrado na tarefa
                    </div>
                    <p className="rounded-lg border border-border/60 bg-muted/30 p-3 text-foreground/80">
                      {detailTask.result_summary}
                    </p>
                  </div>
                )}
                {detailResult ? (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Medição de impacto
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <MetricBlock
                        label="Visitas"
                        before={detailResult.before_visits}
                        after={detailResult.after_visits}
                      />
                      <MetricBlock
                        label="Vendas"
                        before={detailResult.before_sales_count}
                        after={detailResult.after_sales_count}
                      />
                      <MetricBlock
                        label="Faturamento"
                        before={detailResult.before_revenue}
                        after={detailResult.after_revenue}
                        money
                      />
                      <MetricBlock
                        label="Conversão"
                        before={detailResult.before_conversion_rate}
                        after={detailResult.after_conversion_rate}
                        pct
                      />
                    </div>
                    {detailResult.ai_evaluation && (
                      <p className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 text-xs text-indigo-900">
                        {detailResult.ai_evaluation}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Aguardando medição. Use “Registrar resultado manual” para
                      documentar o impacto observado desta ação.
                    </span>
                  </div>
                )}
                {detailTask.insight_id && (
                  <a
                    className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline"
                    href="/ecommerce/radar-ia"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver insight vinculado
                  </a>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

// ---------------- UI bits ----------------

function CompactKpi({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: string;
  accent?: "slate" | "emerald" | "violet";
}) {
  const color =
    accent === "emerald"
      ? "border-emerald-100 bg-emerald-50/60 text-emerald-900"
      : accent === "violet"
        ? "border-violet-100 bg-violet-50/60 text-violet-900"
        : "border-slate-100 bg-slate-50/60 text-slate-900";
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md space-y-3">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div className="font-display text-base font-semibold text-foreground">
        Nenhuma ação concluída ainda
      </div>
      <p className="text-sm text-muted-foreground">
        Quando a equipe concluir tarefas em{" "}
        <em>Tarefas da Operação</em>, o histórico aparecerá aqui com o impacto
        observado.
      </p>
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="min-w-[110px] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function MetricBlock({
  label,
  before,
  after,
  money,
  pct,
}: {
  label: string;
  before: number | null;
  after: number | null;
  money?: boolean;
  pct?: boolean;
}) {
  const fmt = (v: number | null) => {
    if (v == null) return "—";
    if (money) return fmtMoney(v);
    if (pct) return `${v.toFixed(2).replace(".", ",")}%`;
    return v.toLocaleString("pt-BR");
  };
  const diff =
    pct && before != null && after != null ? after - before : null;
  const diffLabel =
    diff != null
      ? `${diff >= 0 ? "+" : ""}${diff.toFixed(2).replace(".", ",")} p.p.`
      : null;
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs">
        <span className="text-muted-foreground">{fmt(before)}</span>
        <span className="text-muted-foreground">→</span>
        <span className="font-semibold text-foreground">{fmt(after)}</span>
        {diffLabel && (
          <span
            className={`ml-1 text-[10px] font-medium ${
              diff! >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {diffLabel}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------- Registrar resultado manual ----------------

type MetricKind =
  | "visitas"
  | "vendas"
  | "faturamento"
  | "conversao"
  | "estoque"
  | "ads"
  | "margem";

const METRIC_OPTIONS: { value: MetricKind; label: string }[] = [
  { value: "visitas", label: "Visitas" },
  { value: "vendas", label: "Vendas" },
  { value: "faturamento", label: "Faturamento" },
  { value: "conversao", label: "Conversão (%)" },
  { value: "estoque", label: "Estoque" },
  { value: "ads", label: "Ads / Campanha" },
  { value: "margem", label: "Margem" },
];

function RegistrarResultadoDialog({
  tasks,
  activeAccountId,
  measuredTaskIds,
  onSaved,
}: {
  tasks: CompletedTask[];
  activeAccountId: string | null;
  measuredTaskIds: Map<string, ActionResult>;
  onSaved: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    taskId: "",
    impact: "improved" as "improved" | "no_change" | "declined",
    metric: "vendas" as MetricKind,
    before: "",
    after: "",
    revenue: "",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const reset = () =>
    setForm({
      taskId: "",
      impact: "improved",
      metric: "vendas",
      before: "",
      after: "",
      revenue: "",
      note: "",
      date: new Date().toISOString().slice(0, 10),
    });

  const parseNum = (v: string): number | null => {
    if (!v.trim()) return null;
    const n = Number(v.replace(",", "."));
    return isFinite(n) ? n : null;
  };

  const onSubmit = async () => {
    const t = tasks.find((x) => x.id === form.taskId);
    if (!t || measuredTaskIds.has(t.id)) {
      toast.error("Selecione uma tarefa concluída sem medição registrada.");
      return;
    }
    const before = parseNum(form.before);
    const after = parseNum(form.after);
    const revenue = parseNum(form.revenue);
    const evaluatedAt = form.date
      ? new Date(form.date + "T12:00:00").toISOString()
      : new Date().toISOString();

    const payload: Record<string, unknown> = {
      company_id: ECOMMERCE_COMPANY_ID,
      task_id: t.id,
      product_id: t.product_id,
      listing_id: t.listing_id,
      result_status: form.impact,
      result_summary: form.note.trim() || null,
      evaluation_date: evaluatedAt.slice(0, 10),
    };

    if (form.metric === "visitas") {
      payload.before_visits = before;
      payload.after_visits = after;
    } else if (form.metric === "vendas") {
      payload.before_sales_count = before;
      payload.after_sales_count = after;
    } else if (form.metric === "faturamento") {
      payload.before_revenue = before;
      payload.after_revenue = after;
    } else if (form.metric === "conversao") {
      const b = before != null && before > 1 ? before / 100 : before;
      const a = after != null && after > 1 ? after / 100 : after;
      payload.before_conversion_rate = b;
      payload.after_conversion_rate = a;
    }

    if (revenue != null && payload.before_revenue == null && payload.after_revenue == null) {
      payload.before_revenue = 0;
      payload.after_revenue = revenue;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("ecommerce_action_results")
        .insert(payload);
      if (error) {
        console.error("[resultados] insert error", error);
        toast.error(
          `Não foi possível registrar o resultado: ${error.message}`,
        );
        return;
      }
      toast.success("Resultado registrado com sucesso.");
      reset();
      setOpen(false);
      await onSaved();
    } catch (err) {
      console.error("[resultados] insert exception", err);
      toast.error("Erro inesperado ao registrar o resultado.");
    } finally {
      setSaving(false);
    }
  };

  const completedTasks = tasks;
  const pendingTasks = completedTasks.filter((t) => !measuredTaskIds.has(t.id));
  const hasPending = pendingTasks.length > 0;
  const fieldsDisabled = !form.taskId || measuredTaskIds.has(form.taskId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-9 rounded-full border-border/70 bg-card/60 px-4 text-xs font-semibold text-foreground/80 hover:bg-muted/60"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Registrar resultado manual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Registrar resultado manual</DialogTitle>
          <DialogDescription>
            Documente o impacto observado de uma tarefa concluída. Nenhuma
            alteração é feita no Mercado Livre.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Tarefa concluída</Label>
            <Select
              value={form.taskId}
              onValueChange={(v) => setForm({ ...form, taskId: v })}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    completedTasks.length === 0
                      ? "Nenhuma tarefa concluída disponível"
                      : "Selecione uma tarefa"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {[...completedTasks]
                  .sort((a, b) => {
                    const am = measuredTaskIds.has(a.id) ? 1 : 0;
                    const bm = measuredTaskIds.has(b.id) ? 1 : 0;
                    return am - bm;
                  })
                  .map((t) => {
                    const measured = measuredTaskIds.has(t.id);
                    return (
                      <SelectItem key={t.id} value={t.id} disabled={measured}>
                        {(t.task_title ?? "Tarefa").slice(0, 60)}
                        {t.completed_at
                          ? ` · ${formatDate(t.completed_at)}`
                          : ""}
                        {measured ? " · Medição já registrada" : ""}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
            {form.taskId && measuredTaskIds.has(form.taskId) && (
              <p className="text-[11px] text-amber-700">
                Esta tarefa já possui medição registrada. Para evitar
                duplicidade, visualize o resultado existente.
              </p>
            )}
          </div>
          {!hasPending && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-4 text-sm text-amber-900 sm:col-span-2">
              <p className="font-semibold">Nenhuma medição pendente</p>
              <p className="mt-1 text-xs text-amber-900/80">
                Todas as tarefas concluídas desta conta já possuem resultado registrado. Para registrar uma nova medição, conclua uma nova tarefa primeiro.
              </p>
            </div>
          )}
          {hasPending && (<>
          <div className="space-y-1.5">
            <Label>Tipo de impacto</Label>
            <Select
              value={form.impact}
              onValueChange={(v) =>
                setForm({ ...form, impact: v as typeof form.impact })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="improved">Positivo (melhorou)</SelectItem>
                <SelectItem value="no_change">Sem impacto</SelectItem>
                <SelectItem value="declined">Queda / alerta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Métrica impactada</Label>
            <Select
              value={form.metric}
              onValueChange={(v) =>
                setForm({ ...form, metric: v as MetricKind })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-antes">Valor antes</Label>
            <Input
              id="r-antes"
              inputMode="decimal"
              value={form.before}
              onChange={(e) => setForm({ ...form, before: e.target.value })}
              placeholder="Ex: 100"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-depois">Valor depois</Label>
            <Input
              id="r-depois"
              inputMode="decimal"
              value={form.after}
              onChange={(e) => setForm({ ...form, after: e.target.value })}
              placeholder="Ex: 135"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-rev">Receita estimada gerada (R$)</Label>
            <Input
              id="r-rev"
              inputMode="decimal"
              value={form.revenue}
              onChange={(e) => setForm({ ...form, revenue: e.target.value })}
              placeholder="Opcional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-data">Data da medição</Label>
            <Input
              id="r-data"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="r-obs">Observação</Label>
            <Textarea
              id="r-obs"
              rows={3}
              placeholder="Contexto, aprendizado ou hipótese"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          </>)}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={saving}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={onSubmit} disabled={saving || fieldsDisabled || !hasPending} className="disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none disabled:hover:bg-muted">
            {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

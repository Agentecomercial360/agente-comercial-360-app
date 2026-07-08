import { createFileRoute } from "@tanstack/react-router";
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
  Lightbulb,
  Info,
  Activity,
  AlertTriangle,
  Eye,
  ClipboardCheck,
  HelpCircle,
  Loader2,
  ExternalLink,
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
  positive: "Melhorou",
  neutral: "Sem mudança",
  negative: "Queda / alerta",
  pending: "Aguardando medição",
};

const IMPACT_STYLE: Record<ImpactBucket, string> = {
  positive: "border-emerald-200 bg-emerald-50 text-emerald-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  negative: "border-rose-200 bg-rose-50 text-rose-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
};

const IMPACT_ICON: Record<ImpactBucket, typeof TrendingUp> = {
  positive: TrendingUp,
  neutral: Minus,
  negative: TrendingDown,
  pending: HelpCircle,
};

// ---------------- Component ----------------

function ResultadosAcoes() {
  // Renderiza o Layout (que expõe o provider de conta ativa) e o conteúdo
  // real como filho para que useEcommerceActiveAccount leia o MESMO context
  // usado pelo header/topbar (fonte única da conta ativa).
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
      // Total de tarefas da conta (qualquer status) — para debug
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

      // Contagem dedicada de tarefas concluídas — fonte real do KPI.
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

      // Concluded tasks (full rows for listing)
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

      // Action results (view — tem account_id via join).
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

  // Index results by task
  const resultsByTask = useMemo(() => {
    const m = new Map<string, ActionResult>();
    for (const r of results) {
      if (r.task_id) m.set(r.task_id, r);
    }
    return m;
  }, [results]);

  // KPIs
  const kpis = useMemo(() => {
    // Ações concluídas: contagem real em ecommerce_tasks (não depende da view).
    const completed = Math.max(completedCount, tasks.length);
    let positive = 0;
    let neutral = 0;
    let negative = 0;
    let revenue = 0;
    let stockCount = 0;
    let adsCount = 0;
    for (const r of results) {
      const b = bucketOf(r.result_status);
      if (b === "positive") positive += 1;
      else if (b === "neutral") neutral += 1;
      else if (b === "negative") negative += 1;
      if (r.revenue_difference && r.revenue_difference > 0) {
        revenue += r.revenue_difference;
      }
    }
    for (const t of tasks) {
      if (isStockRelated(t)) stockCount += 1;
      if (isAdsRelated(t)) adsCount += 1;
    }
    return { completed, positive, neutral, negative, revenue, stockCount, adsCount };
  }, [tasks, results, completedCount]);

  const hasCompleted = tasks.length > 0;
  const hasResults = results.length > 0;

  const detailTask = useMemo(
    () => tasks.find((t) => t.id === detailTaskId) ?? null,
    [tasks, detailTaskId],
  );
  const detailResult = detailTask ? resultsByTask.get(detailTask.id) ?? null : null;

  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <Activity className="h-3.5 w-3.5" />
            Medição de Impacto
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Resultados das Ações
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Acompanhe o impacto real das ações concluídas pela operação —
            vendas, estoque, anúncios e desempenho dos produtos da conta{" "}
            <strong className="text-foreground">
              {activeAccount?.account_name ?? "Mercado Livre"}
            </strong>
            .
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <RegistrarResultadoDialog
            tasks={tasks}
            activeAccountId={activeAccountId}
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
              <Activity className="mr-1.5 h-3.5 w-3.5" />
            )}
            Atualizar
          </Button>
        </div>

        {/* Aviso de contexto */}
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

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <KpiCard
            label="Ações concluídas"
            value={String(kpis.completed)}
            icon={CheckCircle2}
            accent="from-emerald-600 to-emerald-800"
          />
          <KpiCard
            label="Ações com impacto positivo"
            value={String(kpis.positive)}
            icon={TrendingUp}
            accent="from-emerald-700 to-green-900"
            hint={
              !hasResults && hasCompleted
                ? "Sem medição registrada ainda."
                : undefined
            }
          />
          <KpiCard
            label="Ações sem impacto"
            value={String(kpis.neutral)}
            icon={Minus}
            accent="from-slate-600 to-slate-800"
            hint={
              !hasResults && hasCompleted
                ? "Sem medição registrada ainda."
                : undefined
            }
          />
          <KpiCard
            label="Receita estimada gerada"
            value={fmtMoney(kpis.revenue)}
            icon={DollarSign}
            accent="from-blue-700 to-blue-900"
            hint={
              kpis.revenue === 0
                ? "Ainda sem receita estimada registrada."
                : undefined
            }
          />
          <KpiCard
            label="Estoque protegido"
            value={String(kpis.stockCount)}
            icon={ShieldCheck}
            accent="from-indigo-600 to-indigo-800"
            hint={
              kpis.stockCount === 0
                ? "Sem ações de estoque concluídas."
                : undefined
            }
          />
          <KpiCard
            label="Campanhas otimizadas"
            value={String(kpis.adsCount)}
            icon={Rocket}
            accent="from-violet-600 to-violet-800"
            hint={
              kpis.adsCount === 0
                ? "Sem ações de Ads concluídas."
                : undefined
            }
          />
        </section>

        {/* Histórico de ações executadas */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-white">
                <History className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Histórico de ações executadas
                </h2>
                <p className="text-xs text-muted-foreground max-w-2xl">
                  Tarefas concluídas na operação e o impacto medido, quando já
                  registrado.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Tarefa</th>
                  <th className="px-4 py-3 text-left font-semibold">Origem</th>
                  <th className="px-4 py-3 text-left font-semibold">Produto / Anúncio</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                    Concluída em
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Resultado</th>
                  <th className="px-4 py-3 text-left font-semibold">Impacto</th>
                  <th className="px-4 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="mx-auto max-w-md space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div className="font-display text-base font-semibold text-foreground">
                          Nenhuma ação concluída ainda
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Quando a equipe concluir tarefas em{" "}
                          <em>Tarefas da Operação</em>, o histórico aparecerá
                          aqui com o impacto observado.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => {
                    const r = resultsByTask.get(t.id);
                    const b = bucketOf(r?.result_status);
                    const Icon = IMPACT_ICON[b];
                    const productLabel =
                      r?.product_name ??
                      r?.listing_title ??
                      t.listing_id ??
                      t.product_id ??
                      "—";
                    return (
                      <tr key={t.id} className="border-t border-border/50 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">
                            {t.task_title ?? "Tarefa sem título"}
                          </div>
                          {t.responsible_name && (
                            <div className="text-xs text-muted-foreground">
                              Responsável: {t.responsible_name}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {originLabel(t)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[240px] truncate">
                          {productLabel}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {formatDate(t.completed_at ?? t.created_at)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[260px]">
                          <span className="line-clamp-2">
                            {t.result_summary ??
                              r?.result_summary ??
                              "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${IMPACT_STYLE[b]}`}
                          >
                            <Icon className="h-3 w-3" />
                            {IMPACT_LABEL[b]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDetailTaskId(t.id)}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
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

        {/* Classificação */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Classificação do resultado
            </h2>
            <p className="text-xs text-muted-foreground">
              Como o sistema classifica cada ação após avaliar o impacto.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {(
              [
                {
                  label: "Impacto positivo",
                  desc: "A ação melhorou vendas, margem, estoque ou eficiência.",
                  ring: "border-emerald-200 bg-emerald-50/60",
                  badge: "text-emerald-700",
                  dot: "bg-emerald-600",
                  icon: TrendingUp,
                },
                {
                  label: "Sem impacto",
                  desc: "A ação foi executada, mas ainda não apresentou melhora relevante.",
                  ring: "border-slate-200 bg-slate-50/60",
                  badge: "text-slate-700",
                  dot: "bg-slate-500",
                  icon: Minus,
                },
                {
                  label: "Impacto negativo",
                  desc: "A ação pode ter reduzido desempenho e exige revisão.",
                  ring: "border-rose-200 bg-rose-50/60",
                  badge: "text-rose-700",
                  dot: "bg-rose-600",
                  icon: AlertTriangle,
                },
                {
                  label: "Aguardando medição",
                  desc: "Ação concluída, mas ainda sem resultado registrado.",
                  ring: "border-amber-200 bg-amber-50/60",
                  badge: "text-amber-700",
                  dot: "bg-amber-500",
                  icon: Eye,
                },
              ] as const
            ).map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className={`rounded-xl border p-4 ${c.ring}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${c.badge}`}
                    >
                      {c.label}
                    </span>
                    <Icon className={`ml-auto h-3.5 w-3.5 ${c.badge}`} />
                  </div>
                  <p className="text-sm text-foreground/80 leading-snug">
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-transparent p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 text-blue-700 shrink-0" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              Toda medição registrada aqui é interna e não altera nada no
              Mercado Livre. O objetivo é aprender com os dados e melhorar as
              próximas recomendações.
            </p>
          </div>
        </div>

        {/* Debug operacional da medição — diagnóstico técnico, não altera dados */}
        <details className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3 text-[11px] text-slate-700">
          <summary className="cursor-pointer font-semibold uppercase tracking-wider text-slate-600">
            Debug operacional da medição
          </summary>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 font-mono">
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
      </div>

      {/* Drawer de detalhes */}
      <Sheet open={!!detailTaskId} onOpenChange={(v) => !v && setDetailTaskId(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
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
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
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
    </EcommerceLayout>
  );
}

// ---------------- UI bits ----------------

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string;
  icon: typeof BarChart3;
  accent: string;
  hint?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-10`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="font-display text-3xl font-bold text-foreground">
            {value}
          </div>
          {hint && (
            <div className="text-xs text-muted-foreground">{hint}</div>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[110px]">
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
    if (pct) return `${(v * 100).toFixed(1)}%`;
    return v.toLocaleString("pt-BR");
  };
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs">
        <span className="text-muted-foreground">{fmt(before)}</span>
        <span className="text-muted-foreground">→</span>
        <span className="font-semibold text-foreground">{fmt(after)}</span>
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
  onSaved,
}: {
  tasks: CompletedTask[];
  activeAccountId: string | null;
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
    if (!t) {
      toast.error("Selecione uma tarefa concluída.");
      return;
    }
    const before = parseNum(form.before);
    const after = parseNum(form.after);
    const revenue = parseNum(form.revenue);
    const evaluatedAt = form.date
      ? new Date(form.date + "T12:00:00").toISOString()
      : new Date().toISOString();

    // NOTE: ecommerce_action_results does NOT have account_id.
    // account_id é resolvido via view vw_ecommerce_action_results (join por task_id).
    const payload: Record<string, unknown> = {
      company_id: ECOMMERCE_COMPANY_ID,
      task_id: t.id,
      product_id: t.product_id,
      listing_id: t.listing_id,
      result_status: form.impact,
      result_summary: form.note.trim() || null,
      evaluation_date: evaluatedAt.slice(0, 10),
    };

    // Map metric to before/after columns when applicable
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
      // convert % to fraction if user provided >1
      const b = before != null && before > 1 ? before / 100 : before;
      const a = after != null && after > 1 ? after / 100 : after;
      payload.before_conversion_rate = b;
      payload.after_conversion_rate = a;
    }

    if (revenue != null && payload.before_revenue == null && payload.after_revenue == null) {
      // Store estimated revenue as after − before with before = 0
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="h-9 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 px-4 text-xs font-semibold text-white shadow-md hover:opacity-95"
        >
          <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
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
          <div className="sm:col-span-2 space-y-1.5">
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
                {completedTasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {(t.task_title ?? "Tarefa").slice(0, 60)}
                    {t.completed_at
                      ? ` · ${formatDate(t.completed_at)}`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="r-obs">Observação</Label>
            <Textarea
              id="r-obs"
              rows={3}
              placeholder="Contexto, aprendizado ou hipótese"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={saving}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={onSubmit} disabled={saving || !form.taskId}>
            {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

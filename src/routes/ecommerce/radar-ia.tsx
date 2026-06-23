import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Radar,
  Loader2,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Eye,
  ListPlus,
  Wand2,
  ExternalLink,
  ClipboardList,
  CheckSquare,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  HelpCircle,
  Activity,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

const TASK_TYPE_MAP: Record<string, string> = {
  low_conversion: "review_description",
  stock_stopped: "review_stock",
  ads_scale_opportunity: "increase_ads_budget",
  visits_no_sales: "review_description",
  no_visits: "activate_ads",
  kit_opportunity: "create_kit",
};

function mapTaskType(insightType: string | null): string {
  if (!insightType) return "other";
  return TASK_TYPE_MAP[insightType] ?? "other";
}

function buildTaskDescription(insight: Insight): string {
  const parts: string[] = [];
  if (insight.diagnosis?.trim())
    parts.push(`Diagnóstico: ${insight.diagnosis.trim()}`);
  if (insight.probable_cause?.trim())
    parts.push(`Causa provável: ${insight.probable_cause.trim()}`);
  if (insight.recommended_action?.trim())
    parts.push(`Ação recomendada: ${insight.recommended_action.trim()}`);
  return parts.join("\n\n");
}

function computeDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

export const Route = createFileRoute("/ecommerce/radar-ia")({
  component: RadarIAPage,
  head: () => ({
    meta: [{ title: "Radar IA | Agente Comercial 360" }],
  }),
});

const FALLBACK_ACCOUNT_ID = "d2a28e18-e5d0-40e0-82cc-0bc0c0bcd8f4";

type Insight = {
  id: string;
  company_id: string;
  account_id: string | null;
  product_id: string | null;
  listing_id: string | null;
  insight_type: string | null;
  priority: string | null;
  title: string | null;
  diagnosis: string | null;
  probable_cause: string | null;
  recommended_action: string | null;
  status: string | null;
  generated_by: string | null;
  confidence_score: number | null;
  created_at: string | null;
  updated_at: string | null;
  suggested_title: string | null;
  suggested_description: string | null;
  suggested_image_idea: string | null;
  suggested_ads_action: string | null;
  suggested_price_action: string | null;
  suggested_kit_action: string | null;
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

const RESULT_STATUS_LABEL: Record<string, string> = {
  improved: "Melhorou",
  declined: "Caiu",
  no_change: "Sem mudança",
  pending_analysis: "Pendente",
  inconclusive: "Inconclusivo",
};

const RESULT_STATUS_STYLE: Record<string, string> = {
  improved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  declined: "border-red-200 bg-red-50 text-red-700",
  no_change: "border-slate-200 bg-slate-50 text-slate-700",
  pending_analysis: "border-amber-200 bg-amber-50 text-amber-700",
  inconclusive: "border-slate-200 bg-slate-50 text-slate-700",
};

function fmtNum(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("pt-BR").format(Number(n));
}

function fmtMoney(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(n));
}

function fmtPct(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return "—";
  const v = Number(n);
  // values may come as 0.0405 OR 4.05
  const pct = v <= 1 ? v * 100 : v;
  return `${pct.toFixed(2).replace(".", ",")}%`;
}

function diffTone(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n)) || Number(n) === 0)
    return "text-muted-foreground";
  return Number(n) > 0 ? "text-emerald-600" : "text-red-600";
}

function fmtDiff(n: number | null | undefined, kind: "num" | "money" | "pct" = "num"): string {
  if (n == null || Number.isNaN(Number(n))) return "—";
  const v = Number(n);
  const sign = v > 0 ? "+" : "";
  if (kind === "money") return `${sign}${fmtMoney(v)}`;
  if (kind === "pct") {
    const pct = Math.abs(v) <= 1 ? v * 100 : v;
    return `${sign}${pct.toFixed(2).replace(".", ",")} p.p.`;
  }
  return `${sign}${fmtNum(v)}`;
}


const PRIORITY_LABEL: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

const PRIORITY_STYLE: Record<string, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-rose-200 bg-rose-50 text-rose-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-slate-200 bg-slate-50 text-slate-700",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Aberto",
  converted_to_task: "Convertido em tarefa",
  dismissed: "Ignorado",
  resolved: "Resolvido",
};

const STATUS_STYLE: Record<string, string> = {
  open: "border-blue-200 bg-blue-50 text-blue-700",
  converted_to_task: "border-emerald-200 bg-emerald-50 text-emerald-700",
  dismissed: "border-slate-200 bg-slate-50 text-slate-600",
  resolved: "border-violet-200 bg-violet-50 text-violet-700",
};

const TYPE_LABEL: Record<string, string> = {
  stock_stopped: "Estoque parado",
  visits_no_sales: "Visitas sem vendas",
  ads_scale_opportunity: "Oportunidade em Ads",
  low_conversion: "Baixa conversão",
  no_visits: "Sem tráfego",
  kit_opportunity: "Oportunidade de kit",
};

const CHECKLIST_DEFAULT = [
  "Revisar cadastro",
  "Revisar preço",
  "Revisar imagem",
  "Acompanhar resultado",
];

const CHECKLIST_BY_TYPE: Record<string, string[]> = {
  low_conversion: [
    "Revisar imagem principal",
    "Melhorar título",
    "Reforçar benefícios na descrição",
    "Revisar campanha ou tráfego",
  ],
  stock_stopped: [
    "Verificar estoque",
    "Revisar preço",
    "Testar kit/promocional",
    "Melhorar apresentação do anúncio",
  ],
  ads_scale_opportunity: [
    "Conferir estoque antes de escalar",
    "Aumentar orçamento gradualmente",
    "Monitorar margem",
    "Acompanhar resultado por 7 dias",
  ],
  kit_opportunity: [
    "Selecionar produto complementar",
    "Criar kit",
    "Testar preço do combo",
    "Medir conversão",
  ],
  no_visits: [
    "Revisar título",
    "Revisar categoria",
    "Melhorar imagem principal",
    "Testar campanha curta",
  ],
};

function checklistFor(type: string | null): string[] {
  if (!type) return CHECKLIST_DEFAULT;
  return CHECKLIST_BY_TYPE[type] ?? CHECKLIST_DEFAULT;
}

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

function RadarIAPage() {
  return (
    <EcommerceLayout>
      <RadarIAContent />
    </EcommerceLayout>
  );
}

function RadarIAContent() {
  const { activeAccountId } = useEcommerceActiveAccount();
  const accountId = activeAccountId || FALLBACK_ACCOUNT_ID;

  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Insight | null>(null);
  const [plan, setPlan] = useState<Insight | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggleCheck = useCallback((key: string) => {
    setChecked((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ecommerce_ai_insights")
        .select(
          "id, company_id, account_id, product_id, listing_id, insight_type, priority, title, diagnosis, probable_cause, recommended_action, status, generated_by, confidence_score, created_at, updated_at, suggested_title, suggested_description, suggested_image_idea, suggested_ads_action, suggested_price_action, suggested_kit_action",
        )
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("account_id", accountId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Erro ao carregar insights:", error);
        setInsights([]);
      } else {
        setInsights((data as Insight[]) ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Impacto das Ações
  const [actionResults, setActionResults] = useState<ActionResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ActionResult | null>(null);

  const loadActionResults = useCallback(async () => {
    setLoadingResults(true);
    try {
      const { data, error } = await supabase
        .from("vw_ecommerce_action_results")
        .select("*")
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("account_id", accountId)
        .order("evaluated_at", { ascending: false, nullsFirst: false });
      if (error) {
        console.error("Erro ao carregar impacto das ações:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setActionResults([]);
      } else {
        setActionResults((data as ActionResult[]) ?? []);
      }
    } finally {
      setLoadingResults(false);
    }
  }, [accountId]);

  useEffect(() => {
    void loadActionResults();
  }, [loadActionResults]);

  const resultsSummary = useMemo(() => {
    const total = actionResults.length;
    const improved = actionResults.filter((r) => r.result_status === "improved").length;
    const noChange = actionResults.filter((r) => r.result_status === "no_change").length;
    const declined = actionResults.filter((r) => r.result_status === "declined").length;
    return { total, improved, noChange, declined };
  }, [actionResults]);


  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const navigate = useNavigate();

  const runAnalysis = useCallback(async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.rpc(
        "generate_ecommerce_insights_v1",
        {
          p_company_id: ECOMMERCE_COMPANY_ID,
          p_account_id: accountId,
        },
      );
      if (error) {
        console.error("Erro ao rodar Motor de Insights v1:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        toast.error("Não foi possível rodar a análise agora.");
        return;
      }
      const result = Array.isArray(data) ? data[0] : data;
      const inserted = Number(result?.inserted_count ?? 0);
      if (inserted > 0) {
        toast.success(`Análise concluída. Novos insights gerados: ${inserted}`);
      } else {
        toast.success("Análise concluída. Nenhum novo insight encontrado.");
      }
      await load();
    } finally {
      setRunning(false);
    }
  }, [accountId, load]);

  const openTaskForInsight = useCallback(
    async (insight: Insight) => {
      setOpeningId(insight.id);
      try {
        const { data, error } = await supabase
          .from("ecommerce_tasks")
          .select("id")
          .eq("company_id", insight.company_id)
          .eq("account_id", insight.account_id)
          .eq("insight_id", insight.id)
          .limit(1);
        if (error) {
          console.error("Erro ao buscar tarefa vinculada:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          toast.error("Não foi possível abrir a tarefa.");
          return;
        }
        const task = data?.[0];
        if (!task) {
          toast.error("Insight convertido, mas tarefa vinculada não encontrada.");
          return;
        }
        try {
          localStorage.setItem("ac360_selected_task_id", task.id);
          localStorage.setItem("ac360_selected_insight_id", insight.id);
        } catch {
          /* ignore storage errors */
        }
        navigate({ to: "/ecommerce/tarefas" });
      } finally {
        setOpeningId(null);
      }
    },
    [navigate],
  );


  const createTaskFromInsight = useCallback(
    async (insight: Insight) => {
      setCreatingId(insight.id);
      try {
        // 1. Check existing
        const { data: existing, error: existErr } = await supabase
          .from("ecommerce_tasks")
          .select("id")
          .eq("company_id", insight.company_id)
          .eq("account_id", insight.account_id)
          .eq("insight_id", insight.id)
          .limit(1);
        if (existErr) {
          console.error("Erro ao verificar tarefa existente:", {
            message: existErr.message,
            details: existErr.details,
            hint: existErr.hint,
            code: existErr.code,
          });
          toast.error("Não foi possível criar a tarefa.");
          return;
        }
        if (existing && existing.length > 0) {
          toast.message("Tarefa já criada para este insight.");
          if (insight.status !== "converted_to_task") {
            await supabase
              .from("ecommerce_ai_insights")
              .update({
                status: "converted_to_task",
                updated_at: new Date().toISOString(),
              })
              .eq("id", insight.id);
            await load();
          }
          return;
        }

        // 2. Insert
        const payload = {
          company_id: insight.company_id,
          account_id: insight.account_id,
          product_id: insight.product_id,
          listing_id: insight.listing_id,
          insight_id: insight.id,
          task_title: insight.title,
          task_description: buildTaskDescription(insight),
          task_type: mapTaskType(insight.insight_type),
          priority: insight.priority || "medium",
          status: "pending",
          responsible_name: null,
          responsible_email: null,
          due_date: computeDueDate(),
          expected_impact: insight.recommended_action,
          created_by: "radar_ia",
          completed_at: null,
        };
        const { error: insertErr } = await supabase
          .from("ecommerce_tasks")
          .insert(payload);
        if (insertErr) {
          console.error("Erro ao criar tarefa:", {
            message: insertErr.message,
            details: insertErr.details,
            hint: insertErr.hint,
            code: insertErr.code,
          });
          toast.error("Não foi possível criar a tarefa.");
          return;
        }

        // 3. Update insight
        const { error: updErr } = await supabase
          .from("ecommerce_ai_insights")
          .update({
            status: "converted_to_task",
            updated_at: new Date().toISOString(),
          })
          .eq("id", insight.id);
        if (updErr) {
          console.error("Erro ao atualizar insight:", {
            message: updErr.message,
            details: updErr.details,
            hint: updErr.hint,
            code: updErr.code,
          });
        }

        toast.success("Tarefa criada com sucesso.");
        await load();
        setSelected((prev) =>
          prev && prev.id === insight.id
            ? { ...prev, status: "converted_to_task" }
            : prev,
        );
      } finally {
        setCreatingId(null);
      }
    },
    [load],
  );

  const summary = useMemo(() => {
    const total = insights.length;
    const high = insights.filter((i) => i.priority === "high").length;
    const critical = insights.filter((i) => i.priority === "critical").length;
    const converted = insights.filter(
      (i) => i.status === "converted_to_task",
    ).length;
    return { total, high, critical, converted };
  }, [insights]);

  type FilterKey =
    | "all"
    | "critical"
    | "high"
    | "converted"
    | "ads_scale_opportunity"
    | "low_conversion"
    | "stock_stopped"
    | "kit_opportunity";

  const [filter, setFilter] = useState<FilterKey>("all");

  const matchesFilter = useCallback((i: Insight, f: FilterKey): boolean => {
    switch (f) {
      case "all":
        return true;
      case "critical":
        return i.priority === "critical";
      case "high":
        return i.priority === "high";
      case "converted":
        return i.status === "converted_to_task";
      default:
        return i.insight_type === f;
    }
  }, []);

  const filterDefs: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "critical", label: "Críticos" },
    { key: "high", label: "Alta prioridade" },
    { key: "converted", label: "Convertidos em tarefa" },
    { key: "ads_scale_opportunity", label: "Oportunidades em Ads" },
    { key: "low_conversion", label: "Baixa conversão" },
    { key: "stock_stopped", label: "Estoque parado" },
    { key: "kit_opportunity", label: "Kits e combos" },
  ];

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: insights.length,
      critical: 0,
      high: 0,
      converted: 0,
      ads_scale_opportunity: 0,
      low_conversion: 0,
      stock_stopped: 0,
      kit_opportunity: 0,
    };
    for (const i of insights) {
      if (i.priority === "critical") c.critical++;
      if (i.priority === "high") c.high++;
      if (i.status === "converted_to_task") c.converted++;
      if (i.insight_type === "ads_scale_opportunity") c.ads_scale_opportunity++;
      if (i.insight_type === "low_conversion") c.low_conversion++;
      if (i.insight_type === "stock_stopped") c.stock_stopped++;
      if (i.insight_type === "kit_opportunity") c.kit_opportunity++;
    }
    return c;
  }, [insights]);

  const filteredInsights = useMemo(
    () => insights.filter((i) => matchesFilter(i, filter)),
    [insights, filter, matchesFilter],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
              <Radar className="h-5 w-5" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Radar IA
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sinais de oportunidade, alertas e recomendações inteligentes da conta ativa.
          </p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={running}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
        >
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Rodar análise agora
            </>
          )}
        </Button>
      </div>


      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Total de insights"
          value={summary.total}
          tone="text-blue-700 bg-blue-50 border-blue-200"
        />
        <SummaryCard
          icon={<Flame className="h-4 w-4" />}
          label="Alta prioridade"
          value={summary.high}
          tone="text-rose-700 bg-rose-50 border-rose-200"
        />
        <SummaryCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Críticos"
          value={summary.critical}
          tone="text-red-700 bg-red-50 border-red-200"
        />
        <SummaryCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Convertidos em tarefa"
          value={summary.converted}
          tone="text-emerald-700 bg-emerald-50 border-emerald-200"
        />
      </div>

      {/* Filter bar */}
      {!loading && insights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterDefs.map((f) => {
            const active = filter === f.key;
            const count = counts[f.key];
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                  (active
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-border bg-card text-foreground hover:bg-muted")
                }
              >
                <span>{f.label}</span>
                <span
                  className={
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold " +
                    (active
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Carregando insights…
        </div>
      ) : insights.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card px-6 py-16 text-center">
          <Radar className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Nenhum insight encontrado para esta conta. O Radar IA exibirá oportunidades assim que o motor de inteligência analisar os dados.
          </p>
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card px-6 py-16 text-center">
          <Radar className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Nenhum insight encontrado para este filtro.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onOpen={() => setSelected(insight)}
              onCreateTask={() => createTaskFromInsight(insight)}
              onOpenTask={() => openTaskForInsight(insight)}
              onPlan={() => {
                setPlan(insight);
                setChecked({});
              }}
              creating={creatingId === insight.id}
              opening={openingId === insight.id}
            />

          ))}
        </div>
      )}

      {/* Impacto das Ações */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Impacto das Ações
              </h2>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Acompanhe se as ações executadas melhoraram visitas, vendas, faturamento e conversão.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard
            icon={<BarChart3 className="h-4 w-4" />}
            label="Ações avaliadas"
            value={resultsSummary.total}
            tone="text-blue-700 bg-blue-50 border-blue-200"
          />
          <SummaryCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Melhoraram"
            value={resultsSummary.improved}
            tone="text-emerald-700 bg-emerald-50 border-emerald-200"
          />
          <SummaryCard
            icon={<Minus className="h-4 w-4" />}
            label="Sem mudança"
            value={resultsSummary.noChange}
            tone="text-slate-700 bg-slate-50 border-slate-200"
          />
          <SummaryCard
            icon={<TrendingDown className="h-4 w-4" />}
            label="Queda/alerta"
            value={resultsSummary.declined}
            tone="text-red-700 bg-red-50 border-red-200"
          />
        </div>

        {loadingResults ? (
          <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando impacto das ações…
          </div>
        ) : actionResults.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card px-6 py-12 text-center">
            <Activity className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Nenhum impacto de ação medido ainda. Assim que tarefas concluídas forem avaliadas, os resultados aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {actionResults.map((r) => (
              <ActionResultCard
                key={r.id}
                result={r}
                onOpen={() => setSelectedResult(r)}
                onOpenTask={() => {
                  try {
                    if (r.task_id) {
                      localStorage.setItem("ac360_selected_task_id", r.task_id);
                    }
                  } catch {
                    /* ignore */
                  }
                  navigate({ to: "/ecommerce/tarefas" });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer detalhes ação (Impacto) */}
      <Sheet
        open={selectedResult !== null}
        onOpenChange={(o) => !o && setSelectedResult(null)}
      >
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedResult && (
            <>
              <SheetHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill
                    className={
                      RESULT_STATUS_STYLE[selectedResult.result_status ?? ""] ??
                      "border-slate-200 bg-slate-50 text-slate-700"
                    }
                  >
                    {selectedResult.result_status_label ??
                      RESULT_STATUS_LABEL[selectedResult.result_status ?? ""] ??
                      selectedResult.result_status ??
                      "—"}
                  </Pill>
                </div>
                <SheetTitle className="text-left">
                  {selectedResult.task_title ?? "Análise de impacto"}
                </SheetTitle>
                <SheetDescription className="text-left">
                  {selectedResult.product_name ?? "Produto"}
                  {selectedResult.listing_title
                    ? ` · ${selectedResult.listing_title}`
                    : ""}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-5 text-sm">
                <Block label="Resumo do resultado" text={selectedResult.result_summary} />
                <Block label="Avaliação da IA" text={selectedResult.ai_evaluation} />

                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Antes × Depois
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <MetricRow
                      label="Visitas"
                      before={fmtNum(selectedResult.before_visits)}
                      after={fmtNum(selectedResult.after_visits)}
                      diff={fmtDiff(selectedResult.visits_difference, "num")}
                      diffClass={diffTone(selectedResult.visits_difference)}
                    />
                    <MetricRow
                      label="Vendas"
                      before={fmtNum(selectedResult.before_sales_count)}
                      after={fmtNum(selectedResult.after_sales_count)}
                      diff={fmtDiff(selectedResult.sales_difference, "num")}
                      diffClass={diffTone(selectedResult.sales_difference)}
                    />
                    <MetricRow
                      label="Faturamento"
                      before={fmtMoney(selectedResult.before_revenue)}
                      after={fmtMoney(selectedResult.after_revenue)}
                      diff={fmtDiff(selectedResult.revenue_difference, "money")}
                      diffClass={diffTone(selectedResult.revenue_difference)}
                    />
                    <MetricRow
                      label="Conversão"
                      before={fmtPct(selectedResult.before_conversion_rate)}
                      after={fmtPct(selectedResult.after_conversion_rate)}
                      diff={fmtDiff(selectedResult.conversion_difference, "pct")}
                      diffClass={diffTone(selectedResult.conversion_difference)}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground space-y-0.5">
                  {selectedResult.task_id && (
                    <div>
                      <span className="font-medium">task_id:</span>{" "}
                      <span className="font-mono">{selectedResult.task_id}</span>
                    </div>
                  )}
                  {selectedResult.product_id && (
                    <div>
                      <span className="font-medium">product_id:</span>{" "}
                      <span className="font-mono">{selectedResult.product_id}</span>
                    </div>
                  )}
                  {selectedResult.listing_id && (
                    <div>
                      <span className="font-medium">listing_id:</span>{" "}
                      <span className="font-mono">{selectedResult.listing_id}</span>
                    </div>
                  )}
                  {selectedResult.evaluated_at && (
                    <div>
                      <span className="font-medium">avaliado em:</span>{" "}
                      {formatDate(selectedResult.evaluated_at)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedResult(null)}>
                  Fechar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      if (selectedResult.task_id) {
                        localStorage.setItem(
                          "ac360_selected_task_id",
                          selectedResult.task_id,
                        );
                      }
                    } catch {
                      /* ignore */
                    }
                    navigate({ to: "/ecommerce/tarefas" });
                  }}
                >
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  Ver tarefa
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Drawer details */}

      <Sheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill
                    className={
                      PRIORITY_STYLE[selected.priority ?? ""] ??
                      "border-slate-200 bg-slate-50 text-slate-700"
                    }
                  >
                    {PRIORITY_LABEL[selected.priority ?? ""] ?? selected.priority ?? "—"}
                  </Pill>
                  <Pill
                    className={
                      STATUS_STYLE[selected.status ?? ""] ??
                      "border-slate-200 bg-slate-50 text-slate-700"
                    }
                  >
                    {STATUS_LABEL[selected.status ?? ""] ?? selected.status ?? "—"}
                  </Pill>
                  {selected.insight_type && (
                    <Pill className="border-border bg-muted text-foreground">
                      {TYPE_LABEL[selected.insight_type] ?? selected.insight_type}
                    </Pill>
                  )}
                </div>
                <SheetTitle className="text-left">
                  {selected.title ?? "Insight"}
                </SheetTitle>
                <SheetDescription className="text-left">
                  Gerado em {formatDate(selected.created_at)}
                  {selected.confidence_score != null
                    ? ` · Confiança ${Math.round(
                        Number(selected.confidence_score) *
                          (Number(selected.confidence_score) <= 1 ? 100 : 1),
                      )}%`
                    : ""}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-5 text-sm">
                <Block label="Diagnóstico" text={selected.diagnosis} />
                <Block label="Causa provável" text={selected.probable_cause} />
                <Block label="Ação recomendada" text={selected.recommended_action} />

                {(selected.suggested_title ||
                  selected.suggested_description ||
                  selected.suggested_image_idea ||
                  selected.suggested_ads_action ||
                  selected.suggested_price_action ||
                  selected.suggested_kit_action) && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      Sugestões da IA
                    </div>
                    {selected.suggested_title && (
                      <Block label="Título sugerido" text={selected.suggested_title} />
                    )}
                    {selected.suggested_description && (
                      <Block label="Descrição sugerida" text={selected.suggested_description} />
                    )}
                    {selected.suggested_image_idea && (
                      <Block label="Ideia de imagem" text={selected.suggested_image_idea} />
                    )}
                    {selected.suggested_ads_action && (
                      <Block label="Ação em Ads" text={selected.suggested_ads_action} />
                    )}
                    {selected.suggested_price_action && (
                      <Block label="Ação de preço" text={selected.suggested_price_action} />
                    )}
                    {selected.suggested_kit_action && (
                      <Block label="Sugestão de kit" text={selected.suggested_kit_action} />
                    )}
                  </div>
                )}

                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Dados técnicos
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <dt className="text-muted-foreground">Confiança</dt>
                    <dd className="text-foreground">
                      {selected.confidence_score != null
                        ? `${Math.round(
                            Number(selected.confidence_score) *
                              (Number(selected.confidence_score) <= 1 ? 100 : 1),
                          )}%`
                        : "—"}
                    </dd>
                    <dt className="text-muted-foreground">Gerado por</dt>
                    <dd className="text-foreground">{selected.generated_by ?? "—"}</dd>
                    <dt className="text-muted-foreground">Criado em</dt>
                    <dd className="text-foreground">{formatDate(selected.created_at)}</dd>
                    <dt className="text-muted-foreground">Atualizado em</dt>
                    <dd className="text-foreground">{formatDate(selected.updated_at)}</dd>
                  </dl>
                </div>

                {(selected.product_id || selected.listing_id) && (
                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    {selected.product_id && (
                      <div>
                        <span className="font-medium">product_id:</span>{" "}
                        <span className="font-mono">{selected.product_id}</span>
                      </div>
                    )}
                    {selected.listing_id && (
                      <div>
                        <span className="font-medium">listing_id:</span>{" "}
                        <span className="font-mono">{selected.listing_id}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                  Fechar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    selected.status === "converted_to_task"
                      ? openingId === selected.id
                      : creatingId === selected.id
                  }
                  onClick={() =>
                    selected.status === "converted_to_task"
                      ? openTaskForInsight(selected)
                      : createTaskFromInsight(selected)
                  }
                >
                  {selected.status === "converted_to_task" ? (
                    openingId === selected.id ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                    )
                  ) : creatingId === selected.id ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <ListPlus className="mr-1.5 h-4 w-4" />
                  )}
                  {selected.status === "converted_to_task"
                    ? "Ver tarefa"
                    : "Criar tarefa"}
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setPlan(selected);
                    setChecked({});
                  }}
                >
                  <Wand2 className="mr-1.5 h-4 w-4" />
                  Ver ação recomendada
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Plano de ação IA */}
      <Sheet open={plan !== null} onOpenChange={(o) => !o && setPlan(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {plan && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
                    <Wand2 className="h-4 w-4" />
                  </div>
                  <SheetTitle className="text-left">Plano de ação IA</SheetTitle>
                </div>
                <SheetDescription className="text-left">
                  {plan.title ?? "Insight"}
                </SheetDescription>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Pill
                    className={
                      PRIORITY_STYLE[plan.priority ?? ""] ??
                      "border-slate-200 bg-slate-50 text-slate-700"
                    }
                  >
                    {PRIORITY_LABEL[plan.priority ?? ""] ?? plan.priority ?? "—"}
                  </Pill>
                  {plan.insight_type && (
                    <Pill className="border-border bg-muted text-foreground">
                      {TYPE_LABEL[plan.insight_type] ?? plan.insight_type}
                    </Pill>
                  )}
                  {plan.confidence_score != null && (
                    <Pill className="border-indigo-200 bg-indigo-50 text-indigo-700">
                      Confiança {Math.round(
                        Number(plan.confidence_score) *
                          (Number(plan.confidence_score) <= 1 ? 100 : 1),
                      )}%
                    </Pill>
                  )}
                </div>
              </SheetHeader>

              <div className="mt-5 space-y-5 text-sm">
                <Block label="Diagnóstico" text={plan.diagnosis} />
                <Block label="Causa provável" text={plan.probable_cause} />
                <Block label="Ação recomendada" text={plan.recommended_action} />

                {(plan.suggested_title ||
                  plan.suggested_description ||
                  plan.suggested_image_idea ||
                  plan.suggested_ads_action ||
                  plan.suggested_price_action ||
                  plan.suggested_kit_action) && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      Sugestões da IA
                    </div>
                    {plan.suggested_title && (
                      <Block label="Título sugerido" text={plan.suggested_title} />
                    )}
                    {plan.suggested_description && (
                      <Block label="Descrição sugerida" text={plan.suggested_description} />
                    )}
                    {plan.suggested_image_idea && (
                      <Block label="Ideia de imagem" text={plan.suggested_image_idea} />
                    )}
                    {plan.suggested_ads_action && (
                      <Block label="Ação em Ads" text={plan.suggested_ads_action} />
                    )}
                    {plan.suggested_price_action && (
                      <Block label="Ação de preço" text={plan.suggested_price_action} />
                    )}
                    {plan.suggested_kit_action && (
                      <Block label="Sugestão de kit" text={plan.suggested_kit_action} />
                    )}
                  </div>
                )}

                <div className="rounded-xl border border-border/60 bg-card p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <ClipboardList className="h-3.5 w-3.5" />
                    Checklist de execução
                  </div>
                  <ul className="mt-3 space-y-2">
                    {checklistFor(plan.insight_type).map((item, idx) => {
                      const key = `${plan.id}:${idx}`;
                      const done = !!checked[key];
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            onClick={() => toggleCheck(key)}
                            className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-muted/60"
                          >
                            <CheckSquare
                              className={`mt-0.5 h-4 w-4 shrink-0 ${
                                done ? "text-emerald-600" : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={
                                done
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground"
                              }
                            >
                              {item}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setPlan(null)}>
                  Fechar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  disabled={
                    plan.status === "converted_to_task"
                      ? openingId === plan.id
                      : creatingId === plan.id
                  }
                  onClick={() =>
                    plan.status === "converted_to_task"
                      ? openTaskForInsight(plan)
                      : createTaskFromInsight(plan)
                  }
                >
                  {plan.status === "converted_to_task" ? (
                    openingId === plan.id ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                    )
                  ) : creatingId === plan.id ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <ListPlus className="mr-1.5 h-4 w-4" />
                  )}
                  {plan.status === "converted_to_task" ? "Ver tarefa" : "Criar tarefa"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)]">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}
      >
        {icon}
        {label}
      </div>
      <div className="mt-3 font-display text-3xl font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function Block({ label, text }: { label: string; text: string | null }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <p className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground">
        {text?.trim() ? text : "—"}
      </p>
    </div>
  );
}

function InsightCard({
  insight,
  onOpen,
  onCreateTask,
  onOpenTask,
  onPlan,
  creating,
  opening,
}: {
  insight: Insight;
  onOpen: () => void;
  onCreateTask: () => void;
  onOpenTask: () => void;
  onPlan: () => void;
  creating: boolean;
  opening: boolean;
}) {
  const alreadyTask = insight.status === "converted_to_task";
  const confidencePct =
    insight.confidence_score == null
      ? null
      : Math.round(
          Number(insight.confidence_score) *
            (Number(insight.confidence_score) <= 1 ? 100 : 1),
        );

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill
              className={
                PRIORITY_STYLE[insight.priority ?? ""] ??
                "border-slate-200 bg-slate-50 text-slate-700"
              }
            >
              {PRIORITY_LABEL[insight.priority ?? ""] ?? insight.priority ?? "—"}
            </Pill>
            <Pill
              className={
                STATUS_STYLE[insight.status ?? ""] ??
                "border-slate-200 bg-slate-50 text-slate-700"
              }
            >
              {STATUS_LABEL[insight.status ?? ""] ?? insight.status ?? "—"}
            </Pill>
            {insight.insight_type && (
              <Pill className="border-border bg-muted text-foreground">
                {TYPE_LABEL[insight.insight_type] ?? insight.insight_type}
              </Pill>
            )}
            {confidencePct != null && (
              <Pill className="border-indigo-200 bg-indigo-50 text-indigo-700">
                Confiança {confidencePct}%
              </Pill>
            )}
          </div>
          <h3 className="mt-2 font-display text-base font-semibold leading-snug text-foreground">
            {insight.title ?? "Insight"}
          </h3>
          {insight.diagnosis && (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
              {insight.diagnosis}
            </p>
          )}
          {insight.recommended_action && (
            <p className="mt-2 line-clamp-2 text-sm text-foreground">
              <span className="font-semibold">Ação recomendada: </span>
              {insight.recommended_action}
            </p>
          )}
          <div className="mt-2 text-[11px] text-muted-foreground">
            Criado em {formatDate(insight.created_at)}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button size="sm" variant="outline" onClick={onOpen}>
            <Eye className="mr-1.5 h-4 w-4" />
            Ver detalhes
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={alreadyTask ? opening : creating}
            onClick={alreadyTask ? onOpenTask : onCreateTask}
          >
            {alreadyTask ? (
              opening ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-1.5 h-4 w-4" />
              )
            ) : creating ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <ListPlus className="mr-1.5 h-4 w-4" />
            )}
            {alreadyTask ? "Ver tarefa" : "Criar tarefa"}
          </Button>
          <Button size="sm" variant="outline" onClick={onPlan}>
            <Wand2 className="mr-1.5 h-4 w-4" />
            Ver ação recomendada
          </Button>

        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  before,
  after,
  diff,
  diffClass,
}: {
  label: string;
  before: string;
  after: string;
  diff: string;
  diffClass: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 text-right">
        <span className="text-foreground">{before}</span>
        <span className="text-muted-foreground">→</span>
        <span className="font-semibold text-foreground">{after}</span>
        <span className={`ml-2 text-xs font-semibold ${diffClass}`}>{diff}</span>
      </div>
    </div>
  );
}

function ActionResultCard({
  result,
  onOpen,
  onOpenTask,
}: {
  result: ActionResult;
  onOpen: () => void;
  onOpenTask: () => void;
}) {
  const status = result.result_status ?? "";
  const statusLabel =
    result.result_status_label ?? RESULT_STATUS_LABEL[status] ?? status ?? "—";
  const statusStyle =
    RESULT_STATUS_STYLE[status] ?? "border-slate-200 bg-slate-50 text-slate-700";
  const Icon =
    status === "improved"
      ? TrendingUp
      : status === "declined"
        ? TrendingDown
        : status === "no_change"
          ? Minus
          : HelpCircle;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill className={statusStyle}>
              <Icon className="h-3 w-3" />
              {statusLabel}
            </Pill>
          </div>
          <h3 className="mt-2 font-display text-base font-semibold leading-snug text-foreground">
            {result.task_title ?? "Ação"}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {result.product_name ?? "Produto"}
            {result.listing_title ? ` · ${result.listing_title}` : ""}
          </p>
          {result.result_summary && (
            <p className="mt-2 line-clamp-2 text-sm text-foreground">
              {result.result_summary}
            </p>
          )}

          <div className="mt-3 grid grid-cols-1 gap-1.5 rounded-xl border border-border/50 bg-muted/30 p-3 text-xs sm:grid-cols-2">
            <MetricRow
              label="Visitas"
              before={fmtNum(result.before_visits)}
              after={fmtNum(result.after_visits)}
              diff={fmtDiff(result.visits_difference, "num")}
              diffClass={diffTone(result.visits_difference)}
            />
            <MetricRow
              label="Vendas"
              before={fmtNum(result.before_sales_count)}
              after={fmtNum(result.after_sales_count)}
              diff={fmtDiff(result.sales_difference, "num")}
              diffClass={diffTone(result.sales_difference)}
            />
            <MetricRow
              label="Faturamento"
              before={fmtMoney(result.before_revenue)}
              after={fmtMoney(result.after_revenue)}
              diff={fmtDiff(result.revenue_difference, "money")}
              diffClass={diffTone(result.revenue_difference)}
            />
            <MetricRow
              label="Conversão"
              before={fmtPct(result.before_conversion_rate)}
              after={fmtPct(result.after_conversion_rate)}
              diff={fmtDiff(result.conversion_difference, "pct")}
              diffClass={diffTone(result.conversion_difference)}
            />
          </div>

          {result.evaluated_at && (
            <div className="mt-2 text-[11px] text-muted-foreground">
              Avaliado em {formatDate(result.evaluated_at)}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button size="sm" variant="outline" onClick={onOpenTask}>
            <ExternalLink className="mr-1.5 h-4 w-4" />
            Ver tarefa
          </Button>
          <Button size="sm" variant="outline" onClick={onOpen}>
            <Eye className="mr-1.5 h-4 w-4" />
            Ver análise completa
          </Button>
        </div>
      </div>
    </div>
  );
}

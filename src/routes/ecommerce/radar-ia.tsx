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

  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const navigate = useNavigate();

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
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onOpen={() => setSelected(insight)}
              onCreateTask={() => createTaskFromInsight(insight)}
              onOpenTask={() => openTaskForInsight(insight)}
              creating={creatingId === insight.id}
              opening={openingId === insight.id}
            />

          ))}
        </div>
      )}

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

                <Button variant="outline" size="sm" disabled>
                  <Wand2 className="mr-1.5 h-4 w-4" />
                  Otimizar com IA · Em breve
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
  creating,
  opening,
}: {
  insight: Insight;
  onOpen: () => void;
  onCreateTask: () => void;
  onOpenTask: () => void;
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
          <Button size="sm" variant="outline" disabled>
            <Wand2 className="mr-1.5 h-4 w-4" />
            Em breve
          </Button>

        </div>
      </div>
    </div>
  );
}

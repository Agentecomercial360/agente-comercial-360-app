import { createFileRoute } from "@tanstack/react-router";
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
          "id, company_id, account_id, product_id, listing_id, insight_type, priority, title, diagnosis, probable_cause, recommended_action, status, generated_by, confidence_score, created_at, updated_at",
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
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <ListPlus className="mr-1.5 h-4 w-4" />
                  Criar tarefa
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
}: {
  insight: Insight;
  onOpen: () => void;
}) {
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
          <Button size="sm" variant="outline">
            <ListPlus className="mr-1.5 h-4 w-4" />
            Criar tarefa
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

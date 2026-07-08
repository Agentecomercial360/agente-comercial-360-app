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
  BookOpen,
  ShieldCheck,
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
import {
  runInsightsEnginePreview,
  type InsightsEnginePreviewResult,
} from "@/lib/ecommerce-insights.functions";

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
  model: string | null;
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

type KbCategory =
  | "margem"
  | "preco"
  | "estoque"
  | "ads"
  | "prioritarios"
  | "observacoes";

type KbRule = {
  id: string;
  company_id: string;
  account_id: string | null;
  category: KbCategory;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  updated_at: string | null;
};

const KB_CATEGORY_LABEL: Record<KbCategory, string> = {
  margem: "Margem",
  preco: "Preço",
  estoque: "Estoque",
  ads: "Ads",
  prioritarios: "Produtos prioritários",
  observacoes: "Observações",
};

const KB_CATEGORY_STYLE: Record<KbCategory, string> = {
  margem: "border-emerald-200 bg-emerald-50 text-emerald-700",
  preco: "border-blue-200 bg-blue-50 text-blue-700",
  estoque: "border-amber-200 bg-amber-50 text-amber-700",
  ads: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  prioritarios: "border-violet-200 bg-violet-50 text-violet-700",
  observacoes: "border-slate-200 bg-slate-50 text-slate-700",
};

// Mapeia tipo de insight -> categorias da Base da IA que podem influenciar
const INSIGHT_TO_KB: Record<string, KbCategory[]> = {
  ads_scale_opportunity: ["ads", "margem"],
  low_conversion: ["preco", "margem", "ads"],
  stock_stopped: ["estoque", "prioritarios", "preco"],
  visits_no_sales: ["preco", "ads"],
  no_visits: ["ads"],
  kit_opportunity: ["preco", "prioritarios", "margem"],
};

// Palavras-chave por categoria da Base da IA — usadas para inferir contexto
// quando o insight não estiver mapeado explicitamente em INSIGHT_TO_KB.
const KB_KEYWORDS: Record<KbCategory, RegExp> = {
  margem:
    /\b(margem|marge|preço|preco|promoç|promoc|desconto|ads?|escala|escalar|kit|venda|vendas|faturamento|receita|conversão|conversao|roas)\b/i,
  preco: /\b(preço|preco|desconto|promoç|promoc|concorrên|concorrenc)\b/i,
  estoque:
    /\b(estoque|estoq|reposi[cç][aã]o|cobertura|ruptur|parado|baixo|inventário|inventario)\b/i,
  ads: /\b(ads?|campanha|orçamento|orcamento|roas|tráfego|trafego|impress[oõ]es|cpc|cpa)\b/i,
  prioritarios:
    /\b(estratég|estrateg|priorit|protegid|campe[aã]o|top|hero|não\s*pausar|nao\s*pausar)\b/i,
  observacoes: /$^/, // não inferimos observações por palavra-chave
};

function insightText(insight: {
  insight_type: string | null;
  title: string | null;
  recommended_action: string | null;
  probable_cause: string | null;
  suggested_ads_action?: string | null;
  suggested_price_action?: string | null;
  suggested_kit_action?: string | null;
}): string {
  return [
    insight.insight_type,
    insight.title,
    insight.recommended_action,
    insight.probable_cause,
    insight.suggested_ads_action,
    insight.suggested_price_action,
    insight.suggested_kit_action,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function rulesForInsight(
  insightType: string | null,
  rules: KbRule[],
  insight?: Insight,
): KbRule[] {
  const cats = new Set<KbCategory>(
    insightType ? (INSIGHT_TO_KB[insightType] ?? []) : [],
  );
  if (insight) {
    const text = insightText(insight);
    (Object.keys(KB_KEYWORDS) as KbCategory[]).forEach((cat) => {
      if (KB_KEYWORDS[cat].test(text)) cats.add(cat);
    });
  }
  if (cats.size === 0) return [];
  return rules.filter((r) => cats.has(r.category));
}


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
    // before/after já vêm em pontos percentuais (ex: 4.0580 = 4,06%),
    // portanto a diferença também está em p.p. — não multiplicar por 100.
    return `${sign}${v.toFixed(2).replace(".", ",")} p.p.`;
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

type ProductInfo = { id: string; name: string | null; sku: string | null };
type ListingInfo = {
  id: string;
  ml_item_id: string | null;
  status: string | null;
  title: string | null;
};

function RadarIAContent() {
  const { activeAccountId, activeAccount } = useEcommerceActiveAccount();
  const accountId = activeAccountId || FALLBACK_ACCOUNT_ID;
  const accountLabel =
    activeAccount?.account_name ||
    activeAccount?.nickname ||
    "Mercado Livre";

  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Insight | null>(null);
  const [plan, setPlan] = useState<Insight | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [productMap, setProductMap] = useState<Record<string, ProductInfo>>({});
  const [listingMap, setListingMap] = useState<Record<string, ListingInfo>>({});

  const toggleCheck = useCallback((key: string) => {
    setChecked((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const baseCols =
        "id, company_id, account_id, product_id, listing_id, insight_type, priority, title, diagnosis, probable_cause, recommended_action, status, generated_by, confidence_score, created_at, updated_at, suggested_title, suggested_description, suggested_image_idea, suggested_ads_action, suggested_price_action, suggested_kit_action";
      // Tenta incluir a coluna `model` (opcional). Se não existir no banco,
      // faz fallback para o select sem `model` para não quebrar a página.
      let data: unknown[] | null = null;
      let error: { message?: string } | null = null;
      {
        const res = await supabase
          .from("ecommerce_ai_insights")
          .select(`${baseCols}, model`)
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .eq("account_id", accountId)
          .order("created_at", { ascending: false });
        data = res.data as unknown[] | null;
        error = res.error;
      }
      if (error && /model/i.test(error.message ?? "")) {
        const res = await supabase
          .from("ecommerce_ai_insights")
          .select(baseCols)
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .eq("account_id", accountId)
          .order("created_at", { ascending: false });
        data = res.data as unknown[] | null;
        error = res.error;
      }
      if (error) {
        console.error("Erro ao carregar insights:", error);
        setInsights([]);
      } else {
        setInsights(((data as Insight[]) ?? []).map((i) => ({ ...i, model: i.model ?? null })));
      }
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Lookups complementares — produtos e anúncios vinculados aos insights
  useEffect(() => {
    const productIds = Array.from(
      new Set(insights.map((i) => i.product_id).filter((v): v is string => !!v)),
    );
    const listingIds = Array.from(
      new Set(insights.map((i) => i.listing_id).filter((v): v is string => !!v)),
    );

    if (productIds.length === 0) {
      setProductMap({});
    } else {
      (async () => {
        try {
          const { data, error } = await supabase
            .from("ecommerce_products")
            .select("id, name, sku")
            .eq("company_id", ECOMMERCE_COMPANY_ID)
            .in("id", productIds);
          if (error) throw error;
          const map: Record<string, ProductInfo> = {};
          for (const p of (data as ProductInfo[]) ?? []) map[p.id] = p;
          setProductMap(map);
        } catch (err) {
          console.warn("[Radar IA] Lookup de produtos indisponível:", err);
          setProductMap({});
        }
      })();
    }

    if (listingIds.length === 0) {
      setListingMap({});
    } else {
      (async () => {
        try {
          const { data, error } = await supabase
            .from("ecommerce_listings")
            .select("id, ml_item_id, status, title")
            .eq("company_id", ECOMMERCE_COMPANY_ID)
            .in("id", listingIds);
          if (error) throw error;
          const map: Record<string, ListingInfo> = {};
          for (const l of (data as ListingInfo[]) ?? []) map[l.id] = l;
          setListingMap(map);
        } catch (err) {
          console.warn("[Radar IA] Lookup de anúncios indisponível:", err);
          setListingMap({});
        }
      })();
    }
  }, [insights]);

  // Impacto das Ações
  const [actionResults, setActionResults] = useState<ActionResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ActionResult | null>(null);

  const loadActionResults = useCallback(async () => {
    setLoadingResults(true);
    try {
      console.log("[Impacto das Ações] activeAccountId:", accountId);
      const { data, error } = await supabase
        .from("vw_ecommerce_action_results")
        .select("*")
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("account_id", accountId);
      if (error) {
        console.error("[Impacto das Ações] Erro Supabase:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setActionResults([]);
      } else {
        const rows = (data as ActionResult[]) ?? [];
        console.log("[Impacto das Ações] total retornado:", rows.length, rows);
        const sorted = [...rows].sort((a, b) => {
          const av = a.evaluated_at ?? a.created_at ?? "";
          const bv = b.evaluated_at ?? b.created_at ?? "";
          return bv.localeCompare(av);
        });
        setActionResults(sorted);
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

  // Base da IA (contexto estratégico)
  const [kbRules, setKbRules] = useState<KbRule[]>([]);
  const [kbLoading, setKbLoading] = useState(true);
  const [kbAvailable, setKbAvailable] = useState(true);

  const loadKb = useCallback(async () => {
    setKbLoading(true);
    try {
      let q = supabase
        .from("ecommerce_ai_knowledge_base")
        .select(
          "id, company_id, account_id, category, title, description, priority, status, updated_at",
        )
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("status", "active");
      // Regras da conta ativa OU regras globais (account_id null)
      q = q.or(`account_id.is.null,account_id.eq.${accountId}`);
      const { data, error } = await q.order("updated_at", { ascending: false });
      if (error) {
        // Tabela pode não existir ainda ou RLS bloquear — degradar silenciosamente
        console.warn("[Radar IA] Base da IA indisponível:", error.message);
        setKbAvailable(false);
        setKbRules([]);
      } else {
        setKbAvailable(true);
        setKbRules((data as KbRule[]) ?? []);
      }
    } finally {
      setKbLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    void loadKb();
  }, [loadKb]);

  const kbSummary = useMemo(() => {
    const byCat: Record<KbCategory, number> = {
      margem: 0,
      preco: 0,
      estoque: 0,
      ads: 0,
      prioritarios: 0,
      observacoes: 0,
    };
    let last: string | null = null;
    for (const r of kbRules) {
      byCat[r.category] = (byCat[r.category] ?? 0) + 1;
      if (r.updated_at && (!last || r.updated_at > last)) last = r.updated_at;
    }
    return { total: kbRules.length, byCat, last };
  }, [kbRules]);

  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<InsightsEnginePreviewResult | null>(null);
  const navigate = useNavigate();

  const runEnginePreview = useCallback(async () => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const result = await runInsightsEnginePreview({
        companyId: ECOMMERCE_COMPANY_ID,
        accountId: accountId,
      });
      setPreviewData(result);
      toast.message("Prévia do Motor IA gerada — nenhum insight foi criado.");
    } catch (e) {
      console.error("Erro na prévia do Motor IA:", e);
      toast.error("Não foi possível gerar a prévia do Motor IA.");
    } finally {
      setPreviewLoading(false);
    }
  }, [accountId]);


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
        // RPC ausente/indisponível: seja honesto — nada foi gerado.
        const missing =
          error.code === "PGRST202" ||
          /not\s*found|does not exist|schema cache/i.test(error.message ?? "");
        if (missing) {
          toast.message(
            "Motor de análise ainda não conectado. Os insights atuais foram carregados do banco.",
          );
        } else {
          toast.error("Não foi possível rodar a análise agora.");
        }
        return;
      }
      const result = Array.isArray(data) ? data[0] : data;
      const inserted = Number(result?.inserted_count ?? 0);
      const kbNote =
        kbRules.length > 0
          ? ` · Base da IA aplicada (${kbRules.length} regra${kbRules.length === 1 ? "" : "s"})`
          : "";
      const engineNote = " · motor: RPC generate_ecommerce_insights_v1 (regras SQL)";
      if (inserted > 0) {
        toast.success(
          `Análise concluída. Novos insights gerados: ${inserted}${kbNote}${engineNote}`,
        );
      } else {
        toast.success(
          `Análise concluída. Nenhum novo insight encontrado.${kbNote}${engineNote}`,
        );
      }
      await load();
    } finally {
      setRunning(false);
    }
  }, [accountId, load, kbRules]);


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
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
              <Radar className="h-5 w-5" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Radar IA
            </h1>
            {kbAvailable && kbRules.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Contexto estratégico ativo
              </span>
            )}
            <span
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
              title="O sistema recomenda ações e pode convertê-las em tarefa. Alterações em anúncios, preços ou Ads exigem aprovação operacional."
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Modo assistido
            </span>
            {!loading && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                {insights.length} insight{insights.length === 1 ? "" : "s"} · {accountLabel}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sinais de oportunidade, alertas e recomendações inteligentes da conta ativa.
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/80">
            Os insights exibidos são filtrados pela conta Mercado Livre ativa · origem:{" "}
            <span className="font-mono">ecommerce_ai_insights</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={runEnginePreview}
            disabled={previewLoading}
            title="Executa apenas uma prévia do contexto (dry-run). Não cria insights."
          >
            {previewLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparando prévia...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Prévia do Motor IA
              </>
            )}
          </Button>
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
      </div>

      {/* Como o Radar IA funciona */}
      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex items-start gap-2">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground">
              Como o Radar IA funciona
            </div>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              O Radar IA cruza dados da conta Mercado Livre, produtos, anúncios, estoque,
              métricas, Ads e regras da Base da IA para identificar riscos, oportunidades
              e ações recomendadas. As recomendações não alteram a conta automaticamente;
              elas orientam a Central de Ações e as tarefas dos operadores.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
                title="A tela lê registros já salvos em ecommerce_ai_insights."
              >
                Insights carregados do banco
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                title="RPC Supabase generate_ecommerce_insights_v1 — geração determinística por regras SQL."
              >
                Motor SQL v1 conectado
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                title="Nenhuma integração com LLM/OpenAI está conectada ao motor de insights neste projeto."
              >
                IA generativa ainda não conectada
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Base da IA aplicada */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-indigo-50/60 via-card to-card p-4 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-base font-bold text-foreground">
                  Base da IA aplicada
                </h2>
                {kbLoading ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Carregando
                  </span>
                ) : !kbAvailable ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    Indisponível
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                    {kbSummary.total} regra{kbSummary.total === 1 ? "" : "s"} ativa{kbSummary.total === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
                Regras estratégicas cadastradas em{" "}
                <button
                  type="button"
                  onClick={() => navigate({ to: "/ecommerce/base-ia" })}
                  className="font-semibold text-indigo-700 hover:underline"
                >
                  Base da IA
                </button>{" "}
                orientam a leitura do Radar sobre margem, preço, estoque, Ads e produtos prioritários.
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] text-muted-foreground">
            <div className="font-semibold uppercase tracking-wider text-muted-foreground/70">
              Última atualização
            </div>
            <div className="mt-0.5 text-foreground">
              {kbSummary.last ? formatDate(kbSummary.last) : "—"}
            </div>
          </div>
        </div>

        {kbAvailable && kbSummary.total > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(Object.keys(kbSummary.byCat) as KbCategory[])
              .filter((k) => kbSummary.byCat[k] > 0)
              .map((k) => (
                <span
                  key={k}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${KB_CATEGORY_STYLE[k]}`}
                >
                  {KB_CATEGORY_LABEL[k]}
                  <span className="rounded-full bg-white/70 px-1 text-[10px]">
                    {kbSummary.byCat[k]}
                  </span>
                </span>
              ))}
          </div>
        ) : !kbLoading && kbAvailable ? (
          <div className="mt-3 rounded-lg border border-dashed border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-800">
            Nenhuma regra estratégica ativa encontrada. Cadastre regras na{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/ecommerce/base-ia" })}
              className="font-semibold underline"
            >
              Base da IA
            </button>{" "}
            para melhorar a análise.
          </div>
        ) : null}
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
              appliedRules={rulesForInsight(insight.insight_type, kbRules, insight)}
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

                {selectedResult.evaluated_at && (
                  <div className="text-[11px] text-muted-foreground">
                    <span className="font-medium">Avaliado em:</span>{" "}
                    {formatDate(selectedResult.evaluated_at)}
                  </div>
                )}

                {(selectedResult.task_id ||
                  selectedResult.product_id ||
                  selectedResult.listing_id) && (
                  <details className="group rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
                    <summary className="cursor-pointer text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground">
                      Dados técnicos
                    </summary>
                    <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
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
                    </div>
                  </details>
                )}
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

                <AppliedRulesPanel
                  insight={selected}
                  rules={rulesForInsight(selected.insight_type, kbRules, selected)}
                />


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
                    <dt className="text-muted-foreground">Origem</dt>
                    <dd className="text-foreground font-mono">ecommerce_ai_insights</dd>
                    <dt className="text-muted-foreground">Gerado por</dt>
                    <dd className="text-foreground">
                      {selected.generated_by === "ai"
                        ? "IA"
                        : (selected.generated_by ?? "—")}
                    </dd>
                    <dt className="text-muted-foreground">Modelo</dt>
                    <dd className="text-foreground font-mono">
                      {selected.model?.trim() ? selected.model : "—"}
                    </dd>
                    <dt className="text-muted-foreground">Confiança</dt>
                    <dd className="text-foreground">
                      {selected.confidence_score != null
                        ? `${Math.round(
                            Number(selected.confidence_score) *
                              (Number(selected.confidence_score) <= 1 ? 100 : 1),
                          )}%`
                        : "—"}
                    </dd>
                    <dt className="text-muted-foreground">Conta Mercado Livre</dt>
                    <dd className="text-foreground">
                      {accountLabel}
                      {activeAccount?.ml_user_id ? (
                        <span className="ml-1 text-muted-foreground">
                          (ML #{activeAccount.ml_user_id})
                        </span>
                      ) : null}
                    </dd>
                    <dt className="text-muted-foreground">Criado em</dt>
                    <dd className="text-foreground">{formatDate(selected.created_at)}</dd>
                    <dt className="text-muted-foreground">Atualizado em</dt>
                    <dd className="text-foreground">{formatDate(selected.updated_at)}</dd>
                  </dl>
                </div>


                {(selected.product_id || selected.listing_id) && (() => {
                  const product = selected.product_id
                    ? productMap[selected.product_id]
                    : undefined;
                  const listing = selected.listing_id
                    ? listingMap[selected.listing_id]
                    : undefined;
                  const productMissing = !!selected.product_id && !product;
                  const listingMissing = !!selected.listing_id && !listing;
                  const displayName =
                    product?.name?.trim() ||
                    listing?.title?.trim() ||
                    (listing?.ml_item_id ? `Anúncio ${listing.ml_item_id}` : null);
                  const displaySku = product?.sku?.trim() || "Não informado";
                  let notice: string | null = null;
                  if (productMissing && listingMissing) {
                    notice =
                      "Produto e anúncio vinculados não encontrados ou ainda não sincronizados.";
                  } else if (productMissing && listing) {
                    notice = "Anúncio encontrado, mas produto/SKU ainda não sincronizado.";
                  } else if (listingMissing && product) {
                    notice = "Produto encontrado, mas anúncio vinculado não localizado.";
                  }
                  return (
                    <div className="rounded-xl border border-border/60 bg-card p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Produto / Anúncio vinculado
                      </div>
                      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
                        {(selected.product_id || listing) && (
                          <>
                            <dt className="text-muted-foreground">Nome</dt>
                            <dd className="text-foreground">
                              {displayName ?? "—"}
                              {!product?.name && listing?.title ? (
                                <span className="ml-1 text-[10px] text-muted-foreground">
                                  (título do anúncio)
                                </span>
                              ) : null}
                            </dd>
                            <dt className="text-muted-foreground">SKU</dt>
                            <dd className="text-foreground font-mono">{displaySku}</dd>
                            {selected.product_id && (
                              <>
                                <dt className="text-muted-foreground">product_id</dt>
                                <dd className="text-foreground font-mono break-all">
                                  {selected.product_id}
                                </dd>
                              </>
                            )}
                          </>
                        )}
                        {selected.listing_id && (
                          <>
                            <dt className="text-muted-foreground">ML Item ID</dt>
                            <dd className="text-foreground font-mono">
                              {listing?.ml_item_id ?? "—"}
                            </dd>
                            <dt className="text-muted-foreground">Status anúncio</dt>
                            <dd className="text-foreground">{listing?.status ?? "—"}</dd>
                            <dt className="text-muted-foreground">listing_id</dt>
                            <dd className="text-foreground font-mono break-all">
                              {selected.listing_id}
                            </dd>
                          </>
                        )}
                      </dl>
                      {notice && (
                        <div className="mt-2 rounded-md border border-dashed border-amber-200 bg-amber-50/60 px-2.5 py-1.5 text-[11px] text-amber-800">
                          {notice}
                        </div>
                      )}
                    </div>
                  );
                })()}
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

                <AppliedRulesPanel
                  insight={plan}
                  rules={rulesForInsight(plan.insight_type, kbRules, plan)}
                />


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
  appliedRules,
}: {
  insight: Insight;
  onOpen: () => void;
  onCreateTask: () => void;
  onOpenTask: () => void;
  onPlan: () => void;
  creating: boolean;
  opening: boolean;
  appliedRules: KbRule[];
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
          {appliedRules.length > 0 && (
            <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/40 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                <BookOpen className="h-3 w-3" />
                Regras consideradas
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {appliedRules.slice(0, 4).map((r) => (
                  <span
                    key={r.id}
                    title={r.description ?? undefined}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${KB_CATEGORY_STYLE[r.category]}`}
                  >
                    <span className="opacity-70">{KB_CATEGORY_LABEL[r.category]}:</span>
                    <span className="truncate max-w-[220px]">{r.title}</span>
                  </span>
                ))}
                {appliedRules.length > 4 && (
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                    +{appliedRules.length - 4}
                  </span>
                )}
              </div>
            </div>
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

function AppliedRulesPanel({
  insight,
  rules,
}: {
  insight: Insight;
  rules: KbRule[];
}) {
  const originLabel = insight.generated_by
    ? `Motor de insights (${insight.generated_by})`
    : "Motor de insights";
  const typeLabel = insight.insight_type
    ? (TYPE_LABEL[insight.insight_type] ?? insight.insight_type)
    : "—";
  const statusLabel = insight.status
    ? (STATUS_LABEL[insight.status] ?? insight.status)
    : "—";
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
        <BookOpen className="h-3.5 w-3.5" />
        Contexto estratégico
      </div>

      <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
        <dt className="text-muted-foreground">Origem do insight</dt>
        <dd className="text-foreground">{originLabel}</dd>
        <dt className="text-muted-foreground">Dados considerados</dt>
        <dd className="text-foreground">{typeLabel}</dd>
        <dt className="text-muted-foreground">Próxima ação recomendada</dt>
        <dd className="text-foreground">
          {insight.recommended_action?.trim() ? insight.recommended_action : "—"}
        </dd>
        <dt className="text-muted-foreground">Status da ação</dt>
        <dd className="text-foreground">{statusLabel}</dd>
      </dl>

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Regras da Base da IA aplicadas
        </div>
        {rules.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Nenhuma regra estratégica ativa aplicável a este tipo de insight.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {rules.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-border/60 bg-card px-2.5 py-1.5 text-xs"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${KB_CATEGORY_STYLE[r.category]}`}
                  >
                    {KB_CATEGORY_LABEL[r.category]}
                  </span>
                  <span className="font-semibold text-foreground truncate">
                    {r.title}
                  </span>
                </div>
                {r.description && (
                  <p className="mt-1 line-clamp-2 text-muted-foreground">
                    {r.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, ClientOnly, Link } from "@tanstack/react-router";
import {
  Headphones,
  Flame,
  MessageSquare,
  UserX,
  Sparkles,
  Building2,
  ChevronRight,
  Users,
  BookOpen,
  Bot,
  Clock,
  CheckCircle2,
  Inbox,
  Activity,
  Thermometer,
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Dashboard | Agente Comercial 360" }],
  }),
});

type KpiValue = number | string;
type KpiRoute = "/leads" | "/conversas" | "/atendimentos" | "/relatorios" | "/ia" | "/base-conhecimento" | "/responsaveis";
type Kpi = {
  label: string;
  value: KpiValue;
  icon: typeof Headphones;
  hint?: string;
  to?: KpiRoute;
  cta?: string;
};

const DASH = "—";

// Planned sectors — visible as "em preparação" until routing is connected.
const plannedSectors = [
  { name: "Vendas", desc: "Atendimento comercial e novos negócios" },
  { name: "Financeiro", desc: "Boletos, pagamentos e cobranças" },
  { name: "Administrativo", desc: "Suporte interno e documentos" },
  { name: "Orçamentos", desc: "Propostas e cotações" },
];

const TEMP_COLORS = {
  hot: "oklch(0.62 0.22 25)",
  warm: "oklch(0.74 0.17 70)",
  cold: "oklch(0.62 0.16 250)",
} as const;

type TopLead = {
  name: string;
  item: string;
  score: number | string;
  value: string;
  owner: string;
  nextAction: string | null;
};

type TempBucket = { name: string; value: number; color: string };
type DayPoint = { day: string; label: string; value: number };

const CHART_H = "h-64";

type LoadStatus = "loading" | "loaded" | "partial" | "unauthenticated" | "error";

function formatBRL(v: number | null | undefined): string {
  if (v == null) return DASH;
  try {
    return v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  } catch {
    return `R$ ${v}`;
  }
}

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function buildLast7Days(): DayPoint[] {
  const out: DayPoint[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: WEEKDAY_SHORT[d.getDay()], label: key, value: 0 });
  }
  return out;
}

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [companyName, setCompanyName] = useState<string>(DASH);

  const [totalLeads, setTotalLeads] = useState<KpiValue>(DASH);
  const [hotLeads, setHotLeads] = useState<KpiValue>(DASH);
  const [convOpen, setConvOpen] = useState<KpiValue>(DASH);
  const [convWaitingClient, setConvWaitingClient] = useState<KpiValue>(DASH);
  const [convWaitingCompany, setConvWaitingCompany] = useState<KpiValue>(DASH);
  const [convFinished, setConvFinished] = useState<KpiValue>(DASH);
  const [convNoResponse, setConvNoResponse] = useState<KpiValue>(DASH);
  const [messagesToday, setMessagesToday] = useState<KpiValue>(DASH);
  const [activeResponsibles, setActiveResponsibles] = useState<KpiValue>(DASH);
  const [activeKnowledge, setActiveKnowledge] = useState<KpiValue>(DASH);
  const [aiConfigured, setAiConfigured] = useState<KpiValue>(DASH);

  const [topLeads, setTopLeads] = useState<TopLead[]>([]);
  const [tempBuckets, setTempBuckets] = useState<TempBucket[] | null>(null);
  const [weekActivity, setWeekActivity] = useState<DayPoint[] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setStatus("loading");

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        setStatus("unauthenticated");
        setLoading(false);
        return;
      }

      const { data: cu, error: cuErr } = await supabase
        .from("company_users")
        .select("company_id")
        .eq("user_id", userData.user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (cuErr || !cu?.company_id) {
        setStatus("error");
        setLoading(false);
        return;
      }

      const companyId = cu.company_id as string;
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const sevenDaysAgo = new Date(startOfToday);
      sevenDaysAgo.setDate(startOfToday.getDate() - 6);

      const countQuery = (table: string) =>
        supabase
          .from(table)
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId);

      const [
        companyRes,
        totalLeadsRes,
        hotLeadsRes,
        warmLeadsRes,
        coldLeadsRes,
        openRes,
        waitClientRes,
        waitCompanyRes,
        finishedRes,
        noResponseRes,
        msgTodayRes,
        respRes,
        kbRes,
        aiRes,
        topLeadsRes,
        weekMsgsRes,
      ] = await Promise.allSettled([
        supabase.from("companies").select("name").eq("id", companyId).maybeSingle(),
        countQuery("leads"),
        countQuery("leads").gte("score", 80),
        countQuery("leads").gte("score", 50).lt("score", 80),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId)
          .or("score.is.null,score.lt.50"),
        countQuery("conversations").eq("status", "aberta"),
        countQuery("conversations").eq("status", "aguardando_cliente"),
        countQuery("conversations").eq("status", "aguardando_empresa"),
        countQuery("conversations").eq("status", "finalizada"),
        countQuery("conversations").eq("status", "sem_resposta"),
        countQuery("messages").gte("created_at", startOfToday.toISOString()),
        countQuery("responsibles").eq("is_active", true),
        countQuery("knowledge_base").eq("is_active", true),
        supabase
          .from("ai_settings")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId),
        supabase
          .from("leads")
          .select("id, interest, score, estimated_value, next_action, customers ( name )")
          .eq("company_id", companyId)
          .gte("score", 80)
          .order("score", { ascending: false })
          .limit(5),
        supabase
          .from("messages")
          .select("created_at")
          .eq("company_id", companyId)
          .gte("created_at", sevenDaysAgo.toISOString())
          .limit(5000),
      ]);

      let failures = 0;

      if (
        companyRes.status === "fulfilled" &&
        !companyRes.value.error &&
        companyRes.value.data?.name
      ) {
        setCompanyName(companyRes.value.data.name as string);
      } else {
        setCompanyName(DASH);
        failures++;
      }

      const applyCount = (
        res: PromiseSettledResult<{ count: number | null; error: unknown }>,
        setter: (v: KpiValue) => void,
      ) => {
        if (res.status === "fulfilled" && !res.value.error) {
          setter(res.value.count ?? 0);
        } else {
          setter(DASH);
          failures++;
        }
      };

      applyCount(totalLeadsRes as never, setTotalLeads);
      applyCount(hotLeadsRes as never, setHotLeads);
      applyCount(openRes as never, setConvOpen);
      applyCount(waitClientRes as never, setConvWaitingClient);
      applyCount(waitCompanyRes as never, setConvWaitingCompany);
      applyCount(finishedRes as never, setConvFinished);
      applyCount(noResponseRes as never, setConvNoResponse);
      applyCount(msgTodayRes as never, setMessagesToday);
      applyCount(respRes as never, setActiveResponsibles);
      applyCount(kbRes as never, setActiveKnowledge);

      // Temperature buckets
      const getCount = (
        r: PromiseSettledResult<{ count: number | null; error: unknown }>,
      ): number | null => {
        if (r.status === "fulfilled" && !r.value.error) return r.value.count ?? 0;
        return null;
      };
      const hot = getCount(hotLeadsRes as never);
      const warm = getCount(warmLeadsRes as never);
      const cold = getCount(coldLeadsRes as never);
      if (hot != null && warm != null && cold != null) {
        setTempBuckets([
          { name: "Quentes", value: hot, color: TEMP_COLORS.hot },
          { name: "Mornos", value: warm, color: TEMP_COLORS.warm },
          { name: "Frios", value: cold, color: TEMP_COLORS.cold },
        ]);
      } else {
        setTempBuckets(null);
        failures++;
      }

      // AI configured
      if (aiRes.status === "fulfilled" && !aiRes.value.error) {
        setAiConfigured((aiRes.value.count ?? 0) > 0 ? "Sim" : "Não");
      } else {
        setAiConfigured(DASH);
        failures++;
      }

      // Top leads
      if (
        topLeadsRes.status === "fulfilled" &&
        !topLeadsRes.value.error &&
        topLeadsRes.value.data
      ) {
        const rows = topLeadsRes.value.data as Array<{
          id: string;
          interest: string | null;
          score: number | null;
          estimated_value: number | null;
          next_action: string | null;
          customers: { name: string | null } | { name: string | null }[] | null;
        }>;
        const mapped: TopLead[] = rows.map((r) => {
          const cust = Array.isArray(r.customers) ? r.customers[0] : r.customers;
          const action = r.next_action?.trim();
          return {
            name: cust?.name ?? DASH,
            item: r.interest ?? DASH,
            score: r.score ?? DASH,
            value: formatBRL(r.estimated_value),
            owner: DASH,
            nextAction: action && action.length > 0 ? action : null,
          };
        });
        setTopLeads(mapped);
      } else {
        setTopLeads([]);
        failures++;
      }

      // Last 7 days activity
      if (weekMsgsRes.status === "fulfilled" && !weekMsgsRes.value.error) {
        const rows = (weekMsgsRes.value.data ?? []) as Array<{ created_at: string }>;
        const skeleton = buildLast7Days();
        const map = new Map(skeleton.map((d) => [d.label, d]));
        for (const row of rows) {
          if (!row.created_at) continue;
          const key = new Date(row.created_at).toISOString().slice(0, 10);
          const slot = map.get(key);
          if (slot) slot.value += 1;
        }
        setWeekActivity(skeleton);
      } else {
        setWeekActivity(null);
        failures++;
      }

      setStatus(failures === 0 ? "loaded" : "partial");
      setLastUpdated(new Date());
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statusBadge = (() => {
    switch (status) {
      case "loaded":
        return { text: "Dados carregados do Supabase", color: "text-emerald-600" };
      case "partial":
        return {
          text: "Carregamento parcial — algumas métricas indisponíveis",
          color: "text-amber-600",
        };
      case "error":
        return { text: "Não foi possível carregar os dados.", color: "text-rose-600" };
      case "unauthenticated":
        return { text: "Usuário não autenticado.", color: "text-amber-600" };
      default:
        return { text: "Carregando métricas…", color: "text-muted-foreground" };
    }
  })();

  const updatedText = lastUpdated
    ? `Atualizado às ${lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    : "";

  const kpisPrimary: Kpi[] = [
    { label: "Mensagens hoje", value: messagesToday, icon: Headphones, to: "/atendimentos", cta: "Ver atendimentos" },
    { label: "Leads quentes (score ≥ 80)", value: hotLeads, icon: Flame, to: "/leads", cta: "Ver leads" },
    { label: "Conversas abertas", value: convOpen, icon: MessageSquare, to: "/conversas", cta: "Ver conversas" },
    { label: "Clientes sem resposta", value: convNoResponse, icon: UserX, to: "/conversas", cta: "Ver conversas" },
  ];

  const kpisSecondary: Kpi[] = [
    { label: "Total de leads", value: totalLeads, icon: Flame, to: "/leads" },
    { label: "Aguardando cliente", value: convWaitingClient, icon: Clock, to: "/conversas" },
    { label: "Aguardando empresa", value: convWaitingCompany, icon: Inbox, to: "/conversas" },
    { label: "Finalizadas", value: convFinished, icon: CheckCircle2, to: "/conversas" },
    { label: "Responsáveis ativos", value: activeResponsibles, icon: Users, to: "/responsaveis" },
    { label: "Base de conhecimento ativa", value: activeKnowledge, icon: BookOpen, to: "/base-conhecimento" },
    { label: "IA configurada", value: aiConfigured, icon: Bot, to: "/ia", cta: aiConfigured === "Não" ? "Configurar IA" : "Acessar" },
  ];

  const tempTotal = useMemo(
    () => (tempBuckets ? tempBuckets.reduce((s, b) => s + b.value, 0) : 0),
    [tempBuckets],
  );
  const weekTotal = useMemo(
    () => (weekActivity ? weekActivity.reduce((s, d) => s + d.value, 0) : 0),
    [weekActivity],
  );
  const weekAvg = weekActivity && weekActivity.length ? Math.round(weekTotal / 7) : 0;
  const weekPeak = useMemo(() => {
    if (!weekActivity || weekActivity.length === 0) return null;
    return weekActivity.reduce((max, d) => (d.value > max.value ? d : max), weekActivity[0]);
  }, [weekActivity]);

  const tempInsight = useMemo(() => {
    if (!tempBuckets) return null;
    if (tempTotal === 0) return "Nenhum lead registrado ainda.";
    const hotPct = Math.round(((tempBuckets[0]?.value ?? 0) / tempTotal) * 100);
    if (hotPct >= 50) return `${hotPct}% dos leads estão em alta intenção de compra.`;
    if (hotPct >= 20) return `${hotPct}% dos leads já demonstram intenção forte de compra.`;
    return `A maior parte dos leads ainda está em fase de aquecimento (${hotPct}% quentes).`;
  }, [tempBuckets, tempTotal]);

  const num = (v: KpiValue) => (typeof v === "number" ? v : 0);
  const execSummary = useMemo(() => {
    const parts: string[] = [];
    parts.push(`A operação possui ${num(totalLeads)} lead(s) cadastrado(s)`);
    parts.push(`${num(hotLeads)} oportunidade(s) quente(s)`);
    parts.push(`${num(convFinished)} conversa(s) finalizada(s)`);
    parts.push(`IA ${aiConfigured === "Sim" ? "configurada" : "ainda não configurada"}`);
    parts.push(`${num(activeResponsibles)} responsável(is) ativo(s)`);
    if (typeof messagesToday === "number") {
      parts.push(`${messagesToday} mensagem(ns) trocada(s) hoje`);
    }
    const base = parts.join(" · ") + ".";
    const kb =
      typeof activeKnowledge === "number"
        ? ` A base de conhecimento possui ${activeKnowledge} registro(s) ativo(s).`
        : "";
    return base + kb;
  }, [
    totalLeads,
    hotLeads,
    convFinished,
    messagesToday,
    aiConfigured,
    activeResponsibles,
    activeKnowledge,
  ]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Dashboard Comercial
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Visão geral dos atendimentos, leads e oportunidades de {companyName}.
            </p>
            <p className={`mt-1 text-xs font-medium ${statusBadge.color}`}>
              {statusBadge.text}
              {updatedText && status !== "loading" ? ` · ${updatedText}` : ""}
            </p>
          </div>
        </div>

        {/* KPIs principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpisPrimary.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                className="rounded-2xl bg-card p-5 border border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  {k.to && k.cta ? (
                    <Link
                      to={k.to}
                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:underline"
                    >
                      {k.cta} <ChevronRight className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
                <div className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
                  {k.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
                {k.hint ? (
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-amber-600">
                    {k.hint}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* KPIs secundários */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {kpisSecondary.map((k) => {
            const Icon = k.icon;
            const showCta = k.label === "IA configurada" && k.value === "Não";
            const content = (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-[11px] leading-tight">{k.label}</span>
                </div>
                <div className="mt-2 font-display text-xl font-bold text-foreground">
                  {k.value}
                </div>
                {showCta ? (
                  <div className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary">
                    Configurar IA <ChevronRight className="h-3 w-3" />
                  </div>
                ) : null}
              </>
            );
            const baseClass =
              "block rounded-xl bg-card p-4 border border-border shadow-[var(--shadow-soft)]";
            if (k.to) {
              return (
                <Link
                  key={k.label}
                  to={k.to}
                  className={`${baseClass} transition hover:bg-muted/30 hover:shadow-[var(--shadow-card)]`}
                >
                  {content}
                </Link>
              );
            }
            return (
              <div key={k.label} className={baseClass}>
                {content}
              </div>
            );
          })}
        </div>

        {/* Resumo executivo (real) */}
        {/* Resumo executivo (gerado a partir dos dados reais) */}
        <div className="rounded-2xl border border-border p-6 shadow-[var(--shadow-soft)] bg-gradient-to-br from-[var(--brand-blue-soft)] via-card to-card relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">Resumo executivo</h3>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  ao vivo
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{execSummary}</p>
            </div>
          </div>
        </div>


        {/* Charts row: activity + temperature */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">
                    Atividade nos últimos 7 dias
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    ao vivo
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Baseado nas mensagens registradas no Supabase
                </p>
                <Link
                  to="/relatorios"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Ver relatório <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-right">
                  <div className="font-display text-lg font-bold leading-none text-foreground tabular-nums">
                    {weekActivity ? weekTotal : DASH}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
                    total
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-right">
                  <div className="font-display text-lg font-bold leading-none text-foreground tabular-nums">
                    {weekActivity ? weekAvg : DASH}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
                    média/dia
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-right">
                  <div className="font-display text-lg font-bold leading-none text-foreground tabular-nums">
                    {weekPeak && weekPeak.value > 0 ? `${weekPeak.day} · ${weekPeak.value}` : DASH}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
                    pico
                  </div>
                </div>
              </div>
            </div>

            <div className={`${CHART_H} mt-4`}>
              <ClientOnly
                fallback={<div className="h-full w-full animate-pulse rounded-xl bg-muted" />}
              >
                {weekActivity == null ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {loading ? "Carregando…" : "Sem dados disponíveis."}
                  </div>
                ) : weekTotal === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <Inbox className="h-8 w-8 text-muted-foreground/60" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Nenhuma mensagem nos últimos 7 dias
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Assim que o WhatsApp começar a registrar conversas, o gráfico aparece aqui.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weekActivity} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="actFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.55 0.22 258)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="oklch(0.55 0.22 258)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.94 0.01 255)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        stroke="oklch(0.55 0.04 257)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="oklch(0.55 0.04 257)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid oklch(0.92 0.01 255)",
                          fontSize: 12,
                          boxShadow: "var(--shadow-soft)",
                        }}
                        formatter={(v: number) => [`${v} mensagens`, "Atividade"]}
                        labelFormatter={(l) => `${l}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="oklch(0.55 0.22 258)"
                        strokeWidth={2.5}
                        fill="url(#actFill)"
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ClientOnly>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {weekActivity && weekTotal > 0 && weekTotal < 10
                ? "Baixo volume de mensagens registrado nesta semana."
                : "Conforme novas mensagens forem registradas, este gráfico mostrará a evolução da operação comercial."}
            </p>
          </div>


          <div className="rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Leads por temperatura</h3>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                ao vivo
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">
              Classificação por score do lead no Supabase
            </p>

            <div className={CHART_H}>
              <ClientOnly
                fallback={<div className="h-full w-full animate-pulse rounded-xl bg-muted" />}
              >
                {tempBuckets == null ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {loading ? "Carregando…" : "Sem dados disponíveis."}
                  </div>
                ) : tempTotal === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <Flame className="h-8 w-8 text-muted-foreground/60" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Nenhum lead cadastrado ainda
                    </p>
                    <p className="text-xs text-muted-foreground">
                      A distribuição aparece aqui quando houver leads com score.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tempBuckets}
                        dataKey="value"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {tempBuckets.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-soft)" }}
                        formatter={(v: number, n) => [`${v} leads`, n as string]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ClientOnly>
            </div>

            {tempInsight ? (
              <div className="mt-3 rounded-xl border border-border bg-muted/30 p-3 text-xs text-foreground/80">
                <span className="font-semibold text-foreground">Insight:</span> {tempInsight}
              </div>
            ) : null}

            {tempBuckets && tempTotal > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {tempBuckets.map((d) => {
                  const pct = tempTotal ? Math.round((d.value / tempTotal) * 100) : 0;
                  return (
                    <div
                      key={d.name}
                      className="rounded-xl border border-border bg-muted/30 p-2.5 text-center"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: d.color }}
                        />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {d.name}
                        </span>
                      </div>
                      <div className="mt-1 font-display text-lg font-bold text-foreground leading-none">
                        {d.value}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Oportunidades prioritárias + Operação por setor */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-rose-500" />
                  <h3 className="text-base font-semibold text-foreground">
                    Oportunidades prioritárias
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    ao vivo
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Leads com score ≥ 80, ordenados pelo maior potencial
                </p>
              </div>
              <Link
                to="/leads"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Ver todos <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {topLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/20 py-10 text-center">
                <Flame className="h-7 w-7 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">
                  {loading ? "Carregando…" : "Nenhuma oportunidade quente no momento"}
                </p>
                {!loading && (
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Leads com score ≥ 80 aparecem aqui assim que forem qualificados.
                  </p>
                )}
              </div>
            ) : (
              <ul className="space-y-2.5">
                {topLeads.map((l, i) => {
                  const scoreNum = typeof l.score === "number" ? l.score : 0;
                  const tempColor =
                    scoreNum >= 80
                      ? "from-rose-500 to-orange-500"
                      : scoreNum >= 50
                        ? "from-amber-400 to-orange-400"
                        : "from-sky-400 to-blue-500";
                  const tempLabel = scoreNum >= 80 ? "Quente" : scoreNum >= 50 ? "Morno" : "Frio";
                  return (
                    <li
                      key={`${l.name}-${i}`}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:bg-muted/30 hover:shadow-[var(--shadow-soft)]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-blue-soft)] font-display text-sm font-bold text-primary">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {l.name}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${tempColor} px-2 py-0.5 text-[10px] font-bold text-white shadow-sm`}
                          >
                            <Flame className="h-3 w-3" />
                            {tempLabel} · {l.score}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                          {l.item}
                        </div>
                        <div className="mt-1 truncate text-[11px] text-foreground/80">
                          <span className="font-semibold text-foreground">Próxima ação:</span>{" "}
                          {l.nextAction ?? "ainda não definida."}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display text-sm font-bold text-foreground tabular-nums">
                          {l.value}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          valor estimado
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Operação por setor</h3>
              </div>
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-200">
                Em preparação
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              O roteamento por setor permitirá identificar automaticamente se o atendimento é de
              vendas, financeiro, administrativo ou orçamento.
            </p>
            <ul className="space-y-2">
              {plannedSectors.map((s) => (
                <li
                  key={s.name}
                  className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-blue-soft)] text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[10px] uppercase tracking-wide text-muted-foreground">
              Recurso futuro · demonstrativo
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useCallback, useEffect, useState } from "react";
import { createFileRoute, ClientOnly, Link } from "@tanstack/react-router";
import {
  Headphones,
  Flame,
  MessageSquare,
  UserX,
  Sparkles,
  ListChecks,
  Building2,
  ChevronRight,
  RefreshCw,
  Users,
  BookOpen,
  Bot,
  Clock,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
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
type Kpi = {
  label: string;
  value: KpiValue;
  icon: typeof Headphones;
  hint?: string;
};

const DASH = "—";

// Demo data (clearly labeled as demonstrative in UI)
const sectorData = [
  { name: "Vendas", value: 72 },
  { name: "Financeiro", value: 18 },
  { name: "Administrativo", value: 22 },
  { name: "Orçamentos", value: 16 },
];

const tempData = [
  { name: "Quentes", value: 14, color: "oklch(0.6 0.22 25)" },
  { name: "Mornos", value: 11, color: "oklch(0.72 0.18 70)" },
  { name: "Frios", value: 7, color: "oklch(0.6 0.18 250)" },
];

const weekData = [
  { day: "Seg", value: 92 },
  { day: "Ter", value: 110 },
  { day: "Qua", value: 98 },
  { day: "Qui", value: 134 },
  { day: "Sex", value: 121 },
  { day: "Sáb", value: 86 },
  { day: "Dom", value: 54 },
];

const nextActions = [
  "Priorizar leads quentes aguardando orçamento",
  "Responder clientes sem retorno",
  "Encaminhar pendências financeiras",
  "Conferir disponibilidade de itens mais solicitados",
  "Revisar conversas abertas há mais de 24 horas",
];

type TopLead = {
  name: string;
  item: string;
  score: number | string;
  value: string;
  owner: string;
};

const CHART_H = "h-60";

type LoadStatus = "loading" | "loaded" | "partial" | "unauthenticated" | "error";

function formatBRL(v: number | null | undefined): string {
  if (v == null) return DASH;
  try {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  } catch {
    return `R$ ${v}`;
  }
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
  const [messagesToday, setMessagesToday] = useState<KpiValue>(DASH);
  const [activeResponsibles, setActiveResponsibles] = useState<KpiValue>(DASH);
  const [activeKnowledge, setActiveKnowledge] = useState<KpiValue>(DASH);
  const [aiConfigured, setAiConfigured] = useState<KpiValue>(DASH);

  const [topLeads, setTopLeads] = useState<TopLead[]>([]);

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

      const countQuery = (table: string) =>
        supabase.from(table).select("id", { count: "exact", head: true }).eq("company_id", companyId);

      const [
        companyRes,
        totalLeadsRes,
        hotLeadsRes,
        openRes,
        waitClientRes,
        waitCompanyRes,
        finishedRes,
        msgTodayRes,
        respRes,
        kbRes,
        aiRes,
        topLeadsRes,
      ] = await Promise.allSettled([
        supabase.from("companies").select("name").eq("id", companyId).maybeSingle(),
        countQuery("leads"),
        countQuery("leads").gte("score", 80),
        countQuery("conversations").eq("status", "aberta"),
        countQuery("conversations").eq("status", "aguardando_cliente"),
        countQuery("conversations").eq("status", "aguardando_empresa"),
        countQuery("conversations").eq("status", "finalizada"),
        countQuery("messages").gte("created_at", startOfToday.toISOString()),
        countQuery("responsibles").eq("is_active", true),
        countQuery("knowledge_base").eq("is_active", true),
        supabase.from("ai_settings").select("id", { count: "exact", head: true }).eq("company_id", companyId),
        supabase
          .from("leads")
          .select("id, interest, score, estimated_value, customers ( name )")
          .eq("company_id", companyId)
          .gte("score", 80)
          .order("score", { ascending: false })
          .limit(5),
      ]);

      let failures = 0;

      // Company
      if (companyRes.status === "fulfilled" && !companyRes.value.error && companyRes.value.data?.name) {
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
      applyCount(msgTodayRes as never, setMessagesToday);
      applyCount(respRes as never, setActiveResponsibles);
      applyCount(kbRes as never, setActiveKnowledge);

      // AI configured = boolean
      if (aiRes.status === "fulfilled" && !aiRes.value.error) {
        setAiConfigured((aiRes.value.count ?? 0) > 0 ? "Sim" : "Não");
      } else {
        setAiConfigured(DASH);
        failures++;
      }

      // Top leads
      if (topLeadsRes.status === "fulfilled" && !topLeadsRes.value.error && topLeadsRes.value.data) {
        const rows = topLeadsRes.value.data as Array<{
          id: string;
          interest: string | null;
          score: number | null;
          estimated_value: number | null;
          customers: { name: string | null } | { name: string | null }[] | null;
        }>;
        const mapped: TopLead[] = rows.map((r) => {
          const cust = Array.isArray(r.customers) ? r.customers[0] : r.customers;
          return {
            name: cust?.name ?? DASH,
            item: r.interest ?? DASH,
            score: r.score ?? DASH,
            value: formatBRL(r.estimated_value),
            owner: DASH,
          };
        });
        setTopLeads(mapped);
      } else {
        setTopLeads([]);
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
        return { text: "Carregamento parcial — algumas métricas indisponíveis", color: "text-amber-600" };
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
    { label: "Mensagens hoje", value: messagesToday, icon: Headphones },
    { label: "Leads quentes (score ≥ 80)", value: hotLeads, icon: Flame },
    { label: "Conversas abertas", value: convOpen, icon: MessageSquare },
    { label: "Clientes sem resposta", value: DASH, icon: UserX, hint: "Regra em configuração" },
  ];

  const kpisSecondary: Kpi[] = [
    { label: "Total de leads", value: totalLeads, icon: Flame },
    { label: "Aguardando cliente", value: convWaitingClient, icon: Clock },
    { label: "Aguardando empresa", value: convWaitingCompany, icon: Inbox },
    { label: "Finalizadas", value: convFinished, icon: CheckCircle2 },
    { label: "Responsáveis ativos", value: activeResponsibles, icon: Users },
    { label: "Base de conhecimento ativa", value: activeKnowledge, icon: BookOpen },
    { label: "IA configurada", value: aiConfigured, icon: Bot },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Dashboard Comercial</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Visão geral dos atendimentos, leads e oportunidades de {companyName}.
            </p>
            <p className={`mt-1 text-xs font-medium ${statusBadge.color}`}>
              {statusBadge.text}
              {updatedText && status !== "loading" ? ` · ${updatedText}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-soft)] hover:bg-muted transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Atualizando…" : "Atualizar"}
          </button>
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
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">{k.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
                {k.hint ? <div className="mt-1 text-[10px] uppercase tracking-wide text-amber-600">{k.hint}</div> : null}
              </div>
            );
          })}
        </div>

        {/* KPIs secundários */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {kpisSecondary.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                className="rounded-xl bg-card p-4 border border-border shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-[11px] leading-tight">{k.label}</span>
                </div>
                <div className="mt-2 font-display text-xl font-bold text-foreground">{k.value}</div>
              </div>
            );
          })}
        </div>

        {/* AI executive summary + next actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-border p-6 shadow-[var(--shadow-soft)] bg-gradient-to-br from-[var(--brand-blue-soft)] via-card to-card relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Resumo demonstrativo da IA</h3>
                  <p className="text-xs text-muted-foreground">Conexão real será ativada na próxima etapa</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                Os KPIs principais agora leem dados reais do Supabase, filtrados pela empresa do usuário logado.
                O resumo executivo e as próximas ações ainda são demonstrativos e serão ligados à IA na próxima fase.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 mb-1">
              <ListChecks className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Próximas ações sugeridas</h3>
            </div>
            <p className="text-[11px] text-amber-600 mb-3">Resumo demonstrativo da IA</p>
            <ul className="space-y-2.5">
              {nextActions.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground/90">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="leading-snug">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Charts (demonstrativos) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-foreground">Atendimentos por dia</h3>
            </div>
            <p className="text-[11px] text-amber-600 mb-3">
              Gráfico demonstrativo — conexão real será ativada na próxima etapa.
            </p>
            <div className={CHART_H}>
              <ClientOnly fallback={<div className="h-full w-full animate-pulse rounded-xl bg-muted" />}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                    <XAxis dataKey="day" stroke="oklch(0.55 0.04 257)" fontSize={12} />
                    <YAxis stroke="oklch(0.55 0.04 257)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 255)", fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="oklch(0.55 0.22 258)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "oklch(0.55 0.22 258)" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <h3 className="text-base font-semibold text-foreground">Leads por temperatura</h3>
            <p className="text-[11px] text-amber-600 mb-3">
              Gráfico demonstrativo — conexão real será ativada na próxima etapa.
            </p>
            <div className={CHART_H}>
              <ClientOnly fallback={<div className="h-full w-full animate-pulse rounded-xl bg-muted" />}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tempData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {tempData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
            <div className="space-y-1.5 mt-2">
              {tempData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-semibold text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top leads + Sector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-500" />
                <h3 className="text-base font-semibold text-foreground">Top 5 leads quentes</h3>
              </div>
              <Link
                to="/leads"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Ver todos os leads <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">#</th>
                    <th className="text-left font-medium px-4 py-2.5">Cliente</th>
                    <th className="text-left font-medium px-4 py-2.5">Interesse</th>
                    <th className="text-left font-medium px-4 py-2.5">Score</th>
                    <th className="text-left font-medium px-4 py-2.5">Valor est.</th>
                    <th className="text-left font-medium px-4 py-2.5">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        {loading ? "Carregando…" : "Nenhum lead quente encontrado."}
                      </td>
                    </tr>
                  ) : (
                    topLeads.map((l, i) => (
                      <tr key={`${l.name}-${i}`} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{l.name}</td>
                        <td className="px-4 py-3 text-foreground/80">{l.item}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                            {l.score}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground/80">{l.value}</td>
                        <td className="px-4 py-3 text-foreground/80">{l.owner}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Operação por setor</h3>
            </div>
            <p className="text-[11px] text-amber-600 mb-3">
              Gráfico demonstrativo — conexão real será ativada na próxima etapa.
            </p>
            <div className={CHART_H}>
              <ClientOnly fallback={<div className="h-full w-full animate-pulse rounded-xl bg-muted" />}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" horizontal={false} />
                    <XAxis type="number" stroke="oklch(0.55 0.04 257)" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="oklch(0.55 0.04 257)" fontSize={12} width={90} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="value" fill="oklch(0.55 0.22 258)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
            <div className="mt-3 space-y-1.5">
              {sectorData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-semibold text-foreground">{s.value} atendimentos</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

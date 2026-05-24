import { useEffect, useState } from "react";
import { createFileRoute, ClientOnly, Link } from "@tanstack/react-router";
import {
  Headphones,
  Flame,
  MessageSquare,
  UserX,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ListChecks,
  Building2,
  ChevronRight,
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

type Kpi = {
  label: string;
  value: number | string;
  icon: typeof Headphones;
  delta: string;
  up: boolean;
};

const kpisMock: Kpi[] = [
  { label: "Atendimentos hoje", value: 128, icon: Headphones, delta: "+12%", up: true },
  { label: "Leads quentes", value: 14, icon: Flame, delta: "+3", up: true },
  { label: "Conversas abertas", value: 26, icon: MessageSquare, delta: "-2", up: false },
  { label: "Clientes sem resposta", value: 9, icon: UserX, delta: "+1", up: false },
];

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
  "Encaminhar pendências financeiras para Vinicius",
  "Conferir disponibilidade das peças mais solicitadas",
  "Revisar conversas abertas há mais de 24 horas",
];

type TopLead = { name: string; item: string; score: number; owner: string };

const topLeadsMock: TopLead[] = [
  { name: "João Martins", item: "Kit embreagem", score: 92, owner: "Amanda" },
  { name: "Fernanda Lima", item: "Bateria 60Ah", score: 88, owner: "Thaís" },
  { name: "Pedro Henrique", item: "Amortecedor dianteiro", score: 81, owner: "Vitor" },
  { name: "Mariana Costa", item: "Alternador", score: 74, owner: "Vitor" },
  { name: "Carlos Souza", item: "Pastilha de freio", score: 68, owner: "Vinicius" },
];

const CHART_H = "h-60";

type LoadStatus = "loading" | "loaded" | "partial" | "unauthenticated" | "error";

function DashboardPage() {
  const [, setLoadingDashboard] = useState(true);
  const [dashboardLoadStatus, setDashboardLoadStatus] = useState<LoadStatus>("loading");
  const [companyName, setCompanyName] = useState<string>("União Auto Peças");
  const [dashboardKpis, setDashboardKpis] = useState<Kpi[]>(kpisMock);
  const [dashboardTopLeads, setDashboardTopLeads] = useState<TopLead[]>(topLeadsMock);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData?.user) {
          if (!cancelled) setDashboardLoadStatus("unauthenticated");
          return;
        }

        const { data: cu, error: cuErr } = await supabase
          .from("company_users")
          .select("company_id")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .maybeSingle();

        if (cuErr || !cu?.company_id) {
          if (!cancelled) setDashboardLoadStatus("error");
          return;
        }

        const companyId = cu.company_id as string;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const [companyRes, todayRes, hotRes, openRes, topLeadsRes] = await Promise.allSettled([
          supabase.from("companies").select("name").eq("id", companyId).single(),
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .gte("created_at", startOfToday.toISOString()),
          supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .gte("score", 80),
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .in("status", ["aberta", "Aberta", "open", "active"]),
          supabase
            .from("leads")
            .select("id, interest, score, customer_id, customers ( name )")
            .eq("company_id", companyId)
            .gte("score", 80)
            .order("score", { ascending: false })
            .limit(5),
        ]);

        if (cancelled) return;

        let failures = 0;

        // Company name
        if (companyRes.status === "fulfilled" && !companyRes.value.error && companyRes.value.data?.name) {
          setCompanyName(companyRes.value.data.name as string);
        } else {
          failures++;
        }

        // KPIs
        const nextKpis: Kpi[] = [...kpisMock];

        if (todayRes.status === "fulfilled" && !todayRes.value.error) {
          nextKpis[0] = {
            label: "Atendimentos hoje",
            value: todayRes.value.count ?? 0,
            icon: Headphones,
            delta: "—",
            up: true,
          };
        } else {
          failures++;
        }

        if (hotRes.status === "fulfilled" && !hotRes.value.error) {
          nextKpis[1] = {
            label: "Leads quentes",
            value: hotRes.value.count ?? 0,
            icon: Flame,
            delta: "—",
            up: true,
          };
        } else {
          failures++;
        }

        if (openRes.status === "fulfilled" && !openRes.value.error) {
          nextKpis[2] = {
            label: "Conversas abertas",
            value: openRes.value.count ?? 0,
            icon: MessageSquare,
            delta: "—",
            up: true,
          };
        } else {
          failures++;
        }

        // KPI 4 (Clientes sem resposta) permanece como mock nesta etapa.
        setDashboardKpis(nextKpis);

        // Top leads
        if (topLeadsRes.status === "fulfilled" && !topLeadsRes.value.error && topLeadsRes.value.data) {
          const rows = topLeadsRes.value.data as Array<{
            id: string;
            interest: string | null;
            score: number | null;
            customers: { name: string | null } | { name: string | null }[] | null;
          }>;

          if (rows.length > 0) {
            const mapped: TopLead[] = rows.map((r) => {
              const cust = Array.isArray(r.customers) ? r.customers[0] : r.customers;
              return {
                name: cust?.name ?? "—",
                item: r.interest ?? "—",
                score: r.score ?? 0,
                owner: "—",
              };
            });
            setDashboardTopLeads(mapped);
          }
        } else {
          failures++;
        }

        setDashboardLoadStatus(failures === 0 ? "loaded" : "partial");
      } catch {
        if (!cancelled) setDashboardLoadStatus("error");
      } finally {
        if (!cancelled) setLoadingDashboard(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusBadge = (() => {
    switch (dashboardLoadStatus) {
      case "loaded":
        return { text: "Dados carregados do Supabase — Dashboard", color: "text-emerald-600" };
      case "partial":
        return { text: "Dashboard parcialmente carregado do Supabase", color: "text-amber-600" };
      case "error":
        return {
          text: "Não foi possível carregar métricas reais. Usando dados locais temporários.",
          color: "text-rose-600",
        };
      case "unauthenticated":
        return {
          text: "Usuário não autenticado. Usando dados locais temporários.",
          color: "text-amber-600",
        };
      default:
        return { text: "Carregando métricas…", color: "text-muted-foreground" };
    }
  })();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Dashboard Comercial</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Visão geral dos atendimentos, leads e oportunidades da {companyName}.
          </p>
          <p className={`mt-1 text-xs font-medium ${statusBadge.color}`}>{statusBadge.text}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardKpis.map((k) => {
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
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      k.up ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {k.delta}
                  </span>
                </div>
                <div className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">{k.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
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
                  <h3 className="text-base font-semibold text-foreground">Resumo executivo da IA</h3>
                  <p className="text-xs text-muted-foreground">Atualizado agora</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                O Dashboard já iniciou a leitura de métricas reais do Supabase para{" "}
                <span className="font-semibold">atendimentos</span>,{" "}
                <span className="font-semibold">leads quentes</span> e{" "}
                <span className="font-semibold">conversas abertas</span>. Nesta etapa, gráficos avançados, clientes sem
                resposta e operação por setor ainda usam dados temporários até a próxima fase da integração.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Próximas ações sugeridas pela IA</h3>
            </div>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Atendimentos por dia</h3>
                <p className="text-xs text-muted-foreground">Últimos 7 dias (dados temporários)</p>
              </div>
            </div>
            <div className={CHART_H}>
              <ClientOnly fallback={<div className="h-full w-full animate-pulse rounded-xl bg-muted" />}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                    <XAxis dataKey="day" stroke="oklch(0.55 0.04 257)" fontSize={12} />
                    <YAxis stroke="oklch(0.55 0.04 257)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid oklch(0.92 0.01 255)",
                        fontSize: 12,
                      }}
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
            <p className="text-xs text-muted-foreground mb-4">Distribuição atual (dados temporários)</p>
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
                    <th className="text-left font-medium px-4 py-2.5">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dashboardTopLeads.map((l, i) => (
                    <tr key={`${l.name}-${i}`} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{l.name}</td>
                      <td className="px-4 py-3 text-foreground/80">{l.item}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                          {l.score}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground/80">{l.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Operação por setor</h3>
            </div>
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

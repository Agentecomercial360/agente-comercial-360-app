import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import {
  Headphones,
  UserPlus,
  Flame,
  MessageSquare,
  UserX,
  Wallet,
  ClipboardList,
  LayoutGrid,
  ArrowUpRight,
  ArrowDownRight,
  Circle,
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

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Dashboard | Agente Comercial 360" }],
  }),
});

const kpis = [
  { label: "Atendimentos hoje", value: 128, icon: Headphones, delta: "+12%", up: true },
  { label: "Leads abertos", value: 32, icon: UserPlus, delta: "+5%", up: true },
  { label: "Leads quentes", value: 14, icon: Flame, delta: "+3", up: true },
  { label: "Conversas abertas", value: 26, icon: MessageSquare, delta: "-2", up: false },
  { label: "Clientes sem resposta", value: 9, icon: UserX, delta: "+1", up: false },
  { label: "Pendências financeiras", value: 6, icon: Wallet, delta: "-1", up: true },
  { label: "Solicitações administrativas", value: 11, icon: ClipboardList, delta: "+4", up: true },
  { label: "Atendimentos por setor", value: "5 setores", icon: LayoutGrid, delta: "estável", up: true },
];

const sectorData = [
  { name: "Vendas", value: 54 },
  { name: "Financeiro", value: 22 },
  { name: "Administrativo", value: 18 },
  { name: "Orçamentos", value: 24 },
  { name: "Outros", value: 10 },
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

const activities = [
  { title: "Novo lead interessado em peça de suspensão", time: "há 4 min", tone: "blue" },
  { title: "Cliente aguardando retorno financeiro", time: "há 18 min", tone: "amber" },
  { title: "Solicitação administrativa recebida", time: "há 32 min", tone: "slate" },
  { title: "Conversa de venda em andamento", time: "há 1 h", tone: "blue" },
  { title: "Lead quente aguardando responsável", time: "há 2 h", tone: "red" },
];

const toneClasses: Record<string, string> = {
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  slate: "bg-slate-400",
  red: "bg-rose-500",
};

function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Dashboard Comercial</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Visão geral dos atendimentos, leads e oportunidades da União Auto Peças.
          </p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => {
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
                <div className="mt-4 text-3xl font-bold tracking-tight text-foreground">{k.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Atendimentos por dia</h3>
                <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
              </div>
            </div>
            <div className="h-64">
              <ClientOnly fallback={<div className="h-full w-full animate-pulse rounded-xl bg-muted" />}>
                <>
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
                </>
              </ClientOnly>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <h3 className="text-base font-semibold text-foreground">Leads por temperatura</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribuição atual</p>
            <div className="h-48">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <h3 className="text-base font-semibold text-foreground">Atendimentos por setor</h3>
            <p className="text-xs text-muted-foreground mb-4">Volume por área da operação</p>
            <div className="h-64">
              <ClientOnly fallback={<div className="h-full w-full animate-pulse rounded-xl bg-muted" />}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                    <XAxis dataKey="name" stroke="oklch(0.55 0.04 257)" fontSize={12} />
                    <YAxis stroke="oklch(0.55 0.04 257)" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="value" fill="oklch(0.55 0.22 258)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </div>

          {/* Recent activities */}
          <div className="rounded-2xl bg-card p-6 border border-border shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Atividades recentes</h3>
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
            </div>
            <ul className="space-y-4">
              {activities.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneClasses[a.tone]}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground leading-snug">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

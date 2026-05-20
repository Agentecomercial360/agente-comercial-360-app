import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Flame, Handshake, UserX, Search, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/leads")({
  component: LeadsPage,
  head: () => ({ meta: [{ title: "Leads | Agente Comercial 360" }] }),
});

const summary = [
  { label: "Total de leads", value: 32, icon: Users },
  { label: "Leads quentes", value: 14, icon: Flame },
  { label: "Leads em negociação", value: 9, icon: Handshake },
  { label: "Leads sem responsável", value: 3, icon: UserX },
];

const filters = [
  "Todos",
  "Quentes",
  "Mornos",
  "Frios",
  "Abertos",
  "Em negociação",
  "Perdidos",
  "Fechados",
];

type Lead = {
  cliente: string;
  telefone: string;
  peca: string;
  veiculo: string;
  ano: number;
  temperatura: "Quente" | "Morno" | "Frio";
  score: number;
  status:
    | "Aberto"
    | "Em negociação"
    | "Aguardando retorno"
    | "Sem resposta"
    | "Fechado"
    | "Perdido";
  responsavel: string;
  proximaAcao: string;
};

const leads: Lead[] = [
  {
    cliente: "João Martins",
    telefone: "(15) 99999-1020",
    peca: "Kit embreagem",
    veiculo: "Gol 1.6",
    ano: 2014,
    temperatura: "Quente",
    score: 92,
    status: "Em negociação",
    responsavel: "Amanda",
    proximaAcao: "Enviar orçamento",
  },
  {
    cliente: "Carlos Souza",
    telefone: "(15) 98888-2211",
    peca: "Pastilha de freio",
    veiculo: "Onix",
    ano: 2019,
    temperatura: "Morno",
    score: 68,
    status: "Aguardando retorno",
    responsavel: "Vinicius",
    proximaAcao: "Fazer follow-up",
  },
  {
    cliente: "Fernanda Lima",
    telefone: "(15) 97777-3344",
    peca: "Bateria 60Ah",
    veiculo: "HB20",
    ano: 2020,
    temperatura: "Quente",
    score: 88,
    status: "Aberto",
    responsavel: "Thaís",
    proximaAcao: "Confirmar disponibilidade",
  },
  {
    cliente: "Roberto Alves",
    telefone: "(15) 96666-4455",
    peca: "Amortecedor dianteiro",
    veiculo: "Corolla",
    ano: 2016,
    temperatura: "Frio",
    score: 41,
    status: "Sem resposta",
    responsavel: "Lorenzzo",
    proximaAcao: "Tentar novo contato",
  },
  {
    cliente: "Mariana Costa",
    telefone: "(15) 95555-7788",
    peca: "Alternador",
    veiculo: "Palio",
    ano: 2012,
    temperatura: "Morno",
    score: 74,
    status: "Em negociação",
    responsavel: "Vitor",
    proximaAcao: "Verificar estoque",
  },
];

const tempBadge: Record<Lead["temperatura"], string> = {
  Quente: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  Morno: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Frio: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
};

const statusBadge: Record<Lead["status"], string> = {
  Aberto: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  "Em negociação": "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
  "Aguardando retorno": "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  "Sem resposta": "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  Fechado: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Perdido: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

function LeadsPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Leads
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Visualize oportunidades comerciais, temperatura dos leads e próximas ações.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl bg-card p-5 border border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filters + search */}
        <div className="rounded-2xl bg-card p-4 border border-border shadow-[var(--shadow-soft)] space-y-3">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por cliente, telefone ou peça..."
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        {/* Table + AI summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    {[
                      "Cliente",
                      "Telefone",
                      "Peça/produto",
                      "Veículo",
                      "Ano",
                      "Temperatura",
                      "Score",
                      "Status",
                      "Responsável",
                      "Próxima ação",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr
                      key={l.cliente}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                        {l.cliente}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {l.telefone}
                      </td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{l.peca}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {l.veiculo}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{l.ano}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tempBadge[l.temperatura]}`}
                        >
                          {l.temperatura}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-display font-bold text-foreground">
                        {l.score}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${statusBadge[l.status]}`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {l.responsavel}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {l.proximaAcao}
                      </td>
                      <td className="px-4 py-3">
                        <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap">
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI summary */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-[var(--brand-blue-soft)] to-card p-6 shadow-[var(--shadow-soft)] h-fit">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Resumo da IA</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A IA identificou{" "}
              <span className="font-semibold text-foreground">14 leads quentes</span> e{" "}
              <span className="font-semibold text-foreground">
                3 oportunidades sem responsável
              </span>
              . Priorize contatos com maior score e clientes aguardando orçamento.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  Target,
  Flame,
  UserX,
  Download,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/relatorios")({
  component: RelatoriosPage,
  head: () => ({ meta: [{ title: "Relatórios | Agente Comercial 360" }] }),
});

const periodos = ["Hoje", "Ontem", "Últimos 7 dias", "Últimos 30 dias"];

const cards = [
  { label: "Atendimentos do dia", value: 128, icon: Activity },
  { label: "Oportunidades geradas", value: 32, icon: Target },
  { label: "Leads quentes", value: 14, icon: Flame },
  { label: "Clientes sem resposta", value: 9, icon: UserX },
];

const setores = [
  { nome: "Vendas", valor: 72, cor: "bg-blue-600" },
  { nome: "Administrativo", valor: 22, cor: "bg-slate-700" },
  { nome: "Financeiro", valor: 18, cor: "bg-emerald-600" },
  { nome: "Orçamentos", valor: 16, cor: "bg-amber-500" },
];

const pecas = [
  "Kit embreagem",
  "Pastilha de freio",
  "Bateria 60Ah",
  "Amortecedor dianteiro",
  "Alternador",
];

const leadsTemperatura = [
  { nome: "Quentes", valor: 14, cor: "bg-red-500", total: 60 },
  { nome: "Mornos", valor: 21, cor: "bg-amber-500", total: 60 },
  { nome: "Frios", valor: 25, cor: "bg-blue-500", total: 60 },
];

const semana = [
  { dia: "Seg", valor: 96 },
  { dia: "Ter", valor: 112 },
  { dia: "Qua", valor: 88 },
  { dia: "Qui", valor: 134 },
  { dia: "Sex", valor: 128 },
  { dia: "Sáb", valor: 64 },
  { dia: "Dom", valor: 32 },
];

const recomendacoes = [
  "Priorizar os 14 leads quentes identificados",
  "Retornar clientes aguardando orçamento",
  "Revisar pendências financeiras abertas",
  "Validar disponibilidade das peças mais solicitadas",
  "Conferir clientes sem resposta há mais de 24 horas",
  "Acompanhar responsáveis com maior volume de atendimentos",
];

function RelatoriosPage() {
  const [periodo, setPeriodo] = useState("Hoje");
  const maxSemana = Math.max(...semana.map((s) => s.valor));

  return (
    <DashboardLayout
      title="Relatórios"
      subtitle="Acompanhe indicadores, resumo executivo e recomendações da IA para a operação comercial."
    >
      <div className="space-y-6">
        {/* Cabeçalho do relatório */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Relatório Gerencial — União Auto Peças
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Resumo operacional gerado com base nos atendimentos, leads e conversas do período.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Exportar relatório
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {periodos.map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  periodo === p
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Cards principais */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{c.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <c.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Bloco de indicadores */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total de atendimentos do dia</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">128</p>
            <p className="text-xs text-slate-500">atendimentos registrados</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <p className="text-sm font-semibold text-slate-700">Atendimentos por setor</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {setores.map((s) => (
                <div key={s.nome} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{s.nome}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{s.valor}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Novos x recorrentes</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Novos clientes</span>
                <span className="font-bold text-slate-900">41</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Recorrentes</span>
                <span className="font-bold text-slate-900">87</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Oportunidades de vendas</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">32</p>
            <p className="text-xs text-slate-500">oportunidades comerciais identificadas</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Principais peças solicitadas</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {pecas.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Leads quentes</p>
            <p className="mt-2 text-2xl font-bold text-red-600">14</p>
            <p className="text-xs text-slate-500">classificados como quentes</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pendências de vendas</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">6</p>
            <p className="text-xs text-slate-500">clientes aguardando orçamento</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Solicitações administrativas</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">11</p>
            <p className="text-xs text-slate-500">solicitações registradas</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pendências financeiras</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">6</p>
            <p className="text-xs text-slate-500">pendências de cobrança</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Clientes sem resposta</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">9</p>
            <p className="text-xs text-slate-500">aguardando retorno</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Atendimentos por setor</p>
            </div>
            <div className="mt-4 space-y-3">
              {setores.map((s) => {
                const pct = Math.round((s.valor / 128) * 100);
                return (
                  <div key={s.nome}>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{s.nome}</span>
                      <span className="font-semibold">{s.valor} ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${s.cor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Leads por temperatura</p>
            </div>
            <div className="mt-4 space-y-3">
              {leadsTemperatura.map((l) => {
                const pct = Math.round((l.valor / l.total) * 100);
                return (
                  <div key={l.nome}>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{l.nome}</span>
                      <span className="font-semibold">{l.valor}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${l.cor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Atendimentos — 7 dias</p>
            </div>
            <div className="mt-4 flex h-32 items-end gap-2">
              {semana.map((s) => (
                <div key={s.dia} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-400"
                    style={{ height: `${(s.valor / maxSemana) * 100}%` }}
                    title={`${s.valor}`}
                  />
                  <span className="text-[10px] font-medium text-slate-500">{s.dia}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo executivo + Recomendações */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-slate-900 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-bold">Resumo executivo da IA</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-blue-50">
              A operação apresentou alto volume de atendimentos comerciais, com destaque para
              solicitações de orçamento e peças de reposição. A IA identificou 14 leads quentes e
              6 clientes aguardando orçamento. Recomenda-se priorizar contatos com maior score e
              pendências de vendas ainda abertas.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Recomendações da IA</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {recomendacoes.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Observação */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Observação</p>
              <p className="mt-1 text-sm text-amber-800">
                Os dados desta tela são apenas visuais nesta fase. A conexão com Supabase será
                feita futuramente, após aprovação da estrutura visual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

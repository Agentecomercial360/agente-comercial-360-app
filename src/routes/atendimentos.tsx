import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Headphones,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/atendimentos")({
  component: AtendimentosPage,
  head: () => ({ meta: [{ title: "Atendimentos | Agente Comercial 360" }] }),
});

const cards = [
  { label: "Atendimentos hoje", value: 128, icon: Headphones },
  { label: "Em andamento", value: 26, icon: Clock },
  { label: "Aguardando resposta", value: 9, icon: AlertCircle },
  { label: "Finalizados", value: 93, icon: CheckCircle2 },
];

const filtros = [
  "Todos",
  "Vendas",
  "Financeiro",
  "Administrativo",
  "Orçamentos",
  "Abertos",
  "Em andamento",
  "Finalizados",
  "Sem resposta",
];

const atendimentos = [
  {
    cliente: "João Martins",
    telefone: "(15) 99999-1020",
    mensagem: "Preciso de orçamento do kit embreagem.",
    setor: "Vendas",
    status: "Em andamento",
    responsavel: "Amanda",
    horario: "09:41",
  },
  {
    cliente: "Carlos Souza",
    telefone: "(15) 98888-2211",
    mensagem: "Vocês têm pastilha de freio do Onix?",
    setor: "Vendas",
    status: "Aguardando resposta",
    responsavel: "Vinicius",
    horario: "10:12",
  },
  {
    cliente: "Fernanda Lima",
    telefone: "(15) 97777-3344",
    mensagem: "Quero saber se tem bateria 60Ah.",
    setor: "Vendas",
    status: "Aberto",
    responsavel: "Thaís",
    horario: "11:05",
  },
  {
    cliente: "Roberto Alves",
    telefone: "(15) 96666-4455",
    mensagem: "Tenho uma cobrança em aberto?",
    setor: "Financeiro",
    status: "Encaminhado",
    responsavel: "Vinicius",
    horario: "11:48",
  },
  {
    cliente: "Mariana Costa",
    telefone: "(15) 95555-7788",
    mensagem: "Qual horário de funcionamento?",
    setor: "Administrativo",
    status: "Finalizado",
    responsavel: "Lorenzzo",
    horario: "12:20",
  },
  {
    cliente: "Pedro Henrique",
    telefone: "(15) 94444-8899",
    mensagem: "Preciso de amortecedor dianteiro.",
    setor: "Orçamentos",
    status: "Sem resposta",
    responsavel: "Vitor",
    horario: "13:02",
  },
];

const setorBadge: Record<string, string> = {
  Vendas: "bg-blue-50 text-blue-700 ring-blue-200",
  Financeiro: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Administrativo: "bg-slate-100 text-slate-700 ring-slate-200",
  Orçamentos: "bg-amber-50 text-amber-700 ring-amber-200",
};

const statusBadge: Record<string, string> = {
  Aberto: "bg-sky-50 text-sky-700 ring-sky-200",
  "Em andamento": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "Aguardando resposta": "bg-amber-50 text-amber-700 ring-amber-200",
  Encaminhado: "bg-purple-50 text-purple-700 ring-purple-200",
  Finalizado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Sem resposta": "bg-red-50 text-red-700 ring-red-200",
};

const prioridades = [
  "Responder clientes sem retorno",
  "Encaminhar orçamentos pendentes",
  "Revisar atendimentos financeiros",
  "Confirmar disponibilidade das peças mais solicitadas",
];

function AtendimentosPage() {
  const [filtro, setFiltro] = useState("Todos");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Atendimentos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe os atendimentos recebidos, setores identificados e responsáveis vinculados.
          </p>
        </div>

        {/* Cards */}
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

        {/* Filtros */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, telefone ou mensagem..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {filtros.map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filtro === f
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Última mensagem</th>
                  <th className="px-4 py-3">Setor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">Horário</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {atendimentos.map((a) => (
                  <tr key={a.cliente} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{a.cliente}</td>
                    <td className="px-4 py-3 text-slate-600">{a.telefone}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600">{a.mensagem}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${setorBadge[a.setor]}`}
                      >
                        {a.setor}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusBadge[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{a.responsavel}</td>
                    <td className="px-4 py-3 text-slate-500">{a.horario}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                        Ver atendimento
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo IA + Prioridades */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-slate-900 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-bold">Resumo da IA</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-blue-50">
              A IA identificou maior volume de atendimentos no setor de vendas. Existem 9 clientes
              aguardando resposta e 6 atendimentos relacionados a orçamento de peças.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Prioridades operacionais</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {prioridades.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

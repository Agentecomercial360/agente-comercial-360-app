import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Briefcase, ArrowRightLeft, UserX, Search, Sparkles, Pencil, Power } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/responsaveis")({
  component: ResponsaveisPage,
  head: () => ({ meta: [{ title: "Responsáveis | Agente Comercial 360" }] }),
});

const summary = [
  { label: "Responsáveis ativos", value: 6, icon: Users },
  { label: "Setores cobertos", value: 4, icon: Briefcase },
  { label: "Atendimentos encaminhados hoje", value: 37, icon: ArrowRightLeft },
  { label: "Sem responsável definido", value: 3, icon: UserX },
];

const filters = [
  "Todos",
  "Vendas",
  "Financeiro",
  "Administrativo",
  "Gestão",
  "Ativos",
  "Inativos",
];

type Setor = "Vendas" | "Financeiro" | "Administrativo" | "Gestão";
type Status = "Ativo" | "Inativo";

type Responsavel = {
  nome: string;
  setor: Setor;
  funcao: string;
  telefone: string;
  status: Status;
  atendimentosHoje: number;
};

const responsaveis: Responsavel[] = [
  {
    nome: "Amanda",
    setor: "Vendas",
    funcao: "Atendimento comercial",
    telefone: "(15) 99608-3076",
    status: "Ativo",
    atendimentosHoje: 12,
  },
  {
    nome: "Thaís",
    setor: "Vendas",
    funcao: "Orçamentos e follow-up",
    telefone: "(15) 99777-1122",
    status: "Ativo",
    atendimentosHoje: 8,
  },
  {
    nome: "Lorenzzo",
    setor: "Administrativo",
    funcao: "Solicitações internas",
    telefone: "(15) 99888-2233",
    status: "Ativo",
    atendimentosHoje: 5,
  },
  {
    nome: "Vinicius",
    setor: "Financeiro",
    funcao: "Cobranças e pendências",
    telefone: "(15) 99999-3344",
    status: "Ativo",
    atendimentosHoje: 7,
  },
  {
    nome: "Vitor",
    setor: "Vendas",
    funcao: "Peças e estoque",
    telefone: "(15) 99111-4455",
    status: "Ativo",
    atendimentosHoje: 5,
  },
  {
    nome: "Ivan",
    setor: "Gestão",
    funcao: "Dono / gestor",
    telefone: "(15) 99222-5566",
    status: "Ativo",
    atendimentosHoje: 0,
  },
];

const setorBadge: Record<Setor, string> = {
  Vendas: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  Financeiro: "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
  Administrativo: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Gestão: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
};

const statusBadge: Record<Status, string> = {
  Ativo: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Inativo: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

function ResponsaveisPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Responsáveis
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Gerencie os responsáveis por setor da empresa e organize o encaminhamento dos atendimentos.
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

        {/* Filters + search + add button */}
        <div className="rounded-2xl bg-card p-4 border border-border shadow-[var(--shadow-soft)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm">
              Adicionar responsável
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar responsável por nome, setor ou telefone..."
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        {/* Table + AI summary + routing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    {[
                      "Nome",
                      "Setor",
                      "Função",
                      "Telefone",
                      "Status",
                      "Atendimentos hoje",
                      "Ação",
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
                  {responsaveis.map((r) => (
                    <tr
                      key={r.nome}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                        {r.nome}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${setorBadge[r.setor]}`}
                        >
                          {r.setor}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {r.funcao}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {r.telefone}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-display font-bold text-foreground">
                        {r.atendimentosHoje}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap inline-flex items-center gap-1">
                            <Pencil className="h-3 w-3" />
                            Editar
                          </button>
                          <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap inline-flex items-center gap-1">
                            <Power className="h-3 w-3" />
                            Ativar/Desativar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side cards */}
          <div className="space-y-4">
            {/* AI summary */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-[var(--brand-blue-soft)] to-card p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Resumo da IA</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A IA pode encaminhar atendimentos automaticamente para o responsável correto de acordo com o setor identificado na conversa.
              </p>
            </div>

            {/* Routing rules */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Roteamento por setor
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 ring-1 ring-blue-200 shrink-0">
                    Vendas
                  </span>
                  <span className="text-muted-foreground">Amanda, Thaís ou Vitor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-violet-100 text-violet-700 ring-1 ring-violet-200 shrink-0">
                    Financeiro
                  </span>
                  <span className="text-muted-foreground">Vinicius</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 ring-1 ring-amber-200 shrink-0">
                    Administrativo
                  </span>
                  <span className="text-muted-foreground">Lorenzzo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 shrink-0">
                    Gestão / Relatórios
                  </span>
                  <span className="text-muted-foreground">Ivan</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

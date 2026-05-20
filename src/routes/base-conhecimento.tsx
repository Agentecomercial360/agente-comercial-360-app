import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Tags, CheckCircle2, AlertTriangle, Search, Sparkles, Eye, Pencil, Power } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/base-conhecimento")({
  component: BaseConhecimentoPage,
  head: () => ({ meta: [{ title: "Base de Conhecimento | Agente Comercial 360" }] }),
});

const summary = [
  { label: "Regras cadastradas", value: 24, icon: BookOpen },
  { label: "Categorias ativas", value: 8, icon: Tags },
  { label: "Conteúdos revisados", value: 18, icon: CheckCircle2 },
  { label: "Pendentes de revisão", value: 6, icon: AlertTriangle },
];

const filters = [
  "Todos",
  "Vendas",
  "Administrativo",
  "Financeiro",
  "Regras",
  "Entrega",
  "Pagamento",
  "Orçamento",
];

type Categoria =
  | "Vendas"
  | "Administrativo"
  | "Financeiro"
  | "Regras"
  | "Entrega"
  | "Pagamento"
  | "Orçamento";

type Status = "Ativo" | "Revisar" | "Inativo";

type Conhecimento = {
  titulo: string;
  categoria: Categoria;
  conteudo: string;
  empresa: string;
  status: Status;
  atualizadoEm: string;
};

const conhecimentos: Conhecimento[] = [
  {
    titulo: "Envio de preços",
    categoria: "Regras",
    conteudo: "A IA não deve enviar preços sem validação humana.",
    empresa: "União Auto Peças",
    status: "Ativo",
    atualizadoEm: "20/05/2026",
  },
  {
    titulo: "Orçamentos de peças",
    categoria: "Orçamento",
    conteudo: "Solicitar modelo do veículo, ano e peça desejada antes de encaminhar.",
    empresa: "União Auto Peças",
    status: "Ativo",
    atualizadoEm: "20/05/2026",
  },
  {
    titulo: "Atendimento financeiro",
    categoria: "Financeiro",
    conteudo: "Encaminhar dúvidas de cobrança para o responsável financeiro.",
    empresa: "União Auto Peças",
    status: "Ativo",
    atualizadoEm: "19/05/2026",
  },
  {
    titulo: "Horário de atendimento",
    categoria: "Administrativo",
    conteudo: "Atendimento de segunda a sexta, das 08:00 às 18:00.",
    empresa: "União Auto Peças",
    status: "Ativo",
    atualizadoEm: "18/05/2026",
  },
  {
    titulo: "Entregas e retiradas",
    categoria: "Entrega",
    conteudo: "Confirmar disponibilidade e endereço antes de informar prazo.",
    empresa: "União Auto Peças",
    status: "Revisar",
    atualizadoEm: "17/05/2026",
  },
  {
    titulo: "Solicitação de peça",
    categoria: "Vendas",
    conteudo: "Identificar peça, veículo, ano e urgência do cliente.",
    empresa: "União Auto Peças",
    status: "Ativo",
    atualizadoEm: "16/05/2026",
  },
];

const categoriaBadge: Record<Categoria, string> = {
  Vendas: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  Administrativo: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Financeiro: "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
  Regras: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  Entrega: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
  Pagamento: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Orçamento: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
};

const statusBadge: Record<Status, string> = {
  Ativo: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Revisar: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Inativo: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

function BaseConhecimentoPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Base de Conhecimento
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Organize regras, informações e conteúdos usados pela IA para atender clientes com precisão.
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
              Adicionar conhecimento
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar regra, categoria ou conteúdo..."
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        {/* Table + side cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    {[
                      "Título",
                      "Categoria",
                      "Conteúdo resumido",
                      "Empresa",
                      "Status",
                      "Atualizado em",
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
                  {conhecimentos.map((c) => (
                    <tr
                      key={c.titulo}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                        {c.titulo}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoriaBadge[c.categoria]}`}
                        >
                          {c.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                        {c.conteudo}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {c.empresa}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[c.status]}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {c.atualizadoEm}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap inline-flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Ver
                          </button>
                          <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap inline-flex items-center gap-1">
                            <Pencil className="h-3 w-3" />
                            Editar
                          </button>
                          <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap inline-flex items-center gap-1">
                            <Power className="h-3 w-3" />
                            Desativar
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
                <h3 className="text-base font-semibold text-foreground">Como a IA usa essa base</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A IA consulta a base de conhecimento para entender regras da empresa, orientar respostas, identificar setores e encaminhar solicitações para os responsáveis corretos.
              </p>
            </div>

            {/* Categories */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Categorias principais
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Vendas", badge: categoriaBadge["Vendas"] },
                  { label: "Administrativo", badge: categoriaBadge["Administrativo"] },
                  { label: "Financeiro", badge: categoriaBadge["Financeiro"] },
                  { label: "Regras", badge: categoriaBadge["Regras"] },
                  { label: "Entrega", badge: categoriaBadge["Entrega"] },
                  { label: "Pagamento", badge: categoriaBadge["Pagamento"] },
                  { label: "Orçamento", badge: categoriaBadge["Orçamento"] },
                ].map((cat) => (
                  <li key={cat.label} className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.badge} shrink-0`}
                    >
                      {cat.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attention */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 shadow-[var(--shadow-soft)] p-5">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <h3 className="text-sm font-semibold text-amber-800">Atenção</h3>
              </div>
              <p className="text-xs leading-relaxed text-amber-700">
                Conteúdos sensíveis devem ser revisados antes de serem usados pela IA. Nesta fase, os dados são apenas visuais e ainda não estão conectados ao Supabase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

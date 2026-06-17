import { createFileRoute } from "@tanstack/react-router";
import {
  ListTodo,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  UserPlus,
  Search,
  PlayCircle,
  PauseCircle,
  Eye,
  Workflow,
  Lightbulb,
  Info,
  Users,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/tarefas")({
  component: TarefasOperadores,
  head: () => ({
    meta: [{ title: "Tarefas dos Operadores | Agente Comercial 360" }],
  }),
});

const kpis = [
  { label: "Tarefas pendentes", icon: Clock, accent: "from-slate-600 to-slate-800" },
  { label: "Em execução", icon: Activity, accent: "from-blue-700 to-blue-900" },
  { label: "Concluídas", icon: CheckCircle2, accent: "from-emerald-600 to-emerald-800" },
  { label: "Atrasadas", icon: AlertTriangle, accent: "from-rose-600 to-rose-800" },
  { label: "Alta prioridade", icon: Flame, accent: "from-red-700 to-red-900" },
  { label: "Aguardando responsável", icon: UserPlus, accent: "from-amber-600 to-orange-700" },
];

const cols = [
  "Prioridade",
  "Tarefa",
  "Origem",
  "Produto / SKU",
  "Responsável",
  "Prazo",
  "Status",
  "Resultado esperado",
];

const filtros = [
  "Todas",
  "Alta prioridade",
  "Pendentes",
  "Em execução",
  "Concluídas",
  "Atrasadas",
];

const fluxo = [
  {
    step: "1",
    title: "Sistema identifica uma prioridade",
    desc: "A leitura automática dos dados aponta um risco, oportunidade ou ação necessária.",
    icon: Search,
  },
  {
    step: "2",
    title: "A prioridade vira uma tarefa",
    desc: "A recomendação é transformada em uma tarefa clara, com motivo e impacto esperado.",
    icon: ListTodo,
  },
  {
    step: "3",
    title: "Um operador executa a ação",
    desc: "A tarefa é atribuída a um responsável, com prazo e prioridade definidos.",
    icon: PlayCircle,
  },
  {
    step: "4",
    title: "O resultado é acompanhado",
    desc: "O sistema registra a conclusão e mede o impacto da ação na operação.",
    icon: Eye,
  },
];

const statusList = [
  { label: "Pendente", desc: "Ainda não iniciada.", dot: "bg-slate-500", ring: "border-slate-200 bg-slate-50/60", badge: "text-slate-700", icon: Clock },
  { label: "Em execução", desc: "Operador trabalhando na ação.", dot: "bg-blue-600", ring: "border-blue-200 bg-blue-50/60", badge: "text-blue-700", icon: Activity },
  { label: "Concluída", desc: "Ação finalizada pela equipe.", dot: "bg-emerald-600", ring: "border-emerald-200 bg-emerald-50/60", badge: "text-emerald-700", icon: CheckCircle2 },
  { label: "Atrasada", desc: "Prazo vencido sem conclusão.", dot: "bg-rose-600", ring: "border-rose-200 bg-rose-50/60", badge: "text-rose-700", icon: AlertTriangle },
  { label: "Em análise", desc: "Aguardando resultado ou validação.", dot: "bg-amber-500", ring: "border-amber-200 bg-amber-50/60", badge: "text-amber-700", icon: PauseCircle },
];

function TarefasOperadores() {
  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <Users className="h-3.5 w-3.5" />
            Execução da Operação
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Tarefas dos Operadores
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Acompanhe as ações que precisam ser executadas pela equipe, com
            prioridade, prazo e origem da recomendação.
          </p>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${k.accent} opacity-10`}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {k.label}
                    </div>
                    <div className="font-display text-3xl font-bold text-foreground/40">
                      —
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Será calculado após a geração automática das tarefas.
                    </div>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${k.accent} text-white shadow-md`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Fila de tarefas */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Fila de tarefas
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl">
                Lista operacional das ações em aberto, organizadas por
                prioridade e prazo.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {filtros.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    i === 0
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {cols.map((c) => (
                    <th
                      key={c}
                      className="px-5 py-3 text-left font-semibold whitespace-nowrap"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={cols.length} className="px-5 py-16 text-center">
                    <div className="mx-auto max-w-md space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <ListTodo className="h-6 w-6" />
                      </div>
                      <div className="font-display text-base font-semibold text-foreground">
                        Nenhuma tarefa criada ainda
                      </div>
                      <p className="text-sm text-muted-foreground">
                        As tarefas serão geradas a partir da Central de Ações
                        após a leitura dos dados reais da operação.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Fluxo de execução */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-white">
              <Workflow className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Fluxo de execução
              </h2>
              <p className="text-xs text-muted-foreground">
                Da identificação do problema até o resultado entregue pela equipe.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {fluxo.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.step}
                  className="relative rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        Etapa {f.step}
                      </div>
                      <div className="text-sm font-bold text-foreground">
                        {f.title}
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Status das tarefas */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Status das tarefas
            </h2>
            <p className="text-xs text-muted-foreground">
              Significado de cada estado que uma tarefa pode assumir na operação.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {statusList.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`rounded-xl border p-4 ${s.ring}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${s.badge}`}
                    >
                      {s.label}
                    </span>
                    <Icon className={`ml-auto h-3.5 w-3.5 ${s.badge}`} />
                  </div>
                  <p className="text-sm text-foreground/80 leading-snug">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Como ajuda */}
        <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-blue-50/60 to-transparent p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
              <Lightbulb className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-display text-sm font-bold text-foreground">
              Como essa tela ajuda a equipe
            </h3>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
            Essa tela organiza a rotina dos operadores. Em vez de cada pessoa
            decidir o que fazer, o sistema mostra as tarefas prioritárias, o
            motivo da ação e o impacto esperado na operação.
          </p>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-white/60 p-3 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-700" />
            <span>
              Tela preparada. Nenhuma tarefa fictícia é exibida até a primeira
              sincronização e geração automática a partir da Central de Ações.
            </span>
          </div>
        </section>
      </div>
    </EcommerceLayout>
  );
}

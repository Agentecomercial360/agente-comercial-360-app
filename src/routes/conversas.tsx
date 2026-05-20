import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageCircle,
  Clock,
  UserCheck,
  CheckCircle2,
  Search,
  Sparkles,
  Phone,
  Send,
  ArrowRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/conversas")({
  component: ConversasPage,
  head: () => ({ meta: [{ title: "Conversas | Agente Comercial 360" }] }),
});

const summary = [
  { label: "Conversas abertas", value: 26, icon: MessageCircle },
  { label: "Aguardando resposta", value: 9, icon: Clock },
  { label: "Encaminhadas para humano", value: 7, icon: UserCheck },
  { label: "Finalizadas hoje", value: 18, icon: CheckCircle2 },
];

const filters = [
  "Todas",
  "Abertas",
  "Aguardando resposta",
  "Encaminhadas",
  "Finalizadas",
];

type Status =
  | "Aberta"
  | "Aguardando retorno"
  | "Encaminhada"
  | "Financeiro"
  | "Finalizada";

type Conversa = {
  id: number;
  cliente: string;
  telefone: string;
  canal: string;
  ultimaMensagem: string;
  horario: string;
  status: Status;
  setor: string;
};

const conversas: Conversa[] = [
  {
    id: 1,
    cliente: "João Martins",
    telefone: "(15) 99999-1020",
    canal: "WhatsApp",
    ultimaMensagem: "Preciso de orçamento do kit embreagem.",
    horario: "09:41",
    status: "Aberta",
    setor: "Vendas",
  },
  {
    id: 2,
    cliente: "Carlos Souza",
    telefone: "(15) 98888-2211",
    canal: "WhatsApp",
    ultimaMensagem: "Vocês têm pastilha de freio do Onix?",
    horario: "10:12",
    status: "Aguardando retorno",
    setor: "Vendas",
  },
  {
    id: 3,
    cliente: "Fernanda Lima",
    telefone: "(15) 97777-3344",
    canal: "WhatsApp",
    ultimaMensagem: "Quero saber se tem bateria 60Ah.",
    horario: "11:05",
    status: "Encaminhada",
    setor: "Vendas",
  },
  {
    id: 4,
    cliente: "Roberto Alves",
    telefone: "(15) 96666-4455",
    canal: "WhatsApp",
    ultimaMensagem: "Tenho uma cobrança em aberto?",
    horario: "11:48",
    status: "Financeiro",
    setor: "Financeiro",
  },
  {
    id: 5,
    cliente: "Mariana Costa",
    telefone: "(15) 95555-7788",
    canal: "WhatsApp",
    ultimaMensagem: "Qual horário de funcionamento?",
    horario: "12:20",
    status: "Finalizada",
    setor: "Administrativo",
  },
];

const statusBadge: Record<Status, string> = {
  Aberta: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  "Aguardando retorno": "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Encaminhada: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
  Financeiro: "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
  Finalizada: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
};

const mensagens = [
  {
    autor: "cliente" as const,
    texto:
      "Bom dia, preciso de orçamento do kit embreagem do Gol 1.6 2014.",
    hora: "09:38",
  },
  {
    autor: "ia" as const,
    texto:
      "Claro! Para confirmar corretamente, você consegue informar se o veículo é manual e se deseja apenas a peça ou peça com serviço?",
    hora: "09:39",
  },
  {
    autor: "cliente" as const,
    texto: "Só a peça mesmo.",
    hora: "09:41",
  },
];

function ConversasPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [selectedId, setSelectedId] = useState<number>(1);
  const selected = conversas.find((c) => c.id === selectedId) ?? conversas[0];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Conversas
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Consulte o histórico de mensagens, interações com clientes e respostas
            sugeridas pela IA.
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
              placeholder="Buscar conversa por cliente, telefone ou mensagem..."
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Conversation list */}
          <div className="lg:col-span-1 rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/40">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Lista de conversas
              </h3>
            </div>
            <ul className="divide-y divide-border max-h-[640px] overflow-y-auto">
              {conversas.map((c) => {
                const isActive = c.id === selectedId;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-left px-4 py-3.5 transition ${
                        isActive
                          ? "bg-[var(--brand-blue-soft)]"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground truncate">
                              {c.cliente}
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {c.telefone} · {c.canal}
                          </div>
                          <p className="mt-1.5 text-sm text-foreground/80 truncate">
                            {c.ultimaMensagem}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[c.status]}`}
                            >
                              {c.status}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {c.setor}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {c.horario}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Conversation details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header card */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                    {selected.cliente}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {selected.telefone}
                    </span>
                    <span>·</span>
                    <span>Canal: {selected.canal}</span>
                    <span>·</span>
                    <span>Setor: {selected.setor}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[selected.status]}`}
                  >
                    {selected.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Responsável sugerido:{" "}
                    <span className="font-semibold text-foreground">Amanda</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Mensagens
              </h3>
              <div className="space-y-3">
                {mensagens.map((m, i) => {
                  const isClient = m.autor === "cliente";
                  return (
                    <div
                      key={i}
                      className={`flex ${isClient ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isClient
                            ? "bg-muted text-foreground rounded-tl-sm"
                            : "bg-primary text-primary-foreground rounded-tr-sm"
                        }`}
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-1">
                          {isClient ? "Cliente" : "IA"}
                        </div>
                        <p className="leading-relaxed">{m.texto}</p>
                        <div className="mt-1 text-[10px] opacity-60 text-right">
                          {m.hora}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <input
                  type="text"
                  placeholder="Digite uma mensagem..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* AI summary + Next action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-gradient-to-br from-[var(--brand-blue-soft)] to-card p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Resumo da IA
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  O cliente demonstrou interesse em{" "}
                  <span className="font-semibold text-foreground">
                    kit embreagem para Gol 1.6 2014
                  </span>
                  . Lead classificado como{" "}
                  <span className="font-semibold text-foreground">quente</span>.
                  Próxima ação recomendada: verificar estoque e enviar orçamento.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Próxima ação recomendada
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                  Encaminhar para{" "}
                  <span className="font-semibold text-foreground">Amanda</span> no
                  setor de vendas para orçamento.
                </p>
                <button className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm">
                  Encaminhar conversa
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
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
  X,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";

type ConvLoadStatus =
  | "loading"
  | "loaded"
  | "empty"
  | "unauthenticated"
  | "error";

function normalizeChannel(value: unknown): string {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return "WhatsApp";
  if (v === "whatsapp") return "WhatsApp";
  if (v === "instagram") return "Instagram";
  if (v === "email" || v === "e-mail") return "Email";
  if (v === "site" || v === "web") return "Site";
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function normalizeStatus(value: unknown): Status {
  const v = String(value ?? "").trim().toLowerCase();
  if (["aberta", "open", "active"].includes(v)) return "Aberta";
  if (["aguardando resposta", "aguardando", "waiting", "pending"].includes(v))
    return "Aguardando retorno";
  if (["encaminhada", "forwarded", "assigned"].includes(v)) return "Encaminhada";
  if (["finalizada", "closed", "finished"].includes(v)) return "Finalizada";
  return "Aberta";
}

function formatHorario(lastMessageAt: string | null, createdAt: string | null): string {
  const iso = lastMessageAt ?? createdAt;
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  return sameDay
    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("pt-BR");
}


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
  id: string | number;
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

type Mensagem = { autor: "cliente" | "ia" | "atendente"; texto: string; hora: string };

const mensagensIniciais: Record<string | number, Mensagem[]> = {
  1: [
    { autor: "cliente", texto: "Bom dia, preciso de orçamento do kit embreagem do Gol 1.6 2014.", hora: "09:38" },
    { autor: "ia", texto: "Claro! Você consegue informar se o veículo é manual e se deseja apenas a peça ou peça com serviço?", hora: "09:39" },
    { autor: "cliente", texto: "Só a peça mesmo.", hora: "09:41" },
  ],
  2: [{ autor: "cliente", texto: "Vocês têm pastilha de freio do Onix?", hora: "10:12" }],
  3: [{ autor: "cliente", texto: "Quero saber se tem bateria 60Ah.", hora: "11:05" }],
  4: [{ autor: "cliente", texto: "Tenho uma cobrança em aberto?", hora: "11:48" }],
  5: [
    { autor: "cliente", texto: "Qual horário de funcionamento?", hora: "12:18" },
    { autor: "ia", texto: "Atendemos de segunda a sábado das 8h às 18h.", hora: "12:20" },
  ],
};

const filterToStatus: Record<string, Status[]> = {
  Abertas: ["Aberta"],
  "Aguardando resposta": ["Aguardando retorno"],
  Encaminhadas: ["Encaminhada"],
  Finalizadas: ["Finalizada"],
};

const responsaveis = ["Amanda", "Thaís", "Vinicius", "Lorenzzo", "Vitor", "Ivan"];

function ConversasPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Conversa[]>(conversas);
  const [selectedId, setSelectedId] = useState<string | number | null>(1);
  const [messagesById, setMessagesById] = useState<Record<string | number, Mensagem[]>>(mensagensIniciais);
  const [draft, setDraft] = useState("");
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardTo, setForwardTo] = useState(responsaveis[0]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [convLoadStatus, setConvLoadStatus] = useState<ConvLoadStatus>("loading");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesLoadStatus, setMessagesLoadStatus] = useState<
    "idle" | "loading" | "loaded" | "empty" | "error"
  >("idle");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (cancelled) return;
        if (userErr || !userData?.user) {
          setConvLoadStatus("unauthenticated");
          setLoadingConversations(false);
          return;
        }

        const { data: cu, error: cuErr } = await supabase
          .from("company_users")
          .select("company_id")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .maybeSingle();
        if (cancelled) return;
        if (cuErr || !cu?.company_id) {
          setConvLoadStatus("error");
          setLoadingConversations(false);
          return;
        }

        const { data: rows, error: convErr } = await supabase
          .from("conversations")
          .select(
            `id, channel, status, last_message_at, created_at, customer_id,
             customers ( name, phone, city, customer_type )`,
          )
          .eq("company_id", cu.company_id)
          .order("last_message_at", { ascending: false, nullsFirst: false })
          .limit(100);
        if (cancelled) return;

        if (convErr) {
          setConvLoadStatus("error");
          setLoadingConversations(false);
          return;
        }

        if (!rows || rows.length === 0) {
          setConvLoadStatus("empty");
          setLoadingConversations(false);
          return;
        }

        const mapped: Conversa[] = rows.map((r: any) => {
          const cust = Array.isArray(r.customers) ? r.customers[0] : r.customers;
          return {
            id: String(r.id),
            cliente: cust?.name ?? "Cliente sem nome",
            telefone: cust?.phone ?? "—",
            canal: normalizeChannel(r.channel),
            ultimaMensagem: "Carregue a conversa para ver mensagens",
            horario: formatHorario(r.last_message_at, r.created_at),
            status: normalizeStatus(r.status),
            setor: "—",
          };
        });

        setItems(mapped);
        setSelectedId(mapped[0]?.id ?? null);
        setConvLoadStatus("loaded");
      } catch {
        if (!cancelled) setConvLoadStatus("error");
      } finally {
        if (!cancelled) setLoadingConversations(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Etapa 1B: carregar mensagens reais da conversa selecionada
  useEffect(() => {
    if (!selectedId) {
      setMessagesLoadStatus("idle");
      return;
    }
    // só buscar quando o id parece um UUID do Supabase (string longa)
    if (typeof selectedId !== "string" || selectedId.length < 20) {
      setMessagesLoadStatus("idle");
      return;
    }

    let cancelled = false;
    setLoadingMessages(true);
    setMessagesLoadStatus("loading");

    (async () => {
      try {
        const { data: rows, error } = await supabase
          .from("messages")
          .select("id,conversation_id,sender_type,content,channel,created_at")
          .eq("conversation_id", selectedId)
          .order("created_at", { ascending: true });

        if (cancelled) return;

        if (error) {
          setMessagesLoadStatus("error");
          return;
        }

        if (!rows || rows.length === 0) {
          setMessagesLoadStatus("empty");
          return;
        }

        const mapAutor = (t: unknown): "cliente" | "ia" | "atendente" | "sistema" => {
          const v = String(t ?? "").trim().toLowerCase();
          if (v === "customer" || v === "client" || v === "cliente") return "cliente";
          if (v === "ai" || v === "assistant" || v === "ia" || v === "bot") return "ia";
          if (v === "human" || v === "agent" || v === "atendente" || v === "user") return "atendente";
          return "sistema";
        };

        const mapped: Mensagem[] = rows.map((r: any) => {
          const d = r.created_at ? new Date(r.created_at) : null;
          const hora =
            d && !Number.isNaN(d.getTime())
              ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
              : "—";
          return {
            autor: mapAutor(r.sender_type) as Mensagem["autor"],
            texto: String(r.content ?? ""),
            hora,
          };
        });

        setMessagesById((prev) => ({ ...prev, [selectedId]: mapped }));
        setMessagesLoadStatus("loaded");
      } catch {
        if (!cancelled) setMessagesLoadStatus("error");
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (activeFilter !== "Todas") {
        const allowed = filterToStatus[activeFilter];
        if (allowed && !allowed.includes(c.status)) return false;
      }
      if (!q) return true;
      return [c.cliente, c.telefone, c.canal, c.ultimaMensagem, c.status, c.setor]
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [items, activeFilter, search]);

  const selected = items.find((c) => c.id === selectedId) ?? items[0];
  const mensagens = messagesById[selected?.id] ?? [];

  const enviar = () => {
    const texto = draft.trim();
    if (!texto) {
      toast.error("Digite uma mensagem antes de enviar");
      return;
    }
    const hora = `${String(mensagens.length + 9).padStart(2, "0")}:00`;
    setMessagesById((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] ?? []), { autor: "atendente" as const, texto, hora }],
    }));
    setItems((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, ultimaMensagem: texto } : c)),
    );
    setDraft("");
    toast.success("Mensagem enviada");
  };

  const confirmarEncaminhamento = () => {
    setItems((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status: "Encaminhada" } : c)),
    );
    setForwardOpen(false);
    toast.success(`Conversa encaminhada com sucesso para ${forwardTo}`);
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors />
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Conversas
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Consulte o histórico de mensagens, interações com clientes e respostas
            sugeridas pela IA.
          </p>
          <div className="mt-2 text-xs">
            {loadingConversations ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Carregando conversas do Supabase...
              </span>
            ) : convLoadStatus === "loaded" ? (
              <span className="text-emerald-700">
                Dados carregados do Supabase — {items.length} conversas
              </span>
            ) : convLoadStatus === "empty" ? (
              <span className="text-amber-700">
                Nenhuma conversa real encontrada. Usando dados locais temporários.
              </span>
            ) : convLoadStatus === "unauthenticated" ? (
              <span className="text-amber-700">
                Usuário não autenticado. Usando dados locais temporários.
              </span>
            ) : convLoadStatus === "error" ? (
              <span className="text-red-700">
                Não foi possível carregar conversas. Usando dados locais temporários.
              </span>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          A leitura da lista de conversas já pode ser carregada do Supabase. Nesta etapa, as
          mensagens, envio e encaminhamento ainda funcionam localmente e não persistem mudanças
          no banco.
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const counts = {
              abertas: items.filter((c) => c.status === "Aberta").length,
              aguardando: items.filter((c) => c.status === "Aguardando retorno").length,
              encaminhadas: items.filter((c) => c.status === "Encaminhada").length,
              finalizadas: items.filter((c) => c.status === "Finalizada").length,
            };
            const cards = [
              { label: "Conversas abertas", value: counts.abertas, icon: MessageCircle },
              { label: "Aguardando resposta", value: counts.aguardando, icon: Clock },
              { label: "Encaminhadas para humano", value: counts.encaminhadas, icon: UserCheck },
              { label: "Finalizadas hoje", value: counts.finalizadas, icon: CheckCircle2 },
            ];
            return cards.map((s) => {
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
            });
          })()}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  Nenhuma conversa encontrada
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Revise os filtros ou tente outro termo de busca.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border max-h-[640px] overflow-y-auto">
                {filtered.map((c) => {
                  const isActive = c.id === selectedId;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => setSelectedId(c.id)}
                        className={`w-full text-left px-4 py-3.5 transition ${
                          isActive ? "bg-[var(--brand-blue-soft)]" : "hover:bg-muted/40"
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
            )}
          </div>

          {/* Conversation details */}
          {selected && (
            <div className="lg:col-span-2 space-y-4">
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

              <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                  Mensagens
                </h3>
                <div className="space-y-3">
                  {mensagens.map((m, i) => {
                    const isClient = m.autor === "cliente";
                    const label = m.autor === "cliente" ? "Cliente" : m.autor === "ia" ? "IA" : "Você";
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
                            {label}
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
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        enviar();
                      }
                    }}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    onClick={enviar}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-gradient-to-br from-[var(--brand-blue-soft)] to-card p-5 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">Resumo da IA</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    O cliente demonstrou interesse em{" "}
                    <span className="font-semibold text-foreground">
                      {selected.ultimaMensagem}
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
                    <span className="font-semibold text-foreground">Amanda</span> no setor
                    de {selected.setor.toLowerCase()}.
                  </p>
                  <button
                    onClick={() => setForwardOpen(true)}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm"
                  >
                    Encaminhar conversa
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forward modal */}
      {forwardOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-label="Fechar"
            onClick={() => setForwardOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-bold text-foreground">Encaminhar conversa</h2>
              <button
                onClick={() => setForwardOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</p>
                  <p className="mt-0.5 font-semibold text-foreground">{selected.cliente}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Setor</p>
                  <p className="mt-0.5 font-semibold text-foreground">{selected.setor}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Responsável sugerido
                </p>
                <p className="mt-0.5 font-semibold text-foreground">Amanda</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Selecionar responsável
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {responsaveis.map((r) => (
                    <button
                      key={r}
                      onClick={() => setForwardTo(r)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        forwardTo === r
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setForwardOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEncaminhamento}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Confirmar encaminhamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


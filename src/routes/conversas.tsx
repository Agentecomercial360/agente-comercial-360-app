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
  List as ListIcon,
  LayoutGrid,
  Briefcase,
  Inbox,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useCrmRole } from "@/lib/use-crm-role";
import {
  sectorFilterFor,
  normalizeSector,
  getSectorLabel,
  getSectorBadgeClass,
  canRoleSeeAllSectors,
  ALL_SECTOR_OPTIONS,
  type SectorKey,
  type SectorFilterOption,
} from "@/lib/crm-permissions";
import {
  type ConversationStatus,
  CONVERSATION_STATUSES,
  normalizeConversationStatus,
  getConversationStatusLabel,
  getConversationStatusBadgeClass,
} from "@/lib/conversation-status";

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

function getInitial(name: string) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase() || "?";
}

const AVATAR_PALETTE = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
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

type Status = ConversationStatus;

type Conversa = {
  id: string | number;
  cliente: string;
  telefone: string;
  canal: string;
  ultimaMensagem: string;
  horario: string;
  status: Status;
  setor: SectorKey | null;
};

const conversas: Conversa[] = [
  {
    id: 1,
    cliente: "João Martins",
    telefone: "(15) 99999-1020",
    canal: "WhatsApp",
    ultimaMensagem: "Preciso de orçamento do kit embreagem.",
    horario: "09:41",
    status: "aberta",
    setor: "vendas",
  },
  {
    id: 2,
    cliente: "Carlos Souza",
    telefone: "(15) 98888-2211",
    canal: "WhatsApp",
    ultimaMensagem: "Vocês têm pastilha de freio do Onix?",
    horario: "10:12",
    status: "aguardando_cliente",
    setor: "vendas",
  },
  {
    id: 3,
    cliente: "Fernanda Lima",
    telefone: "(15) 97777-3344",
    canal: "WhatsApp",
    ultimaMensagem: "Quero saber se tem bateria 60Ah.",
    horario: "11:05",
    status: "encaminhada",
    setor: "vendas",
  },
  {
    id: 4,
    cliente: "Roberto Alves",
    telefone: "(15) 96666-4455",
    canal: "WhatsApp",
    ultimaMensagem: "Tenho uma cobrança em aberto?",
    horario: "11:48",
    status: "em_andamento",
    setor: "financeiro",
  },
  {
    id: 5,
    cliente: "Mariana Costa",
    telefone: "(15) 95555-7788",
    canal: "WhatsApp",
    ultimaMensagem: "Qual horário de funcionamento?",
    horario: "12:20",
    status: "finalizada",
    setor: "administrativo",
  },
];

type Mensagem = { autor: "cliente" | "ia" | "atendente" | "sistema"; texto: string; hora: string };

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

const filters = [
  "Todas",
  "Abertas",
  "Em andamento",
  "Aguardando resposta",
  "Encaminhadas",
  "Finalizadas",
];

const filterToStatus: Record<string, ConversationStatus[]> = {
  Abertas: ["aberta"],
  "Em andamento": ["em_andamento"],
  "Aguardando resposta": ["aguardando_cliente", "aguardando_empresa"],
  Encaminhadas: ["encaminhada"],
  Finalizadas: ["finalizada"],
};

const responsaveis = ["Amanda", "Thaís", "Vinicius", "Lorenzzo", "Vitor", "Ivan"];

function ConversasPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [sectorFilter, setSectorFilter] = useState<SectorFilterOption>("all");
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
  const [viewMode, setViewMode] = useState<"lista" | "kanban">("lista");
  const [companyId, setCompanyId] = useState<string | null>(null);

  const crmRole = useCrmRole();
  const roleLoading = crmRole.loading;
  const role = crmRole.role;

  useEffect(() => {
    if (roleLoading) return;
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

        let query = supabase
          .from("conversations")
          .select(
            `id, channel, status, sector, last_message_at, created_at, customer_id,
             customers ( name, phone, city, customer_type )`,
          )
          .eq("company_id", cu.company_id);

        // Filtro por setor (UX): admin/gestor veem tudo (inclusive sector = null).
        // Demais perfis veem apenas seus setores permitidos.
        const sf = sectorFilterFor(role);
        if (!sf.all) {
          query = query.in("sector", sf.sectors);
        }

        const { data: rows, error: convErr } = await query
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
            ultimaMensagem: "Histórico do atendimento disponível",
            horario: formatHorario(r.last_message_at, r.created_at),
            status: normalizeConversationStatus(r.status),
            setor: normalizeSector(r.sector),
          };
        });

        setItems(mapped);
        setSelectedId(mapped[0]?.id ?? null);
        setCompanyId(cu.company_id);
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
  }, [roleLoading, role]);

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
    if (!companyId) {
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
          .eq("company_id", companyId)
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
            autor: mapAutor(r.sender_type),
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
  }, [selectedId, companyId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const adminLike = canRoleSeeAllSectors(role);
    return items.filter((c) => {
      if (activeFilter !== "Todas") {
        const allowed = filterToStatus[activeFilter];
        if (allowed && !allowed.includes(c.status)) return false;
      }
      if (adminLike && sectorFilter !== "all") {
        if (sectorFilter === "none") {
          if (c.setor !== null) return false;
        } else if (c.setor !== sectorFilter) return false;
      }
      if (!q) return true;
      const setorLabel = getSectorLabel(c.setor).toLowerCase();
      return [c.cliente, c.telefone, c.canal, c.ultimaMensagem, c.status, setorLabel]
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [items, activeFilter, search, role, sectorFilter]);

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
    toast.success(
      "Mensagem adicionada apenas localmente. O envio real pelo WhatsApp será conectado via n8n/Cloud API em uma próxima fase.",
    );
  };

  const confirmarEncaminhamento = () => {
    setItems((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status: "encaminhada" as ConversationStatus } : c)),
    );
    setForwardOpen(false);
    toast.success(
      "Encaminhamento registrado apenas localmente. O roteamento real para responsáveis será conectado em uma próxima fase.",
    );
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors />
      <div className="mx-auto max-w-7xl space-y-4">
        {/* HERO PREMIUM */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 shadow-sm">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Ao vivo
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  <Sparkles className="h-3 w-3" /> Operação centralizada
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  Painel ativo
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Conversas
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-blue-100/90">
                Histórico de mensagens, interações com clientes e respostas sugeridas pela IA — tudo centralizado em um único painel.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:w-80">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-100/80">
                  Resumo da operação
                </p>
                <span className="text-[10px] font-medium text-blue-200/70">
                  {loadingConversations ? "Sincronizando…" : "Atualizado agora"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Abertas</p>
                  <p className="mt-1 text-xl font-bold text-white tabular-nums">{items.filter((c) => c.status === "aberta").length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Aguardando</p>
                  <p className="mt-1 text-xl font-bold text-white tabular-nums">{items.filter((c) => c.status === "aguardando_cliente" || c.status === "aguardando_empresa").length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Finalizadas</p>
                  <p className="mt-1 text-xl font-bold text-white tabular-nums">{items.filter((c) => c.status === "finalizada").length}</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-blue-100/80">
                Acompanhamento contínuo das interações com clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        {(() => {
          const counts = {
            abertas: items.filter((c) => c.status === "aberta").length,
            aguardando: items.filter((c) => c.status === "aguardando_cliente" || c.status === "aguardando_empresa").length,
            encaminhadas: items.filter((c) => c.status === "encaminhada").length,
            finalizadas: items.filter((c) => c.status === "finalizada").length,
          };
          type KpiTheme = { icon: string; accent: string; ring: string };
          const cards: { label: string; value: number; icon: typeof MessageCircle; theme: KpiTheme }[] = [
            {
              label: "Conversas abertas",
              value: counts.abertas,
              icon: MessageCircle,
              theme: { icon: "bg-blue-50 text-blue-600", accent: "bg-blue-500", ring: "group-hover:ring-blue-200" },
            },
            {
              label: "Aguardando resposta",
              value: counts.aguardando,
              icon: Clock,
              theme: { icon: "bg-amber-50 text-amber-600", accent: "bg-amber-500", ring: "group-hover:ring-amber-200" },
            },
            {
              label: "Encaminhadas",
              value: counts.encaminhadas,
              icon: UserCheck,
              theme: { icon: "bg-purple-50 text-purple-600", accent: "bg-purple-500", ring: "group-hover:ring-purple-200" },
            },
            {
              label: "Finalizadas",
              value: counts.finalizadas,
              icon: CheckCircle2,
              theme: { icon: "bg-emerald-50 text-emerald-600", accent: "bg-emerald-500", ring: "group-hover:ring-emerald-200" },
            },
          ];
          const isKanban = viewMode === "kanban";
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {cards.map((s) => {
                const Icon = s.icon;
                if (isKanban) {
                  return (
                    <div
                      key={s.label}
                      className="group relative flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 border border-border shadow-[var(--shadow-soft)] overflow-hidden"
                    >
                      <span className={`absolute left-0 top-0 bottom-0 w-0.5 ${s.theme.accent}`} />
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.theme.icon} shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-display text-lg font-bold leading-none text-foreground">
                          {s.value}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{s.label}</div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={s.label}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/60 p-5 border border-border/70 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span className={`absolute left-0 top-0 bottom-0 w-1 ${s.theme.accent}`} />
                    <span className={`pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full ${s.theme.accent} opacity-[0.07] blur-2xl group-hover:opacity-[0.14] transition-opacity`} />
                    <div className="relative flex items-start justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.theme.icon} ring-4 ring-transparent ${s.theme.ring} shadow-sm transition`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`inline-flex h-2 w-2 rounded-full ${s.theme.accent} shadow-[0_0_0_4px_rgba(255,255,255,0.6)] opacity-70`} />
                    </div>
                    <div className="relative mt-4 font-display text-3xl font-bold tracking-tight text-foreground tabular-nums">
                      {s.value}
                    </div>
                    <div className="relative mt-1 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{s.label}</div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* View selector + Filters + search */}
        <div className="rounded-2xl bg-card p-4 md:p-5 border border-border shadow-[var(--shadow-soft)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Visualização
              </span>
              <div className="inline-flex rounded-xl border border-border bg-muted/60 p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setViewMode("lista")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                    viewMode === "lista"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-pressed={viewMode === "lista"}
                >
                  <ListIcon className="h-3.5 w-3.5" /> Lista
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                    viewMode === "kanban"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-pressed={viewMode === "kanban"}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Kanban
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    activeFilter === f
                      ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversa por cliente, telefone ou mensagem..."
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition shadow-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>


        {viewMode === "kanban" ? (
          <KanbanView
            conversas={filtered}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setViewMode("lista");
            }}
          />
        ) : null}

        {viewMode === "lista" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Conversation list */}
          <div className="lg:col-span-1 rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-muted/50 to-transparent flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Lista de conversas
              </h3>
              <span className="text-[10px] font-semibold text-muted-foreground bg-card border border-border rounded-full px-2 py-0.5">
                {filtered.length}
              </span>
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
                    <li key={c.id} className="relative">
                      {isActive && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                      )}
                      <button
                        onClick={() => setSelectedId(c.id)}
                        className={`w-full text-left px-4 py-3.5 transition ${
                          isActive
                            ? "bg-[var(--brand-blue-soft)]/70"
                            : "hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ring-card ${avatarColor(c.cliente)}`}>
                            {getInitial(c.cliente)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`truncate font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                                {c.cliente}
                              </span>
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap font-medium">
                                {c.horario}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{c.telefone}</span>
                              <span className="opacity-50">·</span>
                              <span>{c.canal}</span>
                            </div>
                            <p className="mt-1.5 text-sm text-foreground/75 truncate leading-snug">
                              {c.ultimaMensagem}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getConversationStatusBadgeClass(c.status)}`}
                              >
                                {getConversationStatusLabel(c.status)}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getSectorBadgeClass(c.setor)}`}
                              >
                                <Briefcase className="h-2.5 w-2.5" />
                                {getSectorLabel(c.setor)}
                              </span>
                            </div>
                          </div>
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
              <div className="rounded-2xl bg-gradient-to-br from-card via-card to-[var(--brand-blue-soft)]/30 border border-border shadow-[var(--shadow-soft)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 ring-card shadow-sm ${avatarColor(selected.cliente)}`}>
                      {getInitial(selected.cliente)}
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-xl font-bold tracking-tight text-foreground truncate">
                        {selected.cliente}
                      </h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 border border-border px-2 py-0.5 text-[11px] font-medium text-foreground">
                          <Phone className="h-3 w-3 text-muted-foreground" /> {selected.telefone}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 border border-border px-2 py-0.5 text-[11px] font-medium text-foreground">
                          <MessageCircle className="h-3 w-3 text-muted-foreground" /> {selected.canal}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 border border-border px-2 py-0.5 text-[11px] font-medium text-foreground">
                          <Briefcase className="h-3 w-3 text-muted-foreground" /> {selected.setor && selected.setor !== "—" ? selected.setor : "Não definido"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getConversationStatusBadgeClass(selected.status)}`}
                    >
                      {getConversationStatusLabel(selected.status)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border rounded-full px-2.5 py-1">
                      <UserCheck className="h-3 w-3 text-primary" />
                      Responsável sugerido:{" "}
                      <span className="font-semibold text-foreground">Amanda</span>
                    </span>
                  </div>
                </div>
              </div>


              <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-5">
                <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Mensagens
                  </h3>
                  <span className="text-[10px] font-medium">
                    {loadingMessages ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Carregando mensagens...
                      </span>
                    ) : messagesLoadStatus === "loaded" || messagesLoadStatus === "empty" ? (
                      <span className="text-emerald-700">Histórico de atendimento</span>
                    ) : null}
                  </span>
                </div>
                <div className="space-y-3 rounded-xl bg-muted/30 border border-border/60 p-4 max-h-[440px] overflow-y-auto">
                  {mensagens.length === 0 && !loadingMessages && (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      Nenhuma mensagem registrada ainda.
                    </div>
                  )}
                  {mensagens.map((m, i) => {
                    const isLeft = m.autor === "cliente" || m.autor === "sistema";
                    const label =
                      m.autor === "cliente"
                        ? "Cliente"
                        : m.autor === "ia"
                          ? "IA"
                          : m.autor === "sistema"
                            ? "Sistema"
                            : "Você";
                    return (
                      <div
                        key={i}
                        className={`flex ${isLeft ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                            isLeft
                              ? "bg-card border border-border text-foreground rounded-tl-sm"
                              : "bg-primary text-primary-foreground rounded-tr-sm"
                          }`}
                        >
                          <div className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${isLeft ? "text-muted-foreground" : "opacity-80"}`}>
                            {label}
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.texto}</p>
                          <div className={`mt-1 text-[10px] text-right ${isLeft ? "text-muted-foreground" : "opacity-70"}`}>
                            {m.hora}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition">
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
                    placeholder="Digite uma resposta para o cliente..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    onClick={enviar}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" /> Enviar
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
                    {(() => {
                      const responsavel = "Amanda";
                      const setorRaw = (selected.setor ?? "").trim();
                      const setorValido = setorRaw && setorRaw !== "—";
                      if (responsavel && setorValido) {
                        return (
                          <>
                            Encaminhar para{" "}
                            <span className="font-semibold text-foreground">{responsavel}</span> no setor
                            de {setorRaw.toLowerCase()}.
                          </>
                        );
                      }
                      if (responsavel) {
                        return (
                          <>
                            Encaminhar para{" "}
                            <span className="font-semibold text-foreground">{responsavel}</span>.
                          </>
                        );
                      }
                      return <>Definir setor e responsável para continuidade do atendimento.</>;
                    })()}
                  </p>
                  <button
                    onClick={() => setForwardOpen(true)}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm"
                  >
                    Atribuir responsável
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        )}
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

const KANBAN_COLUMNS: ConversationStatus[] = CONVERSATION_STATUSES;

function KanbanView({
  conversas,
  selectedId,
  onSelect,
}: {
  conversas: Conversa[];
  selectedId: string | number | null;
  onSelect: (id: string | number) => void;
}) {
  const grouped = useMemo(() => {
    const map: Record<ConversationStatus, Conversa[]> = {
      aberta: [],
      em_andamento: [],
      aguardando_cliente: [],
      aguardando_empresa: [],
      encaminhada: [],
      sem_resposta: [],
      finalizada: [],
    };
    for (const c of conversas) {
      map[c.status]?.push(c);
    }
    return map;
  }, [conversas]);

  const total = conversas.length;

  const columnTheme: Record<
    ConversationStatus,
    { accent: string; surface: string; header: string; chip: string; dot: string }
  > = {
    aberta: {
      accent: "bg-blue-500",
      surface: "bg-blue-50/40",
      header: "bg-blue-100/70 text-blue-800",
      chip: "bg-blue-600 text-white",
      dot: "bg-blue-500",
    },
    em_andamento: {
      accent: "bg-orange-500",
      surface: "bg-orange-50/40",
      header: "bg-orange-100/70 text-orange-800",
      chip: "bg-orange-500 text-white",
      dot: "bg-orange-500",
    },
    aguardando_cliente: {
      accent: "bg-amber-400",
      surface: "bg-amber-50/40",
      header: "bg-amber-100/70 text-amber-800",
      chip: "bg-amber-500 text-white",
      dot: "bg-amber-400",
    },
    aguardando_empresa: {
      accent: "bg-purple-500",
      surface: "bg-purple-50/40",
      header: "bg-purple-100/70 text-purple-800",
      chip: "bg-purple-600 text-white",
      dot: "bg-purple-500",
    },
    encaminhada: {
      accent: "bg-indigo-700",
      surface: "bg-indigo-50/50",
      header: "bg-indigo-100/70 text-indigo-800",
      chip: "bg-indigo-700 text-white",
      dot: "bg-indigo-600",
    },
    sem_resposta: {
      accent: "bg-red-500",
      surface: "bg-red-50/40",
      header: "bg-red-100/70 text-red-800",
      chip: "bg-red-600 text-white",
      dot: "bg-red-500",
    },
    finalizada: {
      accent: "bg-emerald-500",
      surface: "bg-emerald-50/40",
      header: "bg-emerald-100/70 text-emerald-800",
      chip: "bg-emerald-600 text-white",
      dot: "bg-emerald-500",
    },
  };

  const priorityBadge = (status: ConversationStatus) => {
    switch (status) {
      case "sem_resposta":
        return { label: "Atenção", cls: "bg-red-50 text-red-700 border-red-200" };
      case "aguardando_cliente":
        return { label: "Aguardando cliente", cls: "bg-amber-50 text-amber-700 border-amber-200" };
      case "aguardando_empresa":
        return { label: "Aguardando empresa", cls: "bg-purple-50 text-purple-700 border-purple-200" };
      case "encaminhada":
        return { label: "Encaminhada", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "finalizada":
        return { label: "Concluída", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "aberta":
      case "em_andamento":
        return { label: "Em acompanhamento", cls: "bg-blue-50 text-blue-700 border-blue-200" };
      default:
        return null;
    }
  };




  return (
    <div className="space-y-4">
      {/* Kanban header */}
      <div className="rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border shadow-[var(--shadow-soft)] px-5 py-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Visão Kanban dos atendimentos
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Ao vivo
            </span>
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Operação ativa
            </span>

          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe cada atendimento por etapa, identifique gargalos e priorize retornos importantes.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-card/70 border border-border/70 px-3 py-2 shadow-sm">
          <div className="text-right">
            <div className="text-xs font-medium text-muted-foreground">Total</div>
            <div className="text-base font-bold text-foreground leading-tight">
              {total} {total === 1 ? "atendimento" : "atendimentos"}
            </div>
          </div>
          <div className="h-8 w-px bg-border/70" />
          <div className="text-right">
            <div className="text-xs font-medium text-muted-foreground">Status</div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Atualizado agora
            </div>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-4">
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-2">
            {KANBAN_COLUMNS.map((status) => {
              const colItems = grouped[status];
              const theme = columnTheme[status];
              return (
                <div
                  key={status}
                  className={`flex flex-col w-80 min-w-[20rem] shrink-0 rounded-xl border border-border/70 overflow-hidden ${theme.surface}`}
                >
                  <div className={`h-1 w-full ${theme.accent}`} />
                  <div className={`flex items-center justify-between px-3 py-2.5 border-b border-border/60 ${theme.header}`}>
                    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                      <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                      {getConversationStatusLabel(status)}
                    </span>
                    <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold px-2 py-0.5 min-w-[1.5rem] shadow-sm ${theme.chip}`}>
                      {colItems.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5 p-2.5 max-h-[560px] overflow-y-auto">
                    {colItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-dashed border-border/70 text-muted-foreground/70">
                          <Inbox className="h-4 w-4" />
                        </div>
                        <span className="text-[12px] font-medium text-foreground/70">
                          Nenhum atendimento nesta etapa
                        </span>
                        <span className="text-[10.5px] text-muted-foreground leading-snug max-w-[180px]">
                          Novas conversas neste status aparecerão aqui automaticamente.
                        </span>
                      </div>
                    ) : (
                      colItems.map((c) => {
                        const isActive = c.id === selectedId;
                        const setorLabel =
                          c.setor && c.setor !== "—" ? c.setor : "Não definido";
                        const responsavelLabel = "Não atribuído";
                        const prio = priorityBadge(c.status);
                        const initial = getInitial(c.cliente);
                        return (
                          <div
                            key={c.id}
                            className={`group rounded-xl border bg-card p-3.5 transition-all duration-150 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:border-primary/30 ${
                              isActive
                                ? "border-primary ring-2 ring-primary/25 bg-blue-50/60 shadow-[var(--shadow-card)]"
                                : "border-border/70"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => onSelect(c.id)}
                              className="w-full text-left focus:outline-none"
                            >
                              {/* Cliente em destaque + badge prioridade */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold ${avatarColor(c.cliente)}`}>
                                    {initial}
                                  </span>
                                  <span className="font-semibold text-sm text-foreground truncate leading-tight">
                                    {c.cliente}
                                  </span>
                                </div>
                                {prio ? (
                                  <span
                                    className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap ${prio.cls}`}
                                  >
                                    {prio.label}
                                  </span>
                                ) : null}
                              </div>

                              {/* Canal + telefone com ícones */}
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1 truncate">
                                  <MessageCircle className="h-3 w-3 text-emerald-600/80" />
                                  {c.canal}
                                </span>
                                <span className="inline-flex items-center gap-1 truncate">
                                  <Phone className="h-3 w-3 text-foreground/50" />
                                  {c.telefone}
                                </span>
                              </div>

                              {/* Histórico/última mensagem */}
                              <p className="mt-2.5 text-xs text-foreground/75 line-clamp-2 leading-relaxed bg-muted/50 rounded-md px-2 py-1.5 border border-border/40">
                                {c.ultimaMensagem || "Histórico do atendimento disponível"}
                              </p>

                              {/* Responsável e setor */}
                              <div className="mt-2.5 space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                                  <UserCheck className="h-3 w-3 text-foreground/50 shrink-0" />
                                  <span className="text-foreground/70 font-medium">Responsável:</span>
                                  <span className="truncate">{responsavelLabel}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                                  <Briefcase className="h-3 w-3 text-foreground/50 shrink-0" />
                                  <span className="text-foreground/70 font-medium">Setor:</span>
                                  <span className="truncate">{setorLabel}</span>
                                </div>
                              </div>

                              {/* Rodapé: atualização + ação */}
                              <div className="mt-3 pt-2.5 border-t border-dashed border-border/50 flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                  <Clock className="h-3 w-3 text-foreground/50" />
                                  {c.horario || "—"}
                                </span>
                                <span className="text-[11px] font-semibold text-primary group-hover:underline whitespace-nowrap">
                                  Ver atendimento →
                                </span>
                              </div>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}





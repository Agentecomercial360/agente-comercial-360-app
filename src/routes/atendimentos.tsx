import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import {
  Headphones,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  Sparkles,
  Target,
  X,
  CheckCheck,
  UserPlus,
  Loader2,
  Activity,
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
  normalizeConversationStatus,
  getConversationStatusLabel,
  getConversationStatusBadgeClass,
} from "@/lib/conversation-status";

export const Route = createFileRoute("/atendimentos")({
  component: AtendimentosPage,
  head: () => ({ meta: [{ title: "Atendimentos | Agente Comercial 360" }] }),
});

type LoadStatus = "loading" | "loaded" | "empty" | "unauthenticated" | "error";

function formatHorario(lastMessageAt: string | null, createdAt: string | null): string {
  const iso = lastMessageAt ?? createdAt;
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}


const cards = [
  { label: "Total de atendimentos", value: 128, icon: Headphones },
  { label: "Em andamento", value: 26, icon: Clock },
  { label: "Aguardando cliente", value: 9, icon: AlertCircle },
  { label: "Finalizados", value: 93, icon: CheckCircle2 },
];

const filtros = [
  "Todos",
  "Abertos",
  "Em andamento",
  "Finalizados",
  "Sem resposta",
];

type Atendimento = {
  id: string | number;
  cliente: string;
  telefone: string;
  mensagem: string;
  setor: SectorKey | null;
  status: ConversationStatus;
  responsavel: string;
  horario: string;
};

const atendimentosMock: Atendimento[] = [
  { id: 1, cliente: "João Martins", telefone: "(15) 99999-1020", mensagem: "Preciso de orçamento do kit embreagem.", setor: "vendas", status: "em_andamento", responsavel: "Amanda", horario: "09:41" },
  { id: 2, cliente: "Carlos Souza", telefone: "(15) 98888-2211", mensagem: "Vocês têm pastilha de freio do Onix?", setor: "vendas", status: "sem_resposta", responsavel: "Vinicius", horario: "10:12" },
  { id: 3, cliente: "Fernanda Lima", telefone: "(15) 97777-3344", mensagem: "Quero saber se tem bateria 60Ah.", setor: "vendas", status: "aberta", responsavel: "Thaís", horario: "11:05" },
  { id: 4, cliente: "Roberto Alves", telefone: "(15) 96666-4455", mensagem: "Tenho uma cobrança em aberto?", setor: "financeiro", status: "em_andamento", responsavel: "Vinicius", horario: "11:48" },
  { id: 5, cliente: "Mariana Costa", telefone: "(15) 95555-7788", mensagem: "Qual horário de funcionamento?", setor: "administrativo", status: "finalizada", responsavel: "Lorenzzo", horario: "12:20" },
  { id: 6, cliente: "Pedro Henrique", telefone: "(15) 94444-8899", mensagem: "Preciso de amortecedor dianteiro.", setor: "geral", status: "sem_resposta", responsavel: "Vitor", horario: "13:02" },
];



const prioridades = [
  "Responder clientes sem retorno",
  "Encaminhar orçamentos pendentes",
  "Revisar atendimentos financeiros",
  "Confirmar disponibilidade das peças mais solicitadas",
];

const setores = new Set(["Vendas", "Financeiro", "Administrativo", "Orçamentos"]);
// Mapeia o rótulo do chip de filtro para um conjunto de status canônicos.
const filtroStatusMap: Record<string, ConversationStatus[]> = {
  Abertos: ["aberta"],
  "Em andamento": ["em_andamento"],
  Finalizados: ["finalizada"],
  "Sem resposta": ["sem_resposta"],
};

function AtendimentosPage() {
  const [filtro, setFiltro] = useState("Todos");
  const [sectorFilter, setSectorFilter] = useState<SectorFilterOption>("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Atendimento[]>(atendimentosMock);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [, setLoadingAtendimentos] = useState<boolean>(true);
  const [atendimentosLoadStatus, setAtendimentosLoadStatus] = useState<LoadStatus>("loading");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [finishingId, setFinishingId] = useState<string | number | null>(null);


  const crmRole = useCrmRole();
  const roleLoading = crmRole.loading;
  const role = crmRole.role;

  useEffect(() => {
    if (roleLoading) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData?.user) {
          if (!cancelled) setAtendimentosLoadStatus("unauthenticated");
          return;
        }
        const { data: cu, error: cuErr } = await supabase
          .from("company_users")
          .select("company_id")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .maybeSingle();
        if (cuErr || !cu?.company_id) {
          if (!cancelled) setAtendimentosLoadStatus("error");
          return;
        }
        if (!cancelled) setCompanyId(cu.company_id as string);

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
        if (convErr) {
          if (!cancelled) setAtendimentosLoadStatus("error");
          return;
        }
        if (!rows || rows.length === 0) {
          if (!cancelled) setAtendimentosLoadStatus("empty");
          return;
        }
        const mapped: Atendimento[] = rows.map((r: any) => {
          const cust = Array.isArray(r.customers) ? r.customers[0] : r.customers;
          return {
            id: String(r.id),
            cliente: cust?.name ?? "Cliente sem nome",
            telefone: cust?.phone ?? "—",
            mensagem: "Histórico do atendimento disponível",
            setor: normalizeSector(r.sector),
            status: normalizeConversationStatus(r.status),
            responsavel: "—",
            horario: formatHorario(r.last_message_at, r.created_at),
          };
        });
        if (cancelled) return;
        setItems(mapped);
        setAtendimentosLoadStatus("loaded");
      } catch {
        if (!cancelled) setAtendimentosLoadStatus("error");
      } finally {
        if (!cancelled) setLoadingAtendimentos(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roleLoading, role]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const adminLike = canRoleSeeAllSectors(role);
    return items.filter((a) => {
      if (filtro !== "Todos") {
        const allowed = filtroStatusMap[filtro];
        if (allowed && !allowed.includes(a.status)) return false;
      }
      if (adminLike && sectorFilter !== "all") {
        if (sectorFilter === "none") {
          if (a.setor !== null) return false;
        } else if (a.setor !== sectorFilter) return false;
      }
      if (!q) return true;
      const statusLabel = getConversationStatusLabel(a.status).toLowerCase();
      const setorLabel = getSectorLabel(a.setor).toLowerCase();
      return [a.cliente, a.telefone, a.mensagem, setorLabel, statusLabel, a.responsavel, a.horario]
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [items, filtro, search, role, sectorFilter]);

  const selected = items.find((a) => a.id === selectedId) || null;

  const responsaveis = ["Amanda", "Vinicius", "Thaís", "Lorenzzo", "Vitor"];

  const finalizar = async (id: string | number) => {
    if (typeof id !== "string") {
      toast.error("Não foi possível salvar esta alteração. Atualize a página e tente novamente.");
      return;
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      toast.error("Usuário não autenticado. Faça login novamente.");
      return;
    }
    if (!companyId) {
      toast.error("Empresa vinculada não encontrada para este usuário.");
      return;
    }
    setFinishingId(id);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .update({ status: "finalizada" })
        .eq("id", id)
        .eq("company_id", companyId)
        .select()
        .single();
      if (error || !data) {
        toast.error("Não foi possível finalizar o atendimento.");
        return;
      }
      setItems((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: normalizeConversationStatus(data.status) } : a)),
      );
      toast.success("Atendimento finalizado no Supabase.");
    } catch {
      toast.error("Não foi possível finalizar o atendimento.");
    } finally {
      setFinishingId(null);
    }
  };


  const encaminhar = (id: string | number) => {
    setItems((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, responsavel: responsaveis[Math.floor(Math.random() * responsaveis.length)] }
          : a,
      ),
    );
    toast.success(
      "Encaminhamento aplicado apenas localmente. Persistência de responsável será conectada em uma próxima fase.",
    );
  };

  const dynamicCards = useMemo(
    () => [
      { label: "Total de atendimentos", value: items.length, icon: Headphones },
      { label: "Em andamento", value: items.filter((a) => a.status === "em_andamento").length, icon: Clock },
      {
        label: "Aguardando cliente",
        value: items.filter((a) => a.status === "aguardando_cliente" || a.status === "aguardando_empresa").length,
        icon: AlertCircle,
      },
      { label: "Finalizados", value: items.filter((a) => a.status === "finalizada").length, icon: CheckCircle2 },
    ],
    [items],
  );

  const statusMsg =
    atendimentosLoadStatus === "loading"
      ? "Carregando atendimentos do Supabase..."
      : atendimentosLoadStatus === "loaded"
        ? "Painel de atendimentos ativo. As conversas estão organizadas por status, prioridade e evolução operacional."
        : atendimentosLoadStatus === "empty"
          ? "Nenhum atendimento real encontrado. Usando dados locais temporários."
          : atendimentosLoadStatus === "unauthenticated"
            ? "Usuário não autenticado. Usando dados locais temporários."
            : "Não foi possível carregar atendimentos. Usando dados locais temporários.";
  const statusColor =
    atendimentosLoadStatus === "loaded"
      ? "text-emerald-600"
      : atendimentosLoadStatus === "loading"
        ? "text-slate-500"
        : atendimentosLoadStatus === "empty"
          ? "text-amber-600"
          : "text-red-600";


  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors />
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HERO PREMIUM */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 shadow-sm">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Operação ativa
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  <Activity className="h-3 w-3" /> Atendimentos centralizados
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  Fluxo monitorado
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Atendimentos
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-blue-100/90">
                Organize solicitações, status e responsáveis em uma visão operacional clara.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:w-80">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-100/80">
                  Resumo da operação
                </p>
                <span className="text-[10px] font-medium text-blue-200/70">
                  {atendimentosLoadStatus === "loading" ? "Sincronizando…" : "Atualizado agora"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Abertos</p>
                  <p className="mt-1 text-xl font-bold text-white tabular-nums">{items.filter((a) => a.status === "aberta" || a.status === "aguardando_cliente" || a.status === "aguardando_empresa").length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Em andamento</p>
                  <p className="mt-1 text-xl font-bold text-white tabular-nums">{items.filter((a) => a.status === "em_andamento").length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Finalizados</p>
                  <p className="mt-1 text-xl font-bold text-white tabular-nums">{items.filter((a) => a.status === "finalizada").length}</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-blue-100/80">
                Visão operacional consolidada dos atendimentos em andamento.
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        {(() => {
          const themes = [
            { icon: "bg-blue-50 text-blue-600", accent: "bg-blue-500", ring: "group-hover:ring-blue-200" },
            { icon: "bg-amber-50 text-amber-600", accent: "bg-amber-500", ring: "group-hover:ring-amber-200" },
            { icon: "bg-rose-50 text-rose-600", accent: "bg-rose-500", ring: "group-hover:ring-rose-200" },
            { icon: "bg-emerald-50 text-emerald-600", accent: "bg-emerald-500", ring: "group-hover:ring-emerald-200" },
          ];
          return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dynamicCards.map((c, i) => {
            const Icon = c.icon;
            const t = themes[i % themes.length];
            return (
              <div
                key={c.label}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/60 p-5 border border-border/70 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${t.accent}`} />
                <span className={`pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full ${t.accent} opacity-[0.07] blur-2xl group-hover:opacity-[0.14] transition-opacity`} />
                <div className="relative flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.icon} ring-4 ring-transparent ${t.ring} shadow-sm transition`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex h-2 w-2 rounded-full ${t.accent} shadow-[0_0_0_4px_rgba(255,255,255,0.6)] opacity-70`} />
                </div>
                <div className="relative mt-4 font-display text-3xl font-bold tracking-tight text-foreground tabular-nums">{c.value}</div>
                <div className="relative mt-1 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{c.label}</div>
              </div>
            );
          })}
        </div>
          );
        })()}


        {/* Filtros */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por cliente, telefone ou mensagem..."
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {filtros.map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  filtro === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {canRoleSeeAllSectors(role) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Setor
              </span>
              {ALL_SECTOR_OPTIONS.map((opt) => {
                const active = sectorFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSectorFilter(opt.value)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                      active
                        ? "bg-foreground text-background shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted ring-1 ring-border"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tabela ou vazio */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <Headphones className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-slate-900">
              Nenhum atendimento encontrado
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Revise os filtros ou tente outro termo de busca.
            </p>
          </div>
        ) : (
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
                  {filtered.map((a) => {
                    const isSelected = selectedId === a.id;
                    const initial = (a.cliente?.trim()?.charAt(0) || "?").toUpperCase();
                    const responsavelVazio = !a.responsavel || a.responsavel === "—";
                    return (
                      <tr
                        key={a.id}
                        className={`transition-colors ${isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/80"}`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-[11px] font-bold text-blue-700 ring-1 ring-blue-200/70">
                              {initial}
                            </span>
                            <span className="font-semibold text-slate-900">{a.cliente}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600 tabular-nums">{a.telefone}</td>
                        <td className="px-4 py-4 max-w-xs truncate text-slate-600">{a.mensagem}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${getSectorBadgeClass(a.setor)}`}
                          >
                            {getSectorLabel(a.setor)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${getConversationStatusBadgeClass(a.status)}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                            {getConversationStatusLabel(a.status)}
                          </span>
                        </td>
                        <td className={`px-4 py-4 ${responsavelVazio ? "text-slate-400 italic" : "text-slate-700"}`}>
                          {responsavelVazio ? "A atribuir" : a.responsavel}
                        </td>
                        <td className="px-4 py-4 text-slate-500 tabular-nums">{a.horario}</td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => setSelectedId(a.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow transition"
                          >
                            Ver detalhes <span aria-hidden>→</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resumo IA + Prioridades */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-slate-900 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-bold">Resumo da IA</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-blue-50">
              A análise operacional identificou oportunidades de retorno, atendimentos aguardando resposta e solicitações relacionadas a orçamento de peças.
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

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <button
            aria-label="Fechar"
            onClick={() => setSelectedId(null)}
            className="flex-1 bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="w-full max-w-md overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Detalhes do atendimento</h2>
              <button
                onClick={() => setSelectedId(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-5 px-6 py-5 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Cliente</p>
                <p className="mt-0.5 text-base font-semibold text-slate-900">{selected.cliente}</p>
                <p className="text-slate-600">{selected.telefone}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Setor</p>
                  <p className="mt-0.5 font-medium text-slate-800">{getSectorLabel(selected.setor)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                  <p className="mt-0.5 font-medium text-slate-800">{getConversationStatusLabel(selected.status)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Responsável</p>
                  <p className="mt-0.5 font-medium text-slate-800">{selected.responsavel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Horário</p>
                  <p className="mt-0.5 font-medium text-slate-800">{selected.horario}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Última mensagem</p>
                <p className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-700">{selected.mensagem}</p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-600 to-slate-900 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <h4 className="text-sm font-bold">Resumo da IA</h4>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-blue-50">
                  A IA identificou o setor correto com base na mensagem do cliente e sugeriu o
                  encaminhamento para o responsável vinculado.
                </p>
                <div className="mt-3 border-t border-white/20 pt-2">
                  <p className="text-[10px] uppercase tracking-wide text-blue-100">
                    Próxima ação recomendada
                  </p>
                  <p className="mt-0.5 text-xs text-white">
                    Confirmar disponibilidade da peça e enviar orçamento ao cliente.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  disabled={finishingId === selected.id}
                  onClick={async () => {
                    const sid = selected.id;
                    await finalizar(sid);
                    setSelectedId(null);
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCheck className="h-4 w-4" />
                  {finishingId === selected.id ? "Finalizando..." : "Marcar como finalizado"}
                </button>

                <button
                  onClick={() => encaminhar(selected.id)}
                  title="Encaminhamento ainda é local e não altera o Supabase nesta fase."
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4" /> Encaminhar localmente
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


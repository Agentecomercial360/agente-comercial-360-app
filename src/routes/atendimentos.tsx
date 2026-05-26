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
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";
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

type Atendimento = {
  id: string | number;
  cliente: string;
  telefone: string;
  mensagem: string;
  setor: string;
  status: ConversationStatus;
  responsavel: string;
  horario: string;
};

const atendimentosMock: Atendimento[] = [
  { id: 1, cliente: "João Martins", telefone: "(15) 99999-1020", mensagem: "Preciso de orçamento do kit embreagem.", setor: "Vendas", status: "em_andamento", responsavel: "Amanda", horario: "09:41" },
  { id: 2, cliente: "Carlos Souza", telefone: "(15) 98888-2211", mensagem: "Vocês têm pastilha de freio do Onix?", setor: "Vendas", status: "sem_resposta", responsavel: "Vinicius", horario: "10:12" },
  { id: 3, cliente: "Fernanda Lima", telefone: "(15) 97777-3344", mensagem: "Quero saber se tem bateria 60Ah.", setor: "Vendas", status: "aberta", responsavel: "Thaís", horario: "11:05" },
  { id: 4, cliente: "Roberto Alves", telefone: "(15) 96666-4455", mensagem: "Tenho uma cobrança em aberto?", setor: "Financeiro", status: "em_andamento", responsavel: "Vinicius", horario: "11:48" },
  { id: 5, cliente: "Mariana Costa", telefone: "(15) 95555-7788", mensagem: "Qual horário de funcionamento?", setor: "Administrativo", status: "finalizada", responsavel: "Lorenzzo", horario: "12:20" },
  { id: 6, cliente: "Pedro Henrique", telefone: "(15) 94444-8899", mensagem: "Preciso de amortecedor dianteiro.", setor: "Orçamentos", status: "sem_resposta", responsavel: "Vitor", horario: "13:02" },
];


const setorBadge: Record<string, string> = {
  Vendas: "bg-blue-50 text-blue-700 ring-blue-200",
  Financeiro: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Administrativo: "bg-slate-100 text-slate-700 ring-slate-200",
  Orçamentos: "bg-amber-50 text-amber-700 ring-amber-200",
};

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
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Atendimento[]>(atendimentosMock);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [, setLoadingAtendimentos] = useState<boolean>(true);
  const [atendimentosLoadStatus, setAtendimentosLoadStatus] = useState<LoadStatus>("loading");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [finishingId, setFinishingId] = useState<string | number | null>(null);


  useEffect(() => {
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

        const { data: rows, error: convErr } = await supabase
          .from("conversations")
          .select(
            `id, channel, status, last_message_at, created_at, customer_id,
             customers ( name, phone, city, customer_type )`,
          )
          .eq("company_id", cu.company_id)
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
            mensagem: "Carregue o atendimento para ver mensagens",
            setor: "—",
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
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((a) => {
      if (filtro !== "Todos") {
        if (setores.has(filtro) && a.setor !== filtro) return false;
        const allowed = filtroStatusMap[filtro];
        if (allowed && !allowed.includes(a.status)) return false;
      }
      if (!q) return true;
      const statusLabel = getConversationStatusLabel(a.status).toLowerCase();
      return [a.cliente, a.telefone, a.mensagem, a.setor, statusLabel, a.responsavel, a.horario]
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [items, filtro, search]);

  const selected = items.find((a) => a.id === selectedId) || null;

  const responsaveis = ["Amanda", "Vinicius", "Thaís", "Lorenzzo", "Vitor"];

  const finalizar = async (id: string | number) => {
    if (typeof id !== "string") {
      // mock local
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status: "finalizada" as ConversationStatus } : a)));
      toast.success("Atendimento marcado como finalizado (local)");
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
      { label: "Atendimentos hoje", value: items.length, icon: Headphones },
      { label: "Em andamento", value: items.filter((a) => a.status === "em_andamento").length, icon: Clock },
      {
        label: "Aguardando resposta",
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
        ? `Dados carregados do Supabase — ${items.length} atendimentos`
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
      <div className="space-y-6">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-3xl font-bold text-slate-900">Atendimentos</h1>
            <span className={`text-xs font-medium ${statusColor}`}>{statusMsg}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe os atendimentos recebidos, setores identificados e responsáveis vinculados.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          Atendimentos são carregados do Supabase. <strong>Finalizar atendimento</strong> já é
          salvo no Supabase. <strong>Encaminhamentos</strong> ainda são locais e não alteram o
          banco nesta fase.
        </div>


        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dynamicCards.map((c) => (
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{a.cliente}</td>
                      <td className="px-4 py-3 text-slate-600">{a.telefone}</td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-600">{a.mensagem}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${setorBadge[a.setor] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`}
                        >
                          {a.setor}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getConversationStatusBadgeClass(a.status)}`}
                        >
                          {getConversationStatusLabel(a.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{a.responsavel}</td>
                      <td className="px-4 py-3 text-slate-500">{a.horario}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedId(a.id)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Ver atendimento
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  <p className="mt-0.5 font-medium text-slate-800">{selected.setor}</p>
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


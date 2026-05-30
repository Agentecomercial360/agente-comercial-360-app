import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Flame,
  Handshake,
  UserX,
  Search,
  Sparkles,
  X,
  ArrowRightLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/leads")({
  component: LeadsPage,
  head: () => ({ meta: [{ title: "Leads | Agente Comercial 360" }] }),
});

const filters = [
  "Todos",
  "Quentes",
  "Mornos",
  "Frios",
  "Abertos",
  "Em negociação",
  "Perdidos",
  "Fechados",
] as const;

type Filter = (typeof filters)[number];

type LeadStatus =
  | "Aberto"
  | "Em negociação"
  | "Aguardando retorno"
  | "Sem resposta"
  | "Fechado"
  | "Perdido";

type LeadTemperatura = "Quente" | "Morno" | "Frio";

type Lead = {
  id: string | number;
  cliente: string;
  telefone: string;
  peca: string;
  veiculo: string;
  ano: number;
  temperatura: LeadTemperatura;
  score: number;
  status: LeadStatus;
  responsavel: string;
  proximaAcao: string;
};

type LeadsLoadStatus =
  | "loading"
  | "loaded"
  | "empty"
  | "unauthenticated"
  | "error";

const initialLeads: Lead[] = [
  { id: 1, cliente: "João Martins", telefone: "(15) 99999-1020", peca: "Kit embreagem", veiculo: "Gol 1.6", ano: 2014, temperatura: "Quente", score: 92, status: "Em negociação", responsavel: "Amanda", proximaAcao: "Enviar orçamento" },
  { id: 2, cliente: "Carlos Souza", telefone: "(15) 98888-2211", peca: "Pastilha de freio", veiculo: "Onix", ano: 2019, temperatura: "Morno", score: 68, status: "Aguardando retorno", responsavel: "Vinicius", proximaAcao: "Fazer follow-up" },
  { id: 3, cliente: "Fernanda Lima", telefone: "(15) 97777-3344", peca: "Bateria 60Ah", veiculo: "HB20", ano: 2020, temperatura: "Quente", score: 88, status: "Aberto", responsavel: "Thaís", proximaAcao: "Confirmar disponibilidade" },
  { id: 4, cliente: "Roberto Alves", telefone: "(15) 96666-4455", peca: "Amortecedor dianteiro", veiculo: "Corolla", ano: 2016, temperatura: "Frio", score: 41, status: "Sem resposta", responsavel: "Lorenzzo", proximaAcao: "Tentar novo contato" },
  { id: 5, cliente: "Mariana Costa", telefone: "(15) 95555-7788", peca: "Alternador", veiculo: "Palio", ano: 2012, temperatura: "Morno", score: 74, status: "Em negociação", responsavel: "Vitor", proximaAcao: "Verificar estoque" },
];

const tempBadge: Record<LeadTemperatura, string> = {
  Quente: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  Morno: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Frio: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
};

const statusBadge: Record<LeadStatus, string> = {
  Aberto: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  "Em negociação": "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
  "Aguardando retorno": "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  "Sem resposta": "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  Fechado: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Perdido: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

function deriveTemperatura(score: number | null | undefined): LeadTemperatura {
  if (score == null) return "Frio";
  if (score >= 80) return "Quente";
  if (score >= 50) return "Morno";
  return "Frio";
}

function normalizeStatus(stage: string | null | undefined): LeadStatus {
  if (!stage) return "Aberto";
  const s = String(stage).trim().toLowerCase();
  if (["aberto", "new"].includes(s)) return "Aberto";
  if (["orcamento", "orçamento", "em negociação", "em negociacao", "negociacao", "negociação", "negotiation", "qualified"].includes(s)) return "Em negociação";
  if (["aguardando retorno", "follow_up", "follow-up"].includes(s)) return "Aguardando retorno";
  if (["sem resposta", "no_response"].includes(s)) return "Sem resposta";
  if (["fechado", "won"].includes(s)) return "Fechado";
  if (["perdido", "lost"].includes(s)) return "Perdido";
  return "Aberto";
}

function applyFilter(lead: Lead, f: Filter): boolean {
  switch (f) {
    case "Todos": return true;
    case "Quentes": return lead.temperatura === "Quente";
    case "Mornos": return lead.temperatura === "Morno";
    case "Frios": return lead.temperatura === "Frio";
    case "Abertos": return lead.status === "Aberto";
    case "Em negociação": return lead.status === "Em negociação";
    case "Perdidos": return lead.status === "Perdido";
    case "Fechados": return lead.status === "Fechado";
  }
}

function LeadsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("Todos");
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [leadsLoadStatus, setLeadsLoadStatus] = useState<LeadsLoadStatus>("loading");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | number | null>(null);


  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (cancelled) return;
        if (userErr || !userData?.user) {
          setLeadsLoadStatus("unauthenticated");
          setLoadingLeads(false);
          return;
        }

        const { data: cuRow, error: cuErr } = await supabase
          .from("company_users")
          .select("company_id")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .maybeSingle();
        if (cancelled) return;
        if (cuErr || !cuRow?.company_id) {
          setLeadsLoadStatus("error");
          setLoadingLeads(false);
          return;
        }
        setCompanyId(cuRow.company_id as string);


        const { data: rows, error: leadsErr } = await supabase
          .from("leads")
          .select(`
            id,
            interest,
            stage,
            score,
            estimated_value,
            next_action,
            next_follow_up_at,
            created_at,
            customer_id,
            customers ( name, phone, city, customer_type )
          `)
          .eq("company_id", cuRow.company_id)
          .order("created_at", { ascending: false });
        if (cancelled) return;
        if (leadsErr) {
          setLeadsLoadStatus("error");
          setLoadingLeads(false);
          return;
        }

        if (!rows || rows.length === 0) {
          setLeadsLoadStatus("empty");
          setLoadingLeads(false);
          return;
        }

        const mapped: Lead[] = rows.map((r: any) => {
          const customer = Array.isArray(r.customers) ? r.customers[0] : r.customers;
          const score = typeof r.score === "number" ? r.score : 0;
          return {
            id: String(r.id),
            cliente: customer?.name ?? "—",
            telefone: customer?.phone ?? "—",
            peca: r.interest ?? "—",
            veiculo: "—",
            ano: 0,
            temperatura: deriveTemperatura(r.score),
            score,
            status: normalizeStatus(r.stage),
            responsavel: "—",
            proximaAcao: r.next_action ?? "—",
          };
        });

        setLeads(mapped);
        setLeadsLoadStatus("loaded");
        setLoadingLeads(false);
      } catch {
        if (cancelled) return;
        setLeadsLoadStatus("error");
        setLoadingLeads(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (!applyFilter(l, activeFilter)) return false;
      if (!q) return true;
      return [l.cliente, l.telefone, l.peca, l.veiculo, l.responsavel, l.status, l.temperatura]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [leads, activeFilter, search]);

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.temperatura === "Quente").length;
  const negotiatingLeads = leads.filter((l) => l.status === "Em negociação").length;
  const noOwnerLeads = leads.filter((l) => l.responsavel === "—").length;

  const summary = [
    { label: "Total de leads", value: totalLeads, icon: Users },
    { label: "Leads quentes", value: hotLeads, icon: Flame },
    { label: "Leads em negociação", value: negotiatingLeads, icon: Handshake },
    { label: "Leads sem responsável", value: noOwnerLeads, icon: UserX },
  ];

  async function markNegotiating(id: string | number) {
    // Fallback local para leads mockados (id numérico) — não persiste no Supabase
    if (typeof id === "number") {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Em negociação" } : l)));
      toast.success("Lead marcado como em negociação (local)");
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

    setUpdatingLeadId(id);
    try {
      const { data, error } = await supabase
        .from("leads")
        .update({
          stage: "orcamento",
          next_action:
            "Lead marcado como em negociação. Acompanhar orçamento e próximo contato.",
        })
        .eq("id", id)
        .eq("company_id", companyId)
        .select()
        .single();

      if (error || !data) {
        toast.error("Não foi possível atualizar o lead.");
        return;
      }

      setLeads((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                status: normalizeStatus((data as any).stage),
                proximaAcao: (data as any).next_action ?? l.proximaAcao,
              }
            : l,
        ),
      );
      toast.success("Lead atualizado no Supabase.");
    } catch {
      toast.error("Não foi possível atualizar o lead.");
    } finally {
      setUpdatingLeadId(null);
    }
  }


  function forwardLead(id: string | number) {
    const owners = ["Amanda", "Vinicius", "Thaís", "Lorenzzo", "Vitor"];
    const next = owners[Math.floor(Math.random() * owners.length)];
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, responsavel: next } : l)));
    toast.success(
      "Encaminhamento de lead ainda é local. Atribuição real de responsável e automações (WhatsApp, follow-up) serão conectadas em uma próxima fase.",
    );
  }

  const statusIndicator = (() => {
    if (loadingLeads) {
      return (
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Carregando leads...
        </div>
      );
    }
    if (leadsLoadStatus === "loaded") {
      return (
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
          Leads são carregados do Supabase ({leads.length}). <strong>Marcar como negociação</strong> já é salvo no Supabase. Encaminhamento, WhatsApp e follow-up ainda são recursos futuros (locais).
        </div>
      );
    }

    if (leadsLoadStatus === "empty") {
      return (
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
          Nenhum lead real encontrado. Usando dados locais temporários.
        </div>
      );
    }
    if (leadsLoadStatus === "unauthenticated") {
      return (
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
          Usuário não autenticado. Usando dados locais temporários.
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
        Não foi possível carregar leads. Usando dados locais temporários.
      </div>
    );
  })();

  return (
    <DashboardLayout>
      <Toaster />
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Leads</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Visualize oportunidades comerciais, temperatura dos leads e próximas ações.
          </p>
          <div className="mt-3">{statusIndicator}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl bg-card p-5 border border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>

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
              placeholder="Buscar por cliente, telefone ou peça..."
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-to-br from-[var(--brand-blue-soft)] to-card p-4 sm:p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground">Resumo da IA</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                A IA identificou <span className="font-semibold text-foreground">{hotLeads} {hotLeads === 1 ? "lead quente" : "leads quentes"}</span> e{" "}
                <span className="font-semibold text-foreground">{noOwnerLeads} {noOwnerLeads === 1 ? "oportunidade sem responsável" : "oportunidades sem responsável"}</span>. Priorize contatos com maior score e clientes aguardando orçamento.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Nenhum lead encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">Revise os filtros ou tente outro termo de busca.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    {["Cliente","Telefone","Peça/produto","Veículo","Ano","Temperatura","Score","Status","Responsável","Próxima ação",""].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{l.cliente}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{l.telefone}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{l.peca}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{l.veiculo}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.ano ? l.ano : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tempBadge[l.temperatura]}`}>{l.temperatura}</span>
                      </td>
                      <td className="px-4 py-3 font-display font-bold text-foreground">{l.score}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${statusBadge[l.status]}`}>{l.status}</span>
                      </td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{l.responsavel}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{l.proximaAcao}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedId(l.id)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap"
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Drawer de detalhes */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          />
          <aside className="w-full max-w-md h-full overflow-y-auto bg-card border-l border-border shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">{selected.cliente}</h2>
                <p className="text-xs text-muted-foreground">Detalhes do lead</p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted transition"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Telefone" value={selected.telefone} />
                <Info label="Peça/produto" value={selected.peca} />
                <Info label="Veículo" value={selected.veiculo} />
                <Info label="Ano" value={selected.ano ? String(selected.ano) : "—"} />
                <Info label="Responsável" value={selected.responsavel} />
                <Info label="Próxima ação" value={selected.proximaAcao} />
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tempBadge[selected.temperatura]}`}>
                  Temperatura: {selected.temperatura}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[selected.status]}`}>
                  {selected.status}
                </span>
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                  Score: {selected.score}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-gradient-to-br from-[var(--brand-blue-soft)] to-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Observação da IA</h4>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  A IA classificou este lead com base na intenção comercial, urgência da solicitação e contexto da conversa.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => markNegotiating(selected.id)}
                  disabled={updatingLeadId === selected.id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {updatingLeadId === selected.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Marcar como em negociação
                    </>
                  )}
                </button>

                <button
                  onClick={() => forwardLead(selected.id)}
                  title="Encaminhamento ainda é local — não altera o Supabase nesta fase."
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Encaminhar localmente (em breve)
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </DashboardLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

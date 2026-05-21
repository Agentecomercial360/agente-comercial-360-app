import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/leads")({
  component: LeadsPage,
  head: () => ({ meta: [{ title: "Leads | Agente Comercial 360" }] }),
});

const summary = [
  { label: "Total de leads", value: 32, icon: Users },
  { label: "Leads quentes", value: 14, icon: Flame },
  { label: "Leads em negociação", value: 9, icon: Handshake },
  { label: "Leads sem responsável", value: 3, icon: UserX },
];

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

type Lead = {
  id: number;
  cliente: string;
  telefone: string;
  peca: string;
  veiculo: string;
  ano: number;
  temperatura: "Quente" | "Morno" | "Frio";
  score: number;
  status:
    | "Aberto"
    | "Em negociação"
    | "Aguardando retorno"
    | "Sem resposta"
    | "Fechado"
    | "Perdido";
  responsavel: string;
  proximaAcao: string;
};

const initialLeads: Lead[] = [
  { id: 1, cliente: "João Martins", telefone: "(15) 99999-1020", peca: "Kit embreagem", veiculo: "Gol 1.6", ano: 2014, temperatura: "Quente", score: 92, status: "Em negociação", responsavel: "Amanda", proximaAcao: "Enviar orçamento" },
  { id: 2, cliente: "Carlos Souza", telefone: "(15) 98888-2211", peca: "Pastilha de freio", veiculo: "Onix", ano: 2019, temperatura: "Morno", score: 68, status: "Aguardando retorno", responsavel: "Vinicius", proximaAcao: "Fazer follow-up" },
  { id: 3, cliente: "Fernanda Lima", telefone: "(15) 97777-3344", peca: "Bateria 60Ah", veiculo: "HB20", ano: 2020, temperatura: "Quente", score: 88, status: "Aberto", responsavel: "Thaís", proximaAcao: "Confirmar disponibilidade" },
  { id: 4, cliente: "Roberto Alves", telefone: "(15) 96666-4455", peca: "Amortecedor dianteiro", veiculo: "Corolla", ano: 2016, temperatura: "Frio", score: 41, status: "Sem resposta", responsavel: "Lorenzzo", proximaAcao: "Tentar novo contato" },
  { id: 5, cliente: "Mariana Costa", telefone: "(15) 95555-7788", peca: "Alternador", veiculo: "Palio", ano: 2012, temperatura: "Morno", score: 74, status: "Em negociação", responsavel: "Vitor", proximaAcao: "Verificar estoque" },
];

const tempBadge: Record<Lead["temperatura"], string> = {
  Quente: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  Morno: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Frio: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
};

const statusBadge: Record<Lead["status"], string> = {
  Aberto: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  "Em negociação": "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
  "Aguardando retorno": "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  "Sem resposta": "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  Fechado: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Perdido: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

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
  const [selectedId, setSelectedId] = useState<number | null>(null);

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

  function markNegotiating(id: number) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Em negociação" } : l)));
    toast.success("Lead marcado como em negociação");
  }

  function forwardLead(id: number) {
    const owners = ["Amanda", "Vinicius", "Thaís", "Lorenzzo", "Vitor"];
    const next = owners[Math.floor(Math.random() * owners.length)];
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, responsavel: next } : l)));
    toast.success(`Lead encaminhado para ${next}`);
  }

  return (
    <DashboardLayout>
      <Toaster />
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Leads</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Visualize oportunidades comerciais, temperatura dos leads e próximas ações.
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] overflow-hidden">
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
                        <td className="px-4 py-3 text-muted-foreground">{l.ano}</td>
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

          <div className="rounded-2xl border border-border bg-gradient-to-br from-[var(--brand-blue-soft)] to-card p-6 shadow-[var(--shadow-soft)] h-fit">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Resumo da IA</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A IA identificou <span className="font-semibold text-foreground">14 leads quentes</span> e{" "}
              <span className="font-semibold text-foreground">3 oportunidades sem responsável</span>. Priorize contatos com maior score e clientes aguardando orçamento.
            </p>
          </div>
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
                <Info label="Ano" value={String(selected.ano)} />
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Marcar como em negociação
                </button>
                <button
                  onClick={() => forwardLead(selected.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Encaminhar para responsável
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

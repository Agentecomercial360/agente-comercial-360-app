import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Crown,
  Activity,
  Sparkles,
  Headphones,
  Users,
  MessageSquare,
  UserCog,
  BarChart3,
  LayoutDashboard,
  Plug,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Target,
  ClipboardCheck,
  Building2,
  TrendingUp,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { normalizeConversationStatus, type ConversationStatus } from "@/lib/conversation-status";

export const Route = createFileRoute("/gestao-360")({
  component: Gestao360Page,
  head: () => ({ meta: [{ title: "Gestão 360 | Agente Comercial 360" }] }),
});

type ConvRow = {
  id: string;
  channel: string | null;
  status: string | null;
  last_message_at: string | null;
  created_at: string | null;
  customers: { name: string | null } | { name: string | null }[] | null;
};

type LeadRow = {
  id: string;
  interest: string | null;
  score: number | null;
  estimated_value: number | null;
  next_action: string | null;
  customers: { name: string | null } | { name: string | null }[] | null;
};

type ResponsibleRow = {
  id: string;
  name: string | null;
  department: string | null;
  is_active: boolean | null;
};

const statusOrder: ConversationStatus[] = [
  "aberta",
  "em_andamento",
  "aguardando_cliente",
  "aguardando_empresa",
  "encaminhada",
  "sem_resposta",
  "finalizada",
];

const statusLabel: Record<ConversationStatus, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  aguardando_empresa: "Aguardando empresa",
  encaminhada: "Encaminhada",
  sem_resposta: "Sem resposta",
  finalizada: "Finalizada",
};

const statusAccent: Record<ConversationStatus, string> = {
  aberta: "from-blue-500 to-blue-600",
  em_andamento: "from-violet-500 to-violet-600",
  aguardando_cliente: "from-amber-500 to-amber-600",
  aguardando_empresa: "from-orange-500 to-orange-600",
  encaminhada: "from-indigo-500 to-indigo-600",
  sem_resposta: "from-rose-500 to-rose-600",
  finalizada: "from-emerald-500 to-emerald-600",
};

function pickCustomerName(c: ConvRow["customers"]): string {
  const obj = Array.isArray(c) ? c[0] : c;
  return obj?.name ?? "Cliente sem nome";
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const dys = Math.round(h / 24);
  return `há ${dys} d`;
}

function Gestao360Page() {
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string>("União Auto Peças");
  const [conversations, setConversations] = useState<ConvRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [responsibles, setResponsibles] = useState<ResponsibleRow[]>([]);
  const [whatsappConnected, setWhatsappConnected] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          if (!cancelled) setLoading(false);
          return;
        }
        const { data: cu } = await supabase
          .from("company_users")
          .select("company_id")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .maybeSingle();
        if (!cu?.company_id) {
          if (!cancelled) setLoading(false);
          return;
        }
        const companyId = cu.company_id as string;

        const [companyRes, convRes, leadsRes, respRes, waRes] = await Promise.all([
          supabase.from("companies").select("name").eq("id", companyId).maybeSingle(),
          supabase
            .from("conversations")
            .select(
              `id, channel, status, last_message_at, created_at, customer_id,
               customers ( name )`,
            )
            .eq("company_id", companyId)
            .order("last_message_at", { ascending: false, nullsFirst: false })
            .limit(200),
          supabase
            .from("leads")
            .select(
              `id, interest, score, estimated_value, next_action, customer_id,
               customers ( name )`,
            )
            .eq("company_id", companyId)
            .order("score", { ascending: false, nullsFirst: false })
            .limit(200),
          supabase
            .from("responsibles")
            .select("id, name, department, is_active")
            .eq("company_id", companyId),
          supabase
            .from("company_whatsapp_numbers")
            .select("connection_status, is_active")
            .eq("company_id", companyId)
            .eq("is_active", true)
            .limit(1)
            .maybeSingle(),
        ]);

        if (cancelled) return;
        if (companyRes.data?.name) setCompanyName(companyRes.data.name);
        setConversations((convRes.data as ConvRow[] | null) ?? []);
        setLeads((leadsRes.data as LeadRow[] | null) ?? []);
        setResponsibles((respRes.data as ResponsibleRow[] | null) ?? []);
        setWhatsappConnected(
          (waRes.data as { connection_status?: string } | null)?.connection_status === "connected",
        );
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const normConversations = useMemo(
    () =>
      conversations.map((c) => ({
        ...c,
        norm: normalizeConversationStatus(c.status) as ConversationStatus,
      })),
    [conversations],
  );

  const statusCounts = useMemo(() => {
    const m: Record<ConversationStatus, number> = {
      aberta: 0,
      em_andamento: 0,
      aguardando_cliente: 0,
      aguardando_empresa: 0,
      encaminhada: 0,
      sem_resposta: 0,
      finalizada: 0,
    };
    normConversations.forEach((c) => {
      m[c.norm] = (m[c.norm] ?? 0) + 1;
    });
    return m;
  }, [normConversations]);

  const atendimentosAbertos = statusCounts.aberta + statusCounts.em_andamento;
  const aguardandoResposta = statusCounts.aguardando_cliente + statusCounts.sem_resposta;
  const finalizados = statusCounts.finalizada;
  const leadsQuentes = leads.filter((l) => (l.score ?? 0) >= 80).length;
  const totalLeads = leads.length;
  const responsaveisAtivos = responsibles.filter((r) => r.is_active).length;

  const setores = useMemo(() => {
    const s = new Set<string>();
    responsibles.forEach((r) => {
      if (r.department) s.add(r.department.trim());
    });
    const normalized = Array.from(s).map((d) => {
      const lower = d.toLowerCase();
      const map: Record<string, string> = {
        financeiro: "Financeiro",
        administrativo: "Administrativo",
        vendas: "Vendas",
        gestão: "Gestão",
        gestao: "Gestão",
        comercial: "Comercial",
      };
      return map[lower] ?? d.charAt(0).toUpperCase() + d.slice(1);
    });
    return Array.from(new Set(normalized));
  }, [responsibles]);

  const topLeads = useMemo(
    () => [...leads].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 5),
    [leads],
  );

  const acaoNecessaria = useMemo(
    () =>
      normConversations
        .filter((c) =>
          (
            [
              "aberta",
              "em_andamento",
              "aguardando_cliente",
              "aguardando_empresa",
              "sem_resposta",
            ] as ConversationStatus[]
          ).includes(c.norm),
        )
        .slice(0, 6),
    [normConversations],
  );

  const prioridades = useMemo(() => {
    const list: { icon: typeof Flame; text: string; tone: string }[] = [];
    if (aguardandoResposta > 0)
      list.push({
        icon: AlertTriangle,
        text: "Clientes sem resposta devem ser retomados para evitar perda de venda.",
        tone: "from-rose-500 to-rose-600",
      });
    if (leadsQuentes > 0)
      list.push({
        icon: Flame,
        text: "Existem leads quentes com potencial de fechamento comercial.",
        tone: "from-amber-500 to-orange-600",
      });
    if (statusCounts.aguardando_cliente > 0)
      list.push({
        icon: Clock,
        text: "Acompanhar conversas paradas e definir próxima ação comercial.",
        tone: "from-blue-500 to-blue-600",
      });
    if (!whatsappConnected)
      list.push({
        icon: Plug,
        text: "WhatsApp Oficial ainda não conectado. A integração será necessária para operação em tempo real.",
        tone: "from-emerald-500 to-emerald-600",
      });
    if (list.length === 0)
      list.push({
        icon: CheckCircle2,
        text: "Operação estável. Nenhuma prioridade crítica no momento.",
        tone: "from-emerald-500 to-emerald-600",
      });
    return list;
  }, [aguardandoResposta, leadsQuentes, statusCounts.aguardando_cliente, whatsappConnected]);

  const totalStatus = statusOrder.reduce((acc, s) => acc + statusCounts[s], 0) || 1;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#070b1f] via-[#0b1a3a] to-[#062a2a] p-5 shadow-2xl shadow-blue-900/20">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-200 ring-1 ring-blue-400/40 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-pulse" />
                  Visão do gestor
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-white/20 backdrop-blur-sm">
                  Vendas e atendimento
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-white/20 backdrop-blur-sm">
                  IA gerencial
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Gestão 360
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-blue-100/85">
                Central executiva para o gestor acompanhar vendas, orçamentos, atendimentos, leads, clientes sem resposta e prioridades comerciais em tempo real.
              </p>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.07] p-3.5 shadow-xl shadow-black/30 backdrop-blur-xl lg:w-96">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-500/20 p-1.5 ring-1 ring-blue-400/30">
                    <Crown className="h-4 w-4 text-blue-200" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100/90">
                    Resumo executivo
                  </p>
                </div>
                <span className="text-[10px] font-medium text-blue-200/70">
                  {loading ? "Sincronizando…" : "Atualizado agora"}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                <HeroRow label="Atendimentos no painel" value={String(atendimentosAbertos)} />
                <HeroRow label="Leads quentes" value={String(leadsQuentes)} />
                <HeroRow label="Clientes sem resposta" value={String(aguardandoResposta)} />
                <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-2.5 py-1.5 ring-1 ring-white/10">
                  <span className="text-xs text-blue-100/80">Empresa</span>
                  <span className="text-xs font-semibold text-white">{companyName}</span>
                </div>
              </div>

              <p className="mt-2 text-[11px] leading-relaxed text-blue-100/70">
                Visão consolidada para decisões rápidas, acompanhamento comercial e controle da operação da empresa.
              </p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard icon={Headphones} label="Atendimentos em aberto" description="Ainda precisam de acompanhamento" value={atendimentosAbertos} accent="border-l-blue-500" iconCls="bg-blue-50 text-blue-600 ring-blue-100" />
          <KpiCard icon={Clock} label="Clientes aguardando retorno" description="Podem gerar perda comercial se parados" value={aguardandoResposta} accent="border-l-amber-500" iconCls="bg-amber-50 text-amber-600 ring-amber-100" />
          <KpiCard icon={Flame} label="Leads quentes" description="Maior chance de conversão" value={leadsQuentes} accent="border-l-orange-500" iconCls="bg-orange-50 text-orange-600 ring-orange-100" />
          <KpiCard icon={Target} label="Oportunidades" description="Negócios mapeados no funil comercial" value={totalLeads} accent="border-l-violet-500" iconCls="bg-violet-50 text-violet-600 ring-violet-100" />
          <KpiCard icon={UserCog} label="Responsáveis" description="Equipe ativa na operação" value={responsaveisAtivos} accent="border-l-indigo-500" iconCls="bg-indigo-50 text-indigo-600 ring-indigo-100" />
          <KpiCard icon={CheckCircle2} label="Atendimentos finalizados" description="Atendimentos concluídos" value={finalizados} accent="border-l-emerald-500" iconCls="bg-emerald-50 text-emerald-600 ring-emerald-100" />
        </div>

        {/* Prioridades + Recomendações IA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-50 p-2.5 ring-1 ring-rose-100">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Prioridades do gestor</h3>
                <p className="text-xs text-slate-500">Ações que exigem atenção da liderança comercial.</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5">
              {prioridades.map((p, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl bg-slate-50/70 px-3.5 py-3 ring-1 ring-slate-100">
                  <div className={`rounded-lg bg-gradient-to-br ${p.tone} p-2 shadow-sm`}>
                    <p.icon className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">{p.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6 shadow-sm">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 ring-1 ring-blue-100 shadow-sm">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Recomendações da IA</h3>
            </div>
            <p className="relative mt-4 text-sm leading-relaxed text-slate-700">
              A IA recomenda priorizar <strong>{leadsQuentes}</strong> leads quentes, acompanhar <strong>{aguardandoResposta}</strong> clientes sem resposta e revisar <strong>{atendimentosAbertos}</strong> atendimentos em andamento para evitar perda de oportunidades comerciais.
            </p>
          </div>
        </div>

        {/* Oportunidades + Atendimentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-50 p-2.5 ring-1 ring-orange-100">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Oportunidades prioritárias</h3>
                  <p className="text-xs text-slate-500">Leads com maior potencial de fechamento e necessidade de acompanhamento.</p>
                </div>
              </div>
              <Link to="/leads" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
                Ver leads <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="mt-5 space-y-2.5">
              {topLeads.length === 0 && (
                <li className="rounded-xl bg-slate-50/70 px-3.5 py-3 text-sm text-slate-500 ring-1 ring-slate-100">
                  Sem oportunidades cadastradas no momento.
                </li>
              )}
              {topLeads.map((l) => {
                const cust = Array.isArray(l.customers) ? l.customers[0] : l.customers;
                return (
                  <li key={l.id} className="rounded-xl bg-slate-50/70 px-3.5 py-3 ring-1 ring-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{cust?.name ?? "Cliente sem nome"}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{l.interest ?? "Interesse não informado"}</p>
                        {l.next_action && (
                          <p className="mt-1 truncate text-[11px] text-slate-500">Próxima ação comercial: {l.next_action}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-200">
                          <Flame className="h-3 w-3" /> {l.score ?? 0}
                        </span>
                        {typeof l.estimated_value === "number" && l.estimated_value > 0 && (
                          <span className="text-[11px] font-semibold text-slate-600">
                            R$ {l.estimated_value.toLocaleString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 ring-1 ring-blue-100">
                  <Headphones className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Atendimentos que precisam de ação</h3>
                  <p className="text-xs text-slate-500">Conversas que precisam de retorno, acompanhamento ou definição do responsável.</p>
                </div>
              </div>
              <Link to="/conversas" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
                Ver conversas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="mt-5 space-y-2.5">
              {acaoNecessaria.length === 0 && (
                <li className="rounded-xl bg-slate-50/70 px-3.5 py-3 text-sm text-slate-500 ring-1 ring-slate-100">
                  Nenhum atendimento exigindo ação no momento.
                </li>
              )}
              {acaoNecessaria.map((c) => (
                <li key={c.id} className="rounded-xl bg-slate-50/70 px-3.5 py-3 ring-1 ring-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{pickCustomerName(c.customers)}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Canal: <span className="font-medium text-slate-600">{c.channel ?? "—"}</span> · {formatRelative(c.last_message_at ?? c.created_at)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${statusAccent[c.norm]} px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm`}>
                      {statusLabel[c.norm]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Distribuição por status */}
        <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 ring-1 ring-violet-100">
              <Activity className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Distribuição por status</h3>
              <p className="text-xs text-slate-500">Visão consolidada das conversas por etapa operacional</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {statusOrder.map((s) => {
              const v = statusCounts[s];
              const pct = Math.round((v / totalStatus) * 100);
              return (
                <div key={s} className="rounded-xl bg-slate-50/70 px-4 py-3 ring-1 ring-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">{statusLabel[s]}</span>
                    <span className="text-xs font-bold text-slate-500">{v}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full bg-gradient-to-r ${statusAccent[s]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipe + WhatsApp */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 ring-1 ring-indigo-100">
                <UserCog className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Equipe e responsáveis</h3>
                <p className="text-xs text-slate-500">Visão da equipe ativa e setores envolvidos na operação.</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Responsáveis ativos" value={responsaveisAtivos} icon={UserCog} />
              <MiniStat label="Setores identificados" value={setores.length} icon={Building2} />
            </div>
            {setores.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {setores.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Distribuição por responsável será ampliada com a etapa de roteamento automático.
              </p>
            )}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 shadow-sm">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2.5 ring-1 ring-emerald-100 shadow-sm">
                  <Plug className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">WhatsApp Oficial</h3>
                  <p className="text-xs text-slate-500">Status da conexão oficial para recebimento, envio e rastreamento de mensagens comerciais.</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${whatsappConnected ? "bg-emerald-100 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${whatsappConnected ? "bg-emerald-500" : "bg-slate-400"}`} />
                {whatsappConnected ? "Conectado" : "Não conectado"}
              </span>
            </div>
            <div className="relative mt-4 space-y-1.5">
              <RowLine label="Status" value={whatsappConnected ? "Conectado" : "Não conectado"} />
              <RowLine label="Webhook" value={whatsappConnected ? "Ativo" : "Pendente"} />
              <RowLine label="Tipo" value="Meta Cloud API" />
            </div>
            <Link
              to="/whatsapp-oficial"
              className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
            >
              <Plug className="h-3.5 w-3.5" />
              Configurar WhatsApp Oficial
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Resumo próximo dia */}
        <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 ring-1 ring-amber-100">
              <ClipboardCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Resumo para o próximo dia</h3>
              <p className="text-xs text-slate-500">Checklist gerencial recomendado para iniciar a próxima operação com mais controle.</p>
            </div>
          </div>
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              "Revisar leads quentes",
              "Retornar clientes sem resposta",
              "Conferir atendimentos em andamento",
              "Validar responsáveis por setor",
              "Acompanhar integração do WhatsApp Oficial",
              "Emitir relatório gerencial",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 rounded-lg bg-slate-50/70 px-3 py-2.5 ring-1 ring-slate-100">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
                  <CheckCircle2 className="h-3 w-3 text-amber-600" />
                </span>
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navegação rápida */}
        <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 ring-1 ring-blue-100">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Navegação rápida</h3>
              <p className="text-xs text-slate-500">Acesso rápido às áreas operacionais do painel.</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <QuickNav to="/dashboard" label="Dashboard" icon={LayoutDashboard} />
            <QuickNav to="/leads" label="Leads" icon={Users} />
            <QuickNav to="/conversas" label="Conversas" icon={MessageSquare} />
            <QuickNav to="/atendimentos" label="Atendimentos" icon={Headphones} />
            <QuickNav to="/relatorios" label="Relatórios" icon={BarChart3} />
            <QuickNav to="/whatsapp-oficial" label="WhatsApp Oficial" icon={Plug} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function HeroRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-2.5 py-1.5 ring-1 ring-white/10">
      <span className="text-xs text-blue-100/80">{label}</span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  description,
  value,
  accent,
  iconCls,
}: {
  icon: typeof Flame;
  label: string;
  description?: string;
  value: number;
  accent: string;
  iconCls: string;
}) {
  return (
    <div className={`rounded-2xl border-l-4 ${accent} border-slate-200 bg-card p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`rounded-lg p-1.5 ring-1 ${iconCls}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      {description && <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{description}</p>}
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Flame }) {
  return (
    <div className="rounded-xl bg-slate-50/70 px-3.5 py-3 ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function RowLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/60 px-3 py-2 ring-1 ring-slate-100">
      <span className="text-xs text-slate-600">{label}</span>
      <span className="text-xs font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function QuickNav({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Flame }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
    >
      <div className="rounded-lg bg-blue-50 p-1.5 ring-1 ring-blue-100 group-hover:bg-blue-100">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <span className="truncate">{label}</span>
    </Link>
  );
}

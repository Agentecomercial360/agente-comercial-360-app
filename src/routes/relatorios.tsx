import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Target,
  Flame,
  UserX,
  Download,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";
import type { ConversationStatus } from "@/lib/conversation-status";
import { getConversationStatusLabel } from "@/lib/conversation-status";

const MOCK_BADGE =
  "ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200";

export const Route = createFileRoute("/relatorios")({
  component: RelatoriosPage,
  head: () => ({ meta: [{ title: "Relatórios | Agente Comercial 360" }] }),
});

type RelatoriosLoadStatus =
  | "loading"
  | "loaded"
  | "partial"
  | "unauthenticated"
  | "error";

function getPeriodRange(periodo: "Hoje" | "Ontem" | "Últimos 7 dias" | "Últimos 30 dias") {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (periodo === "Hoje") {
    start.setHours(0, 0, 0, 0);
  } else if (periodo === "Ontem") {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
  } else if (periodo === "Últimos 7 dias") {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
}

type PeriodoKey = "Hoje" | "Ontem" | "Últimos 7 dias" | "Últimos 30 dias";
const periodos: PeriodoKey[] = ["Hoje", "Ontem", "Últimos 7 dias", "Últimos 30 dias"];

type DadosPeriodo = {
  atendimentos: number;
  oportunidades: number;
  leadsQuentes: number;
  semResposta: number;
  novos: number;
  recorrentes: number;
  pendVendas: number;
  solAdm: number;
  pendFin: number;
  resumo: string;
  recomendacoes: string[];
  setores: { nome: string; valor: number; cor: string }[];
  leadsTemp: { nome: string; valor: number; cor: string; total: number }[];
  semana: { dia: string; valor: number }[];
  statusCounts?: Partial<Record<ConversationStatus, number>>;
};

const semanaBase = [
  { dia: "Seg", valor: 96 },
  { dia: "Ter", valor: 112 },
  { dia: "Qua", valor: 88 },
  { dia: "Qui", valor: 134 },
  { dia: "Sex", valor: 128 },
  { dia: "Sáb", valor: 64 },
  { dia: "Dom", valor: 32 },
];

const setoresCor = ["bg-blue-600", "bg-slate-700", "bg-emerald-600", "bg-amber-500"];

function buildSetores(total: number): DadosPeriodo["setores"] {
  return [
    { nome: "Vendas", valor: Math.round(total * 0.56), cor: setoresCor[0] },
    { nome: "Administrativo", valor: Math.round(total * 0.17), cor: setoresCor[1] },
    { nome: "Financeiro", valor: Math.round(total * 0.14), cor: setoresCor[2] },
    { nome: "Orçamentos", valor: Math.round(total * 0.13), cor: setoresCor[3] },
  ];
}

const dadosPorPeriodo: Record<PeriodoKey, DadosPeriodo> = {
  Hoje: {
    atendimentos: 128,
    oportunidades: 32,
    leadsQuentes: 14,
    semResposta: 9,
    novos: 41,
    recorrentes: 87,
    pendVendas: 6,
    solAdm: 11,
    pendFin: 6,
    resumo:
      "A operação apresentou alto volume de atendimentos comerciais hoje, com destaque para solicitações de orçamento e peças de reposição. A IA identificou 14 leads quentes e 9 clientes sem resposta.",
    recomendacoes: [
      "Priorizar os 14 leads quentes identificados hoje",
      "Retornar 9 clientes sem resposta",
      "Revisar pendências financeiras abertas",
      "Validar disponibilidade das peças mais solicitadas",
      "Acompanhar responsáveis com maior volume de atendimentos",
    ],
    setores: buildSetores(128),
    leadsTemp: [
      { nome: "Quentes", valor: 14, cor: "bg-red-500", total: 60 },
      { nome: "Mornos", valor: 21, cor: "bg-amber-500", total: 60 },
      { nome: "Frios", valor: 25, cor: "bg-blue-500", total: 60 },
    ],
    semana: semanaBase,
  },
  Ontem: {
    atendimentos: 96,
    oportunidades: 24,
    leadsQuentes: 10,
    semResposta: 7,
    novos: 28,
    recorrentes: 68,
    pendVendas: 5,
    solAdm: 8,
    pendFin: 4,
    resumo:
      "Ontem a operação manteve bom ritmo de atendimentos comerciais, com foco em orçamentos. A IA identificou 10 leads quentes e 7 clientes sem resposta.",
    recomendacoes: [
      "Priorizar os 10 leads quentes de ontem",
      "Retornar 7 clientes sem resposta",
      "Revisar pendências financeiras abertas",
      "Validar disponibilidade das peças mais solicitadas",
      "Acompanhar responsáveis com maior volume de atendimentos",
    ],
    setores: buildSetores(96),
    leadsTemp: [
      { nome: "Quentes", valor: 10, cor: "bg-red-500", total: 45 },
      { nome: "Mornos", valor: 16, cor: "bg-amber-500", total: 45 },
      { nome: "Frios", valor: 19, cor: "bg-blue-500", total: 45 },
    ],
    semana: semanaBase.map((d) => ({ ...d, valor: Math.round(d.valor * 0.75) })),
  },
  "Últimos 7 dias": {
    atendimentos: 742,
    oportunidades: 186,
    leadsQuentes: 71,
    semResposta: 34,
    novos: 219,
    recorrentes: 523,
    pendVendas: 28,
    solAdm: 52,
    pendFin: 22,
    resumo:
      "Nos últimos 7 dias, a operação manteve alto volume de atendimentos e oportunidades comerciais. A IA identificou 71 leads quentes e recomenda priorizar contatos com maior score.",
    recomendacoes: [
      "Priorizar os 71 leads quentes do período",
      "Retornar 34 clientes sem resposta",
      "Revisar pendências financeiras abertas",
      "Validar disponibilidade das peças mais solicitadas",
      "Acompanhar responsáveis com maior volume de atendimentos",
    ],
    setores: buildSetores(742),
    leadsTemp: [
      { nome: "Quentes", valor: 71, cor: "bg-red-500", total: 280 },
      { nome: "Mornos", valor: 98, cor: "bg-amber-500", total: 280 },
      { nome: "Frios", valor: 111, cor: "bg-blue-500", total: 280 },
    ],
    semana: semanaBase.map((d) => ({ ...d, valor: Math.round(d.valor * 0.85) })),
  },
  "Últimos 30 dias": {
    atendimentos: 3180,
    oportunidades: 824,
    leadsQuentes: 296,
    semResposta: 118,
    novos: 871,
    recorrentes: 2309,
    pendVendas: 112,
    solAdm: 214,
    pendFin: 96,
    resumo:
      "Nos últimos 30 dias, a operação registrou volume consistente de atendimentos e forte geração de oportunidades. A IA identificou 296 leads quentes e recomenda atuação imediata sobre os clientes sem resposta.",
    recomendacoes: [
      "Priorizar os 296 leads quentes do período",
      "Retornar 118 clientes sem resposta",
      "Revisar pendências financeiras abertas",
      "Validar disponibilidade das peças mais solicitadas",
      "Acompanhar responsáveis com maior volume de atendimentos",
    ],
    setores: buildSetores(3180),
    leadsTemp: [
      { nome: "Quentes", valor: 296, cor: "bg-red-500", total: 1100 },
      { nome: "Mornos", valor: 402, cor: "bg-amber-500", total: 1100 },
      { nome: "Frios", valor: 402, cor: "bg-blue-500", total: 1100 },
    ],
    semana: semanaBase.map((d) => ({ ...d, valor: Math.round(d.valor * 3.4) })),
  },
};

const pecas = [
  "Kit embreagem",
  "Pastilha de freio",
  "Bateria 60Ah",
  "Amortecedor dianteiro",
  "Alternador",
];

function csvEscape(v: string | number) {
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<PeriodoKey>("Hoje");
  const [loadingRelatorios, setLoadingRelatorios] = useState(true);
  const [relatoriosLoadStatus, setRelatoriosLoadStatus] =
    useState<RelatoriosLoadStatus>("loading");
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [dadosRelatorio, setDadosRelatorio] = useState<DadosPeriodo>(dadosPorPeriodo[periodo]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingRelatorios(true);
      setRelatoriosLoadStatus("loading");
      const base = dadosPorPeriodo[periodo];
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData?.user) {
          if (!cancelled) {
            setDadosRelatorio(base);
            setRelatoriosLoadStatus("unauthenticated");
            setLoadingRelatorios(false);
          }
          return;
        }
        const { data: cu } = await supabase
          .from("company_users")
          .select("company_id")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .maybeSingle();
        const companyId = (cu as { company_id?: string } | null)?.company_id;
        if (!companyId) {
          if (!cancelled) {
            setDadosRelatorio(base);
            setRelatoriosLoadStatus("error");
            setLoadingRelatorios(false);
          }
          return;
        }
        const { start, end } = getPeriodRange(periodo);
        const startISO = start.toISOString();
        const endISO = end.toISOString();

        // Helper para contagem de conversations por status canônico no período.
        const countConversationsByStatus = (
          status: ConversationStatus,
          dateColumn: "updated_at" | "created_at",
        ) =>
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .eq("status", status)
            .gte(dateColumn, startISO)
            .lte(dateColumn, endISO);

        const results = await Promise.allSettled([
          supabase.from("companies").select("name").eq("id", companyId).single(),
          // 1: atendimentos = conversations finalizadas no período (updated_at)
          countConversationsByStatus("finalizada", "updated_at"),
          // 2: oportunidades = leads criados no período
          supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .gte("created_at", startISO)
            .lte("created_at", endISO),
          // 3: leads quentes no período
          supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .gte("score", 80)
            .gte("created_at", startISO)
            .lte("created_at", endISO),
          // 4: novos clientes no período
          supabase
            .from("customers")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .gte("created_at", startISO)
            .lte("created_at", endISO),
          // 5: sem_resposta no período
          countConversationsByStatus("sem_resposta", "created_at"),
          // 6-10: status canônicos adicionais (created_at)
          countConversationsByStatus("aberta", "created_at"),
          countConversationsByStatus("em_andamento", "created_at"),
          countConversationsByStatus("aguardando_cliente", "created_at"),
          countConversationsByStatus("aguardando_empresa", "created_at"),
          countConversationsByStatus("encaminhada", "created_at"),
        ]);

        let failures = 0;
        const next: DadosPeriodo = { ...base };
        const statusCounts: Partial<Record<ConversationStatus, number>> = {};

        const readCount = (idx: number, fallback: number): number => {
          const r = results[idx];
          if (r.status === "fulfilled" && !r.value.error && typeof r.value.count === "number") {
            return r.value.count;
          }
          failures++;
          return fallback;
        };

        const r0 = results[0];
        if (r0.status === "fulfilled" && !r0.value.error) {
          const name = (r0.value.data as { name?: string } | null)?.name ?? null;
          if (!cancelled) setCompanyName(name);
        } else failures++;

        next.atendimentos = readCount(1, base.atendimentos);
        next.oportunidades = readCount(2, base.oportunidades);
        next.leadsQuentes = readCount(3, base.leadsQuentes);
        next.novos = readCount(4, base.novos);
        next.semResposta = readCount(5, base.semResposta);
        statusCounts.finalizada = next.atendimentos;
        statusCounts.sem_resposta = next.semResposta;
        statusCounts.aberta = readCount(6, 0);
        statusCounts.em_andamento = readCount(7, 0);
        statusCounts.aguardando_cliente = readCount(8, 0);
        statusCounts.aguardando_empresa = readCount(9, 0);
        statusCounts.encaminhada = readCount(10, 0);
        next.statusCounts = statusCounts;

        next.resumo =
          `No período selecionado (${periodo.toLowerCase()}), a operação teve ` +
          `${next.atendimentos} atendimento(s) finalizado(s), ` +
          `${next.oportunidades} oportunidade(s) gerada(s), ` +
          `${next.leadsQuentes} lead(s) quente(s) e ` +
          `${next.semResposta} cliente(s) sem resposta. ` +
          `Conversas em andamento: ${statusCounts.em_andamento ?? 0}; ` +
          `aguardando cliente: ${statusCounts.aguardando_cliente ?? 0}; ` +
          `aguardando empresa: ${statusCounts.aguardando_empresa ?? 0}; ` +
          `encaminhadas: ${statusCounts.encaminhada ?? 0}.`;

        if (!cancelled) {
          setDadosRelatorio(next);
          setRelatoriosLoadStatus(failures === 0 ? "loaded" : failures >= 6 ? "error" : "partial");
          setLoadingRelatorios(false);
        }
      } catch {
        if (!cancelled) {
          setDadosRelatorio(base);
          setRelatoriosLoadStatus("error");
          setLoadingRelatorios(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [periodo]);

  const d = dadosRelatorio;
  const cards = useMemo(
    () => [
      {
        label: periodo === "Hoje" || periodo === "Ontem" ? "Atendimentos do dia" : "Atendimentos do período",
        value: d.atendimentos,
        icon: Activity,
      },
      { label: "Oportunidades geradas", value: d.oportunidades, icon: Target },
      { label: "Leads quentes", value: d.leadsQuentes, icon: Flame },
      { label: "Clientes sem resposta", value: d.semResposta, icon: UserX },
    ],
    [periodo, d],
  );
  const maxSemana = Math.max(...d.semana.map((s) => s.valor));
  const totalSetores = d.setores.reduce((a, s) => a + s.valor, 0) || 1;

  const statusMessage =
    relatoriosLoadStatus === "loading"
      ? "Carregando relatórios do Supabase..."
      : relatoriosLoadStatus === "loaded"
        ? "Dados carregados do Supabase — Relatórios"
        : relatoriosLoadStatus === "partial"
          ? "Relatórios parcialmente carregados do Supabase"
          : relatoriosLoadStatus === "unauthenticated"
            ? "Usuário não autenticado. Usando dados locais temporários."
            : "Não foi possível carregar métricas reais. Usando dados locais temporários.";
  const statusTone =
    relatoriosLoadStatus === "loaded"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : relatoriosLoadStatus === "partial"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : relatoriosLoadStatus === "loading"
          ? "bg-slate-50 text-slate-600 border-slate-200"
          : "bg-rose-50 text-rose-700 border-rose-200";

  const handleExport = () => {
    try {
      const sc = d.statusCounts ?? {};
      const rows: (string | number)[][] = [
        ["Métrica", "Valor", "Origem"],
        ["Período", periodo, "Filtro"],
        ["Empresa", companyName ?? "(não identificada)", "Supabase"],
        ["Atendimentos finalizados", d.atendimentos, "Supabase (conversations.status=finalizada)"],
        ["Oportunidades (leads no período)", d.oportunidades, "Supabase (leads.created_at)"],
        ["Leads quentes (score>=80, no período)", d.leadsQuentes, "Supabase (leads)"],
        ["Novos clientes no período", d.novos, "Supabase (customers.created_at)"],
        ["Clientes sem resposta", d.semResposta, "Supabase (conversations.status=sem_resposta)"],
        ["Conversas abertas", sc.aberta ?? 0, "Supabase (conversations.status=aberta)"],
        ["Conversas em andamento", sc.em_andamento ?? 0, "Supabase (conversations.status=em_andamento)"],
        ["Aguardando cliente", sc.aguardando_cliente ?? 0, "Supabase (conversations.status=aguardando_cliente)"],
        ["Aguardando empresa", sc.aguardando_empresa ?? 0, "Supabase (conversations.status=aguardando_empresa)"],
        ["Encaminhadas", sc.encaminhada ?? 0, "Supabase (conversations.status=encaminhada)"],
        ["Resumo executivo", d.resumo, "Gerado a partir das métricas reais"],
      ];
      const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio-agente-comercial-360.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(
        "Relatório exportado com métricas reais. Blocos demonstrativos (setores, peças, pendências, recomendações) não estão no CSV.",
      );
    } catch {
      toast.error("Não foi possível exportar o relatório.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Relatórios</h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe indicadores, resumo executivo e recomendações da IA para a operação comercial.
          </p>
        </div>

        <div className={`rounded-lg border px-3 py-2 text-xs font-medium ${statusTone}`}>
          {statusMessage}
          {loadingRelatorios ? " (carregando...)" : ""}
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          As métricas principais (atendimentos finalizados, oportunidades, leads quentes, novos clientes, sem resposta) e a contagem por status canônico vêm do Supabase. Blocos marcados como <span className="font-semibold">Demonstrativo</span> ainda são dados de exemplo e serão substituídos em fases seguintes.
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Relatório Gerencial — {companyName ?? "sua empresa"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Resumo operacional gerado com base nos atendimentos, leads e conversas do período.
              </p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                Período selecionado: <span className="font-semibold">{periodo}</span>
              </p>
            </div>
            <button
              onClick={handleExport}
              title="A exportação inclui métricas reais parciais e alguns blocos temporários."
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Exportar relatório parcial
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {periodos.map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  periodo === p
                    ? "bg-slate-900 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
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
              <p className="mt-3 text-3xl font-bold text-slate-900">{c.value.toLocaleString("pt-BR")}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total de atendimentos</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{d.atendimentos.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-slate-500">atendimentos registrados</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <p className="text-sm font-semibold text-slate-700">Atendimentos por setor<span className={MOCK_BADGE}>Demonstrativo</span></p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {d.setores.map((s) => (
                <div key={s.nome} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{s.nome}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{s.valor}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Novos x recorrentes</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Novos clientes</span>
                <span className="font-bold text-slate-900">{d.novos}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Recorrentes<span className={MOCK_BADGE}>Demonstrativo</span></span>
                <span className="font-bold text-slate-900">{d.recorrentes}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Oportunidades de vendas</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{d.oportunidades}</p>
            <p className="text-xs text-slate-500">oportunidades comerciais identificadas</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Principais peças solicitadas<span className={MOCK_BADGE}>Demonstrativo</span></p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {pecas.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Leads quentes</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{d.leadsQuentes}</p>
            <p className="text-xs text-slate-500">classificados como quentes</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pendências de vendas<span className={MOCK_BADGE}>Demonstrativo</span></p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{d.pendVendas}</p>
            <p className="text-xs text-slate-500">clientes aguardando orçamento</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Solicitações administrativas<span className={MOCK_BADGE}>Demonstrativo</span></p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{d.solAdm}</p>
            <p className="text-xs text-slate-500">solicitações registradas</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pendências financeiras</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{d.pendFin}</p>
            <p className="text-xs text-slate-500">pendências de cobrança</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Clientes sem resposta</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{d.semResposta}</p>
            <p className="text-xs text-slate-500">aguardando retorno</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Atendimentos por setor</p>
            </div>
            <div className="mt-4 space-y-3">
              {d.setores.map((s) => {
                const pct = Math.round((s.valor / totalSetores) * 100);
                return (
                  <div key={s.nome}>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{s.nome}</span>
                      <span className="font-semibold">{s.valor} ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${s.cor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Leads por temperatura</p>
            </div>
            <div className="mt-4 space-y-3">
              {d.leadsTemp.map((l) => {
                const pct = Math.round((l.valor / l.total) * 100);
                return (
                  <div key={l.nome}>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{l.nome}</span>
                      <span className="font-semibold">{l.valor}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${l.cor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Atendimentos — 7 dias</p>
            </div>
            <div className="mt-4 flex h-32 items-end gap-2">
              {d.semana.map((s) => (
                <div key={s.dia} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-400"
                    style={{ height: `${(s.valor / maxSemana) * 100}%` }}
                    title={`${s.valor}`}
                  />
                  <span className="text-[10px] font-medium text-slate-500">{s.dia}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-slate-900 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-bold">Resumo executivo da IA</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-blue-50">{d.resumo}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Recomendações da IA</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {d.recomendacoes.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Observação</p>
              <p className="mt-1 text-sm text-amber-800">
                As métricas principais de atendimentos, oportunidades, leads quentes e clientes
                cadastrados já podem ser carregadas do Supabase. Nesta etapa, gráficos por setor,
                peças solicitadas, pendências, clientes sem resposta e resumo executivo avançado
                ainda usam dados temporários até a próxima fase.
              </p>

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

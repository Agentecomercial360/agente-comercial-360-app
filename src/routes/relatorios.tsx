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
  BarChart3,
  PieChart,
  Info,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";
import type { ConversationStatus } from "@/lib/conversation-status";
import { CONVERSATION_STATUSES, getConversationStatusLabel } from "@/lib/conversation-status";


// Mock badge removido — a página não exibe mais números demonstrativos
// como se fossem dados reais da operação.


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

// ============================================================
// MÉTRICAS REAIS — vindas exclusivamente do Supabase.
// Cards principais, resumo executivo e CSV usam apenas estes dados.
// ============================================================
type MetricasReais = {
  atendimentos: number;       // conversations.status = 'finalizada' no período (created_at)
  oportunidades: number;      // leads no período (created_at)
  leadsQuentes: number;       // leads score>=80 no período (created_at)
  novos: number;              // customers no período (created_at)
  semResposta: number;        // conversations.status = 'sem_resposta' no período (created_at)
  statusCounts: Record<ConversationStatus, number>;
  loadedKeys: Set<string>;    // métricas que carregaram com sucesso
};

const ZERO_STATUS_COUNTS: Record<ConversationStatus, number> = {
  aberta: 0,
  em_andamento: 0,
  aguardando_cliente: 0,
  aguardando_empresa: 0,
  encaminhada: 0,
  sem_resposta: 0,
  finalizada: 0,
};

const METRICAS_VAZIAS: MetricasReais = {
  atendimentos: 0,
  oportunidades: 0,
  leadsQuentes: 0,
  novos: 0,
  semResposta: 0,
  statusCounts: { ...ZERO_STATUS_COUNTS },
  loadedKeys: new Set<string>(),
};

// Blocos demonstrativos hardcoded foram REMOVIDOS. Toda a página agora
// trabalha exclusivamente com métricas reais do Supabase, filtradas por
// company_id e pelo período selecionado.


const PRINT_STYLES = `
@media print {
  @page {
    size: A4;
    margin: 12mm 12mm 16mm 12mm;
  }
  html, body {
    background: #ffffff !important;
    color: #0f172a !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif !important;
  }
  body * { visibility: hidden !important; }
  .relatorio-print-area, .relatorio-print-area * { visibility: visible !important; }
  .relatorio-print-area {
    position: absolute !important;
    inset: 0 !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
    color: #0f172a !important;
    box-shadow: none !important;
    font-size: 9pt !important;
    line-height: 1.35 !important;
  }
  /* Espaçamentos mais compactos entre blocos */
  .relatorio-print-area > * + * { margin-top: 8px !important; }
  .relatorio-print-area .space-y-6 > * + * { margin-top: 8px !important; }
  .relatorio-print-area .gap-4 { gap: 8px !important; }
  .relatorio-print-area .p-5, 
  .relatorio-print-area .p-6 { padding: 10px 12px !important; }
  .relatorio-print-area .mt-3 { margin-top: 6px !important; }
  .relatorio-print-area .mt-4 { margin-top: 8px !important; }

  .relatorio-print-area .rounded-2xl,
  .relatorio-print-area .rounded-xl,
  .relatorio-print-area .rounded-lg {
    box-shadow: none !important;
    background: #ffffff !important;
    color: #0f172a !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 6px !important;
    page-break-inside: avoid;
  }
  .relatorio-print-area h1 { font-size: 14pt !important; }
  .relatorio-print-area h2 { font-size: 12pt !important; }
  .relatorio-print-area h3 { font-size: 11pt !important; }
  .relatorio-print-area h1,
  .relatorio-print-area h2,
  .relatorio-print-area h3 {
    color: #0b2545 !important;
    letter-spacing: -0.01em !important;
    margin: 0 !important;
  }
  .relatorio-print-area .text-3xl { font-size: 16pt !important; }
  .relatorio-print-area .text-2xl { font-size: 13pt !important; }
  .relatorio-print-area .text-xl  { font-size: 11pt !important; }
  .relatorio-print-area .text-lg  { font-size: 10.5pt !important; }
  .relatorio-print-area .text-sm  { font-size: 8.5pt !important; }
  .relatorio-print-area .text-xs  { font-size: 7.5pt !important; }

  .relatorio-print-area .text-white,
  .relatorio-print-area .text-blue-50 { color: #0f172a !important; }
  .relatorio-print-area .text-blue-600,
  .relatorio-print-area .text-blue-700 { color: #1d4ed8 !important; }
  .relatorio-print-area .bg-gradient-to-br,
  .relatorio-print-area .bg-gradient-to-t,
  .relatorio-print-area .bg-gradient-to-r {
    background: #f8fafc !important;
    background-image: none !important;
    border-left: 3px solid #1d4ed8 !important;
  }
  .relatorio-print-area .ring-1 { box-shadow: none !important; }
  .relatorio-print-area .bg-white\\/10 {
    background: #eef2ff !important;
    color: #0b2545 !important;
  }
  .relatorio-print-area .shadow,
  .relatorio-print-area .shadow-sm,
  .relatorio-print-area .shadow-lg { box-shadow: none !important; }

  /* Cabeçalho institucional do PDF */
  .pdf-header {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 16px !important;
    padding-bottom: 8px !important;
    border-bottom: 2px solid #0b2545 !important;
    margin: 0 0 10px 0 !important;
  }
  .pdf-brand { display: flex !important; align-items: center !important; gap: 10px !important; }
  .pdf-brand-logo {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: 8px !important;
    background: #0b2545 !important;
    color: #ffffff !important;
    font-weight: 800 !important;
    font-size: 11pt !important;
    letter-spacing: 0.5px !important;
  }
  .pdf-brand-name {
    font-size: 12pt !important;
    font-weight: 700 !important;
    color: #0b2545 !important;
    line-height: 1.1 !important;
  }
  .pdf-brand-tag {
    font-size: 7.5pt !important;
    color: #475569 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.12em !important;
    margin-top: 2px !important;
  }
  .pdf-meta {
    text-align: right !important;
    font-size: 8pt !important;
    color: #334155 !important;
    line-height: 1.4 !important;
  }
  .pdf-meta strong { color: #0b2545 !important; }

  /* Rodapé fixo em cada página — texto único, sem grudar */
  .pdf-footer {
    position: fixed !important;
    bottom: 4mm !important;
    left: 12mm !important;
    right: 12mm !important;
    padding-top: 4px !important;
    border-top: 1px solid #cbd5e1 !important;
    font-size: 7.5pt !important;
    color: #64748b !important;
    text-align: center !important;
  }

  /* Blocos demonstrativos: visualmente discretos */
  .relatorio-print-area .demo-block {
    background: #fafafa !important;
    border: 1px dashed #cbd5e1 !important;
    color: #64748b !important;
    opacity: 0.85 !important;
  }
  .relatorio-print-area .demo-block * { color: #64748b !important; }
  .relatorio-print-area .demo-badge {
    background: transparent !important;
    border: 1px solid #cbd5e1 !important;
    color: #94a3b8 !important;
    font-size: 6.5pt !important;
  }

  .no-print, .no-print * { display: none !important; visibility: hidden !important; }
  .print-only { display: block !important; }

  /* Esconder overlays/badges do Lovable, se presentes */
  [data-lovable-overlay],
  [data-lovable-badge],
  #lovable-badge,
  iframe[src*="lovable"] { display: none !important; visibility: hidden !important; }
}
.print-only { display: none; }
`;

function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<PeriodoKey>("Hoje");
  const [loadingRelatorios, setLoadingRelatorios] = useState(true);
  const [relatoriosLoadStatus, setRelatoriosLoadStatus] =
    useState<RelatoriosLoadStatus>("loading");
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [metricas, setMetricas] = useState<MetricasReais>(METRICAS_VAZIAS);

  

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingRelatorios(true);
      setRelatoriosLoadStatus("loading");
      setMetricas(METRICAS_VAZIAS);
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData?.user) {
          if (!cancelled) {
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
            setRelatoriosLoadStatus("error");
            setLoadingRelatorios(false);
          }
          return;
        }
        const { start, end } = getPeriodRange(periodo);
        const startISO = start.toISOString();
        const endISO = end.toISOString();

        // conversations.created_at — sem updated_at (coluna não existe).
        const countConversationsByStatus = (status: ConversationStatus) =>
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .eq("status", status)
            .gte("created_at", startISO)
            .lte("created_at", endISO);

        const results = await Promise.allSettled([
          supabase.from("companies").select("name").eq("id", companyId).single(),
          countConversationsByStatus("finalizada"),
          supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .gte("created_at", startISO)
            .lte("created_at", endISO),
          supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .gte("score", 80)
            .gte("created_at", startISO)
            .lte("created_at", endISO),
          supabase
            .from("customers")
            .select("id", { count: "exact", head: true })
            .eq("company_id", companyId)
            .gte("created_at", startISO)
            .lte("created_at", endISO),
          countConversationsByStatus("sem_resposta"),
          countConversationsByStatus("aberta"),
          countConversationsByStatus("em_andamento"),
          countConversationsByStatus("aguardando_cliente"),
          countConversationsByStatus("aguardando_empresa"),
          countConversationsByStatus("encaminhada"),
        ]);

        const labels = [
          "companies",
          "finalizada",
          "oportunidades",
          "leadsQuentes",
          "novos",
          "sem_resposta",
          "aberta",
          "em_andamento",
          "aguardando_cliente",
          "aguardando_empresa",
          "encaminhada",
        ];

        let failures = 0;
        const loadedKeys = new Set<string>();
        const readCount = (idx: number): number => {
          const r = results[idx];
          if (r.status === "fulfilled" && !r.value.error && typeof r.value.count === "number") {
            loadedKeys.add(labels[idx]);
            return r.value.count;
          }
          failures++;
          if (r.status === "fulfilled" && r.value.error) {
            console.error(`[Relatórios] Falha em ${labels[idx]}:`, r.value.error.message);
          } else if (r.status === "rejected") {
            console.error(`[Relatórios] Falha em ${labels[idx]}:`, r.reason);
          }
          return 0;
        };

        const r0 = results[0];
        if (r0.status === "fulfilled" && !r0.value.error) {
          const name = (r0.value.data as { name?: string } | null)?.name ?? null;
          if (!cancelled) setCompanyName(name);
          loadedKeys.add("companies");
        } else {
          failures++;
          if (!cancelled) setCompanyName(null);
        }

        const statusCounts: Record<ConversationStatus, number> = { ...ZERO_STATUS_COUNTS };
        const atendimentos = readCount(1);
        const oportunidades = readCount(2);
        const leadsQuentes = readCount(3);
        const novos = readCount(4);
        const semResposta = readCount(5);
        statusCounts.finalizada = atendimentos;
        statusCounts.sem_resposta = semResposta;
        statusCounts.aberta = readCount(6);
        statusCounts.em_andamento = readCount(7);
        statusCounts.aguardando_cliente = readCount(8);
        statusCounts.aguardando_empresa = readCount(9);
        statusCounts.encaminhada = readCount(10);

        if (!cancelled) {
          setMetricas({
            atendimentos,
            oportunidades,
            leadsQuentes,
            novos,
            semResposta,
            statusCounts,
            loadedKeys,
          });
          setRelatoriosLoadStatus(failures === 0 ? "loaded" : failures >= 6 ? "error" : "partial");
          setLoadingRelatorios(false);
        }
      } catch (err) {
        console.error("[Relatórios] Erro inesperado:", err);
        if (!cancelled) {
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

  const m = metricas;

  // Resumo executivo: APENAS métricas reais. Nunca usa dadosPorPeriodo.
  const resumoExecutivo = useMemo(
    () =>
      `No período selecionado (${periodo.toLowerCase()}), a operação teve ` +
      `${m.atendimentos} atendimento(s) finalizado(s), ` +
      `${m.oportunidades} oportunidade(s) gerada(s), ` +
      `${m.leadsQuentes} lead(s) quente(s) e ` +
      `${m.semResposta} cliente(s) sem resposta. ` +
      `Conversas em andamento: ${m.statusCounts.em_andamento}; ` +
      `aguardando cliente: ${m.statusCounts.aguardando_cliente}; ` +
      `aguardando empresa: ${m.statusCounts.aguardando_empresa}; ` +
      `encaminhadas: ${m.statusCounts.encaminhada}.`,
    [periodo, m],
  );

  const cards = useMemo(
    () => [
      {
        label: periodo === "Hoje" || periodo === "Ontem" ? "Atendimentos do dia" : "Atendimentos do período",
        value: m.atendimentos,
        icon: Activity,
      },
      { label: "Oportunidades geradas", value: m.oportunidades, icon: Target },
      { label: "Leads quentes", value: m.leadsQuentes, icon: Flame },
      { label: "Clientes sem resposta", value: m.semResposta, icon: UserX },
    ],
    [periodo, m],
  );

  // Distribuição real dos atendimentos por status (a partir do Supabase).
  const statusBreakdown = useMemo(() => {
    const entries = CONVERSATION_STATUSES.map((s) => ({
      status: s,
      label: getConversationStatusLabel(s),
      value: m.statusCounts[s],
    }));
    const total = entries.reduce((a, e) => a + e.value, 0);
    return { entries, total };
  }, [m]);

  // Recomendações dinâmicas, coerentes com os números reais do período.
  const recomendacoes = useMemo<string[]>(() => {
    const list: string[] = [];
    if (m.leadsQuentes > 0) {
      list.push(`Priorizar contato com os ${m.leadsQuentes} lead(s) quente(s) do período.`);
    }
    if (m.semResposta > 0) {
      list.push(`Retornar os ${m.semResposta} cliente(s) sem resposta para evitar perda de oportunidade.`);
    }
    if (m.statusCounts.aguardando_empresa > 0) {
      list.push(`Há ${m.statusCounts.aguardando_empresa} conversa(s) aguardando ação da empresa — destravar atendimento.`);
    }
    if (m.statusCounts.em_andamento > 0) {
      list.push(`Acompanhar as ${m.statusCounts.em_andamento} conversa(s) em andamento até a finalização.`);
    }
    if (m.oportunidades > 0 && m.atendimentos > 0) {
      const taxa = Math.round((m.atendimentos / Math.max(m.oportunidades, 1)) * 100);
      list.push(`Taxa de finalização sobre oportunidades no período: ${taxa}%. Use como referência semanal.`);
    }
    if (list.length === 0) {
      list.push("Sem ações críticas no período selecionado. Operação estável.");
    }
    return list;
  }, [m]);


  const statusMessage =
    relatoriosLoadStatus === "loading"
      ? "Carregando relatórios do Supabase..."
      : relatoriosLoadStatus === "loaded"
        ? "Relatórios ativos. Os dados da operação estão organizados para análise gerencial e tomada de decisão."
        : relatoriosLoadStatus === "partial"
          ? "Relatórios parcialmente carregados — métricas com falha aparecem como 0"
          : relatoriosLoadStatus === "unauthenticated"
            ? "Usuário não autenticado. Faça login para visualizar métricas reais."
            : "Não foi possível carregar métricas reais. Cards exibidos como 0.";
  const statusTone =
    relatoriosLoadStatus === "loaded"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : relatoriosLoadStatus === "partial"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : relatoriosLoadStatus === "loading"
          ? "bg-slate-50 text-slate-600 border-slate-200"
          : "bg-rose-50 text-rose-700 border-rose-200";

  const handleExportPDF = () => {
    try {
      if (typeof window === "undefined" || typeof window.print !== "function") {
        toast.error("Seu navegador não suporta impressão. Tente abrir em outro navegador para gerar o PDF.");
        return;
      }
      const isReal = relatoriosLoadStatus === "loaded" || relatoriosLoadStatus === "partial";
      if (!isReal) {
        toast.warning("Sem métricas reais carregadas. Aguarde o carregamento ou faça login para gerar o PDF.");
        return;
      }
      toast.info("Abrindo janela de impressão. Escolha 'Salvar como PDF' no destino.");
      setTimeout(() => window.print(), 150);
    } catch {
      toast.error("Não foi possível abrir a janela de impressão.");
    }
  };

  const dataGeracao = useMemo(
    () =>
      new Date().toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    [periodo, m],
  );

  const totalLeadsHero = m.oportunidades;
  const totalAtendHero = m.atendimentos + m.semResposta + m.statusCounts.em_andamento + m.statusCounts.aberta + m.statusCounts.aguardando_cliente + m.statusCounts.aguardando_empresa + m.statusCounts.encaminhada;

  return (
    <DashboardLayout>
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
      <div className="space-y-6 relatorio-print-area">
        {/* HERO PREMIUM */}
        <div className="no-print relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 shadow-sm">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Relatórios ativos
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  Análise gerencial
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  <Sparkles className="h-3 w-3" />
                  IA aplicada
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Relatórios Gerenciais
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-blue-100/90">
                Acompanhe indicadores, desempenho e recomendações para tomada de decisão.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:w-80">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-100/80">
                  Resumo da operação
                </p>
                <span className="text-[10px] font-medium text-blue-200/70">
                  Atualizado agora
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Atendimentos</p>
                  <p className="mt-1 text-xl font-bold text-white">{totalAtendHero.toLocaleString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Leads</p>
                  <p className="mt-1 text-xl font-bold text-white">{totalLeadsHero.toLocaleString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Finalizados</p>
                  <p className="mt-1 text-xl font-bold text-white">{m.atendimentos.toLocaleString("pt-BR")}</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-blue-100/80">
                Visão consolidada do período selecionado, pronta para apresentação executiva.
              </p>
            </div>
          </div>
        </div>

        {/* Cabeçalho institucional do PDF */}
        <div className="print-only pdf-header">
          <div className="pdf-brand">
            <span className="pdf-brand-logo" aria-hidden>AC</span>
            <div>
              <div className="pdf-brand-name">Agente Comercial 360</div>
              <div className="pdf-brand-tag">Relatório Gerencial</div>
            </div>
          </div>
          <div className="pdf-meta">
            <div><strong>{companyName ?? "Empresa não identificada"}</strong></div>
            <div>Período: <strong>{periodo}</strong></div>
            <div>Gerado em: <strong>{dataGeracao}</strong></div>
          </div>
        </div>

        {/* Rodapé fixo do PDF */}
        <div className="print-only pdf-footer">
          Relatório gerado por Agente Comercial 360 • {dataGeracao}
        </div>

        {/* Mensagem profissional de status */}
        <div className={`no-print rounded-xl border px-4 py-2.5 text-xs font-medium ${statusTone}`}>
          {relatoriosLoadStatus === "loading"
            ? "Carregando indicadores..."
            : relatoriosLoadStatus === "unauthenticated"
              ? "Faça login para visualizar os indicadores da operação."
              : relatoriosLoadStatus === "error"
                ? "Não foi possível carregar os indicadores no momento."
                : "Relatórios ativos. Os dados da operação estão organizados para análise gerencial, acompanhamento de desempenho e tomada de decisão."}
        </div>

        {/* Barra de comando gerencial */}
        <div className="no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Relatório Gerencial — {companyName ?? "sua empresa"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Período selecionado: <span className="font-semibold text-slate-700">{periodo}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {periodos.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      periodo === p
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={handleExportPDF}
                title="Abre a janela de impressão do navegador. Escolha 'Salvar como PDF'."
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* KPIs principais */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow"
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

        {/* Gráficos gerenciais */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="demo-block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Atendimentos por setor<span className={MOCK_BADGE}>Modelo gerencial</span></p>
            </div>
            <div className="mt-4 space-y-3">
              {demo.setores.map((s) => {
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

          <div className="demo-block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Leads por temperatura<span className={MOCK_BADGE}>Modelo gerencial</span></p>
            </div>
            <div className="mt-4 space-y-3">
              {demo.leadsTemp.map((l) => {
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

          <div className="demo-block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Atendimentos — 7 dias<span className={MOCK_BADGE}>Modelo gerencial</span></p>
            </div>
            <div className="mt-4 flex h-32 items-end gap-2">
              {demo.semana.map((s) => (
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

        {/* Blocos detalhados */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Novos x recorrentes</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Novos clientes</span>
                <span className="font-bold text-slate-900">{m.novos}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Recorrentes<span className={MOCK_BADGE}>Modelo gerencial</span></span>
                <span className="font-bold text-slate-900">{demo.recorrentes}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Oportunidades de vendas</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{m.oportunidades}</p>
            <p className="text-xs text-slate-500">oportunidades comerciais identificadas</p>
          </div>

          <div className="demo-block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Principais peças solicitadas<span className={MOCK_BADGE}>Modelo gerencial</span></p>
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
            <p className="mt-2 text-2xl font-bold text-red-600">{m.leadsQuentes}</p>
            <p className="text-xs text-slate-500">classificados como quentes</p>
          </div>

          <div className="demo-block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pendências de vendas<span className={MOCK_BADGE}>Modelo gerencial</span></p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{demo.pendVendas}</p>
            <p className="text-xs text-slate-500">clientes aguardando orçamento</p>
          </div>

          <div className="demo-block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Solicitações administrativas<span className={MOCK_BADGE}>Modelo gerencial</span></p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{demo.solAdm}</p>
            <p className="text-xs text-slate-500">solicitações registradas</p>
          </div>

          <div className="demo-block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pendências financeiras<span className={MOCK_BADGE}>Modelo gerencial</span></p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{demo.pendFin}</p>
            <p className="text-xs text-slate-500">pendências de cobrança</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Clientes sem resposta</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{m.semResposta}</p>
            <p className="text-xs text-slate-500">aguardando retorno</p>
          </div>
        </div>

        {/* Resumo executivo + Recomendações IA */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-slate-900 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-bold">Resumo executivo</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-blue-50">{resumoExecutivo}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CONVERSATION_STATUSES.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-blue-50 ring-1 ring-white/20"
                >
                  {getConversationStatusLabel(s)}: {m.statusCounts[s]}
                </span>
              ))}
            </div>
          </div>

          <div className="demo-block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Recomendações da IA<span className={MOCK_BADGE}>Modelo gerencial</span></h3>
            </div>
            <ul className="mt-3 space-y-2">
              {demo.recomendacoes.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

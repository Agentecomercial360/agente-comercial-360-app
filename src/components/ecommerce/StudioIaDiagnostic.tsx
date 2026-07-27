import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BadgeCheck,
  Bot,
  CheckCircle2,
  Clock3,
  Coins,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  Lock,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { ECOMMERCE_COMPANY_ID, useEcommerceActiveAccount } from "@/lib/ecommerce-active-account";
import {
  getStudioIaDiagnosticPreview,
  StudioIaDiagnosticError,
  type DiagnosticItem,
  type StudioIaDiagnosticPreview,
} from "@/lib/studio-ia-diagnostic-preview";

const fmtInt = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("pt-BR");

function confidenceLabel(value: number | null): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  const pct = value >= 0 && value <= 1 ? value * 100 : value;
  return `${Math.round(Math.max(0, Math.min(pct, 100)))}% de confiança`;
}

const SEVERITY_STYLE: Record<string, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  critica: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  alta: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  media: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-slate-200 bg-slate-50 text-slate-600",
  baixa: "border-slate-200 bg-slate-50 text-slate-600",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

function severityClass(severity: string | null): string {
  const key = (severity ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return SEVERITY_STYLE[key] ?? "border-slate-200 bg-slate-50 text-slate-600";
}

function SafetyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning" | "positive";
}) {
  const toneCls =
    tone === "warning"
      ? "border-amber-200 bg-amber-50/60"
      : tone === "positive"
        ? "border-emerald-200 bg-emerald-50/50"
        : "border-slate-200 bg-white";
  return (
    <div className={`rounded-xl border p-4 ${toneCls}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function ItemList({
  title,
  icon,
  items,
  emptyLabel,
  accent,
  showAction,
}: {
  title: string;
  icon: React.ReactNode;
  items: DiagnosticItem[];
  emptyLabel: string;
  accent: string;
  showAction?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className={`rounded-lg p-2 ${accent}`}>{icon}</span>
        <h2 className="font-bold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-400">({items.length})</span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          {emptyLabel}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, i) => (
            <li key={`${item.title}-${i}`} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.severity && (
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${severityClass(item.severity)}`}
                    >
                      {item.severity}
                    </span>
                  )}
                  {confidenceLabel(item.confidence) && (
                    <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {confidenceLabel(item.confidence)}
                    </span>
                  )}
                  {item.requires_human_review && (
                    <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                      Revisão humana
                    </span>
                  )}
                </div>
              </div>
              {item.description && (
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              )}
              {item.recommendation && (
                <p className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-2.5 text-sm text-slate-700">
                  <strong className="text-emerald-700">Recomendação:</strong> {item.recommendation}
                </p>
              )}
              {showAction && (
                <button
                  type="button"
                  disabled
                  title="Criação de tarefas reais será liberada em uma próxima etapa."
                  className="mt-3 inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400"
                >
                  <Lock className="h-3.5 w-3.5" /> Criar tarefa (em breve)
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Chat consultivo (determinístico, sem IA externa)
// ---------------------------------------------------------------------------

type ChatMessage = { id: string; role: "assistant" | "user"; text: string };

type TopicKey =
  | "diagnostico"
  | "custos"
  | "ads"
  | "estoque"
  | "oportunidades"
  | "tarefas";

const QUICK_QUESTIONS = [
  "Qual o principal ponto de atenção?",
  "O que falta para calcular margem?",
  "Quais oportunidades existem?",
  "Quais tarefas o time deve priorizar?",
  "As fontes estão completas?",
] as const;

const TOPICS: {
  key: TopicKey;
  label: string;
  hint: string;
  icon: React.ReactNode;
  questions: string[];
}[] = [
  {
    key: "diagnostico",
    label: "Diagnóstico geral",
    hint: "Resumo da operação",
    icon: <Sparkles className="h-4 w-4" />,
    questions: [QUICK_QUESTIONS[0], QUICK_QUESTIONS[4], "Resumo do diagnóstico"],
  },
  {
    key: "custos",
    label: "Custos pendentes",
    hint: "Margem e lucro",
    icon: <Coins className="h-4 w-4" />,
    questions: [QUICK_QUESTIONS[1], "Situação dos custos"],
  },
  {
    key: "ads",
    label: "Ads e campanhas",
    hint: "Investimento e retorno",
    icon: <BadgeCheck className="h-4 w-4" />,
    questions: ["O que o diagnóstico diz sobre Ads?"],
  },
  {
    key: "estoque",
    label: "Estoque e ruptura",
    hint: "Disponibilidade",
    icon: <ListChecks className="h-4 w-4" />,
    questions: ["Há risco de ruptura de estoque?"],
  },
  {
    key: "oportunidades",
    label: "Produtos com oportunidade",
    hint: "Ganhos possíveis",
    icon: <Lightbulb className="h-4 w-4" />,
    questions: [QUICK_QUESTIONS[2]],
  },
  {
    key: "tarefas",
    label: "Tarefas sugeridas",
    hint: "Próximos passos",
    icon: <CheckCircle2 className="h-4 w-4" />,
    questions: [QUICK_QUESTIONS[3]],
  },
];

function describeItem(item: DiagnosticItem): string {
  const parts = [item.title];
  if (item.description) parts.push(item.description);
  if (item.recommendation) parts.push(`Recomendação: ${item.recommendation}`);
  return parts.join(" — ");
}

function matchItems(data: StudioIaDiagnosticPreview, words: string[]): DiagnosticItem[] {
  const all = [...data.attentionPoints, ...data.opportunities, ...data.suggestedTasks];
  return all.filter((i) => {
    const text = `${i.title} ${i.description ?? ""} ${i.recommendation ?? ""}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return words.some((w) => text.includes(w));
  });
}

function answerFor(question: string, data: StudioIaDiagnosticPreview): string {
  switch (question) {
    case QUICK_QUESTIONS[0]: {
      const first = data.attentionPoints[0];
      if (!first) return "Não há ponto de atenção crítico no diagnóstico atual.";
      return `Principal ponto de atenção${first.severity ? ` (${first.severity})` : ""}: ${describeItem(first)}`;
    }
    case QUICK_QUESTIONS[1]:
    case "Situação dos custos":
      return "Falta preencher e importar os custos reais dos produtos. Enquanto os custos estiverem pendentes, margem e lucro permanecem bloqueados.";
    case QUICK_QUESTIONS[2]: {
      if (data.opportunities.length === 0)
        return "Nenhuma oportunidade foi identificada no diagnóstico atual.";
      return `Identifiquei ${data.opportunities.length} oportunidade(s):\n${data.opportunities
        .slice(0, 5)
        .map((o, i) => `${i + 1}. ${describeItem(o)}`)
        .join("\n")}`;
    }
    case QUICK_QUESTIONS[3]: {
      if (data.suggestedTasks.length === 0)
        return "Nenhuma tarefa sugerida no diagnóstico atual.";
      return `Sugestões para o time avaliar (nenhuma tarefa foi criada no sistema):\n${data.suggestedTasks
        .slice(0, 5)
        .map((t, i) => `${i + 1}. ${describeItem(t)}`)
        .join("\n")}`;
    }
    case QUICK_QUESTIONS[4]: {
      const checked = data.summary.sources_checked ?? data.sourceStatus.length;
      const available =
        data.summary.sources_available ?? data.sourceStatus.filter((s) => s.available).length;
      const missing = data.sourceStatus.filter((s) => !s.available).map((s) => s.source);
      const base = `${available} de ${checked} fontes verificadas estão disponíveis.`;
      return missing.length === 0
        ? `${base} Todas as fontes do diagnóstico responderam com dados.`
        : `${base} Pendentes: ${missing.join(", ")}.`;
    }
    case "Resumo do diagnóstico":
      return `Pedidos analisados: ${fmtInt(data.summary.orders_checked)}. Receita pronta: ${fmtInt(
        data.summary.revenue_ready_orders,
      )} pedido(s). Pontos de atenção: ${data.attentionPoints.length}. Oportunidades: ${
        data.opportunities.length
      }. Tarefas sugeridas: ${data.suggestedTasks.length}.`;
    case "O que o diagnóstico diz sobre Ads?": {
      const hits = matchItems(data, ["ads", "campanha", "anuncio", "publicidade", "acos"]);
      return hits.length === 0
        ? "O diagnóstico atual não trouxe apontamentos específicos de Ads e campanhas. Com custos reais cadastrados, a leitura de retorno por campanha fica mais precisa."
        : hits
            .slice(0, 4)
            .map((h, i) => `${i + 1}. ${describeItem(h)}`)
            .join("\n");
    }
    case "Há risco de ruptura de estoque?": {
      const hits = matchItems(data, ["estoque", "ruptura", "reposicao", "sem estoque"]);
      return hits.length === 0
        ? "Nenhum alerta de estoque ou ruptura foi levantado neste diagnóstico."
        : hits
            .slice(0, 4)
            .map((h, i) => `${i + 1}. ${describeItem(h)}`)
            .join("\n");
    }
    default:
      return "Chat livre com IA ainda não está ativo nesta versão. Use as perguntas rápidas ou aguarde a próxima etapa com IA conectada.";
  }
}

function ContextRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning" | "positive";
}) {
  const valueCls =
    tone === "warning"
      ? "text-amber-700"
      : tone === "positive"
        ? "text-emerald-700"
        : "text-slate-900";
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-1.5 last:border-0">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <span className={`text-xs font-semibold ${valueCls}`}>{value}</span>
    </div>
  );
}

function ConsultiveChat({
  data,
  accountLabel,
}: {
  data: StudioIaDiagnosticPreview;
  accountLabel: string;
}) {
  const intro = useMemo<ChatMessage[]>(
    () => [
      {
        id: "intro",
        role: "assistant",
        text: `Diagnóstico carregado. Analisei os dados da operação ${accountLabel}. A receita está disponível, mas margem e lucro ainda aguardam os custos reais dos produtos.`,
      },
    ],
    [accountLabel],
  );
  const [messages, setMessages] = useState<ChatMessage[]>(intro);
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState<TopicKey>("diagnostico");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  const activeTopic = TOPICS.find((t) => t.key === topic) ?? TOPICS[0];

  const push = (question: string) => {
    const stamp = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: `u-${stamp}`, role: "user", text: question },
      { id: `a-${stamp}`, role: "assistant", text: answerFor(question, data) },
    ]);
  };

  const costsPending = data.summary.costs_pending === true;
  const sourcesChecked = data.summary.sources_checked ?? data.sourceStatus.length;
  const sourcesAvailable =
    data.summary.sources_available ?? data.sourceStatus.filter((s) => s.available).length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
          <Bot className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-slate-900">Chat Consultivo Studio IA</h2>
          <p className="mt-1 text-sm text-slate-500">
            Converse com o assistente estratégico usando o diagnóstico carregado. Nesta versão, o
            chat é somente leitura e não executa ações automáticas.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 lg:grid lg:grid-cols-[210px_minmax(0,1fr)_250px] lg:items-start">
        {/* Coluna esquerda — assuntos */}
        <aside className="order-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 lg:order-1">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Assuntos do Studio IA
          </p>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
            {TOPICS.map((t) => {
              const active = t.key === topic;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTopic(t.key)}
                  className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                    active
                      ? "border-blue-300 bg-white text-blue-700 shadow-sm"
                      : "border-transparent bg-white/60 text-slate-600 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <span
                    className={`shrink-0 rounded-md p-1.5 ${active ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {t.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold">{t.label}</span>
                    <span className="block truncate text-[10px] text-slate-400">{t.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Coluna central — conversa */}
        <div className="order-1 min-w-0 lg:order-2">
          <div className="flex items-center gap-2 rounded-t-xl border border-b-0 border-slate-200 bg-white px-3 py-2">
            <span className="rounded-md bg-blue-50 p-1.5 text-blue-700">{activeTopic.icon}</span>
            <span className="text-xs font-semibold text-slate-700">{activeTopic.label}</span>
            <span className="ml-auto text-[10px] font-medium text-slate-400">
              Contexto do chat
            </span>
          </div>

          <div className="h-80 space-y-3 overflow-y-auto border border-slate-200 bg-slate-50/60 p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <span className="mt-1 shrink-0 rounded-lg bg-blue-100 p-1.5 text-blue-700">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                )}
                <p
                  className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {m.text}
                </p>
                {m.role === "user" && (
                  <span className="mt-1 shrink-0 rounded-lg bg-slate-200 p-1.5 text-slate-600">
                    <User className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="rounded-b-xl border border-t-0 border-slate-200 bg-white p-3">
            <div className="flex flex-wrap gap-1.5">
              {activeTopic.questions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => push(q)}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              className="mt-3 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const value = input.trim();
                if (!value) return;
                push(value);
                setInput("");
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite uma pergunta (prévia consultiva)"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Send className="h-4 w-4" /> Enviar
              </button>
            </form>
            <p className="mt-2 text-[11px] text-slate-400">
              Prévia consultiva determinística: nenhuma mensagem é gravada e nenhuma IA externa é
              chamada.
            </p>
          </div>
        </div>

        {/* Coluna direita — contexto */}
        <aside className="order-3 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Contexto da operação
            </p>
            <div className="mt-2">
              <ContextRow label="Conta ativa" value={accountLabel} />
              <ContextRow label="Pedidos analisados" value={fmtInt(data.summary.orders_checked)} />
              <ContextRow
                label="Receita pronta"
                value={fmtInt(data.summary.revenue_ready_orders)}
                tone="positive"
              />
              <ContextRow
                label="Custos pendentes"
                value={costsPending ? "Sim" : data.summary.costs_pending === false ? "Não" : "—"}
                tone={costsPending ? "warning" : "default"}
              />
              <ContextRow
                label="Margem / lucro"
                value={
                  data.summary.profit_margin_available ? "Disponível" : "Aguardando custos"
                }
                tone={data.summary.profit_margin_available ? "positive" : "warning"}
              />
              <ContextRow
                label="Fontes verificadas"
                value={`${sourcesAvailable}/${sourcesChecked}`}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex flex-wrap gap-1.5">
              <SafetyBadge>
                <ShieldCheck className="h-3 w-3" /> Somente leitura
              </SafetyBadge>
              <SafetyBadge>
                <Lock className="h-3 w-3" /> IA externa não chamada
              </SafetyBadge>
              <SafetyBadge>
                <Clock3 className="h-3 w-3" /> Sem ações automáticas
              </SafetyBadge>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Próxima ação recomendada
            </p>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">
              Cadastrar custos reais dos produtos
            </p>
            <button
              type="button"
              disabled
              title="Criação de tarefas reais será liberada em uma próxima etapa."
              className="mt-3 inline-flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-400"
            >
              <Lock className="h-3.5 w-3.5" /> Criar tarefa em breve
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}


// ---------------------------------------------------------------------------
// Bloco principal
// ---------------------------------------------------------------------------

export function StudioIaDiagnosticSection() {
  const { activeAccountId, activeAccount, loading: accountsLoading } = useEcommerceActiveAccount();

  const query = useQuery<StudioIaDiagnosticPreview, Error>({
    queryKey: ["studio-ia-diagnostic-preview", ECOMMERCE_COMPANY_ID, activeAccountId],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getStudioIaDiagnosticPreview({
        companyId: ECOMMERCE_COMPANY_ID,
        accountId: activeAccountId as string,
        signal,
      }),
    enabled: !accountsLoading && Boolean(activeAccountId),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const data = query.data;
  const costsPending =
    data?.summary.costs_pending === true ||
    (data?.financialStatus.cost_status ?? "").toLowerCase() === "pending_real_costs";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Diagnóstico Studio IA v1</h2>
            <p className="mt-1 text-sm text-slate-500">
              Análise operacional somente leitura baseada nos dados sincronizados.
              {activeAccount
                ? ` Conta ativa: ${activeAccount.account_name || activeAccount.nickname || "Mercado Livre"}.`
                : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <SafetyBadge>
                <ShieldCheck className="h-3.5 w-3.5" /> Somente leitura
              </SafetyBadge>
              <SafetyBadge>
                <BadgeCheck className="h-3.5 w-3.5" /> IA externa não chamada
              </SafetyBadge>
              <SafetyBadge>
                <Lock className="h-3.5 w-3.5" /> Sem ações automáticas
              </SafetyBadge>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void query.refetch()}
            disabled={!activeAccountId || query.isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
            Atualizar diagnóstico
          </button>
        </div>

        <div className="mt-5" aria-live="polite">
          {accountsLoading && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Identificando a conta ativa...
            </div>
          )}

          {!accountsLoading && !activeAccountId && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Selecione uma conta Mercado Livre específica no topo da tela para carregar o
              diagnóstico.
            </div>
          )}

          {query.isPending && activeAccountId && !accountsLoading && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
                />
              ))}
            </div>
          )}

          {query.error && (
            <div
              className={`rounded-xl border p-4 text-sm ${
                query.error instanceof StudioIaDiagnosticError &&
                query.error.kind === "not_deployed"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
              role="status"
            >
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Não foi possível carregar o diagnóstico</p>
                  <p className="mt-1 opacity-90">{query.error.message}</p>
                  <p className="mt-2 text-xs">Nenhum dado foi alterado.</p>
                </div>
              </div>
            </div>
          )}

          {data && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Status do diagnóstico"
                  value={data.warnings.length > 0 ? "Com avisos" : "Concluído"}
                  hint={data.mode ?? "studio_ia_diagnostic_preview"}
                  tone={data.warnings.length > 0 ? "warning" : "positive"}
                />
                <MetricCard label="Pedidos analisados" value={fmtInt(data.summary.orders_checked)} />
                <MetricCard
                  label="Receita pronta"
                  value={fmtInt(data.summary.revenue_ready_orders)}
                  hint="pedidos com receita disponível"
                />
                <MetricCard
                  label="Custos pendentes"
                  value={data.summary.costs_pending === null ? "—" : costsPending ? "Sim" : "Não"}
                  tone={costsPending ? "warning" : "positive"}
                />
                <MetricCard
                  label="Margem/lucro disponível"
                  value={data.summary.profit_margin_available ? "Sim" : "Não"}
                  hint="Aguardando custos reais"
                  tone={data.summary.profit_margin_available ? "positive" : "warning"}
                />
                <MetricCard
                  label="Fontes verificadas"
                  value={`${fmtInt(data.summary.sources_available)} / ${fmtInt(data.summary.sources_checked)}`}
                />
                <MetricCard
                  label="Pontos de atenção"
                  value={fmtInt(data.summary.attention_points_count)}
                />
                <MetricCard
                  label="Oportunidades"
                  value={fmtInt(data.summary.opportunities_count)}
                />
                <MetricCard
                  label="Tarefas sugeridas"
                  value={fmtInt(data.summary.suggested_tasks_count)}
                />
              </div>

              <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-blue-800">
                As recomendações são uma prévia operacional. Qualquer ação futura deverá ser aprovada
                por um humano.
              </p>

              {data.warnings.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {data.warnings.map((w, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
                    >
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>

      {data && (
        <>
          {/* Status financeiro */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <Coins className="h-4 w-4" />
              </span>
              <h2 className="font-bold text-slate-900">Status financeiro</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Receita"
                value={data.financialStatus.revenue_status ?? "—"}
              />
              <MetricCard
                label="Custos"
                value={data.financialStatus.cost_status ?? "—"}
                tone={costsPending ? "warning" : "default"}
              />
              <MetricCard
                label="Margem / lucro"
                value={data.financialStatus.profit_margin_status ?? "—"}
                tone={data.summary.profit_margin_available ? "positive" : "warning"}
              />
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {data.financialStatus.message ??
                "Receita disponível, mas margem/lucro aguardam custos reais dos produtos."}
            </p>
            {costsPending && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong>Custos reais pendentes.</strong> A análise de margem e lucro será liberada
                  após a importação dos custos pelos operadores.
                </span>
              </div>
            )}
          </section>

          {/* Fontes do diagnóstico */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <h2 className="font-bold text-slate-900">Fontes do diagnóstico</h2>
              <span className="text-xs text-slate-400">({data.sourceStatus.length})</span>
            </div>
            {data.sourceStatus.length === 0 ? (
              <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                O diagnóstico não informou o estado das fontes.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.sourceStatus.map((s) => {
                  const badge =
                    s.available === false
                      ? { label: "Atenção", cls: "border-rose-200 bg-rose-50 text-rose-700" }
                      : (s.count ?? 0) === 0
                        ? { label: "Sem dados", cls: "border-slate-200 bg-slate-50 text-slate-600" }
                        : {
                            label: "Disponível",
                            cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
                          };
                  return (
                    <div key={s.source} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-slate-900">{s.source}</p>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-slate-900">{fmtInt(s.count)}</p>
                      <p className="text-[11px] text-slate-500">
                        {s.status ?? "registros encontrados"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <ItemList
            title="Pontos de atenção"
            icon={<AlertTriangle className="h-4 w-4" />}
            accent="bg-amber-50 text-amber-700"
            items={data.attentionPoints}
            emptyLabel="Não há ponto de atenção crítico no diagnóstico atual."
          />

          <ItemList
            title="Oportunidades"
            icon={<Lightbulb className="h-4 w-4" />}
            accent="bg-blue-50 text-blue-700"
            items={data.opportunities}
            emptyLabel="Nenhuma oportunidade identificada no diagnóstico atual."
          />

          <ItemList
            title="Tarefas sugeridas"
            icon={<ListChecks className="h-4 w-4" />}
            accent="bg-violet-50 text-violet-700"
            items={data.suggestedTasks}
            emptyLabel="Nenhuma tarefa sugerida no diagnóstico atual."
            showAction
          />

          <ConsultiveChat data={data} />
        </>
      )}
    </div>
  );
}

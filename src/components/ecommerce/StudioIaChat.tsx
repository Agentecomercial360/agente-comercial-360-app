import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Bot,
  CheckCircle2,
  Clock3,
  Coins,
  Eye,
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

const fmtInt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("pt-BR"));

type ChatMessage = { id: string; role: "assistant" | "user"; text: string };

type TopicKey = "diagnostico" | "custos" | "ads" | "estoque" | "oportunidades" | "tarefas";

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
      if (data.suggestedTasks.length === 0) return "Nenhuma tarefa sugerida no diagnóstico atual.";
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

function SafetyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      {children}
    </span>
  );
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
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : tone === "positive"
        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
        : "text-slate-900 bg-slate-50 border-slate-200/70";
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${valueCls}`}>
        {value}
      </span>
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
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[230px_minmax(0,1fr)_270px] lg:items-start">
      {/* Coluna esquerda — assuntos */}
      <aside className="order-2 rounded-[22px] border border-indigo-100/80 bg-gradient-to-b from-indigo-50/70 via-white to-white p-4 shadow-[0_18px_44px_-30px_rgba(49,46,129,0.55),0_1px_2px_rgba(15,23,42,0.03)] ring-1 ring-white/70 lg:order-1">
        <p className="px-0.5 pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600/90">
          Assuntos do Studio IA
        </p>
        <div className="grid gap-2.5 border-t border-indigo-100/70 pt-3 sm:grid-cols-2 lg:grid-cols-1">
          {TOPICS.map((t) => {
            const active = t.key === topic;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTopic(t.key)}
                className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200 ease-out ${
                  active
                    ? "border-indigo-300/80 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 text-indigo-800 shadow-[0_10px_24px_-14px_rgba(79,70,229,0.75)] ring-1 ring-indigo-200/60"
                    : "border-slate-200/70 bg-white/90 text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-indigo-200/80 hover:bg-white hover:shadow-[0_10px_22px_-16px_rgba(49,46,129,0.6)]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                    active
                      ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-indigo-500/35 ring-2 ring-white/70"
                      : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                  }`}
                >
                  {t.icon}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block truncate text-[13px] leading-tight ${active ? "font-bold" : "font-semibold"}`}
                  >
                    {t.label}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-[10px] leading-tight ${active ? "text-indigo-500/80" : "text-slate-400"}`}
                  >
                    {t.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>


      {/* Coluna central — conversa */}
      <div className="order-1 min-w-0 overflow-hidden rounded-[22px] border border-slate-200/70 bg-white/95 shadow-[0_24px_60px_-32px_rgba(49,46,129,0.45),0_2px_6px_-2px_rgba(15,23,42,0.06)] ring-1 ring-white/60 backdrop-blur-sm lg:order-2">
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600" />
        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-white via-sky-50/70 to-violet-50/60 px-4 py-3.5">
          <span className="rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 p-2.5 text-white shadow-md shadow-indigo-500/30 ring-1 ring-white/40">
            {activeTopic.icon}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold tracking-tight text-slate-900">
              {activeTopic.label}
            </span>
            <span className="block truncate text-[11px] font-medium text-slate-400">
              {activeTopic.hint}
            </span>
          </span>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.18)]" />
            Contexto do chat
          </span>
        </div>

        <div className="relative max-h-[24rem] min-h-[15rem] space-y-3.5 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(224,231,255,0.45),transparent_60%)] bg-slate-50/50 p-4 sm:p-5">
          <div className="pointer-events-none absolute inset-y-0 left-[30px] hidden w-px bg-gradient-to-b from-transparent via-slate-200/70 to-transparent sm:block" />


          {messages.map((m) => (
            <div
              key={m.id}
              className={`relative flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <span className="mt-0.5 shrink-0 self-start rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 p-2 text-white shadow-md shadow-indigo-500/30 ring-2 ring-white">
                  <Sparkles className="h-4 w-4" />
                </span>
              )}
              <p
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-md bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20"
                    : "rounded-bl-md border border-slate-200/70 bg-white text-slate-700 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.5)] ring-1 ring-white/70"
                }`}
              >
                {m.text}
              </p>
              {m.role === "user" && (
                <span className="mt-0.5 shrink-0 self-start rounded-xl bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <User className="h-4 w-4" />
                </span>
              )}

            </div>
          ))}

          {messages.length === 1 && (
            <div className="ml-0 rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/40 p-3.5 shadow-[0_10px_24px_-20px_rgba(49,46,129,0.6)] sm:ml-11">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-500/90">
                Resumo rápido do diagnóstico
              </p>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                <QuickStat
                  label="Receita"
                  value={
                    (data.summary.revenue_ready_orders ?? 0) > 0 ? "Disponível" : "Sem dados"
                  }
                  tone={(data.summary.revenue_ready_orders ?? 0) > 0 ? "positive" : "neutral"}
                />
                <QuickStat
                  label="Custos"
                  value={costsPending ? "Pendentes" : data.summary.costs_pending === false ? "Ok" : "—"}
                  tone={costsPending ? "warning" : "positive"}
                />
                <QuickStat
                  label="Margem / Lucro"
                  value={data.summary.profit_margin_available ? "Disponível" : "Aguardando custos"}
                  tone={data.summary.profit_margin_available ? "positive" : "warning"}
                />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/70 px-4 py-3.5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Sugestões rápidas

          </p>
          <div className="flex flex-wrap gap-2">
            {activeTopic.questions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => push(q)}
                className="rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-[11px] font-semibold text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-px hover:border-indigo-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-violet-50 hover:text-indigo-700 hover:shadow-[0_6px_16px_-10px_rgba(79,70,229,0.7)] active:translate-y-0"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            className="mt-3.5 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_6px_20px_-16px_rgba(15,23,42,0.55)] transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10"
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
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 transition hover:brightness-110 active:scale-[0.98]"
            >
              <Send className="h-4 w-4" /> Enviar
            </button>
          </form>

          <p className="mt-2.5 text-[11px] text-slate-400">
            Prévia consultiva determinística: nenhuma mensagem é gravada e nenhuma IA externa é
            chamada.
          </p>
        </div>
      </div>


      {/* Coluna direita — contexto */}
      <aside className="order-3 space-y-3.5">
        <div className="rounded-2xl border border-stone-200/80 bg-gradient-to-b from-white to-stone-50/80 p-4 shadow-[0_6px_20px_-16px_rgba(68,64,60,0.6)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
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
              value={data.summary.profit_margin_available ? "Disponível" : "Aguardando custos"}
              tone={data.summary.profit_margin_available ? "positive" : "warning"}
            />
            <ContextRow label="Fontes verificadas" value={`${sourcesAvailable}/${sourcesChecked}`} />
            <ContextRow label="Modo" value="Somente leitura" />
            <ContextRow label="IA externa" value="Não chamada" />
            <ContextRow label="Ações automáticas" value="Desligadas" />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50 to-amber-50/40 p-4 shadow-[0_6px_20px_-16px_rgba(180,83,9,0.6)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            Próxima ação recomendada
          </p>
          <p className="mt-1.5 text-sm font-semibold text-slate-900">
            Cadastrar custos reais dos produtos
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Sem os custos reais, a análise de margem e lucro permanece bloqueada.
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
  );
}

export function StudioIaChatSection() {
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

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-sky-50/80 via-white to-violet-50/70 p-5 shadow-[0_20px_60px_-40px_rgba(30,41,59,0.55)] sm:p-6">
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-sky-50 via-indigo-50/70 to-violet-50 p-5 shadow-[0_8px_24px_-16px_rgba(49,46,129,0.45)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-gradient-to-br from-blue-200/40 to-violet-200/40 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <span className="shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-3.5 text-white shadow-lg shadow-indigo-500/25">
              <Bot className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Chat Consultivo Studio IA
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                Converse com o assistente estratégico usando o diagnóstico já carregado da operação.
                Nesta versão, o chat é somente leitura e não executa ações automáticas.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <SafetyBadge>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Somente leitura
                </SafetyBadge>
                <SafetyBadge>
                  <BadgeCheck className="h-3.5 w-3.5 text-blue-600" /> IA externa não chamada
                </SafetyBadge>
                <SafetyBadge>
                  <Lock className="h-3.5 w-3.5 text-slate-500" /> Sem ações automáticas
                </SafetyBadge>
                <SafetyBadge>
                  <Eye className="h-3.5 w-3.5 text-violet-600" /> Prévia consultiva
                </SafetyBadge>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void query.refetch()}
            disabled={!activeAccountId || query.isFetching}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
            Atualizar diagnóstico
          </button>
        </div>
      </div>

      <div className="relative mt-5" aria-live="polite">
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
          <div className="grid gap-3 lg:grid-cols-[230px_minmax(0,1fr)_270px]">
            <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
            <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
            <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
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
          <ConsultiveChat
            data={data}
            accountLabel={
              activeAccount?.account_name || activeAccount?.nickname || "Mercado Livre - Nightled"
            }
          />
        )}
      </div>
    </section>
  );
}

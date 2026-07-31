import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BadgeCheck,
  Bot,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Coins,
  Copy,
  Database,
  Eye,
  Gauge,
  Lightbulb,
  ListChecks,
  ListPlus,
  LoaderCircle,
  Lock,
  Percent,
  Receipt,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { ECOMMERCE_COMPANY_ID, useEcommerceActiveAccount } from "@/lib/ecommerce-active-account";
import {
  getStudioIaDiagnosticPreview,
  StudioIaDiagnosticError,
  type DiagnosticItem,
  type StudioIaDiagnosticPreview,
} from "@/lib/studio-ia-diagnostic-preview";

const fmtInt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("pt-BR"));

type ChatMessage = { id: string; role: "assistant" | "user"; text: string; at?: number };

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const TOPIC_TONE: Record<string, { idle: string; active: string }> = {
  diagnostico: { idle: "bg-[#EAF0FF] text-[#1E5EFF]", active: "bg-[#1E5EFF] text-white" },
  custos: { idle: "bg-amber-100 text-amber-600", active: "bg-amber-500 text-white" },
  ads: { idle: "bg-violet-100 text-violet-600", active: "bg-violet-500 text-white" },
  estoque: { idle: "bg-sky-100 text-sky-600", active: "bg-sky-500 text-white" },
  oportunidades: { idle: "bg-emerald-100 text-emerald-600", active: "bg-emerald-500 text-white" },
  tarefas: { idle: "bg-slate-100 text-slate-500", active: "bg-[#0A1F44] text-white" },
};

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

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: "positive" | "warning" | "neutral";
}) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-white text-slate-500";
  const dotClass =
    tone === "positive" ? "bg-emerald-500" : tone === "warning" ? "bg-amber-500" : "bg-slate-300";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

type ContextTone = "default" | "warning" | "positive" | "info" | "violet" | "muted";

function ContextBlock({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: ContextTone;
}) {
  const toneMap: Record<ContextTone, { box: string; icon: string; value: string }> = {
    default: {
      box: "border-slate-200 bg-white",
      icon: "bg-slate-100 text-slate-500",
      value: "text-slate-900",
    },
    positive: {
      box: "border-emerald-200/70 bg-emerald-50/40",
      icon: "bg-emerald-100 text-emerald-600",
      value: "text-emerald-700",
    },
    warning: {
      box: "border-amber-200/70 bg-amber-50/40",
      icon: "bg-amber-100 text-amber-600",
      value: "text-amber-700",
    },
    info: {
      box: "border-sky-200/70 bg-sky-50/40",
      icon: "bg-sky-100 text-sky-600",
      value: "text-sky-700",
    },
    violet: {
      box: "border-violet-200/70 bg-violet-50/40",
      icon: "bg-violet-100 text-violet-600",
      value: "text-violet-700",
    },
    muted: {
      box: "border-slate-200 bg-slate-50/60",
      icon: "bg-slate-100 text-slate-400",
      value: "text-slate-500",
    },
  };
  const t = toneMap[tone];
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-3.5 shadow-[0_6px_18px_-16px_rgba(10,31,68,0.5)] ${t.box}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.icon}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        <span className={`mt-1 block truncate text-[15px] font-bold leading-tight ${t.value}`}>
          {value}
        </span>
      </span>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-3">
      <span className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4C87FF] to-[#1E5EFF] text-white ring-2 ring-white">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="inline-flex items-center gap-2 rounded-[20px] rounded-bl-lg border border-slate-200 bg-white px-5 py-4 text-[13px] font-medium text-slate-500 shadow-sm">
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1E5EFF]/60 [animation-delay:-0.2s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1E5EFF]/60 [animation-delay:-0.1s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1E5EFF]/60" />
        </span>
        Consultando dados do diagnóstico...
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
  const [thinking, setThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, thinking]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const activeTopic = TOPICS.find((t) => t.key === topic) ?? TOPICS[0];

  const push = (question: string) => {
    const stamp = Date.now();
    const answer = answerFor(question, data);
    setMessages((prev) => [...prev, { id: `u-${stamp}`, role: "user", text: question, at: stamp }]);
    setThinking(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        { id: `a-${stamp}`, role: "assistant", text: answer, at: Date.now() },
      ]);
    }, 420);
  };

  const copyLastAnswer = () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    void navigator.clipboard?.writeText(last.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const costsPending = data.summary.costs_pending === true;
  const sourcesChecked = data.summary.sources_checked ?? data.sourceStatus.length;
  const sourcesAvailable =
    data.summary.sources_available ?? data.sourceStatus.filter((s) => s.available).length;

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[264px_minmax(0,1fr)_312px] lg:gap-6 lg:items-start">
      {/* Coluna esquerda — assuntos */}
      <aside className="order-2 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(10,31,68,0.45)] lg:order-1">
        <p className="px-1 pb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Assuntos do Studio IA
        </p>
        <div className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-1">
          {TOPICS.map((t) => {
            const active = t.key === topic;
            const tone = TOPIC_TONE[t.key] ?? TOPIC_TONE.tarefas;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTopic(t.key)}
                aria-pressed={active}
                className={`group flex w-[240px] shrink-0 snap-start items-center gap-3.5 rounded-2xl border border-l-4 p-4 text-left transition-all duration-200 sm:w-full ${
                  active
                    ? "border-[#1E5EFF]/25 border-l-[#1E5EFF] bg-[#EAF0FF] text-[#0A1F44]"
                    : "border-slate-200 border-l-transparent bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                    active ? `${tone.active} shadow-sm` : tone.idle
                  }`}
                >
                  {t.icon}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block truncate text-[13.5px] leading-tight ${active ? "font-bold text-[#0A1F44]" : "font-semibold"}`}
                  >
                    {t.label}
                  </span>
                  <span
                    className={`mt-1 block truncate text-[11px] leading-tight ${active ? "text-[#1E5EFF]/80" : "text-slate-400"}`}
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
      <div className="order-1 flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(10,31,68,0.55)] lg:order-2">
        {/* Cabeçalho da conversa */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E5EFF] to-[#0A1F44] text-white shadow-md shadow-[#1E5EFF]/25">
            <Bot className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-[15px] font-bold tracking-tight text-[#0A1F44]">
                Chat Consultivo Studio IA
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Somente leitura
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
              {activeTopic.label} · {activeTopic.hint}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={copyLastAnswer}
              title="Copiar resposta"
              aria-label="Copiar resposta"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-[#1E5EFF]/30 hover:bg-[#EAF0FF] hover:text-[#1E5EFF]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setShowSources((v) => !v)}
              title="Ver fontes usadas nesta resposta"
              aria-label="Ver fontes usadas nesta resposta"
              aria-expanded={showSources}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                showSources
                  ? "border-[#1E5EFF]/30 bg-[#EAF0FF] text-[#1E5EFF]"
                  : "border-slate-200 bg-white text-slate-500 hover:border-[#1E5EFF]/30 hover:bg-[#EAF0FF] hover:text-[#1E5EFF]"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled
              title="Criar tarefa a partir desta resposta — em breve"
              aria-label="Criar tarefa a partir desta resposta — em breve"
              className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-50 text-slate-300"
            >
              <ListPlus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Sobre este modo / fontes */}
        <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2">
          <button
            type="button"
            onClick={() => setShowAbout((v) => !v)}
            aria-expanded={showAbout}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 transition hover:text-[#1E5EFF]"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Sobre este modo
            <ChevronDown className={`h-3 w-3 transition ${showAbout ? "rotate-180" : ""}`} />
          </button>
          {showAbout && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> Somente leitura
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                <BadgeCheck className="h-3 w-3 text-[#1E5EFF]" /> IA externa não chamada
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                <Lock className="h-3 w-3 text-slate-500" /> Sem ações automáticas
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                <Eye className="h-3 w-3 text-violet-600" /> Prévia consultiva
              </span>
            </div>
          )}
          {showSources && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.sourceStatus.map((s) => (
                <span
                  key={s.source}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    s.available
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${s.available ? "bg-emerald-500" : "bg-amber-500"}`}
                  />
                  {s.source}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Mensagens */}
        <div className="max-h-[26rem] min-h-[16rem] space-y-4 overflow-y-auto bg-slate-50/50 p-4 sm:p-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-end gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <span className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E5EFF] to-[#0A1F44] text-white ring-2 ring-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              )}
              <p
                className={`max-w-[85%] whitespace-pre-line px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-[20px] rounded-br-md bg-[#1E5EFF] text-white shadow-md shadow-[#1E5EFF]/20"
                    : "rounded-[20px] rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}

          {thinking && <TypingBubble />}

          {messages.length === 1 && !thinking && (
            <div className="ml-0 flex flex-wrap items-center gap-2 sm:ml-[42px]">
              <StatusChip
                label={
                  (data.summary.revenue_ready_orders ?? 0) > 0
                    ? "Receita disponível"
                    : "Receita sem dados"
                }
                tone={(data.summary.revenue_ready_orders ?? 0) > 0 ? "positive" : "neutral"}
              />
              <StatusChip
                label={
                  costsPending
                    ? "Custos pendentes"
                    : data.summary.costs_pending === false
                      ? "Custos completos"
                      : "Custos não confirmados"
                }
                tone={costsPending ? "warning" : data.summary.costs_pending === false ? "positive" : "neutral"}
              />
              <StatusChip
                label={
                  data.summary.profit_margin_available
                    ? "Margem disponível"
                    : "Margem aguardando custos"
                }
                tone={data.summary.profit_margin_available ? "positive" : "warning"}
              />
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-slate-100 bg-white px-4 py-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Sugestões
            </span>
            {activeTopic.questions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => push(q)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-[#1E5EFF]/30 hover:bg-[#EAF0FF] hover:text-[#1E5EFF]"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            className="mt-3 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 transition focus-within:border-[#1E5EFF]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1E5EFF]/10"
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
              className="min-w-0 flex-1 bg-transparent px-3.5 py-1.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#1E5EFF] to-[#0A1F44] px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-[#1E5EFF]/25 transition hover:brightness-110 active:scale-[0.98]"
            >
              <Send className="h-3.5 w-3.5" /> Enviar
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
        <details
          open
          className="group rounded-[22px] border border-slate-200 bg-white p-3.5 shadow-[0_10px_30px_-24px_rgba(10,31,68,0.45)] lg:[&>summary]:cursor-default"
        >
          <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E5EFF] to-[#0A1F44] text-white">
              <Gauge className="h-3.5 w-3.5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0A1F44]">
              Contexto da operação
            </p>
            <ChevronDown className="ml-auto h-3.5 w-3.5 text-slate-400 transition group-open:rotate-180 lg:hidden" />
          </summary>

          <p className="mt-3 border-t border-slate-100 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Dados da operação
          </p>
          <div className="mt-2 space-y-2">
            <ContextBlock icon={<Store className="h-3.5 w-3.5" />} label="Conta ativa" value={accountLabel} />
            <ContextBlock
              icon={<Receipt className="h-3.5 w-3.5" />}
              label="Pedidos analisados"
              value={fmtInt(data.summary.orders_checked)}
            />
            <ContextBlock
              icon={<Coins className="h-3.5 w-3.5" />}
              label="Receita pronta"
              value={fmtInt(data.summary.revenue_ready_orders)}
              tone="positive"
            />
            <ContextBlock
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              label="Custos pendentes"
              value={costsPending ? "Sim" : data.summary.costs_pending === false ? "Não" : "—"}
              tone={costsPending ? "warning" : "default"}
            />
            <ContextBlock
              icon={<Percent className="h-3.5 w-3.5" />}
              label="Margem / lucro"
              value={data.summary.profit_margin_available ? "Disponível" : "Aguardando custos"}
              tone={data.summary.profit_margin_available ? "positive" : "warning"}
            />
            <ContextBlock
              icon={<Boxes className="h-3.5 w-3.5" />}
              label="Fontes verificadas"
              value={`${sourcesAvailable}/${sourcesChecked}`}
              tone={sourcesAvailable >= sourcesChecked ? "positive" : "warning"}
            />
          </div>

          <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Segurança do modo atual
          </p>
          <div className="mt-2 space-y-2">
            <ContextBlock icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Modo" value="Somente leitura" tone="info" />
            <ContextBlock icon={<BadgeCheck className="h-3.5 w-3.5" />} label="IA externa" value="Não chamada" tone="violet" />
            <ContextBlock icon={<Lock className="h-3.5 w-3.5" />} label="Ações automáticas" value="Desligadas" tone="muted" />
          </div>
        </details>

        <div className="rounded-[22px] border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-4 shadow-[0_14px_34px_-28px_rgba(180,83,9,0.7)]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 ring-1 ring-amber-300/70">
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
              Próxima ação recomendada
            </p>
          </div>
          <p className="mt-2.5 text-sm font-bold text-[#0A1F44]">
            Cadastrar custos reais dos produtos
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Sem os custos reais, a análise de margem e lucro permanece bloqueada.
          </p>
          <button
            type="button"
            disabled
            title="Criação de tarefas reais será liberada em uma próxima etapa."
            className="mt-3.5 inline-flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700/80"
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
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(10,31,68,0.5)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E5EFF] to-[#0A1F44] text-white shadow-md shadow-[#1E5EFF]/25">
            <Bot className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-[#0A1F44] sm:text-2xl">
              Chat Consultivo Studio IA
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
              Converse com o assistente estratégico usando o diagnóstico já carregado da operação.
              Nesta versão, o chat é somente leitura e não executa ações automáticas.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void query.refetch()}
          disabled={!activeAccountId || query.isFetching}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1E5EFF] to-[#0A1F44] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#1E5EFF]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
          Atualizar diagnóstico
        </button>
      </div>

      <div className="relative mt-5" aria-live="polite">
        {accountsLoading && (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Identificando a conta ativa...
          </div>
        )}

        {!accountsLoading && !activeAccountId && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Selecione uma conta Mercado Livre específica no topo da tela para carregar o
            diagnóstico.
          </div>
        )}

        {query.isPending && activeAccountId && !accountsLoading && (
          <div className="grid gap-3 lg:grid-cols-[238px_minmax(0,1fr)_282px]">
            <div className="h-72 animate-pulse rounded-[22px] border border-slate-200 bg-slate-50" />
            <div className="h-72 animate-pulse rounded-[22px] border border-slate-200 bg-slate-50" />
            <div className="h-72 animate-pulse rounded-[22px] border border-slate-200 bg-slate-50" />
          </div>
        )}

        {query.error && (
          <div
            className={`rounded-2xl border p-4 text-sm ${
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

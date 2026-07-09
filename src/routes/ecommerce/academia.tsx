import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Users,
  Briefcase,
  UserCog,
  
  Circle,
  Target,
  Compass,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/ecommerce/academia")({
  component: AcademiaPage,
  head: () => ({
    meta: [
      { title: "Academia AC360 E-commerce | Agente Comercial 360" },
      {
        name: "description",
        content:
          "Central de treinamento para clientes, time interno e comercial aprenderem a usar o AC360 E-commerce.",
      },
    ],
  }),
});

// ---------------------------------------------------------------------------
// Conteúdo educacional (front-end estático — preparado para migrar para Supabase:
// ecommerce_learning_tracks / ecommerce_learning_lessons / ecommerce_learning_progress)
// ---------------------------------------------------------------------------

type LessonStatus = "not_started" | "in_progress" | "completed";

type Lesson = {
  id: string;
  title: string;
  description: string;
  summary: string;
  checklist: string[];
  estimatedMinutes: number;
};

type Track = {
  id: "cliente" | "time_interno" | "comercial";
  title: string;
  audience: string;
  description: string;
  icon: typeof Users;
  accent: string;
  lessons: Lesson[];
};

const TRACKS: Track[] = [
  {
    id: "cliente",
    title: "Cliente",
    audience: "Operadores e gestores da loja",
    description:
      "Para operadores e gestores entenderem como usar o sistema na rotina do Mercado Livre.",
    icon: Users,
    accent: "from-blue-600 to-blue-800",
    lessons: [
      {
        id: "cli-1",
        title: "Primeiros passos no AC360 E-commerce",
        description: "Visão geral do sistema, sidebar e conta ativa.",
        summary:
          "Nesta aula você conhece a estrutura do AC360 E-commerce: como navegar entre os módulos, selecionar a conta Mercado Livre ativa no topo e entender o que cada área entrega para a operação.",
        checklist: [
          "Fazer login e abrir /ecommerce/dashboard",
          "Selecionar a conta ativa no topo",
          "Explorar cada grupo do menu lateral",
        ],
        estimatedMinutes: 8,
      },
      {
        id: "cli-2",
        title: "Como entender as contas Mercado Livre",
        description: "Conexão, status e sincronização das contas.",
        summary:
          "Aprenda a conectar contas do Mercado Livre, identificar o status de conexão e acionar a sincronização inteligente sem alterar dados no ML.",
        checklist: [
          "Abrir /ecommerce/contas",
          "Identificar contas conectadas vs. aguardando",
          "Executar uma sincronização a partir do topo",
        ],
        estimatedMinutes: 10,
      },
      {
        id: "cli-3",
        title: "Como acompanhar produtos e anúncios",
        description: "Leitura da lista de produtos e sinais de atenção.",
        summary:
          "Como interpretar a tela de produtos: preço, estoque, status do anúncio e sinais que indicam risco de queda de vendas.",
        checklist: [
          "Abrir /ecommerce/produtos",
          "Filtrar por conta ativa",
          "Identificar 3 produtos com sinal de atenção",
        ],
        estimatedMinutes: 12,
      },
      {
        id: "cli-4",
        title: "Como interpretar a Central de Ações",
        description: "Priorização de tarefas com impacto real.",
        summary:
          "A Central de Ações mostra o que fazer primeiro. Nesta aula você entende como as ações são priorizadas e como decidir por onde começar.",
        checklist: [
          "Abrir /ecommerce/prioridades",
          "Ler o motivo de cada ação sugerida",
          "Escolher a próxima ação a executar",
        ],
        estimatedMinutes: 10,
      },
      {
        id: "cli-5",
        title: "Como usar o sistema na rotina diária e semanal",
        description: "Rituais operacionais recomendados.",
        summary:
          "Uma rotina simples: checagem diária no dashboard, revisão semanal do diagnóstico e fechamento de tarefas com resultado medido.",
        checklist: [
          "Definir horário fixo para checar o AC360",
          "Fechar pelo menos 1 tarefa por semana",
          "Registrar resultado em /ecommerce/resultados",
        ],
        estimatedMinutes: 9,
      },
    ],
  },
  {
    id: "time_interno",
    title: "Time Interno",
    audience: "Equipe AC360 de implantação e suporte",
    description:
      "Para equipe AC360 aprender implantação, validação, suporte e acompanhamento do cliente.",
    icon: UserCog,
    accent: "from-slate-700 to-slate-900",
    lessons: [
      {
        id: "int-1",
        title: "Como funciona o projeto AC360 E-commerce",
        description: "Visão de produto, módulos e responsabilidades.",
        summary:
          "Entenda o escopo do produto, o que cada módulo entrega e onde o time interno atua para garantir sucesso do cliente.",
        checklist: [
          "Mapear os módulos do e-commerce",
          "Identificar responsáveis internos",
          "Conhecer o fluxo de implantação",
        ],
        estimatedMinutes: 12,
      },
      {
        id: "int-2",
        title: "Como validar o sistema",
        description: "Checklist técnico e operacional de validação.",
        summary:
          "Passos para validar dados de contas, produtos, custos e ações antes de liberar o sistema para uso do cliente.",
        checklist: [
          "Validar contas conectadas",
          "Conferir sincronização de produtos",
          "Revisar Central de Ações",
        ],
        estimatedMinutes: 15,
      },
      {
        id: "int-3",
        title: "Como registrar melhorias",
        description: "Fluxo interno de feedback para produto.",
        summary:
          "Como transformar observações do dia a dia em melhorias organizadas para o time de produto.",
        checklist: [
          "Descrever a melhoria com contexto real",
          "Anexar tela ou exemplo",
          "Registrar no canal interno correto",
        ],
        estimatedMinutes: 8,
      },
      {
        id: "int-4",
        title: "Como acompanhar demandas do cliente",
        description: "Rituais de acompanhamento e SLA.",
        summary:
          "Como manter visibilidade das demandas do cliente e garantir resposta dentro do combinado.",
        checklist: [
          "Listar demandas abertas por cliente",
          "Definir próximo passo de cada uma",
          "Comunicar o cliente com clareza",
        ],
        estimatedMinutes: 10,
      },
      {
        id: "int-5",
        title: "Como transformar feedback em tarefa",
        description: "De um comentário solto para uma ação acionável.",
        summary:
          "Estrutura para transformar feedback qualitativo em tarefas objetivas dentro da operação.",
        checklist: [
          "Reformular feedback em ação clara",
          "Definir responsável e prazo",
          "Registrar em Tarefas da Operação",
        ],
        estimatedMinutes: 9,
      },
    ],
  },
  {
    id: "comercial",
    title: "Comercial",
    audience: "Time comercial e pré-vendas",
    description:
      "Para apresentar o valor do AC360 E-commerce de forma consultiva e estratégica.",
    icon: Briefcase,
    accent: "from-blue-800 to-indigo-900",
    lessons: [
      {
        id: "com-1",
        title: "Como explicar o valor do AC360 E-commerce",
        description: "Posicionamento em uma frase e narrativa curta.",
        summary:
          "Como comunicar o AC360 E-commerce em uma frase, e como sustentar essa frase com 3 provas objetivas.",
        checklist: [
          "Elaborar sua frase de posicionamento",
          "Listar 3 provas concretas",
          "Praticar em voz alta",
        ],
        estimatedMinutes: 10,
      },
      {
        id: "com-2",
        title: "Principais dores de quem vende no Mercado Livre",
        description: "Mapa de dores por perfil de operação.",
        summary:
          "Dores comuns: produto travado, anúncio sem giro, margem apertada, ausência de priorização. Como identificá-las na conversa.",
        checklist: [
          "Listar 5 dores mais frequentes",
          "Associar cada dor a um módulo do AC360",
          "Preparar perguntas de descoberta",
        ],
        estimatedMinutes: 12,
      },
      {
        id: "com-3",
        title: "Como apresentar o sistema em reunião",
        description: "Roteiro consultivo de demonstração.",
        summary:
          "Estrutura de uma demo consultiva: descoberta, mostrar módulo relevante, conectar com a dor, próximos passos.",
        checklist: [
          "Abrir com descoberta, não com telas",
          "Mostrar 2 telas máximo por dor",
          "Fechar com próximos passos claros",
        ],
        estimatedMinutes: 15,
      },
      {
        id: "com-4",
        title: "Como falar sobre produtos travados, anúncios, métricas e ações",
        description: "Linguagem consultiva por tema.",
        summary:
          "Como explicar cada área do sistema em linguagem de negócio, sem se perder em termos técnicos.",
        checklist: [
          "Explicar produtos travados em 30s",
          "Explicar Central de Ações em 30s",
          "Explicar resultados em 30s",
        ],
        estimatedMinutes: 12,
      },
      {
        id: "com-5",
        title: "Como conduzir uma conversa comercial consultiva",
        description: "Perguntas que geram conexão e valor.",
        summary:
          "Estrutura de perguntas para descobrir contexto real do cliente e conectar o AC360 ao problema certo.",
        checklist: [
          "Preparar 5 perguntas de descoberta",
          "Ouvir mais do que falar",
          "Fechar com um próximo passo",
        ],
        estimatedMinutes: 11,
      },
    ],
  },
];

const STORAGE_KEY = "ac360.academia.progress.v1";

function loadProgress(): Record<string, LessonStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function saveProgress(p: Record<string, LessonStatus>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

function AcademiaPage() {
  const [progress, setProgress] = useState<Record<string, LessonStatus>>({});
  const [openTrackId, setOpenTrackId] = useState<Track["id"] | null>(null);
  const [openLesson, setOpenLesson] = useState<{ trackId: Track["id"]; lessonId: string } | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const setLessonStatus = useCallback((lessonId: string, status: LessonStatus) => {
    setProgress((prev) => {
      const next = { ...prev, [lessonId]: status };
      saveProgress(next);
      return next;
    });
  }, []);

  const totals = useMemo(() => {
    const all = TRACKS.flatMap((t) => t.lessons);
    const completed = all.filter((l) => progress[l.id] === "completed").length;
    const total = all.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct };
  }, [progress]);

  const trackProgress = useCallback(
    (t: Track) => {
      const completed = t.lessons.filter((l) => progress[l.id] === "completed").length;
      const pct = t.lessons.length > 0 ? Math.round((completed / t.lessons.length) * 100) : 0;
      return { completed, total: t.lessons.length, pct };
    },
    [progress],
  );

  const nextLesson = useMemo(() => {
    for (const t of TRACKS) {
      for (const l of t.lessons) {
        const s = progress[l.id];
        if (s !== "completed") return { track: t, lesson: l };
      }
    }
    return null;
  }, [progress]);

  const openTrack = openTrackId ? TRACKS.find((t) => t.id === openTrackId) ?? null : null;
  const currentLesson =
    openLesson && openTrack
      ? openTrack.lessons.find((l) => l.id === openLesson.lessonId) ?? null
      : null;

  return (
    <EcommerceLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <section
          className="relative overflow-hidden rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-[var(--shadow-soft)]"
        >
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ background: "var(--gradient-brand)" }}
          />
          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  <Sparkles className="h-3 w-3" />
                  Implantação guiada
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md shrink-0"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                    Academia AC360 E-commerce
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Aprenda a usar o sistema, acompanhar métricas e transformar dados em decisões práticas.
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                Central de treinamento para clientes, time interno e comercial entenderem o AC360 E-commerce
                e aplicarem o sistema na rotina operacional.
              </p>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={Target}
            label="Progresso geral"
            value={`${totals.pct}%`}
            hint={`${totals.completed} de ${totals.total} aulas`}
            progress={totals.pct}
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Aulas concluídas"
            value={String(totals.completed)}
            hint={`de ${totals.total} disponíveis`}
          />
          <SummaryCard
            icon={BookOpen}
            label="Trilhas disponíveis"
            value={String(TRACKS.length)}
            hint="Cliente · Time · Comercial"
          />
          <SummaryCard
            icon={Compass}
            label="Próxima aula recomendada"
            value={nextLesson ? nextLesson.lesson.title : "Tudo concluído"}
            hint={nextLesson ? `Trilha ${nextLesson.track.title}` : "Parabéns pela evolução"}
            small
            action={
              nextLesson
                ? () => {
                    setOpenTrackId(nextLesson.track.id);
                    setOpenLesson({ trackId: nextLesson.track.id, lessonId: nextLesson.lesson.id });
                  }
                : undefined
            }
          />
        </section>

        {/* Tracks */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Trilhas de aprendizado</h2>
              <p className="text-sm text-muted-foreground">
                Escolha a trilha adequada ao seu papel para começar.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRACKS.map((t) => {
              const p = trackProgress(t);
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setOpenTrackId(t.id)}
                  className="group text-left rounded-2xl border border-border/60 bg-white p-5 shadow-[var(--shadow-soft)] hover:shadow-lg hover:border-blue-300 transition"
                >
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-white bg-gradient-to-br ${t.accent} shadow-md`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t.audience}
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mt-0.5">{t.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.description}</p>
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {p.completed}/{p.total} aulas
                      </span>
                      <span className="font-semibold text-foreground">{p.pct}%</span>
                    </div>
                    <ProgressBar pct={p.pct} />
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-blue-700 group-hover:gap-2.5 transition-all">
                    Ver aulas <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Explanatory sections */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            title="Como a Academia ajuda na implantação"
            body="A Academia AC360 E-commerce orienta clientes e equipe interna no uso correto do sistema. Cada trilha ensina como interpretar dados, executar ações, acompanhar resultados e transformar informações do Mercado Livre em decisões práticas."
          />
          <div className="rounded-2xl border border-border/60 bg-white p-5 md:p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-display text-base font-bold text-foreground">Para quem é esta área</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <Users className="h-4 w-4 mt-0.5 text-blue-700 shrink-0" />
                <span>
                  <strong className="text-foreground">Cliente:</strong> aprende a usar o sistema na operação diária.
                </span>
              </li>
              <li className="flex gap-2.5">
                <UserCog className="h-4 w-4 mt-0.5 text-blue-700 shrink-0" />
                <span>
                  <strong className="text-foreground">Time interno:</strong> aprende a validar dados, acompanhar demandas e dar suporte.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Briefcase className="h-4 w-4 mt-0.5 text-blue-700 shrink-0" />
                <span>
                  <strong className="text-foreground">Comercial:</strong> aprende a apresentar o valor do AC360 E-commerce em reuniões.
                </span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Track drawer */}
      <Sheet
        open={!!openTrack}
        onOpenChange={(o) => {
          if (!o) {
            setOpenTrackId(null);
            setOpenLesson(null);
          }
        }}
      >
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto p-0">
          {openTrack && !currentLesson && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white bg-gradient-to-br ${openTrack.accent} shadow-md`}
                  >
                    <openTrack.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <SheetTitle className="text-left">Trilha {openTrack.title}</SheetTitle>
                    <SheetDescription className="text-left">{openTrack.audience}</SheetDescription>
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar pct={trackProgress(openTrack).pct} />
                  <div className="mt-1.5 text-xs text-muted-foreground">
                    {trackProgress(openTrack).completed} de {openTrack.lessons.length} aulas concluídas
                  </div>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {openTrack.lessons.map((l, idx) => {
                  const status = progress[l.id] ?? "not_started";
                  return (
                    <button
                      key={l.id}
                      onClick={() => setOpenLesson({ trackId: openTrack.id, lessonId: l.id })}
                      className="w-full text-left rounded-xl border border-border/60 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 text-xs font-bold shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-foreground">{l.title}</h4>
                            <StatusBadge status={status} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{l.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {l.estimatedMinutes} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {openTrack && currentLesson && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-4 border-b">
                <button
                  onClick={() => setOpenLesson(null)}
                  className="text-xs font-semibold text-blue-700 hover:underline text-left mb-2 inline-flex items-center gap-1"
                >
                  ← Voltar para a trilha {openTrack.title}
                </button>
                <SheetTitle className="text-left">{currentLesson.title}</SheetTitle>
                <SheetDescription className="text-left">{currentLesson.description}</SheetDescription>
                <div className="flex items-center gap-3 mt-3">
                  <StatusBadge status={progress[currentLesson.id] ?? "not_started"} />
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {currentLesson.estimatedMinutes} min
                  </span>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Conteúdo
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">{currentLesson.summary}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Checklist
                  </h4>
                  <ul className="space-y-2">
                    {currentLesson.checklist.map((c, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-foreground">
                        <Circle className="h-4 w-4 mt-0.5 text-blue-700 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="border-t px-6 py-4 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setLessonStatus(currentLesson.id, "in_progress");
                    setOpenLesson(null);
                  }}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Continuar
                </Button>
                <Button
                  className="flex-1 text-white"
                  style={{ background: "var(--gradient-brand)" }}
                  onClick={() => {
                    setLessonStatus(currentLesson.id, "completed");
                    setOpenLesson(null);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como concluída
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </EcommerceLayout>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          background: "var(--gradient-brand)",
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: LessonStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Concluído
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
        <PlayCircle className="h-3 w-3" /> Em andamento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      <Circle className="h-3 w-3" /> Não iniciado
    </span>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
  progress,
  small,
  action,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  hint?: string;
  progress?: number;
  small?: boolean;
  action?: () => void;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div
        className={`mt-2 font-display font-bold text-foreground ${
          small ? "text-sm leading-snug line-clamp-2" : "text-2xl"
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground line-clamp-1">{hint}</div>}
      {typeof progress === "number" && (
        <div className="mt-3">
          <ProgressBar pct={progress} />
        </div>
      )}
    </>
  );
  if (action) {
    return (
      <button
        onClick={action}
        className="text-left rounded-2xl border border-border/60 bg-white p-4 shadow-[var(--shadow-soft)] hover:shadow-md hover:border-blue-300 transition"
      >
        {content}
      </button>
    );
  }
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-[var(--shadow-soft)]">
      {content}
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 md:p-6 shadow-[var(--shadow-soft)]">
      <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

// keep X import used to avoid tree-shake noise in editor
void X;

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
  BarChart3,
  Rocket,
  Brain,
  ClipboardCheck,
  LineChart,
  ShieldCheck,
  Layers,
  Lightbulb,
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
      { title: "Academia AC360 E-commerce | Central de Implantação e Treinamento" },
      {
        name: "description",
        content:
          "Central de implantação, treinamento e capacitação para clientes, time interno e comercial dominarem o AC360 E-commerce.",
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
  objective: string;
  content: string[];
  practice: string;
  checklist: string[];
  nextStep?: string;
  estimatedMinutes: number;
};

type Track = {
  id: "cliente" | "time_interno" | "comercial";
  title: string;
  audience: string;
  description: string;
  icon: typeof Users;
  accent: string;
  ring: string;
  tone: string;
  lessons: Lesson[];
};

const TRACKS: Track[] = [
  {
    id: "cliente",
    title: "Cliente",
    audience: "Operadores e gestores da loja",
    description:
      "Para quem opera a loja no dia a dia: como usar o AC360 E-commerce para tomar decisões com base em dados reais do Mercado Livre.",
    icon: Users,
    accent: "from-blue-600 to-blue-800",
    ring: "ring-blue-200",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
    lessons: [
      {
        id: "cli-1",
        title: "Primeiros passos no AC360 E-commerce",
        description: "Visão geral do sistema, sidebar e conta ativa.",
        summary:
          "Conheça a estrutura do AC360 E-commerce e como o sistema organiza a operação Mercado Livre em um painel único.",
        objective:
          "Ao final desta aula você saberá navegar pelo AC360 E-commerce, identificar a conta ativa e localizar as áreas críticas da operação.",
        content: [
          "O AC360 E-commerce organiza dados da operação Mercado Livre em um painel único, permitindo acompanhar contas, produtos, anúncios, custos, estoque, ações recomendadas e resultados.",
          "A sidebar é dividida por objetivo: Visão Executiva mostra o que precisa de atenção; Operação Mercado Livre concentra os dados brutos; Crescimento reúne anúncios e ads; Execução lista as tarefas do dia; Inteligência entrega diagnóstico e regras da operação.",
          "No topo da tela fica o seletor de conta ativa. Toda leitura do sistema respeita essa conta, garantindo que o operador enxergue apenas os dados relevantes daquela loja.",
          "O objetivo principal é ajudar o operador a entender o que precisa ser feito primeiro, com base em dados reais e não em achismo.",
        ],
        practice:
          "Abra o sistema, selecione a conta ativa e percorra o menu completo. Anote 3 áreas que fazem mais sentido para a sua operação hoje.",
        checklist: [
          "Identificar a conta ativa",
          "Entender o menu principal",
          "Localizar Central de Ações",
          "Entender Diagnóstico Inteligente",
          "Acompanhar Tarefas da Operação",
          "Visualizar Resultados das Ações",
        ],
        nextStep: "Como entender as contas Mercado Livre",
        estimatedMinutes: 8,
      },
      {
        id: "cli-2",
        title: "Como entender as contas Mercado Livre",
        description: "Conexão, status e sincronização das contas.",
        summary:
          "Aprenda a conectar contas do Mercado Livre, identificar o status e acionar a sincronização inteligente sem alterar nada no ML.",
        objective:
          "Ao final desta aula você saberá diferenciar contas conectadas de contas aguardando conexão e executar uma sincronização com segurança.",
        content: [
          "A tela de Contas Mercado Livre mostra todas as contas vinculadas à operação. Cada conta pode estar Conectada ou Aguardando conexão.",
          "A sincronização é sempre de leitura: o AC360 nunca altera anúncios, preços ou estoque no Mercado Livre. Todo dado exibido é reflexo do que já existe na conta.",
          "Sincronizar com frequência garante que produtos, custos e resultados estejam atualizados para as decisões do dia.",
        ],
        practice:
          "Selecione a conta ativa, revise o status e execute uma sincronização. Confirme que os produtos aparecem atualizados na sequência.",
        checklist: [
          "Abrir /ecommerce/contas",
          "Identificar contas conectadas vs. aguardando",
          "Executar uma sincronização a partir do topo",
        ],
        nextStep: "Como acompanhar produtos e anúncios",
        estimatedMinutes: 10,
      },
      {
        id: "cli-3",
        title: "Como acompanhar produtos e anúncios",
        description: "Leitura da lista de produtos e sinais de atenção.",
        summary:
          "Como interpretar a tela de produtos: preço, estoque, status do anúncio e sinais que indicam risco de queda de vendas.",
        objective:
          "Ao final desta aula você saberá identificar produtos com risco operacional e priorizar quais precisam de intervenção primeiro.",
        content: [
          "A tela de Produtos e Anúncios reúne cada anúncio da conta ativa com dados de preço, estoque e status.",
          "Produtos travados, sem giro ou com estoque crítico aparecem sinalizados para que o operador aja antes da perda de vendas.",
          "Combinar essa visão com a Central de Ações evita esforço em produtos que não geram impacto.",
        ],
        practice:
          "Filtre pela conta ativa, identifique 3 produtos com sinal de atenção e verifique se aparecem também em Central de Ações.",
        checklist: [
          "Abrir /ecommerce/produtos",
          "Filtrar por conta ativa",
          "Identificar 3 produtos com sinal de atenção",
        ],
        nextStep: "Como interpretar a Central de Ações",
        estimatedMinutes: 12,
      },
      {
        id: "cli-4",
        title: "Como interpretar a Central de Ações",
        description: "Priorização de tarefas com impacto real.",
        summary:
          "A Central de Ações mostra o que fazer primeiro, sempre com um motivo claro e impacto esperado.",
        objective:
          "Ao final desta aula você saberá ler o motivo de cada ação, entender a prioridade sugerida e escolher por onde começar.",
        content: [
          "Cada ação recomendada tem: contexto, motivo, impacto estimado e nível de esforço.",
          "A priorização considera dados reais da operação: giro, margem, estoque e risco de perda de posição.",
          "Executar 1 ação por vez, medindo o resultado, gera mais evolução do que abrir várias frentes sem fechamento.",
        ],
        practice:
          "Abra a Central de Ações, escolha a próxima ação a executar e explique em uma frase por que ela é a mais importante agora.",
        checklist: [
          "Abrir /ecommerce/prioridades",
          "Ler o motivo de cada ação sugerida",
          "Escolher a próxima ação a executar",
        ],
        nextStep: "Como usar o sistema na rotina diária e semanal",
        estimatedMinutes: 10,
      },
      {
        id: "cli-5",
        title: "Como usar o sistema na rotina diária e semanal",
        description: "Rituais operacionais recomendados.",
        summary:
          "Uma rotina simples: checagem diária no dashboard, revisão semanal do diagnóstico e fechamento de tarefas com resultado medido.",
        objective:
          "Ao final desta aula você terá um ritual claro para transformar o AC360 em rotina, não em consulta esporádica.",
        content: [
          "Rotina diária: checar dashboard, revisar Central de Ações, executar 1 tarefa.",
          "Rotina semanal: rodar Diagnóstico Inteligente, fechar tarefas concluídas em Resultados das Ações, planejar próxima semana.",
          "Sem ritual, o sistema vira relatório. Com ritual, vira operação.",
        ],
        practice:
          "Defina um horário fixo diário para o AC360, marque no calendário e comprometa-se a fechar pelo menos 1 tarefa por semana.",
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
      "Para a equipe AC360 dominar implantação, validação técnica, suporte consultivo e acompanhamento contínuo do cliente.",
    icon: UserCog,
    accent: "from-slate-700 to-slate-900",
    ring: "ring-slate-200",
    tone: "bg-slate-50 text-slate-700 border-slate-200",
    lessons: [
      {
        id: "int-1",
        title: "Como funciona o projeto AC360 E-commerce",
        description: "Visão de produto, módulos e responsabilidades.",
        summary:
          "Entenda o escopo do produto, o que cada módulo entrega e onde o time interno atua para garantir sucesso do cliente.",
        objective:
          "Ao final desta aula você saberá explicar o produto, os módulos e o papel do time interno em cada fase.",
        content: [
          "O AC360 E-commerce é a camada de inteligência operacional sobre o Mercado Livre.",
          "Cada módulo tem um objetivo claro: contas (conexão), produtos (leitura), central de ações (execução), resultados (medição), diagnóstico e regras (inteligência).",
          "O time interno atua principalmente em implantação, validação técnica, suporte e acompanhamento de sucesso.",
        ],
        practice:
          "Desenhe o mapa dos módulos e associe pelo menos 1 responsável interno para cada área da operação.",
        checklist: [
          "Mapear os módulos do e-commerce",
          "Identificar responsáveis internos",
          "Conhecer o fluxo de implantação",
        ],
        nextStep: "Como validar o sistema",
        estimatedMinutes: 12,
      },
      {
        id: "int-2",
        title: "Como validar o sistema",
        description: "Checklist técnico e operacional de validação.",
        summary:
          "Passos para validar dados de contas, produtos, custos e ações antes de liberar o sistema para uso do cliente.",
        objective:
          "Ao final desta aula você saberá executar um roteiro de validação repetível antes de qualquer entrega.",
        content: [
          "Validação começa por conta conectada e dados sincronizando.",
          "Depois: produtos com dados completos, custos preenchidos e Central de Ações gerando recomendações.",
          "Só entregue ao cliente quando o sistema já mostra valor prático na primeira sessão.",
        ],
        practice:
          "Execute o roteiro completo em uma conta de teste e documente qualquer inconsistência encontrada.",
        checklist: [
          "Validar contas conectadas",
          "Conferir sincronização de produtos",
          "Revisar Central de Ações",
        ],
        nextStep: "Como registrar melhorias",
        estimatedMinutes: 15,
      },
      {
        id: "int-3",
        title: "Como registrar melhorias",
        description: "Fluxo interno de feedback para produto.",
        summary:
          "Como transformar observações do dia a dia em melhorias organizadas para o time de produto.",
        objective:
          "Ao final desta aula você saberá estruturar melhorias que geram ação, não ruído.",
        content: [
          "Melhoria útil tem: contexto real, evidência (tela ou dado) e impacto esperado.",
          "Melhoria vaga trava o produto: descrições genéricas não viram evolução.",
          "Registre no canal correto para entrar no ciclo de produto.",
        ],
        practice:
          "Escolha 1 observação recente e reescreva no formato: contexto → evidência → impacto esperado.",
        checklist: [
          "Descrever a melhoria com contexto real",
          "Anexar tela ou exemplo",
          "Registrar no canal interno correto",
        ],
        nextStep: "Como acompanhar demandas do cliente",
        estimatedMinutes: 8,
      },
      {
        id: "int-4",
        title: "Como acompanhar demandas do cliente",
        description: "Rituais de acompanhamento e SLA.",
        summary:
          "Como manter visibilidade das demandas do cliente e garantir resposta dentro do combinado.",
        objective:
          "Ao final desta aula você saberá manter uma cadência de acompanhamento previsível e transparente.",
        content: [
          "Cliente sem retorno vira cliente insatisfeito, mesmo com o problema em análise.",
          "Cada demanda deve ter status, próximo passo e responsável visíveis.",
          "Comunicação clara reduz retrabalho e escalonamento.",
        ],
        practice:
          "Liste as demandas abertas por cliente e defina o próximo passo de cada uma para as próximas 48h.",
        checklist: [
          "Listar demandas abertas por cliente",
          "Definir próximo passo de cada uma",
          "Comunicar o cliente com clareza",
        ],
        nextStep: "Como transformar feedback em tarefa",
        estimatedMinutes: 10,
      },
      {
        id: "int-5",
        title: "Como transformar feedback em tarefa",
        description: "De um comentário solto para uma ação acionável.",
        summary:
          "Estrutura para transformar feedback qualitativo em tarefas objetivas dentro da operação.",
        objective:
          "Ao final desta aula você saberá converter feedback em tarefas com responsável, prazo e critério de pronto.",
        content: [
          "Feedback vira tarefa quando tem verbo de ação, responsável e resultado esperado.",
          "Sem estrutura, feedback vira lista de desejos que ninguém executa.",
          "Registrar em Tarefas da Operação garante que a ação entre na rotina.",
        ],
        practice:
          "Pegue 1 feedback recente e transforme em tarefa com verbo, responsável, prazo e critério de pronto.",
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
      "Para apresentar o valor do AC360 E-commerce de forma consultiva, conectando dores reais do Mercado Livre a soluções concretas.",
    icon: Briefcase,
    accent: "from-blue-800 to-indigo-900",
    ring: "ring-indigo-200",
    tone: "bg-indigo-50 text-indigo-700 border-indigo-200",
    lessons: [
      {
        id: "com-1",
        title: "Como explicar o valor do AC360 E-commerce",
        description: "Posicionamento em uma frase e narrativa curta.",
        summary:
          "Como comunicar o AC360 E-commerce em uma frase, e como sustentar essa frase com 3 provas objetivas.",
        objective:
          "Ao final desta aula você terá uma frase de posicionamento própria e 3 provas para sustentar.",
        content: [
          "Uma frase forte responde: para quem, o que resolve, por que agora.",
          "Provas são exemplos concretos: dado, resultado, história de cliente.",
          "Narrativa curta ganha reunião; discurso longo perde atenção.",
        ],
        practice:
          "Escreva sua frase de posicionamento e pratique em voz alta 3 vezes até soar natural.",
        checklist: [
          "Elaborar sua frase de posicionamento",
          "Listar 3 provas concretas",
          "Praticar em voz alta",
        ],
        nextStep: "Principais dores de quem vende no Mercado Livre",
        estimatedMinutes: 10,
      },
      {
        id: "com-2",
        title: "Principais dores de quem vende no Mercado Livre",
        description: "Mapa de dores por perfil de operação.",
        summary:
          "Dores comuns: produto travado, anúncio sem giro, margem apertada, ausência de priorização. Como identificá-las na conversa.",
        objective:
          "Ao final desta aula você saberá associar dores reais a módulos específicos do AC360.",
        content: [
          "Cada dor tem sinal na conversa: reclamação, indicador, comportamento.",
          "Associar dor a módulo evita demo genérica.",
          "Perguntas de descoberta bem feitas fazem o cliente enxergar a dor antes da solução.",
        ],
        practice:
          "Liste 5 dores frequentes e associe cada uma ao módulo do AC360 que responde.",
        checklist: [
          "Listar 5 dores mais frequentes",
          "Associar cada dor a um módulo do AC360",
          "Preparar perguntas de descoberta",
        ],
        nextStep: "Como apresentar o sistema em reunião",
        estimatedMinutes: 12,
      },
      {
        id: "com-3",
        title: "Como apresentar o sistema em reunião",
        description: "Roteiro consultivo de demonstração.",
        summary:
          "Estrutura de uma demo consultiva: descoberta, mostrar módulo relevante, conectar com a dor, próximos passos.",
        objective:
          "Ao final desta aula você terá um roteiro consultivo replicável para reuniões.",
        content: [
          "Abra com descoberta, não com telas.",
          "Mostre no máximo 2 telas por dor mapeada.",
          "Feche sempre com próximos passos claros e prazo.",
        ],
        practice:
          "Simule uma demo com um colega usando o roteiro: descoberta → 2 telas → próximos passos.",
        checklist: [
          "Abrir com descoberta, não com telas",
          "Mostrar 2 telas máximo por dor",
          "Fechar com próximos passos claros",
        ],
        nextStep: "Como falar sobre produtos travados, anúncios, métricas e ações",
        estimatedMinutes: 15,
      },
      {
        id: "com-4",
        title: "Como falar sobre produtos travados, anúncios, métricas e ações",
        description: "Linguagem consultiva por tema.",
        summary:
          "Como explicar cada área do sistema em linguagem de negócio, sem se perder em termos técnicos.",
        objective:
          "Ao final desta aula você saberá explicar cada área em 30 segundos, com foco em impacto.",
        content: [
          "Produtos travados: dinheiro parado que pode virar giro.",
          "Central de Ações: fim do achismo, foco no que gera resultado.",
          "Resultados das Ações: prova de que a operação evoluiu.",
        ],
        practice:
          "Grave-se explicando cada área em 30 segundos e revise a clareza.",
        checklist: [
          "Explicar produtos travados em 30s",
          "Explicar Central de Ações em 30s",
          "Explicar resultados em 30s",
        ],
        nextStep: "Como conduzir uma conversa comercial consultiva",
        estimatedMinutes: 12,
      },
      {
        id: "com-5",
        title: "Como conduzir uma conversa comercial consultiva",
        description: "Perguntas que geram conexão e valor.",
        summary:
          "Estrutura de perguntas para descobrir contexto real do cliente e conectar o AC360 ao problema certo.",
        objective:
          "Ao final desta aula você terá 5 perguntas de descoberta que funcionam em qualquer reunião.",
        content: [
          "Pergunta boa abre; pergunta fraca pede sim/não.",
          "Ouvir mais do que falar é técnica comercial, não gentileza.",
          "Um próximo passo combinado vale mais que uma promessa vaga.",
        ],
        practice:
          "Escreva 5 perguntas de descoberta e teste em uma reunião real.",
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

const JOURNEY = [
  {
    icon: Brain,
    title: "Aprender o sistema",
    description: "Dominar módulos, sidebar e conta ativa.",
  },
  {
    icon: BarChart3,
    title: "Interpretar dados",
    description: "Ler produtos, custos, estoque e diagnóstico.",
  },
  {
    icon: ClipboardCheck,
    title: "Executar ações",
    description: "Fechar tarefas prioritárias com foco em impacto.",
  },
  {
    icon: LineChart,
    title: "Medir resultados",
    description: "Registrar ganho, receita e evolução da operação.",
  },
  {
    icon: Rocket,
    title: "Evoluir operação",
    description: "Padronizar rituais e escalar o que funciona.",
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
    const totalMinutes = all.reduce((acc, l) => acc + l.estimatedMinutes, 0);
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct, totalMinutes };
  }, [progress]);

  const trackProgress = useCallback(
    (t: Track) => {
      const completed = t.lessons.filter((l) => progress[l.id] === "completed").length;
      const pct = t.lessons.length > 0 ? Math.round((completed / t.lessons.length) * 100) : 0;
      const minutes = t.lessons.reduce((acc, l) => acc + l.estimatedMinutes, 0);
      let status: "not_started" | "in_progress" | "completed" = "not_started";
      if (completed === t.lessons.length) status = "completed";
      else if (completed > 0 || t.lessons.some((l) => progress[l.id] === "in_progress"))
        status = "in_progress";
      return { completed, total: t.lessons.length, pct, minutes, status };
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

  const openLessonFrom = (trackId: Track["id"], lessonId: string) => {
    setOpenTrackId(trackId);
    setOpenLesson({ trackId, lessonId });
  };

  const nextLessonAfter = useMemo(() => {
    if (!currentLesson || !openTrack) return null;
    if (currentLesson.nextStep) {
      const t = openTrack.lessons.find((l) => l.title === currentLesson.nextStep);
      if (t) return { track: openTrack, lesson: t };
    }
    const idx = openTrack.lessons.findIndex((l) => l.id === currentLesson.id);
    const nxt = openTrack.lessons[idx + 1];
    if (nxt) return { track: openTrack, lesson: nxt };
    return null;
  }, [currentLesson, openTrack]);

  return (
    <EcommerceLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* ============================ HEADER ============================ */}
        <section
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-white p-6 md:p-10 shadow-[var(--shadow-premium)]"
        >
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ background: "var(--gradient-brand)" }}
          />
          <div
            className="absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "var(--gradient-brand)" }}
          />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <HeaderBadge icon={Sparkles} label="Implantação guiada" />
                <HeaderBadge icon={GraduationCap} label="Treinamento operacional" />
                <HeaderBadge icon={LineChart} label="Progresso acompanhado" />
              </div>
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl text-white shadow-lg shrink-0"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <GraduationCap className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                    Academia AC360 E-commerce
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed">
                    Central de implantação, treinamento e capacitação para clientes, time interno
                    e comercial dominarem o AC360 E-commerce.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:w-[280px] shrink-0 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                Seu progresso
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-foreground">{totals.pct}%</span>
                <span className="text-xs text-muted-foreground">
                  {totals.completed}/{totals.total} aulas
                </span>
              </div>
              <div className="mt-3">
                <ProgressBar pct={totals.pct} />
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                {TRACKS.length} trilhas · {totals.totalMinutes} min de conteúdo
              </div>
            </div>
          </div>
        </section>

        {/* ============================ JORNADA ============================ */}
        <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                Método AC360
              </div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mt-0.5">
                Jornada de implantação
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Cinco etapas que estruturam como o operador evolui do primeiro acesso à operação madura.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {JOURNEY.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative rounded-xl border border-border/60 bg-gradient-to-b from-white to-blue-50/40 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Etapa {i + 1}
                    </span>
                  </div>
                  <div className="font-display text-sm font-bold text-foreground">{step.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {step.description}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================ SUMMARY CARDS ============================ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={Target}
            label="Progresso geral"
            value={`${totals.pct}%`}
            hint={`${totals.completed} de ${totals.total} aulas concluídas`}
            micro="Evolução total nas 3 trilhas."
            progress={totals.pct}
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Aulas concluídas"
            value={String(totals.completed)}
            hint={`de ${totals.total} disponíveis`}
            micro="Aulas marcadas como concluídas."
          />
          <SummaryCard
            icon={BookOpen}
            label="Trilhas disponíveis"
            value={String(TRACKS.length)}
            hint="Cliente · Time · Comercial"
            micro="Trilhas oficiais de formação."
          />
          <SummaryCard
            icon={Compass}
            label="Próxima aula recomendada"
            value={nextLesson ? nextLesson.lesson.title : "Tudo concluído"}
            hint={nextLesson ? `Trilha ${nextLesson.track.title}` : "Parabéns pela evolução"}
            micro={nextLesson ? "Continue de onde parou." : "Nenhuma aula pendente."}
            small
            action={
              nextLesson
                ? () => openLessonFrom(nextLesson.track.id, nextLesson.lesson.id)
                : undefined
            }
          />
        </section>

        {/* ============================ RECOMENDADA ============================ */}
        {nextLesson && (
          <section
            className="relative overflow-hidden rounded-2xl border border-blue-200 p-6 md:p-7 shadow-[var(--shadow-soft)]"
            style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 60%)" }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-700 px-2.5 py-1 text-[11px] font-semibold text-white">
                    <Lightbulb className="h-3 w-3" />
                    Trilha recomendada para começar
                  </span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mt-3">
                  {nextLesson.lesson.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
                  {nextLesson.lesson.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-blue-700" />
                    Trilha {nextLesson.track.title}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-700" />
                    {nextLesson.lesson.estimatedMinutes} min estimados
                  </span>
                </div>
              </div>
              <Button
                onClick={() => openLessonFrom(nextLesson.track.id, nextLesson.lesson.id)}
                className="text-white shadow-md shrink-0"
                style={{ background: "var(--gradient-brand)" }}
              >
                Continuar aprendizado
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </section>
        )}

        {/* ============================ TRILHAS ============================ */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                Trilhas oficiais
              </div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                Formação por perfil
              </h2>
              <p className="text-sm text-muted-foreground">
                Cada trilha foi desenhada para um público-alvo específico, com conteúdo e ritmo próprios.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TRACKS.map((t) => {
              const p = trackProgress(t);
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  className="group flex flex-col rounded-2xl border border-border/60 bg-white p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-premium)] hover:border-blue-300 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-white bg-gradient-to-br ${t.accent} shadow-md`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <TrackStatusPill status={p.status} />
                  </div>
                  <div className="mt-5">
                    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${t.tone}`}>
                      Trilha {t.title}
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mt-2">
                      {t.audience}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Aulas</div>
                      <div className="text-sm font-bold text-foreground mt-0.5">{p.total}</div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Duração</div>
                      <div className="text-sm font-bold text-foreground mt-0.5">{p.minutes} min</div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold text-foreground">{p.pct}%</span>
                    </div>
                    <ProgressBar pct={p.pct} />
                    <div className="text-[11px] text-muted-foreground">
                      {p.completed} de {p.total} aulas concluídas
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => setOpenTrackId(t.id)}
                      className="flex-1 text-white"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      Acessar trilha
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setOpenTrackId(t.id)}
                      className="flex-1"
                    >
                      Ver aulas
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================ COMO AJUDA ============================ */}
        <section className="space-y-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              Impacto da Academia
            </div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              Como a Academia ajuda na implantação
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ImpactCard
              icon={ShieldCheck}
              title="Reduz dúvidas do cliente"
              body="Cliente treinado gera menos ticket de suporte, entende o sistema mais rápido e adota a operação com autonomia."
            />
            <ImpactCard
              icon={UserCog}
              title="Treina o time interno"
              body="Time interno com formação consistente valida melhor, apoia o cliente com clareza e sustenta a qualidade do produto."
            />
            <ImpactCard
              icon={Layers}
              title="Padroniza o uso do sistema"
              body="Todos falam a mesma língua, seguem o mesmo método e evoluem a operação de forma previsível e escalável."
            />
          </div>
        </section>

        {/* ============================ PARA QUEM ============================ */}
        <section className="space-y-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              Público
            </div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              Para quem é esta área
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AudienceCard
              icon={Users}
              accent="from-blue-600 to-blue-800"
              title="Cliente"
              body="Aprende a usar o sistema na rotina da operação Mercado Livre, com foco em decisões práticas e resultado medido."
            />
            <AudienceCard
              icon={UserCog}
              accent="from-slate-700 to-slate-900"
              title="Time Interno"
              body="Aprende a validar dados, acompanhar demandas, registrar melhorias e dar suporte consultivo ao cliente."
            />
            <AudienceCard
              icon={Briefcase}
              accent="from-blue-800 to-indigo-900"
              title="Comercial"
              body="Aprende a apresentar o valor do AC360 E-commerce de forma consultiva, ligando dor real a solução concreta."
            />
          </div>
        </section>
      </div>

      {/* ============================ TRACK DRAWER ============================ */}
      <Sheet
        open={!!openTrack}
        onOpenChange={(o) => {
          if (!o) {
            setOpenTrackId(null);
            setOpenLesson(null);
          }
        }}
      >
        <SheetContent className="sm:max-w-2xl w-full overflow-y-auto p-0">
          {openTrack && !currentLesson && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-5 border-b bg-gradient-to-b from-blue-50/60 to-white">
                <div className="flex items-start gap-4">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-white bg-gradient-to-br ${openTrack.accent} shadow-md shrink-0`}
                  >
                    <openTrack.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${openTrack.tone}`}>
                      Trilha oficial
                    </div>
                    <SheetTitle className="text-left text-xl mt-1.5">
                      Trilha {openTrack.title}
                    </SheetTitle>
                    <SheetDescription className="text-left mt-1">
                      {openTrack.audience}
                    </SheetDescription>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {openTrack.description}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg border border-border/60 bg-white px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Aulas</div>
                    <div className="text-sm font-bold text-foreground mt-0.5">
                      {trackProgress(openTrack).total}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-white px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Duração</div>
                    <div className="text-sm font-bold text-foreground mt-0.5">
                      {trackProgress(openTrack).minutes} min
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-white px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Progresso</div>
                    <div className="text-sm font-bold text-foreground mt-0.5">
                      {trackProgress(openTrack).pct}%
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar pct={trackProgress(openTrack).pct} />
                  <div className="mt-1.5 text-xs text-muted-foreground">
                    {trackProgress(openTrack).completed} de {openTrack.lessons.length} aulas concluídas
                  </div>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                {(() => {
                  const nextIdx = openTrack.lessons.findIndex(
                    (l) => (progress[l.id] ?? "not_started") !== "completed",
                  );
                  return openTrack.lessons.map((l, idx) => {
                    const status = progress[l.id] ?? "not_started";
                    const isNext = idx === nextIdx;
                    return (
                      <button
                        key={l.id}
                        onClick={() => setOpenLesson({ trackId: openTrack.id, lessonId: l.id })}
                        className={`w-full text-left rounded-xl border bg-white p-4 hover:border-blue-300 hover:shadow-md transition ${
                          isNext ? "border-blue-300 ring-2 ring-blue-100" : "border-border/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
                              status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isNext
                                  ? "bg-blue-700 text-white"
                                  : "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}
                          >
                            {status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              String(idx + 1).padStart(2, "0")
                            )}
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
                              {isNext && (
                                <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                                  <Sparkles className="h-3 w-3" />
                                  Próxima recomendada
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {openTrack && currentLesson && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-b from-blue-50/60 to-white">
                <button
                  onClick={() => setOpenLesson(null)}
                  className="text-xs font-semibold text-blue-700 hover:underline text-left mb-2 inline-flex items-center gap-1"
                >
                  ← Voltar para a trilha {openTrack.title}
                </button>
                <div className="flex items-start gap-3">
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white bg-gradient-to-br ${openTrack.accent} shadow-md shrink-0`}
                  >
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-left text-lg">{currentLesson.title}</SheetTitle>
                    <SheetDescription className="text-left mt-0.5">
                      {currentLesson.description}
                    </SheetDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <StatusBadge status={progress[currentLesson.id] ?? "not_started"} />
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {currentLesson.estimatedMinutes} min
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Layers className="h-3 w-3" />
                    Trilha {openTrack.title}
                  </span>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                <LessonSection
                  icon={Target}
                  eyebrow="A"
                  title="Objetivo da aula"
                >
                  <p className="text-sm text-foreground leading-relaxed">{currentLesson.objective}</p>
                </LessonSection>

                <LessonSection icon={BookOpen} eyebrow="B" title="Conteúdo">
                  <div className="space-y-3">
                    {currentLesson.content.map((p, i) => (
                      <p key={i} className="text-sm text-foreground leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                </LessonSection>

                <LessonSection icon={Rocket} eyebrow="C" title="Como aplicar na prática">
                  <p className="text-sm text-foreground leading-relaxed">{currentLesson.practice}</p>
                </LessonSection>

                <LessonSection icon={ClipboardCheck} eyebrow="D" title="Checklist de aprendizado">
                  <ul className="space-y-2">
                    {currentLesson.checklist.map((c, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-700 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </LessonSection>

                <LessonSection icon={ArrowRight} eyebrow="E" title="Próximo passo">
                  {nextLessonAfter ? (
                    <button
                      onClick={() =>
                        openLessonFrom(nextLessonAfter.track.id, nextLessonAfter.lesson.id)
                      }
                      className="w-full text-left rounded-xl border border-blue-200 bg-blue-50/60 p-4 hover:border-blue-400 hover:bg-blue-50 transition"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                        Continue por
                      </div>
                      <div className="text-sm font-semibold text-foreground mt-0.5">
                        {nextLessonAfter.lesson.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {nextLessonAfter.lesson.description}
                      </div>
                    </button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Você concluiu o roteiro sugerido desta trilha. Explore outra trilha para
                      seguir evoluindo.
                    </p>
                  )}
                </LessonSection>
              </div>
              <div className="border-t px-6 py-4 flex flex-col sm:flex-row gap-2 bg-white">
                <Button
                  variant="ghost"
                  className="sm:w-auto"
                  onClick={() => setOpenLesson(null)}
                >
                  Voltar para trilha
                </Button>
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

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function HeaderBadge({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
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
        <CheckCircle2 className="h-3 w-3" /> Concluída
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
      <Circle className="h-3 w-3" /> Não iniciada
    </span>
  );
}

function TrackStatusPill({
  status,
}: {
  status: "not_started" | "in_progress" | "completed";
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Concluída
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
        <PlayCircle className="h-3 w-3" /> Em andamento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
      <Circle className="h-3 w-3" /> Não iniciada
    </span>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
  micro,
  progress,
  small,
  action,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  hint?: string;
  micro?: string;
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
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div
        className={`mt-3 font-display font-bold text-foreground ${
          small ? "text-base leading-snug line-clamp-2" : "text-3xl"
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground line-clamp-1">{hint}</div>}
      {typeof progress === "number" && (
        <div className="mt-4">
          <ProgressBar pct={progress} />
        </div>
      )}
      {micro && (
        <div className="mt-3 pt-3 border-t border-border/60 text-[11px] text-muted-foreground leading-relaxed">
          {micro}
        </div>
      )}
    </>
  );
  const base =
    "text-left rounded-2xl border border-border/60 bg-white p-5 shadow-[var(--shadow-soft)] min-h-[176px] flex flex-col";
  if (action) {
    return (
      <button
        onClick={action}
        className={`${base} hover:shadow-md hover:border-blue-300 transition`}
      >
        {content}
      </button>
    );
  }
  return <div className={base}>{content}</div>;
}

function ImpactCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-[var(--shadow-soft)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-base font-bold text-foreground mt-4">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function AudienceCard({
  icon: Icon,
  accent,
  title,
  body,
}: {
  icon: typeof Users;
  accent: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-[var(--shadow-soft)]">
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-white bg-gradient-to-br ${accent} shadow-md`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-lg font-bold text-foreground mt-4">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function LessonSection({
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  icon: typeof Target;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white text-[11px] font-bold">
          {eyebrow}
        </div>
        <div className="flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-blue-700" />
          <h4 className="text-sm font-bold text-foreground">{title}</h4>
        </div>
      </div>
      <div className="pl-9">{children}</div>
    </div>
  );
}

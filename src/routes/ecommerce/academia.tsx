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
  Store,
  TrendingUp,
  Link2,
  ShoppingCart,
  DollarSign,
  Boxes,
  Map as MapIcon,
  Zap,
  ClipboardList,
  Radar,
  BrainCircuit,
  AlertTriangle,
  BookMarked,
  type LucideIcon,
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

// ---------------------------------------------------------------------------
// Guias por Menu do Sistema
// ---------------------------------------------------------------------------

type MenuGuideGroup =
  | "Visão Executiva"
  | "Operação Mercado Livre"
  | "Crescimento"
  | "Execução"
  | "Inteligência"
  | "Implantação";

type MenuGuide = {
  id: string;
  menu: string;
  group: MenuGuideGroup;
  route: string;
  icon: LucideIcon;
  shortDescription: string;
  description: string;
  estimatedMinutes: number;
  whatItDoes: string;
  whenToUse: string;
  howToRead: string;
  steps: string[];
  example: string;
  caveats: string[];
  checklist: string[];
};

const MENU_GUIDES: MenuGuide[] = [
  {
    id: "guide-visao-geral",
    menu: "Visão Geral",
    group: "Visão Executiva",
    route: "/ecommerce/dashboard",
    icon: Store,
    shortDescription: "Panorama executivo da operação Mercado Livre.",
    description:
      "Visão consolidada da operação: contas, produtos, vendas, ações e resultados em uma única tela.",
    estimatedMinutes: 6,
    whatItDoes:
      "Reúne os principais indicadores da operação Mercado Livre em uma única tela, para leitura rápida do estado geral do negócio.",
    whenToUse:
      "Use no início do dia para checar o pulso da operação: se algo mudou, se algo está fora do padrão e por onde começar.",
    howToRead:
      "Foque primeiro nos indicadores que estão fora da tendência esperada. Números estáveis não pedem ação; variações fortes sim.",
    steps: [
      "Acesse Visão Geral no menu",
      "Confirme a conta ativa no topo",
      "Leia os cards principais sem se perder em detalhes",
      "Identifique 1 ou 2 pontos que exigem atenção",
      "Vá direto para o módulo correspondente ao ponto de atenção",
    ],
    example:
      "Se a Visão Geral mostra queda de vendas em um período em que costumava vender bem, abra Produtos e Anúncios e cruze com Central de Ações para descobrir a causa antes de agir.",
    caveats: [
      "Não tire conclusões apenas por um dia isolado; compare com a tendência.",
      "Números só fazem sentido com a conta ativa correta selecionada.",
    ],
    checklist: [
      "Sei localizar Visão Geral no menu",
      "Sei confirmar a conta ativa antes de ler os dados",
      "Sei identificar 1 ponto de atenção principal",
      "Sei em qual módulo aprofundar a análise",
    ],
  },
  {
    id: "guide-central-acoes",
    menu: "Central de Ações",
    group: "Visão Executiva",
    route: "/ecommerce/prioridades",
    icon: TrendingUp,
    shortDescription: "Ações priorizadas por impacto real na operação.",
    description:
      "Lista o que precisa ser feito primeiro, com motivo, impacto esperado e nível de esforço.",
    estimatedMinutes: 8,
    whatItDoes:
      "A Central de Ações mostra o que precisa ser priorizado na operação. Ela consolida produtos, anúncios, custos, estoque e oportunidades para ajudar o operador a decidir o que fazer primeiro.",
    whenToUse:
      "Use diariamente para entender quais ações exigem atenção imediata e para planejar o foco do dia e da semana.",
    howToRead:
      "Cada ação traz motivo, impacto esperado e esforço. Ações críticas vêm no topo. Leia o motivo antes de agir — nunca execute só pelo título.",
    steps: [
      "Confira se a conta ativa está correta",
      "Veja os cards de prioridade",
      "Analise ações críticas primeiro",
      "Use filtros para separar custo, estoque, anúncios e cadastro",
      "Abra o detalhe da ação",
      "Transforme a ação em tarefa operacional quando necessário",
      "Acompanhe a execução em Tarefas da Operação",
    ],
    example:
      "Se a Central sugere reduzir preço de um produto para destravar vendas, valide margem em Custos e Margem e estoque em Estoque e Compras antes de aplicar qualquer mudança no Mercado Livre.",
    caveats: [
      "Não execute ações sensíveis sem validar margem, estoque e impacto comercial.",
      "Evite abrir várias frentes ao mesmo tempo; feche uma ação por vez.",
    ],
    checklist: [
      "Entendi o que é uma ação crítica",
      "Sei filtrar por prioridade",
      "Sei abrir detalhe da ação",
      "Sei transformar ação em tarefa",
      "Sei acompanhar a tarefa depois",
    ],
  },
  {
    id: "guide-resultados-acoes",
    menu: "Resultados das Ações",
    group: "Visão Executiva",
    route: "/ecommerce/resultados",
    icon: BarChart3,
    shortDescription: "Medição real do impacto das ações executadas.",
    description:
      "Consolida receita, impacto e evolução das tarefas concluídas e serve como prova do valor da operação.",
    estimatedMinutes: 7,
    whatItDoes:
      "Consolida os resultados das ações concluídas: quantas foram feitas, quantas tiveram impacto positivo e receita estimada gerada.",
    whenToUse:
      "Use no fechamento semanal para medir o que foi feito e a cada nova tarefa concluída para registrar o resultado real.",
    howToRead:
      "KPIs consideram apenas tarefas concluídas com medição registrada. Se algum aviso discreto aparecer, há medição vinculada a uma tarefa ainda não concluída.",
    steps: [
      "Acesse Resultados das Ações",
      "Confira a conta ativa",
      "Analise os KPIs principais no topo",
      "Revise as medições listadas",
      "Registre resultado manual de uma tarefa concluída sem medição",
      "Confirme que os KPIs se atualizam após o registro",
    ],
    example:
      "Ao concluir uma ação de reprecificação em Central de Ações, registre em Resultados das Ações o antes/depois de conversão e a receita adicional gerada.",
    caveats: [
      "Não registre resultado sem que a tarefa esteja realmente concluída.",
      "Não existe registro duplicado por tarefa; se aparecer bloqueado, já há medição.",
    ],
    checklist: [
      "Sei ler os KPIs de ações concluídas e impacto positivo",
      "Sei registrar uma medição manual",
      "Sei que tarefas em andamento não entram nos KPIs principais",
      "Sei identificar quando existe medição pendente",
    ],
  },
  {
    id: "guide-contas-ml",
    menu: "Contas Mercado Livre",
    group: "Operação Mercado Livre",
    route: "/ecommerce/contas",
    icon: Link2,
    shortDescription: "Conexão e sincronização das contas Mercado Livre.",
    description:
      "Onde a operação conecta contas, valida o status e aciona a sincronização inteligente.",
    estimatedMinutes: 6,
    whatItDoes:
      "Mostra todas as contas do Mercado Livre vinculadas à operação, o status de cada uma e permite acionar a sincronização de leitura.",
    whenToUse:
      "Use ao entrar em uma nova conta, ao suspeitar de dados desatualizados ou quando o cliente conectar uma nova loja.",
    howToRead:
      "Cada conta pode estar Conectada ou Aguardando conexão. O AC360 lê dados do Mercado Livre — nunca altera anúncios, preços ou estoque no ML.",
    steps: [
      "Acesse Contas Mercado Livre",
      "Identifique contas conectadas e aguardando",
      "Selecione a conta ativa desejada no topo",
      "Execute a sincronização quando necessário",
      "Confira se os módulos passam a refletir os dados atualizados",
    ],
    example:
      "Se o cliente reporta que uma venda recente não aparece na Visão Geral, acesse Contas Mercado Livre, valide o status e rode a sincronização antes de investigar outros módulos.",
    caveats: [
      "Sincronização não altera nada no Mercado Livre.",
      "Só troque a conta ativa quando tiver certeza de qual loja quer analisar.",
    ],
    checklist: [
      "Sei diferenciar conta conectada de aguardando",
      "Sei trocar a conta ativa com segurança",
      "Sei acionar a sincronização",
      "Entendi que o AC360 nunca altera o Mercado Livre",
    ],
  },
  {
    id: "guide-produtos",
    menu: "Produtos e Anúncios",
    group: "Operação Mercado Livre",
    route: "/ecommerce/produtos",
    icon: ShoppingCart,
    shortDescription: "Leitura de produtos, anúncios e sinais de atenção.",
    description:
      "Lista dos anúncios da conta ativa com preço, estoque, status e sinais para intervenção.",
    estimatedMinutes: 8,
    whatItDoes:
      "Mostra os produtos e anúncios da conta ativa, com preço, estoque, status e sinais que indicam risco de queda de vendas.",
    whenToUse:
      "Use para investigar produtos travados, revisar catálogo antes de campanhas e cruzar dados com Central de Ações.",
    howToRead:
      "Priorize produtos com sinais de atenção: sem giro, estoque crítico, anúncio pausado ou preço fora do mercado.",
    steps: [
      "Acesse Produtos e Anúncios",
      "Confirme a conta ativa",
      "Aplique filtros por status ou sinal de atenção",
      "Abra o detalhe do produto para leitura completa",
      "Registre próxima ação em Tarefas da Operação, se necessário",
    ],
    example:
      "Se identificar 3 anúncios travados sem giro, abra Central de Ações para ver se há recomendação de reprecificação antes de qualquer alteração manual no Mercado Livre.",
    caveats: [
      "Não altere anúncios direto no Mercado Livre sem validar impacto de margem e estoque.",
      "Filtros aplicam-se sempre à conta ativa selecionada.",
    ],
    checklist: [
      "Sei filtrar produtos por sinal de atenção",
      "Sei ler status e estoque",
      "Sei ligar produtos a ações da Central",
      "Sei registrar uma próxima ação",
    ],
  },
  {
    id: "guide-custos-margem",
    menu: "Custos e Margem",
    group: "Operação Mercado Livre",
    route: "/ecommerce/custos-margem",
    icon: DollarSign,
    shortDescription: "Custos operacionais e margem real por produto.",
    description:
      "Centraliza custos e mostra a margem real, evitando decisão de preço sem base.",
    estimatedMinutes: 7,
    whatItDoes:
      "Centraliza custos e mostra a margem real por produto, evitando decisão de preço baseada em suposição.",
    whenToUse:
      "Use antes de qualquer ação de reprecificação, campanha de ads ou promoção.",
    howToRead:
      "Foque em produtos com margem apertada ou negativa; eles são os mais sensíveis a qualquer mudança de preço.",
    steps: [
      "Acesse Custos e Margem",
      "Confirme a conta ativa",
      "Revise custos pendentes de preenchimento",
      "Analise a margem real dos produtos principais",
      "Priorize correção dos produtos com margem crítica",
    ],
    example:
      "Antes de aplicar desconto em um produto sugerido pela Central de Ações, confira em Custos e Margem se o desconto ainda preserva margem positiva.",
    caveats: [
      "Custos incompletos geram margem incorreta.",
      "Nunca decida preço apenas pela sugestão da Central sem validar aqui.",
    ],
    checklist: [
      "Sei identificar custos pendentes",
      "Sei ler margem real por produto",
      "Sei relacionar margem com decisões de preço",
      "Sei priorizar produtos de margem crítica",
    ],
  },
  {
    id: "guide-estoque",
    menu: "Estoque e Compras",
    group: "Operação Mercado Livre",
    route: "/ecommerce/estoque",
    icon: Boxes,
    shortDescription: "Estoque disponível e planejamento de compras.",
    description:
      "Mostra saldo, ruptura próxima e produtos que exigem reposição.",
    estimatedMinutes: 7,
    whatItDoes:
      "Mostra o estoque disponível por produto, alertas de ruptura próxima e apoio ao planejamento de compras.",
    whenToUse:
      "Use ao planejar compras, antes de escalar ads e ao investigar quedas de venda por falta de produto.",
    howToRead:
      "Priorize produtos em ruptura ou próximos disso, especialmente aqueles com bom giro histórico.",
    steps: [
      "Acesse Estoque e Compras",
      "Confirme a conta ativa",
      "Identifique produtos em ruptura ou risco",
      "Cruze com Produtos e Anúncios para entender giro",
      "Registre plano de compra como tarefa",
    ],
    example:
      "Antes de escalar ads de um produto lareira, confira em Estoque e Compras se o saldo aguenta o aumento de tráfego pedido pela Central de Ações.",
    caveats: [
      "Não escale ads sem estoque suficiente.",
      "Estoque desatualizado gera decisão errada; garanta sincronização recente.",
    ],
    checklist: [
      "Sei ler saldo por produto",
      "Sei identificar risco de ruptura",
      "Sei relacionar estoque com decisão de ads",
      "Sei registrar plano de compra",
    ],
  },
  {
    id: "guide-mapa-vendas",
    menu: "Mapa de Vendas",
    group: "Operação Mercado Livre",
    route: "/ecommerce/mapa-vendas",
    icon: MapIcon,
    shortDescription: "Distribuição geográfica das vendas.",
    description:
      "Mostra onde as vendas acontecem no Brasil e apoia decisão de logística e marketing regional.",
    estimatedMinutes: 6,
    whatItDoes:
      "Mostra a distribuição geográfica das vendas da conta ativa, com concentração por região e estado.",
    whenToUse:
      "Use para orientar decisões de frete, campanhas regionais e priorização logística.",
    howToRead:
      "Foque nas regiões de maior concentração e em regiões emergentes com crescimento consistente.",
    steps: [
      "Acesse Mapa de Vendas",
      "Confirme a conta ativa",
      "Observe as regiões de maior volume",
      "Identifique regiões com queda ou crescimento incomum",
      "Relacione o padrão com estratégias de frete ou campanha",
    ],
    example:
      "Se o Mapa de Vendas mostra alta concentração em uma região, avalie campanhas específicas antes de generalizar promoções nacionais.",
    caveats: [
      "Não confunda concentração com potencial; regiões pequenas podem crescer com o estímulo certo.",
      "Padrões geográficos precisam de janela mínima para não gerar decisão precipitada.",
    ],
    checklist: [
      "Sei ler concentração por região",
      "Sei identificar regiões emergentes",
      "Sei conectar dado geográfico com decisão",
      "Sei quando o padrão ainda é insuficiente",
    ],
  },
  {
    id: "guide-ads",
    menu: "Anúncios e Ads",
    group: "Crescimento",
    route: "/ecommerce/ads",
    icon: Zap,
    shortDescription: "Investimento em ads e leitura de performance.",
    description:
      "Consolida investimento e performance de ads para decidir onde escalar e onde recuar.",
    estimatedMinutes: 8,
    whatItDoes:
      "Consolida dados de investimento e performance de anúncios pagos para decidir onde escalar, manter ou recuar.",
    whenToUse:
      "Use semanalmente para revisar performance e sempre que a Central de Ações sugerir mudança de investimento.",
    howToRead:
      "Compare investimento contra retorno. Ads com retorno baixo devem ser revistos; ads eficientes podem ser escalados com estoque garantido.",
    steps: [
      "Acesse Anúncios e Ads",
      "Confirme a conta ativa",
      "Revise performance por produto ou campanha",
      "Valide margem em Custos e Margem",
      "Valide estoque em Estoque e Compras",
      "Ajuste ou registre tarefa de otimização",
    ],
    example:
      "Antes de aumentar investimento em ads de um produto, valide margem em Custos e Margem e estoque em Estoque e Compras para não escalar prejuízo.",
    caveats: [
      "Não escale ads de produto com margem apertada.",
      "Não escale ads sem estoque suficiente para atender demanda.",
    ],
    checklist: [
      "Sei ler retorno por produto ou campanha",
      "Sei quando escalar e quando recuar",
      "Sei conectar decisão de ads com margem",
      "Sei conectar decisão de ads com estoque",
    ],
  },
  {
    id: "guide-tarefas",
    menu: "Tarefas da Operação",
    group: "Execução",
    route: "/ecommerce/tarefas",
    icon: ClipboardList,
    shortDescription: "Execução das ações no dia a dia da operação.",
    description:
      "Lista das tarefas em aberto, em andamento e concluídas para acompanhar a execução real.",
    estimatedMinutes: 7,
    whatItDoes:
      "Lista as tarefas operacionais em aberto, em andamento e concluídas, permitindo acompanhar a execução real das ações recomendadas.",
    whenToUse:
      "Use diariamente para saber o que executar hoje e para dar baixa nas tarefas concluídas.",
    howToRead:
      "Priorize tarefas críticas e antigas em aberto. Tarefas concluídas alimentam Resultados das Ações.",
    steps: [
      "Acesse Tarefas da Operação",
      "Confirme a conta ativa",
      "Selecione a próxima tarefa a executar",
      "Atualize o status conforme executa",
      "Ao concluir, registre resultado em Resultados das Ações",
    ],
    example:
      "Uma ação da Central sobre reprecificação vira uma tarefa aqui. Após executar no Mercado Livre, marque como concluída e registre a medição em Resultados das Ações.",
    caveats: [
      "Não deixe tarefas paradas por semanas sem revisão.",
      "Só conclua uma tarefa quando o resultado for real, não apenas planejado.",
    ],
    checklist: [
      "Sei ler o status de uma tarefa",
      "Sei priorizar por criticidade e prazo",
      "Sei conectar tarefa concluída a Resultados das Ações",
      "Sei revisar tarefas paradas",
    ],
  },
  {
    id: "guide-diagnostico",
    menu: "Diagnóstico Inteligente",
    group: "Inteligência",
    route: "/ecommerce/radar-ia",
    icon: Radar,
    shortDescription: "Radar automático dos pontos críticos da operação.",
    description:
      "Análise automática que identifica riscos, oportunidades e pontos cegos com base nos dados atuais.",
    estimatedMinutes: 7,
    whatItDoes:
      "Faz uma análise automática da operação e destaca riscos, oportunidades e pontos cegos com base nos dados sincronizados.",
    whenToUse:
      "Use semanalmente para revisão estratégica e ao entrar em uma operação nova para orientação inicial.",
    howToRead:
      "Cada ponto do diagnóstico traz contexto e sugestão. Leia como leitura estratégica, não como comando automático.",
    steps: [
      "Acesse Diagnóstico Inteligente",
      "Confirme a conta ativa",
      "Leia os principais pontos identificados",
      "Priorize os pontos com maior impacto potencial",
      "Transforme insight em tarefa quando aplicável",
    ],
    example:
      "Se o diagnóstico apontar risco em uma categoria com margem baixa, cruze com Custos e Margem antes de decidir uma ação corretiva.",
    caveats: [
      "Diagnóstico apoia decisão; nunca substitui validação humana.",
      "Sem sincronização recente, o diagnóstico perde precisão.",
    ],
    checklist: [
      "Sei interpretar riscos e oportunidades",
      "Sei priorizar pontos por impacto",
      "Sei transformar insight em tarefa",
      "Entendi que a decisão continua sendo humana",
    ],
  },
  {
    id: "guide-consultor",
    menu: "Assistente Estratégico",
    group: "Inteligência",
    route: "/ecommerce/consultor-ia",
    icon: BrainCircuit,
    shortDescription: "Consulta estratégica assistida por IA.",
    description:
      "Espaço para explorar cenários, tirar dúvidas estratégicas e apoiar a tomada de decisão.",
    estimatedMinutes: 6,
    whatItDoes:
      "Permite explorar cenários e tirar dúvidas estratégicas com apoio de IA, sempre respeitando o contexto da operação.",
    whenToUse:
      "Use para pensar antes de agir, revisar hipóteses e obter perspectivas complementares ao diagnóstico.",
    howToRead:
      "Trate as respostas como apoio consultivo. Confirme os dados antes de transformar recomendações em ações.",
    steps: [
      "Acesse Assistente Estratégico",
      "Confirme a conta ativa",
      "Descreva o cenário ou dúvida com clareza",
      "Analise a resposta com senso crítico",
      "Valide com os módulos operacionais antes de agir",
    ],
    example:
      "Antes de definir a estratégia de campanha para uma categoria, use o Assistente para explorar cenários e depois valide com dados reais em Ads, Custos e Estoque.",
    caveats: [
      "Nunca aja apenas na sugestão da IA sem validar dado real.",
      "Contexto pobre gera resposta pobre; descreva o cenário com detalhes.",
    ],
    checklist: [
      "Sei formular uma boa pergunta estratégica",
      "Sei validar a resposta com dados reais",
      "Sei usar como apoio consultivo, não como comando",
      "Sei quando o contexto informado é insuficiente",
    ],
  },
  {
    id: "guide-regras",
    menu: "Regras da Operação",
    group: "Inteligência",
    route: "/ecommerce/base-ia",
    icon: BookMarked,
    shortDescription: "Regras que sustentam recomendações e diagnóstico.",
    description:
      "Base das regras operacionais que orientam recomendações, priorização e diagnóstico.",
    estimatedMinutes: 6,
    whatItDoes:
      "Reúne as regras da operação que sustentam recomendações da Central de Ações, priorização e diagnóstico.",
    whenToUse:
      "Use para entender o porquê de uma recomendação e para alinhar time interno sobre critérios de decisão.",
    howToRead:
      "Cada regra descreve situação, critério e ação sugerida. Regra bem entendida evita decisão contraditória.",
    steps: [
      "Acesse Regras da Operação",
      "Leia as regras aplicáveis ao seu momento",
      "Relacione cada regra a uma ação prática",
      "Compartilhe as regras com o time interno",
      "Reveja periodicamente as regras críticas",
    ],
    example:
      "Se a Central sugerir reduzir preço de um produto, procure em Regras da Operação a regra que fundamenta essa recomendação antes de aplicar.",
    caveats: [
      "Não altere aplicação de regras sem alinhamento do time.",
      "Ignorar regras cria decisões contraditórias na operação.",
    ],
    checklist: [
      "Sei localizar as regras principais",
      "Sei relacionar regra a recomendação",
      "Sei explicar uma regra ao time interno",
      "Sei quando revisar uma regra crítica",
    ],
  },
  {
    id: "guide-academia",
    menu: "Academia",
    group: "Implantação",
    route: "/ecommerce/academia",
    icon: GraduationCap,
    shortDescription: "Central de implantação, treinamento e capacitação.",
    description:
      "Reúne trilhas de formação e guias por menu para dominar o AC360 E-commerce na prática.",
    estimatedMinutes: 5,
    whatItDoes:
      "Reúne trilhas de formação por perfil e guias por menu do sistema, com progresso acompanhado para o operador.",
    whenToUse:
      "Use na implantação inicial, no onboarding de novos operadores e sempre que precisar revisar como usar um módulo.",
    howToRead:
      "Combine trilhas (por perfil) com guias (por menu). Trilhas dão método; guias dão profundidade operacional.",
    steps: [
      "Acesse Academia",
      "Leia o header e a jornada de implantação",
      "Escolha uma trilha do seu perfil",
      "Use os guias por menu quando precisar de detalhe operacional",
      "Marque aulas e guias concluídos para acompanhar progresso",
    ],
    example:
      "Ao entrar em uma nova conta, use o guia de Contas Mercado Livre para conectar e sincronizar; depois volte à trilha Cliente para aprender rituais diários.",
    caveats: [
      "Progresso fica salvo apenas neste navegador enquanto não houver persistência no backend.",
      "Concluir um guia significa que você entendeu, não que a operação está resolvida.",
    ],
    checklist: [
      "Sei diferenciar trilha de guia",
      "Sei acompanhar meu progresso",
      "Sei escolher por onde começar",
      "Sei revisitar um guia quando precisar",
    ],
  },
];

const GUIDE_GROUPS: MenuGuideGroup[] = [
  "Visão Executiva",
  "Operação Mercado Livre",
  "Crescimento",
  "Execução",
  "Inteligência",
  "Implantação",
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
  const [openGuideId, setOpenGuideId] = useState<string | null>(null);

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
    const lessons = TRACKS.flatMap((t) => t.lessons);
    const lessonsCompleted = lessons.filter((l) => progress[l.id] === "completed").length;
    const guidesCompleted = MENU_GUIDES.filter((g) => progress[g.id] === "completed").length;
    const total = lessons.length + MENU_GUIDES.length;
    const completed = lessonsCompleted + guidesCompleted;
    const totalMinutes =
      lessons.reduce((acc, l) => acc + l.estimatedMinutes, 0) +
      MENU_GUIDES.reduce((acc, g) => acc + g.estimatedMinutes, 0);
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      total,
      completed,
      pct,
      totalMinutes,
      lessonsTotal: lessons.length,
      lessonsCompleted,
      guidesTotal: MENU_GUIDES.length,
      guidesCompleted,
    };
  }, [progress]);

  const openGuide = openGuideId ? MENU_GUIDES.find((g) => g.id === openGuideId) ?? null : null;

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

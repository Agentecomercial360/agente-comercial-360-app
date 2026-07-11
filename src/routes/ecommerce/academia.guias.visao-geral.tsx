import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Store,
  Clock,
  CheckCircle2,
  PlayCircle,
  Target,
  ClipboardCheck,
  Lightbulb,
  AlertTriangle,
  Compass,
  BarChart3,
  BookOpen,
  ShieldCheck,
  Flag,
  LayoutGrid,
  ScrollText,
  Sparkles,
  Gauge,
  ListChecks,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Button } from "@/components/ui/button";
import { useAcademiaProgress, type AcademiaStatus } from "@/lib/academia-progress";
import {
  StatusPill,
  Section,
  CentralQuestionCard,
  ProblemSolutionSection,
  LearningObjectivesSection,
  ModuleFlow,
  ScreenTourSection,
  InventoryTable,
  RulesSection,
  BestPracticesSection,
  CommonErrorsSection,
  LearningsSection,
  NextGuideCard,
  ConsultantTipCard,
  MentorIACard,
  TechnicalLibrarySection,
  CalloutGrid,
  ChecklistCards,
  AnatomyRow,
  InterpretationTable,
  OperationalTimeline,
  ScenarioCard,
  NextActionsGrid,
  WarningCallouts,
  ImagePlaceholder,
  PracticalExampleTimeline,
  ClickableChecklist,
} from "@/components/academia/AcademyGuideTemplate";

export const Route = createFileRoute("/ecommerce/academia/guias/visao-geral")({
  component: GuiaVisaoGeralPage,
  head: () => ({
    meta: [
      {
        title: "Guia do menu Visão Geral | Academia AC360 E-commerce",
      },
      {
        name: "description",
        content:
          "Guia completo do menu Visão Geral do AC360 E-commerce: objetivo, indicadores, passo a passo, exemplos e checklist de domínio.",
      },
    ],
  }),
});

// Mesmo ID usado em MENU_GUIDES no academia.tsx (mantém progresso compartilhado)
const GUIDE_ID = "guide-visao-geral";
const GUIDE_TITLE = "Guia do menu Visão Geral";
const GUIDE_CATEGORY = "Visão Executiva";
const GUIDE_ROUTE = "/ecommerce/dashboard";
const GUIDE_DESCRIPTION =
  "Panorama executivo diário da operação Mercado Livre: contas, produtos, vendas, ações e resultados em uma única tela.";
const ESTIMATED_MINUTES = 6;

const CHECKLIST = [
  "Sei localizar Visão Geral no menu",
  "Sei confirmar a conta ativa antes de ler os dados",
  "Sei identificar 1 ponto de atenção principal",
  "Sei em qual módulo aprofundar a análise",
];

function GuiaVisaoGeralPage() {
  const { progress, setStatus } = useAcademiaProgress();
  const status: AcademiaStatus = progress[GUIDE_ID] ?? "not_started";

  const checklistCompleted = useMemo(
    () =>
      CHECKLIST.filter(
        (_, i) => progress[`${GUIDE_ID}.check.${i}`] === "completed",
      ).length,
    [progress],
  );
  const checklistPct = Math.round((checklistCompleted / CHECKLIST.length) * 100);
  const pagePct = status === "completed" ? 100 : checklistPct;

  return (
    <EcommerceLayout>
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link to="/ecommerce/academia" className="hover:text-blue-700 transition-colors">
            Academia
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Guias por Menu</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-foreground">Visão Geral</span>
        </nav>

        {/* 1. Cabeçalho Premium */}
        <header className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 md:p-8 shadow-[var(--shadow-card)]">
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: "var(--gradient-brand)" }}
          />
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shrink-0 shadow-lg"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Store className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    {GUIDE_CATEGORY}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {ESTIMATED_MINUTES} min
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    <Gauge className="h-3 w-3" />
                    Nível iniciante
                  </span>
                  <StatusPill status={status} />
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-2">
                  {GUIDE_TITLE}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                  {GUIDE_DESCRIPTION}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                    <Compass className="h-3 w-3" />
                    Rota: {GUIDE_ROUTE}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] text-muted-foreground">
                    <ListChecks className="h-3 w-3" />
                    Pré-requisitos: conta Mercado Livre conectada e sincronizada
                  </div>
                </div>
                {/* Barra de progresso do cabeçalho */}
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    <span>Progresso deste guia</span>
                    <span>{pagePct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pagePct}%`,
                        background: "var(--gradient-brand)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <Link to="/ecommerce/academia">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  Voltar para a Academia
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* 2. Missão do módulo + Objetivo de negócio */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
              <Flag className="h-3.5 w-3.5" />
              Missão do módulo
            </div>
            <h2 className="font-display text-lg md:text-xl font-bold text-foreground mt-2 leading-tight">
              Dar ao operador uma leitura executiva única da operação Mercado Livre.
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              A Visão Geral existe para que, em segundos, o time saiba onde a operação está indo bem e onde precisa agir — sem abrir vários módulos.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              <Target className="h-3.5 w-3.5" />
              Objetivo de negócio
            </div>
            <h2 className="font-display text-lg md:text-xl font-bold text-foreground mt-2 leading-tight">
              Reduzir o tempo entre perceber o problema e iniciar a ação.
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Quanto mais rápido o operador identifica um sinal e abre o módulo certo, mais rápido a operação corrige rota e protege receita e margem.
            </p>
          </div>
        </section>

        {/* Pergunta central */}
        <CentralQuestionCard question="Como está minha operação neste momento?" />

        {/* 3. Problema que resolve — Sem × Com */}
        <ProblemSolutionSection
          without={{
            title: "Sem o menu Visão Geral",
            points: [
              "O operador abre vários módulos sem saber por onde começar.",
              "Sinais críticos passam despercebidos no meio da rotina.",
              "Decisões acontecem tarde, depois do problema já ter impacto.",
              "Cada pessoa do time olha um recorte diferente da operação.",
            ],
          }}
          with_={{
            title: "Com o menu Visão Geral",
            points: [
              "Uma leitura executiva única em menos de 2 minutos.",
              "Sinais fora do padrão aparecem no topo da tela.",
              "Ação começa antes do problema virar prejuízo.",
              "Time inteiro parte do mesmo diagnóstico compartilhado.",
            ],
          }}
        />

        {/* 4. Objetivos da aula */}
        <LearningObjectivesSection
          objectives={[
            "Interpretar os principais indicadores da operação Mercado Livre.",
            "Entender os alertas e reconhecer sinais de risco.",
            "Identificar rapidamente qual é a prioridade do dia.",
            "Navegar pela tela Visão Geral com segurança e método.",
            "Decidir para qual módulo aprofundar dependendo do sinal.",
          ]}
        />

        {/* 5. Fluxo operacional */}
        <ModuleFlow
          title="Fluxo dentro do AC360"
          description="Como a Visão Geral se conecta com os demais módulos operacionais."
          steps={[
            { label: "Sincronização", hint: "Dados atualizados do Mercado Livre" },
            { label: "Visão Geral", hint: "Leitura executiva", highlight: true },
            { label: "Central de Ações", hint: "Prioridades" },
            { label: "Produtos e Anúncios", hint: "Ajuste fino" },
            { label: "Custos e Margem", hint: "Rentabilidade" },
            { label: "Tarefas da Operação", hint: "Execução" },
            { label: "Resultados das Ações", hint: "Impacto" },
          ]}
        />

        {/* Progresso — controles de estudo */}
        <section className="rounded-2xl border border-border/60 bg-white p-5 md:p-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Seu progresso neste guia
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <div className="font-display text-3xl font-bold text-foreground">
                  {pagePct}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Checklist: {checklistCompleted}/{CHECKLIST.length} concluído
                  {checklistCompleted === 1 ? "" : "s"}
                </div>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pagePct}%`,
                    background: "var(--gradient-brand)",
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              {status !== "completed" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setStatus(
                        GUIDE_ID,
                        status === "in_progress" ? "not_started" : "in_progress",
                      )
                    }
                  >
                    <PlayCircle className="h-4 w-4 mr-1.5" />
                    {status === "in_progress" ? "Pausar estudo" : "Iniciar estudo"}
                  </Button>
                  <Button size="sm" onClick={() => setStatus(GUIDE_ID, "completed")}>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Marcar guia como concluído
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatus(GUIDE_ID, "in_progress")}
                >
                  Reabrir guia
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Conteúdo aprofundado (Blocos A–J) */}
        <div className="space-y-6">
          <Section icon={Target} eyebrow="A" title="Objetivo do menu">
            <CalloutGrid
              items={[
                {
                  tone: "blue",
                  icon: Compass,
                  title: "Painel executivo único",
                  text: "Reúne, em uma tela, os principais indicadores da conta ativa Mercado Livre.",
                },
                {
                  tone: "emerald",
                  icon: Lightbulb,
                  title: "Leitura em segundos",
                  text: "Mostra como o negócio está se comportando hoje sem precisar abrir cada módulo.",
                },
                {
                  tone: "amber",
                  icon: ArrowRight,
                  title: "Ponto de partida da rotina",
                  text: "Identifica sinais e indica para qual módulo aprofundar a análise.",
                },
              ]}
            />
          </Section>

          <Section icon={ShieldCheck} eyebrow="B" title="Antes de usar">
            <ChecklistCards
              items={[
                {
                  title: "Conta Mercado Livre correta",
                  text: "Confirme, no topo da tela, qual conta está selecionada antes de ler qualquer dado.",
                },
                {
                  title: "Sincronização atualizada",
                  text: "O badge Sincronizado no topbar precisa estar ativo — dados antigos geram diagnóstico errado.",
                },
                {
                  title: "Período de referência definido",
                  text: "Tenha claro se você quer analisar dia, semana ou mês antes de começar a comparar números.",
                },
              ]}
            />
          </Section>

          <Section icon={Compass} eyebrow="C" title="Conhecendo a tela">
            <CalloutGrid
              items={[
                { tone: "blue", icon: LayoutGrid, title: "Conta ativa", text: "Identificação clara de qual conta Mercado Livre está sendo lida." },
                { tone: "blue", icon: BarChart3, title: "Cards de KPIs", text: "Bloco central com indicadores executivos do período." },
                { tone: "blue", icon: Sparkles, title: "Ações recomendadas", text: "Resumo dos pontos que a inteligência AC360 sugere revisar." },
                { tone: "blue", icon: ArrowRight, title: "Atalhos operacionais", text: "Levam direto ao módulo indicado a partir do sinal." },
              ]}
            />
            <ImagePlaceholder
              order={1}
              title="Visão Geral — layout completo do painel"
              caption="Panorama da tela Visão Geral com conta ativa, cards de indicadores e atalhos."
              alt="Captura da tela Visão Geral do AC360 E-commerce mostrando cards de indicadores principais."
              annotations={[
                "Seletor de conta ativa no topo",
                "Cards de indicadores principais",
                "Resumo de ações recomendadas",
                "Atalhos para módulos operacionais",
              ]}
            />
          </Section>

          <Section icon={BarChart3} eyebrow="D" title="Indicadores e cards">
            <AnatomyRow
              items={[
                { label: "Valor atual", text: "O número absoluto do período selecionado." },
                { label: "Variação", text: "Percentual comparado ao período anterior." },
                { label: "Tendência", text: "Mini gráfico indicando direção do indicador." },
              ]}
            />
            <ImagePlaceholder
              order={2}
              title="Cards de indicadores — anatomia"
              caption="Como ler um card de indicador: valor, variação e tendência."
              alt="Detalhe de um card de indicador da Visão Geral."
              annotations={[
                "Título do indicador",
                "Valor atual do período",
                "Variação percentual vs. período anterior",
                "Mini gráfico de tendência",
              ]}
            />
          </Section>

          {/* 8. Como interpretar */}
          <Section icon={Lightbulb} eyebrow="E" title="Como interpretar os dados">
            <InterpretationTable
              rows={[
                { signal: "Indicador estável", action: "Não pede ação — foco em outros sinais." },
                { signal: "Variação forte fora do padrão", action: "Prioridade de análise — abrir módulo específico." },
                { signal: "Dia isolado destoando", action: "Comparar com tendência recente antes de decidir." },
                { signal: "Vendas caindo e lucro subindo", action: "Rever mix — pode ser preço/promoção mal calibrada." },
                { signal: "Vendas subindo e lucro caindo", action: "Suspeita de problema de margem em Custos e Margem." },
              ]}
            />
          </Section>

          <Section icon={PlayCircle} eyebrow="F" title="Passo a passo operacional">
            <OperationalTimeline
              steps={[
                { title: "Acesse Visão Geral", text: "Abra o menu lateral e selecione Visão Geral.", icon: Compass },
                { title: "Confirme a conta ativa", text: "Verifique o seletor no topo — todos os dados dependem disso.", icon: ShieldCheck },
                { title: "Leia os cards principais", text: "Foque no que salta aos olhos, não se prenda em detalhes secundários.", icon: BarChart3 },
                { title: "Identifique 1 ou 2 pontos", text: "Escolha os sinais mais relevantes para agir hoje.", icon: Target },
                { title: "Abra o módulo específico", text: "Central de Ações, Produtos, Custos ou Estoque — dependendo do sinal.", icon: ArrowRight },
              ]}
            />
          </Section>

          <Section icon={BookOpen} eyebrow="G" title="Exemplo prático">
            <ScenarioCard
              scenario="A Visão Geral mostra queda de vendas em um período em que a operação costumava vender bem."
              wrong="Agir imediatamente ajustando preço, subindo campanha ou empurrando promoção sem investigar."
              right={[
                { title: "Abra Produtos e Anúncios", text: "Verifique performance por SKU — a queda pode estar concentrada em poucos itens." },
                { title: "Cruze com Central de Ações", text: "Veja o que a IA já identificou como prioridade automática." },
                { title: "Decida a ação certa", text: "Ajuste de preço, campanha, reposição ou correção de anúncio — com base em evidência." },
              ]}
            />
          </Section>

          <Section icon={ArrowRight} eyebrow="H" title="O que fazer depois">
            <NextActionsGrid
              items={[
                { step: "1", title: "Registre a ação", text: "Transforme o ponto de atenção em tarefa em Tarefas da Operação.", icon: ClipboardCheck },
                { step: "2", title: "Acompanhe o impacto", text: "Meça o efeito da ação na tela Resultados das Ações.", icon: BarChart3 },
                { step: "3", title: "Volte no dia seguinte", text: "Retorne à Visão Geral para confirmar se o indicador reagiu.", icon: Compass },
              ]}
            />
          </Section>

          <Section icon={AlertTriangle} eyebrow="I" title="Cuidados e limitações">
            <WarningCallouts
              items={[
                { title: "Conta ativa é obrigatória", text: "Nenhum número faz sentido sem confirmar a conta Mercado Livre selecionada." },
                { title: "Somente leitura", text: "Nenhuma mudança é enviada ao Mercado Livre a partir desta tela." },
                { title: "Nunca decida por 1 card só", text: "Sempre cruze com o módulo específico antes de ajustar preço, estoque ou campanha." },
              ]}
            />
          </Section>

          {/* 12. Checklist clicável */}
          <Section icon={ClipboardCheck} eyebrow="J" title="Checklist de domínio">
            <p className="text-sm text-muted-foreground">
              Marque cada item conforme se sentir confortável com o menu.
              O progresso fica salvo automaticamente neste navegador.
            </p>
            <div className="mt-3">
              <ClickableChecklist
                items={CHECKLIST}
                isDone={(i) => progress[`${GUIDE_ID}.check.${i}`] === "completed"}
                onToggle={(i) => {
                  const key = `${GUIDE_ID}.check.${i}`;
                  const done = progress[key] === "completed";
                  setStatus(key, done ? "not_started" : "completed");
                }}
              />
            </div>
          </Section>
        </div>

        {/* 6. Tour da tela — imagens numeradas ①②③④⑤ */}
        <ScreenTourSection
          title="Conhecendo esta tela"
          description="Referência visual do menu Visão Geral com pontos numerados para futura documentação detalhada de cada elemento."
          mainImage={{
            order: 1,
            title: "Tela Visão Geral — visão completa",
            caption: "Captura oficial do painel Visão Geral do AC360 E-commerce.",
            alt: "Placeholder aguardando captura real da tela Visão Geral do AC360 E-commerce.",
          }}
          items={[
            { title: "Seletor de conta ativa", description: "Área onde o operador confirma qual conta Mercado Livre está sendo lida." },
            { title: "Cards de indicadores principais", description: "Bloco central com os KPIs executivos da operação no período." },
            { title: "Resumo de ações recomendadas", description: "Sinaliza os pontos que a inteligência do AC360 sugere revisar primeiro." },
            { title: "Atalhos para módulos operacionais", description: "Levam direto ao módulo indicado a partir de um sinal identificado." },
            { title: "Status de sincronização", description: "Indica se os dados estão atualizados com o Mercado Livre." },
          ]}
        />

        {/* 7. Inventário da tela — TABELA */}
        <InventoryTable
          title="Inventário da tela Visão Geral"
          description="Cada componente visual desta tela e para que ele serve dentro da rotina."
          rows={[
            { component: "Card", purpose: "Resumo executivo de um indicador", example: "Card de Vendas do dia" },
            { component: "Badge", purpose: "Status rápido de um estado", example: "Sincronizado / Aguardando" },
            { component: "Filtro", purpose: "Pesquisa e recorte", example: "Filtro de período (dia/semana/mês)" },
            { component: "Botão", purpose: "Ação ou navegação", example: "Botão Sincronizar no topbar" },
            { component: "Drawer", purpose: "Detalhamento contextual", example: "Detalhes ao clicar em uma ação recomendada" },
            { component: "Tabela", purpose: "Detalhamento tabular quando aplicável", example: "Ranking de produtos que puxaram a venda" },
            { component: "Indicador visual", purpose: "Sinalização de tendência e alerta", example: "Seta ▲ / ▼ nos cards de KPI" },
          ]}
        />

        {/* 6. Regras importantes */}
        <RulesSection
          items={[
            { label: "Conta ativa", description: "Todos os números refletem a conta Mercado Livre selecionada no topo." },
            { label: "Sincronização", description: "Leitura confiável depende da última sincronização estar atualizada." },
            { label: "Dependências", description: "Alguns cards dependem de dados vindos de Custos, Estoque e Anúncios." },
            { label: "Restrições", description: "Visão Geral é apenas leitura — nenhuma ação é enviada ao Mercado Livre a partir desta tela." },
          ]}
        />

        {/* 9. Boas práticas */}
        <BestPracticesSection
          items={[
            "Abra a Visão Geral no início do turno, antes de qualquer outro módulo.",
            "Confirme sempre a conta ativa antes de ler qualquer indicador.",
            "Compare com a tendência dos últimos dias, nunca com um dia isolado.",
            "Escolha no máximo 1 ou 2 pontos de atenção por rodada de análise.",
            "Registre a ação identificada em Tarefas da Operação imediatamente.",
          ]}
        />

        {/* 10. Erros comuns */}
        <CommonErrorsSection
          items={[
            { title: "Ler dados da conta errada", description: "Analisar indicadores sem confirmar a conta ativa selecionada." },
            { title: "Agir em cima de um dia isolado", description: "Tomar decisão sem comparar com a tendência recente." },
            { title: "Ignorar sincronização defasada", description: "Interpretar como problema real algo que é apenas atraso de dados." },
            { title: "Pular o módulo de aprofundamento", description: "Executar ação direto da Visão Geral sem cruzar com o módulo específico." },
          ]}
        />

        {/* 11. Exemplo prático — timeline Situação → Análise → Decisão → Resultado */}
        <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
              <ScrollText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
                Exemplo prático guiado
              </div>
              <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
                Um dia real usando a Visão Geral
              </h2>
            </div>
          </div>
          <PracticalExampleTimeline
            steps={[
              {
                stage: "Situação",
                title: "Segunda-feira, 08h30 — início do turno",
                text: "Operador abre a Visão Geral e nota que o card de Vendas da Semana está com variação de -18% comparado à semana anterior.",
              },
              {
                stage: "Análise",
                title: "Cruza os cards e a tendência",
                text: "Percebe que a queda está concentrada em 2 SKUs específicos e que houve alteração de preço da concorrência.",
              },
              {
                stage: "Decisão",
                title: "Abre Produtos e Anúncios e Custos e Margem",
                text: "Confirma a margem disponível nos SKUs afetados e decide ajustar preço + subir uma campanha curta para reagir.",
              },
              {
                stage: "Resultado",
                title: "48 horas depois",
                text: "Volta à Visão Geral e confirma que o indicador voltou ao padrão histórico. Registra a ação em Tarefas para não perder o histórico da decisão.",
              },
            ]}
          />
        </section>

        {/* 13. O que você aprendeu */}
        <LearningsSection
          items={[
            "Qual é a missão do menu Visão Geral dentro do AC360 E-commerce.",
            "Como a Visão Geral se conecta com os demais módulos da operação.",
            "Como interpretar cards, KPIs e sinais de tendência.",
            "Quais cuidados tomar antes de agir sobre um indicador.",
            "Para qual módulo aprofundar dependendo do sinal identificado.",
          ]}
        />

        {/* 14. Próximo guia — card premium */}
        <NextGuideCard
          available={false}
          category="Operação Mercado Livre"
          title="Guia do menu Central de Ações"
          description="Aprofunda como transformar sinais da Visão Geral em prioridades e execução real da operação."
          onCompleteCurrent={
            status !== "completed" ? () => setStatus(GUIDE_ID, "completed") : undefined
          }
        />

        {/* 15. Dica do Consultor AC360 — card premium destacado */}
        <ConsultantTipCard
          author="Consultor AC360"
          role="Time de Implantação"
          quote="Antes de abrir Produtos e Anúncios, passe sempre pela Visão Geral. Em menos de dois minutos você identifica onde realmente vale a pena investir seu tempo."
        />

        {/* 16. Mentor IA — preparação (desabilitado) */}
        <MentorIACard
          moduleName="Visão Geral"
          suggestedQuestions={[
            "Por que meu indicador de vendas caiu esta semana?",
            "Qual conta ativa devo priorizar hoje?",
            "Como interpretar variação forte em um único dia?",
            "Qual módulo eu abro depois deste sinal?",
          ]}
        />

        {/* 17. Biblioteca Técnica — arquitetura interna (invisível ao cliente) */}
        <TechnicalLibrarySection
          visible={false}
          references={[
            { code: "AC360-BT-001", title: "Origem dos dados da Visão Geral", description: "Pipeline de sincronização Mercado Livre → base analítica AC360." },
            { code: "AC360-BT-002", title: "Cálculo dos KPIs executivos", description: "Fórmulas oficiais dos cards principais (vendas, ticket médio, margem)." },
            { code: "AC360-BT-003", title: "Regras de sinais e alertas", description: "Critérios usados pela inteligência para destacar pontos de atenção." },
          ]}
        />

        {/* Navegação inferior */}
        <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-border/60 bg-white p-5 shadow-[var(--shadow-soft)]">
          <Link to="/ecommerce/academia" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Voltar para a Academia
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {status !== "completed" && (
              <Button
                size="sm"
                onClick={() => setStatus(GUIDE_ID, "completed")}
                className="w-full sm:w-auto"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Marcar como concluído
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Em breve — próximo guia da série"
              className="w-full sm:w-auto"
            >
              Próximo guia
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </nav>
      </div>
    </EcommerceLayout>
  );
}

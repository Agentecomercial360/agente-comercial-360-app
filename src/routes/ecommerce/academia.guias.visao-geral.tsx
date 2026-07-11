import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Store,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  Target,
  ClipboardCheck,
  Lightbulb,
  AlertTriangle,
  Compass,
  BarChart3,
  BookOpen,
  Image as ImageIcon,
  ShieldCheck,
  Flag,
  HelpCircle,
  Workflow,
  LayoutGrid,
  ScrollText,
  XCircle,
  GraduationCap,
  Sparkles,
  Gauge,
  ListChecks,
  ThumbsUp,
  MinusCircle,
  PlusCircle,
  Quote,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Button } from "@/components/ui/button";
import { useAcademiaProgress, type AcademiaStatus } from "@/lib/academia-progress";

export const Route = createFileRoute("/ecommerce/academia/guias/visao-geral")({
  component: GuiaVisaoGeralPage,
  head: () => ({
    meta: [
      {
        title:
          "Guia do menu Visão Geral | Academia AC360 E-commerce",
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

// Checklist de domínio — mesmos itens usados no drawer (fonte única de verdade
// para o operador). Cada item é armazenado localmente por índice.
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
          <Link
            to="/ecommerce/academia"
            className="hover:text-blue-700 transition-colors"
          >
            Academia
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Guias por Menu</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-foreground">Visão Geral</span>
        </nav>

        {/* Cabeçalho premium */}
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

        {/* 1. Missão do módulo + Objetivo de negócio */}
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

        {/* 2. Pergunta central */}
        <CentralQuestionCard question="Como está minha operação neste momento?" />

        {/* 2.1 Problema que resolve — Sem × Com */}
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

        {/* 2.2 Objetivos de aprendizagem */}
        <LearningObjectivesSection
          objectives={[
            "Interpretar os principais indicadores da operação Mercado Livre.",
            "Entender os alertas e reconhecer sinais de risco.",
            "Identificar rapidamente qual é a prioridade do dia.",
            "Navegar pela tela Visão Geral com segurança e método.",
            "Decidir para qual módulo aprofundar dependendo do sinal.",
          ]}
        />

        {/* 3. Fluxo dentro do AC360 */}
        <ModuleFlow
          title="Fluxo dentro do AC360"
          description="Como a Visão Geral se conecta com os demais módulos operacionais."
          steps={[
            { label: "Visão Geral", hint: "Leitura executiva", highlight: true },
            { label: "Central de Ações", hint: "Prioridades" },
            { label: "Produtos e Anúncios", hint: "Ajuste fino" },
            { label: "Custos e Margem", hint: "Rentabilidade" },
            { label: "Tarefas da Operação", hint: "Execução" },
            { label: "Resultados das Ações", hint: "Impacto" },
          ]}
        />

        {/* Progresso */}
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
                    {status === "in_progress"
                      ? "Pausar estudo"
                      : "Iniciar estudo"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setStatus(GUIDE_ID, "completed")}
                  >
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

        {/* Conteúdo principal */}
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


          <Section
            icon={ClipboardCheck}
            eyebrow="J"
            title="Checklist de domínio"
          >
            <p className="text-sm text-muted-foreground">
              Marque cada item conforme se sentir confortável com o menu.
              O progresso fica salvo automaticamente neste navegador.
            </p>
            <ul className="mt-3 space-y-2">
              {CHECKLIST.map((item, i) => {
                const key = `${GUIDE_ID}.check.${i}`;
                const done = progress[key] === "completed";
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() =>
                        setStatus(key, done ? "not_started" : "completed")
                      }
                      className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        done
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-border/60 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${
                          done
                            ? "text-emerald-800 font-medium"
                            : "text-foreground"
                        }`}
                      >
                        {item}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>

        {/* 4. Conhecendo esta tela — seção dedicada de imagens */}
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

        {/* 5. Componentes da tela */}
        <ComponentsInventory
          items={[
            { label: "Cards", icon: LayoutGrid, description: "Blocos visuais que agrupam informações executivas." },
            { label: "KPIs", icon: BarChart3, description: "Indicadores-chave de performance do período selecionado." },
            { label: "Filtros", icon: Compass, description: "Ajustam o recorte de período, conta e categoria." },
            { label: "Botões", icon: PlayCircle, description: "Ações de navegação e atalhos operacionais." },
            { label: "Tabelas", icon: ScrollText, description: "Detalhamento tabular quando aplicável no módulo." },
            { label: "Drawer", icon: BookOpen, description: "Painel lateral para detalhamento contextual." },
            { label: "Indicadores", icon: Sparkles, description: "Sinalizações visuais de estado, alerta e tendência." },
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

        {/* 6.1 Boas práticas */}
        <BestPracticesSection
          items={[
            "Abra a Visão Geral no início do turno, antes de qualquer outro módulo.",
            "Confirme sempre a conta ativa antes de ler qualquer indicador.",
            "Compare com a tendência dos últimos dias, nunca com um dia isolado.",
            "Escolha no máximo 1 ou 2 pontos de atenção por rodada de análise.",
            "Registre a ação identificada em Tarefas da Operação imediatamente.",
          ]}
        />

        {/* 7. Erros comuns */}
        <CommonErrorsSection
          items={[
            { title: "Ler dados da conta errada", description: "Analisar indicadores sem confirmar a conta ativa selecionada." },
            { title: "Agir em cima de um dia isolado", description: "Tomar decisão sem comparar com a tendência recente." },
            { title: "Ignorar sincronização defasada", description: "Interpretar como problema real algo que é apenas atraso de dados." },
            { title: "Pular o módulo de aprofundamento", description: "Executar ação direto da Visão Geral sem cruzar com o módulo específico." },
          ]}
        />

        {/* 8. O que você aprendeu */}
        <LearningsSection
          items={[
            "Qual é a missão do menu Visão Geral dentro do AC360 E-commerce.",
            "Como a Visão Geral se conecta com os demais módulos da operação.",
            "Como interpretar cards, KPIs e sinais de tendência.",
            "Quais cuidados tomar antes de agir sobre um indicador.",
            "Para qual módulo aprofundar dependendo do sinal identificado.",
          ]}
        />

        {/* 9. Próximo guia — card premium */}
        <NextGuideCard
          available={false}
          category="Operação Mercado Livre"
          title="Guia do menu Central de Ações"
          description="Aprofunda como transformar sinais da Visão Geral em prioridades e execução real da operação."
          onCompleteCurrent={
            status !== "completed"
              ? () => setStatus(GUIDE_ID, "completed")
              : undefined
          }
        />

        {/* 10. Dica do Consultor AC360 — card premium destacado */}
        <ConsultantTipCard
          author="Consultor AC360"
          role="Time de Implantação"
          quote="Antes de abrir Produtos e Anúncios, passe sempre pela Visão Geral. Em menos de dois minutos você identifica onde realmente vale a pena investir seu tempo."
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

// ---------------------------------------------------------------------------
// Sub-componentes de apresentação
// ---------------------------------------------------------------------------

function Section({
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Bloco {eyebrow}
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            {title}
          </h2>
        </div>
      </div>
      <div className="prose prose-sm max-w-none text-sm md:text-[15px] text-foreground/90 leading-relaxed [&_strong]:text-foreground [&_em]:text-foreground/80 space-y-3">
        {children}
      </div>
    </section>
  );
}

/**
 * Placeholder preparado para receber imagens reais do AC360 no futuro.
 * Não usa prints genéricos nem inventados.
 * Ao adicionar a imagem real, substituir o bloco visual por <img src=... />
 * mantendo legenda, título, alt e anotações numeradas.
 */
function ImagePlaceholder({
  order,
  title,
  caption,
  alt,
  annotations,
}: {
  order: number;
  title: string;
  caption: string;
  alt: string;
  annotations: string[];
}) {
  return (
    <figure className="mt-4 overflow-hidden rounded-2xl border border-dashed border-blue-200 bg-blue-50/30">
      <div
        role="img"
        aria-label={alt}
        className="relative aspect-[16/9] w-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-white text-blue-700"
      >
        <ImageIcon className="h-10 w-10 opacity-60" />
        <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
          Imagem {order} — aguardando captura real do AC360
        </div>
        <div className="text-[11px] text-muted-foreground max-w-md text-center px-6">
          {alt}
        </div>
      </div>
      <figcaption className="p-4 md:p-5 space-y-3 bg-white border-t border-blue-100">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
            Imagem {order}
          </div>
          <div className="font-display text-sm md:text-base font-bold text-foreground">
            {title}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{caption}</div>
        </div>
        {annotations.length > 0 && (
          <ol className="space-y-1.5">
            {annotations.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-white text-[10px] font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{a}</span>
              </li>
            ))}
          </ol>
        )}
      </figcaption>
    </figure>
  );
}

function StatusPill({ status }: { status: AcademiaStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Concluído
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
        <PlayCircle className="h-3 w-3" />
        Em estudo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      <Circle className="h-3 w-3" />
      Não iniciado
    </span>
  );
}

// ---------------------------------------------------------------------------
// Blocos arquiteturais reutilizáveis pelos guias da Academia AC360
// (definidos aqui como piloto; poderão ser extraídos para um módulo comum
// assim que outros guias começarem a consumi-los).
// ---------------------------------------------------------------------------

function CentralQuestionCard({ question }: { question: string }) {
  return (
    <section
      aria-label="Pergunta central do módulo"
      className="relative overflow-hidden rounded-2xl border border-blue-200 bg-white p-6 md:p-8 shadow-[var(--shadow-card)]"
    >
      <div
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shrink-0 shadow-lg"
          style={{ background: "var(--gradient-brand)" }}
        >
          <HelpCircle className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Pergunta central deste módulo
          </div>
          <p className="font-display text-xl md:text-2xl font-bold text-foreground mt-2 leading-snug">
            “{question}”
          </p>
          <p className="text-xs md:text-sm text-muted-foreground mt-2">
            Toda vez que abrir este módulo, é essa a pergunta que ele deve
            responder para o operador.
          </p>
        </div>
      </div>
    </section>
  );
}

type FlowStep = { label: string; hint?: string; highlight?: boolean };

function ModuleFlow({
  title,
  description,
  steps,
}: {
  title: string;
  description?: string;
  steps: FlowStep[];
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
          <Workflow className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Fluxo entre módulos
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            {title}
          </h2>
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mb-5 max-w-3xl">
          {description}
        </p>
      )}
      <ol className="flex flex-col gap-2">
        {steps.map((s, i) => (
          <li key={i} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 border ${
                  s.highlight
                    ? "bg-blue-700 text-white border-blue-700"
                    : "bg-white text-blue-700 border-blue-200"
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-blue-200 my-1" />
              )}
            </div>
            <div
              className={`flex-1 rounded-xl border p-3 md:p-4 ${
                s.highlight
                  ? "border-blue-200 bg-blue-50/60"
                  : "border-border/60 bg-white"
              }`}
            >
              <div className="font-display text-sm md:text-base font-bold text-foreground">
                {s.label}
              </div>
              {s.hint && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.hint}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ScreenTourSection({
  title,
  description,
  mainImage,
  items,
}: {
  title: string;
  description?: string;
  mainImage: { order: number; title: string; caption: string; alt: string };
  items: { title: string; description: string }[];
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Tour guiado da tela
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            {title}
          </h2>
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mb-5 max-w-3xl">
          {description}
        </p>
      )}
      <ImagePlaceholder
        order={mainImage.order}
        title={mainImage.title}
        caption={mainImage.caption}
        alt={mainImage.alt}
        annotations={[]}
      />
      <ol className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-4"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold shrink-0">
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold text-foreground">
                {it.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {it.description}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-blue-700/70 font-semibold mt-2">
                Explicação detalhada em breve
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ComponentsInventory({
  items,
}: {
  items: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[];
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
          <LayoutGrid className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Componentes da tela
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            Inventário de elementos deste módulo
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-white p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="font-display text-sm font-bold text-foreground">
                  {it.label}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {it.description}
              </p>
              <div className="text-[10px] uppercase tracking-wider text-blue-700/70 font-semibold mt-3">
                Documentação em breve
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RulesSection({
  items,
}: {
  items: { label: string; description: string }[];
}) {
  return (
    <section className="rounded-2xl border border-amber-100 bg-amber-50/30 p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
          <ScrollText className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
            Regras importantes
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            Regras de negócio deste módulo
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-xl border border-amber-200/70 bg-white p-4"
          >
            <div className="font-display text-sm font-bold text-foreground">
              {it.label}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {it.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CommonErrorsSection({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  return (
    <section className="rounded-2xl border border-rose-100 bg-rose-50/30 p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
          <XCircle className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700">
            Erros comuns
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            O que evitar ao usar este módulo
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-xl border border-rose-200/70 bg-white p-4"
          >
            <div className="font-display text-sm font-bold text-foreground">
              {it.title}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {it.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LearningsSection({ items }: { items: string[] }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            O que você aprendeu
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            Resumo do que este guia entregou
          </h2>
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-white p-3"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground/90 leading-relaxed">
              {t}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NextGuideCard({
  available,
  category,
  title,
  description,
  onCompleteCurrent,
}: {
  available: boolean;
  category: string;
  title: string;
  description: string;
  onCompleteCurrent?: () => void;
}) {
  return (
    <section
      aria-label="Próximo guia"
      className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 md:p-8 shadow-[var(--shadow-card)]"
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Próximo guia
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              {category}
            </span>
            {!available && (
              <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Em breve
              </span>
            )}
          </div>
          <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mt-2 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
          {onCompleteCurrent && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCompleteCurrent}
              className="w-full md:w-auto"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Concluir guia atual
            </Button>
          )}
          <Button
            size="sm"
            disabled={!available}
            className="w-full md:w-auto"
            title={
              available
                ? "Ir para o próximo guia"
                : "Este guia será liberado em breve"
            }
          >
            Continuar aprendizado
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Novos blocos reutilizáveis — padrão de treinamento corporativo
// ---------------------------------------------------------------------------

function ProblemSolutionSection({
  without,
  with_,
}: {
  without: { title: string; points: string[] };
  with_: { title: string; points: string[] };
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 to-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700">
          <MinusCircle className="h-3.5 w-3.5" />
          Cenário atual
        </div>
        <h2 className="font-display text-lg md:text-xl font-bold text-foreground mt-2 leading-tight">
          {without.title}
        </h2>
        <ul className="mt-3 space-y-2">
          {without.points.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <MinusCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
          <PlusCircle className="h-3.5 w-3.5" />
          Cenário com AC360
        </div>
        <h2 className="font-display text-lg md:text-xl font-bold text-foreground mt-2 leading-tight">
          {with_.title}
        </h2>
        <ul className="mt-3 space-y-2">
          {with_.points.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <PlusCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LearningObjectivesSection({ objectives }: { objectives: string[] }) {
  return (
    <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white border border-blue-700 shrink-0">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Objetivos de aprendizagem
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            Ao concluir esta aula você será capaz de:
          </h2>
        </div>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {objectives.map((o, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-blue-100 bg-white p-3"
          >
            <CheckCircle2 className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground/90 leading-relaxed">
              {o}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BestPracticesSection({ items }: { items: string[] }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
          <ThumbsUp className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Boas práticas
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            Como grandes operadores usam este módulo
          </h2>
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-white p-3"
          >
            <ThumbsUp className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground/90 leading-relaxed">
              {t}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ConsultantTipCard({
  author,
  role,
  quote,
}: {
  author: string;
  role: string;
  quote: string;
}) {
  return (
    <section
      aria-label="Dica do Consultor AC360"
      className="relative overflow-hidden rounded-3xl border border-blue-900/20 p-6 md:p-8 shadow-[var(--shadow-card)] text-white"
      style={{ background: "var(--gradient-brand)" }}
    >
      <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-start gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20 shrink-0 backdrop-blur-sm">
          <Quote className="h-7 w-7 text-white" />
        </div>
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">
            <Sparkles className="h-3 w-3" />
            Dica do Consultor AC360
          </div>
          <blockquote className="font-display text-lg md:text-2xl font-bold text-white mt-3 leading-snug">
            “{quote}”
          </blockquote>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white font-bold text-sm border border-white/25">
              {author.charAt(0)}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-white">{author}</div>
              <div className="text-[11px] text-white/80">{role}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Componentes visuais de aprendizado (substituem blocos de texto longo)
// ---------------------------------------------------------------------------

type Tone = "blue" | "emerald" | "amber" | "rose";
const TONE: Record<Tone, { bg: string; border: string; icon: string; chip: string }> = {
  blue: { bg: "bg-blue-50/60", border: "border-blue-200", icon: "bg-blue-700 text-white", chip: "text-blue-700" },
  emerald: { bg: "bg-emerald-50/60", border: "border-emerald-200", icon: "bg-emerald-600 text-white", chip: "text-emerald-700" },
  amber: { bg: "bg-amber-50/60", border: "border-amber-200", icon: "bg-amber-500 text-white", chip: "text-amber-700" },
  rose: { bg: "bg-rose-50/60", border: "border-rose-200", icon: "bg-rose-600 text-white", chip: "text-rose-700" },
};

function CalloutGrid({
  items,
}: {
  items: { tone: Tone; icon: React.ComponentType<{ className?: string }>; title: string; text: string }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 not-prose">
      {items.map((it, i) => {
        const t = TONE[it.tone];
        const Icon = it.icon;
        return (
          <div key={i} className={`rounded-xl border ${t.border} ${t.bg} p-4`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.icon} mb-3`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="font-display text-sm font-bold text-foreground">{it.title}</div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{it.text}</p>
          </div>
        );
      })}
    </div>
  );
}

function ChecklistCards({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 not-prose">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-white p-4 flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold shrink-0">
            {i + 1}
          </div>
          <div className="min-w-0">
            <div className="font-display text-sm font-bold text-foreground">{it.title}</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{it.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnatomyRow({ items }: { items: { label: string; text: string }[] }) {
  return (
    <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-2">
      {items.map((it, i) => (
        <div
          key={i}
          className="relative rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-4"
        >
          <div className="absolute top-3 right-3 text-[10px] font-mono font-bold text-blue-700/40">
            0{i + 1}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Elemento
          </div>
          <div className="font-display text-base font-bold text-foreground mt-1">{it.label}</div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{it.text}</p>
        </div>
      ))}
    </div>
  );
}

function InterpretationTable({ rows }: { rows: { signal: string; action: string }[] }) {
  return (
    <div className="not-prose overflow-hidden rounded-xl border border-border/60 bg-white">
      <div className="grid grid-cols-[1.2fr,1.5fr] bg-muted/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <div>Sinal identificado</div>
        <div>Como interpretar</div>
      </div>
      <ul className="divide-y divide-border/60">
        {rows.map((r, i) => (
          <li key={i} className="grid grid-cols-[1.2fr,1.5fr] gap-3 px-4 py-3">
            <div className="flex items-start gap-2 text-sm font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              {r.signal}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">{r.action}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OperationalTimeline({
  steps,
}: {
  steps: { title: string; text: string; icon: React.ComponentType<{ className?: string }> }[];
}) {
  return (
    <ol className="not-prose relative space-y-3">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const last = i === steps.length - 1;
        return (
          <li key={i} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white shadow-md shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              {!last && <div className="w-px flex-1 bg-blue-200 my-1" />}
            </div>
            <div className="flex-1 rounded-xl border border-border/60 bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Etapa {i + 1}
                </span>
              </div>
              <div className="font-display text-sm md:text-base font-bold text-foreground mt-0.5">
                {s.title}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                {s.text}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ScenarioCard({
  scenario,
  wrong,
  right,
}: {
  scenario: string;
  wrong: string;
  right: { title: string; text: string }[];
}) {
  return (
    <div className="not-prose space-y-3">
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          Cenário
        </div>
        <p className="font-display text-base md:text-lg font-bold text-foreground mt-2 leading-snug">
          {scenario}
        </p>
      </div>
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 flex items-center gap-1.5">
          <XCircle className="h-3.5 w-3.5" />
          Reação errada
        </div>
        <p className="text-sm text-foreground/90 mt-1.5 leading-relaxed">{wrong}</p>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Caminho correto
        </div>
        <ol className="mt-3 space-y-2">
          {right.map((r, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-emerald-200/70 bg-white p-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="font-display text-sm font-bold text-foreground">{r.title}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function NextActionsGrid({
  items,
}: {
  items: { step: string; title: string; text: string; icon: React.ComponentType<{ className?: string }> }[];
}) {
  return (
    <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div
            key={i}
            className="relative rounded-xl border border-border/60 bg-white p-4 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: "var(--gradient-brand)" }} />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-display text-2xl font-bold text-blue-700/30">{it.step}</span>
            </div>
            <div className="font-display text-sm font-bold text-foreground mt-2">{it.title}</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{it.text}</p>
          </div>
        );
      })}
    </div>
  );
}

function WarningCallouts({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="not-prose space-y-2.5">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border-l-4 border-amber-400 border-y border-r border-y-amber-100 border-r-amber-100 bg-amber-50/50 p-4"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="font-display text-sm font-bold text-foreground">{it.title}</div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">{it.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

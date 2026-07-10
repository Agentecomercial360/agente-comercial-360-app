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
                  <StatusPill status={status} />
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-2">
                  {GUIDE_TITLE}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                  {GUIDE_DESCRIPTION}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                  <Compass className="h-3 w-3" />
                  Rota: {GUIDE_ROUTE}
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
          <Section
            icon={Target}
            eyebrow="A"
            title="Objetivo do menu"
          >
            <p>
              O menu <strong>Visão Geral</strong> é o painel executivo da
              operação Mercado Livre no AC360 E-commerce. Ele reúne, em uma
              única tela, os principais indicadores da conta ativa para que o
              operador entenda rapidamente <em>como o negócio está se
              comportando hoje</em> e <em>onde investir atenção primeiro</em>.
            </p>
            <p>
              O objetivo não é analisar todos os detalhes aqui, e sim{" "}
              <strong>identificar sinais</strong> e decidir para qual módulo
              aprofundar (Central de Ações, Produtos e Anúncios, Custos e
              Margem, Estoque, etc.).
            </p>
          </Section>

          <Section
            icon={ShieldCheck}
            eyebrow="B"
            title="Antes de usar"
          >
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Confirme que a <strong>conta Mercado Livre correta</strong>{" "}
                está selecionada no topo da tela.
              </li>
              <li>
                Verifique se a última <strong>sincronização</strong> está
                atualizada (badge “Sincronizado” no topbar).
              </li>
              <li>
                Tenha em mente o <strong>período de referência</strong> que
                você quer analisar (dia, semana, mês).
              </li>
            </ul>
          </Section>

          <Section
            icon={Compass}
            eyebrow="C"
            title="Conhecendo a tela"
          >
            <p>
              A tela Visão Geral está organizada em blocos: identificação da
              conta ativa, cards de indicadores principais, resumo de ações
              recomendadas e atalhos para os módulos operacionais.
            </p>
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

          <Section
            icon={BarChart3}
            eyebrow="D"
            title="Indicadores e cards"
          >
            <p>
              Cada card representa um indicador executivo da operação. A
              leitura correta segue sempre a mesma lógica: <strong>valor
              atual</strong>, <strong>variação em relação ao período
              anterior</strong> e <strong>tendência</strong>.
            </p>
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

          <Section
            icon={Lightbulb}
            eyebrow="E"
            title="Como interpretar os dados"
          >
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Foque primeiro nos indicadores <strong>fora da tendência
                esperada</strong>. Números estáveis não pedem ação; variações
                fortes sim.
              </li>
              <li>
                Não tire conclusões olhando apenas <strong>um dia
                isolado</strong> — compare com a tendência recente.
              </li>
              <li>
                Cruze o que ver aqui com <strong>Central de Ações</strong>{" "}
                para entender <em>por que</em> um indicador variou.
              </li>
            </ul>
          </Section>

          <Section
            icon={PlayCircle}
            eyebrow="F"
            title="Passo a passo operacional"
          >
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Acesse Visão Geral no menu lateral.</li>
              <li>Confirme a conta ativa no topo.</li>
              <li>
                Leia os cards principais sem se perder em detalhes secundários.
              </li>
              <li>Identifique 1 ou 2 pontos que exigem atenção.</li>
              <li>
                Vá direto ao módulo correspondente ao ponto de atenção (ex.
                Central de Ações, Produtos e Anúncios, Custos e Margem,
                Estoque).
              </li>
            </ol>
          </Section>

          <Section
            icon={BookOpen}
            eyebrow="G"
            title="Exemplo prático"
          >
            <p>
              Se a Visão Geral mostra <strong>queda de vendas</strong> em um
              período em que a operação costumava vender bem, o próximo passo
              não é agir imediatamente. Antes:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 mt-2">
              <li>Abra <strong>Produtos e Anúncios</strong> para verificar performance por SKU.</li>
              <li>Cruze com <strong>Central de Ações</strong> para ver o que já foi identificado como prioridade.</li>
              <li>Só então decida a ação (ajuste de preço, campanha, reposição, etc.).</li>
            </ol>
          </Section>

          <Section
            icon={ArrowRight}
            eyebrow="H"
            title="O que fazer depois"
          >
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Transforme o ponto de atenção em uma <strong>tarefa</strong>{" "}
                em <em>Tarefas da Operação</em>.
              </li>
              <li>
                Acompanhe o impacto pela tela <em>Resultados das Ações</em>.
              </li>
              <li>
                Retorne à Visão Geral no dia seguinte para confirmar se o
                indicador reagiu.
              </li>
            </ul>
          </Section>

          <Section
            icon={AlertTriangle}
            eyebrow="I"
            title="Cuidados e limitações"
          >
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Os números só fazem sentido com a <strong>conta ativa
                correta</strong> selecionada.
              </li>
              <li>
                Visão Geral é <strong>leitura</strong>, não execução — nenhuma
                mudança é enviada ao Mercado Livre a partir desta tela.
              </li>
              <li>
                Não decida ajustes de preço, estoque ou campanhas apenas com
                base em um único card sem cruzar com o módulo específico.
              </li>
            </ul>
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

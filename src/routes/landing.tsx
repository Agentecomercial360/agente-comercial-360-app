import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageSquare,
  Bot,
  TrendingUp,
  Target,
  Zap,
  Workflow,
  BarChart3,
  Phone,
  Repeat,
  FileBarChart,
  CheckCircle2,
} from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import heroCorporate from "@/assets/hero-corporate.jpg.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Agente Comercial 360 — Atendimento, CRM e IA em uma só plataforma" },
      {
        name: "description",
        content:
          "Transforme atendimento em crescimento comercial. Organize conversas, automatize processos e acompanhe sua operação com clareza, controle e eficiência.",
      },
      {
        property: "og:title",
        content: "Agente Comercial 360 — Plataforma comercial inteligente",
      },
      {
        property: "og:description",
        content:
          "WhatsApp, CRM e IA integrados para transformar atendimento em vendas previsíveis.",
      },
    ],
  }),
});

/* ------------------------------------------------------------------ */
/* Tokens                                                             */
/* ------------------------------------------------------------------ */

const NAVY = "oklch(0.22 0.06 262)";
const NAVY_DEEP = "oklch(0.16 0.05 262)";
const BLUE = "oklch(0.55 0.18 262)";
const BLUE_DEEP = "oklch(0.42 0.18 262)";

/* ------------------------------------------------------------------ */
/* Primitives                                                         */
/* ------------------------------------------------------------------ */

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = "blue",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent?: "blue" | "navy";
}) {
  return (
    <div className="group relative flex flex-col rounded-2xl bg-white p-7 sm:p-8 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)]">
      <div
        className="mb-5 inline-flex size-12 items-center justify-center rounded-xl"
        style={{
          background:
            accent === "navy"
              ? `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})`
              : `linear-gradient(135deg, ${BLUE}, ${BLUE_DEEP})`,
        }}
      >
        <Icon className="size-6 text-white" />
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function FocusBlock({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <div
        className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl"
        style={{
          background: "oklch(0.97 0.02 262)",
          color: BLUE_DEEP,
        }}
      >
        <Icon className="size-7" />
      </div>
      <h4 className="mb-2 text-base font-semibold text-slate-900">{title}</h4>
      <p className="text-sm leading-relaxed text-slate-600 max-w-[240px]">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ============== HEADER + HERO (com imagem corporativa) ============== */}
      <section id="top" className="relative">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroCorporate.url}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: 'brightness(1.05) contrast(1.08)' }}
            fetchPriority="high"
          />
          {/* Soft left-to-right gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(5,18,45,0.55) 0%, rgba(5,18,45,0.28) 45%, rgba(5,18,45,0.10) 100%)',
            }}
          />
          {/* Subtle radial glow for depth */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 20% 30%, oklch(0.55 0.18 262 / 0.20), transparent 60%)',
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
            <a href="#top" className="flex items-center gap-2.5">
              <img src={acLogo} alt="Agente Comercial 360" className="h-9 w-auto" />
            </a>
            <nav className="hidden items-center gap-8 text-sm font-medium text-white/85 md:flex">
              <a href="#top" className="transition-colors hover:text-white">Início</a>
              <a href="#solucoes" className="transition-colors hover:text-white">Soluções</a>
              <a href="#como-funciona" className="transition-colors hover:text-white">Como funciona</a>
              <a href="#recursos" className="transition-colors hover:text-white">Recursos</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden text-sm font-medium text-white/85 transition-colors hover:text-white sm:inline-block"
              >
                Entrar no painel
              </Link>
              <a href="#cta-final">
                <Button
                  className="h-10 rounded-full px-5 text-sm font-semibold text-white shadow-lg shadow-black/20"
                  style={{ background: BLUE }}
                >
                  Solicitar demonstração
                </Button>
              </a>
            </div>
          </header>

          {/* Hero content */}
          <div className="mx-auto max-w-7xl px-6 pt-12 pb-44 sm:pt-20 sm:pb-56 lg:px-10">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                <span className="size-1.5 rounded-full bg-white" />
                Plataforma comercial inteligente
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[64px]">
                Transforme atendimento em{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #ffffff 0%, oklch(0.82 0.10 240) 100%)",
                  }}
                >
                  crescimento comercial.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
                Organize conversas, automatize processos e acompanhe sua operação com mais
                clareza, controle e eficiência.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href="#cta-final">
                  <Button
                    size="lg"
                    className="h-12 rounded-full px-7 text-sm font-semibold text-white shadow-xl shadow-black/30"
                    style={{ background: BLUE }}
                  >
                    Solicitar demonstração
                    <ArrowRight className="ml-1 size-4" />
                  </Button>
                </a>
                <a href="#como-funciona">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/30 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white"
                  >
                    Ver como funciona
                  </Button>
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" /> Implantação assistida
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" /> WhatsApp oficial
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" /> Suporte humano
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Three overlapping cards */}
        <div className="relative z-10 mx-auto -mt-32 max-w-7xl px-6 sm:-mt-36 lg:px-10">
          <div id="solucoes" className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={MessageSquare}
              title="Atendimento Inteligente"
              description="Centralize todas as conversas de WhatsApp em uma caixa única, com histórico, filas e respostas assistidas por IA."
            />
            <FeatureCard
              icon={Bot}
              title="Automação Comercial"
              description="Crie fluxos automáticos de qualificação, follow-up e distribuição de leads sem depender de planilhas."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Gestão e Crescimento"
              description="Acompanhe métricas, conversão e produtividade da equipe em painéis claros e em tempo real."
              accent="navy"
            />
          </div>
        </div>

        {/* Bottom curve into white */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ============== FOCUS SECTION ============== */}
      <section id="como-funciona" className="bg-white pt-28 pb-20 sm:pt-36 sm:pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: BLUE_DEEP }}
            >
              Nosso foco
            </span>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Uma operação comercial mais organizada e previsível
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
              Quatro pilares que sustentam empresas que querem escalar com qualidade,
              sem perder o controle do atendimento e do funil.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-y-12 sm:gap-x-6 md:grid-cols-4">
            <FocusBlock
              icon={Target}
              title="Organização"
              description="Conversas, leads e tarefas centralizados em um só lugar."
            />
            <FocusBlock
              icon={Zap}
              title="Eficiência"
              description="Menos tempo em tarefas manuais e mais foco em vendas."
            />
            <FocusBlock
              icon={Workflow}
              title="Automação"
              description="Fluxos inteligentes que trabalham por você 24/7."
            />
            <FocusBlock
              icon={BarChart3}
              title="Análise"
              description="Decisões baseadas em dados, não em achismos."
            />
          </div>
        </div>
      </section>

      {/* ============== RECURSOS — 3 CARDS ============== */}
      <section id="recursos" className="bg-slate-50 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: BLUE_DEEP }}
            >
              Recursos principais
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Tudo o que sua equipe comercial precisa
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Ferramentas integradas que conectam atendimento, processo e resultado.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Phone}
              title="WhatsApp + CRM"
              description="Integração nativa com WhatsApp e CRM completo: cada mensagem vira oportunidade rastreável dentro do funil."
            />
            <FeatureCard
              icon={Repeat}
              title="Follow-up Automatizado"
              description="Cadências inteligentes que reengajam leads no momento certo, sem esforço manual da equipe."
              accent="navy"
            />
            <FeatureCard
              icon={FileBarChart}
              title="Relatórios Gerenciais"
              description="Visão clara de conversão, performance por vendedor e gargalos do funil em dashboards executivos."
            />
          </div>
        </div>
      </section>

      {/* ============== CTA FINAL ============== */}
      <section id="cta-final" className="relative overflow-hidden bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div
            className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 50%, ${BLUE_DEEP} 100%)`,
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse at top right, oklch(0.55 0.20 262 / 0.7), transparent 60%)",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Pronto para transformar seu atendimento em crescimento?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
                Agende uma demonstração e veja como o Agente Comercial 360 pode ser aplicado
                na sua empresa.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <a href="https://wa.me/" target="_blank" rel="noreferrer">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-slate-900 shadow-lg hover:bg-white/90"
                  >
                    Solicitar demonstração
                    <ArrowRight className="ml-1 size-4" />
                  </Button>
                </a>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/30 bg-transparent px-8 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
                  >
                    Entrar no painel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 sm:flex-row lg:px-10">
          <div className="flex items-center gap-2.5">
            <img src={acLogo} alt="Agente Comercial 360" className="h-7 w-auto" />
          </div>
          <p>© {new Date().getFullYear()} Agente Comercial 360. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="#solucoes" className="hover:text-slate-900">Soluções</a>
            <a href="#recursos" className="hover:text-slate-900">Recursos</a>
            <Link to="/login" className="hover:text-slate-900">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

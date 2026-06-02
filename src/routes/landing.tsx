import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Sparkles,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Target,
  Compass,
  TrendingUp,
  Workflow,
  Zap,
  Database,
  Mail,
  Webhook,
  Phone,
  ChevronDown,
  Check,
  Star,
  Shield,
  Headphones,
  GitBranch,
  Activity,
  Search,
  Settings2,
  PlayCircle,
} from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import heroDashboard from "@/assets/hero-dashboard.png.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Agente Comercial 360 — CRM, WhatsApp e IA para vender mais" },
      {
        name: "description",
        content:
          "Centralize WhatsApp, CRM e IA em uma plataforma comercial inteligente. Organize leads, automatize follow-ups e acompanhe sua operação em tempo real.",
      },
      {
        property: "og:title",
        content: "Agente Comercial 360 — Plataforma comercial inteligente",
      },
      {
        property: "og:description",
        content:
          "CRM, WhatsApp e IA para transformar atendimento em vendas. Operação comercial premium em uma só plataforma.",
      },
    ],
  }),
});

/* ------------------------------------------------------------------ */
/* Small primitives                                                   */
/* ------------------------------------------------------------------ */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.55_0.18_262)]/15 bg-[oklch(0.55_0.18_262)]/[0.06] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.40_0.18_262)]">
      <span className="size-1.5 rounded-full bg-[oklch(0.55_0.22_262)]" />
      {children}
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-3xl text-center"
          : "max-w-2xl text-left"
      }
    >
      <div className={align === "center" ? "flex justify-center" : ""}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2 className="font-display mt-5 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[oklch(0.18_0.03_262)] sm:text-[2.4rem] lg:text-[2.85rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Product mockup pieces — reused                                     */
/* ------------------------------------------------------------------ */

function MockupFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-3xl border border-[oklch(0.20_0.03_262)]/10 bg-white p-2 shadow-[0_40px_80px_-30px_oklch(0.20_0.10_262/_0.30)] ${className}`}
    >
      <div className="overflow-hidden rounded-2xl border border-[oklch(0.20_0.03_262)]/8 bg-gradient-to-br from-[oklch(0.99_0.005_262)] to-[oklch(0.97_0.012_262)]">
        {children}
      </div>
    </div>
  );
}

/* Hero product mockup — real dashboard screenshot, framed as a premium product */
function HeroMockup() {
  return (
    <div className="relative w-full">
      {/* Ambient brand glow behind frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-12 -z-10 rounded-[3rem] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(55% 55% at 30% 25%, oklch(0.55 0.22 262 / 0.32), transparent 70%), radial-gradient(50% 50% at 80% 80%, oklch(0.30 0.18 262 / 0.28), transparent 70%)",
        }}
      />

      {/* Browser-style frame holding the real product screenshot */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/70 p-1.5 shadow-[0_60px_140px_-30px_oklch(0.18_0.10_262/_0.55),0_0_0_1px_oklch(0.55_0.18_262/_0.08)] backdrop-blur-xl sm:rounded-3xl sm:p-2"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.99 0.01 262 / 0.92), oklch(0.95 0.02 262 / 0.88))",
        }}
      >
        {/* Top window chrome */}
        <div className="flex items-center justify-between rounded-t-xl bg-white/75 px-4 py-2.5 sm:rounded-t-2xl">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[oklch(0.78_0.18_25)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.85_0.16_85)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.72_0.18_150)]" />
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-[oklch(0.97_0.012_262)] px-3 py-1 text-[10.5px] text-muted-foreground">
            <Search className="size-3" /> app.agentecomercial360.com.br
          </div>
          <div className="size-5 rounded-full bg-gradient-to-br from-primary to-[oklch(0.28_0.14_262)]" />
        </div>

        {/* Screenshot */}
        <div className="overflow-hidden rounded-b-xl border-t border-[oklch(0.20_0.03_262)]/10 sm:rounded-b-2xl">
          <img
            src={heroDashboard.url}
            alt="Painel Gestão 360 do Agente Comercial 360"
            className="block h-auto w-full"
            loading="eager"
          />
        </div>

        {/* Subtle inner highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl"
          style={{
            background:
              "linear-gradient(180deg, oklch(1 0 0 / 0.10), transparent 18%, transparent 82%, oklch(0.20 0.10 262 / 0.04))",
          }}
        />
      </div>
    </div>
  );
}

/* CRM funnel mockup */
function FunnelMockup() {
  const stages = [
    { name: "Novo lead", count: 48, color: "oklch(0.85 0.10 262)" },
    { name: "Qualificado", count: 32, color: "oklch(0.70 0.16 262)" },
    { name: "Proposta", count: 18, color: "oklch(0.55 0.20 262)" },
    { name: "Negociação", count: 9, color: "oklch(0.40 0.20 262)" },
    { name: "Ganho", count: 4, color: "oklch(0.28 0.14 262)" },
  ];
  return (
    <MockupFrame>
      <div className="border-b border-[oklch(0.20_0.03_262)]/6 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-primary" />
            <span className="text-[12px] font-semibold text-[oklch(0.18_0.03_262)]">
              Funil Comercial
            </span>
          </div>
          <span className="rounded-md bg-[oklch(0.97_0.012_262)] px-2 py-0.5 text-[10px] text-muted-foreground">
            Outubro 2026
          </span>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 p-3">
        {stages.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-[oklch(0.20_0.03_262)]/8 bg-white p-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                {s.name}
              </span>
              <span
                className="size-2 rounded-full"
                style={{ background: s.color }}
              />
            </div>
            <div className="mt-1 font-display text-base font-semibold text-[oklch(0.18_0.03_262)]">
              {s.count}
            </div>
            <div className="mt-2 space-y-1">
              {Array.from({ length: Math.min(3, Math.ceil(s.count / 12)) }).map(
                (_, j) => (
                  <div
                    key={j}
                    className="rounded-md border border-[oklch(0.20_0.03_262)]/6 bg-[oklch(0.98_0.005_262)] p-1.5"
                  >
                    <div className="h-1 w-2/3 rounded-full bg-[oklch(0.90_0.02_262)]" />
                    <div className="mt-1 h-1 w-1/2 rounded-full bg-[oklch(0.93_0.02_262)]" />
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[oklch(0.20_0.03_262)]/6 bg-white px-4 py-2.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Conversão geral</span>
          <span className="font-semibold text-[oklch(0.18_0.03_262)]">8.3%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[oklch(0.95_0.012_262)]">
          <div className="h-full w-[8.3%] rounded-full bg-gradient-to-r from-primary to-[oklch(0.28_0.14_262)]" />
        </div>
      </div>
    </MockupFrame>
  );
}

/* AI workflow mockup */
function AiFlowMockup() {
  return (
    <MockupFrame>
      <div className="border-b border-[oklch(0.20_0.03_262)]/6 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-primary" />
          <span className="text-[12px] font-semibold text-[oklch(0.18_0.03_262)]">
            Agente de IA · Fluxo de qualificação
          </span>
        </div>
      </div>
      <div className="space-y-2.5 p-4">
        {[
          {
            icon: MessageSquare,
            t: "Nova mensagem recebida",
            d: "WhatsApp · Mariana Silva",
            tag: "Entrada",
          },
          {
            icon: Sparkles,
            t: "IA analisou intenção",
            d: "Interesse em plano profissional · score 92",
            tag: "Análise",
            active: true,
          },
          {
            icon: GitBranch,
            t: "Classificado e movido no funil",
            d: "Etapa: Proposta · Prioridade alta",
            tag: "CRM",
          },
          {
            icon: Users,
            t: "Encaminhado para humano",
            d: "Responsável: Equipe comercial sênior",
            tag: "Handoff",
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-xl border p-2.5 transition-colors ${
              s.active
                ? "border-primary/30 bg-gradient-to-r from-[oklch(0.55_0.18_262)]/5 to-transparent"
                : "border-[oklch(0.20_0.03_262)]/8 bg-white"
            }`}
          >
            <div
              className={`grid size-8 place-items-center rounded-lg ${
                s.active
                  ? "bg-gradient-to-br from-primary to-[oklch(0.28_0.14_262)] text-white"
                  : "bg-[oklch(0.95_0.012_262)] text-primary"
              }`}
            >
              <s.icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-[oklch(0.18_0.03_262)]">
                {s.t}
              </div>
              <div className="text-[9.5px] text-muted-foreground">{s.d}</div>
            </div>
            <span className="rounded-md bg-[oklch(0.97_0.012_262)] px-1.5 py-0.5 text-[8.5px] font-medium text-muted-foreground">
              {s.tag}
            </span>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ accordion                                                       */
/* ------------------------------------------------------------------ */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all ${
        open
          ? "border-primary/25 bg-white shadow-[0_20px_50px_-25px_oklch(0.28_0.14_262/_0.20)]"
          : "border-[oklch(0.20_0.03_262)]/10 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <span className="text-[14px] font-semibold text-[oklch(0.18_0.03_262)] sm:text-[15px]">
          {q}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-[oklch(0.20_0.03_262)]/8 px-5 pb-5 pt-3 text-[14px] leading-relaxed text-muted-foreground sm:px-6">
          {a}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* ============================================================== */}
      {/* HEADER                                                          */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 border-b border-[oklch(0.20_0.03_262)]/8 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <img src={acLogo} alt="Agente Comercial 360" className="h-9 w-9 rounded-lg" />
            <span className="font-display text-[15px] font-semibold tracking-tight text-[oklch(0.18_0.03_262)]">
              Agente Comercial <span className="text-primary">360</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-muted-foreground lg:flex">
            <a href="#plataforma" className="transition-colors hover:text-[oklch(0.18_0.03_262)]">Plataforma</a>
            <a href="#solucoes" className="transition-colors hover:text-[oklch(0.18_0.03_262)]">Soluções</a>
            <a href="#ia" className="transition-colors hover:text-[oklch(0.18_0.03_262)]">IA e Automação</a>
            <a href="#planos" className="transition-colors hover:text-[oklch(0.18_0.03_262)]">Planos</a>
            <a href="#faq" className="transition-colors hover:text-[oklch(0.18_0.03_262)]">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden text-[13px] font-medium text-muted-foreground transition-colors hover:text-[oklch(0.18_0.03_262)] sm:inline-block sm:px-3"
            >
              Entrar no painel
            </Link>
            <a href="#cta-final">
              <Button size="sm" className="gap-1.5 rounded-full px-4 shadow-[0_8px_24px_-10px_oklch(0.28_0.14_262/_0.45)]">
                Solicitar demonstração <ArrowRight className="size-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* HERO                                                            */}
      {/* ============================================================== */}
      <section id="top" className="relative overflow-hidden bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 90% 65% at 80% 8%, oklch(0.92 0.07 262 / 0.55) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 5% 95%, oklch(0.95 0.04 262 / 0.45) 0%, transparent 65%), linear-gradient(180deg, oklch(0.998 0.002 258) 0%, oklch(0.97 0.012 258) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.28]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.55 0.18 262 / 0.08) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.18 262 / 0.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 70% 40%, black 20%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 70% 40%, black 20%, transparent 80%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
            <div>
              <Eyebrow>Plataforma de Inteligência Comercial</Eyebrow>
              <h1 className="font-display mt-6 text-[2.3rem] font-semibold leading-[1.03] tracking-[-0.035em] text-[oklch(0.18_0.03_262)] sm:text-[2.8rem] md:text-[3.1rem] lg:text-[3.35rem]">
                CRM, WhatsApp e IA para transformar{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(120deg, oklch(0.55 0.22 258), oklch(0.28 0.14 262))",
                  }}
                >
                  atendimento em vendas
                </span>
                .
              </h1>
              <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-muted-foreground sm:text-[17px]">
                Centralize conversas, organize leads, automatize follow-ups e
                acompanhe sua operação comercial em uma plataforma inteligente
                criada para empresas que querem vender com mais controle.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href="#cta-final">
                  <Button
                    size="lg"
                    className="h-12 w-full gap-2 rounded-full px-6 text-[14px] font-semibold shadow-[0_18px_40px_-15px_oklch(0.28_0.14_262/_0.55)] sm:w-auto"
                  >
                    Solicitar demonstração <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="#plataforma">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full gap-2 rounded-full border-[oklch(0.20_0.03_262)]/15 bg-white/70 px-6 text-[14px] font-semibold text-[oklch(0.18_0.03_262)] hover:bg-white sm:w-auto"
                  >
                    <PlayCircle className="size-4" /> Ver como funciona
                  </Button>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-[oklch(0.55_0.18_150)]" />
                  Implantação guiada
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-[oklch(0.55_0.18_150)]" />
                  Dados na sua operação
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-[oklch(0.55_0.18_150)]" />
                  Suporte estratégico
                </span>
              </div>
            </div>

            {/* Right side — premium mockup */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-[40px] opacity-70 blur-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 40%, oklch(0.55 0.22 262 / 0.30), transparent 70%)",
                }}
              />
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* TRUST STRIP                                                     */}
      {/* ============================================================== */}
      <section className="border-y border-[oklch(0.20_0.03_262)]/8 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { icon: MessageSquare, label: "Atendimento centralizado" },
              { icon: Users, label: "Leads organizados" },
              { icon: Bot, label: "IA comercial ativa" },
              { icon: Clock, label: "Follow-up monitorado" },
              { icon: BarChart3, label: "Relatórios em tempo real" },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-[oklch(0.95_0.03_262)] text-primary">
                  <t.icon className="size-4" />
                </div>
                <span className="text-[12.5px] font-medium text-[oklch(0.18_0.03_262)]">
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SOLUÇÕES — 3 grandes cards                                      */}
      {/* ============================================================== */}
      <section id="solucoes" className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle
            eyebrow="Soluções"
            title={
              <>
                Soluções para sua{" "}
                <span className="text-primary">operação comercial</span>
              </>
            }
            subtitle="Atendimento, vendas e inteligência artificial trabalhando juntos em uma única plataforma."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                tag: "Atendimento",
                title: "Conversas, responsáveis e histórico em um só lugar.",
                desc: "Organize todos os canais de atendimento e tenha visão completa de cada cliente.",
                points: [
                  "Inbox unificado",
                  "Atribuição por responsável",
                  "Histórico cronológico",
                ],
              },
              {
                icon: GitBranch,
                tag: "CRM e Vendas",
                title: "Leads, funil e oportunidades sob controle.",
                desc: "Acompanhe pipeline, follow-ups e oportunidades com clareza comercial.",
                points: [
                  "Funil personalizável",
                  "Priorização por score",
                  "Follow-up automatizado",
                ],
                featured: true,
              },
              {
                icon: Bot,
                tag: "Inteligência Artificial",
                title: "IA para qualificar, responder e apoiar sua equipe.",
                desc: "Use IA para qualificar contatos, responder demandas e ganhar velocidade comercial.",
                points: [
                  "Qualificação automática",
                  "Respostas contextuais",
                  "Suporte ao time humano",
                ],
              },
            ].map((s, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-3xl border p-7 transition-all hover:-translate-y-0.5 ${
                  s.featured
                    ? "border-transparent bg-gradient-to-br from-[oklch(0.18_0.06_262)] to-[oklch(0.28_0.14_262)] text-white shadow-[0_30px_60px_-25px_oklch(0.28_0.14_262/_0.55)]"
                    : "border-[oklch(0.20_0.03_262)]/10 bg-white shadow-[0_10px_30px_-15px_oklch(0.28_0.14_262/_0.15)] hover:border-primary/25 hover:shadow-[0_25px_55px_-25px_oklch(0.28_0.14_262/_0.30)]"
                }`}
              >
                {s.featured && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full opacity-50 blur-3xl"
                    style={{
                      background: "radial-gradient(circle, oklch(0.55 0.22 262), transparent 70%)",
                    }}
                  />
                )}
                <div
                  className={`relative grid size-12 place-items-center rounded-2xl ${
                    s.featured
                      ? "bg-white/10 text-white"
                      : "bg-gradient-to-br from-primary to-[oklch(0.28_0.14_262)] text-white"
                  }`}
                >
                  <s.icon className="size-5" />
                </div>
                <div
                  className={`relative mt-5 text-[10.5px] font-semibold uppercase tracking-[0.16em] ${
                    s.featured ? "text-white/60" : "text-primary"
                  }`}
                >
                  {s.tag}
                </div>
                <h3
                  className={`relative font-display mt-2 text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] ${
                    s.featured ? "text-white" : "text-[oklch(0.18_0.03_262)]"
                  }`}
                >
                  {s.title}
                </h3>
                <p
                  className={`relative mt-3 text-[13.5px] leading-relaxed ${
                    s.featured ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {s.desc}
                </p>
                <ul className="relative mt-5 space-y-2">
                  {s.points.map((p, j) => (
                    <li
                      key={j}
                      className={`flex items-center gap-2 text-[13px] ${
                        s.featured ? "text-white/85" : "text-[oklch(0.30_0.04_262)]"
                      }`}
                    >
                      <CheckCircle2
                        className={`size-4 shrink-0 ${
                          s.featured ? "text-[oklch(0.85_0.15_180)]" : "text-primary"
                        }`}
                      />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* PLATAFORMA — Atendimento + WhatsApp                             */}
      {/* ============================================================== */}
      <section
        id="plataforma"
        className="relative overflow-hidden bg-gradient-to-b from-[oklch(0.985_0.005_258)] to-white py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>Atendimento + WhatsApp</Eyebrow>
              <h2 className="font-display mt-5 text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] text-[oklch(0.18_0.03_262)] sm:text-[2.4rem] lg:text-[2.7rem]">
                Todas as conversas{" "}
                <span className="text-primary">centralizadas e organizadas</span>.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                Inbox único com atendimento humano e IA trabalhando juntos.
                Cada conversa com contexto, responsável e histórico completo.
              </p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "Conversas em tempo real",
                  "Histórico por cliente",
                  "Responsáveis por atendimento",
                  "WhatsApp oficial integrado",
                  "IA + atendimento humano",
                  "Atribuição inteligente",
                ].map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-[13.5px] text-[oklch(0.25_0.03_262)]"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-8 -z-10 rounded-[40px] opacity-60 blur-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at 60% 50%, oklch(0.55 0.22 262 / 0.22), transparent 70%)",
                }}
              />
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CRM + FUNIL                                                     */}
      {/* ============================================================== */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1 relative">
              <div
                aria-hidden
                className="absolute -inset-8 -z-10 rounded-[40px] opacity-60 blur-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at 40% 50%, oklch(0.55 0.22 262 / 0.20), transparent 70%)",
                }}
              />
              <FunnelMockup />
            </div>
            <div className="order-1 lg:order-2">
              <Eyebrow>CRM + Funil Comercial</Eyebrow>
              <h2 className="font-display mt-5 text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] text-[oklch(0.18_0.03_262)] sm:text-[2.4rem] lg:text-[2.7rem]">
                Transforme conversas em{" "}
                <span className="text-primary">pipeline de vendas</span>.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                Visualize o funil, priorize oportunidades e acompanhe o que
                realmente move suas vendas. Tudo em tempo real.
              </p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "Leads por etapa",
                  "Prioridade comercial",
                  "Follow-up automático",
                  "Histórico completo",
                  "Visão do gestor",
                  "Conversões em tempo real",
                ].map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-[13.5px] text-[oklch(0.25_0.03_262)]"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* IA + AUTOMAÇÃO                                                  */}
      {/* ============================================================== */}
      <section
        id="ia"
        className="relative overflow-hidden bg-gradient-to-b from-white to-[oklch(0.985_0.005_258)] py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>IA + Automação</Eyebrow>
              <h2 className="font-display mt-5 text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] text-[oklch(0.18_0.03_262)] sm:text-[2.4rem] lg:text-[2.7rem]">
                Automação comercial com IA para ganhar{" "}
                <span className="text-primary">velocidade sem perder controle</span>.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                A IA qualifica, responde e encaminha. Sua equipe foca no que
                realmente fecha vendas. E você acompanha cada decisão.
              </p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "Qualificação automática",
                  "Respostas por contexto",
                  "Encaminhamento para humano",
                  "Follow-up inteligente",
                  "Relatórios de decisão",
                  "Configuração por operação",
                ].map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-[13.5px] text-[oklch(0.25_0.03_262)]"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-8 -z-10 rounded-[40px] opacity-60 blur-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at 60% 50%, oklch(0.55 0.22 262 / 0.22), transparent 70%)",
                }}
              />
              <AiFlowMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* INTEGRAÇÕES                                                     */}
      {/* ============================================================== */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle
            eyebrow="Integrações"
            title={
              <>
                Conecte sua operação aos{" "}
                <span className="text-primary">sistemas certos</span>.
              </>
            }
            subtitle="Pensado para conectar atendimento, dados e automações em uma operação comercial mais inteligente."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Phone, name: "WhatsApp Cloud API", desc: "Atendimento oficial e em escala" },
              { icon: Workflow, name: "n8n", desc: "Automações e fluxos personalizados" },
              { icon: Database, name: "Supabase", desc: "Dados, autenticação e segurança" },
              { icon: Webhook, name: "Webhooks", desc: "Eventos para qualquer sistema" },
              { icon: Mail, name: "E-mail", desc: "Notificações e comunicação" },
              { icon: BarChart3, name: "Relatórios", desc: "Indicadores em tempo real" },
            ].map((it, i) => (
              <div
                key={i}
                className="group flex items-center gap-4 rounded-2xl border border-[oklch(0.20_0.03_262)]/10 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_20px_45px_-25px_oklch(0.28_0.14_262/_0.25)]"
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.95_0.03_262)] to-white text-primary ring-1 ring-[oklch(0.20_0.03_262)]/8 transition-all group-hover:from-primary group-hover:to-[oklch(0.28_0.14_262)] group-hover:text-white">
                  <it.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-[oklch(0.18_0.03_262)]">
                    {it.name}
                  </div>
                  <div className="text-[12.5px] text-muted-foreground">
                    {it.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* MÉTODO DE IMPLANTAÇÃO                                           */}
      {/* ============================================================== */}
      <section
        id="metodo"
        className="relative overflow-hidden bg-gradient-to-b from-[oklch(0.985_0.005_258)] to-white py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle
            eyebrow="Método"
            title={
              <>
                Mais do que software:{" "}
                <span className="text-primary">implantação comercial com método</span>.
              </>
            }
            subtitle="Cada cliente passa por um processo estruturado de implantação e evolução contínua."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { n: "01", icon: Compass, t: "Diagnóstico", d: "Análise da operação comercial atual." },
              { n: "02", icon: Layers, t: "Desenho", d: "Modelagem dos fluxos e jornadas." },
              { n: "03", icon: Bot, t: "Configuração da IA", d: "Treinamento da IA e regras do funil." },
              { n: "04", icon: Settings2, t: "Testes e validação", d: "Ajustes finos com o seu time." },
              { n: "05", icon: TrendingUp, t: "Acompanhamento", d: "Evolução contínua e otimizações." },
            ].map((s, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-[oklch(0.20_0.03_262)]/10 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_20px_45px_-25px_oklch(0.28_0.14_262/_0.25)]"
              >
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.28_0.14_262)] text-white">
                    <s.icon className="size-5" />
                  </div>
                  <span className="font-display text-[28px] font-semibold text-[oklch(0.55_0.18_262)]/15">
                    {s.n}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-[16px] font-semibold tracking-[-0.01em] text-[oklch(0.18_0.03_262)]">
                  {s.t}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* PLANOS                                                          */}
      {/* ============================================================== */}
      <section id="planos" className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle
            eyebrow="Planos"
            title={
              <>
                Escolha o plano ideal para a sua{" "}
                <span className="text-primary">operação comercial</span>.
              </>
            }
            subtitle="Todos os planos incluem implantação assistida, suporte estratégico e evolução contínua."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {[
              {
                name: "Essencial",
                desc: "Para times comerciais que estão começando a estruturar a operação.",
                setup: "R$ 1.997",
                monthly: "R$ 397",
                features: [
                  "WhatsApp oficial integrado",
                  "CRM com funil comercial",
                  "Até 3 usuários",
                  "Relatórios essenciais",
                  "Suporte por e-mail",
                ],
              },
              {
                name: "Profissional",
                desc: "Para empresas que querem escalar com IA e automação comercial.",
                setup: "R$ 3.997",
                monthly: "R$ 897",
                features: [
                  "Tudo do Essencial",
                  "IA comercial ativa",
                  "Automações avançadas",
                  "Até 10 usuários",
                  "Relatórios completos",
                  "Suporte prioritário",
                ],
                featured: true,
              },
              {
                name: "Estratégico",
                desc: "Para operações comerciais robustas com alto volume e múltiplos times.",
                setup: "Sob consulta",
                monthly: "Sob consulta",
                features: [
                  "Tudo do Profissional",
                  "Usuários ilimitados",
                  "Integrações dedicadas",
                  "IA personalizada",
                  "Gestor de conta",
                  "SLA estratégico",
                ],
              },
            ].map((p, i) => (
              <div
                key={i}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all ${
                  p.featured
                    ? "scale-[1.02] border-transparent bg-gradient-to-br from-[oklch(0.18_0.06_262)] to-[oklch(0.28_0.14_262)] text-white shadow-[0_40px_80px_-30px_oklch(0.28_0.14_262/_0.55)]"
                    : "border-[oklch(0.20_0.03_262)]/10 bg-white shadow-[0_10px_30px_-15px_oklch(0.28_0.14_262/_0.15)]"
                }`}
              >
                {p.featured && (
                  <>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full opacity-50 blur-3xl"
                      style={{
                        background:
                          "radial-gradient(circle, oklch(0.55 0.22 262), transparent 70%)",
                      }}
                    />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary shadow-[0_8px_20px_-8px_oklch(0.28_0.14_262/_0.40)]">
                        <Star className="size-3 fill-primary" /> Mais recomendado
                      </div>
                    </div>
                  </>
                )}
                <div className="relative">
                  <div
                    className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      p.featured ? "text-white/60" : "text-primary"
                    }`}
                  >
                    {p.name}
                  </div>
                  <p
                    className={`mt-3 text-[13.5px] leading-relaxed ${
                      p.featured ? "text-white/75" : "text-muted-foreground"
                    }`}
                  >
                    {p.desc}
                  </p>
                  <div
                    className={`mt-6 border-y py-5 ${
                      p.featured ? "border-white/15" : "border-[oklch(0.20_0.03_262)]/8"
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <span
                        className={`text-[12px] uppercase tracking-wider ${
                          p.featured ? "text-white/60" : "text-muted-foreground"
                        }`}
                      >
                        Setup
                      </span>
                      <span
                        className={`font-display text-[18px] font-semibold ${
                          p.featured ? "text-white" : "text-[oklch(0.18_0.03_262)]"
                        }`}
                      >
                        {p.setup}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span
                        className={`text-[12px] uppercase tracking-wider ${
                          p.featured ? "text-white/60" : "text-muted-foreground"
                        }`}
                      >
                        Mensal
                      </span>
                      <span
                        className={`font-display text-[28px] font-semibold tracking-tight ${
                          p.featured ? "text-white" : "text-[oklch(0.18_0.03_262)]"
                        }`}
                      >
                        {p.monthly}
                      </span>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {p.features.map((f, j) => (
                      <li
                        key={j}
                        className={`flex items-start gap-2.5 text-[13.5px] ${
                          p.featured ? "text-white/90" : "text-[oklch(0.25_0.03_262)]"
                        }`}
                      >
                        <CheckCircle2
                          className={`mt-0.5 size-4 shrink-0 ${
                            p.featured ? "text-[oklch(0.85_0.15_180)]" : "text-primary"
                          }`}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative mt-8">
                  <a href="#cta-final" className="block">
                    <Button
                      size="lg"
                      className={`h-11 w-full gap-2 rounded-full text-[13.5px] font-semibold ${
                        p.featured
                          ? "bg-white text-[oklch(0.18_0.03_262)] hover:bg-white/90"
                          : ""
                      }`}
                      variant={p.featured ? "default" : "default"}
                    >
                      Solicitar apresentação <ArrowRight className="size-4" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* FAQ                                                             */}
      {/* ============================================================== */}
      <section
        id="faq"
        className="relative overflow-hidden bg-gradient-to-b from-[oklch(0.985_0.005_258)] to-white py-24 sm:py-28"
      >
        <div className="mx-auto max-w-4xl px-6">
          <SectionTitle
            eyebrow="Perguntas frequentes"
            title={
              <>
                Tudo o que você precisa saber sobre o{" "}
                <span className="text-primary">Agente Comercial 360</span>.
              </>
            }
          />
          <div className="mt-12 space-y-3">
            {[
              {
                q: "O Agente Comercial 360 substitui minha equipe?",
                a: "Não. A plataforma potencializa o trabalho do seu time, automatiza tarefas repetitivas e oferece dados para decisões mais rápidas, mas mantém o time humano no centro da operação comercial.",
              },
              {
                q: "Preciso ter WhatsApp Business?",
                a: "Sim. A integração é feita via WhatsApp Cloud API (oficial Meta), garantindo entrega, escala e conformidade. Nossa equipe apoia a configuração durante a implantação.",
              },
              {
                q: "Funciona para qual tipo de empresa?",
                a: "Empresas B2B, clínicas, autopeças, prestadores de serviço, distribuidoras, e-commerce e qualquer operação que vende ou atende clientes via WhatsApp com volume relevante.",
              },
              {
                q: "A IA responde tudo sozinha?",
                a: "Não. Você define o que a IA pode responder, quando ela deve encaminhar para humano e quais regras seguir. Controle total sobre o que é automatizado e o que é manual.",
              },
              {
                q: "É possível personalizar os fluxos?",
                a: "Sim. Funil, regras de IA, automações, atribuição de responsáveis e relatórios são personalizáveis para a realidade da sua operação comercial.",
              },
              {
                q: "Como funciona a implantação?",
                a: "Seguimos um método em 5 etapas: diagnóstico, desenho dos fluxos, configuração da IA, testes/validação e acompanhamento contínuo. Você tem suporte estratégico em todas as fases.",
              },
            ].map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CTA FINAL                                                       */}
      {/* ============================================================== */}
      <section
        id="cta-final"
        className="relative overflow-hidden bg-[oklch(0.16_0.05_262)] py-24 sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, oklch(0.55 0.22 262 / 0.35) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 90% 100%, oklch(0.28 0.18 280 / 0.40) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.20]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 0.08) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.08) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
            <Sparkles className="size-3" /> Pronto para começar
          </div>
          <h2 className="font-display mt-6 text-[2.1rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.6rem] lg:text-[3rem]">
            Pronto para transformar seu atendimento em uma{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, oklch(0.85 0.10 262), oklch(0.95 0.05 262))",
              }}
            >
              operação comercial inteligente
            </span>
            ?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-relaxed text-white/70 sm:text-base">
            Fale com nossa equipe e entenda como o Agente Comercial 360 pode
            organizar seus leads, conversas, follow-ups e processos comerciais.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="https://wa.me/" target="_blank" rel="noreferrer">
              <Button
                size="lg"
                className="h-12 gap-2 rounded-full bg-white px-7 text-[14px] font-semibold text-[oklch(0.18_0.03_262)] shadow-[0_20px_45px_-15px_oklch(0.55_0.22_262/_0.55)] hover:bg-white/90"
              >
                Solicitar demonstração <ArrowRight className="size-4" />
              </Button>
            </a>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 gap-2 rounded-full border-white/20 bg-white/[0.04] px-7 text-[14px] font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                Entrar no painel
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-white/55">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="size-3.5" /> Dados protegidos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Headphones className="size-3.5" /> Suporte estratégico
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-3.5" /> Implantação guiada
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* FOOTER                                                          */}
      {/* ============================================================== */}
      <footer className="border-t border-[oklch(0.20_0.03_262)]/8 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <img src={acLogo} alt="Agente Comercial 360" className="h-7 w-7 rounded-md" />
            <span className="font-display text-[13px] font-semibold text-[oklch(0.18_0.03_262)]">
              Agente Comercial <span className="text-primary">360</span>
            </span>
          </div>
          <div className="text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} Agente Comercial 360. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-5 text-[12px] text-muted-foreground">
            <a href="#planos" className="hover:text-[oklch(0.18_0.03_262)]">Planos</a>
            <a href="#faq" className="hover:text-[oklch(0.18_0.03_262)]">FAQ</a>
            <Link to="/login" className="hover:text-[oklch(0.18_0.03_262)]">Entrar</Link>
          </div>
        </div>
      </footer>

      {/* Unused imports guard (keep types referenced for icons set actually used) */}
      <span className="hidden">
        <Briefcase /><Target /><Activity />
      </span>
    </div>
  );
}

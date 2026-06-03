import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageSquare,
  MessageCircle,
  Bot,
  TrendingUp,
  Workflow,
  Repeat,
  CheckCircle2,
  Users,
  ShieldCheck,
  HeadphonesIcon,
  Sparkles,
  Filter,
  Send,
  Zap,
  BarChart3,
  UserCircle2,
  ShoppingCart,
  DollarSign,
  Briefcase,
  FileText,
  Headphones,
  Code2,
  Database,
  Mail,
  Home,
  Bell,
} from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import crmDemo from "@/assets/crm-demo.png.asset.json";
import solAtendimento from "@/assets/sol-atendimento.jpg.asset.json";
import solCrm from "@/assets/sol-crm.jpg.asset.json";
import solIa from "@/assets/sol-ia.jpg.asset.json";
import heroPlatformMockup from "@/assets/hero-platform-mockup.png.asset.json";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Agente Comercial 360 — CRM Conversacional, Automação e IA para vendas" },
      {
        name: "description",
        content:
          "Plataforma de CRM conversacional, atendimento via WhatsApp, automação comercial e IA. Organize leads, padronize follow-up e acelere conversões.",
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
const BLUE_SOFT = "oklch(0.97 0.02 262)";

/* ------------------------------------------------------------------ */
/* Primitives                                                         */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[11px] font-semibold uppercase tracking-[0.22em]"
      style={{ color: BLUE_DEEP }}
    >
      {children}
    </span>
  );
}

function PillarCard({
  icon: Icon,
  title,
  description,
  bullets,
  accent = "blue",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  bullets: string[];
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
      <ul className="mt-5 space-y-2.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" style={{ color: BLUE_DEEP }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SolutionBlock({
  eyebrow,
  title,
  description,
  bullets,
  image,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  image: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-10 lg:gap-16 lg:grid-cols-2 ${
        reverse ? "lg:[&>div:first-child]:order-2" : ""
      }`}
    >
      <div>
        <SectionLabel>{eyebrow}</SectionLabel>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-slate-700 sm:text-base">
              <span
                className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: BLUE_SOFT, color: BLUE_DEEP }}
              >
                <CheckCircle2 className="size-3.5" />
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative">
        <div
          className="absolute -inset-4 rounded-3xl opacity-60 blur-2xl"
          style={{
            background: `radial-gradient(ellipse at center, ${BLUE_SOFT}, transparent 70%)`,
          }}
        />
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-20px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70">
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

function JourneyStep({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex flex-col rounded-2xl bg-white p-7 ring-1 ring-slate-200/60 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className="inline-flex size-9 items-center justify-center rounded-lg text-sm font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE_DEEP})` }}
        >
          {number}
        </span>
        <span style={{ color: BLUE_DEEP }} className="inline-flex">
          <Icon className="size-5" />
        </span>
      </div>
      <h4 className="mt-4 text-base font-semibold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function PlanCard({
  name,
  price,
  description,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 ${
        highlighted
          ? "text-white shadow-2xl ring-1 ring-white/10"
          : "bg-white text-slate-900 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.15)] ring-1 ring-slate-200/60"
      }`}
      style={
        highlighted
          ? { background: `linear-gradient(160deg, ${NAVY_DEEP}, ${NAVY} 55%, ${BLUE_DEEP})` }
          : undefined
      }
    >
      {highlighted && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-md"
          style={{ background: BLUE }}
        >
          Mais escolhido
        </span>
      )}
      <h4 className={`text-lg font-semibold ${highlighted ? "text-white" : "text-slate-900"}`}>
        {name}
      </h4>
      <p className={`mt-1 text-sm ${highlighted ? "text-white/70" : "text-slate-500"}`}>
        {description}
      </p>
      <div className="mt-6 flex items-baseline gap-1">
        <span className={`text-4xl font-semibold ${highlighted ? "text-white" : "text-slate-900"}`}>
          {price}
        </span>
        <span className={`text-sm ${highlighted ? "text-white/70" : "text-slate-500"}`}>/mês</span>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0"
              style={{ color: highlighted ? "white" : BLUE_DEEP }}
            />
            <span className={highlighted ? "text-white/85" : "text-slate-700"}>{f}</span>
          </li>
        ))}
      </ul>
      <a href="#cta-final" className="mt-8">
        <Button
          size="lg"
          className={`h-11 w-full rounded-full text-sm font-semibold shadow-md ${
            highlighted
              ? "bg-white text-slate-900 hover:bg-white/90"
              : "text-white"
          }`}
          style={highlighted ? undefined : { background: BLUE }}
        >
          Falar com especialista
        </Button>
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero Mockup — Component-based dashboard mockup                     */
/* ------------------------------------------------------------------ */

function FloatingCard({
  icon: Icon,
  title,
  description,
  className = "",
  iconBg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
  iconBg?: string;
}) {
  return (
    <div
      className={`pointer-events-auto flex w-[200px] items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_15px_40px_-12px_rgba(15,23,42,0.20)] backdrop-blur ${className}`}
    >
      <span
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background:
            iconBg ?? `linear-gradient(135deg, ${BLUE}, ${BLUE_DEEP})`,
        }}
      >
        <Icon className="size-5 text-white" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-semibold text-slate-900">{title}</p>
          <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
        </div>
        <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function HeroMockup() {
  const funnel = [
    { label: "Novos Leads", value: 1250, pct: 100 },
    { label: "Em Atendimento", value: 566, pct: 78 },
    { label: "Proposta Enviada", value: 342, pct: 58 },
    { label: "Negociação", value: 126, pct: 38 },
    { label: "Ganho", value: 64, pct: 22 },
  ];
  const chart = [28, 45, 38, 62, 55, 78, 92];

  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      {/* Glow */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[2.5rem] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.55 0.18 262 / 0.22), transparent 70%)",
        }}
      />

      {/* Dashboard */}
      <div className="relative overflow-hidden rounded-[22px] bg-white shadow-[0_40px_90px_-30px_rgba(15,23,42,0.40)] ring-1 ring-slate-200/80">
        <div className="flex">
          {/* Sidebar */}
          <div
            className="hidden w-[58px] shrink-0 flex-col items-center gap-1 py-4 sm:flex"
            style={{ background: NAVY_DEEP }}
          >
            <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-white/10">
              <img src={acLogo} alt="" className="size-5" />
            </div>
            {[Home, MessageSquare, Users, BarChart3, Briefcase, ShieldCheck].map(
              (Ic, i) => (
                <div
                  key={i}
                  className={`flex size-9 items-center justify-center rounded-lg ${
                    i === 0 ? "bg-white/15 text-white" : "text-white/55"
                  }`}
                >
                  <Ic className="size-4" />
                </div>
              )
            )}
          </div>

          {/* Main */}
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            {/* Topbar */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-900">
                  Olá, time Agente! 👋
                </p>
                <p className="text-[11px] text-slate-500">
                  Aqui está o resumo da operação hoje.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-slate-100">
                  <Bell className="size-3.5 text-slate-600" />
                </span>
                <span className="flex size-7 items-center justify-center rounded-full bg-slate-100">
                  <UserCircle2 className="size-4 text-slate-600" />
                </span>
              </div>
            </div>

            {/* KPI grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Leads", value: "1.250", delta: "+12%" },
                { label: "Conversas", value: "568", delta: "+18%" },
                { label: "Negociações", value: "342", delta: "+16%" },
                { label: "Faturamento", value: "R$ 98.760", delta: "+22%" },
              ].map((k) => (
                <div
                  key={k.label}
                  className="rounded-lg border border-slate-200/80 bg-white p-2.5"
                >
                  <p className="text-[10px] font-medium text-slate-500">
                    {k.label}
                  </p>
                  <p className="mt-0.5 text-[15px] font-bold tracking-tight text-slate-900">
                    {k.value}
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-600">
                    {k.delta}
                  </p>
                </div>
              ))}
            </div>

            {/* Funnel + Chart */}
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Funnel */}
              <div className="rounded-lg border border-slate-200/80 p-3">
                <p className="mb-2 text-[11px] font-semibold text-slate-700">
                  Funil de Vendas
                </p>
                <div className="space-y-1.5">
                  {funnel.map((f) => (
                    <div key={f.label} className="flex items-center gap-2">
                      <div
                        className="h-5 rounded-sm"
                        style={{
                          width: `${f.pct}%`,
                          background: `linear-gradient(90deg, ${BLUE}, ${BLUE_DEEP})`,
                        }}
                      />
                      <span className="whitespace-nowrap text-[10px] text-slate-600">
                        {f.label}
                      </span>
                      <span className="ml-auto text-[10px] font-semibold text-slate-800">
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="rounded-lg border border-slate-200/80 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-700">
                    Evolução de Conversas
                  </p>
                  <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                    +28%
                  </span>
                </div>
                <div className="relative h-24">
                  <svg
                    viewBox="0 0 280 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                  >
                    <defs>
                      <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={BLUE} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const max = Math.max(...chart);
                      const step = 280 / (chart.length - 1);
                      const pts = chart.map(
                        (v, i) => `${i * step},${100 - (v / max) * 85}`
                      );
                      const line = pts.join(" ");
                      const area = `0,100 ${line} 280,100`;
                      return (
                        <>
                          <polyline points={area} fill="url(#chartFill)" />
                          <polyline
                            points={line}
                            fill="none"
                            stroke={BLUE_DEEP}
                            strokeWidth="2"
                          />
                          {chart.map((v, i) => (
                            <circle
                              key={i}
                              cx={i * step}
                              cy={100 - (v / max) * 85}
                              r="2.5"
                              fill={BLUE_DEEP}
                            />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                <div className="mt-1 flex justify-between text-[9px] text-slate-400">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="absolute -left-4 top-6 hidden sm:block">
        <FloatingCard
          icon={MessageSquare}
          title="Conversas"
          description="Todas as conversas em um só lugar com IA."
        />
      </div>
      <div className="absolute -left-2 top-[46%] hidden md:block">
        <FloatingCard
          icon={Users}
          title="Leads"
          description="Capture, qualifique e organize seus leads."
        />
      </div>
      <div className="absolute -left-4 bottom-8 hidden sm:block">
        <FloatingCard
          icon={Zap}
          title="Follow-up"
          description="Automatize lembretes e acompanhamentos."
        />
      </div>
      <div className="absolute -right-4 top-12 hidden md:block">
        <FloatingCard
          icon={BarChart3}
          title="Relatórios"
          description="Dados em tempo real para decisões certeiras."
        />
      </div>
      <div className="absolute -right-2 bottom-12 hidden md:block">
        <FloatingCard
          icon={UserCircle2}
          title="Responsáveis"
          description="Gestão de equipe com metas e performance."
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */


export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ============== HEADER + HERO ============== */}
      <section id="top" className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(900px 500px at 80% 0%, oklch(0.95 0.04 262 / 0.55), transparent 60%), radial-gradient(700px 400px at 0% 100%, oklch(0.97 0.02 262), transparent 60%)",
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a href="#top" className="flex items-center gap-2.5">
              <img src={acLogo} alt="Agente Comercial 360" className="h-9 w-auto" />
            </a>
            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
              <a href="#solucoes" className="transition-colors hover:text-slate-900">Soluções</a>
              <a href="#como-funciona" className="transition-colors hover:text-slate-900">Como funciona</a>
              <a href="#planos" className="transition-colors hover:text-slate-900">Planos</a>
              <a href="#faq" className="transition-colors hover:text-slate-900">FAQ</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 sm:inline-block"
              >
                Entrar no painel
              </Link>
              <Link to="/login">
                <Button
                  className="h-10 rounded-full px-5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15"
                  style={{ background: BLUE }}
                >
                  Solicitar demonstração
                </Button>
              </Link>
            </div>
          </header>

          {/* Hero — Clean, centered, premium */}
          <div className="mx-auto max-w-5xl px-6 pt-16 pb-20 text-center sm:px-8 sm:pt-20 sm:pb-28 lg:px-10 lg:pt-28 lg:pb-32">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">
                Plataforma comercial inteligente
              </span>
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl font-display text-[42px] leading-[1.08] tracking-tight text-slate-900 sm:text-[52px] lg:text-[64px] lg:leading-[1.06]">
              CRM, WhatsApp e IA para transformar atendimento em vendas.
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
              Centralize conversas, organize leads, automatize follow-ups e acompanhe sua operação comercial em uma plataforma criada para empresas que querem vender com mais controle.
            </p>

            {/* Supporting text */}
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Atendimento humano, inteligência artificial, CRM comercial e automações trabalhando juntos para transformar mensagens soltas em processos comerciais organizados.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link to="/login">
                <Button
                  size="lg"
                  className="h-14 rounded-full px-8 text-base font-semibold text-white shadow-xl shadow-blue-900/20 transition-transform hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DEEP})` }}
                >
                  Solicitar demonstração
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <a href="#solucoes">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-slate-300 bg-white px-8 text-base font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Ver como funciona
                </Button>
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-8 text-sm font-medium tracking-wide text-slate-500">
              Mais controle. Menos improviso. Mais oportunidades acompanhadas.
            </p>
          </div>

          {/* ============== DEMONSTRAÇÃO DO PRODUTO ============== */}
          <section className="py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-[28px] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-[34px] lg:text-[40px]">
                Veja sua operação comercial funcionando na prática.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Centralize conversas, distribua atendimentos, acompanhe leads, organize oportunidades e tenha visão completa do relacionamento com cada cliente.
              </p>
            </div>

            {/* CRM Mockup Container */}
            <div className="relative mx-auto mt-14 max-w-6xl">
              {/* Glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-10 -bottom-10 -z-10 rounded-[3rem]"
                style={{
                  background:
                    "radial-gradient(60% 60% at 50% 50%, rgba(37,99,235,0.18) 0%, rgba(15,23,42,0.04) 50%, transparent 80%)",
                }}
              />
              <div
                className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-slate-200/70"
                style={{
                  boxShadow:
                    "0 40px 100px -30px rgba(15,23,42,0.35), 0 15px 40px -15px rgba(37,99,235,0.22)",
                }}
              >
                <img
                  src={crmDemo.url}
                  alt="Demonstração da plataforma Agente Comercial 360: atendimentos, CRM, conversas e oportunidades"
                  className="block h-auto w-full"
                  loading="lazy"
                />
              </div>
            </div>

            {/* 4 Destaques — Premium Cards */}
            <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: MessageCircle,
                  title: "Atendimento centralizado",
                  desc: "Todas as conversas organizadas em um só lugar, com histórico completo e contexto de cada cliente.",
                  gradient: "from-[#3b82f6] to-[#1d4ed8]",
                  shadow: "shadow-blue-500/25",
                  ring: "ring-blue-500/10",
                },
                {
                  icon: UserCircle2,
                  title: "CRM com histórico completo",
                  desc: "Cada cliente com dados estruturados, status em tempo real, origem, responsável e oportunidade vinculada.",
                  gradient: "from-[#1e40af] to-[#172554]",
                  shadow: "shadow-indigo-500/25",
                  ring: "ring-indigo-500/10",
                },
                {
                  icon: Filter,
                  title: "Distribuição inteligente",
                  desc: "Encaminhe atendimentos automaticamente por setor, responsável, prioridade ou capacidade da equipe.",
                  gradient: "from-[#0ea5e9] to-[#0369a1]",
                  shadow: "shadow-sky-500/25",
                  ring: "ring-sky-500/10",
                },
                {
                  icon: TrendingUp,
                  title: "Follow-up e oportunidades",
                  desc: "Acompanhe negociações, propostas enviadas, próximas ações comerciais e nunca perca um lead.",
                  gradient: "from-[#1e3a5f] to-[#0f172a]",
                  shadow: "shadow-slate-700/25",
                  ring: "ring-slate-700/10",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group relative flex flex-col rounded-3xl bg-white p-8 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_24px_60px_-16px_rgba(15,23,42,0.18)]"
                  style={{
                    boxShadow: "0 8px 32px -8px rgba(15,23,42,0.08), 0 2px 8px -2px rgba(15,23,42,0.04)",
                    border: "1px solid rgba(226,232,240,0.6)",
                  }}
                >
                  {/* Subtle top accent line */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r ${item.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  {/* Icon */}
                  <div
                    className={`mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg ${item.shadow} transition-transform duration-500 group-hover:scale-105`}
                  >
                    <item.icon className="size-7 text-white" strokeWidth={1.5} />
                  </div>
                  {/* Content */}
                  <h3 className="mb-3 text-[17px] font-bold tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-slate-500">
                    {item.desc}
                  </p>
                  {/* Bottom subtle glow on hover */}
                  <div
                    className={`absolute inset-x-4 bottom-4 h-12 rounded-full bg-gradient-to-t ${item.gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-[0.07]`}
                  />
                </div>
              ))}
            </div>

            {/* CTA Premium */}
            <div className="mx-auto mt-16 max-w-2xl text-center">
              <Link to="/login">
                <Button
                  size="lg"
                  className="group relative h-14 overflow-hidden rounded-full px-10 text-base font-semibold text-white shadow-xl shadow-blue-900/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/25"
                  style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DEEP} 50%, ${NAVY} 100%)` }}
                >
                  <span className="relative z-10 flex items-center">
                    Quero ver uma demonstração
                    <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  {/* Shine effect */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Button>
              </Link>
              <p className="mt-5 text-sm text-slate-400">
                Configure em minutos. Teste sem compromisso.
              </p>
            </div>
          </section>
        </div>
      </section>



      {/* ============== SEGMENTOS / PROVA ============== */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Operações comerciais que já vendem mais com o Agente Comercial 360
          </p>
          <div className="mt-7 grid grid-cols-2 gap-6 text-center text-sm font-medium text-slate-600 sm:grid-cols-3 md:grid-cols-6">
            {[
              "Imobiliárias",
              "Clínicas",
              "Educação",
              "Serviços B2B",
              "Franquias",
              "E-commerce",
            ].map((s) => (
              <div
                key={s}
                className="rounded-lg bg-white py-3 ring-1 ring-slate-200/60 shadow-sm"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== 3 PILARES ============== */}
      <section id="solucoes" className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Os três pilares da plataforma</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Uma plataforma feita para vender com método
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Atendimento, CRM e automação operando juntos para transformar conversas em
              receita previsível.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <PillarCard
              icon={MessageSquare}
              title="Atendimento Inteligente"
              description="WhatsApp oficial centralizado, distribuição automática e respostas assistidas por IA."
              bullets={[
                "Caixa única multi-atendente",
                "Distribuição por fila e responsável",
                "Histórico completo por contato",
              ]}
            />
            <PillarCard
              icon={Workflow}
              title="CRM Comercial"
              description="Funil visual com leads, estágios e tarefas. Cada conversa vira oportunidade rastreável."
              bullets={[
                "Pipeline kanban customizável",
                "Qualificação e SLA por etapa",
                "Tarefas e lembretes automáticos",
              ]}
              accent="navy"
            />
            <PillarCard
              icon={Bot}
              title="Automação com IA"
              description="Fluxos inteligentes que qualificam, respondem e fazem follow-up sem esforço manual."
              bullets={[
                "Cadências de follow-up",
                "Respostas sugeridas por IA",
                "Gatilhos por evento e comportamento",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ============== SOLUÇÕES DETALHADAS ============== */}
      <section className="bg-slate-50/70 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-24 sm:space-y-32">
          <SolutionBlock
            eyebrow="Atendimento via WhatsApp"
            title="Toda conversa em um só lugar, com contexto e responsável."
            description="Conecte WhatsApp oficial, organize filas e dê visibilidade total para gestores e atendentes acompanharem cada interação."
            bullets={[
              "Multi-atendente no mesmo número oficial",
              "Distribuição automática por equipe ou responsável",
              "Tags, anotações e histórico vinculados ao lead",
              "Respostas rápidas e templates aprovados",
            ]}
            image={solAtendimento.url}
          />

          <SolutionBlock
            eyebrow="CRM Comercial"
            title="Funil visual que transforma conversa em oportunidade."
            description="Cada lead entra no pipeline com origem, etapa e responsável. Acompanhe a evolução, identifique gargalos e bata metas com clareza."
            bullets={[
              "Pipeline kanban com etapas personalizadas",
              "Qualificação automática a partir da conversa",
              "Tarefas, lembretes e SLA por estágio",
              "Visão por vendedor, origem e produto",
            ]}
            image={solCrm.url}
            reverse
          />

          <SolutionBlock
            eyebrow="Automação e IA"
            title="Fluxos inteligentes que trabalham pela sua equipe."
            description="Configure cadências de follow-up, respostas automáticas e gatilhos por comportamento. A IA sugere mensagens e mantém o lead engajado até a conversão."
            bullets={[
              "Cadências automáticas de follow-up",
              "IA que sugere a próxima resposta",
              "Gatilhos por evento, tempo e estágio",
              "Reengajamento de leads inativos",
            ]}
            image={solIa.url}
          />
        </div>
      </section>

      {/* ============== COMO FUNCIONA — JORNADA ============== */}
      <section id="como-funciona" className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Como funciona</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              A jornada do lead, do primeiro contato à conversão
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Um processo claro, padronizado e mensurável em cada etapa do funil.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <JourneyStep
              number="01"
              icon={Send}
              title="Lead chega"
              description="Mensagem entra via WhatsApp, site ou campanha e é capturada automaticamente."
            />
            <JourneyStep
              number="02"
              icon={Filter}
              title="Qualificação"
              description="IA e regras qualificam o lead, atribuem origem e direcionam para o funil correto."
            />
            <JourneyStep
              number="03"
              icon={Users}
              title="Distribuição"
              description="O lead é distribuído para o vendedor certo, com contexto e SLA definidos."
            />
            <JourneyStep
              number="04"
              icon={Repeat}
              title="Follow-up"
              description="Cadência automática reengaja o lead até a resposta, sem esquecimentos."
            />
            <JourneyStep
              number="05"
              icon={TrendingUp}
              title="Conversão"
              description="Negociação registrada, métricas atualizadas e ciclo de venda fechado."
            />
          </div>
        </div>
      </section>

      {/* ============== PLANOS ============== */}
      <section id="planos" className="bg-slate-50/70 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Planos</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Escolha o plano certo para sua operação
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Implantação assistida e suporte humano em todos os planos.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <PlanCard
              name="Starter"
              price="R$ 297"
              description="Para equipes pequenas começando a estruturar o comercial."
              features={[
                "Até 3 atendentes",
                "WhatsApp oficial integrado",
                "CRM com pipeline visual",
                "Relatórios essenciais",
              ]}
            />
            <PlanCard
              name="Growth"
              price="R$ 697"
              description="Para operações em crescimento que precisam escalar com método."
              features={[
                "Até 10 atendentes",
                "Automação de follow-up",
                "IA para respostas e qualificação",
                "Distribuição automática de leads",
                "Relatórios gerenciais avançados",
              ]}
              highlighted
            />
            <PlanCard
              name="Scale"
              price="Sob consulta"
              description="Para empresas com alto volume e múltiplas equipes."
              features={[
                "Atendentes ilimitados",
                "Múltiplos números e filas",
                "Integrações personalizadas",
                "Gestor de sucesso dedicado",
                "SLA empresarial",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ============== CREDIBILIDADE ============== */}
      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Segurança e conformidade",
                desc: "Infraestrutura em nuvem, LGPD e WhatsApp oficial. Seus dados protegidos do começo ao fim.",
              },
              {
                icon: Sparkles,
                title: "Implantação assistida",
                desc: "Setup guiado, modelagem do funil e treinamento da equipe junto com nossos especialistas.",
              },
              {
                icon: HeadphonesIcon,
                title: "Suporte humano",
                desc: "Atendimento direto com quem entende de operação comercial — não apenas tickets.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl bg-slate-50/60 p-7 ring-1 ring-slate-200/60"
              >
                <div
                  className="mb-5 inline-flex size-12 items-center justify-center rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE_DEEP})` }}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FAQ ============== */}
      <section id="faq" className="bg-slate-50/70 py-24 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="text-center">
            <SectionLabel>Dúvidas frequentes</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Tudo o que você precisa saber
            </h2>
          </div>

          <Accordion type="single" collapsible className="mt-10 space-y-3">
            {[
              {
                q: "O Agente Comercial 360 usa o WhatsApp oficial?",
                a: "Sim. Operamos via API oficial do WhatsApp Business, garantindo conformidade, estabilidade e múltiplos atendentes no mesmo número.",
              },
              {
                q: "Preciso ter equipe técnica para implantar?",
                a: "Não. Nossa equipe faz a implantação assistida: conectamos o WhatsApp, configuramos o funil, automações e treinamos a equipe com você.",
              },
              {
                q: "Como funciona a IA na prática?",
                a: "A IA qualifica leads, sugere respostas para os atendentes, dispara follow-ups e reengaja contatos inativos com base em comportamento e estágio do funil.",
              },
              {
                q: "Posso integrar com outras ferramentas?",
                a: "Sim. Integramos com sistemas de gestão, anúncios e ferramentas internas via API. No plano Scale oferecemos integrações personalizadas.",
              },
              {
                q: "Existe fidelidade?",
                a: "Não. Os planos são mensais e você pode cancelar quando quiser. Trabalhamos para entregar resultado, não para te prender.",
              },
            ].map(({ q, a }, i) => (
              <AccordionItem
                key={q}
                value={`item-${i}`}
                className="rounded-xl border border-slate-200/70 bg-white px-5"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-slate-900 hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-600">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
            <a href="#planos" className="hover:text-slate-900">Planos</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
            <Link to="/login" className="hover:text-slate-900">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

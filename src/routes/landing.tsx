import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  HeadphonesIcon,
  Sparkles,
  BarChart3,
  DollarSign,
  Brain,
  Eye,
  LineChart,
  Layers,
  Radar,
  Target,
  Truck,
  PackageSearch,
  Boxes,
  TrendingDown,
  TrendingUp,
  Activity,
  Plug,
  Workflow,
  Rocket,
  Store,
  AlertTriangle,
  Bell,
  UserCircle2,
  Home,
} from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
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
      { title: "Agente Comercial 360 — Inteligência de Vendas para Mercado Livre" },
      {
        name: "description",
        content:
          "Plataforma de inteligência operacional para vendedores profissionais de marketplace. Multi-conta, lucro líquido real, Radar IA e espionagem de mercado em um único painel.",
      },
      {
        property: "og:title",
        content: "Agente Comercial 360 — Central de Inteligência para Mercado Livre",
      },
      {
        property: "og:description",
        content:
          "Transforme dados do Mercado Livre em lucro real. Multi-conta, margem, Radar IA e monitoramento de concorrência.",
      },
    ],
  }),
});

/* Tokens — Data Analytics: deep navy + neon blue */
const NAVY = "oklch(0.20 0.05 262)";
const NAVY_DEEP = "oklch(0.14 0.04 262)";
const BLUE = "oklch(0.62 0.20 255)";
const BLUE_DEEP = "oklch(0.48 0.20 258)";
const NEON = "oklch(0.78 0.18 220)";
const BLUE_SOFT = "oklch(0.97 0.02 262)";

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
            highlighted ? "bg-white text-slate-900 hover:bg-white/90" : "text-white"
          }`}
          style={highlighted ? undefined : { background: BLUE }}
        >
          Falar com especialista
        </Button>
      </a>
    </div>
  );
}

/* Floating cards over the hero dashboard mockup */
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
      className={`pointer-events-auto flex w-[210px] items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_15px_40px_-12px_rgba(15,23,42,0.20)] backdrop-blur ${className}`}
    >
      <span
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: iconBg ?? `linear-gradient(135deg, ${BLUE}, ${BLUE_DEEP})` }}
      >
        <Icon className="size-5 text-white" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-semibold text-slate-900">{title}</p>
          <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
        </div>
        <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function HeroMockup() {
  const revenue = [42, 55, 48, 70, 64, 88, 96, 110, 128];
  const accounts = [
    { name: "ML — Robomix", value: "R$ 38.420", pct: 92, delta: "+24%" },
    { name: "ML — Nightled", value: "R$ 21.180", pct: 64, delta: "+12%" },
    { name: "ML — WGCar Matriz", value: "R$ 14.760", pct: 48, delta: "+8%" },
    { name: "ML — Express", value: "R$ 9.940", pct: 34, delta: "+5%" },
    { name: "ML — Duck", value: "R$ 6.220", pct: 22, delta: "-3%" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[720px]">
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[2.5rem] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.62 0.20 255 / 0.28), transparent 70%)",
        }}
      />

      <div className="relative overflow-hidden rounded-[22px] bg-white shadow-[0_40px_90px_-30px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80">
        <div className="flex">
          {/* Sidebar */}
          <div
            className="hidden w-[58px] shrink-0 flex-col items-center gap-1 py-4 sm:flex"
            style={{ background: NAVY_DEEP }}
          >
            <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-white/10">
              <img src={acLogo} alt="" className="size-5" />
            </div>
            {[Home, BarChart3, Radar, DollarSign, Boxes, Brain].map((Ic, i) => (
              <div
                key={i}
                className={`flex size-9 items-center justify-center rounded-lg ${
                  i === 0 ? "bg-white/15 text-white" : "text-white/55"
                }`}
              >
                <Ic className="size-4" />
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-900">
                  Central de Inteligência — Mercado Livre
                </p>
                <p className="text-[11px] text-slate-500">
                  9 contas conectadas · 109 anúncios monitorados
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

            {/* KPIs */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Faturamento", value: "R$ 90.5k", delta: "+22%", up: true },
                { label: "Lucro Líquido", value: "R$ 18.2k", delta: "+14%", up: true },
                { label: "Margem média", value: "20,1%", delta: "+1,8 p.p.", up: true },
                { label: "Risco ruptura", value: "2", delta: "alertas", up: false },
              ].map((k) => (
                <div key={k.label} className="rounded-lg border border-slate-200/80 bg-white p-2.5">
                  <p className="text-[10px] font-medium text-slate-500">{k.label}</p>
                  <p className="mt-0.5 text-[15px] font-bold tracking-tight text-slate-900">
                    {k.value}
                  </p>
                  <p
                    className={`text-[10px] font-semibold ${
                      k.up ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {k.delta}
                  </p>
                </div>
              ))}
            </div>

            {/* Mapa de vendas + Receita */}
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200/80 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-700">Mapa de Vendas (multi-conta)</p>
                  <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">
                    9 contas
                  </span>
                </div>
                <div className="space-y-1.5">
                  {accounts.map((a) => (
                    <div key={a.name} className="flex items-center gap-2">
                      <div
                        className="h-5 rounded-sm"
                        style={{
                          width: `${a.pct}%`,
                          background: `linear-gradient(90deg, ${BLUE}, ${NEON})`,
                        }}
                      />
                      <span className="whitespace-nowrap text-[10px] text-slate-600">{a.name}</span>
                      <span className="ml-auto text-[10px] font-semibold text-slate-800">
                        {a.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200/80 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-700">Receita líquida</p>
                  <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                    +31%
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
                        <stop offset="0%" stopColor={BLUE} stopOpacity="0.40" />
                        <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const max = Math.max(...revenue);
                      const step = 280 / (revenue.length - 1);
                      const pts = revenue.map((v, i) => `${i * step},${100 - (v / max) * 85}`);
                      const line = pts.join(" ");
                      const area = `0,100 ${line} 280,100`;
                      return (
                        <>
                          <polyline points={area} fill="url(#chartFill)" />
                          <polyline points={line} fill="none" stroke={BLUE_DEEP} strokeWidth="2" />
                          {revenue.map((v, i) => (
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
                  {["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Radar IA */}
            <div className="mt-3 rounded-lg border border-slate-200/80 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-700">Radar IA — diagnósticos</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  <Brain className="size-2.5" /> IA ativa
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="rounded-md bg-amber-50 p-2 ring-1 ring-amber-200/70">
                  <div className="flex items-center gap-1 font-semibold text-amber-700">
                    <AlertTriangle className="size-3" /> Ruptura em 3 dias
                  </div>
                  <p className="mt-0.5 text-amber-900/80">Lanterna LED — Robomix</p>
                </div>
                <div className="rounded-md bg-rose-50 p-2 ring-1 ring-rose-200/70">
                  <div className="flex items-center gap-1 font-semibold text-rose-700">
                    <TrendingDown className="size-3" /> Margem caindo
                  </div>
                  <p className="mt-0.5 text-rose-900/80">Kit Farol — Nightled</p>
                </div>
                <div className="rounded-md bg-emerald-50 p-2 ring-1 ring-emerald-200/70">
                  <div className="flex items-center gap-1 font-semibold text-emerald-700">
                    <TrendingUp className="size-3" /> Oportunidade kit
                  </div>
                  <p className="mt-0.5 text-emerald-900/80">+18% conversão prevista</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="absolute -left-4 top-6 hidden sm:block">
        <FloatingCard
          icon={Layers}
          title="9 contas Mercado Livre"
          description="Visão consolidada multi-conta em tempo real."
        />
      </div>
      <div className="absolute -left-2 top-[46%] hidden md:block">
        <FloatingCard
          icon={DollarSign}
          title="Lucro líquido real"
          description="Taxas, fretes e impostos descontados por anúncio."
        />
      </div>
      <div className="absolute -left-4 bottom-8 hidden sm:block">
        <FloatingCard
          icon={Eye}
          title="Espionagem de preço"
          description="Concorrentes monitorados a cada hora."
        />
      </div>
      <div className="absolute -right-4 top-12 hidden md:block">
        <FloatingCard
          icon={Radar}
          title="Radar IA"
          description="Diagnósticos automáticos de risco e oportunidade."
        />
      </div>
      <div className="absolute -right-2 bottom-12 hidden md:block">
        <FloatingCard
          icon={Boxes}
          title="Estoque inteligente"
          description="Cobertura, ruptura e excesso por produto."
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ============== HEADER + HERO ============== */}
      <section
        id="top"
        className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(900px 500px at 80% 0%, oklch(0.92 0.06 255 / 0.55), transparent 60%), radial-gradient(700px 400px at 0% 100%, oklch(0.97 0.02 262), transparent 60%)",
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <a href="#top" className="flex items-center gap-2.5">
              <img src={acLogo} alt="Agente Comercial 360" className="h-9 w-auto" />
            </a>
            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
              <a href="#problemas" className="transition-colors hover:text-slate-900">
                Problemas
              </a>
              <a href="#solucoes" className="transition-colors hover:text-slate-900">
                Inteligência
              </a>
              <a href="#como-funciona" className="transition-colors hover:text-slate-900">
                Método
              </a>
              <a href="#planos" className="transition-colors hover:text-slate-900">
                Planos
              </a>
              <a href="#faq" className="transition-colors hover:text-slate-900">
                FAQ
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 sm:inline-block"
              >
                Entrar no painel
              </Link>
              <a href="#cta-final">
                <Button
                  className="h-10 rounded-full px-5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15"
                  style={{ background: BLUE }}
                >
                  Solicitar demonstração
                </Button>
              </a>
            </div>
          </header>

          {/* Hero */}
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pt-12 pb-16 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:pt-20 lg:pb-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">
                  Inteligência para Mercado Livre
                </span>
              </div>

              <h1 className="font-display text-[40px] leading-[1.08] tracking-tight text-slate-900 sm:text-[52px] lg:text-[58px] lg:leading-[1.06]">
                A Central de Inteligência que transforma dados do{" "}
                <span style={{ color: BLUE_DEEP }}>Mercado Livre</span> em lucro real.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Gerencie múltiplas contas, controle sua margem e monitore a concorrência com a
                plataforma de inteligência operacional feita para vendedores profissionais.
              </p>

              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
                <a href="#cta-final">
                  <Button
                    size="lg"
                    className="h-14 rounded-full px-8 text-base font-semibold text-white shadow-xl shadow-blue-900/20 transition-transform hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DEEP})` }}
                  >
                    Solicitar Demonstração Gratuita
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </a>
                <a href="#solucoes">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 rounded-full border-slate-300 bg-white px-8 text-base font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Ver Funcionalidades de Inteligência
                  </Button>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Plug className="size-4" style={{ color: BLUE_DEEP }} /> API oficial do Mercado Livre
                </span>
                <span className="inline-flex items-center gap-2">
                  <Layers className="size-4" style={{ color: BLUE_DEEP }} /> Multi-conta nativo
                </span>
                <span className="inline-flex items-center gap-2">
                  <Brain className="size-4" style={{ color: BLUE_DEEP }} /> Radar IA financeiro
                </span>
              </div>
            </div>

            <div className="relative">
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ============== O PROBLEMA ============== */}
      <section id="problemas" className="border-y border-slate-100 bg-slate-50/70 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>O problema do vendedor profissional</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Você está vendendo no escuro?
            </h2>
            <p className="mt-4 text-base text-slate-600">
              A maioria dos vendedores profissionais opera no improviso — sem visão de margem,
              sem controle de estoque e sem inteligência sobre a concorrência.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Layers,
                title: "Contas espalhadas",
                desc: "Múltiplas contas Mercado Livre sem visão consolidada de faturamento e desempenho.",
              },
              {
                icon: TrendingDown,
                title: "Margem engolida",
                desc: "Lucro real corroído por taxas, impostos e fretes — e você só descobre no fim do mês.",
              },
              {
                icon: Boxes,
                title: "Estoque parado",
                desc: "Produtos travados gerando prejuízo enquanto outros entram em ruptura sem aviso.",
              },
              {
                icon: Eye,
                title: "Concorrência invisível",
                desc: "Concorrentes baixam preço, ganham buy box e você só percebe quando as vendas caem.",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="flex flex-col rounded-2xl bg-white p-7 ring-1 ring-slate-200/70 shadow-sm"
              >
                <div
                  className="mb-4 inline-flex size-11 items-center justify-center rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE_DEEP})` }}
                >
                  <p.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== 4 PILARES — INTELIGÊNCIA ============== */}
      <section id="solucoes" className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Os pilares da inteligência</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Uma plataforma feita para vender com método e margem
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Quatro camadas de inteligência operando juntas para transformar dados em lucro
              líquido previsível.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <PillarCard
              icon={Layers}
              title="Inteligência Multi-conta"
              description="Visualize todas as suas contas Mercado Livre em um único painel centralizado."
              bullets={[
                "Mapa de vendas consolidado",
                "Faturamento por conta e marketplace",
                "Comparativo de performance entre filiais",
              ]}
            />
            <PillarCard
              icon={Radar}
              title="Radar IA de Performance"
              description="Diagnósticos automáticos que identificam riscos de ruptura, baixa conversão e oportunidades de kits."
              bullets={[
                "Alertas de ruptura antes que aconteça",
                "Detecção de queda de conversão",
                "Sugestões de kits e bundles",
              ]}
              accent="navy"
            />
            <PillarCard
              icon={DollarSign}
              title="Controle de Margem e Lucro"
              description="Saiba o seu lucro líquido real por anúncio, descontando taxas, impostos e fretes automaticamente."
              bullets={[
                "Lucro líquido por SKU e anúncio",
                "Curva ABC financeira real",
                "Custos sincronizados e versionados",
              ]}
            />
            <PillarCard
              icon={Eye}
              title="Espionagem de Mercado"
              description="Monitore preços e estoques dos concorrentes em tempo real e aja estrategicamente."
              bullets={[
                "Preço e buy box monitorados por hora",
                "Histórico de estoque dos concorrentes",
                "Alertas de movimento agressivo",
              ]}
              accent="navy"
            />
          </div>
        </div>
      </section>

      {/* ============== SEGMENTOS — Marketplaces ============== */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Construído para vendedores profissionais de marketplace
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { label: "Mercado Livre", icon: Store },
              { label: "Mercado Ads", icon: Target },
              { label: "Mercado Envios", icon: Truck },
              { label: "Catálogo & Kits", icon: PackageSearch },
              { label: "Shopee (em breve)", icon: ShoppingBag },
              { label: "Multi-CNPJ", icon: Layers },
            ].map((s) => (
              <div
                key={s.label}
                className="group inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
              >
                <s.icon className="size-4 text-slate-400 transition-colors duration-300 group-hover:text-blue-600" />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== COMO FUNCIONA — MÉTODO ============== */}
      <section id="como-funciona" className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>O método</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Da conexão à escala lucrativa em 4 passos
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Um processo claro para transformar dados brutos em decisões operacionais
              mensuráveis.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <JourneyStep
              number="01"
              icon={Plug}
              title="Conexão via API oficial"
              description="Conecte as suas contas Mercado Livre com total segurança em segundos, via API oficial."
            />
            <JourneyStep
              number="02"
              icon={Brain}
              title="Diagnóstico automático"
              description="Nossa IA analisa o seu histórico e identifica gargalos de lucro, conversão e estoque."
            />
            <JourneyStep
              number="03"
              icon={Workflow}
              title="Ação direcionada"
              description="Receba tarefas claras para os seus operadores de Ads, Catálogo e Compras."
            />
            <JourneyStep
              number="04"
              icon={Rocket}
              title="Escala lucrativa"
              description="Acompanhe o impacto real das ações no seu faturamento e na sua margem líquida."
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
              Escolha o plano certo para a sua operação
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Implantação assistida e suporte humano em todos os planos.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <PlanCard
              name="Starter"
              price="R$ 497"
              description="Para vendedores começando a profissionalizar a operação."
              features={[
                "Até 2 contas Mercado Livre",
                "Mapa de vendas consolidado",
                "Controle de custo e margem básica",
                "Relatórios essenciais",
              ]}
            />
            <PlanCard
              name="Growth"
              price="R$ 1.197"
              description="Para operações multi-conta que precisam escalar com inteligência."
              features={[
                "Até 10 contas Mercado Livre",
                "Radar IA de performance",
                "Lucro líquido real por anúncio",
                "Espionagem de preço e estoque",
                "Curva ABC financeira",
              ]}
              highlighted
            />
            <PlanCard
              name="Scale"
              price="Sob consulta"
              description="Para grupos com múltiplos CNPJs e alto volume."
              features={[
                "Contas ilimitadas",
                "Multi-CNPJ e multi-filial",
                "Integrações ERP personalizadas",
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
                desc: "Conexão via API oficial do Mercado Livre, LGPD e dados criptografados ponta a ponta.",
              },
              {
                icon: Sparkles,
                title: "Implantação assistida",
                desc: "Setup guiado, conexão das contas, importação de custos e treinamento da equipe.",
              },
              {
                icon: HeadphonesIcon,
                title: "Suporte especializado",
                desc: "Atendimento direto com quem entende de operação de marketplace — não apenas tickets.",
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
                q: "A conexão com o Mercado Livre é oficial?",
                a: "Sim. Conectamos via API oficial do Mercado Livre, com OAuth seguro. Você autoriza em segundos e mantém total controle.",
              },
              {
                q: "Quantas contas posso conectar?",
                a: "Depende do plano. O Starter aceita até 2 contas, o Growth até 10 e o Scale é ilimitado, incluindo múltiplos CNPJs e filiais.",
              },
              {
                q: "Como o lucro líquido é calculado?",
                a: "A plataforma desconta automaticamente taxas do Mercado Livre, frete subsidiado, impostos e o custo do produto cadastrado, mostrando a margem real por anúncio.",
              },
              {
                q: "O que o Radar IA faz na prática?",
                a: "A IA monitora seu histórico e identifica riscos de ruptura, quedas de conversão, anúncios travados, oportunidades de kit e movimentos agressivos da concorrência.",
              },
              {
                q: "Vocês monitoram a concorrência?",
                a: "Sim. Rastreamos preço, buy box e estoque dos concorrentes que você escolher acompanhar, com alertas em tempo real.",
              },
              {
                q: "Existe fidelidade?",
                a: "Não. Os planos são mensais e você pode cancelar quando quiser. Trabalhamos para entregar resultado mensurável em margem.",
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
                  "radial-gradient(ellipse at top right, oklch(0.62 0.22 255 / 0.7), transparent 60%)",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Pronto para vender com inteligência e margem?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
                Agende uma demonstração e veja como transformar os dados do seu Mercado Livre em
                lucro líquido real.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <a href="https://wa.me/" target="_blank" rel="noreferrer">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-slate-900 shadow-lg hover:bg-white/90"
                  >
                    Solicitar Demonstração Gratuita
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
            <a href="#solucoes" className="hover:text-slate-900">
              Inteligência
            </a>
            <a href="#planos" className="hover:text-slate-900">
              Planos
            </a>
            <a href="#faq" className="hover:text-slate-900">
              FAQ
            </a>
            <Link to="/login" className="hover:text-slate-900">
              Entrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

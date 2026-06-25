import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
  Layers,
  Radar,
  Target,
  Truck,
  PackageSearch,
  Boxes,
  TrendingDown,
  TrendingUp,
  Plug,
  Workflow,
  Rocket,
  Store,
  ShoppingBag,
  AlertTriangle,
  Bell,
  UserCircle2,
  Home,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  ShieldCheck as ShieldIcon,
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
const NAVY_INK = "#0a0e17";
const BLUE = "oklch(0.62 0.20 255)";
const BLUE_DEEP = "oklch(0.48 0.20 258)";
const NEON = "oklch(0.82 0.17 215)";
const CYAN = "oklch(0.85 0.14 210)";

/* ---------- Reveal on scroll ---------- */
function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

function SectionLabel({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className="text-[11px] font-semibold uppercase tracking-[0.22em]"
      style={{ color: tone === "dark" ? CYAN : BLUE_DEEP }}
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
    <div
      className="group relative flex flex-col rounded-2xl p-7 sm:p-8 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_25px_60px_-15px_rgba(56,189,248,0.35)] hover:border-cyan-300/70"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${NEON}, 0 0 28px -6px ${NEON}`,
        }}
      />
      <div
        className="mb-5 inline-flex size-12 items-center justify-center rounded-xl shadow-lg"
        style={{
          background:
            accent === "navy"
              ? `linear-gradient(135deg, ${NAVY}, ${BLUE})`
              : `linear-gradient(135deg, ${BLUE_DEEP}, ${NEON})`,
          boxShadow: `0 10px 25px -10px ${BLUE}`,
        }}
      >
        <Icon className="size-6 text-white" />
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-[-0.015em] text-slate-900">{title}</h3>
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
    <div className="relative flex flex-col rounded-2xl bg-white p-7 ring-1 ring-slate-200/60 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
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
      className={`relative flex flex-col rounded-2xl p-8 backdrop-blur-2xl border transition-all duration-300 hover:-translate-y-1 ${
        highlighted
          ? "text-white shadow-2xl border-white/20"
          : "text-white shadow-xl border-white/10"
      }`}
      style={
        highlighted
          ? {
              background: `linear-gradient(160deg, ${BLUE_DEEP}, ${NAVY} 55%, ${NAVY_DEEP})`,
              boxShadow: `0 25px 60px -20px ${BLUE}`,
            }
          : { background: "rgba(255,255,255,0.06)" }
      }
    >
      {highlighted && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-md"
          style={{ background: `linear-gradient(135deg, ${BLUE}, ${CYAN})` }}
        >
          Mais escolhido
        </span>
      )}
      <h4 className="text-lg font-semibold text-white">{name}</h4>
      <p className="mt-1 text-sm text-white/65">{description}</p>
      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-white">{price}</span>
        <span className="text-sm text-white/60">/mês</span>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" style={{ color: CYAN }} />
            <span className="text-white/85">{f}</span>
          </li>
        ))}
      </ul>
      <a href="#cta-final" className="mt-8">
        <Button
          size="lg"
          className={`h-11 w-full rounded-full text-sm font-semibold shadow-md ${
            highlighted ? "bg-white text-slate-900 hover:bg-white/90" : "text-white"
          }`}
          style={
            highlighted ? undefined : { background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DEEP})` }
          }
        >
          Falar com especialista
        </Button>
      </a>
    </div>
  );
}

/* ---------- Monitor mockup ---------- */
function HeroMockup() {
  const revenue = [42, 55, 48, 70, 64, 88, 96, 110, 128];
  const accounts = [
    { name: "ML — Robomix", value: "R$ 38.420", pct: 92 },
    { name: "ML — Nightled", value: "R$ 21.180", pct: 64 },
    { name: "ML — WGCar Matriz", value: "R$ 14.760", pct: 48 },
    { name: "ML — Express", value: "R$ 9.940", pct: 34 },
    { name: "ML — Duck", value: "R$ 6.220", pct: 22 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[820px]">
      {/* Ambient blue glow */}
      <div
        aria-hidden
        className="absolute -inset-16 -z-10 rounded-[3rem] blur-3xl"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 45%, oklch(0.62 0.22 255 / 0.55), transparent 70%), radial-gradient(40% 40% at 80% 70%, oklch(0.78 0.18 210 / 0.35), transparent 75%)",
        }}
      />

      {/* UltraWide monitor frame */}
      <div className="relative">
        <div
          className="relative rounded-[20px] p-[10px] shadow-[0_50px_120px_-30px_rgba(8,12,25,0.7)] ring-1 ring-white/10"
          style={{
            background:
              "linear-gradient(160deg, #1b2233 0%, #0a0e17 55%, #0e1424 100%)",
          }}
        >
          {/* Screen */}
          <div className="relative overflow-hidden rounded-[12px] bg-white ring-1 ring-black/20">
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
                    <div
                      key={k.label}
                      className="rounded-lg border border-slate-200/80 bg-white p-2.5"
                    >
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
                      <p className="text-[11px] font-semibold text-slate-700">
                        Mapa de Vendas (multi-conta)
                      </p>
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
                          <span className="whitespace-nowrap text-[10px] text-slate-600">
                            {a.name}
                          </span>
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
                          const pts = revenue.map(
                            (v, i) => `${i * step},${100 - (v / max) * 85}`,
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
                    <p className="text-[11px] font-semibold text-slate-700">
                      Radar IA — diagnósticos
                    </p>
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

          {/* Camera notch */}
          <div className="absolute left-1/2 top-[2px] h-[6px] w-[80px] -translate-x-1/2 rounded-b-md bg-black/70" />
        </div>

        {/* Monitor stand */}
        <div className="mx-auto mt-0 flex w-full flex-col items-center">
          <div
            className="h-3 w-full rounded-b-2xl"
            style={{
              background: "linear-gradient(180deg, #0a0e17 0%, #050810 100%)",
            }}
          />
          <div
            className="h-6 w-24 rounded-b-xl"
            style={{
              background: "linear-gradient(180deg, #1b2233 0%, #0a0e17 100%)",
            }}
          />
          <div className="h-1.5 w-40 rounded-full bg-black/40 blur-sm" />
        </div>

        {/* Floor reflection */}
        <div
          aria-hidden
          className="pointer-events-none mx-auto mt-2 h-24 w-[88%] -scale-y-100 opacity-[0.18] blur-[6px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(56,189,248,0.6) 0%, rgba(15,23,42,0.4) 35%, transparent 80%)",
            maskImage: "linear-gradient(180deg, black 0%, transparent 75%)",
            WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 75%)",
          }}
        />
      </div>
    </div>
  );
}

/* ---------- Integration logo bar (hero) ---------- */
function IntegrationBar() {
  const items = ["Mercado Livre", "Mercado Pago", "Mercado Envios", "Mercado Ads"];
  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 opacity-80">
      <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        <ShieldIcon className="size-3.5" style={{ color: BLUE_DEEP }} />
        Integração Oficial via API
      </span>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {items.map((label) => (
          <span
            key={label}
            className="text-[13px] font-semibold tracking-[-0.01em] text-slate-400 grayscale transition-colors duration-300 hover:text-slate-700"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Ecosystem section (below hero) ---------- */
function EcosystemSection() {
  const partners = [
    "Mercado Livre",
    "Mercado Pago",
    "Mercado Envios",
    "Shopee",
    "Bling",
    "Tiny",
  ];
  return (
    <section className="relative overflow-hidden border-y border-slate-200/70 bg-white py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #0f172a 0 1px, transparent 1px 56px), repeating-linear-gradient(90deg, #0f172a 0 1px, transparent 1px 56px)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Ecossistema Integrado</SectionLabel>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-900 sm:text-3xl">
              Conectado nativamente aos maiores players do mercado
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Integrações oficiais e parceiros estratégicos para operar marketplace, logística,
              pagamentos e ERP em um só lugar.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-12 grid grid-cols-2 items-center gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {partners.map((p) => (
              <div
                key={p}
                className="flex items-center justify-center"
                title={p}
              >
                <span
                  className="select-none text-base font-bold tracking-[-0.02em] text-slate-400 grayscale transition-all duration-300 hover:text-slate-800 hover:scale-[1.04]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
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
        {/* Warehouse / fulfillment subtle pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #0f172a 0 1px, transparent 1px 80px), repeating-linear-gradient(0deg, #0f172a 0 1px, transparent 1px 28px)",
            maskImage:
              "radial-gradient(ellipse at 70% 30%, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 70% 30%, black 0%, transparent 70%)",
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
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pt-16 pb-24 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:pt-24 lg:pb-32">
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">
                  Inteligência para Mercado Livre
                </span>
              </div>

              <h1 className="font-display text-[42px] font-bold leading-[1.05] tracking-[-0.035em] text-slate-900 sm:text-[56px] lg:text-[64px] lg:leading-[1.03]">
                A Central de Inteligência que transforma dados do{" "}
                <span
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${BLUE}, ${CYAN})`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Mercado Livre
                </span>{" "}
                em lucro real.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600/80">
                Gerencie múltiplas contas, controle sua margem e monitore a concorrência com a
                plataforma de inteligência operacional feita para vendedores profissionais.
              </p>

              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
                <a href="#cta-final">
                  <Button
                    size="lg"
                    className="h-14 rounded-full px-8 text-base font-semibold text-white shadow-xl shadow-blue-900/25 transition-transform hover:-translate-y-0.5"
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

              <IntegrationBar />
            </Reveal>

            <Reveal delay={150}>
              <div className="relative">
                <HeroMockup />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============== ECOSSISTEMA INTEGRADO ============== */}
      <EcosystemSection />



      {/* ============== O PROBLEMA — DARK ============== */}
      <section
        id="problemas"
        className="relative overflow-hidden py-28 sm:py-32"
        style={{ background: NAVY_INK }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 400px at 15% 0%, oklch(0.45 0.22 258 / 0.18), transparent 60%), radial-gradient(700px 400px at 100% 100%, oklch(0.55 0.18 220 / 0.14), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel tone="dark">O problema do vendedor profissional</SectionLabel>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Você está vendendo no escuro?
              </h2>
              <p className="mt-4 text-base text-white/70">
                A maioria dos vendedores profissionais opera no improviso — sem visão de margem,
                sem controle de estoque e sem inteligência sobre a concorrência.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            ].map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div
                  className="group flex h-full flex-col rounded-2xl p-7 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:ring-white/25"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div
                    className="mb-5 inline-flex size-12 items-center justify-center rounded-xl shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`,
                      boxShadow: `0 12px 30px -10px ${BLUE}`,
                    }}
                  >
                    <p.icon className="size-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============== 4 PILARES — INTELIGÊNCIA ============== */}
      <section id="solucoes" className="bg-white py-28 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel>Os pilares da inteligência</SectionLabel>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Uma plataforma feita para vender com método e margem
              </h2>
              <p className="mt-4 text-base text-slate-600">
                Quatro camadas de inteligência operando juntas para transformar dados em lucro
                líquido previsível.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Layers,
                title: "Inteligência Multi-conta",
                description:
                  "Visualize todas as suas contas Mercado Livre em um único painel centralizado.",
                bullets: [
                  "Mapa de vendas consolidado",
                  "Faturamento por conta e marketplace",
                  "Comparativo de performance entre filiais",
                ],
                accent: "blue" as const,
              },
              {
                icon: Radar,
                title: "Radar IA de Performance",
                description:
                  "Diagnósticos automáticos que identificam riscos de ruptura, baixa conversão e oportunidades de kits.",
                bullets: [
                  "Alertas de ruptura antes que aconteça",
                  "Detecção de queda de conversão",
                  "Sugestões de kits e bundles",
                ],
                accent: "navy" as const,
              },
              {
                icon: DollarSign,
                title: "Controle de Margem e Lucro",
                description:
                  "Saiba o seu lucro líquido real por anúncio, descontando taxas, impostos e fretes automaticamente.",
                bullets: [
                  "Lucro líquido por SKU e anúncio",
                  "Curva ABC financeira real",
                  "Custos sincronizados e versionados",
                ],
                accent: "blue" as const,
              },
              {
                icon: Eye,
                title: "Espionagem de Mercado",
                description:
                  "Monitore preços e estoques dos concorrentes em tempo real e aja estrategicamente.",
                bullets: [
                  "Preço e buy box monitorados por hora",
                  "Histórico de estoque dos concorrentes",
                  "Alertas de movimento agressivo",
                ],
                accent: "navy" as const,
              },
            ].map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <PillarCard {...p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SEGMENTOS — Marketplaces ============== */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
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
          </Reveal>
        </div>
      </section>

      {/* ============== COMO FUNCIONA — MÉTODO ============== */}
      <section id="como-funciona" className="bg-white py-28 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel>O método</SectionLabel>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Da conexão à escala lucrativa em 4 passos
              </h2>
              <p className="mt-4 text-base text-slate-600">
                Um processo claro para transformar dados brutos em decisões operacionais
                mensuráveis.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                icon: Plug,
                title: "Conexão via API oficial",
                description:
                  "Conecte as suas contas Mercado Livre com total segurança em segundos, via API oficial.",
              },
              {
                number: "02",
                icon: Brain,
                title: "Diagnóstico automático",
                description:
                  "Nossa IA analisa o seu histórico e identifica gargalos de lucro, conversão e estoque.",
              },
              {
                number: "03",
                icon: Workflow,
                title: "Ação direcionada",
                description:
                  "Receba tarefas claras para os seus operadores de Ads, Catálogo e Compras.",
              },
              {
                number: "04",
                icon: Rocket,
                title: "Escala lucrativa",
                description:
                  "Acompanhe o impacto real das ações no seu faturamento e na sua margem líquida.",
              },
            ].map((s, i) => (
              <Reveal key={s.number} delay={i * 80}>
                <JourneyStep {...s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============== PLANOS — DARK ============== */}
      <section
        id="planos"
        className="relative overflow-hidden py-28 sm:py-32"
        style={{ background: NAVY_INK }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 400px at 50% 0%, oklch(0.55 0.22 258 / 0.20), transparent 60%), radial-gradient(600px 350px at 100% 100%, oklch(0.78 0.18 215 / 0.12), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel tone="dark">Planos</SectionLabel>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Escolha o plano certo para a sua operação
              </h2>
              <p className="mt-4 text-base text-white/70">
                Implantação assistida e suporte humano em todos os planos.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "R$ 497",
                description: "Para vendedores começando a profissionalizar a operação.",
                features: [
                  "Até 2 contas Mercado Livre",
                  "Mapa de vendas consolidado",
                  "Controle de custo e margem básica",
                  "Relatórios essenciais",
                ],
              },
              {
                name: "Growth",
                price: "R$ 1.197",
                description:
                  "Para operações multi-conta que precisam escalar com inteligência.",
                features: [
                  "Até 10 contas Mercado Livre",
                  "Radar IA de performance",
                  "Lucro líquido real por anúncio",
                  "Espionagem de preço e estoque",
                  "Curva ABC financeira",
                ],
                highlighted: true,
              },
              {
                name: "Scale",
                price: "Sob consulta",
                description: "Para grupos com múltiplos CNPJs e alto volume.",
                features: [
                  "Contas ilimitadas",
                  "Multi-CNPJ e multi-filial",
                  "Integrações ERP personalizadas",
                  "Gestor de sucesso dedicado",
                  "SLA empresarial",
                ],
              },
            ].map((p, i) => (
              <Reveal key={p.name} delay={i * 100}>
                <PlanCard {...p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============== CREDIBILIDADE ============== */}
      <section className="bg-white py-28 sm:py-32">
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
            ].map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="flex h-full flex-col rounded-2xl bg-slate-50/60 p-7 ring-1 ring-slate-200/60">
                  <div
                    className="mb-5 inline-flex size-12 items-center justify-center rounded-xl text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`,
                      boxShadow: `0 10px 25px -10px ${BLUE}`,
                    }}
                  >
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FAQ ============== */}
      <section id="faq" className="bg-slate-50/70 py-28 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <Reveal>
            <div className="text-center">
              <SectionLabel>Dúvidas frequentes</SectionLabel>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Tudo o que você precisa saber
              </h2>
            </div>
          </Reveal>

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
      <section id="cta-final" className="relative overflow-hidden bg-white py-28 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <Reveal>
            <div
              className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${NAVY_INK} 0%, ${NAVY} 50%, ${BLUE_DEEP} 100%)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(ellipse at top right, oklch(0.62 0.22 255 / 0.7), transparent 60%), radial-gradient(ellipse at bottom left, oklch(0.78 0.18 215 / 0.4), transparent 60%)",
                }}
              />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
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
          </Reveal>
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

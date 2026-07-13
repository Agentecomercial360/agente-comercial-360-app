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
import heroWarehouse from "@/assets/hero-warehouse.jpg";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SITE_URL = "https://agentecomercial360.com.br";
const LANDING_TITLE = "AC360 — Inteligência de Vendas para Mercado Livre";
const LANDING_DESCRIPTION =
  "Central de inteligência para vendedores profissionais de Mercado Livre: multi-conta, margem líquida real, Diagnóstico Inteligente e monitoramento de concorrência em um só painel.";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: LANDING_TITLE },
      { name: "description", content: LANDING_DESCRIPTION },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: LANDING_TITLE },
      { property: "og:description", content: LANDING_DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/landing` },
      { property: "og:image", content: `${SITE_URL}/ac360-social-preview.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: LANDING_TITLE },
      { name: "twitter:description", content: LANDING_DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/ac360-social-preview.png` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
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

/* ---------- Glassmorphism dashboard ---------- */
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
    <div className="relative mx-auto w-full max-w-[760px]">
      {/* Glass panel */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/20 p-4 sm:p-5 shadow-[0_40px_120px_-30px_rgba(8,12,25,0.85)] backdrop-blur-2xl"
        style={{
          background:
            "linear-gradient(160deg, rgba(15,23,42,0.55) 0%, rgba(8,12,22,0.35) 100%)",
        }}
      >
        {/* subtle inner highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 60px rgba(56,189,248,0.06)",
          }}
        />

        {/* Header bar */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              <img src={acLogo} alt="" className="size-5" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white">
                Central de Inteligência — Mercado Livre
              </p>
              <p className="text-[10px] text-white/60">
                9 contas conectadas · 109 anúncios monitorados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
              <Bell className="size-3.5 text-white/80" />
            </span>
            <span className="flex size-7 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
              <UserCircle2 className="size-4 text-white/80" />
            </span>
          </div>
        </div>

        {/* KPIs */}
        <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Faturamento", value: "R$ 90.5k", delta: "+22%", up: true },
            { label: "Lucro Líquido", value: "R$ 18.2k", delta: "+14%", up: true },
            { label: "Margem média", value: "20,1%", delta: "+1,8 p.p.", up: true },
            { label: "Risco ruptura", value: "2", delta: "alertas", up: false },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur"
            >
              <p className="text-[10px] font-medium text-white/60">{k.label}</p>
              <p className="mt-0.5 text-[15px] font-bold tracking-tight text-white">
                {k.value}
              </p>
              <p
                className={`text-[10px] font-semibold ${
                  k.up ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {k.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Mapa de vendas + Receita */}
        <div className="relative mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-white/85">
                Mapa de Vendas (multi-conta)
              </p>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white"
                style={{ background: "rgba(56,189,248,0.18)" }}
              >
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
                  <span className="whitespace-nowrap text-[10px] text-white/70">
                    {a.name}
                  </span>
                  <span className="ml-auto text-[10px] font-semibold text-white">
                    {a.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-white/85">Receita líquida</p>
              <span className="rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
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
                    <stop offset="0%" stopColor={NEON} stopOpacity="0.55" />
                    <stop offset="100%" stopColor={NEON} stopOpacity="0" />
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
                        stroke={NEON}
                        strokeWidth="2"
                      />
                      {revenue.map((v, i) => (
                        <circle
                          key={i}
                          cx={i * step}
                          cy={100 - (v / max) * 85}
                          r="2.5"
                          fill={NEON}
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-white/40">
              {["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnóstico Inteligente */}
        <div className="relative mt-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-white/85">
              Diagnóstico Inteligente — diagnósticos
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white ring-1 ring-white/15">
              <Brain className="size-2.5" /> IA ativa
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="rounded-md bg-amber-400/10 p-2 ring-1 ring-amber-300/30">
              <div className="flex items-center gap-1 font-semibold text-amber-300">
                <AlertTriangle className="size-3" /> Ruptura em 3 dias
              </div>
              <p className="mt-0.5 text-amber-200/80">Lanterna LED — Robomix</p>
            </div>
            <div className="rounded-md bg-rose-400/10 p-2 ring-1 ring-rose-300/30">
              <div className="flex items-center gap-1 font-semibold text-rose-300">
                <TrendingDown className="size-3" /> Margem caindo
              </div>
              <p className="mt-0.5 text-rose-200/80">Kit Farol — Nightled</p>
            </div>
            <div className="rounded-md bg-emerald-400/10 p-2 ring-1 ring-emerald-300/30">
              <div className="flex items-center gap-1 font-semibold text-emerald-300">
                <TrendingUp className="size-3" /> Oportunidade kit
              </div>
              <p className="mt-0.5 text-emerald-200/80">+18% conversão prevista</p>
            </div>
          </div>
        </div>
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
    {
      name: "Mercado Livre",
      desc: "Sincronize contas, produtos, anúncios, pedidos e performance em uma visão multi-conta.",
      badge: "Integração principal",
      badgeTone: "primary",
      icon: Store,
    },
    {
      name: "Mercado Pago",
      desc: "Base para acompanhar pagamentos, taxas, repasses e rentabilidade real por venda.",
      badge: "Financeiro",
      badgeTone: "neutral",
      icon: DollarSign,
    },
    {
      name: "Mercado Envios",
      desc: "Estrutura para análise logística, envio, região do comprador e performance por estado.",
      badge: "Logística",
      badgeTone: "neutral",
      icon: Truck,
    },
    {
      name: "Shopee",
      desc: "Preparado para expansão multi-marketplace e consolidação futura das vendas.",
      badge: "Marketplace futuro",
      badgeTone: "soft",
      icon: ShoppingBag,
    },
    {
      name: "Bling",
      desc: "Conexão estratégica para ERP, estoque, cadastro de produtos, compras e operação interna.",
      badge: "ERP",
      badgeTone: "neutral",
      icon: Boxes,
    },
    {
      name: "Tiny",
      desc: "Integração futura para centralizar dados operacionais, estoque, pedidos e produtos.",
      badge: "ERP futuro",
      badgeTone: "soft",
      icon: Workflow,
    },
  ] as const;

  const badgeClass = (tone: string) =>
    tone === "primary"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : tone === "soft"
        ? "border-slate-200 bg-slate-50 text-slate-500"
        : "border-slate-200 bg-white text-slate-600";

  const highlights = [
    { label: "Multi-conta", icon: Layers },
    { label: "Marketplace + ERP", icon: Plug },
    { label: "Dados preparados para IA", icon: Brain },
  ];

  return (
    <section className="relative overflow-hidden border-y border-slate-200/70 bg-white py-24 sm:py-32">
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
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.025em] text-slate-900 sm:text-4xl">
              Um ecossistema conectado para controlar toda a operação
            </h2>
            <p className="mt-4 text-base text-slate-500">
              Integre marketplace, pagamentos, logística e ERP em uma única central de
              inteligência operacional.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map(({ name, desc, badge, badgeTone, icon: Icon }) => (
              <div
                key={name}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/70 hover:shadow-[0_18px_40px_-18px_rgba(37,99,235,0.35)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white text-blue-600 transition-colors group-hover:border-blue-200 group-hover:text-blue-700">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${badgeClass(badgeTone)}`}
                  >
                    {badge}
                  </span>
                </div>
                <h3
                  className="mt-5 text-lg font-bold tracking-[-0.02em] text-slate-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
                <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 transition-colors group-hover:text-blue-600">
                  Conectado ao AC360
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-14 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-6 sm:p-8">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {highlights.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" strokeWidth={2.4} />
                    </div>
                    <span className="text-sm font-semibold tracking-[-0.01em] text-slate-800">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-slate-600 lg:text-right">
                <span className="font-semibold text-slate-900">Do anúncio ao lucro:</span> o AC360
                conecta os pontos críticos da operação para transformar dados em decisão.
              </p>
            </div>
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
        className="relative overflow-hidden"
        style={{ background: NAVY_INK }}
      >
        {/* Warehouse photo background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            backgroundImage: `url(${heroWarehouse})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px)",
            transform: "scale(1.05)",
          }}
        />
        {/* Dark gradient overlay for legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,8,16,0.97) 0%, rgba(6,10,20,0.92) 45%, rgba(6,10,20,0.72) 100%), radial-gradient(900px 500px at 80% 10%, oklch(0.45 0.18 255 / 0.32), transparent 60%)",
          }}
        />
        {/* Subtle tech grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #ffffff 0 1px, transparent 1px 80px), repeating-linear-gradient(0deg, #ffffff 0 1px, transparent 1px 28px)",
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
              <img src={acLogo} alt="Agente Comercial 360" className="h-9 w-auto brightness-0 invert" />
            </a>
            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
              <a href="#problemas" className="transition-colors hover:text-white">
                Problemas
              </a>
              <a href="#solucoes" className="transition-colors hover:text-white">
                Inteligência
              </a>
              <a href="#como-funciona" className="transition-colors hover:text-white">
                Método
              </a>
              <a href="#planos" className="transition-colors hover:text-white">
                Planos
              </a>
              <a href="#faq" className="transition-colors hover:text-white">
                FAQ
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                to="/ecommerce/login"
                className="hidden text-sm font-medium text-slate-300 transition-colors hover:text-white sm:inline-block"
              >
                Entrar no painel
              </Link>
              <a href="#cta-final">
                <Button
                  className="h-10 rounded-full px-5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40"
                  style={{ background: BLUE }}
                >
                  Solicitar demonstração
                </Button>
              </a>
            </div>
          </header>

          {/* Hero */}
          <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 pt-16 pb-24 lg:px-10 lg:pt-24 lg:pb-32">
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 shadow-sm backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
                  Inteligência para Mercado Livre
                </span>
              </div>

              <h1 className="font-display text-[42px] font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-[56px] lg:text-[64px] lg:leading-[1.03]">
                A Central de Inteligência que transforma dados do{" "}
                <span
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${CYAN}, ${NEON})`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Mercado Livre
                </span>{" "}
                em lucro real.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                Gerencie múltiplas contas, controle sua margem e monitore a concorrência com a
                plataforma de inteligência operacional feita para vendedores profissionais.
              </p>

              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
                <a href="#cta-final">
                  <Button
                    size="lg"
                    className="ac-btn-glow h-14 rounded-full px-8 text-base font-semibold text-white shadow-xl shadow-blue-900/40 transition-all hover:-translate-y-0.5"
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
                    className="ac-btn-glow h-14 rounded-full border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur hover:bg-white/10 hover:text-white"
                  >
                    Ver Funcionalidades de Inteligência
                  </Button>
                </a>
              </div>

              {/* Metric chips */}
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                {[
                  { icon: Plug, label: "API oficial" },
                  { icon: Layers, label: "Multi-conta" },
                  { icon: Radar, label: "Diagnóstico Inteligente" },
                ].map(({ icon: Ic, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur"
                  >
                    <Ic className="size-3.5" style={{ color: NEON }} />
                    <span className="text-[11.5px] font-medium tracking-[-0.005em] text-slate-200">
                      {label}
                    </span>
                  </span>
                ))}
              </div>

              {/* Social proof */}
              <p className="mt-5 text-[13.5px] font-light leading-relaxed text-slate-300/90">
                <span style={{ color: CYAN }} className="font-medium">
                  Mais de R$ 5M
                </span>{" "}
                em faturamento mensal monitorados pela nossa inteligência.
              </p>
            </Reveal>




          </div>

          {/* Certification seal — hero signature */}
          <div className="relative z-10 mx-auto flex max-w-7xl justify-center px-6 pb-8 lg:px-10">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 backdrop-blur-md">
              <span
                className="inline-flex size-5 items-center justify-center rounded-full text-white"
                style={{
                  background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`,
                  boxShadow: `0 0 10px -2px ${NEON}`,
                }}
              >
                <ShieldCheck className="size-3" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300/90">
                Plataforma Certificada · Integração Oficial via API Mercado Livre
              </span>
            </div>
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
                Pare de queimar margem com anúncios cegos e falta de controle operacional.
              </h2>
              <p className="mt-4 text-base text-white/70">
                A maioria dos vendedores profissionais opera no improviso — sem visão de margem,
                sem controle de estoque e sem inteligência sobre a concorrência. O{" "}
                <span className="font-semibold text-white">Motor de Insights AC360®</span> existe
                para encerrar esse ciclo.
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
                title: "Diagnóstico Inteligente Financeiro",
                description:
                  "Diagnósticos automáticos do Motor de Insights AC360® que identificam riscos de ruptura, queda de margem e oportunidades de kit.",
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
                  "Diagnóstico Inteligente de performance",
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
                q: "O que o Diagnóstico Inteligente faz na prática?",
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
                  <Link to="/ecommerce/login">
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

      {/* ============== FOOTER — ENTERPRISE ============== */}
      <footer
        className="relative overflow-hidden text-white"
        style={{ background: `linear-gradient(180deg, ${NAVY_INK} 0%, #05080f 100%)` }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #ffffff 0 1px, transparent 1px 80px), repeating-linear-gradient(0deg, #ffffff 0 1px, transparent 1px 80px)",
            maskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Col 1 — Brand */}
            <div>
              <div className="flex items-center gap-3">
                <img src={acLogo} alt="Agente Comercial 360" className="h-10 w-auto" />
                <span className="text-base font-semibold tracking-[-0.01em] text-white">
                  AC360
                </span>
              </div>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">
                A central de inteligência comercial definitiva para vendedores profissionais.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <ShieldIcon className="size-3.5" style={{ color: CYAN }} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  API Oficial Mercado Livre
                </span>
              </div>
            </div>

            {/* Col 2 — Funcionalidades */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                Funcionalidades
              </h4>
              <ul className="mt-5 space-y-3 text-sm text-white/75">
                <li><a href="#solucoes" className="transition-colors hover:text-white">Inteligência Multi-conta</a></li>
                <li><a href="#solucoes" className="transition-colors hover:text-white">Diagnóstico Inteligente Financeiro</a></li>
                <li><a href="#solucoes" className="transition-colors hover:text-white">Controle de Margem</a></li>
                <li><a href="#solucoes" className="transition-colors hover:text-white">Espionagem de Mercado</a></li>
              </ul>
            </div>

            {/* Col 3 — Suporte */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                Suporte
              </h4>
              <ul className="mt-5 space-y-3 text-sm text-white/75">
                <li><a href="#faq" className="transition-colors hover:text-white">FAQ</a></li>
                <li><a href="#cta-final" className="transition-colors hover:text-white">Central de Ajuda</a></li>
                <li><a href="#cta-final" className="transition-colors hover:text-white">Solicitar Demo</a></li>
                <li><Link to="/login" className="transition-colors hover:text-white">Área do Cliente</Link></li>
              </ul>
            </div>

            {/* Col 4 — Institucional */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                Institucional
              </h4>
              <ul className="mt-5 space-y-3 text-sm text-white/75">
                <li><a href="#" className="transition-colors hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Privacidade</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Blog</a></li>
                <li><a href="#" className="transition-colors hover:text-white">API Oficial</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-8 sm:flex-row">
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <p className="text-xs text-white/50">
                © {new Date().getFullYear()} Agente Comercial 360. Todos os direitos reservados.
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: CYAN }}>
                Feito para quem escala com inteligência.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Youtube, href: "#", label: "YouTube" },
                { icon: Mail, href: "mailto:contato@agentecomercial360.com.br", label: "E-mail" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all duration-300 hover:border-white/30 hover:text-white hover:-translate-y-0.5"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

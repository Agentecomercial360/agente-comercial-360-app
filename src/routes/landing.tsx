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
const LANDING_TITLE = "AC360 — Inteligência e Performance para Mercado Livre";
const LANDING_DESCRIPTION =
  "Tecnologia proprietária e consultoria para transformar dados do Mercado Livre em prioridades, ações e resultado.";

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
  const valueItems = [
    {
      icon: ShieldCheck,
      title: "Conta ativa",
      desc: "Acompanhe alertas e sinais importantes da saúde da operação.",
    },
    {
      icon: DollarSign,
      title: "Margem e resultado",
      desc: "Entenda como vendas, taxas e custos impactam o resultado da operação.",
    },
    {
      icon: Target,
      title: "Execução inteligente",
      desc: "Saiba onde agir primeiro em estoque, anúncios e rotina comercial.",
    },
  ];

  const views = [
    {
      key: "vendas",
      label: "Vendas",
      icon: BarChart3,
      eyebrow: "Visão de vendas",
      title: "Entenda o ritmo das vendas e onde o resultado está sendo construído.",
      supporting: "Pedidos, faturamento e ticket em uma leitura mais direta da operação.",
      tags: ["Pedidos", "Faturamento", "Ticket médio"],
      objectPosition: "52% center",
      filter: "saturate(1.03) contrast(1.05) brightness(0.94)",
      overlay:
        "linear-gradient(180deg, rgba(5,35,86,0.03) 0%, rgba(5,35,86,0.10) 48%, rgba(5,35,86,0.70) 100%)",
    },
    {
      key: "margem",
      label: "Margem",
      icon: DollarSign,
      eyebrow: "Visão de margem",
      title: "Veja onde a margem aperta antes de descobrir isso no fim do mês.",
      supporting: "Receita, taxas e rentabilidade organizadas para apoiar decisões mais seguras.",
      tags: ["Receita", "Taxas", "Rentabilidade"],
      objectPosition: "35% center",
      filter: "saturate(0.78) contrast(1.12) brightness(0.80)",
      overlay:
        "linear-gradient(180deg, rgba(20,12,4,0.04) 0%, rgba(20,12,4,0.22) 44%, rgba(20,12,4,0.78) 100%)",
    },
    {
      key: "estoque",
      label: "Estoque",
      icon: Boxes,
      eyebrow: "Visão de estoque",
      title: "Identifique o que exige reposição ou atenção antes da ruptura.",
      supporting: "Giro, cobertura e sinais de estoque reunidos para orientar a rotina operacional.",
      tags: ["Giro", "Cobertura", "Risco de ruptura"],
      objectPosition: "73% center",
      filter: "saturate(1.18) contrast(1.10) brightness(0.88)",
      overlay:
        "linear-gradient(180deg, rgba(4,29,24,0.03) 0%, rgba(4,29,24,0.18) 48%, rgba(4,29,24,0.76) 100%)",
    },
    {
      key: "anuncios",
      label: "Anúncios",
      icon: Target,
      eyebrow: "Visão de anúncios",
      title: "Saiba quais anúncios merecem ajuste antes de aumentar o investimento.",
      supporting: "Visibilidade, conversão e eficiência para priorizar o que realmente merece ação.",
      tags: ["Conversão", "Visibilidade", "Eficiência"],
      objectPosition: "88% center",
      filter: "saturate(0.92) contrast(1.18) brightness(0.76)",
      overlay:
        "linear-gradient(180deg, rgba(18,11,47,0.04) 0%, rgba(18,11,47,0.24) 48%, rgba(18,11,47,0.80) 100%)",
    },
  ];

  return (
    <section
      id="solucoes"
      className="relative overflow-hidden border-y border-slate-200/70 bg-[#f7f9fc] py-20 sm:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
          <Reveal>
            <SectionLabel>Operação com mais controle</SectionLabel>

            <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-[-0.035em] text-[#071b45] sm:text-4xl lg:text-[46px] lg:leading-[1.02]">
              Uma operação mais organizada, lucrativa e previsível.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              O AC360 organiza sinais de vendas, margem, estoque e anúncios para você enxergar o
              que exige atenção e agir com mais clareza.
            </p>

            <div className="mt-8 space-y-3">
              {valueItems.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group flex gap-4 rounded-2xl border border-slate-200/80 bg-white/88 p-4 shadow-[0_12px_34px_-24px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_44px_-24px_rgba(37,99,235,0.28)]"
                >
                  <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-[-0.015em] text-slate-900">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative" data-operation-tabs>
              <style>{`
                [data-operation-tabs] .operation-view,
                [data-operation-tabs] .operation-copy {
                  display: none;
                }

                #op-vendas:checked ~ .operation-shell .view-vendas,
                #op-vendas:checked ~ .operation-shell .copy-vendas,
                #op-margem:checked ~ .operation-shell .view-margem,
                #op-margem:checked ~ .operation-shell .copy-margem,
                #op-estoque:checked ~ .operation-shell .view-estoque,
                #op-estoque:checked ~ .operation-shell .copy-estoque,
                #op-anuncios:checked ~ .operation-shell .view-anuncios,
                #op-anuncios:checked ~ .operation-shell .copy-anuncios {
                  display: block;
                }

                [data-operation-tabs] .operation-tab {
                  border-color: rgba(255,255,255,.20);
                  background: rgba(255,255,255,.10);
                  color: rgba(255,255,255,.78);
                }

                #op-vendas:checked ~ .operation-shell label[for="op-vendas"],
                #op-margem:checked ~ .operation-shell label[for="op-margem"],
                #op-estoque:checked ~ .operation-shell label[for="op-estoque"],
                #op-anuncios:checked ~ .operation-shell label[for="op-anuncios"] {
                  border-color: rgba(255,255,255,.95);
                  background: rgba(255,255,255,.96);
                  color: #0f172a;
                  box-shadow: 0 8px 22px rgba(15,23,42,.20);
                }

                [data-operation-tabs] .operation-tab:hover {
                  border-color: rgba(255,255,255,.42);
                  background: rgba(255,255,255,.16);
                  color: white;
                }

                #op-vendas:checked ~ .operation-shell label[for="op-vendas"]:hover,
                #op-margem:checked ~ .operation-shell label[for="op-margem"]:hover,
                #op-estoque:checked ~ .operation-shell label[for="op-estoque"]:hover,
                #op-anuncios:checked ~ .operation-shell label[for="op-anuncios"]:hover {
                  background: white;
                  color: #0f172a;
                }
              `}</style>

              <input id="op-vendas" name="operation-view" type="radio" defaultChecked className="sr-only" />
              <input id="op-margem" name="operation-view" type="radio" className="sr-only" />
              <input id="op-estoque" name="operation-view" type="radio" className="sr-only" />
              <input id="op-anuncios" name="operation-view" type="radio" className="sr-only" />

              <div className="operation-shell relative min-h-[445px] overflow-hidden rounded-[30px] border border-white/80 bg-slate-950 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.48)] sm:min-h-[520px]">
                {views.map((view) => (
                  <div key={view.key} className={`operation-view view-${view.key} absolute inset-0`}>
                    <img
                      src={heroWarehouse}
                      alt={`Visual da operação: ${view.label}`}
                      className="absolute inset-0 h-full w-full scale-[1.035] object-cover transition-all duration-500"
                      style={{
                        objectPosition: view.objectPosition,
                        filter: view.filter,
                      }}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{ background: view.overlay }}
                    />

                    <div className="absolute left-5 top-5 sm:left-6 sm:top-6">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-slate-950/40 px-3.5 py-2 text-white shadow-lg backdrop-blur-xl">
                        <view.icon className="size-3.5 text-white/90" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/82">
                          {view.eyebrow}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="absolute inset-x-4 bottom-4 z-10 sm:inset-x-6 sm:bottom-6">
                  <div className="rounded-[24px] border border-white/20 bg-slate-950/62 p-4 text-white shadow-2xl backdrop-blur-2xl sm:p-5">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#f6c400]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                        Tudo conectado à mesma inteligência
                      </span>
                    </div>

                    <div className="mt-3 min-h-[108px]">
                      {views.map((view) => (
                        <div key={view.key} className={`operation-copy copy-${view.key}`}>
                          <p className="max-w-[570px] text-lg font-semibold leading-snug sm:text-[21px]">
                            {view.title}
                          </p>
                          <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-white/65">
                            {view.supporting}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                            {view.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-2 text-xs font-medium text-white/68"
                              >
                                <CheckCircle2 className="size-3.5 text-blue-300" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4"
                      role="tablist"
                      aria-label="Áreas da operação"
                    >
                      {views.map(({ key, label, icon: Icon }) => (
                        <label
                          key={key}
                          htmlFor={`op-${key}`}
                          role="tab"
                          className="operation-tab inline-flex cursor-pointer select-none items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200"
                        >
                          <Icon className="size-3.5" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-3 -top-3 z-20 hidden rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_16px_40px_-22px_rgba(15,23,42,0.32)] backdrop-blur-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Radar className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      AC360
                    </p>
                    <p className="text-sm font-semibold text-slate-800">Clique para explorar a operação</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function LandingPage() {
  const commerceAreas = [
    {
      key: "vendas",
      label: "Vendas",
      icon: BarChart3,
      title: "Entenda o que realmente está movimentando suas vendas.",
      description:
        "Conecte faturamento, pedidos e ticket para enxergar ritmo, mudança de comportamento e pontos que pedem atenção.",
      bullets: ["Pedidos e faturamento", "Ticket e evolução", "Leitura comercial"],
    },
    {
      key: "margem",
      label: "Margem",
      icon: DollarSign,
      title: "Descubra onde o lucro está escapando antes do fim do mês.",
      description:
        "Cruze receita, taxas e custos para identificar produtos saudáveis, margens comprometidas e decisões que precisam de correção.",
      bullets: ["Rentabilidade", "Taxas e custos", "Eficiência por venda"],
    },
    {
      key: "estoque",
      label: "Estoque",
      icon: Boxes,
      title: "Antecipe ruptura antes que ela vire perda de venda.",
      description:
        "Use giro, cobertura e disponibilidade para saber o que proteger, recomprar ou acompanhar com mais atenção.",
      bullets: ["Giro de estoque", "Cobertura", "Risco de ruptura"],
    },
    {
      key: "anuncios",
      label: "Anúncios",
      icon: Target,
      title: "Saiba onde ajustar antes de simplesmente investir mais.",
      description:
        "Conecte desempenho, conversão e eficiência para diferenciar anúncios que precisam de correção daqueles que podem ganhar escala.",
      bullets: ["Conversão", "Visibilidade", "Eficiência"],
    },
  ];

  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 48);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#080b10] text-white antialiased">
      {/* ==================== HERO — E-COMMERCE INTELLIGENCE ==================== */}
      <section id="top" className="relative min-h-[850px] overflow-hidden bg-[#071630]">
        <img
          src={heroWarehouse}
          alt="Operação de e-commerce e logística"
          className="absolute inset-0 h-full w-full scale-[1.03] object-cover object-center"
          style={{ filter: "saturate(0.82) contrast(1.08) brightness(0.55)" }}
        />

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,19,48,0.90) 0%, rgba(6,24,56,0.86) 42%, rgba(5,20,48,0.94) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(30,94,255,.18), transparent 34%), radial-gradient(circle at 72% 66%, rgba(56,189,248,.08), transparent 28%)",
          }}
        />

        <div className="relative z-10">
          <div
            className={
              "fixed inset-x-0 top-0 z-50 transition-all duration-300 " +
              (headerScrolled
                ? "border-b border-slate-200/80 bg-white/95 shadow-[0_12px_35px_-28px_rgba(10,31,68,.45)] backdrop-blur-xl"
                : "bg-transparent")
            }
          >
            <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
              <a href="#top" className="flex items-center gap-3">
                <img
                  src={acLogo}
                  alt="AC360"
                  className={
                    "h-9 w-auto transition-all duration-300 " +
                    (headerScrolled ? "" : "brightness-0 invert")
                  }
                />
                <span
                  className={
                    "hidden border-l pl-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors sm:block " +
                    (headerScrolled
                      ? "border-slate-200 text-slate-500"
                      : "border-white/20 text-white/55")
                  }
                >
                  E-commerce Intelligence
                </span>
              </a>

              <nav
                className={
                  "hidden items-center gap-8 text-[13px] font-medium transition-colors lg:flex " +
                  (headerScrolled ? "text-slate-600" : "text-white/68")
                }
              >
                <a href="#operacao" className={headerScrolled ? "transition-colors hover:text-blue-700" : "transition-colors hover:text-white"}>
                  Soluções
                </a>
                <a href="#inteligencia" className={headerScrolled ? "transition-colors hover:text-blue-700" : "transition-colors hover:text-white"}>
                  Inteligência
                </a>
                <a href="#cta-final" className={headerScrolled ? "transition-colors hover:text-blue-700" : "transition-colors hover:text-white"}>
                  Consultoria
                </a>
                <a href="#solucoes" className={headerScrolled ? "transition-colors hover:text-blue-700" : "transition-colors hover:text-white"}>
                  Plataforma
                </a>
              </nav>

              <div className="flex items-center gap-3">
                <Link
                  to="/ecommerce/login"
                  className={
                    "hidden rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:inline-flex " +
                    (headerScrolled
                      ? "text-slate-600 hover:text-blue-700"
                      : "text-white/72 hover:text-white")
                  }
                >
                  Login
                </Link>
                <a
                  href="#cta-final"
                  className={
                    "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:-translate-y-0.5 " +
                    (headerScrolled
                      ? "bg-blue-600 text-white shadow-[0_12px_30px_-18px_rgba(37,99,235,.65)] hover:bg-blue-500"
                      : "bg-white text-[#0A1F44] shadow-[0_12px_35px_-18px_rgba(255,255,255,.55)] hover:shadow-lg")
                  }
                >
                  Solicitar diagnóstico
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </header>
          </div>

          <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-20 pt-36 text-center lg:px-10 lg:pt-40">
            <Reveal className="mx-auto flex max-w-5xl flex-col items-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-[#ffbf31] shadow-[0_0_16px_rgba(255,191,49,.65)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-white/70">
                  AC360 · Inteligência + consultoria para Mercado Livre
                </span>
              </div>

              <h1 className="mt-7 max-w-5xl font-display text-[44px] font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-[58px] lg:text-[68px]">
                Saiba onde agir primeiro
                <span className="mt-2 block text-[#73A7FF]">
                  para vender com mais margem no Mercado Livre.
                </span>
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/68 sm:text-lg">
                O AC360 conecta vendas, margem, estoque e anúncios, identifica os pontos que
                mais impactam o resultado e transforma esses sinais em prioridades claras para agir.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                {["Vendas", "Margem", "Estoque", "Ads", "Prioridades"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/16 bg-white/[0.055] px-4 py-2 text-xs font-medium text-white/78 backdrop-blur-lg"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={110} className="mt-10 w-full max-w-4xl">
              <div className="overflow-hidden rounded-[28px] border border-white/16 bg-[#061329]/88 text-left shadow-[0_32px_100px_-42px_rgba(0,0,0,.9)] backdrop-blur-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-blue-200">
                      <Brain className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/40">
                        AC360 Intelligence
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-white">
                        Sua operação transformada em prioridade
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-3 py-1.5 text-[9px] font-semibold text-emerald-200">
                    Operação conectada
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="ml-auto max-w-[680px] rounded-[18px] rounded-br-md border border-blue-300/15 bg-blue-500/[0.12] px-4 py-3 text-[12.5px] font-medium leading-relaxed text-white/90">
                    AC360, o que está prejudicando meu resultado hoje?
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-950/35">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 rounded-[18px] rounded-tl-md border border-white/10 bg-white/[0.055] p-4">
                      <p className="text-[12px] leading-relaxed text-white/72">
                        Encontrei três frentes que merecem atenção. Comece pelas ações com maior
                        impacto financeiro e valide a causa antes de executar.
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-rose-300/10 bg-rose-400/[0.06] p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-400/10 text-rose-200">
                              <DollarSign className="h-4 w-4" />
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-rose-200/75">
                              Prioridade
                            </span>
                          </div>
                          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                            Margem
                          </p>
                          <p className="mt-1 text-[11.5px] font-semibold text-white">
                            Custos pendentes bloqueiam uma leitura confiável.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-amber-300/10 bg-amber-400/[0.06] p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/10 text-amber-200">
                              <Boxes className="h-4 w-4" />
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-amber-200/75">
                              Atenção
                            </span>
                          </div>
                          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                            Estoque
                          </p>
                          <p className="mt-1 text-[11.5px] font-semibold text-white">
                            Itens com giro relevante entram em zona de risco.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-blue-300/10 bg-blue-400/[0.06] p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-400/10 text-blue-200">
                              <Target className="h-4 w-4" />
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-blue-200/75">
                              Oportunidade
                            </span>
                          </div>
                          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                            Anúncios
                          </p>
                          <p className="mt-1 text-[11.5px] font-semibold text-white">
                            Campanhas e produtos com espaço para revisão ou escala.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                        <p className="text-[10.5px] text-white/42">
                          Dados → diagnóstico → prioridade → ação → resultado
                        </p>
                        <a
                          href="#operacao"
                          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10.5px] font-bold text-[#0A1F44] transition hover:-translate-y-0.5"
                        >
                          Ver como o AC360 funciona
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================== OPERAÇÃO — IMMERSIVE PANELS ==================== */}
      <section
        id="operacao"
        className="relative overflow-hidden border-y border-white/[0.06] bg-[#0b0d12] py-24 sm:py-28"
        data-commerce-areas
      >
        <style>{`
          [data-commerce-areas] .commerce-copy,
          [data-commerce-areas] .commerce-ambient {
            display: none;
          }

          #commerce-vendas:checked ~ .commerce-stage .copy-vendas,
          #commerce-vendas:checked ~ .commerce-stage .ambient-vendas,
          #commerce-margem:checked ~ .commerce-stage .copy-margem,
          #commerce-margem:checked ~ .commerce-stage .ambient-margem,
          #commerce-estoque:checked ~ .commerce-stage .copy-estoque,
          #commerce-estoque:checked ~ .commerce-stage .ambient-estoque,
          #commerce-anuncios:checked ~ .commerce-stage .copy-anuncios,
          #commerce-anuncios:checked ~ .commerce-stage .ambient-anuncios {
            display: block;
          }

          [data-commerce-areas] .commerce-tab {
            color: rgba(255,255,255,.42);
            border-color: rgba(255,255,255,.10);
            background: rgba(255,255,255,.035);
          }

          #commerce-vendas:checked ~ .commerce-stage label[for="commerce-vendas"],
          #commerce-margem:checked ~ .commerce-stage label[for="commerce-margem"],
          #commerce-estoque:checked ~ .commerce-stage label[for="commerce-estoque"],
          #commerce-anuncios:checked ~ .commerce-stage label[for="commerce-anuncios"] {
            color: white;
            border-color: rgba(255,255,255,.28);
            background: rgba(255,255,255,.10);
            box-shadow: 0 20px 60px rgba(0,0,0,.24);
            transform: translateY(-4px);
          }
        `}</style>

        <input id="commerce-vendas" name="commerce-area" type="radio" defaultChecked className="sr-only" />
        <input id="commerce-margem" name="commerce-area" type="radio" className="sr-only" />
        <input id="commerce-estoque" name="commerce-area" type="radio" className="sr-only" />
        <input id="commerce-anuncios" name="commerce-area" type="radio" className="sr-only" />

        <div className="commerce-stage relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="ambient-vendas commerce-ambient pointer-events-none absolute -left-24 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-[120px]" />
          <div className="ambient-margem commerce-ambient pointer-events-none absolute left-1/4 top-10 h-[420px] w-[420px] rounded-full bg-amber-500/13 blur-[120px]" />
          <div className="ambient-estoque commerce-ambient pointer-events-none absolute right-1/4 top-10 h-[420px] w-[420px] rounded-full bg-cyan-500/13 blur-[120px]" />
          <div className="ambient-anuncios commerce-ambient pointer-events-none absolute -right-24 top-20 h-[420px] w-[420px] rounded-full bg-fuchsia-600/13 blur-[120px]" />

          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ffbf31]">
                Da operação à decisão
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
                Tudo que importa na sua operação, organizado para facilitar a decisão.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/50">
                Vendas, margem, estoque e anúncios deixam de ser relatórios isolados e passam a formar uma única leitura de performance.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {commerceAreas.map(({ key, label, icon: Icon }) => (
                <label
                  key={key}
                  htmlFor={`commerce-${key}`}
                  className="commerce-tab group flex cursor-pointer items-center justify-between rounded-2xl border px-5 py-5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-current">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-50">Área da operação</p>
                      <p className="mt-1 text-base font-semibold">{label}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 opacity-40 transition-transform group-hover:translate-x-1" />
                </label>
              ))}
            </div>

            <div className="relative min-h-[440px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#10131a] p-6 shadow-2xl sm:p-8">
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.09]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.10) 1px, transparent 1px)",
                  backgroundSize: "42px 42px",
                }}
              />

              <div className="relative z-10">
                {commerceAreas.map(({ key, icon: Icon, title, description, bullets }) => (
                  <div key={key} className={`commerce-copy copy-${key}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[#ffbf31]">
                        <Icon className="size-6" />
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                        AC360 intelligence layer
                      </span>
                    </div>

                    <h3 className="mt-10 max-w-2xl text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
                      {title}
                    </h3>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/55">
                      {description}
                    </p>

                    <div className="mt-10 grid gap-3 sm:grid-cols-3">
                      {bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"
                        >
                          <CheckCircle2 className="size-4 text-blue-300" />
                          <p className="mt-3 text-sm font-semibold text-white/75">{bullet}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex items-center gap-3 border-t border-white/[0.08] pt-6 text-xs text-white/35">
                      <Radar className="size-4 text-blue-300/70" />
                      O objetivo não é mostrar mais dados. É mostrar o que merece atenção primeiro.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DIFERENCIAL — FEED + CHAT ==================== */}
      <section id="inteligencia" className="relative overflow-hidden bg-[#111216] py-24 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(650px 420px at 20% 30%, rgba(18,105,255,.12), transparent 65%), radial-gradient(650px 420px at 85% 55%, rgba(255,173,27,.08), transparent 65%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="max-w-3xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ffbf31]">
                Inteligência aplicada à performance
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
                Você não precisa de mais dados. Precisa saber o que fazer com eles.
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="group relative min-h-[420px] overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#0c1018] p-7 shadow-2xl sm:p-9">
                <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-blue-600/10 blur-[90px]" />
                <div className="relative">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-500/10 text-blue-300">
                    <Radar className="size-6" />
                  </div>
                  <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300/70">Feed Inteligente</p>
                  <h3 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-white">
                    O que precisa da sua atenção aparece primeiro.
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50">
                    O AC360 organiza sinais da operação e mostra primeiro os produtos, riscos e oportunidades que merecem decisão.
                  </p>

                  <div className="mt-8 space-y-3">
                    {[
                      ["Margem", "Rentabilidade merece revisão"],
                      ["Estoque", "Item exige acompanhamento"],
                      ["Anúncios", "Eficiência pode melhorar"],
                    ].map(([title, textValue]) => (
                      <div
                        key={title}
                        className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3"
                      >
                        <div>
                          <p className="text-xs font-semibold text-white/45">{title}</p>
                          <p className="mt-1 text-sm font-medium text-white/80">{textValue}</p>
                        </div>
                        <span className="size-2 rounded-full bg-[#ffbf31]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="group relative min-h-[420px] overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#0c1018] p-7 shadow-2xl sm:p-9">
                <div className="absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-amber-500/[0.08] blur-[90px]" />
                <div className="relative">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-500/[0.08] text-amber-300">
                    <Brain className="size-6" />
                  </div>
                  <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/70">Chat AC360</p>
                  <h3 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-white">
                    Pergunte sobre a operação. Aprofunde a decisão.
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50">
                    Converse com o contexto da sua própria operação para investigar margem, estoque, anúncios, oportunidades e próximos passos.
                  </p>

                  <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/65">
                        <UserCircle2 className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-white/40">Você</p>
                        <p className="mt-1 text-sm text-white/80">
                          Onde minha operação está deixando dinheiro na mesa hoje?
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-start gap-3 border-t border-white/[0.07] pt-4">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/12 text-blue-300">
                        <Brain className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-blue-300/70">AC360</p>
                        <p className="mt-1 text-sm leading-relaxed text-white/72">
                          Comece pelas prioridades de maior impacto, valide a causa e transforme a análise em um próximo passo claro.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================== CTA FINAL ==================== */}
      <section id="cta-final" className="relative overflow-hidden bg-[#f7f8fb] py-24 text-slate-900 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(600px 300px at 18% 0%, rgba(35,117,255,.16), transparent 70%), radial-gradient(500px 300px at 90% 100%, rgba(255,191,49,.14), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
          <Reveal>
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-600">
              Próximo passo
            </span>
            <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-bold tracking-[-0.045em] text-[#071b45] sm:text-6xl">
              Pare de administrar sua operação olhando para trás.
              <br />
              Saiba onde agir agora.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Descubra onde sua operação no Mercado Livre pode melhorar margem, eficiência e resultado com tecnologia e acompanhamento consultivo.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="mailto:contato@agentecomercial360.com.br?subject=Quero um diagnóstico da minha operação no Mercado Livre">
                <Button
                  size="lg"
                  className="h-14 rounded-full px-8 text-base font-semibold text-white shadow-xl shadow-blue-900/15"
                  style={{ background: "linear-gradient(135deg, #0867f2, #1b8cff)" }}
                >
                  Solicitar diagnóstico da minha operação
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </a>

              <Link
                to="/ecommerce/login"
                className="inline-flex h-14 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-base font-semibold text-slate-800 shadow-sm transition-all hover:border-blue-300 hover:text-blue-700"
              >
                Entrar no painel
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-white/[0.06] bg-[#080b10]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <img src={acLogo} alt="AC360" className="h-8 w-auto brightness-0 invert" />
            <span className="text-xs text-white/35">E-commerce Intelligence</span>
          </div>
          <p className="text-xs text-white/30">
            Inteligência e consultoria de performance para vendedores do Mercado Livre.
          </p>
        </div>
      </footer>
    </div>
  );
}

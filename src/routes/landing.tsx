import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Sparkles,
  BarChart3,
  BookOpen,
  ShieldCheck,
  Headphones,
  Workflow,
  Bot,
  LineChart,
  Database,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  FileWarning,
  Building2,
  Briefcase,
  Brain,
  Network,
  TrendingUp,
  Activity,
  Layers,
} from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import landingHeroAsset from "@/assets/landing-hero.jpg.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Agente Comercial 360 — Plataforma de inteligência comercial" },
      {
        name: "description",
        content:
          "Centralize WhatsApp, leads, responsáveis, IA, base de conhecimento e relatórios em uma plataforma comercial premium, escalável e pronta para automações.",
      },
      {
        property: "og:title",
        content: "Agente Comercial 360 — Inteligência comercial em uma só plataforma",
      },
      {
        property: "og:description",
        content:
          "Transforme conversas em vendas com IA, automações e WhatsApp em uma operação comercial organizada.",
      },
    ],
  }),
});

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-premium)] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <img src={acLogo} alt="Agente Comercial 360" className="h-9 w-9 rounded-lg" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Agente Comercial <span className="text-primary">360</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
            <a href="#problema" className="hover:text-foreground transition-colors">Problema</a>
            <a href="#solucao" className="hover:text-foreground transition-colors">Solução</a>
            <a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#depoimentos" className="hover:text-foreground transition-colors">Depoimentos</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-1">
            <Link
              to="/login"
              className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block sm:px-3"
            >
              Entrar no painel
            </Link>
            <a href="#cta-final">
              <Button size="sm" className="gap-1.5 shadow-[var(--shadow-soft)]">
                Solicitar demo <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* HERO — premium editorial SaaS, big blue gradient block as protagonist */}
      <section
        id="top"
        className="relative overflow-hidden bg-white"
      >
        {/* soft ambient backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 85% 10%, oklch(0.93 0.06 262 / 0.55) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 10% 90%, oklch(0.95 0.04 262 / 0.45) 0%, transparent 65%), linear-gradient(180deg, oklch(0.995 0.003 258) 0%, oklch(0.97 0.012 258) 100%)",
          }}
        />
        {/* subtle grid mask */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.55 0.18 262 / 0.08) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.18 262 / 0.08) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 70% 40%, black 20%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 70% 40%, black 20%, transparent 80%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
            {/* LEFT — editorial copy */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.55_0.18_262)]/15 bg-[oklch(0.55_0.18_262)]/[0.06] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[oklch(0.40_0.18_262)] backdrop-blur">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.55_0.22_262)] opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[oklch(0.55_0.22_262)]" />
                </span>
                Plataforma de Inteligência Comercial
              </div>

              <h1 className="font-display mt-6 text-[2.25rem] font-semibold leading-[1.02] tracking-[-0.035em] text-[oklch(0.18_0.03_262)] sm:text-[2.75rem] md:text-[3.25rem] lg:text-[3.55rem]">
                Pare de perder vendas no WhatsApp.{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(120deg, oklch(0.50 0.24 262) 0%, oklch(0.42 0.22 278) 100%)",
                  }}
                >
                  Centralize sua operação comercial com IA.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[oklch(0.40_0.02_262)] md:text-base">
                Organize atendimentos, leads, responsáveis, CRM, follow-up e
                relatórios em uma plataforma criada para empresas que querem
                vender mais com controle, velocidade e previsibilidade.
              </p>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <a href="#cta-final">
                  <Button
                    size="lg"
                    className="h-12 gap-2 rounded-full px-7 text-[15px] text-white shadow-[0_22px_44px_-14px_oklch(0.20_0.06_262_/_0.55)] hover:opacity-95"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.20 0.05 262) 0%, oklch(0.14 0.04 262) 100%)",
                    }}
                  >
                    Solicitar demonstração <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="#solucao">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-12 gap-2 rounded-full border border-[oklch(0.20_0.03_262)]/15 px-5 text-[15px] text-[oklch(0.22_0.03_262)] hover:bg-[oklch(0.55_0.18_262)]/[0.06]"
                  >
                    Ver como funciona <ArrowRight className="size-4" />
                  </Button>
                </a>
              </div>

              {/* institutional indicators — no fake numbers */}
              <div className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 border-t border-[oklch(0.20_0.03_262)]/8 pt-6 sm:grid-cols-4 sm:gap-x-4">
                {[
                  "Atendimento centralizado",
                  "Leads organizados",
                  "Follow-up monitorado",
                  "Gestão 360 em tempo real",
                ].map((label) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span
                      aria-hidden
                      className="h-[2px] w-6 rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, oklch(0.50 0.24 262), oklch(0.42 0.22 278))",
                      }}
                    />
                    <span className="text-[11.5px] font-medium leading-tight text-[oklch(0.30_0.02_262)]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — premium dark device composition (notebook + phone + floating cards) */}
            <div className="relative mt-2 lg:mt-0">
              {/* ambient halo behind devices */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-12 -z-10 blur-[120px]"
                style={{
                  background:
                    "radial-gradient(45% 55% at 55% 45%, oklch(0.55 0.26 262 / 0.55) 0%, oklch(0.42 0.24 285 / 0.32) 55%, transparent 80%)",
                }}
              />

              {/* main dark "studio" frame holding the devices */}
              <div
                className="relative overflow-hidden rounded-[32px] border border-white/10 p-5 sm:p-7"
                style={{
                  background:
                    "radial-gradient(120% 90% at 20% 0%, oklch(0.30 0.14 268) 0%, oklch(0.14 0.06 264) 55%, oklch(0.08 0.04 262) 100%)",
                  boxShadow:
                    "0 70px 140px -30px oklch(0.10 0.06 262 / 0.75), inset 0 1px 0 oklch(1 0 0 / 0.10)",
                }}
              >
                {/* sheen */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.45), transparent)",
                  }}
                />
                {/* purple glow blob */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-20 -bottom-24 h-80 w-80 rounded-full opacity-60 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(closest-side, oklch(0.55 0.26 290 / 0.55), transparent 70%)",
                  }}
                />
                {/* blue glow blob */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-70 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(closest-side, oklch(0.70 0.22 262 / 0.55), transparent 70%)",
                  }}
                />
                {/* subtle grid inside the frame */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.18]"
                  style={{
                    backgroundImage:
                      "linear-gradient(oklch(0.85 0.10 262 / 0.18) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.10 262 / 0.18) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    maskImage:
                      "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 85%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 85%)",
                  }}
                />

                {/* identity strip */}
                <div className="relative flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-white backdrop-blur-md">
                    <span className="flex size-5 items-center justify-center rounded-md bg-white/15">
                      <Layers className="size-2.5" />
                    </span>
                    <span className="text-[10.5px] font-semibold tracking-tight">
                      Agente Comercial 360
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.78_0.20_150)] opacity-70" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-[oklch(0.78_0.20_150)]" />
                    </span>
                    Em tempo real
                  </span>
                </div>

                {/* DEVICE STAGE — notebook + phone */}
                <div className="relative mt-5 pb-2">
                  {/* NOTEBOOK */}
                  <div className="relative">
                    {/* screen */}
                    <div
                      className="relative overflow-hidden rounded-t-2xl border border-white/10 bg-[oklch(0.10_0.04_262)] shadow-[0_40px_80px_-20px_oklch(0_0_0_/_0.75)]"
                      style={{
                        background:
                          "linear-gradient(180deg, oklch(0.13 0.05 264) 0%, oklch(0.09 0.04 262) 100%)",
                      }}
                    >
                      {/* mac-like bar */}
                      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
                        <span className="size-2 rounded-full bg-[oklch(0.65_0.22_25)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.78_0.18_85)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.72_0.20_150)]" />
                        <div className="ml-3 hidden h-4 flex-1 items-center rounded-md bg-white/[0.04] px-2 text-[8.5px] font-medium text-white/40 sm:flex">
                          app.agentecomercial360.com.br / gestao-360
                        </div>
                      </div>

                      <div className="flex">
                        {/* sidebar */}
                        <div className="hidden w-[148px] shrink-0 flex-col gap-0.5 border-r border-white/[0.05] bg-[oklch(0.08_0.04_262)] p-2.5 md:flex">
                          {[
                            { icon: Layers, label: "Gestão 360", active: true },
                            { icon: MessageSquare, label: "Conversas" },
                            { icon: Users, label: "Leads" },
                            { icon: Briefcase, label: "CRM" },
                            { icon: Bot, label: "IA" },
                            { icon: LineChart, label: "Relatórios" },
                            { icon: Activity, label: "Follow-up" },
                            { icon: ShieldCheck, label: "WhatsApp Oficial" },
                          ].map((it) => (
                            <div
                              key={it.label}
                              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px] font-medium transition-colors ${
                                it.active
                                  ? "bg-gradient-to-r from-[oklch(0.55_0.24_262)]/35 to-[oklch(0.50_0.22_285)]/20 text-white shadow-[inset_0_0_0_1px_oklch(1_0_0_/_0.06)]"
                                  : "text-white/55 hover:text-white"
                              }`}
                            >
                              <it.icon className="size-3" />
                              {it.label}
                            </div>
                          ))}
                        </div>

                        {/* main panel */}
                        <div className="flex-1 p-3.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[9px] font-medium uppercase tracking-wider text-white/45">
                                Visão geral
                              </div>
                              <div className="font-display mt-0.5 text-[12.5px] font-semibold tracking-tight text-white">
                                Gestão 360 · Operação comercial
                              </div>
                            </div>
                            <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-medium text-white/60 sm:inline-flex">
                              <Sparkles className="size-2.5 text-[oklch(0.80_0.18_285)]" />
                              IA ativa
                            </div>
                          </div>

                          {/* KPI row — institutional, no numbers */}
                          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                            {[
                              { icon: MessageSquare, label: "Conversas" },
                              { icon: Users, label: "Leads" },
                              { icon: Bot, label: "IA" },
                              { icon: LineChart, label: "Relatórios" },
                            ].map((k, i) => (
                              <div
                                key={k.label}
                                className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2"
                              >
                                <div className="flex items-center gap-1.5 text-[8.5px] font-semibold uppercase tracking-wide text-white/55">
                                  <k.icon className="size-2.5 text-[oklch(0.78_0.18_262)]" />
                                  {k.label}
                                </div>
                                <div className="mt-1.5 flex h-1 overflow-hidden rounded-full bg-white/[0.06]">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${58 + i * 9}%`,
                                      background:
                                        "linear-gradient(90deg, oklch(0.72 0.22 262), oklch(0.62 0.22 290))",
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* chart + list */}
                          <div className="mt-2.5 grid gap-2 lg:grid-cols-[1.55fr_1fr]">
                            <div className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
                              <div className="flex items-center justify-between">
                                <div className="text-[10px] font-semibold text-white/85">
                                  Atendimentos · WhatsApp Oficial
                                </div>
                                <div className="text-[9px] text-white/40">4 semanas</div>
                              </div>
                              <div className="relative mt-3 h-20">
                                {/* curve area chart */}
                                <svg viewBox="0 0 200 70" className="absolute inset-0 h-full w-full">
                                  <defs>
                                    <linearGradient id="hero-area" x1="0" x2="0" y1="0" y2="1">
                                      <stop offset="0%" stopColor="oklch(0.70 0.22 262)" stopOpacity="0.55" />
                                      <stop offset="100%" stopColor="oklch(0.50 0.22 285)" stopOpacity="0" />
                                    </linearGradient>
                                    <linearGradient id="hero-line" x1="0" x2="1" y1="0" y2="0">
                                      <stop offset="0%" stopColor="oklch(0.78 0.20 262)" />
                                      <stop offset="100%" stopColor="oklch(0.72 0.22 290)" />
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d="M0,55 C20,48 35,52 55,42 C75,32 90,38 110,28 C130,18 150,22 170,14 L200,8 L200,70 L0,70 Z"
                                    fill="url(#hero-area)"
                                  />
                                  <path
                                    d="M0,55 C20,48 35,52 55,42 C75,32 90,38 110,28 C130,18 150,22 170,14 L200,8"
                                    fill="none"
                                    stroke="url(#hero-line)"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute right-1 top-1 inline-flex items-center gap-1 rounded-full border border-white/10 bg-[oklch(0.12_0.05_262)]/80 px-1.5 py-[2px] text-[8px] font-semibold text-[oklch(0.85_0.16_150)] backdrop-blur">
                                  <TrendingUp className="size-2" />
                                  Em alta
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5">
                              <div className="mb-2 flex items-center justify-between">
                                <div className="text-[10px] font-semibold text-white/85">
                                  Conversas
                                </div>
                                <div className="text-[8.5px] text-white/40">Hoje</div>
                              </div>
                              <div className="space-y-1.5">
                                {[
                                  { name: "WhatsApp · Cliente", status: "IA respondendo", c: "primary" },
                                  { name: "Lead · Qualificação", status: "Atribuído", c: "green" },
                                  { name: "Follow-up", status: "Monitorado", c: "muted" },
                                ].map((c) => (
                                  <div
                                    key={c.name}
                                    className="flex items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1.5"
                                  >
                                    <span className="flex size-5 items-center justify-center rounded-full bg-[oklch(0.55_0.24_262)]/25 text-[oklch(0.80_0.18_262)]">
                                      <MessageSquare className="size-2.5" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <div className="truncate text-[9.5px] font-semibold text-white/90">
                                        {c.name}
                                      </div>
                                      <div className="truncate text-[8.5px] text-white/45">
                                        {c.status}
                                      </div>
                                    </div>
                                    <span
                                      className={`size-1.5 shrink-0 rounded-full ${
                                        c.c === "green"
                                          ? "bg-[oklch(0.72_0.20_150)]"
                                          : c.c === "primary"
                                          ? "bg-[oklch(0.72_0.22_262)]"
                                          : "bg-white/25"
                                      }`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* notebook base */}
                    <div
                      className="relative mx-auto h-2 w-[104%] -translate-x-[2%] rounded-b-[14px]"
                      style={{
                        background:
                          "linear-gradient(180deg, oklch(0.30 0.04 262) 0%, oklch(0.18 0.03 262) 100%)",
                        boxShadow:
                          "0 30px 50px -20px oklch(0 0 0 / 0.55), inset 0 1px 0 oklch(1 0 0 / 0.08)",
                      }}
                    >
                      <div className="absolute left-1/2 top-0 h-[3px] w-16 -translate-x-1/2 rounded-b-full bg-black/40" />
                    </div>
                  </div>

                  {/* PHONE — WhatsApp conversation, floating right */}
                  <div
                    className="absolute -bottom-6 right-[-2%] hidden w-[148px] rounded-[22px] border border-white/15 p-1.5 shadow-[0_40px_70px_-20px_oklch(0_0_0_/_0.65)] sm:block"
                    style={{
                      background:
                        "linear-gradient(160deg, oklch(0.22 0.03 262) 0%, oklch(0.10 0.03 262) 100%)",
                      transform: "rotate(4deg)",
                    }}
                  >
                    <div className="overflow-hidden rounded-[16px] bg-[oklch(0.10_0.03_262)]">
                      {/* phone header */}
                      <div
                        className="flex items-center gap-1.5 px-2 py-1.5 text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.45 0.18 150) 0%, oklch(0.32 0.14 160) 100%)",
                        }}
                      >
                        <span className="flex size-4 items-center justify-center rounded-full bg-white/20">
                          <MessageSquare className="size-2" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[8.5px] font-semibold leading-tight">
                            WhatsApp Oficial
                          </div>
                          <div className="truncate text-[7px] leading-tight text-white/70">
                            online · IA + humano
                          </div>
                        </div>
                      </div>
                      {/* messages */}
                      <div className="space-y-1.5 p-2">
                        <div className="max-w-[80%] rounded-lg rounded-tl-sm bg-white/[0.08] px-1.5 py-1 text-[8px] leading-tight text-white/85">
                          Olá! Gostaria de mais informações.
                        </div>
                        <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm px-1.5 py-1 text-[8px] leading-tight text-white"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(0.50 0.22 262), oklch(0.42 0.22 285))",
                          }}
                        >
                          Oi! Sou o agente. Vou te conectar ao consultor ideal agora.
                        </div>
                        <div className="max-w-[80%] rounded-lg rounded-tl-sm bg-white/[0.08] px-1.5 py-1 text-[8px] leading-tight text-white/85">
                          Perfeito 👍
                        </div>
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="flex h-1 w-1 animate-pulse rounded-full bg-white/40" />
                          <span className="flex h-1 w-1 animate-pulse rounded-full bg-white/40 [animation-delay:120ms]" />
                          <span className="flex h-1 w-1 animate-pulse rounded-full bg-white/40 [animation-delay:240ms]" />
                          <span className="ml-1 text-[7px] text-white/45">digitando…</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* bottom pillars strip */}
                <div className="relative mt-6 grid grid-cols-4 gap-2">
                  {[
                    { icon: ShieldCheck, label: "WhatsApp" },
                    { icon: Briefcase, label: "CRM" },
                    { icon: Bot, label: "IA" },
                    { icon: LineChart, label: "Relatórios" },
                  ].map((p) => (
                    <div
                      key={p.label}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-2 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md"
                    >
                      <p.icon className="size-3 text-[oklch(0.80_0.18_262)]" />
                      {p.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* FLOATING DARK CARD — WhatsApp connected (top-right outside frame) */}
              <div className="absolute -right-4 -top-5 hidden w-[210px] rounded-2xl border border-white/10 bg-[oklch(0.12_0.04_262)]/95 p-3 shadow-[0_30px_60px_-20px_oklch(0_0_0_/_0.65)] backdrop-blur-xl md:block">
                <div className="flex items-start justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                    01
                  </div>
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.55_0.24_262)]/30 text-[oklch(0.82_0.18_262)]">
                    <ShieldCheck className="size-3.5" />
                  </span>
                </div>
                <div className="mt-1.5 text-[12.5px] font-semibold text-white">
                  WhatsApp Oficial conectado
                </div>
                <div className="mt-0.5 text-[10px] leading-snug text-white/55">
                  Conversas centralizadas e monitoradas
                </div>
              </div>

              {/* FLOATING DARK CARD — IA classificando lead (left middle) */}
              <div className="absolute -left-6 top-1/2 hidden w-[220px] -translate-y-1/2 rounded-2xl border border-white/10 bg-[oklch(0.12_0.04_262)]/95 p-3 shadow-[0_30px_60px_-20px_oklch(0_0_0_/_0.65)] backdrop-blur-xl lg:block">
                <div className="flex items-start justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                    02
                  </div>
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.50_0.22_285)]/30 text-[oklch(0.82_0.18_290)]">
                    <Bot className="size-3.5" />
                  </span>
                </div>
                <div className="mt-1.5 text-[12.5px] font-semibold text-white">
                  IA classificando lead
                </div>
                <div className="mt-0.5 text-[10px] leading-snug text-white/55">
                  Prioridade alta · responsável atribuído
                </div>
              </div>

              {/* FLOATING LIGHT CARD — Relatório / Follow-up (bottom-left, glass) */}
              <div className="absolute -bottom-6 -left-2 hidden w-[230px] rounded-2xl border border-white/60 bg-white/85 p-3 shadow-[0_30px_60px_-20px_oklch(0.20_0.10_262_/_0.45)] backdrop-blur-xl md:block">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[oklch(0.50_0.24_262)]/12 text-[oklch(0.42_0.22_262)]">
                    <Activity className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-semibold text-[oklch(0.18_0.03_262)]">
                      Relatório gerencial pronto
                    </div>
                    <div className="text-[9.5px] text-[oklch(0.42_0.02_262)]">
                      Follow-up monitorado em tempo real
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>






      {/* PROBLEMA */}
      <section id="problema" className="relative overflow-hidden border-t border-[var(--border-premium)] bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-64"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, oklch(0.96 0.02 25 / 0.6), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">
              <AlertTriangle className="size-3.5" /> Onde as vendas estão escapando
            </div>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-[-0.02em] md:text-4xl lg:text-[3.25rem] lg:leading-[1.05]">
              Empresas perdem vendas todos os dias por falhas operacionais
            </h2>
            <p className="mt-5 text-muted-foreground md:text-lg">
              Atendimento desorganizado custa caro. Quase nunca é o time —
              é a falta de uma plataforma que conecte tudo.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Clock, title: "Demora no atendimento", text: "Mensagem sem resposta = cliente comprando do concorrente." },
              { icon: FileWarning, title: "Leads sem follow-up", text: "Oportunidades quentes esfriam por falta de retomada." },
              { icon: Search, title: "Conversas espalhadas", text: "WhatsApp, e-mail, planilha — nada se fala." },
              { icon: AlertTriangle, title: "Sem controle comercial", text: "Você não sabe o que cada responsável está atendendo." },
              { icon: BarChart3, title: "Relatórios manuais", text: "Decisões no achismo, sem dado confiável em tempo real." },
              { icon: Users, title: "Equipe sem prioridade", text: "Cada um responde do seu jeito, sem padrão nem histórico." },
            ].map((p) => (
              <div
                key={p.title}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border-premium)] bg-white p-7 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-destructive/30 hover:shadow-[var(--shadow-card)]"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px] scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.65 0.22 25), oklch(0.6 0.22 15))",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "oklch(0.7 0.2 25 / 0.25)" }}
                />
                <div
                  className="relative flex size-14 items-center justify-center rounded-2xl border border-destructive/15 text-destructive shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.97 0.02 25), oklch(0.94 0.05 25))",
                  }}
                >
                  <p.icon className="size-6" strokeWidth={2.2} />
                </div>
                <h3 className="font-display mt-5 text-lg font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* SOLUÇÃO */}
      <section id="solucao" className="relative overflow-hidden bg-[var(--brand-blue-soft)]/50">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-[-10%] h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--gradient-brand)" }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <CheckCircle2 className="size-3.5" /> A solução
            </div>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Tudo o que sua operação comercial precisa, em um só lugar
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              O Agente Comercial 360 organiza pessoas, conversas e processos. Cada lead
              vira histórico. Cada atendimento vira dado. Cada conversa vira oportunidade.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Headphones, title: "Atendimentos", text: "Histórico, status e SLA por conversa." },
              { icon: MessageSquare, title: "Conversas", text: "Tudo centralizado e rastreável." },
              { icon: Users, title: "Leads", text: "Etapas, dono e próxima ação claros." },
              { icon: Briefcase, title: "Responsáveis", text: "Distribuição automática por setor." },
              { icon: Bot, title: "IA", text: "Sugestões e priorização inteligente." },
              { icon: BookOpen, title: "Base de Conhecimento", text: "Conteúdo curado que alimenta a IA." },
              { icon: BarChart3, title: "Relatórios", text: "Performance em tempo real para decisão." },
              { icon: ShieldCheck, title: "Multiempresa", text: "Dados isolados por empresa e usuário." },
            ].map((b) => (
              <div
                key={b.title}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border-premium)] bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-card)]"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: "var(--gradient-brand)" }}
                />
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <b.icon className="size-6" />
                </div>
                <h3 className="mt-5 font-display text-base font-semibold">{b.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="border-t border-[var(--border-premium)] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              <Zap className="size-3.5 text-primary" /> Funcionalidades
            </div>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Uma plataforma completa para vender com método
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Construída para times comerciais que querem previsibilidade e escala.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Headphones, title: "Atendimento inteligente", text: "Histórico completo, status e SLA por conversa." },
              { icon: Users, title: "Gestão de leads", text: "Etapas, próxima ação e dono claro por oportunidade." },
              { icon: Briefcase, title: "Responsáveis por setor", text: "Distribua conversas e leads por equipe." },
              { icon: BookOpen, title: "Base de conhecimento", text: "Conteúdo curado que alimenta a IA." },
              { icon: BarChart3, title: "Dashboard em tempo real", text: "KPIs comerciais sempre à mão." },
              { icon: LineChart, title: "Relatórios gerenciais", text: "Performance por responsável, setor e período." },
              { icon: MessageSquare, title: "WhatsApp oficial", text: "Arquitetura pronta para WhatsApp Cloud API." },
              { icon: Workflow, title: "Automações com n8n", text: "Workflows externos para escalar processos." },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border-premium)] bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: "var(--gradient-brand)" }}
                />
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--brand-blue-soft)] text-primary transition-transform group-hover:scale-110">
                  <f.icon className="size-6" />
                </div>
                <h3 className="mt-5 font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="relative overflow-hidden border-t border-[var(--border-premium)] bg-[var(--brand-blue-soft)]/30">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <Workflow className="size-3.5" /> Como funciona
            </div>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Do primeiro contato à venda — sem perder nada no caminho
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Quatro passos simples para transformar conversas em receita previsível.
            </p>
          </div>

          <div className="relative mt-16">
            {/* connecting line */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden h-px lg:block"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--brand-blue) 20%, var(--brand-blue) 80%, transparent)",
                opacity: 0.3,
              }}
            />
            <div className="grid gap-6 lg:grid-cols-4">
              {[
                { n: "01", icon: MessageSquare, title: "Cliente chama no WhatsApp", text: "Conversa entra direto na plataforma, com histórico unificado." },
                { n: "02", icon: Brain, title: "IA identifica intenção", text: "Organiza informações, sugere próxima ação e prioridade." },
                { n: "03", icon: Users, title: "Vira lead e é encaminhado", text: "Oportunidade vai para o setor e responsável certos." },
                { n: "04", icon: BarChart3, title: "Gestor acompanha tudo", text: "Dashboard e relatórios em tempo real, sem planilha." },
              ].map((s) => (
                <div
                  key={s.n}
                  className="relative rounded-2xl border border-[var(--border-premium)] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-14 items-center justify-center rounded-2xl text-white shadow-[var(--shadow-soft)]"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      <s.icon className="size-6" />
                    </div>
                    <span className="font-display text-3xl font-bold text-primary/20">{s.n}</span>
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TECNOLOGIA */}
      <section
        id="tecnologia"
        className="relative overflow-hidden text-white"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, white 0, transparent 35%), radial-gradient(circle at 85% 80%, white 0, transparent 30%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <Layers className="size-3.5" /> Stack de automação comercial
            </div>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Uma base moderna para conectar atendimento, dados e IA
            </h2>
            <p className="mt-4 text-white/85 md:text-lg">
              Infraestrutura segura, escalável e preparada para crescer com a sua operação
              comercial.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { icon: Database, label: "Supabase", text: "Banco e auth" },
              { icon: Workflow, label: "n8n", text: "Automações" },
              { icon: MessageSquare, label: "WhatsApp Cloud API", text: "Mensageria oficial" },
              { icon: Bot, label: "IA", text: "Sugestões e triagem" },
              { icon: BookOpen, label: "RAG", text: "Conhecimento contextual" },
              { icon: BarChart3, label: "Dashboards", text: "KPIs em tempo real" },
              { icon: Network, label: "CRM", text: "Pipeline comercial" },
              { icon: Zap, label: "Automações", text: "Fluxos sem código" },
            ].map((t) => (
              <div
                key={t.label}
                className="group rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-white/15">
                  <t.icon className="size-5" />
                </div>
                <div className="mt-4 font-display text-base font-semibold">{t.label}</div>
                <div className="text-xs text-white/75">{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS — prova social */}
      <section id="depoimentos" className="border-t border-[var(--border-premium)] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" /> Quem usa, recomenda
            </div>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-[-0.02em] md:text-4xl lg:text-5xl">
              Operações comerciais mais{" "}
              <span className="text-primary">organizadas e previsíveis</span>
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Times comerciais usam o Agente Comercial 360 para responder mais rápido,
              priorizar o que importa e fechar mais vendas.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "Centralizamos o WhatsApp, organizamos os leads e o time finalmente sabe a próxima ação. A conversão subiu de forma consistente.",
                name: "Gestor Comercial",
                role: "Distribuidora automotiva",
              },
              {
                quote:
                  "A IA prioriza as conversas certas e o painel mostra tudo em tempo real. Saímos da planilha para uma operação de verdade.",
                name: "Coordenadora de Vendas",
                role: "Indústria B2B",
              },
              {
                quote:
                  "Nosso atendimento ficou padronizado, com histórico completo. Cada lead vira oportunidade rastreável, do primeiro contato à venda.",
                name: "Diretor de Operações",
                role: "Rede de franquias",
              },
            ].map((t) => (
              <figure
                key={t.name}
                className="relative flex flex-col rounded-2xl border border-[var(--border-premium)] bg-white p-7 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              >
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" className="size-4 fill-current">
                      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.9L10 1.5z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-foreground/85">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--border-premium)] pt-4">
                  <div
                    className="flex size-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {t.name[0]}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[var(--border-premium)] bg-[var(--brand-blue-soft)]/30">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <BookOpen className="size-3.5" /> Perguntas frequentes
            </div>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-[-0.02em] md:text-4xl lg:text-5xl">
              Tudo o que você precisa saber
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Respostas rápidas para as dúvidas mais comuns sobre a plataforma.
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {[
              {
                q: "Funciona com o WhatsApp que minha empresa já usa?",
                a: "Sim. A arquitetura é preparada para WhatsApp Cloud API oficial, mantendo histórico unificado, distribuição por responsável e integração com a IA.",
              },
              {
                q: "Quanto tempo leva para colocar em produção?",
                a: "A operação básica entra no ar em poucos dias. Configuramos empresa, usuários, responsáveis, base de conhecimento e fluxos de IA seguindo um checklist guiado.",
              },
              {
                q: "Meus dados ficam isolados dos outros clientes?",
                a: "Sim. A plataforma é multiempresa por design, com isolamento de dados por empresa e usuário, autenticação segura e políticas de acesso por papel.",
              },
              {
                q: "A IA substitui a equipe comercial?",
                a: "Não. A IA prioriza conversas, sugere próximas ações e responde casos repetitivos. O time comercial ganha foco para fechar oportunidades de maior valor.",
              },
              {
                q: "Consigo medir o ROI da operação?",
                a: "Sim. Os relatórios em tempo real mostram conversão, tempo de resposta, performance por responsável e por setor — sem depender de planilhas.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-[var(--border-premium)] bg-white p-6 shadow-[var(--shadow-soft)] transition-all open:shadow-[var(--shadow-card)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-display text-base font-semibold tracking-tight md:text-lg">
                    {item.q}
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-blue-soft)] text-primary transition-transform group-open:rotate-45">
                    <svg viewBox="0 0 20 20" className="size-4">
                      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="cta-final" className="border-t border-[var(--border-premium)] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div
            className="relative overflow-hidden rounded-3xl p-10 text-center md:p-16"
            style={{
              background:
                "linear-gradient(135deg, #0a1a3f 0%, var(--brand-blue) 60%, #1e3a8a 100%)",
              boxShadow: "var(--shadow-premium)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 30%, white 0, transparent 40%), radial-gradient(circle at 75% 70%, white 0, transparent 35%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative mx-auto max-w-3xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                <Sparkles className="size-3.5" /> Agente Comercial 360
              </div>
              <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
                Pronto para transformar seu atendimento em uma central comercial inteligente?
              </h2>
              <p className="mt-5 text-white/85 md:text-lg">
                Mostre profissionalismo, organize sua equipe e acompanhe oportunidades em
                tempo real com o Agente Comercial 360.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="mailto:contato@agentecomercial360.com?subject=Solicita%C3%A7%C3%A3o%20de%20demonstra%C3%A7%C3%A3o%20-%20Agente%20Comercial%20360">
                  <Button
                    size="lg"
                    className="h-12 gap-2 bg-white px-6 text-base text-primary hover:bg-white/90"
                  >
                    Solicitar demonstração <ArrowRight className="size-4" />
                  </Button>
                </a>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 border-white/40 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white"
                  >
                    Entrar no painel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border-premium)] bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <img src={acLogo} alt="Agente Comercial 360" className="h-6 w-6 rounded" />
            <span>
              © {new Date().getFullYear()} Agente Comercial 360 — Inteligência comercial.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#funcionalidades" className="hover:text-foreground">Funcionalidades</a>
            <a href="#tecnologia" className="hover:text-foreground">Tecnologia</a>
            <Link to="/login" className="hover:text-foreground">Entrar no painel</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

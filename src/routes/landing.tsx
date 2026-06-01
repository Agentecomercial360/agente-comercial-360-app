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

function LandingPage() {
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
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">Entrar no painel</Button>
            </Link>
            <a href="#cta-final">
              <Button size="sm" className="gap-1.5 shadow-[var(--shadow-soft)]">
                Solicitar demo <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden bg-gradient-to-b from-white via-white to-slate-50/60">
        {/* single subtle premium glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-10%] -z-10 h-[620px] w-[1100px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--brand-blue-soft) 0%, transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3.5 py-1.5 text-xs font-medium text-foreground/75 shadow-[var(--shadow-soft)]">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70 opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                Plataforma SaaS de inteligência comercial
              </div>

              <h1 className="font-display mt-7 text-[2.6rem] font-semibold leading-[1.03] tracking-[-0.03em] text-[oklch(0.16_0.04_258)] md:text-[3.75rem] lg:text-[4.5rem] lg:leading-[1.02]">
                Transforme conversas em{" "}
                <span className="text-primary">vendas</span> com inteligência comercial
              </h1>

              <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Centralize WhatsApp, leads, responsáveis, IA, base de conhecimento e
                relatórios em uma operação comercial organizada, escalável e pronta para
                automações.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a href="#cta-final">
                  <Button
                    size="lg"
                    className="h-12 w-full gap-2 px-7 text-base shadow-[var(--shadow-premium)] sm:w-auto"
                  >
                    Solicitar demonstração <ArrowRight className="size-4" />
                  </Button>
                </a>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full px-7 text-base sm:w-auto"
                  >
                    Entrar no painel
                  </Button>
                </Link>
              </div>

              {/* mini indicadores */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-foreground/75">
                {[
                  { icon: Bot, label: "IA ativa" },
                  { icon: Users, label: "Leads organizados" },
                  { icon: Activity, label: "Relatórios em tempo real" },
                ].map((b) => (
                  <div key={b.label} className="inline-flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--brand-blue-soft)] text-primary">
                      <b.icon className="size-3.5" />
                    </span>
                    {b.label}
                  </div>
                ))}
              </div>

              {/* stats — prova de tração */}
              <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[var(--border-premium)] pt-7 sm:grid-cols-4">
                {[
                  { v: "+10k", l: "Conversas processadas" },
                  { v: "+85%", l: "Resposta em até 2min" },
                  { v: "+30%", l: "Conversão de leads" },
                  { v: "24/7", l: "IA disponível" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-display text-3xl font-bold tracking-tight text-[oklch(0.16_0.04_258)] md:text-4xl">
                      {s.v}
                    </div>
                    <div className="mt-1 text-xs leading-snug text-muted-foreground">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — premium product + device composition */}
            <div className="relative lg:-mr-4 xl:-mr-8">
              {/* layered ambient glows */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-16 -z-10 rounded-[3rem] opacity-70 blur-3xl"
                style={{
                  background:
                    "radial-gradient(55% 60% at 70% 30%, oklch(0.55 0.22 258 / 0.35) 0%, transparent 70%), radial-gradient(50% 55% at 25% 80%, oklch(0.45 0.20 280 / 0.28) 0%, transparent 75%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.97 0.02 258) 0%, oklch(0.94 0.04 270) 100%)",
                }}
              />

              {/* LAPTOP / browser frame */}
              <div
                className="relative rounded-[1.75rem] p-[1px]"
                style={{
                  background:
                    "linear-gradient(160deg, oklch(0.55 0.22 258 / 0.45), oklch(0.55 0.22 258 / 0.05) 45%, transparent 75%)",
                }}
              >
                <div
                  className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white p-2"
                  style={{ boxShadow: "var(--shadow-premium)" }}
                >
                  {/* window chrome */}
                  <div className="flex items-center justify-between px-3 pb-2 pt-1.5">
                    <div className="flex gap-1.5">
                      <span className="size-2.5 rounded-full bg-rose-400/80" />
                      <span className="size-2.5 rounded-full bg-amber-400/80" />
                      <span className="size-2.5 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="hidden items-center gap-1.5 rounded-md border border-[var(--border-premium)] bg-secondary/60 px-3 py-0.5 text-[10px] text-muted-foreground sm:flex">
                      <ShieldCheck className="size-2.5 text-emerald-600" />
                      app.agentecomercial360.com/dashboard
                    </div>
                    <div className="size-2.5" />
                  </div>

                  {/* app shell: sidebar + main */}
                  <div className="overflow-hidden rounded-[1.25rem] bg-slate-50">
                    <div className="grid grid-cols-[150px_1fr] md:grid-cols-[180px_1fr]">
                      {/* SIDEBAR */}
                      <aside
                        className="flex flex-col gap-1.5 px-2.5 py-3 text-white"
                        style={{
                          background:
                            "linear-gradient(180deg, oklch(0.20 0.045 258) 0%, oklch(0.15 0.04 258) 100%)",
                        }}
                      >
                        <div className="flex items-center gap-2 px-1.5 pb-2.5">
                          <div
                            className="flex size-7 shrink-0 items-center justify-center rounded-md text-white shadow-[0_4px_10px_-2px_oklch(0.55_0.22_258_/_0.6)]"
                            style={{ background: "var(--gradient-brand)" }}
                          >
                            <span className="text-[10px] font-black tracking-tighter">AC</span>
                          </div>
                          <div className="min-w-0 leading-tight">
                            <div className="truncate text-[9px] font-medium text-white/55">
                              Agente Comercial
                            </div>
                            <div className="font-display text-[11px] font-bold">360</div>
                          </div>
                        </div>

                        <div className="px-1.5 pb-0.5 text-[8px] font-semibold uppercase tracking-wider text-white/35">
                          Operação
                        </div>
                        {[
                          { I: BarChart3, l: "Dashboard", active: true },
                          { I: Headphones, l: "Atendimentos", active: false },
                          { I: MessageSquare, l: "Conversas", active: false },
                          { I: Users, l: "Leads", active: false },
                        ].map((it) => (
                          <div
                            key={it.l}
                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] ${
                              it.active
                                ? "bg-primary text-white shadow-[0_6px_14px_-3px_oklch(0.55_0.22_258_/_0.55)]"
                                : "text-white/65"
                            }`}
                          >
                            <it.I className="size-3" />
                            <span className="truncate">{it.l}</span>
                          </div>
                        ))}

                        <div className="mt-1.5 px-1.5 pb-0.5 text-[8px] font-semibold uppercase tracking-wider text-white/35">
                          Inteligência
                        </div>
                        {[
                          { I: Sparkles, l: "IA" },
                          { I: BookOpen, l: "Base" },
                        ].map((it) => (
                          <div
                            key={it.l}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-white/65"
                          >
                            <it.I className="size-3" />
                            <span className="truncate">{it.l}</span>
                          </div>
                        ))}
                      </aside>

                      {/* MAIN */}
                      <div className="flex flex-col">
                        {/* TOP HEADER */}
                        <div className="flex items-center justify-between gap-2 border-b border-[var(--border-premium)] bg-white px-3 py-2.5">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="min-w-0 leading-tight">
                              <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Empresa ativa
                              </div>
                              <div className="font-display truncate text-[11px] font-bold tracking-tight">
                                Operação Comercial 360
                              </div>
                            </div>
                            <div className="hidden items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 sm:flex">
                              <Bot className="size-2.5" /> IA Ativa
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-1 text-[9px] text-muted-foreground md:flex">
                              <span className="relative flex size-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                              </span>
                              Sistema online
                            </div>
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="space-y-2.5 p-3 pr-[42%] md:pr-[38%]">
                          {/* KPI CARDS */}
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { icon: MessageSquare, label: "Conversas abertas", value: "26", trend: "+18%" },
                              { icon: TrendingUp, label: "Leads quentes", value: "14", trend: "+24%" },
                              { icon: Bot, label: "IA ativa", value: "On", trend: "auto" },
                              { icon: Workflow, label: "Follow-ups", value: "8", trend: "hoje" },
                            ].map((k) => (
                              <div
                                key={k.label}
                                className="rounded-lg border border-[var(--border-premium)] bg-white p-2 shadow-[var(--shadow-soft)]"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="text-[8px] font-medium leading-tight text-muted-foreground">
                                    {k.label}
                                  </div>
                                  <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[var(--brand-blue-soft)] text-primary">
                                    <k.icon className="size-2.5" />
                                  </div>
                                </div>
                                <div className="mt-1 flex items-baseline gap-1.5">
                                  <div className="font-display text-base font-bold tracking-tight">
                                    {k.value}
                                  </div>
                                  <div className="text-[8px] font-bold text-emerald-600">
                                    {k.trend}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* MINI CHART */}
                          <div className="rounded-lg border border-[var(--border-premium)] bg-white p-2.5 shadow-[var(--shadow-soft)]">
                            <div className="mb-1.5 flex items-center justify-between">
                              <div className="text-[9px] font-bold tracking-tight">
                                Performance da semana
                              </div>
                              <div className="text-[8px] font-semibold text-emerald-600">
                                ↑ 28%
                              </div>
                            </div>
                            <svg viewBox="0 0 200 56" className="h-10 w-full">
                              <defs>
                                <linearGradient id="hg" x1="0" x2="0" y1="0" y2="1">
                                  <stop offset="0%" stopColor="oklch(0.55 0.22 258)" stopOpacity="0.35" />
                                  <stop offset="100%" stopColor="oklch(0.55 0.22 258)" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M0,44 L20,38 L40,40 L60,30 L80,32 L100,22 L120,24 L140,14 L160,18 L180,8 L200,12 L200,56 L0,56 Z"
                                fill="url(#hg)"
                              />
                              <path
                                d="M0,44 L20,38 L40,40 L60,30 L80,32 L100,22 L120,24 L140,14 L160,18 L180,8 L200,12"
                                fill="none"
                                stroke="oklch(0.55 0.22 258)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              {[ [60,30],[100,22],[140,14],[180,8] ].map(([x,y]) => (
                                <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="white" stroke="oklch(0.55 0.22 258)" strokeWidth="1.2" />
                              ))}
                            </svg>
                          </div>

                          {/* Resumo IA */}
                          <div
                            className="relative overflow-hidden rounded-lg p-2.5 text-white shadow-[0_8px_24px_-8px_oklch(0.18_0.04_258_/_0.5)]"
                            style={{
                              background:
                                "linear-gradient(135deg, oklch(0.20 0.045 258) 0%, oklch(0.28 0.09 258) 100%)",
                            }}
                          >
                            <div className="relative flex items-start gap-2">
                              <div
                                className="flex size-6 shrink-0 items-center justify-center rounded-md text-white"
                                style={{ background: "var(--gradient-brand)" }}
                              >
                                <Bot className="size-3" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 text-[9px] font-bold">
                                  Resumo da IA
                                  <span className="rounded bg-white/20 px-1 py-px text-[7px] font-semibold">
                                    auto
                                  </span>
                                </div>
                                <div className="text-[9px] leading-snug text-white/80">
                                  8 oportunidades quentes identificadas. Follow-up recomendado nas próximas 2h.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SMARTPHONE — overlapping right side, WhatsApp-style conversation */}
              <div
                aria-hidden="false"
                className="absolute right-2 top-1/2 hidden w-[180px] -translate-y-1/2 sm:block md:right-0 md:w-[200px] lg:-right-4 lg:w-[210px]"
              >
                <div
                  className="rounded-[2rem] p-[2px]"
                  style={{
                    background:
                      "linear-gradient(160deg, oklch(0.55 0.22 258 / 0.6), oklch(0.20 0.045 258 / 0.4) 60%, oklch(0.55 0.22 258 / 0.5))",
                    boxShadow:
                      "0 30px 60px -20px oklch(0.18 0.04 258 / 0.45), 0 0 0 1px oklch(1 0 0 / 0.4) inset",
                  }}
                >
                  <div className="overflow-hidden rounded-[1.85rem] bg-slate-900">
                    {/* status bar + notch */}
                    <div className="relative flex items-center justify-between px-4 pb-1 pt-2 text-[8px] font-semibold text-white">
                      <span>9:41</span>
                      <span className="absolute left-1/2 top-1.5 h-3 w-12 -translate-x-1/2 rounded-full bg-black" />
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-2 rounded-sm bg-white/80" />
                        <span className="h-1.5 w-3 rounded-sm bg-white/80" />
                      </span>
                    </div>
                    {/* chat header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 text-white"
                      style={{
                        background:
                          "linear-gradient(180deg, oklch(0.22 0.05 258) 0%, oklch(0.18 0.04 258) 100%)",
                      }}
                    >
                      <div
                        className="flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: "var(--gradient-brand)" }}
                      >
                        <Bot className="size-3.5" />
                      </div>
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="truncate text-[10px] font-bold">Atendimento Inteligente</div>
                        <div className="flex items-center gap-1 text-[8px] text-white/85">
                          <span className="size-1.5 rounded-full bg-emerald-300" />
                          IA respondendo · em tempo real
                        </div>
                      </div>
                    </div>
                    {/* chat body */}
                    <div
                      className="space-y-2 p-2.5"
                      style={{
                        background:
                          "linear-gradient(180deg, oklch(0.97 0.01 258) 0%, oklch(0.95 0.02 258) 100%)",
                        minHeight: "220px",
                      }}
                    >
                      <div className="max-w-[82%] rounded-lg rounded-tl-sm border border-slate-200 bg-white px-2 py-1.5 text-[8px] text-slate-800 shadow-sm">
                        Olá, preciso de um orçamento.
                        <div className="mt-0.5 text-right text-[6px] text-slate-400">09:41</div>
                      </div>
                      <div
                        className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm px-2 py-1.5 text-[8px] text-white shadow-sm"
                        style={{ background: "var(--gradient-brand)" }}
                      >
                        Claro, já identifiquei sua solicitação e encaminhei para o setor correto.
                        <div className="mt-0.5 text-right text-[6px] text-white/80">09:41 ✓✓</div>
                      </div>
                      <div
                        className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm px-2 py-1.5 text-[8px] text-white shadow-sm"
                        style={{ background: "var(--gradient-brand)" }}
                      >
                        Um responsável comercial entra em contato em instantes.
                        <div className="mt-0.5 text-right text-[6px] text-white/80">09:41 ✓✓</div>
                      </div>
                      <div className="flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
                        <span className="size-1 animate-pulse rounded-full bg-primary/60" />
                        <span className="size-1 animate-pulse rounded-full bg-primary/60" style={{ animationDelay: "0.15s" }} />
                        <span className="size-1 animate-pulse rounded-full bg-primary/60" style={{ animationDelay: "0.3s" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING CARDS */}
              {/* IA respondeu — top left */}
              <div className="absolute -left-3 top-6 hidden rounded-xl border border-[var(--border-premium)] bg-white/95 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur md:flex">
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className="flex size-8 items-center justify-center rounded-lg text-white"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    <Zap className="size-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold">IA respondeu em segundos</div>
                    <div className="text-[10px] text-muted-foreground">tempo médio · 3s</div>
                  </div>
                </div>
              </div>

              {/* Lead qualificado — middle left */}
              <div className="absolute -left-6 top-1/2 hidden -translate-y-1/2 rounded-xl border border-[var(--border-premium)] bg-white/95 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur lg:flex">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold">Lead qualificado</div>
                    <div className="text-[10px] text-violet-600 font-semibold">score 94 · alta intenção</div>
                  </div>
                </div>
              </div>

              {/* Follow-up automatizado — bottom left */}
              <div className="absolute -left-4 bottom-10 hidden rounded-xl border border-[var(--border-premium)] bg-white/95 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur md:flex">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <Workflow className="size-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold">Follow-up automatizado</div>
                    <div className="text-[10px] text-muted-foreground">próximo em 2h</div>
                  </div>
                </div>
              </div>

              {/* Oportunidades — bottom right */}
              <div className="absolute -right-2 bottom-4 hidden rounded-xl border border-[var(--border-premium)] bg-white/95 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur md:flex">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <TrendingUp className="size-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold">+37 oportunidades</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">geradas este mês</div>
                  </div>
                </div>
              </div>

              {/* Responsável acionado — top right (above phone) */}
              <div className="absolute -right-4 -top-2 hidden rounded-xl border border-[var(--border-premium)] bg-white/95 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur lg:flex">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold">Responsável acionado</div>
                    <div className="text-[10px] text-muted-foreground">distribuição automática</div>
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

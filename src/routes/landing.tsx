import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Workflow,
  Bot,
  LineChart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileWarning,
  Briefcase,
  Activity,
  Layers,
  Stethoscope,
  Wrench,
  Building2,
  Truck,
  ShoppingBag,
  Handshake,
  Target,
  Settings2,
  Compass,
  TrendingUp,
} from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Agente Comercial 360 — Plataforma de inteligência comercial" },
      {
        name: "description",
        content:
          "Centralize WhatsApp, CRM, leads, follow-up, automações e relatórios em uma operação comercial mais inteligente, previsível e pronta para crescer.",
      },
      {
        property: "og:title",
        content: "Agente Comercial 360 — Inteligência comercial em uma só plataforma",
      },
      {
        property: "og:description",
        content:
          "Transforme atendimento, vendas e processos em crescimento real com uma central comercial premium.",
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
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground lg:flex">
            <a href="#problema" className="hover:text-foreground transition-colors">Problema</a>
            <a href="#plataforma" className="hover:text-foreground transition-colors">Plataforma</a>
            <a href="#para-quem" className="hover:text-foreground transition-colors">Para quem</a>
            <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
            <a href="#metodo" className="hover:text-foreground transition-colors">Método</a>
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

      {/* ============================================================== */}
      {/* HERO PREMIUM                                                    */}
      {/* ============================================================== */}
      <section id="top" className="relative overflow-hidden bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 85% 10%, oklch(0.93 0.06 262 / 0.55) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 10% 90%, oklch(0.95 0.04 262 / 0.45) 0%, transparent 65%), linear-gradient(180deg, oklch(0.995 0.003 258) 0%, oklch(0.97 0.012 258) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.30]"
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

        <div className="relative mx-auto max-w-7xl px-6 pt-14 pb-20 lg:pt-20 lg:pb-28">
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

              <h1 className="font-display mt-6 text-[2.15rem] font-semibold leading-[1.04] tracking-[-0.035em] text-[oklch(0.18_0.03_262)] sm:text-[2.6rem] md:text-[3rem] lg:text-[3.25rem]">
                Transforme atendimento, vendas e processos em{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(120deg, oklch(0.50 0.24 262) 0%, oklch(0.32 0.18 268) 100%)",
                  }}
                >
                  crescimento real.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[oklch(0.40_0.02_262)] md:text-base">
                O Agente Comercial 360 centraliza WhatsApp, CRM, leads, follow-up,
                automações e relatórios em uma operação comercial mais inteligente,
                previsível e pronta para crescer.
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
                <a href="#plataforma">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-12 gap-2 rounded-full border border-[oklch(0.20_0.03_262)]/15 px-5 text-[15px] text-[oklch(0.22_0.03_262)] hover:bg-[oklch(0.55_0.18_262)]/[0.06]"
                  >
                    Ver como funciona <ArrowRight className="size-4" />
                  </Button>
                </a>
              </div>

              <p className="mt-6 text-[12.5px] font-medium uppercase tracking-[0.18em] text-[oklch(0.45_0.03_262)]">
                Mais controle. Menos improviso. Mais conversão.
              </p>
            </div>

            {/* RIGHT — premium dark device composition */}
            <div className="relative mt-2 lg:mt-0">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-12 -z-10 blur-[120px]"
                style={{
                  background:
                    "radial-gradient(45% 55% at 55% 45%, oklch(0.55 0.26 262 / 0.55) 0%, oklch(0.42 0.24 285 / 0.32) 55%, transparent 80%)",
                }}
              />
              <div
                className="relative overflow-hidden rounded-[32px] border border-white/10 p-5 sm:p-7"
                style={{
                  background:
                    "radial-gradient(120% 90% at 20% 0%, oklch(0.30 0.14 268) 0%, oklch(0.14 0.06 264) 55%, oklch(0.08 0.04 262) 100%)",
                  boxShadow:
                    "0 70px 140px -30px oklch(0.10 0.06 262 / 0.75), inset 0 1px 0 oklch(1 0 0 / 0.10)",
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.45), transparent)",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-20 -bottom-24 h-80 w-80 rounded-full opacity-60 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(closest-side, oklch(0.55 0.26 290 / 0.55), transparent 70%)",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-70 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(closest-side, oklch(0.70 0.22 262 / 0.55), transparent 70%)",
                  }}
                />
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

                {/* DEVICE STAGE */}
                <div className="relative mt-5 pb-2">
                  <div className="relative">
                    <div
                      className="relative overflow-hidden rounded-t-2xl border border-white/10 shadow-[0_40px_80px_-20px_oklch(0_0_0_/_0.75)]"
                      style={{
                        background:
                          "linear-gradient(180deg, oklch(0.13 0.05 264) 0%, oklch(0.09 0.04 262) 100%)",
                      }}
                    >
                      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
                        <span className="size-2 rounded-full bg-[oklch(0.65_0.22_25)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.78_0.18_85)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.72_0.20_150)]" />
                        <div className="ml-3 hidden h-4 flex-1 items-center rounded-md bg-white/[0.04] px-2 text-[8.5px] font-medium text-white/40 sm:flex">
                          app.agentecomercial360.com.br / gestao-360
                        </div>
                      </div>

                      <div className="flex">
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

                          <div className="mt-2.5 grid gap-2 lg:grid-cols-[1.55fr_1fr]">
                            <div className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
                              <div className="flex items-center justify-between">
                                <div className="text-[10px] font-semibold text-white/85">
                                  Atendimentos · WhatsApp Oficial
                                </div>
                                <div className="text-[9px] text-white/40">4 semanas</div>
                              </div>
                              <div className="relative mt-3 h-20">
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
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* PROBLEMA / DOR                                                  */}
      {/* ============================================================== */}
      <section id="problema" className="relative overflow-hidden border-t border-[var(--border-premium)] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.20_0.03_262)]/10 bg-[oklch(0.97_0.01_262)] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.35_0.03_262)]">
              <span className="text-[oklch(0.55_0.22_25)]">01</span>
              <span className="h-3 w-px bg-[oklch(0.20_0.03_262)]/15" />
              O ponto de partida
            </div>
            <h2 className="font-display mt-6 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[oklch(0.18_0.03_262)] md:text-[2.75rem] lg:text-[3.25rem]">
              O problema não é falta de lead.{" "}
              <span className="text-[oklch(0.55_0.22_25)]">É falta de processo.</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
              Atendimento desorganizado custa caro. Quase nunca é o time —
              é a falta de uma plataforma que conecte tudo.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Clock, title: "Leads sem acompanhamento", text: "Oportunidades quentes esfriam sem follow-up estruturado." },
              { icon: FileWarning, title: "Orçamentos esquecidos", text: "Propostas enviadas que ninguém retoma no tempo certo." },
              { icon: MessageSquare, title: "Conversas sem histórico", text: "WhatsApp, e-mail e planilha que não se falam." },
              { icon: Users, title: "Equipe sem prioridade", text: "Cada um responde do seu jeito, sem padrão nem foco." },
              { icon: BarChart3, title: "Gestor sem previsibilidade", text: "Decisões no achismo, sem dado confiável em tempo real." },
              { icon: AlertTriangle, title: "Operação no improviso", text: "Cresce volume, mas o processo continua manual." },
            ].map((p) => (
              <div
                key={p.title}
                className="group relative overflow-hidden rounded-3xl border border-[var(--border-premium)] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[oklch(0.55_0.22_25)]/25 hover:shadow-[var(--shadow-card)]"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.65 0.22 25), oklch(0.55 0.22 15))",
                  }}
                />
                <div
                  className="flex size-12 items-center justify-center rounded-2xl text-[oklch(0.55_0.22_25)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
                  style={{ background: "oklch(0.97 0.03 25)" }}
                >
                  <p.icon className="size-5" strokeWidth={2.2} />
                </div>
                <h3 className="font-display mt-5 text-[17px] font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* PLATAFORMA / ENTREGA PRÁTICA                                    */}
      {/* ============================================================== */}
      <section id="plataforma" className="relative overflow-hidden border-t border-[var(--border-premium)] bg-[oklch(0.985_0.005_258)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-15%] h-[460px] w-[460px] rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--gradient-brand)" }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span>02</span>
              <span className="h-3 w-px bg-primary/25" />
              A plataforma
            </div>
            <h2 className="font-display mt-6 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[oklch(0.18_0.03_262)] md:text-[2.75rem] lg:text-[3.25rem]">
              Uma central comercial para organizar sua operação{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, oklch(0.50 0.24 262) 0%, oklch(0.32 0.18 268) 100%)",
                }}
              >
                de ponta a ponta.
              </span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
              Cada conversa vira histórico. Cada lead ganha próxima ação.
              Cada oportunidade passa a ser acompanhada com mais clareza.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: MessageSquare, title: "WhatsApp integrado", text: "Conversas centralizadas com histórico unificado e SLA por atendimento." },
              { icon: Briefcase, title: "CRM comercial", text: "Cadastro de clientes, oportunidades e contexto sempre à mão." },
              { icon: Target, title: "Funil de vendas", text: "Etapas claras, donos definidos e previsibilidade real do pipeline." },
              { icon: Activity, title: "Follow-up automático", text: "Lembretes inteligentes para nenhuma oportunidade ser esquecida." },
              { icon: LineChart, title: "Relatórios em tempo real", text: "KPIs por responsável, setor e período sem depender de planilha." },
              { icon: Bot, title: "IA comercial", text: "Triagem, priorização e sugestões para o time vender com mais foco." },
            ].map((b) => (
              <div
                key={b.title}
                className="group relative overflow-hidden rounded-3xl border border-[var(--border-premium)] bg-white p-7 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-card)]"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px] scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  style={{ background: "var(--gradient-brand)" }}
                />
                <div
                  className="flex size-12 items-center justify-center rounded-2xl text-primary"
                  style={{ background: "var(--brand-blue-soft)" }}
                >
                  <b.icon className="size-5" strokeWidth={2.2} />
                </div>
                <h3 className="font-display mt-5 text-[17px] font-semibold tracking-tight">
                  {b.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* PARA QUEM SERVE                                                 */}
      {/* ============================================================== */}
      <section id="para-quem" className="border-t border-[var(--border-premium)] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span>03</span>
              <span className="h-3 w-px bg-primary/25" />
              Para quem é
            </div>
            <h2 className="font-display mt-6 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[oklch(0.18_0.03_262)] md:text-[2.75rem] lg:text-[3.25rem]">
              Feito para empresas que recebem contatos todos os dias e precisam vender{" "}
              <span className="text-primary">com mais controle.</span>
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Wrench, title: "Autopeças e comércio técnico" },
              { icon: Stethoscope, title: "Clínicas e consultórios" },
              { icon: ShoppingBag, title: "Comércio e serviços" },
              { icon: Building2, title: "Empresas B2B" },
              { icon: Truck, title: "Distribuidoras" },
              { icon: Briefcase, title: "Prestadores de serviço" },
            ].map((s) => (
              <div
                key={s.title}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[var(--border-premium)] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-soft)]"
              >
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl text-primary transition-all duration-300 group-hover:scale-105"
                  style={{ background: "var(--brand-blue-soft)" }}
                >
                  <s.icon className="size-5" />
                </div>
                <div className="flex-1 font-display text-[15px] font-semibold tracking-tight">
                  {s.title}
                </div>
                <ArrowRight className="size-4 -translate-x-1 text-primary/0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-primary" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* PLANOS                                                          */}
      {/* ============================================================== */}
      <section id="planos" className="relative overflow-hidden border-t border-[var(--border-premium)] bg-[oklch(0.985_0.005_258)]">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span>04</span>
              <span className="h-3 w-px bg-primary/25" />
              Planos
            </div>
            <h2 className="font-display mt-6 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[oklch(0.18_0.03_262)] md:text-[2.75rem] lg:text-[3.25rem]">
              Escolha o plano que acompanha o tamanho da sua operação.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
              Três níveis pensados para empresas em diferentes estágios de maturidade comercial.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-3">
            {[
              {
                name: "Essencial",
                tag: "Para começar com método",
                setup: "Setup R$ 1.490",
                price: "R$ 397",
                period: "/mês",
                features: [
                  "WhatsApp integrado",
                  "CRM comercial básico",
                  "Funil de vendas",
                  "Relatórios essenciais",
                  "Suporte por e-mail",
                ],
                highlight: false,
              },
              {
                name: "Profissional",
                tag: "Mais recomendado",
                setup: "Setup R$ 2.490",
                price: "R$ 697",
                period: "/mês",
                features: [
                  "Tudo do Essencial",
                  "Follow-up automático",
                  "IA comercial e triagem",
                  "Relatórios em tempo real",
                  "Multiusuário e setores",
                  "Suporte prioritário",
                ],
                highlight: true,
              },
              {
                name: "Estratégico",
                tag: "Para operações maduras",
                setup: "Setup sob consulta",
                price: "Sob consulta",
                period: "",
                features: [
                  "Tudo do Profissional",
                  "Automações n8n dedicadas",
                  "Integrações personalizadas",
                  "Acompanhamento mensal",
                  "Gerente de conta",
                  "SLA premium",
                ],
                highlight: false,
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all ${
                  p.highlight
                    ? "scale-[1.02] border-transparent text-white shadow-[0_40px_80px_-30px_oklch(0.30_0.18_262_/_0.55)]"
                    : "border-[var(--border-premium)] bg-white hover:-translate-y-1 hover:border-primary/25 hover:shadow-[var(--shadow-card)]"
                }`}
                style={
                  p.highlight
                    ? {
                        background:
                          "linear-gradient(160deg, oklch(0.24 0.10 264) 0%, oklch(0.14 0.05 262) 100%)",
                      }
                    : undefined
                }
              >
                {p.highlight && (
                  <>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-px rounded-3xl opacity-60"
                      style={{
                        background:
                          "linear-gradient(160deg, oklch(0.65 0.22 262 / 0.35), transparent 40%)",
                        mask: "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
                        WebkitMask:
                          "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
                        maskComposite: "exclude",
                        WebkitMaskComposite: "xor",
                        padding: "1px",
                      }}
                    />
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary shadow-[var(--shadow-soft)]">
                      Mais recomendado
                    </span>
                  </>
                )}
                <div
                  className={`text-[10.5px] font-semibold uppercase tracking-[0.16em] ${
                    p.highlight ? "text-white/55" : "text-muted-foreground"
                  }`}
                >
                  {p.tag}
                </div>
                <div className="font-display mt-2 text-2xl font-semibold tracking-tight">
                  {p.name}
                </div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold tracking-tight">
                    {p.price}
                  </span>
                  {p.period && (
                    <span className={`text-sm ${p.highlight ? "text-white/55" : "text-muted-foreground"}`}>
                      {p.period}
                    </span>
                  )}
                </div>
                <div
                  className={`mt-1 text-[12.5px] ${
                    p.highlight ? "text-white/55" : "text-muted-foreground"
                  }`}
                >
                  {p.setup}
                </div>

                <ul className={`mt-7 flex-1 space-y-3 border-t pt-6 ${p.highlight ? "border-white/10" : "border-[var(--border-premium)]"}`}>
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px]">
                      <CheckCircle2
                        className={`mt-0.5 size-4 shrink-0 ${
                          p.highlight ? "text-[oklch(0.78_0.18_150)]" : "text-primary"
                        }`}
                      />
                      <span className={p.highlight ? "text-white/85" : "text-foreground/85"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <a href="#cta-final" className="mt-8 block">
                  <Button
                    size="lg"
                    className={`h-12 w-full gap-2 rounded-full text-[14px] ${
                      p.highlight
                        ? "bg-white text-[oklch(0.18_0.05_262)] hover:bg-white/90"
                        : ""
                    }`}
                    variant={p.highlight ? "default" : "outline"}
                  >
                    Solicitar proposta <ArrowRight className="size-4" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* MÉTODO / DIFERENCIAL                                            */}
      {/* ============================================================== */}
      <section id="metodo" className="border-t border-[var(--border-premium)] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span>05</span>
              <span className="h-3 w-px bg-primary/25" />
              Nosso diferencial
            </div>
            <h2 className="font-display mt-6 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[oklch(0.18_0.03_262)] md:text-[2.75rem] lg:text-[3.25rem]">
              Mais do que software:{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, oklch(0.50 0.24 262) 0%, oklch(0.32 0.18 268) 100%)",
                }}
              >
                implantação comercial com método.
              </span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
              Não entregamos apenas uma ferramenta. Implantamos um processo comercial
              completo, calibrado para o seu negócio.
            </p>
          </div>

          <div className="relative mx-auto mt-16 max-w-6xl">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden h-px lg:block"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--brand-blue) 20%, var(--brand-blue) 80%, transparent)",
                opacity: 0.25,
              }}
            />
            <div className="grid gap-6 lg:grid-cols-4">
              {[
                { n: "01", icon: Compass, title: "Diagnóstico da operação", text: "Mapeamos pontos de perda, gargalos e oportunidades reais." },
                { n: "02", icon: Workflow, title: "Desenho do fluxo comercial", text: "Definimos etapas, responsáveis, SLAs e critérios de qualificação." },
                { n: "03", icon: Settings2, title: "Configuração da IA e automações", text: "Implantamos triagem, follow-up e regras alinhadas ao seu negócio." },
                { n: "04", icon: TrendingUp, title: "Acompanhamento e evolução", text: "Revisões periódicas com indicadores e ajuste contínuo do processo." },
              ].map((s) => (
                <div
                  key={s.n}
                  className="relative rounded-3xl border border-[var(--border-premium)] bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex size-14 items-center justify-center rounded-2xl text-white shadow-[var(--shadow-soft)]"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      <s.icon className="size-6" />
                    </div>
                    <span className="font-display text-3xl font-bold text-primary/15">{s.n}</span>
                  </div>
                  <h3 className="mt-6 font-display text-[17px] font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CTA FINAL                                                       */}
      {/* ============================================================== */}
      <section id="cta-final" className="border-t border-[var(--border-premium)] bg-[oklch(0.985_0.005_258)]">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-28">
          <div
            className="relative overflow-hidden rounded-[32px] p-10 text-center md:p-16"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.16 0.06 262) 0%, oklch(0.28 0.14 262) 60%, oklch(0.22 0.10 270) 100%)",
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
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            <div className="relative mx-auto max-w-3xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] backdrop-blur">
                <Sparkles className="size-3.5" /> Agente Comercial 360
              </div>
              <h2 className="font-display mt-6 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[2.75rem] lg:text-[3.25rem]">
                Quer transformar seu atendimento em uma operação comercial organizada?
              </h2>
              <p className="mt-5 text-white/80 md:text-lg">
                Fale com nossa equipe e entenda como o Agente Comercial 360 pode ser
                aplicado na sua empresa.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="mailto:contato@agentecomercial360.com?subject=Solicita%C3%A7%C3%A3o%20de%20apresenta%C3%A7%C3%A3o%20comercial%20-%20Agente%20Comercial%20360">
                  <Button
                    size="lg"
                    className="h-12 gap-2 rounded-full bg-white px-7 text-[15px] text-[oklch(0.18_0.05_262)] hover:bg-white/90"
                  >
                    Solicitar apresentação comercial <ArrowRight className="size-4" />
                  </Button>
                </a>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/40 bg-transparent px-6 text-[15px] text-white hover:bg-white/10 hover:text-white"
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
            <a href="#plataforma" className="hover:text-foreground">Plataforma</a>
            <a href="#planos" className="hover:text-foreground">Planos</a>
            <Link to="/login" className="hover:text-foreground">Entrar no painel</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

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

      {/* HERO — dark premium SaaS / enterprise platform */}
      <section
        id="top"
        className="relative overflow-hidden text-white"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 0%, oklch(0.22 0.09 262) 0%, oklch(0.16 0.07 260) 45%, oklch(0.11 0.05 260) 100%)",
        }}
      >
        {/* deep base layer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.13 0.06 262) 0%, oklch(0.09 0.04 260) 100%)",
          }}
        />

        {/* blue glow top-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[10%] -top-[15%] -z-10 h-[760px] w-[900px] rounded-full opacity-70 blur-[140px]"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.55 0.24 262 / 0.65) 0%, transparent 70%)",
          }}
        />
        {/* purple glow right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[8%] top-[10%] -z-10 h-[720px] w-[860px] rounded-full opacity-60 blur-[150px]"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.50 0.22 295 / 0.55) 0%, transparent 72%)",
          }}
        />
        {/* center mockup halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[45%] -z-10 h-[600px] w-[1100px] -translate-x-1/2 rounded-full opacity-60 blur-[160px]"
          style={{
            background:
              "radial-gradient(ellipse 55% 55% at 50% 50%, oklch(0.55 0.24 262 / 0.45) 0%, transparent 75%)",
          }}
        />

        {/* tech grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.85 0.05 260 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.05 260 / 0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 75% 65% at 50% 40%, black 30%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 65% at 50% 40%, black 30%, transparent 85%)",
          }}
        />

        {/* grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-14 pb-24 lg:pt-20 lg:pb-32">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1.25fr] lg:gap-10">
            {/* LEFT — copy */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.70_0.20_262)] opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[oklch(0.70_0.20_262)]" />
                </span>
                Plataforma de Inteligência Comercial
              </div>

              <h1 className="font-display mt-6 text-[2.15rem] font-semibold leading-[1.03] tracking-[-0.035em] sm:text-[2.6rem] md:text-[3.1rem] lg:text-[3.4rem]">
                Pare de perder vendas no WhatsApp.{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(120deg, oklch(0.78 0.18 262) 0%, oklch(0.72 0.20 285) 100%)",
                  }}
                >
                  Centralize sua operação comercial com IA.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 md:text-base">
                Organize atendimentos, leads, responsáveis, CRM, follow-up e
                relatórios em uma plataforma criada para empresas que querem
                vender mais com controle, velocidade e previsibilidade.
              </p>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <a href="#cta-final">
                  <Button
                    size="lg"
                    className="h-12 gap-2 px-7 text-[15px] text-white shadow-[0_20px_40px_-12px_oklch(0.45_0.24_262_/_0.7)] hover:opacity-95"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.58 0.24 262) 0%, oklch(0.52 0.22 280) 100%)",
                    }}
                  >
                    Solicitar demonstração <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="#solucao">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-12 px-5 text-[15px] text-white/80 hover:bg-white/[0.06] hover:text-white"
                  >
                    Ver como funciona
                  </Button>
                </a>
              </div>

              {/* micro-benefits */}
              <div className="mt-9 grid max-w-lg grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { icon: MessageSquare, label: "WhatsApp centralizado" },
                  { icon: Briefcase, label: "CRM comercial" },
                  { icon: Bot, label: "Automação com IA" },
                  { icon: LineChart, label: "Relatórios gerenciais" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center gap-2.5 text-[13px] text-white/75"
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[oklch(0.78_0.18_262)]">
                      <m.icon className="size-3.5" strokeWidth={2.2} />
                    </span>
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — protagonist mockup composition */}
            <div className="relative">
              {/* halo behind */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-10 -z-10 blur-[100px]"
                style={{
                  background:
                    "radial-gradient(55% 55% at 55% 50%, oklch(0.55 0.24 262 / 0.55) 0%, oklch(0.50 0.22 295 / 0.25) 55%, transparent 80%)",
                }}
              />

              {/* notebook */}
              <div className="relative">
                {/* lid */}
                <div
                  className="relative overflow-hidden rounded-t-[18px] border border-white/10 bg-[oklch(0.15_0.05_262)] shadow-[0_60px_120px_-25px_oklch(0.05_0.05_260_/_0.8)]"
                  style={{
                    boxShadow:
                      "0 60px 120px -25px oklch(0.05 0.05 260 / 0.85), 0 0 0 1px oklch(1 0 0 / 0.04) inset",
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, oklch(0.75 0.20 262 / 0.7), transparent)",
                    }}
                  />
                  {/* chrome */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] bg-[oklch(0.13_0.05_262)] px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-white/15" />
                      <span className="size-2 rounded-full bg-white/15" />
                      <span className="size-2 rounded-full bg-white/15" />
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] font-medium text-white/55">
                      <img src={acLogo} alt="" className="h-3.5 w-3.5 rounded" />
                      Agente Comercial 360 · Painel
                    </div>
                    <div className="w-10" />
                  </div>

                  <div className="flex bg-[oklch(0.12_0.04_262)]">
                    {/* sidebar */}
                    <div className="hidden w-[170px] shrink-0 flex-col gap-0.5 border-r border-white/[0.05] bg-[oklch(0.10_0.04_262)] p-2.5 md:flex">
                      <div className="mb-2 flex items-center gap-2 px-1.5 pt-1">
                        <div className="flex size-6 items-center justify-center rounded-md bg-[oklch(0.55_0.24_262)]/30 text-white">
                          <Layers className="size-3" />
                        </div>
                        <span className="text-[11px] font-semibold text-white">AC360</span>
                      </div>
                      {[
                        { icon: Layers, label: "Gestão 360", active: true },
                        { icon: MessageSquare, label: "Conversas" },
                        { icon: Users, label: "Leads" },
                        { icon: Briefcase, label: "CRM" },
                        { icon: Bot, label: "IA" },
                        { icon: LineChart, label: "Relatórios" },
                        { icon: ShieldCheck, label: "WhatsApp Oficial" },
                      ].map((it) => (
                        <div
                          key={it.label}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                            it.active
                              ? "bg-[oklch(0.55_0.24_262)]/25 text-white"
                              : "text-white/45 hover:text-white"
                          }`}
                        >
                          <it.icon className="size-3" />
                          {it.label}
                        </div>
                      ))}
                    </div>

                    {/* main */}
                    <div className="flex-1 p-3.5 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-medium uppercase tracking-wider text-white/45">
                            Visão geral
                          </div>
                          <div className="font-display mt-0.5 text-[12.5px] font-semibold tracking-tight text-white">
                            Gestão 360 · Operação comercial
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.50_0.18_150)]/30 bg-[oklch(0.45_0.16_150)]/15 px-2 py-0.5 text-[9px] font-semibold text-[oklch(0.78_0.18_150)]">
                          <span className="size-1 rounded-full bg-[oklch(0.65_0.20_150)]" />
                          Em tempo real
                        </span>
                      </div>

                      {/* KPI row */}
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
                            <div className="flex items-center gap-1.5 text-[8.5px] font-semibold uppercase tracking-wide text-white/50">
                              <k.icon className="size-2.5 text-[oklch(0.78_0.18_262)]" />
                              {k.label}
                            </div>
                            <div className="mt-1.5 flex h-1 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${60 + i * 8}%`,
                                  background:
                                    "linear-gradient(90deg, oklch(0.65 0.22 262), oklch(0.62 0.22 290))",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* chart + list */}
                      <div className="mt-2.5 grid gap-2 lg:grid-cols-[1.5fr_1fr]">
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] font-semibold text-white/85">
                              Atendimentos por dia
                            </div>
                            <div className="text-[9px] text-white/40">4 semanas</div>
                          </div>
                          <div className="mt-3 flex h-20 items-end gap-1">
                            {[40, 55, 48, 62, 70, 58, 72, 65, 78, 70, 85, 76, 90, 82].map((h, i) => (
                              <div key={i} className="relative flex-1">
                                <div
                                  className="absolute inset-x-0 bottom-0 rounded-[2px]"
                                  style={{
                                    height: `${h}%`,
                                    background:
                                      i >= 10
                                        ? "linear-gradient(180deg, oklch(0.70 0.22 262), oklch(0.60 0.22 290))"
                                        : "oklch(0.25 0.05 262)",
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5">
                          <div className="mb-2 text-[10px] font-semibold text-white/85">
                            Conversas
                          </div>
                          <div className="space-y-1.5">
                            {[
                              { name: "WhatsApp · Cliente", status: "IA respondendo", c: "primary" },
                              { name: "Lead · Qualificação", status: "Atribuído", c: "green" },
                              { name: "Follow-up", status: "Aguardando", c: "muted" },
                            ].map((c) => (
                              <div
                                key={c.name}
                                className="flex items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1.5"
                              >
                                <span className="flex size-5 items-center justify-center rounded-full bg-[oklch(0.55_0.24_262)]/20 text-[oklch(0.78_0.18_262)]">
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
                                      ? "bg-[oklch(0.65_0.20_150)]"
                                      : c.c === "primary"
                                      ? "bg-[oklch(0.70_0.22_262)]"
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
                  aria-hidden
                  className="mx-auto h-2.5 w-[104%] -translate-x-[2%] rounded-b-[14px]"
                  style={{
                    background:
                      "linear-gradient(180deg, oklch(0.20 0.04 262) 0%, oklch(0.12 0.04 262) 100%)",
                    boxShadow: "0 30px 50px -20px oklch(0 0 0 / 0.6)",
                  }}
                />
                <div
                  aria-hidden
                  className="mx-auto h-1 w-[30%] rounded-b-md bg-[oklch(0.18_0.04_262)]"
                />
              </div>

              {/* PHONE — WhatsApp */}
              <div className="absolute -right-2 -bottom-4 hidden w-[180px] rounded-[26px] border border-white/10 bg-[oklch(0.10_0.04_262)] p-1.5 shadow-[0_40px_80px_-20px_oklch(0_0_0_/_0.8)] sm:block md:-right-6 md:bottom-6 md:w-[200px]">
                <div className="overflow-hidden rounded-[20px] bg-[oklch(0.96_0.005_150)]">
                  {/* notch */}
                  <div className="flex justify-center bg-[oklch(0.10_0.04_262)] py-1">
                    <div className="h-1 w-12 rounded-full bg-white/20" />
                  </div>
                  {/* header */}
                  <div
                    className="flex items-center gap-2 px-2.5 py-2 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.45 0.13 155) 0%, oklch(0.38 0.12 158) 100%)",
                    }}
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
                      <MessageSquare className="size-3" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[10px] font-semibold">
                        WhatsApp Oficial
                      </div>
                      <div className="flex items-center gap-1 text-[8.5px] opacity-90">
                        <span className="size-1 rounded-full bg-white" />
                        online
                      </div>
                    </div>
                  </div>
                  {/* messages */}
                  <div className="space-y-1.5 px-2.5 py-3">
                    <div className="max-w-[80%] rounded-lg rounded-tl-sm bg-white px-2 py-1.5 text-[9.5px] text-[oklch(0.2_0.02_262)] shadow-sm">
                      Olá! Tenho interesse na plataforma.
                    </div>
                    <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-[oklch(0.88_0.10_155)] px-2 py-1.5 text-[9.5px] text-[oklch(0.2_0.02_262)] shadow-sm">
                      Oi! Sou a IA do Agente 360. Posso te ajudar agora mesmo.
                    </div>
                    <div className="max-w-[78%] rounded-lg rounded-tl-sm bg-white px-2 py-1.5 text-[9.5px] text-[oklch(0.2_0.02_262)] shadow-sm">
                      Quero ver uma demo.
                    </div>
                    <div className="ml-auto max-w-[88%] rounded-lg rounded-tr-sm bg-[oklch(0.88_0.10_155)] px-2 py-1.5 text-[9.5px] text-[oklch(0.2_0.02_262)] shadow-sm">
                      Perfeito! Já direcionei para o time comercial.
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING CARD — IA classifying */}
              <div className="absolute -left-4 top-10 hidden w-[200px] rounded-xl border border-white/10 bg-white/[0.06] p-2.5 shadow-[0_25px_50px_-15px_oklch(0_0_0_/_0.6)] backdrop-blur-xl lg:block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.55_0.24_262)]/30 text-[oklch(0.78_0.18_262)]">
                      <Bot className="size-3.5" />
                    </span>
                    <div className="text-[10px] font-semibold text-white">
                      IA classificou lead
                    </div>
                  </div>
                  <Zap className="size-3 text-[oklch(0.78_0.18_262)]" />
                </div>
                <div className="mt-1.5 text-[9px] text-white/55">
                  Prioridade alta · responsável atribuído
                </div>
                <div className="mt-1.5 flex h-0.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "86%",
                      background:
                        "linear-gradient(90deg, oklch(0.65 0.22 262), oklch(0.62 0.22 290))",
                    }}
                  />
                </div>
              </div>

              {/* FLOATING CARD — Relatório */}
              <div className="absolute -left-2 -bottom-2 hidden w-[210px] rounded-xl border border-white/10 bg-white/[0.06] p-2.5 shadow-[0_25px_50px_-15px_oklch(0_0_0_/_0.6)] backdrop-blur-xl lg:block">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.45_0.16_150)]/30 text-[oklch(0.78_0.18_150)]">
                    <LineChart className="size-3.5" />
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold text-white">
                      Relatório gerencial
                    </div>
                    <div className="text-[8.5px] text-white/55">
                      Pronto para download
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING CARD — Follow-up */}
              <div className="absolute right-4 -top-3 hidden w-[180px] rounded-xl border border-white/10 bg-white/[0.06] p-2.5 shadow-[0_25px_50px_-15px_oklch(0_0_0_/_0.6)] backdrop-blur-xl xl:block">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.55_0.20_280)]/30 text-[oklch(0.78_0.18_285)]">
                    <Activity className="size-3.5" />
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold text-white">
                      Follow-up monitorado
                    </div>
                    <div className="text-[8.5px] text-white/55">3 ações pendentes</div>
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

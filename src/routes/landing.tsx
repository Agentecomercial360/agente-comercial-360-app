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

      {/* HERO — cinematic premium layout */}
      <section
        id="top"
        className="relative overflow-hidden bg-gradient-to-b from-white via-[oklch(0.985_0.008_258)] to-white"
      >
        {/* atmospheric cloud/mist layers */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[20%] top-[-10%] -z-10 h-[900px] w-[1200px] rounded-full opacity-70 blur-[140px]"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.92 0.06 258 / 0.7) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[15%] top-[20%] -z-10 h-[700px] w-[1000px] rounded-full opacity-60 blur-[120px]"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.95 0.04 258 / 0.85) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[35%] -z-10 h-[800px] w-[1400px] -translate-x-1/2 rounded-full opacity-80 blur-[160px]"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.88 0.10 258 / 0.45) 0%, transparent 70%)",
          }}
        />

        {/* ultra-subtle grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.22]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.55 0.22 258 / 0.05) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.22 258 / 0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
          }}
        />

        {/* GIANT TRANSLUCENT WORDMARK — background depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[42%] -z-[5] flex justify-center overflow-hidden"
        >
          <span
            className="font-display select-none whitespace-nowrap text-[22vw] font-black leading-none tracking-[-0.06em] md:text-[18vw] lg:text-[15rem] xl:text-[18rem]"
            style={{
              background:
                "linear-gradient(180deg, oklch(0.55 0.22 258 / 0.10) 0%, oklch(0.55 0.22 258 / 0.02) 60%, transparent 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            COMERCIAL 360
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-14 pb-20 md:pt-20 md:pb-24 lg:pt-24">
          {/* TOP — copy block centered, tighter */}
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary shadow-[var(--shadow-soft)] backdrop-blur-md">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Plataforma de Inteligência Comercial
            </div>

            <h1 className="font-display mt-6 max-w-[18ch] text-[2rem] font-semibold leading-[1.04] tracking-[-0.035em] text-[oklch(0.14_0.04_258)] sm:text-[2.4rem] md:max-w-[20ch] md:text-[3rem] lg:text-[3.5rem] lg:leading-[1.02]">
              Pare de perder vendas no WhatsApp.{" "}
              <span className="text-primary">Centralize sua operação</span> em
              um único painel inteligente.
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
              Atendimentos, leads, IA, CRM, follow-up e relatórios em uma
              plataforma feita para empresas que vendem com controle e
              previsibilidade.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
              <a href="#cta-final">
                <Button
                  size="lg"
                  className="h-12 w-full gap-2 px-7 text-[15px] shadow-[var(--shadow-premium)] sm:w-auto"
                >
                  Solicitar demonstração <ArrowRight className="size-4" />
                </Button>
              </a>
              <a href="#solucao">
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 w-full px-5 text-[15px] text-foreground/70 hover:text-foreground sm:w-auto"
                >
                  Ver como funciona
                </Button>
              </a>
            </div>
          </div>

          {/* MOCKUP — protagonist, raised closer to fold */}
          <div className="relative mx-auto mt-10 max-w-[1120px] md:mt-14">
            {/* deep floor shadow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-16 -bottom-12 -z-10 h-32 rounded-[100%] opacity-70 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, oklch(0.25 0.08 258 / 0.40) 0%, transparent 80%)",
              }}
            />
            {/* blue ambient glow halo */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-12 -z-10 blur-[100px]"
              style={{
                background:
                  "radial-gradient(45% 50% at 50% 50%, oklch(0.55 0.22 258 / 0.28) 0%, transparent 75%)",
              }}
            />
            {/* top edge light */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-40 w-[80%] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, oklch(0.70 0.18 250 / 0.35) 0%, transparent 70%)",
              }}
            />

            {/* MAIN DASHBOARD WINDOW */}
            <div className="relative overflow-hidden rounded-[20px] border border-[var(--border-premium)] bg-white shadow-[0_80px_140px_-30px_oklch(0.18_0.08_258_/_0.50),0_30px_60px_-25px_oklch(0.25_0.08_258_/_0.30)] ring-1 ring-black/[0.03] md:rounded-[24px]">
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.55 0.22 258 / 0.6), transparent)",
                }}
              />

              {/* window chrome */}
              <div className="flex items-center justify-between border-b border-[var(--border-premium)] bg-gradient-to-b from-white to-slate-50/70 px-4 py-3 md:px-5 md:py-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-[oklch(0.85_0.10_30)]" />
                  <span className="size-2.5 rounded-full bg-[oklch(0.85_0.12_85)]" />
                  <span className="size-2.5 rounded-full bg-[oklch(0.80_0.14_150)]" />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground md:text-xs">
                  <img src={acLogo} alt="" className="h-4 w-4 rounded" />
                  Agente Comercial 360 · Painel
                </div>
                <div className="w-12" />
              </div>

              {/* body */}
              <div className="flex bg-[oklch(0.985_0.005_258)]">
                {/* sidebar — dark navy */}
                <div className="hidden w-[210px] shrink-0 flex-col gap-0.5 border-r border-[var(--border-premium)] bg-[oklch(0.18_0.04_258)] p-3 md:flex">
                  <div className="mb-3 flex items-center gap-2 px-2 pt-1">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-white">
                      <Layers className="size-3.5" />
                    </div>
                    <span className="text-[12px] font-semibold text-white">
                      AC360
                    </span>
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
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-colors ${
                        it.active
                          ? "bg-primary/25 text-white"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      <it.icon className="size-3.5" />
                      {it.label}
                    </div>
                  ))}
                </div>

                {/* main area */}
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Visão geral
                      </div>
                      <div className="font-display mt-0.5 text-[15px] font-semibold tracking-tight text-[oklch(0.16_0.04_258)] md:text-base">
                        Gestão 360 · Operação comercial
                      </div>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.85_0.10_150)] bg-[oklch(0.96_0.04_150)] px-2.5 py-1 text-[10px] font-semibold text-[oklch(0.40_0.15_150)]">
                        <span className="size-1.5 rounded-full bg-[oklch(0.55_0.18_150)]" />
                        Em tempo real
                      </span>
                    </div>
                  </div>

                  {/* status row */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
                    {[
                      { icon: MessageSquare, label: "Conversas ativas", hint: "Distribuídas por responsável" },
                      { icon: Users, label: "Leads em pipeline", hint: "Qualificação automática" },
                      { icon: Bot, label: "IA monitorando", hint: "Sugestões em tempo real" },
                      { icon: LineChart, label: "Relatórios", hint: "Atualizados ao vivo" },
                    ].map((k) => (
                      <div
                        key={k.label}
                        className="rounded-xl border border-[var(--border-premium)] bg-white p-3"
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <k.icon className="size-3 text-primary" />
                          {k.label}
                        </div>
                        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: "72%",
                              background:
                                "linear-gradient(90deg, oklch(0.55 0.22 258), oklch(0.65 0.18 250))",
                            }}
                          />
                        </div>
                        <div className="mt-2 truncate text-[10px] text-muted-foreground">
                          {k.hint}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* chart + conversations */}
                  <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
                    <div className="rounded-xl border border-[var(--border-premium)] bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-semibold text-foreground">
                            Atendimentos por dia
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Últimas 4 semanas
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <span className="size-2 rounded-sm bg-primary" />
                            Concluídos
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="size-2 rounded-sm bg-slate-200" />
                            Em curso
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex h-24 items-end gap-1.5 md:h-28">
                        {[40, 55, 48, 62, 70, 58, 72, 65, 78, 70, 85, 76, 90, 82].map((h, i) => (
                          <div key={i} className="relative flex-1">
                            <div
                              className="absolute inset-x-0 bottom-0 rounded-sm"
                              style={{
                                height: `${h}%`,
                                background:
                                  i >= 10
                                    ? "linear-gradient(180deg, oklch(0.55 0.22 258), oklch(0.65 0.18 250))"
                                    : "oklch(0.90 0.03 258)",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[var(--border-premium)] bg-white p-3.5">
                      <div className="mb-2.5 flex items-center justify-between">
                        <div className="text-[11px] font-semibold text-foreground">
                          Conversas recentes
                        </div>
                        <span className="text-[10px] font-medium text-primary">Ver todas</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { name: "Cliente · WhatsApp", status: "IA respondendo", color: "primary" },
                          { name: "Lead · Qualificação", status: "Atribuído", color: "green" },
                          { name: "Cliente · Follow-up", status: "Aguardando", color: "muted" },
                        ].map((c) => (
                          <div
                            key={c.name}
                            className="flex items-center gap-2.5 rounded-lg border border-[var(--border-premium)] bg-white px-2.5 py-2"
                          >
                            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--brand-blue-soft)] text-primary">
                              <MessageSquare className="size-3" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[11px] font-semibold text-foreground">
                                {c.name}
                              </div>
                              <div className="truncate text-[10px] text-muted-foreground">
                                {c.status}
                              </div>
                            </div>
                            <span
                              className={`size-1.5 shrink-0 rounded-full ${
                                c.color === "green"
                                  ? "bg-[oklch(0.55_0.18_150)]"
                                  : c.color === "primary"
                                  ? "bg-primary"
                                  : "bg-slate-300"
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

            {/* FLOATING CARDS — only 2, subtle, smaller */}
            <div className="absolute -left-3 top-24 hidden w-[180px] rounded-xl border border-[var(--border-premium)] bg-white/85 p-2.5 shadow-[0_20px_45px_-15px_oklch(0.20_0.08_258_/_0.30)] backdrop-blur-xl lg:block">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.95_0.05_150)] text-[oklch(0.45_0.15_150)]">
                  <ShieldCheck className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[10.5px] font-semibold text-foreground">
                    WhatsApp Oficial
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <span className="size-1 rounded-full bg-[oklch(0.55_0.18_150)]" />
                    Conectado
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 bottom-16 hidden w-[190px] rounded-xl border border-[var(--border-premium)] bg-white/85 p-2.5 shadow-[0_20px_45px_-15px_oklch(0.20_0.08_258_/_0.30)] backdrop-blur-xl lg:block">
              <div className="flex items-center justify-between">
                <div className="text-[8.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Lead quente
                </div>
                <Zap className="size-3 text-primary" />
              </div>
              <div className="mt-1 text-[10.5px] font-semibold text-foreground">
                IA classificou prioridade alta
              </div>
              <div className="mt-1.5 flex h-0.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "84%",
                    background:
                      "linear-gradient(90deg, oklch(0.55 0.22 258), oklch(0.65 0.18 250))",
                  }}
                />
              </div>
            </div>
          </div>

          {/* INSTITUTIONAL PILLARS — compact, integrated below mockup */}
          <div className="mx-auto mt-16 max-w-5xl md:mt-20">
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
              {[
                { icon: MessageSquare, label: "Atendimento centralizado" },
                { icon: Users, label: "Leads organizados" },
                { icon: Activity, label: "Follow-up monitorado" },
                { icon: Layers, label: "Gestão 360 em tempo real" },
              ].map((m) => (
                <div key={m.label} className="flex flex-col items-center text-center">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-[var(--border-premium)] bg-white/70 text-primary shadow-[var(--shadow-soft)] backdrop-blur">
                    <m.icon className="size-4" strokeWidth={2.2} />
                  </span>
                  <div className="font-display mt-2.5 text-[13px] font-semibold tracking-tight text-[oklch(0.16_0.04_258)] md:text-[13.5px]">
                    {m.label}
                  </div>
                </div>
              ))}
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

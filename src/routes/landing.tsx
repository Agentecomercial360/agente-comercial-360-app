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
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground lg:flex">
            <a href="#problema" className="hover:text-foreground transition-colors">Problema</a>
            <a href="#solucao" className="hover:text-foreground transition-colors">Solução</a>
            <a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#tecnologia" className="hover:text-foreground transition-colors">Tecnologia</a>
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

              <h1 className="font-display mt-7 text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[oklch(0.18_0.04_258)] md:text-[3.6rem] lg:text-[4.25rem] lg:leading-[1.02]">
                Centralize WhatsApp, IA e leads em uma{" "}
                <span className="text-primary">operação comercial inteligente</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                O Agente Comercial 360 organiza atendimentos, identifica oportunidades,
                distribui responsáveis e transforma conversas em dados para sua empresa
                vender com mais controle.
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
                <a href="#como-funciona">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full px-7 text-base sm:w-auto"
                  >
                    Ver como funciona
                  </Button>
                </a>
              </div>

              {/* trust bar */}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--border-premium)] pt-6 text-xs font-medium text-muted-foreground">
                {[
                  { icon: Bot, label: "IA para atendimento comercial" },
                  { icon: MessageSquare, label: "WhatsApp Cloud API" },
                  { icon: Users, label: "Leads organizados" },
                  { icon: Activity, label: "Relatórios em tempo real" },
                ].map((b) => (
                  <div key={b.label} className="inline-flex items-center gap-1.5">
                    <b.icon className="size-3.5 text-primary" />
                    {b.label}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — premium product mockup */}
            <div className="relative lg:-mr-4 xl:-mr-8">
              {/* single soft glow behind mockup */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] opacity-40 blur-3xl"
                style={{
                  background:
                    "radial-gradient(closest-side, var(--brand-blue-soft) 0%, transparent 75%)",
                }}
              />

              {/* hairline ring */}
              <div
                className="relative rounded-[1.75rem] p-[1px]"
                style={{
                  background:
                    "linear-gradient(160deg, oklch(0.55 0.22 258 / 0.30), oklch(0.55 0.22 258 / 0.04) 45%, transparent 75%)",
                }}
              >
                {/* browser frame */}
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
                                União Auto Peças
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
                        <div className="space-y-2.5 p-3">
                          <div className="flex items-end justify-between gap-2">
                            <div>
                              <div className="font-display text-sm font-bold tracking-tight">
                                Dashboard
                              </div>
                              <div className="text-[9px] text-muted-foreground">
                                Visão geral da operação comercial em tempo real.
                              </div>
                            </div>
                            <div className="hidden items-center gap-1 rounded-md border border-[var(--border-premium)] bg-white px-1.5 py-0.5 text-[9px] text-muted-foreground sm:flex">
                              Hoje
                            </div>
                          </div>

                          {/* KPI CARDS */}
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { icon: Headphones, label: "Atendimentos hoje", value: "128" },
                              { icon: TrendingUp, label: "Leads quentes", value: "24" },
                              { icon: MessageSquare, label: "Conversas abertas", value: "47" },
                              { icon: CheckCircle2, label: "Finalizados", value: "91" },
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
                                <div className="font-display mt-1 text-lg font-bold tracking-tight">
                                  {k.value}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Mini lista */}
                          <div className="rounded-lg border border-[var(--border-premium)] bg-white shadow-[var(--shadow-soft)]">
                            <div className="grid grid-cols-[1.4fr_1.4fr_0.9fr_0.5fr] gap-2 border-b border-[var(--border-premium)] px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                              <span>Cliente</span>
                              <span>Mensagem</span>
                              <span>Status</span>
                              <span className="text-right">Score</span>
                            </div>
                            {[
                              { c: "União Auto Peças", m: "Kit embreagem para Gol 1.6", s: "Em negociação", sc: 92, color: "amber" },
                              { c: "Marina Costa", m: "Orçamento freio dianteiro", s: "Aguardando", sc: 78, color: "blue" },
                            ].map((row) => (
                              <div key={row.c} className="grid grid-cols-[1.4fr_1.4fr_0.9fr_0.5fr] items-center gap-2 border-b border-[var(--border-premium)] px-2.5 py-2 last:border-0">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">
                                    {row.c[0]}
                                  </div>
                                  <div className="min-w-0 truncate text-[9px] font-semibold">
                                    {row.c}
                                  </div>
                                </div>
                                <div className="truncate text-[9px] text-muted-foreground">
                                  {row.m}
                                </div>
                                <div>
                                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${
                                    row.color === "amber"
                                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                      : "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                                  }`}>
                                    {row.s}
                                  </span>
                                </div>
                                <div className="text-right text-[10px] font-bold text-primary">
                                  {row.sc}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Resumo da IA — navy premium */}
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
                                  Oportunidade quente identificada. Follow-up comercial recomendado nas próximas 2h.
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

              {/* single floating badge — subtle premium accent */}
              <div className="absolute -left-4 bottom-10 hidden rounded-xl border border-[var(--border-premium)] bg-white/95 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur md:block">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <TrendingUp className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold">Lead quente · score 92</div>
                    <div className="text-[11px] text-muted-foreground">IA recomendou follow-up</div>
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
              Tudo que sua operação comercial precisa em um só lugar
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

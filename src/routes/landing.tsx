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
      <section id="top" className="relative overflow-hidden">
        {/* decorative gradients */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(70% 60% at 80% 0%, var(--brand-blue-soft) 0%, transparent 60%), radial-gradient(50% 50% at 10% 30%, var(--brand-blue-soft) 0%, transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] -z-10 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-brand)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-20%] left-[-10%] -z-10 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--gradient-brand)" }}
        />

        <div className="mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-premium)] bg-white px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)]">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                Plataforma SaaS de inteligência comercial
              </div>
              <h1 className="font-display mt-6 text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.025em] md:text-6xl lg:text-[4.25rem]">
                Transforme{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "var(--gradient-brand)" }}
                >
                  conversas em vendas
                </span>{" "}
                com inteligência comercial
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Centralize WhatsApp, leads, responsáveis, IA, base de conhecimento e
                relatórios em uma operação comercial organizada, escalável e pronta para
                automações.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#cta-final">
                  <Button size="lg" className="h-12 w-full gap-2 px-7 text-base shadow-[var(--shadow-premium)] sm:w-auto">
                    Solicitar demonstração <ArrowRight className="size-4" />
                  </Button>
                </a>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="h-12 w-full px-7 text-base sm:w-auto">
                    Entrar no painel
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {[
                  { icon: Bot, label: "IA ativa" },
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

            {/* RIGHT — dashboard mockup inspired by the real product */}
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.75rem] opacity-50 blur-3xl"
                style={{ background: "var(--gradient-brand)" }}
              />
              {/* browser frame */}
              <div
                className="relative rounded-[1.75rem] border border-[var(--border-premium)] bg-white p-2.5"
                style={{ boxShadow: "var(--shadow-premium)" }}
              >
                <div className="flex items-center justify-between px-3 pb-2 pt-1">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-400/80" />
                    <span className="size-2.5 rounded-full bg-amber-400/80" />
                    <span className="size-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="hidden rounded-md border border-[var(--border-premium)] bg-secondary/60 px-3 py-0.5 text-[10px] text-muted-foreground sm:block">
                    app.agentecomercial360.com/dashboard
                  </div>
                  <div className="size-2.5" />
                </div>

                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-blue-soft)] via-white to-[var(--brand-blue-soft)]">
                  {/* inner app shell: sidebar + content */}
                  <div className="grid grid-cols-[58px_1fr]">
                    {/* sidebar */}
                    <div className="flex flex-col items-center gap-3 border-r border-[var(--border-premium)] bg-white/60 py-4 backdrop-blur">
                      <div
                        className="flex size-8 items-center justify-center rounded-lg text-white"
                        style={{ background: "var(--gradient-brand)" }}
                      >
                        <Sparkles className="size-4" />
                      </div>
                      {[BarChart3, Headphones, MessageSquare, Users, Bot, BookOpen].map((I, i) => (
                        <div
                          key={i}
                          className={`flex size-8 items-center justify-center rounded-lg ${
                            i === 0
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <I className="size-4" />
                        </div>
                      ))}
                    </div>

                    {/* content */}
                    <div className="p-4 md:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Dashboard
                          </div>
                          <div className="font-display text-sm font-semibold tracking-tight">
                            União Auto Peças
                          </div>
                        </div>
                        <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 sm:flex">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Ao vivo
                        </div>
                      </div>

                      {/* KPI cards — mirror real dashboard */}
                      <div className="mt-4 grid grid-cols-2 gap-2.5">
                        {[
                          { icon: Headphones, label: "Atendimentos hoje", value: "128", delta: "+12%", up: true },
                          { icon: TrendingUp, label: "Leads quentes", value: "14", delta: "+3", up: true },
                          { icon: MessageSquare, label: "Conversas abertas", value: "26", delta: "-2", up: false },
                          { icon: Clock, label: "Sem resposta", value: "9", delta: "+1", up: false },
                        ].map((k) => (
                          <div
                            key={k.label}
                            className="rounded-xl border border-[var(--border-premium)] bg-white/95 p-2.5 shadow-[var(--shadow-soft)]"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--brand-blue-soft)] text-primary">
                                <k.icon className="size-3.5" />
                              </div>
                              <span
                                className={`text-[10px] font-medium ${
                                  k.up ? "text-emerald-600" : "text-rose-600"
                                }`}
                              >
                                {k.delta}
                              </span>
                            </div>
                            <div className="font-display mt-2 text-xl font-bold tracking-tight">
                              {k.value}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{k.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* chart + top leads */}
                      <div className="mt-2.5 grid grid-cols-5 gap-2.5">
                        <div className="col-span-2 rounded-xl border border-[var(--border-premium)] bg-white/95 p-2.5 shadow-[var(--shadow-soft)]">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                              <BarChart3 className="size-3 text-primary" /> Semana
                            </div>
                            <span className="text-[9px] text-muted-foreground">+18%</span>
                          </div>
                          <div className="flex h-16 items-end gap-1">
                            {[42, 68, 55, 88, 74, 50, 32].map((h, i) => (
                              <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                                <div
                                  className="w-full rounded-t-sm"
                                  style={{
                                    height: `${h}%`,
                                    background: "var(--gradient-brand)",
                                    opacity: 0.55 + i * 0.05,
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="mt-1 flex justify-between text-[8px] text-muted-foreground">
                            {["S","T","Q","Q","S","S","D"].map((d, i) => (
                              <span key={i}>{d}</span>
                            ))}
                          </div>
                        </div>

                        <div className="col-span-3 rounded-xl border border-[var(--border-premium)] bg-white/95 p-2.5 shadow-[var(--shadow-soft)]">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                              <TrendingUp className="size-3 text-primary" /> Top leads
                            </div>
                            <span className="text-[9px] text-muted-foreground">Hoje</span>
                          </div>
                          <div className="space-y-1.5">
                            {[
                              { n: "João Martins", t: "Kit embreagem", s: 92 },
                              { n: "Fernanda Lima", t: "Bateria 60Ah", s: 88 },
                              { n: "Pedro Henrique", t: "Amortecedor", s: 81 },
                            ].map((c) => (
                              <div key={c.n} className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
                                    {c.n[0]}
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-medium leading-tight text-foreground">
                                      {c.n}
                                    </div>
                                    <div className="text-[9px] leading-tight text-muted-foreground">
                                      {c.t}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-1 w-10 overflow-hidden rounded-full bg-secondary">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${c.s}%`,
                                        background: "var(--gradient-brand)",
                                      }}
                                    />
                                  </div>
                                  <span className="text-[9px] font-semibold text-primary">
                                    {c.s}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* IA summary strip */}
                      <div
                        className="mt-2.5 flex items-start gap-2 rounded-xl border border-primary/20 p-2.5"
                        style={{
                          background:
                            "linear-gradient(90deg, oklch(0.55 0.22 258 / 0.08), oklch(0.55 0.22 258 / 0.02))",
                        }}
                      >
                        <div
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-white"
                          style={{ background: "var(--gradient-brand)" }}
                        >
                          <Bot className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                            Resumo da IA
                            <span className="rounded bg-primary/10 px-1 py-px text-[8px] font-medium text-primary">
                              auto
                            </span>
                          </div>
                          <div className="truncate text-[10px] text-muted-foreground">
                            3 leads quentes aguardando retorno · priorize Fernanda Lima.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* floating badges */}
              <div className="absolute -left-4 top-[28%] hidden rounded-xl border border-[var(--border-premium)] bg-white px-3 py-2 shadow-[var(--shadow-card)] md:block">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold">Lead convertido</div>
                    <div className="text-[11px] text-muted-foreground">+ R$ 4.820</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-3 bottom-10 hidden rounded-xl border border-[var(--border-premium)] bg-white px-3 py-2 shadow-[var(--shadow-card)] md:block">
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className="flex size-8 items-center justify-center rounded-lg text-white"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    <Bot className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold">IA respondeu</div>
                    <div className="text-[11px] text-muted-foreground">12 conversas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* PROBLEMA */}
      <section id="problema" className="border-t border-[var(--border-premium)] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">
              <AlertTriangle className="size-3.5" /> Onde as vendas estão escapando
            </div>
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Empresas perdem vendas todos os dias por falhas operacionais
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Atendimento desorganizado custa caro. Geralmente o problema não é o time —
              é a falta de uma plataforma que conecte tudo.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Clock, title: "Demora no atendimento", text: "Mensagens sem resposta — e o cliente compra do concorrente." },
              { icon: FileWarning, title: "Leads sem follow-up", text: "Oportunidades quentes esfriam por falta de retomada." },
              { icon: Search, title: "Conversas espalhadas", text: "WhatsApp pessoal, e-mail e planilha — nada conversa." },
              { icon: AlertTriangle, title: "Falta de controle comercial", text: "Sem visibilidade do que cada responsável atende." },
              { icon: BarChart3, title: "Relatórios manuais", text: "Decisões no achismo, sem dados confiáveis em tempo real." },
              { icon: Users, title: "Equipe sem prioridade clara", text: "Cada um responde do seu jeito, sem padrão nem histórico." },
            ].map((p) => (
              <div
                key={p.title}
                className="group rounded-2xl border border-[var(--border-premium)] bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-transform group-hover:scale-110">
                  <p.icon className="size-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
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

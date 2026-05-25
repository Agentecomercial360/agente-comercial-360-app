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
  Stethoscope,
  Wrench,
  Store,
  Briefcase,
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
          "Centralize atendimentos, leads, conversas e relatórios em uma plataforma inteligente com IA, automações e integração com WhatsApp.",
      },
      {
        property: "og:title",
        content: "Agente Comercial 360 — Inteligência comercial em uma só plataforma",
      },
      {
        property: "og:description",
        content:
          "Transforme conversas em vendas. Atendimento, leads, responsáveis, IA, base de conhecimento e relatórios em um só lugar.",
      },
    ],
  }),
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-premium)] bg-[var(--topbar)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="#top" className="flex items-center gap-2">
            <img src={acLogo} alt="Agente Comercial 360" className="h-8 w-8 rounded-md" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Agente Comercial <span className="text-primary">360</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#problema" className="hover:text-foreground transition-colors">Problema</a>
            <a href="#solucao" className="hover:text-foreground transition-colors">Solução</a>
            <a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#tecnologia" className="hover:text-foreground transition-colors">Tecnologia</a>
            <a href="#para-quem" className="hover:text-foreground transition-colors">Para quem</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar no painel</Button>
            </Link>
            <a href="#cta-final">
              <Button size="sm" className="gap-1.5">
                Solicitar demo <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, var(--brand-blue-soft) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-brand)" }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-premium)] bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)]">
              <Sparkles className="size-3.5 text-primary" />
              Plataforma SaaS de inteligência comercial
            </div>
            <h1 className="font-display mt-6 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Transforme{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-brand)" }}
              >
                conversas em vendas
              </span>{" "}
              com inteligência comercial
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              O Agente Comercial 360 centraliza atendimentos, leads, responsáveis, base
              de conhecimento e relatórios em uma plataforma inteligente para empresas
              que querem vender com mais controle.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#cta-final">
                <Button size="lg" className="h-12 gap-2 px-6 text-base">
                  Solicitar demonstração <ArrowRight className="size-4" />
                </Button>
              </a>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-12 px-6 text-base">
                  Entrar no painel
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Multiempresa • Multiusuário • Dados isolados por empresa
            </div>
          </div>

          {/* Hero mock card */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div
              className="rounded-3xl border border-[var(--border-premium)] bg-white p-2"
              style={{ boxShadow: "var(--shadow-premium)" }}
            >
              <div className="rounded-2xl bg-[var(--brand-blue-soft)] p-6 md:p-10">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { icon: Headphones, label: "Atendimentos ativos", value: "128" },
                    { icon: Users, label: "Leads em negociação", value: "47" },
                    { icon: LineChart, label: "Conversão semanal", value: "+32%" },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className="rounded-xl border border-[var(--border-premium)] bg-white p-5"
                      style={{ boxShadow: "var(--shadow-soft)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                          <k.icon className="size-5" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{k.label}</div>
                          <div className="font-display text-2xl font-semibold">{k.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[var(--border-premium)] bg-white p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                      <MessageSquare className="size-4 text-primary" /> Conversas recentes
                    </div>
                    <div className="space-y-3 text-sm">
                      {["Maria S. — pedido peça #4421", "João P. — orçamento aprovado", "Carla R. — agendar visita"].map((t) => (
                        <div key={t} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                          <span className="text-foreground">{t}</span>
                          <span className="text-xs text-muted-foreground">há 2 min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border-premium)] bg-white p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                      <Bot className="size-4 text-primary" /> IA sugeriu próxima ação
                    </div>
                    <p className="text-sm text-muted-foreground">
                      “Fazer follow-up com 12 leads sem resposta há mais de 24h. Estimativa de
                      conversão adicional: <span className="font-medium text-foreground">+18%</span>.”
                    </p>
                    <Button size="sm" variant="secondary" className="mt-4 gap-1.5">
                      Ver sugestões <ArrowRight className="size-3.5" />
                    </Button>
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
            <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
              <AlertTriangle className="size-3.5" /> Onde as vendas estão escapando
            </div>
            <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Empresas perdem vendas todos os dias por falhas operacionais
            </h2>
            <p className="mt-4 text-muted-foreground">
              Atendimento desorganizado custa caro. E geralmente o problema não é o time —
              é a falta de uma plataforma que conecte tudo.
            </p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Clock, title: "Demora no atendimento", text: "Mensagens ficam sem resposta e o cliente compra do concorrente." },
              { icon: FileWarning, title: "Falta de follow-up", text: "Leads quentes esfriam por falta de retomada no momento certo." },
              { icon: Search, title: "Conversas espalhadas", text: "WhatsApp pessoal, e-mail, planilha — nada se conversa." },
              { icon: AlertTriangle, title: "Falta de controle comercial", text: "Sem visibilidade do que cada responsável está atendendo." },
              { icon: BarChart3, title: "Ausência de relatórios", text: "Decisões tomadas no achismo, sem dados confiáveis." },
              { icon: Users, title: "Time desalinhado", text: "Cada um responde do seu jeito, sem padrão nem histórico." },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-[var(--border-premium)] bg-white p-6 transition-shadow hover:shadow-[var(--shadow-card)]"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <p.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section id="solucao" className="relative overflow-hidden bg-[var(--brand-blue-soft)]/40">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <CheckCircle2 className="size-3.5" /> A solução
              </div>
              <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Tudo o que sua operação comercial precisa, em um só lugar
              </h2>
              <p className="mt-4 text-muted-foreground">
                O Agente Comercial 360 organiza pessoas, conversas e processos. Cada lead
                vira histórico. Cada atendimento vira dado. Cada conversa vira oportunidade.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Atendimentos centralizados e rastreáveis",
                  "Leads com etapa, responsável e próxima ação",
                  "Responsáveis por setor com filas inteligentes",
                  "IA que sugere respostas e prioridades",
                  "Base de conhecimento conectada ao agente",
                  "Relatórios em tempo real para decisão",
                ].map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-3xl border border-[var(--border-premium)] bg-white p-6 md:p-8"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Headphones, label: "Atendimentos" },
                  { icon: MessageSquare, label: "Conversas" },
                  { icon: Users, label: "Leads" },
                  { icon: Briefcase, label: "Responsáveis" },
                  { icon: Bot, label: "IA" },
                  { icon: BookOpen, label: "Base de conhecimento" },
                  { icon: BarChart3, label: "Relatórios" },
                  { icon: ShieldCheck, label: "Multiempresa" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="group rounded-xl border border-[var(--border-premium)] bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <b.icon className="size-4" />
                    </div>
                    <div className="mt-3 text-sm font-medium">{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="border-t border-[var(--border-premium)] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Zap className="size-3.5" /> Funcionalidades
            </div>
            <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Uma plataforma completa para vender com método
            </h2>
            <p className="mt-4 text-muted-foreground">
              Construída para times comerciais que querem previsibilidade e escala.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Headphones, title: "Atendimento inteligente", text: "Histórico completo, status e SLA por conversa." },
              { icon: Users, title: "Gestão de leads", text: "Etapas, próxima ação e dono claro para cada oportunidade." },
              { icon: Briefcase, title: "Responsáveis por setor", text: "Distribua conversas e leads por equipe automaticamente." },
              { icon: BookOpen, title: "Base de conhecimento", text: "Conteúdo curado que alimenta a IA e padroniza respostas." },
              { icon: BarChart3, title: "Dashboard em tempo real", text: "KPIs comerciais sempre à mão para gestão e time." },
              { icon: LineChart, title: "Relatórios gerenciais", text: "Performance por responsável, setor, etapa e período." },
              { icon: MessageSquare, title: "Pronto para WhatsApp oficial", text: "Arquitetura preparada para WhatsApp Cloud API." },
              { icon: Workflow, title: "Automações com n8n", text: "Workflows externos integráveis para escalar processos." },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border-premium)] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: "var(--gradient-brand)" }}
                />
                <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
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
              "radial-gradient(circle at 20% 20%, white 0, transparent 35%), radial-gradient(circle at 80% 80%, white 0, transparent 30%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Database className="size-3.5" /> Tecnologia
            </div>
            <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Construído sobre uma stack moderna, segura e escalável
            </h2>
            <p className="mt-4 text-white/80">
              Infraestrutura preparada para crescer com a sua operação.
            </p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Database, label: "Supabase" },
              { icon: Workflow, label: "n8n" },
              { icon: MessageSquare, label: "WhatsApp Cloud API" },
              { icon: Bot, label: "IA" },
              { icon: BookOpen, label: "RAG" },
              { icon: BarChart3, label: "Dashboards" },
            ].map((t) => (
              <div
                key={t.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur transition-colors hover:bg-white/15"
              >
                <t.icon className="size-6" />
                <span className="text-sm font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUEM */}
      <section id="para-quem" className="border-t border-[var(--border-premium)] bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Building2 className="size-3.5" /> Para quem é
            </div>
            <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Feito para empresas que vivem de atendimento
            </h2>
            <p className="mt-4 text-muted-foreground">
              Se a sua receita depende de conversar com cliente, o 360 foi feito pra você.
            </p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[
              { icon: Wrench, title: "Autopeças" },
              { icon: Store, title: "Comércios" },
              { icon: Stethoscope, title: "Clínicas" },
              { icon: Briefcase, title: "Prestadores de serviço" },
              { icon: Building2, title: "PMEs em geral" },
            ].map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-[var(--border-premium)] bg-white p-6 text-center transition-shadow hover:shadow-[var(--shadow-soft)]"
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                  <s.icon className="size-6" />
                </div>
                <div className="mt-4 font-display text-base font-semibold">{s.title}</div>
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
              background: "var(--gradient-brand)",
              boxShadow: "var(--shadow-premium)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, white 0, transparent 40%)",
              }}
            />
            <div className="relative mx-auto max-w-2xl text-white">
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
                Pronto para transformar seu atendimento em uma operação inteligente?
              </h2>
              <p className="mt-5 text-white/85 md:text-lg">
                Organize, automatize e escale o comercial da sua empresa com o Agente
                Comercial 360.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="mailto:contato@agentecomercial360.com?subject=Solicita%C3%A7%C3%A3o%20de%20demonstra%C3%A7%C3%A3o%20-%20Agente%20Comercial%20360">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 gap-2 px-6 text-base text-primary"
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

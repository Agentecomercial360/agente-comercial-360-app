import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Brain,
  CheckCircle2,
  DollarSign,
  Layers,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import heroWarehouse from "@/assets/hero-warehouse.jpg";

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

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Eyebrow({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ${
        dark
          ? "border-white/10 bg-white/5 text-white/70"
          : "border-blue-100 bg-blue-50 text-blue-700"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-amber-300" : "bg-blue-600"}`} />
      {children}
    </span>
  );
}

function IntelligenceVisual() {
  return (
    <div className="relative mx-auto hidden min-h-[500px] max-w-[560px] lg:block">
      <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 h-[245px] w-[245px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/10" />

      <div className="absolute left-1/2 top-1/2 z-20 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
            <img src={acLogo} alt="AC360" className="h-8 w-auto brightness-0 invert" />
          </div>
          <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.20em] text-white/50">
            Central AC360
          </p>
          <p className="mt-1 text-[11px] text-white/75">Dados → Prioridades</p>
        </div>
      </div>

      <div className="absolute left-0 top-12 z-30 w-52 rounded-2xl border border-white/10 bg-black/30 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/10 text-blue-200">
            <Radar className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">Feed</p>
            <p className="mt-1 text-[12px] font-semibold text-white">O que merece atenção</p>
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-32 z-30 w-52 rounded-2xl border border-white/10 bg-black/30 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-200">
            <DollarSign className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">Margem</p>
            <p className="mt-1 text-[12px] font-semibold text-white">Onde o lucro aperta</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 left-3 z-30 w-52 rounded-2xl border border-white/10 bg-black/30 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
            <Boxes className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">Estoque</p>
            <p className="mt-1 text-[12px] font-semibold text-white">Risco antes da ruptura</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-4 z-30 w-52 rounded-2xl border border-white/10 bg-black/30 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200">
            <Target className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">Ações</p>
            <p className="mt-1 text-[12px] font-semibold text-white">Onde agir primeiro</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPreview() {
  const bars = [34, 48, 42, 58, 54, 68, 80, 74];

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/40 bg-white shadow-2xl">
      <div className="flex h-12 items-center justify-between border-b border-slate-100 px-4">
        <div className="flex items-center gap-2">
          <img src={acLogo} alt="" className="h-5 w-auto" />
          <span className="text-[10px] font-bold text-slate-900">AC360 Intelligence</span>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-bold text-emerald-600">
          Sincronizado
        </span>
      </div>

      <div className="grid gap-3 bg-slate-50 p-4 sm:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-blue-900 to-blue-600 p-4 text-white">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-white/45">Visão executiva</p>
          <p className="mt-2 text-xl font-bold">Resultado no contexto.</p>
          <p className="mt-1 text-[9px] leading-relaxed text-white/55">
            Vendas, pedidos, margem e operação conectados.
          </p>
          <div className="mt-7 flex h-20 items-end gap-1.5">
            {bars.map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-t bg-white/75"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {["Pedidos", "Ticket", "Margem", "Estoque"].map((item, index) => (
            <div key={item} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  index === 0
                    ? "bg-blue-50 text-blue-600"
                    : index === 1
                      ? "bg-violet-50 text-violet-600"
                      : index === 2
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                }`}
              >
                {index === 0 ? (
                  <BarChart3 className="h-3.5 w-3.5" />
                ) : index === 1 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : index === 2 ? (
                  <DollarSign className="h-3.5 w-3.5" />
                ) : (
                  <Boxes className="h-3.5 w-3.5" />
                )}
              </span>
              <p className="mt-4 text-[9px] font-bold text-slate-900">{item}</p>
              <p className="mt-1 text-[8px] text-slate-400">Leitura da operação</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const diagnosticHref =
    "mailto:contato@agentecomercial360.com.br?subject=Quero um diagnóstico da minha operação no Mercado Livre";

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <section id="top" className="relative overflow-hidden bg-[#061838] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_34%,rgba(30,94,255,.28),transparent_28%)]" />

        <header className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <a href="#top" className="flex items-center gap-3">
            <img src={acLogo} alt="AC360" className="h-8 w-auto brightness-0 invert" />
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold leading-none">AC360</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/45">
                E-commerce Intelligence
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-[12px] font-semibold text-white/65 lg:flex">
            <a href="#beneficios" className="transition hover:text-white">Benefícios</a>
            <a href="#inteligencia" className="transition hover:text-white">Inteligência</a>
            <a href="#consultoria" className="transition hover:text-white">Consultoria</a>
            <a href="#plataforma" className="transition hover:text-white">Plataforma</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/ecommerce/login"
              className="hidden rounded-full px-4 py-2 text-[11px] font-semibold text-white/70 transition hover:text-white sm:inline-flex"
            >
              Login
            </Link>
            <a
              href={diagnosticHref}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[11px] font-bold text-[#0A1F44] transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Solicitar diagnóstico
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-6 pb-20 pt-12 lg:grid-cols-[.92fr_1.08fr] lg:px-10 lg:pb-24 lg:pt-16">
          <Reveal>
            <Eyebrow dark>Inteligência + consultoria para Mercado Livre</Eyebrow>

            <h1 className="mt-7 max-w-[720px] text-[48px] font-semibold leading-[.96] tracking-[-0.05em] text-white sm:text-[62px] lg:text-[72px]">
              Sua operação vende.
              <span className="mt-2 block text-[#73A7FF]">O AC360 mostra onde está o lucro.</span>
            </h1>

            <p className="mt-7 max-w-[640px] text-[16px] leading-relaxed text-white/65 sm:text-[17px]">
              Tecnologia proprietária e acompanhamento consultivo para transformar dados do Mercado
              Livre em prioridades claras, ações objetivas e resultado mensurável.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={diagnosticHref}
                className="inline-flex h-14 items-center justify-center rounded-full bg-blue-600 px-7 text-[13px] font-bold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Solicitar diagnóstico da operação
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>

              <a
                href="#beneficios"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 text-[13px] font-semibold text-white/85 transition hover:bg-white/10"
              >
                Conhecer o AC360
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-2">
              {["Margem", "Estoque", "Ads", "Feed Inteligente", "Ações", "Resultados"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9.5px] font-semibold text-white/50"
                >
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <IntelligenceVisual />
          </Reveal>
        </div>
      </section>

      <section id="plataforma" className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="text-center">
            <Eyebrow>Visão integrada</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-4xl text-[38px] font-semibold leading-tight tracking-[-0.035em] text-[#0A1F44] sm:text-[52px]">
              Tudo que importa na sua operação, conectado à mesma inteligência.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-500">
              Vendas, margem, estoque, anúncios e execução reunidos para facilitar decisão.
            </p>
          </Reveal>

          <Reveal delay={100} className="mt-12">
            <div className="overflow-hidden rounded-[34px] bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400 p-6 shadow-2xl sm:p-10 lg:p-12">
              <div className="grid items-center gap-10 lg:grid-cols-[.82fr_1.18fr]">
                <div className="text-white">
                  <p className="text-[11px] font-semibold text-white/70">AC360 Intelligence</p>
                  <h3 className="mt-4 max-w-xl text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[44px]">
                    Uma visão para decidir melhor.
                  </h3>
                  <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-white/70">
                    Em vez de navegar entre relatórios isolados, acompanhe os principais sinais da
                    operação em um contexto único.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {["Vendas", "Margem", "Estoque", "Anúncios", "Ads"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/50">
                      Benefício
                    </p>
                    <p className="mt-2 text-[13px] font-semibold text-white">
                      Menos tempo procurando dados. Mais clareza para decidir onde agir.
                    </p>
                  </div>
                </div>

                <DashboardPreview />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="inteligencia" className="bg-[#061838] py-24 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-4xl text-center">
            <Eyebrow dark>Inteligência aplicada</Eyebrow>
            <h2 className="mt-5 text-[38px] font-semibold leading-tight tracking-[-0.04em] sm:text-[54px]">
              Você não precisa de mais dados.
              <span className="block text-[#73A7FF]">Precisa saber o que fazer com eles.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/60">
              O AC360 transforma sinais da operação em prioridade, contexto e próximo passo.
            </p>
          </Reveal>

          <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-[30px] border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-200">
                    <Radar className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
                      Feed Inteligente
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">O que merece atenção primeiro</p>
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {[
                    ["Crítica", "Produto com custo pendente e faturamento relevante"],
                    ["Atenção", "Estoque entrando em zona de risco"],
                    ["Oportunidade", "Boa margem, vendas e estoque disponível"],
                  ].map(([label, description], index) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[8.5px] font-bold ${
                          index === 0
                            ? "bg-rose-400/10 text-rose-200"
                            : index === 1
                              ? "bg-amber-400/10 text-amber-200"
                              : "bg-emerald-400/10 text-emerald-200"
                        }`}
                      >
                        {label}
                      </span>
                      <p className="mt-3 text-[12px] font-medium text-white/80">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="h-full rounded-[30px] bg-white p-6 text-slate-900 shadow-2xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Brain className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Chat AC360
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">Pergunte à sua operação</p>
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  <div className="ml-auto max-w-[86%] rounded-[18px] rounded-br-md bg-slate-950 px-4 py-3 text-[12px] leading-relaxed text-white">
                    AC360, onde minha operação merece atenção hoje?
                  </div>

                  <div className="flex items-end gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <div className="max-w-[86%] rounded-[18px] rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 text-[11.5px] leading-relaxed text-slate-600">
                      Priorize primeiro os itens com custo pendente e maior faturamento associado.
                      Depois, revise estoque e campanhas dos produtos com margem confiável.
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {["Margem", "Estoque", "Ads", "Produtos", "Vendas"].map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 px-3 py-1.5 text-[9.5px] font-semibold text-slate-500">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="beneficios" className="bg-slate-50 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="text-center">
            <Eyebrow>Da informação ao resultado</Eyebrow>
            <h2 className="mx-auto mt-5 max-w-3xl text-[38px] font-semibold leading-tight tracking-[-0.035em] text-[#0A1F44] sm:text-[50px]">
              Quatro capacidades. Um ciclo de performance.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              {
                number: "01",
                title: "Enxergar",
                text: "Entenda vendas, margem, estoque, anúncios e resultado em uma visão executiva.",
                icon: BarChart3,
                style: "bg-white text-slate-900",
              },
              {
                number: "02",
                title: "Priorizar",
                text: "O Feed Inteligente identifica o que merece atenção primeiro e reduz dispersão.",
                icon: Radar,
                style: "bg-slate-950 text-white",
              },
              {
                number: "03",
                title: "Agir",
                text: "A Central de Ações converte problemas em próximos passos claros e ordenados por impacto.",
                icon: Target,
                style: "bg-gradient-to-br from-blue-800 to-blue-500 text-white",
              },
              {
                number: "04",
                title: "Medir",
                text: "Resultados das Ações fecha o ciclo e mostra o impacto observado depois da execução.",
                icon: TrendingUp,
                style: "bg-white text-slate-900",
              },
            ].map(({ number, title, text, icon: Icon, style }, index) => (
              <Reveal key={title} delay={index * 60}>
                <div className={`min-h-[280px] rounded-[30px] p-7 shadow-xl transition hover:-translate-y-1 sm:p-8 ${style}`}>
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-bold opacity-35">{number}</span>
                  </div>
                  <h3 className="mt-16 text-[28px] font-semibold tracking-[-0.03em]">{title}</h3>
                  <p className="mt-3 max-w-lg text-[13px] leading-relaxed opacity-65">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <Reveal>
            <Eyebrow>Margem e rentabilidade</Eyebrow>
            <h2 className="mt-5 text-[40px] font-semibold leading-[1.04] tracking-[-0.04em] text-[#0A1F44] sm:text-[52px]">
              Faturar mais não significa lucrar mais.
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              O AC360 conecta receita, custos, taxas e operação para ajudar a identificar onde a
              rentabilidade está saudável e onde precisa de correção.
            </p>

            <div className="mt-8 space-y-3">
              {[
                ["Custos pendentes", "Produtos que impedem uma leitura confiável de margem."],
                ["Margem comprometida", "Onde faturamento não está se convertendo em resultado."],
                ["Produtos rentáveis", "Itens com combinação saudável de venda, margem e estoque."],
              ].map(([title, text]) => (
                <div key={title} className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-[12px] font-bold text-slate-900">{title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="rounded-[32px] bg-blue-50 p-6 shadow-xl">
              <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">
                      Leitura de rentabilidade
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">Resultado por produto</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    ["Receita", "Disponível"],
                    ["Custos", "Validar"],
                    ["Margem", "Confiável"],
                  ].map(([title, value], index) => (
                    <div
                      key={title}
                      className={`rounded-2xl p-4 ${
                        index === 0
                          ? "bg-blue-50"
                          : index === 1
                            ? "bg-amber-50"
                            : "bg-emerald-50"
                      }`}
                    >
                      <p className="text-[8.5px] font-bold uppercase tracking-[0.10em] text-slate-400">
                        {title}
                      </p>
                      <p className="mt-2 text-[13px] font-bold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="grid overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
              <div className="relative min-h-[420px] overflow-hidden">
                <img src={heroWarehouse} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-slate-950/60 px-4 py-3 text-white backdrop-blur">
                  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/50">
                    Estoque + vendas
                  </p>
                  <p className="mt-1 text-[12px] font-semibold">Antecipe risco antes da ruptura.</p>
                </div>
              </div>

              <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                <Eyebrow>Estoque e oportunidade</Eyebrow>
                <h2 className="mt-5 text-[36px] font-semibold leading-[1.05] tracking-[-0.035em] text-[#0A1F44] sm:text-[46px]">
                  Antecipe problemas antes que eles virem perda de venda.
                </h2>
                <p className="mt-5 text-[14px] leading-relaxed text-slate-500">
                  Cruze ritmo de vendas e disponibilidade para identificar itens que precisam de
                  proteção, reposição ou atenção comercial.
                </p>

                <div className="mt-7 rounded-2xl bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Brain className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                        AC360 interpreta
                      </p>
                      <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-slate-900">
                        Produto mantém ritmo de vendas, mas o estoque disponível entrou em zona de atenção.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="consultoria" className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-4xl text-center">
            <Eyebrow>Consultoria + tecnologia proprietária</Eyebrow>
            <h2 className="mt-5 text-[38px] font-semibold leading-tight tracking-[-0.04em] text-[#0A1F44] sm:text-[52px]">
              Tecnologia mostra o caminho.
              <span className="block text-blue-600">A consultoria ajuda a transformar isso em execução.</span>
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-[30px] bg-slate-950 p-7 text-white shadow-xl sm:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                  <Layers className="h-5 w-5" />
                </span>
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Tecnologia AC360
                </p>
                <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">Diagnóstico e prioridade.</h3>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {["Visão executiva", "Feed Inteligente", "Central de Ações", "Resultados", "Margem", "Estoque"].map((item) => (
                    <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[10.5px] font-semibold text-white/75">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="h-full rounded-[30px] border border-slate-200 bg-slate-50 p-7 shadow-xl sm:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Brain className="h-5 w-5" />
                </span>
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Consultoria
                </p>
                <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-slate-900">
                  Direcionamento e acompanhamento.
                </h3>
                <div className="mt-6 space-y-3">
                  {[
                    "Leitura da operação",
                    "Definição de prioridades",
                    "Plano de ação",
                    "Acompanhamento de performance",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span className="text-[11px] font-semibold text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 lg:px-10">
        <Reveal className="mx-auto max-w-7xl">
          <div className="rounded-[36px] bg-[#061838] px-6 py-16 text-center text-white shadow-2xl sm:px-10 sm:py-20">
            <Eyebrow dark>Próximo passo</Eyebrow>
            <h2 className="mx-auto mt-6 max-w-4xl text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[58px]">
              Pare de administrar sua operação olhando para trás.
              <span className="block text-[#73A7FF]">Saiba onde agir agora.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[14px] leading-relaxed text-white/60">
              Descubra onde sua operação no Mercado Livre pode melhorar margem, eficiência e resultado.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={diagnosticHref}
                className="inline-flex h-14 items-center justify-center rounded-full bg-blue-600 px-7 text-[13px] font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Solicitar diagnóstico da minha operação
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <Link
                to="/ecommerce/login"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 text-[13px] font-semibold text-white/80 transition hover:bg-white/10"
              >
                Entrar no painel
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <img src={acLogo} alt="AC360" className="h-7 w-auto" />
            <div>
              <p className="text-[11px] font-bold text-slate-900">AC360 E-commerce Intelligence</p>
              <p className="mt-0.5 text-[9.5px] text-slate-400">
                Inteligência e performance para operações no Mercado Livre.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[10px] font-semibold text-slate-400">
            <a href="#beneficios" className="transition hover:text-blue-600">Benefícios</a>
            <a href="#consultoria" className="transition hover:text-blue-600">Consultoria</a>
            <Link to="/ecommerce/login" className="transition hover:text-blue-600">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

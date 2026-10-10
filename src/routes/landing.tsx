import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  DollarSign,
  ImagePlus,
  Layers3,
  MessageSquare,
  PackageSearch,
  Radar,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  WandSparkles,
  Zap,
} from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import heroWarehouse from "@/assets/hero-warehouse.jpg";
import { Button } from "@/components/ui/button";

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

function SectionEyebrow({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] ${
        dark
          ? "border-white/12 bg-white/[0.06] text-white/70"
          : "border-blue-100 bg-blue-50 text-[#1E5EFF]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-[#F5C842]" : "bg-[#1E5EFF]"}`} />
      {children}
    </div>
  );
}

function IntelligenceOrbit() {
  const cards = [
    {
      label: "Feed Inteligente",
      value: "O que merece atenção",
      icon: Radar,
      className: "left-0 top-8",
      accent: "text-blue-200 bg-blue-400/10",
    },
    {
      label: "Margem",
      value: "Onde o lucro aperta",
      icon: DollarSign,
      className: "right-0 top-28",
      accent: "text-amber-200 bg-amber-400/10",
    },
    {
      label: "Estoque",
      value: "Risco antes da ruptura",
      icon: Boxes,
      className: "left-3 bottom-20",
      accent: "text-cyan-200 bg-cyan-400/10",
    },
    {
      label: "Ads",
      value: "Onde escalar ou corrigir",
      icon: Target,
      className: "right-2 bottom-8",
      accent: "text-fuchsia-200 bg-fuchsia-400/10",
    },
  ];

  return (
    <div className="relative mx-auto hidden min-h-[520px] max-w-[560px] lg:block">
      <style>{`
        @keyframes acFloatA {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(7px,-9px,0); }
        }
        @keyframes acFloatB {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(-8px,8px,0); }
        }
        @keyframes acPulse {
          0%,100% { opacity:.35; transform:scale(1); }
          50% { opacity:.7; transform:scale(1.035); }
        }
      `}</style>

      <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" style={{ animation: "acPulse 5s ease-in-out infinite" }} />
      <div className="absolute left-1/2 top-1/2 h-[245px] w-[245px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-200/[0.09]" />

      <div className="absolute left-1/2 top-1/2 z-20 flex h-[176px] w-[176px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] shadow-[0_30px_90px_-25px_rgba(0,0,0,.8)] backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.08]">
            <img src={acLogo} alt="AC360" className="h-8 w-auto brightness-0 invert" />
          </div>
          <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">
            Central AC360
          </p>
          <p className="mt-1 text-[11px] font-medium text-white/75">Dados → Prioridades</p>
        </div>
      </div>

      {cards.map(({ label, value, icon: Icon, className, accent }, index) => (
        <div
          key={label}
          className={`absolute z-30 w-[214px] rounded-[20px] border border-white/12 bg-black/35 p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,.9)] backdrop-blur-xl ${className}`}
          style={{
            animation: `${index % 2 === 0 ? "acFloatA" : "acFloatB"} ${6 + index * 0.6}s ease-in-out infinite`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-white/38">
                {label}
              </p>
              <p className="mt-1 text-[12.5px] font-semibold leading-snug text-white">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniDashboard() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/40 bg-white shadow-[0_35px_90px_-46px_rgba(5,26,74,.65)]">
      <div className="flex h-12 items-center justify-between border-b border-slate-100 px-4">
        <div className="flex items-center gap-2">
          <img src={acLogo} alt="" className="h-5 w-auto" />
          <span className="text-[10px] font-bold text-[#0A1F44]">AC360 Intelligence</span>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-bold text-emerald-600">
          Sincronizado
        </span>
      </div>

      <div className="grid gap-3 bg-[#F7F9FC] p-4 sm:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl bg-gradient-to-br from-[#071B45] via-[#0F3B87] to-[#1E5EFF] p-4 text-white">
          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/45">
            Faturamento
          </p>
          <p className="mt-2 text-2xl font-bold">Visão consolidada</p>
          <p className="mt-1 text-[9.5px] leading-relaxed text-white/55">
            Vendas, pedidos, margem e resultado no mesmo contexto.
          </p>
          <div className="mt-7 flex h-20 items-end gap-1.5">
            {[32, 46, 40, 58, 52, 70, 82, 76].map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-t-md bg-white/75"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ["Pedidos", "Ritmo"],
            ["Ticket", "Valor"],
            ["Margem", "Lucro"],
            ["Estoque", "Risco"],
          ].map(([title, subtitle], index) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
              <div
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
              </div>
              <p className="mt-4 text-[9px] font-bold text-[#0A1F44]">{title}</p>
              <p className="mt-1 text-[8px] text-slate-400">{subtitle} da operação</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConsultationCard() {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-50px_rgba(10,31,68,.55)] sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#1E5EFF]">
          <BrainCircuit className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Inteligência consultiva
          </p>
          <p className="mt-1 text-sm font-bold text-[#0A1F44]">Pergunte à sua operação</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="ml-auto max-w-[85%] rounded-[18px] rounded-br-md bg-[#0A1F44] px-4 py-3 text-[12px] leading-relaxed text-white">
          AC360, onde minha operação merece atenção hoje?
        </div>

        <div className="flex items-end gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4C87FF] to-[#1E5EFF] text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="max-w-[86%] rounded-[18px] rounded-bl-md border border-slate-200 bg-[#F8FAFD] px-4 py-3 text-[11.5px] leading-relaxed text-slate-600">
            Priorize primeiro os itens com custo pendente e maior faturamento associado. Depois,
            revise estoque e campanhas dos produtos que já possuem margem confiável.
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["Margem", "Estoque", "Ads", "Produtos", "Vendas"].map((item) => (
          <span
            key={item}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9.5px] font-semibold text-slate-500"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function LandingPage() {
  const mailto =
    "mailto:contato@agentecomercial360.com.br?subject=Quero um diagnóstico da minha operação no Mercado Livre";

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* HERO */}
      <section id="top" className="relative overflow-hidden bg-[#061838] text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle at 76% 34%, rgba(30,94,255,.28), transparent 28%), radial-gradient(circle at 52% 75%, rgba(56,189,248,.08), transparent 24%)",
          }}
        />

        <header className="relative z-40 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <a href="#top" className="flex items-center gap-3">
            <img src={acLogo} alt="AC360" className="h-8 w-auto brightness-0 invert" />
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold leading-none">AC360</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/45">
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
              href={mailto}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[11px] font-bold text-[#0A1F44] transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Solicitar diagnóstico
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-6 pb-20 pt-12 lg:grid-cols-[.92fr_1.08fr] lg:px-10 lg:pb-24 lg:pt-16">
          <Reveal>
            <SectionEyebrow dark>Inteligência + consultoria para Mercado Livre</SectionEyebrow>

            <h1 className="mt-7 max-w-[720px] text-[48px] font-semibold leading-[.96] tracking-[-0.05em] text-white sm:text-[62px] lg:text-[72px]">
              Sua operação vende.
              <span className="mt-2 block text-[#73A7FF]">O AC360 mostra onde está o lucro.</span>
            </h1>

            <p className="mt-7 max-w-[640px] text-[16px] leading-relaxed text-white/62 sm:text-[17px]">
              Tecnologia proprietária e acompanhamento consultivo para transformar dados do Mercado
              Livre em prioridades claras, ações objetivas e resultado mensurável.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={mailto}>
                <Button className="h-13 rounded-full bg-[#1E5EFF] px-7 text-[13px] font-bold text-white shadow-lg shadow-blue-950/30 hover:bg-[#2A68FF]">
                  Solicitar diagnóstico da operação
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>

              <a
                href="#beneficios"
                className="inline-flex h-13 items-center justify-center rounded-full border border-white/14 bg-white/[0.05] px-7 text-[13px] font-semibold text-white/82 backdrop-blur transition hover:bg-white/[0.09]"
              >
                Conhecer o AC360
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-2">
              {["Margem", "Estoque", "Ads", "Feed Inteligente", "Ações", "Resultados"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[9.5px] font-semibold text-white/48"
                >
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={130}>
            <IntelligenceOrbit />
          </Reveal>
        </div>
      </section>

      {/* CONEXÃO */}
      <section id="plataforma" className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="text-center">
            <SectionEyebrow>Visão integrada</SectionEyebrow>
            <h2 className="mx-auto mt-5 max-w-4xl text-[38px] font-semibold leading-tight tracking-[-0.035em] text-[#0A1F44] sm:text-[52px]">
              Tudo que importa na sua operação, conectado à mesma inteligência.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-500">
              O AC360 reúne os sinais que realmente influenciam a decisão: vendas, margem, estoque,
              anúncios e execução.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-12">
            <div className="overflow-hidden rounded-[34px] bg-gradient-to-br from-[#0B3B8E] via-[#1E5EFF] to-[#5D94F0] p-6 shadow-[0_38px_90px_-52px_rgba(30,94,255,.75)] sm:p-10 lg:p-12">
              <div className="grid items-center gap-10 lg:grid-cols-[.82fr_1.18fr]">
                <div className="text-white">
                  <p className="text-[11px] font-semibold text-white/70">AC360 Intelligence</p>
                  <h3 className="mt-4 max-w-xl text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[44px]">
                    Uma visão para decidir melhor.
                  </h3>
                  <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-white/68">
                    Em vez de navegar entre relatórios isolados, acompanhe a operação em um contexto
                    único e encontre rapidamente o que precisa de atenção.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {["Vendas", "Margem", "Estoque", "Anúncios", "Ads"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/18 bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold text-white/85"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/14 bg-white/[0.08] p-4 backdrop-blur">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                      O objetivo
                    </p>
                    <p className="mt-2 text-[13px] font-semibold leading-relaxed text-white">
                      Menos tempo procurando dados. Mais clareza para decidir onde agir.
                    </p>
                  </div>
                </div>

                <MiniDashboard />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* INTELIGÊNCIA */}
      <section id="inteligencia" className="relative overflow-hidden bg-[#061838] py-24 text-white sm:py-28">
        <div
          aria-hidden
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 74% 46%, rgba(30,94,255,.20), transparent 26%), radial-gradient(circle at 20% 20%, rgba(56,189,248,.06), transparent 22%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-4xl text-center">
            <SectionEyebrow dark>Inteligência aplicada</SectionEyebrow>
            <h2 className="mt-5 text-[38px] font-semibold leading-tight tracking-[-0.04em] sm:text-[54px]">
              Você não precisa de mais dados.
              <span className="block text-[#73A7FF]">Precisa saber o que fazer com eles.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/58">
              O AC360 transforma sinais da operação em prioridade, contexto e próximo passo.
            </p>
          </Reveal>

          <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-[.94fr_1.06fr]">
            <Reveal>
              <div className="h-full rounded-[30px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-200">
                    <Radar className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/38">
                      Feed Inteligente
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">O que merece atenção primeiro</p>
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {[
                    ["Crítica", "Produto com custo pendente e faturamento relevante", "Resolver primeiro"],
                    ["Atenção", "Estoque entrando em zona de risco", "Planejar reposição"],
                    ["Oportunidade", "Boa margem + vendas + estoque disponível", "Avaliar escala"],
                  ].map(([status, text, action], index) => (
                    <div
                      key={status}
                      className="rounded-2xl border border-white/10 bg-black/12 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[8.5px] font-bold ${
                            index === 0
                              ? "bg-rose-400/12 text-rose-200"
                              : index === 1
                                ? "bg-amber-400/12 text-amber-200"
                                : "bg-emerald-400/12 text-emerald-200"
                          }`}
                        >
                          {status}
                        </span>
                        <span className="text-[9px] font-semibold text-white/40">{action}</span>
                      </div>
                      <p className="mt-3 text-[12px] font-medium leading-relaxed text-white/78">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <ConsultationCard />
            </Reveal>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="bg-[#F6F8FC] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="text-center">
            <SectionEyebrow>Da informação ao resultado</SectionEyebrow>
            <h2 className="mx-auto mt-5 max-w-3xl text-[38px] font-semibold leading-tight tracking-[-0.035em] text-[#0A1F44] sm:text-[50px]">
              Quatro capacidades. Um ciclo de performance.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              {
                n: "01",
                title: "Enxergar",
                text: "Entenda vendas, margem, estoque, anúncios e resultado em uma visão executiva.",
                icon: BarChart3,
                style: "bg-white text-[#0A1F44]",
                iconStyle: "bg-blue-50 text-blue-600",
              },
              {
                n: "02",
                title: "Priorizar",
                text: "O Feed Inteligente identifica o que merece atenção primeiro e reduz dispersão.",
                icon: Radar,
                style: "bg-[#0A1F44] text-white",
                iconStyle: "bg-white/10 text-blue-200",
              },
              {
                n: "03",
                title: "Agir",
                text: "A Central de Ações converte problemas em próximos passos claros e ordenados por impacto.",
                icon: Target,
                style: "bg-gradient-to-br from-[#0B3B8E] to-[#1E5EFF] text-white",
                iconStyle: "bg-white/10 text-white",
              },
              {
                n: "04",
                title: "Medir",
                text: "Resultados das Ações fecha o ciclo e mostra o impacto observado depois da execução.",
                icon: TrendingUp,
                style: "bg-white text-[#0A1F44]",
                iconStyle: "bg-emerald-50 text-emerald-600",
              },
            ].map(({ n, title, text, icon: Icon, style, iconStyle }, index) => (
              <Reveal key={title} delay={index * 70}>
                <div
                  className={`group min-h-[290px] rounded-[30px] p-7 shadow-[0_24px_60px_-46px_rgba(10,31,68,.45)] transition duration-300 hover:-translate-y-1 sm:p-8 ${style}`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconStyle}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-bold opacity-35">{n}</span>
                  </div>
                  <h3 className="mt-16 text-[28px] font-semibold tracking-[-0.03em]">{title}</h3>
                  <p className="mt-3 max-w-lg text-[13px] leading-relaxed opacity-62">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MARGEM */}
      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <Reveal>
              <SectionEyebrow>Margem e rentabilidade</SectionEyebrow>
              <h2 className="mt-5 text-[40px] font-semibold leading-[1.04] tracking-[-0.04em] text-[#0A1F44] sm:text-[52px]">
                Faturar mais não significa lucrar mais.
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-500">
                O AC360 conecta receita, custos, taxas e operação para ajudar você a identificar onde
                a rentabilidade está saudável e onde precisa de correção.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  ["Custos pendentes", "Encontre produtos que ainda impedem uma leitura confiável de margem."],
                  ["Margem comprometida", "Identifique onde o faturamento não está se convertendo em resultado."],
                  ["Produtos rentáveis", "Priorize itens que combinam venda, margem e capacidade de escala."],
                ].map(([title, text]) => (
                  <div key={title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1E5EFF]" />
                    <div>
                      <p className="text-[12px] font-bold text-[#0A1F44]">{title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-[32px] bg-gradient-to-br from-[#EEF4FF] via-white to-[#F7FAFF] p-5 shadow-[0_30px_80px_-52px_rgba(30,94,255,.45)] sm:p-7">
                <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Leitura de rentabilidade
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#0A1F44]">Resultado por produto</p>
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
                        <p className="text-[8.5px] font-bold uppercase tracking-[0.11em] text-slate-400">
                          {title}
                        </p>
                        <p className="mt-2 text-[13px] font-bold text-[#0A1F44]">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#F7F9FC] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-slate-500">Produtos que exigem atenção</p>
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-bold text-rose-600">
                        Priorizar
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      {[72, 54, 38].map((width, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#1E5EFF]" />
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-[#1E5EFF]" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ESTOQUE */}
      <section className="bg-[#F6F8FC] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="grid overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_30px_80px_-52px_rgba(10,31,68,.48)] lg:grid-cols-[1fr_1fr]">
              <div className="relative min-h-[420px] overflow-hidden">
                <img src={heroWarehouse} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061838]/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-[#061838]/60 px-4 py-3 text-white backdrop-blur">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">
                    Estoque + vendas
                  </p>
                  <p className="mt-1 text-[12px] font-semibold">Antecipe risco antes da ruptura.</p>
                </div>
              </div>

              <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                <SectionEyebrow>Estoque e oportunidade</SectionEyebrow>
                <h2 className="mt-5 text-[36px] font-semibold leading-[1.05] tracking-[-0.035em] text-[#0A1F44] sm:text-[46px]">
                  Antecipe problemas antes que eles virem perda de venda.
                </h2>
                <p className="mt-5 text-[14px] leading-relaxed text-slate-500">
                  Cruze ritmo de vendas e disponibilidade para identificar itens que precisam de
                  proteção, reposição ou atenção comercial.
                </p>

                <div className="mt-7 rounded-2xl bg-[#EEF4FF] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1E5EFF] shadow-sm">
                      <BrainCircuit className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#1E5EFF]">
                        AC360 interpreta
                      </p>
                      <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#0A1F44]">
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

      {/* CONSULTORIA */}
      <section id="consultoria" className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-4xl text-center">
            <SectionEyebrow>Consultoria + tecnologia proprietária</SectionEyebrow>
            <h2 className="mt-5 text-[38px] font-semibold leading-tight tracking-[-0.04em] text-[#0A1F44] sm:text-[52px]">
              Tecnologia mostra o caminho.
              <span className="block text-[#1E5EFF]">A consultoria ajuda a transformar isso em execução.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-500">
              O AC360 foi pensado para unir leitura operacional, direcionamento e acompanhamento de
              performance em uma única metodologia.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-[30px] bg-[#0A1F44] p-7 text-white shadow-[0_28px_70px_-46px_rgba(10,31,68,.7)] sm:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                  <Layers3 className="h-5 w-5" />
                </span>
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                  Tecnologia AC360
                </p>
                <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">Diagnóstico e prioridade.</h3>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {["Visão executiva", "Feed Inteligente", "Central de Ações", "Resultados", "Margem", "Estoque"].map((item) => (
                    <div key={item} className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-[10.5px] font-semibold text-white/72">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="h-full rounded-[30px] border border-slate-200 bg-[#F8FAFD] p-7 shadow-[0_28px_70px_-50px_rgba(10,31,68,.45)] sm:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#1E5EFF]">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Consultoria
                </p>
                <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[#0A1F44]">
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
                      <CheckCircle2 className="h-4 w-4 text-[#1E5EFF]" />
                      <span className="text-[11px] font-semibold text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* STUDIO */}
      <section className="bg-[#F6F8FC] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <Reveal>
              <SectionEyebrow>Studio de Imagens IA</SectionEyebrow>
              <h2 className="mt-5 text-[38px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#0A1F44] sm:text-[48px]">
                Seu produto também precisa vender na imagem.
              </h2>
              <p className="mt-5 text-[14px] leading-relaxed text-slate-500">
                Trabalhe imagens de produtos dentro do contexto da operação e prepare novas versões
                para melhorar apresentação, consistência e conversão.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {["Fundo branco", "Lifestyle", "Melhoria visual", "Variações"].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_32px_80px_-50px_rgba(10,31,68,.5)]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E5EFF] to-[#0A1F44] text-white">
                      <WandSparkles className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-[12px] font-bold text-[#0A1F44]">Studio de Imagens IA</p>
                      <p className="mt-0.5 text-[9.5px] text-slate-400">Produto selecionado</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FFF7D6] px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#9A6B00]">
                    AC360 Studio
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[.7fr_1.3fr]">
                  <div className="rounded-2xl border border-slate-200 bg-[#F8FAFD] p-3">
                    <div className="flex aspect-square items-center justify-center rounded-xl bg-white">
                      <ImagePlus className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="mt-3 text-[10px] font-bold text-[#0A1F44]">Imagem original</p>
                    <p className="mt-1 text-[9px] text-slate-400">Anúncio conectado</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-[#F8FAFD] p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#1E5EFF]" />
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Instrução
                      </p>
                    </div>
                    <div className="mt-4 rounded-2xl bg-[#0A1F44] px-4 py-3 text-[11px] leading-relaxed text-white">
                      Crie uma versão mais limpa, com fundo claro e destaque profissional para o produto.
                    </div>
                    <div className="mt-4 flex gap-2">
                      <span className="rounded-full bg-white px-3 py-1.5 text-[9px] font-semibold text-slate-500 shadow-sm">
                        Editar
                      </span>
                      <span className="rounded-full bg-[#1E5EFF] px-3 py-1.5 text-[9px] font-semibold text-white">
                        Gerar versão
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-6 py-20 lg:px-10">
        <Reveal className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[36px] bg-[#061838] px-6 py-16 text-center text-white shadow-[0_35px_90px_-50px_rgba(6,24,56,.75)] sm:px-10 sm:py-20">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 70% 20%, rgba(30,94,255,.25), transparent 26%), radial-gradient(circle at 30% 90%, rgba(56,189,248,.07), transparent 24%)",
              }}
            />
            <div className="relative">
              <SectionEyebrow dark>Próximo passo</SectionEyebrow>
              <h2 className="mx-auto mt-6 max-w-4xl text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[58px]">
                Pare de administrar sua operação olhando para trás.
                <span className="block text-[#73A7FF]">Saiba onde agir agora.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-[14px] leading-relaxed text-white/58">
                Descubra onde sua operação no Mercado Livre pode melhorar margem, eficiência e resultado.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href={mailto}>
                  <Button className="h-13 rounded-full bg-[#1E5EFF] px-7 text-[13px] font-bold text-white shadow-lg shadow-blue-950/30 hover:bg-[#2A68FF]">
                    Solicitar diagnóstico da minha operação
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Link
                  to="/ecommerce/login"
                  className="inline-flex h-13 items-center justify-center rounded-full border border-white/14 bg-white/[0.05] px-7 text-[13px] font-semibold text-white/78 transition hover:bg-white/[0.09]"
                >
                  Entrar no painel
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <img src={acLogo} alt="AC360" className="h-7 w-auto" />
            <div>
              <p className="text-[11px] font-bold text-[#0A1F44]">AC360 E-commerce Intelligence</p>
              <p className="mt-0.5 text-[9.5px] text-slate-400">
                Inteligência e performance para operações no Mercado Livre.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[10px] font-semibold text-slate-400">
            <a href="#beneficios" className="transition hover:text-[#1E5EFF]">Benefícios</a>
            <a href="#consultoria" className="transition hover:text-[#1E5EFF]">Consultoria</a>
            <Link to="/ecommerce/login" className="transition hover:text-[#1E5EFF]">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

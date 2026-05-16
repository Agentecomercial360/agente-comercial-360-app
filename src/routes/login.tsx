import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  MessageCircle,
  AtSign,
  Users,
  TrendingUp,
  Wallet,
  BarChart3,
} from "lucide-react";
import acLogo from "@/assets/ac-logo.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login | Agente Comercial 360" },
      {
        name: "description",
        content:
          "Acesse o Agente Comercial 360 — centralize atendimentos, leads, conversas e processos comerciais em uma única plataforma inteligente.",
      },
    ],
  }),
});

const featureCards = [
  { icon: MessageCircle, title: "WhatsApp", desc: "Conversas centralizadas" },
  { icon: AtSign, title: "E-mail", desc: "Caixa unificada" },
  { icon: Users, title: "CRM", desc: "Visão 360º do cliente" },
  { icon: TrendingUp, title: "Vendas", desc: "Funil em tempo real" },
  { icon: Wallet, title: "Financeiro", desc: "Fluxo de caixa" },
  { icon: BarChart3, title: "Relatórios", desc: "Indicadores que importam" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate({ to: "/dashboard" });
    }, 500);
  };

  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1000px 500px at -10% -20%, oklch(0.55 0.22 258 / 0.10), transparent 60%), radial-gradient(800px 400px at 110% 120%, oklch(0.28 0.14 262 / 0.10), transparent 60%)",
        }}
      />

      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT — Login */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-10 flex items-center gap-3">
              <img
                src={acLogo}
                alt="Agente Comercial 360"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <div className="leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Agente Comercial
                </p>
                <p className="text-lg font-bold text-foreground">
                  360<span className="text-primary">.</span>
                </p>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Acesse o <span className="text-primary">Agente Comercial 360</span>
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Centralize atendimentos, leads, conversas e processos comerciais em
              uma única plataforma inteligente.
            </p>

            {/* Card */}
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-[0_10px_40px_-12px_oklch(0.28_0.14_262_/_0.18)] sm:p-7">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="voce@empresa.com"
                      className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Senha
                    </label>
                    <a href="#" className="text-xs font-medium text-primary hover:underline">
                      Esqueci minha senha
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-12 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative h-12 w-full overflow-hidden rounded-xl text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.55_0.22_258_/_0.55)] transition active:scale-[0.99] disabled:opacity-70"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {loading ? "Entrando..." : "Entrar no painel"}
                </button>

                <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary/70" />
                  Acesso restrito para empresas cadastradas.
                </p>
              </form>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Agente Comercial 360
            </p>
          </div>
        </section>

        {/* RIGHT — Brand panel with feature cards */}
        <aside
          className="relative hidden overflow-hidden lg:block"
          style={{ background: "var(--gradient-brand)" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div
            aria-hidden
            className="absolute -right-32 -top-32 h-96 w-96 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, oklch(1 0 0 / 0.18), transparent)",
            }}
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, oklch(1 0 0 / 0.15), transparent)",
            }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
            <div className="flex items-center gap-2 text-sm font-medium text-white/85">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Plataforma operando · 99.98% uptime
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-bold leading-[1.15] tracking-tight xl:text-4xl">
                O poder de uma operação inteligente em um só painel.
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {featureCards.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/15 bg-white p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-white/70">
              Centralização real · Menos retrabalho · Mais eficiência
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

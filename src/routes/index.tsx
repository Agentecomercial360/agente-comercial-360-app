import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import acLogo from "@/assets/ac-logo.png";

export const Route = createFileRoute("/")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login | Agente Comercial 360" },
      { name: "description", content: "Acesse sua conta no Agente Comercial 360 — CRM, WhatsApp, e-mail, vendas e financeiro em um só lugar." },
    ],
  }),
});

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };

  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden">
      {/* subtle background accents */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1000px 500px at -10% -20%, oklch(0.55 0.22 258 / 0.10), transparent 60%), radial-gradient(800px 400px at 110% 120%, oklch(0.28 0.14 262 / 0.10), transparent 60%)",
        }}
      />

      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* LEFT — Form */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3">
              <img src={acLogo} alt="Agente Comercial 360" width={44} height={44} className="h-11 w-11" />
              <div className="leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Agente Comercial
                </p>
                <p className="text-lg font-bold text-foreground">
                  360<span className="text-primary">.</span>
                </p>
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Acesse sua <span className="text-primary">operação</span>.
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Entre na sua conta para gerenciar leads, atendimentos e vendas em um só lugar.
            </p>

            <form onSubmit={onSubmit} className="mt-10 space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  E-mail corporativo
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="voce@empresa.com"
                    className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
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
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-12 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
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

              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary accent-[oklch(0.55_0.22_258)]"
                />
                Manter-me conectado neste dispositivo
              </label>

              <button
                type="submit"
                disabled={loading}
                className="relative h-12 w-full overflow-hidden rounded-xl text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.55_0.22_258_/_0.55)] transition active:scale-[0.99] disabled:opacity-70"
                style={{ background: "var(--gradient-brand)" }}
              >
                {loading ? "Entrando..." : "Entrar na plataforma"}
              </button>

              <div className="relative py-2 text-center">
                <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
                <span className="bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">
                  ou
                </span>
              </div>

              <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground transition hover:bg-secondary"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.4-1.07 2.59-2.28 3.39v2.81h3.69c2.16-1.99 3.61-4.93 3.61-8.44z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.69-2.81c-1.02.69-2.34 1.1-4.24 1.1-3.26 0-6.02-2.2-7.01-5.17H1.18v3.25C3.16 21.3 7.27 24 12 24z"/>
                  <path fill="#FBBC05" d="M4.99 14.21c-.25-.69-.39-1.43-.39-2.21s.14-1.52.39-2.21V6.54H1.18C.43 8.05 0 9.98 0 12s.43 3.95 1.18 5.46l3.81-3.25z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.27-3.27C17.95 1.19 15.24 0 12 0 7.27 0 3.16 2.7 1.18 6.54l3.81 3.25C5.98 6.95 8.74 4.75 12 4.75z"/>
                </svg>
                Entrar com Google
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <a href="#" className="font-semibold text-primary hover:underline">
                Solicitar acesso
              </a>
            </p>

            <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Conexão segura · Criptografia ponta a ponta
            </p>
          </div>
        </section>

        {/* RIGHT — Brand panel */}
        <aside
          className="relative hidden overflow-hidden lg:block"
          style={{ background: "var(--gradient-brand)" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div
            aria-hidden
            className="absolute -right-32 -top-32 h-96 w-96 rounded-full"
            style={{ background: "radial-gradient(closest-side, oklch(1 0 0 / 0.18), transparent)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full"
            style={{ background: "radial-gradient(closest-side, oklch(1 0 0 / 0.15), transparent)" }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Plataforma operando · 99.98% uptime
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl font-bold leading-[1.1] tracking-tight">
                O poder de uma operação inteligente em um só painel.
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { t: "CRM", d: "Visão 360º do cliente" },
                  { t: "WhatsApp", d: "Conversas centralizadas" },
                  { t: "E-mail", d: "Caixa unificada" },
                  { t: "Vendas", d: "Funil em tempo real" },
                  { t: "Financeiro", d: "Recebimentos e fluxo" },
                  { t: "Relatórios", d: "Indicadores que importam" },
                ].map((f) => (
                  <div
                    key={f.t}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
                  >
                    <p className="text-sm font-semibold">{f.t}</p>
                    <p className="text-xs text-white/75">{f.d}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Recebimentos · Maio</span>
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-emerald-200">
                    +15%
                  </span>
                </div>
                <p className="mt-1 text-2xl font-bold">R$ 98.750,00</p>
                <svg viewBox="0 0 300 60" className="mt-3 h-12 w-full">
                  <path
                    d="M0,45 C40,40 60,20 90,25 C120,30 140,50 175,38 C210,26 235,10 270,14 L300,12"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} Agente Comercial 360 · Todos os direitos reservados
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

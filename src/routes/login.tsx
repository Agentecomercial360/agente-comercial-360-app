import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import { MessageCircle, Users, Sparkles } from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import loginHeroAsset from "@/assets/login-hero-v2.jpg.asset.json";
import { supabase } from "@/lib/supabase";

const loginHero = loginHeroAsset.url;

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


function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg(
          "E-mail ou senha inválidos. Verifique os dados e tente novamente."
        );
        setLoading(false);
        return;
      }
      navigate({ to: "/dashboard" });
    } catch {
      setErrorMsg(
        "E-mail ou senha inválidos. Verifique os dados e tente novamente."
      );
      setLoading(false);
    }
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {errorMsg && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
                  >
                    {errorMsg}
                  </div>
                )}

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

        {/* RIGHT — Brand hero image */}
        <aside
          className="relative hidden overflow-hidden lg:block"
          style={{ background: "var(--gradient-brand)" }}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 600px at 50% 40%, oklch(0.28 0.14 262 / 0.55), transparent 70%)",
            }}
          />
          <img
            src={loginHero}
            alt="Agente Comercial 360 — Operação inteligente com WhatsApp Oficial, Meta Cloud API, IA, CRM e relatórios"
            className="relative z-10 h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, transparent 70%, oklch(0.18 0.10 262 / 0.45) 100%)",
            }}
          />
        </aside>
      </div>
    </main>
  );
}

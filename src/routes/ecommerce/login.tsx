import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, LayoutGrid, PackageSearch, AlertCircle, Wand2 } from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import loginHeroAsset from "@/assets/login-hero-v2.jpg.asset.json";

const loginHero = loginHeroAsset.url;

export const Route = createFileRoute("/ecommerce/login")({
  component: EcommerceLoginPage,
  head: () => ({
    meta: [
      { title: "Login | E-commerce Intelligence" },
      {
        name: "description",
        content:
          "Acesse o AC360 E-commerce Intelligence — centralize suas contas, acompanhe produtos, estoque, Ads e prioridades da sua operação em um único lugar.",
      },
    ],
  }),
});

function EcommerceLoginPage() {
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
    
    // Simulating authentication for structural purposes
    setTimeout(() => {
      setLoading(false);
      navigate({ to: "/ecommerce/dashboard" });
    }, 1000);
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
        <section className="flex flex-col items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-12 flex items-center gap-3.5">
              <img
                src={acLogo}
                alt="Agente Comercial 360"
                width={52}
                height={52}
                className="h-13 w-13 drop-shadow-sm"
              />
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 leading-none mb-1">
                  AC360
                </p>
                <p className="text-xl font-black tracking-tight text-foreground leading-none">
                  E-commerce
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mt-1.5 leading-none">
                  Intelligence
                </p>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl leading-[1.15]">
              Acesse sua <span className="text-primary">central E-commerce</span>
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground/80">
              Entre para acompanhar contas, produtos, estoque, Ads e prioridades da sua operação em uma central inteligente.
            </p>

            {/* Card */}
            <div className="mt-10 rounded-2xl border border-border/60 bg-card p-6 shadow-[0_20px_50px_-12px_oklch(0.28_0.14_262_/_0.12)] sm:p-8">
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
                  className="relative h-12 w-full overflow-hidden rounded-xl text-[15px] font-bold text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.55_0.22_258_/_0.55)] transition active:scale-[0.98] hover:opacity-95 disabled:opacity-70"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {loading ? "Entrando..." : "Entrar no AC360 E-commerce"}
                </button>

                <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-medium text-muted-foreground/80">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary/70" />
                  Acesso exclusivo para operações cadastradas no AC360 E-commerce.
                </p>
              </form>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Agente Comercial 360
            </p>
          </div>
        </section>

        {/* RIGHT — Premium brand panel */}
        <aside
          className="relative hidden overflow-hidden lg:block"
          style={{ background: "var(--gradient-brand)" }}
        >
          <img
            src={loginHero}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
            loading="eager"
            decoding="async"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.10 262 / 0.92) 0%, oklch(0.28 0.14 262 / 0.78) 50%, oklch(0.35 0.18 260 / 0.70) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(700px 500px at 80% 10%, oklch(0.55 0.22 258 / 0.35), transparent 65%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16 text-white">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                AC360 E-COMMERCE
              </span>
            </div>

            <div className="max-w-md">
              <h2 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-[3rem]">
                Central inteligente para operações <span className="text-white/90 block mt-1">Mercado Livre</span>
              </h2>
              <p className="mt-6 text-[16px] leading-relaxed text-white/80 font-medium">
                Centralize múltiplas contas, acompanhe produtos travados, estoque, Ads e decisões por SKU com apoio de IA.
              </p>

              <ul className="mt-12 space-y-5">
                {[
                  { icon: LayoutGrid, label: "Multi-contas Mercado Livre" },
                  { icon: PackageSearch, label: "Produto unificado por SKU e conta" },
                  { icon: AlertCircle, label: "Estoque centralizado e giro por produto" },
                  { icon: Wand2, label: "IA consultora para destravar produtos" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 backdrop-blur-sm">
                      <Icon className="h-4 w-4 text-white" />
                    </span>
                    <span className="text-[14px] font-medium text-white/90">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-white/60">
              <span className="h-px w-10 bg-white/30" />
              <span className="uppercase tracking-[0.2em] font-bold">
                PLATAFORMA PARA OPERAÇÕES MERCADO LIVRE DE ALTA PERFORMANCE
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
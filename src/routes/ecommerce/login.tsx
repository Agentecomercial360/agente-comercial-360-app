import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowLeft, Store, TrendingUp, BarChart3, BrainCircuit } from "lucide-react";
import acLogo from "@/assets/ac-logo.png";

export const Route = createFileRoute("/ecommerce/login")({
  component: EcommerceLoginPage,
  head: () => ({
    meta: [
      { title: "Login E-commerce Intelligence | Agente Comercial 360" },
      {
        name: "description",
        content:
          "Acesse a Central Inteligente AC360 E-commerce Intelligence para Mercado Livre, produtos, estoque e Ads.",
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login delay
    setTimeout(() => {
      setLoading(false);
      navigate({ to: "/ecommerce/dashboard" });
    }, 1000);
  };

  return (
    <main className="min-h-screen w-full bg-slate-950 relative overflow-hidden flex flex-col lg:flex-row">
      {/* Decorative backgrounds */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1000px 500px at -10% -20%, rgba(37, 99, 235, 0.15), transparent 60%), radial-gradient(800px 400px at 110% 120%, rgba(16, 185, 129, 0.1), transparent 60%)",
        }}
      />

      {/* LEFT — Login Form */}
      <section className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10 z-10">
        <div className="w-full max-w-md">
          {/* Back to Modules */}
          <Link 
            to="/modulos" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-12 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para seleção de módulos
          </Link>

          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <img
              src={acLogo}
              alt="Agente Comercial 360"
              width={48}
              height={48}
              className="h-12 w-12 brightness-0 invert"
            />
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                E-commerce Intelligence
              </p>
              <p className="text-lg font-bold text-white">
                AC360<span className="text-blue-500">.</span>
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            AC360 <span className="text-blue-500 text-gradient bg-clip-text">E-commerce Intelligence</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
            Central inteligente para Mercado Livre, produtos, estoque, Ads e IA.
          </p>

          {/* Form Card */}
          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 shadow-2xl sm:p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500/70" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 pl-11 pr-4 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-slate-300">
                    Senha
                  </label>
                  <a href="#" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    Esqueci minha senha
                  </a>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500/70" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 pl-11 pr-12 text-sm text-white shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative h-12 w-full overflow-hidden rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 bg-blue-600 hover:bg-blue-500"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Autenticando...
                  </div>
                ) : (
                  "Entrar no E-commerce"
                )}
              </button>

              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500/50" />
                Acesso Seguro e Criptografado
              </div>
            </form>
          </div>

          <p className="mt-12 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Agente Comercial 360 · E-commerce Intelligence
          </p>
        </div>
      </section>

      {/* RIGHT — Brand Experience */}
      <aside className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-900 border-l border-slate-800">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="relative z-10 w-full flex flex-col justify-center p-16 xl:p-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-8 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Operação de Alta Performance
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-6">
            Inteligência de mercado <br />
            <span className="text-blue-500">em tempo real.</span>
          </h2>
          
          <p className="text-lg text-slate-400 mb-12 max-w-lg leading-relaxed">
            Domine o Mercado Livre com análise preditiva de estoque, otimização de Ads e monitoramento automático de concorrência.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: Store, label: "Multi-contas", desc: "ML & Ecossistema" },
              { icon: TrendingUp, label: "Performance", desc: "Vendas e Conversão" },
              { icon: BarChart3, label: "Gestão Ads", desc: "ROAS e TACoS" },
              { icon: BrainCircuit, label: "IA Ativa", desc: "Insights e Alertas" },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
                <item.icon className="h-6 w-6 text-blue-500 mb-4" />
                <h4 className="font-bold text-white text-sm mb-1">{item.label}</h4>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Abstract glow */}
        <div className="absolute -bottom-24 -right-24 h-96 w-96 bg-blue-600/20 blur-[120px] rounded-full" />
      </aside>
    </main>
  );
}

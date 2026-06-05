import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, LayoutGrid, PackageSearch, AlertCircle, Wand2, ShieldCheck } from "lucide-react";
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
      {/* Decorative background effects */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1000px 600px at -10% -20%, rgba(37, 99, 235, 0.12), transparent 70%), radial-gradient(800px 400px at 110% 120%, rgba(59, 130, 246, 0.08), transparent 70%)",
        }}
      />
      
      {/* LEFT — Login Form Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-20 xl:px-32 z-10">
        <div className="w-full max-w-md">
          {/* Logo & Identity (Top Left Style) */}
          <div className="mb-12 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <img
                src={acLogo}
                alt="Agente Comercial 360"
                width={40}
                height={40}
                className="h-10 w-10 brightness-0 invert"
              />
              <div className="leading-tight">
                <p className="text-xl font-bold text-white tracking-tight">
                  AC360 <span className="text-blue-500 font-medium">E-commerce Intelligence</span>
                </p>
                <p className="text-[13px] font-medium text-slate-400">
                  Central inteligente para vendedores de Mercado Livre.
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
              Multi-contas, estoque unificado, produtos travados, Ads e IA em uma única operação.
            </p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Acesse sua operação E-commerce
            </h1>
            <p className="text-sm text-slate-400">
              Entre para acompanhar produtos, estoque, Ads e prioridades da sua operação.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                  E-mail
                </label>
                <div className="relative group">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-700/50 bg-slate-800/30 pl-11 pr-4 text-sm text-white shadow-sm outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Senha
                  </label>
                  <a href="#" className="text-[11px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-tight">
                    Esqueci minha senha
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-700/50 bg-slate-800/30 pl-11 pr-12 text-sm text-white shadow-sm outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-600"
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
                className="relative h-12 w-full overflow-hidden rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-950/20 transition-all active:scale-[0.98] disabled:opacity-70 bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Autenticando...
                  </div>
                ) : (
                  <>
                    Entrar no E-commerce Intelligence
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500 font-medium">
                  Acesso exclusivo para operações conectadas ao módulo E-commerce.
                </p>
              </div>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="mt-10 flex flex-col items-center gap-6">
            <Link 
              to="/modulos" 
              className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 text-xs font-semibold transition-colors group uppercase tracking-widest"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              Voltar para seleção de módulos
            </Link>

            <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              <ShieldCheck className="h-3 w-3 text-slate-700" />
              Ambiente Seguro
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT — Brand Propose & Experience Section */}
      <aside className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-900/50 border-l border-slate-800/40">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 w-full flex flex-col justify-center p-16 xl:p-24 2xl:p-32">
          {/* Elegant Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 w-fit backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Consultor IA para Mercado Livre
          </div>

          <h2 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white leading-[1.15] mb-8 tracking-tight">
            Transforme dados do Mercado Livre em <br />
            <span className="text-blue-500">ações para vender mais.</span>
          </h2>
          
          <p className="text-lg xl:text-xl text-slate-400 mb-16 max-w-xl leading-relaxed">
            Centralize suas contas, encontre produtos travados, analise estoque, Ads e performance com apoio de IA.
          </p>

          {/* Premium Feature Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 xl:gap-6">
            {[
              { 
                icon: LayoutGrid, 
                label: "Multi-contas ML", 
                desc: "Centralize várias contas do Mercado Livre em uma única visão." 
              },
              { 
                icon: PackageSearch, 
                label: "Produto Unificado", 
                desc: "Compare o mesmo SKU em diferentes contas e identifique onde ele trava." 
              },
              { 
                icon: AlertCircle, 
                label: "Produtos Travados", 
                desc: "Encontre produtos sem venda, sem visita ou com baixa conversão." 
              },
              { 
                icon: Wand2, 
                label: "IA Consultora", 
                desc: "Receba sugestões de título, imagem, preço, Ads, kit e promoção." 
              },
            ].map((item, i) => (
              <div 
                key={i} 
                className="group p-6 rounded-2xl border border-slate-800/50 bg-slate-900/30 hover:bg-slate-800/40 hover:border-slate-700/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-5 w-5 text-blue-500" />
                </div>
                <h4 className="font-bold text-white text-base mb-2">{item.label}</h4>
                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 h-96 w-96 bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 bg-blue-900/10 blur-[100px] rounded-full" />
      </aside>
    </main>
  );
}

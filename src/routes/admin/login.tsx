import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Building2, Layers, Users as UsersIcon, ShieldAlert } from "lucide-react";
import acLogo from "@/assets/ac-logo.png";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [
      { title: "Login Administrativo | Agente Comercial 360" },
      {
        name: "description",
        content: "Acesso restrito à equipe administrativa do Agente Comercial 360.",
      },
    ],
  }),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulação de login administrativo
    setTimeout(() => {
      navigate({ to: "/admin/dashboard" });
    }, 800);
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 relative overflow-hidden flex items-center justify-center lg:block">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1000px 500px at -10% -20%, rgba(30, 58, 138, 0.05), transparent 60%), radial-gradient(800px 400px at 110% 120%, rgba(30, 41, 59, 0.05), transparent 60%)",
        }}
      />

      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
        {/* LEFT — Login Form */}
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
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Painel Interno
                </p>
                <p className="text-xl font-bold text-slate-900">
                  ADMIN<span className="text-blue-600">.</span>
                </p>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Acesse o <span className="text-blue-600">Painel Admin</span>
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
              Gerencie empresas, usuários, módulos e acessos da plataforma AC360.
            </p>

            {/* Login Card */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    E-mail Administrativo
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="admin@ac360.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                      Senha
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative h-12 w-full overflow-hidden rounded-xl bg-slate-900 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? "Autenticando..." : "Entrar no Admin"}
                </button>

                <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <ShieldAlert className="h-3.5 w-3.5 text-blue-500" />
                  Acesso restrito à equipe administrativa.
                </div>
              </form>
            </div>

            <p className="mt-10 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} Agente Comercial 360 · Painel Interno
            </p>
          </div>
        </section>

        {/* RIGHT — Info Panel */}
        <aside className="relative hidden overflow-hidden lg:flex flex-col justify-center p-12 xl:p-20 bg-slate-900">
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-800/30 blur-[100px] rounded-full -ml-32 -mb-32" />
          
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-400 ring-1 ring-blue-500/20 mb-8">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gestão Centralizada AC360
            </div>
            
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight mb-6">
              Controle total da plataforma em um só lugar.
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-12">
              Gerencie o ecossistema Agente Comercial 360: de novos clientes a configurações avançadas de segurança e módulos.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Building2, label: "Gestão de Empresas", desc: "Controle de clientes ativos" },
                { icon: UsersIcon, label: "Usuários & Perfis", desc: "Gestão de acessos e cargos" },
                { icon: Layers, label: "Controle de Módulos", desc: "Ativação de CRM e E-commerce" },
                { icon: ShieldCheck, label: "Segurança & Logs", desc: "Monitoramento em tempo real" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-12 left-12 xl:left-20 flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
             <div className="h-px w-8 bg-slate-700" />
             Plataforma Administrativa de Alta Segurança
          </div>
        </aside>
      </div>
    </main>
  );
}

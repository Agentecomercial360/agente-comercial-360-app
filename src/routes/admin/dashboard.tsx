import { createFileRoute } from "@tanstack/react-router";
import { 
  Building2, 
  Users, 
  Layers, 
  Lock, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Activity
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
  head: () => ({
    meta: [{ title: "Dashboard Admin | Agente Comercial 360" }],
  }),
});

function StatCard({ label, value, icon: Icon, color, trend }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const stats = [
    { label: "Empresas cadastradas", value: "148", icon: Building2, color: "bg-blue-50 text-blue-600", trend: "12%" },
    { label: "Empresas ativas", value: "132", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", trend: "8%" },
    { label: "Usuários ativos", value: "842", icon: Users, color: "bg-violet-50 text-violet-600", trend: "15%" },
    { label: "Módulos liberados", value: "215", icon: Layers, color: "bg-amber-50 text-amber-600" },
    { label: "Clientes CRM", value: "94", icon: TrendingUp, color: "bg-indigo-50 text-indigo-600" },
    { label: "Clientes E-commerce", value: "38", icon: Activity, color: "bg-orange-50 text-orange-600" },
    { label: "Acessos pendentes", value: "12", icon: Lock, color: "bg-rose-50 text-rose-600" },
    { label: "Planos vencendo", value: "5", icon: CreditCard, color: "bg-slate-50 text-slate-600" },
  ];

  const activities = [
    { text: "Empresa Thiago E-commerce criada", time: "Há 10 minutos", type: "success" },
    { text: "Módulo E-commerce liberado para Auto Peças União", time: "Há 45 minutos", type: "info" },
    { text: "Usuário gestor cadastrado na empresa Cliente Exemplo", time: "Há 2 horas", type: "user" },
    { text: "Cliente Auto Peças União ativo no CRM", time: "Há 5 horas", type: "success" },
    { text: "Pagamento confirmado: Thiago E-commerce (Plano Pro)", time: "Há 8 horas", type: "payment" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full -mr-48 -mt-48" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                  Visão Geral Administrativa
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
                Olá, Administrador
              </h1>
              <p className="mt-3 text-lg text-slate-400">
                O painel admin centraliza o controle de clientes, usuários e módulos liberados na plataforma AC360.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status da Plataforma</p>
                <p className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Operando Normal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Operations Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Resumo da operação
              </h2>
              <button className="text-sm font-bold text-blue-600 hover:underline">Ver todas empresas</button>
            </div>
            
            <div className="rounded-2xl border border-slate-200 bg-white p-1 overflow-hidden">
               <div className="p-6">
                 <p className="text-slate-600 leading-relaxed">
                   Atualmente a plataforma conta com <span className="font-bold text-slate-900">148 empresas</span> cadastradas, sendo que <span className="font-bold text-emerald-600">89% estão ativas</span>. O crescimento de novos usuários foi de <span className="font-bold text-blue-600">15% nos últimos 30 dias</span>. O módulo CRM continua sendo o mais utilizado, mas a adoção do E-commerce Intelligence cresceu significativamente desde o último lançamento.
                 </p>
               </div>
               <div className="grid grid-cols-3 border-t border-slate-100 divide-x divide-slate-100 bg-slate-50/50">
                 <div className="p-4 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Taxa de Churn</p>
                   <p className="text-lg font-bold text-slate-900">1.2%</p>
                 </div>
                 <div className="p-4 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket Médio</p>
                   <p className="text-lg font-bold text-slate-900">R$ 450</p>
                 </div>
                 <div className="p-4 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Uptime</p>
                   <p className="text-lg font-bold text-emerald-600">99.9%</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Últimas atividades
            </h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-6">
                {activities.map((activity, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== activities.length - 1 && (
                      <div className="absolute left-[11px] top-7 bottom-[-24px] w-0.5 bg-slate-100" />
                    )}
                    <div className={`mt-1 h-6 w-6 rounded-full border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center ${
                      activity.type === "success" ? "bg-emerald-500" : 
                      activity.type === "info" ? "bg-blue-500" : 
                      activity.type === "user" ? "bg-violet-500" : "bg-amber-500"
                    }`}>
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-snug">{activity.text}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Ver todo o histórico
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

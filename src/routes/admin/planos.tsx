import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CreditCard, CheckCircle2, Clock, AlertCircle, TrendingUp, MoreHorizontal, DollarSign } from "lucide-react";

export const Route = createFileRoute("/admin/planos")({
  component: AdminPlanos,
});

function AdminPlanos() {
  const planosEmpresas = [
    { id: 1, empresa: "Auto Peças União", plano: "Pro", modulo: "CRM", valor: "R$ 299,00", status: "Ativo", vencimento: "15/07/2026" },
    { id: 2, empresa: "Thiago E-commerce", plano: "Enterprise", modulo: "E-commerce", valor: "R$ 890,00", status: "Em implantação", vencimento: "20/06/2026" },
    { id: 3, empresa: "Cliente Exemplo", plano: "Combo 360", modulo: "CRM + E-commerce", valor: "R$ 1.150,00", status: "Ativo", vencimento: "05/07/2026" },
    { id: 4, empresa: "Logística Express", plano: "Basic", modulo: "CRM", valor: "R$ 149,00", status: "Suspenso", vencimento: "10/05/2026" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Planos & Assinaturas</h1>
            <p className="text-slate-500">Monitoramento comercial e financeiro das contas.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition">
            <TrendingUp className="h-4 w-4" />
            Ver Relatório Financeiro
          </button>
        </div>

        {/* Dashboard Financeiro Simples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receita Mensal (MRR)</p>
                <p className="text-2xl font-bold text-slate-900">R$ 54.200</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <TrendingUp className="h-3 w-3" />
              +8.5% em relação ao mês anterior
            </div>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Planos Ativos</p>
                <p className="text-2xl font-bold text-slate-900">132</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
              <CheckCircle2 className="h-3 w-3" />
              92% das empresas cadastradas
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vencimentos (7 dias)</p>
                <p className="text-2xl font-bold text-slate-900">12</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold">
              <Clock className="h-3 w-3" />
              Requer atenção comercial
            </div>
          </div>
        </div>

        {/* Tabela de Planos */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Plano</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Módulo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Valor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Próx. Vencimento</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {planosEmpresas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.empresa}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold border ${
                        item.plano === "Enterprise" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                        item.plano === "Combo 360" ? "bg-purple-50 text-purple-700 border-purple-100" :
                        "bg-blue-50 text-blue-700 border-blue-100"
                      }`}>
                        {item.plano}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{item.modulo}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.valor}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        item.status === "Ativo" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        item.status === "Em implantação" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          item.status === "Ativo" ? "bg-emerald-500" :
                          item.status === "Em implantação" ? "bg-amber-500" :
                          "bg-rose-500"
                        }`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {item.vencimento}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

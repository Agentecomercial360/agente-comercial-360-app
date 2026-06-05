import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Layers, CheckCircle2, XCircle, Building2, ShoppingCart, MessageCircle, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/modulos")({
  component: AdminModulos,
});

function AdminModulos() {
  const modulosEmpresas = [
    { id: 1, empresa: "Auto Peças União", crm: true, ecommerce: false, plano: "CRM Pro", status: "Ativo" },
    { id: 2, empresa: "Thiago E-commerce", crm: false, ecommerce: true, plano: "E-commerce Enterprise", status: "Ativo" },
    { id: 3, empresa: "Cliente Exemplo", crm: true, ecommerce: true, plano: "Combo 360", status: "Ativo" },
    { id: 4, empresa: "Logística Express", crm: true, ecommerce: false, plano: "CRM Basic", status: "Suspenso" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Módulos</h1>
          <p className="text-slate-500">Controle a liberação de funcionalidades por empresa.</p>
        </div>

        {/* Módulos Disponíveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <MessageCircle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Agente Comercial 360 CRM</h3>
                <p className="text-sm text-slate-500">Gestão de atendimentos, leads e WhatsApp.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-600 mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                94 empresas ativas
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                4 sub-módulos
              </div>
            </div>
            <button className="w-full py-3 rounded-2xl bg-white border border-blue-200 text-blue-600 text-sm font-bold hover:bg-blue-50 transition-colors">
              Configurações do Módulo CRM
            </button>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">AC360 E-commerce Intelligence</h3>
                <p className="text-sm text-slate-500">Central inteligente para Mercado Livre e Ads.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-600 mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                38 empresas ativas
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                9 sub-módulos
              </div>
            </div>
            <button className="w-full py-3 rounded-2xl bg-white border border-indigo-200 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors">
              Configurações do Módulo E-commerce
            </button>
          </div>
        </div>

        {/* Controle por Empresa */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Controle de Módulos por Empresa
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">CRM</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">E-commerce</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Plano</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {modulosEmpresas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{item.empresa}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {item.crm ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 text-[11px] font-bold">
                              <CheckCircle2 className="h-3 w-3" /> ATIVO
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-[11px] font-bold">
                              <XCircle className="h-3 w-3" /> INATIVO
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {item.ecommerce ? (
                            <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 text-[11px] font-bold">
                              <CheckCircle2 className="h-3 w-3" /> ATIVO
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-[11px] font-bold">
                              <XCircle className="h-3 w-3" /> INATIVO
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{item.plano}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "Ativo" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition-colors">
                            Alterar Acessos
                          </button>
                          <button title="Suspender" className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                            <AlertCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

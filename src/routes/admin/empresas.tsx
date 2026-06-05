import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Search, MoreHorizontal, Edit, Lock, Eye, Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/empresas")({
  component: AdminEmpresas,
});

function AdminEmpresas() {
  const empresas = [
    { id: 1, nome: "Auto Peças União", responsavel: "Ivan", email: "ivan@uniao.com", modulo: "CRM", status: "Ativo", data: "01/02/2026" },
    { id: 2, nome: "Thiago E-commerce", responsavel: "Thiago", email: "thiago@mlecom.br", modulo: "E-commerce", status: "Em implantação", data: "15/05/2026" },
    { id: 3, nome: "Cliente Exemplo", responsavel: "Maria", email: "maria@exemplo.com", modulo: "CRM + E-commerce", status: "Ativo", data: "20/12/2025" },
    { id: 4, nome: "Logística Express", responsavel: "Carlos", email: "carlos@logex.com", modulo: "CRM", status: "Suspenso", data: "10/01/2026" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Empresas</h1>
            <p className="text-slate-500">Gerencie todos os clientes da plataforma.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" />
            Nova empresa
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filtrar empresas..." 
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 transition-all">
                <option>Todos os status</option>
                <option>Ativo</option>
                <option>Em implantação</option>
                <option>Suspenso</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Responsável</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">E-mail</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Módulo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Cadastro</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empresas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-900">{empresa.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{empresa.responsavel}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{empresa.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                        {empresa.modulo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        empresa.status === "Ativo" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        empresa.status === "Em implantação" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          empresa.status === "Ativo" ? "bg-emerald-500" :
                          empresa.status === "Em implantação" ? "bg-amber-500" :
                          "bg-rose-500"
                        }`} />
                        {empresa.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">{empresa.data}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button title="Ver detalhes" className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button title="Editar" className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button title="Bloquear" className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                          <Lock className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                          <MoreHorizontal className="h-4 w-4" />
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
    </AdminLayout>
  );
}

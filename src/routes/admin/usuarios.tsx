import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Search, MoreHorizontal, User, Mail, Shield, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsuarios,
});

function AdminUsuarios() {
  const usuarios = [
    { id: 1, nome: "Ivan Costa", email: "ivan@uniao.com", empresa: "Auto Peças União", perfil: "Dono", modulo: "CRM", status: "Ativo", ultimoAcesso: "Hoje, 14:20" },
    { id: 2, nome: "Thiago Silva", email: "thiago@mlecom.br", empresa: "Thiago E-commerce", perfil: "Dono", modulo: "E-commerce", status: "Ativo", ultimoAcesso: "Hoje, 10:05" },
    { id: 3, nome: "Ricardo Melo", email: "ricardo@uniao.com", empresa: "Auto Peças União", perfil: "Gestor", modulo: "CRM", status: "Ativo", ultimoAcesso: "Ontem, 18:40" },
    { id: 4, nome: "Ana Paula", email: "ana@exemplo.com", empresa: "Cliente Exemplo", perfil: "Operador", modulo: "CRM + E-commerce", status: "Offline", ultimoAcesso: "2 dias atrás" },
    { id: 5, nome: "Marcos Oliveira", email: "marcos@logex.com", empresa: "Logística Express", perfil: "Visualizador", modulo: "CRM", status: "Bloqueado", ultimoAcesso: "15/05/2026" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
            <p className="text-slate-500">Controle todos os usuários de todas as empresas.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" />
            Novo usuário
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por nome, e-mail ou empresa..." 
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 transition-all">
                <option>Todos os perfis</option>
                <option>Dono</option>
                <option>Gestor</option>
                <option>Operador</option>
                <option>Visualizador</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Nome / E-mail</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Perfil</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Módulo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Último Acesso</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                          {usuario.nome.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{usuario.nome}</span>
                          <span className="text-xs text-slate-500">{usuario.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{usuario.empresa}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${
                        usuario.perfil === "Dono" ? "bg-purple-50 text-purple-700 border-purple-100" :
                        usuario.perfil === "Gestor" ? "bg-blue-50 text-blue-700 border-blue-100" :
                        "bg-slate-50 text-slate-700 border-slate-100"
                      }`}>
                        <Shield className="h-3 w-3" />
                        {usuario.perfil}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        {usuario.modulo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        usuario.status === "Ativo" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        usuario.status === "Offline" ? "bg-slate-50 text-slate-500 border border-slate-100" :
                        "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          usuario.status === "Ativo" ? "bg-emerald-500" :
                          usuario.status === "Offline" ? "bg-slate-300" :
                          "bg-rose-500"
                        }`} />
                        {usuario.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {usuario.ultimoAcesso}
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

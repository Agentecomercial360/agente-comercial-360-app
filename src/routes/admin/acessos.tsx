import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Shield, Clock, Smartphone, Globe, User, Activity, Filter, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/acessos")({
  component: AdminAcessos,
});

function AdminAcessos() {
  const acessos = [
    { id: 1, usuario: "Ivan Costa", empresa: "Auto Peças União", modulo: "CRM", data: "05/06/2026 14:20", status: "Sucesso", ip: "189.122.34.10", dispositivo: "Desktop (Chrome)" },
    { id: 2, usuario: "Thiago Silva", empresa: "Thiago E-commerce", modulo: "E-commerce", data: "05/06/2026 10:05", status: "Sucesso", ip: "177.45.12.89", dispositivo: "Mobile (iPhone)" },
    { id: 3, usuario: "Ana Paula", empresa: "Cliente Exemplo", modulo: "E-commerce", data: "04/06/2026 18:40", status: "Falha", ip: "201.10.45.67", dispositivo: "Desktop (Firefox)" },
    { id: 4, usuario: "Marcos Oliveira", empresa: "Logística Express", modulo: "CRM", data: "04/06/2026 15:12", status: "Sucesso", ip: "187.90.122.4", dispositivo: "Desktop (Chrome)" },
    { id: 5, usuario: "Ricardo Melo", empresa: "Auto Peças União", modulo: "CRM", data: "04/06/2026 09:30", status: "Sucesso", ip: "189.122.34.10", dispositivo: "Desktop (Chrome)" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Acessos</h1>
            <p className="text-slate-500">Monitoramento de segurança e logs de entrada em tempo real.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              <Filter className="h-4 w-4" />
              Filtrar Logs
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition">
              <Activity className="h-4 w-4" />
              Relatório em Tempo Real
            </button>
          </div>
        </div>

        {/* Status do Dia */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Acessos hoje", value: "1.248", icon: Activity, color: "text-blue-600 bg-blue-50" },
            { label: "Usuários ativos", value: "84", icon: User, color: "text-emerald-600 bg-emerald-50" },
            { label: "Falhas de login", value: "12", icon: Shield, color: "text-rose-600 bg-rose-50" },
            { label: "Bloqueados", value: "3", icon: Trash2, color: "text-slate-600 bg-slate-50" },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Logs Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Usuário / Empresa</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Módulo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Data/Hora</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Endereço IP</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Dispositivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {acessos.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{log.usuario}</span>
                        <span className="text-xs text-slate-500">{log.empresa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                        {log.modulo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {log.data}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        log.status === "Sucesso" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {log.status === "Falha" ? <Shield className="h-3 w-3" /> : <Shield className="h-3 w-3 opacity-50" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 opacity-50" />
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 opacity-50" />
                      {log.dispositivo}
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

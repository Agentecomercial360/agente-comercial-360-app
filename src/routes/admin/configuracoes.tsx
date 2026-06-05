import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Settings, Shield, Bell, Database, Save, Globe, Lock } from "lucide-react";

export const Route = createFileRoute("/admin/configuracoes")({
  component: AdminConfiguracoes,
});

function AdminConfiguracoes() {
  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações do Admin</h1>
          <p className="text-slate-500">Ajustes globais da plataforma e preferências do sistema interno.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Dados da Plataforma */}
          <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Dados da Plataforma</h2>
                  <p className="text-sm text-slate-500">Informações gerais visíveis para clientes.</p>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition">
                <Save className="h-3.5 w-3.5" />
                Salvar Alterações
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nome da Plataforma</label>
                  <input type="text" defaultValue="Agente Comercial 360" className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">E-mail de Suporte</label>
                  <input type="email" defaultValue="suporte@ac360.com" className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 transition-all" />
                </div>
              </div>
            </div>
          </section>

          {/* Segurança */}
          <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Segurança & Acesso</h2>
                <p className="text-sm text-slate-500">Políticas de senha e autenticação de dois fatores.</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div>
                  <p className="text-sm font-bold text-slate-900">Autenticação de Dois Fatores (2FA) Obrigatória</p>
                  <p className="text-xs text-slate-500 mt-0.5">Exigir 2FA para todos os administradores.</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-slate-200 relative cursor-pointer">
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div>
                  <p className="text-sm font-bold text-slate-900">Log de Auditoria Completo</p>
                  <p className="text-xs text-slate-500 mt-0.5">Registrar todas as ações realizadas no painel admin.</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-blue-600 relative cursor-pointer">
                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Módulos Globais */}
          <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Módulos do Sistema</h2>
                <p className="text-sm text-slate-500">Ativar ou desativar módulos globalmente.</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Controle de Disponibilidade</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                       <Shield className="h-4 w-4" />
                     </div>
                     <span className="text-sm font-bold text-slate-900">CRM Ativo</span>
                   </div>
                   <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center">
                     <Save className="h-3 w-3 text-white" />
                   </div>
                 </div>
                 <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                       <Database className="h-4 w-4" />
                     </div>
                     <span className="text-sm font-bold text-slate-900">E-commerce Ativo</span>
                   </div>
                   <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center">
                     <Save className="h-3 w-3 text-white" />
                   </div>
                 </div>
               </div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

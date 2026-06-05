import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, Store, ArrowRight, Bot, ShieldCheck } from "lucide-react";
import acLogo from "@/assets/ac-logo.png";

export const Route = createFileRoute("/modulos")({
  component: ModulosSelection,
  head: () => ({
    meta: [{ title: "Seleção de Módulos | Agente Comercial 360" }],
  }),
});

function ModulosSelection() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <img
            src={acLogo}
            alt="Agente Comercial 360"
            className="h-24 w-auto drop-shadow-sm"
          />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Selecione o seu ecossistema
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl">
              Bem-vindo de volta! Escolha qual vertical de negócio você deseja gerenciar agora.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CRM/Atendimento Card */}
          <Link
            to="/dashboard"
            className="group relative flex flex-col bg-white rounded-3xl p-8 shadow-sm border border-slate-200 transition-all hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <LayoutDashboard size={120} />
            </div>
            
            <div className="rounded-2xl bg-blue-50 p-4 w-fit mb-6 ring-1 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <LayoutDashboard className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">Atendimento e CRM</h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              Gestão 360 de conversas, leads, peças e atendimentos oficiais da União Auto Peças.
            </p>

            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                  <Bot className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Módulo Comercial</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                Acessar <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* E-commerce Card */}
          <Link
            to="/ecommerce/login"
            className="group relative flex flex-col bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-800 transition-all hover:shadow-xl hover:border-blue-900/50 hover:-translate-y-1 overflow-hidden text-white"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Store size={120} />
            </div>

            <div className="rounded-2xl bg-white/10 p-4 w-fit mb-6 ring-1 ring-white/20 group-hover:bg-blue-600 group-hover:ring-blue-500 transition-all duration-300">
              <Store className="h-8 w-8 text-blue-400 group-hover:text-white" />
            </div>

            <h2 className="text-2xl font-bold mb-3">E-commerce Intelligence</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Monitoramento avançado de contas Mercado Livre, estoque unificado e Ads inteligente com IA.
            </p>

            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 ring-1 ring-blue-500/30">
                  <ShieldCheck className="h-3 w-3 text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Módulo Operacional</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                Acessar <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center pt-8">
          <p className="text-sm text-slate-400 font-medium">
            Agente Comercial 360 v1.0 · Sistema de Inteligência Veicular
          </p>
        </div>
      </div>
    </div>
  );
}

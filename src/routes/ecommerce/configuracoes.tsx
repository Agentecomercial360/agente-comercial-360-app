import { createFileRoute } from "@tanstack/react-router";
import { 
  Settings, 
  UserCog, 
  BrainCircuit, 
  RefreshCw, 
  Bell, 
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Plus
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/configuracoes")({
  component: EcommerceConfiguracoes,
  head: () => ({
    meta: [{ title: "Configurações E-commerce | Agente Comercial 360" }],
  }),
});

function ConfigSection({ title, icon: Icon, children }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
        <div className="rounded-lg bg-white p-1.5 shadow-sm border border-slate-200">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
        <h2 className="font-bold text-slate-900">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function ToggleItem({ label, description, active }: any) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0 border-b last:border-0 border-slate-50">
      <div className="max-w-md">
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button className={`p-1 transition-colors ${active ? "text-blue-600" : "text-slate-300"}`}>
        {active ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
      </button>
    </div>
  );
}

function EcommerceConfiguracoes() {
  const accounts = [
    { name: "Chaleur Brasil", user: "chaleur_oficial", lastSync: "há 5 min" },
    { name: "RACER", user: "racer_pecas", lastSync: "há 12 min" },
  ];

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações do E-commerce</h1>
          <p className="text-slate-500">Gerencie integrações, regras de análise e preferências da IA.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Contas Mercado Livre */}
          <ConfigSection title="Contas Mercado Livre" icon={UserCog}>
            <div className="space-y-4">
              {accounts.map((acc, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{acc.name}</p>
                      <p className="text-xs text-slate-500">Usuário: {acc.user}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sincronização</p>
                      <p className="text-xs font-medium text-slate-600">{acc.lastSync}</p>
                    </div>
                    <button className="text-xs font-bold text-rose-600 hover:text-rose-700">Desconectar</button>
                  </div>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all">
                <Plus className="h-4 w-4" />
                Adicionar nova conta Mercado Livre
              </button>
            </div>
          </ConfigSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Regras de Análise */}
            <ConfigSection title="Regras de Análise" icon={RefreshCw}>
              <div className="space-y-2">
                <ToggleItem 
                  label="Considerar produto 'travado' após 7 dias" 
                  description="A IA alertará produtos with estoque e zero vendas neste período." 
                  active={true} 
                />
                <ToggleItem 
                  label="Alerta de ruptura de estoque" 
                  description="Notificar quando a cobertura estimada for menor que 15 dias." 
                  active={true} 
                />
                <ToggleItem 
                  label="Monitorar preços da concorrência" 
                  description="Análise automática de anúncios similares de vendedores Platinum." 
                  active={true} 
                />
                <ToggleItem 
                  label="Sincronização em tempo real" 
                  description="Atualizar vendas e visitas a cada 5 minutos." 
                  active={false} 
                />
              </div>
            </ConfigSection>

            {/* Configurações de IA */}
            <ConfigSection title="Inteligência Artificial" icon={BrainCircuit}>
              <div className="space-y-2">
                <ToggleItem 
                  label="Consultor IA Ativo" 
                  description="Habilitar sugestões automáticas de títulos, fotos e preços." 
                  active={true} 
                />
                <ToggleItem 
                  label="Geração automática de tarefas" 
                  description="Criar tarefas operacionais baseadas em alertas críticos." 
                  active={true} 
                />
                <ToggleItem 
                  label="Análise de sentimento (Perguntas)" 
                  description="Classificar dúvidas de clientes e sugerir respostas otimizadas." 
                  active={true} 
                />
                <ToggleItem 
                  label="Modo Autônomo (Ads)" 
                  description="Permitir que a IA pause campanhas com ROAS abaixo de 1.5." 
                  active={false} 
                />
              </div>
            </ConfigSection>
          </div>

          {/* Notificações e Segurança */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ConfigSection title="Notificações" icon={Bell}>
              <div className="space-y-2">
                <ToggleItem label="Resumo diário por e-mail" description="Enviar performance consolidada às 08h." active={true} />
                <ToggleItem label="Alertas críticos no WhatsApp" description="Notificar imediatamente problemas em anúncios campeões." active={true} />
              </div>
            </ConfigSection>
            <ConfigSection title="Segurança" icon={ShieldCheck}>
              <div className="space-y-2">
                <ToggleItem label="Logs de auditoria" description="Registrar todas as alterações feitas via painel ou IA." active={true} />
                <ToggleItem label="Verificação em duas etapas" description="Exigir 2FA para desconectar contas do Mercado Livre." active={true} />
              </div>
            </ConfigSection>
          </div>
        </div>
      </div>
    </EcommerceLayout>
  );
}
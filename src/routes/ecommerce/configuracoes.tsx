import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  UserCog,
  BrainCircuit,
  RefreshCw,
  Bell,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Plus,
  Plug,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Package,
  ShoppingCart,
  Boxes,
  Megaphone,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

type IntegrationRow = {
  company_name: string | null;
  account_name: string | null;
  marketplace: string | null;
  integration_name: string | null;
  integration_status: string | null;
  readable_status: string | null;
  is_token_valid: boolean | null;
  last_sync_at: string | null;
  next_sync_at: string | null;
  sync_products: boolean | null;
  sync_orders: boolean | null;
  sync_ads: boolean | null;
  sync_inventory: boolean | null;
  last_error_message: string | null;
  last_error_at: string | null;
};

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

function fmtDateTime(iso: string | null) {
  if (!iso) return "Ainda não sincronizado";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function StatusBadge({ row }: { row: IntegrationRow }) {
  const hasError = !!(row.last_error_message && row.last_error_message.trim().length > 0);
  const isConnected = row.integration_status === "connected" && row.is_token_valid === true;

  if (hasError) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200">
        <AlertTriangle className="h-3 w-3" /> Com erro
      </span>
    );
  }
  if (isConnected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3 w-3" /> Conectado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
      <Clock className="h-3 w-3" /> Aguardando conexão
    </span>
  );
}

function SyncBadge({ label, icon: Icon, active }: { label: string; icon: any; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-slate-50 text-slate-400"
      }`}
      title={active ? `${label} habilitado` : `${label} desativado`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function IntegrationCard({ row }: { row: IntegrationRow }) {
  const title =
    row.integration_name ||
    [row.marketplace, row.account_name].filter(Boolean).join(" — ") ||
    "Integração";

  const handleConnect = () => {
    toast("Conexão Mercado Livre em preparação.", {
      description: "A integração será habilitada em breve.",
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-amber-50 p-1.5 border border-amber-100">
              <Plug className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 truncate">{title}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Marketplace: <span className="font-semibold text-slate-700">{row.marketplace ?? "—"}</span>
          </p>
        </div>
        <StatusBadge row={row} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <SyncBadge label="Produtos" icon={Package} active={!!row.sync_products} />
        <SyncBadge label="Pedidos" icon={ShoppingCart} active={!!row.sync_orders} />
        <SyncBadge label="Estoque" icon={Boxes} active={!!row.sync_inventory} />
        <SyncBadge label="Ads" icon={Megaphone} active={!!row.sync_ads} />
      </div>
      {!row.sync_ads && (
        <p className="mt-2 text-[11px] italic text-slate-400">Ads desativado para esta conta.</p>
      )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-slate-50/60 border border-slate-100 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Última sincronização</p>
          <p className="mt-0.5 font-semibold text-slate-700">{fmtDateTime(row.last_sync_at)}</p>
        </div>
        <div className="rounded-lg bg-slate-50/60 border border-slate-100 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Próxima sincronização</p>
          <p className="mt-0.5 font-semibold text-slate-700">{fmtDateTime(row.next_sync_at)}</p>
        </div>
      </div>

      {row.last_error_message && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-2 text-[11px] text-rose-700">
          <span className="font-bold">Último erro:</span> {row.last_error_message}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleConnect}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          <Plug className="h-3.5 w-3.5" />
          Conectar {row.marketplace ?? "Marketplace"}
        </button>
      </div>
    </div>
  );
}

function IntegrationsSection() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<IntegrationRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: ctx } = await supabase
          .from("vw_user_access_context")
          .select("company_id")
          .maybeSingle();
        if (!ctx?.company_id) {
          if (!cancelled) setRows([]);
          return;
        }
        const { data, error: err } = await supabase
          .from("vw_ecommerce_integration_status")
          .select(
            "company_name, account_name, marketplace, integration_name, integration_status, readable_status, is_token_valid, last_sync_at, next_sync_at, sync_products, sync_orders, sync_ads, sync_inventory, last_error_message, last_error_at",
          )
          .eq("company_id", ctx.company_id);
        if (err) throw err;
        if (!cancelled) setRows((data as IntegrationRow[]) ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Erro ao carregar integrações.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ConfigSection title="Integrações" icon={Plug}>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando integrações…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
          <Plug className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-700">
            Nenhuma integração configurada para esta empresa.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Conecte um marketplace para começar a sincronizar produtos, pedidos e estoque.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rows.map((row, i) => (
            <IntegrationCard key={i} row={row} />
          ))}
        </div>
      )}
    </ConfigSection>
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
          <IntegrationsSection />

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
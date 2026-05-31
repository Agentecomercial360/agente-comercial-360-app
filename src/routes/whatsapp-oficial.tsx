import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plug,
  Phone,
  Webhook,
  Building2,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/whatsapp-oficial")({
  component: WhatsAppOficialPage,
  head: () => ({ meta: [{ title: "WhatsApp Oficial | Agente Comercial 360" }] }),
});

type ConnectionStatus = "not_connected" | "pending" | "connected" | "error";
type WebhookStatus = "pending" | "active" | "error";

type WhatsAppRow = {
  display_phone_number: string | null;
  provider: string | null;
  connection_type: string | null;
  connection_status: ConnectionStatus | null;
  webhook_status: WebhookStatus | null;
  sector: string | null;
  is_primary: boolean | null;
  is_active: boolean | null;
  connected_at: string | null;
  last_sync_at: string | null;
};

const connectionLabel: Record<ConnectionStatus, { text: string; cls: string }> = {
  not_connected: { text: "Não conectado", cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-200" },
  pending: { text: "Pendente", cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200" },
  connected: { text: "Conectado", cls: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" },
  error: { text: "Erro", cls: "bg-rose-100 text-rose-700 ring-1 ring-rose-200" },
};

const webhookLabel: Record<WebhookStatus, { text: string; cls: string }> = {
  pending: { text: "Pendente", cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200" },
  active: { text: "Ativo", cls: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" },
  error: { text: "Erro", cls: "bg-rose-100 text-rose-700 ring-1 ring-rose-200" },
};

function WhatsAppOficialPage() {
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<WhatsAppRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setLoading(false);
          return;
        }
        const { data: cu } = await supabase
          .from("company_users")
          .select("company_id")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .maybeSingle();
        if (!cu?.company_id) {
          setLoading(false);
          return;
        }
        const { data } = await supabase
          .from("company_whatsapp_numbers")
          .select(
            "display_phone_number,provider,connection_type,connection_status,webhook_status,sector,is_primary,is_active,connected_at,last_sync_at"
          )
          .eq("company_id", cu.company_id)
          .eq("is_active", true)
          .order("is_primary", { ascending: false })
          .limit(1)
          .maybeSingle();
        setRow((data as WhatsAppRow | null) ?? null);
      } catch {
        setRow(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const connStatus: ConnectionStatus = row?.connection_status ?? "not_connected";
  const whStatus: WebhookStatus = row?.webhook_status ?? "pending";
  const numero = row?.display_phone_number ?? "Não conectado";
  const tipo =
    row?.connection_type ??
    (row?.provider ? `${row.provider}` : "Meta Cloud API");

  const dadosNecessarios = [
    "Conta Meta Business da empresa",
    "WhatsApp Business Account",
    "Número comercial disponível",
    "Verificação por SMS ou ligação",
    "Nome de exibição da empresa",
    "Permissão de administrador",
  ];

  const fluxo = [
    "Cliente envia mensagem",
    "Meta Cloud API",
    "Webhook seguro",
    "n8n / backend",
    "Supabase",
    "Painel Agente Comercial 360",
  ];

  const checklist = [
    "Criar app no Meta for Developers",
    "Adicionar produto WhatsApp",
    "Configurar WABA",
    "Registrar número comercial",
    "Configurar webhook",
    "Testar recebimento de mensagem",
    "Testar envio de resposta",
    "Salvar mensagens no Supabase",
    "Exibir mensagens no painel",
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 shadow-sm">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  API Oficial
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  Meta Cloud
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  Conexão segura
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                WhatsApp Oficial
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-blue-100/90">
                Configure a conexão oficial da empresa com a Meta Cloud API para centralizar mensagens, atendimentos e notificações no painel.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:w-80">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-100/80">
                  Status da integração
                </p>
                <span className="text-[10px] font-medium text-blue-200/70">
                  {loading ? "Sincronizando…" : "Atualizado agora"}
                </span>
              </div>
              <div className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-blue-100/80 text-xs">Número conectado</span>
                  <span className="text-white font-semibold text-xs truncate">{numero}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-blue-100/80 text-xs">Webhook</span>
                  <span className="text-white font-semibold text-xs">
                    {webhookLabel[whStatus].text}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-blue-100/80 text-xs">Empresa</span>
                  <span className="text-white font-semibold text-xs">União Auto Peças</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-blue-100/80 text-xs">Tipo</span>
                  <span className="text-white font-semibold text-xs">{tipo}</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-blue-100/70">
                Estrutura preparada para conexão oficial do WhatsApp Business da empresa.
              </p>
            </div>
          </div>
        </div>

        {/* STATUS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            icon={Phone}
            label="Número"
            value={numero}
            badge={connectionLabel[connStatus]}
          />
          <StatusCard
            icon={Webhook}
            label="Webhook"
            value={webhookLabel[whStatus].text}
            badge={webhookLabel[whStatus]}
          />
          <StatusCard
            icon={Building2}
            label="Setor"
            value={row?.sector ?? "—"}
            badge={{ text: row?.is_primary ? "Principal" : "Secundário", cls: "bg-blue-100 text-blue-700 ring-1 ring-blue-200" }}
          />
          <StatusCard
            icon={Shield}
            label="Última sincronização"
            value={row?.last_sync_at ? new Date(row.last_sync_at).toLocaleString("pt-BR") : "—"}
            badge={{ text: connectionLabel[connStatus].text, cls: connectionLabel[connStatus].cls }}
          />
        </div>

        {/* MAIN CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Conectar */}
          <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-emerald-100">
                <Plug className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Conectar WhatsApp da empresa</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  Inicie a conexão oficial do WhatsApp Business da empresa para permitir recebimento de mensagens, registro de conversas e roteamento por setor.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition"
                >
                  <Plug className="h-4 w-4" />
                  Conectar WhatsApp da empresa
                </button>
              </div>
            </div>
          </div>

          {/* Dados necessários */}
          <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 ring-1 ring-blue-100">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Dados necessários</h3>
                <ul className="mt-3 space-y-2">
                  {dadosNecessarios.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Fluxo */}
          <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-violet-50 p-2.5 ring-1 ring-violet-100">
                <ArrowRight className="h-5 w-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Fluxo da integração</h3>
                <div className="mt-4 space-y-1.5">
                  {fluxo.map((step, idx) => (
                    <div key={step}>
                      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[11px] font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-800">{step}</span>
                      </div>
                      {idx < fluxo.length - 1 && (
                        <div className="ml-3 my-0.5 h-3 w-px bg-slate-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Roteamento */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-emerald-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2.5 ring-1 ring-blue-100">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Roteamento por setor</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  Após a conexão, as mensagens poderão ser classificadas por setor, como Vendas, Financeiro, Administrativo, Orçamentos e Suporte.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Vendas", "Financeiro", "Administrativo", "Orçamentos", "Suporte"].map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Próximas etapas */}
        <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 ring-1 ring-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Próximas etapas</h3>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {checklist.map((item) => (
              <label
                key={item}
                className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  disabled
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-emerald-100">
                <AlertCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Conexão oficial</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              A integração oficial será conectada via Meta Cloud API e Embedded Signup. Na próxima etapa, a empresa autorizará o WhatsApp Business, validará o número e o sistema salvará WABA ID e Phone Number ID de forma segura.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  badge: { text: string; cls: string };
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-slate-100 p-2">
          <Icon className="h-4 w-4 text-slate-700" />
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.cls}`}>
          {badge.text}
        </span>
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900 truncate">{value}</p>
    </div>
  );
}

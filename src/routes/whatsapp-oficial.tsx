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
  MessageCircle,
  Cloud,
  Server,
  Database,
  LayoutDashboard,
  Send,
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
  pending: { text: "Webhook Pendente", cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200" },
  active: { text: "Webhook Ativo", cls: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" },
  error: { text: "Webhook Erro", cls: "bg-rose-100 text-rose-700 ring-1 ring-rose-200" },
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

  const fluxo: { title: string; icon: typeof Phone; accent: string }[] = [
    { title: "Cliente envia mensagem", icon: MessageCircle, accent: "from-emerald-500 to-emerald-600" },
    { title: "Meta Cloud API", icon: Cloud, accent: "from-blue-500 to-blue-600" },
    { title: "Webhook seguro", icon: Webhook, accent: "from-violet-500 to-violet-600" },
    { title: "n8n / Backend", icon: Server, accent: "from-indigo-500 to-indigo-600" },
    { title: "Supabase", icon: Database, accent: "from-teal-500 to-teal-600" },
    { title: "Painel Agente Comercial 360", icon: LayoutDashboard, accent: "from-slate-700 to-slate-900" },
  ];

  const checklist: { item: string; phase: "Pendente" | "Próxima fase" }[] = [
    { item: "Criar app no Meta for Developers", phase: "Pendente" },
    { item: "Adicionar produto WhatsApp", phase: "Pendente" },
    { item: "Configurar WABA", phase: "Pendente" },
    { item: "Registrar número comercial", phase: "Pendente" },
    { item: "Configurar webhook", phase: "Próxima fase" },
    { item: "Testar recebimento de mensagem", phase: "Próxima fase" },
    { item: "Testar envio de resposta", phase: "Próxima fase" },
    { item: "Salvar mensagens no Supabase", phase: "Próxima fase" },
    { item: "Exibir mensagens no painel", phase: "Próxima fase" },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#070b1f] via-[#0b1a3a] to-[#062a2a] p-6 shadow-2xl shadow-emerald-900/20">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/40 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  API Oficial
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-white/20 backdrop-blur-sm">
                  Meta Cloud
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-white/20 backdrop-blur-sm">
                  Conexão segura
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                WhatsApp Oficial
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100/85">
                Central de integração oficial da empresa com a Meta Cloud API. Centralize mensagens, atendimentos e roteamento automático por setor em um único painel.
              </p>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-xl shadow-black/30 backdrop-blur-xl lg:w-96">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/20 p-1.5 ring-1 ring-emerald-400/30">
                    <Plug className="h-4 w-4 text-emerald-300" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100/90">
                    Status da integração
                  </p>
                </div>
                <span className="text-[10px] font-medium text-blue-200/70">
                  {loading ? "Sincronizando…" : "Atualizado"}
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                <HeroStatusRow
                  label="Conexão"
                  value={connectionLabel[connStatus].text}
                  cls="bg-slate-500/20 text-slate-100 ring-1 ring-slate-300/30"
                />
                <HeroStatusRow
                  label="Webhook"
                  value={webhookLabel[whStatus].text}
                  cls="bg-amber-400/20 text-amber-200 ring-1 ring-amber-300/40"
                />
                <HeroStatusRow
                  label="Provedor"
                  value={tipo}
                  cls="bg-blue-500/20 text-blue-100 ring-1 ring-blue-300/40"
                />
                <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
                  <span className="text-xs text-blue-100/80">Empresa</span>
                  <span className="text-xs font-semibold text-white">União Auto Peças</span>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-blue-100/70">
                Estrutura preparada para a próxima etapa de conexão oficial via Embedded Signup da Meta.
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
            accent="border-l-emerald-500"
            iconCls="bg-emerald-50 text-emerald-600 ring-emerald-100"
          />
          <StatusCard
            icon={Webhook}
            label="Webhook"
            value={whStatus === "active" ? "Ativo" : whStatus === "error" ? "Erro" : "Pendente"}
            badge={webhookLabel[whStatus]}
            accent="border-l-amber-500"
            iconCls="bg-amber-50 text-amber-600 ring-amber-100"
          />
          <StatusCard
            icon={Building2}
            label="Setor"
            value={row?.sector ?? "—"}
            badge={{ text: row?.is_primary ? "Principal" : "Secundário", cls: "bg-blue-100 text-blue-700 ring-1 ring-blue-200" }}
            accent="border-l-blue-500"
            iconCls="bg-blue-50 text-blue-600 ring-blue-100"
          />
          <StatusCard
            icon={Shield}
            label="Última sincronização"
            value={row?.last_sync_at ? new Date(row.last_sync_at).toLocaleString("pt-BR") : "—"}
            badge={{ text: connectionLabel[connStatus].text, cls: connectionLabel[connStatus].cls }}
            accent="border-l-violet-500"
            iconCls="bg-violet-50 text-violet-600 ring-violet-100"
          />
        </div>

        {/* CTA PRINCIPAL - Conectar */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-7 shadow-sm">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3.5 shadow-lg shadow-emerald-500/30">
                <Plug className="h-6 w-6 text-white" />
              </div>
              <div className="max-w-xl">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  Conectar WhatsApp da empresa
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  Inicie a configuração oficial do WhatsApp Business para receber mensagens, registrar conversas e ativar o roteamento por setor.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <button
                onClick={() => setModalOpen(true)}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50 hover:-translate-y-0.5"
              >
                <Plug className="h-4 w-4" />
                Conectar WhatsApp da empresa
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
              <p className="text-[11px] text-slate-500">
                Conexão oficial preparada para a próxima etapa via Meta Cloud API.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Dados necessários */}
          <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 ring-1 ring-blue-100">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Dados necessários</h3>
            </div>
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dadosNecessarios.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-2.5 rounded-lg bg-slate-50/70 px-3 py-2.5 ring-1 ring-slate-100"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  </span>
                  <span className="text-sm text-slate-700">{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Roteamento */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 shadow-sm">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 ring-1 ring-blue-100 shadow-sm">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Roteamento por setor</h3>
            </div>
            <p className="relative mt-4 text-sm leading-relaxed text-slate-700">
              As mensagens poderão ser classificadas automaticamente e direcionadas para o responsável correto.
            </p>
            <div className="relative mt-4 flex flex-wrap gap-2">
              {[
                { name: "Vendas", cls: "from-emerald-500 to-emerald-600" },
                { name: "Financeiro", cls: "from-blue-500 to-blue-600" },
                { name: "Administrativo", cls: "from-slate-600 to-slate-800" },
                { name: "Orçamentos", cls: "from-amber-500 to-amber-600" },
                { name: "Suporte", cls: "from-violet-500 to-violet-600" },
              ].map((s) => (
                <span
                  key={s.name}
                  className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${s.cls} px-3 py-1.5 text-xs font-semibold text-white shadow-sm`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Fluxo - full width */}
        <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 ring-1 ring-violet-100">
              <Send className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Fluxo da integração</h3>
              <p className="text-xs text-slate-500">Arquitetura técnica do recebimento e processamento de mensagens</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {fluxo.map((step, idx) => (
              <div key={step.title} className="relative">
                <div className="group h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg bg-gradient-to-br ${step.accent} p-2 shadow-sm`}>
                      <step.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-3 text-[13px] font-semibold leading-tight text-slate-800">
                    {step.title}
                  </p>
                </div>
                {idx < fluxo.length - 1 && (
                  <div className="pointer-events-none hidden lg:flex absolute top-1/2 -right-2 z-10 -translate-y-1/2 items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Próximas etapas */}
        <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 ring-1 ring-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Próximas etapas</h3>
                <p className="text-xs text-slate-500">Checklist da configuração oficial da Meta</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">
              {checklist.length} etapas
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {checklist.map(({ item, phase }) => (
              <label
                key={item}
                className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 transition hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white ring-1 ring-slate-100 transition group-hover:border-emerald-400">
                    <input
                      type="checkbox"
                      disabled
                      className="h-3 w-3 appearance-none rounded-sm border-0 bg-transparent"
                    />
                  </span>
                  <span className="text-sm leading-snug text-slate-700">{item}</span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${
                    phase === "Pendente"
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : "bg-blue-50 text-blue-700 ring-blue-200"
                  }`}
                >
                  {phase}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
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

function HeroStatusRow({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
      <span className="text-xs text-blue-100/80">{label}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
        {value}
      </span>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
  badge,
  accent,
  iconCls,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  badge: { text: string; cls: string };
  accent: string;
  iconCls: string;
}) {
  return (
    <div
      className={`group rounded-2xl border border-slate-200 border-l-4 ${accent} bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-2.5 ring-1 ${iconCls}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.cls}`}
        >
          {badge.text}
        </span>
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900 truncate" title={value}>
        {value}
      </p>
    </div>
  );
}

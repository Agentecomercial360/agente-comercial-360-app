import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Building2,
  Tag,
  Activity,
  Puzzle,
  MapPin,
  Phone,
  Clock,
  Globe,
  Paintbrush,
  Bell,
  FileBarChart,
  ShieldCheck,
  Lock,
  Database,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  X,
  AlertTriangle,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
  head: () => ({ meta: [{ title: "Configurações | Agente Comercial 360" }] }),
});

const defaultEmpresa = {
  nome: "União Auto Peças",
  segmento: "Autopeças",
  tipoNegocio: "Comércio de peças automotivas",
  telefone: "5515996083076",
  cidade: "Capão Bonito - SP",
  endereco: "Endereço comercial da empresa",
  horario: "08:00 às 18:00",
  status: "Ativa",
};

const defaultPreferencias = {
  empresaPadrao: "União Auto Peças",
  idioma: "Português Brasil",
  fusoHorario: "São Paulo / Brasil",
  temaVisual: "Claro premium",
  notificacoes: "Ativas",
  relatorios: "Ativos",
};

const integracoes = [
  { nome: "Supabase", status: "Preparado para conexão futura", cor: "bg-blue-100 text-blue-700 ring-1 ring-blue-200" },
  { nome: "n8n", status: "Workflow em estruturação", cor: "bg-amber-100 text-amber-700 ring-1 ring-amber-200" },
  { nome: "WhatsApp Cloud API", status: "Preparado para API oficial da Meta", cor: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" },
  { nome: "OpenAI", status: "Configurada, aguardando crédito ativo", cor: "bg-slate-100 text-slate-700 ring-1 ring-slate-200" },
];

const seguranca = [
  "Login com e-mail e senha",
  "Controle de acesso por empresa",
  "Dados separados por cliente",
  "Futuro controle por perfil de usuário",
  "Ambiente preparado para autenticação Supabase",
];

function ConfiguracoesPage() {
  const [empresa, setEmpresa] = useState(defaultEmpresa);
  const [preferencias, setPreferencias] = useState(defaultPreferencias);
  const [saved, setSaved] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  // Teste temporário de conexão Supabase (apenas SELECT, somente no clique)
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<
    | { kind: "ok-found"; name: string }
    | { kind: "ok-empty" }
    | { kind: "error"; message: string }
    | null
  >(null);

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, segment, phone, city, status")
        .limit(1);
      if (error) {
        setTestResult({ kind: "error", message: error.message });
      } else if (!data || data.length === 0) {
        setTestResult({ kind: "ok-empty" });
      } else {
        setTestResult({ kind: "ok-found", name: (data[0] as { name?: string }).name ?? "(sem nome)" });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      setTestResult({ kind: "error", message: msg });
    } finally {
      setTestLoading(false);
    }
  };

  const hasChanges = useMemo(() => {
    return (
      empresa.nome !== defaultEmpresa.nome ||
      empresa.segmento !== defaultEmpresa.segmento ||
      empresa.tipoNegocio !== defaultEmpresa.tipoNegocio ||
      empresa.telefone !== defaultEmpresa.telefone ||
      empresa.cidade !== defaultEmpresa.cidade ||
      empresa.endereco !== defaultEmpresa.endereco ||
      empresa.horario !== defaultEmpresa.horario ||
      empresa.status !== defaultEmpresa.status ||
      preferencias.empresaPadrao !== defaultPreferencias.empresaPadrao ||
      preferencias.idioma !== defaultPreferencias.idioma ||
      preferencias.fusoHorario !== defaultPreferencias.fusoHorario ||
      preferencias.temaVisual !== defaultPreferencias.temaVisual ||
      preferencias.notificacoes !== defaultPreferencias.notificacoes ||
      preferencias.relatorios !== defaultPreferencias.relatorios
    );
  }, [empresa, preferencias]);

  const summary = [
    { label: "Empresa ativa", value: empresa.nome || "—", icon: Building2 },
    { label: "Segmento", value: empresa.segmento || "—", icon: Tag },
    { label: "Status", value: empresa.status || "—", icon: Activity },
    { label: "Integrações", value: "3 preparadas", icon: Puzzle },
  ];

  const handleSave = () => {
    setSaved(true);
    toast.success("Configurações salvas localmente.", {
      description: "Alterações salvas apenas nesta sessão visual.",
    });
  };

  const openRestore = () => {
    setConfirmOpen(true);
  };

  const confirmRestore = () => {
    setEmpresa(defaultEmpresa);
    setPreferencias(defaultPreferencias);
    setSaved(true);
    setConfirmOpen(false);
    toast.success("Configurações padrão restauradas.");
  };

  const empresaFields: { key: keyof typeof empresa; label: string; icon: React.ElementType }[] = [
    { key: "nome", label: "Nome da empresa", icon: Building2 },
    { key: "segmento", label: "Segmento", icon: Tag },
    { key: "tipoNegocio", label: "Tipo de negócio", icon: Puzzle },
    { key: "telefone", label: "Telefone principal", icon: Phone },
    { key: "cidade", label: "Cidade", icon: MapPin },
    { key: "endereco", label: "Endereço", icon: MapPin },
    { key: "horario", label: "Horário de atendimento", icon: Clock },
    { key: "status", label: "Status", icon: Activity },
  ];

  const prefFields: { key: keyof typeof preferencias; label: string; icon: React.ElementType }[] = [
    { key: "empresaPadrao", label: "Empresa padrão", icon: Building2 },
    { key: "idioma", label: "Idioma", icon: Globe },
    { key: "fusoHorario", label: "Fuso horário", icon: Clock },
    { key: "temaVisual", label: "Tema visual", icon: Paintbrush },
    { key: "notificacoes", label: "Notificações internas", icon: Bell },
    { key: "relatorios", label: "Relatórios gerenciais", icon: FileBarChart },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Configurações
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Gerencie os dados da empresa, preferências do sistema e parâmetros gerais da operação.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl bg-card p-5 border border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Dirty indicator */}
        {hasChanges && !saved && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Alterações locais não salvas
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Dados da empresa */}
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Dados da empresa</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {empresaFields.map((campo) => {
                const Icon = campo.icon;
                return (
                  <div key={campo.key} className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {campo.label}
                    </label>
                    <input
                      type="text"
                      value={empresa[campo.key]}
                      onChange={(e) => {
                        setEmpresa((prev) => ({ ...prev, [campo.key]: e.target.value }));
                        setSaved(false);
                      }}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferências + Segurança */}
          <div className="space-y-4">
            {/* Preferências do sistema */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-primary">
                  <Paintbrush className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Preferências do sistema</h3>
              </div>
              <div className="space-y-4">
                {prefFields.map((pref) => {
                  const Icon = pref.icon;
                  return (
                    <div key={pref.key} className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                        {pref.label}
                      </label>
                      <input
                        type="text"
                        value={preferencias[pref.key]}
                        onChange={(e) => {
                          setPreferencias((prev) => ({ ...prev, [pref.key]: e.target.value }));
                          setSaved(false);
                        }}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Segurança e acesso */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Segurança e acesso</h3>
              </div>
              <ul className="space-y-3">
                {seguranca.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Integrações preparadas */}
        <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-primary">
              <Puzzle className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Integrações preparadas</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {integracoes.map((int) => (
              <div
                key={int.nome}
                className="rounded-xl border border-border bg-background p-4 space-y-2"
              >
                <div className="text-sm font-semibold text-foreground">{int.nome}</div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${int.cor}`}
                >
                  {int.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Observation + AI summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Observation */}
          <div className="lg:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Database className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Observação</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nesta fase, as informações exibidas são apenas visuais. A conexão com Supabase será
              feita futuramente, começando por login/autenticação e tabela{" "}
              <span className="font-semibold text-foreground">companies</span>.
            </p>
          </div>

          {/* AI summary */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-[var(--brand-blue-soft)] to-card p-6 shadow-[var(--shadow-soft)] h-fit">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Resumo da IA</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A configuração atual está{" "}
              <span className="font-semibold text-foreground">100% preparada</span> para receber
              conexão com Supabase. Empresa, preferências e integrações estão mapeadas para futura
              persistência de dados.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
          >
            <Save className="h-4 w-4" />
            Salvar configurações
          </button>
          <button
            onClick={openRestore}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar padrão
          </button>
          <button
            onClick={() => setViewOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition"
          >
            <Eye className="h-4 w-4" />
            Ver dados da empresa
          </button>
        </div>
      </div>

      {/* Restore confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Restaurar configurações padrão?
              </h2>
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Essa ação irá restaurar os valores mockados iniciais desta tela. Nenhuma alteração real será feita no Supabase.
            </p>
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRestore}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm"
              >
                Restaurar padrão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View company data modal */}
      {viewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Dados da empresa</h2>
              <button
                onClick={() => setViewOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {empresaFields.map((campo) => {
                const Icon = campo.icon;
                return (
                  <div key={campo.key} className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {campo.label}
                    </label>
                    <p className="text-sm text-foreground">{empresa[campo.key]}</p>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl bg-[var(--brand-blue-soft)] border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Observação</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Esses dados serão conectados futuramente à tabela companies do Supabase.
              </p>
            </div>
            <div className="flex items-center justify-end pt-1">
              <button
                onClick={() => setViewOpen(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

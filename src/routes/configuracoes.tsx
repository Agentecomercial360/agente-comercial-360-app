import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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

  // Carregamento da empresa real vinculada ao usuário logado (somente SELECT)
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [companyLoadStatus, setCompanyLoadStatus] = useState<
    "loading" | "loaded" | "unauthenticated" | "error"
  >("loading");
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [activeCompanyCreatedAt, setActiveCompanyCreatedAt] = useState<string | null>(null);
  const [activeCompanyEmail, setActiveCompanyEmail] = useState<string | null>(null);
  const [activeCompanyToneOfVoice, setActiveCompanyToneOfVoice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (cancelled) return;
        if (userError || !userData?.user) {
          setCompanyLoadStatus("unauthenticated");
          setLoadingCompany(false);
          return;
        }

        const { data: link, error: linkError } = await supabase
          .from("company_users")
          .select("company_id, role, is_active")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .single();
        if (cancelled) return;
        if (linkError || !link?.company_id) {
          setCompanyLoadStatus("error");
          setLoadingCompany(false);
          return;
        }

        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("id, name, business_type, segment, phone, email, address, tone_of_voice, created_at")
          .eq("id", link.company_id)
          .single();
        if (cancelled) return;
        if (companyError || !company) {
          setCompanyLoadStatus("error");
          setLoadingCompany(false);
          return;
        }

        setEmpresa({
          ...defaultEmpresa,
          nome: (company.name as string) ?? defaultEmpresa.nome,
          segmento: (company.segment as string) ?? defaultEmpresa.segmento,
          tipoNegocio: (company.business_type as string) ?? defaultEmpresa.tipoNegocio,
          telefone: (company.phone as string) ?? defaultEmpresa.telefone,
          endereco: (company.address as string) ?? defaultEmpresa.endereco,
          cidade: defaultEmpresa.cidade,
          horario: defaultEmpresa.horario,
          status: defaultEmpresa.status,
        });
        setActiveCompanyId((company.id as string) ?? null);
        setActiveCompanyCreatedAt((company.created_at as string) ?? null);
        setActiveCompanyEmail((company.email as string) ?? null);
        setActiveCompanyToneOfVoice((company.tone_of_voice as string) ?? null);
        setSaved(true);
        setCompanyLoadStatus("loaded");
        setLoadingCompany(false);
      } catch {
        if (!cancelled) {
          setCompanyLoadStatus("error");
          setLoadingCompany(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Teste temporário de conexão Supabase (apenas SELECT, somente no clique)
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<
    | { kind: "ok-found"; name: string; columns: string[] }
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
        .select("*")
        .limit(1);
      if (error) {
        setTestResult({ kind: "error", message: error.message });
      } else if (!data || data.length === 0) {
        setTestResult({ kind: "ok-empty" });
      } else {
        const row = data[0] as Record<string, unknown>;
        const name = typeof row.name === "string" ? row.name : "(sem nome)";
        setTestResult({ kind: "ok-found", name, columns: Object.keys(row) });
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
    toast.success(
      "Alterações aplicadas apenas nesta sessão. Salvamento definitivo no Supabase ainda não está ativo nesta tela.",
    );
  };

  const openRestore = () => {
    setConfirmOpen(true);
  };

  const confirmRestore = () => {
    setEmpresa(defaultEmpresa);
    setPreferencias(defaultPreferencias);
    setSaved(true);
    setConfirmOpen(false);
    toast.success(
      "Restauração aplicada apenas localmente. Nenhuma alteração foi enviada ao Supabase.",
    );
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
        {/* HERO PREMIUM */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#070b1f] via-[#0b1a3a] to-[#062a2a] p-5 shadow-2xl shadow-emerald-900/20">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/40 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Configuração ativa
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-white/20 backdrop-blur-sm">
                  Parâmetros do sistema
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-white/20 backdrop-blur-sm">
                  Integrações preparadas
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Configurações
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-blue-100/85">
                Gerencie os dados da empresa, preferências do sistema e parâmetros gerais da operação.
              </p>
              {companyLoadStatus !== "loaded" && (
                <div className="mt-3 text-xs">
                  {companyLoadStatus === "loading" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-blue-100 ring-1 ring-white/20">
                      Carregando empresa vinculada...
                    </span>
                  )}
                  {companyLoadStatus === "unauthenticated" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-1 text-amber-200 ring-1 ring-amber-300/40">
                      Empresa vinculada à sessão atual
                    </span>
                  )}
                  {companyLoadStatus === "error" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-1 text-amber-200 ring-1 ring-amber-300/40">
                      Usando dados locais temporários
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.07] p-3.5 shadow-xl shadow-black/30 backdrop-blur-xl lg:w-96">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/20 p-1.5 ring-1 ring-emerald-400/30">
                    <Sparkles className="h-4 w-4 text-emerald-300" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100/90">
                    Resumo da configuração
                  </p>
                </div>
                <span className="text-[10px] font-medium text-blue-200/70">
                  {loadingCompany ? "Sincronizando…" : "Atualizado"}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-2.5 py-1.5 ring-1 ring-white/10">
                  <span className="text-xs text-blue-100/80">Empresa</span>
                  <span className="text-xs font-semibold text-white truncate max-w-[55%] text-right">{empresa.nome}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-2.5 py-1.5 ring-1 ring-white/10">
                  <span className="text-xs text-blue-100/80">Status</span>
                  <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-300/40">
                    {empresa.status}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-2.5 py-1.5 ring-1 ring-white/10">
                  <span className="text-xs text-blue-100/80">Segmento</span>
                  <span className="text-xs font-semibold text-white">{empresa.segmento}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-2.5 py-1.5 ring-1 ring-white/10">
                  <span className="text-xs text-blue-100/80">Integrações</span>
                  <span className="text-xs font-semibold text-white">3 preparadas</span>
                </div>
              </div>

              <p className="mt-2 text-[11px] leading-relaxed text-blue-100/70">
                Ambiente configurado para personalização da operação, integrações futuras e controle seguro de acesso.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards - premium accent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((s, i) => {
            const Icon = s.icon;
            const accents = [
              { border: "border-l-emerald-500", icon: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
              { border: "border-l-blue-500", icon: "bg-blue-50 text-blue-600 ring-blue-100" },
              { border: "border-l-violet-500", icon: "bg-violet-50 text-violet-600 ring-violet-100" },
              { border: "border-l-amber-500", icon: "bg-amber-50 text-amber-600 ring-amber-100" },
            ];
            const a = accents[i % accents.length];
            return (
              <div
                key={s.label}
                className={`rounded-2xl border border-slate-200 border-l-4 ${a.border} bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${a.icon}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground truncate">
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
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="rounded-xl bg-blue-50 p-2.5 ring-1 ring-blue-100">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Dados da empresa</h3>
                <p className="text-xs text-slate-500">Informações principais da operação</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
              {empresaFields.map((campo) => {
                const Icon = campo.icon;
                return (
                  <div key={campo.key} className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
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
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferências + Segurança */}
          <div className="space-y-4">
            {/* Preferências do sistema */}
            <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="rounded-xl bg-violet-50 p-2.5 ring-1 ring-violet-100">
                  <Paintbrush className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Preferências do sistema</h3>
                  <p className="text-xs text-slate-500">Parâmetros gerais</p>
                </div>
              </div>
              <div className="space-y-3.5">
                {prefFields.map((pref) => {
                  const Icon = pref.icon;
                  return (
                    <div key={pref.key} className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
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
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Segurança e acesso */}
            <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-emerald-100">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Segurança e acesso</h3>
                  <p className="text-xs text-slate-500">Controles ativos no ambiente</p>
                </div>
              </div>
              <ul className="space-y-2">
                {seguranca.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg bg-slate-50/70 px-3 py-2.5 ring-1 ring-slate-100"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                      <Lock className="h-3 w-3 text-emerald-600" />
                    </span>
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>


        {/* Integrações preparadas - premium */}
        <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 ring-1 ring-blue-100">
              <Puzzle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Integrações preparadas</h3>
              <p className="text-xs text-slate-500">Conexões já mapeadas, aguardando ativação oficial</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {integracoes.map((int, i) => {
              const accents = [
                "from-blue-500 to-blue-600",
                "from-amber-500 to-amber-600",
                "from-emerald-500 to-emerald-600",
                "from-slate-600 to-slate-800",
              ];
              return (
                <div
                  key={int.nome}
                  className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg bg-gradient-to-br ${accents[i % accents.length]} p-2 shadow-sm`}>
                      <Puzzle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-3 text-sm font-bold text-slate-900">{int.nome}</div>
                  <span
                    className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${int.cor}`}
                  >
                    {int.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teste de conexão Supabase - premium card */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-7 shadow-sm">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-3.5 shadow-lg shadow-blue-500/30">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div className="max-w-xl">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  Teste de conexão Supabase
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  Verificação rápida de conectividade — apenas SELECT na tabela{" "}
                  <span className="font-semibold text-slate-800">companies</span>. Nenhuma escrita é realizada.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <button
                onClick={handleTestConnection}
                disabled={testLoading}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <Database className="h-4 w-4" />
                {testLoading ? "Testando..." : "Testar conexão"}
              </button>
              <p className="text-[11px] text-slate-500">
                Operação somente leitura, segura para execução.
              </p>
            </div>
          </div>
          {testResult && (
            <div
              className={`relative mt-5 text-sm rounded-xl px-4 py-3 ${
                testResult.kind === "error"
                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                  : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              }`}
            >
              {testResult.kind === "ok-found" && (
                <div className="space-y-1">
                  <div className="font-semibold">{`Conexão Supabase OK — empresa encontrada: ${testResult.name}`}</div>
                  <div className="text-xs text-emerald-700/70 font-mono break-all">
                    colunas: {testResult.columns.join(", ")}
                  </div>
                </div>
              )}
              {testResult.kind === "ok-empty" &&
                "Conexão Supabase OK — nenhuma empresa encontrada."}
              {testResult.kind === "error" &&
                `Erro ao conectar Supabase: ${testResult.message}`}
            </div>
          )}
        </div>

        {/* Observação + Resumo do ambiente - premium */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-amber-100 p-2.5 ring-1 ring-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Observação</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              Nesta fase, as informações exibidas são apenas visuais. A conexão com Supabase será
              feita futuramente, começando por login/autenticação e tabela{" "}
              <span className="font-semibold text-slate-900">companies</span>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#070b1f] via-[#0b1a3a] to-[#062a2a] p-6 shadow-lg shadow-blue-900/20 h-fit">
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-xl bg-emerald-500/20 p-2 ring-1 ring-emerald-400/30">
                <Sparkles className="h-4 w-4 text-emerald-300" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                Resumo do ambiente
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-blue-100/85">
              A configuração atual está{" "}
              <span className="font-semibold text-white">100% preparada</span> para receber
              conexão com Supabase. Empresa, preferências e integrações estão mapeadas para futura
              persistência de dados.
            </p>
          </div>
        </div>

        {/* Banner de aviso de persistência */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Os dados da empresa são carregados do Supabase. Nesta etapa, alterações feitas em
          Configurações ainda <strong>não são persistidas</strong> no banco — elas valem apenas
          nesta sessão visual.
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex flex-col gap-1">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
            >
              <Save className="h-4 w-4" />
              Salvar alterações localmente
            </button>
            <span className="text-[11px] text-muted-foreground">
              Salvamento no Supabase será ativado em uma próxima fase.
            </span>
          </div>
          <button
            onClick={openRestore}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar padrão (local)
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
              Restaurar valores iniciais desta tela. Nenhuma alteração será persistida no banco de dados.
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
            {(activeCompanyId || activeCompanyEmail || activeCompanyToneOfVoice || activeCompanyCreatedAt) && (
              <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dados do Supabase
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {activeCompanyId && (
                    <div>
                      <dt className="text-xs text-muted-foreground">ID da empresa</dt>
                      <dd className="font-mono text-xs break-all text-foreground">{activeCompanyId}</dd>
                    </div>
                  )}
                  {activeCompanyEmail && (
                    <div>
                      <dt className="text-xs text-muted-foreground">E-mail</dt>
                      <dd className="text-foreground">{activeCompanyEmail}</dd>
                    </div>
                  )}
                  {activeCompanyToneOfVoice && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground">Tom de voz da IA</dt>
                      <dd className="text-foreground">{activeCompanyToneOfVoice}</dd>
                    </div>
                  )}
                  {activeCompanyCreatedAt && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Criado em</dt>
                      <dd className="text-foreground">{new Date(activeCompanyCreatedAt).toLocaleString("pt-BR")}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
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

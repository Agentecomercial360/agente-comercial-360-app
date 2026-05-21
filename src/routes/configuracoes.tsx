import { createFileRoute } from "@tanstack/react-router";
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
  Users,
  Database,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
  head: () => ({ meta: [{ title: "Configurações | Agente Comercial 360" }] }),
});

const summary = [
  { label: "Empresa ativa", value: "União Auto Peças", icon: Building2 },
  { label: "Segmento", value: "Autopeças", icon: Tag },
  { label: "Status", value: "Ativa", icon: Activity },
  { label: "Integrações", value: "3 preparadas", icon: Puzzle },
];

const dadosEmpresa = [
  { label: "Nome da empresa", value: "União Auto Peças", icon: Building2 },
  { label: "Segmento", value: "Autopeças", icon: Tag },
  { label: "Tipo de negócio", value: "Comércio de peças automotivas", icon: Puzzle },
  { label: "Telefone principal", value: "5515996083076", icon: Phone },
  { label: "Cidade", value: "Capão Bonito - SP", icon: MapPin },
  { label: "Endereço", value: "Endereço comercial da empresa", icon: MapPin },
  { label: "Horário de atendimento", value: "08:00 às 18:00", icon: Clock },
  { label: "Status", value: "Ativa", icon: Activity },
];

const preferencias = [
  { label: "Empresa padrão", value: "União Auto Peças", icon: Building2 },
  { label: "Idioma", value: "Português Brasil", icon: Globe },
  { label: "Fuso horário", value: "São Paulo / Brasil", icon: Clock },
  { label: "Tema visual", value: "Claro premium", icon: Paintbrush },
  { label: "Notificações internas", value: "Ativas", icon: Bell },
  { label: "Relatórios gerenciais", value: "Ativos", icon: FileBarChart },
];

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

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Dados da empresa - full width on mobile, 2 cols on lg */}
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Dados da empresa</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {dadosEmpresa.map((campo) => {
                const Icon = campo.icon;
                return (
                  <div key={campo.label} className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {campo.label}
                    </label>
                    <div className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground">
                      {campo.value}
                    </div>
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
                {preferencias.map((pref) => {
                  const Icon = pref.icon;
                  return (
                    <div key={pref.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{pref.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{pref.value}</span>
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
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition">
            <Save className="h-4 w-4" />
            Salvar configurações
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition">
            <RotateCcw className="h-4 w-4" />
            Restaurar padrão
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition">
            <Eye className="h-4 w-4" />
            Ver dados da empresa
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  Building2,
  ShieldCheck,
  UserCheck,
  Search,
  Sparkles,
  AlertTriangle,
  Save,
  RotateCcw,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/ia")({
  component: IAPage,
  head: () => ({ meta: [{ title: "Configuração da IA | Agente Comercial 360" }] }),
});

const summary = [
  { label: "Status da IA", value: "Ativa", icon: Activity },
  { label: "Empresa vinculada", value: "União Auto Peças", icon: Building2 },
  { label: "Regras principais", value: 6, icon: ShieldCheck },
  { label: "Encaminhamento humano", value: "Habilitado", icon: UserCheck },
];

const rules = [
  { label: "Pode enviar preço?", value: false },
  { label: "Pode criar orçamento?", value: false },
  { label: "Pode encaminhar para humano?", value: true },
  { label: "Pode responder dúvidas administrativas?", value: true },
  { label: "Pode responder dúvidas financeiras?", value: true },
  { label: "Pode agir fora do horário?", value: false },
];

const criterios = [
  "Quando o cliente pedir preço final",
  "Quando for necessário gerar orçamento",
  "Quando houver dúvida financeira específica",
  "Quando a conversa estiver sensível ou confusa",
  "Quando o cliente solicitar atendimento humano",
];

const setores = [
  { label: "Vendas", badge: "bg-blue-100 text-blue-700 ring-1 ring-blue-200" },
  { label: "Administrativo", badge: "bg-amber-100 text-amber-700 ring-1 ring-amber-200" },
  { label: "Financeiro", badge: "bg-violet-100 text-violet-700 ring-1 ring-violet-200" },
  { label: "Relatórios", badge: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" },
];

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <div
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        enabled ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  );
}

function IAPage() {
  const [search, setSearch] = useState("");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Configuração da IA
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Configure o comportamento da assistente virtual, regras de atuação e critérios de encaminhamento.
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

        {/* Main config + side cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Main config block */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6 space-y-6">
              <h3 className="text-base font-semibold text-foreground">
                Informações gerais
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Nome da assistente
                  </label>
                  <div className="rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-foreground">
                    Assistente Virtual
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Empresa vinculada
                  </label>
                  <div className="rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-foreground">
                    União Auto Peças
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Status da IA
                  </label>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Ativa
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Prompt de comportamento
                </label>
                <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {`Você é a assistente virtual da União Auto Peças. Seu papel é atender clientes de forma educada, objetiva e profissional. Você deve identificar o setor correto, coletar informações essenciais e encaminhar oportunidades para os responsáveis certos. Você não deve enviar preços finais sem validação humana.`}
                </div>
              </div>
            </div>

            {/* Operational rules */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6 space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                Regras operacionais
              </h3>
              <div className="divide-y divide-border">
                {rules.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="text-sm text-foreground">{r.label}</span>
                    <Toggle enabled={r.value} />
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm">
                <Save className="h-4 w-4" />
                Salvar configurações
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition shadow-sm">
                <RotateCcw className="h-4 w-4" />
                Restaurar padrão
              </button>
            </div>
          </div>

          {/* Side cards */}
          <div className="space-y-4">
            {/* Criteria card */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Quando chamar humano
              </h3>
              <ul className="space-y-3 text-sm">
                {criterios.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-muted-foreground">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sectors card */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Setores atendidos
              </h3>
              <div className="flex flex-wrap gap-2">
                {setores.map((s) => (
                  <span
                    key={s.label}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${s.badge}`}
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* AI summary */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-[var(--brand-blue-soft)] to-card p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Resumo da configuração</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A assistente virtual está configurada para atender de forma administrativa e comercial, identificar o setor correto e encaminhar casos sensíveis ou estratégicos para atendimento humano.
              </p>
            </div>

            {/* Attention card */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 shadow-[var(--shadow-soft)] p-5">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <h3 className="text-sm font-semibold text-amber-800">Atenção</h3>
              </div>
              <p className="text-xs leading-relaxed text-amber-700">
                A IA não deve enviar preços finais nem fechar orçamentos sem validação humana. Nesta fase, os dados exibidos são apenas visuais e ainda não estão conectados ao Supabase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

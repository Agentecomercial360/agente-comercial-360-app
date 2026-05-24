import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ia")({
  component: IAPage,
  head: () => ({ meta: [{ title: "Configuração da IA | Agente Comercial 360" }] }),
});

type AiLoadStatus = "loading" | "loaded" | "empty" | "unauthenticated" | "error";

const defaultAssistantName = "Assistente Virtual";
const defaultCompany = "União Auto Peças";
const defaultPrompt =
  "Você é a assistente virtual da União Auto Peças. Seu papel é atender clientes de forma educada, objetiva e profissional. Você deve identificar o setor correto, coletar informações essenciais e encaminhar oportunidades para os responsáveis certos. Você não deve enviar preços finais sem validação humana.";

const defaultRules = [
  { label: "Pode enviar preço?", value: false },
  { label: "Pode criar orçamento?", value: false },
  { label: "Pode encaminhar para humano?", value: true },
  { label: "Pode responder dúvidas administrativas?", value: true },
  { label: "Pode responder dúvidas financeiras?", value: true },
  { label: "Pode agir fora do horário?", value: false },
];

const criteriosIniciais = [
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

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        enabled ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function IAPage() {
  const [assistantName, setAssistantName] = useState(defaultAssistantName);
  const [company, setCompany] = useState(defaultCompany);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [rules, setRules] = useState(defaultRules);
  const [saved, setSaved] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [loadingAi, setLoadingAi] = useState(true);
  const [aiLoadStatus, setAiLoadStatus] = useState<AiLoadStatus>("loading");
  const [activeAiSettingsId, setActiveAiSettingsId] = useState<string | null>(null);
  const [activeAiCreatedAt, setActiveAiCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (cancelled) return;
        if (userError || !userData?.user) {
          setAiLoadStatus("unauthenticated");
          setLoadingAi(false);
          return;
        }

        const { data: cu, error: cuError } = await supabase
          .from("company_users")
          .select("company_id")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .maybeSingle();
        if (cancelled) return;
        if (cuError || !cu?.company_id) {
          setAiLoadStatus("error");
          setLoadingAi(false);
          return;
        }
        const companyId = cu.company_id as string;

        const [companyRes, aiRes] = await Promise.all([
          supabase.from("companies").select("name").eq("id", companyId).single(),
          supabase
            .from("ai_settings")
            .select(
              "id,company_id,agent_name,behavior_prompt,can_send_prices,can_create_quote,created_at",
            )
            .eq("company_id", companyId)
            .maybeSingle(),
        ]);
        if (cancelled) return;

        const realCompanyName = companyRes.data?.name as string | undefined;
        if (realCompanyName) setCompany(realCompanyName);

        if (aiRes.error) {
          setAiLoadStatus("error");
          setLoadingAi(false);
          return;
        }

        const ai = aiRes.data;
        if (!ai) {
          setAiLoadStatus("empty");
          setLoadingAi(false);
          return;
        }

        if (ai.agent_name) setAssistantName(ai.agent_name as string);
        if (ai.behavior_prompt) setPrompt(ai.behavior_prompt as string);
        setRules((prev) =>
          prev.map((r) => {
            if (r.label === "Pode enviar preço?")
              return { ...r, value: Boolean(ai.can_send_prices) };
            if (r.label === "Pode criar orçamento?")
              return { ...r, value: Boolean(ai.can_create_quote) };
            return r;
          }),
        );
        setActiveAiSettingsId((ai.id as string) ?? null);
        setActiveAiCreatedAt((ai.created_at as string) ?? null);
        setAiLoadStatus("loaded");
        setSaved(true);
        setLoadingAi(false);
      } catch {
        if (cancelled) return;
        setAiLoadStatus("error");
        setLoadingAi(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasChanges = useMemo(() => {
    if (assistantName !== defaultAssistantName) return true;
    if (company !== defaultCompany) return true;
    if (prompt !== defaultPrompt) return true;
    return rules.some((r, i) => r.value !== defaultRules[i].value);
  }, [assistantName, company, prompt, rules]);

  const summary = [
    {
      label: "Status da IA",
      value: "Ativa",
      icon: Activity,
    },
    {
      label: "Empresa vinculada",
      value: company || "—",
      icon: Building2,
    },
    {
      label: "Regras principais",
      value: rules.length,
      icon: ShieldCheck,
    },
    {
      label: "Encaminhamento humano",
      value: rules.find((r) => r.label === "Pode encaminhar para humano?")?.value ? "Habilitado" : "Desabilitado",
      icon: UserCheck,
    },
  ];

  const criterios = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return criteriosIniciais;
    return criteriosIniciais.filter((c) => c.toLowerCase().includes(term));
  }, [search]);

  const resumoText = useMemo(() => {
    const podePreco = rules.find((r) => r.label === "Pode enviar preço?")?.value;
    const podeOrcamento = rules.find((r) => r.label === "Pode criar orçamento?")?.value;
    const podeHumano = rules.find((r) => r.label === "Pode encaminhar para humano?")?.value;
    const podeAdm = rules.find((r) => r.label === "Pode responder dúvidas administrativas?")?.value;
    const podeFin = rules.find((r) => r.label === "Pode responder dúvidas financeiras?")?.value;

    const partes: string[] = [];
    if (podePreco) partes.push("A IA está autorizada a enviar preços finais.");
    else partes.push("A IA não está autorizada a enviar preços finais sem validação humana.");

    if (podeOrcamento) partes.push("Pode gerar orçamentos.");
    else partes.push("Não pode gerar orçamentos sem validação humana.");

    if (podeHumano) partes.push("Está habilitada para encaminhar para atendimento humano.");
    else partes.push("O encaminhamento humano está desabilitado.");

    if (podeAdm && podeFin) partes.push("Pode responder dúvidas administrativas e financeiras.");
    else if (podeAdm) partes.push("Pode responder dúvidas administrativas.");
    else if (podeFin) partes.push("Pode responder dúvidas financeiras.");

    return partes.join(" ");
  }, [rules]);

  const toggleRule = (index: number) => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, value: !r.value } : r))
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    toast.success("Configurações da IA salvas localmente.", {
      description: "Alterações salvas apenas nesta sessão visual.",
    });
  };

  const openRestore = () => {
    setConfirmOpen(true);
  };

  const confirmRestore = () => {
    setAssistantName(defaultAssistantName);
    setCompany(defaultCompany);
    setPrompt(defaultPrompt);
    setRules(defaultRules);
    setSaved(true);
    setConfirmOpen(false);
    toast.success("Configurações padrão restauradas.");
  };

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

        {/* Dirty indicator */}
        {hasChanges && !saved && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Alterações locais não salvas
          </div>
        )}

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
                  <input
                    type="text"
                    value={assistantName}
                    onChange={(e) => {
                      setAssistantName(e.target.value);
                      setSaved(false);
                    }}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Empresa vinculada
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      setSaved(false);
                    }}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
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
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setSaved(false);
                  }}
                  rows={6}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-y"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">{prompt.length} caracteres</p>
              </div>
            </div>

            {/* Operational rules */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6 space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                Regras operacionais
              </h3>
              <div className="divide-y divide-border">
                {rules.map((r, index) => (
                  <div key={r.label} className="flex items-center justify-between py-3">
                    <span className="text-sm text-foreground">{r.label}</span>
                    <Toggle enabled={r.value} onToggle={() => toggleRule(index)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm"
              >
                <Save className="h-4 w-4" />
                Salvar configurações
              </button>
              <button
                onClick={openRestore}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition shadow-sm"
              >
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
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar critérios..."
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
              <ul className="space-y-3 text-sm">
                {criterios.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-muted-foreground">{c}</span>
                  </li>
                ))}
                {criterios.length === 0 && (
                  <li className="text-sm text-muted-foreground text-center py-2">
                    Nenhum critério encontrado.
                  </li>
                )}
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
                {resumoText}
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
    </DashboardLayout>
  );
}

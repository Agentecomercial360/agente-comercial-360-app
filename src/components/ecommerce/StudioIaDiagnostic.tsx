import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Coins,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  Lock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { ECOMMERCE_COMPANY_ID, useEcommerceActiveAccount } from "@/lib/ecommerce-active-account";
import {
  getStudioIaDiagnosticPreview,
  StudioIaDiagnosticError,
  type DiagnosticItem,
  type StudioIaDiagnosticPreview,
} from "@/lib/studio-ia-diagnostic-preview";

const fmtInt = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("pt-BR");

function confidenceLabel(value: number | null): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  const pct = value >= 0 && value <= 1 ? value * 100 : value;
  return `${Math.round(Math.max(0, Math.min(pct, 100)))}% de confiança`;
}

const SEVERITY_STYLE: Record<string, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  critica: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  alta: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  media: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-slate-200 bg-slate-50 text-slate-600",
  baixa: "border-slate-200 bg-slate-50 text-slate-600",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

function severityClass(severity: string | null): string {
  const key = (severity ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return SEVERITY_STYLE[key] ?? "border-slate-200 bg-slate-50 text-slate-600";
}

function SafetyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning" | "positive";
}) {
  const toneCls =
    tone === "warning"
      ? "border-amber-200 bg-amber-50/60"
      : tone === "positive"
        ? "border-emerald-200 bg-emerald-50/50"
        : "border-slate-200 bg-white";
  return (
    <div className={`rounded-xl border p-4 ${toneCls}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function ItemList({
  title,
  icon,
  items,
  emptyLabel,
  accent,
  showAction,
}: {
  title: string;
  icon: React.ReactNode;
  items: DiagnosticItem[];
  emptyLabel: string;
  accent: string;
  showAction?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className={`rounded-lg p-2 ${accent}`}>{icon}</span>
        <h2 className="font-bold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-400">({items.length})</span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          {emptyLabel}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, i) => (
            <li key={`${item.title}-${i}`} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.severity && (
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${severityClass(item.severity)}`}
                    >
                      {item.severity}
                    </span>
                  )}
                  {confidenceLabel(item.confidence) && (
                    <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {confidenceLabel(item.confidence)}
                    </span>
                  )}
                  {item.requires_human_review && (
                    <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                      Revisão humana
                    </span>
                  )}
                </div>
              </div>
              {item.description && (
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              )}
              {item.recommendation && (
                <p className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-2.5 text-sm text-slate-700">
                  <strong className="text-emerald-700">Recomendação:</strong> {item.recommendation}
                </p>
              )}
              {showAction && (
                <button
                  type="button"
                  disabled
                  title="Criação de tarefas reais será liberada em uma próxima etapa."
                  className="mt-3 inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400"
                >
                  <Lock className="h-3.5 w-3.5" /> Criar tarefa (em breve)
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Bloco principal
// ---------------------------------------------------------------------------

export function StudioIaDiagnosticSection() {
  const { activeAccountId, activeAccount, loading: accountsLoading } = useEcommerceActiveAccount();

  const query = useQuery<StudioIaDiagnosticPreview, Error>({
    queryKey: ["studio-ia-diagnostic-preview", ECOMMERCE_COMPANY_ID, activeAccountId],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getStudioIaDiagnosticPreview({
        companyId: ECOMMERCE_COMPANY_ID,
        accountId: activeAccountId as string,
        signal,
      }),
    enabled: !accountsLoading && Boolean(activeAccountId),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const data = query.data;
  const costsPending =
    data?.summary.costs_pending === true ||
    (data?.financialStatus.cost_status ?? "").toLowerCase() === "pending_real_costs";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Diagnóstico Studio IA v1</h2>
            <p className="mt-1 text-sm text-slate-500">
              Análise operacional somente leitura baseada nos dados sincronizados.
              {activeAccount
                ? ` Conta ativa: ${activeAccount.account_name || activeAccount.nickname || "Mercado Livre"}.`
                : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <SafetyBadge>
                <ShieldCheck className="h-3.5 w-3.5" /> Somente leitura
              </SafetyBadge>
              <SafetyBadge>
                <BadgeCheck className="h-3.5 w-3.5" /> IA externa não chamada
              </SafetyBadge>
              <SafetyBadge>
                <Lock className="h-3.5 w-3.5" /> Sem ações automáticas
              </SafetyBadge>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void query.refetch()}
            disabled={!activeAccountId || query.isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
            Atualizar diagnóstico
          </button>
        </div>

        <div className="mt-5" aria-live="polite">
          {accountsLoading && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Identificando a conta ativa...
            </div>
          )}

          {!accountsLoading && !activeAccountId && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Selecione uma conta Mercado Livre específica no topo da tela para carregar o
              diagnóstico.
            </div>
          )}

          {query.isPending && activeAccountId && !accountsLoading && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
                />
              ))}
            </div>
          )}

          {query.error && (
            <div
              className={`rounded-xl border p-4 text-sm ${
                query.error instanceof StudioIaDiagnosticError &&
                query.error.kind === "not_deployed"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
              role="status"
            >
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Não foi possível carregar o diagnóstico</p>
                  <p className="mt-1 opacity-90">{query.error.message}</p>
                  <p className="mt-2 text-xs">Nenhum dado foi alterado.</p>
                </div>
              </div>
            </div>
          )}

          {data && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Status do diagnóstico"
                  value={data.warnings.length > 0 ? "Com avisos" : "Concluído"}
                  hint={data.mode ?? "studio_ia_diagnostic_preview"}
                  tone={data.warnings.length > 0 ? "warning" : "positive"}
                />
                <MetricCard label="Pedidos analisados" value={fmtInt(data.summary.orders_checked)} />
                <MetricCard
                  label="Receita pronta"
                  value={fmtInt(data.summary.revenue_ready_orders)}
                  hint="pedidos com receita disponível"
                />
                <MetricCard
                  label="Custos pendentes"
                  value={data.summary.costs_pending === null ? "—" : costsPending ? "Sim" : "Não"}
                  tone={costsPending ? "warning" : "positive"}
                />
                <MetricCard
                  label="Margem/lucro disponível"
                  value={data.summary.profit_margin_available ? "Sim" : "Não"}
                  hint="Aguardando custos reais"
                  tone={data.summary.profit_margin_available ? "positive" : "warning"}
                />
                <MetricCard
                  label="Fontes verificadas"
                  value={`${fmtInt(data.summary.sources_available)} / ${fmtInt(data.summary.sources_checked)}`}
                />
                <MetricCard
                  label="Pontos de atenção"
                  value={fmtInt(data.summary.attention_points_count)}
                />
                <MetricCard
                  label="Oportunidades"
                  value={fmtInt(data.summary.opportunities_count)}
                />
                <MetricCard
                  label="Tarefas sugeridas"
                  value={fmtInt(data.summary.suggested_tasks_count)}
                />
              </div>

              <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-blue-800">
                As recomendações são uma prévia operacional. Qualquer ação futura deverá ser aprovada
                por um humano.
              </p>

              {data.warnings.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {data.warnings.map((w, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
                    >
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>

      {data && (
        <>
          {/* Status financeiro */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <Coins className="h-4 w-4" />
              </span>
              <h2 className="font-bold text-slate-900">Status financeiro</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Receita"
                value={data.financialStatus.revenue_status ?? "—"}
              />
              <MetricCard
                label="Custos"
                value={data.financialStatus.cost_status ?? "—"}
                tone={costsPending ? "warning" : "default"}
              />
              <MetricCard
                label="Margem / lucro"
                value={data.financialStatus.profit_margin_status ?? "—"}
                tone={data.summary.profit_margin_available ? "positive" : "warning"}
              />
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {data.financialStatus.message ??
                "Receita disponível, mas margem/lucro aguardam custos reais dos produtos."}
            </p>
            {costsPending && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong>Custos reais pendentes.</strong> A análise de margem e lucro será liberada
                  após a importação dos custos pelos operadores.
                </span>
              </div>
            )}
          </section>

          {/* Fontes do diagnóstico */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <h2 className="font-bold text-slate-900">Fontes do diagnóstico</h2>
              <span className="text-xs text-slate-400">({data.sourceStatus.length})</span>
            </div>
            {data.sourceStatus.length === 0 ? (
              <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                O diagnóstico não informou o estado das fontes.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.sourceStatus.map((s) => {
                  const badge =
                    s.available === false
                      ? { label: "Atenção", cls: "border-rose-200 bg-rose-50 text-rose-700" }
                      : (s.count ?? 0) === 0
                        ? { label: "Sem dados", cls: "border-slate-200 bg-slate-50 text-slate-600" }
                        : {
                            label: "Disponível",
                            cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
                          };
                  return (
                    <div key={s.source} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-slate-900">{s.source}</p>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-slate-900">{fmtInt(s.count)}</p>
                      <p className="text-[11px] text-slate-500">
                        {s.status ?? "registros encontrados"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <ItemList
            title="Pontos de atenção"
            icon={<AlertTriangle className="h-4 w-4" />}
            accent="bg-amber-50 text-amber-700"
            items={data.attentionPoints}
            emptyLabel="Não há ponto de atenção crítico no diagnóstico atual."
          />

          <ItemList
            title="Oportunidades"
            icon={<Lightbulb className="h-4 w-4" />}
            accent="bg-blue-50 text-blue-700"
            items={data.opportunities}
            emptyLabel="Nenhuma oportunidade identificada no diagnóstico atual."
          />

          <ItemList
            title="Tarefas sugeridas"
            icon={<ListChecks className="h-4 w-4" />}
            accent="bg-violet-50 text-violet-700"
            items={data.suggestedTasks}
            emptyLabel="Nenhuma tarefa sugerida no diagnóstico atual."
            showAction
          />

        </>
      )}
    </div>
  );
}

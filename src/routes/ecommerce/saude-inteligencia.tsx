import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  HeartPulse,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  TimerReset,
  Wrench,
  Zap,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  useEcommerceActiveAccount,
  type EcommerceAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { runMarketplaceIntelligence } from "@/lib/ml-marketplace-intelligence";
import { startMercadoLivreOAuth } from "@/lib/ml-oauth";

export const Route = createFileRoute("/ecommerce/saude-inteligencia")({
  component: IntelligenceHealthPage,
  head: () => ({
    meta: [{ title: "Saúde da Inteligência | Agente Comercial 360" }],
  }),
});

type SyncState = {
  id: string;
  account_id: string;
  capability: string;
  resource_key: string;
  status: string;
  last_attempt_at: string | null;
  last_success_at: string | null;
  next_due_at: string | null;
  last_error_message: string | null;
  updated_at: string | null;
};

type ModuleHealth = "success" | "running" | "error" | "overdue" | "waiting";

const CAPABILITY_LABELS: Record<string, string> = {
  auth: "Autenticação Mercado Livre",
  ads: "Product Ads",
  competition: "Concorrência & Ranking",
  market_radar: "Radar de Mercado",
  shipment_labels: "Etiquetas",
  financial_reconciliation: "Conciliação Financeira",
};

const OVERDUE_GRACE_MS = 20 * 60_000;

function IntelligenceHealthPage() {
  return (
    <EcommerceLayout>
      <IntelligenceHealthContent />
    </EcommerceLayout>
  );
}

function accountLabel(account: EcommerceAccount) {
  return account.account_name || account.nickname || account.id;
}

function IntelligenceHealthContent() {
  const {
    companyId,
    accounts,
    activeAccountId,
    loading: accountLoading,
    reloadAccounts,
  } = useEcommerceActiveAccount();

  const [rows, setRows] = useState<SyncState[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [busyAccountId, setBusyAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "healthy" | "attention">("all");

  const load = useCallback(
    async (manual = false) => {
      if (!companyId) {
        setRows([]);
        setLoading(false);
        setReloading(false);
        return;
      }
      if (manual) setReloading(true);
      else setLoading(true);
      setError(null);

      let query = supabase
        .from("ecommerce_marketplace_sync_state")
        .select(
          "id,account_id,capability,resource_key,status,last_attempt_at,last_success_at,next_due_at,last_error_message,updated_at",
        )
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false })
        .limit(10000);

      if (activeAccountId) {
        query = query.eq("account_id", activeAccountId);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        setError(queryError.message);
        setRows([]);
      } else {
        setRows((data || []) as SyncState[]);
      }

      setLoading(false);
      setReloading(false);
    },
    [companyId, activeAccountId],
  );

  useEffect(() => {
    if (accountLoading) return;
    void load();

    const interval = window.setInterval(() => void load(), 60_000);
    const handler = () => void load();

    window.addEventListener("ac360-marketplace-synced", handler);
    window.addEventListener("ac360-mercadolivre-auth-changed", handler);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("ac360-marketplace-synced", handler);
      window.removeEventListener("ac360-mercadolivre-auth-changed", handler);
    };
  }, [accountLoading, load]);

  const accountMap = useMemo(
    () =>
      new Map(
        accounts.map((account) => [
          account.id,
          account.account_name || account.nickname || account.id,
        ]),
      ),
    [accounts],
  );

  const accountIds = useMemo(() => {
    if (activeAccountId) return [activeAccountId];
    return accounts.map((account) => account.id);
  }, [accounts, activeAccountId]);

  const perAccount = useMemo(() => {
    return accountIds.map((accountId) => {
      const account = accounts.find((item) => item.id === accountId) ?? null;
      const accountRows = rows.filter((row) => row.account_id === accountId);
      const byCapability = new Map<string, SyncState[]>();

      for (const row of accountRows) {
        const current = byCapability.get(row.capability) ?? [];
        current.push(row);
        byCapability.set(row.capability, current);
      }

      const modules = Array.from(byCapability.entries()).map(([capability, states]) => {
        const nextDue = states
          .map((state) => state.next_due_at)
          .filter(Boolean)
          .sort()[0] ?? null;

        const overdue =
          Boolean(nextDue) &&
          new Date(nextDue as string).getTime() < Date.now() - OVERDUE_GRACE_MS;

        const status: ModuleHealth = states.some((state) => state.status === "error")
          ? "error"
          : states.some((state) => state.status === "running")
            ? "running"
            : overdue
              ? "overdue"
              : states.length > 0 && states.every((state) => state.status === "success")
                ? "success"
                : "waiting";

        const latest = [...states].sort((a, b) => {
          const aTime = new Date(a.updated_at || a.last_attempt_at || 0).getTime();
          const bTime = new Date(b.updated_at || b.last_attempt_at || 0).getTime();
          return bTime - aTime;
        })[0];

        return {
          capability,
          label: CAPABILITY_LABELS[capability] || capability,
          status,
          states,
          latest,
          nextDue,
        };
      });

      const auth = modules.find((module) => module.capability === "auth");
      const hasError = modules.some((module) => module.status === "error");
      const hasRunning = modules.some((module) => module.status === "running");
      const hasOverdue = modules.some((module) => module.status === "overdue");
      const healthy =
        !hasError &&
        !hasOverdue &&
        auth?.status === "success" &&
        modules.some((module) => module.status === "success");

      const overall: ModuleHealth = hasError
        ? "error"
        : hasRunning
          ? "running"
          : hasOverdue
            ? "overdue"
            : healthy
              ? "success"
              : "waiting";

      return {
        accountId,
        account,
        accountName: accountMap.get(accountId) || accountId,
        modules,
        healthy,
        overall,
      };
    });
  }, [accountIds, rows, accountMap, accounts]);

  const summary = useMemo(() => {
    const totalStates = rows.length;
    const errors = rows.filter((row) => row.status === "error").length;
    const running = rows.filter((row) => row.status === "running").length;
    const success = rows.filter((row) => row.status === "success").length;
    const healthyAccounts = perAccount.filter((account) => account.healthy).length;

    const nextDue =
      rows
        .map((row) => row.next_due_at)
        .filter(Boolean)
        .sort()[0] ?? null;

    return {
      totalStates,
      errors,
      running,
      success,
      healthyAccounts,
      nextDue,
    };
  }, [rows, perAccount]);

  const moduleSummary = useMemo(() => {
    const capabilities = Array.from(new Set(rows.map((row) => row.capability)));

    return capabilities
      .map((capability) => {
        const states = rows.filter((row) => row.capability === capability);
        const errors = states.filter((row) => row.status === "error").length;
        const running = states.filter((row) => row.status === "running").length;
        const success = states.filter((row) => row.status === "success").length;

        return {
          capability,
          label: CAPABILITY_LABELS[capability] || capability,
          total: states.length,
          errors,
          running,
          success,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const filteredAccounts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return perAccount.filter((item) => {
      const matchesText = !term || item.accountName.toLowerCase().includes(term);
      const matchesFilter =
        filter === "all" ||
        (filter === "healthy" && item.healthy) ||
        (filter === "attention" && !item.healthy);
      return matchesText && matchesFilter;
    });
  }, [perAccount, search, filter]);

  const recentRows = useMemo(
    () =>
      [...rows]
        .sort((a, b) => {
          const aTime = new Date(a.updated_at || a.last_attempt_at || 0).getTime();
          const bTime = new Date(b.updated_at || b.last_attempt_at || 0).getTime();
          return bTime - aTime;
        })
        .slice(0, 30),
    [rows],
  );

  async function handleReconnect(account: EcommerceAccount) {
    setBusyAccountId(account.id);
    try {
      await startMercadoLivreOAuth({
        companyId,
        accountId: account.id,
      });
      await Promise.all([reloadAccounts(), load(true)]);
      toast.success("Mercado Livre reconectado com sucesso.", {
        description: accountLabel(account),
      });
    } catch (reconnectError) {
      toast.error(
        reconnectError instanceof Error
          ? reconnectError.message
          : "Não foi possível reconectar o Mercado Livre.",
      );
    } finally {
      setBusyAccountId(null);
    }
  }

  async function handleRetry(account: EcommerceAccount) {
    setBusyAccountId(account.id);
    try {
      const { data: listings } = await supabase
        .from("ecommerce_listings")
        .select("id,ml_item_id")
        .eq("company_id", companyId)
        .eq("account_id", account.id)
        .eq("is_active", true)
        .not("ml_item_id", "is", null)
        .limit(50);

      const listingIds = (listings ?? [])
        .filter((listing) => /^ML[A-Z]\d+$/i.test(String(listing.ml_item_id ?? "")))
        .slice(0, 3)
        .map((listing) => listing.id);

      const jobs: Array<Promise<unknown>> = [
        runMarketplaceIntelligence({
          action: "ads_sync",
          company_id: companyId,
          account_id: account.id,
          days: 30,
        }),
        runMarketplaceIntelligence({
          action: "market_radar_sync",
          company_id: companyId,
          account_id: account.id,
        }),
        ...listingIds.map((listingId) =>
          runMarketplaceIntelligence({
            action: "competition_sync",
            company_id: companyId,
            account_id: account.id,
            listing_id: listingId,
          }),
        ),
      ];

      const results = await Promise.allSettled(jobs);
      const failed = results.filter((result) => result.status === "rejected").length;
      await load(true);

      if (failed > 0) {
        toast.warning("Atualização concluída com atenção.", {
          description: `${jobs.length - failed} de ${jobs.length} verificações concluídas.`,
        });
      } else {
        toast.success("Saúde da conta atualizada.", {
          description: accountLabel(account),
        });
      }
    } catch (retryError) {
      toast.error(
        retryError instanceof Error
          ? retryError.message
          : "Não foi possível atualizar a conta.",
      );
    } finally {
      setBusyAccountId(null);
    }
  }

  if (loading || accountLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando Saúde da Inteligência…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Monitoramento 24/7
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Saúde da Inteligência
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Acompanhe autenticação, Product Ads, Radar de Mercado e competição de todas as contas Mercado Livre.
                O AC360 renova tokens automaticamente, tenta recuperar falhas e mostra quando uma intervenção humana é realmente necessária.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void load(true)}
            disabled={reloading}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${reloading ? "animate-spin" : ""}`} />
            {reloading ? "Atualizando…" : "Atualizar painel"}
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Não foi possível carregar a saúde da operação: {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Contas saudáveis"
          value={`${summary.healthyAccounts}/${accountIds.length}`}
          helper="Autenticação válida e módulos operacionais"
          icon={ShieldCheck}
          tone="success"
        />
        <MetricCard
          label="Estados em sucesso"
          value={String(summary.success)}
          helper={`${summary.totalStates} rotinas monitoradas`}
          icon={CheckCircle2}
          tone="success"
        />
        <MetricCard
          label="Erros abertos"
          value={String(summary.errors)}
          helper={
            summary.errors === 0
              ? "Nenhuma intervenção necessária"
              : "Requer atenção operacional"
          }
          icon={AlertTriangle}
          tone={summary.errors === 0 ? "success" : "error"}
        />
        <MetricCard
          label="Próximo ciclo"
          value={formatDate(summary.nextDue, true)}
          helper={
            summary.running > 0
              ? `${summary.running} rotina(s) executando agora`
              : "Scheduler ativo a cada 15 minutos"
          }
          icon={TimerReset}
          tone="neutral"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {moduleSummary.map((module) => (
          <div
            key={module.capability}
            className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {module.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">{module.success}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  execuções/recursos em sucesso
                </p>
              </div>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  module.errors > 0
                    ? "bg-red-50 text-red-600"
                    : module.running > 0
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {module.errors > 0 ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : module.running > 0 ? (
                  <Activity className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
              <span className="text-muted-foreground">{module.total} monitorados</span>
              <span
                className={
                  module.errors > 0
                    ? "font-semibold text-red-600"
                    : "font-semibold text-emerald-600"
                }
              >
                {module.errors > 0 ? `${module.errors} erro(s)` : "Saudável"}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[260px] flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar conta Mercado Livre"
              className="pl-9"
            />
          </div>
          <div className="flex rounded-xl border border-border bg-muted/40 p-1">
            {[
              ["all", "Todas"],
              ["healthy", "Saudáveis"],
              ["attention", "Atenção"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value as typeof filter)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Saúde por conta</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Veja exatamente qual conta e qual módulo precisam de atenção e execute a recuperação no mesmo lugar.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {filteredAccounts.map((item) => {
            const busy = busyAccountId === item.accountId;
            const authModule = item.modules.find((module) => module.capability === "auth");
            const authNeedsReconnect =
              authModule?.status === "error" ||
              authModule?.status === "overdue" ||
              item.account?.auth_status !== "connected";

            return (
              <div
                key={item.accountId}
                className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-foreground">
                        {item.accountName}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.modules.length} módulo(s) monitorado(s)
                      </div>
                    </div>
                  </div>
                  <StatusPill status={item.overall} />
                </div>

                <div className="mt-5 space-y-3">
                  {item.modules.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                      Aguardando a primeira execução automática desta conta.
                    </div>
                  ) : (
                    item.modules
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((module) => (
                        <div
                          key={module.capability}
                          className="rounded-xl border border-border/60 bg-background/60 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <StatusDot status={module.status} />
                              <span className="text-sm font-semibold text-foreground">
                                {module.label}
                              </span>
                            </div>
                            <StatusPill status={module.status} compact />
                          </div>

                          <div className="mt-3 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
                            <div>
                              <span className="block font-medium text-foreground/70">
                                Último sucesso
                              </span>
                              <span>{formatDate(module.latest?.last_success_at)}</span>
                            </div>
                            <div>
                              <span className="block font-medium text-foreground/70">
                                Próxima execução
                              </span>
                              <span>{formatDate(module.nextDue)}</span>
                            </div>
                            <div>
                              <span className="block font-medium text-foreground/70">
                                Recursos
                              </span>
                              <span>{module.states.length}</span>
                            </div>
                          </div>

                          {module.latest?.last_error_message &&
                          module.status === "error" ? (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                              {module.latest.last_error_message}
                            </div>
                          ) : null}
                        </div>
                      ))
                  )}
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
                  {authNeedsReconnect && item.account ? (
                    <button
                      type="button"
                      onClick={() => void handleReconnect(item.account as EcommerceAccount)}
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <KeyRound className="h-3.5 w-3.5" />
                      )}
                      Reconectar Mercado Livre
                    </button>
                  ) : null}

                  {item.account ? (
                    <button
                      type="button"
                      onClick={() => void handleRetry(item.account as EcommerceAccount)}
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      Atualizar agora
                    </button>
                  ) : null}

                  <Link
                    to="/ecommerce/contas"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    Ver conta
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-soft)]">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-foreground">
            Histórico técnico recente
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Últimos estados registrados pelo scheduler 24/7.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Conta</th>
                <th className="px-5 py-3 font-semibold">Módulo</th>
                <th className="px-5 py-3 font-semibold">Recurso</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Último sucesso</th>
                <th className="px-5 py-3 font-semibold">Próximo ciclo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentRows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/20">
                  <td className="px-5 py-3 font-medium text-foreground">
                    {accountMap.get(row.account_id) || row.account_id}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {CAPABILITY_LABELS[row.capability] || row.capability}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {row.resource_key}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill status={normalizeStatus(row.status)} compact />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatDate(row.last_success_at)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatDate(row.next_due_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Activity;
  tone: "success" | "error" | "neutral";
}) {
  const iconClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "error"
        ? "bg-red-50 text-red-700"
        : "bg-blue-50 text-blue-700";

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function normalizeStatus(status: string): ModuleHealth {
  if (status === "success") return "success";
  if (status === "error") return "error";
  if (status === "running") return "running";
  return "waiting";
}

function StatusDot({ status }: { status: ModuleHealth }) {
  const className =
    status === "success"
      ? "bg-emerald-500"
      : status === "error"
        ? "bg-red-500"
        : status === "running"
          ? "bg-blue-500"
          : status === "overdue"
            ? "bg-amber-500"
            : "bg-slate-400";

  return <span className={`h-2.5 w-2.5 rounded-full ${className}`} />;
}

function StatusPill({
  status,
  compact = false,
}: {
  status: ModuleHealth;
  compact?: boolean;
}) {
  const styles =
    status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : status === "running"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : status === "overdue"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-slate-50 text-slate-600";

  const labels: Record<ModuleHealth, string> = {
    success: "Saudável",
    error: "Erro",
    running: "Executando",
    overdue: "Atrasado",
    waiting: "Aguardando",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${styles} ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
    >
      {status === "running" ? <Zap className="h-3 w-3" /> : null}
      {labels[status]}
    </span>
  );
}

function formatDate(value: string | null | undefined, timeOnly = false): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  if (timeOnly) {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

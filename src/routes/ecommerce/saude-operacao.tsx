import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  KeyRound,
  Loader2,
  Megaphone,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Trophy,
  Wrench,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
  type EcommerceAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { runMarketplaceIntelligence } from "@/lib/ml-marketplace-intelligence";
import { startMercadoLivreOAuth } from "@/lib/ml-oauth";

export const Route = createFileRoute("/ecommerce/saude-operacao")({
  component: OperationHealthPage,
  head: () => ({
    meta: [{ title: "Saúde da Operação | Agente Comercial 360" }],
  }),
});

type Capability = "auth" | "ads" | "competition" | "market_radar" | "shipment_labels";
type SyncStatus = "idle" | "running" | "success" | "error";
type HealthStatus = "success" | "running" | "error" | "overdue" | "idle";

type SyncRow = {
  account_id: string;
  capability: Capability;
  resource_key: string;
  status: SyncStatus;
  last_attempt_at: string | null;
  last_success_at: string | null;
  next_due_at: string | null;
  last_error_message: string | null;
  updated_at: string;
};

const CAPABILITY_META = {
  auth: { label: "Autenticação", icon: KeyRound },
  ads: { label: "Ads", icon: Megaphone },
  competition: { label: "Competição", icon: Trophy },
  market_radar: { label: "Radar", icon: Radar },
} as const;

function accountLabel(account: EcommerceAccount) {
  return account.account_name || account.nickname || account.id;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function aggregateCapability(rows: SyncRow[], capability: keyof typeof CAPABILITY_META) {
  const matching = rows.filter((row) => row.capability === capability);
  if (!matching.length) {
    return {
      status: "idle" as HealthStatus,
      lastSuccess: null as string | null,
      nextDue: null as string | null,
      error: null as string | null,
      resources: 0,
    };
  }

  const errors = matching.filter((row) => row.status === "error");
  const running = matching.some((row) => row.status === "running");
  const nextDueValues = matching
    .map((row) => row.next_due_at)
    .filter(Boolean) as string[];
  const grace = 20 * 60_000;
  const overdue = nextDueValues.some(
    (value) => new Date(value).getTime() < Date.now() - grace,
  );
  const successes = matching
    .map((row) => row.last_success_at)
    .filter(Boolean)
    .sort()
    .reverse() as string[];

  return {
    status: errors.length
      ? ("error" as const)
      : running
        ? ("running" as const)
        : overdue
          ? ("overdue" as const)
          : ("success" as const),
    lastSuccess: successes[0] ?? null,
    nextDue: nextDueValues.sort()[0] ?? null,
    error: errors[0]?.last_error_message ?? null,
    resources: matching.length,
  };
}

function statusMeta(status: HealthStatus) {
  if (status === "error") {
    return {
      label: "Com erro",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      icon: AlertTriangle,
    };
  }
  if (status === "running") {
    return {
      label: "Atualizando",
      className: "border-blue-200 bg-blue-50 text-blue-700",
      icon: Loader2,
    };
  }
  if (status === "overdue") {
    return {
      label: "Atrasado",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      icon: Clock3,
    };
  }
  if (status === "success") {
    return {
      label: "Atualizado",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }
  return {
    label: "Sem coleta",
    className: "border-slate-200 bg-slate-50 text-slate-500",
    icon: Clock3,
  };
}

function accountOverallStatus(states: ReturnType<typeof aggregateCapability>[]) {
  if (states.some((state) => state.status === "error")) return "error" as const;
  if (states.some((state) => state.status === "running")) return "running" as const;
  if (states.some((state) => state.status === "overdue")) return "overdue" as const;
  if (states.every((state) => state.status === "success")) return "success" as const;
  return "idle" as const;
}

function OperationHealthPage() {
  return (
    <EcommerceLayout>
      <OperationHealthContent />
    </EcommerceLayout>
  );
}

function OperationHealthContent() {
  const { accounts, reloadAccounts } = useEcommerceActiveAccount();
  const [rows, setRows] = useState<SyncRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "attention" | "healthy">("all");
  const [busyAccountId, setBusyAccountId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ecommerce_marketplace_sync_state")
      .select(
        "account_id,capability,resource_key,status,last_attempt_at,last_success_at,next_due_at,last_error_message,updated_at",
      )
      .eq("company_id", ECOMMERCE_COMPANY_ID)
      .order("updated_at", { ascending: false })
      .limit(10000);

    if (error) {
      toast.error("Não foi possível carregar a Saúde da Operação.", {
        description: error.message,
      });
      setRows([]);
    } else {
      setRows((data ?? []) as SyncRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
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
  }, [load]);

  const accountHealth = useMemo(() => {
    return accounts.map((account) => {
      const accountRows = rows.filter((row) => row.account_id === account.id);
      const capabilities = {
        auth: aggregateCapability(accountRows, "auth"),
        ads: aggregateCapability(accountRows, "ads"),
        competition: aggregateCapability(accountRows, "competition"),
        market_radar: aggregateCapability(accountRows, "market_radar"),
      };
      const states = Object.values(capabilities);
      return {
        account,
        capabilities,
        status: accountOverallStatus(states),
        latestSuccess:
          states
            .map((state) => state.lastSuccess)
            .filter(Boolean)
            .sort()
            .reverse()[0] ?? null,
      };
    });
  }, [accounts, rows]);

  const summary = useMemo(() => {
    const healthy = accountHealth.filter((item) => item.status === "success").length;
    const error = accountHealth.filter((item) => item.status === "error").length;
    const attention = accountHealth.filter((item) =>
      ["running", "overdue", "idle"].includes(item.status),
    ).length;
    return { total: accountHealth.length, healthy, error, attention };
  }, [accountHealth]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return accountHealth.filter((item) => {
      const matchesSearch =
        !term || accountLabel(item.account).toLowerCase().includes(term);
      const matchesFilter =
        filter === "all" ||
        (filter === "healthy" && item.status === "success") ||
        (filter === "attention" && item.status !== "success");
      return matchesSearch && matchesFilter;
    });
  }, [accountHealth, search, filter]);

  async function handleReconnect(account: EcommerceAccount) {
    setBusyAccountId(account.id);
    try {
      await startMercadoLivreOAuth({
        companyId: ECOMMERCE_COMPANY_ID,
        accountId: account.id,
      });
      await Promise.all([reloadAccounts(), load()]);
      toast.success("Mercado Livre reconectado com sucesso.", {
        description: accountLabel(account),
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
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
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("account_id", account.id)
        .eq("is_active", true)
        .not("ml_item_id", "is", null)
        .limit(30);

      const realListingIds = (listings ?? [])
        .filter((listing) => /^ML[A-Z]\d+$/i.test(String(listing.ml_item_id ?? "")))
        .slice(0, 3)
        .map((listing) => listing.id);

      const jobs: Array<Promise<unknown>> = [
        runMarketplaceIntelligence({
          action: "ads_sync",
          company_id: ECOMMERCE_COMPANY_ID,
          account_id: account.id,
          days: 30,
        }),
        runMarketplaceIntelligence({
          action: "market_radar_sync",
          company_id: ECOMMERCE_COMPANY_ID,
          account_id: account.id,
        }),
        ...realListingIds.map((listingId) =>
          runMarketplaceIntelligence({
            action: "competition_sync",
            company_id: ECOMMERCE_COMPANY_ID,
            account_id: account.id,
            listing_id: listingId,
          }),
        ),
      ];

      const results = await Promise.allSettled(jobs);
      const failed = results.filter((result) => result.status === "rejected").length;
      await load();

      if (failed) {
        toast.warning("Atualização concluída com atenção.", {
          description: `${jobs.length - failed} de ${jobs.length} verificações concluídas.`,
        });
      } else {
        toast.success("Saúde da conta atualizada.", {
          description: accountLabel(account),
        });
      }
    } finally {
      setBusyAccountId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-6 px-5 py-6 md:grid-cols-[1fr_auto] md:px-7">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">
              <ShieldCheck className="h-4 w-4" />
              Central de Saúde da Operação
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">
              Marketplace Intelligence 24/7
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Acompanhe autenticação, Product Ads, competição e Radar por conta. O AC360
              executa o scheduler automaticamente e mostra aqui qualquer ponto que precise
              de atenção.
            </p>
          </div>
          <div className="grid min-w-[280px] grid-cols-3 gap-2 self-center">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
              <div className="text-2xl font-bold">{summary.healthy}</div>
              <div className="text-[10px] uppercase tracking-wide text-emerald-300">
                Saudáveis
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
              <div className="text-2xl font-bold">{summary.attention}</div>
              <div className="text-[10px] uppercase tracking-wide text-amber-300">
                Atenção
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
              <div className="text-2xl font-bold">{summary.error}</div>
              <div className="text-[10px] uppercase tracking-wide text-rose-300">
                Erros
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[260px] flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar conta Mercado Livre"
              className="pl-9"
            />
          </div>
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
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
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading && !rows.length ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(({ account, capabilities, status, latestSuccess }) => {
            const overall = statusMeta(status);
            const OverallIcon = overall.icon;
            const busy = busyAccountId === account.id;
            const authNeedsAttention =
              capabilities.auth.status === "error" ||
              capabilities.auth.status === "overdue" ||
              account.auth_status !== "connected";

            return (
              <article
                key={account.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display text-base font-bold text-slate-900">
                        {accountLabel(account)}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        Último sucesso geral: {formatDate(latestSuccess)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${overall.className}`}
                  >
                    <OverallIcon
                      className={`h-3.5 w-3.5 ${
                        status === "running" ? "animate-spin" : ""
                      }`}
                    />
                    {overall.label}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {(Object.keys(CAPABILITY_META) as Array<keyof typeof CAPABILITY_META>).map(
                    (capability) => {
                      const meta = CAPABILITY_META[capability];
                      const state = capabilities[capability];
                      const stateMeta = statusMeta(state.status);
                      const Icon = meta.icon;
                      const StateIcon = stateMeta.icon;

                      return (
                        <div
                          key={capability}
                          className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                              <Icon className="h-3.5 w-3.5" />
                              {meta.label}
                            </div>
                            <StateIcon
                              className={`h-3.5 w-3.5 ${
                                state.status === "error"
                                  ? "text-rose-600"
                                  : state.status === "overdue"
                                    ? "text-amber-600"
                                    : state.status === "running"
                                      ? "animate-spin text-blue-600"
                                      : state.status === "success"
                                        ? "text-emerald-600"
                                        : "text-slate-400"
                              }`}
                            />
                          </div>
                          <div className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">
                            Último sucesso
                          </div>
                          <div className="mt-0.5 text-[11px] font-semibold text-slate-700">
                            {formatDate(state.lastSuccess)}
                          </div>
                          {state.error ? (
                            <div
                              className="mt-2 line-clamp-2 rounded-md bg-rose-50 px-2 py-1.5 text-[10px] text-rose-700"
                              title={state.error}
                            >
                              {state.error}
                            </div>
                          ) : null}
                        </div>
                      );
                    },
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="text-[11px] text-slate-500">
                    {capabilities.competition.resources > 0
                      ? `${capabilities.competition.resources} anúncio(s) com histórico de competição`
                      : "Sem anúncio monitorado em competição nesta conta"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {authNeedsAttention ? (
                      <button
                        type="button"
                        onClick={() => void handleReconnect(account)}
                        disabled={busy}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <KeyRound className="h-3.5 w-3.5" />
                        )}
                        Reconectar Mercado Livre
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void handleRetry(account)}
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      Atualizar agora
                    </button>
                    <Link
                      to="/ecommerce/contas"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      Ver conta
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {!visible.length ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <Activity className="mx-auto h-8 w-8 text-slate-300" />
              <div className="mt-3 font-semibold text-slate-700">
                Nenhuma conta encontrada neste filtro.
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

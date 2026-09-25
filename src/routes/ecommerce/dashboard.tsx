import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  BarChart3,
  RefreshCcw,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { useEcommerceActiveAccount } from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";
import {
  aggregateOrderMetrics,
  getPeriodRange,
  isCancelled,
  type PeriodKey as SharedPeriodKey,
} from "@/lib/ecommerce-metrics";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  runSmartAccountSync,
  formatSmartSyncMessage,
} from "@/lib/ml-sync";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ecommerce/dashboard")({
  component: DashboardEcommerce,
  head: () => ({
    meta: [{ title: "Visão Geral | Agente Comercial 360" }],
  }),
});

type Order = {
  id: string;
  account_id: string | null;
  order_date: string | null;
  total_amount: number | null;
  mercadolivre_fee: number | null;
  marketplace_fee: number | null;
  seller_shipping_cost: number | null;
  product_cost_total: number | null;
  net_profit: number | null;
  profit_confidence: string | null;
  order_status: string | null;
  payment_status: string | null;
  buyer_city: string | null;
  buyer_state: string | null;
};

type SyncRun = {
  account_id: string | null;
  status: string | null;
  days: number | null;
  total_found: number | null;
  orders_upserted: number | null;
  items_upserted: number | null;
  items_linked: number | null;
  products_created: number | null;
  orders_pending_cost: number | null;
  error_message: string | null;
  created_at: string | null;
};

type PeriodKey = "today" | "7d" | "30d";

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
];

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const num = new Intl.NumberFormat("pt-BR");

function n(v: number | null | undefined): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : 0;
}

function startOfPeriod(period: PeriodKey): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);

  if (period === "today") return d;

  const days = period === "7d" ? 6 : 29;
  d.setDate(d.getDate() - days);

  return d;
}

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function fmtDayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);

  return dt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function fmtDayLabelLong(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);

  return dt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";

  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function DashboardEcommerce() {
  return (
    <EcommerceLayout>
      <DashboardContent />
    </EcommerceLayout>
  );
}

function DashboardContent() {
  const {
    companyId,
    accounts,
    activeAccount,
    activeAccountId,
  } = useEcommerceActiveAccount();

  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [scope, setScope] = useState<"active" | "all">("active");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [companyAccounts, setCompanyAccounts] = useState<
    {
      id: string;
      account_name: string | null;
      nickname: string | null;
    }[]
  >([]);

  const [latestRun, setLatestRun] = useState<SyncRun | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncPanelOpen, setSyncPanelOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCompanyAccounts() {
      if (!companyId) {
        setCompanyAccounts([]);
        return;
      }

      const { data, error } = await supabase
        .from("ecommerce_accounts")
        .select(
          "id, company_id, account_name, marketplace, auth_status, is_active, nickname",
        )
        .eq("company_id", companyId)
        .eq("marketplace", "mercado_livre")
        .eq("auth_status", "connected")
        .eq("is_active", true);

      if (cancelled) return;
      if (error) return;

      const rows =
        (data as unknown as {
          id: string;
          company_id: string | null;
          account_name: string | null;
          marketplace: string | null;
          auth_status: string | null;
          is_active: boolean | null;
          nickname: string | null;
        }[]) ?? [];

      setCompanyAccounts(
        rows.map((account) => ({
          id: account.id,
          account_name: account.account_name,
          nickname: account.nickname,
        })),
      );
    }

    void loadCompanyAccounts();

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const accountNameById = useMemo(() => {
    const map = new Map<string, string>();

    companyAccounts.forEach((account) => {
      if (!account.id) return;

      map.set(
        account.id,
        account.account_name ||
          account.nickname ||
          "Conta sem nome",
      );
    });

    accounts.forEach((account) => {
      if (!account.id) return;

      map.set(
        account.id,
        account.account_name ||
          account.nickname ||
          map.get(account.id) ||
          "Conta sem nome",
      );
    });

    return map;
  }, [accounts, companyAccounts]);

  const selectedAccountId =
    activeAccountId || activeAccount?.id || null;

  const selectedAccountName = selectedAccountId
    ? accountNameById.get(selectedAccountId) ||
      activeAccount?.account_name ||
      activeAccount?.nickname ||
      null
    : null;

  const accountMissing =
    scope === "active" && !selectedAccountId;

  const range = useMemo(
    () => getPeriodRange(period as SharedPeriodKey),
    [period],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!companyId) {
        setOrders([]);
        setLoading(false);
        return;
      }

      if (scope === "active" && !selectedAccountId) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        let query = supabase
          .from("ecommerce_orders")
          .select(
            "id, account_id, order_date, total_amount, mercadolivre_fee, marketplace_fee, seller_shipping_cost, product_cost_total, net_profit, profit_confidence, order_status, payment_status, buyer_city, buyer_state",
          )
          .eq("company_id", companyId)
          .gte("order_date", range.sinceISO)
          .lte("order_date", range.untilISO)
          .order("order_date", {
            ascending: false,
          })
          .limit(5000);

        if (scope === "active" && selectedAccountId) {
          query = query.eq(
            "account_id",
            selectedAccountId,
          );
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setOrders(
            (data as unknown as Order[]) ?? [],
          );
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMsg(
            error instanceof Error
              ? error.message
              : "Erro ao carregar pedidos",
          );

          setOrders([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    companyId,
    period,
    scope,
    selectedAccountId,
    range.sinceISO,
    range.untilISO,
  ]);

  const loadLatestRun = useCallback(async () => {
    if (!companyId) {
      setLatestRun(null);
      return;
    }

    try {
      let query = supabase
        .from("ecommerce_sync_runs")
        .select(
          "account_id, status, days, total_found, orders_upserted, items_upserted, items_linked, products_created, orders_pending_cost, error_message, created_at",
        )
        .eq("company_id", companyId)
        .order("created_at", {
          ascending: false,
        })
        .limit(1);

      if (scope === "active" && selectedAccountId) {
        query = query.eq(
          "account_id",
          selectedAccountId,
        );
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setLatestRun(
        ((data as unknown as SyncRun[]) ?? [])[0] ??
          null,
      );
    } catch {
      setLatestRun(null);
    }
  }, [
    companyId,
    scope,
    selectedAccountId,
  ]);

  useEffect(() => {
    void loadLatestRun();
  }, [loadLatestRun]);

  useEffect(() => {
    const handler = () => {
      void loadLatestRun();
    };

    window.addEventListener(
      "mercadolivre-products-synced",
      handler,
    );

    return () =>
      window.removeEventListener(
        "mercadolivre-products-synced",
        handler,
      );
  }, [loadLatestRun]);

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) => !isCancelled(order.order_status),
      ),
    [orders],
  );

  const totals = useMemo(() => {
    const base =
      aggregateOrderMetrics(activeOrders);

    let fees = 0;
    let shipping = 0;
    let netParcial = 0;
    let pending = 0;
    let high = 0;

    for (const order of activeOrders) {
      fees +=
        n(order.mercadolivre_fee) +
        n(order.marketplace_fee);

      shipping +=
        n(order.seller_shipping_cost);

      netParcial +=
        n(order.net_profit);

      if (
        (order.profit_confidence ?? "").toLowerCase() ===
        "pending_cost"
      ) {
        pending += 1;
      }

      if (
        (order.profit_confidence ?? "").toLowerCase() ===
        "high"
      ) {
        high += 1;
      }
    }

    return {
      gross: base.totalRevenue,
      count: base.totalOrders,
      ticket: base.ticket,
      withLocation: base.ordersWithLocation,
      withoutLocation: base.ordersWithoutLocation,
      revenueWithLocation: base.revenueWithLocation,
      cancelledCount:
        orders.length - activeOrders.length,
      fees,
      shipping,
      netParcial,
      pending,
      high,
    };
  }, [
    activeOrders,
    orders.length,
  ]);

  const byDay = useMemo(() => {
    const map = new Map<
      string,
      {
        gross: number;
        count: number;
      }
    >();

    const start = startOfPeriod(period);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    for (
      let date = new Date(start);
      date.getTime() <= today.getTime();
      date.setDate(date.getDate() + 1)
    ) {
      map.set(dayKey(date), {
        gross: 0,
        count: 0,
      });
    }

    for (const order of activeOrders) {
      if (!order.order_date) continue;

      const key = dayKey(
        new Date(order.order_date),
      );

      const current =
        map.get(key) ?? {
          gross: 0,
          count: 0,
        };

      current.gross +=
        n(order.total_amount);

      current.count += 1;

      map.set(key, current);
    }

    return Array.from(map.entries())
      .sort((a, b) =>
        a[0] < b[0] ? -1 : 1,
      )
      .map(([key, value]) => ({
        key,
        label: fmtDayLabel(key),
        ...value,
      }));
  }, [
    activeOrders,
    period,
  ]);

  const byAccount = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        count: number;
        gross: number;
        fees: number;
        shipping: number;
        net: number;
        pending: number;
      }
    >();

    for (const order of activeOrders) {
      const id =
        order.account_id ?? "—";

      const current =
        map.get(id) ?? {
          id,
          count: 0,
          gross: 0,
          fees: 0,
          shipping: 0,
          net: 0,
          pending: 0,
        };

      current.count += 1;

      current.gross +=
        n(order.total_amount);

      current.fees +=
        n(order.mercadolivre_fee) +
        n(order.marketplace_fee);

      current.shipping +=
        n(order.seller_shipping_cost);

      current.net +=
        n(order.net_profit);

      if (
        (order.profit_confidence ?? "").toLowerCase() ===
        "pending_cost"
      ) {
        current.pending += 1;
      }

      map.set(id, current);
    }

    return Array.from(map.values()).sort(
      (a, b) =>
        b.gross - a.gross,
    );
  }, [activeOrders]);

  const scopeLabel =
    scope === "all"
      ? "Todas as contas"
      : selectedAccountName ||
        "Conta ativa";

  const handleSync =
    useCallback(async () => {
      if (syncing) {
        return;
      }

      if (!companyId) {
        toast.error(
          "Não foi possível identificar a empresa desta conta.",
        );
        return;
      }

      if (!selectedAccountId) {
        toast.error(
          "Selecione uma conta Mercado Livre para sincronizar.",
        );
        return;
      }

      setSyncing(true);

      try {
        const result =
          await runSmartAccountSync(
            selectedAccountId,
            {
              days: 1,
              companyId,
            },
          );

        window.dispatchEvent(
          new CustomEvent(
            "mercadolivre-products-synced",
          ),
        );

        toast.success(
          formatSmartSyncMessage(result),
        );

        await loadLatestRun();
      } catch (error: any) {
        toast.error(
          error?.message
            ? `Não foi possível sincronizar: ${error.message}`
            : "Falha ao sincronizar.",
        );
      } finally {
        setSyncing(false);
      }
    }, [
      syncing,
      companyId,
      selectedAccountId,
      loadLatestRun,
    ]);

  const runStatus =
    (latestRun?.status ?? "").toLowerCase();

  const isSyncError =
    runStatus === "error" ||
    runStatus === "failed" ||
    runStatus === "failure";

  const hasRun =
    !!latestRun;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <BarChart3 className="h-3.5 w-3.5" />
            Visão Geral
          </div>

          <SyncStatusChip
            error={isSyncError}
            hasRun={hasRun}
            lastAt={
              latestRun?.created_at ??
              null
            }
            onOpen={() =>
              setSyncPanelOpen(true)
            }
          />
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
          Dashboard E-commerce ·{" "}
          {scopeLabel}
        </h1>

        <p className="text-sm text-muted-foreground max-w-3xl">
          Faturamento, pedidos,
          taxas e resultado parcial
          dos pedidos sincronizados
          do Mercado Livre.
        </p>
      </header>

      {totals.pending > 0 && (
        <div className="flex flex-col md:flex-row md:items-center gap-4 rounded-xl border border-amber-500/25 bg-amber-50/60 px-5 py-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                Resultados parciais
              </p>

              <p className="text-[13px] leading-relaxed text-amber-900/80">
                Existem{" "}
                <span className="font-semibold">
                  {num.format(totals.pending)}
                </span>{" "}
                pedidos pendentes de custo.
                Atualize o CMV para liberar
                o cálculo de lucro líquido
                real e margem confiável.
              </p>
            </div>
          </div>

          <Link
            to="/ecommerce/custos-margem"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Corrigir Custos Agora
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <section className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedGroup>
          {PERIODS.map(
            (periodOption) => (
              <SegmentButton
                key={periodOption.key}
                active={
                  period ===
                  periodOption.key
                }
                onClick={() =>
                  setPeriod(
                    periodOption.key,
                  )
                }
              >
                {periodOption.label}
              </SegmentButton>
            ),
          )}
        </SegmentedGroup>

        <SegmentedGroup>
          <SegmentButton
            active={scope === "active"}
            onClick={() =>
              setScope("active")
            }
            disabled={!selectedAccountId}
          >
            Conta ativa
          </SegmentButton>

          <SegmentButton
            active={scope === "all"}
            onClick={() =>
              setScope("all")
            }
          >
            <Users className="mr-1 h-3.5 w-3.5" />
            Todas as contas
          </SegmentButton>
        </SegmentedGroup>
      </section>

      {errorMsg && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      {accountMissing && (
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-rose-700" />

          <div>
            <p className="font-semibold">
              Conta ativa não encontrada.
            </p>

            <p className="text-rose-700">
              Selecione uma conta no topo
              para visualizar os dados.
            </p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric
          label="Faturamento bruto"
          value={brl.format(totals.gross)}
          loading={loading}
          highlight
        />

        <Metric
          label="Total de pedidos"
          value={num.format(totals.count)}
          loading={loading}
        />

        <Metric
          label="Ticket médio"
          value={brl.format(totals.ticket)}
          loading={loading}
        />

        <Metric
          label="Resultado parcial"
          value={brl.format(
            totals.netParcial,
          )}
          sublabel="Antes do custo do produto"
          loading={loading}
        />

        <Metric
          label="Taxas Mercado Livre"
          value={brl.format(totals.fees)}
          loading={loading}
        />

        <Metric
          label="Frete vendedor"
          value={brl.format(
            totals.shipping,
          )}
          loading={loading}
        />

        <Metric
          label="Pedidos pendentes de custo"
          value={num.format(
            totals.pending,
          )}
          loading={loading}
          tone={
            totals.pending > 0
              ? "warn"
              : "muted"
          }
        />

        <Metric
          label="Pedidos com lucro confiável"
          value={num.format(
            totals.high,
          )}
          loading={loading}
          tone={
            totals.high > 0
              ? "default"
              : "muted"
          }
        />
      </section>

      <section className="rounded-xl bg-card p-5 shadow-sm ring-1 ring-border/40">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Faturamento por dia
            </h2>

            <p className="text-xs text-muted-foreground mt-0.5">
              Soma diária de faturamento bruto
              no período selecionado.
            </p>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-[260px] w-full rounded-lg" />
        ) : byDay.length === 0 ||
          byDay.every(
            (day) => day.gross === 0,
          ) ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Sem pedidos no período.
          </div>
        ) : (
          <RevenueByDayChart
            data={byDay}
          />
        )}
      </section>

      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Comparativo por conta
          </h2>

          <p className="text-xs text-muted-foreground mt-0.5">
            Desempenho de cada conta
            Mercado Livre no período
            selecionado.
          </p>
        </div>

        {loading ? (
          <div className="p-5 space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : byAccount.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Sem dados por conta no período.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80 bg-muted/30">
                  <th className="text-left px-5 py-2.5 font-medium">
                    Conta
                  </th>

                  <th className="text-right px-4 py-2.5 font-medium">
                    Pedidos
                  </th>

                  <th className="text-right px-4 py-2.5 font-medium">
                    Faturamento
                  </th>

                  <th className="text-right px-4 py-2.5 font-medium">
                    Taxas ML
                  </th>

                  <th className="text-right px-4 py-2.5 font-medium">
                    Frete vendedor
                  </th>

                  <th className="text-right px-4 py-2.5 font-medium">
                    Resultado parcial
                  </th>

                  <th className="text-right px-5 py-2.5 font-medium">
                    Pend. custo
                  </th>
                </tr>
              </thead>

              <tbody>
                {byAccount.map(
                  (account, index) => (
                    <tr
                      key={account.id}
                      className={cn(
                        "border-t border-border/60 transition-colors hover:bg-muted/30",
                        index % 2 === 1 &&
                          "bg-muted/10",
                      )}
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        {accountNameById.get(
                          account.id,
                        ) ||
                          "Conta sem nome"}
                      </td>

                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {num.format(
                          account.count,
                        )}
                      </td>

                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">
                        {brl.format(
                          account.gross,
                        )}
                      </td>

                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {brl.format(
                          account.fees,
                        )}
                      </td>

                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {brl.format(
                          account.shipping,
                        )}
                      </td>

                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">
                        {brl.format(
                          account.net,
                        )}
                      </td>

                      <td className="px-5 py-3 text-right tabular-nums">
                        {account.pending > 0 ? (
                          <Badge
                            variant="outline"
                            className="border-rose-200 bg-rose-50 text-rose-700 font-semibold"
                          >
                            {num.format(
                              account.pending,
                            )}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Sheet
        open={syncPanelOpen}
        onOpenChange={
          setSyncPanelOpen
        }
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>
              Detalhes de sincronização
            </SheetTitle>

            <SheetDescription>
              Última execução para{" "}
              {scope === "active"
                ? selectedAccountName ||
                  "a conta ativa"
                : "todas as contas"}
              .
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleSync}
              disabled={
                syncing ||
                !selectedAccountId ||
                !companyId
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <RefreshCcw
                className={cn(
                  "h-3.5 w-3.5",
                  syncing &&
                    "animate-spin",
                )}
              />

              {syncing
                ? "Sincronizando…"
                : "Atualizar agora"}
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <PanelSection title="Sincronização">
              <PanelRow
                label="Última sincronização"
                value={fmtDateTime(
                  latestRun?.created_at ??
                    null,
                )}
              />

              <PanelRow
                label="Período sincronizado"
                value={
                  latestRun?.days != null
                    ? `${num.format(
                        latestRun.days,
                      )} ${
                        latestRun.days === 1
                          ? "dia"
                          : "dias"
                      }`
                    : "—"
                }
              />

              <PanelRow
                label="Pedidos encontrados"
                value={
                  latestRun
                    ? num.format(
                        latestRun.total_found ??
                          0,
                      )
                    : "—"
                }
              />

              <PanelRow
                label="Itens vinculados"
                value={
                  latestRun
                    ? num.format(
                        latestRun.items_linked ??
                          0,
                      )
                    : "—"
                }
              />

              <PanelRow
                label="Produtos criados"
                value={
                  latestRun
                    ? num.format(
                        latestRun.products_created ??
                          0,
                      )
                    : "—"
                }
              />
            </PanelSection>

            <PanelSection
              title={`Período: ${range.label}`}
            >
              <PanelRow
                label="Pedidos no período"
                value={num.format(
                  totals.count,
                )}
              />

              <PanelRow
                label="Com localização"
                value={num.format(
                  totals.withLocation,
                )}
              />

              <PanelRow
                label="Sem localização"
                value={num.format(
                  totals.withoutLocation,
                )}
              />

              <PanelRow
                label="Faturamento total"
                value={brl.format(
                  totals.gross,
                )}
              />

              <PanelRow
                label="Faturamento c/ loc."
                value={brl.format(
                  totals.revenueWithLocation,
                )}
              />
            </PanelSection>

            {latestRun?.error_message && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
                <span className="font-semibold">
                  Erro:{" "}
                </span>

                {latestRun.error_message}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SyncStatusChip({
  error,
  hasRun,
  lastAt,
  onOpen,
}: {
  error: boolean;
  hasRun: boolean;
  lastAt: string | null;
  onOpen: () => void;
}) {
  const tone = error
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : hasRun
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-slate-200 bg-slate-50 text-slate-600";

  const Icon = error
    ? AlertTriangle
    : hasRun
      ? CheckCircle2
      : Clock;

  const label = error
    ? "Erro de sincronização"
    : hasRun
      ? "Sincronizado"
      : "Aguardando sync";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-opacity hover:opacity-80",
        tone,
      )}
      aria-label="Ver detalhes de sincronização"
    >
      <span className="relative flex h-1.5 w-1.5">
        {hasRun && !error && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        )}

        <span
          className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            error
              ? "bg-rose-500"
              : hasRun
                ? "bg-emerald-500"
                : "bg-slate-400",
          )}
        />
      </span>

      <Icon className="h-3 w-3" />

      <span>{label}</span>

      {lastAt && !error && (
        <span className="text-muted-foreground/80 hidden sm:inline">
          · {fmtDateTime(lastAt)}
        </span>
      )}
    </button>
  );
}

function SegmentedGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
      {children}
    </div>
  );
}

function SegmentButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        disabled &&
          "opacity-50 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

function Metric({
  label,
  value,
  sublabel,
  loading,
  highlight,
  tone = "default",
}: {
  label: string;
  value: string;
  sublabel?: string;
  loading?: boolean;
  highlight?: boolean;
  tone?: "default" | "warn" | "muted";
}) {
  const valueTone =
    tone === "warn"
      ? "text-rose-700"
      : tone === "muted"
        ? "text-muted-foreground"
        : "text-foreground";

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-4 transition-colors hover:border-border/90",
        highlight
          ? "border-border/90"
          : "border-border/70",
      )}
    >
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>

      {loading ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <div
          className={cn(
            "mt-1.5 font-display font-semibold tabular-nums tracking-tight truncate",
            highlight
              ? "text-2xl md:text-[26px]"
              : "text-xl",
            valueTone,
          )}
          title={value}
        >
          {value}
        </div>
      )}

      {sublabel && (
        <div className="mt-1 text-[11px] text-muted-foreground">
          {sublabel}
        </div>
      )}
    </div>
  );
}

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>

      <dl className="divide-y divide-border/60">
        {children}
      </dl>
    </div>
  );
}

function PanelRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 text-[12px]">
      <dt className="text-muted-foreground">
        {label}
      </dt>

      <dd className="font-medium text-foreground tabular-nums text-right">
        {value}
      </dd>
    </div>
  );
}

type ByDayPoint = {
  key: string;
  label: string;
  gross: number;
  count: number;
};

function RevenueByDayChart({
  data,
}: {
  data: ByDayPoint[];
}) {
  const [hoverIdx, setHoverIdx] =
    useState<number | null>(null);

  const nonZero =
    data.filter(
      (day) => day.gross > 0,
    );

  const avg =
    nonZero.length > 0
      ? nonZero.reduce(
          (sum, day) =>
            sum + day.gross,
          0,
        ) / nonZero.length
      : 0;

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{
            top: 12,
            right: 24,
            left: -8,
            bottom: 0,
          }}
          barCategoryGap="18%"
          onMouseMove={(
            state: {
              isTooltipActive?: boolean;
              activeTooltipIndex?: number;
            },
          ) => {
            if (
              state?.isTooltipActive &&
              typeof state.activeTooltipIndex ===
                "number"
            ) {
              setHoverIdx(
                state.activeTooltipIndex,
              );
            } else {
              setHoverIdx(null);
            }
          }}
          onMouseLeave={() =>
            setHoverIdx(null)
          }
        >
          <defs>
            <linearGradient
              id="barBlueGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#2563eb"
              />

              <stop
                offset="100%"
                stopColor="#60a5fa"
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="hsl(var(--border) / 0.5)"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 11,
              fill:
                "hsl(var(--muted-foreground))",
            }}
            interval="preserveStartEnd"
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            width={64}
            tick={{
              fontSize: 11,
              fill:
                "hsl(var(--muted-foreground))",
            }}
            tickFormatter={(value) =>
              value >= 1000
                ? `R$ ${(value / 1000).toFixed(1)}k`
                : `R$ ${value}`
            }
          />

          <RTooltip
            cursor={false}
            content={<ChartTooltip />}
            wrapperStyle={{
              outline: "none",
            }}
          />

          {avg > 0 && (
            <ReferenceLine
              y={avg}
              stroke="hsl(var(--muted-foreground) / 0.55)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `Média: ${brl.format(
                  avg,
                )}`,
                position:
                  "right",
                fill:
                  "hsl(var(--muted-foreground))",
                fontSize: 10,
                offset: 6,
              }}
            />
          )}

          <Bar
            dataKey="gross"
            radius={[8, 8, 0, 0]}
            maxBarSize={44}
            isAnimationActive={false}
          >
            {data.map((_, index) => {
              const isHovered =
                hoverIdx === index;

              const hasHover =
                hoverIdx !== null;

              const opacity =
                hasHover
                  ? isHovered
                    ? 1
                    : 0.6
                  : 1;

              return (
                <Cell
                  key={index}
                  fill="url(#barBlueGradient)"
                  fillOpacity={opacity}
                  stroke={
                    isHovered
                      ? "rgba(255,255,255,0.85)"
                      : "transparent"
                  }
                  strokeWidth={
                    isHovered ? 1 : 0
                  }
                  style={{
                    transition:
                      "fill-opacity 180ms ease, filter 180ms ease",
                    filter:
                      isHovered
                        ? "drop-shadow(0 0 6px rgba(59,130,246,0.55))"
                        : "none",
                  }}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: ByDayPoint;
  }>;
}) {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  const day =
    payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover/90 backdrop-blur-sm px-3 py-2 text-xs shadow-xl min-w-[180px]">
      <div className="text-[11px] font-medium text-muted-foreground">
        {fmtDayLabelLong(day.key)}
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#2563eb]" />

        <span className="text-muted-foreground">
          Faturamento:
        </span>

        <span className="ml-auto tabular-nums font-semibold text-foreground">
          {brl.format(day.gross)}
        </span>
      </div>

      <div className="mt-1 pl-4 text-muted-foreground tabular-nums">
        {num.format(day.count)} pedidos
      </div>
    </div>
  );
}
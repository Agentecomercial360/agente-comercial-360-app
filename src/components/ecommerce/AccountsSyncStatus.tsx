import { useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle2, AlertTriangle, Clock, RefreshCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ECOMMERCE_COMPANY_ID } from "@/lib/ecommerce-active-account";

type AccountRow = {
  id: string;
  account_name: string | null;
  nickname: string | null;
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

type Situation = "error" | "never" | "success_sales" | "success_empty";

type Row = {
  accountId: string;
  name: string;
  run: SyncRun | null;
  situation: Situation;
};

const num = new Intl.NumberFormat("pt-BR");

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

function classify(run: SyncRun | null): Situation {
  if (!run) return "never";
  const status = (run.status ?? "").toLowerCase();
  if (status === "error" || status === "failed" || status === "failure") return "error";
  if (status === "success") {
    return (run.total_found ?? 0) > 0 ? "success_sales" : "success_empty";
  }
  return "success_empty";
}

const SITUATION_META: Record<Situation, { label: string; badge: string; icon: React.ReactNode; order: number }> = {
  error: {
    label: "Erro na sincronização",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    order: 0,
  },
  never: {
    label: "Nunca sincronizada",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    icon: <Clock className="h-3.5 w-3.5" />,
    order: 1,
  },
  success_sales: {
    label: "Sincronizada com vendas",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    order: 2,
  },
  success_empty: {
    label: "Sincronizada sem vendas no período",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    order: 3,
  },
};

export function AccountsSyncStatus({
  scope = "all",
  activeAccountId = null,
}: {
  scope?: "active" | "all";
  activeAccountId?: string | null;
} = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [runs, setRuns] = useState<SyncRun[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [accRes, runRes] = await Promise.all([
        supabase
          .from("ecommerce_accounts")
          .select("id, account_name, nickname, marketplace, is_active")
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .eq("marketplace", "mercado_livre"),
        supabase
          .from("ecommerce_sync_runs")
          .select(
            "account_id, status, days, total_found, orders_upserted, items_upserted, items_linked, products_created, orders_pending_cost, error_message, created_at",
          )
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);
      if (accRes.error) throw accRes.error;
      if (runRes.error) throw runRes.error;
      setAccounts((accRes.data as AccountRow[]) ?? []);
      setRuns((runRes.data as SyncRun[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar status das contas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const rows: Row[] = useMemo(() => {
    const latestByAccount = new Map<string, SyncRun>();
    for (const r of runs) {
      if (!r.account_id) continue;
      if (!latestByAccount.has(r.account_id)) latestByAccount.set(r.account_id, r);
    }
    const source =
      scope === "active" && activeAccountId
        ? accounts.filter((a) => a.id === activeAccountId)
        : accounts;
    const list: Row[] = source.map((a) => {
      const run = latestByAccount.get(a.id) ?? null;
      return {
        accountId: a.id,
        name: a.account_name || a.nickname || "Conta sem nome",
        run,
        situation: classify(run),
      };
    });
    list.sort((a, b) => {
      const s = SITUATION_META[a.situation].order - SITUATION_META[b.situation].order;
      if (s !== 0) return s;
      return a.name.localeCompare(b.name, "pt-BR");
    });
    return list;
  }, [accounts, runs, scope, activeAccountId]);

  const isActiveScope = scope === "active" && !!activeAccountId;

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-50 p-2 ring-1 ring-blue-100">
            <Activity className="h-4 w-4 text-blue-700" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isActiveScope ? "Status da Conta Ativa" : "Status das Contas"}
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl mt-0.5">
              Acompanhe se cada conta foi sincronizada, se houve vendas no período e se
              existe alguma falha de integração.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60 disabled:opacity-60"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {loading && rows.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
            Carregando status das contas…
          </div>
        )}
        {!loading && rows.length === 0 && !error && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
            Nenhuma conta Mercado Livre encontrada para esta empresa.
          </div>
        )}
        {rows.map((row) => {
          const meta = SITUATION_META[row.situation];
          const run = row.run;
          return (
            <div
              key={row.accountId}
              className="rounded-xl border border-border/60 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{row.name}</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}
                >
                  {meta.icon}
                  {meta.label}
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                <Field label="Última sincronização" value={fmtDateTime(run?.created_at ?? null)} />
                <Field
                  label="Período sincronizado"
                  value={run?.days != null ? `${num.format(run.days)} ${run.days === 1 ? "dia" : "dias"}` : "—"}
                />
                <Field label="Pedidos encontrados" value={run ? num.format(run.total_found ?? 0) : "—"} />
                <Field label="Itens vinculados" value={run ? num.format(run.items_linked ?? 0) : "—"} />
                <Field label="Produtos criados" value={run ? num.format(run.products_created ?? 0) : "—"} />
                <Field label="Pendentes de custo" value={run ? num.format(run.orders_pending_cost ?? 0) : "—"} />
              </dl>

              {run?.error_message && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                  <span className="font-semibold">Erro: </span>
                  {run.error_message}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </>
  );
}

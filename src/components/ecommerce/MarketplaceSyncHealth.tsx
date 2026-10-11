import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Clock3,
  Loader2,
  Megaphone,
  Radar,
  Trophy,
  WalletCards,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  companyId: string;
  accountId: string | null;
};

type SyncRow = {
  account_id: string;
  capability: "auth" | "ads" | "competition" | "market_radar" | "shipment_labels" | "financial_reconciliation";
  resource_key: string;
  status: "idle" | "running" | "success" | "error";
  last_attempt_at: string | null;
  last_success_at: string | null;
  next_due_at: string | null;
  last_error_message: string | null;
  updated_at: string;
};

const META = {
  auth: {
    label: "Autenticação ML",
    description: "Token e conexão da conta",
    icon: KeyRound,
  },
  ads: {
    label: "Product Ads",
    description: "Orgânico × publicidade",
    icon: Megaphone,
  },
  competition: {
    label: "Competição",
    description: "Posição de catálogo",
    icon: Trophy,
  },
  market_radar: {
    label: "Radar de Mercado",
    description: "Tendências e mais vendidos",
    icon: Radar,
  },
  financial_reconciliation: {
    label: "Financeiro",
    description: "Pagamentos, frete e devoluções",
    icon: WalletCards,
  },
} as const;

function formatDate(value: string | null): string {
  if (!value) return "Ainda sem coleta";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function aggregate(rows: SyncRow[], capability: keyof typeof META) {
  const matching = rows.filter((row) => row.capability === capability);
  if (matching.length === 0) {
    return {
      status: "idle" as const,
      lastSuccess: null as string | null,
      nextDue: null as string | null,
      error: null as string | null,
      resources: 0,
    };
  }

  const latest = [...matching].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )[0];
  const errors = matching.filter((row) => row.status === "error");
  const running = matching.some((row) => row.status === "running");
  const successes = matching
    .map((row) => row.last_success_at)
    .filter(Boolean)
    .sort()
    .reverse() as string[];
  const dueDates = matching
    .map((row) => row.next_due_at)
    .filter(Boolean)
    .sort() as string[];
  const overdue = dueDates.some((value) => new Date(value).getTime() <= Date.now());

  return {
    status: running
      ? ("running" as const)
      : errors.length > 0
        ? ("error" as const)
        : overdue
          ? ("overdue" as const)
          : ("success" as const),
    lastSuccess: successes[0] ?? latest?.last_success_at ?? null,
    nextDue: dueDates[0] ?? null,
    error: errors[0]?.last_error_message ?? null,
    resources: matching.length,
  };
}

export function MarketplaceSyncHealth({ companyId, accountId }: Props) {
  const [rows, setRows] = useState<SyncRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      let query = supabase
        .from("ecommerce_marketplace_sync_state")
        .select(
          "account_id,capability,resource_key,status,last_attempt_at,last_success_at,next_due_at,last_error_message,updated_at",
        )
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false })
        .limit(5000);

      if (accountId) query = query.eq("account_id", accountId);

      const { data, error } = await query;
      if (cancelled) return;

      if (error) {
        console.warn("marketplace sync health", error);
        setRows([]);
      } else {
        setRows((data ?? []) as SyncRow[]);
      }
      setLoading(false);
    }

    void load();
    const interval = window.setInterval(() => void load(), 60_000);
    const handler = () => void load();
    window.addEventListener("ac360-marketplace-synced", handler);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("ac360-marketplace-synced", handler);
    };
  }, [companyId, accountId]);

  const items = useMemo(
    () =>
      (Object.keys(META) as Array<keyof typeof META>).map((capability) => ({
        capability,
        meta: META[capability],
        data: aggregate(rows, capability),
      })),
    [rows],
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            <Activity className="h-3.5 w-3.5" />
            Saúde da Inteligência
          </div>
          <h2 className="mt-1 font-display text-lg font-bold text-slate-900">
            Sincronização automática do Marketplace
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            O AC360 monitora autenticação, Ads, competição, Radar e conciliação financeira. O scheduler 24/7 verifica as contas a cada 15 minutos e pausa coletas quando a autenticação expira.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
            {accountId ? "Conta ativa" : "Todas as contas"}
          </div>
          <Link
            to="/ecommerce/saude-inteligencia"
            className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Abrir central
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {items.map(({ capability, meta, data }) => {
          const Icon = meta.icon;
          const state =
            loading && rows.length === 0
              ? "loading"
              : data.status;

          const badge =
            state === "running"
              ? { label: "Atualizando", className: "bg-blue-50 text-blue-700", icon: Loader2 }
              : state === "error"
                ? { label: "Com erro", className: "bg-rose-50 text-rose-700", icon: AlertTriangle }
                : state === "overdue"
                  ? { label: "Atualização vencida", className: "bg-amber-50 text-amber-700", icon: Clock3 }
                  : state === "success"
                    ? { label: "Atualizado", className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 }
                    : state === "loading"
                      ? { label: "Carregando", className: "bg-slate-100 text-slate-600", icon: Loader2 }
                      : { label: "Sem coleta", className: "bg-slate-100 text-slate-600", icon: Clock3 };

          const BadgeIcon = badge.icon;

          return (
            <div key={capability} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{meta.label}</div>
                    <div className="text-[11px] text-slate-500">{meta.description}</div>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${badge.className}`}>
                  <BadgeIcon className={`h-3 w-3 ${state === "running" || state === "loading" ? "animate-spin" : ""}`} />
                  {badge.label}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <div className="text-slate-400">Último sucesso</div>
                  <div className="mt-0.5 font-semibold text-slate-700">
                    {formatDate(data.lastSuccess)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Próxima verificação</div>
                  <div className="mt-0.5 font-semibold text-slate-700">
                    {formatDate(data.nextDue)}
                  </div>
                </div>
              </div>

              {capability === "competition" && data.resources > 0 ? (
                <div className="mt-3 text-[11px] text-slate-500">
                  {data.resources.toLocaleString("pt-BR")} anúncio(s) monitorado(s) nesta visão.
                </div>
              ) : null}

              {data.error ? (
                <div className="mt-3 line-clamp-2 rounded-lg bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                  {data.error}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

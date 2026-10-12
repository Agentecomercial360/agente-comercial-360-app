import { Fragment, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/empresas")({
  component: AdminEmpresas,
  head: () => ({
    meta: [{ title: "Clientes AC360 | Admin" }],
  }),
});

type ClientRow = {
  company_id: string;
  company_name: string;
  company_status: string | null;
  company_email: string | null;
  created_at: string | null;
  owner_name: string | null;
  owner_email: string | null;
  ecommerce_status: string | null;
  plan_name: string | null;
  module_started_at: string | null;
  module_expires_at: string | null;
  accounts_total: number;
  accounts_connected: number;
  last_sync_at: string | null;
  orders_total: number;
  orders_30d: number;
  sync_errors: number;
  sync_attention: number;
  onboarding_stage:
    | "module_missing"
    | "account_missing"
    | "authorization_pending"
    | "first_sync_pending"
    | "ready"
    | string;
};

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function fmtDateTime(value: string | null | undefined) {
  if (!value) return "Nunca";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Nunca";
  return d.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function onboardingMeta(stage: ClientRow["onboarding_stage"]) {
  if (stage === "ready") {
    return {
      label: "Operação pronta",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }
  if (stage === "account_missing") {
    return {
      label: "Sem conta ML",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  if (stage === "authorization_pending") {
    return {
      label: "Aguardando OAuth",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  if (stage === "first_sync_pending") {
    return {
      label: "Primeiro sync pendente",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }
  return {
    label: "Implantação",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  };
}

function moduleMeta(status: string | null | undefined) {
  const value = (status ?? "").toLowerCase();

  if (value === "active") {
    return {
      label: "Ativo",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }
  if (value === "trial") {
    return {
      label: "Trial",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }
  if (value === "implementation") {
    return {
      label: "Em implantação",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  if (value === "suspended") {
    return {
      label: "Suspenso",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  return {
    label: status || "Não habilitado",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  };
}

function healthLabel(row: ClientRow) {
  if (row.sync_errors > 0) {
    return {
      label: `${row.sync_errors} falha(s)`,
      className: "text-rose-700",
      icon: AlertTriangle,
    };
  }

  if (row.sync_attention > 0) {
    return {
      label: `${row.sync_attention} atenção`,
      className: "text-amber-700",
      icon: Clock3,
    };
  }

  if (row.onboarding_stage === "ready") {
    return {
      label: "Saudável",
      className: "text-emerald-700",
      icon: CheckCircle2,
    };
  }

  return {
    label: "Implantação",
    className: "text-slate-500",
    icon: Activity,
  };
}

function AdminEmpresas() {
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load(manual = false) {
    manual ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_admin_ecommerce_clients_v1",
      );

      if (rpcError) throw rpcError;

      setRows(
        ((data ?? []) as ClientRow[]).map((row) => ({
          ...row,
          accounts_total: Number(row.accounts_total ?? 0),
          accounts_connected: Number(row.accounts_connected ?? 0),
          orders_total: Number(row.orders_total ?? 0),
          orders_30d: Number(row.orders_30d ?? 0),
          sync_errors: Number(row.sync_errors ?? 0),
          sync_attention: Number(row.sync_attention ?? 0),
        })),
      );
    } catch (e: any) {
      setRows([]);
      setError(e?.message || "Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (stageFilter !== "all" && row.onboarding_stage !== stageFilter) {
        return false;
      }

      if (!q) return true;

      return [
        row.company_name,
        row.company_email,
        row.owner_name,
        row.owner_email,
        row.plan_name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [rows, search, stageFilter]);

  const stats = useMemo(() => {
    const ready = rows.filter((row) => row.onboarding_stage === "ready").length;
    const inImplementation = rows.length - ready;
    const accounts = rows.reduce((sum, row) => sum + row.accounts_total, 0);
    const connected = rows.reduce((sum, row) => sum + row.accounts_connected, 0);
    const orders30d = rows.reduce((sum, row) => sum + row.orders_30d, 0);
    const withErrors = rows.filter((row) => row.sync_errors > 0).length;

    return {
      clients: rows.length,
      ready,
      inImplementation,
      accounts,
      connected,
      orders30d,
      withErrors,
    };
  }, [rows]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Central de Clientes
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Clientes AC360 E-commerce
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Acompanhe implantação, conexão Mercado Livre, volume de pedidos e saúde
              operacional sem precisar abrir Supabase ou Railway.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {refreshing ? "Atualizando…" : "Atualizar clientes"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <Stat label="Clientes E-commerce" value={stats.clients} icon={Building2} />
          <Stat label="Operações prontas" value={stats.ready} icon={CheckCircle2} />
          <Stat
            label="Em implantação"
            value={stats.inImplementation}
            icon={Clock3}
          />
          <Stat
            label="Contas ML"
            value={`${stats.connected}/${stats.accounts}`}
            icon={Store}
          />
          <Stat label="Pedidos 30d" value={stats.orders30d} icon={ShoppingCart} />
          <Stat
            label="Clientes com falha"
            value={stats.withErrors}
            icon={AlertTriangle}
            danger={stats.withErrors > 0}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar empresa, responsável, e-mail ou plano…"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">Todos os estágios</option>
              <option value="ready">Operação pronta</option>
              <option value="account_missing">Sem conta ML</option>
              <option value="authorization_pending">Aguardando OAuth</option>
              <option value="first_sync_pending">Primeiro sync pendente</option>
              <option value="module_missing">Módulo não habilitado</option>
            </select>
          </div>

          {error ? (
            <div className="border-b border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Carregando clientes reais…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1160px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Empresa
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Implantação
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Mercado Livre
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Pedidos
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Saúde
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Módulo
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => {
                    const onboarding = onboardingMeta(row.onboarding_stage);
                    const module = moduleMeta(row.ecommerce_status);
                    const health = healthLabel(row);
                    const HealthIcon = health.icon;
                    const open = expanded === row.company_id;

                    return (
                      <Fragment key={row.company_id}>
                        <tr
                          key={row.company_id}
                          className="transition-colors hover:bg-slate-50/60"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="max-w-[260px] truncate font-bold text-slate-900">
                                  {row.company_name}
                                </div>
                                <div className="mt-0.5 max-w-[260px] truncate text-xs text-slate-500">
                                  {row.owner_name || "Sem responsável"}
                                  {row.owner_email ? ` · ${row.owner_email}` : ""}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${onboarding.className}`}
                            >
                              {onboarding.label}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-800">
                              {row.accounts_connected}/{row.accounts_total} conectada(s)
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500">
                              Último sync: {fmtDateTime(row.last_sync_at)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-bold tabular-nums text-slate-900">
                              {row.orders_30d.toLocaleString("pt-BR")}
                            </div>
                            <div className="text-xs text-slate-500">
                              30 dias · {row.orders_total.toLocaleString("pt-BR")} total
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div
                              className={`inline-flex items-center gap-1.5 text-xs font-bold ${health.className}`}
                            >
                              <HealthIcon className="h-4 w-4" />
                              {health.label}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${module.className}`}
                            >
                              {module.label}
                            </span>
                            <div className="mt-1 text-[11px] text-slate-400">
                              {row.plan_name || "Sem plano definido"}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setExpanded(open ? null : row.company_id)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                              {open ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                              {open ? "Fechar" : "Ver"}
                            </button>
                          </td>
                        </tr>

                        {open ? (
                          <tr key={`${row.company_id}-details`}>
                            <td colSpan={7} className="bg-slate-50/80 px-5 py-5">
                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <Detail
                                  label="Empresa"
                                  value={row.company_name}
                                  helper={row.company_email || "Sem e-mail comercial"}
                                />
                                <Detail
                                  label="Responsável"
                                  value={row.owner_name || "Não informado"}
                                  helper={row.owner_email || "Sem e-mail"}
                                />
                                <Detail
                                  label="Cadastro"
                                  value={fmtDate(row.created_at)}
                                  helper={`ID: ${row.company_id}`}
                                />
                                <Detail
                                  label="Módulo E-commerce"
                                  value={module.label}
                                  helper={row.plan_name || "Sem plano definido"}
                                />
                                <Detail
                                  label="Contas Mercado Livre"
                                  value={`${row.accounts_connected} conectada(s)`}
                                  helper={`${row.accounts_total} conta(s) cadastrada(s)`}
                                />
                                <Detail
                                  label="Pedidos"
                                  value={row.orders_total.toLocaleString("pt-BR")}
                                  helper={`${row.orders_30d.toLocaleString("pt-BR")} nos últimos 30 dias`}
                                />
                                <Detail
                                  label="Última sincronização"
                                  value={fmtDateTime(row.last_sync_at)}
                                  helper={onboarding.label}
                                />
                                <Detail
                                  label="Saúde operacional"
                                  value={
                                    row.sync_errors > 0
                                      ? `${row.sync_errors} falha(s)`
                                      : "Sem falhas abertas"
                                  }
                                  helper={
                                    row.sync_attention > 0
                                      ? `${row.sync_attention} item(ns) pedem atenção`
                                      : "Nenhuma atenção pendente"
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}

                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-14 text-center text-sm text-slate-500"
                      >
                        Nenhum cliente encontrado com os filtros atuais.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-xs leading-relaxed text-blue-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Esta central usa uma visão agregada exclusiva de platform admin. Clientes comuns
          continuam limitados aos próprios dados pelo RLS multi-tenant.
        </div>
      </div>
    </AdminLayout>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  danger = false,
}: {
  label: string;
  value: number | string;
  icon: typeof Building2;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <Icon className={`h-4 w-4 ${danger ? "text-rose-600" : "text-blue-600"}`} />
      </div>
      <div
        className={`mt-2 text-2xl font-bold tabular-nums ${
          danger ? "text-rose-700" : "text-slate-900"
        }`}
      >
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-bold text-slate-900">
        {value}
      </div>
      <div className="mt-1 break-words text-[11px] text-slate-500">{helper}</div>
    </div>
  );
}

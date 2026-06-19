import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  UserCog,
  CheckCircle2,
  Clock,
  RefreshCw,
  Store,
  Link2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/contas")({
  component: ContasML,
  head: () => ({
    meta: [{ title: "Contas Mercado Livre | Agente Comercial 360" }],
  }),
});

const ROBOMIX_COMPANY_ID = "ac7d24b9-5227-46ac-9ced-b66473422a17";
const SYNC_ENDPOINT =
  "https://ac360-mercadolivre-api-production.up.railway.app/api/mercadolivre/sync-products-test";

type AccountRow = {
  id: string;
  company_id: string | null;
  account_name: string | null;
  marketplace: string | null;
  nickname: string | null;
  auth_status: string | null;
  ml_user_id: string | null;
  external_account_id: string | null;
  is_active: boolean | null;
  last_sync_at: string | null;
  external_account_code: string | null;
  integration_notes: string | null;
  updated_at: string | null;
};

type IntegrationRow = {
  id: string;
  account_id: string | null;
  provider: string | null;
  marketplace: string | null;
  integration_name: string | null;
  integration_status: string | null;
  external_nickname: string | null;
  external_user_id: string | null;
  last_sync_at: string | null;
  expires_at: string | null;
  updated_at: string | null;
};

function isMercadoLivre(value: string | null | undefined): boolean {
  const k = (value ?? "").toLowerCase().replace(/[\s-]/g, "_");
  return k === "mercado_livre" || k === "mercadolivre" || k === "ml";
}

function isConnected(account: AccountRow, integration?: IntegrationRow): boolean {
  const a = (account.auth_status ?? "").toLowerCase();
  const i = (integration?.integration_status ?? "").toLowerCase();
  return (
    a === "connected" ||
    a === "conectada" ||
    a === "ativa" ||
    a === "active" ||
    i === "connected" ||
    i === "active" ||
    i === "ativa"
  );
}

function formatDateTime(iso: string | null): string {
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

function ContasML() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationRow[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const { data: accData, error: accErr } = await supabase
        .from("ecommerce_accounts")
        .select(
          "id, company_id, account_name, marketplace, nickname, auth_status, ml_user_id, external_account_id, is_active, last_sync_at, external_account_code, integration_notes, updated_at",
        )
        .eq("company_id", ROBOMIX_COMPANY_ID)
        .order("account_name", { ascending: true });
      if (accErr) throw accErr;

      const filteredAccounts = ((accData as AccountRow[]) ?? []).filter((a) =>
        isMercadoLivre(a.marketplace),
      );

      const { data: intData, error: intErr } = await supabase
        .from("ecommerce_integrations")
        .select(
          "id, account_id, provider, marketplace, integration_name, integration_status, external_nickname, external_user_id, last_sync_at, expires_at, updated_at",
        )
        .eq("company_id", ROBOMIX_COMPANY_ID);
      if (intErr) throw intErr;

      const filteredIntegrations = ((intData as IntegrationRow[]) ?? []).filter(
        (i) => isMercadoLivre(i.marketplace) || isMercadoLivre(i.provider),
      );

      setAccounts(filteredAccounts);
      setIntegrations(filteredIntegrations);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar contas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const integrationByAccount = useMemo(() => {
    const m = new Map<string, IntegrationRow>();
    for (const i of integrations) {
      if (i.account_id && !m.has(i.account_id)) m.set(i.account_id, i);
    }
    return m;
  }, [integrations]);

  const summary = useMemo(() => {
    let connected = 0;
    let lastSync: string | null = null;
    for (const a of accounts) {
      const integration = a.id ? integrationByAccount.get(a.id) : undefined;
      if (isConnected(a, integration)) connected += 1;
      const candidates = [a.last_sync_at, integration?.last_sync_at].filter(
        (x): x is string => !!x,
      );
      for (const c of candidates) {
        if (!lastSync || new Date(c) > new Date(lastSync)) lastSync = c;
      }
    }
    return {
      total: accounts.length,
      connected,
      pending: accounts.length - connected,
      lastSync,
    };
  }, [accounts, integrationByAccount]);

  async function handleSyncAccount(accountId: string) {
    setSyncingId(accountId);
    try {
      const res = await fetch(SYNC_ENDPOINT, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("Resposta sincronização Mercado Livre:", data);
      if (data?.status !== "success") throw new Error("invalid response");
      const p = data.result?.products_upserted ?? data.products_upserted ?? 0;
      const l = data.result?.listings_upserted ?? data.listings_upserted ?? 0;
      toast.success(
        `Sincronização concluída: ${p} produtos e ${l} anúncios atualizados.`,
      );
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível sincronizar agora. Tente novamente em instantes.");
    } finally {
      setSyncingId(null);
    }
  }

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Contas Mercado Livre da ROBOMIX
          </h1>
          <p className="mt-1 text-slate-500">
            Gerencie as contas conectadas, acompanhe autorizações e visualize o status de
            sincronização.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total de contas"
            value={loading ? "—" : String(summary.total)}
            icon={<Store className="h-4 w-4 text-blue-600" />}
            tone="blue"
          />
          <SummaryCard
            label="Conectadas"
            value={loading ? "—" : String(summary.connected)}
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            tone="emerald"
          />
          <SummaryCard
            label="Pendentes"
            value={loading ? "—" : String(summary.pending)}
            icon={<Clock className="h-4 w-4 text-amber-600" />}
            tone="amber"
          />
          <SummaryCard
            label="Última sincronização"
            value={loading ? "—" : formatDateTime(summary.lastSync)}
            icon={<RefreshCw className="h-4 w-4 text-slate-600" />}
            tone="slate"
            small
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-900">Conta</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Marketplace</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Nickname</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Integração</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">ML User ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Última sincronização</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Observações</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                      Carregando contas…
                    </td>
                  </tr>
                )}
                {!loading && accounts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                      Nenhuma conta Mercado Livre encontrada para esta empresa.
                    </td>
                  </tr>
                )}
                {!loading &&
                  accounts.map((acc) => {
                    const integration = acc.id
                      ? integrationByAccount.get(acc.id)
                      : undefined;
                    const connected = isConnected(acc, integration);
                    const nickname =
                      acc.nickname ?? integration?.external_nickname ?? "—";
                    const mlUserId =
                      acc.ml_user_id ?? integration?.external_user_id ?? "—";
                    const lastSync =
                      acc.last_sync_at ?? integration?.last_sync_at ?? null;
                    return (
                      <tr key={acc.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                              <UserCog className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-bold text-slate-900">
                              {acc.account_name ?? "Sem nome"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">Mercado Livre</td>
                        <td className="px-6 py-4 text-slate-700">{nickname}</td>
                        <td className="px-6 py-4">
                          {connected ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Conectada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              <Clock className="h-3 w-3" />
                              Aguardando autorização
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {integration?.integration_status ?? "—"}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-700">
                          {mlUserId}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {formatDateTime(lastSync)}
                        </td>
                        <td
                          className="px-6 py-4 text-slate-600"
                          title={acc.integration_notes ?? ""}
                        >
                          <span className="line-clamp-2 max-w-[220px] text-xs">
                            {acc.integration_notes ?? "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {connected ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[11px] font-medium text-emerald-700">
                                Conta conectada
                              </span>
                              <button
                                onClick={() => handleSyncAccount(acc.id)}
                                disabled={syncingId === acc.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <RefreshCw
                                  className={`h-3.5 w-3.5 ${syncingId === acc.id ? "animate-spin" : ""}`}
                                />
                                {syncingId === acc.id ? "Sincronizando…" : "Sincronizar produtos"}
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                              <Link2 className="h-3.5 w-3.5" />
                              Aguardando autorização
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EcommerceLayout>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
  small,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "blue" | "emerald" | "amber" | "slate";
  small?: boolean;
}) {
  const ring =
    tone === "blue"
      ? "ring-blue-100 bg-blue-50"
      : tone === "emerald"
        ? "ring-emerald-100 bg-emerald-50"
        : tone === "amber"
          ? "ring-amber-100 bg-amber-50"
          : "ring-slate-200 bg-slate-50";
  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className={`rounded-full p-1.5 ring-1 ${ring}`}>{icon}</div>
      </div>
      <p
        className={`mt-3 font-bold text-slate-900 ${small ? "text-base" : "text-2xl"}`}
      >
        {value}
      </p>
    </div>
  );
}

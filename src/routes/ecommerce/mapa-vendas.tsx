import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Map as MapIcon,
  Store,
  CheckCircle2,
  Package,
  MapPinned,
  Info,
  Clock,
  AlertCircle,
  CircleDashed,
  ArrowRight,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import brStatesData from "@/data/br-states.json";

export const Route = createFileRoute("/ecommerce/mapa-vendas")({
  component: MapaVendas,
  head: () => ({
    meta: [{ title: "Mapa de Vendas | Agente Comercial 360" }],
  }),
});

const COMPANY_ID = "ac7d24b9-5227-46ac-9ced-b66473422a17";

type BrState = { uf: string; name: string; d: string; cx: number; cy: number };
const STATES = brStatesData as BrState[];

type AccountRow = {
  id: string;
  account_name: string | null;
  marketplace: string | null;
  nickname: string | null;
  auth_status: string | null;
  ml_user_id: string | null;
  is_active: boolean | null;
  last_sync_at: string | null;
};

type ListingRow = {
  id: string;
  account_id: string | null;
  status: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

function normMarketplace(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[\s-]/g, "_");
}
function isMercadoLivre(value: string | null | undefined): boolean {
  const k = normMarketplace(value);
  return k === "mercado_livre" || k === "mercadolivre" || k === "ml";
}
function isShopee(value: string | null | undefined): boolean {
  return normMarketplace(value) === "shopee";
}

function isConnected(a: AccountRow): boolean {
  return (a.auth_status ?? "").trim().toLowerCase() === "connected";
}

function formatDateTime(iso: string | null | undefined): string {
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

type AccountView = {
  account: AccountRow;
  connected: boolean;
  total: number;
  active: number;
  paused: number;
  lastSync: string | null;
  visualStatus:
    | "ready"
    | "awaiting_sync"
    | "awaiting_connection"
    | "future_marketplace";
};

function MapaVendas() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const accRes = await supabase
        .from("ecommerce_accounts")
        .select(
          "id, account_name, marketplace, nickname, auth_status, ml_user_id, is_active, last_sync_at",
        )
        .eq("company_id", COMPANY_ID)
        .order("account_name", { ascending: true });

      if (accRes.error) throw accRes.error;

      const accountRows = (accRes.data as AccountRow[]) ?? [];
      const mercadoLivreAccountIds = accountRows
        .filter((account) => isMercadoLivre(account.marketplace))
        .map((account) => account.id);

      const listRes = mercadoLivreAccountIds.length
        ? await supabase
            .from("ecommerce_listings")
            .select("id, account_id, status, is_active, updated_at")
            .eq("company_id", COMPANY_ID)
            .in("account_id", mercadoLivreAccountIds)
        : { data: [], error: null };

      if (listRes.error) throw listRes.error;

      setAccounts(accountRows);
      setListings((listRes.data as ListingRow[]) ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }


  // ML accounts + Shopee (future) rows
  const mlAccounts = useMemo(
    () => accounts.filter((a) => isMercadoLivre(a.marketplace)),
    [accounts],
  );
  const shopeeAccounts = useMemo(
    () => accounts.filter((a) => isShopee(a.marketplace)),
    [accounts],
  );

  const listingsByAccount = useMemo(() => {
    const m = new Map<string, ListingRow[]>();
    for (const l of listings) {
      if (!l.account_id) continue;
      const arr = m.get(l.account_id) ?? [];
      arr.push(l);
      m.set(l.account_id, arr);
    }
    return m;
  }, [listings]);

  const rows: AccountView[] = useMemo(() => {
    const build = (
      a: AccountRow,
      future: boolean,
    ): AccountView => {
      const connected = !future && isConnected(a);
      const ls = listingsByAccount.get(a.id) ?? [];
      const total = ls.length;
      const active = ls.filter(
        (l) =>
          l.is_active === true ||
          (l.status ?? "").toLowerCase() === "active" ||
          (l.status ?? "").toLowerCase() === "ativo",
      ).length;
      const paused = ls.filter(
        (l) =>
          (l.status ?? "").toLowerCase() === "paused" ||
          (l.status ?? "").toLowerCase() === "pausado",
      ).length;
      const lastSync = a.last_sync_at ?? null;

      let visualStatus: AccountView["visualStatus"];
      if (future) visualStatus = "future_marketplace";
      else if (connected && total > 0) visualStatus = "ready";
      else if (connected && total === 0) visualStatus = "awaiting_sync";
      else visualStatus = "awaiting_connection";

      return {
        account: a,
        connected,
        total,
        active,
        paused,
        lastSync,
        visualStatus,
      };
    };
    return [
      ...mlAccounts.map((a) => build(a, false)),
      ...shopeeAccounts.map((a) => build(a, true)),
    ];
  }, [mlAccounts, shopeeAccounts, listingsByAccount]);


  const summary = useMemo(() => {
    const totalMl = mlAccounts.length;
    const connectedMl = rows.filter(
      (r) => r.visualStatus !== "future_marketplace" && r.connected,
    ).length;
    const totalListings = listings.length;
    const readyForMap = rows.filter((r) => r.visualStatus === "ready").length;
    return { totalMl, connectedMl, totalListings, readyForMap };
  }, [rows, mlAccounts, listings, accounts]);

  return (
    <EcommerceLayout>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <MapIcon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Mapa de Vendas
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Visualize a preparação das contas Mercado Livre para análise
                futura de vendas por estado, cidade e região.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            <span className="text-xs font-semibold text-blue-700">
              Dados geográficos em preparação
            </span>
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top summary */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<Store className="h-4 w-4" />}
            label="Contas Mercado Livre"
            value={loading ? "…" : String(summary.totalMl)}
            hint="Total de contas Mercado Livre cadastradas."
            accent="primary"
          />
          <SummaryCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Contas conectadas"
            value={loading ? "…" : String(summary.connectedMl)}
            hint="Contas com autorização ativa no Mercado Livre."
            accent="success"
          />
          <SummaryCard
            icon={<Package className="h-4 w-4" />}
            label="Anúncios sincronizados"
            value={loading ? "…" : summary.totalListings.toLocaleString("pt-BR")}
            hint="Total de anúncios já trazidos para a base."
            accent="info"
          />
          <SummaryCard
            icon={<MapPinned className="h-4 w-4" />}
            label="Prontas para mapa"
            value={loading ? "…" : String(summary.readyForMap)}
            hint="Contas conectadas com ao menos 1 anúncio sincronizado."
            accent="warning"
          />
        </section>

        {/* Status das contas */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 px-6 py-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Preparação multi-conta
              </div>
              <div className="font-display text-base font-semibold text-foreground">
                Status das contas para análise regional
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {rows.length} {rows.length === 1 ? "conta" : "contas"}
            </span>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              Carregando contas…
            </div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhuma conta Mercado Livre cadastrada para esta empresa.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead>
                  <tr className="bg-slate-50/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Conta</th>
                    <th className="px-4 py-3 font-medium">Status conexão</th>
                    <th className="px-4 py-3 font-medium text-right">Anúncios</th>
                    <th className="px-4 py-3 font-medium text-right">Ativos</th>
                    <th className="px-4 py-3 font-medium text-right">Pausados</th>
                    <th className="px-4 py-3 font-medium">Última sync</th>
                    <th className="px-6 py-3 font-medium">Status mapa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {rows.map((r) => (
                    <AccountTableRow key={r.account.id} row={r} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Map + Next steps */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Empty Brazil map */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 px-6 py-4">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Visão geográfica
                </div>
                <div className="font-display text-base font-semibold text-foreground">
                  Mapa do Brasil
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                <Clock className="h-3.5 w-3.5" />
                Em preparação
              </span>
            </div>

            <div
              className="relative px-6 py-10"
              style={{
                background:
                  "linear-gradient(180deg, #F4F8FD 0%, #EAF1F9 100%)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(60% 50% at 50% 38%, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0) 70%)",
                }}
              />
              <div className="relative mx-auto w-full max-w-[560px]">
                <svg
                  viewBox="0 0 800 800"
                  className="block h-auto w-full opacity-70 drop-shadow-[0_14px_30px_rgba(30,58,138,0.10)]"
                  role="img"
                  aria-label="Mapa do Brasil (em preparação)"
                >
                  <defs>
                    <linearGradient id="stateNeutral" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#CFDBEC" />
                      <stop offset="100%" stopColor="#B8C7DD" />
                    </linearGradient>
                  </defs>
                  <g>
                    {STATES.map((s) => (
                      <path
                        key={s.uf}
                        d={s.d}
                        fill="url(#stateNeutral)"
                        stroke="#F8FAFC"
                        strokeWidth={1.2}
                        strokeLinejoin="round"
                      />
                    ))}
                  </g>
                  <g style={{ pointerEvents: "none" }}>
                    {STATES.map((s) => (
                      <text
                        key={s.uf}
                        x={s.cx}
                        y={s.cy + 3}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={700}
                        fill="#1E293B"
                        style={{ userSelect: "none", letterSpacing: 0.3 }}
                      >
                        {s.uf}
                      </text>
                    ))}
                  </g>
                </svg>

                <div className="mx-auto mt-6 max-w-md rounded-xl border border-dashed border-slate-300 bg-white/80 px-5 py-4 text-center backdrop-blur">
                  <div className="font-display text-sm font-semibold text-foreground">
                    Dados geográficos em preparação
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Os dados por estado e cidade serão exibidos após a
                    sincronização de pedidos reais do Mercado Livre.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <aside className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-[0_4px_18px_-10px_rgba(15,23,42,0.15)]">
              <div className="flex items-center gap-2 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 px-5 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <div className="text-xs font-semibold text-foreground">
                  Próxima etapa
                </div>
              </div>
              <ol className="space-y-3 px-5 py-4 text-sm">
                {[
                  "Sincronizar pedidos reais",
                  "Capturar estado e cidade do comprador/envio",
                  "Agrupar receita, pedidos, ticket médio e cancelamentos por região",
                  "Alimentar o mapa com dados reais",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[11px] font-semibold text-blue-700">
                      {i + 1}
                    </span>
                    <span className="text-foreground/90 leading-snug">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
              <div className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                <Info className="h-3.5 w-3.5" />
                <span>Como funciona</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-foreground/90">
                Cada conta Mercado Livre conectada passa a alimentar o mapa
                quando seus pedidos forem sincronizados. Contas com anúncios já
                trazidos estão prontas para a próxima etapa de geolocalização.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </EcommerceLayout>
  );
}

function AccountTableRow({ row }: { row: AccountView }) {
  const { account, total, active, paused, lastSync, visualStatus } = row;

  const statusLabel = (account.auth_status ?? "—").toLowerCase();

  return (
    <tr className="hover:bg-slate-50/60">
      <td className="px-6 py-4">
        <div className="font-medium text-foreground">
          {account.account_name ?? "Conta sem nome"}
        </div>
        <div className="text-xs text-muted-foreground">
          {account.nickname ?? "—"}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="text-foreground/90">auth: {statusLabel}</span>
        </div>
      </td>

      <td className="px-4 py-4 text-right text-sm font-medium text-foreground">
        {total.toLocaleString("pt-BR")}
      </td>
      <td className="px-4 py-4 text-right text-sm text-emerald-600">
        {active.toLocaleString("pt-BR")}
      </td>
      <td className="px-4 py-4 text-right text-sm text-amber-600">
        {paused.toLocaleString("pt-BR")}
      </td>
      <td className="px-4 py-4 text-xs text-muted-foreground">
        {formatDateTime(lastSync)}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={visualStatus} />
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: AccountView["visualStatus"] }) {
  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Pronta
      </span>
    );
  }
  if (status === "awaiting_sync") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
        <Clock className="h-3.5 w-3.5" />
        Aguardando sincronização
      </span>
    );
  }
  if (status === "awaiting_connection") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
        <Clock className="h-3.5 w-3.5" />
        Aguardando conexão
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
      <CircleDashed className="h-3.5 w-3.5" />
      Marketplace futuro
    </span>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent: "primary" | "info" | "success" | "warning";
}) {
  const accents: Record<string, string> = {
    primary: "before:bg-blue-600",
    info: "before:bg-sky-500",
    success: "before:bg-emerald-500",
    warning: "before:bg-amber-500",
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] ${accents[accent]}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold text-foreground">
        {value}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

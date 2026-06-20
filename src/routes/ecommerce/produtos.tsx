import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Megaphone,
  CheckCircle2,
  PauseCircle,
  Search,
  ExternalLink,
  Loader2,
  Store,
  Info,
  RefreshCw,
  Link2,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import { useEcommerceActiveAccount } from "@/lib/ecommerce-active-account";

export const Route = createFileRoute("/ecommerce/produtos")({
  component: InteligenciaProdutos,
  head: () => ({
    meta: [{ title: "Produtos e Anúncios | Agente Comercial 360" }],
  }),
});

const COMPANY_ID = "ac7d24b9-5227-46ac-9ced-b66473422a17";
const SYNC_ENDPOINT =
  "https://ac360-mercadolivre-api-production.up.railway.app/api/mercadolivre/sync-products";

type Product = {
  id: string;
  sku: string | null;
  product_name: string | null;
  category: string | null;
  sale_price: number | null;
  status: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

type Listing = {
  id: string;
  product_id: string | null;
  ml_item_id: string | null;
  title: string | null;
  price: number | null;
  status: string | null;
  is_active: boolean | null;
  listing_url: string | null;
  external_url: string | null;
  updated_at: string | null;
};

type Account = {
  id: string;
  account_name: string | null;
  nickname: string | null;
  marketplace: string | null;
  auth_status: string | null;
  ml_user_id: string | null;
  is_active: boolean | null;
  last_sync_at: string | null;
};

type StatusFilter = "all" | "active" | "paused";

const CONNECTED_VALUES = new Set([
  "connected", "conectada", "conectado",
  "active", "ativa", "ativo",
  "authorized", "autorizada", "autorizado",
]);

function isMercadoLivre(value: string | null | undefined): boolean {
  const k = (value ?? "").toLowerCase().replace(/[\s-]/g, "_");
  return k === "mercado_livre" || k === "mercadolivre" || k === "ml";
}

function accountIsConnected(a: Account): boolean {
  const s = (a.auth_status ?? "").toLowerCase();
  if (CONNECTED_VALUES.has(s)) return true;
  if (a.is_active && (a.ml_user_id || a.last_sync_at)) return true;
  return false;
}

function fmtPrice(v: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(v: string | null) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}
function isActiveLike(status: string | null, is_active: boolean | null) {
  if (is_active === true) return true;
  if (is_active === false) return false;
  const s = (status || "").toLowerCase();
  return s === "active" || s === "ativo";
}
function isPausedLike(status: string | null, is_active: boolean | null) {
  if (is_active === false) return true;
  const s = (status || "").toLowerCase();
  return s === "paused" || s === "pausado";
}

function StatusBadge({ status, is_active }: { status: string | null; is_active: boolean | null }) {
  const active = isActiveLike(status, is_active);
  const paused = isPausedLike(status, is_active);
  const label = active ? "Ativo" : paused ? "Pausado" : (status || "—");
  const cls = active
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : paused
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function InteligenciaProdutos() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) || null,
    [accounts, selectedAccountId],
  );
  const selectedConnected = selectedAccount ? accountIsConnected(selectedAccount) : false;

  async function loadAccounts() {
    setLoadingAccounts(true);
    try {
      const { data, error: aerr } = await supabase
        .from("ecommerce_accounts")
        .select("id, account_name, nickname, marketplace, auth_status, ml_user_id, is_active, last_sync_at")
        .eq("company_id", COMPANY_ID)
        .eq("is_active", true)
        .order("account_name", { ascending: true });
      if (aerr) throw aerr;
      const list = ((data as Account[]) ?? []).filter((a) => isMercadoLivre(a.marketplace));
      setAccounts(list);
      if (list.length && !selectedAccountId) {
        const nightled = list.find((a) =>
          (a.account_name || "").toLowerCase().includes("nightled") ||
          (a.account_name || "").toLowerCase().includes("night led"),
        );
        const firstConnected = list.find(accountIsConnected);
        setSelectedAccountId((nightled && accountIsConnected(nightled) ? nightled : firstConnected || list[0]).id);
      }
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar contas.");
    } finally {
      setLoadingAccounts(false);
    }
  }

  async function loadData(accountId: string) {
    setLoading(true);
    setError(null);
    try {
      const { data: list, error: el } = await supabase
        .from("ecommerce_listings")
        .select("id,product_id,ml_item_id,title,price,status,is_active,listing_url,external_url,updated_at")
        .eq("company_id", COMPANY_ID)
        .eq("account_id", accountId)
        .order("updated_at", { ascending: false });
      if (el) throw el;
      const ls = (list || []) as Listing[];
      setListings(ls);

      const productIds = Array.from(new Set(ls.map((l) => l.product_id).filter(Boolean))) as string[];
      if (productIds.length === 0) {
        setProducts([]);
      } else {
        const { data: prod, error: ep } = await supabase
          .from("ecommerce_products")
          .select("id,sku,product_name,category,sale_price,status,is_active,updated_at")
          .eq("company_id", COMPANY_ID)
          .in("id", productIds)
          .order("updated_at", { ascending: false });
        if (ep) throw ep;
        setProducts((prod || []) as Product[]);
      }
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) void loadData(selectedAccountId);
    const onProductsSynced = () => {
      if (selectedAccountId) void loadData(selectedAccountId);
    };
    window.addEventListener("mercadolivre-products-synced", onProductsSynced);
    return () => window.removeEventListener("mercadolivre-products-synced", onProductsSynced);
  }, [selectedAccountId]);

  async function handleSync() {
    if (syncing || !selectedAccountId) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch(SYNC_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: COMPANY_ID, account_id: selectedAccountId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("Resposta sincronização Mercado Livre:", data);
      if (data?.status !== "success") {
        throw new Error("Resposta inválida da API de sincronização.");
      }
      const productsUpserted = data.result?.products_upserted ?? 0;
      const listingsUpserted = data.result?.listings_upserted ?? 0;
      await loadData(selectedAccountId);
      setSyncMessage({
        kind: "success",
        text: `Sincronização concluída: ${productsUpserted} produtos e ${listingsUpserted} anúncios atualizados.`,
      });
    } catch {
      setSyncMessage({
        kind: "error",
        text: "Não foi possível sincronizar agora. Tente novamente em instantes.",
      });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  }

  const totals = useMemo(() => {
    const lActive = listings.filter((l) => isActiveLike(l.status, l.is_active)).length;
    const lPaused = listings.filter((l) => isPausedLike(l.status, l.is_active)).length;
    return {
      listings: listings.length,
      lActive,
      lPaused,
      products: products.length,
    };
  }, [listings, products]);

  const matchStatus = (s: string | null, a: boolean | null) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return isActiveLike(s, a);
    return isPausedLike(s, a);
  };

  const q = search.trim().toLowerCase();
  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        if (!matchStatus(p.status, p.is_active)) return false;
        if (!q) return true;
        return (
          (p.product_name || "").toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q)
        );
      }),
    [products, statusFilter, q],
  );
  const filteredListings = useMemo(
    () =>
      listings.filter((l) => {
        if (!matchStatus(l.status, l.is_active)) return false;
        if (!q) return true;
        return (
          (l.title || "").toLowerCase().includes(q) ||
          (l.ml_item_id || "").toLowerCase().includes(q)
        );
      }),
    [listings, statusFilter, q],
  );

  const kpis = [
    { label: "Total de anúncios", value: totals.listings, icon: Megaphone, accent: "from-indigo-600 to-indigo-800" },
    { label: "Anúncios ativos", value: totals.lActive, icon: CheckCircle2, accent: "from-emerald-600 to-emerald-800" },
    { label: "Anúncios pausados", value: totals.lPaused, icon: PauseCircle, accent: "from-amber-600 to-orange-700" },
    { label: "Produtos vinculados", value: totals.products, icon: Package, accent: "from-blue-700 to-blue-900" },
  ];

  const emptyAccount = !loading && selectedAccount && listings.length === 0;

  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              <Store className="h-3.5 w-3.5" />
              Contas Mercado Livre · ROBOMIX
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Produtos e Anúncios
            </h1>
            <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
              Visualize produtos e anúncios sincronizados por conta Mercado Livre da ROBOMIX.
            </p>
          </div>
        </header>

        {/* Account selector */}
        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)] flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
              <Store className="h-4 w-4" />
            </div>
            <label htmlFor="account-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conta Mercado Livre
            </label>
          </div>
          <select
            id="account-select"
            value={selectedAccountId ?? ""}
            onChange={(e) => setSelectedAccountId(e.target.value || null)}
            disabled={loadingAccounts || accounts.length === 0}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 min-w-[260px]"
          >
            {loadingAccounts && <option>Carregando contas…</option>}
            {!loadingAccounts && accounts.length === 0 && <option>Nenhuma conta encontrada</option>}
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.account_name || a.nickname || a.id}
              </option>
            ))}
          </select>

          {selectedAccount && (
            selectedConnected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Conectada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                <Link2 className="h-3.5 w-3.5" />
                Aguardando conexão
              </span>
            )
          )}

          <div className="ml-auto">
            {selectedAccount && selectedConnected && (
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
              >
                {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {syncing ? "Sincronizando…" : "Sincronizar produtos desta conta"}
              </button>
            )}
          </div>
        </section>

        {syncMessage && (
          <div
            className={`rounded-xl border px-4 py-2.5 text-sm ${
              syncMessage.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {syncMessage.text}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)]"
              >
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${k.accent} opacity-10`} />
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {k.label}
                    </div>
                    <div className="font-display text-2xl font-bold text-foreground">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : k.value}
                    </div>
                  </div>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${k.accent} text-white shadow-md`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {emptyAccount ? (
          <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700 mb-3">
              <Megaphone className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Esta conta ainda não possui produtos sincronizados.
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {selectedConnected
                ? "Realize a primeira sincronização para visualizar os anúncios desta conta."
                : "Conecte a conta Mercado Livre e realize a primeira sincronização para visualizar os anúncios."}
            </p>
          </section>
        ) : (
          <>
            {/* Filters */}
            <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)] flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, SKU, título ou ML Item ID"
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
                {([
                  { k: "all", label: "Todos" },
                  { k: "active", label: "Ativos" },
                  { k: "paused", label: "Pausados" },
                ] as { k: StatusFilter; label: string }[]).map((opt) => (
                  <button
                    key={opt.k}
                    type="button"
                    onClick={() => setStatusFilter(opt.k)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      statusFilter === opt.k
                        ? "bg-blue-700 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Products table */}
            <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">Produtos vinculados</h2>
                    <p className="text-xs text-muted-foreground">
                      {filteredProducts.length} de {products.length} produto(s)
                    </p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {["SKU", "Produto", "Categoria", "Preço", "Status", "Ativo", "Atualizado em"].map((c) => (
                        <th key={c} className="px-5 py-3 text-left font-semibold whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                          Nenhum produto corresponde aos filtros.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="border-t border-border/60 hover:bg-muted/20">
                          <td className="px-5 py-3 font-mono text-xs">{p.sku || "—"}</td>
                          <td className="px-5 py-3">{p.product_name || "—"}</td>
                          <td className="px-5 py-3 text-muted-foreground">{p.category || "—"}</td>
                          <td className="px-5 py-3 font-semibold">{fmtPrice(p.sale_price)}</td>
                          <td className="px-5 py-3">
                            <StatusBadge status={p.status} is_active={p.is_active} />
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {p.is_active === true ? "Sim" : p.is_active === false ? "Não" : "—"}
                          </td>
                          <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {fmtDate(p.updated_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Listings table */}
            <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-700 text-white">
                    <Megaphone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">Anúncios</h2>
                    <p className="text-xs text-muted-foreground">
                      {filteredListings.length} de {listings.length} anúncio(s)
                    </p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {["Título", "ML Item ID", "Preço", "Status", "Atualizado em", "Link"].map((c) => (
                        <th key={c} className="px-5 py-3 text-left font-semibold whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        </td>
                      </tr>
                    ) : filteredListings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                          Nenhum anúncio corresponde aos filtros.
                        </td>
                      </tr>
                    ) : (
                      filteredListings.map((l) => {
                        const url = l.listing_url || l.external_url;
                        return (
                          <tr key={l.id} className="border-t border-border/60 hover:bg-muted/20">
                            <td className="px-5 py-3 max-w-[420px]">
                              <div className="truncate" title={l.title || ""}>
                                {l.title || "—"}
                              </div>
                            </td>
                            <td className="px-5 py-3 font-mono text-xs">{l.ml_item_id || "—"}</td>
                            <td className="px-5 py-3 font-semibold">{fmtPrice(l.price)}</td>
                            <td className="px-5 py-3">
                              <StatusBadge status={l.status} is_active={l.is_active} />
                            </td>
                            <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                              {fmtDate(l.updated_at)}
                            </td>
                            <td className="px-5 py-3">
                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                >
                                  Abrir anúncio
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-700" />
          <span>
            Métricas de vendas, visitas, faturamento e Curva ABC serão exibidas nas próximas etapas, após a sincronização desses indicadores.
          </span>
        </div>
      </div>
    </EcommerceLayout>
  );
}

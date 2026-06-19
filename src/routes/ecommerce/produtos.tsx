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
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/produtos")({
  component: InteligenciaProdutos,
  head: () => ({
    meta: [{ title: "Produtos e Anúncios | Agente Comercial 360" }],
  }),
});

const COMPANY_ID = "ac7d24b9-5227-46ac-9ced-b66473422a17";
const ACCOUNT_ID = "d2a28e18-e5d0-40e0-82cc-0bc0c0bcd8f4";

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

type StatusFilter = "all" | "active" | "paused";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [{ data: prod, error: ep }, { data: list, error: el }] = await Promise.all([
        supabase
          .from("ecommerce_products")
          .select("id,sku,product_name,category,sale_price,status,is_active,updated_at")
          .eq("company_id", COMPANY_ID)
          .order("updated_at", { ascending: false }),
        supabase
          .from("ecommerce_listings")
          .select("id,product_id,ml_item_id,title,price,status,is_active,listing_url,external_url,updated_at")
          .eq("company_id", COMPANY_ID)
          .eq("account_id", ACCOUNT_ID)
          .order("updated_at", { ascending: false }),
      ]);
      if (ep) throw ep;
      if (el) throw el;
      setProducts((prod || []) as Product[]);
      setListings((list || []) as Listing[]);
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch(
        "https://ac360-mercadolivre-api-production.up.railway.app/api/mercadolivre/sync-products-test"
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("Resposta sincronização Mercado Livre:", data);
      if (data?.status !== "success") {
        throw new Error("Resposta inválida da API de sincronização.");
      }
      const productsUpserted = data.result?.products_upserted ?? 0;
      const listingsUpserted = data.result?.listings_upserted ?? 0;
      await loadData();
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
    const pActive = products.filter((p) => isActiveLike(p.status, p.is_active)).length;
    const pPaused = products.filter((p) => isPausedLike(p.status, p.is_active)).length;
    const lActive = listings.filter((l) => isActiveLike(l.status, l.is_active)).length;
    const lPaused = listings.filter((l) => isPausedLike(l.status, l.is_active)).length;
    return {
      products: products.length,
      pActive,
      pPaused,
      listings: listings.length,
      lActive,
      lPaused,
    };
  }, [products, listings]);

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
    [products, statusFilter, q]
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
    [listings, statusFilter, q]
  );

  const kpis = [
    { label: "Total de produtos", value: totals.products, icon: Package, accent: "from-blue-700 to-blue-900" },
    { label: "Produtos ativos", value: totals.pActive, icon: CheckCircle2, accent: "from-emerald-600 to-emerald-800" },
    { label: "Produtos pausados", value: totals.pPaused, icon: PauseCircle, accent: "from-amber-600 to-orange-700" },
    { label: "Total de anúncios", value: totals.listings, icon: Megaphone, accent: "from-indigo-600 to-indigo-800" },
    { label: "Anúncios ativos", value: totals.lActive, icon: CheckCircle2, accent: "from-emerald-600 to-emerald-800" },
    { label: "Anúncios pausados", value: totals.lPaused, icon: PauseCircle, accent: "from-amber-600 to-orange-700" },
  ];

  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              <Store className="h-3.5 w-3.5" />
              Conta NIGHT LED · Mercado Livre
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Produtos e Anúncios
            </h1>
            <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
              Produtos e anúncios sincronizados da conta NIGHT LED no Mercado Livre.
            </p>
            <p className="text-xs text-muted-foreground">
              Dados reais importados via integração oficial com Mercado Livre.
            </p>
          </div>
        </header>

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
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
                <h2 className="font-display text-lg font-bold text-foreground">Produtos</h2>
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
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="mx-auto max-w-md space-y-2">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                          <Package className="h-6 w-6" />
                        </div>
                        <div className="font-display text-base font-semibold text-foreground">
                          {products.length === 0
                            ? "Produtos ainda não sincronizados"
                            : "Nenhum produto corresponde aos filtros"}
                        </div>
                        {products.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            Aguarde a próxima sincronização ou execute a integração manualmente.
                          </p>
                        )}
                      </div>
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
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto max-w-md space-y-2">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                          <Megaphone className="h-6 w-6" />
                        </div>
                        <div className="font-display text-base font-semibold text-foreground">
                          {listings.length === 0
                            ? "Anúncios ainda não sincronizados"
                            : "Nenhum anúncio corresponde aos filtros"}
                        </div>
                      </div>
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

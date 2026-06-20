import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  PauseCircle,
  Ban,
  Tag,
  Hash,
  PackageX,
  Search,
  ExternalLink,
  Loader2,
  Store,
  CheckCircle2,
  Link2,
  Activity,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import {
  useEcommerceActiveAccount,
  ECOMMERCE_COMPANY_ID,
} from "@/lib/ecommerce-active-account";

export const Route = createFileRoute("/ecommerce/produtos-travados")({
  component: ProdutosProblemaPage,
  head: () => ({
    meta: [{ title: "Produtos Problema | Agente Comercial 360" }],
  }),
});

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

type Product = {
  id: string;
  sku: string | null;
  product_name: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

type ProblemKind =
  | "paused"
  | "inactive"
  | "no_price"
  | "bad_sku"
  | "disabled";

type FilterKey = "all" | "paused" | "inactive" | "no_price" | "bad_sku";

type Row = {
  listing: Listing;
  product: Product | null;
  problems: ProblemKind[];
};

function fmtPrice(v: number | null | undefined) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function classifyListing(l: Listing, p: Product | null): ProblemKind[] {
  const out: ProblemKind[] = [];
  const status = (l.status || "").toLowerCase();
  const paused = status === "paused" || status === "pausado";
  const active = status === "active" || status === "ativo";
  if (paused) out.push("paused");
  else if (!active && status) out.push("inactive");

  if (l.price == null || l.price <= 0) out.push("no_price");

  const sku = (p?.sku || "").trim();
  if (!sku || (l.ml_item_id && sku.toLowerCase() === l.ml_item_id.toLowerCase())) {
    out.push("bad_sku");
  }

  if (l.is_active === false || p?.is_active === false) out.push("disabled");

  return out;
}

const PROBLEM_META: Record<ProblemKind, { label: string; cls: string; icon: any }> = {
  paused:   { label: "Pausado",          cls: "bg-amber-50 text-amber-700 border-amber-200",   icon: PauseCircle },
  inactive: { label: "Inativo",          cls: "bg-rose-50 text-rose-700 border-rose-200",      icon: Ban },
  no_price: { label: "Sem preço",        cls: "bg-violet-50 text-violet-700 border-violet-200", icon: Tag },
  bad_sku:  { label: "SKU inconsistente", cls: "bg-blue-50 text-blue-700 border-blue-200",     icon: Hash },
  disabled: { label: "Produto desativado", cls: "bg-slate-100 text-slate-700 border-slate-200", icon: PackageX },
};

function ProblemBadge({ kind }: { kind: ProblemKind }) {
  const m = PROBLEM_META[kind];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${m.cls}`}>
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

function ProdutosProblemaPage() {
  return (
    <EcommerceLayout>
      <ProdutosProblemaInner />
    </EcommerceLayout>
  );
}

function ProdutosProblemaInner() {
  const {
    activeAccount,
    activeAccountId,
    isActiveConnected,
    loading: loadingAccount,
  } = useEcommerceActiveAccount();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!activeAccountId) {
      setListings([]);
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: ls, error: el } = await supabase
          .from("ecommerce_listings")
          .select("id,product_id,ml_item_id,title,price,status,is_active,listing_url,external_url,updated_at")
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .eq("account_id", activeAccountId)
          .order("updated_at", { ascending: false });
        if (el) throw el;
        const listingsData = (ls || []) as Listing[];

        const productIds = Array.from(
          new Set(listingsData.map((l) => l.product_id).filter(Boolean)),
        ) as string[];

        let productsData: Product[] = [];
        if (productIds.length) {
          const { data: pr, error: ep } = await supabase
            .from("ecommerce_products")
            .select("id,sku,product_name,is_active,updated_at")
            .eq("company_id", ECOMMERCE_COMPANY_ID)
            .in("id", productIds);
          if (ep) throw ep;
          productsData = (pr || []) as Product[];
        }

        if (cancelled) return;
        setListings(listingsData);
        setProducts(productsData);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Erro ao carregar dados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  const productById = useMemo(() => {
    const m = new Map<string, Product>();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  const allRows: Row[] = useMemo(() => {
    return listings
      .map((l) => {
        const p = l.product_id ? productById.get(l.product_id) ?? null : null;
        const problems = classifyListing(l, p);
        return { listing: l, product: p, problems };
      })
      .filter((r) => r.problems.length > 0);
  }, [listings, productById]);

  const counts = useMemo(() => {
    const c = { total: allRows.length, paused: 0, inactive: 0, no_price: 0, bad_sku: 0 };
    for (const r of allRows) {
      if (r.problems.includes("paused")) c.paused++;
      if (r.problems.includes("inactive")) c.inactive++;
      if (r.problems.includes("no_price")) c.no_price++;
      if (r.problems.includes("bad_sku")) c.bad_sku++;
    }
    return c;
  }, [allRows]);

  const q = search.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      if (filter !== "all" && !r.problems.includes(filter as ProblemKind)) return false;
      if (!q) return true;
      const hay = [
        r.product?.product_name || "",
        r.listing.title || "",
        r.product?.sku || "",
        r.listing.ml_item_id || "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [allRows, filter, q]);

  const kpis = [
    { label: "Total de problemas", value: counts.total, icon: AlertTriangle, accent: "from-rose-600 to-rose-800" },
    { label: "Pausados",            value: counts.paused,   icon: PauseCircle, accent: "from-amber-600 to-orange-700" },
    { label: "Inativos",            value: counts.inactive, icon: Ban,         accent: "from-rose-700 to-red-900" },
    { label: "Sem preço",           value: counts.no_price, icon: Tag,         accent: "from-violet-600 to-violet-800" },
    { label: "SKU inconsistente",   value: counts.bad_sku,  icon: Hash,        accent: "from-blue-700 to-blue-900" },
  ];

  const filters: { k: FilterKey; label: string }[] = [
    { k: "all", label: "Todos" },
    { k: "paused", label: "Pausados" },
    { k: "inactive", label: "Inativos" },
    { k: "no_price", label: "Sem preço" },
    { k: "bad_sku", label: "SKU inconsistente" },
  ];

  const showPendingState = !loadingAccount && activeAccount && !isActiveConnected;
  const showEmptyState =
    !loading && !showPendingState && activeAccount && isActiveConnected && allRows.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
          <Activity className="h-3.5 w-3.5" />
          Diagnóstico de Anúncios
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Produtos Problema
        </h1>
        <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
          Identifique anúncios pausados, inativos ou com dados inconsistentes na conta selecionada.
        </p>
      </header>

      {/* Active account summary */}
      <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)] flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
            <Store className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Conta analisada
            </span>
            <span className="text-sm font-bold text-foreground">
              {loadingAccount
                ? "Carregando…"
                : activeAccount?.account_name || activeAccount?.nickname || "Nenhuma conta selecionada"}
            </span>
          </div>
        </div>
        {activeAccount && (
          isActiveConnected ? (
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
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
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

      {showPendingState ? (
        <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700 mb-3">
            <Link2 className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Esta conta ainda não está conectada.
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Conecte a conta Mercado Livre para analisar produtos com problema.
          </p>
        </section>
      ) : showEmptyState ? (
        <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Nenhum problema crítico encontrado nesta conta.
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Os anúncios sincronizados estão sem alertas nos critérios atuais.
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
                placeholder="Buscar por nome, título, SKU ou ML Item ID"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="inline-flex flex-wrap rounded-lg border border-border bg-muted/30 p-1">
              {filters.map((opt) => (
                <button
                  key={opt.k}
                  type="button"
                  onClick={() => setFilter(opt.k)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    filter === opt.k
                      ? "bg-blue-700 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Table */}
          <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Produto / Anúncio</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">SKU</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">ML Item ID</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Preço</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Status</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Tipo de problema</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Última atualização</th>
                    <th className="px-5 py-3 text-right font-semibold whitespace-nowrap">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <div className="mx-auto max-w-md space-y-2">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                            <AlertTriangle className="h-6 w-6" />
                          </div>
                          <div className="font-display text-base font-semibold text-foreground">
                            Nenhum item corresponde aos filtros atuais.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((r) => {
                      const url = r.listing.listing_url || r.listing.external_url;
                      return (
                        <tr key={r.listing.id} className="border-t border-border/60 hover:bg-muted/20">
                          <td className="px-5 py-3 align-top">
                            <div className="font-semibold text-foreground line-clamp-2">
                              {r.product?.product_name || r.listing.title || "—"}
                            </div>
                            {r.product?.product_name && r.listing.title && (
                              <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                {r.listing.title}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 align-top text-foreground/80 whitespace-nowrap">
                            {r.product?.sku || <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-5 py-3 align-top text-foreground/80 whitespace-nowrap">
                            {r.listing.ml_item_id || "—"}
                          </td>
                          <td className="px-5 py-3 align-top whitespace-nowrap">
                            {fmtPrice(r.listing.price)}
                          </td>
                          <td className="px-5 py-3 align-top">
                            <span className="text-foreground/80 capitalize">
                              {r.listing.status || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3 align-top">
                            <div className="flex flex-wrap gap-1">
                              {r.problems.map((p) => (
                                <ProblemBadge key={p} kind={p} />
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-3 align-top text-muted-foreground whitespace-nowrap">
                            {fmtDate(r.listing.updated_at)}
                          </td>
                          <td className="px-5 py-3 align-top text-right whitespace-nowrap">
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Abrir anúncio
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
    </div>
  );
}

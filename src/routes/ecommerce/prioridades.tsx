import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Target,
  Search,
  ExternalLink,
  Loader2,
  Store,
  CheckCircle2,
  Link2,
  Pause,
  XCircle,
  Tag,
  Hash,
  Activity,
  AlertTriangle,
  ListChecks,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import {
  useEcommerceActiveAccount,
  ECOMMERCE_COMPANY_ID,
} from "@/lib/ecommerce-active-account";

export const Route = createFileRoute("/ecommerce/prioridades")({
  component: CentralAcoesPage,
  head: () => ({
    meta: [{ title: "Central de Ações | Agente Comercial 360" }],
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

type Priority = "high" | "medium" | "low";
type ActionType =
  | "review_pause"
  | "fix_registration"
  | "fix_price"
  | "standardize_sku"
  | "follow_product";

type Action = {
  id: string;
  listing: Listing;
  product: Product | null;
  priority: Priority;
  type: ActionType;
  typeLabel: string;
  reason: string;
  recommendation: string;
};

type FilterKey = "all" | "high" | "medium" | "low" | "paused" | "registration";

function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function classify(l: Listing, p: Product | null): Action[] {
  const acts: Action[] = [];
  const status = (l.status || "").toLowerCase();
  const sku = (p?.sku || "").trim();

  // 1. Paused
  if (status === "paused") {
    acts.push({
      id: `${l.id}:pause`,
      listing: l,
      product: p,
      priority: "medium",
      type: "review_pause",
      typeLabel: "Revisar pausa",
      reason: "Anúncio está pausado no Mercado Livre.",
      recommendation:
        "Revisar motivo da pausa e reativar se houver estoque disponível.",
    });
  }
  // 2. Inactive / closed (not active and not paused)
  else if (status && status !== "active" && status !== "ativo") {
    acts.push({
      id: `${l.id}:inactive`,
      listing: l,
      product: p,
      priority: "high",
      type: "fix_registration",
      typeLabel: "Corrigir cadastro",
      reason: `Anúncio com status "${l.status}".`,
      recommendation:
        "Verificar se o anúncio foi encerrado, bloqueado ou precisa ser recriado.",
    });
  }

  // 3. No price
  if (l.price == null || l.price <= 0) {
    acts.push({
      id: `${l.id}:price`,
      listing: l,
      product: p,
      priority: "high",
      type: "fix_price",
      typeLabel: "Corrigir preço",
      reason: "Anúncio sem preço definido ou com valor inválido.",
      recommendation:
        "Corrigir preço do anúncio antes de ativar ou sincronizar.",
    });
  }

  // 4. SKU not reliable
  const skuInvalid =
    !sku || (l.ml_item_id && sku.toLowerCase() === l.ml_item_id.toLowerCase());
  if (skuInvalid) {
    acts.push({
      id: `${l.id}:sku`,
      listing: l,
      product: p,
      priority: "medium",
      type: "standardize_sku",
      typeLabel: "Padronizar SKU",
      reason: !sku
        ? "Produto sem SKU cadastrado."
        : "SKU está igual ao ML Item ID.",
      recommendation:
        "Padronizar SKU para facilitar controle de estoque, integração e relatórios.",
    });
  }

  // 5. Strategic active
  const isActive = status === "active" || status === "ativo";
  if (
    isActive &&
    l.is_active !== false &&
    (l.price || 0) > 0 &&
    sku &&
    !(l.ml_item_id && sku.toLowerCase() === l.ml_item_id.toLowerCase())
  ) {
    acts.push({
      id: `${l.id}:follow`,
      listing: l,
      product: p,
      priority: "low",
      type: "follow_product",
      typeLabel: "Acompanhar produto",
      reason: "Anúncio ativo e bem estruturado.",
      recommendation:
        "Acompanhar produto ativo e manter pronto para análise comercial futura.",
    });
  }

  return acts;
}

function CentralAcoesPage() {
  return (
    <EcommerceLayout>
      <CentralAcoesInner />
    </EcommerceLayout>
  );
}

function CentralAcoesInner() {
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
          .select(
            "id,product_id,ml_item_id,title,price,status,is_active,listing_url,external_url,updated_at",
          )
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

  const allActions: Action[] = useMemo(() => {
    const out: Action[] = [];
    for (const l of listings) {
      const p = l.product_id ? productById.get(l.product_id) ?? null : null;
      out.push(...classify(l, p));
    }
    const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    out.sort((a, b) => rank[a.priority] - rank[b.priority]);
    return out;
  }, [listings, productById]);

  const counts = useMemo(() => {
    const total = allActions.length;
    const high = allActions.filter((a) => a.priority === "high").length;
    const medium = allActions.filter((a) => a.priority === "medium").length;
    const low = allActions.filter((a) => a.priority === "low").length;
    const paused = allActions.filter((a) => a.type === "review_pause").length;
    return { total, high, medium, low, paused };
  }, [allActions]);

  const q = search.trim().toLowerCase();
  const filteredActions = useMemo(() => {
    let rows = allActions.slice();
    if (filter === "high") rows = rows.filter((a) => a.priority === "high");
    else if (filter === "medium") rows = rows.filter((a) => a.priority === "medium");
    else if (filter === "low") rows = rows.filter((a) => a.priority === "low");
    else if (filter === "paused") rows = rows.filter((a) => a.type === "review_pause");
    else if (filter === "registration")
      rows = rows.filter(
        (a) =>
          a.type === "fix_registration" ||
          a.type === "fix_price" ||
          a.type === "standardize_sku",
      );
    if (!q) return rows;
    return rows.filter((a) => {
      const hay = [
        a.product?.product_name || "",
        a.listing.title || "",
        a.product?.sku || "",
        a.listing.ml_item_id || "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [allActions, filter, q]);

  const kpis = [
    { label: "Total de ações", value: counts.total, icon: ListChecks, accent: "from-blue-700 to-blue-900" },
    { label: "Alta prioridade", value: counts.high, icon: AlertTriangle, accent: "from-rose-600 to-rose-800" },
    { label: "Média prioridade", value: counts.medium, icon: Activity, accent: "from-amber-600 to-orange-700" },
    { label: "Baixa prioridade", value: counts.low, icon: CheckCircle2, accent: "from-emerald-600 to-emerald-800" },
    { label: "Pausados para revisar", value: counts.paused, icon: Pause, accent: "from-slate-600 to-slate-800" },
  ];

  const filters: { k: FilterKey; label: string }[] = [
    { k: "all", label: "Todas" },
    { k: "high", label: "Alta prioridade" },
    { k: "medium", label: "Média prioridade" },
    { k: "low", label: "Baixa prioridade" },
    { k: "paused", label: "Pausados" },
    { k: "registration", label: "Cadastro" },
  ];

  const showPendingState = !loadingAccount && activeAccount && !isActiveConnected;
  const showEmptyState =
    !loading && !showPendingState && activeAccount && isActiveConnected && allActions.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
          <Target className="h-3.5 w-3.5" />
          Operação Inteligente
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Central de Ações
        </h1>
        <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
          Priorize as ações operacionais da conta selecionada com base nos anúncios sincronizados.
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
            Conecte a conta Mercado Livre para gerar ações operacionais.
          </p>
        </section>
      ) : showEmptyState ? (
        <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Nenhuma ação pendente encontrada.
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Os anúncios sincronizados não apresentam alertas nos critérios atuais.
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
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Prioridade</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Produto / Anúncio</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Tipo de ação</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Motivo</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Ação recomendada</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Status</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Atualização</th>
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
                  ) : filteredActions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <div className="mx-auto max-w-md space-y-2">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                            <ListChecks className="h-6 w-6" />
                          </div>
                          <div className="font-display text-base font-semibold text-foreground">
                            Nenhuma ação corresponde aos filtros atuais.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredActions.map((a) => {
                      const url = a.listing.listing_url || a.listing.external_url;
                      return (
                        <tr key={a.id} className="border-t border-border/60 hover:bg-muted/20 align-top">
                          <td className="px-5 py-3">
                            <PriorityBadge p={a.priority} />
                          </td>
                          <td className="px-5 py-3">
                            <div className="font-semibold text-foreground line-clamp-2">
                              {a.product?.product_name || a.listing.title || "—"}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                              {a.product?.sku && (
                                <span className="inline-flex items-center gap-1">
                                  <Hash className="h-3 w-3" />
                                  {a.product.sku}
                                </span>
                              )}
                              {a.listing.ml_item_id && (
                                <span className="inline-flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  {a.listing.ml_item_id}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <ActionTypeBadge type={a.type} label={a.typeLabel} />
                          </td>
                          <td className="px-5 py-3 text-muted-foreground max-w-[260px]">
                            {a.reason}
                          </td>
                          <td className="px-5 py-3 text-foreground max-w-[320px]">
                            {a.recommendation}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <StatusBadge status={a.listing.status} />
                          </td>
                          <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                            {fmtDate(a.listing.updated_at)}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40"
                              >
                                Abrir anúncio
                                <ExternalLink className="h-3.5 w-3.5" />
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

function PriorityBadge({ p }: { p: Priority }) {
  if (p === "high")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
        <AlertTriangle className="h-3 w-3" />
        Alta
      </span>
    );
  if (p === "medium")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Activity className="h-3 w-3" />
        Média
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      <CheckCircle2 className="h-3 w-3" />
      Baixa
    </span>
  );
}

function ActionTypeBadge({ type, label }: { type: ActionType; label: string }) {
  const map: Record<ActionType, string> = {
    review_pause: "border-slate-200 bg-slate-50 text-slate-700",
    fix_registration: "border-rose-200 bg-rose-50 text-rose-700",
    fix_price: "border-violet-200 bg-violet-50 text-violet-700",
    standardize_sku: "border-indigo-200 bg-indigo-50 text-indigo-700",
    follow_product: "border-blue-200 bg-blue-50 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${map[type]}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "ativo")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Ativo
      </span>
    );
  if (s === "paused")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Pause className="h-3 w-3" />
        Pausado
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      <XCircle className="h-3 w-3" />
      {status || "—"}
    </span>
  );
}

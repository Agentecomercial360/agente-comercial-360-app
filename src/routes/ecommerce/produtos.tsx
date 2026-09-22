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
  Info,
  RefreshCw,
  MoreHorizontal,
  Copy,
  ImageIcon,
  SearchX,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import { useEcommerceActiveAccount } from "@/lib/ecommerce-active-account";
import { runSmartAccountSync, formatSmartSyncMessage } from "@/lib/ml-sync";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/ecommerce/produtos")({
  component: InteligenciaProdutos,
  head: () => ({
    meta: [
      { title: "Produtos e Anúncios | AC360 E-commerce Intelligence" },
      {
        name: "description",
        content:
          "Gerencie produtos e anúncios sincronizados das suas contas Mercado Livre em uma visão única de alta densidade.",
      },
      { property: "og:title", content: "Produtos e Anúncios | AC360 E-commerce Intelligence" },
      {
        property: "og:description",
        content:
          "Gerencie produtos e anúncios sincronizados das suas contas Mercado Livre em uma visão única de alta densidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const COMPANY_ID = "ac7d24b9-5227-46ac-9ced-b66473422a17";

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
  const label = active ? "Ativo" : paused ? "Pausado" : status || "—";
  const cls = active
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : paused
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

function Thumb({ label }: { label: string | null }) {
  const initial = (label || "").trim().charAt(0).toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/50 text-[13px] font-bold text-muted-foreground">
      {initial || <ImageIcon className="h-4 w-4" />}
    </div>
  );
}

function KpiItem({
  label,
  value,
  loading,
  tone,
}: {
  label: string;
  value: number;
  loading: boolean;
  tone: string;
}) {
  return (
    <div className="flex min-w-[130px] flex-col gap-0.5 px-4 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {loading ? (
        <Skeleton className="h-6 w-12" />
      ) : (
        <span className={`font-display text-xl font-bold ${tone}`}>{value}</span>
      )}
    </div>
  );
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <TableCell key={j} className="py-3">
              <Skeleton className="h-4 w-full max-w-[160px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={cols} className="py-14 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-foreground">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ajuste a busca ou selecione outro filtro de status.
        </p>
      </TableCell>
    </TableRow>
  );
}

function InteligenciaProdutos() {
  return (
    <EcommerceLayout>
      <InteligenciaProdutosInner />
    </EcommerceLayout>
  );
}

function InteligenciaProdutosInner() {
  const {
    activeAccount: selectedAccount,
    activeAccountId: selectedAccountId,
    isActiveConnected: selectedConnected,
  } = useEcommerceActiveAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  async function loadData(accountId: string) {
    setLoading(true);
    setError(null);
    try {
      const { data: list, error: el } = await supabase
        .from("ecommerce_listings")
        .select(
          "id,product_id,ml_item_id,title,price,status,is_active,listing_url,external_url,updated_at",
        )
        .eq("company_id", COMPANY_ID)
        .eq("account_id", accountId)
        .order("updated_at", { ascending: false });
      if (el) throw el;
      const ls = (list || []) as Listing[];
      setListings(ls);

      const productIds = Array.from(
        new Set(ls.map((l) => l.product_id).filter(Boolean)),
      ) as string[];
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
      const msg = e?.message || "Erro ao carregar dados.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedAccountId) setLoading(false);
  }, [selectedAccountId]);

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
    try {
      const result = await runSmartAccountSync(selectedAccountId, { days: 1 });
      console.log("Resposta sync-account-smart:", result.raw);
      await loadData(selectedAccountId);
      window.dispatchEvent(new CustomEvent("mercadolivre-products-synced"));
      toast.success(formatSmartSyncMessage(result));
    } catch (e: any) {
      toast.error(
        e?.message
          ? `Não foi possível sincronizar: ${e.message}`
          : "Não foi possível sincronizar agora. Tente novamente em instantes.",
      );
    } finally {
      setSyncing(false);
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

  const emptyAccount = !loading && selectedAccount && listings.length === 0;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h1 className="font-display text-2xl md:text-[28px] font-bold tracking-tight text-foreground">
              Produtos e Anúncios
            </h1>
            <p className="text-sm text-muted-foreground">
              Catálogo sincronizado da conta ativa no Mercado Livre.
            </p>
          </div>
          {selectedAccount && selectedConnected && (
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
            >
              {syncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {syncing ? "Sincronizando…" : "Sincronizar produtos desta conta"}
            </button>
          )}
        </header>

        {/* KPI bar */}
        <section className="flex flex-wrap items-center divide-x divide-border/60 rounded-xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
          <KpiItem
            label="Total de anúncios"
            value={totals.listings}
            loading={loading}
            tone="text-foreground"
          />
          <KpiItem
            label="Ativos"
            value={totals.lActive}
            loading={loading}
            tone="text-emerald-700"
          />
          <KpiItem
            label="Pausados"
            value={totals.lPaused}
            loading={loading}
            tone="text-amber-700"
          />
          <KpiItem
            label="Produtos vinculados"
            value={totals.products}
            loading={loading}
            tone="text-blue-700"
          />
        </section>

        {error && !loading && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {emptyAccount ? (
          <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Megaphone className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Esta conta ainda não possui produtos sincronizados.
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {selectedConnected
                ? "Realize a primeira sincronização para visualizar os anúncios desta conta."
                : "Conecte a conta Mercado Livre e realize a primeira sincronização para visualizar os anúncios."}
            </p>
          </section>
        ) : (
          <>
            {/* Search + filters */}
            <section className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 shadow-[var(--shadow-soft)]">
              <div className="relative min-w-[260px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por produto, SKU, título ou MLB Item ID..."
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>
              <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
                {(
                  [
                    { k: "all", label: "Todos" },
                    { k: "active", label: "Ativos" },
                    { k: "paused", label: "Pausados" },
                  ] as { k: StatusFilter; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.k}
                    type="button"
                    onClick={() => setStatusFilter(opt.k)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      statusFilter === opt.k
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Listings table */}
            <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-indigo-700" />
                  <h2 className="font-display text-sm font-bold text-foreground">Anúncios</h2>
                  <span className="text-xs text-muted-foreground">
                    {filteredListings.length} de {listings.length}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Sobre a sincronização"
                        className="text-muted-foreground transition hover:text-foreground"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Dados sincronizados do Mercado Livre. Métricas de vendas, visitas e Curva ABC
                      serão exibidas após a sincronização desses indicadores.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-[11px] uppercase tracking-wider">Produto</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">MLB ID</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-right">
                        Preço
                      </TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">
                        Atualização
                      </TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-right">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableSkeleton cols={6} />
                    ) : filteredListings.length === 0 ? (
                      <EmptyRow cols={6} message="Nenhum anúncio corresponde à busca." />
                    ) : (
                      filteredListings.map((l) => {
                        const url = l.listing_url || l.external_url;
                        return (
                          <TableRow key={l.id} className="hover:bg-muted/20">
                            <TableCell className="py-2.5">
                              <div className="flex items-center gap-3">
                                <Thumb label={l.title} />
                                <div className="min-w-0 max-w-[420px]">
                                  <div className="truncate text-sm font-medium text-foreground" title={l.title || ""}>
                                    {l.title || "—"}
                                  </div>
                                  <div className="truncate text-xs text-muted-foreground">
                                    {l.ml_item_id || "sem MLB ID"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {l.ml_item_id || "—"}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {fmtPrice(l.price)}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={l.status} is_active={l.is_active} />
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                              {fmtDate(l.updated_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {url ? (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-semibold text-foreground transition hover:bg-muted"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Abrir no ML
                                  </a>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      aria-label="Mais ações"
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      disabled={!l.ml_item_id}
                                      onClick={() => {
                                        if (!l.ml_item_id) return;
                                        void navigator.clipboard.writeText(l.ml_item_id);
                                        toast.success("MLB ID copiado.");
                                      }}
                                    >
                                      <Copy className="mr-2 h-3.5 w-3.5" />
                                      Copiar MLB ID
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      disabled={!l.title}
                                      onClick={() => {
                                        if (!l.title) return;
                                        void navigator.clipboard.writeText(l.title);
                                        toast.success("Título copiado.");
                                      }}
                                    >
                                      <Copy className="mr-2 h-3.5 w-3.5" />
                                      Copiar título
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Products table */}
            <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
                <Package className="h-4 w-4 text-blue-700" />
                <h2 className="font-display text-sm font-bold text-foreground">
                  Produtos vinculados
                </h2>
                <span className="text-xs text-muted-foreground">
                  {filteredProducts.length} de {products.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-[11px] uppercase tracking-wider">Produto</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">
                        Categoria
                      </TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider text-right">
                        Preço
                      </TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider">
                        Atualização
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableSkeleton cols={5} />
                    ) : filteredProducts.length === 0 ? (
                      <EmptyRow cols={5} message="Nenhum produto corresponde à busca." />
                    ) : (
                      filteredProducts.map((p) => (
                        <TableRow key={p.id} className="hover:bg-muted/20">
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-3">
                              <Thumb label={p.product_name} />
                              <div className="min-w-0 max-w-[420px]">
                                <div
                                  className="truncate text-sm font-medium text-foreground"
                                  title={p.product_name || ""}
                                >
                                  {p.product_name || "—"}
                                </div>
                                <div className="truncate font-mono text-xs text-muted-foreground">
                                  {p.sku || "sem SKU"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {p.category || "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {fmtPrice(p.sale_price)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={p.status} is_active={p.is_active} />
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {fmtDate(p.updated_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>

            <p className="px-1 text-[11px] text-muted-foreground">
              Métricas de vendas, visitas, faturamento e Curva ABC serão exibidas nas próximas
              etapas, após a sincronização desses indicadores.
            </p>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Boxes,
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  Clock,
  PackageCheck,
  Info,
  Package,
  TrendingDown,
  Store,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/estoque")({
  component: EstoqueCompras,
  head: () => ({
    meta: [{ title: "Estoque e Compras | Agente Comercial 360" }],
  }),
});

const COMPANY_ID = "ac7d24b9-5227-46ac-9ced-b66473422a17";

type StockStatus =
  | "risk_of_stockout"
  | "low_stock"
  | "excess_stock"
  | "stopped"
  | "normal"
  | (string & {});

type InventoryRow = {
  id: string;
  product_id: string | null;
  total_stock: number | null;
  available_stock: number | null;
  reserved_stock: number | null;
  incoming_stock: number | null;
  average_monthly_sales: number | null;
  coverage_days: number | null;
  days_without_sale: number | null;
  estimated_stock_value: number | null;
  stock_status: StockStatus | null;
  last_sale_at: string | null;
};

type ProductRow = {
  id: string;
  sku: string | null;
  product_name: string | null;
  category: string | null;
};

type ListingRow = {
  id: string;
  product_id: string | null;
  account_id: string | null;
  title: string | null;
  status: string | null;
};

type AccountRow = {
  id: string;
  account_name: string | null;
  marketplace: string | null;
  nickname: string | null;
};

type FilterKey = "all" | "risk_of_stockout" | "low_stock" | "excess_stock" | "stopped" | "normal";

const STATUS_META: Record<
  string,
  { label: string; badge: string; dot: string; ring: string; recommendation: string }
> = {
  risk_of_stockout: {
    label: "Risco de ruptura",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    dot: "bg-rose-600",
    ring: "border-l-rose-500",
    recommendation: "Priorizar reposição e proteger campanhas.",
  },
  low_stock: {
    label: "Baixo estoque",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    ring: "border-l-orange-500",
    recommendation: "Monitorar venda e planejar recompra.",
  },
  excess_stock: {
    label: "Estoque em excesso",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    ring: "border-l-amber-500",
    recommendation: "Criar promoção, kit ou ação comercial.",
  },
  stopped: {
    label: "Produto parado",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    ring: "border-l-violet-500",
    recommendation: "Revisar preço, anúncio ou pausar compra.",
  },
  normal: {
    label: "Normal",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-600",
    ring: "border-l-emerald-500",
    recommendation: "Manter acompanhamento.",
  },
};

function statusMeta(status: string | null | undefined) {
  const key = (status ?? "").toLowerCase();
  return (
    STATUS_META[key] ?? {
      label: status ?? "—",
      badge: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
      ring: "border-l-slate-300",
      recommendation: "Manter acompanhamento.",
    }
  );
}

function formatBRL(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatNumber(value: number | null | undefined, suffix = ""): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}${suffix}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function marketplaceLabel(m: string | null | undefined): string {
  const k = (m ?? "").toLowerCase().replace(/[\s-]/g, "_");
  if (k === "mercado_livre" || k === "mercadolivre" || k === "ml") return "Mercado Livre";
  if (k === "shopee") return "Shopee";
  return m ?? "Marketplace";
}

function EstoqueCompras() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [products, setProducts] = useState<Map<string, ProductRow>>(new Map());
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [accounts, setAccounts] = useState<Map<string, AccountRow>>(new Map());
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: inv, error: ei } = await supabase
          .from("ecommerce_inventory")
          .select(
            "id,product_id,total_stock,available_stock,reserved_stock,incoming_stock,average_monthly_sales,coverage_days,days_without_sale,estimated_stock_value,stock_status,last_sale_at",
          )
          .eq("company_id", COMPANY_ID);
        if (ei) throw ei;
        const invRows = (inv || []) as InventoryRow[];
        if (cancel) return;
        setInventory(invRows);

        const productIds = Array.from(
          new Set(invRows.map((r) => r.product_id).filter(Boolean)),
        ) as string[];

        if (productIds.length === 0) {
          setProducts(new Map());
          setListings([]);
          setAccounts(new Map());
          return;
        }

        const [{ data: prod, error: ep }, { data: list, error: el }, { data: accs, error: ea }] =
          await Promise.all([
            supabase
              .from("ecommerce_products")
              .select("id,sku,product_name,category")
              .eq("company_id", COMPANY_ID)
              .in("id", productIds),
            supabase
              .from("ecommerce_listings")
              .select("id,product_id,account_id,title,status")
              .eq("company_id", COMPANY_ID)
              .in("product_id", productIds),
            supabase
              .from("ecommerce_accounts")
              .select("id,account_name,marketplace,nickname")
              .eq("company_id", COMPANY_ID),
          ]);
        if (ep) throw ep;
        if (el) throw el;
        if (ea) throw ea;
        if (cancel) return;

        const pMap = new Map<string, ProductRow>();
        (prod || []).forEach((p: any) => pMap.set(p.id, p as ProductRow));
        setProducts(pMap);

        setListings((list || []) as ListingRow[]);

        const aMap = new Map<string, AccountRow>();
        (accs || []).forEach((a: any) => aMap.set(a.id, a as AccountRow));
        setAccounts(aMap);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "Erro ao carregar dados de estoque.");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    void load();
    return () => {
      cancel = true;
    };
  }, []);

  const listingsByProduct = useMemo(() => {
    const m = new Map<string, ListingRow[]>();
    for (const l of listings) {
      if (!l.product_id) continue;
      const arr = m.get(l.product_id) ?? [];
      arr.push(l);
      m.set(l.product_id, arr);
    }
    return m;
  }, [listings]);

  const totals = useMemo(() => {
    const total = inventory.length;
    const value = inventory.reduce((s, r) => s + (r.estimated_stock_value ?? 0), 0);
    const risk = inventory.filter((r) => {
      const k = (r.stock_status ?? "").toLowerCase();
      return k === "risk_of_stockout" || k === "low_stock";
    }).length;
    const stoppedExcess = inventory.filter((r) => {
      const k = (r.stock_status ?? "").toLowerCase();
      return k === "stopped" || k === "excess_stock";
    }).length;
    return { total, value, risk, stoppedExcess };
  }, [inventory]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: inventory.length,
      risk_of_stockout: 0,
      low_stock: 0,
      excess_stock: 0,
      stopped: 0,
      normal: 0,
    };
    for (const r of inventory) {
      const k = (r.stock_status ?? "").toLowerCase();
      if (c[k] != null) c[k] += 1;
    }
    return c;
  }, [inventory]);

  const filtered = useMemo(() => {
    if (filter === "all") return inventory;
    return inventory.filter((r) => (r.stock_status ?? "").toLowerCase() === filter);
  }, [inventory, filter]);

  const kpis = [
    {
      label: "Produtos monitorados",
      value: totals.total.toString(),
      icon: Boxes,
      accent: "from-blue-600 to-blue-800",
    },
    {
      label: "Valor em estoque",
      value: formatBRL(totals.value),
      icon: DollarSign,
      accent: "from-emerald-600 to-emerald-800",
    },
    {
      label: "Risco de ruptura",
      value: totals.risk.toString(),
      icon: AlertTriangle,
      accent: "from-rose-600 to-rose-800",
    },
    {
      label: "Estoque parado / excesso",
      value: totals.stoppedExcess.toString(),
      icon: TrendingDown,
      accent: "from-amber-600 to-orange-700",
    },
  ];

  const filterChips: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "risk_of_stockout", label: "Risco de ruptura" },
    { key: "low_stock", label: "Baixo estoque" },
    { key: "excess_stock", label: "Excesso" },
    { key: "stopped", label: "Parados" },
    { key: "normal", label: "Normal" },
  ];

  return (
    <EcommerceLayout>
      <div className="space-y-6">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <PackageCheck className="h-3.5 w-3.5" />
            Inteligência Operacional
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Estoque e Compras
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground max-w-3xl">
            Visão operacional do estoque da empresa: cobertura, giro, risco de ruptura,
            excesso e ações comerciais sugeridas com base em dados reais.
          </p>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${k.accent} opacity-10`}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {k.label}
                    </div>
                    <div className="font-display text-3xl font-bold text-foreground">
                      {loading ? "—" : k.value}
                    </div>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${k.accent} text-white shadow-md`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Lista principal */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Produtos com controle de estoque
              </h2>
              <p className="text-xs text-muted-foreground">
                Cruzamento de estoque, giro, cobertura e anúncios vinculados.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filterChips.map((c) => {
                const active = filter === c.key;
                const n = counts[c.key] ?? 0;
                return (
                  <button
                    key={c.key}
                    onClick={() => setFilter(c.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "border-blue-700 bg-blue-700 text-white"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.label}
                    <span
                      className={`rounded-full px-1.5 text-[10px] font-semibold ${
                        active ? "bg-white/20" : "bg-muted text-foreground/70"
                      }`}
                    >
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-14 text-center text-sm text-muted-foreground">
              Carregando estoque…
            </div>
          ) : inventory.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto max-w-md space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                  <Package className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nenhum estoque cadastrado ainda. Assim que os produtos tiverem dados de
                  estoque, os alertas de compra e cobertura aparecerão aqui.
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Nenhum produto neste filtro.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {filtered.map((row) => {
                const product = row.product_id ? products.get(row.product_id) : undefined;
                const meta = statusMeta(row.stock_status);
                const productListings = row.product_id
                  ? listingsByProduct.get(row.product_id) ?? []
                  : [];

                return (
                  <li
                    key={row.id}
                    className={`border-l-4 ${meta.ring} px-5 py-4 hover:bg-muted/30 transition`}
                  >
                    <div className="grid gap-4 lg:grid-cols-[1.4fr_2fr_1fr]">
                      {/* Identificação + status */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-foreground leading-tight">
                              {product?.product_name ?? "Produto sem nome"}
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              SKU: <span className="font-mono">{product?.sku ?? "—"}</span>
                              {product?.category && (
                                <>
                                  {" "}
                                  · <span>{product.category}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${meta.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </div>
                        <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-foreground/80">
                          <span className="font-semibold text-foreground">Recomendação: </span>
                          {meta.recommendation}
                        </div>
                      </div>

                      {/* Números operacionais */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <Metric label="Estoque total" value={formatNumber(row.total_stock)} />
                        <Metric label="Disponível" value={formatNumber(row.available_stock)} />
                        <Metric label="Reservado" value={formatNumber(row.reserved_stock)} />
                        <Metric label="Em trânsito" value={formatNumber(row.incoming_stock)} />
                        <Metric
                          label="Média mensal"
                          value={formatNumber(row.average_monthly_sales)}
                        />
                        <Metric
                          label="Cobertura"
                          value={formatNumber(row.coverage_days, " d")}
                        />
                        <Metric
                          label="Sem venda há"
                          value={formatNumber(row.days_without_sale, " d")}
                        />
                        <Metric label="Última venda" value={formatDate(row.last_sale_at)} />
                        <Metric
                          label="Valor em estoque"
                          value={formatBRL(row.estimated_stock_value)}
                          highlight
                        />
                      </div>

                      {/* Anúncios vinculados */}
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Store className="h-3 w-3" />
                          Anúncios vinculados
                        </div>
                        {productListings.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Nenhum anúncio vinculado.
                          </p>
                        ) : (
                          <ul className="space-y-1.5">
                            {productListings.slice(0, 4).map((l) => {
                              const acc = l.account_id ? accounts.get(l.account_id) : undefined;
                              const name =
                                acc?.account_name ?? acc?.nickname ?? "Conta desconhecida";
                              return (
                                <li
                                  key={l.id}
                                  className="flex items-center gap-2 text-xs text-foreground/80"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                  <span className="truncate">
                                    {marketplaceLabel(acc?.marketplace)} — {name}
                                  </span>
                                </li>
                              );
                            })}
                            {productListings.length > 4 && (
                              <li className="text-[11px] text-muted-foreground">
                                +{productListings.length - 4} outro(s)
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/40 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-700" />
          <span>
            Dados reais de <code className="font-mono">ecommerce_inventory</code> filtrados por
            empresa. Produtos sem registro de estoque não aparecem nesta visão.
          </span>
        </div>
      </div>
    </EcommerceLayout>
  );
}

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-card px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`mt-0.5 font-semibold ${
          highlight ? "text-emerald-700" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

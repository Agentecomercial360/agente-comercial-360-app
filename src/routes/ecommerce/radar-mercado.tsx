import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Flame,
  Loader2,
  Radar,
  RefreshCw,
  Search,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  autoSyncMarketplaceIntelligence,
  runMarketplaceIntelligence,
} from "@/lib/ml-marketplace-intelligence";

export const Route = createFileRoute("/ecommerce/radar-mercado")({
  component: RadarMercadoPage,
  head: () => ({
    meta: [{ title: "Radar de Mercado | Agente Comercial 360" }],
  }),
});

type TrendType = "best_seller" | "growing" | "desired" | "popular";

type TrendRow = {
  id: string;
  account_id: string | null;
  site_id: string;
  category_id: string | null;
  category_name: string | null;
  trend_type: TrendType;
  rank: number;
  keyword: string | null;
  entity_id: string | null;
  entity_type: string | null;
  title: string | null;
  url: string | null;
  image_url: string | null;
  snapshot_date: string;
  metadata: Record<string, unknown> | null;
};

type ProductRow = {
  id: string;
  sku: string | null;
  product_name: string | null;
  category: string | null;
};

const TYPE_META: Record<
  TrendType,
  { label: string; description: string; icon: typeof Flame }
> = {
  best_seller: {
    label: "Mais vendidos",
    description: "Produtos que aparecem entre os mais vendidos do Mercado Livre.",
    icon: Flame,
  },
  growing: {
    label: "Maior crescimento",
    description: "Buscas que mais aceleraram na última semana.",
    icon: TrendingUp,
  },
  desired: {
    label: "Mais desejados",
    description: "Termos com maior volume de busca na semana.",
    icon: Sparkles,
  },
  popular: {
    label: "Tendências populares",
    description: "Buscas que ganharam força em relação às semanas anteriores.",
    icon: Radar,
  },
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function RadarMercadoPage() {
  return (
    <EcommerceLayout>
      <RadarMercadoContent />
    </EcommerceLayout>
  );
}

function RadarMercadoContent() {
  const {
    companyId, activeAccountId, activeAccount, loading: accountLoading } =
    useEcommerceActiveAccount();
  const [rows, setRows] = useState<TrendRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [type, setType] = useState<TrendType>("best_seller");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (accountLoading) return;
    let cancelled = false;

    async function load() {
      setLoading(true);

      let trendQuery = supabase
        .from("ecommerce_market_trends")
        .select(
          "id,account_id,site_id,category_id,category_name,trend_type,rank,keyword,entity_id,entity_type,title,url,image_url,snapshot_date,metadata",
        )
        .eq("company_id", companyId)
        .order("snapshot_date", { ascending: false })
        .order("rank", { ascending: true })
        .limit(5000);

      if (activeAccountId) {
        trendQuery = trendQuery.or(`account_id.is.null,account_id.eq.${activeAccountId}`);
      }

      const [trendResult, productResult] = await Promise.all([
        trendQuery,
        supabase
          .from("ecommerce_products")
          .select("id,sku,product_name,category")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .limit(10000),
      ]);

      if (cancelled) return;
      setRows((trendResult.data || []) as TrendRow[]);
      setProducts((productResult.data || []) as ProductRow[]);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [activeAccountId, accountLoading, refreshTick]);

  useEffect(() => {
    if (accountLoading || !activeAccountId) return;
    let cancelled = false;

    void autoSyncMarketplaceIntelligence({
      action: "market_radar_sync",
      company_id: companyId,
      account_id: activeAccountId,
    })
      .then(({ executed }) => {
        if (executed && !cancelled) {
          setRefreshTick((value) => value + 1);
        }
      })
      .catch((autoError) => {
        console.warn("market radar auto sync", autoError);
      });

    return () => {
      cancelled = true;
    };
  }, [activeAccountId, accountLoading]);

  async function handleSync() {
    if (!activeAccountId) {
      toast.error("Selecione uma conta Mercado Livre para atualizar o radar.");
      return;
    }

    setSyncing(true);
    try {
      const result = await runMarketplaceIntelligence<{
        rows?: number;
        best_sellers?: number;
        growing?: number;
        desired?: number;
        popular?: number;
      }>({
        action: "market_radar_sync",
        company_id:
        account_id: activeAccountId,
      });

      toast.success(
        `Radar atualizado: ${Number(result.rows ?? 0).toLocaleString("pt-BR")} sinais coletados.`,
      );
      setRefreshTick((value) => value + 1);
    } catch (syncError) {
      const message =
        syncError instanceof Error
          ? syncError.message
          : "Não foi possível atualizar o Radar de Mercado.";
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  }

  const latestSnapshot = useMemo(() => {
    if (rows.length === 0) return null;
    return rows.map((row) => row.snapshot_date).sort().at(-1) ?? null;
  }, [rows]);

  const latestRows = useMemo(() => {
    if (!latestSnapshot) return [];
    return rows.filter((row) => row.snapshot_date === latestSnapshot);
  }, [rows, latestSnapshot]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of latestRows) {
      if (!row.category_id) continue;
      map.set(row.category_id, row.category_name || row.category_id);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [latestRows]);

  const productSearchIndex = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        normalized: normalize(
          [product.product_name, product.sku, product.category].filter(Boolean).join(" "),
        ),
      })),
    [products],
  );

  const filtered = useMemo(() => {
    const q = normalize(search);
    return latestRows
      .filter((row) => row.trend_type === type)
      .filter((row) => category === "all" || row.category_id === category)
      .filter((row) => {
        if (!q) return true;
        return normalize(
          [row.keyword, row.title, row.entity_id, row.category_name]
            .filter(Boolean)
            .join(" "),
        ).includes(q);
      })
      .sort((a, b) => a.rank - b.rank);
  }, [latestRows, type, category, search]);

  const enriched = useMemo(
    () =>
      filtered.map((row) => {
        const source = normalize(row.keyword || row.title || "");
        const significantTokens = source
          .split(" ")
          .filter((token) => token.length >= 4)
          .slice(0, 4);
        const matched =
          significantTokens.length === 0
            ? null
            : productSearchIndex.find((product) => {
                const hits = significantTokens.filter((token) =>
                  product.normalized.includes(token),
                ).length;
                return hits >= Math.min(2, significantTokens.length);
              }) ?? null;
        return { row, matched };
      }),
    [filtered, productSearchIndex],
  );

  const ownMatches = enriched.filter((item) => item.matched).length;
  const accountLabel =
    activeAccount?.account_name || activeAccount?.nickname || "Todas as contas";
  const selectedMeta = TYPE_META[type];

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-5 py-6 text-white shadow-[var(--shadow-soft)] md:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
              <Radar className="h-3.5 w-3.5" />
              Inteligência de Mercado
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold md:text-3xl">
              Radar de Mercado AC360
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-300">
              Encontre o que está vendendo e ganhando procura no Mercado Livre e cruze
              essas oportunidades com o seu próprio catálogo.
            </p>
            <div className="mt-3 text-xs text-slate-400">{accountLabel}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={syncing || !activeAccountId}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-300/20 bg-indigo-400/10 px-3.5 py-2 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Coletando Mercado Livre…" : "Atualizar radar"}
            </button>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Último snapshot
              </div>
              <div className="mt-1 font-semibold text-white">
                {latestSnapshot
                  ? new Date(`${latestSnapshot}T12:00:00`).toLocaleDateString("pt-BR")
                  : "Aguardando primeira coleta"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Sinais de mercado",
            value: latestRows.length,
            icon: Radar,
          },
          {
            label: "Categorias mapeadas",
            value: categories.length,
            icon: Store,
          },
          {
            label: "Possíveis matches no catálogo",
            value: ownMatches,
            icon: Sparkles,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {item.label}
                </span>
                <Icon className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 font-display text-2xl font-bold tabular-nums text-slate-900">
                {loading ? "—" : item.value.toLocaleString("pt-BR")}
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[var(--shadow-soft)]">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {(Object.keys(TYPE_META) as TrendType[]).map((key) => {
            const item = TYPE_META[key];
            const Icon = item.icon;
            const active = type === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                <p className={`mt-1 text-[11px] leading-snug ${active ? "text-slate-300" : "text-slate-500"}`}>
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-5 py-4 md:px-6">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {selectedMeta.label}
            </h2>
            <p className="text-xs text-slate-500">{selectedMeta.description}</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="all">Todas as categorias</option>
              {categories.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <div className="relative min-w-[240px] flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
                placeholder="Buscar produto ou termo"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando radar…
          </div>
        ) : latestRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
              <Radar className="h-6 w-6" />
            </div>
            <div className="mt-3 font-display text-base font-semibold text-slate-900">
              Radar pronto para a primeira sincronização
            </div>
            <p className="mx-auto mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
              Ainda não existe snapshot para esta conta. Clique em “Atualizar radar”
              para coletar os sinais atuais do Mercado Livre e iniciar o histórico.
            </p>
          </div>
        ) : enriched.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-slate-500">
            Nenhum sinal encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {enriched.map(({ row, matched }) => (
              <div
                key={row.id}
                className="grid gap-3 px-5 py-4 md:grid-cols-[auto_1fr_auto] md:items-center md:px-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 font-display text-lg font-bold text-white">
                  {row.rank}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {row.title || row.keyword || row.entity_id || "Sinal de mercado"}
                    </h3>
                    {matched ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                        Você já vende algo relacionado
                      </span>
                    ) : (
                      <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                        Oportunidade para pesquisar
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                    {row.category_name ? <span>{row.category_name}</span> : null}
                    {row.entity_id ? <span>{row.entity_id}</span> : null}
                    {matched ? (
                      <span className="font-medium text-emerald-700">
                        Match: {matched.product_name} · SKU {matched.sku || "—"}
                      </span>
                    ) : null}
                  </div>
                </div>
                {row.url ? (
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Ver no Mercado Livre
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Sem link</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

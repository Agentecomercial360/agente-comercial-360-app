import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Target, Loader2, ExternalLink, Trash2, Plus, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/ecommerce/concorrencia")({
  component: ConcorrenciaPage,
  head: () => ({
    meta: [
      { title: "Inteligência de Concorrência | Agente Comercial 360" },
      {
        name: "description",
        content:
          "Selecione um produto base do Mercado Livre e monitore concorrentes por link direto.",
      },
    ],
  }),
});

const SYNC_ITEM_ENDPOINT =
  "https://ac360-mercadolivre-api-production.up.railway.app/api/mercadolivre/competition/sync-item";

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

type ProductRow = {
  id: string;
  sku: string | null;
  product_name: string | null;
  sale_price: number | null;
};

type BaseProduct = {
  listing_id: string;
  ml_item_id: string | null;
  title: string;
  price: number | null;
  sku: string | null;
  url: string | null;
};

type CompetitorItem = {
  base_listing_id: string;
  item_id: string;
  title: string;
  price: number | null;
  currency_id: string | null;
  status: string | null;
  condition: string | null;
  listing_type_id: string | null;
  permalink: string | null;
  seller_id: number | null;
  free_shipping: boolean | null;
  available_quantity: number | null;
  sold_quantity: number | null;
  added_at: string;
};

function formatCurrency(value: number | null | undefined, currency: string | null = "BRL"): string {
  if (value == null || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(value);
  } catch {
    return `R$ ${Number(value).toFixed(2)}`;
  }
}

function extractItemId(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;
  // 1) Pure ID: MLB123... (reject MLBU)
  const pure = raw.match(/^MLB-?(\d{5,})$/i);
  if (pure) return `MLB${pure[1]}`;
  // 2) item_id:MLB123 inside URL/query
  const byParam = raw.match(/item_id[:=]\s*MLB-?(\d{5,})/i);
  if (byParam) return `MLB${byParam[1]}`;
  // 3) Any MLB-123 or MLB123 anywhere (skip MLBU)
  const matches = raw.match(/MLBU?\d+|MLB-\d+/gi);
  if (matches) {
    for (const m of matches) {
      if (/^MLBU/i.test(m)) continue;
      const d = m.match(/(\d{5,})/);
      if (d) return `MLB${d[1]}`;
    }
  }
  return null;
}

function parseErrorMessage(rawMsg: string, url: string): string {
  const msg = (rawMsg || "").toLowerCase();
  const extracted = extractItemId(url);
  const hasCatalogMarker =
    /mlbu|\/up\/|\/p\/mlb|catalog/i.test(url) || msg.includes("catalog") || msg.includes("mlbu");
  if (hasCatalogMarker && !extracted) {
    return "Este link é de catálogo. Envie o link direto do anúncio do vendedor contendo MLB seguido de números.";
  }
  if (!extracted && (msg.includes("item_id") || msg.includes("invalid url") || msg.includes("url"))) {
    return "Não foi possível identificar o ID do anúncio (MLB) na URL enviada.";
  }
  return "Não foi possível consultar este anúncio.";
}

type Verdict = { key: "competitive" | "attention" | "critical"; label: string; className: string };
function getVerdict(basePrice: number | null, compPrice: number | null): Verdict | null {
  if (basePrice == null || compPrice == null || compPrice <= 0) return null;
  const diffPct = ((basePrice - compPrice) / compPrice) * 100;
  if (diffPct <= 0)
    return {
      key: "competitive",
      label: "Competitivo",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  if (diffPct <= 10)
    return {
      key: "attention",
      label: "Atenção",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  return {
    key: "critical",
    label: "Crítico",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  };
}

function ConcorrenciaPage() {
  return (
    <EcommerceLayout>
      <ConcorrenciaInner />
    </EcommerceLayout>
  );
}

function ConcorrenciaInner() {
  const { activeAccountId, activeAccount } = useEcommerceActiveAccount();
  const [loadingBase, setLoadingBase] = useState(false);
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [baseSearch, setBaseSearch] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CompetitorItem[]>([]);

  const selectedBase = useMemo(
    () => baseProducts.find((p) => p.listing_id === selectedListingId) ?? null,
    [baseProducts, selectedListingId],
  );

  useEffect(() => {
    if (!activeAccountId) {
      setBaseProducts([]);
      setSelectedListingId(null);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoadingBase(true);
      try {
        const { data: list, error: el } = await supabase
          .from("ecommerce_listings")
          .select(
            "id,product_id,ml_item_id,title,price,status,is_active,listing_url,external_url,updated_at",
          )
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .eq("account_id", activeAccountId)
          .order("updated_at", { ascending: false })
          .limit(500);
        if (el) throw el;
        const ls = (list || []) as Listing[];
        const productIds = Array.from(
          new Set(ls.map((l) => l.product_id).filter(Boolean)),
        ) as string[];
        let productsById = new Map<string, ProductRow>();
        if (productIds.length) {
          const { data: prod } = await supabase
            .from("ecommerce_products")
            .select("id,sku,product_name,sale_price")
            .eq("company_id", ECOMMERCE_COMPANY_ID)
            .in("id", productIds);
          for (const p of (prod || []) as ProductRow[]) productsById.set(p.id, p);
        }
        const mapped: BaseProduct[] = ls.map((l) => {
          const p = l.product_id ? productsById.get(l.product_id) : undefined;
          return {
            listing_id: l.id,
            ml_item_id: l.ml_item_id,
            title: l.title || p?.product_name || "Sem título",
            price: l.price ?? p?.sale_price ?? null,
            sku: p?.sku ?? null,
            url: l.listing_url || l.external_url || null,
          };
        });
        if (!cancelled) setBaseProducts(mapped);
      } catch (e: any) {
        if (!cancelled) toast.error(e?.message || "Erro ao carregar produtos base.");
      } finally {
        if (!cancelled) setLoadingBase(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  const filteredBase = useMemo(() => {
    const q = baseSearch.trim().toLowerCase();
    if (!q) return baseProducts.slice(0, 50);
    return baseProducts
      .filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q) ||
          (p.ml_item_id || "").toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [baseProducts, baseSearch]);

  const handleAdd = useCallback(async () => {
    if (!selectedBase) {
      toast.error(
        "Selecione primeiro o produto do Thiago que será usado como base da comparação.",
      );
      return;
    }
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Cole o link do concorrente.");
      return;
    }
    if (!activeAccountId) {
      toast.error("Selecione uma conta Mercado Livre ativa.");
      return;
    }
    const extractedId = extractItemId(trimmed);
    if (!extractedId) {
      toast.error(
        "Não foi possível identificar o ID do anúncio (MLB) neste link. Cole o link direto do anúncio ou o ID (ex.: MLB3106845273).",
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(SYNC_ITEM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          company_id: ECOMMERCE_COMPANY_ID,
          account_id: activeAccountId,
          item_id: extractedId,
          item_url: trimmed,
        }),
      });
      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        /* ignore */
      }
      if (!res.ok || (data && data.status && data.status !== "success")) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }
      const payload = (data?.data ?? data) as Partial<CompetitorItem> | undefined;
      if (!payload || !payload.item_id) throw new Error("Resposta inválida");
      const item: CompetitorItem = {
        base_listing_id: selectedBase.listing_id,
        item_id: String(payload.item_id),
        title: String(payload.title ?? "Sem título"),
        price: typeof payload.price === "number" ? payload.price : Number(payload.price) || null,
        currency_id: payload.currency_id ?? "BRL",
        status: payload.status ?? null,
        condition: payload.condition ?? null,
        listing_type_id: payload.listing_type_id ?? null,
        permalink: payload.permalink ?? trimmed,
        seller_id:
          typeof payload.seller_id === "number"
            ? payload.seller_id
            : Number(payload.seller_id) || null,
        free_shipping: payload.free_shipping ?? null,
        available_quantity:
          typeof payload.available_quantity === "number"
            ? payload.available_quantity
            : Number(payload.available_quantity) || null,
        sold_quantity:
          typeof payload.sold_quantity === "number"
            ? payload.sold_quantity
            : Number(payload.sold_quantity) || null,
        added_at: new Date().toISOString(),
      };
      setItems((prev) => {
        const filtered = prev.filter(
          (p) => !(p.item_id === item.item_id && p.base_listing_id === item.base_listing_id),
        );
        return [item, ...filtered];
      });
      setUrl("");
      toast.success(`Concorrente ${item.item_id} vinculado ao produto base.`);
    } catch (err: any) {
      toast.error(parseErrorMessage(err?.message ?? "", trimmed));
    } finally {
      setLoading(false);
    }
  }, [url, activeAccountId, selectedBase]);

  const removeItem = (id: string, baseId: string) =>
    setItems((prev) =>
      prev.filter((p) => !(p.item_id === id && p.base_listing_id === baseId)),
    );

  const competitorsForBase = useMemo(
    () => (selectedBase ? items.filter((i) => i.base_listing_id === selectedBase.listing_id) : []),
    [items, selectedBase],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Inteligência Comercial
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Target className="h-6 w-6 text-muted-foreground" />
          Inteligência de Concorrência
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione um produto base e vincule anúncios concorrentes para comparar preço, frete e
          vendas.
          {activeAccount?.account_name ? (
            <> Conta ativa: <span className="font-medium text-foreground">{activeAccount.account_name}</span>.</>
          ) : null}
        </p>
      </div>

      {/* Base product picker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Produto base monitorado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedBase ? (
            <div className="flex flex-col gap-3 rounded-md border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Produto base selecionado
                </div>
                <div className="mt-1 truncate font-medium">{selectedBase.title}</div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {selectedBase.sku ? <span>SKU: <span className="font-mono">{selectedBase.sku}</span></span> : null}
                  {selectedBase.ml_item_id ? <span>ID: <span className="font-mono">{selectedBase.ml_item_id}</span></span> : null}
                  <span>Preço: <span className="font-medium text-foreground">{formatCurrency(selectedBase.price)}</span></span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedListingId(null)}>
                Trocar produto base
              </Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={baseSearch}
                  onChange={(e) => setBaseSearch(e.target.value)}
                  placeholder="Buscar por SKU, título ou item_id (MLB)…"
                  className="pl-8"
                  disabled={loadingBase || baseProducts.length === 0}
                />
              </div>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto / Anúncio</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Item ID</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingBase ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Carregando produtos…
                        </TableCell>
                      </TableRow>
                    ) : filteredBase.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                          {baseProducts.length === 0
                            ? "Nenhum produto sincronizado nesta conta ainda."
                            : "Nenhum produto encontrado para a busca."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBase.map((p) => (
                        <TableRow key={p.listing_id}>
                          <TableCell className="max-w-[360px]">
                            <div className="truncate font-medium">{p.title}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{p.sku ?? "—"}</TableCell>
                          <TableCell className="font-mono text-xs">{p.ml_item_id ?? "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(p.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedListingId(p.listing_id)}
                            >
                              Selecionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Competitor add */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adicionar concorrente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                selectedBase
                  ? "Cole aqui o link do concorrente (ex.: https://produto.mercadolivre.com.br/MLB-...)"
                  : "Selecione primeiro o produto base acima"
              }
              disabled={loading || !selectedBase}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && selectedBase) handleAdd();
              }}
              className="flex-1"
            />
            <Button onClick={handleAdd} disabled={loading || !selectedBase || !activeAccountId}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Consultando…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Adicionar concorrente
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use o link direto do anúncio contendo <span className="font-mono">MLB</span> seguido de
            números. Links de catálogo (<span className="font-mono">MLBU</span> ou{" "}
            <span className="font-mono">/p/MLB</span>) não são suportados.
          </p>
        </CardContent>
      </Card>

      {/* Comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Comparação de concorrentes{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({competitorsForBase.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedBase ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              Selecione um produto base para começar a monitorar concorrentes.
            </div>
          ) : competitorsForBase.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              Nenhum concorrente vinculado a este produto ainda. Cole um link acima.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concorrente</TableHead>
                    <TableHead className="text-right">Preço Thiago</TableHead>
                    <TableHead className="text-right">Preço concorrente</TableHead>
                    <TableHead className="text-right">Diferença</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Frete</TableHead>
                    <TableHead className="text-right">Disponível</TableHead>
                    <TableHead className="text-right">Vendidos</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitorsForBase.map((it) => {
                    const basePrice = selectedBase.price;
                    const diff =
                      basePrice != null && it.price != null ? basePrice - it.price : null;
                    const diffPct =
                      basePrice != null && it.price != null && it.price > 0
                        ? ((basePrice - it.price) / it.price) * 100
                        : null;
                    const verdict = getVerdict(basePrice, it.price);
                    return (
                      <TableRow key={`${it.base_listing_id}-${it.item_id}`}>
                        <TableCell className="max-w-[280px]">
                          <div className="truncate font-medium">{it.title}</div>
                          <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                            {it.item_id}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(basePrice)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(it.price, it.currency_id)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {diff == null ? (
                            "—"
                          ) : (
                            <div className="leading-tight">
                              <div>{formatCurrency(diff)}</div>
                              {diffPct != null ? (
                                <div className="text-xs text-muted-foreground">
                                  {diffPct > 0 ? "+" : ""}
                                  {diffPct.toFixed(1)}%
                                </div>
                              ) : null}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {verdict ? (
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${verdict.className}`}
                            >
                              {verdict.label}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs " +
                              (it.free_shipping
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-border bg-muted/40 text-muted-foreground")
                            }
                          >
                            {it.free_shipping ? "Grátis" : "Pago"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {it.available_quantity ?? "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {it.sold_quantity ?? "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{it.seller_id ?? "—"}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs capitalize text-muted-foreground">
                            {it.status ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {it.permalink ? (
                              <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                title="Abrir no Mercado Livre"
                              >
                                <a href={it.permalink} target="_blank" rel="noreferrer noopener">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(it.item_id, it.base_listing_id)}
                              title="Remover"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

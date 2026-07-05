import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Target,
  Loader2,
  ExternalLink,
  Trash2,
  Plus,
  Check,
  Search,
  Pencil,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/ecommerce/concorrencia")({
  component: ConcorrenciaPage,
  head: () => ({
    meta: [
      { title: "Inteligência de Concorrência | Agente Comercial 360" },
      {
        name: "description",
        content:
          "Selecione um produto base do Mercado Livre e monitore concorrentes por link direto ou cadastro manual.",
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

type CompetitorSource = "auto" | "manual";

type ShippingType = "full" | "coleta" | "correios" | "unknown";
type ReputationLevel = "platinum" | "gold" | "silver" | "new" | "unknown";

const SHIPPING_LABEL: Record<ShippingType, string> = {
  full: "Full",
  coleta: "Coleta",
  correios: "Correios/Próprio",
  unknown: "Não informado",
};
const REPUTATION_LABEL: Record<ReputationLevel, string> = {
  platinum: "Platinum",
  gold: "Ouro",
  silver: "Prata",
  new: "Novo/Sem reputação",
  unknown: "Não informado",
};

type CompetitorItem = {
  base_listing_id: string;
  key: string; // stable identity for edit/delete
  source: CompetitorSource;
  item_id: string | null;
  title: string;
  price: number | null;
  currency_id: string | null;
  status: string | null;
  condition: string | null;
  listing_type_id: string | null;
  permalink: string | null;
  seller_id: number | null;
  seller_name: string | null;
  free_shipping: boolean | null;
  available_quantity: number | null;
  sold_quantity: number | null;
  note: string | null;
  shipping_type: ShippingType;
  seller_reputation: ReputationLevel;
  updated_at: string;
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

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function extractItemId(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;
  const pure = raw.match(/^MLB-?(\d{5,})$/i);
  if (pure) return `MLB${pure[1]}`;
  const byParam = raw.match(/item_id[:=]\s*MLB-?(\d{5,})/i);
  if (byParam) return `MLB${byParam[1]}`;
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

function parseNumber(input: string): number | null {
  const s = (input || "").trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function isForbiddenError(rawMsg: string): boolean {
  const msg = (rawMsg || "").toLowerCase();
  return (
    /\b403\b/.test(msg) ||
    msg.includes("access_denied") ||
    msg.includes("access denied") ||
    msg.includes("forbidden")
  );
}

function parseErrorMessage(rawMsg: string, url: string): string {
  const msg = (rawMsg || "").toLowerCase();
  const extracted = extractItemId(url);
  if (isForbiddenError(rawMsg)) {
    return "O Mercado Livre bloqueou a consulta automática deste anúncio. Você pode cadastrar os dados manualmente para manter a comparação.";
  }
  const hasCatalogMarker =
    /mlbu|\/up\/|\/p\/mlb|catalog/i.test(url) || msg.includes("catalog") || msg.includes("mlbu");
  if (hasCatalogMarker && !extracted) {
    return "Este link é de catálogo. Envie o link direto do anúncio do vendedor contendo MLB seguido de números.";
  }
  if (!extracted && (msg.includes("item_id") || msg.includes("invalid url") || msg.includes("url"))) {
    return "Não foi possível identificar o ID do anúncio (MLB) na URL enviada.";
  }
  return "Não foi possível consultar este anúncio. Você pode cadastrar os dados manualmente.";
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

type ManualFormState = {
  title: string;
  itemInput: string; // MLB code or link
  price: string;
  shipping: "free" | "paid" | "";
  available: string;
  sold: string;
  seller: string;
  status: string;
  note: string;
};

const EMPTY_MANUAL: ManualFormState = {
  title: "",
  itemInput: "",
  price: "",
  shipping: "",
  available: "",
  sold: "",
  seller: "",
  status: "",
  note: "",
};

function ConcorrenciaInner() {
  const { activeAccountId, activeAccount } = useEcommerceActiveAccount();
  const [loadingBase, setLoadingBase] = useState(false);
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [baseSearch, setBaseSearch] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CompetitorItem[]>([]);

  // Manual modal
  const [manualOpen, setManualOpen] = useState(false);
  const [manualForm, setManualForm] = useState<ManualFormState>(EMPTY_MANUAL);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [manualHint, setManualHint] = useState<string | null>(null);

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
        const productsById = new Map<string, ProductRow>();
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

  const openManualNew = useCallback(
    (prefillUrl?: string, hint?: string) => {
      if (!selectedBase) {
        toast.error("Selecione primeiro o produto base.");
        return;
      }
      setEditingKey(null);
      setManualForm({ ...EMPTY_MANUAL, itemInput: prefillUrl ?? "" });
      setManualHint(hint ?? null);
      setManualOpen(true);
    },
    [selectedBase],
  );

  const openManualEdit = useCallback((it: CompetitorItem) => {
    setEditingKey(it.key);
    setManualForm({
      title: it.title,
      itemInput: it.permalink || it.item_id || "",
      price: it.price != null ? String(it.price).replace(".", ",") : "",
      shipping: it.free_shipping == null ? "" : it.free_shipping ? "free" : "paid",
      available: it.available_quantity != null ? String(it.available_quantity) : "",
      sold: it.sold_quantity != null ? String(it.sold_quantity) : "",
      seller: it.seller_name || (it.seller_id != null ? String(it.seller_id) : ""),
      status: it.status || "",
      note: it.note || "",
    });
    setManualHint(null);
    setManualOpen(true);
  }, []);

  const handleAdd = useCallback(async () => {
    if (!selectedBase) {
      toast.error("Selecione primeiro o produto base.");
      return;
    }
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Cole o link ou código MLB do concorrente.");
      return;
    }
    if (!activeAccountId) {
      toast.error("Selecione uma conta Mercado Livre ativa.");
      return;
    }
    const extractedId = extractItemId(trimmed);
    if (!extractedId) {
      toast.error(
        "Não foi possível identificar o ID do anúncio (MLB) neste link. Você pode cadastrar manualmente.",
      );
      openManualNew(trimmed, "Não conseguimos identificar o código MLB. Preencha os dados manualmente.");
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
        const baseMsg = data?.message || data?.error || `HTTP ${res.status}`;
        throw new Error(`${baseMsg} [${res.status}]`);
      }
      const payload = (data?.data ?? data) as Partial<CompetitorItem> | undefined;
      if (!payload || !payload.item_id) throw new Error("Resposta inválida");
      const itemId = String(payload.item_id);
      const item: CompetitorItem = {
        base_listing_id: selectedBase.listing_id,
        key: `auto:${itemId}`,
        source: "auto",
        item_id: itemId,
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
        seller_name: null,
        free_shipping: payload.free_shipping ?? null,
        available_quantity:
          typeof payload.available_quantity === "number"
            ? payload.available_quantity
            : Number(payload.available_quantity) || null,
        sold_quantity:
          typeof payload.sold_quantity === "number"
            ? payload.sold_quantity
            : Number(payload.sold_quantity) || null,
        note: null,
        updated_at: new Date().toISOString(),
      };
      setItems((prev) => {
        const filtered = prev.filter(
          (p) => !(p.key === item.key && p.base_listing_id === item.base_listing_id),
        );
        return [item, ...filtered];
      });
      setUrl("");
      toast.success(`Concorrente ${item.item_id} vinculado ao produto base.`);
    } catch (err: any) {
      const rawMsg = err?.message ?? "";
      const friendly = parseErrorMessage(rawMsg, trimmed);
      toast.error(friendly);
      // For blocked/forbidden or generic errors, open manual fallback pre-filled
      if (isForbiddenError(rawMsg) || /não foi possível consultar/i.test(friendly)) {
        openManualNew(trimmed, friendly);
      }
    } finally {
      setLoading(false);
    }
  }, [url, activeAccountId, selectedBase, openManualNew]);

  const handleManualSave = useCallback(() => {
    if (!selectedBase) {
      toast.error("Selecione primeiro o produto base.");
      return;
    }
    const title = manualForm.title.trim();
    const price = parseNumber(manualForm.price);
    if (!title) {
      toast.error("Informe o título do concorrente.");
      return;
    }
    if (price == null || price <= 0) {
      toast.error("Informe um preço válido para o concorrente.");
      return;
    }
    const rawItem = manualForm.itemInput.trim();
    const itemId = rawItem ? extractItemId(rawItem) : null;
    const permalink = rawItem && /^https?:\/\//i.test(rawItem) ? rawItem : null;
    const available = parseNumber(manualForm.available);
    const sold = parseNumber(manualForm.sold);
    const sellerRaw = manualForm.seller.trim();
    const sellerNum = sellerRaw && /^\d+$/.test(sellerRaw) ? Number(sellerRaw) : null;
    const nowIso = new Date().toISOString();

    const key =
      editingKey ??
      (itemId ? `manual:${itemId}` : `manual:${nowIso}:${Math.random().toString(36).slice(2, 8)}`);

    const next: CompetitorItem = {
      base_listing_id: selectedBase.listing_id,
      key,
      source: "manual",
      item_id: itemId,
      title,
      price,
      currency_id: "BRL",
      status: manualForm.status.trim() || null,
      condition: null,
      listing_type_id: null,
      permalink,
      seller_id: sellerNum,
      seller_name: sellerNum == null ? sellerRaw || null : null,
      free_shipping:
        manualForm.shipping === "free" ? true : manualForm.shipping === "paid" ? false : null,
      available_quantity: available != null ? Math.trunc(available) : null,
      sold_quantity: sold != null ? Math.trunc(sold) : null,
      note: manualForm.note.trim() || null,
      updated_at: nowIso,
    };

    setItems((prev) => {
      const filtered = prev.filter(
        (p) => !(p.key === next.key && p.base_listing_id === next.base_listing_id),
      );
      return [next, ...filtered];
    });
    setManualOpen(false);
    setManualHint(null);
    setManualForm(EMPTY_MANUAL);
    setEditingKey(null);
    toast.success(editingKey ? "Concorrente atualizado." : "Concorrente cadastrado manualmente.");
  }, [manualForm, selectedBase, editingKey]);

  const removeItem = (key: string, baseId: string) =>
    setItems((prev) => prev.filter((p) => !(p.key === key && p.base_listing_id === baseId)));

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
          Selecione um produto base e vincule concorrentes automaticamente ou manualmente.
          {activeAccount?.account_name ? (
            <>
              {" "}
              Conta ativa:{" "}
              <span className="font-medium text-foreground">{activeAccount.account_name}</span>.
            </>
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
            <div className="flex flex-col gap-3 rounded-md border border-emerald-200 bg-emerald-50/40 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Produto base selecionado
                </div>
                <div className="mt-1 truncate font-medium">{selectedBase.title}</div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {selectedBase.sku ? (
                    <span>
                      SKU: <span className="font-mono">{selectedBase.sku}</span>
                    </span>
                  ) : null}
                  {selectedBase.ml_item_id ? (
                    <span>
                      ID: <span className="font-mono">{selectedBase.ml_item_id}</span>
                    </span>
                  ) : null}
                  <span>
                    Preço:{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(selectedBase.price)}
                    </span>
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedListingId(null);
                  setUrl("");
                }}
              >
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
                      filteredBase.map((p) => {
                        const isSelected = selectedListingId === p.listing_id;
                        return (
                          <TableRow
                            key={p.listing_id}
                            className={isSelected ? "bg-emerald-50/60" : undefined}
                          >
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
                                variant={isSelected ? "default" : "outline"}
                                onClick={() => {
                                  setSelectedListingId(p.listing_id);
                                  setUrl("");
                                }}
                              >
                                {isSelected ? (
                                  <>
                                    <Check className="h-4 w-4" /> Selecionado
                                  </>
                                ) : (
                                  "Selecionar"
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
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
                  ? "Cole o link ou código MLB do concorrente"
                  : "Selecione primeiro o produto base acima"
              }
              disabled={loading || !selectedBase}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && selectedBase && url.trim()) handleAdd();
              }}
              className="flex-1"
            />
            <Button
              onClick={handleAdd}
              disabled={loading || !selectedBase || !activeAccountId || !url.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Tentando automático…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Tentar automático
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => openManualNew(url.trim() || undefined)}
              disabled={!selectedBase}
            >
              <UserPlus className="h-4 w-4" /> Cadastrar manualmente
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Se o Mercado Livre bloquear a consulta, você pode cadastrar os dados do concorrente
            manualmente para manter a comparação.
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
              Nenhum concorrente vinculado a este produto ainda. Cole um link acima ou cadastre
              manualmente.
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
                    <TableHead>Origem</TableHead>
                    <TableHead>Atualizado</TableHead>
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
                    const sellerLabel = it.seller_name || (it.seller_id != null ? String(it.seller_id) : "—");
                    return (
                      <TableRow key={`${it.base_listing_id}-${it.key}`}>
                        <TableCell className="max-w-[280px]">
                          <div className="truncate font-medium">{it.title}</div>
                          <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                            {it.item_id ?? "—"}
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
                          {it.free_shipping == null ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
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
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {it.available_quantity ?? "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {it.sold_quantity ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate font-mono text-xs">
                          {sellerLabel}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs capitalize text-muted-foreground">
                            {it.status ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs " +
                              (it.source === "auto"
                                ? "border-border bg-muted/40 text-muted-foreground"
                                : "border-border bg-background text-foreground")
                            }
                          >
                            {it.source === "auto" ? "Automático" : "Manual"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(it.updated_at)}
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
                              onClick={() => openManualEdit(it)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(it.key, it.base_listing_id)}
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

      {/* Manual entry dialog */}
      <Dialog
        open={manualOpen}
        onOpenChange={(o) => {
          setManualOpen(o);
          if (!o) {
            setManualHint(null);
            setEditingKey(null);
            setManualForm(EMPTY_MANUAL);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingKey ? "Editar concorrente" : "Cadastrar concorrente manualmente"}
            </DialogTitle>
            <DialogDescription>
              {manualHint ??
                "Preencha os dados do anúncio do concorrente para manter a comparação atualizada."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="m-title">Título do concorrente *</Label>
              <Input
                id="m-title"
                value={manualForm.title}
                onChange={(e) => setManualForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex.: Sensor Fotoelétrico 12/24V PNP com Espelho"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="m-item">Código MLB ou link</Label>
              <Input
                id="m-item"
                value={manualForm.itemInput}
                onChange={(e) => setManualForm((f) => ({ ...f, itemInput: e.target.value }))}
                placeholder="MLB3106845273 ou https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-price">Preço *</Label>
              <Input
                id="m-price"
                inputMode="decimal"
                value={manualForm.price}
                onChange={(e) => setManualForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="Ex.: 199,90"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-shipping">Frete</Label>
              <select
                id="m-shipping"
                value={manualForm.shipping}
                onChange={(e) =>
                  setManualForm((f) => ({ ...f, shipping: e.target.value as ManualFormState["shipping"] }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Não informado</option>
                <option value="free">Grátis</option>
                <option value="paid">Pago</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-avail">Quantidade disponível</Label>
              <Input
                id="m-avail"
                inputMode="numeric"
                value={manualForm.available}
                onChange={(e) => setManualForm((f) => ({ ...f, available: e.target.value }))}
                placeholder="Ex.: 50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-sold">Quantidade vendida</Label>
              <Input
                id="m-sold"
                inputMode="numeric"
                value={manualForm.sold}
                onChange={(e) => setManualForm((f) => ({ ...f, sold: e.target.value }))}
                placeholder="Ex.: 120"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-seller">Seller ID ou nome do vendedor</Label>
              <Input
                id="m-seller"
                value={manualForm.seller}
                onChange={(e) => setManualForm((f) => ({ ...f, seller: e.target.value }))}
                placeholder="Ex.: 12345678 ou Loja XYZ"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-status">Status do anúncio</Label>
              <Input
                id="m-status"
                value={manualForm.status}
                onChange={(e) => setManualForm((f) => ({ ...f, status: e.target.value }))}
                placeholder="Ex.: active, paused"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="m-note">Observação</Label>
              <Textarea
                id="m-note"
                value={manualForm.note}
                onChange={(e) => setManualForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Notas internas sobre este concorrente (opcional)"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManualOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleManualSave}>Salvar concorrente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

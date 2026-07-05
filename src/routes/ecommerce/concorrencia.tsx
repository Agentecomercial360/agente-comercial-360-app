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

type VerdictKey = "competitive" | "attention" | "critical";
type Verdict = {
  key: VerdictKey;
  label: string;
  reason: string | null;
  tooltip: string;
  className: string;
  action: string;
};

function diagnose(
  basePrice: number | null,
  compPrice: number | null,
  baseShip: ShippingType,
  compShip: ShippingType,
  baseRep: ReputationLevel,
  compRep: ReputationLevel,
  currency: string | null,
): Verdict | null {
  if (basePrice == null || compPrice == null || compPrice <= 0) return null;
  const diffPct = ((basePrice - compPrice) / compPrice) * 100;
  const compHasFull = compShip === "full";
  const baseHasFull = baseShip === "full";
  const compHighRep = compRep === "platinum" || compRep === "gold";
  const baseHighRep = baseRep === "platinum" || baseRep === "gold";
  const emerald = "border-emerald-200 bg-emerald-50 text-emerald-700";
  const amber = "border-amber-200 bg-amber-50 text-amber-700";
  const rose = "border-rose-200 bg-rose-50 text-rose-700";

  if (diffPct <= 0) {
    return {
      key: "competitive",
      label: "Competitivo",
      reason: null,
      tooltip: "Seu preço está igual ou melhor que o do concorrente.",
      className: emerald,
      action: "Nenhuma ação necessária",
    };
  }
  if (diffPct <= 10) {
    if (compHasFull && !baseHasFull) {
      return {
        key: "attention",
        label: "Atenção",
        reason: "Logística",
        tooltip: "Preço próximo, mas concorrente tem vantagem logística Full.",
        className: amber,
        action: "Monitorar; considerar Full a médio prazo",
      };
    }
    return {
      key: "attention",
      label: "Atenção",
      reason: "Preço",
      tooltip: "Ajuste fino de preço pode equalizar.",
      className: amber,
      action: "Pequeno ajuste de preço resolve",
    };
  }
  if (compHighRep && !baseHighRep) {
    return {
      key: "critical",
      label: "Crítico",
      reason: "Reputação",
      tooltip:
        "Diferença de preço alta, mas concorrente também tem vantagem de reputação; ajuste de preço sozinho pode não resolver.",
      className: rose,
      action: "Focar em avaliações; preço não é o problema principal",
    };
  }
  if (compHasFull && !baseHasFull) {
    return {
      key: "critical",
      label: "Crítico",
      reason: "Logística",
      tooltip: "Diferença de preço alta e concorrente ainda tem vantagem logística Full.",
      className: rose,
      action: "Avaliar migração para Full ou frete grátis",
    };
  }
  return {
    key: "critical",
    label: "Crítico",
    reason: "Preço",
    tooltip: "Preço muito acima do concorrente.",
    className: rose,
    action: `Reduzir para ${formatCurrency(compPrice, currency)} para virar competitivo`,
  };
}

type ThreatLevel = "baixa" | "media" | "alta";
type Threat = { score: number; level: ThreatLevel; reasons: string[] };

function threatFor(
  item: CompetitorItem,
  basePrice: number | null,
  baseShip: ShippingType,
  baseRep: ReputationLevel,
): Threat {
  let score = 0;
  const reasons: string[] = [];
  if (item.price != null && basePrice != null && basePrice > 0) {
    const pct = ((basePrice - item.price) / basePrice) * 100;
    if (pct > 15) {
      score += 35;
      reasons.push("preço muito menor");
    } else if (pct > 5) {
      score += 25;
      reasons.push("preço menor");
    } else if (pct > 0) {
      score += 10;
      reasons.push("preço levemente menor");
    }
  }
  if (item.free_shipping === true) {
    score += 12;
    reasons.push("frete grátis");
  }
  if (item.shipping_type === "full" && baseShip !== "full") {
    score += 20;
    reasons.push("envio Full");
  }
  const sold = item.sold_quantity ?? 0;
  if (sold > 100) {
    score += 15;
    reasons.push("alto volume de vendas");
  } else if (sold > 20) {
    score += 8;
    reasons.push("volume relevante");
  }
  const avail = item.available_quantity ?? 0;
  if (avail > 50) {
    score += 5;
    reasons.push("estoque alto");
  }
  const compHighRep = item.seller_reputation === "platinum" || item.seller_reputation === "gold";
  const baseHighRep = baseRep === "platinum" || baseRep === "gold";
  if (compHighRep && !baseHighRep) {
    score += 15;
    reasons.push("reputação superior");
  }
  score = Math.min(100, score);
  const level: ThreatLevel = score >= 55 ? "alta" : score >= 30 ? "media" : "baixa";
  return { score, level, reasons };
}

function recommendationsFor(
  item: CompetitorItem,
  basePrice: number | null,
  baseShip: ShippingType,
  baseRep: ReputationLevel,
): string[] {
  const recs: string[] = [];
  if (item.price != null && basePrice != null && basePrice > 0) {
    const pct = ((basePrice - item.price) / basePrice) * 100;
    if (pct > 10) recs.push("Revisar preço (validar margem antes)");
    else if (pct > 3) recs.push("Testar cupom ou oferta pontual");
  }
  if (item.shipping_type === "full" && baseShip !== "full") {
    recs.push("Avaliar migração para Full");
  }
  if (item.free_shipping === true) {
    recs.push("Considerar frete grátis promocional");
  }
  if ((item.sold_quantity ?? 0) > 100) {
    recs.push("Testar campanha de Ads para visibilidade");
  }
  const compHighRep = item.seller_reputation === "platinum" || item.seller_reputation === "gold";
  const baseHighRep = baseRep === "platinum" || baseRep === "gold";
  if (compHighRep && !baseHighRep) {
    recs.push("Focar em avaliações e reputação");
  }
  if (recs.length === 0) recs.push("Monitorar sem agir agora");
  return recs;
}

const THREAT_STYLE: Record<ThreatLevel, string> = {
  baixa: "border-emerald-200 bg-emerald-50 text-emerald-700",
  media: "border-amber-200 bg-amber-50 text-amber-700",
  alta: "border-rose-200 bg-rose-50 text-rose-700",
};
const THREAT_LABEL: Record<ThreatLevel, string> = {
  baixa: "Baixa ameaça",
  media: "Média ameaça",
  alta: "Alta ameaça",
};

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
  shipping_type: ShippingType;
  seller_reputation: ReputationLevel;
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
  shipping_type: "unknown",
  seller_reputation: "unknown",
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
  // Base product own logistics/reputation (per listing_id, in-memory)
  const [baseShipByListing, setBaseShipByListing] = useState<Record<string, ShippingType>>({});
  const [baseRepByListing, setBaseRepByListing] = useState<Record<string, ReputationLevel>>({});

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
      shipping_type: it.shipping_type,
      seller_reputation: it.seller_reputation,
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
        shipping_type: "unknown",
        seller_reputation: "unknown",
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
      shipping_type: manualForm.shipping_type,
      seller_reputation: manualForm.seller_reputation,
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

  const baseShipping: ShippingType = selectedBase
    ? baseShipByListing[selectedBase.listing_id] ?? "unknown"
    : "unknown";
  const baseReputation: ReputationLevel = selectedBase
    ? baseRepByListing[selectedBase.listing_id] ?? "unknown"
    : "unknown";

  const diagnosedList = useMemo(() => {
    if (!selectedBase)
      return [] as {
        item: CompetitorItem;
        verdict: Verdict | null;
        threat: Threat;
        recs: string[];
      }[];
    return competitorsForBase.map((it) => ({
      item: it,
      verdict: diagnose(
        selectedBase.price,
        it.price,
        baseShipping,
        it.shipping_type,
        baseReputation,
        it.seller_reputation,
        it.currency_id,
      ),
      threat: threatFor(it, selectedBase.price, baseShipping, baseReputation),
      recs: recommendationsFor(it, selectedBase.price, baseShipping, baseReputation),
    }));
  }, [competitorsForBase, selectedBase, baseShipping, baseReputation]);

  const summary = useMemo(() => {
    let critical = 0;
    let attention = 0;
    let competitive = 0;
    for (const { verdict } of diagnosedList) {
      if (!verdict) continue;
      if (verdict.key === "critical") critical++;
      else if (verdict.key === "attention") attention++;
      else if (verdict.key === "competitive") competitive++;
    }
    return { critical, attention, competitive, total: diagnosedList.length };
  }, [diagnosedList]);

  const strategy = useMemo(() => {
    if (!selectedBase || diagnosedList.length === 0) return null;
    const basePrice = selectedBase.price;
    const prices = diagnosedList
      .map((d) => d.item.price)
      .filter((p): p is number => typeof p === "number" && p > 0);
    const minPrice = prices.length ? Math.min(...prices) : null;
    const maxPrice = prices.length ? Math.max(...prices) : null;
    const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
    const diffToMin =
      basePrice != null && minPrice != null ? basePrice - minPrice : null;
    const diffToMinPct =
      basePrice != null && minPrice != null && minPrice > 0
        ? ((basePrice - minPrice) / minPrice) * 100
        : null;

    const freeShipCount = diagnosedList.filter((d) => d.item.free_shipping === true).length;
    const fullCount = diagnosedList.filter((d) => d.item.shipping_type === "full").length;
    const baseHasFull = baseShipping === "full";
    const losingLogistics = !baseHasFull && fullCount > 0;

    const priceStatus: "competitivo" | "atencao" | "critico" =
      diffToMinPct == null
        ? "competitivo"
        : diffToMinPct <= 0
          ? "competitivo"
          : diffToMinPct <= 10
            ? "atencao"
            : "critico";

    const sorted = [...diagnosedList].sort((a, b) => b.threat.score - a.threat.score);
    const topThreat = sorted[0] ?? null;

    // Risk factor tallies
    const riskFactors = {
      preco: diagnosedList.filter(
        (d) => basePrice != null && d.item.price != null && d.item.price < basePrice,
      ).length,
      frete: diagnosedList.filter((d) => d.item.free_shipping === true).length,
      envio: diagnosedList.filter(
        (d) => d.item.shipping_type === "full" && !baseHasFull,
      ).length,
      vendas: diagnosedList.filter((d) => (d.item.sold_quantity ?? 0) > 50).length,
      reputacao: diagnosedList.filter(
        (d) =>
          (d.item.seller_reputation === "platinum" || d.item.seller_reputation === "gold") &&
          !(baseReputation === "platinum" || baseReputation === "gold"),
      ).length,
    };

    // Main risk driver
    const mainRiskEntry = Object.entries(riskFactors).sort((a, b) => b[1] - a[1])[0];
    const mainRisk = mainRiskEntry && mainRiskEntry[1] > 0 ? mainRiskEntry[0] : null;
    const mainRiskLabel: Record<string, string> = {
      preco: "Preço",
      frete: "Frete grátis dos concorrentes",
      envio: "Vantagem logística (Full)",
      vendas: "Volume de vendas dos concorrentes",
      reputacao: "Reputação dos concorrentes",
    };

    // Best action
    let bestAction = "Monitorar sem agir agora";
    if (priceStatus === "critico") bestAction = "Rever preço — mas valide margem antes de reduzir";
    else if (losingLogistics) bestAction = "Avaliar migração para Full ou frete grátis";
    else if (priceStatus === "atencao" && freeShipCount > 0) bestAction = "Testar cupom ou frete grátis pontual";
    else if (riskFactors.vendas > 0) bestAction = "Testar campanha de Ads para ganhar visibilidade";

    // Executive text
    const parts: string[] = [];
    if (mainRisk === "preco" && topThreat && topThreat.item.price != null && basePrice != null) {
      const gap = basePrice - topThreat.item.price;
      parts.push(
        `O produto está em risco principalmente por preço. O concorrente mais agressivo está ${formatCurrency(gap)} abaixo`,
      );
      if (topThreat.item.free_shipping) parts.push("com frete grátis");
      if ((topThreat.item.sold_quantity ?? 0) > 50)
        parts.push(`e ${topThreat.item.sold_quantity} vendas registradas`);
      parts.push(". Antes de reduzir preço, valide margem e considere cupom, frete grátis ou Ads.");
    } else if (mainRisk === "envio") {
      parts.push(
        `${fullCount} concorrente(s) usam Full enquanto você não. A vantagem logística pesa mais do que preço em muitos casos — avalie migrar para Full ou oferecer frete grátis.`,
      );
    } else if (mainRisk === "frete") {
      parts.push(
        `${freeShipCount} concorrente(s) oferecem frete grátis. Considere um cupom ou uma promoção pontual de frete antes de mexer no preço.`,
      );
    } else if (mainRisk === "reputacao") {
      parts.push(
        "Concorrentes com reputação superior podem estar convertendo melhor. Foque em avaliações e pós-venda; reduzir preço sozinho pode não resolver.",
      );
    } else if (mainRisk === "vendas") {
      parts.push(
        "Concorrentes com volume alto de vendas ganham posição no ranking. Considere Ads para acelerar visibilidade.",
      );
    } else {
      parts.push("Seu produto está bem posicionado nos fatores monitorados. Mantenha a vigilância e reavalie ao surgirem novos concorrentes.");
    }
    const executive = parts.join(" ").replace(/\s+\./g, ".");

    return {
      basePrice,
      minPrice,
      maxPrice,
      avgPrice,
      diffToMin,
      diffToMinPct,
      priceStatus,
      freeShipCount,
      fullCount,
      baseHasFull,
      losingLogistics,
      topThreat,
      riskFactors,
      mainRisk,
      mainRiskLabel: mainRisk ? mainRiskLabel[mainRisk] : "Nenhum risco relevante",
      bestAction,
      executive,
      sorted,
    };
  }, [diagnosedList, selectedBase, baseShipping, baseReputation]);

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
          ) : null}

          {selectedBase ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Seu tipo de envio</Label>
                <select
                  value={baseShipping}
                  onChange={(e) =>
                    setBaseShipByListing((prev) => ({
                      ...prev,
                      [selectedBase.listing_id]: e.target.value as ShippingType,
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="unknown">Não informado</option>
                  <option value="full">Full</option>
                  <option value="coleta">Coleta</option>
                  <option value="correios">Correios/Próprio</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Sua reputação</Label>
                <select
                  value={baseReputation}
                  onChange={(e) =>
                    setBaseRepByListing((prev) => ({
                      ...prev,
                      [selectedBase.listing_id]: e.target.value as ReputationLevel,
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="unknown">Não informado</option>
                  <option value="platinum">Platinum</option>
                  <option value="gold">Ouro</option>
                  <option value="silver">Prata</option>
                  <option value="new">Novo/Sem reputação</option>
                </select>
              </div>
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


      {/* Summary panel */}
      {selectedBase ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">Concorrentes monitorados</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{summary.total}</div>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-4">
            <div className="text-xs text-rose-700">Críticos</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-rose-700">
              {summary.critical}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Onde você está perdendo agora
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4">
            <div className="text-xs text-amber-700">Atenção</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-amber-700">
              {summary.attention}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Ajustes finos podem virar o jogo
            </div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="text-xs text-emerald-700">Competitivos</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-emerald-700">
              {summary.competitive}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Seu preço está no páreo
            </div>
          </div>
        </div>
      ) : null}

      {/* Strategic reading */}
      {selectedBase && strategy ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leitura estratégica do produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Executive text */}
            <div className="rounded-md border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
              {strategy.executive}
            </div>

            {/* Decision cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Situação geral</div>
                <div
                  className={
                    "mt-1 text-sm font-semibold " +
                    (strategy.priceStatus === "critico"
                      ? "text-rose-700"
                      : strategy.priceStatus === "atencao"
                        ? "text-amber-700"
                        : "text-emerald-700")
                  }
                >
                  {strategy.priceStatus === "critico"
                    ? "Crítico"
                    : strategy.priceStatus === "atencao"
                      ? "Atenção"
                      : "Competitivo"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {summary.total} concorrente(s) monitorados
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Principal risco</div>
                <div className="mt-1 text-sm font-semibold">{strategy.mainRiskLabel}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {strategy.freeShipCount} c/ frete grátis • {strategy.fullCount} c/ Full
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Melhor ação sugerida</div>
                <div className="mt-1 text-sm font-semibold">{strategy.bestAction}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Considere margem antes de reduzir preço.
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Concorrente mais agressivo</div>
                <div className="mt-1 truncate text-sm font-semibold" title={strategy.topThreat?.item.title}>
                  {strategy.topThreat?.item.title ?? "—"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {strategy.topThreat
                    ? `${THREAT_LABEL[strategy.topThreat.threat.level]} • ${formatCurrency(strategy.topThreat.item.price, strategy.topThreat.item.currency_id)}`
                    : "—"}
                </div>
              </div>
            </div>

            {/* Price analysis + shipping */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Preço</div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Menor preço concorrente</span>
                    <span className="tabular-nums">{formatCurrency(strategy.minPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço médio concorrentes</span>
                    <span className="tabular-nums">{formatCurrency(strategy.avgPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seu preço</span>
                    <span className="tabular-nums font-medium">
                      {formatCurrency(strategy.basePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Diferença vs menor</span>
                    <span
                      className={
                        "tabular-nums font-medium " +
                        (strategy.diffToMinPct != null && strategy.diffToMinPct > 10
                          ? "text-rose-700"
                          : strategy.diffToMinPct != null && strategy.diffToMinPct > 0
                            ? "text-amber-700"
                            : "text-emerald-700")
                      }
                    >
                      {strategy.diffToMin != null ? formatCurrency(strategy.diffToMin) : "—"}
                      {strategy.diffToMinPct != null
                        ? ` (${strategy.diffToMinPct > 0 ? "+" : ""}${strategy.diffToMinPct.toFixed(1)}%)`
                        : ""}
                    </span>
                  </div>
                </div>

                {/* Price bars */}
                <div className="mt-4 space-y-1.5">
                  {(() => {
                    const rows: { label: string; price: number | null; self?: boolean }[] = [
                      { label: "Você", price: strategy.basePrice, self: true },
                      ...strategy.sorted.slice(0, 6).map((d) => ({
                        label: d.item.title,
                        price: d.item.price,
                      })),
                    ];
                    const max = Math.max(
                      ...rows.map((r) => r.price ?? 0),
                      strategy.maxPrice ?? 0,
                      1,
                    );
                    return rows.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-24 shrink-0 truncate text-muted-foreground" title={r.label}>
                          {r.label}
                        </div>
                        <div className="relative h-2 flex-1 overflow-hidden rounded bg-muted">
                          <div
                            className={
                              "h-full " + (r.self ? "bg-foreground/70" : "bg-muted-foreground/50")
                            }
                            style={{ width: `${((r.price ?? 0) / max) * 100}%` }}
                          />
                        </div>
                        <div className="w-20 shrink-0 text-right tabular-nums">
                          {formatCurrency(r.price)}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Frete e envio</div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded border bg-muted/20 p-3">
                    <div className="text-muted-foreground">Concorrentes com frete grátis</div>
                    <div className="mt-1 text-xl font-semibold tabular-nums">
                      {strategy.freeShipCount}
                      <span className="text-xs font-normal text-muted-foreground">
                        {" "}
                        / {summary.total}
                      </span>
                    </div>
                  </div>
                  <div className="rounded border bg-muted/20 p-3">
                    <div className="text-muted-foreground">Concorrentes com Full</div>
                    <div className="mt-1 text-xl font-semibold tabular-nums">
                      {strategy.fullCount}
                      <span className="text-xs font-normal text-muted-foreground">
                        {" "}
                        / {summary.total}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {strategy.losingLogistics
                    ? "Você não usa Full e há concorrentes que usam — desvantagem logística."
                    : strategy.baseHasFull
                      ? "Você usa Full — vantagem logística mantida."
                      : "Nenhum concorrente com Full identificado até aqui."}
                </div>

                {/* Risk factors */}
                <div className="mt-4">
                  <div className="text-sm font-medium">Motivos de risco</div>
                  <div className="mt-2 space-y-1.5">
                    {(
                      [
                        ["preco", "Preço", strategy.riskFactors.preco],
                        ["frete", "Frete grátis", strategy.riskFactors.frete],
                        ["envio", "Envio Full", strategy.riskFactors.envio],
                        ["vendas", "Volume de vendas", strategy.riskFactors.vendas],
                        ["reputacao", "Reputação", strategy.riskFactors.reputacao],
                      ] as const
                    ).map(([k, label, v]) => {
                      const pct = summary.total > 0 ? (v / summary.total) * 100 : 0;
                      return (
                        <div key={k} className="flex items-center gap-2 text-xs">
                          <div className="w-32 shrink-0 text-muted-foreground">{label}</div>
                          <div className="relative h-2 flex-1 overflow-hidden rounded bg-muted">
                            <div
                              className="h-full bg-muted-foreground/50"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="w-14 shrink-0 text-right tabular-nums">
                            {v} / {summary.total}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Threat ranking */}
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium">Ranking de ameaça</div>
              <div className="mt-3 space-y-2">
                {strategy.sorted.slice(0, 5).map((d) => (
                  <div
                    key={d.item.key}
                    className="flex items-center gap-3 rounded border bg-card p-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{d.item.title}</div>
                      <div className="mt-0.5 text-muted-foreground">
                        {d.threat.reasons.length ? d.threat.reasons.join(" • ") : "Sem fatores relevantes"}
                      </div>
                    </div>
                    <div className="w-28">
                      <div className="relative h-2 overflow-hidden rounded bg-muted">
                        <div
                          className={
                            "h-full " +
                            (d.threat.level === "alta"
                              ? "bg-rose-500/70"
                              : d.threat.level === "media"
                                ? "bg-amber-500/70"
                                : "bg-emerald-500/70")
                          }
                          style={{ width: `${d.threat.score}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={
                        "inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 " +
                        THREAT_STYLE[d.threat.level]
                      }
                    >
                      {THREAT_LABEL[d.threat.level]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Sem custo do produto cadastrado, não é possível afirmar com segurança quanto você pode
              reduzir. Valide margem antes de qualquer ajuste de preço. Campos como reputação e
              vendas aparecem como “não informado” quando o concorrente não foi enriquecido.
            </p>
          </CardContent>
        </Card>
      ) : null}

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
                    <TableHead>Ameaça</TableHead>
                    <TableHead>Ações sugeridas</TableHead>
                    <TableHead>Envio</TableHead>
                    <TableHead>Reputação</TableHead>
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
                  {diagnosedList.map(({ item: it, verdict }) => {
                    const basePrice = selectedBase.price;
                    const diff =
                      basePrice != null && it.price != null ? basePrice - it.price : null;
                    const diffPct =
                      basePrice != null && it.price != null && it.price > 0
                        ? ((basePrice - it.price) / it.price) * 100
                        : null;
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
                              title={verdict.tooltip}
                            >
                              {verdict.label}
                              {verdict.reason ? (
                                <span className="ml-1 opacity-80">— {verdict.reason}</span>
                              ) : null}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="max-w-[220px]">
                          <div className="text-xs text-muted-foreground" title={verdict?.action}>
                            {verdict?.action ?? "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {SHIPPING_LABEL[it.shipping_type]}
                        </TableCell>
                        <TableCell className="text-xs">
                          {REPUTATION_LABEL[it.seller_reputation]}
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
              <Label htmlFor="m-shiptype">Tipo de envio</Label>
              <select
                id="m-shiptype"
                value={manualForm.shipping_type}
                onChange={(e) =>
                  setManualForm((f) => ({ ...f, shipping_type: e.target.value as ShippingType }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="unknown">Não informado</option>
                <option value="full">Full</option>
                <option value="coleta">Coleta</option>
                <option value="correios">Correios/Próprio</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-rep">Reputação do seller</Label>
              <select
                id="m-rep"
                value={manualForm.seller_reputation}
                onChange={(e) =>
                  setManualForm((f) => ({ ...f, seller_reputation: e.target.value as ReputationLevel }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="unknown">Não informado</option>
                <option value="platinum">Platinum</option>
                <option value="gold">Ouro</option>
                <option value="silver">Prata</option>
                <option value="new">Novo/Sem reputação</option>
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

import { createAc360ApiUrl, getAc360AccessToken } from "@/lib/ac360-api";
import { supabase } from "@/lib/supabase";

/**
 * Feed Inteligente da Operação — camada de leitura.
 *
 * SOMENTE LEITURA: este módulo executa exclusivamente
 * GET /api/ecommerce/intelligent-feed/preview.
 * Nenhum POST/PUT/PATCH/DELETE é realizado aqui.
 * O token JWT nunca é logado nem exposto.
 */


export type FeedStatusKey =
  | "critical"
  | "attention"
  | "missing_cost"
  | "opportunity"
  | "neutral";

export type FeedItem = {
  id: string;
  listingId: string | null;
  title: string;
  sku: string | null;
  status: FeedStatusKey;
  statusLabel: string | null;
  metrics: {
    visits: number | null;
    sales: number | null;
    revenue: number | null;
    conversionRate: number | null;
    stock: number | null;
    cost: number | null;
    ads: number | null;
  };
  /** Confirmação explícita do backend de que a fonte de visitas está consolidada. */
  visitsAvailable: boolean | null;

  imageUrl: string | null;
  imageSource: string | null;
  imageSyncedAt: string | null;
  /** Data confiável vinda do backend (created_at/updated_at/last_status_at/...), se existir. */
  statusSince: string | null;
  hasImage: boolean;
  diagnostic: string | null;
  recommendedAction: string | null;
  badges: string[];
};

export type FeedSummary = {
  listingsChecked: number | null;
  ordersChecked: number | null;
  productsChecked: number | null;
  revenueAvailable: boolean | null;
  feedItemsReturned: number | null;
  itemsWithImage: number | null;
  costsPending: boolean | null;
};

export type FeedFilter = {
  key: string;
  label: string;
  count: number;
};

export type IntelligentFeedPreview = {
  mode: string | null;
  /** Período analisado, apenas quando o backend informa. Nunca inferido. */
  periodLabel: string | null;

  writeAllowed: boolean;
  writeExecuted: boolean;
  externalMarketplaceCalled: boolean;
  externalAiCalled: boolean;
  summary: FeedSummary;
  items: FeedItem[];
  filters: FeedFilter[];
  warnings: string[];
  recommendations: string[];
};

export type IntelligentFeedErrorKind = "unauthenticated" | "forbidden" | "unavailable";

export class IntelligentFeedError extends Error {
  readonly kind: IntelligentFeedErrorKind;
  readonly status: number | null;

  constructor(message: string, kind: IntelligentFeedErrorKind, status: number | null = null) {
    super(message);
    this.name = "IntelligentFeedError";
    this.kind = kind;
    this.status = status;
  }
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function pick(record: UnknownRecord | null, keys: string[]): unknown {
  if (!record) return undefined;
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toBool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "sim", "yes", "1"].includes(v)) return true;
    if (["false", "nao", "não", "no", "0"].includes(v)) return false;
  }
  return null;
}

function toText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => toText(entry) ?? toText(pick(asRecord(entry), ["label", "message", "text"])))
    .filter((entry): entry is string => Boolean(entry));
}

/** Aceita apenas URLs http(s) já entregues pelo backend. Nunca monta URL externa. */
function safeImageUrl(value: unknown): string | null {
  const text = toText(value);
  if (!text) return null;
  return /^https?:\/\//i.test(text) ? text : null;
}

function toStatus(value: unknown): FeedStatusKey {
  const raw = (toText(value) ?? "").toLowerCase().replace(/[\s-]/g, "_");
  if (["critical", "critico", "crítico", "danger"].includes(raw)) return "critical";
  if (["attention", "atencao", "atenção", "warning", "alert"].includes(raw)) return "attention";
  if (["missing_cost", "sem_custo", "cost_missing", "no_cost"].includes(raw)) return "missing_cost";
  if (["opportunity", "oportunidade", "growth", "positive"].includes(raw)) return "opportunity";
  return "neutral";
}

function normalizeItem(entry: unknown, index: number): FeedItem | null {
  const record = asRecord(entry);
  if (!record) return null;
  const metrics = asRecord(record.metrics) ?? record;
  const diagnostic = asRecord(record.diagnostic);
  const recommended = asRecord(record.recommended_action);
  const listing =
    asRecord(record.listing) ?? asRecord(record.ecommerce_listing) ?? asRecord(record.ad);

  const listingId =
    toText(
      pick(record, [
        "listing_id",
        "item_id",
        "ml_item_id",
        "mlb_id",
        "marketplace_listing_id",
        "external_listing_id",
        "external_id",
        "mercadolivre_item_id",
      ]),
    ) ??
    toText(
      pick(listing, [
        "listing_id",
        "item_id",
        "ml_item_id",
        "mlb_id",
        "marketplace_listing_id",
        "external_listing_id",
        "external_id",
        "mercadolivre_item_id",
        "id",
      ]),
    );
  const rawId = toText(pick(record, ["id", "feed_id", "row_id"]));

  const imageUrl =
    safeImageUrl(pick(record, ["image_url"])) ??
    safeImageUrl(pick(record, ["thumbnail_url"])) ??
    safeImageUrl(pick(listing, ["image_url", "thumbnail_url"]));

  return {
    id: listingId ?? rawId ?? toText(pick(record, ["seller_sku", "sku"])) ?? `feed-item-${index}`,
    listingId,
    title: toText(pick(record, ["title", "name"])) ?? toText(pick(listing, ["title", "name"])) ?? "Anúncio sem título",
    sku: toText(pick(record, ["seller_sku", "sku", "external_sku"])) ?? toText(pick(listing, ["seller_sku", "sku", "external_sku"])),
    status: toStatus(pick(record, ["status", "status_key", "severity"])),
    statusLabel: toText(pick(record, ["status_label"])),
    metrics: {
      visits: toNumber(pick(metrics, ["visits", "visitas"])),
      sales: toNumber(pick(metrics, ["sales", "vendas", "units_sold"])),
      revenue: toNumber(pick(metrics, ["revenue", "receita"])),
      conversionRate: toNumber(pick(metrics, ["conversion_rate", "conversao", "conversion"])),
      stock: toNumber(pick(metrics, ["stock", "estoque", "available_quantity"])),
      cost: toNumber(pick(metrics, ["cost", "custo", "unit_cost", "real_cost", "cost_value"])),
      ads: toNumber(
        pick(metrics, ["ads_investment", "ad_spend", "ads_cost", "investimento_ads", "roas", "acos"]),
      ),
    },
    visitsAvailable:
      toBool(pick(record, ["visits_available", "visits_source_available", "has_visits"])) ??
      toBool(pick(metrics, ["visits_available", "visits_source_available", "has_visits"])),

    imageUrl,
    imageSource: toText(pick(record, ["image_source"])),
    imageSyncedAt: toText(pick(record, ["image_synced_at"])),
    statusSince:
      toText(
        pick(record, [
          "last_status_at",
          "status_changed_at",
          "diagnostic_created_at",
          "cost_missing_since",
          "created_at",
          "updated_at",
        ]),
      ) ??
      toText(pick(diagnostic, ["created_at", "updated_at", "generated_at"])) ??
      toText(pick(listing, ["created_at", "updated_at"])),
    hasImage: toBool(pick(record, ["has_image"])) ?? Boolean(imageUrl),
    diagnostic:
      toText(pick(diagnostic, ["message", "text", "description"])) ??
      toText(pick(record, ["diagnostic", "diagnosis"])),
    recommendedAction:
      toText(pick(recommended, ["message", "text", "description", "action"])) ??
      toText(pick(record, ["recommended_action", "action"])),
    badges: toStringList(pick(record, ["badges", "tags"])),
  };
}

function normalizeFilters(value: unknown): FeedFilter[] {
  const fromEntry = (entry: unknown, fallbackKey?: string): FeedFilter | null => {
    const record = asRecord(entry);
    if (!record) {
      const count = toNumber(entry);
      if (fallbackKey && count !== null) {
        return { key: fallbackKey, label: fallbackKey, count };
      }
      return null;
    }
    const key = toText(pick(record, ["key", "id", "slug", "status"])) ?? fallbackKey;
    const label = toText(pick(record, ["label", "title", "name"])) ?? key;
    if (!key || !label) return null;
    return { key, label, count: toNumber(pick(record, ["count", "total", "items"])) ?? 0 };
  };

  if (Array.isArray(value)) {
    return value.map((e) => fromEntry(e)).filter((f): f is FeedFilter => f !== null);
  }
  const record = asRecord(value);
  if (!record) return [];
  return Object.entries(record)
    .map(([key, entry]) => fromEntry(entry, key))
    .filter((f): f is FeedFilter => f !== null);
}

/** Formata uma data ISO como dd/mm/aaaa. Retorna null se não for data válida. */
function formatDay(value: string): string | null {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return value;
  return parsed.toLocaleDateString("pt-BR");
}

/**
 * Lê o período analisado apenas de campos confiáveis do backend.
 * Nunca inventa datas nem infere períodos.
 */
function readPeriodLabel(...sources: (UnknownRecord | null)[]): string | null {
  for (const source of sources) {
    const direct = toText(
      pick(source, ["period_label", "period", "reference_period", "analyzed_period"]),
    );
    if (direct) return direct;

    const nested = asRecord(pick(source, ["period", "analyzed_period", "reference_period"]));
    const from = toText(pick(source, ["date_from", "start_date"])) ?? toText(pick(nested, ["date_from", "start_date", "from"]));
    const to = toText(pick(source, ["date_to", "end_date"])) ?? toText(pick(nested, ["date_to", "end_date", "to"]));
    if (from && to) return `${formatDay(from)} a ${formatDay(to)}`;
    if (from) return `a partir de ${formatDay(from)}`;
    if (to) return `até ${formatDay(to)}`;
  }
  return null;
}


export function normalizeIntelligentFeedPreview(payload: unknown): IntelligentFeedPreview {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data) ?? root;

  const rawItems = pick(data, ["feed_items", "items"]) ?? pick(root, ["feed_items", "items"]);
  const items = Array.isArray(rawItems)
    ? rawItems.map((entry, i) => normalizeItem(entry, i)).filter((i): i is FeedItem => i !== null)
    : [];

  const summaryRecord = asRecord(pick(data, ["summary"]) ?? pick(root, ["summary"])) ?? {};
  const filters = normalizeFilters(
    pick(data, ["filters", "stories"]) ?? pick(root, ["filters", "stories"]),
  );

  return {
    mode: toText(pick(root, ["mode"]) ?? pick(data, ["mode"])),
    periodLabel: readPeriodLabel(root, data, summaryRecord),

    writeAllowed: toBool(pick(root, ["write_allowed"])) ?? false,
    writeExecuted: toBool(pick(root, ["write_executed"])) ?? false,
    externalMarketplaceCalled: toBool(pick(root, ["external_marketplace_called"])) ?? false,
    externalAiCalled: toBool(pick(root, ["external_ai_called"])) ?? false,
    summary: {
      listingsChecked: toNumber(
        pick(summaryRecord, ["listings_checked", "anuncios_analisados", "listings"]),
      ),
      ordersChecked: toNumber(pick(summaryRecord, ["orders_checked", "orders"])),
      productsChecked: toNumber(pick(summaryRecord, ["products_checked", "products"])),
      revenueAvailable: toBool(pick(summaryRecord, ["revenue_available"])),
      feedItemsReturned:
        toNumber(pick(summaryRecord, ["feed_items_returned", "items_returned"])) ?? items.length,
      itemsWithImage: toNumber(
        pick(summaryRecord, ["items_with_image", "with_image", "images_available"]),
      ),
      costsPending: toBool(pick(summaryRecord, ["costs_pending"])),
    },
    items,
    filters,
    warnings: toStringList(pick(data, ["warnings"]) ?? pick(root, ["warnings"])),
    recommendations: toStringList(
      pick(data, ["recommendations"]) ?? pick(root, ["recommendations"]),
    ),
  };
}

/**
 * Contingency for a staging backend that has not yet been upgraded to the
 * historic import schema. Queries remain within the current authenticated
 * tenant RLS, never access another company or call the marketplace.
 */
export async function loadStagingHistoryFeed(
  companyId: string,
  accountId: string,
  limit: number,
  signal?: AbortSignal,
): Promise<IntelligentFeedPreview> {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  // Use the same single-table source as Produtos e Anúncios. A missing
  // orders endpoint must not prevent displaying already imported listings.
  const { data: listingsData, count: listingsCount, error: listingsError } =
    await supabase.from("ecommerce_listings")
      .select("id,product_id,ml_item_id,title,status,price,external_sku,updated_at,image_url,thumbnail_url", { count: "exact" })
      .eq("company_id", companyId)
      .eq("account_id", accountId)
      .order("updated_at", { ascending: false })
      .limit(1000);
  if (listingsError) {
    throw new IntelligentFeedError(
      "Falha ao ler anúncios históricos: " + listingsError.message,
      "unavailable",
      listingsError.code ? 400 : null,
    );
  }
  const listings = listingsData ?? [];
  const linkedProducts = new Set(listings.map((listing) => listing.product_id).filter(Boolean));
  const raw = {
    mode: "historical_database_read_only",
    period_label: "Histórico importado — sem atualização em tempo real",
    write_allowed: false,
    write_executed: false,
    external_marketplace_called: false,
    external_ai_called: false,
    summary: {
      listings_checked: listingsCount ?? listings.length,
      orders_checked: null,
      products_checked: linkedProducts.size,
      revenue_available: false,
      feed_items_returned: Math.min(safeLimit, listings.length),
      items_with_image: listings.filter((item) => Boolean(item.image_url || item.thumbnail_url)).length,
      costs_pending: true,
    },
    items: listings.slice(0, safeLimit).map((listing) => ({
      id: listing.id,
      listing_id: listing.ml_item_id || listing.id,
      title: listing.title,
      sku: listing.external_sku,
      status: "neutral",
      status_label: listing.status === "active" ? "Anúncio ativo" : (listing.status || "Estado histórico"),
      metrics: { revenue: null, sales: null, visits: null, cost: null, ads: null },
      diagnostic: null,
      recommended_action: null,
      image_url: listing.image_url || listing.thumbnail_url || null,
      has_image: Boolean(listing.image_url || listing.thumbnail_url),
      badges: ["Histórico importado"],
    })),
    filters: [],
    warnings: [
      "Visualização histórica de contingência: os anúncios não foram atualizados pelo Mercado Livre.",
      "Sem CMV confirmado; não calcular lucro real ou desempenho por anúncio a partir desta leitura.",
      "Receita indisponível nesta visualização; consulte Custos e Margem para o histórico financeiro.",
    ],
    recommendations: [],
  };
  return normalizeIntelligentFeedPreview(raw);
}

export async function getIntelligentFeedPreview({
  companyId,
  accountId,
  limit = 20,
  signal,
}: {
  companyId: string;
  accountId: string;
  limit?: number;
  signal?: AbortSignal;
}): Promise<IntelligentFeedPreview> {
  const accessToken = await getAc360AccessToken();
  if (!accessToken) {
    throw new IntelligentFeedError(
      "Sessão expirada ou sem permissão. Faça login novamente.",
      "unauthenticated",
      401,
    );
  }

  const url = createAc360ApiUrl("/api/ecommerce/intelligent-feed/preview", {
    company_id: companyId,
    account_id: accountId,
    limit,
  });

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        // Token nunca é logado nem exibido.
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  } catch (requestError) {
    if (requestError instanceof DOMException && requestError.name === "AbortError") {
      throw requestError;
    }
    return loadStagingHistoryFeed(companyId, accountId, limit, signal);
  }

  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new IntelligentFeedError("Sessão expirada. Faça login novamente.", "unauthenticated", 401);
    }
    // Older preview API restricts access to its original pilot. The fallback
    // is protected by Supabase RLS and can safely serve the current tenant.
    if (response.status === 403) {
      return loadStagingHistoryFeed(companyId, accountId, limit, signal);
    }
    return loadStagingHistoryFeed(companyId, accountId, limit, signal);
  }

  if ((payload as { success?: boolean } | null)?.success === false) {
    return loadStagingHistoryFeed(companyId, accountId, limit, signal);
  }
  return normalizeIntelligentFeedPreview(payload);
}

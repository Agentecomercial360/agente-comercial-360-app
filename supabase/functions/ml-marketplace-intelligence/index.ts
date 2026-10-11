import { createClient } from "npm:@supabase/supabase-js@2.106.1";
import { PDFDocument } from "npm:pdf-lib@1.17.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const LEGACY_ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const LEGACY_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function pickNamed(raw: string | undefined, name = "default"): string {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed?.[name] === "string" ? parsed[name] : "";
  } catch {
    return "";
  }
}

const PUBLISHABLE_KEY =
  pickNamed(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")) || LEGACY_ANON;
const SECRET_KEY =
  pickNamed(Deno.env.get("SUPABASE_SECRET_KEYS")) || LEGACY_SERVICE;

const RAILWAY_SYNC =
  "https://ac360-mercadolivre-api-production.up.railway.app/api/mercadolivre/sync-account-smart";
const ML_BASE = "https://api.mercadolibre.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Body = {
  action?:
    | "ads_sync"
    | "competition_sync"
    | "market_radar_sync"
    | "shipment_labels";
  company_id?: string;
  account_id?: string;
  days?: number;
  listing_id?: string;
  category_ids?: string[];
  groups?: Array<{
    sku?: string;
    shipment_ids: string[];
  }>;
};

type Listing = {
  id: string;
  product_id: string | null;
  ml_item_id: string;
  title: string | null;
  marketplace_category: string | null;
};

function reply(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function num(v: unknown): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function range(days: number) {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - Math.max(0, days - 1));
  return { date_from: ymd(start), date_to: ymd(end) };
}

function normalize(v: string | null | undefined): string {
  return (v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function mlJson(
  path: string,
  token: string,
  apiVersion?: string,
): Promise<any> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
  if (apiVersion) headers["api-version"] = apiVersion;

  const res = await fetch(`${ML_BASE}${path}`, { headers });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message =
      data?.message || data?.error || data?.cause?.[0]?.message || `Mercado Livre HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

async function mlBinary(path: string, token: string): Promise<Uint8Array> {
  const res = await fetch(`${ML_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/pdf",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Mercado Livre HTTP ${res.status}`;
    try {
      const data = JSON.parse(text);
      message = data?.message || data?.error || message;
    } catch {
      // Keep status only.
    }
    throw new Error(message);
  }

  return new Uint8Array(await res.arrayBuffer());
}

function adminClient() {
  if (!SUPABASE_URL || !SECRET_KEY) {
    throw new Error("Supabase secret key unavailable in Edge Function.");
  }
  return createClient(SUPABASE_URL, SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function userClient(authHeader: string) {
  if (!SUPABASE_URL || !PUBLISHABLE_KEY) {
    throw new Error("Supabase publishable key unavailable in Edge Function.");
  }
  return createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });
}

async function assertAccess(
  authHeader: string,
  companyId: string,
  accountId: string,
) {
  const client = userClient(authHeader);
  const { data, error } = await client
    .from("ecommerce_accounts")
    .select("id,company_id,account_name,nickname,marketplace,ml_user_id")
    .eq("id", accountId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Conta não encontrada ou sem permissão.");
  if (data.marketplace !== "mercado_livre") {
    throw new Error("Esta operação exige uma conta Mercado Livre.");
  }
  return data;
}

async function getIntegration(companyId: string, accountId: string) {
  const admin = adminClient();
  const { data, error } = await admin
    .from("ecommerce_integrations")
    .select("id,access_token,refresh_token,expires_at,integration_status,sync_ads,updated_at")
    .eq("company_id", companyId)
    .eq("account_id", accountId)
    .eq("marketplace", "mercado_livre")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function ensureToken(
  authHeader: string,
  companyId: string,
  accountId: string,
): Promise<string> {
  let integration = await getIntegration(companyId, accountId);
  if (!integration?.access_token) {
    throw new Error("Integração Mercado Livre sem access token.");
  }

  const expiresAt = integration.expires_at
    ? new Date(integration.expires_at).getTime()
    : 0;
  const stillValid = expiresAt > Date.now() + 2 * 60 * 1000;
  if (stillValid) return integration.access_token;

  const previousToken = integration.access_token;
  const refresh = await fetch(RAILWAY_SYNC, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      company_id: companyId,
      account_id: accountId,
      days: 1,
    }),
  });

  if (!refresh.ok) {
    const text = await refresh.text();
    let detail = `HTTP ${refresh.status}`;
    try {
      const parsed = JSON.parse(text);
      detail = parsed?.message || parsed?.error || detail;
    } catch {
      // keep status only
    }
    throw new Error(`Não foi possível renovar a sessão do Mercado Livre: ${detail}`);
  }

  integration = await getIntegration(companyId, accountId);
  if (!integration?.access_token) {
    throw new Error("Token Mercado Livre não disponível após renovação.");
  }

  const refreshedExpiry = integration.expires_at
    ? new Date(integration.expires_at).getTime()
    : 0;
  const tokenChanged = integration.access_token !== previousToken;
  if (!tokenChanged && refreshedExpiry <= Date.now()) {
    throw new Error("Sessão Mercado Livre expirada. Reconecte a conta.");
  }
  return integration.access_token;
}

async function listingsForAccount(companyId: string, accountId: string) {
  const admin = adminClient();
  const { data, error } = await admin
    .from("ecommerce_listings")
    .select("id,product_id,ml_item_id,title,marketplace_category")
    .eq("company_id", companyId)
    .eq("account_id", accountId)
    .eq("is_active", true)
    .not("ml_item_id", "is", null)
    .limit(5000);
  if (error) throw new Error(error.message);
  return (data ?? []) as Listing[];
}

function siteFromListings(listings: Listing[]): string {
  for (const listing of listings) {
    const id = listing.ml_item_id?.toUpperCase();
    if (/^ML[A-Z]/.test(id)) return id.slice(0, 3);
  }
  return "MLB";
}

async function advertiserForToken(
  token: string,
  preferredSite: string,
  accountLabel: string,
) {
  const data = await mlJson("/advertising/advertisers?product_id=PADS", token, "1");
  const advertisers = Array.isArray(data?.advertisers) ? data.advertisers : [];
  const sameSite = advertisers.filter((a: any) => a?.site_id === preferredSite);
  const pool = sameSite.length ? sameSite : advertisers;
  if (!pool.length) {
    throw new Error("Esta conta não possui Product Ads habilitado.");
  }

  const label = normalize(accountLabel);
  const matched =
    pool.find((a: any) => {
      const hay = normalize(`${a?.advertiser_name ?? ""} ${a?.account_name ?? ""}`);
      return label && (hay.includes(label) || label.includes(hay));
    }) ?? pool[0];

  return {
    advertiser_id: String(matched.advertiser_id),
    site_id: String(matched.site_id || preferredSite),
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const METRICS = [
  "CLICKS",
  "PRINTS",
  "COST",
  "CPC",
  "CTR",
  "DIRECT_AMOUNT",
  "INDIRECT_AMOUNT",
  "TOTAL_AMOUNT",
  "DIRECT_UNITS_QUANTITY",
  "INDIRECT_UNITS_QUANTITY",
  "UNITS_QUANTITY",
  "DIRECT_ITEMS_QUANTITY",
  "INDIRECT_ITEMS_QUANTITY",
  "ADVERTISING_ITEMS_QUANTITY",
  "ORGANIC_UNITS_QUANTITY",
  "ORGANIC_UNITS_AMOUNT",
  "ORGANIC_ITEMS_QUANTITY",
  "ACOS",
  "TACOS",
  "SOV",
  "CVR",
  "ROAS",
  "IMPRESSION_SHARE",
  "TOP_IMPRESSION_SHARE",
  "LOST_IMPRESSION_SHARE_BY_BUDGET",
  "LOST_IMPRESSION_SHARE_BY_AD_RANK",
  "ACOS_BENCHMARK",
].join(",");

async function syncAds(
  token: string,
  companyId: string,
  accountId: string,
  accountLabel: string,
  days: number,
) {
  const admin = adminClient();
  const listings = await listingsForAccount(companyId, accountId);
  if (!listings.length) {
    return { rows: 0, ad_groups: 0, message: "Nenhum anúncio ativo encontrado." };
  }

  const preferredSite = siteFromListings(listings);
  const advertiser = await advertiserForToken(token, preferredSite, accountLabel);
  const itemMap = new Map(listings.map((l) => [l.ml_item_id, l]));
  const groupToListing = new Map<string, Listing>();

  for (const batch of chunk(listings.map((l) => l.ml_item_id), 40)) {
    const params = new URLSearchParams();
    params.set("filters[item_ids]", batch.join(","));
    params.set("limit", "50");
    const data = await mlJson(
      `/advertising/${advertiser.site_id}/advertisers/${advertiser.advertiser_id}/product_ads/ad_groups/search?${params.toString()}`,
      token,
      "2",
    );
    for (const group of data?.results ?? []) {
      const external = String(group?.ad_group_external_id ?? "");
      const listing = itemMap.get(external);
      if (listing) groupToListing.set(String(group.id), listing);
    }
  }

  const { date_from, date_to } = range(days);
  const allGroups: any[] = [];
  let offset = 0;
  let total = 1;

  while (offset < total) {
    const params = new URLSearchParams({
      date_from,
      date_to,
      limit: "800",
      offset: String(offset),
      sort: "desc",
      sort_by: "clicks",
      metrics: METRICS,
      metrics_summary: "false",
    });
    const data = await mlJson(
      `/advertising/${advertiser.site_id}/advertisers/${advertiser.advertiser_id}/product_ads/ad_groups/search?${params.toString()}`,
      token,
      "2",
    );
    const results = Array.isArray(data?.results) ? data.results : [];
    allGroups.push(...results);
    total = num(data?.paging?.total) || results.length;
    const limit = num(data?.paging?.limit) || 800;
    if (!results.length) break;
    offset += limit;
  }

  const rows = allGroups
    .map((group) => {
      const listing = groupToListing.get(String(group.id));
      if (!listing) return null;
      const m = group.metrics ?? {};
      const adsUnits = num(m.units_quantity);
      const organicUnits = num(m.organic_units_quantity);
      const adsRevenue = num(m.total_amount);
      const organicRevenue = num(m.organic_units_amount);
      const investment = num(m.cost);
      const roas = num(m.roas);
      const acos = num(m.acos);
      let status = "normal";
      let suggestion: string | null = null;

      if (investment > 0 && adsUnits === 0) {
        status = "spending_no_sales";
        suggestion = "Publicidade consumindo verba sem vendas atribuídas; revisar antes de ampliar orçamento.";
      } else if (roas >= 5) {
        status = "high_roas";
        suggestion = "ROAS forte; avaliar escala preservando margem e estoque.";
      } else if (acos >= 50) {
        status = "high_acos";
        suggestion = "ACOS elevado; revisar anúncio, preço, conversão e orçamento.";
      }

      return {
        company_id: companyId,
        account_id: accountId,
        product_id: listing.product_id,
        listing_id: listing.id,
        metric_date: date_to,
        period_days: days,
        period_start: date_from,
        period_end: date_to,
        metric_scope: "product_period",
        advertiser_id: advertiser.advertiser_id,
        campaign_id: String(group.campaign_id ?? "0"),
        campaign_name: group.campaign_id ? `Campanha ${group.campaign_id}` : "Sem campanha",
        ad_group_id: String(group.id),
        ad_group_external_id: String(group.ad_group_external_id ?? listing.ml_item_id),
        ad_group_title: group.title ?? listing.title,
        ad_type: "product_ads",
        impressions: Math.round(num(m.prints)),
        clicks: Math.round(num(m.clicks)),
        ads_sales_count: Math.round(
          num(m.advertising_items_quantity) ||
            num(m.direct_items_quantity) + num(m.indirect_items_quantity),
        ),
        ads_units_sold: Math.round(adsUnits),
        investment,
        ads_revenue: adsRevenue,
        total_revenue: adsRevenue + organicRevenue,
        roas,
        acos,
        tacos: num(m.tacos),
        ctr: num(m.ctr),
        cpc: num(m.cpc),
        organic_sales_count: Math.round(num(m.organic_items_quantity)),
        organic_units_sold: Math.round(organicUnits),
        organic_revenue: organicRevenue,
        organic_metrics_synced: true,
        direct_sales_count: Math.round(num(m.direct_items_quantity)),
        indirect_sales_count: Math.round(num(m.indirect_items_quantity)),
        direct_units_sold: Math.round(num(m.direct_units_quantity)),
        indirect_units_sold: Math.round(num(m.indirect_units_quantity)),
        direct_revenue: num(m.direct_amount),
        indirect_revenue: num(m.indirect_amount),
        cvr: num(m.cvr),
        sov: num(m.sov),
        impression_share: num(m.impression_share),
        top_impression_share: num(m.top_impression_share),
        lost_impression_share_by_budget: num(m.lost_impression_share_by_budget),
        lost_impression_share_by_ad_rank: num(m.lost_impression_share_by_ad_rank),
        acos_benchmark: num(m.acos_benchmark),
        status,
        ai_action_suggestion: suggestion,
        source: "mercadolivre",
        snapshot_at: new Date().toISOString(),
      };
    })
    .filter(Boolean);

  if (rows.length) {
    const { error } = await admin
      .from("ecommerce_ads_metrics")
      .upsert(rows, {
        onConflict: "company_id,account_id,ad_group_id,metric_date,period_days",
      });
    if (error) throw new Error(error.message);
  }

  await admin
    .from("ecommerce_integrations")
    .update({ sync_ads: true, last_sync_at: new Date().toISOString() })
    .eq("company_id", companyId)
    .eq("account_id", accountId)
    .eq("marketplace", "mercado_livre");

  return {
    rows: rows.length,
    ad_groups: allGroups.length,
    mapped_ad_groups: groupToListing.size,
    advertiser_id: advertiser.advertiser_id,
    site_id: advertiser.site_id,
    period: { date_from, date_to, days },
  };
}

async function syncCompetition(
  token: string,
  companyId: string,
  accountId: string,
  listingId: string,
) {
  const admin = adminClient();
  const { data: listing, error } = await admin
    .from("ecommerce_listings")
    .select("id,ml_item_id,product_id,title")
    .eq("id", listingId)
    .eq("company_id", companyId)
    .eq("account_id", accountId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!listing?.ml_item_id) throw new Error("Anúncio sem ML item_id.");

  const site = String(listing.ml_item_id).slice(0, 3).toUpperCase();
  const data = await mlJson(
    `/items/${encodeURIComponent(listing.ml_item_id)}/price_to_win?siteId=${encodeURIComponent(site)}&version=v2`,
    token,
  );

  const { data: previous } = await admin
    .from("ecommerce_catalog_competition_history")
    .select("competition_status")
    .eq("company_id", companyId)
    .eq("account_id", accountId)
    .eq("listing_id", listingId)
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const current = String(data?.status ?? "unknown");
  const previousStatus = previous?.competition_status ?? null;
  const changeType =
    previousStatus && previousStatus !== current
      ? `${previousStatus}_to_${current}`
      : "snapshot";

  const { error: insertError } = await admin
    .from("ecommerce_catalog_competition_history")
    .insert({
      company_id: companyId,
      account_id: accountId,
      listing_id: listingId,
      ml_item_id: listing.ml_item_id,
      catalog_product_id: data?.catalog_product_id ?? null,
      competition_status: ["winning", "sharing_first_place", "competing", "listed"].includes(current)
        ? current
        : "unknown",
      previous_status: previousStatus,
      change_type: changeType,
      own_price: data?.current_price ?? null,
      winner_item_id: data?.winner?.item_id ?? null,
      winner_price: data?.winner?.price ?? data?.price_to_win ?? null,
      source: "mercadolivre",
      raw_payload: data ?? {},
      checked_at: new Date().toISOString(),
    });
  if (insertError) throw new Error(insertError.message);

  return {
    listing_id: listingId,
    ml_item_id: listing.ml_item_id,
    status: current,
    previous_status: previousStatus,
    changed: Boolean(previousStatus && previousStatus !== current),
    own_price: data?.current_price ?? null,
    winner_price: data?.winner?.price ?? data?.price_to_win ?? null,
    winner_item_id: data?.winner?.item_id ?? null,
  };
}

function classifyTrend(index: number): "growing" | "desired" | "popular" {
  if (index < 10) return "growing";
  if (index < 30) return "desired";
  return "popular";
}

async function syncRadar(
  token: string,
  companyId: string,
  accountId: string,
  categoryIds?: string[],
) {
  const admin = adminClient();
  const listings = await listingsForAccount(companyId, accountId);
  const site = siteFromListings(listings);
  const categories = Array.from(
    new Set(
      (categoryIds?.length
        ? categoryIds
        : listings.map((l) => l.marketplace_category ?? "")
      ).filter((v) => new RegExp(`^${site}\\d+$`).test(v)),
    ),
  ).slice(0, 8);

  const snapshot = ymd(new Date());
  const rows: any[] = [];

  async function addTrends(categoryId: string | null) {
    const path = categoryId ? `/trends/${site}/${categoryId}` : `/trends/${site}`;
    const data = await mlJson(path, token);
    const list = Array.isArray(data) ? data.slice(0, 50) : [];
    const counters = { growing: 0, desired: 0, popular: 0 };
    list.forEach((item: any, index: number) => {
      const type = classifyTrend(index);
      counters[type] += 1;
      rows.push({
        company_id: companyId,
        account_id: accountId,
        site_id: site,
        category_id: categoryId,
        category_name: categoryId,
        trend_type: type,
        rank: counters[type],
        keyword: item?.keyword ?? null,
        title: item?.keyword ?? null,
        url: item?.url ?? null,
        snapshot_date: snapshot,
        metadata: { source_rank: index + 1 },
      });
    });
  }

  await addTrends(null);
  for (const category of categories) {
    await addTrends(category);
    const best = await mlJson(`/highlights/${site}/category/${category}`, token);
    for (const item of best?.content ?? []) {
      rows.push({
        company_id: companyId,
        account_id: accountId,
        site_id: site,
        category_id: category,
        category_name: category,
        trend_type: "best_seller",
        rank: Math.round(num(item?.position)),
        entity_id: item?.id ?? null,
        entity_type: item?.type ?? null,
        title: item?.id ?? null,
        snapshot_date: snapshot,
        metadata: { criteria: best?.query_data?.criteria ?? "CATEGORY" },
      });
    }
  }

  await admin
    .from("ecommerce_market_trends")
    .delete()
    .eq("company_id", companyId)
    .eq("account_id", accountId)
    .eq("site_id", site)
    .eq("snapshot_date", snapshot);

  if (rows.length) {
    const { error } = await admin.from("ecommerce_market_trends").insert(rows);
    if (error) throw new Error(error.message);
  }

  return {
    rows: rows.length,
    site_id: site,
    categories,
    snapshot_date: snapshot,
    best_sellers: rows.filter((r) => r.trend_type === "best_seller").length,
    growing: rows.filter((r) => r.trend_type === "growing").length,
    desired: rows.filter((r) => r.trend_type === "desired").length,
    popular: rows.filter((r) => r.trend_type === "popular").length,
  };
}

async function generateShipmentLabels(
  token: string,
  groups: NonNullable<Body["groups"]>,
) {
  const normalizedGroups = groups
    .map((group) => ({
      sku: group.sku?.trim() || "SEM-SKU",
      shipment_ids: Array.from(
        new Set(
          (group.shipment_ids ?? [])
            .map((id) => String(id).trim())
            .filter(Boolean),
        ),
      ),
    }))
    .filter((group) => group.shipment_ids.length > 0);

  const shipmentCount = normalizedGroups.reduce(
    (sum, group) => sum + group.shipment_ids.length,
    0,
  );

  if (shipmentCount === 0) {
    throw new Error("Nenhum shipment_id válido foi informado.");
  }
  if (shipmentCount > 250) {
    throw new Error(
      "Selecione até 250 etiquetas por arquivo para manter a geração estável.",
    );
  }

  const output = await PDFDocument.create();
  let batches = 0;

  for (const group of normalizedGroups) {
    for (const ids of chunk(group.shipment_ids, 50)) {
      const params = new URLSearchParams({
        shipment_ids: ids.join(","),
        response_type: "pdf",
      });

      const bytes = await mlBinary(
        `/shipment_labels?${params.toString()}`,
        token,
      );
      const source = await PDFDocument.load(bytes);
      const pages = await output.copyPages(source, source.getPageIndices());
      for (const page of pages) output.addPage(page);
      batches += 1;
    }
  }

  const pdf = await output.save();
  let binary = "";
  const block = 0x8000;
  for (let i = 0; i < pdf.length; i += block) {
    binary += String.fromCharCode(...pdf.subarray(i, i + block));
  }

  return {
    filename: `etiquetas-mercado-livre-${ymd(new Date())}.pdf`,
    mime_type: "application/pdf",
    base64: btoa(binary),
    shipments: shipmentCount,
    groups: normalizedGroups.length,
    batches,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return reply(401, { error: "Authorization required" });
  }

  try {
    const body = (await req.json()) as Body;
    const companyId = body.company_id ?? "";
    const accountId = body.account_id ?? "";
    if (!companyId || !accountId || !body.action) {
      return reply(400, { error: "company_id, account_id and action are required" });
    }

    const account = await assertAccess(authHeader, companyId, accountId);
    const token = await ensureToken(authHeader, companyId, accountId);

    if (body.action === "ads_sync") {
      const days = [1, 7, 30, 90].includes(Number(body.days)) ? Number(body.days) : 30;
      const result = await syncAds(
        token,
        companyId,
        accountId,
        account.account_name || account.nickname || "",
        days,
      );
      return reply(200, { status: "success", action: body.action, result });
    }

    if (body.action === "competition_sync") {
      if (!body.listing_id) {
        return reply(400, { error: "listing_id is required for competition_sync" });
      }
      const result = await syncCompetition(
        token,
        companyId,
        accountId,
        body.listing_id,
      );
      return reply(200, { status: "success", action: body.action, result });
    }

    if (body.action === "market_radar_sync") {
      const result = await syncRadar(
        token,
        companyId,
        accountId,
        body.category_ids,
      );
      return reply(200, { status: "success", action: body.action, result });
    }

    if (body.action === "shipment_labels") {
      if (!body.groups?.length) {
        return reply(400, { error: "groups are required for shipment_labels" });
      }
      const result = await generateShipmentLabels(token, body.groups);
      return reply(200, { status: "success", action: body.action, result });
    }

    return reply(400, { error: "Unsupported action" });
  } catch (error) {
    console.error("ml-marketplace-intelligence", error);
    return reply(500, {
      status: "error",
      error: error instanceof Error ? error.message : "Unexpected error",
    });
  }
});

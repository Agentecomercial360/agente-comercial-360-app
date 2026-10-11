import { supabase } from "@/lib/supabase";

export type MarketplaceIntelligenceAction =
  | "ads_sync"
  | "competition_sync"
  | "market_radar_sync"
  | "shipment_labels";

export type MarketplaceIntelligenceInput = {
  action: MarketplaceIntelligenceAction;
  company_id: string;
  account_id: string;
  days?: number;
  listing_id?: string;
  category_ids?: string[];
  groups?: Array<{
    sku?: string;
    shipment_ids: string[];
  }>;
};

export async function runMarketplaceIntelligence<T = Record<string, unknown>>(
  input: MarketplaceIntelligenceInput,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(
    "ml-marketplace-intelligence",
    { body: input },
  );

  if (error) {
    let message = error.message || "Falha ao executar inteligência do Mercado Livre.";
    const context = (error as { context?: Response }).context;
    if (context && typeof context.clone === "function") {
      try {
        const payload = await context.clone().json();
        message = payload?.error || payload?.message || message;
      } catch {
        // Keep the Supabase error message.
      }
    }
    throw new Error(message);
  }

  if (data?.status && data.status !== "success") {
    throw new Error(data?.error || data?.message || "Resposta inválida da integração.");
  }

  return (data?.result ?? data ?? {}) as T;
}


export type MarketplaceSyncState = {
  capability: "ads" | "competition" | "market_radar" | "shipment_labels";
  resource_key: string;
  status: "idle" | "running" | "success" | "error";
  last_attempt_at: string | null;
  last_success_at: string | null;
  next_due_at: string | null;
  last_error_message: string | null;
};

function syncIdentity(input: MarketplaceIntelligenceInput) {
  if (input.action === "ads_sync") {
    return { capability: "ads" as const, resourceKey: "account" };
  }
  if (input.action === "competition_sync") {
    return {
      capability: "competition" as const,
      resourceKey: input.listing_id || "unknown",
    };
  }
  if (input.action === "market_radar_sync") {
    return { capability: "market_radar" as const, resourceKey: "account" };
  }
  return { capability: "shipment_labels" as const, resourceKey: "account" };
}

export async function getMarketplaceSyncState(
  input: MarketplaceIntelligenceInput,
): Promise<MarketplaceSyncState | null> {
  const identity = syncIdentity(input);
  const { data, error } = await supabase
    .from("ecommerce_marketplace_sync_state")
    .select(
      "capability,resource_key,status,last_attempt_at,last_success_at,next_due_at,last_error_message",
    )
    .eq("company_id", input.company_id)
    .eq("account_id", input.account_id)
    .eq("capability", identity.capability)
    .eq("resource_key", identity.resourceKey)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as MarketplaceSyncState | null;
}

export async function autoSyncMarketplaceIntelligence<T = Record<string, unknown>>(
  input: MarketplaceIntelligenceInput,
): Promise<{ executed: boolean; result?: T; state?: MarketplaceSyncState | null }> {
  if (input.action === "shipment_labels") {
    return { executed: false };
  }

  const identity = syncIdentity(input);
  const state = await getMarketplaceSyncState(input);
  const now = Date.now();

  if (state?.status === "running" && state.last_attempt_at) {
    const runningAge = now - new Date(state.last_attempt_at).getTime();
    if (runningAge < 10 * 60_000) {
      return { executed: false, state };
    }
  }

  if (state?.next_due_at && new Date(state.next_due_at).getTime() > now) {
    return { executed: false, state };
  }

  const lockKey =
    "ac360:auto-sync:" +
    [input.company_id, input.account_id, identity.capability, identity.resourceKey].join(":");

  if (typeof window !== "undefined") {
    const raw = window.sessionStorage.getItem(lockKey);
    const lastAttempt = raw ? Number(raw) : 0;
    if (Number.isFinite(lastAttempt) && now - lastAttempt < 5 * 60_000) {
      return { executed: false, state };
    }
    window.sessionStorage.setItem(lockKey, String(now));
  }

  const result = await runMarketplaceIntelligence<T>(input);
  return { executed: true, result, state };
}

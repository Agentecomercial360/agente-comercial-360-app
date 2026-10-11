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

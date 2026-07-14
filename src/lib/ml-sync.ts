// Shared client for the Mercado Livre "sync-account-smart" endpoint.
// POST { company_id, account_id, days } and returns a normalized result.
import { supabase } from "@/lib/supabase";

export const ML_COMPANY_ID = "ac7d24b9-5227-46ac-9ced-b66473422a17";

const SMART_SYNC_ENDPOINT =
  "https://ac360-mercadolivre-api-production.up.railway.app/api/mercadolivre/sync-account-smart";

export type SmartSyncResult = {
  orders_found: number;
  items_linked: number;
  products_created: number;
  orders_recalculated: number;
  orders_pending_cost: number;
  raw: any;
};

function pickNumber(obj: any, ...keys: string[]): number {
  if (!obj || typeof obj !== "object") return 0;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
      return Number(v);
    }
  }
  return 0;
}

export async function runSmartAccountSync(
  accountId: string,
  opts: { days?: number; companyId?: string } = {},
): Promise<SmartSyncResult> {
  const body = {
    company_id: opts.companyId ?? ML_COMPANY_ID,
    account_id: accountId,
    days: opts.days ?? 1,
  };

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error(`Falha ao obter sessão: ${sessionError.message}`);
  }
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    throw new Error("Sessão não encontrada. Entre novamente no sistema.");
  }

  const res = await fetch(SMART_SYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sessão inválida ou expirada. Entre novamente no sistema.");
    }
    if (res.status === 403) {
      throw new Error("Você não possui acesso a esta conta Mercado Livre.");
    }
    if (res.status === 409) {
      throw new Error("Já existe uma sincronização em andamento para esta conta.");
    }
    if (res.status === 429) {
      throw new Error("Limite temporário de sincronizações atingido. Tente novamente em instantes.");
    }
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  if (data && data.status && data.status !== "success") {
    const msg = data?.message || data?.error || "Resposta inválida da API de sincronização.";
    throw new Error(msg);
  }

  const result = data?.result ?? data ?? {};

  return {
    orders_found: pickNumber(result, "orders_found", "orders", "ordersFound"),
    items_linked: pickNumber(result, "items_linked", "linked_items", "itemsLinked"),
    products_created: pickNumber(result, "products_created", "productsCreated"),
    orders_recalculated: pickNumber(
      result,
      "orders_recalculated",
      "recalculated_orders",
      "ordersRecalculated",
    ),
    orders_pending_cost: pickNumber(
      result,
      "orders_pending_cost",
      "pending_cost_orders",
      "ordersPendingCost",
    ),
    raw: data,
  };
}

export function formatSmartSyncMessage(r: SmartSyncResult): string {
  return (
    `Sincronização concluída: ${r.orders_found} pedidos encontrados · ` +
    `${r.items_linked} itens vinculados · ${r.products_created} produtos criados · ` +
    `${r.orders_recalculated} pedidos recalculados · ${r.orders_pending_cost} pendentes de custo.`
  );
}

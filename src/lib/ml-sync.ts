// Shared client for the Mercado Livre "sync-account-smart" endpoint.
// POST { company_id, account_id, days } and returns a normalized result.

import { supabase } from "@/lib/supabase";

const API_BASE_URL = String(import.meta.env.VITE_AC360_API_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

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
  opts: { companyId: string; days?: number },
): Promise<SmartSyncResult> {
  const companyId = opts.companyId?.trim();
  const normalizedAccountId = accountId?.trim();

  if (!companyId) {
    throw new Error("Empresa ativa não identificada para a sincronização.");
  }

  if (!normalizedAccountId) {
    throw new Error("Conta Mercado Livre não identificada para a sincronização.");
  }

  if (!API_BASE_URL) {
    throw new Error(
      "VITE_AC360_API_URL não está configurada. Verifique o arquivo .env.local.",
    );
  }

  const body = {
    company_id: companyId,
    account_id: normalizedAccountId,
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

  const res = await fetch(
    `${API_BASE_URL}/api/mercadolivre/sync-account-smart`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    },
  );

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

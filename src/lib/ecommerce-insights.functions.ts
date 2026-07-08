/**
 * Motor IA assistido — camada de PRÉVIA (dry-run).
 *
 * IMPORTANTE:
 * - Esta função NÃO cria, atualiza ou remove nenhum registro.
 * - NÃO chama IA generativa.
 * - NÃO altera nada no Mercado Livre.
 * - NÃO substitui a RPC atual `generate_ecommerce_insights_v1` (Motor SQL v1).
 *
 * Objetivo: apenas contar/preparar o contexto real que um futuro motor IA
 * assistido usaria para gerar planos de ação, mantendo a segurança do RLS
 * (usa o mesmo cliente Supabase do front, escopado por company_id + account_id).
 *
 * Nota de arquitetura: este projeto não possui middleware server-side de
 * autenticação (`requireSupabaseAuth`) configurado. A segurança é garantida
 * por RLS no Supabase — a sessão do usuário logado limita o acesso via
 * `company_users`. Manter o nome `.functions.ts` para alinhar com a evolução
 * futura para `createServerFn` quando o middleware estiver disponível.
 */

import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Tipos públicos — futuro plano de ação da IA (ainda não gerado nesta etapa)
// ---------------------------------------------------------------------------

export type AiActionRiskLevel = "low" | "medium" | "high";

export type AiActionPlanPreview = {
  insight_type: string | null;
  product_id: string | null;
  listing_id: string | null;
  diagnosis: string | null;
  probable_cause: string | null;
  recommended_action: string | null;
  suggested_title: string | null;
  suggested_description: string | null;
  suggested_image_idea: string | null;
  suggested_ads_action: string | null;
  suggested_price_action: string | null;
  suggested_kit_action: string | null;
  approval_required: boolean;
  risk_level: AiActionRiskLevel;
  rules_considered: string[];
};

export type EngineDataSourceStatus = {
  source: string;
  count: number | null;
  available: boolean;
  error?: string;
};

export type InsightsEnginePreviewResult = {
  company_id: string;
  account_id: string | null;
  totals: {
    products: number | null;
    listings: number | null;
    inventory: number | null;
    metrics_daily: number | null;
    ads_metrics: number | null;
    order_items: number | null;
    knowledge_base_rules_active: number | null;
    existing_insights: number | null;
  };
  sources: EngineDataSourceStatus[];
  status: "preview_only";
  message: string;
  generated_at: string;
};

// ---------------------------------------------------------------------------
// Helper — count seguro por tabela
// ---------------------------------------------------------------------------

type CountArgs = {
  table: string;
  companyId: string;
  accountId: string | null;
  /** Filter by account_id column strictly (table has account_id and is not global). */
  useAccountFilter: boolean;
  /**
   * When true, filter by `account_id = accountId OR account_id IS NULL`.
   * Usado por tabelas de configuração/regras onde `account_id null` = global.
   */
  useAccountOrGlobal?: boolean;
  extraEq?: Array<[string, unknown]>;
};

async function safeCount(args: CountArgs): Promise<EngineDataSourceStatus> {
  const { table, companyId, accountId, useAccountFilter, useAccountOrGlobal, extraEq } = args;
  try {
    let q = supabase
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select("*", { count: "exact", head: true }) as any;
    q = q.eq("company_id", companyId);
    if (useAccountFilter && accountId) q = q.eq("account_id", accountId);
    if (useAccountOrGlobal && accountId) {
      q = q.or(`account_id.is.null,account_id.eq.${accountId}`);
    }
    if (extraEq) for (const [k, v] of extraEq) q = q.eq(k, v);
    const { count, error } = await q;
    if (error) {
      return { source: table, count: null, available: false, error: error.message };
    }
    return { source: table, count: count ?? 0, available: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { source: table, count: null, available: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Prévia do Motor IA assistido (dry-run)
// ---------------------------------------------------------------------------

export type RunInsightsEnginePreviewInput = {
  companyId: string;
  accountId: string | null;
};

export async function runInsightsEnginePreview(
  input: RunInsightsEnginePreviewInput,
): Promise<InsightsEnginePreviewResult> {
  const { companyId, accountId } = input;

  // Nota de escopo:
  //  - ecommerce_products, ecommerce_inventory, ecommerce_order_items NÃO possuem
  //    coluna account_id — são escopados por company_id (a granularidade por conta
  //    vem via ecommerce_listings.account_id). Filtrar por account_id aqui geraria
  //    erro e a UI mostraria "—" mesmo com dados existentes.
  //  - ecommerce_ai_knowledge_base usa `status = 'active'` (não `is_active`) e
  //    aceita account_id null como regra global válida para a conta ativa.
  const [
    accounts,
    products,
    listings,
    inventory,
    metrics,
    ads,
    orderItems,
    kbRules,
    insights,
  ] = await Promise.all([
    safeCount({ table: "ecommerce_accounts", companyId, accountId, useAccountFilter: false }),
    safeCount({ table: "ecommerce_products", companyId, accountId, useAccountFilter: false }),
    safeCount({ table: "ecommerce_listings", companyId, accountId, useAccountFilter: true }),
    safeCount({ table: "ecommerce_inventory", companyId, accountId, useAccountFilter: false }),
    safeCount({ table: "ecommerce_metrics_daily", companyId, accountId, useAccountFilter: true }),
    safeCount({ table: "ecommerce_ads_metrics", companyId, accountId, useAccountFilter: true }),
    safeCount({ table: "ecommerce_order_items", companyId, accountId, useAccountFilter: false }),
    safeCount({
      table: "ecommerce_ai_knowledge_base",
      companyId,
      accountId,
      useAccountFilter: false,
      useAccountOrGlobal: true,
      extraEq: [["status", "active"]],
    }),
    safeCount({ table: "ecommerce_ai_insights", companyId, accountId, useAccountFilter: true }),
  ]);


  const sources: EngineDataSourceStatus[] = [
    accounts,
    products,
    listings,
    inventory,
    metrics,
    ads,
    orderItems,
    kbRules,
    insights,
  ];

  return {
    company_id: companyId,
    account_id: accountId,
    totals: {
      products: products.count,
      listings: listings.count,
      inventory: inventory.count,
      metrics_daily: metrics.count,
      ads_metrics: ads.count,
      order_items: orderItems.count,
      knowledge_base_rules_active: kbRules.count,
      existing_insights: insights.count,
    },
    sources,
    status: "preview_only",
    message:
      "Motor IA assistido preparado em modo prévia. Nenhum insight foi criado.",
    generated_at: new Date().toISOString(),
  };
}

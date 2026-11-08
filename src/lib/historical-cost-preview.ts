/** Financial preview must never be mixed across companies, accounts or periods.
 * Pure contract check: fail closed before totals from a page are aggregated. */
export type HistoricalCostPreviewPage = {
  success: boolean;
  company_id: string;
  account_id: string;
  profit_approved: boolean;
  write_operations_executed: boolean;
  summary: { orders_checked: number; estimated_only: number; blocked: number };
  candidates: {
    order_id: string;
    company_id: string;
    account_id: string;
    status: "estimated_only" | "blocked";
    reasons: string[];
  }[];
  pagination: {
    page: number;
    page_size: number;
    has_more: boolean;
    next_page: number | null;
    scope: string;
    since: string | null;
    until: string | null;
  };
};
export type HistoricalCostPreviewScope = {
  companyId: string;
  accountId: string;
  since: string;
  until: string;
  page: number;
};
export function assertHistoricalCostPreviewPage(
  data: HistoricalCostPreviewPage,
  scope: HistoricalCostPreviewScope,
): void {
  if (!data || data.success !== true || data.profit_approved !== false ||
      data.write_operations_executed !== false ||
      data.company_id !== scope.companyId || data.account_id !== scope.accountId ||
      data.pagination?.scope !== "page_only" || data.pagination.page !== scope.page ||
      data.pagination.since !== scope.since || data.pagination.until !== scope.until ||
      data.pagination.page_size !== 100 ||
      typeof data.pagination.has_more !== "boolean" ||
      !Number.isSafeInteger(data.summary?.orders_checked) || data.summary.orders_checked < 0 ||
      !Number.isSafeInteger(data.summary?.estimated_only) || data.summary.estimated_only < 0 ||
      !Number.isSafeInteger(data.summary?.blocked) || data.summary.blocked < 0 ||
      data.summary.orders_checked > data.pagination.page_size ||
      data.summary.orders_checked !== data.summary.estimated_only + data.summary.blocked ||
      !Array.isArray(data.candidates) ||
      data.candidates.length !== data.summary.orders_checked ||
      data.candidates.some(candidate =>
        !candidate || typeof candidate.order_id !== "string" || !candidate.order_id ||
        candidate.company_id !== scope.companyId || candidate.account_id !== scope.accountId ||
        !["estimated_only", "blocked"].includes(candidate.status) ||
        !Array.isArray(candidate.reasons) ||
        candidate.reasons.some(reason => typeof reason !== "string") ||
        (candidate.status === "estimated_only" && candidate.reasons.length !== 0) ||
        (candidate.status === "blocked" && candidate.reasons.length === 0)
      ) ||
      data.candidates.filter(candidate => candidate.status === "estimated_only").length !== data.summary.estimated_only ||
      data.candidates.filter(candidate => candidate.status === "blocked").length !== data.summary.blocked ||
      (data.pagination.has_more &&
        (data.pagination.next_page !== scope.page + 1 ||
          data.summary.orders_checked !== data.pagination.page_size)) ||
      (!data.pagination.has_more && data.pagination.next_page !== null)) {
    throw new Error("A API retornou dados financeiros inconsistentes ou fora da conta e período selecionados.");
  }
}

/** Counts blocked orders by cause (one order can have multiple causes). */
export const FINANCIAL_BLOCK_REASON_LABELS = {
  product_cost_not_found: "Sem custo histórico cadastrado",
  financial_review_or_refund: "Devolução, cancelamento ou revisão financeira",
  missing_financial_components: "Taxas ou dados financeiros incompletos",
  ambiguous_cost: "Custos históricos conflitantes",
  invalid_quantity: "Quantidade de item inválida",
  missing_items: "Pedido sem itens vinculados",
  missing_order_date: "Data de venda ausente",
  missing_tenant_scope: "Escopo de conta inválido",
} as const;

export type HistoricalBlockReason = { reason: string; label: string; orders: number };

export function summarizeHistoricalBlockedReasons(
  candidates: HistoricalCostPreviewPage["candidates"],
): HistoricalBlockReason[] {
  const counts = new Map<string, number>();
  for (const candidate of candidates) {
    if (candidate.status !== "blocked") continue;
    for (const reason of new Set(candidate.reasons)) {
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([reason, orders]) => ({
    reason,
    label: FINANCIAL_BLOCK_REASON_LABELS[reason as keyof typeof FINANCIAL_BLOCK_REASON_LABELS] ??
      "Outra pendência financeira",
    orders,
  })).sort((a, b) => b.orders - a.orders || a.label.localeCompare(b.label));
}

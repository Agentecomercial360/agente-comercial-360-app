/** Financial preview must never be mixed across companies, accounts or periods.
 * Pure contract check: fail closed before totals from a page are aggregated. */
export type HistoricalCostPreviewPage = {
  success: boolean;
  company_id: string;
  account_id: string;
  profit_approved: boolean;
  write_operations_executed: boolean;
  summary: { orders_checked: number; estimated_only: number; blocked: number };
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
      (data.pagination.has_more &&
        (data.pagination.next_page !== scope.page + 1 ||
          data.summary.orders_checked !== data.pagination.page_size)) ||
      (!data.pagination.has_more && data.pagination.next_page !== null)) {
    throw new Error("A API retornou dados financeiros inconsistentes ou fora da conta e período selecionados.");
  }
}

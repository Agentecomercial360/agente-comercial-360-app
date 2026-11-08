/** Prevent unpriced or financially disputed orders from becoming "profit" KPIs. */
export type ProfitReadinessOrder = {
  net_profit: number | null;
  profit_confidence: string | null;
  financial_review_required?: boolean | null;
  has_refund?: boolean | null;
  has_chargeback?: boolean | null;
};

export function isVerifiedProfitOrder(order: ProfitReadinessOrder): boolean {
  return (
    (order.profit_confidence ?? "").toLowerCase() === "high" &&
    order.financial_review_required !== true &&
    order.has_refund !== true &&
    order.has_chargeback !== true &&
    typeof order.net_profit === "number" &&
    Number.isFinite(order.net_profit)
  );
}

export function summarizeVerifiedProfit(orders: ProfitReadinessOrder[]): {
  verifiedOrders: number;
  unavailableOrders: number;
  verifiedProfit: number | null;
} {
  let verifiedOrders = 0;
  let profit = 0;
  for (const order of orders) {
    if (!isVerifiedProfitOrder(order)) continue;
    verifiedOrders += 1;
    profit += order.net_profit as number;
  }
  return {
    verifiedOrders,
    unavailableOrders: orders.length - verifiedOrders,
    verifiedProfit: verifiedOrders > 0 ? profit : null,
  };
}

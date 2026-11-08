import { test } from "node:test";
import assert from "node:assert/strict";
import { isVerifiedProfitOrder, marketplaceFeeForDisplay, summarizeVerifiedProfit } from "../src/lib/ecommerce-profit-readiness.ts";

const base = {
  net_profit: 45,
  product_cost_total: 20,
  profit_confidence: "high",
  financial_review_required: false,
  has_refund: false,
  has_chargeback: false,
};

test("only verified profit is eligible", () => {
  assert.equal(isVerifiedProfitOrder(base), true);
  for (const wrong of [
    { profit_confidence: "pending_cost" },
    { profit_confidence: null },
    { financial_review_required: true },
    { has_refund: true },
    { has_chargeback: true },
    { net_profit: null },
    { net_profit: Number.NaN },
    { product_cost_total: null },
    { product_cost_total: Number.NaN },
    { product_cost_total: -1 },
  ]) {
    assert.equal(isVerifiedProfitOrder({ ...base, ...wrong }), false);
  }
});
test("missing costs and financial reviews never increase verified totals", () => {
  const result = summarizeVerifiedProfit([
    base,
    { ...base, net_profit: 15, profit_confidence: "HIGH" },
    { ...base, net_profit: 999, profit_confidence: "pending_cost" },
    { ...base, net_profit: 400, has_refund: true },
    { ...base, net_profit: 300, financial_review_required: true },
  ]);
  assert.deepEqual(result, {
    verifiedOrders: 2,
    unavailableOrders: 3,
    verifiedProfit: 60,
  });
});
test("zero verified orders renders unavailable, not R$ 0", () => {
  assert.deepEqual(summarizeVerifiedProfit([{ ...base, profit_confidence: "pending_cost" }]), {
    verifiedOrders: 0,
    unavailableOrders: 1,
    verifiedProfit: null,
  });
});
test("explicit zero CMV remains allowed if verified by accounting", () => {
  assert.equal(isVerifiedProfitOrder({ ...base, product_cost_total: 0 }), true);
});
test("genuine verified zero and losses remain visible", () => {
  assert.equal(summarizeVerifiedProfit([
    { ...base, net_profit: 0 },
    { ...base, net_profit: -30 },
  ]).verifiedProfit, -30);
});

test("Mercado Livre fee aliases are never charged twice", () => {
  assert.equal(marketplaceFeeForDisplay({marketplace_fee:10,mercadolivre_fee:10}),10);
  assert.equal(marketplaceFeeForDisplay({marketplace_fee:0,mercadolivre_fee:12}),0);
  assert.equal(marketplaceFeeForDisplay({marketplace_fee:null,mercadolivre_fee:12}),12);
  assert.equal(marketplaceFeeForDisplay({marketplace_fee:null,mercadolivre_fee:null}),null);
});

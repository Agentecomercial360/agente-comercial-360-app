import { test } from "node:test";
import assert from "node:assert/strict";
import { assertHistoricalCostPreviewPage, summarizeHistoricalBlockedReasons, accumulateHistoricalPreviewPage, emptyHistoricalPreviewAggregate, formatHistoricalPreviewReceipt } from "../src/lib/historical-cost-preview.ts";

const scope = {
  companyId: "company-one", accountId: "account-one",
  since: "2026-05-13T03:00:00.000Z",
  until: "2026-11-09T02:59:59.999Z", page: 1,
};
const valid = {
  success: true, company_id: scope.companyId, account_id: scope.accountId,
  profit_approved: false, write_operations_executed: false,
  summary: { orders_checked: 100, estimated_only: 0, blocked: 100 },
  candidates: Array.from({ length: 100 }, (_, i) => ({
    order_id: `order-${i}`, company_id: scope.companyId, account_id: scope.accountId,
    status: "blocked", reasons: ["product_cost_not_found"],
  })),
  pagination: { page: 1, page_size: 100, has_more: true,
    next_page: 2, scope: "page_only", since: scope.since, until: scope.until },
};
test("accepts a bounded read-only page under the exact requested scope", () => {
  assert.doesNotThrow(() => assertHistoricalCostPreviewPage(valid, scope));
  assert.doesNotThrow(() => assertHistoricalCostPreviewPage({
    ...valid,
    summary: { orders_checked: 66, estimated_only: 0, blocked: 66 },
    candidates: valid.candidates.slice(0, 66),
    pagination: { ...valid.pagination, has_more: false, next_page: null, page: 6 },
  }, { ...scope, page: 6 }));
});
test("rejects cross-account, cross-company and wrong date-range pages", () => {
  for (const change of [
    { company_id: "another-company" },
    { candidates: valid.candidates.map(c => ({ ...c, account_id: "different-account" })) },
    { candidates: valid.candidates.slice(1) },
    { account_id: "another-account" },
    { pagination: { ...valid.pagination, since: "2026-06-01T03:00:00.000Z" } },
    { pagination: { ...valid.pagination, until: "2026-10-31T02:59:59.999Z" } },
    { pagination: { ...valid.pagination, page: 2 } },
    { pagination: { ...valid.pagination, page_size: 101 } },
  ]) assert.throws(() => assertHistoricalCostPreviewPage({ ...valid, ...change }, scope));
});
test("rejects incomplete, unsafe or inconsistent page contracts", () => {
  for (const change of [
    { success: false },
    { candidates: valid.candidates.map((c, i) => i === 0 ? { ...c, status: "estimated_only" } : c) },
    { candidates: valid.candidates.map((c, i) => i === 0 ? { ...c, reasons: [] } : c) },
    { profit_approved: true },
    { write_operations_executed: true },
    { summary: { orders_checked: 100, estimated_only: 20, blocked: 79 } },
    { summary: { orders_checked: 101, estimated_only: 0, blocked: 101 } },
    { summary: { orders_checked: -1, estimated_only: 0, blocked: -1 } },
    { pagination: { ...valid.pagination, has_more: true, next_page: 99 } },
    { pagination: { ...valid.pagination, has_more: false, next_page: 2 } },
    { pagination: { ...valid.pagination, scope: "all_accounts" } },
    { pagination: { ...valid.pagination, has_more: true, next_page: 2 },
      summary: { orders_checked: 0, estimated_only: 0, blocked: 0 } },
  ]) assert.throws(() => assertHistoricalCostPreviewPage({ ...valid, ...change }, scope));
});

test("blocked reasons are deduplicated per order and can be totaled across pages", () => {
  const reasons = summarizeHistoricalBlockedReasons([
    { ...valid.candidates[0], reasons: ["product_cost_not_found", "product_cost_not_found", "financial_review_or_refund"] },
    { ...valid.candidates[1], reasons: ["product_cost_not_found"] },
    { ...valid.candidates[2], status: "estimated_only", reasons: [] },
  ]);
  assert.deepEqual(reasons.map(r => [r.reason, r.orders]), [
    ["product_cost_not_found", 2],
    ["financial_review_or_refund", 1],
  ]);
});

test("rejects repeated order IDs within one page", () => {
  const duplicate = { ...valid, candidates: valid.candidates.map((c, i) =>
    i === 1 ? { ...c, order_id: valid.candidates[0].order_id } : c) };
  assert.throws(() => assertHistoricalCostPreviewPage(duplicate, scope), /inconsistentes/);
});

test("validates Robomix-sized 566 order preview across six disjoint pages", () => {
  let current = emptyHistoricalPreviewAggregate();
  for (let page = 1; page <= 6; page += 1) {
    const count = page === 6 ? 66 : 100;
    const candidatePage = {
      ...valid,
      summary: { orders_checked: count, estimated_only: 0, blocked: count },
      candidates: Array.from({ length: count }, (_, i) => ({
        order_id: `order-${(page - 1) * 100 + i}`,
        company_id: scope.companyId, account_id: scope.accountId,
        status: "blocked", reasons: ["product_cost_not_found"],
      })),
      pagination: {
        ...valid.pagination, page, has_more: page !== 6,
        next_page: page === 6 ? null : page + 1,
      },
    };
    assert.doesNotThrow(() => assertHistoricalCostPreviewPage(candidatePage, { ...scope, page }));
    current = accumulateHistoricalPreviewPage(current, candidatePage);
  }
  assert.equal(current.checked, 566);
  assert.equal(current.estimatedOnly, 0);
  assert.equal(current.blocked, 566);
  assert.equal(current.orderIds.size, 566);
  assert.equal(current.reasons.find(x => x.reason === "product_cost_not_found")?.orders, 566);
});

test("rejects repeated order IDs across different pages before displaying totals", () => {
  const first = accumulateHistoricalPreviewPage(emptyHistoricalPreviewAggregate(), valid);
  const second = {
    ...valid, pagination: { ...valid.pagination, page: 2, next_page: 3 },
  };
  assertHistoricalCostPreviewPage(second, { ...scope, page: 2 });
  assert.throws(() => accumulateHistoricalPreviewPage(first, second), /repetiu pedidos/);
});

test("shareable pilot receipt includes only summary, reasons and date range", () => {
  const receipt = formatHistoricalPreviewReceipt({
    checked: 566, estimatedOnly: 0, blocked: 566,
    reasons: [{ reason: "product_cost_not_found", label: "Sem custo histórico cadastrado", orders: 566 }],
    since: scope.since, until: scope.until,
  });
  assert.match(receipt, /Pedidos analisados: 566/);
  assert.match(receipt, /Bloqueados: 566/);
  assert.match(receipt, /Sem custo histórico cadastrado: 566/);
  assert.match(receipt, /Lucro não aprovado/);
  assert.ok(receipt.includes("\n"), "result must contain line breaks");
  assert.equal(receipt.includes(scope.companyId), false);
  assert.equal(receipt.includes(scope.accountId), false);
  assert.equal(receipt.includes(valid.candidates[0].order_id), false);
});

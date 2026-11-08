import { test } from "node:test";
import assert from "node:assert/strict";
import { getPeriodRange, aggregateMonthlyOrderPoints } from "../src/lib/ecommerce-metrics.ts";

const now = new Date("2026-11-08T22:30:00.000Z");

test("180-day period spans the Robomix sales history with Sao Paulo boundaries", () => {
  const range = getPeriodRange("180d", now);
  assert.equal(range.spEndDate, "2026-11-08");
  assert.equal(range.spStartDate, "2026-05-13");
  assert.equal(range.sinceISO, "2026-05-13T03:00:00.000Z");
  assert.equal(range.untilISO, "2026-11-09T02:59:59.999Z");
  assert.ok(Date.parse("2026-06-15T11:55:12Z") >= Date.parse(range.sinceISO));
  assert.ok(Date.parse("2026-10-10T15:53:58Z") <= Date.parse(range.untilISO));
});
test("existing Today, 7d, 30d filters retain their boundaries", () => {
  assert.equal(getPeriodRange("today", now).spStartDate, "2026-11-08");
  assert.equal(getPeriodRange("7d", now).spStartDate, "2026-11-02");
  assert.equal(getPeriodRange("30d", now).spStartDate, "2026-10-10");
});
test("180-day sales chart summarizes by calendar month, not 30-day blocks", () => {
  const points = aggregateMonthlyOrderPoints([
    { key: "2026-06-15", count: 1, gross: 100 },
    { key: "2026-06-30", count: 2, gross: 200 },
    { key: "2026-07-01", count: 3, gross: 300 },
    { key: "2026-07-16", count: 4, gross: 400 },
    { key: "2026-08-01", count: 0, gross: 0 },
  ]);
  assert.deepEqual(points.map(p => [p.key, p.count, p.gross]), [
    ["2026-06", 3, 300],
    ["2026-07", 7, 700],
    ["2026-08", 0, 0],
  ]);
  assert.equal(points[0].label.toLowerCase().includes("jun"), true);
});

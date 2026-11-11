import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getMarketplaceReadiness } from "../src/lib/ecommerce-sync-readiness.ts";

const scenarios = [
  ["disconnected", false, "not_started", null, "authorization_pending", false],
  ["OAuth authorized, no sync", true, "not_started", null, "initial_pending", false],
  ["reported success without completion timestamp", true, "succeeded", null, "initial_pending", false],
  ["initial import running", true, "running", null, "running", false],
  ["first import failed", true, "failed", null, "failed", false],
  ["initial import complete", true, "succeeded", "2026-10-29T18:02:17Z", "imported", true],
  ["incremental import running after completed first import", true, "running", "2026-10-29T18:02:17Z", "running", true],
  ["retry fails after first completion", true, "failed", "2026-10-29T18:02:17Z", "failed", true],
  ["previously imported account disconnected", false, "succeeded", "2026-10-29T18:02:17Z", "authorization_pending", false],
  ["case insensitive status", true, "  FAILED  ", null, "failed", false],
];
for (const [name, isAuthorized, syncStatus, initialSyncCompletedAt, kind, canUseImportedFeed] of scenarios) {
  test(name, () => {
    const value = getMarketplaceReadiness({ isAuthorized, syncStatus, initialSyncCompletedAt });
    assert.equal(value.kind, kind);
    assert.equal(value.canUseImportedFeed, canUseImportedFeed);
    assert.equal(value.initialImportComplete, Boolean(initialSyncCompletedAt));
  });
}
test("last_sync_at does not substitute for initial_sync_completed_at", () => {
  const account = { isAuthorized: true, syncStatus: "succeeded", lastSyncAt: "2026-10-29T18:47:19Z" };
  assert.equal(getMarketplaceReadiness(account).canUseImportedFeed, false);
});

test("onboarding selects newly created account and verifies first import by account", () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const source = fs.readFileSync(path.join(root, "src/routes/ecommerce/onboarding.tsx"), "utf8");
  assert.match(source, /setSelectedOAuthAccountId\(newAccount\.id\)/);
  assert.match(source, /\.select\("initial_sync_completed_at"\)\s*\.eq\("company_id", ctx\.company_id\)\s*\.eq\("id", accountId\)/);
  assert.match(source, /completedAccount\?\.initial_sync_completed_at/);
  assert.match(source, /importação inicial desta conta ainda não foi confirmada/);
  assert.doesNotMatch(source, /if \(!connectedAccount\.last_sync_at\)/);
});

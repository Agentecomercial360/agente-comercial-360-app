import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { getAc360ApiUrl } from "../src/lib/ac360-api.ts";

const staging = "https://ac360-mercadolivre-api-staging-staging.up.railway.app";

test("uses the configured staging URL and removes surrounding whitespace and trailing slashes", () => {
  assert.equal(getAc360ApiUrl(`  ${staging}/// \n`), staging);
  assert.equal(getAc360ApiUrl("http://localhost:3001/"), "http://localhost:3001");
});

test("blocks missing or blank configuration", () => {
  for (const value of [undefined, "", "   "]) {
    assert.throws(() => getAc360ApiUrl(value), /não configurada/);
  }
});

test("blocks malformed URLs, unsafe schemes, credentials and non-origin URLs", () => {
  for (const value of [
    "not-a-url",
    "https:example.com",
    "example.com",
    "ftp://example.com",
    "javascript:alert(1)",
    "https://exa mple.com",
    "https://example.com/ api",
    "https://user:password@example.com",
    "https://example.com/api",
    "https://example.com?token=test",
    "https://example.com#fragment",
  ]) {
    assert.throws(() => getAc360ApiUrl(value), /inválida/);
  }
});

test("missing and invalid configuration cannot silently send a request to production", async () => {
  let requests = 0;
  const request = async () => {
    requests += 1;
  };
  for (const value of [undefined, "", "invalid"]) {
    await assert.rejects(async () => {
      await request(`${getAc360ApiUrl(value)}/api/mercadolivre/auth-url`);
    });
  }
  assert.equal(requests, 0);
});

test("all direct Mercado Livre clients use the shared resolver without a production fallback", () => {
  for (const file of [
    "src/lib/ml-oauth.ts",
    "src/lib/ml-sync.ts",
    "src/routes/ecommerce/concorrencia.tsx",
    "src/routes/ecommerce/debug.competition-api.tsx",
  ]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(source, /getAc360ApiUrl\(\)/);
    assert.doesNotMatch(source, /ac360-mercadolivre-api-production/);
  }
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const source = readFileSync(resolve(root, "src/lib/ml-oauth.ts"), "utf8");

assert.match(source, /window\.open\(\s*["']about:blank["']/);
assert.match(source, /getMercadoLivreConnectionSnapshot\(companyId, accountId\)/);
assert.match(source, /integration\?\.integration_status === ["']connected["']/);
assert.match(source, /account\?\.auth_status === ["']connected["']/);
assert.match(source, /expiresAtMs > Date\.now\(\) \+ 60_000/);
assert.match(source, /current\.connected && changed/);
assert.match(source, /popupClosedAt \?\?= Date\.now\(\)/);
assert.match(source, /Date\.now\(\) - popupClosedAt >= 9_000/);

const loop = source.slice(source.indexOf("while (Date.now() - startedAt < timeoutMs)"));
assert.ok(loop.indexOf("getMercadoLivreConnectionSnapshot(companyId, accountId)") < loop.indexOf("if (popup.closed)"), "Check connected status before classifying a closed popup as cancellation");
assert.ok(loop.indexOf("if (popup.closed)") < loop.indexOf("await wait(1_500)"), "Check window closure on every poll");
console.log("OAuth popup source contract verified");

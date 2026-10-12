import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const sql = readFileSync(new URL("../../docs/supabase/ac360-multiconsultor-v1.sql", import.meta.url), "utf8");
const tables = ["ac360_consultants", "ac360_consultant_assignments", "ac360_consulting_sessions", "ac360_consulting_plans", "ac360_consulting_tasks"];
for (const table of tables) {
  assert.ok(sql.includes(`alter table public.${table} enable row level security;`), `RLS missing: ${table}`);
  assert.match(sql, /revoke all on public\.ac360_consultants,[\s\S]*?public\.ac360_consulting_tasks from anon;/i, "Anon privilege revocation missing");
}
for (const policy of ["assignments_read","sessions_read","plans_read","tasks_read"]) {
  const start = sql.indexOf(`create policy ${policy} `);
  assert.ok(start >= 0, `Missing ${policy}`);
  const end = sql.indexOf(";", start);
  const body = sql.slice(start,end);
  assert.match(body, /public\.is_platform_admin\(\)/, `Admin condition missing: ${policy}`);
  assert.match(body, /c\.status = 'active'/, `Inactive consultant must not read: ${policy}`);
  assert.match(body, /auth\.uid\(\)/, `Authenticated consultant check missing: ${policy}`);
}
assert.ok(!/using\s*\(\s*true\s*\)/i.test(sql), "Unrestricted row reads detected");
assert.match(sql, /company_display_name text not null/, "Assigned company label must exist");
const portfolio = readFileSync(new URL("../../src/routes/consultoria/carteira.tsx", import.meta.url), "utf8");
assert.match(portfolio, /company_display_name/, "Portfolio must display assigned company label");
assert.doesNotMatch(portfolio, /from\(["']companies["']\)/, "Consultant portfolio must not query the company directory");
console.log("AC360 consulting SQL access contract checks passed");

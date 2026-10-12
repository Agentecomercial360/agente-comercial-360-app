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
for (const policy of ["consultants_admin_insert", "consultants_admin_update", "assignments_admin_insert", "assignments_admin_update"]) {
  const start = sql.indexOf(`create policy ${policy} `);
  assert.ok(start >= 0, `Missing restricted administrative policy ${policy}`);
  const end = sql.indexOf(";", start);
  const body = sql.slice(start, end);
  assert.match(body, /public\.is_platform_admin\(\)/, `Admin authorization required for ${policy}`);
  assert.doesNotMatch(body, /using\s*\(\s*true\s*\)|with check\s*\(\s*true\s*\)/i, `Unrestricted admin write ${policy}`);
}
for (const policy of ["sessions_insert", "sessions_update", "plans_insert", "plans_update", "tasks_insert", "tasks_update"]) {
  const start = sql.indexOf(`create policy ${policy} `);
  assert.ok(start >= 0, `Missing consultant write policy ${policy}`);
  const end = sql.indexOf(";", start);
  const body = sql.slice(start, end);
  assert.match(body, /c\.status = 'active'/, `Inactive consultants cannot modify records: ${policy}`);
  assert.match(body, /auth\.uid\(\)/, `Writer must be bound to authenticated consultant: ${policy}`);
  assert.match(body, /with check\s*\(/, `New values must pass tenant authorization: ${policy}`);
}
const roster = readFileSync(new URL("../../src/routes/admin/consultores.tsx", import.meta.url), "utf8");
assert.match(roster, /from\(["']ecommerce_accounts["']\)/, "Consultants must only be assigned to ecommerce customers");
assert.match(roster, /company_display_name/, "Assignment must store a safe display name");
assert.match(sql, /create trigger ac360_validate_ecommerce_assignment_trigger/, "Database must enforce ecommerce-only assignments");
assert.match(sql, /from public\.ecommerce_accounts ea/, "Assignment trigger must verify ecommerce registration");
assert.match(sql, /before insert or update of company_id/, "Assignment trigger must cover inserts and company reassignment");
assert.match(sql, /returns trigger language plpgsql set search_path = '' as \$ac360\$[\s\S]*?end;\s*\$ac360\$;/, "Trigger body must have valid paired SQL dollar delimiters");
assert.doesNotMatch(sql, /as \$\n/, "Bare dollar sign is not a valid PL/pgSQL delimiter");
console.log("AC360 consulting SQL access contract checks passed");

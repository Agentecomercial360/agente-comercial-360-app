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
assert.match(sql, /before insert or update on public\.ac360_consultant_assignments/, "Assignment trigger must check every modification");
assert.match(sql, /old\.active = false and new\.active = true/, "Closed assignments cannot reactivate");
assert.match(sql, /c\.id = new\.consultant_id and c\.status = 'active'/, "Assignments must target active consultants");
assert.match(sql, /returns trigger language plpgsql security definer set search_path = '' as \$ac360\$[\s\S]*?end;\s*\$ac360\$;/, "Trigger body must have valid paired SQL dollar delimiters");
assert.doesNotMatch(sql, /as \$\n/, "Bare dollar sign is not a valid PL/pgSQL delimiter");
assert.match(sql, /returns trigger language plpgsql security definer set search_path = ''/, "Trigger needs controlled privileges to check ecommerce account eligibility");
assert.match(sql, /if not public\.is_platform_admin\(\) then/, "Privileged trigger must verify administrator identity");
assert.match(sql, /revoke all on function public\.ac360_validate_ecommerce_assignment\(\) from public, anon, authenticated/, "Trigger must not expose direct execution");
for (const trigger of ["ac360_meeting_preserve_parent", "ac360_plan_preserve_parent", "ac360_task_preserve_parent"]) {
  assert.ok(sql.includes(`create trigger ${trigger}`), `Missing immutable history safeguard: ${trigger}`);
}
assert.match(sql, /new\.assignment_id is distinct from old\.assignment_id/, "Prevent reassignment of meetings/plans");
assert.match(sql, /new\.plan_id is distinct from old\.plan_id/, "Prevent moving tasks across plans");
const assignmentRead = sql.match(/create policy assignments_read[\s\S]*?create policy assignments_admin_insert/)?.[0] ?? "";
assert.match(assignmentRead, /active = true/, "Closed assignments must not remain visible to former consultants");
assert.match(roster, /update\(\{ status: nextStatus \}\)/, "Administrator needs status-management operation");
assert.match(roster, /nextStatus === "inactive"/, "Consultant deactivation must be explicit");
console.log("AC360 consulting SQL access contract checks passed");

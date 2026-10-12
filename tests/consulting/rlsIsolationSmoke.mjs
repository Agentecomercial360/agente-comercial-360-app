// Run only against an isolated Supabase project populated with synthetic fixtures.
// Required env: AC360_RLS_TEST_URL, AC360_RLS_TEST_ANON_KEY,
// AC360_RLS_TEST_A_EMAIL, AC360_RLS_TEST_A_PASSWORD,
// AC360_RLS_TEST_B_EMAIL, AC360_RLS_TEST_B_PASSWORD,
// AC360_RLS_TEST_A_ASSIGNMENT_ID, AC360_RLS_TEST_B_ASSIGNMENT_ID.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const env = process.env;
const required = [
  "AC360_RLS_TEST_URL", "AC360_RLS_TEST_ANON_KEY",
  "AC360_RLS_TEST_A_EMAIL", "AC360_RLS_TEST_A_PASSWORD",
  "AC360_RLS_TEST_B_EMAIL", "AC360_RLS_TEST_B_PASSWORD",
  "AC360_RLS_TEST_A_ASSIGNMENT_ID", "AC360_RLS_TEST_B_ASSIGNMENT_ID",
];
for (const name of required) assert.ok(env[name], `Missing ${name}`);
const url = new URL(env.AC360_RLS_TEST_URL);
assert.equal(url.protocol, "https:");
assert.ok(url.hostname.endsWith(".supabase.co"), "Test URL must be a Supabase host");
assert.notEqual(url.hostname, "dmwcbecihuxqzzjouevk.supabase.co", "Refusing production project");
assert.equal(env.AC360_RLS_TEST_ISOLATED, "YES", "Explicitly acknowledge isolated synthetic test data");
assert.notEqual(env.AC360_RLS_TEST_A_ASSIGNMENT_ID, env.AC360_RLS_TEST_B_ASSIGNMENT_ID);

function client() {
  return createClient(url.origin, env.AC360_RLS_TEST_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}
async function login(email, password) {
  const db = client();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  assert.ok(data.user?.id);
  return db;
}
async function read(db, table, column, id) {
  const { data, error } = await db.from(table).select("id").eq(column, id);
  assert.ifError(error);
  return data ?? [];
}
async function exercise(db, own, foreign, label) {
  const ownRows = await read(db, "ac360_consultant_assignments", "id", own);
  assert.equal(ownRows.length, 1, `${label}: must see own assignment`);
  const foreignRows = await read(db, "ac360_consultant_assignments", "id", foreign);
  assert.equal(foreignRows.length, 0, `${label}: must not see foreign assignment`);
  const [sessions, plans] = await Promise.all([
    read(db, "ac360_consulting_sessions", "assignment_id", foreign),
    read(db, "ac360_consulting_plans", "assignment_id", foreign),
  ]);
  assert.equal(sessions.length, 0, `${label}: foreign sessions exposed`);
  assert.equal(plans.length, 0, `${label}: foreign plans exposed`);
  // Expected-denial writes operate only on isolated synthetic fixtures.
  // If a policy unexpectedly allows an insert, remove the inserted test row and fail.
  const forbiddenWrites = [
    { table: "ac360_consulting_sessions", row: { assignment_id: foreign, scheduled_at: new Date(Date.now() + 86400000).toISOString(), summary: "AC360 isolated authorization test" } },
    { table: "ac360_consulting_plans", row: { assignment_id: foreign, title: "AC360 cross-tenant RLS negative test" } },
  ];
  for (const check of forbiddenWrites) {
    const { data: inserted, error: insertError } = await db.from(check.table).insert(check.row).select("id");
    if (!insertError && inserted?.length) {
      const cleanup = await db.from(check.table).delete().eq("id", inserted[0].id);
      throw new Error(`${label}: SECURITY FAILURE: cross-tenant insert allowed in ${check.table}. Cleanup error: ${cleanup.error?.message ?? "none"}`);
    }
    assert.ok(insertError, `${label}: cross-tenant insert unexpectedly succeeded in ${check.table}`);
  }
  console.log(`${label}: assignment and child-table cross-tenant reads denied`);
}
const a = await login(env.AC360_RLS_TEST_A_EMAIL, env.AC360_RLS_TEST_A_PASSWORD);
const b = await login(env.AC360_RLS_TEST_B_EMAIL, env.AC360_RLS_TEST_B_PASSWORD);
await exercise(a, env.AC360_RLS_TEST_A_ASSIGNMENT_ID, env.AC360_RLS_TEST_B_ASSIGNMENT_ID, "Consultant A");
await exercise(b, env.AC360_RLS_TEST_B_ASSIGNMENT_ID, env.AC360_RLS_TEST_A_ASSIGNMENT_ID, "Consultant B");
const anonymous = client();
for (const table of ["ac360_consultants", "ac360_consultant_assignments", "ac360_consulting_sessions", "ac360_consulting_plans", "ac360_consulting_tasks"]) {
  const { data, error } = await anonymous.from(table).select("id").limit(1);
  assert.ok(error || (data?.length ?? 0) === 0, `Anonymous access exposed ${table}`);
}
console.log("PASS: RLS read isolation + cross-tenant INSERT denial (not a complete write/revocation test)");

// Run only against an isolated Supabase project populated with synthetic fixtures.
// Required env: AC360_RLS_TEST_URL, AC360_RLS_TEST_ANON_KEY,
// AC360_RLS_TEST_ADMIN_EMAIL, AC360_RLS_TEST_ADMIN_PASSWORD,
// AC360_RLS_TEST_A_EMAIL, AC360_RLS_TEST_A_PASSWORD,
// AC360_RLS_TEST_B_EMAIL, AC360_RLS_TEST_B_PASSWORD,
// AC360_RLS_TEST_A_ASSIGNMENT_ID, AC360_RLS_TEST_B_ASSIGNMENT_ID.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const env = process.env;
const required = [
  "AC360_RLS_TEST_URL", "AC360_RLS_TEST_ANON_KEY", "AC360_RLS_TEST_PROJECT_REF",
  "AC360_RLS_TEST_ADMIN_EMAIL", "AC360_RLS_TEST_ADMIN_PASSWORD",
  "AC360_RLS_TEST_A_EMAIL", "AC360_RLS_TEST_A_PASSWORD",
  "AC360_RLS_TEST_B_EMAIL", "AC360_RLS_TEST_B_PASSWORD",
  "AC360_RLS_TEST_A_ASSIGNMENT_ID", "AC360_RLS_TEST_B_ASSIGNMENT_ID",
];
for (const name of required) assert.ok(env[name], `Missing ${name}`);
const url = new URL(env.AC360_RLS_TEST_URL);
assert.equal(url.protocol, "https:");
assert.ok(url.hostname.endsWith(".supabase.co"), "Test URL must be a Supabase host");
assert.notEqual(url.hostname, "dmwcbecihuxqzzjouevk.supabase.co", "Refusing production project");
assert.notEqual(env.AC360_RLS_TEST_PROJECT_REF, "dmwcbecihuxqzzjouevk", "Production reference forbidden");
assert.equal(url.hostname, `${env.AC360_RLS_TEST_PROJECT_REF}.supabase.co`, "Test project reference must match the configured host");
assert.match(url.hostname, /^[a-z0-9-]+\.supabase\.co$/, "Test hostname must be an exact Supabase project host");
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
async function exercise(db, admin, own, foreign, label) {
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
  // A successful forbidden insert is a critical failure; clean up in the isolated test project.
  const forbiddenWrites = [
    { table: "ac360_consulting_sessions", row: { assignment_id: foreign, scheduled_at: new Date(Date.now() + 86400000).toISOString(), summary: "AC360 isolated authorization test" } },
    { table: "ac360_consulting_plans", row: { assignment_id: foreign, title: "AC360 cross-tenant RLS negative test" } },
  ];
  for (const check of forbiddenWrites) {
    const { error: insertError } = await db.from(check.table).insert(check.row);
    assert.ok(insertError, `${label}: SECURITY FAILURE: cross-tenant insert was accepted by ${check.table}. Inspect and clean up isolated fixtures.`);

  }
  // Foreign assignment mutations must affect zero rows or be rejected.
  // Executed exclusively on synthetic data in the isolated test project.
  const attemptedName = `BLOCKED-RLS-TEST-${label.replaceAll(" ", "-")}`;
  const { data: baseline, error: baselineError } = await admin
    .from("ac360_consultant_assignments").select("company_display_name").eq("id", foreign).single();
  assert.ifError(baselineError);
  const { error: updateError } = await db
    .from("ac360_consultant_assignments").update({ company_display_name: attemptedName }).eq("id", foreign);
  const { data: after, error: afterError } = await admin
    .from("ac360_consultant_assignments").select("company_display_name").eq("id", foreign).single();
  assert.ifError(afterError);
  assert.equal(after.company_display_name, baseline.company_display_name,
    `${label}: SECURITY FAILURE: foreign assignment was modified. Restore synthetic fixture.`);
  if (!updateError) console.log(`${label}: forbidden UPDATE returned no error but admin verified zero mutation`);
  console.log(`${label}: assignment and child-table cross-tenant reads denied`);
}
const admin = await login(env.AC360_RLS_TEST_ADMIN_EMAIL, env.AC360_RLS_TEST_ADMIN_PASSWORD);
const a = await login(env.AC360_RLS_TEST_A_EMAIL, env.AC360_RLS_TEST_A_PASSWORD);
const b = await login(env.AC360_RLS_TEST_B_EMAIL, env.AC360_RLS_TEST_B_PASSWORD);
const [{ data: adminIdentity }, { data: aIdentity }, { data: bIdentity }] = await Promise.all([admin.auth.getUser(), a.auth.getUser(), b.auth.getUser()]);
assert.ok(adminIdentity.user && adminIdentity.user.id !== aIdentity.user?.id && adminIdentity.user.id !== bIdentity.user?.id,
  "Administrative test identity must be distinct from consultant identities");
const { data: adminVisible, error: adminVisibilityError } = await admin
  .from("ac360_consultant_assignments")
  .select("id")
  .in("id", [env.AC360_RLS_TEST_A_ASSIGNMENT_ID, env.AC360_RLS_TEST_B_ASSIGNMENT_ID]);
assert.ifError(adminVisibilityError);
assert.equal(adminVisible?.length, 2, "Test administrator must see BOTH synthetic assignments");

assert.ok(aIdentity.user && bIdentity.user && aIdentity.user.id !== bIdentity.user.id, "Consultants A and B must be distinct authenticated users");
await exercise(a, admin, env.AC360_RLS_TEST_A_ASSIGNMENT_ID, env.AC360_RLS_TEST_B_ASSIGNMENT_ID, "Consultant A");
await exercise(b, admin, env.AC360_RLS_TEST_B_ASSIGNMENT_ID, env.AC360_RLS_TEST_A_ASSIGNMENT_ID, "Consultant B");
const anonymous = client();
for (const table of ["ac360_consultants", "ac360_consultant_assignments", "ac360_consulting_sessions", "ac360_consulting_plans", "ac360_consulting_tasks"]) {
  const { data, error } = await anonymous.from(table).select("id").limit(1);
  assert.ok(error || (data?.length ?? 0) === 0, `Anonymous access exposed ${table}`);
}
console.log("PASS: RLS read isolation + cross-tenant INSERT denial (not a complete write/revocation test)");

import { createClient } from "npm:@supabase/supabase-js@2.106.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function adminClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error("Supabase service credentials unavailable.");
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type SyncState = {
  account_id: string;
  capability: string;
  resource_key: string;
  next_due_at: string | null;
  status: string;
};

type Account = {
  id: string;
  company_id: string;
  account_name: string | null;
  nickname: string | null;
};

type Listing = {
  id: string;
  account_id: string;
};

function due(state: SyncState | undefined): boolean {
  if (!state?.next_due_at) return true;
  return new Date(state.next_due_at).getTime() <= Date.now();
}

async function invokeIntelligence(
  body: Record<string, unknown>,
  schedulerSecret: string,
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/ml-marketplace-intelligence`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ac360-cron-secret": schedulerSecret,
      },
      body: JSON.stringify(body),
    },
  );

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  return { ok: res.ok, status: res.status, data };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const candidate = req.headers.get("x-ac360-cron-secret") ?? "";
  if (!candidate) return json(401, { error: "Scheduler secret required" });

  const admin = adminClient();

  const { data: verified, error: verifyError } = await admin.rpc(
    "verify_ac360_scheduler_secret",
    { candidate },
  );
  if (verifyError || verified !== true) {
    return json(401, { error: "Invalid scheduler secret" });
  }

  const { data: accounts, error: accountsError } = await admin
    .from("ecommerce_accounts")
    .select("id,company_id,account_name,nickname")
    .eq("marketplace", "mercado_livre")
    .eq("is_active", true)
    .eq("auth_status", "connected");

  if (accountsError) return json(500, { error: accountsError.message });

  const accountRows = (accounts ?? []) as Account[];
  if (!accountRows.length) {
    return json(200, { status: "success", accounts: 0, executions: [] });
  }

  const accountIds = accountRows.map((a) => a.id);

  const [{ data: states, error: stateError }, { data: listings, error: listingError }] =
    await Promise.all([
      admin
        .from("ecommerce_marketplace_sync_state")
        .select("account_id,capability,resource_key,next_due_at,status")
        .in("account_id", accountIds)
        .limit(10000),
      admin
        .from("ecommerce_listings")
        .select("id,account_id")
        .in("account_id", accountIds)
        .eq("is_active", true)
        .not("ml_item_id", "is", null)
        .limit(10000),
    ]);

  if (stateError) return json(500, { error: stateError.message });
  if (listingError) return json(500, { error: listingError.message });

  const stateRows = (states ?? []) as SyncState[];
  const listingRows = (listings ?? []) as Listing[];
  const stateMap = new Map(
    stateRows.map((s) => [
      [s.account_id, s.capability, s.resource_key].join("|"),
      s,
    ]),
  );

  const executions: Array<Record<string, unknown>> = [];

  async function execute(
    account: Account,
    body: Record<string, unknown>,
    label: string,
  ) {
    const started = Date.now();
    const result = await invokeIntelligence(
      {
        company_id: account.company_id,
        account_id: account.id,
        ...body,
      },
      candidate,
    );

    executions.push({
      account_id: account.id,
      account: account.account_name || account.nickname || account.id,
      label,
      ok: result.ok,
      http_status: result.status,
      duration_ms: Date.now() - started,
      error: result.ok ? null : result.data?.error || result.data?.message || null,
    });
  }

  for (const account of accountRows) {
    for (const days of [1, 7, 30, 90]) {
      const key = [account.id, "ads", `period:${days}`].join("|");
      if (due(stateMap.get(key))) {
        await execute(account, { action: "ads_sync", days }, `ads_${days}d`);
      }
    }

    const radarKey = [account.id, "market_radar", "account"].join("|");
    if (due(stateMap.get(radarKey))) {
      await execute(account, { action: "market_radar_sync" }, "market_radar");
    }

    const accountListings = listingRows
      .filter((l) => l.account_id === account.id)
      .filter((l) => {
        const key = [account.id, "competition", l.id].join("|");
        return due(stateMap.get(key));
      })
      .slice(0, 25);

    for (const listing of accountListings) {
      await execute(
        account,
        { action: "competition_sync", listing_id: listing.id },
        `competition:${listing.id}`,
      );
    }
  }

  return json(200, {
    status: "success",
    accounts: accountRows.length,
    executions,
    succeeded: executions.filter((e) => e.ok === true).length,
    failed: executions.filter((e) => e.ok === false).length,
  });
});

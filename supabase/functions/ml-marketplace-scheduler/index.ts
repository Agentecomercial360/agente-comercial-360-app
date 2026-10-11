import { createClient } from "npm:@supabase/supabase-js@2.106.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RAILWAY_REFRESH_URL =
  "https://ac360-mercadolivre-api-production.up.railway.app/api/ecommerce/mercadolivre/token-refresh-internal";

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
  ml_item_id: string;
};

type Integration = {
  account_id: string;
  expires_at: string | null;
  integration_status: string | null;
  updated_at: string | null;
};

function due(state: SyncState | undefined): boolean {
  if (!state?.next_due_at) return true;
  return new Date(state.next_due_at).getTime() <= Date.now();
}

async function refreshMercadoLivreToken(
  account: Account,
  schedulerSecret: string,
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(RAILWAY_REFRESH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-ac360-cron-secret": schedulerSecret,
    },
    body: JSON.stringify({
      company_id: account.company_id,
      account_id: account.id,
    }),
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 500) };
  }

  return {
    ok: res.ok,
    status: res.status,
    data,
  };
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

  const [
    { data: states, error: stateError },
    { data: listings, error: listingError },
    { data: integrations, error: integrationError },
  ] = await Promise.all([
    admin
      .from("ecommerce_marketplace_sync_state")
      .select("account_id,capability,resource_key,next_due_at,status")
      .in("account_id", accountIds)
      .limit(10000),
    admin
      .from("ecommerce_listings")
      .select("id,account_id,ml_item_id")
      .in("account_id", accountIds)
      .eq("is_active", true)
      .not("ml_item_id", "is", null)
      .limit(10000),
    admin
      .from("ecommerce_integrations")
      .select("account_id,expires_at,integration_status,updated_at")
      .in("account_id", accountIds)
      .eq("marketplace", "mercado_livre")
      .order("updated_at", { ascending: false })
      .limit(10000),
  ]);

  if (stateError) return json(500, { error: stateError.message });
  if (listingError) return json(500, { error: listingError.message });
  if (integrationError) return json(500, { error: integrationError.message });

  const stateRows = (states ?? []) as SyncState[];
  const listingRows = (listings ?? []) as Listing[];
  const integrationRows = (integrations ?? []) as Integration[];
  const latestIntegrationByAccount = new Map<string, Integration>();
  for (const integration of integrationRows) {
    if (!latestIntegrationByAccount.has(integration.account_id)) {
      latestIntegrationByAccount.set(integration.account_id, integration);
    }
  }
  const stateMap = new Map(
    stateRows.map((s) => [
      [s.account_id, s.capability, s.resource_key].join("|"),
      s,
    ]),
  );

  const executions: Array<Record<string, unknown>> = [];
  const MAX_EXECUTIONS = 24;
  const MAX_COMPETITION_PER_ACCOUNT = 3;

  async function execute(
    account: Account,
    body: Record<string, unknown>,
    label: string,
  ) {
    if (executions.length >= MAX_EXECUTIONS) return false;
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
    return true;
  }

  const readyAccounts: Account[] = [];

  // Phase 1: authentication first. This prevents Ads/Radar/competition
  // from consuming the workload budget before every account gets a
  // chance to renew its Mercado Livre token.
  for (const account of accountRows) {
    const integration = latestIntegrationByAccount.get(account.id);
    let effectiveExpiresAt = integration?.expires_at ?? null;
    let tokenValid = effectiveExpiresAt
      ? new Date(effectiveExpiresAt).getTime() > Date.now() + 2 * 60_000
      : false;
    let refreshResult: { ok: boolean; status: number; data: any } | null = null;

    if (integration && !tokenValid) {
      const started = Date.now();
      refreshResult = await refreshMercadoLivreToken(account, candidate);
      const refreshedExpiresAt =
        refreshResult.data?.summary?.new_expires_at ?? null;

      tokenValid =
        refreshResult.ok &&
        Boolean(refreshedExpiresAt) &&
        new Date(refreshedExpiresAt).getTime() > Date.now() + 2 * 60_000;

      if (tokenValid) {
        effectiveExpiresAt = refreshedExpiresAt;
      }

      executions.push({
        account_id: account.id,
        account: account.account_name || account.nickname || account.id,
        label: "auth_refresh",
        ok: refreshResult.ok && tokenValid,
        http_status: refreshResult.status,
        duration_ms: Date.now() - started,
        error:
          refreshResult.ok && tokenValid
            ? null
            : refreshResult.data?.error ||
              "O refresh interno não retornou um token válido.",
      });
    }

    if (!integration || !tokenValid) {
      const message = !integration
        ? "Integração Mercado Livre não encontrada. Reconecte a conta para liberar a automação 24/7."
        : refreshResult?.data?.error ||
          "Não foi possível renovar automaticamente o token Mercado Livre. Reconecte a conta.";

      await admin
        .from("ecommerce_marketplace_sync_state")
        .upsert(
          {
            company_id: account.company_id,
            account_id: account.id,
            capability: "auth",
            resource_key: "account",
            status: "error",
            last_attempt_at: new Date().toISOString(),
            next_due_at: new Date(Date.now() + 15 * 60_000).toISOString(),
            last_error_message: message,
            last_result: {
              integration_status: integration?.integration_status ?? null,
              expires_at: integration?.expires_at ?? null,
              refresh_http_status: refreshResult?.status ?? null,
              refresh_attempted: Boolean(refreshResult),
            },
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "company_id,account_id,capability,resource_key",
          },
        );

      if (!refreshResult) {
        executions.push({
          account_id: account.id,
          account: account.account_name || account.nickname || account.id,
          label: "auth",
          ok: false,
          skipped: true,
          error: message,
        });
      }
      continue;
    }

    await admin
      .from("ecommerce_marketplace_sync_state")
      .upsert(
        {
          company_id: account.company_id,
          account_id: account.id,
          capability: "auth",
          resource_key: "account",
          status: "success",
          last_attempt_at: new Date().toISOString(),
          last_success_at: new Date().toISOString(),
          next_due_at: new Date(Date.now() + 30 * 60_000).toISOString(),
          last_error_message: null,
          last_result: {
            integration_status: integration.integration_status,
            expires_at: effectiveExpiresAt,
            refreshed_automatically: Boolean(refreshResult?.ok),
          },
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "company_id,account_id,capability,resource_key",
        },
      );

    readyAccounts.push(account);
  }

  // Phase 2: only accounts with valid auth can spend the intelligence
  // workload budget.
  for (const account of readyAccounts) {
    if (executions.length >= MAX_EXECUTIONS) break;

    for (const days of [1, 7, 30, 90]) {
      if (executions.length >= MAX_EXECUTIONS) break;
      const key = [account.id, "ads", `period:${days}`].join("|");
      if (due(stateMap.get(key))) {
        await execute(account, { action: "ads_sync", days }, `ads_${days}d`);
      }
    }

    const radarKey = [account.id, "market_radar", "account"].join("|");
    if (
      executions.length < MAX_EXECUTIONS &&
      due(stateMap.get(radarKey))
    ) {
      await execute(account, { action: "market_radar_sync" }, "market_radar");
    }

    const accountListings = listingRows
      .filter((l) => l.account_id === account.id)
      .filter((l) => /^ML[A-Z]\d+$/i.test(l.ml_item_id))
      .filter((l) => {
        const key = [account.id, "competition", l.id].join("|");
        return due(stateMap.get(key));
      })
      .slice(0, MAX_COMPETITION_PER_ACCOUNT);

    for (const listing of accountListings) {
      if (executions.length >= MAX_EXECUTIONS) break;
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
    failed: executions.filter((e) => e.ok === false && e.skipped !== true).length,
    skipped: executions.filter((e) => e.skipped === true).length,
    max_executions_per_tick: MAX_EXECUTIONS,
    max_competition_per_account: MAX_COMPETITION_PER_ACCOUNT,
    truncated: executions.length >= MAX_EXECUTIONS,
  });
});

import { supabase } from "@/lib/supabase";

const ML_API_BASE =
  "https://ac360-mercadolivre-api-production.up.railway.app";

type OAuthStartOptions = {
  companyId: string;
  accountId: string;
  timeoutMs?: number;
};

type AuthUrlResponse = {
  authorization_url?: string;
  message?: string;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function isMercadoLivreConnected(
  companyId: string,
  accountId: string,
): Promise<boolean> {
  const [{ data: integration, error: integrationError }, { data: account, error: accountError }] =
    await Promise.all([
      supabase
        .from("ecommerce_integrations")
        .select("integration_status,expires_at,updated_at")
        .eq("company_id", companyId)
        .eq("account_id", accountId)
        .eq("marketplace", "mercado_livre")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("ecommerce_accounts")
        .select("auth_status")
        .eq("company_id", companyId)
        .eq("id", accountId)
        .maybeSingle(),
    ]);

  if (integrationError) throw new Error(integrationError.message);
  if (accountError) throw new Error(accountError.message);

  const expiresAt = integration?.expires_at
    ? new Date(integration.expires_at).getTime()
    : 0;

  return (
    integration?.integration_status === "connected" &&
    account?.auth_status === "connected" &&
    expiresAt > Date.now() + 60_000
  );
}

export async function startMercadoLivreOAuth({
  companyId,
  accountId,
  timeoutMs = 120_000,
}: OAuthStartOptions): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("A conexão Mercado Livre precisa ser iniciada no navegador.");
  }

  // Open synchronously from the click event to avoid popup blockers.
  const popup = window.open(
    "about:blank",
    "ac360-mercadolivre-oauth",
    "popup=yes,width=560,height=760,left=160,top=80",
  );

  if (!popup) {
    throw new Error(
      "O navegador bloqueou a janela do Mercado Livre. Libere pop-ups para o AC360 e tente novamente.",
    );
  }

  popup.document.title = "Conectando Mercado Livre…";
  popup.document.body.innerHTML =
    '<div style="font-family:Arial,sans-serif;padding:32px;color:#0f172a">Preparando conexão segura com o Mercado Livre…</div>';

  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) throw new Error(sessionError.message);

    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      throw new Error("Sua sessão do AC360 expirou. Entre novamente e tente conectar.");
    }

    const query = new URLSearchParams({
      company_id: companyId,
      account_id: accountId,
    });

    const response = await fetch(
      `${ML_API_BASE}/api/mercadolivre/auth-url?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      },
    );

    const payload = (await response.json().catch(() => ({}))) as AuthUrlResponse;

    if (!response.ok || !payload.authorization_url) {
      throw new Error(
        payload.message ||
          "Não foi possível iniciar a autorização do Mercado Livre.",
      );
    }

    popup.location.href = payload.authorization_url;

    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      if (popup.closed) {
        throw new Error(
          "A janela de autorização foi fechada antes da conexão terminar.",
        );
      }

      try {
        if (await isMercadoLivreConnected(companyId, accountId)) {
          popup.close();
          window.dispatchEvent(
            new CustomEvent("ac360-mercadolivre-auth-changed", {
              detail: { account_id: accountId },
            }),
          );
          window.dispatchEvent(
            new CustomEvent("ac360-marketplace-synced", {
              detail: { action: "auth", account_id: accountId },
            }),
          );
          return;
        }
      } catch (pollError) {
        console.warn("mercadolivre oauth poll", pollError);
      }

      await wait(1_500);
    }

    throw new Error(
      "A autorização demorou mais que o esperado. Verifique a conta e tente novamente.",
    );
  } catch (error) {
    if (!popup.closed) popup.close();
    throw error;
  }
}

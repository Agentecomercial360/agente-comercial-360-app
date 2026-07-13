import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { useEcommerceActiveAccount } from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/debug/competition-api")({
  component: DebugCompetitionApiRoute,
});

const API_BASE = "https://ac360-mercadolivre-api-production.up.railway.app";

type SessionState = "checking" | "authenticated" | "missing";

type EcommerceAccountContextRow = {
  id: string;
  company_id: string | null;
  account_name: string | null;
  marketplace: string | null;
  auth_status: string | null;
  is_active: boolean | null;
};

type AccountContextState =
  | { status: "idle"; account: null; companyName: null; error: null }
  | { status: "loading"; account: null; companyName: null; error: null }
  | { status: "missing"; account: null; companyName: null; error: null }
  | { status: "error"; account: null; companyName: null; error: string }
  | {
      status: "ready";
      account: EcommerceAccountContextRow;
      companyName: string | null;
      error: null;
    };

type RunResult = {
  httpStatus: number | null;
  durationMs: number;
  body: string;
  interpretation: string;
  networkError?: string;
};

function interpretStatus(status: number | null, networkError?: string): string {
  if (networkError) return "Frontend não conseguiu alcançar o backend.";
  if (status === 200) return "Autenticação e consulta funcionando corretamente.";
  if (status === 401) return "Token ausente, inválido ou expirado.";
  if (status === 403)
    return "Usuário autenticado, mas sem permissão para esta empresa ou conta.";
  if (status === 500) return "Erro interno no backend ou na consulta ao banco.";
  return `Resposta HTTP ${status ?? "desconhecida"}.`;
}

function formatMarketplace(value: string | null): string {
  const normalized = (value ?? "").toLowerCase().replace(/[\s-]/g, "_");
  if (normalized === "mercado_livre" || normalized === "mercadolivre" || normalized === "ml") {
    return "Mercado Livre";
  }
  return value || "—";
}

function formatAuthStatus(value: string | null): string {
  const normalized = (value ?? "").toLowerCase();
  if (["connected", "conectada", "conectado", "active", "ativa", "ativo"].includes(normalized)) {
    return "Conectada";
  }
  if (!value) return "—";
  return value;
}

function DebugCompetitionApiRoute() {
  return (
    <EcommerceLayout>
      <DebugCompetitionApiPage />
    </EcommerceLayout>
  );
}

function DebugCompetitionApiPage() {
  const { activeAccount, activeAccountId, loading } = useEcommerceActiveAccount();
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [accountContext, setAccountContext] = useState<AccountContextState>({
    status: "idle",
    account: null,
    companyName: null,
    error: null,
  });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSessionState(data.session ? "authenticated" : "missing");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const accountIdFromHeader = activeAccountId ?? activeAccount?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    if (loading) {
      setAccountContext({ status: "loading", account: null, companyName: null, error: null });
      setResult(null);
      return () => {
        cancelled = true;
      };
    }

    if (!accountIdFromHeader) {
      setAccountContext({ status: "missing", account: null, companyName: null, error: null });
      setResult(null);
      return () => {
        cancelled = true;
      };
    }

    setAccountContext({ status: "loading", account: null, companyName: null, error: null });
    setResult(null);

    (async () => {
      const { data: accountData, error: accountError } = await supabase
        .from("ecommerce_accounts")
        .select("id, company_id, account_name, marketplace, auth_status, is_active")
        .eq("id", accountIdFromHeader)
        .maybeSingle();

      if (cancelled) return;

      if (accountError) {
        setAccountContext({
          status: "error",
          account: null,
          companyName: null,
          error: accountError.message,
        });
        return;
      }

      if (!accountData) {
        setAccountContext({ status: "missing", account: null, companyName: null, error: null });
        return;
      }

      const account = accountData as EcommerceAccountContextRow;

      if (!account.company_id) {
        setAccountContext({
          status: "ready",
          account,
          companyName: null,
          error: null,
        });
        return;
      }

      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("name")
        .eq("id", account.company_id)
        .maybeSingle();

      if (cancelled) return;

      if (companyError) {
        setAccountContext({
          status: "error",
          account: null,
          companyName: null,
          error: companyError.message,
        });
        return;
      }

      setAccountContext({
        status: "ready",
        account,
        companyName: (companyData as { name?: string | null } | null)?.name ?? null,
        error: null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [accountIdFromHeader, loading]);

  const account = accountContext.status === "ready" ? accountContext.account : null;
  const companyId = account?.company_id ?? null;
  const companyName = accountContext.status === "ready" ? accountContext.companyName : null;
  const accountId = account?.id ?? null;
  const accountName = account?.account_name ?? "—";
  const hasConsistentContext =
    !!accountIdFromHeader &&
    account?.id === accountIdFromHeader &&
    !!accountId &&
    !!companyId &&
    !!companyName;
  const url = useMemo(() => {
    if (!hasConsistentContext) return null;
    const params = new URLSearchParams({
      company_id: companyId,
      account_id: accountId,
    });
    return `${API_BASE}/api/mercadolivre/competition/history?${params.toString()}`;
  }, [accountId, companyId, hasConsistentContext]);
  const canRunTest = sessionState === "authenticated" && hasConsistentContext && !!url;

  async function runTest() {
    if (running) return;
    setRunning(true);
    setResult(null);
    const started = performance.now();
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) {
        setSessionState("missing");
        setResult({
          httpStatus: null,
          durationMs: 0,
          body: "",
          interpretation: "Sessão autenticada não encontrada. Faça login novamente.",
        });
        return;
      }
      if (!canRunTest || !url) {
        setResult({
          httpStatus: null,
          durationMs: 0,
          body: "",
          interpretation: "Contexto E-commerce incompleto. Selecione uma conta ativa conectada.",
        });
        return;
      }
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const durationMs = Math.round(performance.now() - started);
      const text = await res.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        /* keep raw */
      }
      setResult({
        httpStatus: res.status,
        durationMs,
        body: pretty,
        interpretation: interpretStatus(res.status),
      });
    } catch (err) {
      const durationMs = Math.round(performance.now() - started);
      const msg = err instanceof Error ? err.message : String(err);
      setResult({
        httpStatus: null,
        durationMs,
        body: "",
        interpretation: interpretStatus(null, msg),
        networkError: msg,
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Diagnóstico da API de Concorrência
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Página técnica temporária. Testa a rota autenticada{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              GET /api/mercadolivre/competition/history
            </code>
          </p>
        </div>

        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Contexto
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs">Sessão</dt>
              <dd className="font-medium">
                {sessionState === "checking" && "Verificando…"}
                {sessionState === "authenticated" && (
                  <span className="text-emerald-600">Autenticada</span>
                )}
                {sessionState === "missing" && (
                  <span className="text-red-600">
                    Sessão autenticada não encontrada. Faça login novamente.
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Empresa</dt>
              <dd className="font-medium">
                {accountContext.status === "loading" ? "Carregando conta ativa..." : companyName ?? "—"}
              </dd>
              <dd className="text-xs text-muted-foreground font-mono break-all">
                {companyId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Conta ativa</dt>
              <dd className="font-medium">
                {accountContext.status === "loading" && "Carregando conta ativa..."}
                {accountContext.status === "missing" && "Nenhuma conta E-commerce ativa foi identificada."}
                {accountContext.status === "error" && "Não foi possível carregar o contexto E-commerce."}
                {accountContext.status === "idle" && "—"}
                {accountContext.status === "ready" && accountName}
              </dd>
              <dd className="text-xs text-muted-foreground font-mono break-all">
                {accountId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Marketplace</dt>
              <dd className="font-medium">{formatMarketplace(account?.marketplace ?? null)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Status</dt>
              <dd className="font-medium">
                {formatAuthStatus(account?.auth_status ?? null)}
                {account?.is_active === false ? " · Inativa" : ""}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground text-xs">URL</dt>
              <dd className="text-xs font-mono break-all bg-muted px-2 py-1.5 rounded">
                {url ?? "Aguardando contexto completo da conta ativa."}
              </dd>
            </div>
            {accountContext.status === "error" && (
              <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                {accountContext.error}
              </div>
            )}
          </dl>
        </section>

        <div>
          <button
            type="button"
            onClick={runTest}
            disabled={running || !canRunTest}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--gradient-brand)" }}
          >
            {running ? "Testando…" : "Testar rota autenticada"}
          </button>
        </div>

        {result && (
          <section className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Resultado
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">HTTP status</div>
                <div className="font-mono font-semibold">
                  {result.httpStatus ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Duração</div>
                <div className="font-mono font-semibold">{result.durationMs} ms</div>
              </div>
            </div>
            <div
              className={`rounded-lg p-3 text-sm ${
                result.httpStatus === 200
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              {result.interpretation}
            </div>
            {result.body && (
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-[420px] whitespace-pre-wrap break-all">
                {result.body}
              </pre>
            )}
            {result.networkError && (
              <div className="text-xs text-muted-foreground">
                Detalhe técnico: {result.networkError}
              </div>
            )}
          </section>
        )}
      </div>
  );
}

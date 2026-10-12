import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  Circle,
  Link2,
  Loader2,
  PackageSearch,
  Rocket,
  ShieldCheck,
  Store,
  WandSparkles,
} from "lucide-react";
import acLogo from "@/assets/ac-logo.png";
import { supabase } from "@/lib/supabase";
import { startMercadoLivreOAuth } from "@/lib/ml-oauth";
import { runSmartAccountSync } from "@/lib/ml-sync";

export const Route = createFileRoute("/ecommerce/onboarding")({
  component: EcommerceOnboardingPage,
  head: () => ({
    meta: [
      { title: "Primeiros passos | AC360 E-commerce" },
      {
        name: "description",
        content:
          "Configure sua empresa, conecte o Mercado Livre e inicie o AC360 E-commerce Intelligence.",
      },
    ],
  }),
});

type AccessContext = {
  company_id: string | null;
  company_name: string | null;
  has_ecommerce_access: boolean | null;
  user_name: string | null;
  user_email: string | null;
};

type AccountRow = {
  id: string;
  account_name: string | null;
  auth_status: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  ml_user_id: string | null;
};

type Stage = "company" | "account" | "authorization" | "sync" | "ready";

function EcommerceOnboardingPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [ctx, setCtx] = useState<AccessContext | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);

  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [accountName, setAccountName] = useState("Loja Principal");

  const [creatingCompany, setCreatingCompany] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadState() {
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      navigate({ to: "/ecommerce/login" });
      return;
    }

    const { data: access, error: accessError } = await supabase
      .from("vw_user_access_context")
      .select("company_id,company_name,has_ecommerce_access,user_name,user_email")
      .maybeSingle();

    if (accessError) {
      setError(accessError.message);
      setLoading(false);
      return;
    }

    const nextCtx = (access ?? {
      company_id: null,
      company_name: null,
      has_ecommerce_access: false,
      user_name: null,
      user_email: sessionData.session.user.email ?? null,
    }) as AccessContext;

    setCtx(nextCtx);
    if (!ownerName && nextCtx.user_name) setOwnerName(nextCtx.user_name);

    if (!nextCtx.company_id) {
      setAccounts([]);
      setOrdersCount(0);
      setLoading(false);
      return;
    }

    const [{ data: accountRows, error: accountError }, { count, error: ordersError }] =
      await Promise.all([
        supabase
          .from("ecommerce_accounts")
          .select("id,account_name,auth_status,is_active,last_sync_at,ml_user_id")
          .eq("company_id", nextCtx.company_id)
          .eq("marketplace", "mercado_livre")
          .eq("is_active", true)
          .order("created_at", { ascending: true }),
        supabase
          .from("ecommerce_orders")
          .select("id", { count: "exact", head: true })
          .eq("company_id", nextCtx.company_id),
      ]);

    if (accountError) setError(accountError.message);
    if (ordersError) console.warn("[onboarding orders count]", ordersError);

    setAccounts((accountRows ?? []) as AccountRow[]);
    setOrdersCount(count ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    void loadState();

    const handler = () => void loadState();
    window.addEventListener("ac360-mercadolivre-auth-changed", handler);
    window.addEventListener("ac360-marketplace-synced", handler);

    return () => {
      window.removeEventListener("ac360-mercadolivre-auth-changed", handler);
      window.removeEventListener("ac360-marketplace-synced", handler);
    };
  }, []);

  const connectedAccount = useMemo(
    () =>
      accounts.find(
        (account) =>
          account.auth_status === "connected" ||
          Boolean(account.ml_user_id) ||
          Boolean(account.last_sync_at),
      ) ?? null,
    [accounts],
  );

  const pendingAccount = useMemo(
    () => accounts.find((account) => account.auth_status !== "connected") ?? null,
    [accounts],
  );

  const stage: Stage = useMemo(() => {
    if (!ctx?.company_id) return "company";
    if (accounts.length === 0) return "account";
    if (!connectedAccount) return "authorization";
    if (!connectedAccount.last_sync_at && ordersCount === 0) return "sync";
    return "ready";
  }, [ctx?.company_id, accounts.length, connectedAccount, ordersCount]);

  async function handleCreateCompany() {
    const name = companyName.trim();
    if (name.length < 2) {
      setError("Informe o nome da empresa.");
      return;
    }

    setCreatingCompany(true);
    setError(null);

    try {
      const { error: rpcError } = await supabase.rpc(
        "create_ecommerce_onboarding_company_v1",
        {
          p_company_name: name,
          p_owner_name: ownerName.trim() || null,
        },
      );

      if (rpcError) throw rpcError;

      await loadState();
    } catch (e: any) {
      setError(e?.message || "Não foi possível criar a empresa.");
    } finally {
      setCreatingCompany(false);
    }
  }

  async function handleCreateAccount() {
    if (!ctx?.company_id) return;

    const name = accountName.trim();
    if (name.length < 2) {
      setError("Informe um nome para identificar sua conta Mercado Livre.");
      return;
    }

    setCreatingAccount(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("ecommerce_accounts")
        .insert({
          company_id: ctx.company_id,
          account_name: name,
          marketplace: "mercado_livre",
          auth_status: "not_connected",
          is_active: true,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      await loadState();
      await handleConnect(String(data.id));
    } catch (e: any) {
      setError(e?.message || "Não foi possível criar a conta Mercado Livre.");
    } finally {
      setCreatingAccount(false);
    }
  }

  async function handleConnect(accountId: string) {
    if (!ctx?.company_id) return;

    setConnectingId(accountId);
    setError(null);

    try {
      await startMercadoLivreOAuth({
        companyId: ctx.company_id,
        accountId,
      });
      await loadState();
    } catch (e: any) {
      setError(e?.message || "Não foi possível autorizar o Mercado Livre.");
    } finally {
      setConnectingId(null);
    }
  }

  async function handleInitialSync(accountId: string) {
    if (!ctx?.company_id) return;

    setSyncingId(accountId);
    setSyncMessage("Importando seus primeiros dados. Isso pode levar alguns minutos…");
    setError(null);

    try {
      const result = await runSmartAccountSync(accountId, {
        companyId: ctx.company_id,
        days: 30,
      });

      setSyncMessage(
        `Primeira sincronização concluída: ${result.orders_found} pedido(s), ${result.items_linked} item(ns) e ${result.products_created} produto(s) processados.`,
      );
      await loadState();
    } catch (e: any) {
      setError(
        e?.message ||
          "A sincronização inicial não terminou agora. O scheduler 24/7 continuará tentando automaticamente.",
      );
    } finally {
      setSyncingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-blue-700" />
          Preparando seu AC360…
        </div>
      </main>
    );
  }

  const steps = [
    { key: "company", label: "Empresa", icon: Building2 },
    { key: "account", label: "Conta ML", icon: Store },
    { key: "authorization", label: "Autorização", icon: ShieldCheck },
    { key: "sync", label: "Primeiros dados", icon: PackageSearch },
  ] as const;

  const stageOrder = ["company", "account", "authorization", "sync", "ready"];
  const currentIndex = stageOrder.indexOf(stage);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={acLogo} alt="AC360" className="h-11 w-11" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                AC360 E-commerce Intelligence
              </div>
              <div className="font-display text-lg font-bold text-slate-900">
                Primeiros passos
              </div>
            </div>
          </div>

          {ctx?.company_name ? (
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
              {ctx.company_name}
            </div>
          ) : null}
        </header>

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-7 text-white md:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold md:text-3xl">
                  Do primeiro acesso ao dashboard em poucos passos
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Você não precisa configurar API nem copiar chaves. Crie sua operação,
                  autorize o Mercado Livre e o AC360 cuida da integração.
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-2 md:grid-cols-4">
              {steps.map((step, index) => {
                const done = currentIndex > index;
                const active =
                  stage === step.key ||
                  (step.key === "authorization" && stage === "authorization") ||
                  (step.key === "sync" && stage === "ready");
                const Icon = done ? CheckCircle2 : step.icon;

                return (
                  <div
                    key={step.key}
                    className={`rounded-xl border px-3 py-3 ${
                      done
                        ? "border-emerald-400/30 bg-emerald-400/10"
                        : active
                          ? "border-blue-300/40 bg-blue-400/10"
                          : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${
                          done
                            ? "text-emerald-300"
                            : active
                              ? "text-blue-200"
                              : "text-slate-400"
                        }`}
                      />
                      <span className="text-xs font-semibold">{step.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {error ? (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {stage === "company" ? (
              <div className="mx-auto max-w-xl">
                <StepHeading
                  icon={Building2}
                  eyebrow="Etapa 1"
                  title="Identifique sua empresa"
                  description="Esse nome será usado para separar sua operação e seus dados dentro do AC360."
                />

                <div className="mt-6 space-y-4">
                  <Field
                    label="Nome da empresa"
                    value={companyName}
                    onChange={setCompanyName}
                    placeholder="Ex.: Loja XPTO"
                    autoFocus
                  />
                  <Field
                    label="Seu nome"
                    value={ownerName}
                    onChange={setOwnerName}
                    placeholder="Ex.: João Silva"
                  />

                  <button
                    type="button"
                    onClick={() => void handleCreateCompany()}
                    disabled={creatingCompany || companyName.trim().length < 2}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50"
                  >
                    {creatingCompany ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    {creatingCompany ? "Criando empresa…" : "Criar empresa e continuar"}
                  </button>
                </div>
              </div>
            ) : null}

            {stage === "account" ? (
              <div className="mx-auto max-w-xl">
                <StepHeading
                  icon={Store}
                  eyebrow="Etapa 2"
                  title="Adicione sua primeira conta Mercado Livre"
                  description="Use apenas um nome interno para identificar a conta. Nenhuma chave de API é necessária."
                />

                <div className="mt-6 space-y-4">
                  <Field
                    label="Nome da conta no AC360"
                    value={accountName}
                    onChange={setAccountName}
                    placeholder="Ex.: Loja Principal"
                    autoFocus
                  />

                  <button
                    type="button"
                    onClick={() => void handleCreateAccount()}
                    disabled={creatingAccount || accountName.trim().length < 2}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50"
                  >
                    {creatingAccount ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    {creatingAccount
                      ? "Criando conta…"
                      : "Criar e autorizar Mercado Livre"}
                  </button>
                </div>
              </div>
            ) : null}

            {stage === "authorization" && pendingAccount ? (
              <div className="mx-auto max-w-xl text-center">
                <StepHeading
                  icon={ShieldCheck}
                  eyebrow="Etapa 3"
                  title="Autorize o AC360 no Mercado Livre"
                  description="A autorização acontece no ambiente oficial do Mercado Livre. O AC360 não recebe sua senha."
                  centered
                />

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="font-semibold text-amber-900">
                    {pendingAccount.account_name || "Conta Mercado Livre"}
                  </div>
                  <div className="mt-1 text-xs text-amber-700">
                    Aguardando autorização
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleConnect(pendingAccount.id)}
                  disabled={connectingId === pendingAccount.id}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
                >
                  {connectingId === pendingAccount.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  {connectingId === pendingAccount.id
                    ? "Aguardando Mercado Livre…"
                    : "Autorizar Mercado Livre"}
                </button>
              </div>
            ) : null}

            {stage === "sync" && connectedAccount ? (
              <div className="mx-auto max-w-xl text-center">
                <StepHeading
                  icon={PackageSearch}
                  eyebrow="Etapa 4"
                  title="Importe seus primeiros dados"
                  description="Vamos buscar até 30 dias da sua operação para preencher o primeiro dashboard. Essa etapa pode levar alguns minutos."
                  centered
                />

                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600" />
                  <div className="mt-2 font-semibold text-emerald-900">
                    Mercado Livre conectado
                  </div>
                  <div className="mt-1 text-xs text-emerald-700">
                    {connectedAccount.account_name || "Conta autorizada"}
                  </div>
                </div>

                {syncMessage ? (
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-800">
                    {syncMessage}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => void handleInitialSync(connectedAccount.id)}
                  disabled={syncingId === connectedAccount.id}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50"
                >
                  {syncingId === connectedAccount.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <WandSparkles className="h-4 w-4" />
                  )}
                  {syncingId === connectedAccount.id
                    ? "Sincronizando…"
                    : "Importar primeiros dados"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate({ to: "/ecommerce/dashboard" })}
                  className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Ir ao dashboard e deixar o scheduler continuar automaticamente
                </button>
              </div>
            ) : null}

            {stage === "ready" ? (
              <div className="mx-auto max-w-xl text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Configuração concluída
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                  Seu AC360 está pronto
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {ordersCount > 0
                    ? `Encontramos ${ordersCount.toLocaleString("pt-BR")} pedido(s) na operação.`
                    : "Sua conta foi sincronizada e ainda não há pedidos no período inicial."}
                  {" "}O scheduler 24/7 continuará atualizando seus dados automaticamente.
                </p>

                <button
                  type="button"
                  onClick={() => navigate({ to: "/ecommerce/dashboard" })}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  <Rocket className="h-4 w-4" />
                  Abrir meu dashboard
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function StepHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
  centered = false,
}: {
  icon: typeof Building2;
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      <div
        className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <Icon className="h-5 w-5" />
        </div>
        <div className={centered ? "text-left" : ""}>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
            {eyebrow}
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">{title}</h2>
        </div>
      </div>
      <p className={`mt-3 text-sm leading-6 text-slate-600 ${centered ? "mx-auto" : ""}`}>
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

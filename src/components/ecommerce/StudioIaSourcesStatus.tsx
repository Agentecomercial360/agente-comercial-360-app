import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { ECOMMERCE_COMPANY_ID, useEcommerceActiveAccount } from "@/lib/ecommerce-active-account";
import {
  getStudioIaContextPreview,
  StudioIaPreviewError,
  type StudioIaContextPreview,
  type StudioIaSourceState,
  type StudioIaSourceStatus,
} from "@/lib/studio-ia-context-preview";

const STATE_COPY: Record<StudioIaSourceState, { label: string; className: string }> = {
  available: {
    label: "Disponível",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  empty: {
    label: "Sem registros",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  unavailable: {
    label: "Indisponível",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  unknown: {
    label: "Não confirmado",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

function StatusMessage({ error }: { error: Error }) {
  const previewError = error instanceof StudioIaPreviewError ? error : null;
  const waitingForBackend = previewError?.kind === "not_deployed";
  const Icon = waitingForBackend ? Clock3 : AlertTriangle;

  return (
    <div
      className={`rounded-xl border p-4 text-sm ${
        waitingForBackend
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">
            {waitingForBackend
              ? "Aguardando implantação do backend"
              : "Não foi possível verificar as fontes"}
          </p>
          <p className="mt-1 opacity-90">{error.message}</p>
          {waitingForBackend && (
            <p className="mt-2 text-xs">
              A tela continua funcionando normalmente e nenhum dado foi alterado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StudioIaSourcesStatus() {
  const { activeAccountId, activeAccount, loading: accountsLoading } = useEcommerceActiveAccount();

  const previewQuery = useQuery<StudioIaContextPreview, Error>({
    queryKey: ["studio-ia-context-preview", ECOMMERCE_COMPANY_ID, activeAccountId],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getStudioIaContextPreview({
        companyId: ECOMMERCE_COMPANY_ID,
        accountId: activeAccountId as string,
        signal,
      }),
    enabled: !accountsLoading && Boolean(activeAccountId),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const hasUnconfirmedSource = previewQuery.data?.sources.some(
    (source: StudioIaSourceStatus) =>
      source.required && ["unavailable", "unknown"].includes(source.state),
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-slate-900">Fontes do Studio IA</h2>
              {previewQuery.data && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    hasUnconfirmedSource
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {hasUnconfirmedSource ? "Requer atenção" : "Diagnóstico pronto"}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {activeAccount
                ? `Conta ativa: ${activeAccount.account_name || activeAccount.nickname || "Mercado Livre"}`
                : "Verificação isolada da conta Mercado Livre ativa"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void previewQuery.refetch()}
          disabled={!activeAccountId || previewQuery.isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${previewQuery.isFetching ? "animate-spin" : ""}`} />
          Verificar novamente
        </button>
      </div>

      <div className="mt-5" aria-live="polite">
        {accountsLoading && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Identificando a conta ativa...
          </div>
        )}

        {!accountsLoading && !activeAccountId && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Selecione uma conta Mercado Livre específica no topo da tela para verificar as fontes.
          </div>
        )}

        {previewQuery.isPending && activeAccountId && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Consultando somente as contagens das fontes...
          </div>
        )}

        {previewQuery.error && <StatusMessage error={previewQuery.error} />}

        {previewQuery.data && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {previewQuery.data.sources.map((source: StudioIaSourceStatus) => {
                const stateCopy = STATE_COPY[source.state];
                return (
                  <div key={source.key} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold capitalize text-slate-900">
                          {source.label}
                        </p>
                        {source.table && (
                          <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {source.table}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stateCopy.className}`}
                      >
                        {stateCopy.label}
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-900">
                      {source.count === null ? "—" : source.count.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-[11px] text-slate-500">registros encontrados</p>
                    {source.message && (
                      <p className="mt-2 text-xs text-rose-600">{source.message}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-blue-800">
              <span className="inline-flex items-center gap-2 font-semibold">
                {hasUnconfirmedSource ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {previewQuery.data.availableSources} de {previewQuery.data.totalSources} fontes
                verificadas
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Somente leitura · nenhum dado enviado à IA
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
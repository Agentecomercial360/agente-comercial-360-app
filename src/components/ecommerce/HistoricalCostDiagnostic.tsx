import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { createAc360ApiUrl, getAc360AccessToken } from "@/lib/ac360-api";
import { assertHistoricalCostPreviewPage, type HistoricalCostPreviewPage } from "@/lib/historical-cost-preview";

type Status = {
  checked: number;
  estimatedOnly: number;
  blocked: number;
};

export function HistoricalCostDiagnostic({
  companyId, accountId, since, until,
}: {
  companyId: string | null;
  accountId: string | null;
  since: string;
  until: string;
}) {
  const [state, setState] = useState<{
    loading: boolean;
    result: Status | null;
    error: string | null;
  }>({ loading: false, result: null, error: null });

  useEffect(() => {
    const abort = new AbortController();
    if (!companyId || !accountId) {
      setState({ loading: false, result: null, error: null });
      return () => abort.abort();
    }
    setState({ loading: true, result: null, error: null });
    const run = async () => {
      try {
        const token = await getAc360AccessToken();
        if (!token) throw new Error("Faça login para consultar o diagnóstico financeiro.");
        let page = 1;
        let aggregate: Status = { checked: 0, estimatedOnly: 0, blocked: 0 };
        // Never report incomplete totals as if they cover the whole operation.
        const MAX_PAGES = 100;
        for (let i = 0; i < MAX_PAGES; i += 1) {
          const url = createAc360ApiUrl("/api/ecommerce/historical-cost-reconciliation/preview", {
            company_id: companyId, account_id: accountId, since, until, page,
          });
          const response = await fetch(url, {
            signal: abort.signal,
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            const errorByStatus: Record<number, string> = {
              400: "O período ou os identificadores enviados não são válidos.",
              401: "A sessão expirou. Entre novamente para acessar o diagnóstico.",
              403: "Esta conta não possui permissão para consultar o diagnóstico financeiro.",
              404: "A conta ativa ou o diagnóstico não está disponível neste ambiente.",
              422: "A análise excedeu o limite seguro de registros. Selecione um período menor.",
            };
            throw new Error(errorByStatus[response.status] ??
              "Não foi possível consultar a simulação financeira.");
          }
          const data = (await response.json()) as HistoricalCostPreviewPage;
          assertHistoricalCostPreviewPage(data, { companyId, accountId, since, until, page });
          aggregate = {
            checked: aggregate.checked + data.summary.orders_checked,
            estimatedOnly: aggregate.estimatedOnly + data.summary.estimated_only,
            blocked: aggregate.blocked + data.summary.blocked,
          };
          if (!data.pagination.has_more) {
            if (!abort.signal.aborted) setState({ loading: false, result: aggregate, error: null });
            return;
          }
          if (data.pagination.next_page !== page + 1) {
            throw new Error("Paginação financeira inconsistente.");
          }
          page = data.pagination.next_page;
        }
        throw new Error("Diagnóstico acima do limite seguro de páginas. Filtre um período menor.");
      } catch (error) {
        if (abort.signal.aborted) return;
        setState({
          loading: false,
          result: null,
          error: error instanceof Error ? error.message : "Diagnóstico indisponível.",
        });
      }
    };
    void run();
    return () => abort.abort();
  }, [companyId, accountId, since, until]);

  if (!companyId || !accountId) return null;
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-4 sm:p-5" aria-label="Diagnóstico de custos históricos">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">AC360 · Diagnóstico financeiro</p>
          <h2 className="mt-1 text-sm font-bold text-[#071B3D]">Cobertura de custos históricos</h2>
          <p className="mt-1 text-xs text-slate-500">Simulação somente leitura da conta ativa e do período selecionado; não representa lucro realizado.</p>
        </div>
        <Link to="/ecommerce/custos-margem" className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">
          Revisar custos <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {state.loading ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Analisando pedidos…</p>
      ) : state.error ? (
        <p role="status" className="mt-3 flex items-center gap-2 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {state.error} O lucro verificado continua separado deste diagnóstico.
        </p>
      ) : state.result ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-500">Pedidos analisados</p><p className="mt-1 text-lg font-bold tabular-nums">{state.result.checked.toLocaleString("pt-BR")}</p></div>
          <div className="rounded-xl bg-emerald-50 p-3"><p className="text-[10px] text-emerald-800">Com estimativa possível</p><p className="mt-1 flex items-center gap-1 text-lg font-bold tabular-nums text-emerald-900"><CheckCircle2 className="h-4 w-4" />{state.result.estimatedOnly.toLocaleString("pt-BR")}</p></div>
          <div className="rounded-xl bg-amber-50 p-3"><p className="text-[10px] text-amber-800">Bloqueados para revisão</p><p className="mt-1 text-lg font-bold tabular-nums text-amber-900">{state.result.blocked.toLocaleString("pt-BR")}</p></div>
        </div>
      ) : null}
    </section>
  );
}

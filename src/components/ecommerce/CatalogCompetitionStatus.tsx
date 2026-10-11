import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Crown,
  History,
  Loader2,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  autoSyncMarketplaceIntelligence,
  runMarketplaceIntelligence,
} from "@/lib/ml-marketplace-intelligence";

type Props = {
  companyId: string;
  accountId: string;
  listingId: string;
  mlItemId?: string | null;
  title: string;
};

type CompetitionRow = {
  id: string;
  ml_item_id: string;
  competition_status: string;
  previous_status: string | null;
  change_type: string | null;
  own_price: number | null;
  winner_item_id: string | null;
  winner_price: number | null;
  checked_at: string;
};

const LABELS: Record<string, string> = {
  winning: "Ganhando",
  sharing_first_place: "Compartilhando 1º lugar",
  competing: "Competindo",
  listed: "Listado",
  unknown: "Status desconhecido",
};

function money(value: number | null): string {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatusIcon({ status }: { status: string }) {
  if (status === "winning") return <Crown className="h-5 w-5" />;
  if (status === "sharing_first_place") return <CheckCircle2 className="h-5 w-5" />;
  if (status === "competing") return <TrendingDown className="h-5 w-5" />;
  if (status === "listed") return <AlertTriangle className="h-5 w-5" />;
  return <Minus className="h-5 w-5" />;
}

export function CatalogCompetitionStatus({
  companyId,
  accountId,
  listingId,
  mlItemId,
  title,
}: Props) {
  const [rows, setRows] = useState<CompetitionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ecommerce_catalog_competition_history")
      .select(
        "id,ml_item_id,competition_status,previous_status,change_type,own_price,winner_item_id,winner_price,checked_at",
      )
      .eq("company_id", companyId)
      .eq("account_id", accountId)
      .eq("listing_id", listingId)
      .order("checked_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("competition history", error);
      setRows([]);
    } else {
      setRows((data || []) as CompetitionRow[]);
    }
    setLoading(false);
  }, [companyId, accountId, listingId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!mlItemId) return;
    let cancelled = false;

    void autoSyncMarketplaceIntelligence({
      action: "competition_sync",
      company_id: companyId,
      account_id: accountId,
      listing_id: listingId,
    })
      .then(({ executed }) => {
        if (executed && !cancelled) void load();
      })
      .catch((autoError) => {
        console.warn("competition auto sync", autoError);
      });

    return () => {
      cancelled = true;
    };
  }, [companyId, accountId, listingId, mlItemId, load]);

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await runMarketplaceIntelligence<{
        status?: string;
        previous_status?: string | null;
        changed?: boolean;
      }>({
        action: "competition_sync",
        company_id: companyId,
        account_id: accountId,
        listing_id: listingId,
      });

      toast.success(
        result.changed
          ? "Posição de catálogo atualizada e mudança registrada."
          : "Posição de catálogo atualizada.",
      );
      await load();
    } catch (syncError) {
      const message =
        syncError instanceof Error
          ? syncError.message
          : "Não foi possível atualizar a competição do catálogo.";
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  }

  const current = rows[0] ?? null;

  const delta = useMemo(() => {
    if (!current?.previous_status) return null;
    if (current.previous_status === current.competition_status) return "stable";
    if (
      current.competition_status === "winning" ||
      current.competition_status === "sharing_first_place"
    ) {
      return "gain";
    }
    if (
      current.previous_status === "winning" ||
      current.previous_status === "sharing_first_place"
    ) {
      return "loss";
    }
    return "change";
  }, [current]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 md:px-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Monitor automático de catálogo
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
            Ganho e perda de posição
          </h3>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
            Histórico preparado para registrar quando o Mercado Livre alterar o anúncio
            entre vencedor, compartilhando primeiro lugar, competindo ou listado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mlItemId ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
              {mlItemId}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void handleSync()}
            disabled={syncing || !mlItemId}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Consultando Mercado Livre…" : "Atualizar agora"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando histórico…
        </div>
      ) : !current ? (
        <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
          <div>
            <div className="font-semibold text-slate-900">{title}</div>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
              Ainda não há histórico salvo para este anúncio. Use “Atualizar agora”
              para consultar a posição diretamente no Mercado Livre e iniciar o acompanhamento.
            </p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700">
            Pronto para primeira consulta
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 p-5 md:grid-cols-4 md:p-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Situação atual
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    current.competition_status === "winning"
                      ? "bg-emerald-100 text-emerald-700"
                      : current.competition_status === "sharing_first_place"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  <StatusIcon status={current.competition_status} />
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-slate-900">
                    {LABELS[current.competition_status] || current.competition_status}
                  </div>
                  <div className="text-xs text-slate-500">
                    Atualizado em {new Date(current.checked_at).toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Seu preço
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-slate-900">
                {money(current.own_price)}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Preço vencedor
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-slate-900">
                {money(current.winner_price)}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 px-5 py-4 md:px-6">
            <div className="mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Últimas alterações
              </span>
            </div>
            <div className="space-y-2">
              {rows.slice(0, 6).map((row, index) => {
                const previous = row.previous_status;
                const gained =
                  previous &&
                  previous !== row.competition_status &&
                  (row.competition_status === "winning" ||
                    row.competition_status === "sharing_first_place");
                const lost =
                  previous &&
                  previous !== row.competition_status &&
                  (previous === "winning" || previous === "sharing_first_place");
                const Icon = gained ? TrendingUp : lost ? TrendingDown : Minus;
                return (
                  <div
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 ${
                          gained
                            ? "text-emerald-600"
                            : lost
                              ? "text-rose-600"
                              : "text-slate-400"
                        }`}
                      />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {LABELS[row.competition_status] || row.competition_status}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {previous
                            ? `${LABELS[previous] || previous} → ${LABELS[row.competition_status] || row.competition_status}`
                            : index === rows.length - 1
                              ? "Primeiro registro"
                              : "Atualização de status"}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(row.checked_at).toLocaleString("pt-BR")}
                    </div>
                  </div>
                );
              })}
            </div>

            {delta === "loss" ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Alerta: este anúncio perdeu uma posição de destaque no catálogo.
              </div>
            ) : delta === "gain" ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                Boa notícia: este anúncio ganhou uma posição de destaque no catálogo.
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

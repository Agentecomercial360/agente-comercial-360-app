import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  Store,
  Plus,
  MoreHorizontal,
  Settings2,
  Link2,
  Unlink,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import { runSmartAccountSync, formatSmartSyncMessage } from "@/lib/ml-sync";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/ecommerce/contas")({
  component: ContasML,
  head: () => ({
    meta: [
      { title: "Contas Mercado Livre | AC360 E-commerce Intelligence" },
      {
        name: "description",
        content:
          "Gerencie as contas Mercado Livre conectadas, autorizações e status de sincronização no AC360.",
      },
      { property: "og:title", content: "Contas Mercado Livre | AC360" },
      {
        property: "og:description",
        content:
          "Contas conectadas, autorizações e sincronização de anúncios do Mercado Livre.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const ROBOMIX_COMPANY_ID = "ac7d24b9-5227-46ac-9ced-b66473422a17";

type AccountRow = {
  id: string;
  company_id: string | null;
  account_name: string | null;
  marketplace: string | null;
  nickname: string | null;
  auth_status: string | null;
  ml_user_id: string | null;
  external_account_id: string | null;
  is_active: boolean | null;
  last_sync_at: string | null;
  external_account_code: string | null;
  integration_notes: string | null;
  updated_at: string | null;
};

type IntegrationRow = {
  id: string;
  account_id: string | null;
  provider: string | null;
  marketplace: string | null;
  integration_name: string | null;
  integration_status: string | null;
  external_nickname: string | null;
  external_user_id: string | null;
  last_sync_at: string | null;
  expires_at: string | null;
  updated_at: string | null;
};

function isMercadoLivre(value: string | null | undefined): boolean {
  const k = (value ?? "").toLowerCase().replace(/[\s-]/g, "_");
  return k === "mercado_livre" || k === "mercadolivre" || k === "ml";
}

const CONNECTED_VALUES = new Set([
  "connected",
  "conectada",
  "conectado",
  "active",
  "ativa",
  "ativo",
  "authorized",
  "autorizada",
  "autorizado",
]);

function isConnected(account: AccountRow, integration?: IntegrationRow): boolean {
  const a = (account.auth_status ?? "").toLowerCase();
  const i = (integration?.integration_status ?? "").toLowerCase();
  if (CONNECTED_VALUES.has(a) || CONNECTED_VALUES.has(i)) return true;
  if (integration && (integration.last_sync_at || integration.external_user_id)) {
    return true;
  }
  if (account.is_active && (account.ml_user_id || account.last_sync_at)) {
    return true;
  }
  return false;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ContasML() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationRow[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const { data: accData, error: accErr } = await supabase
        .from("ecommerce_accounts")
        .select(
          "id, company_id, account_name, marketplace, nickname, auth_status, ml_user_id, external_account_id, is_active, last_sync_at, external_account_code, integration_notes, updated_at",
        )
        .eq("company_id", ROBOMIX_COMPANY_ID)
        .order("account_name", { ascending: true });
      if (accErr) throw accErr;

      const filteredAccounts = ((accData as AccountRow[]) ?? []).filter((a) =>
        isMercadoLivre(a.marketplace),
      );

      const { data: intData, error: intErr } = await supabase
        .from("ecommerce_integrations")
        .select(
          "id, account_id, provider, marketplace, integration_name, integration_status, external_nickname, external_user_id, last_sync_at, expires_at, updated_at",
        )
        .eq("company_id", ROBOMIX_COMPANY_ID);
      if (intErr) throw intErr;

      const filteredIntegrations = ((intData as IntegrationRow[]) ?? []).filter(
        (i) => isMercadoLivre(i.marketplace) || isMercadoLivre(i.provider),
      );

      setAccounts(filteredAccounts);
      setIntegrations(filteredIntegrations);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao carregar contas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const integrationByAccount = useMemo(() => {
    const m = new Map<string, IntegrationRow>();
    for (const a of accounts) {
      const direct = integrations.find((i) => i.account_id === a.id);
      const byUser =
        direct ??
        integrations.find(
          (i) =>
            a.ml_user_id &&
            i.external_user_id &&
            String(i.external_user_id) === String(a.ml_user_id),
        );
      const byNick =
        byUser ??
        integrations.find(
          (i) =>
            a.nickname &&
            i.external_nickname &&
            i.external_nickname.toLowerCase() === a.nickname.toLowerCase(),
        );
      if (byNick) m.set(a.id, byNick);
    }
    return m;
  }, [accounts, integrations]);

  const summary = useMemo(() => {
    let connected = 0;
    let lastSync: string | null = null;
    for (const a of accounts) {
      const integration = a.id ? integrationByAccount.get(a.id) : undefined;
      if (isConnected(a, integration)) connected += 1;
      const candidates = [a.last_sync_at, integration?.last_sync_at].filter(
        (x): x is string => !!x,
      );
      for (const c of candidates) {
        if (!lastSync || new Date(c) > new Date(lastSync)) lastSync = c;
      }
    }
    return {
      total: accounts.length,
      connected,
      pending: accounts.length - connected,
      lastSync,
    };
  }, [accounts, integrationByAccount]);

  async function handleSyncAccount(accountId: string) {
    setSyncingId(accountId);
    try {
      const result = await runSmartAccountSync(accountId, { days: 1 });
      console.log("Resposta sync-account-smart:", result.raw);
      toast.success(formatSmartSyncMessage(result));
      window.dispatchEvent(new CustomEvent("mercadolivre-products-synced"));
      await loadData();
    } catch (e: any) {
      console.error(e);
      toast.error(
        e?.message
          ? `Não foi possível sincronizar: ${e.message}`
          : "Não foi possível sincronizar agora. Tente novamente em instantes.",
      );
    } finally {
      setSyncingId(null);
    }
  }

  return (
    <EcommerceLayout>
      <TooltipProvider delayDuration={200}>
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Cabeçalho */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Contas Mercado Livre da ROBOMIX
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gerencie as contas conectadas, acompanhe autorizações e o status de
                sincronização.
              </p>
            </div>
            <Button
              className="gap-2 shadow-sm"
              onClick={() =>
                toast.info(
                  "A autorização de novas contas Mercado Livre será liberada em breve.",
                )
              }
            >
              <Plus className="h-4 w-4" />
              Conectar Nova Conta
            </Button>
          </div>

          {/* KPI summary bar */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-border bg-card px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total de contas
              </span>
              <span className="text-sm font-bold text-foreground">
                {loading ? "—" : summary.total}
              </span>
            </div>

            <div className="hidden h-5 w-px bg-border sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Conectadas
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                {loading ? "—" : summary.connected}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Pendentes
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                <Clock className="h-3 w-3" />
                {loading ? "—" : summary.pending}
              </span>
            </div>

            <div className="hidden h-5 w-px bg-border sm:block" />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
              Última sincronização:{" "}
              <span className="font-medium">
                {loading ? "—" : formatDateTime(summary.lastSync)}
              </span>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider">
                    Conta / Nickname
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider">
                    Integração
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider">
                    ML User ID
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider">
                    Última sincronização
                  </TableHead>
                  <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wider">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j} className="py-3">
                          <Skeleton className="h-4 w-full max-w-[160px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {!loading && accounts.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="py-16">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                          <Store className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Nenhuma conta vinculada
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Clique em “Conectar Nova Conta” para começar.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  accounts.map((acc) => {
                    const integration = acc.id
                      ? integrationByAccount.get(acc.id)
                      : undefined;
                    const connected = isConnected(acc, integration);
                    const nickname =
                      acc.nickname ?? integration?.external_nickname ?? null;
                    const mlUserId =
                      acc.ml_user_id ?? integration?.external_user_id ?? "—";
                    const lastSync =
                      acc.last_sync_at ?? integration?.last_sync_at ?? null;
                    const isSyncing = syncingId === acc.id;
                    return (
                      <TableRow key={acc.id} className="group">
                        <TableCell className="py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground">
                              {acc.account_name ?? "Sem nome"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {nickname ?? "Sem nickname"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          {connected ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Conectada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                              <Clock className="h-3 w-3" />
                              Requer atenção
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground">
                          {integration?.integration_status ?? "—"}
                        </TableCell>
                        <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                          {mlUserId}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground">
                          {formatDateTime(lastSync)}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  disabled={!connected || isSyncing}
                                  onClick={() => handleSyncAccount(acc.id)}
                                >
                                  <RefreshCw
                                    className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {connected
                                  ? "Sincronizar produtos"
                                  : "Conta aguardando autorização"}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    toast.info(
                                      "Configurações avançadas desta conta em breve.",
                                    )
                                  }
                                >
                                  <Settings2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Configurações</TooltipContent>
                            </Tooltip>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() =>
                                    toast.info(
                                      "Reautorização via Mercado Livre em breve.",
                                    )
                                  }
                                >
                                  <Link2 className="mr-2 h-4 w-4" />
                                  Reautorizar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    toast.info(
                                      acc.integration_notes ??
                                        "Sem observações registradas para esta conta.",
                                    )
                                  }
                                >
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Ver observações
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    toast.info(
                                      "Desconectar contas exige confirmação do administrador.",
                                    )
                                  }
                                >
                                  <Unlink className="mr-2 h-4 w-4" />
                                  Desconectar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      </TooltipProvider>
    </EcommerceLayout>
  );
}

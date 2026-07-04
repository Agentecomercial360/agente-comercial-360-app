import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Target, Loader2, ExternalLink, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/ecommerce/concorrencia")({
  component: ConcorrenciaPage,
  head: () => ({
    meta: [
      { title: "Inteligência de Concorrência | Agente Comercial 360" },
      {
        name: "description",
        content:
          "Monitore anúncios concorrentes do Mercado Livre por link — preço, frete, estoque e vendas.",
      },
    ],
  }),
});

const SYNC_ITEM_ENDPOINT =
  "https://ac360-mercadolivre-api-production.up.railway.app/api/mercadolivre/competition/sync-item";

type CompetitorItem = {
  item_id: string;
  title: string;
  price: number | null;
  currency_id: string | null;
  status: string | null;
  condition: string | null;
  listing_type_id: string | null;
  permalink: string | null;
  seller_id: number | null;
  free_shipping: boolean | null;
  available_quantity: number | null;
  sold_quantity: number | null;
  added_at: string;
};

function formatCurrency(value: number | null, currency: string | null): string {
  if (value == null) return "—";
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

function parseErrorMessage(rawMsg: string, url: string): string {
  const msg = (rawMsg || "").toLowerCase();
  const isCatalog = /mlbu|\/p\/mlb|catalog/i.test(url) || msg.includes("catalog") || msg.includes("mlbu");
  if (isCatalog) {
    return "Este parece ser um link de catálogo (MLBU) ou página de produto do catálogo. Use o link direto do anúncio contendo MLB seguido de números.";
  }
  if (msg.includes("item_id") || msg.includes("invalid url") || msg.includes("url")) {
    return "Link inválido. Cole o link direto do anúncio do Mercado Livre contendo MLB.";
  }
  return "Não foi possível consultar este anúncio.";
}

function ConcorrenciaPage() {
  return (
    <EcommerceLayout>
      <ConcorrenciaInner />
    </EcommerceLayout>
  );
}

function ConcorrenciaInner() {
  const { activeAccountId, activeAccount } = useEcommerceActiveAccount();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CompetitorItem[]>([]);

  const handleAdd = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Cole o link do anúncio.");
      return;
    }
    if (!activeAccountId) {
      toast.error("Selecione uma conta Mercado Livre ativa.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(SYNC_ITEM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          company_id: ECOMMERCE_COMPANY_ID,
          account_id: activeAccountId,
          item_url: trimmed,
        }),
      });
      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        /* ignore */
      }
      if (!res.ok || (data && data.status && data.status !== "success")) {
        const raw = data?.message || data?.error || `HTTP ${res.status}`;
        throw new Error(raw);
      }
      const payload = (data?.data ?? data) as Partial<CompetitorItem> | undefined;
      if (!payload || !payload.item_id) {
        throw new Error("Resposta inválida");
      }
      const item: CompetitorItem = {
        item_id: String(payload.item_id),
        title: String(payload.title ?? "Sem título"),
        price: typeof payload.price === "number" ? payload.price : Number(payload.price) || null,
        currency_id: payload.currency_id ?? "BRL",
        status: payload.status ?? null,
        condition: payload.condition ?? null,
        listing_type_id: payload.listing_type_id ?? null,
        permalink: payload.permalink ?? trimmed,
        seller_id:
          typeof payload.seller_id === "number"
            ? payload.seller_id
            : Number(payload.seller_id) || null,
        free_shipping: payload.free_shipping ?? null,
        available_quantity:
          typeof payload.available_quantity === "number"
            ? payload.available_quantity
            : Number(payload.available_quantity) || null,
        sold_quantity:
          typeof payload.sold_quantity === "number"
            ? payload.sold_quantity
            : Number(payload.sold_quantity) || null,
        added_at: new Date().toISOString(),
      };
      setItems((prev) => {
        const filtered = prev.filter((p) => p.item_id !== item.item_id);
        return [item, ...filtered];
      });
      setUrl("");
      toast.success(`Anúncio ${item.item_id} adicionado.`);
    } catch (err: any) {
      const clean = parseErrorMessage(err?.message ?? "", trimmed);
      toast.error(clean);
    } finally {
      setLoading(false);
    }
  }, [url, activeAccountId]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((p) => p.item_id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Inteligência Comercial
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Target className="h-6 w-6 text-muted-foreground" />
            Inteligência de Concorrência
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitore anúncios concorrentes do Mercado Livre por link direto.
            {activeAccount?.account_name ? (
              <> Conta ativa: <span className="font-medium text-foreground">{activeAccount.account_name}</span>.</>
            ) : null}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monitoramento de Concorrentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cole aqui o link do anúncio (ex.: https://produto.mercadolivre.com.br/MLB-...)"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleAdd();
              }}
              className="flex-1"
            />
            <Button onClick={handleAdd} disabled={loading || !activeAccountId}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Consultando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Adicionar concorrente
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use o link direto do anúncio contendo <span className="font-mono">MLB</span> seguido de
            números. Links de catálogo (<span className="font-mono">MLBU</span> ou{" "}
            <span className="font-mono">/p/MLB</span>) não são suportados.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Anúncios monitorados{" "}
            <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              Nenhum concorrente adicionado ainda. Cole um link acima para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anúncio</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Frete</TableHead>
                    <TableHead className="text-right">Disponível</TableHead>
                    <TableHead className="text-right">Vendidos</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.item_id}>
                      <TableCell className="max-w-[320px]">
                        <div className="font-medium leading-snug">{it.title}</div>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {it.item_id}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(it.price, it.currency_id)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            "inline-flex items-center rounded-md border px-2 py-0.5 text-xs " +
                            (it.free_shipping
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-border bg-muted/40 text-muted-foreground")
                          }
                        >
                          {it.free_shipping ? "Grátis" : "Pago"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {it.available_quantity ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {it.sold_quantity ?? "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{it.seller_id ?? "—"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs capitalize text-muted-foreground">
                          {it.status ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {it.permalink ? (
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              title="Abrir no Mercado Livre"
                            >
                              <a
                                href={it.permalink}
                                target="_blank"
                                rel="noreferrer noopener"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(it.item_id)}
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ClipboardCopy,
  Download,
  Layers3,
  Loader2,
  PackageCheck,
  Printer,
  Search,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import {
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { runMarketplaceIntelligence } from "@/lib/ml-marketplace-intelligence";

export const Route = createFileRoute("/ecommerce/expedicao")({
  component: ExpedicaoPage,
  head: () => ({
    meta: [{ title: "Expedição Inteligente | Agente Comercial 360" }],
  }),
});

type OrderRow = {
  id: string;
  external_order_id: string | null;
  external_pack_id: string | null;
  shipment_id: string | null;
  order_date: string;
  order_status: string | null;
  payment_status: string | null;
  shipping_status: string | null;
  total_amount: number | null;
  is_cancelled: boolean | null;
};

type ItemRow = {
  id: string;
  order_id: string;
  sku: string | null;
  seller_sku: string | null;
  product_name: string | null;
  title: string | null;
  quantity: number | null;
};

type Group = {
  key: string;
  sku: string;
  productName: string;
  units: number;
  orderIds: Set<string>;
  shipmentIds: Set<string>;
  statuses: Set<string>;
};

function ExpedicaoPage() {
  return (
    <EcommerceLayout>
      <ExpedicaoContent />
    </EcommerceLayout>
  );
}

function ExpedicaoContent() {
  const {
    companyId, activeAccountId, activeAccount, loading: accountsLoading } =
    useEcommerceActiveAccount();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generatingLabels, setGeneratingLabels] = useState(false);

  useEffect(() => {
    if (accountsLoading) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const from = new Date();
      from.setDate(from.getDate() - 14);

      let orderQuery = supabase
        .from("ecommerce_orders")
        .select(
          "id,external_order_id,external_pack_id,shipment_id,order_date,order_status,payment_status,shipping_status,total_amount,is_cancelled",
        )
        .eq("company_id", companyId)
        .gte("order_date", from.toISOString())
        .eq("is_cancelled", false)
        .not("shipment_id", "is", null)
        .order("order_date", { ascending: false })
        .limit(3000);

      if (activeAccountId) orderQuery = orderQuery.eq("account_id", activeAccountId);

      const { data: orderData, error: orderError } = await orderQuery;
      if (cancelled) return;
      if (orderError) {
        toast.error("Não foi possível carregar os envios.");
        setOrders([]);
        setItems([]);
        setLoading(false);
        return;
      }

      const orderRows = (orderData || []) as OrderRow[];
      setOrders(orderRows);
      const ids = orderRows.map((row) => row.id);

      if (ids.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += 500) chunks.push(ids.slice(i, i + 500));

      const results = await Promise.all(
        chunks.map((chunk) =>
          supabase
            .from("ecommerce_order_items")
            .select("id,order_id,sku,seller_sku,product_name,title,quantity")
            .eq("company_id", companyId)
            .in("order_id", chunk)
            .limit(10000),
        ),
      );

      if (cancelled) return;
      const all: ItemRow[] = [];
      for (const result of results) {
        if (result.error) {
          toast.error("Não foi possível organizar os itens da expedição.");
          continue;
        }
        all.push(...((result.data || []) as ItemRow[]));
      }
      setItems(all);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [activeAccountId, accountsLoading]);

  const ordersById = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Group>();

    for (const item of items) {
      const order = ordersById.get(item.order_id);
      if (!order?.shipment_id) continue;
      const sku = item.seller_sku || item.sku || "SEM-SKU";
      const productName = item.product_name || item.title || "Produto sem título";
      const key = `${sku}::${productName}`;
      const group = map.get(key) ?? {
        key,
        sku,
        productName,
        units: 0,
        orderIds: new Set<string>(),
        shipmentIds: new Set<string>(),
        statuses: new Set<string>(),
      };
      group.units += Number(item.quantity ?? 0) || 0;
      group.orderIds.add(item.order_id);
      group.shipmentIds.add(order.shipment_id);
      if (order.shipping_status) group.statuses.add(order.shipping_status);
      map.set(key, group);
    }

    return Array.from(map.values()).sort((a, b) => {
      if (b.orderIds.size !== a.orderIds.size) return b.orderIds.size - a.orderIds.size;
      return a.productName.localeCompare(b.productName, "pt-BR");
    });
  }, [items, ordersById]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (group) =>
        group.productName.toLowerCase().includes(q) ||
        group.sku.toLowerCase().includes(q),
    );
  }, [groups, search]);

  const selectedGroups = useMemo(
    () => groups.filter((group) => selected.has(group.key)),
    [groups, selected],
  );

  const selectedShipmentIds = useMemo(() => {
    const ids = new Set<string>();
    for (const group of selectedGroups) {
      for (const id of group.shipmentIds) ids.add(id);
    }
    return Array.from(ids);
  }, [selectedGroups]);

  const allShipmentIds = useMemo(() => {
    const ids = new Set<string>();
    for (const group of groups) {
      for (const id of group.shipmentIds) ids.add(id);
    }
    return Array.from(ids);
  }, [groups]);

  function toggle(key: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function copyShipments() {
    const ids = selectedShipmentIds.length > 0 ? selectedShipmentIds : allShipmentIds;
    if (ids.length === 0) {
      toast.error("Nenhum shipment_id disponível.");
      return;
    }
    await navigator.clipboard.writeText(ids.join("\n"));
    toast.success(`${ids.length} IDs de envio copiados na ordem organizada.`);
  }

  async function downloadOfficialLabels() {
    if (!activeAccountId) {
      toast.error("Selecione uma conta Mercado Livre para gerar as etiquetas.");
      return;
    }

    const sourceGroups = selectedGroups.length > 0 ? selectedGroups : groups;
    const seen = new Set<string>();
    const labelGroups = sourceGroups
      .map((group) => ({
        sku: group.sku,
        shipment_ids: Array.from(group.shipmentIds).filter((id) => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        }),
      }))
      .filter((group) => group.shipment_ids.length > 0);

    if (seen.size === 0) {
      toast.error("Nenhuma etiqueta disponível para gerar.");
      return;
    }

    setGeneratingLabels(true);
    try {
      const result = await runMarketplaceIntelligence<{
        filename?: string;
        mime_type?: string;
        base64?: string;
        shipments?: number;
        groups?: number;
      }>({
        action: "shipment_labels",
        company_id: companyId,
        account_id: activeAccountId,
        groups: labelGroups,
      });

      if (!result.base64) {
        throw new Error("O Mercado Livre não retornou o PDF das etiquetas.");
      }

      const binary = atob(result.base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      const blob = new Blob([bytes], {
        type: result.mime_type || "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename || "etiquetas-mercado-livre.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success(
        `${Number(result.shipments ?? seen.size).toLocaleString("pt-BR")} etiqueta(s) gerada(s) por produto/SKU.`,
      );
    } catch (labelError) {
      const message =
        labelError instanceof Error
          ? labelError.message
          : "Não foi possível gerar as etiquetas oficiais.";
      toast.error(message);
    } finally {
      setGeneratingLabels(false);
    }
  }

  const totalUnits = groups.reduce((sum, group) => sum + group.units, 0);
  const accountLabel =
    activeAccount?.account_name || activeAccount?.nickname || "Todas as contas";

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[var(--shadow-soft)] md:px-6 print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Operação Mercado Livre
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 md:text-3xl">
              Expedição Inteligente
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
              Organize pedidos por produto e SKU antes da impressão, evitando etiquetas
              misturadas em ordem aleatória.
            </p>
            <div className="mt-2 text-xs font-medium text-slate-500">{accountLabel}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void downloadOfficialLabels()}
              disabled={generatingLabels || !activeAccountId}
            >
              {generatingLabels ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {generatingLabels ? "Gerando etiquetas…" : "Baixar etiquetas oficiais"}
            </Button>
            <Button variant="outline" onClick={copyShipments}>
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copiar IDs dos envios
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir separação
            </Button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 print:hidden">
        {[
          { label: "Produtos agrupados", value: groups.length, icon: Layers3 },
          { label: "Pedidos com envio", value: orders.length, icon: Truck },
          { label: "Unidades para separar", value: totalUnits, icon: PackageCheck },
          {
            label: "Etiquetas selecionadas",
            value: selectedShipmentIds.length || allShipmentIds.length,
            icon: Printer,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {item.label}
                </span>
                <Icon className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 font-display text-2xl font-bold tabular-nums text-slate-900">
                {loading ? "—" : item.value.toLocaleString("pt-BR")}
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800 print:hidden">
        <div className="flex gap-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-relaxed">
            As etiquetas oficiais agora são solicitadas ao Mercado Livre pelo backend
            seguro do AC360 e reunidas em PDF na sequência dos grupos de produto/SKU.
            Selecione apenas alguns grupos ou deixe tudo desmarcado para gerar toda a expedição.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 print:hidden">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Separação por produto
            </h2>
            <p className="text-xs text-slate-500">
              Selecione grupos específicos ou imprima toda a separação.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar produto ou SKU"
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Organizando expedição…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            Nenhum envio com item vinculado foi encontrado nos últimos 14 dias.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((group, index) => (
              <div
                key={group.key}
                className="grid gap-3 px-5 py-4 md:grid-cols-[auto_1fr_auto_auto] md:items-center print:grid-cols-[1fr_auto_auto]"
              >
                <label className="flex items-center print:hidden">
                  <input
                    type="checkbox"
                    checked={selected.has(group.key)}
                    onChange={() => toggle(group.key)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </label>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-semibold text-slate-900">{group.productName}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    SKU {group.sku} · {Array.from(group.statuses).join(", ") || "status não informado"}
                  </div>
                  <div className="mt-2 hidden text-[10px] text-slate-500 print:block">
                    Envios: {Array.from(group.shipmentIds).join(" · ")}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-2 text-center">
                  <div className="text-[10px] font-semibold uppercase text-slate-500">Pedidos</div>
                  <div className="font-display text-xl font-bold text-slate-900">
                    {group.orderIds.size}
                  </div>
                </div>
                <div className="rounded-xl bg-blue-50 px-4 py-2 text-center">
                  <div className="text-[10px] font-semibold uppercase text-blue-600">Unidades</div>
                  <div className="font-display text-xl font-bold text-blue-800">
                    {group.units}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

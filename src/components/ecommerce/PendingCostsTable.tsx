import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Download,
  FileSpreadsheet,
  Loader2,
  Package,
  Save,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export type PendingCostRow = {
  product_id: string;
  sku: string | null;
  product_name: string | null;
  cost_price: number | null;
  orders: number;
  units: number;
  revenue: number;
  accountNames: string[];
};

type BulkCostRow = {
  sku: string;
  cost_price: number;
};

type BulkParseResult = {
  rows: BulkCostRow[];
  invalidLines: number;
  duplicateSkus: number;
};

type CostUpsertResult = {
  success?: boolean;
  rows_received?: number;
  products_updated?: number;
  products_unchanged?: number;
  invalid_rows?: number;
  products_not_found?: number;
  ambiguous_skus?: number;
  accounts_recalculated?: number;
  items_recalculated?: number;
  items_backfilled?: number;
  orders_recalculated?: number;
  orders_high_confidence?: number;
  orders_pending_cost?: number;
  details?: Array<Record<string, unknown>>;
};

function formatBRL(v: number | null | undefined): string {
  const n = Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseBRLInput(v: string): number | null {
  let normalized = v
    .trim()
    .replace(/R\$/gi, "")
    .replace(/\s/g, "");

  if (!normalized) return null;

  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }

  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === delimiter && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function detectDelimiter(line: string): string {
  if (line.includes("\t")) return "\t";
  if (line.includes(";")) return ";";
  return ",";
}

function parseBulkCostText(text: string): BulkParseResult {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { rows: [], invalidLines: 0, duplicateSkus: 0 };
  }

  const delimiter = detectDelimiter(lines[0]);
  const first = splitDelimitedLine(lines[0], delimiter);
  const normalizedHeaders = first.map(normalizeHeader);

  const skuHeaderNames = new Set(["sku", "seller_sku", "codigo", "codigo_sku"]);
  const costHeaderNames = new Set([
    "custo",
    "cost",
    "cost_price",
    "preco_custo",
    "custo_unitario",
  ]);

  const skuHeaderIndex = normalizedHeaders.findIndex((header) =>
    skuHeaderNames.has(header),
  );
  const costHeaderIndex = normalizedHeaders.findIndex((header) =>
    costHeaderNames.has(header),
  );
  const hasHeader = skuHeaderIndex >= 0 && costHeaderIndex >= 0;

  const skuIndex = hasHeader ? skuHeaderIndex : 0;
  const costIndex = hasHeader ? costHeaderIndex : 1;
  const start = hasHeader ? 1 : 0;

  const bySku = new Map<string, BulkCostRow>();
  let invalidLines = 0;
  let duplicateSkus = 0;

  for (let index = start; index < lines.length; index += 1) {
    const columns = splitDelimitedLine(lines[index], delimiter);
    const sku = (columns[skuIndex] ?? "").trim();
    const cost = parseBRLInput(columns[costIndex] ?? "");

    if (!sku || cost == null) {
      invalidLines += 1;
      continue;
    }

    if (bySku.has(sku)) duplicateSkus += 1;
    bySku.set(sku, { sku, cost_price: cost });
  }

  return {
    rows: Array.from(bySku.values()),
    invalidLines,
    duplicateSkus,
  };
}

function csvCell(value: string): string {
  if (!/[;"\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

type Props = {
  rows: PendingCostRow[];
  loading: boolean;
  companyId: string;
  scopeLabel: string;
  onSaved: () => Promise<void> | void;
};

export function PendingCostsTable({
  rows,
  loading,
  companyId,
  scopeLabel,
  onSaved,
}: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [releasedRevenue, setReleasedRevenue] = useState(0);
  const [releasedCount, setReleasedCount] = useState(0);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [lastBulkResult, setLastBulkResult] = useState<CostUpsertResult | null>(null);

  const summary = useMemo(() => {
    const productsCount = rows.length;
    const affectedOrders = rows.reduce((sum, row) => sum + row.orders, 0);
    const affectedRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    return { productsCount, affectedOrders, affectedRevenue };
  }, [rows]);

  const parsedBulk = useMemo(() => parseBulkCostText(bulkText), [bulkText]);

  async function applyCosts(
    payloadRows: Array<{ product_id?: string; sku?: string | null; cost_price: number }>,
    changedBy: string,
    notes: string,
  ): Promise<CostUpsertResult> {
    const { data, error } = await supabase.rpc("upsert_ecommerce_product_costs_v3", {
      p_company_id: companyId,
      p_rows: payloadRows,
      p_changed_by: changedBy,
      p_notes: notes,
    });

    if (error) throw error;
    return (data ?? {}) as CostUpsertResult;
  }

  async function handleSave(row: PendingCostRow) {
    const raw = inputs[row.product_id] ?? "";
    const parsed = parseBRLInput(raw);

    if (parsed == null) {
      toast.error("Informe um custo válido maior que zero.");
      return;
    }

    setSavingId(row.product_id);

    try {
      const result = await applyCosts(
        [
          {
            product_id: row.product_id,
            sku: row.sku,
            cost_price: parsed,
          },
        ],
        "AC360 Custos e Margem",
        "Atualização individual de custo pelo painel. Snapshots de venda já existentes são preservados.",
      );

      if ((result.products_updated ?? 0) > 0) {
        setReleasedRevenue((value) => value + (row.revenue || 0));
        setReleasedCount((count) => count + 1);
        toast.success("Custo salvo e lucro recalculado.", {
          description: `${result.items_backfilled ?? 0} item(ns) recebeu(ram) custo histórico e ${result.orders_recalculated ?? 0} pedido(s) foram recalculados.`,
        });
      } else if ((result.products_unchanged ?? 0) > 0) {
        toast.info("Esse produto já possui exatamente esse custo.");
      } else {
        toast.warning("O custo não foi aplicado.", {
          description:
            (result.products_not_found ?? 0) > 0
              ? "Produto não encontrado."
              : "Revise o valor informado.",
        });
      }

      setInputs((previous) => {
        const next = { ...previous };
        delete next[row.product_id];
        return next;
      });

      await onSaved();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao salvar custo.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleBulkImport() {
    if (parsedBulk.rows.length === 0) {
      toast.error("Nenhuma linha válida para importar.");
      return;
    }

    setBulkImporting(true);
    setLastBulkResult(null);

    try {
      const result = await applyCosts(
        parsedBulk.rows,
        "AC360 Importação de Custos v3",
        "Importação em massa por SKU. Pedidos antigos sem snapshot recebem backfill uma única vez; snapshots existentes são preservados.",
      );

      setLastBulkResult(result);

      const updatedSkus = new Set(
        (result.details ?? [])
          .filter((detail) => detail.status === "updated")
          .map((detail) => String(detail.sku ?? ""))
          .filter(Boolean),
      );

      if (updatedSkus.size > 0) {
        const released = rows
          .filter((row) => row.sku && updatedSkus.has(row.sku))
          .reduce((sum, row) => sum + row.revenue, 0);
        setReleasedRevenue((value) => value + released);
        setReleasedCount((count) => count + updatedSkus.size);
      }

      toast.success(
        `${result.products_updated ?? 0} custo(s) atualizado(s) com sucesso.`,
        {
          description: `${result.items_backfilled ?? 0} item(ns) com backfill · ${result.orders_recalculated ?? 0} pedido(s) recalculado(s) · ${result.orders_high_confidence ?? 0} com lucro confiável.`,
        },
      );

      if (
        (result.products_not_found ?? 0) === 0 &&
        (result.invalid_rows ?? 0) === 0 &&
        (result.ambiguous_skus ?? 0) === 0
      ) {
        setBulkText("");
      }

      await onSaved();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao importar custos.");
    } finally {
      setBulkImporting(false);
    }
  }

  function handleDownloadTemplate() {
    const lines = [
      "sku;custo",
      ...rows
        .filter((row) => row.sku)
        .map((row) => `${csvCell(row.sku || "")};`),
    ];

    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ac360-modelo-custos.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function handleFile(file: File | null) {
    if (!file) return;

    try {
      const text = await file.text();
      setBulkText(text);
      setBulkOpen(true);
      setLastBulkResult(null);
    } catch {
      toast.error("Não foi possível ler o arquivo.");
    }
  }

  const cards = [
    {
      label: "Produtos sem custo",
      value: summary.productsCount.toLocaleString("pt-BR"),
      icon: Package,
      accent: "from-orange-600 to-rose-700",
      tone: "text-orange-700",
    },
    {
      label: "Pedidos afetados",
      value: summary.affectedOrders.toLocaleString("pt-BR"),
      icon: AlertTriangle,
      accent: "from-amber-600 to-orange-700",
      tone: "text-amber-700",
    },
    {
      label: "Faturamento com custo pendente",
      value: formatBRL(summary.affectedRevenue),
      icon: DollarSign,
      accent: "from-rose-600 to-rose-800",
      tone: "text-rose-700",
    },
    {
      label: "Lucro confiável liberado",
      value: formatBRL(releasedRevenue),
      hint: `${releasedCount} produto(s) atualizados nesta sessão`,
      icon: CheckCircle2,
      accent: "from-emerald-600 to-emerald-800",
      tone: "text-emerald-700",
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50/80 to-white px-5 py-4 md:px-6 md:py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-slate-900 text-white shadow-md">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="max-w-3xl space-y-1">
              <h2 className="font-display text-lg font-bold text-slate-900 md:text-xl">
                Custos e Margem
              </h2>
              <p className="text-xs text-slate-600 md:text-[13px]">
                Cadastre individualmente ou importe custos em massa por SKU. O AC360
                preserva snapshots de custo já registrados e faz backfill somente onde o
                histórico ainda está vazio.
                <span className="ml-1 text-slate-500">Escopo: {scopeLabel}.</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Baixar modelo CSV
            </button>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
              <Upload className="h-3.5 w-3.5" />
              Importar arquivo
              <input
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                className="hidden"
                onChange={(event) => {
                  void handleFile(event.target.files?.[0] ?? null);
                  event.currentTarget.value = "";
                }}
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setBulkOpen((open) => !open);
                setLastBulkResult(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-800"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Colar do Excel
            </button>
          </div>
        </div>
      </div>

      {bulkOpen ? (
        <div className="border-b border-blue-100 bg-blue-50/40 px-5 py-5 md:px-6">
          <div className="mx-auto max-w-5xl rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Importação em massa por SKU
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Use o formato <strong>sku;custo</strong>. Você também pode copiar duas
                  colunas diretamente do Excel ou Google Sheets. Máximo de 1.000 linhas
                  por operação.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBulkOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar importação"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              value={bulkText}
              onChange={(event) => {
                setBulkText(event.target.value);
                setLastBulkResult(null);
              }}
              placeholder={"sku;custo\nROB0808;12,50\nABC123;48,90"}
              className="mt-4 min-h-[190px] w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 font-mono text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                  {parsedBulk.rows.length} linha(s) válida(s)
                </span>
                {parsedBulk.invalidLines > 0 ? (
                  <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 font-semibold text-rose-700">
                    {parsedBulk.invalidLines} inválida(s)
                  </span>
                ) : null}
                {parsedBulk.duplicateSkus > 0 ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                    {parsedBulk.duplicateSkus} SKU(s) repetido(s) — último valor usado
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => void handleBulkImport()}
                disabled={bulkImporting || parsedBulk.rows.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkImporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {bulkImporting
                  ? "Aplicando custos…"
                  : `Aplicar ${parsedBulk.rows.length} custo(s)`}
              </button>
            </div>

            {lastBulkResult ? (
              <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                <ResultStat
                  label="Atualizados"
                  value={lastBulkResult.products_updated ?? 0}
                  good
                />
                <ResultStat
                  label="Sem alteração"
                  value={lastBulkResult.products_unchanged ?? 0}
                />
                <ResultStat
                  label="Itens com backfill"
                  value={lastBulkResult.items_backfilled ?? 0}
                  good
                />
                <ResultStat
                  label="Pedidos recalculados"
                  value={lastBulkResult.orders_recalculated ?? 0}
                  good
                />
                <ResultStat
                  label="SKU não encontrado"
                  value={lastBulkResult.products_not_found ?? 0}
                  warning={(lastBulkResult.products_not_found ?? 0) > 0}
                />
                <ResultStat
                  label="SKU ambíguo"
                  value={lastBulkResult.ambiguous_skus ?? 0}
                  warning={(lastBulkResult.ambiguous_skus ?? 0) > 0}
                />
                <ResultStat
                  label="Linhas inválidas"
                  value={lastBulkResult.invalid_rows ?? 0}
                  warning={(lastBulkResult.invalid_rows ?? 0) > 0}
                />
                <ResultStat
                  label="Lucro confiável"
                  value={lastBulkResult.orders_high_confidence ?? 0}
                  good
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4 md:p-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-soft)]"
            >
              <div
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${card.accent} opacity-10`}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {card.label}
                  </div>
                  <div
                    className={`font-display text-2xl font-bold leading-none tabular-nums ${card.tone} whitespace-nowrap md:text-[26px]`}
                  >
                    {loading ? "—" : card.value}
                  </div>
                  {"hint" in card && card.hint ? (
                    <div className="text-[11px] text-slate-500">{card.hint}</div>
                  ) : null}
                </div>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-md`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 px-5 py-4 md:px-6 md:py-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold text-slate-900 md:text-lg">
            Produtos com custo pendente
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
            {rows.length} produto(s)
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Carregando produtos pendentes de custo…
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Todos os produtos vendidos no período possuem custo cadastrado.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600">
                  <th className="px-3 py-3 text-left font-semibold">Produto</th>
                  <th className="px-3 py-3 text-right font-semibold">Vendas</th>
                  <th className="px-3 py-3 text-right font-semibold">
                    Faturamento afetado
                  </th>
                  <th className="px-3 py-3 text-right font-semibold">
                    Novo custo (R$)
                  </th>
                  <th className="px-3 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const isSaving = savingId === row.product_id;
                  const inputValue = inputs[row.product_id] ?? "";
                  const parsed = parseBRLInput(inputValue);

                  return (
                    <tr
                      key={row.product_id}
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="max-w-[280px] px-3 py-3">
                        <p
                          className="truncate text-[13px] font-semibold text-slate-900"
                          title={row.product_name ?? "Produto sem nome"}
                        >
                          {row.product_name ?? "Produto sem nome"}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
                          {row.sku || "sem SKU"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        <p className="text-[13px] font-semibold text-slate-900">
                          {row.units.toLocaleString("pt-BR")} un
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {row.orders.toLocaleString("pt-BR")}{" "}
                          {row.orders === 1 ? "pedido" : "pedidos"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        <span className="text-[13px] font-bold text-slate-900">
                          {formatBRL(row.revenue)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={inputValue}
                          onChange={(event) =>
                            setInputs((previous) => ({
                              ...previous,
                              [row.product_id]: event.target.value,
                            }))
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && parsed != null) {
                              void handleSave(row);
                            }
                          }}
                          placeholder="0,00"
                          disabled={isSaving}
                          aria-label={`Novo custo para ${row.product_name || row.sku || "produto"}`}
                          className="w-28 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {isSaving ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Salvando
                            </span>
                          ) : parsed != null ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Pronto
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                              <AlertTriangle className="h-3 w-3" />
                              Pendente
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => void handleSave(row)}
                            disabled={isSaving || parsed == null}
                            title="Salvar custo"
                            aria-label={`Salvar custo de ${row.product_name || row.sku || "produto"}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isSaving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function ResultStat({
  label,
  value,
  good = false,
  warning = false,
}: {
  label: string;
  value: number;
  good?: boolean;
  warning?: boolean;
}) {
  const tone = warning
    ? "text-rose-700"
    : good
      ? "text-emerald-700"
      : "text-slate-900";

  return (
    <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={`mt-1 text-lg font-bold tabular-nums ${tone}`}>
        {value.toLocaleString("pt-BR")}
      </div>
    </div>
  );
}

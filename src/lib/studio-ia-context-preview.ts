import { supabase } from "@/lib/supabase";

const DEFAULT_API_BASE_URL = "https://ac360-mercadolivre-api-production.up.railway.app";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SOURCE_LABELS: Record<string, string> = {
  orders: "Pedidos",
  products: "Produtos",
  listings: "Anúncios",
  inventory: "Estoque",
  metrics_daily: "Métricas diárias",
  ads_metrics: "Métricas de Ads",
  financial: "Dados financeiros",
  payments: "Pagamentos",
};

export type StudioIaSourceState = "available" | "empty" | "unavailable" | "unknown";

export type StudioIaSourceStatus = {
  key: string;
  label: string;
  table: string | null;
  count: number | null;
  state: StudioIaSourceState;
  required: boolean;
  message: string | null;
};

export type StudioIaContextPreview = {
  sources: StudioIaSourceStatus[];
  totalSources: number;
  availableSources: number;
  generatedAt: string | null;
};

export type StudioIaPreviewErrorKind =
  "not_deployed" | "unauthenticated" | "forbidden" | "unavailable" | "invalid_response";

export class StudioIaPreviewError extends Error {
  readonly kind: StudioIaPreviewErrorKind;
  readonly status: number | null;

  constructor(message: string, kind: StudioIaPreviewErrorKind, status: number | null = null) {
    super(message);
    this.name = "StudioIaPreviewError";
    this.kind = kind;
    this.status = status;
  }
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function firstDefined(record: UnknownRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function normalizeKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function sourceState(record: UnknownRecord, count: number | null): StudioIaSourceState {
  const rawState = normalizeKey(firstDefined(record, ["state", "status", "availability"]));
  const hasError = Boolean(firstDefined(record, ["error", "error_message"]));
  const available = record.available;

  if (
    hasError ||
    ["unavailable", "error", "failed", "missing", "blocked"].includes(rawState) ||
    available === false
  ) {
    return "unavailable";
  }

  if (rawState === "empty" || count === 0) return "empty";
  if (count !== null && count > 0) return "available";
  if (
    available === true ||
    ["available", "ready", "ok", "connected", "success"].includes(rawState)
  ) {
    return "available";
  }

  return "unknown";
}

function normalizeSource(value: unknown, fallbackKey?: string): StudioIaSourceStatus | null {
  const numericValue = toFiniteNumber(value);
  const record = asRecord(value) ?? (numericValue !== null ? { count: numericValue } : null);
  if (!record) return null;

  const key = normalizeKey(firstDefined(record, ["key", "source", "name", "id"]) ?? fallbackKey);
  if (!key) return null;

  const count = toFiniteNumber(
    firstDefined(record, ["count", "row_count", "records", "total", "available_rows"]),
  );
  const tableValue = firstDefined(record, ["table", "table_name"]);
  const messageValue = firstDefined(record, ["message", "error", "error_message"]);
  const labelValue = firstDefined(record, ["label", "title"]);

  return {
    key,
    label: String(labelValue ?? SOURCE_LABELS[key] ?? key.replace(/_/g, " ")),
    table: tableValue ? String(tableValue) : null,
    count,
    state: sourceState(record, count),
    required: record.required !== false,
    message: messageValue ? String(messageValue) : null,
  };
}

function findSources(payload: UnknownRecord): unknown {
  const directCandidates = [
    payload.sources,
    payload.source_statuses,
    payload.source_counts,
    payload.counts,
  ];

  for (const candidate of directCandidates) {
    if (candidate !== undefined && candidate !== null) return candidate;
  }

  for (const key of ["data", "result", "preview", "context"]) {
    const nested = asRecord(payload[key]);
    if (!nested) continue;
    const candidate = findSources(nested);
    if (candidate !== undefined && candidate !== null) return candidate;
  }

  return null;
}

function normalizeSources(container: unknown): StudioIaSourceStatus[] {
  if (Array.isArray(container)) {
    return container
      .map((value) => normalizeSource(value))
      .filter((source): source is StudioIaSourceStatus => source !== null);
  }

  const record = asRecord(container);
  if (!record) return [];

  return Object.entries(record)
    .map(([key, value]) => normalizeSource(value, key))
    .filter((source): source is StudioIaSourceStatus => source !== null);
}

function getGeneratedAt(payload: UnknownRecord): string | null {
  const candidates: UnknownRecord[] = [payload];
  for (const key of ["data", "result", "preview", "context"]) {
    const nested = asRecord(payload[key]);
    if (nested) candidates.push(nested);
  }

  for (const candidate of candidates) {
    const value = firstDefined(candidate, ["generated_at", "checked_at", "created_at"]);
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

export function normalizeStudioIaContextPreview(payload: unknown): StudioIaContextPreview {
  const record = asRecord(payload);
  if (!record || record.success === false) {
    throw new StudioIaPreviewError(
      "O backend retornou um diagnóstico inválido.",
      "invalid_response",
    );
  }

  const sources = normalizeSources(findSources(record));
  if (sources.length === 0) {
    throw new StudioIaPreviewError(
      "O diagnóstico não informou o estado das fontes.",
      "invalid_response",
    );
  }

  return {
    sources,
    totalSources: sources.length,
    availableSources: sources.filter(
      (source) => source.state === "available" || source.state === "empty",
    ).length,
    generatedAt: getGeneratedAt(record),
  };
}

async function responsePayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function responseMessage(payload: unknown): string | null {
  const record = asRecord(payload);
  if (!record) return null;
  const value = firstDefined(record, ["error", "message"]);
  return typeof value === "string" && value.trim() ? value : null;
}

type StudioIaSessionReader = {
  getSession: () => Promise<{
    data: {
      session: {
        access_token: string;
      } | null;
    };
    error: unknown;
  }>;
};

export async function getStudioIaContextPreview({
  companyId,
  accountId,
  signal,
}: {
  companyId: string;
  accountId: string;
  signal?: AbortSignal;
}): Promise<StudioIaContextPreview> {
  if (!UUID_PATTERN.test(companyId) || !UUID_PATTERN.test(accountId)) {
    throw new StudioIaPreviewError("Empresa ou conta ativa inválida.", "invalid_response");
  }

  const { data, error } = await (supabase.auth as unknown as StudioIaSessionReader).getSession();
  if (error || !data.session?.access_token) {
    throw new StudioIaPreviewError(
      "Sua sessão expirou. Entre novamente para verificar as fontes.",
      "unauthenticated",
      401,
    );
  }

  const configuredBaseUrl = String(import.meta.env.VITE_AC360_API_URL ?? "").trim();
  const apiBaseUrl = (configuredBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
  const url = new URL(`${apiBaseUrl}/api/ecommerce/studio-ia/context-preview`);
  url.searchParams.set("company_id", companyId);
  url.searchParams.set("account_id", accountId);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
      signal,
    });
  } catch (requestError) {
    if (requestError instanceof DOMException && requestError.name === "AbortError") {
      throw requestError;
    }
    throw new StudioIaPreviewError(
      "O diagnóstico está temporariamente indisponível.",
      "unavailable",
    );
  }

  const payload = await responsePayload(response);
  if (!response.ok) {
    const backendMessage = responseMessage(payload);
    if (response.status === 401) {
      throw new StudioIaPreviewError(
        backendMessage ?? "Sua sessão expirou. Entre novamente.",
        "unauthenticated",
        401,
      );
    }
    if (response.status === 403) {
      throw new StudioIaPreviewError(
        backendMessage ?? "Você não possui acesso a esta conta.",
        "forbidden",
        403,
      );
    }
    if (response.status === 404) {
      throw new StudioIaPreviewError(
        "O diagnóstico está pronto no frontend e aguarda a implantação do backend.",
        "not_deployed",
        404,
      );
    }
    throw new StudioIaPreviewError(
      backendMessage ?? "O diagnóstico está temporariamente indisponível.",
      "unavailable",
      response.status,
    );
  }

  return normalizeStudioIaContextPreview(payload);
}
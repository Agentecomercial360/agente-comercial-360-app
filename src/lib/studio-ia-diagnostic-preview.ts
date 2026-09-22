import { supabase } from "@/lib/supabase";

const DEFAULT_API_BASE_URL = "https://ac360-mercadolivre-api-production.up.railway.app";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type DiagnosticSummary = {
  orders_checked: number | null;
  revenue_ready_orders: number | null;
  costs_pending: boolean | null;
  profit_margin_available: boolean | null;
  attention_points_count: number | null;
  opportunities_count: number | null;
  suggested_tasks_count: number | null;
  sources_checked: number | null;
  sources_available: number | null;
};

export type DiagnosticFinancialStatus = {
  revenue_status: string | null;
  cost_status: string | null;
  profit_margin_status: string | null;
  message: string | null;
};

export type DiagnosticSourceStatus = {
  source: string;
  available: boolean | null;
  count: number | null;
  status: string | null;
};

export type DiagnosticItem = {
  title: string;
  severity: string | null;
  description: string | null;
  recommendation: string | null;
  confidence: number | null;
  requires_human_review: boolean | null;
};

export type StudioIaDiagnosticPreview = {
  mode: string | null;
  writeOperationsAllowed: boolean;
  writeOperationsExecuted: boolean;
  externalAiCalled: boolean;
  externalMarketplaceCalled: boolean;
  summary: DiagnosticSummary;
  financialStatus: DiagnosticFinancialStatus;
  sourceStatus: DiagnosticSourceStatus[];
  attentionPoints: DiagnosticItem[];
  opportunities: DiagnosticItem[];
  suggestedTasks: DiagnosticItem[];
  warnings: string[];
  generatedAt: string | null;
  raw: unknown;
};

export type StudioIaDiagnosticErrorKind =
  | "not_deployed"
  | "unauthenticated"
  | "forbidden"
  | "unavailable"
  | "invalid_response";

export class StudioIaDiagnosticError extends Error {
  readonly kind: StudioIaDiagnosticErrorKind;
  readonly status: number | null;

  constructor(message: string, kind: StudioIaDiagnosticErrorKind, status: number | null = null) {
    super(message);
    this.name = "StudioIaDiagnosticError";
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

function pick(record: UnknownRecord | null, keys: string[]): unknown {
  if (!record) return undefined;
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toBool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "sim", "yes", "1"].includes(v)) return true;
    if (["false", "nao", "não", "no", "0"].includes(v)) return false;
  }
  return null;
}

function toText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

function toItems(value: unknown): DiagnosticItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): DiagnosticItem | null => {
      if (typeof entry === "string") {
        return {
          title: entry,
          severity: null,
          description: null,
          recommendation: null,
          confidence: null,
          requires_human_review: null,
        };
      }
      const record = asRecord(entry);
      if (!record) return null;
      const title = toText(pick(record, ["title", "name", "label", "task_title"]));
      return {
        title: title ?? "Item sem título",
        severity: toText(pick(record, ["severity", "priority", "level"])),
        description: toText(pick(record, ["description", "detail", "diagnosis", "message"])),
        recommendation: toText(
          pick(record, ["recommendation", "recommended_action", "action", "suggestion"]),
        ),
        confidence: toNumber(pick(record, ["confidence", "confidence_score"])),
        requires_human_review: toBool(
          pick(record, ["requires_human_review", "requires_approval", "human_review"]),
        ),
      };
    })
    .filter((item): item is DiagnosticItem => item !== null);
}

function toSources(value: unknown): DiagnosticSourceStatus[] {
  const fromEntry = (entry: unknown, fallbackKey?: string): DiagnosticSourceStatus | null => {
    const record = asRecord(entry);
    if (!record) {
      const count = toNumber(entry);
      if (fallbackKey && count !== null) {
        return { source: fallbackKey, available: count > 0, count, status: null };
      }
      return null;
    }
    const source = toText(pick(record, ["source", "name", "key", "table"])) ?? fallbackKey ?? null;
    if (!source) return null;
    const count = toNumber(pick(record, ["count", "records", "total", "row_count"]));
    const available = toBool(pick(record, ["available", "is_available"]));
    return {
      source,
      available: available ?? (count !== null ? count > 0 : null),
      count,
      status: toText(pick(record, ["status", "state", "message"])),
    };
  };

  if (Array.isArray(value)) {
    return value
      .map((entry) => fromEntry(entry))
      .filter((s): s is DiagnosticSourceStatus => s !== null);
  }
  const record = asRecord(value);
  if (!record) return [];
  return Object.entries(record)
    .map(([key, entry]) => fromEntry(entry, key))
    .filter((s): s is DiagnosticSourceStatus => s !== null);
}

export function normalizeStudioIaDiagnosticPreview(payload: unknown): StudioIaDiagnosticPreview {
  const root = asRecord(payload);
  if (!root || root.success === false) {
    throw new StudioIaDiagnosticError(
      "O backend retornou um diagnóstico inválido.",
      "invalid_response",
    );
  }

  const data = asRecord(root.data) ?? asRecord(root.result) ?? root;
  const summaryRecord = asRecord(pick(data, ["summary"]) ?? pick(root, ["summary"])) ?? {};
  const financialRecord =
    asRecord(pick(data, ["financial_status"]) ?? pick(root, ["financial_status"])) ?? {};

  const sourceStatus = toSources(pick(data, ["source_status"]) ?? pick(root, ["source_status"]));
  const attentionPoints = toItems(
    pick(data, ["attention_points"]) ?? pick(root, ["attention_points"]),
  );
  const opportunities = toItems(pick(data, ["opportunities"]) ?? pick(root, ["opportunities"]));
  const suggestedTasks = toItems(pick(data, ["suggested_tasks"]) ?? pick(root, ["suggested_tasks"]));

  const warningsRaw = pick(data, ["warnings"]) ?? pick(root, ["warnings"]);
  const warnings = Array.isArray(warningsRaw)
    ? warningsRaw.map((w) => toText(w) ?? toText(pick(asRecord(w), ["message"]))).filter(
        (w): w is string => Boolean(w),
      )
    : [];

  return {
    mode: toText(pick(root, ["mode"]) ?? pick(data, ["mode"])),
    writeOperationsAllowed: toBool(pick(root, ["write_operations_allowed"])) ?? false,
    writeOperationsExecuted: toBool(pick(root, ["write_operations_executed"])) ?? false,
    externalAiCalled: toBool(pick(root, ["external_ai_called"])) ?? false,
    externalMarketplaceCalled: toBool(pick(root, ["external_marketplace_called"])) ?? false,
    summary: {
      orders_checked: toNumber(pick(summaryRecord, ["orders_checked"])),
      revenue_ready_orders: toNumber(pick(summaryRecord, ["revenue_ready_orders"])),
      costs_pending: toBool(summaryRecord.costs_pending),
      profit_margin_available: toBool(summaryRecord.profit_margin_available),
      attention_points_count:
        toNumber(pick(summaryRecord, ["attention_points_count"])) ?? attentionPoints.length,
      opportunities_count:
        toNumber(pick(summaryRecord, ["opportunities_count"])) ?? opportunities.length,
      suggested_tasks_count:
        toNumber(pick(summaryRecord, ["suggested_tasks_count"])) ?? suggestedTasks.length,
      sources_checked: toNumber(pick(summaryRecord, ["sources_checked"])) ?? sourceStatus.length,
      sources_available:
        toNumber(pick(summaryRecord, ["sources_available"])) ??
        sourceStatus.filter((s) => s.available).length,
    },
    financialStatus: {
      revenue_status: toText(pick(financialRecord, ["revenue_status"])),
      cost_status: toText(pick(financialRecord, ["cost_status"])),
      profit_margin_status: toText(pick(financialRecord, ["profit_margin_status"])),
      message: toText(pick(financialRecord, ["message"])),
    },
    sourceStatus,
    attentionPoints,
    opportunities,
    suggestedTasks,
    warnings,
    generatedAt: toText(pick(data, ["generated_at", "checked_at", "created_at"])),
    raw: payload,
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
  const value = pick(record, ["error", "message"]);
  return typeof value === "string" && value.trim() ? value : null;
}

export async function getStudioIaDiagnosticPreview({
  companyId,
  accountId,
  signal,
}: {
  companyId: string;
  accountId: string;
  signal?: AbortSignal;
}): Promise<StudioIaDiagnosticPreview> {
  if (!UUID_PATTERN.test(companyId) || !UUID_PATTERN.test(accountId)) {
    throw new StudioIaDiagnosticError("Empresa ou conta ativa inválida.", "invalid_response");
  }

  const { data, error } = await supabase.auth.getSession();
  const accessToken = data?.session?.access_token;
  if (error || !accessToken) {
    throw new StudioIaDiagnosticError(
      "Sua sessão expirou. Entre novamente para carregar o diagnóstico.",
      "unauthenticated",
      401,
    );
  }

  const configuredBaseUrl = String(import.meta.env.VITE_AC360_API_URL ?? "").trim();
  const apiBaseUrl = (configuredBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
  const url = new URL(`${apiBaseUrl}/api/ecommerce/studio-ia/diagnostic-preview`);
  url.searchParams.set("company_id", companyId);
  url.searchParams.set("account_id", accountId);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  } catch (requestError) {
    if (requestError instanceof DOMException && requestError.name === "AbortError") {
      throw requestError;
    }
    throw new StudioIaDiagnosticError(
      "O diagnóstico está temporariamente indisponível.",
      "unavailable",
    );
  }

  const payload = await responsePayload(response);
  if (!response.ok) {
    const backendMessage = responseMessage(payload);
    if (response.status === 401) {
      throw new StudioIaDiagnosticError(
        backendMessage ?? "Sua sessão expirou. Entre novamente.",
        "unauthenticated",
        401,
      );
    }
    if (response.status === 403) {
      throw new StudioIaDiagnosticError(
        backendMessage ?? "Você não possui acesso a esta conta.",
        "forbidden",
        403,
      );
    }
    if (response.status === 404) {
      throw new StudioIaDiagnosticError(
        "O diagnóstico ainda não está disponível neste ambiente.",
        "not_deployed",
        404,
      );
    }
    throw new StudioIaDiagnosticError(
      backendMessage ?? "O diagnóstico está temporariamente indisponível.",
      "unavailable",
      response.status,
    );
  }

  return normalizeStudioIaDiagnosticPreview(payload);
}

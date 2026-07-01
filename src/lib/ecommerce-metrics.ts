/**
 * Shared metrics layer for E-commerce screens.
 *
 * Single source of truth used by Visão Geral (dashboard) e Mapa de Vendas,
 * garantindo que filtro de período, campo de data, campo de valor e regra
 * de cancelamento sejam idênticos em todas as telas.
 *
 * Regras:
 *  - company_id + account_id ativo aplicados em todas as queries.
 *  - Campo de data: order_date.
 *  - Campo de valor: total_amount.
 *  - Timezone: America/Sao_Paulo (UTC-3, sem DST) para o corte diário.
 *  - "Hoje" = 00:00:00.000 até 23:59:59.999 no horário de Brasília.
 *  - Pedidos com order_status = "cancelled" / "canceled" NÃO entram nos totais.
 */

// São Paulo é UTC-3 permanente desde 2019 (sem horário de verão).
const SP_OFFSET_HOURS = -3;

export type PeriodKey = "today" | "7d" | "30d";

export type PeriodRange = {
  key: PeriodKey;
  /** Inclusive lower bound, ISO UTC. */
  sinceISO: string;
  /** Inclusive upper bound, ISO UTC (fim do dia em SP). */
  untilISO: string;
  /** YYYY-MM-DD em SP para exibição / debug. */
  spStartDate: string;
  spEndDate: string;
  label: string;
};

export const CANCELLED_ORDER_STATUSES = ["cancelled", "canceled"];

export function isCancelled(orderStatus: string | null | undefined): boolean {
  return CANCELLED_ORDER_STATUSES.includes((orderStatus ?? "").toLowerCase());
}

function spNowParts(now: Date = new Date()) {
  // Desloca "now" UTC para o wall-clock de São Paulo, expresso em UTC.
  const sp = new Date(now.getTime() + SP_OFFSET_HOURS * 3600 * 1000);
  return {
    Y: sp.getUTCFullYear(),
    M: sp.getUTCMonth(),
    D: sp.getUTCDate(),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function getPeriodRange(period: PeriodKey, now: Date = new Date()): PeriodRange {
  const { Y, M, D } = spNowParts(now);
  const daysBack = period === "today" ? 0 : period === "7d" ? 6 : 29;
  // Início do dia em SP (00:00 SP = 03:00 UTC).
  const startUtcMs = Date.UTC(Y, M, D - daysBack, -SP_OFFSET_HOURS, 0, 0, 0);
  // Fim do dia em SP (23:59:59.999 SP = 02:59:59.999 UTC do dia seguinte).
  const endUtcMs = Date.UTC(Y, M, D + 1, -SP_OFFSET_HOURS, 0, 0, 0) - 1;
  const startDate = new Date(startUtcMs);
  const endDate = new Date(endUtcMs);
  const startSP = new Date(startDate.getTime() + SP_OFFSET_HOURS * 3600 * 1000);
  const endSP = new Date(endDate.getTime() + SP_OFFSET_HOURS * 3600 * 1000);
  const label =
    period === "today"
      ? "Hoje"
      : period === "7d"
        ? "Últimos 7 dias"
        : "Últimos 30 dias";
  return {
    key: period,
    sinceISO: startDate.toISOString(),
    untilISO: endDate.toISOString(),
    spStartDate: `${startSP.getUTCFullYear()}-${pad(startSP.getUTCMonth() + 1)}-${pad(startSP.getUTCDate())}`,
    spEndDate: `${endSP.getUTCFullYear()}-${pad(endSP.getUTCMonth() + 1)}-${pad(endSP.getUTCDate())}`,
    label,
  };
}

export function periodCountLabel(period: PeriodKey, base: "orders" | "revenue"): string {
  const isToday = period === "today";
  if (base === "orders") return isToday ? "Pedidos hoje" : "Pedidos no período";
  return isToday ? "Faturamento hoje" : "Faturamento no período";
}

/** Contrato mínimo dos pedidos para o cálculo compartilhado. */
export type OrderMetricRow = {
  id: string;
  order_status?: string | null;
  total_amount?: number | null;
  buyer_city?: string | null;
  buyer_state?: string | null;
};

export type OrderMetrics = {
  totalOrders: number;
  totalRevenue: number;
  ordersWithLocation: number;
  ordersWithoutLocation: number;
  revenueWithLocation: number;
  revenueWithoutLocation: number;
  ticket: number;
  cancelledCount: number;
};

function hasLocation(o: OrderMetricRow): boolean {
  return !!(o.buyer_state && o.buyer_state.trim() && o.buyer_city && o.buyer_city.trim());
}

export function aggregateOrderMetrics(rows: OrderMetricRow[]): OrderMetrics {
  let totalOrders = 0;
  let totalRevenue = 0;
  let ordersWithLocation = 0;
  let ordersWithoutLocation = 0;
  let revenueWithLocation = 0;
  let revenueWithoutLocation = 0;
  let cancelledCount = 0;
  for (const o of rows) {
    if (isCancelled(o.order_status)) {
      cancelledCount += 1;
      continue;
    }
    const v = Number(o.total_amount ?? 0);
    totalOrders += 1;
    totalRevenue += v;
    if (hasLocation(o)) {
      ordersWithLocation += 1;
      revenueWithLocation += v;
    } else {
      ordersWithoutLocation += 1;
      revenueWithoutLocation += v;
    }
  }
  return {
    totalOrders,
    totalRevenue,
    ordersWithLocation,
    ordersWithoutLocation,
    revenueWithLocation,
    revenueWithoutLocation,
    ticket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    cancelledCount,
  };
}

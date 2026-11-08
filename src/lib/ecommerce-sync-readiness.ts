/**
 * Single UI contract for Mercado Livre OAuth and initial-import status.
 * Authorization and data import are separate, independently verified events.
 * This is a pure function: it does not trigger marketplace calls or sync jobs.
 */
export type MarketplaceReadinessKind =
  | "authorization_pending"
  | "initial_pending"
  | "running"
  | "failed"
  | "imported";

export type MarketplaceReadiness = {
  kind: MarketplaceReadinessKind;
  initialImportComplete: boolean;
  canUseImportedFeed: boolean;
};

export function getMarketplaceReadiness({
  isAuthorized,
  syncStatus,
  initialSyncCompletedAt,
}: {
  isAuthorized: boolean;
  syncStatus?: string | null;
  initialSyncCompletedAt?: string | null;
}): MarketplaceReadiness {
  const initialImportComplete = Boolean(initialSyncCompletedAt);
  const canUseImportedFeed = isAuthorized && initialImportComplete;
  if (!isAuthorized) {
    return { kind: "authorization_pending", initialImportComplete, canUseImportedFeed: false };
  }
  const status = (syncStatus ?? "").trim().toLowerCase();
  if (status === "running") {
    return { kind: "running", initialImportComplete, canUseImportedFeed };
  }
  if (status === "failed" || status === "error") {
    return { kind: "failed", initialImportComplete, canUseImportedFeed };
  }
  if (initialImportComplete) {
    return { kind: "imported", initialImportComplete, canUseImportedFeed };
  }
  return { kind: "initial_pending", initialImportComplete: false, canUseImportedFeed: false };
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { useEcommerceActiveAccount } from "@/lib/ecommerce-active-account";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/debug/competition-api")({
  component: DebugCompetitionApiRoute,
});

const API_BASE = "https://ac360-mercadolivre-api-production.up.railway.app";

type SessionState = "checking" | "authenticated" | "missing";

type EcommerceAccountContextRow = {
  id: string;
  company_id: string | null;
  account_name: string | null;
  marketplace: string | null;
  auth_status: string | null;
  is_active: boolean | null;
};

type AccountContextState =
  | { status: "idle"; account: null; companyName: null; error: null }
  | { status: "loading"; account: null; companyName: null; error: null }
  | { status: "missing"; account: null; companyName: null; error: null }
  | { status: "error"; account: null; companyName: null; error: string }
  | {
      status: "ready";
      account: EcommerceAccountContextRow;
      companyName: string | null;
      error: null;
    };

type RunResult = {
  httpStatus: number | null;
  durationMs: number;
  body: string;
  interpretation: string;
  networkError?: string;
  parsed?: unknown;
};

type ListingRow = {
  id: string;
  product_id: string | null;
  ml_item_id: string | null;
  external_listing_id: string | null;
  external_sku: string | null;
  title: string | null;
  price: number | null;
  listing_url: string | null;
  external_url: string | null;
  status: string | null;
  is_active: boolean | null;
};

type FreeShippingTri = "yes" | "no" | "unknown";

function interpretStatus(status: number | null, networkError?: string): string {
  if (networkError) return "Frontend não conseguiu alcançar o backend.";
  if (status === 200) return "OK.";
  if (status === 201) return "Criado com sucesso.";
  if (status === 400) return "Dados obrigatórios inválidos.";
  if (status === 401) return "Sessão inválida.";
  if (status === 403) return "Usuário sem permissão para esta empresa ou conta.";
  if (status === 404) return "Recurso não encontrado na conta ativa.";
  if (status === 500) return "Erro interno no backend.";
  return `Resposta HTTP ${status ?? "desconhecida"}.`;
}

function interpretWatchlistPost(status: number | null, networkError?: string): string {
  if (networkError) return "Frontend não conseguiu alcançar o backend.";
  if (status === 201) return "Produto adicionado ao monitoramento.";
  if (status === 200) return "Produto já existia e foi atualizado.";
  return interpretStatus(status);
}

function interpretManualAnalysis(status: number | null, networkError?: string): string {
  if (networkError) return "Frontend não conseguiu alcançar o backend.";
  if (status === 201) return "Análise registrada com sucesso.";
  if (status === 400) return "Campos obrigatórios ou concorrente inválido.";
  if (status === 404) return "Watchlist não encontrada na conta ativa.";
  return interpretStatus(status);
}

function formatMarketplace(value: string | null): string {
  const normalized = (value ?? "").toLowerCase().replace(/[\s-]/g, "_");
  if (normalized === "mercado_livre" || normalized === "mercadolivre" || normalized === "ml") {
    return "Mercado Livre";
  }
  return value || "—";
}

function formatAuthStatus(value: string | null): string {
  const normalized = (value ?? "").toLowerCase();
  if (["connected", "conectada", "conectado", "active", "ativa", "ativo"].includes(normalized)) {
    return "Conectada";
  }
  if (!value) return "—";
  return value;
}

function toNumberOrNull(v: string): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const cleaned = v.replace(",", ".").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function toIntOrNull(v: string): number | null {
  const n = toNumberOrNull(v);
  return n === null ? null : Math.trunc(n);
}

function toStringOrNull(v: string): string | null {
  const t = v.trim();
  return t === "" ? null : t;
}

function triToBool(v: FreeShippingTri): boolean | null {
  if (v === "yes") return true;
  if (v === "no") return false;
  return null;
}

function tryParseJson(text: string): { pretty: string; parsed: unknown } {
  try {
    const parsed = JSON.parse(text);
    return { pretty: JSON.stringify(parsed, null, 2), parsed };
  } catch {
    return { pretty: text, parsed: undefined };
  }
}

function DebugCompetitionApiRoute() {
  return (
    <EcommerceLayout>
      <DebugCompetitionApiPage />
    </EcommerceLayout>
  );
}

function DebugCompetitionApiPage() {
  const { activeAccount, activeAccountId, loading } = useEcommerceActiveAccount();
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [operatorName, setOperatorName] = useState<string>("");
  const [accountContext, setAccountContext] = useState<AccountContextState>({
    status: "idle",
    account: null,
    companyName: null,
    error: null,
  });

  // history diagnostic (mantido)
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  // Etapa 1 — listings
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minMarginPercent, setMinMarginPercent] = useState<string>("10");
  const [notes, setNotes] = useState<string>("");

  // Etapa 2 — watchlist
  const [watchlistId, setWatchlistId] = useState<string | null>(null);
  const [confirmingWatchlistPost, setConfirmingWatchlistPost] = useState(false);
  const [postingWatchlist, setPostingWatchlist] = useState(false);
  const [watchlistPostResult, setWatchlistPostResult] = useState<RunResult | null>(null);
  const [fetchingWatchlist, setFetchingWatchlist] = useState(false);
  const [watchlistGetResult, setWatchlistGetResult] = useState<RunResult | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<Array<Record<string, unknown>>>([]);

  // Etapa 3 — manual analysis (nosso anúncio)
  const [ownRankPosition, setOwnRankPosition] = useState<string>("");
  const [ownPrice, setOwnPrice] = useState<string>("");
  const [ownFreeShipping, setOwnFreeShipping] = useState<FreeShippingTri>("unknown");
  const [ownListingUrl, setOwnListingUrl] = useState<string>("");
  const [ownSoldQuantity, setOwnSoldQuantity] = useState<string>("");
  const [ownReviewsCount, setOwnReviewsCount] = useState<string>("");
  const [ownRatingAverage, setOwnRatingAverage] = useState<string>("");
  const [ownDeliveryText, setOwnDeliveryText] = useState<string>("");
  const [ownTitleQualityScore, setOwnTitleQualityScore] = useState<string>("");
  const [ownImageQualityScore, setOwnImageQualityScore] = useState<string>("");
  const [ownOfferQualityScore, setOwnOfferQualityScore] = useState<string>("");
  const [analysisNotes, setAnalysisNotes] = useState<string>("");

  // Etapa 3 — concorrente
  const [cUrl, setCUrl] = useState<string>("");
  const [cItemId, setCItemId] = useState<string>("");
  const [cTitle, setCTitle] = useState<string>("");
  const [cRank, setCRank] = useState<string>("");
  const [cPrice, setCPrice] = useState<string>("");
  const [cFreeShipping, setCFreeShipping] = useState<FreeShippingTri>("unknown");
  const [cSoldQuantity, setCSoldQuantity] = useState<string>("");
  const [cSellerNickname, setCSellerNickname] = useState<string>("");
  const [cSellerReputation, setCSellerReputation] = useState<string>("");
  const [cReviewsCount, setCReviewsCount] = useState<string>("");
  const [cRatingAverage, setCRatingAverage] = useState<string>("");
  const [cDeliveryText, setCDeliveryText] = useState<string>("");
  const [cInstallmentsText, setCInstallmentsText] = useState<string>("");
  const [cDiscountPercent, setCDiscountPercent] = useState<string>("");
  const [cTitleQualityScore, setCTitleQualityScore] = useState<string>("");
  const [cImageQualityScore, setCImageQualityScore] = useState<string>("");
  const [cOfferQualityScore, setCOfferQualityScore] = useState<string>("");
  const [cNotes, setCNotes] = useState<string>("");

  const [confirmingAnalysis, setConfirmingAnalysis] = useState(false);
  const [postingAnalysis, setPostingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RunResult | null>(null);

  // Etapa 4 — histórico filtrado
  const [historyResult, setHistoryResult] = useState<RunResult | null>(null);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  // sessão + operador
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSessionState(data.session ? "authenticated" : "missing");
      const u = data.session?.user;
      const displayName =
        (u?.user_metadata?.full_name as string | undefined) ||
        (u?.user_metadata?.name as string | undefined) ||
        u?.email ||
        "";
      setOperatorName(displayName);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const accountIdFromHeader = activeAccountId ?? activeAccount?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    if (loading) {
      setAccountContext({ status: "loading", account: null, companyName: null, error: null });
      setResult(null);
      return () => {
        cancelled = true;
      };
    }

    if (!accountIdFromHeader) {
      setAccountContext({ status: "missing", account: null, companyName: null, error: null });
      setResult(null);
      return () => {
        cancelled = true;
      };
    }

    setAccountContext({ status: "loading", account: null, companyName: null, error: null });
    setResult(null);

    (async () => {
      const { data: accountData, error: accountError } = await supabase
        .from("ecommerce_accounts")
        .select("id, company_id, account_name, marketplace, auth_status, is_active")
        .eq("id", accountIdFromHeader)
        .maybeSingle();

      if (cancelled) return;

      if (accountError) {
        setAccountContext({
          status: "error",
          account: null,
          companyName: null,
          error: accountError.message,
        });
        return;
      }

      if (!accountData) {
        setAccountContext({ status: "missing", account: null, companyName: null, error: null });
        return;
      }

      const account = accountData as EcommerceAccountContextRow;

      if (!account.company_id) {
        setAccountContext({
          status: "ready",
          account,
          companyName: null,
          error: null,
        });
        return;
      }

      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("name")
        .eq("id", account.company_id)
        .maybeSingle();

      if (cancelled) return;

      if (companyError) {
        setAccountContext({
          status: "error",
          account: null,
          companyName: null,
          error: companyError.message,
        });
        return;
      }

      setAccountContext({
        status: "ready",
        account,
        companyName: (companyData as { name?: string | null } | null)?.name ?? null,
        error: null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [accountIdFromHeader, loading]);

  const account = accountContext.status === "ready" ? accountContext.account : null;
  const companyId = account?.company_id ?? null;
  const companyName = accountContext.status === "ready" ? accountContext.companyName : null;
  const accountId = account?.id ?? null;
  const accountName = account?.account_name ?? "—";
  const hasConsistentContext =
    !!accountIdFromHeader &&
    account?.id === accountIdFromHeader &&
    account?.is_active === true &&
    !!accountId &&
    !!companyId &&
    !!companyName;

  const historyUrl = useMemo(() => {
    if (!hasConsistentContext || !companyId || !accountId) return null;
    const params = new URLSearchParams({
      company_id: companyId,
      account_id: accountId,
    });
    return `${API_BASE}/api/mercadolivre/competition/history?${params.toString()}`;
  }, [accountId, companyId, hasConsistentContext]);

  const canRunTest = sessionState === "authenticated" && hasConsistentContext && !!historyUrl;

  // Carregar anúncios da conta ativa
  useEffect(() => {
    let cancelled = false;

    if (!hasConsistentContext || !companyId || !accountId) {
      setListings([]);
      setSelectedListingId("");
      return () => {
        cancelled = true;
      };
    }

    setListingsLoading(true);
    setListingsError(null);
    (async () => {
      const { data, error } = await supabase
        .from("ecommerce_listings")
        .select(
          "id, product_id, ml_item_id, external_listing_id, external_sku, title, price, listing_url, external_url, status, is_active",
        )
        .eq("company_id", companyId)
        .eq("account_id", accountId)
        .eq("is_active", true)
        .order("title", { ascending: true })
        .limit(500);

      if (cancelled) return;
      if (error) {
        setListingsError(error.message);
        setListings([]);
      } else {
        setListings((data ?? []) as ListingRow[]);
      }
      setListingsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [companyId, accountId, hasConsistentContext]);

  const selectedListing = useMemo(
    () => listings.find((l) => l.id === selectedListingId) ?? null,
    [listings, selectedListingId],
  );

  // Ao trocar anúncio, preencher defaults (sem sobrescrever se usuário já editou o próprio own*).
  useEffect(() => {
    if (!selectedListing) return;
    setSearchQuery(selectedListing.title ?? "");
    if (selectedListing.price != null) setOwnPrice(String(selectedListing.price));
    const url = selectedListing.listing_url || selectedListing.external_url || "";
    if (url) setOwnListingUrl(url);
  }, [selectedListing]);

  // ---------- Sessão / token helper ----------
  // Banner: null | "renewing" | "renewed" | "failed"
  const [sessionBanner, setSessionBanner] = useState<
    null | "renewing" | "renewed" | "failed"
  >(null);

  /**
   * Retorna um access_token válido no momento da execução.
   * - lê getSession()
   * - se ausente / expirado / <120s para expirar → refreshSession()
   * - valida com getUser(token)
   * - bloqueia e sinaliza banner de falha se não for possível renovar
   * Nunca expõe o token em log, estado persistente ou UI.
   */
  async function getValidAccessToken(): Promise<string | null> {
    const nowSec = Math.floor(Date.now() / 1000);

    const { data: sessData } = await supabase.auth.getSession();
    let session = sessData.session;
    const expiresAt = session?.expires_at ?? 0;
    const needsRefresh = !session || !session.access_token || expiresAt - nowSec < 120;

    if (needsRefresh) {
      setSessionBanner("renewing");
      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
      if (refreshErr || !refreshed.session?.access_token) {
        setSessionBanner("failed");
        setSessionState("missing");
        return null;
      }
      session = refreshed.session;
    }

    const token = session?.access_token;
    if (!token) {
      setSessionBanner("failed");
      setSessionState("missing");
      return null;
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      setSessionBanner("failed");
      setSessionState("missing");
      return null;
    }

    setSessionState("authenticated");
    if (needsRefresh) setSessionBanner("renewed");
    else setSessionBanner(null);
    return token;
  }

  /**
   * Wrapper autenticado. Em caso de HTTP 401, tenta renovar a sessão UMA vez
   * e repete a mesma requisição. Nenhum retry adicional é feito.
   * Não limpa nada do formulário em falha.
   */
  async function authedFetch(url: string, init: RequestInit = {}): Promise<Response | null> {
    const token = await getValidAccessToken();
    if (!token) return null;

    const buildHeaders = (bearer: string): HeadersInit => ({
      ...(init.headers as Record<string, string> | undefined),
      Authorization: `Bearer ${bearer}`,
    });

    const first = await fetch(url, { ...init, headers: buildHeaders(token) });
    if (first.status !== 401) return first;

    // 401 → renovar sessão uma única vez e repetir.
    setSessionBanner("renewing");
    const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
    if (refreshErr || !refreshed.session?.access_token) {
      setSessionBanner("failed");
      setSessionState("missing");
      return first;
    }
    const newToken = refreshed.session.access_token;
    const { data: userData } = await supabase.auth.getUser(newToken);
    if (!userData.user) {
      setSessionBanner("failed");
      setSessionState("missing");
      return first;
    }
    setSessionBanner("renewed");
    setSessionState("authenticated");
    return fetch(url, { ...init, headers: buildHeaders(newToken) });
  }

  async function runHistoryDiagnostic() {
    if (running) return;
    setRunning(true);
    setResult(null);
    const started = performance.now();
    try {
      if (!canRunTest || !historyUrl) {
        setResult({
          httpStatus: null,
          durationMs: 0,
          body: "",
          interpretation: "Contexto E-commerce incompleto. Selecione uma conta ativa conectada.",
        });
        return;
      }
      const res = await authedFetch(historyUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res) {
        setResult({
          httpStatus: null,
          durationMs: 0,
          body: "",
          interpretation:
            "Sua sessão expirou e não pôde ser renovada. Entre novamente no AC360.",
        });
        return;
      }
      const durationMs = Math.round(performance.now() - started);
      const text = await res.text();
      const { pretty, parsed } = tryParseJson(text);
      setResult({
        httpStatus: res.status,
        durationMs,
        body: pretty,
        interpretation: interpretStatus(res.status),
        parsed,
      });
    } catch (err) {
      const durationMs = Math.round(performance.now() - started);
      const msg = err instanceof Error ? err.message : String(err);
      setResult({
        httpStatus: null,
        durationMs,
        body: "",
        interpretation: interpretStatus(null, msg),
        networkError: msg,
      });
    } finally {
      setRunning(false);
    }
  }

  const marginNumber = toNumberOrNull(minMarginPercent);
  const canOpenWatchlistConfirm =
    sessionState === "authenticated" &&
    hasConsistentContext &&
    !!selectedListing &&
    toStringOrNull(searchQuery) !== null &&
    marginNumber !== null;

  async function postWatchlist() {
    if (postingWatchlist) return;
    if (!canOpenWatchlistConfirm || !companyId || !accountId || !selectedListing) return;
    setPostingWatchlist(true);
    setWatchlistPostResult(null);
    const started = performance.now();
    try {
      const payload = {
        company_id: companyId,
        account_id: accountId,
        listing_id: selectedListing.id,
        search_query: searchQuery.trim(),
        min_margin_percent: marginNumber,
        notes: toStringOrNull(notes),
      };
      const res = await authedFetch(`${API_BASE}/api/mercadolivre/competition/watchlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res) {
        setWatchlistPostResult({
          httpStatus: null,
          durationMs: 0,
          body: "",
          interpretation:
            "Sua sessão não pôde ser renovada. Os dados preenchidos foram preservados. Entre novamente no AC360 antes de tentar novamente.",
        });
        return;
      }
      const durationMs = Math.round(performance.now() - started);
      const text = await res.text();
      const { pretty, parsed } = tryParseJson(text);
      setWatchlistPostResult({
        httpStatus: res.status,
        durationMs,
        body: pretty,
        interpretation: interpretWatchlistPost(res.status),
        parsed,
      });
      if ((res.status === 200 || res.status === 201) && parsed && typeof parsed === "object") {
        const p = parsed as Record<string, unknown>;
        const candidate =
          (p.id as string | undefined) ||
          ((p.result as Record<string, unknown> | undefined)?.id as string | undefined) ||
          ((p.data as Record<string, unknown> | undefined)?.id as string | undefined) ||
          ((p.watchlist as Record<string, unknown> | undefined)?.id as string | undefined);
        if (candidate) setWatchlistId(candidate);
      }
      setConfirmingWatchlistPost(false);
    } catch (err) {
      const durationMs = Math.round(performance.now() - started);
      const msg = err instanceof Error ? err.message : String(err);
      setWatchlistPostResult({
        httpStatus: null,
        durationMs,
        body: "",
        interpretation: interpretWatchlistPost(null, msg),
        networkError: msg,
      });
    } finally {
      setPostingWatchlist(false);
    }
  }

  async function getWatchlist() {
    if (fetchingWatchlist) return;
    if (!hasConsistentContext || !companyId || !accountId) return;
    setFetchingWatchlist(true);
    setWatchlistGetResult(null);
    const started = performance.now();
    try {
      const params = new URLSearchParams({ company_id: companyId, account_id: accountId });
      const res = await authedFetch(
        `${API_BASE}/api/mercadolivre/competition/watchlist?${params.toString()}`,
        { method: "GET", headers: { Accept: "application/json" } },
      );
      if (!res) {
        setWatchlistGetResult({
          httpStatus: null,
          durationMs: 0,
          body: "",
          interpretation:
            "Sua sessão expirou e não pôde ser renovada. Entre novamente no AC360.",
        });
        return;
      }
      const durationMs = Math.round(performance.now() - started);
      const text = await res.text();
      const { pretty, parsed } = tryParseJson(text);
      setWatchlistGetResult({
        httpStatus: res.status,
        durationMs,
        body: pretty,
        interpretation: interpretStatus(res.status),
        parsed,
      });
      // Tentar extrair array de itens
      let items: Array<Record<string, unknown>> = [];
      if (Array.isArray(parsed)) {
        items = parsed as Array<Record<string, unknown>>;
      } else if (parsed && typeof parsed === "object") {
        const p = parsed as Record<string, unknown>;
        const maybe =
          (p.items as unknown) ||
          (p.data as unknown) ||
          (p.results as unknown) ||
          (p.watchlist as unknown);
        if (Array.isArray(maybe)) items = maybe as Array<Record<string, unknown>>;
      }
      setWatchlistItems(items);
    } catch (err) {
      const durationMs = Math.round(performance.now() - started);
      const msg = err instanceof Error ? err.message : String(err);
      setWatchlistGetResult({
        httpStatus: null,
        durationMs,
        body: "",
        interpretation: interpretStatus(null, msg),
        networkError: msg,
      });
    } finally {
      setFetchingWatchlist(false);
    }
  }

  const ownRankNum = toIntOrNull(ownRankPosition);
  const ownPriceNum = toNumberOrNull(ownPrice);
  const cRankNum = toIntOrNull(cRank);
  const cPriceNum = toNumberOrNull(cPrice);
  const competitorHasIdentity =
    toStringOrNull(cTitle) !== null || toStringOrNull(cUrl) !== null || toStringOrNull(cItemId) !== null;

  const canOpenAnalysisConfirm =
    sessionState === "authenticated" &&
    hasConsistentContext &&
    !!watchlistId &&
    ownRankNum !== null &&
    ownPriceNum !== null &&
    cRankNum !== null &&
    cPriceNum !== null &&
    competitorHasIdentity;

  async function postManualAnalysis() {
    if (postingAnalysis) return;
    if (!canOpenAnalysisConfirm || !companyId || !accountId || !watchlistId) return;
    setPostingAnalysis(true);
    setAnalysisResult(null);
    const started = performance.now();
    try {
      const payload = {
        company_id: companyId,
        account_id: accountId,
        watchlist_id: watchlistId,
        observed_at: new Date().toISOString(),
        search_query: toStringOrNull(searchQuery),
        operator_name: toStringOrNull(operatorName),
        notes: toStringOrNull(analysisNotes),
        own: {
          rank_position: ownRankNum,
          price: ownPriceNum,
          free_shipping: triToBool(ownFreeShipping),
          listing_url: toStringOrNull(ownListingUrl),
          sold_quantity: toIntOrNull(ownSoldQuantity),
          reviews_count: toIntOrNull(ownReviewsCount),
          rating_average: toNumberOrNull(ownRatingAverage),
          delivery_text: toStringOrNull(ownDeliveryText),
          title_quality_score: toNumberOrNull(ownTitleQualityScore),
          image_quality_score: toNumberOrNull(ownImageQualityScore),
          offer_quality_score: toNumberOrNull(ownOfferQualityScore),
        },
        competitors: [
          {
            item_url: toStringOrNull(cUrl),
            ml_item_id: toStringOrNull(cItemId),
            title: toStringOrNull(cTitle),
            rank_position: cRankNum,
            price: cPriceNum,
            is_primary: true,
            free_shipping: triToBool(cFreeShipping),
            sold_quantity: toIntOrNull(cSoldQuantity),
            seller_nickname: toStringOrNull(cSellerNickname),
            seller_reputation: toStringOrNull(cSellerReputation),
            reviews_count: toIntOrNull(cReviewsCount),
            rating_average: toNumberOrNull(cRatingAverage),
            delivery_text: toStringOrNull(cDeliveryText),
            installments_text: toStringOrNull(cInstallmentsText),
            discount_percent: toNumberOrNull(cDiscountPercent),
            title_quality_score: toNumberOrNull(cTitleQualityScore),
            image_quality_score: toNumberOrNull(cImageQualityScore),
            offer_quality_score: toNumberOrNull(cOfferQualityScore),
            notes: toStringOrNull(cNotes),
          },
        ],
      };
      const res = await fetch(`${API_BASE}/api/mercadolivre/competition/manual-analysis`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const durationMs = Math.round(performance.now() - started);
      const text = await res.text();
      const { pretty, parsed } = tryParseJson(text);
      setAnalysisResult({
        httpStatus: res.status,
        durationMs,
        body: pretty,
        interpretation: interpretManualAnalysis(res.status),
        parsed,
      });
      setConfirmingAnalysis(false);
      if (res.status === 201) {
        // Etapa 4 — atualizar histórico automaticamente
        void refreshHistory();
      }
    } catch (err) {
      const durationMs = Math.round(performance.now() - started);
      const msg = err instanceof Error ? err.message : String(err);
      setAnalysisResult({
        httpStatus: null,
        durationMs,
        body: "",
        interpretation: interpretManualAnalysis(null, msg),
        networkError: msg,
      });
    } finally {
      setPostingAnalysis(false);
    }
  }

  async function refreshHistory() {
    if (fetchingHistory) return;
    if (!hasConsistentContext || !companyId || !accountId) return;
    setFetchingHistory(true);
    setHistoryResult(null);
    const started = performance.now();
    try {
      const token = await withToken();
      if (!token) {
        setHistoryResult({
          httpStatus: null,
          durationMs: 0,
          body: "",
          interpretation: "Sessão inválida.",
        });
        return;
      }
      const params = new URLSearchParams({ company_id: companyId, account_id: accountId });
      if (watchlistId) params.set("watchlist_id", watchlistId);
      const res = await fetch(
        `${API_BASE}/api/mercadolivre/competition/history?${params.toString()}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } },
      );
      const durationMs = Math.round(performance.now() - started);
      const text = await res.text();
      const { pretty, parsed } = tryParseJson(text);
      setHistoryResult({
        httpStatus: res.status,
        durationMs,
        body: pretty,
        interpretation: interpretStatus(res.status),
        parsed,
      });
    } catch (err) {
      const durationMs = Math.round(performance.now() - started);
      const msg = err instanceof Error ? err.message : String(err);
      setHistoryResult({
        httpStatus: null,
        durationMs,
        body: "",
        interpretation: interpretStatus(null, msg),
        networkError: msg,
      });
    } finally {
      setFetchingHistory(false);
    }
  }

  // ------------------ Render helpers ------------------

  const analysisParsedObj =
    analysisResult?.parsed && typeof analysisResult.parsed === "object"
      ? (analysisResult.parsed as Record<string, unknown>)
      : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Diagnóstico da API de Concorrência
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Página técnica temporária. Fluxo em 4 etapas para validar as rotas de
          watchlist, análise manual e histórico.
        </p>
      </div>

      {/* ---------- Contexto ---------- */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Contexto
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">Sessão</dt>
            <dd className="font-medium">
              {sessionState === "checking" && "Verificando…"}
              {sessionState === "authenticated" && (
                <span className="text-emerald-600">Autenticada</span>
              )}
              {sessionState === "missing" && (
                <span className="text-red-600">
                  Sessão autenticada não encontrada. Faça login novamente.
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Empresa</dt>
            <dd className="font-medium">
              {accountContext.status === "loading" ? "Carregando conta ativa..." : companyName ?? "—"}
            </dd>
            <dd className="text-xs text-muted-foreground font-mono break-all">
              {companyId ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Conta ativa</dt>
            <dd className="font-medium">
              {accountContext.status === "loading" && "Carregando conta ativa..."}
              {accountContext.status === "missing" && "Nenhuma conta E-commerce ativa foi identificada."}
              {accountContext.status === "error" && "Não foi possível carregar o contexto E-commerce."}
              {accountContext.status === "idle" && "—"}
              {accountContext.status === "ready" && accountName}
            </dd>
            <dd className="text-xs text-muted-foreground font-mono break-all">
              {accountId ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Marketplace</dt>
            <dd className="font-medium">{formatMarketplace(account?.marketplace ?? null)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Status</dt>
            <dd className="font-medium">
              {formatAuthStatus(account?.auth_status ?? null)}
              {account?.is_active === false ? " · Inativa" : ""}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Operador</dt>
            <dd className="font-medium">{operatorName || "—"}</dd>
          </div>
          {accountContext.status === "error" && (
            <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {accountContext.error}
            </div>
          )}
        </dl>
      </section>

      {/* ---------- Diagnóstico GET history (mantido) ---------- */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Diagnóstico — GET /history
        </h2>
        <div className="text-xs font-mono break-all bg-muted px-2 py-1.5 rounded">
          {historyUrl ?? "Aguardando contexto completo da conta ativa."}
        </div>
        <button
          type="button"
          onClick={runHistoryDiagnostic}
          disabled={running || !canRunTest}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--gradient-brand)" }}
        >
          {running ? "Testando…" : "Testar rota autenticada"}
        </button>
        {result && <ResultBlock result={result} okStatuses={[200]} />}
      </section>

      {/* ---------- ETAPA 1 — Selecionar anúncio ---------- */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Etapa 1 — Selecionar anúncio real da conta ativa
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Somente <code className="bg-muted px-1 rounded">ecommerce_listings</code> desta empresa e conta,
            com <code className="bg-muted px-1 rounded">is_active = true</code>.
          </p>
        </div>

        {listingsLoading && <div className="text-sm text-muted-foreground">Carregando anúncios…</div>}
        {listingsError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {listingsError}
          </div>
        )}
        {!listingsLoading && !listingsError && listings.length === 0 && hasConsistentContext && (
          <div className="text-sm text-muted-foreground">
            Nenhum anúncio ativo encontrado para esta conta.
          </div>
        )}

        {listings.length > 0 && (
          <>
            <label className="block text-sm">
              <span className="text-xs text-muted-foreground">Anúncio</span>
              <select
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">— Selecione —</option>
                {listings.map((l) => {
                  const mlb = l.ml_item_id || l.external_listing_id || "—";
                  const price = l.price != null ? `R$ ${Number(l.price).toFixed(2)}` : "s/ preço";
                  const sku = l.external_sku ? ` · SKU ${l.external_sku}` : "";
                  return (
                    <option key={l.id} value={l.id}>
                      {(l.title ?? "(sem título)") + ` · ${mlb} · ${price}` + sku}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-xs text-muted-foreground">Termo de busca</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Margem mínima desejada (%)</span>
                <input
                  type="number"
                  step="0.1"
                  value={minMarginPercent}
                  onChange={(e) => setMinMarginPercent(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Observação (opcional)</span>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
          </>
        )}
      </section>

      {/* ---------- ETAPA 2 — Watchlist ---------- */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Etapa 2 — Watchlist
          </h2>
          {watchlistId && (
            <div className="text-xs text-muted-foreground">
              watchlist_id atual: <span className="font-mono">{watchlistId}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setConfirmingWatchlistPost(true)}
            disabled={postingWatchlist || !canOpenWatchlistConfirm}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--gradient-brand)" }}
          >
            {postingWatchlist ? "Enviando…" : "Adicionar ao monitoramento"}
          </button>
          <button
            type="button"
            onClick={getWatchlist}
            disabled={fetchingWatchlist || !hasConsistentContext}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fetchingWatchlist ? "Consultando…" : "Consultar watchlist"}
          </button>
        </div>

        {confirmingWatchlistPost && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3 text-sm text-amber-900">
            <div className="font-semibold">Confirmar gravação</div>
            <ul className="text-xs space-y-1">
              <li>Empresa: <strong>{companyName ?? "—"}</strong></li>
              <li>Conta: <strong>{accountName}</strong></li>
              <li>Anúncio: <strong>{selectedListing?.title ?? "—"}</strong> ({selectedListing?.ml_item_id ?? "—"})</li>
              <li>Termo de busca: <strong>{searchQuery || "—"}</strong></li>
              <li>Margem mínima: <strong>{minMarginPercent}%</strong></li>
            </ul>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={postWatchlist}
                disabled={postingWatchlist}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                style={{ background: "var(--gradient-brand)" }}
              >
                {postingWatchlist ? "Enviando…" : "Confirmar POST"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingWatchlistPost(false)}
                disabled={postingWatchlist}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {watchlistPostResult && (
          <ResultBlock result={watchlistPostResult} okStatuses={[200, 201]} />
        )}

        {watchlistGetResult && (
          <ResultBlock result={watchlistGetResult} okStatuses={[200]} />
        )}

        {watchlistItems.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Selecionar um item da watchlist para usar como watchlist_id:
            </div>
            <select
              value={watchlistId ?? ""}
              onChange={(e) => setWatchlistId(e.target.value || null)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">— Selecione —</option>
              {watchlistItems.map((w, i) => {
                const id = String(w.id ?? "");
                const title = String(w.title ?? w.search_query ?? w.listing_title ?? "(sem título)");
                if (!id) return null;
                return (
                  <option key={id + i} value={id}>
                    {title} · {id}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </section>

      {/* ---------- ETAPA 3 — Análise manual ---------- */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Etapa 3 — Registrar medição manual
          </h2>
          {!watchlistId && (
            <p className="text-xs text-amber-700 mt-1">
              Habilita ao existir um watchlist_id válido (Etapa 2).
            </p>
          )}
        </div>

        <fieldset disabled={!watchlistId} className="space-y-4 disabled:opacity-60">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Nosso anúncio
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <TextField label="Posição na busca *" value={ownRankPosition} onChange={setOwnRankPosition} type="number" />
              <TextField label="Preço atual *" value={ownPrice} onChange={setOwnPrice} type="number" step="0.01" />
              <TriField label="Frete grátis" value={ownFreeShipping} onChange={setOwnFreeShipping} />
              <TextField className="sm:col-span-3" label="Link do anúncio" value={ownListingUrl} onChange={setOwnListingUrl} />
              <TextField label="Qtd. vendida exibida" value={ownSoldQuantity} onChange={setOwnSoldQuantity} type="number" />
              <TextField label="Qtd. avaliações" value={ownReviewsCount} onChange={setOwnReviewsCount} type="number" />
              <TextField label="Nota média (0-5)" value={ownRatingAverage} onChange={setOwnRatingAverage} type="number" step="0.1" />
              <TextField className="sm:col-span-3" label="Prazo/entrega" value={ownDeliveryText} onChange={setOwnDeliveryText} />
              <TextField label="Qualidade título (0-10)" value={ownTitleQualityScore} onChange={setOwnTitleQualityScore} type="number" step="0.1" />
              <TextField label="Qualidade imagem (0-10)" value={ownImageQualityScore} onChange={setOwnImageQualityScore} type="number" step="0.1" />
              <TextField label="Qualidade oferta (0-10)" value={ownOfferQualityScore} onChange={setOwnOfferQualityScore} type="number" step="0.1" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Concorrente principal
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <TextField className="sm:col-span-2" label="Link do anúncio" value={cUrl} onChange={setCUrl} />
              <TextField label="ID MLB" value={cItemId} onChange={setCItemId} />
              <TextField className="sm:col-span-3" label="Título *" value={cTitle} onChange={setCTitle} />
              <TextField label="Posição *" value={cRank} onChange={setCRank} type="number" />
              <TextField label="Preço *" value={cPrice} onChange={setCPrice} type="number" step="0.01" />
              <TriField label="Frete grátis" value={cFreeShipping} onChange={setCFreeShipping} />
              <TextField label="Qtd. vendida" value={cSoldQuantity} onChange={setCSoldQuantity} type="number" />
              <TextField label="Apelido vendedor" value={cSellerNickname} onChange={setCSellerNickname} />
              <TextField label="Reputação vendedor" value={cSellerReputation} onChange={setCSellerReputation} />
              <TextField label="Qtd. avaliações" value={cReviewsCount} onChange={setCReviewsCount} type="number" />
              <TextField label="Nota média (0-5)" value={cRatingAverage} onChange={setCRatingAverage} type="number" step="0.1" />
              <TextField label="Prazo/entrega" value={cDeliveryText} onChange={setCDeliveryText} />
              <TextField label="Parcelamento" value={cInstallmentsText} onChange={setCInstallmentsText} />
              <TextField label="Desconto (%)" value={cDiscountPercent} onChange={setCDiscountPercent} type="number" step="0.1" />
              <TextField label="Qualidade título (0-10)" value={cTitleQualityScore} onChange={setCTitleQualityScore} type="number" step="0.1" />
              <TextField label="Qualidade imagem (0-10)" value={cImageQualityScore} onChange={setCImageQualityScore} type="number" step="0.1" />
              <TextField label="Qualidade oferta (0-10)" value={cOfferQualityScore} onChange={setCOfferQualityScore} type="number" step="0.1" />
              <TextField className="sm:col-span-3" label="Observações" value={cNotes} onChange={setCNotes} />
            </div>
          </div>

          <TextField label="Observação da análise" value={analysisNotes} onChange={setAnalysisNotes} />

          <button
            type="button"
            onClick={() => setConfirmingAnalysis(true)}
            disabled={postingAnalysis || !canOpenAnalysisConfirm}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--gradient-brand)" }}
          >
            {postingAnalysis ? "Enviando…" : "Registrar análise manual"}
          </button>

          {confirmingAnalysis && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3 text-sm text-amber-900">
              <div className="font-semibold">Confirmar gravação da análise</div>
              <ul className="text-xs space-y-1">
                <li>Empresa: <strong>{companyName ?? "—"}</strong></li>
                <li>Conta: <strong>{accountName}</strong></li>
                <li>watchlist_id: <span className="font-mono">{watchlistId}</span></li>
                <li>Nosso preço: <strong>{ownPrice}</strong> · posição <strong>{ownRankPosition}</strong></li>
                <li>Concorrente: <strong>{cTitle || cUrl || cItemId}</strong> — R$ {cPrice} · posição {cRank}</li>
              </ul>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={postManualAnalysis}
                  disabled={postingAnalysis}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {postingAnalysis ? "Enviando…" : "Confirmar POST"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingAnalysis(false)}
                  disabled={postingAnalysis}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </fieldset>

        {analysisResult && <ResultBlock result={analysisResult} okStatuses={[201]} />}

        {analysisParsedObj && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <ParsedField label="snapshot" value={analysisParsedObj.snapshot} />
            <ParsedField label="competitors" value={analysisParsedObj.competitors} />
            <ParsedField label="alert_level" value={analysisParsedObj.alert_level} />
            <ParsedField label="alert_reason" value={analysisParsedObj.alert_reason} />
            <ParsedField label="suggested_action" value={analysisParsedObj.suggested_action} />
            <ParsedField label="evidence" value={analysisParsedObj.evidence} />
            <ParsedField label="recommended_actions" value={analysisParsedObj.recommended_actions} />
            <ParsedField label="measurement_plan" value={analysisParsedObj.measurement_plan} />
            <ParsedField label="metrics" value={analysisParsedObj.metrics} />
          </div>
        )}
      </section>

      {/* ---------- ETAPA 4 — Histórico ---------- */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Etapa 4 — Histórico {watchlistId && <span className="text-xs font-mono text-muted-foreground">(filtrado por watchlist_id)</span>}
          </h2>
          <button
            type="button"
            onClick={refreshHistory}
            disabled={fetchingHistory || !hasConsistentContext}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fetchingHistory ? "Atualizando…" : "Atualizar histórico"}
          </button>
        </div>
        {historyResult && <ResultBlock result={historyResult} okStatuses={[200]} />}
      </section>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  step,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className ?? ""}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function TriField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: FreeShippingTri;
  onChange: (v: FreeShippingTri) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FreeShippingTri)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="unknown">Não informado</option>
        <option value="yes">Sim</option>
        <option value="no">Não</option>
      </select>
    </label>
  );
}

function ResultBlock({ result, okStatuses }: { result: RunResult; okStatuses: number[] }) {
  const ok = result.httpStatus !== null && okStatuses.includes(result.httpStatus);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground text-xs">HTTP status</div>
          <div className="font-mono font-semibold">{result.httpStatus ?? "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Duração</div>
          <div className="font-mono font-semibold">{result.durationMs} ms</div>
        </div>
      </div>
      <div
        className={`rounded-lg p-3 text-sm ${
          ok
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
            : "bg-amber-50 text-amber-800 border border-amber-200"
        }`}
      >
        {result.interpretation}
      </div>
      {result.body && (
        <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-[420px] whitespace-pre-wrap break-all">
          {result.body}
        </pre>
      )}
      {result.networkError && (
        <div className="text-xs text-muted-foreground">Detalhe técnico: {result.networkError}</div>
      )}
    </div>
  );
}

function ParsedField({ label, value }: { label: string; value: unknown }) {
  if (value === undefined) return null;
  const isPrimitive = value === null || typeof value !== "object";
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      {isPrimitive ? (
        <div className="mt-1 font-mono break-all">{String(value)}</div>
      ) : (
        <pre className="mt-1 text-xs whitespace-pre-wrap break-all max-h-56 overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export const ECOMMERCE_COMPANY_ID = "ac7d24b9-5227-46ac-9ced-b66473422a17";
const STORAGE_KEY = "ac360_ecommerce_active_account_id";

export type EcommerceAccount = {
  id: string;
  account_name: string | null;
  nickname: string | null;
  marketplace: string | null;
  auth_status: string | null;
  ml_user_id: string | null;
  external_account_id: string | null;
  external_account_code: string | null;
  is_active: boolean | null;
  last_sync_at: string | null;
};

const CONNECTED_VALUES = new Set([
  "connected", "conectada", "conectado",
  "active", "ativa", "ativo",
  "authorized", "autorizada", "autorizado",
]);

export function isAccountConnected(a: EcommerceAccount | null | undefined): boolean {
  if (!a) return false;
  const s = (a.auth_status ?? "").toLowerCase();
  if (CONNECTED_VALUES.has(s)) return true;
  if (a.is_active && (a.ml_user_id || a.last_sync_at)) return true;
  return false;
}

function isMercadoLivre(value: string | null | undefined): boolean {
  const k = (value ?? "").toLowerCase().replace(/[\s-]/g, "_");
  return k === "mercado_livre" || k === "mercadolivre" || k === "ml";
}

type Ctx = {
  accounts: EcommerceAccount[];
  loading: boolean;
  activeAccountId: string | null;
  activeAccount: EcommerceAccount | null;
  isActiveConnected: boolean;
  setActiveAccountId: (id: string | null) => void;
  reloadAccounts: () => Promise<void>;
};

const EcommerceAccountCtx = createContext<Ctx | null>(null);

export function EcommerceActiveAccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<EcommerceAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAccountId, setActiveAccountIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const setActiveAccountId = useCallback((id: string | null) => {
    setActiveAccountIdState(id);
    try {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const reloadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ecommerce_accounts")
        .select(
          "id, account_name, nickname, marketplace, auth_status, ml_user_id, external_account_id, external_account_code, is_active, last_sync_at",
        )
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .eq("is_active", true)
        .order("account_name", { ascending: true });
      if (error) throw error;
      const list = ((data as EcommerceAccount[]) ?? []).filter((a) =>
        isMercadoLivre(a.marketplace),
      );
      setAccounts(list);

      // Validate / default selection
      if (list.length === 0) {
        setActiveAccountIdState(null);
        return;
      }
      const stored = activeAccountId && list.find((a) => a.id === activeAccountId);
      if (!stored) {
        const nightled = list.find((a) =>
          (a.account_name || "").toLowerCase().includes("nightled"),
        );
        const firstConnected = list.find(isAccountConnected);
        const fallback =
          (nightled && isAccountConnected(nightled) ? nightled : firstConnected) || list[0];
        setActiveAccountId(fallback.id);
      }
    } catch {
      /* swallow — page-level UI will show empty state */
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void reloadAccounts();
  }, [reloadAccounts]);

  const activeAccount = useMemo(
    () => accounts.find((a) => a.id === activeAccountId) ?? null,
    [accounts, activeAccountId],
  );

  const value: Ctx = {
    accounts,
    loading,
    activeAccountId,
    activeAccount,
    isActiveConnected: isAccountConnected(activeAccount),
    setActiveAccountId,
    reloadAccounts,
  };

  return (
    <EcommerceAccountCtx.Provider value={value}>{children}</EcommerceAccountCtx.Provider>
  );
}

export function useEcommerceActiveAccount(): Ctx {
  const ctx = useContext(EcommerceAccountCtx);
  if (!ctx) {
    // Fail-safe fallback so pages that render outside the provider don't crash.
    return {
      accounts: [],
      loading: false,
      activeAccountId: null,
      activeAccount: null,
      isActiveConnected: false,
      setActiveAccountId: () => {},
      reloadAccounts: async () => {},
    };
  }
  return ctx;
}

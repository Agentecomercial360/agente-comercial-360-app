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

const STORAGE_KEY = "ac360_ecommerce_active_account_id";
const ALL_ACCOUNTS_STORAGE_VALUE = "__all_accounts__";

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

export function isAccountConnected(a: EcommerceAccount | null | undefined): boolean {
  if (!a) return false;
  const s = (a.auth_status ?? "").toLowerCase();
  if (CONNECTED_VALUES.has(s)) return true;
  return false;
}

function isMercadoLivre(value: string | null | undefined): boolean {
  const k = (value ?? "").toLowerCase().replace(/[\s-]/g, "_");
  return k === "mercado_livre" || k === "mercadolivre" || k === "ml";
}

type Ctx = {
  companyId: string | null;
  companyName: string | null;
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
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<EcommerceAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAccountId, setActiveAccountIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored === ALL_ACCOUNTS_STORAGE_VALUE ? null : stored;
    } catch {
      return null;
    }
  });

  const setActiveAccountId = useCallback((id: string | null) => {
    setActiveAccountIdState(id);
    try {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.setItem(STORAGE_KEY, ALL_ACCOUNTS_STORAGE_VALUE);
    } catch {
      /* ignore */
    }
  }, []);

  const reloadAccounts = useCallback(async () => {
    setLoading(true);

    try {
      const { data: access, error: accessError } = await supabase
        .from("vw_user_access_context")
        .select("company_id,company_name,has_ecommerce_access")
        .maybeSingle();

      if (accessError) throw accessError;

      const currentCompanyId =
        access?.has_ecommerce_access === true && access?.company_id
          ? String(access.company_id)
          : null;

      setCompanyId(currentCompanyId);
      setCompanyName(access?.company_name ? String(access.company_name) : null);

      if (!currentCompanyId) {
        setAccounts([]);
        setActiveAccountIdState(null);
        return;
      }

      const { data, error } = await supabase
        .from("ecommerce_accounts")
        .select(
          "id, account_name, nickname, marketplace, auth_status, ml_user_id, external_account_id, external_account_code, is_active, last_sync_at",
        )
        .eq("company_id", currentCompanyId)
        .eq("is_active", true)
        .order("account_name", { ascending: true });

      if (error) throw error;

      const list = ((data as EcommerceAccount[]) ?? []).filter((account) =>
        isMercadoLivre(account.marketplace),
      );
      setAccounts(list);

      if (list.length === 0) {
        setActiveAccountIdState(null);
        return;
      }

      const allAccountsSelected =
        typeof window !== "undefined" &&
        window.localStorage.getItem(STORAGE_KEY) === ALL_ACCOUNTS_STORAGE_VALUE;

      if (allAccountsSelected) {
        setActiveAccountIdState(null);
        return;
      }

      const currentSelection =
        activeAccountId && list.find((account) => account.id === activeAccountId);

      if (!currentSelection) {
        const firstConnected = list.find(isAccountConnected);
        setActiveAccountId((firstConnected || list[0]).id);
      }
    } catch (error) {
      console.error("[ecommerce-active-account] reload", error);
      setCompanyId(null);
      setCompanyName(null);
      setAccounts([]);
      setActiveAccountIdState(null);
    } finally {
      setLoading(false);
    }
  }, [activeAccountId, setActiveAccountId]);

  useEffect(() => {
    void reloadAccounts();
  }, [reloadAccounts]);

  const activeAccount = useMemo(
    () => accounts.find((account) => account.id === activeAccountId) ?? null,
    [accounts, activeAccountId],
  );

  const value = useMemo<Ctx>(
    () => ({
      companyId,
      companyName,
      accounts,
      loading,
      activeAccountId,
      activeAccount,
      isActiveConnected: isAccountConnected(activeAccount),
      setActiveAccountId,
      reloadAccounts,
    }),
    [
      companyId,
      companyName,
      accounts,
      loading,
      activeAccountId,
      activeAccount,
      setActiveAccountId,
      reloadAccounts,
    ],
  );

  return (
    <EcommerceAccountCtx.Provider value={value}>{children}</EcommerceAccountCtx.Provider>
  );
}

export function useEcommerceActiveAccount(): Ctx {
  const ctx = useContext(EcommerceAccountCtx);

  if (!ctx) {
    return {
      companyId: null,
      companyName: null,
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

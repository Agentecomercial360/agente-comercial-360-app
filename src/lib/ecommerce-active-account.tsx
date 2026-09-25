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

export function isAccountConnected(
  account: EcommerceAccount | null | undefined,
): boolean {
  if (!account) return false;

  const status = (account.auth_status ?? "").toLowerCase();

  if (CONNECTED_VALUES.has(status)) {
    return true;
  }

  if (account.is_active && (account.ml_user_id || account.last_sync_at)) {
    return true;
  }

  return false;
}

function isMercadoLivre(
  value: string | null | undefined,
): boolean {
  const normalized = (value ?? "")
    .toLowerCase()
    .replace(/[\s-]/g, "_");

  return (
    normalized === "mercado_livre" ||
    normalized === "mercadolivre" ||
    normalized === "ml"
  );
}

type Ctx = {
  companyId: string | null;
  accounts: EcommerceAccount[];
  loading: boolean;
  activeAccountId: string | null;
  activeAccount: EcommerceAccount | null;
  isActiveConnected: boolean;
  setActiveAccountId: (id: string | null) => void;
  reloadAccounts: () => Promise<void>;
};

const EcommerceAccountCtx = createContext<Ctx | null>(null);

export function EcommerceActiveAccountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<EcommerceAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeAccountId, setActiveAccountIdState] =
    useState<string | null>(() => {
      if (typeof window === "undefined") {
        return null;
      }

      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);

        return stored === ALL_ACCOUNTS_STORAGE_VALUE
          ? null
          : stored;
      } catch {
        return null;
      }
    });

  const setActiveAccountId = useCallback(
    (id: string | null) => {
      setActiveAccountIdState(id);

      try {
        if (id) {
          window.localStorage.setItem(STORAGE_KEY, id);
        } else {
          window.localStorage.setItem(
            STORAGE_KEY,
            ALL_ACCOUNTS_STORAGE_VALUE,
          );
        }
      } catch {
        // ignore
      }
    },
    [],
  );

  const reloadAccounts = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setCompanyId(null);
        setAccounts([]);
        setActiveAccountIdState(null);
        return;
      }

      const {
        data: companyUser,
        error: companyUserError,
      } = await supabase
        .from("company_users")
        .select("company_id")
        .eq("user_id", userData.user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (
        companyUserError ||
        !companyUser?.company_id
      ) {
        setCompanyId(null);
        setAccounts([]);
        setActiveAccountIdState(null);
        return;
      }

      const resolvedCompanyId =
        companyUser.company_id as string;

      setCompanyId(resolvedCompanyId);

      const {
        data,
        error,
      } = await supabase
        .from("ecommerce_accounts")
        .select(
          [
            "id",
            "account_name",
            "nickname",
            "marketplace",
            "auth_status",
            "ml_user_id",
            "external_account_id",
            "external_account_code",
            "is_active",
            "last_sync_at",
          ].join(", "),
        )
        .eq(
          "company_id",
          resolvedCompanyId,
        )
        .eq("is_active", true)
        .order("account_name", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      const list =
        (
          (data as unknown as EcommerceAccount[]) ??
          []
        ).filter((account) =>
          isMercadoLivre(
            account.marketplace,
          ),
        );

      setAccounts(list);

      if (list.length === 0) {
        setActiveAccountIdState(null);
        return;
      }

      const allAccountsSelected =
        typeof window !== "undefined" &&
        window.localStorage.getItem(
          STORAGE_KEY,
        ) === ALL_ACCOUNTS_STORAGE_VALUE;

      if (allAccountsSelected) {
        setActiveAccountIdState(null);
        return;
      }

      const storedAccount =
        activeAccountId &&
        list.find(
          (account) =>
            account.id === activeAccountId,
        );

      if (storedAccount) {
        return;
      }

      const firstConnected =
        list.find(isAccountConnected);

      const fallback =
        firstConnected ?? list[0];

      setActiveAccountId(
        fallback.id,
      );
    } catch (error) {
      console.error(
        "Erro ao carregar contas do e-commerce:",
        error,
      );
      setCompanyId(null);
      setAccounts([]);
      setActiveAccountIdState(null);
    } finally {
      setLoading(false);
    }
  }, [
    activeAccountId,
    setActiveAccountId,
  ]);

  useEffect(() => {
    void reloadAccounts();
  }, [reloadAccounts]);

  const activeAccount =
    useMemo(
      () =>
        accounts.find(
          (account) =>
            account.id ===
            activeAccountId,
        ) ?? null,
      [
        accounts,
        activeAccountId,
      ],
    );

  const value: Ctx = {
    companyId,
    accounts,
    loading,
    activeAccountId,
    activeAccount,
    isActiveConnected:
      isAccountConnected(
        activeAccount,
      ),
    setActiveAccountId,
    reloadAccounts,
  };

  return (
    <EcommerceAccountCtx.Provider
      value={value}
    >
      {children}
    </EcommerceAccountCtx.Provider>
  );
}

export function useEcommerceActiveAccount(): Ctx {
  const ctx =
    useContext(
      EcommerceAccountCtx,
    );

  if (!ctx) {
    return {
      companyId: null,
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

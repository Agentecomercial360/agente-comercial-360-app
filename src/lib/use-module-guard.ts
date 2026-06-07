import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export type ModuleKey = "crm" | "ecommerce" | "admin";

const LOGIN_ROUTE: Record<ModuleKey, "/login" | "/ecommerce/login" | "/admin/login"> = {
  crm: "/login",
  ecommerce: "/ecommerce/login",
  admin: "/admin/login",
};

const ACCESS_MESSAGE: Record<ModuleKey, string> = {
  crm: "Usuário sem acesso ao módulo CRM.",
  ecommerce: "Usuário sem acesso ao módulo E-commerce.",
  admin: "Usuário sem acesso ao painel administrativo.",
};

const FLAG_BY_MODULE: Record<ModuleKey, "has_crm_access" | "has_ecommerce_access" | "is_platform_admin"> = {
  crm: "has_crm_access",
  ecommerce: "has_ecommerce_access",
  admin: "is_platform_admin",
};

/**
 * Gates a layout/page on the user's module entitlements from
 * public.vw_user_access_context. While checking, returns { allowed: false, checking: true }
 * so the caller can render a neutral loading state and avoid flashing
 * cross-module data.
 */
export function useModuleGuard(required: ModuleKey) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          if (cancelled) return;
          navigate({ to: LOGIN_ROUTE[required] });
          return;
        }

        const { data: ctx, error } = await supabase
          .from("vw_user_access_context")
          .select(
            "has_crm_access, has_ecommerce_access, is_platform_admin, suggested_redirect",
          )
          .maybeSingle();

        if (cancelled) return;

        const flag = FLAG_BY_MODULE[required];
        const hasAccess = !error && ctx?.[flag] === true;

        if (!hasAccess) {
          try {
            sessionStorage.setItem("ac360.auth.message", ACCESS_MESSAGE[required]);
          } catch {
            // ignore
          }
          await supabase.auth.signOut();
          if (cancelled) return;
          const fallback = (ctx?.suggested_redirect as string | undefined) ?? LOGIN_ROUTE[required];
          navigate({ to: fallback as any });
          return;
        }

        setAllowed(true);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [required, navigate]);

  return { allowed, checking };
}

/**
 * Reads (and clears) a one-shot auth message persisted by useModuleGuard
 * when it signs the user out for lack of access.
 */
export function consumeAuthMessage(): string | null {
  try {
    const m = sessionStorage.getItem("ac360.auth.message");
    if (m) sessionStorage.removeItem("ac360.auth.message");
    return m;
  } catch {
    return null;
  }
}

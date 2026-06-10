import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import {
  canRoleAccess,
  firstAllowedRouteFor,
  normalizeCrmRole,
  type CrmRole,
} from "@/lib/crm-permissions";

export interface CrmRoleState {
  role: CrmRole | null;
  department: string | null;
  permissions: unknown;
  loading: boolean;
  canAccessRoute: (path: string) => boolean;
  firstAllowedRoute: () => string | null;
}

/**
 * Lê role/department/permissions do usuário autenticado a partir de
 * public.company_users (apenas vínculos com is_active = true).
 *
 * Camada de UX — não substitui RLS.
 */
export function useCrmRole(): CrmRoleState {
  const [role, setRole] = useState<CrmRole | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) {
          if (!cancelled) {
            setRole(null);
            setDepartment(null);
            setPermissions(null);
          }
          return;
        }

        const { data, error } = await supabase
          .from("company_users")
          .select("role, department, permissions, is_active")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle();

        if (cancelled) return;

        if (error || !data) {
          // Sem vínculo ativo conhecido → restritivo.
          setRole("administrativo");
          setDepartment(null);
          setPermissions(null);
          return;
        }

        setRole(normalizeCrmRole(data.role as string | null));
        setDepartment((data.department as string | null) ?? null);
        setPermissions(data.permissions ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const canAccessRoute = (path: string) => {
    if (!role) return false;
    return canRoleAccess(role, path);
  };

  const firstAllowedRoute = () => {
    if (!role) return null;
    return firstAllowedRouteFor(role);
  };

  return {
    role,
    department,
    permissions,
    loading,
    canAccessRoute,
    firstAllowedRoute,
  };
}

/**
 * Guard de rota por perfil. Não substitui useModuleGuard("crm");
 * deve ser chamado em conjunto.
 *
 * Se o usuário cair em uma rota que seu role não permite, redireciona
 * para a primeira rota permitida — ou /login se não houver nenhuma.
 */
export function useCrmRoleGuard(): CrmRoleState {
  const state = useCrmRole();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (state.loading || !state.role) return;
    if (state.canAccessRoute(pathname)) return;

    const target = state.firstAllowedRoute();
    if (!target) {
      navigate({ to: "/login" });
      return;
    }
    if (target === pathname) return; // evita loop
    navigate({ to: target as any });
  }, [state.loading, state.role, pathname, navigate, state]);

  return state;
}

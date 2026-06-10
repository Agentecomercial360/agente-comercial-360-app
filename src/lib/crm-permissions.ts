/**
 * Matriz de permissões por rota do CRM.
 *
 * Camada de UX apenas — segurança real continua sendo RLS no Supabase.
 * Não filtra dados por department nesta etapa.
 */

export type CrmRole =
  | "admin"
  | "gestor"
  | "financeiro"
  | "vendas"
  | "administrativo";

export const CRM_ROLES: CrmRole[] = [
  "admin",
  "gestor",
  "financeiro",
  "vendas",
  "administrativo",
];

/**
 * Normaliza valores vindos do banco (case/acentos/sinônimos) para uma das
 * roles conhecidas. Desconhecido → "administrativo" (mais restritivo).
 */
export function normalizeCrmRole(raw: string | null | undefined): CrmRole {
  if (!raw) return "administrativo";
  const v = raw
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (v === "admin" || v === "administrator" || v === "owner") return "admin";
  if (v === "gestor" || v === "manager" || v === "gerente") return "gestor";
  if (v === "financeiro" || v === "finance" || v === "financial")
    return "financeiro";
  if (v === "vendas" || v === "sales" || v === "vendedor") return "vendas";
  if (
    v === "administrativo" ||
    v === "administrative" ||
    v === "atendente" ||
    v === "operador"
  )
    return "administrativo";

  return "administrativo";
}

/**
 * Mapa de rotas permitidas por role.
 * admin e gestor têm acesso a tudo do CRM.
 */
export const ROUTE_PERMISSIONS: Record<CrmRole, string[]> = {
  admin: [
    "/dashboard",
    "/gestao-360",
    "/atendimentos",
    "/conversas",
    "/leads",
    "/responsaveis",
    "/relatorios",
    "/ia",
    "/base-conhecimento",
    "/whatsapp-oficial",
    "/configuracoes",
    "/followups",
    "/produtos",
  ],
  gestor: [
    "/dashboard",
    "/gestao-360",
    "/atendimentos",
    "/conversas",
    "/leads",
    "/responsaveis",
    "/relatorios",
    "/ia",
    "/base-conhecimento",
    "/whatsapp-oficial",
    "/configuracoes",
    "/followups",
    "/produtos",
  ],
  financeiro: ["/atendimentos", "/conversas", "/followups"],
  vendas: [
    "/atendimentos",
    "/conversas",
    "/leads",
    "/followups",
    "/produtos",
  ],
  administrativo: ["/atendimentos", "/conversas", "/followups"],
};

export function canRoleAccess(role: CrmRole, path: string): boolean {
  const allowed = ROUTE_PERMISSIONS[role] ?? [];
  return allowed.includes(path);
}

export function firstAllowedRouteFor(role: CrmRole): string | null {
  const list = ROUTE_PERMISSIONS[role] ?? [];
  return list[0] ?? null;
}

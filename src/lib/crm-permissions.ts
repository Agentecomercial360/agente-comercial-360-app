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

/**
 * Filtro de setor (coluna conversations.sector) por role.
 * - admin/gestor: sem filtro (veem tudo, inclusive sector = null).
 * - vendas: apenas "vendas".
 * - financeiro: "financeiro" ou "caixa".
 * - administrativo: apenas "administrativo".
 *
 * Camada de UX — RLS continua sendo a segurança real.
 */
export type SectorFilter = { all: true } | { all: false; sectors: string[] };

export function sectorFilterFor(role: CrmRole | null): SectorFilter {
  if (!role) return { all: false, sectors: [] };
  if (role === "admin" || role === "gestor") return { all: true };
  if (role === "vendas") return { all: false, sectors: ["vendas"] };
  if (role === "financeiro")
    return { all: false, sectors: ["financeiro", "caixa"] };
  if (role === "administrativo")
    return { all: false, sectors: ["administrativo"] };
  return { all: false, sectors: [] };
}

/* =========================================================================
 * Helpers visuais de setor (UX) — apresentação e filtro manual.
 * ========================================================================= */

export type SectorKey =
  | "vendas"
  | "financeiro"
  | "caixa"
  | "administrativo"
  | "geral";

export const SECTOR_KEYS: SectorKey[] = [
  "vendas",
  "financeiro",
  "caixa",
  "administrativo",
  "geral",
];

/** Normaliza `conversations.sector` para chave canônica, ou null se ausente. */
export function normalizeSector(raw: unknown): SectorKey | null {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!v) return null;
  if (v === "vendas" || v === "sales" || v === "comercial") return "vendas";
  if (v === "financeiro" || v === "finance" || v === "financial") return "financeiro";
  if (v === "caixa" || v === "cashier") return "caixa";
  if (v === "administrativo" || v === "administrative" || v === "admin") return "administrativo";
  if (v === "geral" || v === "general") return "geral";
  return null;
}

const SECTOR_LABELS: Record<SectorKey, string> = {
  vendas: "Vendas",
  financeiro: "Financeiro",
  caixa: "Caixa",
  administrativo: "Administrativo",
  geral: "Geral",
};

export function getSectorLabel(sector: SectorKey | null): string {
  return sector ? SECTOR_LABELS[sector] : "Sem setor";
}

const SECTOR_BADGE_CLASSES: Record<SectorKey, string> = {
  vendas: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  financeiro: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  caixa: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  administrativo: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  geral: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
};

export function getSectorBadgeClass(sector: SectorKey | null): string {
  return sector
    ? SECTOR_BADGE_CLASSES[sector]
    : "bg-muted/60 text-muted-foreground ring-1 ring-border";
}

/** Admin/gestor podem alternar livremente entre setores na UI. */
export function canRoleSeeAllSectors(role: CrmRole | null): boolean {
  return role === "admin" || role === "gestor";
}

export type SectorFilterOption = "all" | SectorKey | "none";
export type SectorOption = { value: SectorFilterOption; label: string };

export const ALL_SECTOR_OPTIONS: SectorOption[] = [
  { value: "all", label: "Todos" },
  { value: "vendas", label: "Vendas" },
  { value: "financeiro", label: "Financeiro" },
  { value: "caixa", label: "Caixa" },
  { value: "administrativo", label: "Administrativo" },
  { value: "geral", label: "Geral" },
  { value: "none", label: "Sem setor" },
];

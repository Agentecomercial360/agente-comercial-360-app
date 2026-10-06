import { supabase } from "@/lib/supabase";

const API_BASE_URL = String(import.meta.env.VITE_AC360_API_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

export type AdminCompany = {
  id: string;
  name: string;
  status: string | null;
};

export type AdminUser = {
  id: string;
  user_id: string | null;
  company_id: string;
  company_name: string | null;
  company_status: string | null;
  name: string | null;
  email: string | null;
  role: string;
  is_active: boolean;
  account_status: "invitation_pending" | "active" | "inactive";
  invitation_id: string | null;
  accepted_at: string | null;
  last_login_at: string | null;
  modules: Array<{
    id: string;
    module_key: string;
    module_name: string;
    status: string;
  }>;
};

async function adminRequest<T>(path: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("Configure VITE_AC360_API_URL no ambiente do frontend.");
  }

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error("Sessão não encontrada. Entre novamente no sistema.");
  }

  const response = await fetch(`${API_BASE_URL}/api/admin${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Sessão inválida ou expirada. Entre novamente.");
    }

    if (response.status === 403) {
      throw new Error("Você não possui acesso administrativo.");
    }

    throw new Error(
      typeof result?.error === "string"
        ? result.error
        : "Não foi possível consultar a API administrativa.",
    );
  }

  if (!result || result.success !== true) {
    throw new Error("Resposta administrativa inválida.");
  }

  return result as T;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const result = await adminRequest<{
    success: true;
    users: AdminUser[];
  }>("/users");

  return result.users;
}

export async function listAdminCompanies(): Promise<AdminCompany[]> {
  const result = await adminRequest<{
    success: true;
    companies: AdminCompany[];
  }>("/companies");

  return result.companies;
}

export type CreateAdminUserInput = {
  name: string;
  email: string;
  company_id: string;
  role: "owner" | "admin" | "gestor" | "vendas" | "financeiro" | "administrativo";
};

export async function createAdminUser(input: CreateAdminUserInput) {
  return adminRequest<{
    success: true;
    user: {
      id: string;
      user_id: string;
      company_id: string;
      name: string;
      email: string;
      role: string;
      is_active: boolean;
    };
  }>("/users", "POST", input);
}

export async function resendAdminUserInvitation(
  invitationId: string,
) {
  const normalizedInvitationId =
    invitationId.trim();

  if (!normalizedInvitationId) {
    throw new Error(
      "Convite não identificado para reenvio.",
    );
  }

  return adminRequest<{
    success: true;
  }>(
    `/users/invitations/${encodeURIComponent(
      normalizedInvitationId,
    )}/resend`,
    "POST",
  );
}
export async function acceptAdminUserInvitation() {
  return adminRequest<{
    success: true;
    invitation_id: string;
    accepted_at: string;
  }>("/users/invitations/accept", "POST");
}

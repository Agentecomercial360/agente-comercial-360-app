import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do front-end do Agente Comercial 360.
 *
 * Conecta-se ao Supabase EXISTENTE do backend (n8n / Railway / WhatsApp Cloud API).
 * Usa apenas a anon/publishable key — nunca service_role.
 */

// Valores temporários para preview Lovable. Substituir por variáveis de ambiente em produção.
const FALLBACK_SUPABASE_URL = "https://dmwcbecihuxqzzjouevk.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "sb_publishable_GYJnzptCXdI_ZLPWXSHSSw_fgBHsp6n";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? FALLBACK_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? FALLBACK_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "ac360-auth",
  },
});

// ---------------------------------------------------------------------------
// Tratamento global de sessão expirada (JWT expired)
// ---------------------------------------------------------------------------
// Rotas públicas onde NÃO devemos redirecionar para /login automaticamente.
const PUBLIC_PATHS = new Set<string>(["/", "/login", "/landing"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return false;
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (isPublicPath(path)) return;
  // Evita loop se já está navegando para /login
  if (path === "/login") return;
  window.location.replace("/login");
}

function isJwtExpiredError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { message?: string; status?: number; code?: string };
  const msg = (e.message ?? "").toLowerCase();
  if (msg.includes("jwt expired") || msg.includes("jwt is expired")) return true;
  if (msg.includes("invalid jwt") || msg.includes("invalid refresh token")) return true;
  if (e.code === "PGRST301" || e.code === "401") return true;
  if (e.status === 401 && msg.includes("jwt")) return true;
  return false;
}

// 1. Listener global: quando o Supabase decide que a sessão acabou, redireciona.
if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      redirectToLogin();
      return;
    }
    if (event === "TOKEN_REFRESHED" && !session) {
      // Refresh falhou (ex.: refresh token revogado/expirado).
      void supabase.auth.signOut();
      redirectToLogin();
    }
  });
}

// 2. Intercepta supabase.auth.getUser para detectar JWT expirado mesmo quando
//    o auto-refresh não disparou SIGNED_OUT (ex.: refresh ainda em andamento
//    quando a página chama getUser). Faz signOut → o listener acima redireciona.
const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
supabase.auth.getUser = (async (jwt?: string) => {
  const result = await originalGetUser(jwt);
  if (result.error && isJwtExpiredError(result.error)) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    redirectToLogin();
  }
  return result;
}) as typeof supabase.auth.getUser;

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do front-end do Agente Comercial 360.
 *
 * Conecta-se ao Supabase EXISTENTE do backend (n8n / Railway / WhatsApp Cloud API).
 * Usa apenas a anon key — nunca service_role.
 *
 * Variáveis de ambiente esperadas (definir em .env / Workspace):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Não derruba o build da Fase 1 visual; apenas avisa no console em dev.
  if (typeof console !== "undefined") {
    console.warn(
      "[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes. " +
        "O client será criado mas nenhuma requisição funcionará até as envs serem preenchidas."
    );
  }
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "ac360-auth",
    },
  }
);

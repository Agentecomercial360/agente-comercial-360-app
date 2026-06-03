import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do front-end do Agente Comercial 360.
 *
 * Conecta-se ao Supabase EXISTENTE do backend (n8n / Railway / WhatsApp Cloud API).
 * Usa apenas a anon/publishable key — nunca service_role.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in the environment."
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "ac360-auth",
  },
});

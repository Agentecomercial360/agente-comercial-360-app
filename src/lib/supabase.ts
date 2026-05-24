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

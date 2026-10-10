import { supabase } from "@/lib/supabase";

export const DEFAULT_AC360_API_BASE_URL =
  "https://ac360-mercadolivre-api-production.up.railway.app";

export function getAc360ApiBaseUrl(): string {
  const configured = String(import.meta.env.VITE_AC360_API_URL ?? "").trim();
  return (configured || DEFAULT_AC360_API_BASE_URL).replace(/\/+$/, "");
}

export function createAc360ApiUrl(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): URL {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getAc360ApiBaseUrl()}${normalizedPath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

export async function getAc360AccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data?.session?.access_token ?? null;
}

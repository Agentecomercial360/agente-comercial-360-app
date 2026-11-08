import { supabase } from "@/lib/supabase";

/** Resolve only the API explicitly configured for this frontend environment. */
export function getAc360ApiUrl(
  configuredUrl: string | undefined = import.meta.env?.VITE_AC360_API_URL,
): string {
  const value = configuredUrl?.trim().replace(/\/+$/, "");
  if (!value) {
    throw new Error("VITE_AC360_API_URL não configurada. Configure a API deste ambiente.");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("VITE_AC360_API_URL inválida. Informe uma URL HTTP ou HTTPS válida.");
  }

  if (
    !/^https?:\/\//i.test(value) ||
    !["http:", "https:"].includes(url.protocol) ||
    /\s/.test(value) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error(
      "VITE_AC360_API_URL inválida. Use somente a origem HTTP ou HTTPS da API, sem credenciais, caminho ou parâmetros.",
    );
  }

  return url.origin;
}

/** Build requests against the validated environment-specific API origin. */
export function createAc360ApiUrl(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): URL {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getAc360ApiUrl()}${normalizedPath}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url;
}

export async function getAc360AccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}

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

import brStates from "@/data/br-states.json";

export type StateGeom = { uf: string; name: string; d: string; cx: number; cy: number };
export const BR_STATES = brStates as StateGeom[];

// Build lookup tables: normalize by uppercasing, stripping accents, trimming.
function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

const CODE_BY_KEY = new Map<string, string>();
const NAME_BY_CODE = new Map<string, string>();
for (const s of BR_STATES) {
  const code = s.uf.toUpperCase();
  NAME_BY_CODE.set(code, s.name);
  CODE_BY_KEY.set(fold(s.uf), code);
  CODE_BY_KEY.set(fold(s.name), code);
}
// Common aliases
const ALIASES: Record<string, string> = {
  BRASILIA: "DF",
  "DISTRITO FEDERAL": "DF",
};
for (const [k, v] of Object.entries(ALIASES)) CODE_BY_KEY.set(fold(k), v);

export type CanonicalLocation = {
  stateCode: string | null; // e.g. "GO"
  stateName: string | null; // e.g. "Goiás"
  cityName: string | null; // trimmed original casing
};

export function normalizeState(input: string | null | undefined): {
  code: string;
  name: string;
} | null {
  if (!input) return null;
  const code = CODE_BY_KEY.get(fold(input));
  if (!code) return null;
  return { code, name: NAME_BY_CODE.get(code) ?? code };
}

export function normalizeCity(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = String(input).trim();
  return s.length ? s : null;
}

// Case-insensitive/accent-insensitive city key for grouping (does not change display value).
export function cityKey(city: string | null | undefined): string {
  return city ? fold(city) : "";
}

export function normalizeLocation(
  stateInput: string | null | undefined,
  cityInput: string | null | undefined,
): CanonicalLocation {
  const st = normalizeState(stateInput);
  return {
    stateCode: st?.code ?? null,
    stateName: st?.name ?? null,
    cityName: normalizeCity(cityInput),
  };
}

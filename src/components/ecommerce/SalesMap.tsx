import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";

// Approximate state centroids (lat, lng) for Brazil
const STATE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  AC: { lat: -9.0, lng: -70.0 },
  AL: { lat: -9.5, lng: -36.5 },
  AM: { lat: -4.0, lng: -63.0 },
  AP: { lat: 1.0, lng: -52.0 },
  BA: { lat: -12.5, lng: -41.5 },
  CE: { lat: -5.5, lng: -39.5 },
  DF: { lat: -15.8, lng: -47.8 },
  ES: { lat: -19.5, lng: -40.5 },
  GO: { lat: -16.0, lng: -49.5 },
  MA: { lat: -5.0, lng: -45.5 },
  MG: { lat: -18.5, lng: -44.5 },
  MS: { lat: -20.5, lng: -54.5 },
  MT: { lat: -13.0, lng: -55.5 },
  PA: { lat: -4.5, lng: -53.0 },
  PB: { lat: -7.1, lng: -36.7 },
  PE: { lat: -8.5, lng: -37.5 },
  PI: { lat: -7.0, lng: -42.5 },
  PR: { lat: -24.5, lng: -51.5 },
  RJ: { lat: -22.5, lng: -43.0 },
  RN: { lat: -5.8, lng: -36.8 },
  RO: { lat: -11.0, lng: -63.0 },
  RR: { lat: 2.0, lng: -61.5 },
  RS: { lat: -30.0, lng: -53.5 },
  SC: { lat: -27.0, lng: -50.5 },
  SE: { lat: -10.5, lng: -37.5 },
  SP: { lat: -22.0, lng: -48.5 },
  TO: { lat: -10.5, lng: -48.0 },
};

// A few well-known city overrides (approx)
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "SÃO PAULO/SP": { lat: -23.55, lng: -46.63 },
  "SAO PAULO/SP": { lat: -23.55, lng: -46.63 },
  "CAMPINAS/SP": { lat: -22.9, lng: -47.06 },
  "JABOTICABAL/SP": { lat: -21.25, lng: -48.32 },
  "RIBEIRÃO PRETO/SP": { lat: -21.17, lng: -47.81 },
  "SANTOS/SP": { lat: -23.96, lng: -46.33 },
  "SÃO JOSÉ DOS CAMPOS/SP": { lat: -23.22, lng: -45.9 },
  "GUARULHOS/SP": { lat: -23.46, lng: -46.53 },
  "OSASCO/SP": { lat: -23.53, lng: -46.79 },
  "SOROCABA/SP": { lat: -23.5, lng: -47.46 },
  "RIO DE JANEIRO/RJ": { lat: -22.9, lng: -43.2 },
  "NITERÓI/RJ": { lat: -22.88, lng: -43.1 },
  "BELO HORIZONTE/MG": { lat: -19.92, lng: -43.94 },
  "UBERLÂNDIA/MG": { lat: -18.91, lng: -48.28 },
  "CURITIBA/PR": { lat: -25.43, lng: -49.27 },
  "LONDRINA/PR": { lat: -23.31, lng: -51.16 },
  "PORTO ALEGRE/RS": { lat: -30.03, lng: -51.23 },
  "CAXIAS DO SUL/RS": { lat: -29.17, lng: -51.18 },
  "FLORIANÓPOLIS/SC": { lat: -27.6, lng: -48.55 },
  "JOINVILLE/SC": { lat: -26.3, lng: -48.85 },
  "BLUMENAU/SC": { lat: -26.92, lng: -49.07 },
  "SALVADOR/BA": { lat: -12.97, lng: -38.5 },
  "RECIFE/PE": { lat: -8.05, lng: -34.9 },
  "FORTALEZA/CE": { lat: -3.72, lng: -38.54 },
  "BRASÍLIA/DF": { lat: -15.78, lng: -47.93 },
  "GOIÂNIA/GO": { lat: -16.68, lng: -49.25 },
  "MANAUS/AM": { lat: -3.1, lng: -60.02 },
  "BELÉM/PA": { lat: -1.46, lng: -48.5 },
  "NATAL/RN": { lat: -5.79, lng: -35.21 },
  "JOÃO PESSOA/PB": { lat: -7.12, lng: -34.86 },
  "MACEIÓ/AL": { lat: -9.65, lng: -35.73 },
  "ARACAJU/SE": { lat: -10.9, lng: -37.07 },
  "TERESINA/PI": { lat: -5.09, lng: -42.8 },
  "SÃO LUÍS/MA": { lat: -2.53, lng: -44.3 },
  "CUIABÁ/MT": { lat: -15.6, lng: -56.1 },
  "CAMPO GRANDE/MS": { lat: -20.44, lng: -54.65 },
  "PORTO VELHO/RO": { lat: -8.76, lng: -63.9 },
  "BOA VISTA/RR": { lat: 2.82, lng: -60.67 },
  "RIO BRANCO/AC": { lat: -9.97, lng: -67.8 },
  "MACAPÁ/AP": { lat: 0.03, lng: -51.06 },
  "PALMAS/TO": { lat: -10.25, lng: -48.32 },
  "VITÓRIA/ES": { lat: -20.32, lng: -40.34 },
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function coordsFor(city: string, uf: string) {
  const key = `${city.trim().toUpperCase()}/${uf.trim().toUpperCase()}`;
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  const st = STATE_CENTROIDS[uf.trim().toUpperCase()];
  if (!st) return null;
  // Deterministic jitter within ~1 degree of state centroid
  const h = hash(key);
  const dLat = ((h % 200) / 100 - 1) * 0.8;
  const dLng = (((h >> 8) % 200) / 100 - 1) * 0.8;
  return { lat: st.lat + dLat, lng: st.lng + dLng };
}

// Projection: equirectangular within Brazil bounds
const W = 600;
const H = 650;
const LNG_MIN = -74;
const LNG_MAX = -34;
const LAT_MIN = -34;
const LAT_MAX = 6;
function project(lat: number, lng: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;
  return { x, y };
}

export type CityPoint = {
  city: string;
  uf: string;
  orders: number;
  revenue: number;
};

export function SalesMap({
  points,
  onSelect,
}: {
  points: CityPoint[];
  onSelect: (city: string, uf: string) => void;
}) {
  const [hover, setHover] = useState<CityPoint | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const maxOrders = useMemo(
    () => Math.max(1, ...points.map((p) => p.orders)),
    [points],
  );

  const placed = useMemo(
    () =>
      points
        .map((p) => {
          const c = coordsFor(p.city, p.uf);
          if (!c) return null;
          const { x, y } = project(c.lat, c.lng);
          const r = 6 + (p.orders / maxOrders) * 22;
          return { ...p, x, y, r };
        })
        .filter(Boolean) as (CityPoint & { x: number; y: number; r: number })[],
    [points, maxOrders],
  );

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[520px] rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="dot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.35" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />

        {/* State labels as light context */}
        {Object.entries(STATE_CENTROIDS).map(([uf, c]) => {
          const { x, y } = project(c.lat, c.lng);
          return (
            <text
              key={uf}
              x={x}
              y={y}
              textAnchor="middle"
              className="fill-slate-300"
              style={{ fontSize: 11, fontWeight: 600, userSelect: "none" }}
            >
              {uf}
            </text>
          );
        })}

        {/* City bubbles */}
        {placed.map((p) => (
          <g
            key={`${p.city}/${p.uf}`}
            className="cursor-pointer"
            onMouseEnter={(e) => {
              setHover(p);
              const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
              const parentRect = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect();
              setTip({
                x: ((p.x / W) * rect.width) + (rect.left - parentRect.left),
                y: ((p.y / H) * rect.height) + (rect.top - parentRect.top),
              });
            }}
            onMouseLeave={() => {
              setHover(null);
              setTip(null);
            }}
            onClick={() => onSelect(p.city, p.uf)}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill="url(#dot)"
              stroke="#1d4ed8"
              strokeWidth={1.5}
              className="transition-all hover:opacity-90"
            />
            <circle cx={p.x} cy={p.y} r={2.5} fill="#1e3a8a" />
          </g>
        ))}
      </svg>

      {hover && tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg"
          style={{ left: tip.x, top: tip.y - 12 }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
            <MapPin className="h-3 w-3 text-blue-600" />
            {hover.city}/{hover.uf}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {hover.orders} {hover.orders === 1 ? "pedido" : "pedidos"} ·{" "}
            {hover.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">Clique para ver pedidos</div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600/70 border border-blue-800" />
          Cada bolha = uma cidade. Tamanho proporcional ao nº de pedidos.
        </div>
        <div>
          {placed.length} {placed.length === 1 ? "cidade" : "cidades"} no mapa.
        </div>
      </div>
    </div>
  );
}

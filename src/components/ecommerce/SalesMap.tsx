import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import brStates from "@/data/br-states.json";

type StateGeom = { uf: string; name: string; d: string; cx: number; cy: number };
const STATES = brStates as StateGeom[];
const STATE_BY_UF = new Map(STATES.map((s) => [s.uf.toUpperCase(), s]));

// Native viewBox of the geometry (see src/data/br-states.json)
const VB_W = 800;
const VB_H = 800;

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function jitterFor(city: string, uf: string) {
  const h = hash(`${city}||${uf}`);
  const dx = (((h % 200) / 100) - 1) * 26; // ~±26 svg units
  const dy = ((((h >> 8) % 200) / 100) - 1) * 26;
  return { dx, dy };
}

export type CityPoint = {
  city: string;
  uf: string;
  orders: number;
  revenue: number;
};

export type StatePoint = {
  uf: string;
  orders: number;
  revenue: number;
};

export function SalesMap({
  points,
  stateStats,
  selected,
  onSelectCity,
  onSelectState,
}: {
  points: CityPoint[];
  stateStats: StatePoint[];
  selected?: { kind: "city"; city: string; uf: string } | { kind: "state"; uf: string } | null;
  onSelectCity: (city: string, uf: string) => void;
  onSelectState: (uf: string) => void;
}) {
  const [hover, setHover] = useState<
    | { kind: "city"; label: string; sub: string; x: number; y: number }
    | { kind: "state"; label: string; sub: string; x: number; y: number }
    | null
  >(null);

  const stateRevenue = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stateStats) m.set(s.uf.toUpperCase(), s.revenue);
    return m;
  }, [stateStats]);

  const stateOrders = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stateStats) m.set(s.uf.toUpperCase(), s.orders);
    return m;
  }, [stateStats]);

  const maxStateRev = useMemo(
    () => Math.max(1, ...stateStats.map((s) => s.revenue)),
    [stateStats],
  );

  const maxCityRev = useMemo(
    () => Math.max(1, ...points.map((p) => p.revenue)),
    [points],
  );

  const placed = useMemo(() => {
    return points
      .map((p) => {
        const st = STATE_BY_UF.get(p.uf.toUpperCase());
        if (!st) return null;
        const { dx, dy } = jitterFor(p.city, p.uf);
        return {
          ...p,
          x: st.cx + dx,
          y: st.cy + dy,
          r: 5 + Math.sqrt(p.revenue / maxCityRev) * 18,
        };
      })
      .filter(Boolean) as (CityPoint & { x: number; y: number; r: number })[];
  }, [points, maxCityRev]);

  function stateFill(uf: string) {
    const rev = stateRevenue.get(uf) ?? 0;
    if (rev === 0) return "#f8fafc"; // slate-50
    const t = Math.sqrt(rev / maxStateRev);
    // Interpolate between slate-100 (#f1f5f9) and blue-600 (#2563eb)
    const c1 = [241, 245, 249];
    const c2 = [37, 99, 235];
    const c = c1.map((v, i) => Math.round(v + (c2[i] - v) * (0.15 + t * 0.6)));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }

  const selectedUf =
    selected?.kind === "state"
      ? selected.uf.toUpperCase()
      : selected?.kind === "city"
        ? selected.uf.toUpperCase()
        : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto block h-[460px] w-full max-w-[560px]"
      >
        <defs>
          <radialGradient id="dot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        {/* States */}
        <g>
          {STATES.map((s) => {
            const uf = s.uf.toUpperCase();
            const isSelected = selectedUf === uf;
            const orders = stateOrders.get(uf) ?? 0;
            const rev = stateRevenue.get(uf) ?? 0;
            return (
              <path
                key={s.uf}
                d={s.d}
                fill={stateFill(uf)}
                stroke={isSelected ? "#1d4ed8" : "#cbd5e1"}
                strokeWidth={isSelected ? 1.4 : 0.6}
                className="cursor-pointer transition-colors hover:brightness-95"
                onMouseEnter={(e) => {
                  const rect = (
                    e.currentTarget.ownerSVGElement as SVGSVGElement
                  ).getBoundingClientRect();
                  const parentRect = (
                    e.currentTarget.ownerSVGElement!
                      .parentElement as HTMLElement
                  ).getBoundingClientRect();
                  setHover({
                    kind: "state",
                    label: `${s.name} (${s.uf})`,
                    sub: `${orders} ${orders === 1 ? "pedido" : "pedidos"} · ${rev.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
                    x: ((s.cx / VB_W) * rect.width) + (rect.left - parentRect.left),
                    y: ((s.cy / VB_H) * rect.height) + (rect.top - parentRect.top),
                  });
                }}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectState(s.uf)}
              />
            );
          })}
        </g>

        {/* State labels (subtle) */}
        <g style={{ pointerEvents: "none" }}>
          {STATES.map((s) => {
            const uf = s.uf.toUpperCase();
            const hasData = (stateRevenue.get(uf) ?? 0) > 0;
            return (
              <text
                key={`t-${s.uf}`}
                x={s.cx}
                y={s.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={hasData ? "#0f172a" : "#94a3b8"}
                opacity={hasData ? 0.75 : 0.5}
                style={{ fontSize: 10, fontWeight: 600, userSelect: "none" }}
              >
                {s.uf}
              </text>
            );
          })}
        </g>

        {/* City bubbles */}
        <g>
          {placed.map((p) => {
            const isSelected =
              selected?.kind === "city" &&
              selected.city === p.city &&
              selected.uf.toUpperCase() === p.uf.toUpperCase();
            return (
              <g
                key={`${p.city}/${p.uf}`}
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  const rect = (
                    e.currentTarget.ownerSVGElement as SVGSVGElement
                  ).getBoundingClientRect();
                  const parentRect = (
                    e.currentTarget.ownerSVGElement!
                      .parentElement as HTMLElement
                  ).getBoundingClientRect();
                  setHover({
                    kind: "city",
                    label: `${p.city}/${p.uf}`,
                    sub: `${p.orders} ${p.orders === 1 ? "pedido" : "pedidos"} · ${p.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
                    x: ((p.x / VB_W) * rect.width) + (rect.left - parentRect.left),
                    y: ((p.y / VB_H) * rect.height) + (rect.top - parentRect.top),
                  });
                }}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectCity(p.city, p.uf)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.r}
                  fill="url(#dot)"
                  stroke={isSelected ? "#1e3a8a" : "#1d4ed8"}
                  strokeWidth={isSelected ? 2 : 1}
                  opacity={0.9}
                />
                <circle cx={p.x} cy={p.y} r={1.8} fill="#0b1a4b" />
              </g>
            );
          })}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg"
          style={{ left: hover.x, top: hover.y - 10 }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
            <MapPin className="h-3 w-3 text-blue-600" />
            {hover.label}
          </div>
          <div className="text-[11px] text-muted-foreground">{hover.sub}</div>
          <div className="mt-0.5 text-[10px] text-blue-600">
            Clique para ver {hover.kind === "state" ? "o estado" : "a cidade"}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-sm bg-gradient-to-r from-slate-100 to-blue-600 border border-slate-200" />
          Intensidade = faturamento do estado
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600/80 border border-blue-900" />
          Bolha = cidade (tamanho ∝ faturamento)
        </div>
        <div>{placed.length} {placed.length === 1 ? "cidade" : "cidades"}</div>
      </div>
    </div>
  );
}

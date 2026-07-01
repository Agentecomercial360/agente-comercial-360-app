import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { BR_STATES } from "@/lib/br-locations";

const STATE_BY_UF = new Map(BR_STATES.map((s) => [s.uf.toUpperCase(), s]));

// Native viewBox of the geometry (see src/data/br-states.json)
const VB_W = 800;
const VB_H = 800;

const BRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function jitterFor(city: string, uf: string) {
  const h = hash(`${city}||${uf}`);
  const dx = (((h % 200) / 100) - 1) * 24;
  const dy = ((((h >> 8) % 200) / 100) - 1) * 24;
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
    | { label: string; sub: string; extra: string; kind: "city" | "state"; x: number; y: number }
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
          r: 6 + Math.sqrt(p.revenue / maxCityRev) * 22,
        };
      })
      .filter(Boolean) as (CityPoint & { x: number; y: number; r: number })[];
  }, [points, maxCityRev]);

  function stateFill(uf: string) {
    const rev = stateRevenue.get(uf) ?? 0;
    if (rev === 0) return "#eef2f7"; // clearer base than slate-50
    const t = Math.sqrt(rev / maxStateRev);
    // Interpolate between blue-50 (#eff6ff) and blue-500 (#3b82f6) — softer, more premium
    const c1 = [219, 234, 254]; // blue-100
    const c2 = [37, 99, 235]; // blue-600
    const k = 0.25 + t * 0.7;
    const c = c1.map((v, i) => Math.round(v + (c2[i] - v) * k));
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
        className="mx-auto block h-[500px] w-full max-w-[620px]"
      >
        <defs>
          <radialGradient id="cityDot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="1" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.75" />
          </radialGradient>
        </defs>

        {/* States */}
        <g>
          {BR_STATES.map((s) => {
            const uf = s.uf.toUpperCase();
            const isSelected = selectedUf === uf;
            const orders = stateOrders.get(uf) ?? 0;
            const rev = stateRevenue.get(uf) ?? 0;
            const avg = orders > 0 ? rev / orders : 0;
            return (
              <path
                key={s.uf}
                d={s.d}
                fill={stateFill(uf)}
                stroke={isSelected ? "#1d4ed8" : "#64748b"}
                strokeWidth={isSelected ? 2.2 : 0.9}
                className="cursor-pointer transition-[filter] hover:brightness-95"
                onMouseEnter={(e) => {
                  const svgEl = e.currentTarget.ownerSVGElement as SVGSVGElement;
                  const rect = svgEl.getBoundingClientRect();
                  const parentRect = (svgEl.parentElement as HTMLElement).getBoundingClientRect();
                  setHover({
                    kind: "state",
                    label: `${s.name} (${s.uf})`,
                    sub: `${orders} ${orders === 1 ? "pedido" : "pedidos"} · ${BRL(rev)}`,
                    extra: orders > 0 ? `Ticket médio: ${BRL(avg)}` : "Sem pedidos no período",
                    x: (s.cx / VB_W) * rect.width + (rect.left - parentRect.left),
                    y: (s.cy / VB_H) * rect.height + (rect.top - parentRect.top),
                  });
                }}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectState(s.uf)}
              />
            );
          })}
        </g>

        {/* State labels (UF acronyms) */}
        <g style={{ pointerEvents: "none" }}>
          {BR_STATES.map((s) => {
            const uf = s.uf.toUpperCase();
            const hasData = (stateRevenue.get(uf) ?? 0) > 0;
            const rev = stateRevenue.get(uf) ?? 0;
            const strong = hasData && rev / maxStateRev > 0.35;
            return (
              <text
                key={`t-${s.uf}`}
                x={s.cx}
                y={s.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={strong ? "#ffffff" : hasData ? "#0f172a" : "#475569"}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  userSelect: "none",
                  paintOrder: "stroke",
                  stroke: strong ? "rgba(15,23,42,0.35)" : "rgba(255,255,255,0.7)",
                  strokeWidth: 2,
                }}
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
            const avg = p.orders > 0 ? p.revenue / p.orders : 0;
            return (
              <g
                key={`${p.city}/${p.uf}`}
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  const svgEl = e.currentTarget.ownerSVGElement as SVGSVGElement;
                  const rect = svgEl.getBoundingClientRect();
                  const parentRect = (svgEl.parentElement as HTMLElement).getBoundingClientRect();
                  setHover({
                    kind: "city",
                    label: `${p.city}/${p.uf}`,
                    sub: `${p.orders} ${p.orders === 1 ? "pedido" : "pedidos"} · ${BRL(p.revenue)}`,
                    extra: `Ticket médio: ${BRL(avg)}`,
                    x: (p.x / VB_W) * rect.width + (rect.left - parentRect.left),
                    y: (p.y / VB_H) * rect.height + (rect.top - parentRect.top),
                  });
                }}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectCity(p.city, p.uf)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.r + 2}
                  fill="#ffffff"
                  opacity={0.85}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.r}
                  fill="url(#cityDot)"
                  stroke={isSelected ? "#0b1a4b" : "#1e3a8a"}
                  strokeWidth={isSelected ? 2.4 : 1.2}
                  opacity={0.95}
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
          style={{ left: hover.x, top: hover.y - 12 }}
        >
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900">
            <MapPin className="h-3.5 w-3.5 text-blue-600" />
            {hover.label}
          </div>
          <div className="text-[11px] text-slate-600">{hover.sub}</div>
          <div className="text-[11px] text-slate-500">{hover.extra}</div>
          <div className="mt-1 text-[10px] font-semibold text-blue-600">
            Clique para {hover.kind === "state" ? "ver o estado" : "ver a cidade"}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-8 rounded-sm border border-slate-300 bg-gradient-to-r from-blue-100 to-blue-600" />
          Intensidade = faturamento do estado
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border border-blue-900 bg-blue-600" />
          Bolha = cidade (tamanho ∝ faturamento)
        </div>
        <div>{placed.length} {placed.length === 1 ? "cidade" : "cidades"}</div>
      </div>
    </div>
  );
}

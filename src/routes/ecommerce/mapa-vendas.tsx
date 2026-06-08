import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Map as MapIcon,
  MapPin,
  Building2,
  DollarSign,
  XCircle,
  BrainCircuit,
  Package,
  Info,
  TrendingUp,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import brStatesData from "@/data/br-states.json";

export const Route = createFileRoute("/ecommerce/mapa-vendas")({
  component: MapaVendas,
  head: () => ({
    meta: [{ title: "Mapa de Vendas | Agente Comercial 360" }],
  }),
});

type BrState = { uf: string; name: string; d: string; cx: number; cy: number };
const STATES = brStatesData as BrState[];

const VIEW_TABS = [
  { id: "receita", label: "Receita" },
  { id: "pedidos", label: "Pedidos" },
  { id: "cancelamentos", label: "Cancelamentos" },
  { id: "ticket", label: "Ticket médio" },
] as const;

function MapaVendas() {
  const [view, setView] = useState<(typeof VIEW_TABS)[number]["id"]>("receita");
  const [hover, setHover] = useState<BrState | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const tooltipPos = useMemo(() => {
    if (!hover) return null;
    // svg viewBox is 800x800
    const left = (hover.cx / 800) * 100;
    const top = (hover.cy / 800) * 100;
    return { left: `${left}%`, top: `${top}%` };
  }, [hover]);

  return (
    <EcommerceLayout>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <MapIcon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Mapa de Vendas
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Visualize onde a operação concentra receita, pedidos,
                cancelamentos e oportunidades regionais.
              </p>
              <p className="text-xs text-muted-foreground/90 max-w-2xl">
                Este módulo será conectado aos pedidos reais para identificar
                estados e cidades com maior impacto comercial.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            <span className="text-xs font-semibold text-blue-700">
              Dados geográficos em preparação
            </span>
          </div>
        </header>

        {/* Top summary */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<MapPin className="h-4 w-4" />}
            label="Estados com vendas"
            placeholder="Aguardando integração"
            hint="Disponível após sincronização de pedidos com localidade."
            accent="primary"
          />
          <SummaryCard
            icon={<Building2 className="h-4 w-4" />}
            label="Cidade líder"
            placeholder="Em preparação"
            hint="Identifica a cidade com maior volume de pedidos."
            accent="info"
          />
          <SummaryCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Receita geográfica"
            placeholder="Após sincronização"
            hint="Soma de faturamento agrupado por UF."
            accent="success"
          />
          <SummaryCard
            icon={<XCircle className="h-4 w-4" />}
            label="Taxa de cancelamento"
            placeholder="Aguardando dados"
            hint="Percentual de pedidos cancelados por região."
            accent="warning"
          />
        </section>

        {/* Map + Side */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 px-6 py-4">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Visão geográfica
                </div>
                <div className="font-display text-base font-semibold text-foreground">
                  Mapa do Brasil
                </div>
              </div>
              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100/70 p-1">
                {VIEW_TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setView(t.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                      view === t.id
                        ? "bg-white text-foreground shadow-sm ring-1 ring-slate-200"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="relative px-6 py-8"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 30%, #EEF4FB 0%, #F4F7FB 55%, #F8FAFC 100%)",
              }}
            >
              <div className="relative mx-auto w-full max-w-[720px]">
                <div className="relative">
                  <svg
                    viewBox="0 0 800 800"
                    className="block h-auto w-full drop-shadow-[0_8px_24px_rgba(30,58,138,0.08)]"
                    role="img"
                    aria-label="Mapa do Brasil"
                  >
                    <defs>
                      <linearGradient id="stateNeutral" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#DDE6F1" />
                        <stop offset="100%" stopColor="#CDD8E6" />
                      </linearGradient>
                      <linearGradient id="stateHover" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#2563EB" />
                      </linearGradient>
                      <linearGradient id="stateSelected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1D4ED8" />
                        <stop offset="100%" stopColor="#172554" />
                      </linearGradient>
                    </defs>
                    <g>
                      {STATES.map((s) => {
                        const isHover = hover?.uf === s.uf;
                        const isSelected = selected === s.uf;
                        const fill = isSelected
                          ? "url(#stateSelected)"
                          : isHover
                            ? "url(#stateHover)"
                            : "url(#stateNeutral)";
                        const stroke = isSelected
                          ? "#0B1E59"
                          : isHover
                            ? "#1E3A8A"
                            : "#FFFFFF";
                        return (
                          <path
                            key={s.uf}
                            d={s.d}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={isSelected || isHover ? 1.4 : 1}
                            strokeLinejoin="round"
                            style={{
                              cursor: "pointer",
                              transition:
                                "fill 200ms ease, stroke 200ms ease, filter 200ms ease",
                              filter:
                                isSelected || isHover
                                  ? "drop-shadow(0 2px 6px rgba(29,78,216,0.35))"
                                  : "none",
                            }}
                            onMouseEnter={() => setHover(s)}
                            onMouseLeave={() => setHover(null)}
                            onClick={() =>
                              setSelected((cur) => (cur === s.uf ? null : s.uf))
                            }
                          />
                        );
                      })}
                    </g>
                    <g style={{ pointerEvents: "none" }}>
                      {STATES.map((s) => {
                        const isActive =
                          hover?.uf === s.uf || selected === s.uf;
                        return (
                          <text
                            key={s.uf}
                            x={s.cx}
                            y={s.cy + 3}
                            textAnchor="middle"
                            fontSize={10}
                            fontWeight={700}
                            fill={isActive ? "#FFFFFF" : "#334155"}
                            style={{ userSelect: "none", letterSpacing: 0.2 }}
                          >
                            {s.uf}
                          </text>
                        );
                      })}
                    </g>
                  </svg>

                  {hover && tooltipPos && (
                    <div
                      className="pointer-events-none absolute z-10 w-64 -translate-x-1/2 -translate-y-[112%] rounded-xl border border-slate-700/40 bg-slate-900/95 p-3 text-white shadow-[0_12px_30px_-8px_rgba(15,23,42,0.45)] backdrop-blur-sm"
                      style={tooltipPos}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-blue-300/80">
                            {hover.uf}
                          </div>
                          <div className="font-display text-sm font-semibold">
                            {hover.name}
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                          Em integração
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 border-t border-white/10 pt-2 text-[11px]">
                        <TipRow k="Receita" />
                        <TipRow k="Pedidos" />
                        <TipRow k="Cancelamentos" />
                      </div>
                      <p className="mt-2 text-[10.5px] leading-snug text-white/60">
                        Dados serão exibidos após sincronização de pedidos e
                        localidades.
                      </p>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-2.5 text-[11.5px] text-muted-foreground backdrop-blur">
                  <div className="flex flex-wrap items-center gap-4">
                    <LegendDot color="#CDD8E6" label="Aguardando dados" />
                    <LegendDot color="#2563EB" label="Estado em foco" />
                    <LegendDot
                      color="#10B981"
                      label="Alta performance (futuro)"
                      future
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Info className="h-3.5 w-3.5" />
                    <span>Leitura ativada após integração</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side panel */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
              <div className="border-b border-border px-5 py-4">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Estado selecionado
                </div>
                <div className="font-display text-base font-semibold text-foreground">
                  {selected
                    ? STATES.find((s) => s.uf === selected)?.name
                    : "Nenhum estado"}
                </div>
              </div>
              <div className="space-y-3 px-5 py-4 text-xs">
                <KV k="Receita" v="—" />
                <KV k="Pedidos" v="—" />
                <KV k="Ticket médio" v="—" />
                <KV k="Cancelamentos" v="—" />
                <div className="rounded-md bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
                  {selected
                    ? "Indicadores serão exibidos após a integração de pedidos por UF."
                    : "Clique em um estado no mapa para visualizar o detalhamento."}
                </div>
              </div>
            </div>

            <RankingCard
              title="Top estados por faturamento"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <RankingCard
              title="Top cidades por pedidos"
              icon={<Building2 className="h-4 w-4" />}
            />
          </aside>
        </section>

        {/* Bottom blocks */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InfoBlock
            icon={<Package className="h-4 w-4" />}
            title="Produtos por região"
            text="Identifique quais produtos performam melhor em cada estado."
          />
          <InfoBlock
            icon={<XCircle className="h-4 w-4" />}
            title="Cancelamentos"
            text="Acompanhe estados e cidades com maior taxa de cancelamento."
            tone="warning"
          />
          <InfoBlock
            icon={<BrainCircuit className="h-4 w-4" />}
            title="Leitura da IA"
            text="A IA poderá destacar regiões com oportunidade de escala, queda de vendas ou risco operacional."
            tone="info"
          />
        </section>

        <p className="text-center text-xs text-muted-foreground">
          Os dados do Mapa de Vendas serão preenchidos após a integração de
          pedidos, clientes e localidades.
        </p>
      </div>
    </EcommerceLayout>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full border border-white shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  placeholder,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  hint: string;
  accent: "primary" | "info" | "success" | "warning";
}) {
  const accents: Record<string, string> = {
    primary: "before:bg-blue-600",
    info: "before:bg-sky-500",
    success: "before:bg-emerald-500",
    warning: "before:bg-amber-500",
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] ${accents[accent]}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="mt-3 font-display text-lg font-semibold text-foreground">
        {placeholder}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function RankingCard({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="text-muted-foreground">{icon}</span>
        <div className="text-xs font-semibold text-foreground">{title}</div>
      </div>
      <div className="space-y-2 px-5 py-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-border bg-white text-[10px] font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <span className="text-xs text-muted-foreground">—</span>
            </div>
            <span className="text-xs text-muted-foreground">—</span>
          </div>
        ))}
        <p className="pt-1 text-[11px] text-muted-foreground">
          Dados regionais serão exibidos após integração de pedidos e
          localidades.
        </p>
      </div>
    </div>
  );
}

function InfoBlock({
  icon,
  title,
  text,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  tone?: "neutral" | "warning" | "info";
}) {
  const toneClass =
    tone === "warning"
      ? "text-amber-600 bg-amber-50 border-amber-100"
      : tone === "info"
        ? "text-blue-700 bg-blue-50 border-blue-100"
        : "text-muted-foreground bg-muted/40 border-border";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div
        className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-[11px] font-semibold ${toneClass}`}
      >
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-3 text-sm text-foreground/90">{text}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Bloco preparado para dados futuros.
      </p>
    </div>
  );
}

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
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <MapIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Mapa de Vendas
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Visualize a distribuição geográfica da operação e acompanhe,
                futuramente, pedidos, vendas e cancelamentos por região.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
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
          <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Visão geográfica
                </div>
                <div className="font-display text-base font-semibold text-foreground">
                  Mapa do Brasil
                </div>
              </div>
              <div className="inline-flex items-center rounded-lg bg-muted p-1">
                {VIEW_TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setView(t.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                      view === t.id
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative p-6">
              <div className="relative mx-auto w-full max-w-[760px]">
                <div
                  className="relative rounded-2xl"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 35%, #EFF4FB 0%, #F8FAFC 70%)",
                  }}
                >
                  <svg
                    viewBox="0 0 800 800"
                    className="block h-auto w-full"
                    role="img"
                    aria-label="Mapa do Brasil"
                  >
                    <defs>
                      <filter
                        id="stateShadow"
                        x="-5%"
                        y="-5%"
                        width="110%"
                        height="110%"
                      >
                        <feDropShadow
                          dx="0"
                          dy="1"
                          stdDeviation="1"
                          floodColor="#0F172A"
                          floodOpacity="0.08"
                        />
                      </filter>
                    </defs>
                    <g filter="url(#stateShadow)">
                      {STATES.map((s) => {
                        const isHover = hover?.uf === s.uf;
                        const isSelected = selected === s.uf;
                        const fill = isSelected
                          ? "#1D4ED8"
                          : isHover
                            ? "#3B82F6"
                            : "#E2E8F0";
                        const stroke = isSelected || isHover ? "#1E3A8A" : "#FFFFFF";
                        return (
                          <path
                            key={s.uf}
                            d={s.d}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={isSelected || isHover ? 1.2 : 0.8}
                            style={{
                              cursor: "pointer",
                              transition: "fill 180ms ease, stroke 180ms ease",
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
                    {/* UF labels */}
                    <g style={{ pointerEvents: "none" }}>
                      {STATES.map((s) => {
                        const isActive = hover?.uf === s.uf || selected === s.uf;
                        return (
                          <text
                            key={s.uf}
                            x={s.cx}
                            y={s.cy + 3}
                            textAnchor="middle"
                            fontSize={10}
                            fontWeight={600}
                            fill={isActive ? "#FFFFFF" : "#475569"}
                            style={{ userSelect: "none" }}
                          >
                            {s.uf}
                          </text>
                        );
                      })}
                    </g>
                  </svg>

                  {hover && tooltipPos && (
                    <div
                      className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-[120%] rounded-xl border border-border bg-white p-3 shadow-lg"
                      style={tooltipPos}
                    >
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {hover.uf}
                      </div>
                      <div className="font-display text-sm font-semibold text-foreground">
                        {hover.name}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Dados em integração
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11.5px] text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-4">
                    <LegendDot color="#E2E8F0" label="Estado neutro" />
                    <LegendDot color="#3B82F6" label="Estado em foco" />
                    <LegendDot color="#1D4ED8" label="Selecionado" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    <span>Dados em integração</span>
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

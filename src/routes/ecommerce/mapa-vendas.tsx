import { useState } from "react";
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
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/mapa-vendas")({
  component: MapaVendas,
  head: () => ({
    meta: [{ title: "Mapa de Vendas | Agente Comercial 360" }],
  }),
});

const STATES: { uf: string; name: string; cx: number; cy: number; r: number }[] = [
  { uf: "AC", name: "Acre", cx: 90, cy: 200, r: 22 },
  { uf: "AM", name: "Amazonas", cx: 170, cy: 150, r: 44 },
  { uf: "RR", name: "Roraima", cx: 200, cy: 70, r: 22 },
  { uf: "AP", name: "Amapá", cx: 290, cy: 80, r: 20 },
  { uf: "PA", name: "Pará", cx: 280, cy: 150, r: 40 },
  { uf: "RO", name: "Rondônia", cx: 160, cy: 230, r: 24 },
  { uf: "MT", name: "Mato Grosso", cx: 260, cy: 250, r: 36 },
  { uf: "TO", name: "Tocantins", cx: 330, cy: 220, r: 24 },
  { uf: "MA", name: "Maranhão", cx: 370, cy: 170, r: 28 },
  { uf: "PI", name: "Piauí", cx: 400, cy: 210, r: 24 },
  { uf: "CE", name: "Ceará", cx: 440, cy: 170, r: 22 },
  { uf: "RN", name: "Rio G. do Norte", cx: 485, cy: 175, r: 16 },
  { uf: "PB", name: "Paraíba", cx: 495, cy: 200, r: 14 },
  { uf: "PE", name: "Pernambuco", cx: 475, cy: 220, r: 18 },
  { uf: "AL", name: "Alagoas", cx: 490, cy: 245, r: 13 },
  { uf: "SE", name: "Sergipe", cx: 475, cy: 265, r: 12 },
  { uf: "BA", name: "Bahia", cx: 420, cy: 270, r: 36 },
  { uf: "DF", name: "Distrito Federal", cx: 340, cy: 290, r: 10 },
  { uf: "GO", name: "Goiás", cx: 315, cy: 300, r: 26 },
  { uf: "MS", name: "Mato G. do Sul", cx: 270, cy: 340, r: 26 },
  { uf: "MG", name: "Minas Gerais", cx: 370, cy: 330, r: 34 },
  { uf: "ES", name: "Espírito Santo", cx: 430, cy: 340, r: 16 },
  { uf: "RJ", name: "Rio de Janeiro", cx: 410, cy: 380, r: 18 },
  { uf: "SP", name: "São Paulo", cx: 340, cy: 380, r: 28 },
  { uf: "PR", name: "Paraná", cx: 300, cy: 420, r: 24 },
  { uf: "SC", name: "Santa Catarina", cx: 305, cy: 460, r: 20 },
  { uf: "RS", name: "Rio G. do Sul", cx: 270, cy: 500, r: 30 },
];

const VIEW_TABS = [
  { id: "receita", label: "Receita" },
  { id: "pedidos", label: "Pedidos" },
  { id: "cancelamentos", label: "Cancelamentos" },
  { id: "ticket", label: "Ticket médio" },
] as const;

function MapaVendas() {
  const [view, setView] = useState<(typeof VIEW_TABS)[number]["id"]>("receita");
  const [hover, setHover] = useState<(typeof STATES)[number] | null>(null);

  return (
    <EcommerceLayout>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
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
                  Visualize onde a operação concentra receita, pedidos, cancelamentos e oportunidades regionais.
                </p>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-blue-700">
              Dados geográficos em preparação
            </span>
          </div>
        </header>

        {/* Top cards */}
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

        {/* Map + Ranking */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Map */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
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
              <div className="relative mx-auto aspect-[4/5] max-w-[560px]">
                <svg
                  viewBox="0 0 580 580"
                  className="h-full w-full"
                  role="img"
                  aria-label="Mapa esquemático do Brasil"
                >
                  <defs>
                    <radialGradient id="bgGlow" cx="50%" cy="40%" r="70%">
                      <stop offset="0%" stopColor="#EFF4FB" />
                      <stop offset="100%" stopColor="#F8FAFC" />
                    </radialGradient>
                  </defs>
                  <rect width="580" height="580" rx="24" fill="url(#bgGlow)" />
                  {STATES.map((s) => {
                    const isHover = hover?.uf === s.uf;
                    return (
                      <g
                        key={s.uf}
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(null)}
                        style={{ cursor: "pointer" }}
                      >
                        <circle
                          cx={s.cx}
                          cy={s.cy}
                          r={s.r}
                          fill={isHover ? "#1E3A8A" : "#E2E8F0"}
                          stroke={isHover ? "#1E3A8A" : "#CBD5E1"}
                          strokeWidth={1}
                          style={{ transition: "all 200ms ease" }}
                          opacity={isHover ? 0.92 : 0.85}
                        />
                        <text
                          x={s.cx}
                          y={s.cy + 3}
                          textAnchor="middle"
                          fontSize={s.r > 22 ? 11 : 9}
                          fontWeight={600}
                          fill={isHover ? "#FFFFFF" : "#475569"}
                          style={{ pointerEvents: "none", userSelect: "none" }}
                        >
                          {s.uf}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {hover && (
                  <div
                    className="pointer-events-none absolute z-10 w-56 rounded-xl border border-border bg-white p-3 shadow-lg"
                    style={{
                      left: `${(hover.cx / 580) * 100}%`,
                      top: `${(hover.cy / 580) * 100}%`,
                      transform: "translate(12px, 12px)",
                    }}
                  >
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {hover.uf}
                    </div>
                    <div className="font-display text-sm font-semibold text-foreground">
                      {hover.name}
                    </div>
                    <div className="mt-2 space-y-1 text-xs">
                      <Row k="Receita" v="—" />
                      <Row k="Pedidos" v="—" />
                      <Row k="Cancelamentos" v="—" />
                    </div>
                    <div className="mt-2 border-t border-border pt-2 text-[10.5px] text-muted-foreground">
                      Aguardando dados reais
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-[11.5px] text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Estrutura preparada para interação por estado. Os dados serão exibidos após a integração de pedidos e localidades.
                </span>
              </div>
            </div>
          </div>

          {/* Ranking */}
          <aside className="rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
            <div className="border-b border-border px-6 py-4">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Painel lateral
              </div>
              <div className="font-display text-base font-semibold text-foreground">
                Ranking regional
              </div>
            </div>
            <div className="divide-y divide-border">
              <RankingSection title="Top estados por faturamento" />
              <RankingSection title="Top cidades por pedidos" />
              <RankingSection title="Estados com mais cancelamentos" />
            </div>
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
          Os dados do Mapa de Vendas serão preenchidos após a integração de pedidos, clientes e localidades.
        </p>
      </div>
    </EcommerceLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
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

function RankingSection({ title }: { title: string }) {
  return (
    <div className="px-6 py-5">
      <div className="text-xs font-semibold text-foreground">{title}</div>
      <div className="mt-3 space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[10px] font-semibold text-muted-foreground border border-border">
                {i + 1}
              </span>
              <span className="text-xs text-muted-foreground">—</span>
            </div>
            <span className="text-xs text-muted-foreground">—</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Dados regionais serão exibidos após a integração de pedidos e localidades.
      </p>
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

import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutGrid,
  Sparkles,
  Eye,
  Lock,
  ShieldCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  Package,
  Image as ImageIcon,
  ArrowRight,
  Gauge,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/ecommerce/feed-inteligente")({
  component: FeedInteligente,
  head: () => ({
    meta: [
      { title: "Feed Inteligente da Operação | AC360 E-commerce Intelligence" },
      {
        name: "description",
        content:
          "Vitrine visual dos anúncios da operação com diagnóstico, métricas e próximas ações recomendadas.",
      },
      { name: "robots", content: "noindex, nofollow" },
      {
        property: "og:title",
        content: "Feed Inteligente da Operação | AC360 E-commerce Intelligence",
      },
      {
        property: "og:description",
        content:
          "Vitrine visual dos anúncios da operação com diagnóstico, métricas e próximas ações recomendadas.",
      },
    ],
  }),
});

const QUICK_FILTERS = [
  { label: "Todos", icon: LayoutGrid, count: 295, active: true },
  { label: "Oportunidades", icon: TrendingUp, count: 42 },
  { label: "Críticos", icon: AlertOctagon, count: 18 },
  { label: "Sem custo", icon: Lock, count: 295 },
  { label: "Ads", icon: Sparkles, count: 31 },
  { label: "Estoque baixo", icon: Package, count: 12 },
  { label: "Top vendas", icon: Gauge, count: 20 },
];

type StatusKey = "opportunity" | "attention" | "critical";

const STATUS_STYLES: Record<
  StatusKey,
  { label: string; badge: string; ring: string; glow: string; icon: typeof TrendingUp }
> = {
  opportunity: {
    label: "Oportunidade",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ring: "hover:ring-emerald-200/70",
    glow: "from-emerald-400/25 via-cyan-400/15 to-transparent",
    icon: TrendingUp,
  },
  attention: {
    label: "Atenção",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "hover:ring-amber-200/70",
    glow: "from-amber-400/25 via-orange-400/15 to-transparent",
    icon: AlertTriangle,
  },
  critical: {
    label: "Crítico",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    ring: "hover:ring-rose-200/70",
    glow: "from-rose-400/25 via-fuchsia-400/15 to-transparent",
    icon: AlertOctagon,
  },
};

const MOCK_CARDS: Array<{
  title: string;
  sku: string;
  status: StatusKey;
  diagnosis: string;
  action: string;
  metrics: { visits: string; sales: string; revenue: string; conversion: string; stock: string };
}> = [
  {
    title: "Kit Churrasco com oportunidade de escala",
    sku: "SKU-EX-1042",
    status: "opportunity",
    diagnosis: "Produto com bom volume e potencial de crescimento.",
    action: "Validar custos reais antes de escalar Ads.",
    metrics: {
      visits: "4.120",
      sales: "86",
      revenue: "R$ 18.400",
      conversion: "2,1%",
      stock: "74",
    },
  },
  {
    title: "Lareira com estoque baixo",
    sku: "SKU-EX-2213",
    status: "attention",
    diagnosis: "Produto com boa demanda, mas risco de ruptura.",
    action: "Revisar estoque antes de aumentar investimento.",
    metrics: {
      visits: "2.870",
      sales: "51",
      revenue: "R$ 12.950",
      conversion: "1,8%",
      stock: "6",
    },
  },
  {
    title: "Organizador com visitas e nenhuma venda",
    sku: "SKU-EX-3390",
    status: "critical",
    diagnosis: "Produto recebe visitas, mas não converte.",
    action: "Revisar título, imagem, preço e qualidade do anúncio.",
    metrics: {
      visits: "1.930",
      sales: "0",
      revenue: "R$ 0",
      conversion: "0,0%",
      stock: "48",
    },
  },
];

const HEADER_BADGES = [
  { label: "Prévia visual", icon: Eye },
  { label: "Somente leitura", icon: Lock },
  { label: "Sem ações automáticas", icon: ShieldCheck },
  { label: "Dados reais em breve", icon: Clock },
];

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50/80 px-2.5 py-2 text-center ring-1 ring-slate-100">
      <p className="text-[11px] font-semibold text-slate-800">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function ContextRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "pending" | "info";
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600",
    positive: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    info: "bg-blue-50 text-blue-700",
  } as const;
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>
        {value}
      </span>
    </div>
  );
}

function FeedInteligente() {
  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header da página */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-violet-400/20 via-blue-400/15 to-cyan-300/10 blur-3xl" />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Feed Inteligente da Operação
                </h1>
                <p className="text-sm text-slate-500">
                  A vitrine visual da operação com diagnóstico por anúncio.
                </p>
              </div>
            </div>
            <p className="max-w-3xl text-xs text-slate-400">
              Visualize os anúncios da conta em formato de vitrine inteligente, com diagnóstico,
              métricas e próximas ações.
            </p>
            <div className="flex flex-wrap gap-2">
              {HEADER_BADGES.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                >
                  <badge.icon className="h-3 w-3" />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
          {/* Coluna esquerda */}
          <Card className="h-fit rounded-2xl border-slate-200/80 p-4 shadow-sm">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Filtros rápidos
            </p>
            <div className="space-y-1">
              {QUICK_FILTERS.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    filter.active
                      ? "bg-gradient-to-r from-blue-50 to-violet-50 font-semibold text-blue-700 ring-1 ring-blue-100"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <filter.icon className="h-3.5 w-3.5" />
                    {filter.label}
                  </span>
                  <span className="text-[11px] text-slate-400">{filter.count}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 p-2.5 text-[10px] leading-relaxed text-slate-400">
              Filtros ainda visuais nesta prévia. A filtragem real será ativada com os dados da
              operação.
            </p>
          </Card>

          {/* Coluna central */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Feed de anúncios</h2>
              <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">
                Prévia visual
              </Badge>
            </div>

            {MOCK_CARDS.map((card) => {
              const status = STATUS_STYLES[card.status];
              return (
                <Card
                  key={card.sku}
                  className={`overflow-hidden rounded-2xl border-slate-200/80 p-0 shadow-sm ring-1 ring-transparent transition-all hover:shadow-md ${status.ring}`}
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row">
                    <div
                      className={`relative flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${status.glow} bg-slate-50 sm:w-32`}
                    >
                      <ImageIcon className="h-7 w-7 text-slate-300" />
                      <span className="absolute bottom-1.5 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-medium text-slate-400">
                        Imagem em breve
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {card.title}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {card.sku} · Mercado Livre - Nightled
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.badge}`}
                        >
                          <status.icon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        <Metric label="Visitas" value={card.metrics.visits} />
                        <Metric label="Vendas" value={card.metrics.sales} />
                        <Metric label="Receita" value={card.metrics.revenue} />
                        <Metric label="Conversão" value={card.metrics.conversion} />
                        <Metric label="Estoque" value={card.metrics.stock} />
                      </div>

                      <div className="space-y-1.5 rounded-xl bg-slate-50/70 p-3">
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">Diagnóstico: </span>
                          {card.diagnosis}
                        </p>
                        <p className="flex items-start gap-1.5 text-xs text-blue-700">
                          <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>
                            <span className="font-semibold">Ação recomendada: </span>
                            {card.action}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            <p className="text-center text-[11px] text-slate-400">
              Exemplos ilustrativos — os anúncios reais da conta aparecerão aqui na próxima etapa.
            </p>
          </div>

          {/* Coluna direita */}
          <div className="space-y-4">
            <Card className="rounded-2xl border-slate-200/80 p-4 shadow-sm ring-1 ring-slate-100">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Contexto da operação
              </p>
              <div className="divide-y divide-slate-100">
                <ContextRow label="Conta ativa" value="ML - Nightled" tone="info" />
                <ContextRow label="Anúncios analisados" value="295" />
                <ContextRow label="Pedidos analisados" value="455" />
                <ContextRow label="Receita" value="Disponível" tone="positive" />
                <ContextRow label="Custos" value="Pendentes" tone="pending" />
                <ContextRow label="Margem / Lucro" value="Aguardando custos" tone="pending" />
                <ContextRow label="Modo" value="Somente leitura" />
              </div>
            </Card>

            <Card className="rounded-2xl border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                    Próxima prioridade
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Cadastrar custos reais dos produtos
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Sem custos reais, o diagnóstico de margem e lucro permanece bloqueado.
                  </p>
                </div>
              </div>
              <Button
                disabled
                variant="outline"
                className="mt-3 w-full gap-2 border-amber-200 bg-white/70 text-xs text-amber-700"
              >
                <Lock className="h-3 w-3" />
                Criar tarefa em breve
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </EcommerceLayout>
  );
}

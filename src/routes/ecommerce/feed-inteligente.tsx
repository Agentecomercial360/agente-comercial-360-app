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
  MoreHorizontal,
  Store,
  
  ListChecks,
  BarChart3,
  Boxes,
  Target,
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

const SHORTCUTS: Array<{
  label: string;
  icon: typeof TrendingUp;
  ring: string;
  bg: string;
  dot: string;
  count?: number;
}> = [
  {
    label: "Todos",
    icon: LayoutGrid,
    ring: "ring-slate-200/80",
    bg: "from-slate-100 to-white text-slate-600",
    dot: "bg-slate-400",
    count: 295,
  },
  {
    label: "Oportunidades",
    icon: TrendingUp,
    ring: "ring-emerald-200/80",
    bg: "from-emerald-100 to-white text-emerald-600",
    dot: "bg-emerald-500",
    count: 42,
  },
  {
    label: "Críticos",
    icon: AlertOctagon,
    ring: "ring-rose-200/80",
    bg: "from-rose-100 to-white text-rose-600",
    dot: "bg-rose-500",
    count: 18,
  },
  {
    label: "Sem custo",
    icon: Lock,
    ring: "ring-amber-200/80",
    bg: "from-amber-100 to-white text-amber-600",
    dot: "bg-amber-500",
    count: 295,
  },
  {
    label: "Ads",
    icon: Sparkles,
    ring: "ring-violet-200/80",
    bg: "from-violet-100 to-white text-violet-600",
    dot: "bg-violet-500",
    count: 31,
  },
  {
    label: "Estoque baixo",
    icon: Package,
    ring: "ring-orange-200/80",
    bg: "from-orange-100 to-white text-orange-600",
    dot: "bg-orange-500",
    count: 12,
  },
  {
    label: "Top vendas",
    icon: Gauge,
    ring: "ring-blue-200/80",
    bg: "from-blue-100 to-white text-blue-600",
    dot: "bg-blue-500",
    count: 20,
  },


];

type StatusKey = "opportunity" | "attention" | "critical";

const STATUS_STYLES: Record<
  StatusKey,
  {
    label: string;
    badge: string;
    ring: string;
    cover: string;
    coverIcon: string;
    action: string;
    icon: typeof TrendingUp;
  }
> = {
  opportunity: {
    label: "Oportunidade",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ring: "hover:ring-emerald-200/70",
    cover: "from-emerald-100 via-teal-50 to-cyan-100",
    coverIcon: "text-emerald-400/70",
    action: "border-emerald-100 bg-emerald-50/70 text-emerald-800",
    icon: TrendingUp,
  },
  attention: {
    label: "Atenção",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "hover:ring-amber-200/70",
    cover: "from-amber-100 via-orange-50 to-yellow-100",
    coverIcon: "text-amber-400/70",
    action: "border-amber-100 bg-amber-50/70 text-amber-800",
    icon: AlertTriangle,
  },
  critical: {
    label: "Crítico",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    ring: "hover:ring-rose-200/70",
    cover: "from-rose-100 via-pink-50 to-fuchsia-100",
    coverIcon: "text-rose-400/70",
    action: "border-rose-100 bg-rose-50/70 text-rose-800",
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

const SUGGESTIONS = [
  { label: "Revisar anúncios críticos", icon: AlertOctagon, tone: "text-rose-600 bg-rose-50" },
  { label: "Conferir estoque baixo", icon: Boxes, tone: "text-amber-600 bg-amber-50" },
  { label: "Validar produtos sem custo", icon: ListChecks, tone: "text-blue-600 bg-blue-50" },
  { label: "Separar oportunidades para Ads", icon: Target, tone: "text-violet-600 bg-violet-50" },
];

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-2 py-3">
      <p className="text-[15px] font-semibold leading-none tracking-tight text-slate-900">
        {value}
      </p>
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
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
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-blue-50/70 via-white to-violet-50/60 px-8 py-9 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-24px_rgba(79,70,229,0.35)]">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-violet-400/20 via-blue-400/14 to-cyan-300/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-300/14 to-transparent blur-3xl" />
          <div className="relative flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-slate-900">
                  Feed Inteligente da Operação
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  A vitrine visual da operação com diagnóstico por anúncio.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {HEADER_BADGES.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/70 px-3.5 text-[11px] font-medium leading-none text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm"
                >
                  <badge.icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>


        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)_300px]">
          {/* Coluna esquerda */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Card className="overflow-hidden rounded-3xl border-slate-200/60 p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-28px_rgba(15,23,42,0.4)]">
              <div className="relative h-16 bg-gradient-to-r from-blue-600/85 via-indigo-600/85 to-violet-600/85">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_130%,rgba(255,255,255,0.3),transparent_60%)]" />
                <div className="absolute -bottom-8 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
                  <Store className="h-6 w-6 shrink-0 text-blue-600" />
                </div>
              </div>
              <div className="px-5 pb-6 pt-11 text-center">
                <p className="text-sm font-semibold leading-tight text-slate-900">
                  Mercado Livre - Nightled
                </p>
                <p className="mt-1.5 text-[11px] font-medium text-slate-500/90">
                  Conta ativa da operação
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <div className="rounded-2xl bg-slate-50/80 px-3 py-3 text-center ring-1 ring-slate-100">
                    <p className="text-base font-semibold text-slate-900">295</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                      anúncios
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50/80 px-3 py-3 text-center ring-1 ring-slate-100">
                    <p className="text-base font-semibold text-slate-900">455</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                      pedidos
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 px-3 py-2">
                    <span className="text-[11px] text-slate-600">Receita</span>
                    <span className="text-[11px] font-semibold text-emerald-700">Disponível</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-amber-50/70 px-3 py-2">
                    <span className="text-[11px] text-slate-600">Custos</span>
                    <span className="text-[11px] font-semibold text-amber-700">Pendentes</span>
                  </div>
                </div>
              </div>
            </Card>



            <Card className="h-fit rounded-3xl border-slate-200/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-28px_rgba(15,23,42,0.4)]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Filtros rápidos
              </p>
              <div className="space-y-1.5">
                {QUICK_FILTERS.map((filter) => (
                  <button
                    key={filter.label}
                    type="button"
                    className={`flex w-full items-center justify-between gap-2 rounded-full px-3 py-2 text-left text-sm transition-all ${
                      filter.active
                        ? "bg-gradient-to-r from-blue-600 to-violet-600 font-semibold text-white shadow-md shadow-blue-600/20"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <filter.icon className="h-3.5 w-3.5" />
                      {filter.label}
                    </span>
                    <span
                      className={`rounded-full px-1.5 text-[10px] font-semibold ${
                        filter.active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-4 rounded-xl bg-slate-50 p-2.5 text-[10px] leading-relaxed text-slate-400">
                Filtros ainda visuais nesta prévia. A filtragem real será ativada com os dados da
                operação.
              </p>
            </Card>
          </div>

          {/* Coluna central */}
          <div className="space-y-5">
            {/* Atalhos inteligentes */}
            <Card className="relative overflow-hidden rounded-3xl border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50/60 px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-28px_rgba(15,23,42,0.4)]">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Atalhos inteligentes
              </p>
              <div className="ac-no-scrollbar -mx-1 flex items-start gap-7 overflow-x-auto px-1 pb-1">
                {SHORTCUTS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className="group flex w-[68px] shrink-0 flex-col items-center gap-2"
                  >
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md ${s.bg} ${s.ring}`}
                    >
                      <s.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
                    </span>
                    <span className="flex h-[16px] items-center">
                      {typeof s.count === "number" && (
                        <span className="inline-flex h-[16px] min-w-[22px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-[9px] font-semibold leading-none text-slate-500">
                          {s.count}
                        </span>
                      )}
                    </span>
                    <span className="w-full text-center text-[10.5px] font-medium leading-tight tracking-tight text-slate-500 transition-colors group-hover:text-slate-800">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>

            </Card>


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
                  className={`overflow-hidden rounded-3xl border-slate-200/80 p-0 shadow-sm ring-1 ring-transparent transition-all hover:shadow-lg ${status.ring}`}
                >
                  {/* Cabeçalho do post */}
                  <div className="flex items-start justify-between gap-3 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm">
                        <Store className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {card.title}
                        </h3>
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                          {card.sku} · Mercado Livre - Nightled
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.badge}`}
                      >
                        <status.icon className="h-3 w-3" />
                        {status.label}
                      </span>
                      <button
                        type="button"
                        className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-500"
                        aria-label="Mais opções"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Área visual do produto */}
                  <div className="px-4">
                    <div
                      className={`relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ring-1 ring-slate-100 ${status.cover}`}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.7),transparent_62%)]" />
                      <span className="absolute left-3 top-3 inline-flex h-6 items-center rounded-full bg-white/85 px-2.5 text-[9px] font-semibold uppercase leading-none tracking-wide text-slate-500 shadow-sm backdrop-blur">
                        Prévia visual
                      </span>
                      <div className="relative flex flex-col items-center justify-center gap-2 text-center">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm backdrop-blur">
                          <ImageIcon
                            className={`h-6 w-6 shrink-0 object-contain ${status.coverIcon}`}
                          />
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          Imagem do anúncio em breve
                        </span>
                      </div>
                    </div>
                  </div>


                  {/* Métricas */}
                  <div className="grid grid-cols-5 gap-1.5 px-3 py-3">
                    <Metric label="Visitas" value={card.metrics.visits} />
                    <Metric label="Vendas" value={card.metrics.sales} />
                    <Metric label="Receita" value={card.metrics.revenue} />
                    <Metric label="Conversão" value={card.metrics.conversion} />
                    <Metric label="Estoque" value={card.metrics.stock} />
                  </div>

                  {/* Diagnóstico e ação */}
                  <div className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-3.5 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                        Diagnóstico
                      </p>
                      <p className="mt-1 text-xs leading-snug text-slate-700">{card.diagnosis}</p>
                    </div>
                    <div className={`rounded-2xl border px-3.5 py-2.5 ${status.action}`}>
                      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide">
                        <ArrowRight className="h-3 w-3" />
                        Ação recomendada
                      </p>
                      <p className="mt-1 text-xs leading-snug">{card.action}</p>
                    </div>
                  </div>


                  {/* Rodapé */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 rounded-full border-blue-200 bg-white text-xs text-blue-700 hover:bg-blue-50"
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        Ver diagnóstico
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled
                        className="gap-1.5 rounded-full text-xs text-slate-400"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Marcar para revisão em breve
                      </Button>

                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-600">
                      <Eye className="h-3 w-3" />
                      Prévia visual
                    </span>
                  </div>
                </Card>
              );
            })}

            <p className="text-center text-[11px] text-slate-400">
              Exemplos ilustrativos — os anúncios reais da conta aparecerão aqui na próxima etapa.
            </p>
          </div>

          {/* Coluna direita */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Card className="rounded-3xl border-slate-200/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-28px_rgba(15,23,42,0.4)] ring-1 ring-slate-100">
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

            <Card className="rounded-3xl border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 shadow-sm">
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

            <Card className="rounded-3xl border-slate-200/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-28px_rgba(15,23,42,0.4)]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Sugestões visuais
              </p>
              <div className="space-y-2">
                {SUGGESTIONS.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50/70"
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.tone}`}>
                      <s.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs text-slate-600">{s.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                Sugestões ilustrativas nesta prévia — nenhuma ação é executada.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </EcommerceLayout>
  );
}

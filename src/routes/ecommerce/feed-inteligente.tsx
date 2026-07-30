import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutGrid,
  Sparkles,
  Eye,
  Lock,
  ShieldCheck,
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
  Database,
  BrainCircuit,
  RefreshCw,
  Inbox,
  WifiOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getIntelligentFeedPreview,
  IntelligentFeedError,
  type FeedItem,
  type FeedStatusKey,
  type IntelligentFeedPreview,
} from "@/lib/intelligent-feed-preview";

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

const COMPANY_ID = "ac7d24b9-5227-46ac-9ced-b66473422a17";
const ACCOUNT_ID = "d2a28e18-e5d0-40e0-82cc-0bc0c0bcd8f4";
const FEED_LIMIT = 20;

const HEADER_BADGES = [
  { label: "Somente leitura", icon: Lock },
  { label: "Sem ações automáticas", icon: ShieldCheck },
  { label: "Dados reais conectados", icon: Database },
  { label: "IA externa não chamada", icon: BrainCircuit },
];

const SUGGESTIONS = [
  { label: "Revisar anúncios críticos", icon: AlertOctagon, tone: "text-rose-600 bg-rose-50" },
  { label: "Conferir estoque baixo", icon: Boxes, tone: "text-amber-600 bg-amber-50" },
  { label: "Validar produtos sem custo", icon: ListChecks, tone: "text-blue-600 bg-blue-50" },
  { label: "Separar oportunidades para Ads", icon: Target, tone: "text-violet-600 bg-violet-50" },
];

const STATUS_STYLES: Record<
  FeedStatusKey,
  {
    label: string;
    badge: string;
    ring: string;
    cover: string;
    coverIcon: string;
    action: string;
    icon: typeof TrendingUp;
    chip: string;
    shortcutRing: string;
    shortcutBg: string;
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
    chip: "bg-emerald-50 text-emerald-700",
    shortcutRing: "ring-emerald-200/80",
    shortcutBg: "from-emerald-100 to-white text-emerald-600",
  },
  attention: {
    label: "Atenção",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "hover:ring-amber-200/70",
    cover: "from-amber-100 via-orange-50 to-yellow-100",
    coverIcon: "text-amber-400/70",
    action: "border-amber-100 bg-amber-50/70 text-amber-800",
    icon: AlertTriangle,
    chip: "bg-amber-50 text-amber-700",
    shortcutRing: "ring-amber-200/80",
    shortcutBg: "from-amber-100 to-white text-amber-600",
  },
  critical: {
    label: "Crítico",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    ring: "hover:ring-rose-200/70",
    cover: "from-rose-100 via-pink-50 to-fuchsia-100",
    coverIcon: "text-rose-400/70",
    action: "border-rose-100 bg-rose-50/70 text-rose-800",
    icon: AlertOctagon,
    chip: "bg-rose-50 text-rose-700",
    shortcutRing: "ring-rose-200/80",
    shortcutBg: "from-rose-100 to-white text-rose-600",
  },
  missing_cost: {
    label: "Sem custo",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    ring: "hover:ring-violet-200/70",
    cover: "from-violet-100 via-purple-50 to-indigo-100",
    coverIcon: "text-violet-400/70",
    action: "border-violet-100 bg-violet-50/70 text-violet-800",
    icon: Lock,
    chip: "bg-violet-50 text-violet-700",
    shortcutRing: "ring-violet-200/80",
    shortcutBg: "from-violet-100 to-white text-violet-600",
  },
  neutral: {
    label: "Neutro",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    ring: "hover:ring-slate-200/70",
    cover: "from-slate-100 via-blue-50 to-slate-100",
    coverIcon: "text-slate-400/70",
    action: "border-blue-100 bg-blue-50/60 text-blue-800",
    icon: Gauge,
    chip: "bg-slate-100 text-slate-600",
    shortcutRing: "ring-slate-200/80",
    shortcutBg: "from-slate-100 to-white text-slate-600",
  },
};

const STATUS_ORDER: FeedStatusKey[] = [
  "critical",
  "attention",
  "missing_cost",
  "opportunity",
  "neutral",
];

const numberFormatter = new Intl.NumberFormat("pt-BR");
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatCount(value: number | null | undefined): string {
  return typeof value === "number" ? numberFormatter.format(value) : "—";
}

function formatCurrency(value: number | null | undefined): string {
  return typeof value === "number" ? currencyFormatter.format(value) : "—";
}

function formatPercent(value: number | null | undefined): string {
  if (typeof value !== "number") return "—";
  const percent = value <= 1 ? value * 100 : value;
  return `${percent.toFixed(1).replace(".", ",")}%`;
}

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

function FeedCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[28px] border-slate-200/70 p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-32px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-5">
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="px-6">
        <Skeleton className="aspect-[16/7] w-full rounded-2xl" />
      </div>
      <div className="px-6 pt-5">
        <Skeleton className="h-[74px] w-full rounded-2xl" />
      </div>
      <div className="grid gap-3 px-6 pb-6 pt-4 sm:grid-cols-2">
        <Skeleton className="h-[86px] rounded-2xl" />
        <Skeleton className="h-[86px] rounded-2xl" />
      </div>
    </Card>
  );
}

function FeedStateCard({
  icon: Icon,
  tone,
  title,
  description,
  onRetry,
}: {
  icon: typeof Inbox;
  tone: "neutral" | "warning" | "danger";
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-500",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-rose-50 text-rose-600",
  } as const;
  return (
    <Card className="rounded-[28px] border-slate-200/70 px-8 py-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-32px_rgba(15,23,42,0.45)]">
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tones[tone]}`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-slate-500">
        {description}
      </p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-5 h-8 gap-1.5 rounded-full border-blue-200 bg-white px-4 text-[12px] font-medium text-blue-700 hover:bg-blue-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Tentar novamente
        </Button>
      )}
    </Card>
  );
}

function FeedProductCover({ item, status }: { item: FeedItem; status: (typeof STATUS_STYLES)[FeedStatusKey] }) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(item.imageUrl) && !broken;

  return (
    <div
      className={`relative flex aspect-[16/7] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ring-1 ring-slate-200/70 ${status.cover}`}
    >
      {showImage ? (
        <img
          src={item.imageUrl as string}
          alt={item.title}
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_12%,rgba(255,255,255,0.75),transparent_62%)]" />
          <div className="relative flex flex-col items-center justify-center gap-2.5 text-center">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/85 shadow-sm ring-1 ring-white/70 backdrop-blur">
              <ImageIcon className={`h-6 w-6 shrink-0 ${status.coverIcon}`} strokeWidth={1.8} />
            </span>
            <span className="text-[10.5px] font-medium tracking-tight text-slate-500">
              Imagem ainda não sincronizada
            </span>
          </div>
        </>
      )}
      {item.imageSource && showImage && (
        <span className="absolute left-4 top-4 inline-flex h-6 items-center rounded-full bg-white/85 px-2.5 text-[9px] font-semibold uppercase leading-none tracking-wider text-slate-500 shadow-sm backdrop-blur">
          {item.imageSource}
        </span>
      )}
    </div>
  );
}

type PriorityTag = "Sem custo" | "Com vendas" | "Sem imagem" | "Ads" | "Atenção";

type PriorityEntry = { item: FeedItem; tag: PriorityTag; rank: number };

const PRIORITY_TAG_STYLES: Record<PriorityTag, string> = {
  "Sem custo": "bg-violet-50 text-violet-700 ring-violet-200/70",
  "Com vendas": "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  "Sem imagem": "bg-slate-100 text-slate-600 ring-slate-200/70",
  Ads: "bg-sky-50 text-sky-700 ring-sky-200/70",
  Atenção: "bg-amber-50 text-amber-700 ring-amber-200/70",
};


function classifyPriority(item: FeedItem): { tag: PriorityTag; rank: number } | null {
  const haystack = [item.statusLabel ?? "", ...item.badges].join(" ").toLowerCase();
  const sales = item.metrics.sales ?? 0;
  if (item.status === "missing_cost" || haystack.includes("custo")) {
    return { tag: "Sem custo", rank: 1 };
  }
  if (sales > 0) return { tag: "Com vendas", rank: 2 };
  if (!item.hasImage && !item.imageUrl) return { tag: "Sem imagem", rank: 3 };
  if (haystack.includes("ads") || haystack.includes("publicidade")) {
    return { tag: "Ads", rank: 4 };
  }
  if (item.status === "critical" || item.status === "attention") {
    return { tag: "Atenção", rank: 5 };
  }
  return null;
}

function PriorityMiniCard({ entry }: { entry: PriorityEntry }) {
  const { item, tag } = entry;
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(item.imageUrl) && !broken;
  const sales = item.metrics.sales;
  const revenue = item.metrics.revenue;
  const hasSales = typeof sales === "number" && sales > 0;
  const hasRevenue = typeof revenue === "number" && revenue > 0;
  const metricLabel = hasSales ? "Vendas" : hasRevenue ? "Receita" : "Status";
  const metricValue = hasSales
    ? formatCount(sales as number)
    : hasRevenue
      ? formatCurrency(revenue as number)
      : (item.statusLabel ?? STATUS_STYLES[item.status].label);

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof document === "undefined") return;
        document
          .getElementById(`feed-item-${item.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }}
      className="group flex w-[190px] min-w-[190px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_6px_18px_-12px_rgba(15,23,42,0.5)] sm:w-[210px] sm:min-w-[210px]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
        {showImage ? (
          <img
            src={item.imageUrl as string}
            alt={item.title}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-50">
            <ImageIcon className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.8} />
            <span className="text-[9.5px] font-medium tracking-tight text-slate-400">
              Sem imagem
            </span>
          </div>
        )}
        <span
          className={`absolute left-1.5 top-1.5 inline-flex h-[17px] items-center rounded-full px-1.5 text-[9px] font-semibold leading-none tracking-tight ring-1 ${PRIORITY_TAG_STYLES[tag]}`}
        >
          {tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-2.5 py-2">
        <p className="truncate text-[11.5px] font-semibold leading-snug tracking-tight text-slate-800">
          {item.title}
        </p>
        <span className="truncate text-[9.5px] font-medium leading-none text-slate-400">
          {item.sku ?? "SKU não informado"}
        </span>
        <div className="mt-auto flex items-baseline gap-1 pt-1">
          <span className="shrink-0 text-[9px] font-medium uppercase tracking-wider text-slate-400">
            {metricLabel}
          </span>
          <span className="truncate text-[11.5px] font-semibold tabular-nums text-slate-900">
            {metricValue}
          </span>
        </div>
      </div>
    </button>
  );
}

function PriorityStrip({ entries }: { entries: PriorityEntry[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, entries.length]);

  const scrollBy = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(220, el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (entries.length === 0) return null;

  return (
    <Card className="rounded-2xl border-slate-200 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-200/70">
            <Target className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-slate-800">
            Produtos que merecem atenção agora
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-[10.5px] font-medium text-slate-400 sm:inline">
            {entries.length} destaque(s)
          </span>
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              aria-label="Rolar para a esquerda"
              disabled={!canLeft}
              onClick={() => scrollBy(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              aria-label="Rolar para a direita"
              disabled={!canRight}
              onClick={() => scrollBy(1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        {canLeft && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" />
        )}
        {canRight && (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />
        )}
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory flex-nowrap gap-3 overflow-x-auto overflow-y-hidden scroll-smooth px-1 pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {entries.map((entry) => (
            <PriorityMiniCard key={entry.item.id} entry={entry} />
          ))}
        </div>
      </div>
    </Card>
  );
}



function FeedInteligente() {
  const [data, setData] = useState<IntelligentFeedPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorKind, setErrorKind] = useState<"auth" | "unavailable" | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setErrorKind(null);
    try {
      // SOMENTE LEITURA: apenas GET /intelligent-feed/preview.
      const preview = await getIntelligentFeedPreview({
        companyId: COMPANY_ID,
        accountId: ACCOUNT_ID,
        limit: FEED_LIMIT,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setData(preview);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setData(null);
      if (
        error instanceof IntelligentFeedError &&
        (error.kind === "unauthenticated" || error.kind === "forbidden")
      ) {
        setErrorKind("auth");
      } else {
        setErrorKind("unavailable");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  const items = data?.items ?? [];
  const summary = data?.summary;

  const filters = useMemo(() => {
    const base = [{ key: "all", label: "Itens no feed", count: items.length }];
    if (data?.filters.length) {
      const relabeled = data.filters.map((filter) =>
        filter.key === "all" || filter.label.trim().toLowerCase() === "todos"
          ? { ...filter, key: "analyzed", label: "Anúncios analisados" }
          : filter,
      );
      return [...base, ...relabeled];
    }
    return [
      ...base,
      ...STATUS_ORDER.map((status) => ({
        key: status,
        label: STATUS_STYLES[status].label,
        count: items.filter((i) => i.status === status).length,
      })),
    ];
  }, [data, items]);

  const visibleItems = useMemo(() => {
    if (activeFilter === "all" || activeFilter === "analyzed") return items;
    return items.filter((i) => i.status === activeFilter);
  }, [activeFilter, items]);

  const itemsWithImage = useMemo(
    () => summary?.itemsWithImage ?? items.filter((i) => i.hasImage).length,
    [items, summary],
  );

  // Faixa de prioridade: usa somente os feed_items já carregados pelo GET atual.
  const priorityEntries = useMemo<PriorityEntry[]>(() => {
    return items
      .map((item) => {
        const classified = classifyPriority(item);
        return classified ? { item, ...classified } : null;
      })
      .filter((e): e is PriorityEntry => e !== null)
      .sort((a, b) => a.rank - b.rank || (b.item.metrics.sales ?? 0) - (a.item.metrics.sales ?? 0))
      .slice(0, 10);
  }, [items]);

  const revenueTone = summary?.revenueAvailable ? "positive" : "pending";

  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Header da página */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-blue-50/70 via-white to-violet-50/60 px-8 py-9 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-24px_rgba(79,70,229,0.35)]">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-violet-400/20 via-blue-400/14 to-cyan-300/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-300/14 to-transparent blur-3xl" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
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
              <Button
                type="button"
                variant="outline"
                onClick={() => void load()}
                disabled={loading}
                className="h-9 gap-2 rounded-full border-slate-200 bg-white/80 px-4 text-[12.5px] font-medium text-slate-600 shadow-sm backdrop-blur hover:bg-white"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Atualizar feed
              </Button>
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
                  Conta ativa da operação
                </p>
                <p className="mt-1.5 text-[11px] font-medium text-slate-500/90">
                  Dados reais do backend AC360
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <div className="rounded-2xl bg-slate-50/80 px-3 py-3 text-center ring-1 ring-slate-100">
                    <p className="text-base font-semibold text-slate-900">
                      {loading ? "—" : formatCount(summary?.listingsChecked)}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                      anúncios
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50/80 px-3 py-3 text-center ring-1 ring-slate-100">
                    <p className="text-base font-semibold text-slate-900">
                      {loading ? "—" : formatCount(summary?.ordersChecked)}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                      pedidos
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 px-3 py-2">
                    <span className="text-[11px] text-slate-600">Receita</span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {summary?.revenueAvailable ? "Disponível" : "Indisponível"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-amber-50/70 px-3 py-2">
                    <span className="text-[11px] text-slate-600">Itens com imagem no feed</span>
                    <span className="text-[11px] font-semibold text-amber-700">
                      {loading ? "—" : formatCount(itemsWithImage)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="h-fit rounded-3xl border-slate-200/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-28px_rgba(15,23,42,0.4)]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Filtros rápidos
              </p>
              <div className="space-y-1.5">
                {filters.map((filter) => {
                  const active = filter.key === activeFilter;
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                      className={`flex w-full items-center justify-between gap-2 rounded-full px-3 py-2 text-left text-sm transition-all ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-violet-600 font-semibold text-white shadow-md shadow-blue-600/20"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700"
                      }`}
                    >
                      <span className="truncate">{filter.label}</span>
                      <span
                        className={`rounded-full px-1.5 text-[10px] font-semibold ${
                          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {filter.count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 rounded-xl bg-slate-50 p-2.5 text-[10px] leading-relaxed text-slate-400">
                Contadores calculados a partir dos dados reais retornados pelo backend.
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
                {filters.map((filter) => {
                  const style = STATUS_STYLES[filter.key as FeedStatusKey];
                  const Icon =
                    filter.key === "all" ? LayoutGrid : (style?.icon ?? Sparkles);
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                      className="group flex w-[68px] shrink-0 flex-col items-center gap-2"
                    >
                      <span
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md ${
                          style?.shortcutBg ?? "from-slate-100 to-white text-slate-600"
                        } ${style?.shortcutRing ?? "ring-slate-200/80"}`}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
                      </span>
                      <span className="flex h-[16px] items-center">
                        <span className="inline-flex h-[16px] min-w-[22px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-[9px] font-semibold leading-none text-slate-500">
                          {filter.count}
                        </span>
                      </span>
                      <span className="w-full text-center text-[10.5px] font-medium leading-tight tracking-tight text-slate-500 transition-colors group-hover:text-slate-800">
                        {filter.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {!loading && !errorKind && <PriorityStrip entries={priorityEntries} />}

            <div className="flex items-center justify-between">

              <h2 className="text-sm font-semibold text-slate-800">Feed de anúncios</h2>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Dados reais conectados
              </Badge>
            </div>

            {loading && (
              <>
                <FeedCardSkeleton />
                <FeedCardSkeleton />
                <FeedCardSkeleton />
              </>
            )}

            {!loading && errorKind === "auth" && (
              <FeedStateCard
                icon={Lock}
                tone="danger"
                title="Sessão expirada ou sem permissão. Faça login novamente."
                description="Entre novamente no AC360 para carregar o Feed Inteligente da operação."
              />
            )}

            {!loading && errorKind === "unavailable" && (
              <FeedStateCard
                icon={WifiOff}
                tone="warning"
                title="Não foi possível carregar o Feed Inteligente agora. Tente novamente em instantes."
                description="O backend do AC360 não respondeu a esta consulta de leitura."
                onRetry={() => void load()}
              />
            )}

            {!loading && !errorKind && visibleItems.length === 0 && (
              <FeedStateCard
                icon={Inbox}
                tone="neutral"
                title="Nenhum item encontrado para a operação ativa."
                description="Ajuste o filtro selecionado ou atualize o feed para consultar novamente."
                onRetry={() => void load()}
              />
            )}

            {!loading &&
              !errorKind &&
              visibleItems.map((item) => {
                const status = STATUS_STYLES[item.status];
                return (
                  <Card
                    key={item.id}
                    id={`feed-item-${item.id}`}

                    className={`overflow-hidden rounded-[28px] border-slate-200/70 p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-32px_rgba(15,23,42,0.45)] ring-1 ring-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_26px_56px_-34px_rgba(15,23,42,0.5)] ${status.ring}`}
                  >
                    {/* Cabeçalho do post */}
                    <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-5">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20">
                          <Store className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
                            {item.title}
                          </h3>
                          <div className="mt-1 flex min-w-0 items-center gap-2">
                            <span className="inline-flex h-[18px] shrink-0 items-center rounded-md bg-slate-100 px-1.5 text-[10px] font-semibold leading-none tracking-tight text-slate-500">
                              {item.sku ?? "SKU não informado"}
                            </span>
                            <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                            <span className="truncate text-[11px] font-medium text-slate-400">
                              Mercado Livre
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span
                          className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold leading-none ${status.badge}`}
                        >
                          <status.icon className="h-3 w-3 shrink-0" />
                          {item.statusLabel ?? status.label}
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
                    <div className="px-6">
                      <FeedProductCover item={item} status={status} />
                    </div>

                    {/* Métricas */}
                    <div className="px-6 pt-5">
                      <div className="grid grid-cols-5 divide-x divide-slate-100 overflow-hidden rounded-2xl bg-slate-50/70 ring-1 ring-slate-100">
                        <Metric label="Visitas" value={formatCount(item.metrics.visits)} />
                        <Metric label="Vendas" value={formatCount(item.metrics.sales)} />
                        <Metric label="Receita" value={formatCurrency(item.metrics.revenue)} />
                        <Metric
                          label="Conversão"
                          value={formatPercent(item.metrics.conversionRate)}
                        />
                        <Metric label="Estoque" value={formatCount(item.metrics.stock)} />
                      </div>
                    </div>

                    {/* Badges do item */}
                    {item.badges.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 px-6 pt-4">
                        {item.badges.map((badge) => (
                          <span
                            key={badge}
                            className={`inline-flex h-6 items-center rounded-full px-2.5 text-[10px] font-semibold leading-none ${status.chip}`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Diagnóstico e ação */}
                    <div className="grid gap-3 px-6 pb-5 pt-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-blue-100/80 bg-blue-50/50 px-4 py-3.5">
                        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                          <Gauge className="h-3 w-3 shrink-0" />
                          Diagnóstico
                        </p>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
                          {item.diagnostic ?? "Sem diagnóstico disponível para este anúncio."}
                        </p>
                      </div>
                      <div className={`rounded-2xl border px-4 py-3.5 ${status.action}`}>
                        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                          <ArrowRight className="h-3 w-3 shrink-0" />
                          Ação recomendada
                        </p>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed">
                          {item.recommendedAction ?? "Nenhuma ação recomendada no momento."}
                        </p>
                      </div>
                    </div>

                    {/* Rodapé */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 rounded-full border-blue-200 bg-white px-3.5 text-[12px] font-medium text-blue-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-blue-50"
                        >
                          <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                          Ver diagnóstico
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled
                          className="h-8 gap-1.5 rounded-full px-3 text-[12px] font-medium text-slate-400"
                        >
                          <Lock className="h-3.5 w-3.5 shrink-0" />
                          Marcar para revisão em breve
                        </Button>
                      </div>
                      <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-[10px] font-semibold uppercase leading-none tracking-wider text-slate-500">
                        <Eye className="h-3 w-3 shrink-0" />
                        Somente leitura
                      </span>
                    </div>
                  </Card>
                );
              })}

            {!loading && !errorKind && visibleItems.length > 0 && (
              <p className="text-center text-[11px] text-slate-400">
                Exibindo {visibleItems.length} de {items.length} itens retornados pelo backend
                (limite {FEED_LIMIT}).
              </p>
            )}
          </div>

          {/* Coluna direita */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Card className="rounded-3xl border-slate-200/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-28px_rgba(15,23,42,0.4)] ring-1 ring-slate-100">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Contexto da operação
              </p>
              <div className="divide-y divide-slate-100">
                <ContextRow
                  label="Anúncios analisados"
                  value={loading ? "—" : formatCount(summary?.listingsChecked)}
                />
                <ContextRow
                  label="Pedidos analisados"
                  value={loading ? "—" : formatCount(summary?.ordersChecked)}
                />
                <ContextRow
                  label="Produtos analisados"
                  value={loading ? "—" : formatCount(summary?.productsChecked)}
                />
                <ContextRow
                  label="Receita"
                  value={summary?.revenueAvailable ? "Disponível" : "Indisponível"}
                  tone={revenueTone}
                />
                <ContextRow
                  label="Itens no feed"
                  value={loading ? "—" : formatCount(summary?.feedItemsReturned ?? items.length)}
                />
                <ContextRow
                  label="Itens com imagem no feed"
                  value={loading ? "—" : formatCount(itemsWithImage)}
                />
                <ContextRow label="Modo" value={data?.mode ?? "Somente leitura"} />
              </div>
            </Card>

            <Card className="rounded-3xl border-slate-200/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-28px_rgba(15,23,42,0.4)]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Segurança do modo atual
              </p>
              <div className="divide-y divide-slate-100">
                <ContextRow
                  label="Escrita permitida"
                  value={data?.writeAllowed ? "Sim" : "Não"}
                  tone={data?.writeAllowed ? "pending" : "positive"}
                />
                <ContextRow
                  label="Escrita executada"
                  value={data?.writeExecuted ? "Sim" : "Não"}
                  tone={data?.writeExecuted ? "pending" : "positive"}
                />
                <ContextRow
                  label="Marketplace externo"
                  value={data?.externalMarketplaceCalled ? "Chamado" : "Não chamado"}
                  tone={data?.externalMarketplaceCalled ? "pending" : "positive"}
                />
                <ContextRow
                  label="IA externa"
                  value={data?.externalAiCalled ? "Chamada" : "Não chamada"}
                  tone={data?.externalAiCalled ? "pending" : "positive"}
                />
              </div>
            </Card>

            {(data?.warnings.length ?? 0) > 0 && (
              <Card className="rounded-3xl border-slate-200/70 bg-slate-50/70 p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  Avisos técnicos da operação
                </p>
                <ul className="mt-2 space-y-1.5">
                  {data?.warnings.map((warning) => (
                    <li key={warning} className="text-xs leading-relaxed text-slate-600">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card className="rounded-3xl border-slate-200/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-28px_rgba(15,23,42,0.4)]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {(data?.recommendations.length ?? 0) > 0
                  ? "Recomendações do backend"
                  : "Sugestões visuais"}
              </p>
              {(data?.recommendations.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  {data?.recommendations.map((rec) => (
                    <div
                      key={rec}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Target className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xs leading-relaxed text-slate-600">{rec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50/70"
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.tone}`}
                      >
                        <s.icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xs text-slate-600">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                Nenhuma ação é executada a partir desta tela.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </EcommerceLayout>
  );
}

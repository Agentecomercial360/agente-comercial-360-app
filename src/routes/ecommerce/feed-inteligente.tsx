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
  Image as ImageIcon,
  ArrowRight,
  Gauge,
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
  Search,
  ShoppingCart,
  Wallet,
  Package,
  ServerOff,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
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
/** Quantidade solicitada ao GET (o backend pode reduzir internamente). */
const FEED_FETCH_LIMIT = 60;
/** Quantidade exibida na tela para preservar performance. */
const FEED_DISPLAY_LIMIT = 20;

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
    badge: "bg-[#1E5EFF] text-white",
    ring: "hover:ring-[#1E5EFF]/25",
    cover: "from-blue-100 via-sky-50 to-white",
    coverIcon: "text-[#1E5EFF]",
    action: "border-blue-100 bg-blue-50/70 text-[#0A1F44]",
    icon: TrendingUp,
    chip: "bg-blue-50 text-[#1E5EFF]",
    shortcutRing: "ring-[#1E5EFF]/60",
    shortcutBg: "from-blue-50 to-white text-[#1E5EFF]",
  },
  attention: {
    label: "Atenção",
    badge: "bg-amber-500 text-white",
    ring: "hover:ring-amber-300/40",
    cover: "from-amber-100 via-orange-50 to-white",
    coverIcon: "text-amber-500",
    action: "border-amber-100 bg-amber-50/70 text-amber-900",
    icon: AlertTriangle,
    chip: "bg-amber-50 text-amber-700",
    shortcutRing: "ring-amber-400/70",
    shortcutBg: "from-amber-50 to-white text-amber-600",
  },
  critical: {
    label: "Crítico",
    badge: "bg-rose-600 text-white",
    ring: "hover:ring-rose-300/40",
    cover: "from-rose-100 via-rose-50 to-white",
    coverIcon: "text-rose-500",
    action: "border-rose-100 bg-rose-50/70 text-rose-900",
    icon: AlertOctagon,
    chip: "bg-rose-50 text-rose-700",
    shortcutRing: "ring-rose-500/70",
    shortcutBg: "from-rose-50 to-white text-rose-600",
  },
  missing_cost: {
    label: "Sem custo",
    badge: "bg-violet-600 text-white",
    ring: "hover:ring-violet-300/40",
    cover: "from-violet-100 via-indigo-50 to-white",
    coverIcon: "text-violet-500",
    action: "border-violet-100 bg-violet-50/70 text-violet-900",
    icon: Lock,
    chip: "bg-violet-50 text-violet-700",
    shortcutRing: "ring-violet-500/70",
    shortcutBg: "from-violet-50 to-white text-violet-600",
  },
  neutral: {
    label: "Neutro",
    badge: "bg-slate-700 text-white",
    ring: "hover:ring-slate-300/40",
    cover: "from-slate-100 via-blue-50 to-white",
    coverIcon: "text-slate-400",
    action: "border-blue-100 bg-blue-50/60 text-[#0A1F44]",
    icon: Gauge,
    chip: "bg-slate-100 text-slate-600",
    shortcutRing: "ring-slate-300",
    shortcutBg: "from-slate-50 to-white text-slate-600",
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

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  hint?: string;
  accent: string;
}) {
  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_1px_2px_rgba(10,31,68,0.04),0_18px_40px_-32px_rgba(10,31,68,0.45)]">
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${accent}`}>
          <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
        </span>
      </div>
      <p className="font-display mt-4 text-[28px] font-semibold leading-none tracking-tight text-[#0A1F44] tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.9} />
      <span className="font-display text-[13px] font-semibold leading-none text-[#0A1F44] tabular-nums">
        {value}
      </span>
      <span className="text-[11px] leading-none text-slate-400">{label}</span>
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
    info: "bg-blue-50 text-[#1E5EFF]",
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

function SecurityRow({
  icon: Icon,
  label,
  value,
  safe,
}: {
  icon: typeof Lock;
  label: string;
  value: string;
  safe: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2.5 ring-1 ring-emerald-100/80">
      <span className="flex min-w-0 items-center gap-2">
        <Icon
          className={`h-3.5 w-3.5 shrink-0 ${safe ? "text-emerald-600" : "text-amber-600"}`}
          strokeWidth={2}
        />
        <span className="truncate text-[11.5px] font-medium text-slate-600">{label}</span>
      </span>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold leading-none ${
          safe ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function FeedCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[24px] border-0 p-0 shadow-[0_1px_2px_rgba(10,31,68,0.04),0_18px_40px_-32px_rgba(10,31,68,0.45)]">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-14 w-full rounded-2xl" />
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
    <Card className="rounded-[24px] border-0 px-8 py-12 text-center shadow-[0_1px_2px_rgba(10,31,68,0.04),0_18px_40px_-32px_rgba(10,31,68,0.45)]">
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${tones[tone]}`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <p className="mt-4 text-sm font-semibold text-[#0A1F44]">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-slate-500">
        {description}
      </p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-5 h-8 gap-1.5 rounded-full border-blue-200 bg-white px-4 text-[12px] font-medium text-[#1E5EFF] hover:bg-blue-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Tentar novamente
        </Button>
      )}
    </Card>
  );
}

function FeedProductCover({
  item,
  status,
}: {
  item: FeedItem;
  status: (typeof STATUS_STYLES)[FeedStatusKey];
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(item.imageUrl) && !broken;

  return (
    <div
      className={`relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden ${
        showImage ? `bg-gradient-to-br ${status.cover}` : "bg-[#EAF0FF]"
      }`}
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_12%,rgba(255,255,255,0.85),transparent_62%)]" />
          <div className="relative flex flex-col items-center justify-center gap-2.5 text-center">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF0FF] shadow-sm ring-1 ring-[#1E5EFF]/15 backdrop-blur">
              <ImageIcon className="h-6 w-6 shrink-0 text-[#1E5EFF]" strokeWidth={1.8} />
            </span>
            <span className="text-[10.5px] font-medium tracking-tight text-slate-500">
              Imagem ainda não sincronizada
            </span>
          </div>
        </>
      )}
      <span
        className={`absolute left-4 top-4 inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold leading-none shadow-sm ${status.badge}`}
      >
        <status.icon className="h-3 w-3 shrink-0" />
        {item.statusLabel ?? status.label}
      </span>
    </div>
  );
}

type PriorityTag = "Sem custo" | "Com vendas" | "Sem imagem" | "Ads" | "Atenção";

type PriorityEntry = { item: FeedItem; tag: PriorityTag; rank: number };

const PRIORITY_RING: Record<PriorityTag, string> = {
  "Sem custo": "ring-amber-400",
  "Com vendas": "ring-emerald-500",
  "Sem imagem": "ring-slate-300",
  Ads: "ring-[#1E5EFF]",
  Atenção: "ring-rose-500",
};

const PRIORITY_DOT: Record<PriorityTag, string> = {
  "Sem custo": "bg-amber-400",
  "Com vendas": "bg-emerald-500",
  "Sem imagem": "bg-slate-300",
  Ads: "bg-[#1E5EFF]",
  Atenção: "bg-rose-500",
};

/** Cor do anel/ponto segue a categoria real do item (mesma fonte dos badges). */
const STATUS_RING: Record<FeedStatusKey, string> = {
  critical: "ring-rose-500",
  attention: "ring-rose-400",
  missing_cost: "ring-amber-400",
  opportunity: "ring-[#1E5EFF]",
  neutral: "ring-emerald-500",
};

const STATUS_DOT: Record<FeedStatusKey, string> = {
  critical: "bg-rose-500",
  attention: "bg-rose-400",
  missing_cost: "bg-amber-400",
  opportunity: "bg-[#1E5EFF]",
  neutral: "bg-emerald-500",
};

/** Categoria real do item (mesma fonte usada nos badges) define a cor do anel. */
function storyRing(item: FeedItem, tag: PriorityTag): string {
  if (item.status !== "neutral") return STATUS_RING[item.status];
  if (tag === "Sem custo") return PRIORITY_RING["Sem custo"];
  if (tag === "Com vendas") return PRIORITY_RING["Com vendas"];
  if (tag === "Ads") return PRIORITY_RING.Ads;
  return "ring-emerald-500";
}

function storyDot(item: FeedItem, tag: PriorityTag): string {
  if (item.status !== "neutral") return STATUS_DOT[item.status];
  if (tag === "Sem custo") return PRIORITY_DOT["Sem custo"];
  if (tag === "Com vendas") return PRIORITY_DOT["Com vendas"];
  if (tag === "Ads") return PRIORITY_DOT.Ads;
  return "bg-emerald-500";
}

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

/**
 * Prioridade de negócio (camada 1, nunca sobreposta pela imagem):
 * crítico > sem custo > oportunidade > vendas/saudável.
 */
function businessRank(item: FeedItem): number {
  const haystack = [item.statusLabel ?? "", ...item.badges].join(" ").toLowerCase();
  if (item.status === "critical") return 0;
  if (item.status === "missing_cost" || haystack.includes("sem custo")) return 1;
  if (item.status === "attention") return 2;
  if (item.status === "opportunity") return 3;
  return 4;
}

function hasRealImage(item: FeedItem): boolean {
  return Boolean(item.imageUrl) || item.hasImage;
}

function cleanKey(value: string | null | undefined): string | null {
  const clean = value?.trim().toLowerCase().replace(/\s+/g, " ");
  return clean ? clean : null;
}

function normalizeSkuKey(sku: string | null): string | null {
  return cleanKey(sku)?.replace(/[^a-z0-9]/g, "") ?? null;
}

function normalizeImageKey(imageUrl: string | null): string | null {
  const clean = imageUrl?.trim();
  if (!clean) return null;
  try {
    const url = new URL(clean);
    return `${url.hostname}${url.pathname}`.toLowerCase();
  } catch {
    return clean.toLowerCase();
  }
}

function normalizeTitleKey(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isGeneratedFallbackId(value: string): boolean {
  return /^feed-item-\d+$/i.test(value.trim());
}

function isMarketplaceListingId(value: string): boolean {
  return /^MLB\d+$/i.test(value.trim());
}

function dedupeIdentityKey(item: FeedItem): string | null {
  const candidates = [item.listingId, isMarketplaceListingId(item.id) ? item.id : null]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  const identity = candidates.find((value) => !isGeneratedFallbackId(value));
  return identity ? `listing:${identity.toLowerCase()}` : null;
}

function visualDuplicateKey(item: FeedItem): string | null {
  const sku = normalizeSkuKey(item.sku);
  const image = normalizeImageKey(item.imageUrl);
  if (!sku || !image) return null;
  return `visual:${sku}|${image}`;
}

function titleCompleteness(item: FeedItem): number {
  return item.title.replace(/\s+/g, " ").trim().length;
}

function itemCompletenessScore(item: FeedItem): number {
  return (
    titleCompleteness(item) * 100 +
    Number(hasRealImage(item)) * 20 +
    Number(Boolean(item.diagnostic)) * 5 +
    Number(Boolean(item.recommendedAction)) * 5 +
    dedupeBadges(item.badges).length
  );
}

function selectBestDuplicate(current: FeedItem, next: FeedItem): FeedItem {
  const scoreDelta = itemCompletenessScore(next) - itemCompletenessScore(current);
  if (scoreDelta > 0) return next;
  if (scoreDelta < 0) return current;
  return (next.metrics.revenue ?? 0) > (current.metrics.revenue ?? 0) ? next : current;
}

function stableItemKey(item: FeedItem): string {
  return (
    dedupeIdentityKey(item) ??
    visualDuplicateKey(item) ??
    `item:${normalizeSkuKey(item.sku) ?? "sem-sku"}|${normalizeTitleKey(item.title)}|${
      normalizeImageKey(item.imageUrl) ?? "sem-imagem"
    }`
  );
}

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function elementIdForItem(item: FeedItem): string {
  return `feed-item-${hashString(stableItemKey(item))}`;
}

function dedupeFeedItems(rawItems: FeedItem[]): FeedItem[] {
  const byIdentity = new Map<string, FeedItem>();
  const withoutIdentity: FeedItem[] = [];

  for (const item of rawItems) {
    const key = dedupeIdentityKey(item);
    if (!key) {
      withoutIdentity.push(item);
      continue;
    }
    const current = byIdentity.get(key);
    byIdentity.set(key, current ? selectBestDuplicate(current, item) : item);
  }

  const byVisual = new Map<string, FeedItem>();
  const uniqueWithoutIdentity: FeedItem[] = [];
  for (const item of withoutIdentity) {
    const key = visualDuplicateKey(item);
    if (!key) {
      uniqueWithoutIdentity.push(item);
      continue;
    }
    const current = byVisual.get(key);
    byVisual.set(key, current ? selectBestDuplicate(current, item) : item);
  }

  return [...byIdentity.values(), ...byVisual.values(), ...uniqueWithoutIdentity];
}

function duplicateLabelByItemKey(items: FeedItem[]): Map<string, string> {
  const bySku = new Map<string, FeedItem[]>();
  for (const item of items) {
    const sku = normalizeSkuKey(item.sku);
    if (!sku) continue;
    bySku.set(sku, [...(bySku.get(sku) ?? []), item]);
  }

  const labels = new Map<string, string>();
  for (const group of bySku.values()) {
    if (group.length < 2) continue;
    group.forEach((item, index) => {
      labels.set(stableItemKey(item), `Anúncio ${String.fromCharCode(65 + index)}`);
    });
  }
  return labels;
}

/** Camada 1: prioridade de negócio. Camada 2 (desempate): imagem real, depois receita. */
function compareFeedItems(a: FeedItem, b: FeedItem): number {
  const rank = businessRank(a) - businessRank(b);
  if (rank !== 0) return rank;
  const image = Number(hasRealImage(b)) - Number(hasRealImage(a));
  if (image !== 0) return image;
  return (b.metrics.revenue ?? 0) - (a.metrics.revenue ?? 0);
}

function dedupeBadges(badges: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const badge of badges) {
    const label = badge.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

/** Traduz avisos técnicos do backend para linguagem de negócio. */
function humanizeWarning(warning: string): string | null {
  const raw = warning.toLowerCase();
  if (raw.includes("ecommerce_inventory")) {
    return "Alguns dados de estoque ainda não estão disponíveis para esta conta.";
  }
  if (raw.includes("ecommerce_products")) {
    return "Alguns dados de produtos ainda não estão vinculados a esta conta.";
  }
  if (raw.includes("account_id") || raw.includes("company_id") || /[a-z_]+\.[a-z_]+|_id\b/.test(raw)) {
    return "Parte das informações desta conta ainda está sendo consolidada.";
  }
  return warning;
}

function humanizeWarnings(warnings: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const w of warnings) {
    const label = humanizeWarning(w);
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

function shortTitle(title: string): string {
  const clean = title.trim();
  if (clean.length <= 18) return clean;
  return `${clean.slice(0, 17).trimEnd()}…`;
}

function PriorityStory({ entry }: { entry: PriorityEntry }) {
  const { item, tag } = entry;
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(item.imageUrl) && !broken;
  const sales = item.metrics.sales;
  const revenue = item.metrics.revenue;
  const hasSales = typeof sales === "number" && sales > 0;
  const hasRevenue = typeof revenue === "number" && revenue > 0;
  const metric = hasSales
    ? `${formatCount(sales as number)} vendas`
    : hasRevenue
      ? formatCurrency(revenue as number)
      : (item.statusLabel ?? STATUS_STYLES[item.status].label);

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof document === "undefined") return;
        document
          .getElementById(elementIdForItem(item))
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }}
      className="group flex w-[92px] min-w-[92px] flex-shrink-0 snap-start flex-col items-center gap-2 text-center"
      title={item.title}
    >
      <span
        className={`flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white p-[3px] ring-2 ring-offset-2 ring-offset-white transition-transform duration-200 group-hover:-translate-y-0.5 ${storyRing(item, tag)}`}
      >
        <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#EAF0FF]">
          {showImage ? (
            <img
              src={item.imageUrl as string}
              alt={item.title}
              loading="lazy"
              onError={() => setBroken(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5 shrink-0 text-[#1E5EFF]/70" strokeWidth={1.8} />
          )}
        </span>
      </span>
      <span className="flex items-center gap-1">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${storyDot(item, tag)}`} />
        <span className="text-[10.5px] font-semibold leading-none tracking-tight text-[#0A1F44]">
          {shortTitle(item.title)}
        </span>
      </span>
      <span className="text-[10px] leading-none text-slate-400">{metric}</span>
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
    <Card className="rounded-[24px] border-0 p-5 shadow-[0_1px_2px_rgba(10,31,68,0.04),0_18px_40px_-34px_rgba(10,31,68,0.45)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
            <Target className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          </span>
          <h2 className="font-display text-sm font-semibold tracking-tight text-[#0A1F44]">
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
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              aria-label="Rolar para a direita"
              disabled={!canRight}
              onClick={() => scrollBy(1)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-35"
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
          className="flex snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto overflow-y-hidden scroll-smooth px-1 pb-1 pt-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {entries.map((entry) => (
            <PriorityStory key={stableItemKey(entry.item)} entry={entry} />
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
  const [search, setSearch] = useState("");
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
        limit: FEED_FETCH_LIMIT,
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

  const rawItems = useMemo(() => data?.items ?? [], [data]);
  // Deduplicação real por anúncio: remove IDs repetidos e, quando não há ID confiável,
  // evita exibir o mesmo SKU com a mesma imagem como cards duplicados.
  const uniqueItems = useMemo(() => dedupeFeedItems(rawItems), [rawItems]);
  // Ordenação local: prioridade de negócio primeiro, imagem real como desempate.
  const items = useMemo(() => [...uniqueItems].sort(compareFeedItems), [uniqueItems]);
  // Anúncios reais do mesmo SKU recebem chip curto e consistente, sem IDs técnicos.
  const duplicateLabels = useMemo(() => duplicateLabelByItemKey(items), [items]);
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

  const filteredByStatus = useMemo(() => {
    if (activeFilter === "all" || activeFilter === "analyzed") return items;
    return items.filter((i) => i.status === activeFilter);
  }, [activeFilter, items]);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = !term
      ? filteredByStatus
      : filteredByStatus.filter((i) =>
          [i.title, i.sku ?? "", i.statusLabel ?? ""].join(" ").toLowerCase().includes(term),
        );
    return matched.slice(0, FEED_DISPLAY_LIMIT);
  }, [filteredByStatus, search]);

  // Reflete apenas os itens realmente exibidos na tela após a ordenação local.
  const itemsWithImage = useMemo(
    () => visibleItems.filter(hasRealImage).length,
    [visibleItems],
  );

  // Faixa de prioridade: usa somente os feed_items já carregados pelo GET atual.
  const priorityEntries = useMemo<PriorityEntry[]>(() => {
    return items
      .map((item) => {
        const classified = classifyPriority(item);
        return classified ? { item, ...classified } : null;
      })
      .filter((e): e is PriorityEntry => e !== null)
      .sort(
        (a, b) =>
          businessRank(a.item) - businessRank(b.item) ||
          Number(hasRealImage(b.item)) - Number(hasRealImage(a.item)) ||
          (b.item.metrics.revenue ?? 0) - (a.item.metrics.revenue ?? 0) ||
          a.rank - b.rank,
      )
      .slice(0, 10);
  }, [items]);


  const revenueTone = summary?.revenueAvailable ? "positive" : "pending";

  return (
    <EcommerceLayout>
      <div className="-m-4 bg-white p-4 sm:-m-6 sm:p-6">
        <div className="space-y-6">
          {/* Cabeçalho */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#1E5EFF] to-[#0A1F44] text-white shadow-[0_10px_24px_-12px_rgba(30,94,255,0.8)]">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-[#0A1F44]">
                    Feed Inteligente da Operação
                  </h1>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    A vitrine visual da operação com diagnóstico por anúncio.
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-wrap items-center justify-end gap-2.5">
                <div className="relative min-w-[200px] flex-1 sm:max-w-[280px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar anúncio ou SKU"
                    aria-label="Buscar anúncio ou SKU"
                    className="h-11 w-full rounded-full bg-slate-100/80 pl-11 pr-4 text-[13px] text-[#0A1F44] outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1E5EFF]/40"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => void load()}
                  disabled={loading}
                  className="h-11 shrink-0 gap-2 rounded-full bg-gradient-to-r from-[#1E5EFF] to-[#0A1F44] px-6 text-[13px] font-semibold text-white shadow-[0_12px_28px_-14px_rgba(30,94,255,0.9)] transition hover:opacity-95"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Atualizar feed
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {HEADER_BADGES.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-slate-100/80 px-3.5 text-[11px] font-medium leading-none text-slate-600"
                >
                  <badge.icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          {/* KPIs executivos */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={LayoutGrid}
              label="Anúncios analisados"
              value={loading ? "—" : formatCount(summary?.listingsChecked)}
              accent="bg-blue-50 text-[#1E5EFF]"
            />
            <KpiCard
              icon={ShoppingCart}
              label="Pedidos analisados"
              value={loading ? "—" : formatCount(summary?.ordersChecked)}
              accent="bg-violet-50 text-violet-600"
            />
            <KpiCard
              icon={Package}
              label="Produtos analisados"
              value={loading ? "—" : formatCount(summary?.productsChecked)}
              accent="bg-amber-50 text-amber-600"
            />
            <KpiCard
              icon={Wallet}
              label="Receita"
              value={summary?.revenueAvailable ? "Disponível" : "Indisponível"}
              hint="Status da apuração de receita"
              accent="bg-emerald-50 text-emerald-600"
            />
          </div>

          {/* Filtros em pills */}
          <div className="ac-no-scrollbar -mx-1 flex flex-nowrap items-center gap-2 overflow-x-auto px-1 pb-1">
            {filters.map((filter) => {
              const active = filter.key === activeFilter;
              const style = STATUS_STYLES[filter.key as FeedStatusKey];
              const Icon = filter.key === "all" ? LayoutGrid : (style?.icon ?? Sparkles);
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[12.5px] font-medium transition ${
                    active
                      ? "bg-[#1E5EFF] text-white shadow-[0_10px_24px_-14px_rgba(30,94,255,0.9)]"
                      : "bg-slate-100/80 text-[#0A1F44] hover:bg-slate-200/70"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  <span className="whitespace-nowrap">{filter.label}</span>
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-semibold leading-[16px] ${
                      active ? "bg-white/25 text-white" : "bg-white text-slate-500"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Coluna principal */}
            <div className="space-y-5">
              {!loading && !errorKind && <PriorityStrip entries={priorityEntries} />}

              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold tracking-tight text-[#0A1F44]">
                  Feed de anúncios
                </h2>
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-emerald-50 px-3 text-[11px] font-semibold text-emerald-700">
                  <Database className="h-3 w-3 shrink-0" />
                  Dados reais conectados
                </span>
              </div>

              {loading && (
                <div className="grid gap-5 xl:grid-cols-2">
                  <FeedCardSkeleton />
                  <FeedCardSkeleton />
                  <FeedCardSkeleton />
                  <FeedCardSkeleton />
                </div>
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
                  description="Ajuste o filtro ou a busca, ou atualize o feed para consultar novamente."
                  onRetry={() => void load()}
                />
              )}

              {!loading && !errorKind && visibleItems.length > 0 && (
                <div className="grid gap-5 xl:grid-cols-2">
                  {visibleItems.map((item) => {
                    const status = STATUS_STYLES[item.status];
                    const duplicateLabel = duplicateLabels.get(stableItemKey(item));
                    return (
                      <Card
                        key={stableItemKey(item)}
                        id={elementIdForItem(item)}
                        className={`flex flex-col overflow-hidden rounded-[24px] border-0 p-0 shadow-[0_1px_2px_rgba(10,31,68,0.04),0_20px_44px_-34px_rgba(10,31,68,0.5)] ring-2 ring-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(10,31,68,0.04),0_28px_58px_-34px_rgba(10,31,68,0.55)] ${status.ring}`}
                      >
                        <FeedProductCover item={item} status={status} />

                        {/* Autor */}
                        <div className="flex items-center gap-3 px-5 pt-4">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E5EFF] to-[#0A1F44] text-white">
                            <Store className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold leading-tight text-[#0A1F44]">
                              {item.sku ?? "SKU não informado"}
                            </p>
                            <p className="flex items-center gap-1.5 text-[11px] leading-tight text-slate-400">
                              <span>Mercado Livre</span>
                              {duplicateLabel && (
                                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                  {duplicateLabel}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>


                        <h3 className="font-display mt-3 px-5 text-[15px] font-semibold leading-snug tracking-tight text-[#0A1F44]">
                          {item.title}
                        </h3>

                        {/* Métricas em linha */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-5">
                          <Metric
                            icon={ShoppingCart}
                            label="vendas"
                            value={formatCount(item.metrics.sales)}
                          />
                          <Metric
                            icon={Wallet}
                            label="receita"
                            value={formatCurrency(item.metrics.revenue)}
                          />
                          <Metric
                            icon={TrendingUp}
                            label="conversão"
                            value={formatPercent(item.metrics.conversionRate)}
                          />
                          <Metric
                            icon={Eye}
                            label="visitas"
                            value={formatCount(item.metrics.visits)}
                          />
                          <Metric
                            icon={Boxes}
                            label="estoque"
                            value={formatCount(item.metrics.stock)}
                          />
                        </div>

                        {dedupeBadges(item.badges).length > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-1.5 px-5">
                            {dedupeBadges(item.badges).map((badge) => (
                              <span
                                key={badge}
                                className={`inline-flex h-6 items-center rounded-full px-2.5 text-[10px] font-semibold leading-none ${status.chip}`}
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Diagnóstico + ação */}
                        <div className="mt-4 space-y-2.5 px-5">
                          <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              <Gauge className="h-3 w-3 shrink-0" />O que aconteceu
                            </p>
                            <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
                              {item.diagnostic ?? "Sem diagnóstico disponível para este anúncio."}
                            </p>
                          </div>
                          <div className={`rounded-[18px] border px-4 py-3 ${status.action}`}>
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                              <ArrowRight className="h-3 w-3 shrink-0" />O que fazer
                            </p>
                            <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed">
                              {item.recommendedAction ?? "Nenhuma ação recomendada no momento."}
                            </p>
                          </div>
                        </div>

                        {/* Rodapé */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 gap-1.5 rounded-full bg-[#E4ECFF] px-3.5 text-[12px] font-semibold text-[#0A2E9E] hover:bg-[#CFDEFF] hover:text-[#08246F]"
                          >
                            <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                            Ver diagnóstico
                          </Button>
                          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-[10px] font-semibold uppercase leading-none tracking-wider text-slate-800">
                            <Eye className="h-3 w-3 shrink-0 text-slate-800" />
                            Somente leitura
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {!loading && !errorKind && visibleItems.length > 0 && (
                <p className="text-center text-[11px] text-slate-400">
                  Exibindo {visibleItems.length} de {items.length} itens retornados pelo backend
                  (leitura de até {FEED_FETCH_LIMIT}).
                </p>
              )}
            </div>

            {/* Coluna de contexto */}
            <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              {/* Segurança em destaque */}
              <Card className="rounded-[24px] border-0 bg-emerald-50/60 p-5 shadow-[0_1px_2px_rgba(10,31,68,0.04),0_18px_40px_-34px_rgba(10,31,68,0.45)]">
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Segurança do modo atual
                </p>
                <div className="space-y-2">
                  <SecurityRow
                    icon={Lock}
                    label="Escrita permitida"
                    value={data?.writeAllowed ? "Sim" : "Não"}
                    safe={!data?.writeAllowed}
                  />
                  <SecurityRow
                    icon={Lock}
                    label="Escrita executada"
                    value={data?.writeExecuted ? "Sim" : "Não"}
                    safe={!data?.writeExecuted}
                  />
                  <SecurityRow
                    icon={ServerOff}
                    label="Marketplace externo"
                    value={data?.externalMarketplaceCalled ? "Chamado" : "Não chamado"}
                    safe={!data?.externalMarketplaceCalled}
                  />
                  <SecurityRow
                    icon={BrainCircuit}
                    label="IA externa"
                    value={data?.externalAiCalled ? "Chamada" : "Não chamada"}
                    safe={!data?.externalAiCalled}
                  />
                </div>
              </Card>

              <Card className="rounded-[24px] border-0 p-5 shadow-[0_1px_2px_rgba(10,31,68,0.04),0_18px_40px_-34px_rgba(10,31,68,0.45)]">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Contexto da operação
                </p>
                <div className="divide-y divide-slate-100">
                  <ContextRow
                    label="Itens no feed"
                    value={loading ? "—" : formatCount(visibleItems.length)}
                  />
                  <ContextRow
                    label="Itens com imagem no feed"
                    value={loading ? "—" : formatCount(itemsWithImage)}
                  />
                  <ContextRow
                    label="Receita"
                    value={summary?.revenueAvailable ? "Disponível" : "Indisponível"}
                    tone={revenueTone}
                  />
                  <ContextRow label="Modo" value={data?.mode ?? "Somente leitura"} />
                </div>
              </Card>

              {humanizeWarnings(data?.warnings ?? []).length > 0 && (
                <Card className="rounded-[24px] border-0 bg-slate-50 p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    Observações sobre os dados
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {humanizeWarnings(data?.warnings ?? []).map((warning) => (
                      <li key={warning} className="text-xs leading-relaxed text-slate-600">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card className="rounded-[24px] border-0 p-5 shadow-[0_1px_2px_rgba(10,31,68,0.04),0_18px_40px_-34px_rgba(10,31,68,0.45)]">
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
                        className="flex items-start gap-2.5 rounded-[18px] bg-slate-50 px-3 py-2.5"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1E5EFF]">
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
                        className="flex items-center gap-2.5 rounded-[18px] bg-slate-50 px-3 py-2.5 transition-colors hover:bg-slate-100"
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
      </div>
    </EcommerceLayout>
  );
}

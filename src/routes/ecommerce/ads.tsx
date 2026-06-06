import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Zap,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/ads")({
  component: AdsInteligente,
  head: () => ({
    meta: [{ title: "Ads Inteligente | Agente Comercial 360" }],
  }),
});

type AdRow = {
  marketplace?: string | null;
  account_name?: string | null;
  sku?: string | null;
  product_name?: string | null;
  campaign_name?: string | null;
  ad_type?: string | null;
  impressions?: number | null;
  clicks?: number | null;
  investment?: number | null;
  ads_revenue?: number | null;
  total_revenue?: number | null;
  roas?: number | null;
  acos?: number | null;
  tacos?: number | null;
  ctr?: number | null;
  cpc?: number | null;
  ads_status?: string | null;
  recommended_action?: string | null;
  priority_level?: string | null;
  ai_action_suggestion?: string | null;
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Crítica",
  high: "Alta",
  opportunity: "Oportunidade",
  normal: "Normal",
};

const ACTION_LABEL: Record<string, string> = {
  pause: "Pausar",
  reduce_budget: "Reduzir orçamento",
  scale: "Escalar",
  review_ad: "Revisar anúncio",
  keep_monitoring: "Manter monitoramento",
};

function translateAction(value?: string | null): string | null {
  if (!value) return null;
  return ACTION_LABEL[value.toLowerCase()] ?? value;
}

const fmtBRL = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number(v ?? 0));
const fmtBRLValue = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v ?? 0));
const fmtInt = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(v ?? 0));
const fmtNum = (v: number | null | undefined, d = 2) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(v ?? 0));
const fmtPct = (v: number | null | undefined, d = 1) => {
  if (v === null || v === undefined) return "0%";
  const num = Number(v);
  const pct = Math.abs(num) <= 1 ? num * 100 : num;
  return `${fmtNum(pct, d)}%`;
};
const fmtCompact = (v: number) => {
  if (v >= 1_000_000) return `${fmtNum(v / 1_000_000, 1)}M`;
  if (v >= 1_000) return `${fmtNum(v / 1_000, 1)}k`;
  return fmtInt(v);
};
const pad2 = (n: number) => n.toString().padStart(2, "0");

function AdsInteligente() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AdRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: ctx, error: ctxErr } = await supabase
          .from("vw_user_access_context")
          .select("company_id, has_ecommerce_access")
          .maybeSingle();

        if (ctxErr) throw ctxErr;
        if (!ctx) {
          navigate({ to: "/ecommerce/login" });
          return;
        }
        if (!ctx.has_ecommerce_access) {
          await supabase.auth.signOut();
          navigate({ to: "/ecommerce/login" });
          return;
        }

        const { data, error: aErr } = await supabase
          .from("vw_ecommerce_ads_performance")
          .select("*")
          .eq("company_id", ctx.company_id);

        if (aErr) throw aErr;
        if (cancelled) return;
        setRows((data as AdRow[]) ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Erro ao carregar campanhas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const totals = useMemo(() => {
    const t = { investment: 0, ads_revenue: 0, total_revenue: 0, clicks: 0, impressions: 0 };
    for (const r of rows) {
      t.investment += Number(r.investment ?? 0);
      t.ads_revenue += Number(r.ads_revenue ?? 0);
      t.total_revenue += Number(r.total_revenue ?? 0);
      t.clicks += Number(r.clicks ?? 0);
      t.impressions += Number(r.impressions ?? 0);
    }
    const roas = t.investment > 0 ? t.ads_revenue / t.investment : 0;
    const acos = t.ads_revenue > 0 ? (t.investment / t.ads_revenue) * 100 : 0;
    const tacos = t.total_revenue > 0 ? (t.investment / t.total_revenue) * 100 : 0;
    return { ...t, roas, acos, tacos };
  }, [rows]);

  const buckets = useMemo(() => {
    const critical: AdRow[] = [];
    const opportunity: AdRow[] = [];
    const actionable: AdRow[] = [];
    for (const r of rows) {
      const prio = (r.priority_level ?? "").toLowerCase();
      if (prio === "critical") critical.push(r);
      if (prio === "opportunity") opportunity.push(r);
      const aKey = (r.recommended_action ?? "").toLowerCase();
      if (aKey && aKey !== "keep_monitoring") actionable.push(r);
    }
    return { critical, opportunity, actionable };
  }, [rows]);

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header + Resumo da IA */}
        <header className="flex flex-col items-start justify-between gap-6 lg:flex-row">
          <div className="space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
              Ads Intelligence
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Ads Inteligente
            </h1>
            <p className="max-w-xl text-base text-slate-500">
              Otimização e leitura estratégica das campanhas com base em performance real.
            </p>
          </div>

          {!loading && !error && rows.length > 0 && (
            <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl shadow-slate-200/50 lg:w-96">
              <div className="relative z-10">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Resumo da IA
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold tabular-nums text-rose-400">{pad2(buckets.critical.length)}</p>
                    <p className="text-[10px] uppercase tracking-tight text-slate-300">Críticas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums text-emerald-400">{pad2(buckets.opportunity.length)}</p>
                    <p className="text-[10px] uppercase tracking-tight text-slate-300">Oportunidades</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums text-blue-400">{pad2(buckets.actionable.length)}</p>
                    <p className="text-[10px] uppercase tracking-tight text-slate-300">Recomendações</p>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-10">
                <Sparkles className="h-32 w-32" strokeWidth={1.5} />
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Carregando campanhas...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            Não foi possível carregar as campanhas agora. Tente novamente em instantes.
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Nenhuma campanha encontrada para esta empresa.
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            {/* KPIs */}
            <section className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiPrimary label="Investimento" prefix="R$" value={fmtBRLValue(totals.investment)} />
                <KpiPrimary label="Receita Ads" prefix="R$" value={fmtBRLValue(totals.ads_revenue)} />
                <KpiPrimary label="ROAS Médio" value={fmtNum(totals.roas, 2)} />
                <KpiPrimary label="ACOS" value={`${fmtNum(totals.acos, 1)}%`} />
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiSecondary label="TACoS" value={`${fmtNum(totals.tacos, 1)}%`} />
                <KpiSecondary label="Cliques" value={fmtInt(totals.clicks)} />
                <KpiSecondary label="Impressões" value={fmtCompact(totals.impressions)} />
                <KpiSecondary label="Campanhas Ativas" value={fmtInt(rows.length)} />
              </div>
            </section>

            {/* Priority blocks */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <PriorityBlock
                title="Campanhas Críticas"
                count={buckets.critical.length}
                icon={AlertTriangle}
                accent="rose"
                items={buckets.critical.slice(0, 3)}
                emptyText="Nenhuma campanha crítica."
              />
              <PriorityBlock
                title="Oportunidades de Escala"
                count={buckets.opportunity.length}
                icon={TrendingUp}
                accent="emerald"
                items={buckets.opportunity.slice(0, 3)}
                emptyText="Sem oportunidades neste ciclo."
              />
              <PriorityBlock
                title="Recomendações IA"
                count={buckets.actionable.length}
                icon={Sparkles}
                accent="blue"
                items={buckets.actionable.slice(0, 3)}
                emptyText="Nenhuma recomendação ativa."
                showAction
              />
            </section>

            {/* Análise detalhada */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  Análise Detalhada
                </h3>
                <span className="text-xs text-slate-500">
                  {rows.length} {rows.length === 1 ? "campanha" : "campanhas"}
                </span>
              </div>

              <div className="space-y-4">
                {rows.map((c, i) => (
                  <CampaignCard key={i} c={c} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </EcommerceLayout>
  );
}

function KpiPrimary({ label, value, prefix }: { label: string; value: string; prefix?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <div className="mt-1 flex items-baseline gap-1">
        {prefix && <span className="text-xs font-medium text-slate-500">{prefix}</span>}
        <span className="text-2xl font-bold tracking-tight tabular-nums text-slate-900">
          {value}
        </span>
      </div>
    </div>
  );
}

function KpiSecondary({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2">
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <p className="text-sm font-semibold tabular-nums text-slate-700">{value}</p>
    </div>
  );
}

function PriorityBlock({
  title,
  count,
  icon: Icon,
  accent,
  items,
  emptyText,
  showAction = false,
}: {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: "rose" | "emerald" | "blue";
  items: AdRow[];
  emptyText: string;
  showAction?: boolean;
}) {
  const styles = {
    rose: {
      border: "border-t-rose-500",
      iconBg: "bg-rose-50 text-rose-600",
      num: "text-rose-600",
      badge: "bg-rose-100 text-rose-700",
    },
    emerald: {
      border: "border-t-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-600",
      num: "text-emerald-600",
      badge: "bg-emerald-100 text-emerald-700",
    },
    blue: {
      border: "border-t-blue-500",
      iconBg: "bg-blue-50 text-blue-600",
      num: "text-blue-600",
      badge: "bg-blue-100 text-blue-700",
    },
  }[accent];

  return (
    <div className={`rounded-2xl border border-t-4 border-slate-200 bg-white p-6 shadow-sm ${styles.border}`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${styles.iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-slate-900">{title}</h4>
        </div>
        <span className={`text-2xl font-black tabular-nums ${styles.num}`}>{pad2(count)}</span>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400">{emptyText}</p>
        ) : (
          items.map((it, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span
                className="truncate pr-2 text-xs font-medium text-slate-700"
                title={it.campaign_name ?? ""}
              >
                {it.campaign_name ?? "—"}
              </span>
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${styles.badge}`}
              >
                {showAction
                  ? translateAction(it.recommended_action) ?? "Revisar"
                  : `ROAS ${fmtNum(it.roas, 2)}`}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CampaignCard({ c }: { c: AdRow }) {
  const prio = (c.priority_level ?? "normal").toLowerCase();
  const accentBar =
    prio === "critical"
      ? "bg-rose-500"
      : prio === "opportunity"
        ? "bg-emerald-500"
        : prio === "high"
          ? "bg-amber-500"
          : "bg-slate-200";

  const prioBadge =
    prio === "critical"
      ? "bg-rose-50 text-rose-600"
      : prio === "opportunity"
        ? "bg-emerald-50 text-emerald-600"
        : prio === "high"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600";

  const roasColor =
    prio === "critical"
      ? "text-rose-600"
      : prio === "opportunity"
        ? "text-emerald-600"
        : "text-slate-800";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:flex-row">
      <div className={`w-full md:w-1.5 ${accentBar}`} style={{ minHeight: "6px" }} />
      <div className="flex-1 p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-bold tracking-tight text-slate-900">
                {c.campaign_name ?? "Campanha sem nome"}
              </h4>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${prioBadge}`}
              >
                {PRIORITY_LABEL[prio] ?? prio}
              </span>
            </div>
            <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
              {c.product_name && <span className="text-slate-600">{c.product_name}</span>}
              {c.product_name && c.sku && <span className="text-slate-300">|</span>}
              {c.sku && <span>SKU: {c.sku}</span>}
              {(c.account_name || c.marketplace) && <span className="text-slate-300">|</span>}
              {c.account_name && <span>{c.account_name}</span>}
              {c.marketplace && <span className="text-slate-400">· {c.marketplace}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {c.ad_type && (
              <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {c.ad_type}
              </span>
            )}
            {c.ads_status && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {c.ads_status}
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
          <Metric label="Investimento" value={fmtBRL(c.investment)} />
          <Metric label="Receita Ads" value={fmtBRL(c.ads_revenue)} />
          <Metric label="Receita Total" value={fmtBRL(c.total_revenue)} />
          <Metric label="ROAS" value={fmtNum(c.roas, 2)} className={roasColor} />
          <Metric label="ACOS" value={fmtPct(c.acos)} />
          <Metric label="TACoS" value={fmtPct(c.tacos)} />
          <Metric label="Cliques" value={fmtInt(c.clicks)} />
          <Metric label="Impressões" value={fmtCompact(Number(c.impressions ?? 0))} />
        </div>

        {c.recommended_action && c.recommended_action.toLowerCase() !== "keep_monitoring" && (
          <div className="mb-4 flex items-center gap-2 text-xs">
            <span className="font-bold uppercase tracking-widest text-slate-400">
              Ação recomendada
            </span>
            <span className="font-bold text-slate-700">
              {translateAction(c.recommended_action)}
            </span>
          </div>
        )}

        {c.ai_action_suggestion && (
          <div className="flex items-start gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="shrink-0 rounded-lg bg-blue-100 p-2 text-blue-600">
              <Zap className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-tight text-blue-900">
                Sugestão da IA
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                {c.ai_action_suggestion}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-sm font-bold tabular-nums text-slate-800 ${className ?? ""}`}>{value}</p>
    </div>
  );
}

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
            <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1220] via-[#0F1B33] to-[#13294B] p-6 text-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)] ring-1 ring-white/5 lg:w-[420px]">
              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300/80">
                    Resumo da IA
                  </h3>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-slate-300 ring-1 ring-white/10">
                    Tempo real
                  </span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-white/10">
                  <div className="pr-3">
                    <p className="text-[28px] font-semibold leading-none tabular-nums text-rose-300">{pad2(buckets.critical.length)}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">Críticas</p>
                  </div>
                  <div className="px-3">
                    <p className="text-[28px] font-semibold leading-none tabular-nums text-emerald-300">{pad2(buckets.opportunity.length)}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">Oportunidades</p>
                  </div>
                  <div className="pl-3">
                    <p className="text-[28px] font-semibold leading-none tabular-nums text-sky-300">{pad2(buckets.actionable.length)}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">Recomendações</p>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-6 -right-6 opacity-[0.07]">
                <Sparkles className="h-36 w-36" strokeWidth={1.25} />
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
      surface: "bg-[#FFF6F7] border-[#F3D6DB]",
      iconBg: "bg-white text-[#E54861] ring-1 ring-[#F3D6DB]",
      num: "text-[#E54861]",
      badge: "bg-white text-[#E54861] ring-1 ring-[#F3D6DB]",
      divider: "border-[#F3D6DB]/70",
      row: "bg-white/70 ring-1 ring-[#F3D6DB]/60",
    },
    emerald: {
      surface: "bg-[#F5FBF7] border-[#D7EEE0]",
      iconBg: "bg-white text-[#16A34A] ring-1 ring-[#D7EEE0]",
      num: "text-[#16A34A]",
      badge: "bg-white text-[#16A34A] ring-1 ring-[#D7EEE0]",
      divider: "border-[#D7EEE0]/70",
      row: "bg-white/70 ring-1 ring-[#D7EEE0]/60",
    },
    blue: {
      surface: "bg-[#F5F8FF] border-[#DCE7FF]",
      iconBg: "bg-white text-[#2563EB] ring-1 ring-[#DCE7FF]",
      num: "text-[#2563EB]",
      badge: "bg-white text-[#2563EB] ring-1 ring-[#DCE7FF]",
      divider: "border-[#DCE7FF]/70",
      row: "bg-white/70 ring-1 ring-[#DCE7FF]/60",
    },
  }[accent];

  return (
    <div className={`rounded-2xl border ${styles.surface} p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]`}>
      <div className={`flex items-center justify-between border-b ${styles.divider} pb-4`}>
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${styles.iconBg}`}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <h4 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h4>
        </div>
        <span className={`text-3xl font-bold tabular-nums leading-none ${styles.num}`}>{pad2(count)}</span>
      </div>
      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <p className="px-1 py-2 text-xs text-slate-500">{emptyText}</p>
        ) : (
          items.map((it, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg ${styles.row} px-3 py-2.5`}>
              <span
                className="truncate pr-3 text-[13px] font-medium text-slate-800"
                title={it.campaign_name ?? ""}
              >
                {it.campaign_name ?? "—"}
              </span>
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
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
  const action = (c.recommended_action ?? "").toLowerCase();

  // Determine visual tone: critical > opportunity > attention (reduce/review/pause) > neutral
  let tone: "critical" | "opportunity" | "attention" | "neutral" = "neutral";
  if (prio === "critical" || action === "pause") tone = "critical";
  else if (prio === "opportunity" || action === "scale") tone = "opportunity";
  else if (prio === "high" || action === "reduce_budget" || action === "review_ad") tone = "attention";

  const toneStyles = {
    critical: {
      surface: "bg-[#FFF5F6] border-[#F4D5DA]",
      bar: "bg-[#E54861]",
      badge: "bg-white text-[#E54861] ring-1 ring-[#F4D5DA]",
      roas: "text-[#E54861]",
      actionLabel: "text-[#E54861]",
      aiSurface: "bg-white/70 border-[#F4D5DA]",
      aiIcon: "bg-[#FFE8EC] text-[#E54861]",
      aiTitle: "text-[#9F1F35]",
      chip: "bg-white/80 text-slate-600 ring-1 ring-[#F4D5DA]",
    },
    opportunity: {
      surface: "bg-[#F3FBF7] border-[#CDEEDD]",
      bar: "bg-[#22C55E]",
      badge: "bg-white text-[#16A34A] ring-1 ring-[#CDEEDD]",
      roas: "text-[#16A34A]",
      actionLabel: "text-[#16A34A]",
      aiSurface: "bg-white/70 border-[#CDEEDD]",
      aiIcon: "bg-[#DCF5E7] text-[#16A34A]",
      aiTitle: "text-[#14532D]",
      chip: "bg-white/80 text-slate-600 ring-1 ring-[#CDEEDD]",
    },
    attention: {
      surface: "bg-[#FFF9F2] border-[#F4DFC2]",
      bar: "bg-[#F59E0B]",
      badge: "bg-white text-[#B45309] ring-1 ring-[#F4DFC2]",
      roas: "text-[#B45309]",
      actionLabel: "text-[#B45309]",
      aiSurface: "bg-white/70 border-[#F4DFC2]",
      aiIcon: "bg-[#FCEBD0] text-[#B45309]",
      aiTitle: "text-[#7C2D12]",
      chip: "bg-white/80 text-slate-600 ring-1 ring-[#F4DFC2]",
    },
    neutral: {
      surface: "bg-[#F7FAFF] border-[#DCE7F8]",
      bar: "bg-[#3B82F6]",
      badge: "bg-white text-[#2563EB] ring-1 ring-[#DCE7F8]",
      roas: "text-slate-800",
      actionLabel: "text-[#2563EB]",
      aiSurface: "bg-white/70 border-[#DCE7F8]",
      aiIcon: "bg-[#E4EDFC] text-[#2563EB]",
      aiTitle: "text-[#1E3A8A]",
      chip: "bg-white/80 text-slate-600 ring-1 ring-[#DCE7F8]",
    },
  }[tone];

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border ${toneStyles.surface} shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:flex-row`}
    >
      <div className={`w-full md:w-1.5 ${toneStyles.bar}`} style={{ minHeight: "6px" }} />
      <div className="flex-1 p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-[17px] font-semibold tracking-tight text-slate-900">
                {c.campaign_name ?? "Campanha sem nome"}
              </h4>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${toneStyles.badge}`}
              >
                {PRIORITY_LABEL[prio] ?? prio}
              </span>
            </div>
            <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
              {c.product_name && <span className="text-slate-600">{c.product_name}</span>}
              {c.product_name && c.sku && <span className="text-slate-300">·</span>}
              {c.sku && <span>SKU: {c.sku}</span>}
              {(c.account_name || c.marketplace) && <span className="text-slate-300">·</span>}
              {c.account_name && <span>{c.account_name}</span>}
              {c.marketplace && <span className="text-slate-400">· {c.marketplace}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {c.ad_type && (
              <span className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${toneStyles.chip}`}>
                {c.ad_type}
              </span>
            )}
            {c.ads_status && (
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {c.ads_status}
              </span>
            )}
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-white/70 bg-white/60 px-4 py-4 sm:grid-cols-4 lg:grid-cols-8">
          <Metric label="Investimento" value={fmtBRL(c.investment)} />
          <Metric label="Receita Ads" value={fmtBRL(c.ads_revenue)} />
          <Metric label="Receita Total" value={fmtBRL(c.total_revenue)} />
          <Metric label="ROAS" value={fmtNum(c.roas, 2)} className={toneStyles.roas} />
          <Metric label="ACOS" value={fmtPct(c.acos)} />
          <Metric label="TACoS" value={fmtPct(c.tacos)} />
          <Metric label="Cliques" value={fmtInt(c.clicks)} />
          <Metric label="Impressões" value={fmtCompact(Number(c.impressions ?? 0))} />
        </div>

        {c.recommended_action && c.recommended_action.toLowerCase() !== "keep_monitoring" && (
          <div className="mb-4 flex items-center gap-2 text-xs">
            <span className="font-semibold uppercase tracking-widest text-slate-400">
              Ação recomendada
            </span>
            <span className={`font-semibold ${toneStyles.actionLabel}`}>
              {translateAction(c.recommended_action)}
            </span>
          </div>
        )}

        {c.ai_action_suggestion && (
          <div className={`flex items-start gap-3 rounded-xl border ${toneStyles.aiSurface} p-4`}>
            <div className={`shrink-0 rounded-lg p-1.5 ${toneStyles.aiIcon}`}>
              <Zap className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <div className="space-y-1">
              <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${toneStyles.aiTitle}`}>
                Sugestão da IA
              </p>
              <p className="text-[13px] leading-relaxed text-slate-700">
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

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/dashboard")({
  component: EcommerceDashboard,
  head: () => ({
    meta: [{ title: "Visão Geral E-commerce | Agente Comercial 360" }],
  }),
});

type Summary = {
  company_id?: string | null;
  total_gross_revenue?: number | null;
  total_sales_count?: number | null;
  total_accounts?: number | null;
  total_products?: number | null;
  products_low_conversion?: number | null;
  products_visits_no_sales?: number | null;
  products_no_visits?: number | null;
  total_ads_investment?: number | null;
  avg_roas?: number | null;
  critical_insights?: number | null;
  critical_tasks?: number | null;
  pending_tasks?: number | null;
  open_insights?: number | null;
};

const fmtBRL = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(v ?? 0));
const fmtInt = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(v ?? 0));
const fmtNum = (v: number | null | undefined, d = 2) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(Number(v ?? 0));

type Tone = "neutral" | "info" | "success" | "attention" | "critical" | "ads";

const TONE: Record<Tone, { accent: string; dot: string; value: string }> = {
  neutral: { accent: "bg-slate-300", dot: "bg-slate-400", value: "text-slate-900" },
  info: { accent: "bg-sky-400", dot: "bg-sky-500", value: "text-slate-900" },
  success: { accent: "bg-emerald-400", dot: "bg-emerald-500", value: "text-slate-900" },
  attention: { accent: "bg-amber-400", dot: "bg-amber-500", value: "text-slate-900" },
  critical: { accent: "bg-rose-400", dot: "bg-rose-500", value: "text-rose-700" },
  ads: { accent: "bg-violet-400", dot: "bg-violet-500", value: "text-slate-900" },
};

function KpiCard({
  label,
  value,
  tone = "neutral",
  emphasis = false,
  to,
  search,
}: {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  emphasis?: boolean;
  to?: string;
  search?: Record<string, string>;
}) {
  const t = TONE[tone];
  const inner = (
    <>
      <span className={`absolute left-0 top-0 h-full w-[3px] ${t.accent}`} aria-hidden />
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </div>
      <div
        className={`mt-1.5 ${emphasis ? "text-[22px]" : "text-[18px]"} font-semibold tabular-nums ${t.value}`}
      >
        {value}
      </div>
      {to && (
        <div className="mt-3 flex items-center justify-between text-[10.5px] font-medium text-slate-400 transition-colors group-hover:text-slate-700">
          <span>Ver detalhes</span>
          <span aria-hidden>→</span>
        </div>
      )}
    </>
  );

  const baseCls =
    "group relative block overflow-hidden rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-all";

  if (to) {
    return (
      <Link
        to={to as any}
        search={search as any}
        className={`${baseCls} cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.22)]`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={`${baseCls} hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.18)]`}>{inner}</div>
  );
}

function ReadingCard({
  title,
  tone,
  text,
}: {
  title: string;
  tone: Tone;
  text: string;
}) {
  const t = TONE[tone];
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <span className={`absolute left-0 top-0 h-full w-[3px] ${t.accent}`} aria-hidden />
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
          {title}
        </div>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}

function Shortcut({ to, label, hint }: { to: string; label: string; hint: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.18)]"
    >
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-slate-900">{label}</div>
        <div className="mt-0.5 text-[11.5px] text-slate-500">{hint}</div>
      </div>
      <span className="ml-3 text-[12px] text-slate-400 transition-colors group-hover:text-slate-700">
        →
      </span>
    </Link>
  );
}

function EcommerceDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

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

        const { data, error: sErr } = await supabase
          .from("vw_ecommerce_dashboard_summary")
          .select("*")
          .eq("company_id", ctx.company_id)
          .maybeSingle();

        if (sErr) throw sErr;
        if (cancelled) return;
        setSummary(data ?? null);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Erro ao carregar dados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const derived = useMemo(() => {
    const s = summary ?? {};
    const noVisits = Number(s.products_no_visits ?? 0);
    const visitsNoSales = Number(s.products_visits_no_sales ?? 0);
    const lowConv = Number(s.products_low_conversion ?? 0);
    const stuck = noVisits + visitsNoSales + lowConv;
    const criticalAlerts =
      Number(s.critical_insights ?? 0) + Number(s.critical_tasks ?? 0);
    return { noVisits, visitsNoSales, lowConv, stuck, criticalAlerts };
  }, [summary]);

  const wordTarefa = (n: number) =>
    n === 1 ? "tarefa pendente" : "tarefas pendentes";
  const wordInsight = (n: number) =>
    n === 1 ? "insight crítico" : "insights críticos";
  const wordProduto = (n: number) => (n === 1 ? "produto" : "produtos");

  const aiText = summary
    ? `Existem ${fmtInt(derived.noVisits)} ${wordProduto(derived.noVisits)} sem visita, ${fmtInt(
        derived.visitsNoSales,
      )} ${wordProduto(derived.visitsNoSales)} com visitas sem venda e ${fmtInt(
        derived.lowConv,
      )} ${wordProduto(derived.lowConv)} com baixa conversão. Há ${fmtInt(
        Number(summary.critical_insights ?? 0),
      )} ${wordInsight(Number(summary.critical_insights ?? 0))} e ${fmtInt(
        Number(summary.pending_tasks ?? 0),
      )} ${wordTarefa(Number(summary.pending_tasks ?? 0))} para análise.`
    : null;

  const healthyText = summary
    ? `Operação com ${fmtInt(summary.total_accounts)} ${
        Number(summary.total_accounts ?? 0) === 1 ? "conta conectada" : "contas conectadas"
      } e ${fmtInt(summary.total_products)} ${wordProduto(
        Number(summary.total_products ?? 0),
      )} ativos. Faturamento acumulado de ${fmtBRL(summary.total_gross_revenue)}.`
    : "—";

  const attentionText = summary
    ? derived.stuck > 0 || Number(summary.pending_tasks ?? 0) > 0
      ? `${fmtInt(derived.stuck)} ${wordProduto(derived.stuck)} com sinais de baixa performance e ${fmtInt(
          Number(summary.pending_tasks ?? 0),
        )} ${wordTarefa(Number(summary.pending_tasks ?? 0))} aguardando ação.`
      : "Nenhum ponto crítico identificado no momento."
    : "—";

  const priorityText = summary
    ? derived.criticalAlerts > 0
      ? `Revisar ${fmtInt(derived.criticalAlerts)} ${
          derived.criticalAlerts === 1 ? "alerta crítico" : "alertas críticos"
        } e analisar produtos travados e campanhas com baixo retorno.`
      : "Acompanhar campanhas de Ads e produtos com menor conversão para sustentar o ritmo."
    : "—";

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Executive header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
              AC360 · E-commerce Intelligence
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Visão Geral do E-commerce
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Acompanhe a performance das contas, produtos, campanhas e prioridades em um só lugar.
            </p>
          </div>

          <div className="lg:max-w-md">
            <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
              <span className="absolute left-0 top-0 h-full w-[3px] bg-[#1e3a5f]" aria-hidden />
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1e3a5f]" />
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Resumo da IA
                </div>
              </div>
              {aiText ? (
                <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{aiText}</p>
              ) : (
                <div className="mt-3 space-y-1.5" aria-label="Carregando resumo">
                  <div className="h-2.5 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 w-11/12 animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading / Error / Empty */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Carregando dados da operação…
          </div>
        )}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            Não foi possível carregar os dados agora. Tente novamente em instantes.
          </div>
        )}
        {!loading && !error && !summary && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Nenhum dado encontrado para esta empresa.
          </div>
        )}

        {!loading && !error && summary && (
          <>
            {/* Executive KPIs */}
            <section className="space-y-2.5">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Indicadores executivos
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard
                  label="Faturamento total"
                  value={fmtBRL(summary.total_gross_revenue)}
                  tone="success"
                  emphasis
                />
                <KpiCard
                  label="Vendas totais"
                  value={fmtInt(summary.total_sales_count)}
                  tone="info"
                  emphasis
                />
                <KpiCard
                  label="Contas conectadas"
                  value={fmtInt(summary.total_accounts)}
                  tone="neutral"
                  emphasis
                />
                <KpiCard
                  label="Produtos ativos"
                  value={fmtInt(summary.total_products)}
                  tone="neutral"
                  emphasis
                />
              </div>
            </section>

            {/* Attention KPIs */}
            <section className="space-y-2.5">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Indicadores de atenção
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <KpiCard label="Produtos travados" value={fmtInt(derived.stuck)} tone="critical" />
                <KpiCard
                  label="Produtos sem venda"
                  value={fmtInt(summary.products_visits_no_sales)}
                  tone="attention"
                />
                <KpiCard
                  label="Produtos sem visita"
                  value={fmtInt(summary.products_no_visits)}
                  tone="info"
                />
                <KpiCard
                  label="Investimento Ads"
                  value={fmtBRL(summary.total_ads_investment)}
                  tone="ads"
                />
                <KpiCard
                  label="ROAS médio"
                  value={
                    Number(summary.avg_roas ?? 0) > 0
                      ? `${fmtNum(summary.avg_roas, 2)}x`
                      : "—"
                  }
                  tone={Number(summary.avg_roas ?? 0) >= 1.5 ? "success" : "critical"}
                />
                <KpiCard
                  label="Alertas críticos"
                  value={fmtInt(derived.criticalAlerts)}
                  tone="critical"
                />
                <KpiCard
                  label="Tarefas pendentes"
                  value={fmtInt(summary.pending_tasks)}
                  tone="attention"
                />
                <KpiCard
                  label="Insights abertos"
                  value={fmtInt(summary.open_insights)}
                  tone="info"
                />
              </div>
            </section>

            {/* Executive reading */}
            <section className="space-y-2.5">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Leitura executiva
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <ReadingCard title="O que está saudável" tone="success" text={healthyText} />
                <ReadingCard title="O que exige atenção" tone="attention" text={attentionText} />
                <ReadingCard title="Próxima prioridade" tone="critical" text={priorityText} />
              </div>
            </section>

            {/* Strategic shortcuts */}
            <section className="space-y-2.5">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Atalhos estratégicos
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Shortcut
                  to="/ecommerce/produtos-travados"
                  label="Produtos travados"
                  hint="Diagnóstico de SKUs sem performance"
                />
                <Shortcut
                  to="/ecommerce/ads"
                  label="Ads inteligente"
                  hint="Performance de campanhas e ROAS"
                />
                <Shortcut
                  to="/ecommerce/prioridades"
                  label="Prioridades"
                  hint="O que tratar primeiro nesta semana"
                />
                <Shortcut
                  to="/ecommerce/tarefas"
                  label="Tarefas"
                  hint="Ações pendentes da operação"
                />
              </div>
            </section>
          </>
        )}
      </div>
    </EcommerceLayout>
  );
}

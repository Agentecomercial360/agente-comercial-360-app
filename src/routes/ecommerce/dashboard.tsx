import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Store,
  TrendingUp,
  Users,
  ShoppingCart,
  ShieldAlert,
  Boxes,
  Zap,
  Activity,
  BrainCircuit,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Search,
  ListTodo,
  Lightbulb,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/dashboard")({
  component: EcommerceDashboard,
  head: () => ({
    meta: [{ title: "Visão Geral E-commerce | Agente Comercial 360" }],
  }),
});

function KpiCard({ label, value, icon: Icon, trend, trendValue, color }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-2.5 ${color || "bg-blue-50 text-blue-600"} ring-1 ring-inset ring-black/5`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
      </div>
    </div>
  );
}

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
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number(v ?? 0));
const fmtInt = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(v ?? 0));
const fmtNum = (v: number | null | undefined, digits = 1) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(v ?? 0));

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

  const productsBlocked =
    Number(summary?.products_low_conversion ?? 0) +
    Number(summary?.products_visits_no_sales ?? 0) +
    Number(summary?.products_no_visits ?? 0);
  const criticalAlerts =
    Number(summary?.critical_insights ?? 0) + Number(summary?.critical_tasks ?? 0);

  const kpis = [
    { label: "Faturamento total", value: fmtBRL(summary?.total_gross_revenue), icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Vendas totais", value: fmtInt(summary?.total_sales_count), icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
    { label: "Contas conectadas", value: fmtInt(summary?.total_accounts), icon: Users, color: "bg-indigo-50 text-indigo-600" },
    { label: "Produtos ativos", value: fmtInt(summary?.total_products), icon: Boxes, color: "bg-violet-50 text-violet-600" },
    { label: "Produtos travados", value: fmtInt(productsBlocked), icon: ShieldAlert, color: "bg-rose-50 text-rose-600" },
    { label: "Produtos sem venda", value: fmtInt(summary?.products_visits_no_sales), icon: AlertCircle, color: "bg-amber-50 text-amber-600" },
    { label: "Produtos sem visita", value: fmtInt(summary?.products_no_visits), icon: Search, color: "bg-slate-50 text-slate-600" },
    { label: "Investimento Ads", value: fmtBRL(summary?.total_ads_investment), icon: Zap, color: "bg-yellow-50 text-yellow-600" },
    { label: "ROAS médio", value: fmtNum(summary?.avg_roas, 2), icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    { label: "Alertas críticos", value: fmtInt(criticalAlerts), icon: Activity, color: "bg-rose-50 text-rose-600" },
    { label: "Tarefas pendentes", value: fmtInt(summary?.pending_tasks), icon: ListTodo, color: "bg-orange-50 text-orange-600" },
    { label: "Insights abertos", value: fmtInt(summary?.open_insights), icon: Lightbulb, color: "bg-cyan-50 text-cyan-600" },
  ];

  const aiText = summary
    ? `Existem ${fmtInt(summary.products_no_visits)} produtos sem visitas, ${fmtInt(
        summary.products_visits_no_sales
      )} produtos com visitas sem venda e ${fmtInt(
        summary.products_low_conversion
      )} produtos com baixa conversão. Existem ${fmtInt(
        summary.critical_insights
      )} insights críticos e ${fmtInt(summary.pending_tasks)} tarefas pendentes para análise.`
    : "Carregando análise da IA...";

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HERO E-COMMERCE */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 shadow-sm">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  E-commerce Intelligence
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  <Activity className="h-3 w-3" /> Monitoramento Mercado Livre
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
                Visão Geral do E-commerce
              </h1>
              <p className="mt-2 text-lg text-blue-100/80">
                Acompanhe a performance de todas as suas contas do Mercado Livre em um só lugar com inteligência artificial.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm md:max-w-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <BrainCircuit className="h-4 w-4 text-blue-400" />
                Resumo da IA
              </div>
              <p className="text-sm leading-relaxed text-blue-100/70">{aiText}</p>
            </div>
          </div>
        </div>

        {/* Loading / Error / Empty */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            Carregando dados da operação...
          </div>
        )}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            Não foi possível carregar os dados agora. Tente novamente em instantes.
          </div>
        )}
        {!loading && !error && !summary && (
          <div className="rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            Nenhum dado encontrado para esta empresa.
          </div>
        )}

        {/* KPI Grid */}
        {!loading && !error && summary && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {kpis.map((kpi, i) => (
              <KpiCard key={i} {...kpi} />
            ))}
          </div>
        )}

        {/* Prioridades da Semana */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-900" />
            <h2 className="text-xl font-bold text-slate-900">Prioridades da Semana</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-rose-500 p-2 text-white">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-rose-900">Alta prioridade</h3>
              </div>
              <ul className="mt-4 space-y-3">
                <li className="text-sm text-rose-800/80">• 12 produtos com Ads gastando e zero vendas</li>
                <li className="text-sm text-rose-800/80">• 5 produtos com ruptura de estoque iminente</li>
                <li className="text-sm text-rose-800/80">• Queda de 15% na conversão da conta Principal</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-500 p-2 text-white">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-amber-900">Média prioridade</h3>
              </div>
              <ul className="mt-4 space-y-3">
                <li className="text-sm text-amber-800/80">• 8 produtos campeões perdendo posição</li>
                <li className="text-sm text-amber-800/80">• Revisar títulos de 20 produtos sem visita</li>
                <li className="text-sm text-amber-800/80">• Otimizar ROAS da campanha de Acessórios</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500 p-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-blue-900">Baixa prioridade</h3>
              </div>
              <ul className="mt-4 space-y-3">
                <li className="text-sm text-blue-800/80">• Atualizar descrições técnicas</li>
                <li className="text-sm text-blue-800/80">• Planejar promoções para o próximo mês</li>
                <li className="text-sm text-blue-800/80">• Analisar novos concorrentes no nicho</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </EcommerceLayout>
  );
}

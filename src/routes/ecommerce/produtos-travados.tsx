import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Filter } from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/produtos-travados")({
  component: ProdutosTravados,
  head: () => ({
    meta: [{ title: "Produtos Travados | Agente Comercial 360" }],
  }),
});

type Stuck = {
  sku?: string | null;
  product_name?: string | null;
  account_name?: string | null;
  marketplace?: string | null;
  problem_label?: string | null;
  priority_level?: string | null;
  visits?: number | null;
  sales_count?: number | null;
  total_stock?: number | null;
  days_without_sale?: number | null;
  ads_investment?: number | null;
  ads_revenue?: number | null;
  roas?: number | null;
  task_title?: string | null;
  insight_title?: string | null;
  recommended_action?: string | null;
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Crítico",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const PRIORITY_STYLE: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700",
  high: "bg-amber-100 text-amber-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-slate-100 text-slate-700",
};

const fmtBRL = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number(v ?? 0));
const fmtInt = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(v ?? 0));
const fmtNum = (v: number | null | undefined, d = 2) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(v ?? 0));

function ProdutosTravados() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Stuck[]>([]);

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
          .from("vw_ecommerce_products_stuck")
          .select("*")
          .eq("company_id", ctx.company_id);

        if (sErr) throw sErr;
        if (cancelled) return;
        setItems((data as Stuck[]) ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Erro ao carregar produtos travados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Produtos Travados</h1>
            <p className="text-slate-500">Identifique e resolva gargalos em produtos que não estão performando.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50">
            <Filter className="h-4 w-4" />
            Filtros avançados
          </button>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            Carregando produtos travados...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            Não foi possível carregar os produtos travados agora. Tente novamente em instantes.
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            Nenhum produto travado encontrado para esta empresa.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-900">Produto</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Conta / Marketplace</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Problema</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Prioridade</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Visitas</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Vendas</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Estoque</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Dias s/ venda</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Inv. Ads</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Rec. Ads</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">ROAS</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Ação Recomendada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((p, i) => {
                    const prio = (p.priority_level ?? "low").toLowerCase();
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{p.product_name ?? "—"}</span>
                            <span className="text-[11px] uppercase tracking-wider text-slate-500">{p.sku ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{p.account_name ?? "—"}</span>
                            <span className="text-[11px] uppercase tracking-wider text-slate-500">{p.marketplace ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{p.problem_label ?? "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${PRIORITY_STYLE[prio] ?? "bg-slate-100 text-slate-700"}`}>
                            {PRIORITY_LABEL[prio] ?? prio}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtInt(p.visits)}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtInt(p.sales_count)}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtInt(p.total_stock)}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtInt(p.days_without_sale)}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtBRL(p.ads_investment)}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtBRL(p.ads_revenue)}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtNum(p.roas, 2)}</td>
                        <td className="px-6 py-4">
                          {p.recommended_action || p.task_title ? (
                            <div className="flex flex-col gap-0.5">
                              <button className="inline-flex items-center gap-1.5 text-left font-bold text-blue-600 hover:text-blue-700">
                                {p.recommended_action ?? p.task_title}
                                <ArrowRight className="h-3 w-3" />
                              </button>
                              {p.insight_title && (
                                <span className="text-[11px] text-slate-500">{p.insight_title}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </EcommerceLayout>
  );
}

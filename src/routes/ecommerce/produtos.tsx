import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/ecommerce/produtos")({
  component: ProdutosUnificado,
  head: () => ({
    meta: [{ title: "Produtos Unificados | Agente Comercial 360" }],
  }),
});

type Product = {
  sku?: string | null;
  product_name?: string | null;
  category?: string | null;
  brand?: string | null;
  total_stock?: number | null;
  available_stock?: number | null;
  days_without_sale?: number | null;
  estimated_stock_value?: number | null;
  total_listings?: number | null;
  marketplaces?: string[] | string | null;
  total_visits?: number | null;
  total_sales_count?: number | null;
  total_gross_revenue?: number | null;
  total_ads_investment?: number | null;
  total_ads_revenue?: number | null;
  avg_roas?: number | null;
  open_tasks?: number | null;
  product_health_status?: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  critical: "Crítico",
  attention: "Atenção",
  no_traffic: "Sem tráfego",
  visits_no_sales: "Visitas sem venda",
  ads_wasting: "Ads desperdiçando",
  growth_opportunity: "Oportunidade de crescimento",
  normal: "Normal",
};

const STATUS_STYLE: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700",
  attention: "bg-amber-100 text-amber-700",
  no_traffic: "bg-slate-100 text-slate-700",
  visits_no_sales: "bg-orange-100 text-orange-700",
  ads_wasting: "bg-rose-100 text-rose-700",
  growth_opportunity: "bg-emerald-100 text-emerald-700",
  normal: "bg-blue-100 text-blue-700",
};

const fmtBRL = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number(v ?? 0));
const fmtInt = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(v ?? 0));
const fmtNum = (v: number | null | undefined, d = 2) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(v ?? 0));

function toMarketplacesList(v: Product["marketplaces"]): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean) as string[];
  return String(v).split(",").map((s) => s.trim()).filter(Boolean);
}

function ProdutosUnificado() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

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

        const { data, error: pErr } = await supabase
          .from("vw_ecommerce_product_unified")
          .select("*")
          .eq("company_id", ctx.company_id);

        if (pErr) throw pErr;
        if (cancelled) return;
        setProducts((data as Product[]) ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Erro ao carregar produtos.");
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Produto Unificado</h1>
          <p className="text-slate-500">Visão consolidada de SKUs em todas as suas contas do Mercado Livre.</p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            Carregando produtos...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 text-sm text-rose-700">
            Não foi possível carregar os produtos agora. Tente novamente em instantes.
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-500">
            Nenhum produto encontrado para esta empresa.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-900">Produto / SKU</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Categoria</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-center">Estoque</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-center">Dias s/ venda</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Marketplaces</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Visitas</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Vendas</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Faturamento</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Inv. Ads</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Rec. Ads</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">ROAS</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-center">Tarefas</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p, i) => {
                    const mkts = toMarketplacesList(p.marketplaces);
                    const status = p.product_health_status ?? "normal";
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{p.product_name ?? "—"}</span>
                            <span className="text-[11px] uppercase tracking-wider text-slate-500">{p.sku ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{p.category ?? "—"}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">{fmtInt(p.total_stock)}</td>
                        <td className="px-6 py-4 text-center text-slate-700">{fmtInt(p.days_without_sale)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {mkts.length === 0 ? (
                              <span className="text-slate-400 text-xs">—</span>
                            ) : (
                              mkts.map((m, mi) => (
                                <span key={mi} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{m}</span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtInt(p.total_visits)}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtInt(p.total_sales_count)}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">{fmtBRL(p.total_gross_revenue)}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtBRL(p.total_ads_investment)}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtBRL(p.total_ads_revenue)}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmtNum(p.avg_roas, 2)}</td>
                        <td className="px-6 py-4 text-center text-slate-700">{fmtInt(p.open_tasks)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[status] ?? "bg-slate-100 text-slate-700"}`}>
                            {STATUS_LABEL[status] ?? status}
                          </span>
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

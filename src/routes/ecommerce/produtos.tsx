import { createFileRoute } from "@tanstack/react-router";
import { 
  Boxes, 
  ShoppingCart, 
  ArrowRight,
  Layers,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/ecommerce/produtos")({
  component: ProdutosUnificado,
  head: () => ({
    meta: [{ title: "Produtos Unificados | Agente Comercial 360" }],
  }),
});

function ProdutosUnificado() {
  const kpis = [
    { label: "Total de produtos", value: "450", icon: Boxes, color: "bg-blue-50 text-blue-600" },
    { label: "Em múltiplas contas", value: "128", icon: Layers, color: "bg-indigo-50 text-indigo-600" },
    { label: "Vendendo em uma, parado em outra", value: "45", icon: ShoppingCart, color: "bg-amber-50 text-amber-600" },
    { label: "Estoque disponível sem giro", value: "32", icon: Activity, color: "bg-rose-50 text-rose-600" },
  ];

  const products = [
    {
      name: "Pastilha de Freio Cerâmica",
      sku: "PF-CER-102",
      totalStock: 150,
      accounts: ["Chaleur Brasil", "RACER", "Conta 3"],
      bestAccount: "Chaleur Brasil",
      worstAccount: "Conta 3",
      status: "Performance Divergente",
      action: "Replicar anúncios campeões",
    },
    {
      name: "Kit Embreagem LUK",
      sku: "KE-LUK-200",
      totalStock: 45,
      accounts: ["Chaleur Brasil", "RACER"],
      bestAccount: "RACER",
      worstAccount: "Chaleur Brasil",
      status: "Atenção Estoque",
      action: "Repor na conta RACER",
    },
    {
      name: "Amortecedor Monroe Traseiro",
      sku: "AM-MON-TR",
      totalStock: 200,
      accounts: ["Chaleur Brasil", "Conta 4", "Conta 5"],
      bestAccount: "Conta 5",
      worstAccount: "Conta 4",
      status: "Ok",
      action: "Ajustar precificação",
    },
    {
      name: "Óleo Motor 5W30 Sintético",
      sku: "OL-5W30-SN",
      totalStock: 1200,
      accounts: ["Chaleur Brasil", "RACER", "Conta 3", "Conta 4"],
      bestAccount: "Chaleur Brasil",
      worstAccount: "RACER",
      status: "Venda Estável",
      action: "Nenhuma",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Produto Unificado</h1>
          <p className="text-slate-500">Visão consolidada de SKUs em todas as suas contas do Mercado Livre.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
              <div className={`w-fit rounded-xl p-2.5 ${kpi.color} ring-1 ring-inset ring-black/5`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-900">Produto / SKU</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Estoque Total</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Contas Ativas</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Melhor Performance</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Pior Performance</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Status IA</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Ação Sugerida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="text-[11px] uppercase tracking-wider text-slate-500">{p.sku}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{p.totalStock}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {p.accounts.map((acc, ai) => (
                          <span key={ai} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{acc}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {p.bestAccount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-rose-600 font-medium">
                        <TrendingDown className="h-3.5 w-3.5" />
                        {p.worstAccount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        p.status === "Ok" ? "bg-emerald-100 text-emerald-700" : 
                        p.status === "Atenção Estoque" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700">
                        {p.action}
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

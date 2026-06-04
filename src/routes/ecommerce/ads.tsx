import { createFileRoute } from "@tanstack/react-router";
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  MousePointer2, 
  ShoppingCart, 
  BarChart3, 
  BrainCircuit,
  ArrowRight
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/ecommerce/ads")({
  component: AdsInteligente,
  head: () => ({
    meta: [{ title: "Ads Inteligente | Agente Comercial 360" }],
  }),
});

function AdsInteligente() {
  const kpis = [
    { label: "Investimento", value: "R$ 12.400", icon: DollarSign, color: "bg-yellow-50 text-yellow-600" },
    { label: "Receita via Ads", value: "R$ 85.600", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
    { label: "ROAS", value: "6.9", icon: BarChart3, color: "bg-blue-50 text-blue-600" },
    { label: "ACOS", value: "14.5%", icon: Zap, color: "bg-amber-50 text-amber-600" },
    { label: "TACoS", value: "8.7%", icon: Activity, color: "bg-orange-50 text-orange-600" },
    { label: "Cliques", value: "45.200", icon: MousePointer2, color: "bg-indigo-50 text-indigo-600" },
    { label: "Vendas via Ads", value: "580", icon: ShoppingCart, color: "bg-violet-50 text-violet-600" },
    { label: "Dependentes de Ads", value: "65%", icon: BrainCircuit, color: "bg-rose-50 text-rose-600" },
  ];

  const campaigns = [
    { name: "Peças Motor - Performance", product: "Vários", account: "Chaleur Brasil", spend: "R$ 4.500", revenue: "R$ 32.000", roas: 7.1, acos: "14.1%", tacos: "8.2%", status: "Eficiente", action: "Aumentar orçamento" },
    { name: "Kit Embreagem LUK", product: "KE-LUK-200", account: "RACER", spend: "R$ 1.200", revenue: "R$ 4.500", roas: 3.7, acos: "27.0%", tacos: "15.5%", status: "Atenção", action: "Revisar palavras-chave" },
    { name: "Amortecedores Monroe", product: "AM-MON-TR", account: "Chaleur Brasil", spend: "R$ 2.800", revenue: "R$ 18.200", roas: 6.5, acos: "15.4%", tacos: "9.1%", status: "Eficiente", action: "Manter" },
    { name: "Pastilhas Cerâmica", product: "PF-CER-102", account: "Conta 3", spend: "R$ 850", revenue: "R$ 1.200", roas: 1.4, acos: "71.0%", tacos: "25.0%", status: "Ineficiente", action: "Pausar campanha" },
    { name: "Óleos Sintéticos", product: "OL-5W30-SN", account: "RACER", spend: "R$ 3.050", revenue: "R$ 29.700", roas: 9.7, acos: "10.3%", tacos: "5.4%", status: "Excelente", action: "Escalar investimento" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excelente": return "bg-emerald-100 text-emerald-700";
      case "Eficiente": return "bg-blue-100 text-blue-700";
      case "Atenção": return "bg-amber-100 text-amber-700";
      case "Ineficiente": return "bg-rose-100 text-rose-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ads Inteligente</h1>
          <p className="text-slate-500">Otimização de campanhas publicitárias baseada em inteligência de dados.</p>
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
                  <th className="px-6 py-4 font-semibold text-slate-900">Campanha / Produto</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Conta</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Investimento</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Receita</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">ROAS</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">ACOS</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Status IA</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Ação Sugerida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{c.name}</span>
                        <span className="text-[11px] uppercase tracking-wider text-slate-500">{c.product}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{c.account}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{c.spend}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{c.revenue}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{c.roas}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{c.acos}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700">
                        {c.action}
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

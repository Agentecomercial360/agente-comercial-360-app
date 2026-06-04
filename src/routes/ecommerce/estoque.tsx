import { createFileRoute } from "@tanstack/react-router";
import { 
  Boxes, 
  AlertTriangle, 
  ShieldAlert, 
  DollarSign, 
  TrendingDown,
  ArrowRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/ecommerce/estoque")({
  component: EstoqueUnificado,
  head: () => ({
    meta: [{ title: "Estoque Unificado | Agente Comercial 360" }],
  }),
});

function EstoqueUnificado() {
  const kpis = [
    { label: "Estoque total", value: "15.420 un", icon: Boxes, color: "bg-blue-50 text-blue-600" },
    { label: "Produtos com estoque parado", value: "45", icon: ShieldAlert, color: "bg-rose-50 text-rose-600" },
    { label: "Risco de ruptura", value: "12", icon: AlertTriangle, color: "bg-amber-50 text-amber-600" },
    { label: "Valor estimado parado", value: "R$ 82.500", icon: DollarSign, color: "bg-slate-50 text-slate-600" },
    { label: "Alto estoque / Baixa venda", value: "28", icon: TrendingDown, color: "bg-orange-50 text-orange-600" },
  ];

  const products = [
    { name: "Pastilha de Freio Cerâmica", sku: "PF-CER-102", totalStock: 150, sales30d: 8, coverage: "18 meses", daysNoSale: 12, status: "Estoque Excedente", action: "Criar promoção relâmpago" },
    { name: "Kit Embreagem LUK", sku: "KE-LUK-200", totalStock: 5, sales30d: 45, coverage: "3 dias", daysNoSale: 0, status: "Risco de Ruptura", action: "Repor estoque imediato" },
    { name: "Amortecedor Monroe Traseiro", sku: "AM-MON-TR", totalStock: 80, sales30d: 2, coverage: "40 meses", daysNoSale: 35, status: "Estoque Parado", action: "Revisar precificação" },
    { name: "Óleo Motor 5W30 Sintético", sku: "OL-5W30-SN", totalStock: 250, sales30d: 320, coverage: "24 dias", daysNoSale: 0, status: "Saudável", action: "Programar compra" },
    { name: "Bateria Moura 60Ah", sku: "BT-MO-60", totalStock: 42, sales30d: 38, coverage: "33 dias", daysNoSale: 1, status: "Saudável", action: "Manter" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Saudável": return "bg-emerald-100 text-emerald-700";
      case "Estoque Excedente": return "bg-amber-100 text-amber-700";
      case "Estoque Parado": return "bg-rose-100 text-rose-700";
      case "Risco de Ruptura": return "bg-rose-100 text-rose-700 font-bold animate-pulse";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Estoque Unificado</h1>
          <p className="text-slate-500">Controle global de estoque e cobertura de vendas entre todas as contas.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
              <div className={`w-fit rounded-xl p-2.5 ${kpi.color} ring-1 ring-inset ring-black/5`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{kpi.label}</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
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
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Vendas 30d</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Cobertura</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Dias sem venda</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
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
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{p.totalStock}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">
                      <div className="flex items-center justify-center gap-1.5">
                        {p.sales30d > 50 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
                        {p.sales30d}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{p.coverage}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {p.daysNoSale}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusColor(p.status)}`}>
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

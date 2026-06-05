import { createFileRoute } from "@tanstack/react-router";
import { 
  ShieldAlert, 
  Search, 
  Zap, 
  Boxes, 
  TrendingDown, 
  MessageSquare, 
  ArrowRight,
  Filter
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/produtos-travados")({
  component: ProdutosTravados,
  head: () => ({
    meta: [{ title: "Produtos Travados | Agente Comercial 360" }],
  }),
});

function ProdutosTravados() {
  const filters = [
    { label: "Sem venda há 7 dias", count: 42 },
    { label: "Sem venda há 15 dias", count: 28 },
    { label: "Sem venda há 30 dias", count: 15 },
    { label: "Sem venda há 60 dias", count: 8 },
    { label: "Sem venda há 90 dias", count: 5 },
    { label: "Com visita e sem venda", count: 12 },
    { label: "Sem visita", count: 18 },
    { label: "Ads gastando e não vendendo", count: 7 },
    { label: "Com estoque parado", count: 22 },
  ];

  const products = [
    {
      name: "Pastilha de Freio Cerâmica",
      sku: "PF-CER-102",
      account: "Chaleur Brasil",
      stock: 45,
      lastSale: "12 dias atrás",
      visits: 850,
      conversion: "0%",
      revenue30d: "R$ 0",
      adsSpend: "R$ 450",
      status: "Visita sem conversão",
      recommendation: "Revisar preço",
    },
    {
      name: "Kit Embreagem LUK",
      sku: "KE-LUK-200",
      account: "RACER",
      stock: 12,
      lastSale: "35 dias atrás",
      visits: 42,
      conversion: "0%",
      revenue30d: "R$ 0",
      adsSpend: "R$ 120",
      status: "Sem visita",
      recommendation: "Revisar título",
    },
    {
      name: "Amortecedor Monroe Traseiro",
      sku: "AM-MON-TR",
      account: "Chaleur Brasil",
      stock: 80,
      lastSale: "92 dias atrás",
      visits: 150,
      conversion: "0.6%",
      revenue30d: "R$ 320",
      adsSpend: "R$ 250",
      status: "Estoque parado",
      recommendation: "Criar kit",
    },
    {
      name: "Óleo Motor 5W30 Sintético",
      sku: "OL-5W30-SN",
      account: "Conta 3",
      stock: 150,
      lastSale: "5 dias atrás",
      visits: 2500,
      conversion: "0.1%",
      revenue30d: "R$ 1.200",
      adsSpend: "R$ 1.800",
      status: "Ads ineficiente",
      recommendation: "Ativar Ads",
    },
    {
      name: "Bateria Moura 60Ah",
      sku: "BT-MO-60",
      account: "RACER",
      stock: 25,
      lastSale: "2 dias atrás",
      visits: 4500,
      conversion: "1.2%",
      revenue30d: "R$ 15.400",
      adsSpend: "R$ 1.200",
      status: "Produto campeão em queda",
      recommendation: "Trocar imagem principal",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sem visita": return "bg-slate-100 text-slate-700";
      case "Visita sem conversão": return "bg-amber-100 text-amber-700";
      case "Estoque parado": return "bg-rose-100 text-rose-700";
      case "Ads ineficiente": return "bg-yellow-100 text-yellow-700";
      case "Produto campeão em queda": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

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

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, i) => (
            <button
              key={i}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                i === 0 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {filter.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${i === 0 ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-900">Produto</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Estoque</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Visitas</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Conversão</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Receita 30d</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Investimento Ads</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Ação Recomendada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="text-[11px] uppercase tracking-wider text-slate-500">
                          {p.sku} • {p.account}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{p.stock}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{p.visits}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{p.conversion}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{p.revenue30d}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{p.adsSpend}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700">
                        {p.recommendation}
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
    </EcommerceLayout>
  );
}
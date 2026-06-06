import { createFileRoute } from "@tanstack/react-router";
import { 
  UserCog, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  TrendingUp, 
  Search, 
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/contas")({
  component: ContasML,
  head: () => ({
    meta: [{ title: "Contas Mercado Livre | Agente Comercial 360" }],
  }),
});

function ContasML() {
  const accounts = [
    { name: "Chaleur Brasil", status: "Ativa", revenue: "R$ 65.400", sales: 450, visits: 12500, conversion: "3.6%", products: 120, share: "45%", lastSync: "há 5 min" },
    { name: "RACER", status: "Ativa", revenue: "R$ 42.100", sales: 320, visits: 8200, conversion: "3.9%", products: 85, share: "29%", lastSync: "há 12 min" },
    { name: "Conta 3", status: "Ativa", revenue: "R$ 15.200", sales: 120, visits: 4500, conversion: "2.6%", products: 45, share: "11%", lastSync: "há 1h" },
    { name: "Conta 4", status: "Ativa", revenue: "R$ 12.000", sales: 95, visits: 3800, conversion: "2.5%", products: 60, share: "8%", lastSync: "há 2h" },
    { name: "Conta 5", status: "Atenção", revenue: "R$ 5.400", sales: 42, visits: 2100, conversion: "2.0%", products: 30, share: "4%", lastSync: "há 4h" },
    { name: "Conta 6", status: "Inativa", revenue: "R$ 2.400", sales: 15, visits: 850, conversion: "1.7%", products: 15, share: "2%", lastSync: "há 1 dia" },
    { name: "Conta 7", status: "Ativa", revenue: "R$ 1.200", sales: 8, visits: 420, conversion: "1.9%", products: 10, share: "1%", lastSync: "há 2h" },
  ];

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
          <p className="text-sm font-semibold text-amber-900">Contas demonstrativas de implantação</p>
          <p className="mt-1 text-xs text-amber-800/90">
            Estas contas são usadas para validação inicial do painel. As contas reais do cliente serão conectadas após coleta dos acessos e autorização das integrações.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Contas Mercado Livre</h1>
            <p className="text-slate-500">Contas cadastradas para teste no ambiente de implantação.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all">
            Conectar nova conta
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {accounts.slice(0, 4).map((acc, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-50 p-1.5 ring-1 ring-blue-100">
                    <UserCog className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">{acc.name}</h3>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  acc.status === "Ativa" ? "bg-emerald-100 text-emerald-700" : 
                  acc.status === "Atenção" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                }`}>
                  {acc.status === "Ativa" ? <CheckCircle2 className="h-3 w-3" /> : acc.status === "Atenção" ? <Activity className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {acc.status}
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Faturamento</p>
                  <p className="text-lg font-bold text-slate-900">{acc.revenue}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Conversão</p>
                  <p className="text-lg font-bold text-slate-900">{acc.conversion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-900">Conta</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Vendas 30d</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Visitas</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Produtos</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-center">Participação</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Última Sincronização</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {acc.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{acc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{acc.sales}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{acc.visits}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{acc.products}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: acc.share }} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">{acc.share}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <RefreshCw className="h-3 w-3" />
                        {acc.lastSync}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition-colors">
                        <ArrowRight className="h-4 w-4 text-slate-400" />
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
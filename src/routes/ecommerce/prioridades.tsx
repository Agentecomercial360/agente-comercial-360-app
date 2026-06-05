import { createFileRoute } from "@tanstack/react-router";
import { 
  TrendingUp, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  Flame,
  Zap,
  Target
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/prioridades")({
  component: PrioridadesEcommerce,
  head: () => ({
    meta: [{ title: "Prioridades E-commerce | Agente Comercial 360" }],
  }),
});

function PrioridadeCard({ product, account, problem, cause, recommendation, impact, priority }: any) {
  const priorityStyles: any = {
    alta: "border-rose-200 bg-rose-50/50",
    media: "border-amber-200 bg-amber-50/50",
    baixa: "border-blue-200 bg-blue-50/50"
  };

  const priorityBadge: any = {
    alta: "bg-rose-500",
    media: "bg-amber-500",
    baixa: "bg-blue-500"
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${priorityStyles[priority]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{account}</span>
        <span className={`h-2 w-2 rounded-full ${priorityBadge[priority]}`} />
      </div>
      <h3 className="mt-2 font-bold text-slate-900">{product}</h3>
      
      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Problema</p>
          <p className="text-sm text-slate-700 font-medium">{problem}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Causa provável</p>
          <p className="text-xs text-slate-600 italic">"{cause}"</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 border border-white/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Recomendação IA</p>
          <p className="text-sm text-slate-900 font-bold">{recommendation}</p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
          <TrendingUp className="h-3.5 w-3.5" />
          <span className="text-[11px] uppercase tracking-wider">Impacto: {impact}</span>
        </div>
      </div>
      
      <button className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
        Resolver agora
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function PrioridadesEcommerce() {
  const columns = [
    {
      id: "alta",
      label: "Alta Prioridade",
      icon: Flame,
      color: "text-rose-600",
      bg: "bg-rose-50",
      items: [
        { product: "Pastilha de Freio Cerâmica", account: "Chaleur Brasil", problem: "Vendas zeradas há 12 dias com 850 visitas", cause: "Preço 15% acima do principal concorrente na conta", recommendation: "Reduzir preço para R$ 189,90 temporariamente", impact: "Aumento de 200% em vendas", priority: "alta" },
        { product: "Kit Embreagem LUK", account: "RACER", problem: "Ads gastando R$ 120/dia sem nenhuma conversão", cause: "Palavras-chave muito genéricas atraindo público errado", recommendation: "Negativar termos genéricos e focar em SKU específico", impact: "Economia de R$ 840/semana", priority: "alta" },
      ]
    },
    {
      id: "media",
      label: "Média Prioridade",
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50",
      items: [
        { product: "Amortecedor Monroe", account: "Chaleur Brasil", problem: "Perda de 3 posições no ranking orgânico", cause: "Aumento na taxa de reclamações por atraso", recommendation: "Oferecer cupom de desconto para novos compradores", impact: "Recuperação de ranking orgânico", priority: "media" },
        { product: "Bateria Moura 60Ah", account: "Conta 3", problem: "Estoque imobilizado há 45 dias", cause: "Título do anúncio pouco otimizado para busca", recommendation: "Reescrever título focando em compatibilidade", impact: "Giro de estoque em 15 dias", priority: "media" },
      ]
    },
    {
      id: "baixa",
      label: "Baixa Prioridade",
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-50",
      items: [
        { product: "Óleo 5W30 Sintético", account: "RACER", problem: "Performance levemente abaixo da média", cause: "Imagens secundárias com baixa resolução", recommendation: "Substituir kit de fotos do carrossel", impact: "Melhora de 0.2% na conversão", priority: "baixa" },
      ]
    }
  ];

  return (
    <EcommerceLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Painel de Prioridades</h1>
          <p className="text-slate-500">Ações recomendadas pela IA com base no impacto financeiro estimado.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {columns.map((col) => (
            <div key={col.id} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <div className={`rounded-lg ${col.bg} p-1.5`}>
                  <col.icon className={`h-5 w-5 ${col.color}`} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{col.label}</h2>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{col.items.length}</span>
              </div>
              <div className="space-y-4">
                {col.items.map((item, i) => (
                  <PrioridadeCard key={i} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </EcommerceLayout>
  );
}
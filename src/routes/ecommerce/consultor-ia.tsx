import { createFileRoute } from "@tanstack/react-router";
import { 
  BrainCircuit, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Zap,
  Image,
  Type,
  FileText,
  Plus,
  BarChart3
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/ecommerce/consultor-ia")({
  component: ConsultorIA,
  head: () => ({
    meta: [{ title: "Consultor IA E-commerce | Agente Comercial 360" }],
  }),
});

function ConsultorIA() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-3 shadow-lg shadow-blue-600/20">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Consultor IA E-commerce</h1>
            <p className="text-slate-500">Diagnóstico avançado e otimização de performance para seus anúncios.</p>
          </div>
        </div>

        {/* Search / Select Product */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Digite o SKU ou nome do produto para análise..." 
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              defaultValue="PF-CER-102 - Pastilha de Freio Cerâmica"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Diagnosis Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500 p-2 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Diagnóstico da IA</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                O produto apresenta uma <strong>taxa de conversão de 0%</strong> nos últimos 12 dias, apesar de ter recebido <strong>850 visitas</strong>. O volume de acessos é saudável, indicando que o anúncio tem boa visibilidade, mas o gargalo está no fechamento da venda (etapa de conversão).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">Causa Provável</h3>
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Análise de precificação em tempo real indica que seu anúncio está <strong>R$ 25,00 (15%) acima</strong> do preço médio praticado por vendedores com reputação Platinum para o mesmo SKU.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">Ação Recomendada</h3>
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Reduzir o preço para <strong>R$ 189,90</strong> durante os próximos 7 dias ou criar uma <strong>Oferta Relâmpago</strong> para estimular a conversão imediata e recuperar o relevância do anúncio.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">Otimização de Conteúdo</h3>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">
                  <Plus className="h-3.5 w-3.5" />
                  Criar tarefa
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sugestão de Título</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">Pastilha De Freio Cerâmica Dianteira Compatível Com Honda Civic 2012 A 2021 Original Jurid</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sugestão de Descrição (Resumo)</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Pastilha de freio de alta performance com tecnologia cerâmica. Reduz ruído e poeira nas rodas, proporcionando uma frenagem mais segura e duradoura. Compatibilidade garantida para modelos Honda Civic G9 e G10.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sugestão de Imagem Principal</span>
                  </div>
                  <p className="text-sm text-slate-700">
                    Utilizar foto com fundo branco absoluto (RGB 255,255,255) mostrando a pastilha em ângulo de 45 graus, evidenciando o selo de cerâmica e a marca.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Performance Column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Performance Atual</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Conversão</span>
                  <span className="text-sm font-bold text-rose-600">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Visitas (30d)</span>
                  <span className="text-sm font-bold text-slate-900">1.250</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Vendas (30d)</span>
                  <span className="text-sm font-bold text-slate-900">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Estoque</span>
                  <span className="text-sm font-bold text-slate-900">45 un</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Preço Atual</span>
                  <span className="text-sm font-bold text-slate-900">R$ 214,90</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Preço Concorrente</span>
                  <span className="text-sm font-bold text-emerald-600">R$ 189,90</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-slate-400" />
                <h3 className="font-bold text-slate-900">Impacto Estimado</h3>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-emerald-700">+200%</span>
                  <span className="text-xs font-medium text-emerald-600">em vendas</span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-600/80 leading-relaxed">
                  Com base no histórico de anúncios similares após ajuste de preço e título.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

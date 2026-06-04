import { createFileRoute } from "@tanstack/react-router";
import { 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Calendar,
  User,
  ArrowRight,
  Activity
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/ecommerce/tarefas")({
  component: TarefasEcommerce,
  head: () => ({
    meta: [{ title: "Tarefas Operacionais | Agente Comercial 360" }],
  }),
});

function TarefasEcommerce() {
  const tasks = [
    { id: 1, title: "Revisar preço Pastilha PF-CER-102", product: "Pastilha de Freio", account: "Chaleur Brasil", priority: "Alta", owner: "Ricardo", deadline: "Hoje", status: "Pendente", result: "Aumento de conversão" },
    { id: 2, title: "Negativar termos genéricos no Ads", product: "Kit Embreagem LUK", account: "RACER", priority: "Alta", owner: "Ana", deadline: "Hoje", status: "Em andamento", result: "Economia de orçamento" },
    { id: 3, title: "Substituir fotos secundárias", product: "Óleo 5W30", account: "RACER", priority: "Média", owner: "Lucas", deadline: "Amanhã", status: "Pendente", result: "Melhoria visual" },
    { id: 4, title: "Criar kit Amortecedor + Batente", product: "Amortecedor Monroe", account: "Chaleur Brasil", priority: "Média", owner: "Ricardo", deadline: "12/06", status: "Concluída", result: "Aumento de ticket médio" },
    { id: 5, title: "Responder reclamação atraso", product: "Vários", account: "Conta 5", priority: "Alta", owner: "Ana", deadline: "Imediato", status: "Em andamento", result: "Proteção de reputação" },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pendente": return "bg-slate-100 text-slate-600";
      case "Em andamento": return "bg-blue-100 text-blue-700";
      case "Concluída": return "bg-emerald-100 text-emerald-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Alta": return "text-rose-600 font-bold";
      case "Média": return "text-amber-600 font-bold";
      case "Baixa": return "text-blue-600 font-bold";
      default: return "text-slate-600";
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tarefas Operacionais</h1>
            <p className="text-slate-500">Gestão de atividades geradas pela inteligência e pela equipe.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all">
            <ListTodo className="h-4 w-4" />
            Nova tarefa
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="rounded-xl bg-slate-100 p-2.5">
              <Clock className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pendentes</p>
              <p className="text-xl font-bold text-slate-900">12</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-500">Em curso</p>
              <p className="text-xl font-bold text-slate-900">5</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4 shadow-sm">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Concluídas</p>
              <p className="text-xl font-bold text-slate-900">142</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-900">Tarefa</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Contexto</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Prioridade</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Responsável</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Prazo</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Resultado Esperado</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{t.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-700">{t.product}</span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500">{t.account}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs ${getPriorityStyle(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="h-3 w-3 text-slate-500" />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{t.owner}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{t.deadline}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusStyle(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-emerald-600">{t.result}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 transition-colors">
                        <MoreVertical className="h-4 w-4 text-slate-400" />
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

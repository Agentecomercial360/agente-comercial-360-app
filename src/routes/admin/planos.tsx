import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/planos")({
  component: AdminPlanos,
});

function AdminPlanos() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Planos & Assinaturas</h1>
          <p className="mt-2 text-sm text-slate-600">
            Gestão comercial do AC360. Os indicadores financeiros só serão exibidos
            depois da integração com a fonte oficial de cobrança.
          </p>
        </div>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6" role="status">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-lg font-bold text-amber-950">Cobrança ainda não integrada</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Esta área não possui uma integração de assinaturas confirmada.
                Nenhuma receita, plano ativo, inadimplência ou vencimento é calculado
                nesta tela. Os dados demonstrativos anteriores foram removidos para
                evitar decisões comerciais baseadas em valores fictícios.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <CreditCard className="h-7 w-7 text-blue-700" />
            <h2 className="mt-4 font-bold text-slate-900">Próxima integração</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Conectar um provedor de pagamentos para receber eventos verificados
              de assinatura, vencimento, pagamento, cancelamento e inadimplência.
            </p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <ShieldCheck className="h-7 w-7 text-blue-700" />
            <h2 className="mt-4 font-bold text-slate-900">Acesso por assinatura</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Antes de liberar planos pagos, validar no servidor as permissões por
              empresa e uma política de bloqueio e reativação, sem depender de
              controles no navegador.
            </p>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

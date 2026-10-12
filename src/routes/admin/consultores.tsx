import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { BriefcaseBusiness, Users, CalendarDays, ClipboardList, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/admin/consultores")({
  component: AdminConsultores,
  head: () => ({ meta: [{ title: "Consultores | AC360 Admin" }] }),
});

type Consultant = {
  id: string;
  user_id: string;
  display_name: string;
  email: string | null;
  status: "active" | "inactive";
  capacity: number;
};
type Assignment = {
  id: string;
  consultant_id: string;
  company_id: string;
  company_display_name: string;
  role: "lead" | "support";
  active: boolean;
};
type Company = { id: string; name: string };

function AdminConsultores() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consultantId, setConsultantId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setError(null);
    const [consultantsResult, assignmentsResult, companiesResult] = await Promise.all([
      supabase.from("ac360_consultants").select("id,user_id,display_name,email,status,capacity").order("display_name"),
      supabase.from("ac360_consultant_assignments").select("id,consultant_id,company_id,company_display_name,role,active").eq("active", true),
      supabase.rpc("ac360_admin_ecommerce_company_directory"),
    ]);
    if (consultantsResult.error || assignmentsResult.error || companiesResult.error) {
      setError(
        consultantsResult.error?.message ||
        assignmentsResult.error?.message ||
        companiesResult.error?.message ||
        "Não foi possível carregar o cadastro."
      );
    } else {
      setConsultants((consultantsResult.data ?? []) as Consultant[]);
      setAssignments((assignmentsResult.data ?? []) as Assignment[]);
      setCompanies((companiesResult.data ?? []) as Company[]);
    }
    setLoading(false);
  }

  useEffect(() => { void reload(); }, []);

  const leadAssignments = useMemo(
    () => assignments.filter((a) => a.role === "lead"),
    [assignments],
  );
  const activeConsultants = useMemo(() => consultants.filter((c) => c.status === "active"), [consultants]);
  const validUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId.trim());
  const unassigned = useMemo(
    () => companies.filter((c) => !leadAssignments.some((a) => a.company_id === c.id)),
    [companies, leadAssignments],
  );

  async function lookupAccount() {
    const requestedEmail = email.trim();
    if (!requestedEmail || lookupBusy || saving) return;
    setLookupBusy(true);
    setError(null);
    setNotice(null);
    setUserId("");
    try {
      const { data, error: lookupError } = await supabase.rpc("ac360_admin_lookup_existing_user", { p_email: requestedEmail });
      if (lookupError) throw lookupError;
      if (!data?.length) {
        setError("Conta não encontrada. Crie o acesso AC360 antes de cadastrar o consultor.");
        return;
      }
      setUserId(data[0].user_id);
      setNotice("Conta localizada. Confira os dados e conclua o cadastro.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao localizar a conta.");
    } finally {
      setLookupBusy(false);
    }
  }

  async function registerConsultant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(null);
    setError(null);
    setSaving(true);
    const { data: createdConsultant, error: insertError } = await supabase.from("ac360_consultants").insert({
      user_id: userId.trim(),
      display_name: name.trim(),
      email: email.trim() || null,
    }).select("id");
    if (insertError || createdConsultant?.length !== 1) setError(insertError?.message ?? "Não foi possível confirmar o cadastro do consultor.");
    else {
      setUserId(""); setName(""); setEmail("");
      setNotice("Consultor cadastrado. Agora você pode atribuir uma empresa.");
      await reload();
    }
    setSaving(false);
  }

  async function assignCompany(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(null);
    setError(null);
    setSaving(true);
    const { data: createdAssignment, error: insertError } = await supabase.from("ac360_consultant_assignments").insert({
      consultant_id: consultantId,
      company_id: companyId,
      company_display_name: companies.find((c) => c.id === companyId)?.name ?? "",
      role: "lead",
    }).select("id");
    if (insertError || createdAssignment?.length !== 1) setError(insertError?.message ?? "Não foi possível confirmar a atribuição da empresa.");
    else {
      setCompanyId(""); setConsultantId("");
      setNotice("Empresa atribuída ao consultor.");
      await reload();
    }
    setSaving(false);
  }

  async function changeConsultantStatus(c: Consultant) {
    const nextStatus = c.status === "active" ? "inactive" : "active";
    if (saving || !window.confirm(nextStatus === "inactive"
      ? `Desativar ${c.display_name}? O acesso às carteiras será bloqueado imediatamente.`
      : `Reativar o acesso de ${c.display_name}? As atribuições encerradas continuarão encerradas.`)) return;
    setSaving(true); setError(null); setNotice(null);
    try {
      const { data, error: updateError } = await supabase.from("ac360_consultants")
        .update({ status: nextStatus }).eq("id", c.id).eq("status", c.status).select("id");
      if (updateError) throw updateError;
      if (!data?.length) throw new Error("Cadastro alterado por outra operação. Atualize a lista.");
      await reload();
      setNotice(nextStatus === "inactive" ? "Consultor desativado e acesso às carteiras suspenso." : "Consultor reativado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível alterar o status.");
    } finally { setSaving(false); }
  }

  async function finishAssignment(a: Assignment) {
    if (saving || !window.confirm(`Encerrar o atendimento de ${a.company_display_name}? A carteira deixa de aparecer para o consultor atual; o histórico permanece.`)) return;
    setSaving(true); setError(null); setNotice(null);
    try {
      const { data, error: changeError } = await supabase
        .from("ac360_consultant_assignments")
        .update({ active: false, ended_at: new Date().toISOString() })
        .eq("id", a.id).eq("active", true).select("id");
      if (changeError) throw changeError;
      if (!data?.length) throw new Error("Atribuição já foi alterada. Atualize a página.");
      await reload();
      setNotice("Vínculo encerrado. A empresa já pode ser atribuída a outro consultor.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao encerrar o vínculo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Equipe de consultores</h1>
            <p className="mt-1 text-sm text-slate-600">
              Organize as carteiras de clientes e acompanhe a capacidade de atendimento da equipe.
            </p>
          </div>
          <button type="button" onClick={() => void reload()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium" disabled={loading}>
            <RefreshCcw className="h-4 w-4" /> Atualizar
          </button>
        </div>
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error.includes("ac360_consultants") ? "A estrutura multi-consultor ainda não foi aplicada ao banco de homologação. " : ""}{error}
        </div>}
        {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
        <div className="grid gap-4 sm:grid-cols-3">
          <Summary icon={<Users />} label="Consultores ativos" value={consultants.filter((c) => c.status === "active").length} />
          <Summary icon={<BriefcaseBusiness />} label="Empresas atribuídas" value={leadAssignments.length} />
          <Summary icon={<ClipboardList />} label="Empresas sem responsável" value={unassigned.length} />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Cadastrar consultor</h2>
            <p className="mt-1 text-xs text-slate-500">O profissional precisa ter uma conta AC360 existente. Localize pelo e-mail, sem copiar o UUID ou informar a senha.</p>
            <form className="mt-4 space-y-3" onSubmit={(e) => void registerConsultant(e)}>
              <label className="block text-sm font-medium text-slate-700">Conta localizada<input readOnly value={userId} required placeholder="Localize a conta pelo e-mail" className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-slate-100 p-2 text-xs" /></label>
              {userId.trim() && !validUserId && <p className="text-xs text-amber-700">Informe um UUID válido da conta AC360 do consultor.</p>}
              <Input label="Nome do consultor" value={name} set={setName} required />
              <Input label="E-mail da conta AC360" value={email} set={(next) => { setEmail(next); setUserId(""); }} required />
              <button type="button" disabled={lookupBusy || saving || !email.includes("@")} onClick={() => void lookupAccount()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">{lookupBusy ? "Localizando..." : "Localizar conta"}</button>
              <button disabled={saving || loading || !validUserId || name.trim().length < 2} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Cadastrar</button>
            </form>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Distribuir carteira</h2>
            <p className="mt-1 text-xs text-slate-500">Cada empresa pode ter um consultor principal ativo; outros papéis serão disponibilizados em etapas posteriores.</p>
            <form className="mt-4 space-y-3" onSubmit={(e) => void assignCompany(e)}>
              <label className="block text-sm font-medium">Consultor
                <select required value={consultantId} onChange={(e) => setConsultantId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2">
                  <option value="">Selecione</option>
                  {activeConsultants.map((c) => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Empresa de e-commerce sem consultor
                <select required value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2">
                  <option value="">Selecione</option>
                  {unassigned.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              {!loading && !activeConsultants.length && <p className="text-xs text-amber-700">Cadastre ou ative um consultor para distribuir clientes.</p>}
              {!loading && !unassigned.length && <p className="text-xs text-slate-600">Não há empresas de e-commerce disponíveis para uma nova atribuição.</p>}
              <button disabled={saving || loading || !consultantId || !companyId || activeConsultants.length === 0 || unassigned.length === 0} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Atribuir cliente</button>
            </form>
          </section>
        </div>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold">Carteira por consultor</h2>
            <p className="text-xs text-slate-500">Dados reais do cadastro. Nenhuma empresa ou sessão de exemplo é contabilizada.</p>
          </div>
          {loading ? <p className="p-5 text-sm text-slate-500">Carregando equipe…</p> :
          consultants.length === 0 ? <p className="p-5 text-sm text-slate-500">Nenhum consultor cadastrado ainda.</p> :
          <div className="divide-y divide-slate-100">
            {consultants.map((c) => {
              const assigned = leadAssignments.filter((a) => a.consultant_id === c.id);
              return <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div><p className="font-semibold text-slate-900">{c.display_name}</p><p className="text-xs text-slate-500">{c.email || "Sem e-mail cadastrado"} · {c.status === "active" ? "Ativo" : "Inativo"}</p>
                  <button type="button" disabled={saving} onClick={() => void changeConsultantStatus(c)} className="mt-2 rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold disabled:opacity-50">
                    {c.status === "active" ? "Desativar consultor" : "Reativar consultor"}
                  </button></div>
                <div className="text-right"><p className="text-sm font-semibold">{assigned.length} / {c.capacity} empresas</p>
                <div className="mt-2 flex flex-wrap justify-end gap-2">
                  {assigned.map((a) => <div key={a.id} className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1">
                    <span className="text-xs text-slate-600">{a.company_display_name}</span>
                    <button type="button" disabled={saving} onClick={() => void finishAssignment(a)} className="text-xs font-semibold text-rose-700 hover:underline disabled:opacity-50">Encerrar</button>
                  </div>)}
                  {!assigned.length && <span className="text-xs text-slate-500">Sem empresas atribuídas</span>}
                </div></div>
              </div>;
            })}
          </div>}
        </section>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays className="h-4 w-4" />
          Reuniões, planos de ação e tarefas estão disponíveis no módulo administrativo de Acompanhamento.
        </div>
      </div>
    </AdminLayout>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-xs font-medium">{label}</span></div>
    <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
  </div>;
}
function Input({ label, value, set, required = false }: {
  label: string; value: string; set: (value: string) => void; required?: boolean;
}) {
  return <label className="block text-sm font-medium text-slate-700">{label}
    <input required={required} value={value} onChange={(e) => set(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm" />
  </label>;
}

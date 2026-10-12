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
      supabase.from("companies").select("id,name").order("name"),
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
  const unassigned = useMemo(
    () => companies.filter((c) => !leadAssignments.some((a) => a.company_id === c.id)),
    [companies, leadAssignments],
  );

  async function registerConsultant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(null);
    setError(null);
    setSaving(true);
    const { error: insertError } = await supabase.from("ac360_consultants").insert({
      user_id: userId.trim(),
      display_name: name.trim(),
      email: email.trim() || null,
    });
    if (insertError) setError(insertError.message);
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
    const { error: insertError } = await supabase.from("ac360_consultant_assignments").insert({
      consultant_id: consultantId,
      company_id: companyId,
      company_display_name: companies.find((c) => c.id === companyId)?.name ?? "",
      role: "lead",
    });
    if (insertError) setError(insertError.message);
    else {
      setCompanyId(""); setConsultantId("");
      setNotice("Empresa atribuída ao consultor.");
      await reload();
    }
    setSaving(false);
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
            <p className="mt-1 text-xs text-slate-500">O profissional precisa ter uma conta AC360 existente; use o ID do usuário autenticado, não uma senha.</p>
            <form className="mt-4 space-y-3" onSubmit={(e) => void registerConsultant(e)}>
              <Input label="ID do usuário (UUID)" value={userId} set={setUserId} required />
              <Input label="Nome do consultor" value={name} set={setName} required />
              <Input label="E-mail (opcional)" value={email} set={setEmail} />
              <button disabled={saving || loading || !userId.trim() || name.trim().length < 2} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Cadastrar</button>
            </form>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Distribuir carteira</h2>
            <p className="mt-1 text-xs text-slate-500">Cada empresa pode ter um consultor principal ativo; outros papéis serão disponibilizados em etapas posteriores.</p>
            <form className="mt-4 space-y-3" onSubmit={(e) => void assignCompany(e)}>
              <label className="block text-sm font-medium">Consultor
                <select required value={consultantId} onChange={(e) => setConsultantId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2">
                  <option value="">Selecione</option>
                  {consultants.filter((c) => c.status === "active").map((c) => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Empresa ainda sem consultor
                <select required value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2">
                  <option value="">Selecione</option>
                  {unassigned.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <button disabled={saving || loading || !consultantId || !companyId} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Atribuir cliente</button>
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
                <div><p className="font-semibold text-slate-900">{c.display_name}</p><p className="text-xs text-slate-500">{c.email || "Sem e-mail cadastrado"} · {c.status === "active" ? "Ativo" : "Inativo"}</p></div>
                <div className="text-right"><p className="text-sm font-semibold">{assigned.length} / {c.capacity} empresas</p>
                <p className="text-xs text-slate-500">{assigned.map((a) => a.company_display_name).join(", ") || "Sem empresas atribuídas"}</p></div>
              </div>;
            })}
          </div>}
        </section>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays className="h-4 w-4" />
          Reuniões, planos de ação e tarefas já têm modelo de dados preparado; suas telas operacionais são a próxima etapa.
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

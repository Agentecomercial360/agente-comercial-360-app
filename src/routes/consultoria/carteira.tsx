import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { CalendarDays, ClipboardList, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/consultoria/carteira")({
  component: ConsultoriaCarteira,
  head: () => ({ meta: [{ title: "Minha carteira | AC360 Consultoria" }] }),
});
type Consultant = { id: string; display_name: string; status: string };
type Assignment = { id: string; company_id: string; role: string };
type Company = { id: string; name: string };
type Meeting = { id: string; assignment_id: string; scheduled_at: string; status: string };
type Plan = { id: string; assignment_id: string; title: string; status: string };
function ConsultoriaCarteira() {
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw new Error("Entre na sua conta AC360 para acessar a consultoria.");
        const { data: own, error: consultantError } = await supabase.from("ac360_consultants")
          .select("id,display_name,status").eq("user_id",userData.user.id).maybeSingle();
        if (consultantError) throw consultantError;
        if (!own || own.status !== "active") throw new Error("Seu cadastro de consultor não está ativo.");
        const { data: links, error: linksError } = await supabase.from("ac360_consultant_assignments")
          .select("id,company_id,role").eq("consultant_id",own.id).eq("active",true);
        if (linksError) throw linksError;
        const ids = (links ?? []).map((a) => a.id);
        const companyIds = (links ?? []).map((a) => a.company_id);
        const [companiesResult, meetingsResult, plansResult] = await Promise.all([
          companyIds.length ? supabase.from("companies").select("id,name").in("id",companyIds) : Promise.resolve({data: [],error:null}),
          ids.length ? supabase.from("ac360_consulting_sessions").select("id,assignment_id,scheduled_at,status").in("assignment_id",ids).order("scheduled_at",{ascending:true}).limit(100) : Promise.resolve({data: [],error:null}),
          ids.length ? supabase.from("ac360_consulting_plans").select("id,assignment_id,title,status").in("assignment_id",ids).limit(100) : Promise.resolve({data: [],error:null}),
        ]);
        const failure = companiesResult.error || meetingsResult.error || plansResult.error;
        if (failure) throw failure;
        if (!mounted) return;
        setConsultant(own as Consultant);
        setAssignments((links ?? []) as Assignment[]);
        setCompanies((companiesResult.data ?? []) as Company[]);
        setMeetings((meetingsResult.data ?? []) as Meeting[]);
        setPlans((plansResult.data ?? []) as Plan[]);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Não foi possível carregar a carteira.");
      } finally { if (mounted) setLoading(false); }
    }
    void load();
    return () => { mounted = false; };
  }, []);
  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "Empresa atribuída";
  return <main className="min-h-screen bg-slate-50 px-4 py-8">
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-2xl bg-slate-950 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">AC360 Consultoria</p>
        <h1 className="mt-2 text-2xl font-bold">Minha carteira de clientes</h1>
        <p className="mt-2 text-sm text-slate-300">{consultant ? `Consultor: ${consultant.display_name}` : "Acompanhamento estratégico"}</p>
      </header>
      {loading && <p role="status" className="text-sm text-slate-600">Verificando suas permissões…</p>}
      {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">{error}</div>}
      {!loading && !error && consultant && <>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat icon={<ShieldCheck />} label="Empresas atribuídas" value={assignments.length}/>
          <Stat icon={<CalendarDays />} label="Reuniões registradas" value={meetings.length}/>
          <Stat icon={<ClipboardList />} label="Planos de ação" value={plans.length}/>
        </div>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">Empresas sob acompanhamento</h2>
          {assignments.length===0 ? <p className="mt-3 text-sm text-slate-500">Nenhuma empresa atribuída. Solicite uma carteira ao administrador.</p> :
          <div className="mt-3 divide-y divide-slate-100">{assignments.map((a) => <div key={a.id} className="py-3">
            <p className="font-semibold">{companyName(a.company_id)}</p>
            <p className="text-xs text-slate-500">{a.role==="lead"?"Responsável principal":"Consultor de apoio"}</p>
            <p className="mt-1 text-xs text-slate-600">{meetings.filter((m)=>m.assignment_id===a.id).length} reuniões · {plans.filter((p)=>p.assignment_id===a.id).length} planos</p>
          </div>)}</div>}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">Próximas reuniões</h2>
          {meetings.filter((m)=>m.status==="scheduled" && new Date(m.scheduled_at).getTime()>=Date.now()).length===0 ?
            <p className="mt-2 text-sm text-slate-500">Nenhuma reunião futura agendada.</p> :
            <div className="mt-3 space-y-2">{meetings.filter((m)=>m.status==="scheduled" && new Date(m.scheduled_at).getTime()>=Date.now()).map((m)=><p key={m.id} className="text-sm">{new Date(m.scheduled_at).toLocaleString("pt-BR")} · {companyName(assignments.find((a)=>a.id===m.assignment_id)?.company_id ?? "")}</p>)}</div>}
        </section>
      </>}
    </div>
  </main>;
}
function Stat({icon,label,value}:{icon:React.ReactNode;label:string;value:number}) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center gap-2 text-sm text-slate-600">{icon}{label}</div>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </div>;
}

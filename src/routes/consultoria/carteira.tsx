import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { CalendarDays, ClipboardList, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/consultoria/carteira")({
  component: ConsultoriaCarteira,
  head: () => ({ meta: [{ title: "Minha carteira | AC360 Consultoria" }] }),
});
type Consultant = { id: string; display_name: string; status: string };
type Assignment = { id: string; company_id: string; company_display_name: string; role: string };
type Meeting = { id: string; assignment_id: string; scheduled_at: string; status: string };
type Plan = { id: string; assignment_id: string; title: string; status: string };
type Task = { id: string; plan_id: string; title: string; status: string; due_on: string | null };
function ConsultoriaCarteira() {
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [savingTask, setSavingTask] = useState<string | null>(null);
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
          .select("id,company_id,company_display_name,role").eq("consultant_id",own.id).eq("active",true);
        if (linksError) throw linksError;
        const ids = (links ?? []).map((a) => a.id);
        const [meetingsResult, plansResult] = await Promise.all([
          ids.length ? supabase.from("ac360_consulting_sessions").select("id,assignment_id,scheduled_at,status").in("assignment_id",ids).order("scheduled_at",{ascending:true}).limit(100) : Promise.resolve({data: [],error:null}),
          ids.length ? supabase.from("ac360_consulting_plans").select("id,assignment_id,title,status").in("assignment_id",ids).limit(100) : Promise.resolve({data: [],error:null}),
        ]);
        const failure = meetingsResult.error || plansResult.error;
        if (failure) throw failure;
        if (!mounted) return;
        setConsultant(own as Consultant);
        setAssignments((links ?? []) as Assignment[]);
        setMeetings((meetingsResult.data ?? []) as Meeting[]);
        const myPlans = (plansResult.data ?? []) as Plan[];
        const planIds = myPlans.map((p) => p.id);
        const taskResult = planIds.length ? await supabase.from("ac360_consulting_tasks").select("id,plan_id,title,status,due_on").in("plan_id",planIds).limit(500) : { data: [], error: null };
        if (taskResult.error) throw taskResult.error;
        setPlans(myPlans);
        setTasks((taskResult.data ?? []) as Task[]);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Não foi possível carregar a carteira.");
      } finally { if (mounted) setLoading(false); }
    }
    void load();
    return () => { mounted = false; };
  }, []);
  const companyName = (id: string) => assignments.find((a) => a.company_id === id)?.company_display_name ?? "Empresa atribuída";
  async function updateTask(task: Task, nextStatus: "pending" | "doing" | "done") {
    setSavingTask(task.id);
    setError(null);
    try {
      const { error: updateError } = await supabase.from("ac360_consulting_tasks")
        .update({ status: nextStatus }).eq("id", task.id);
      if (updateError) throw updateError;
      setTasks((current) => current.map((t) => t.id === task.id ? { ...t, status: nextStatus } : t));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível atualizar a tarefa.");
    } finally {
      setSavingTask(null);
    }
  }
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
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">Tarefas dos meus planos</h2>
          {tasks.length === 0 ? <p className="mt-2 text-sm text-slate-500">Nenhuma tarefa atribuída aos seus planos.</p> :
            <div className="mt-3 divide-y divide-slate-100">{tasks.map((task) => {
              const plan = plans.find((p) => p.id === task.plan_id);
              if (!plan) return null;
              return <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div><p className="text-sm font-semibold">{task.title}</p>
                  <p className="text-xs text-slate-500">{plan.title}{task.due_on ? ` · Prazo: ${new Date(task.due_on + "T12:00:00").toLocaleDateString("pt-BR")}` : ""}</p>
                </div>
                <select aria-label={`Situação: ${task.title}`} disabled={savingTask === task.id}
                  value={task.status}
                  onChange={(e) => void updateTask(task, e.target.value as "pending" | "doing" | "done")}
                  className="rounded-lg border border-slate-300 p-2 text-sm">
                  <option value="pending">Pendente</option><option value="doing">Em andamento</option><option value="done">Concluída</option>
                </select>
              </div>;
            })}</div>}
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

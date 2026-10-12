import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { CalendarDays, ClipboardCheck, ListTodo } from "lucide-react";

export const Route = createFileRoute("/admin/acompanhamento")({
  component: AdminAcompanhamento,
  head: () => ({ meta: [{ title: "Acompanhamento | AC360 Admin" }] }),
});

type Assignment = { id: string; company_id: string; consultant_id: string; active: boolean };
type Consultant = { id: string; display_name: string };
type Company = { id: string; name: string };
type Session = { id: string; assignment_id: string; scheduled_at: string; duration_minutes: number; status: string; summary: string | null };
type Plan = { id: string; assignment_id: string; title: string; objective: string | null; period_start: string; period_end: string | null; status: string };
type Task = { id: string; plan_id: string; title: string; status: string; due_on: string | null };

function AdminAcompanhamento() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("45");
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    const results = await Promise.all([
      supabase.from("ac360_consultant_assignments").select("id,company_id,consultant_id,active").eq("active", true),
      supabase.from("ac360_consultants").select("id,display_name"),
      supabase.from("companies").select("id,name"),
      supabase.from("ac360_consulting_sessions").select("id,assignment_id,scheduled_at,duration_minutes,status,summary").order("scheduled_at", { ascending: false }).limit(200),
      supabase.from("ac360_consulting_plans").select("id,assignment_id,title,objective,period_start,period_end,status").order("created_at", { ascending: false }).limit(200),
      supabase.from("ac360_consulting_tasks").select("id,plan_id,title,status,due_on").limit(1000),
    ]);
    const failure = results.find((r) => r.error)?.error;
    if (failure) setError(failure.message);
    else {
      setAssignments((results[0].data ?? []) as Assignment[]);
      setConsultants((results[1].data ?? []) as Consultant[]);
      setCompanies((results[2].data ?? []) as Company[]);
      setSessions((results[3].data ?? []) as Session[]);
      setPlans((results[4].data ?? []) as Plan[]);
      setTasks((results[5].data ?? []) as Task[]);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);
  const byId = useMemo(() => new Map(assignments.map((a) => [a.id, a])), [assignments]);
  function owner(aid: string) {
    const a = byId.get(aid);
    if (!a) return "Carteira não encontrada";
    return `${companies.find((c) => c.id === a.company_id)?.name ?? "Empresa"} · ${consultants.find((c) => c.id === a.consultant_id)?.display_name ?? "Consultor"}`;
  }

  async function createMeeting(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setMessage(null);
    if (!assignmentId || !date) return;
    setSaving(true);
    const { error: insertError } = await supabase.from("ac360_consulting_sessions").insert({
      assignment_id: assignmentId, scheduled_at: new Date(date).toISOString(), duration_minutes: Number(duration),
    });
    if (insertError) setError(insertError.message);
    else { setDate(""); setMessage("Reunião registrada."); await load(); }
    setSaving(false);
  }

  async function createPlan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setMessage(null);
    if (!assignmentId || title.trim().length < 2) return;
    setSaving(true);
    const { error: insertError } = await supabase.from("ac360_consulting_plans").insert({
      assignment_id: assignmentId, title: title.trim(), objective: objective.trim() || null, status: "draft",
    });
    if (insertError) setError(insertError.message);
    else { setTitle(""); setObjective(""); setMessage("Plano de ação criado como rascunho."); await load(); }
    setSaving(false);
  }

  return <AdminLayout><div className="mx-auto max-w-6xl space-y-6">
    <header><h1 className="text-2xl font-bold text-slate-900">Central de acompanhamento</h1>
      <p className="mt-1 text-sm text-slate-600">Reuniões, planos de ação e execução da carteira de consultoria.</p></header>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    <div className="grid gap-3 sm:grid-cols-3">
      <Kpi icon={<CalendarDays />} name="Reuniões registradas" value={sessions.length} />
      <Kpi icon={<ClipboardCheck />} name="Planos de ação" value={plans.length} />
      <Kpi icon={<ListTodo />} name="Tarefas pendentes" value={tasks.filter((t) => t.status === "pending" || t.status === "doing").length} />
    </div>
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <label className="block text-sm font-medium text-slate-700">Carteira para novos registros
        <select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 p-2">
          <option value="">Selecione uma carteira ativa</option>
          {assignments.map((a) => <option key={a.id} value={a.id}>{owner(a.id)}</option>)}
        </select>
      </label>
    </section>
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={(e) => void createMeeting(e)} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">Agendar reunião</h2>
        <label className="block text-sm">Data e horário<input required type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>
        <label className="block text-sm">Duração<select value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 w-full rounded-lg border p-2">
          <option value="30">30 minutos</option><option value="45">45 minutos</option><option value="60">60 minutos</option><option value="90">90 minutos</option>
        </select></label>
        <button disabled={!assignmentId || !date || saving || loading} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Registrar reunião</button>
      </form>
      <form onSubmit={(e) => void createPlan(e)} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">Criar plano de ação</h2>
        <label className="block text-sm">Título<input required minLength={2} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>
        <label className="block text-sm">Objetivo<textarea value={objective} onChange={(e) => setObjective(e.target.value)} className="mt-1 w-full rounded-lg border p-2" rows={2}/></label>
        <button disabled={!assignmentId || title.trim().length < 2 || saving || loading} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Criar rascunho</button>
      </form>
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="mb-4 font-bold">Próximas reuniões e histórico</h2>
        {loading ? <p className="text-sm text-slate-500">Carregando…</p> : sessions.length ? <div className="space-y-3">{sessions.map((s) => <div key={s.id} className="border-b border-slate-100 pb-3 text-sm">
          <p className="font-semibold">{new Date(s.scheduled_at).toLocaleString("pt-BR")} · {s.duration_minutes} min</p>
          <p className="text-slate-600">{owner(s.assignment_id)}</p><p className="text-xs text-slate-500">Status: {s.status}</p>
        </div>)}</div> : <p className="text-sm text-slate-500">Nenhuma reunião registrada.</p>}
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="mb-4 font-bold">Planos de ação</h2>
        {loading ? <p className="text-sm text-slate-500">Carregando…</p> : plans.length ? <div className="space-y-3">{plans.map((p) => {
          const associated = tasks.filter((t) => t.plan_id === p.id);
          return <div key={p.id} className="border-b border-slate-100 pb-3 text-sm">
            <p className="font-semibold">{p.title}</p><p className="text-xs text-slate-500">{owner(p.assignment_id)} · {p.status}</p>
            <p className="mt-1 text-slate-600">{associated.filter((t) => t.status === "done").length}/{associated.length} tarefas concluídas</p>
          </div>;
        })}</div> : <p className="text-sm text-slate-500">Nenhum plano registrado.</p>}
      </section>
    </div>
    <p className="text-xs text-slate-500">Os indicadores exibem até 200 registros recentes por categoria. Dados de teste não são gerados automaticamente.</p>
  </div></AdminLayout>;
}
function Kpi({ icon, name, value }: { icon: React.ReactNode; name: string; value: number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-xs">{name}</span></div>
    <div className="mt-2 text-2xl font-bold">{value}</div>
  </div>;
}

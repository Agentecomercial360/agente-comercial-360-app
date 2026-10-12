import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { CalendarDays, ClipboardCheck, ListTodo } from "lucide-react";

export const Route = createFileRoute("/admin/acompanhamento")({
  component: AdminAcompanhamento,
  head: () => ({ meta: [{ title: "Acompanhamento | AC360 Admin" }] }),
});

type Assignment = { id: string; company_id: string; company_display_name: string; consultant_id: string; active: boolean };
type Consultant = { id: string; display_name: string };
type Session = { id: string; assignment_id: string; scheduled_at: string; duration_minutes: number; status: string; summary: string | null };
type Plan = { id: string; assignment_id: string; title: string; objective: string | null; period_start: string; period_end: string | null; status: string };
type Task = { id: string; plan_id: string; title: string; status: string; due_on: string | null };

function AdminAcompanhamento() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("45");
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [meetingSummary, setMeetingSummary] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    const results = await Promise.all([
      supabase.from("ac360_consultant_assignments").select("id,company_id,company_display_name,consultant_id,active").eq("active", true),
      supabase.from("ac360_consultants").select("id,display_name"),
      supabase.from("ac360_consulting_sessions").select("id,assignment_id,scheduled_at,duration_minutes,status,summary").order("scheduled_at", { ascending: false }).limit(200),
      supabase.from("ac360_consulting_plans").select("id,assignment_id,title,objective,period_start,period_end,status").order("created_at", { ascending: false }).limit(200),
      supabase.from("ac360_consulting_tasks").select("id,plan_id,title,status,due_on").limit(1000),
    ]);
    const failure = results.find((r) => r.error)?.error;
    if (failure) setError(failure.message);
    else {
      setAssignments((results[0].data ?? []) as Assignment[]);
      setConsultants((results[1].data ?? []) as Consultant[]);
      setSessions((results[2].data ?? []) as Session[]);
      setPlans((results[3].data ?? []) as Plan[]);
      setTasks((results[4].data ?? []) as Task[]);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);
  const byId = useMemo(() => new Map(assignments.map((a) => [a.id, a])), [assignments]);
  function owner(aid: string) {
    const a = byId.get(aid);
    if (!a) return "Carteira não encontrada";
    return `${a.company_display_name || "Empresa"} · ${consultants.find((c) => c.id === a.consultant_id)?.display_name ?? "Consultor"}`;
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

  async function finishMeeting(meeting: Session) {
    if (meetingSummary.trim().length < 10) {
      setError("Registre pelo menos 10 caracteres no resumo da reunião.");
      return;
    }
    setSaving(true);
    setError(null); setMessage(null);
    try {
      const { data: updatedMeeting, error: updateError } = await supabase.from("ac360_consulting_sessions")
        .update({ status: "completed", summary: meetingSummary.trim() })
        .eq("id", meeting.id).eq("status", "scheduled").select("id");
      if (updateError) throw updateError;
      if (updatedMeeting?.length !== 1) throw new Error("A reunião não foi alterada. Ela pode já ter sido concluída por outra pessoa.");
      setEditingMeetingId(null); setMeetingSummary("");
      await load();
      setMessage("Reunião concluída e resumo registrado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível concluir a reunião.");
    } finally { setSaving(false); }
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

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setMessage(null);
    if (!selectedPlanId || taskTitle.trim().length < 2) return;
    setSaving(true);
    try {
      const { error: insertError } = await supabase.from("ac360_consulting_tasks").insert({
        plan_id: selectedPlanId,
        title: taskTitle.trim(),
        due_on: taskDue || null,
        status: "pending",
      });
      if (insertError) throw insertError;
      setTaskTitle(""); setTaskDue("");
      await load();
      setMessage("Tarefa adicionada ao plano de ação.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar a tarefa.");
    } finally { setSaving(false); }
  }

  async function setTaskStatus(task: Task, status: "pending" | "doing" | "done") {
    setSaving(true); setError(null); setMessage(null);
    try {
      const { data: updatedTask, error: updateError } = await supabase.from("ac360_consulting_tasks")
        .update({ status }).eq("id", task.id).eq("status", task.status).select("id");
      if (updateError) throw updateError;
      if (updatedTask?.length !== 1) throw new Error("A tarefa não foi alterada. Seu status pode ter mudado; atualize os dados.");
      await load();
      setMessage("Progresso da tarefa atualizado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível atualizar a tarefa.");
    } finally { setSaving(false); }
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
          <p className="text-slate-600">{owner(s.assignment_id)}</p><p className="text-xs text-slate-500">Status: {s.status === "completed" ? "Concluída" : s.status === "cancelled" ? "Cancelada" : "Agendada"}</p>
          {s.summary && <p className="mt-1 text-xs text-slate-600">Resumo: {s.summary}</p>}
          {s.status === "scheduled" && editingMeetingId !== s.id && <button type="button" onClick={() => { setEditingMeetingId(s.id); setMeetingSummary(s.summary ?? ""); }} className="mt-2 rounded-md border border-slate-300 px-3 py-1 text-xs">Registrar conclusão</button>}
          {editingMeetingId === s.id && <div className="mt-2 space-y-2">
            <textarea value={meetingSummary} onChange={(e) => setMeetingSummary(e.target.value)}
              aria-label="Resumo da reunião" rows={3} maxLength={4000} className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              placeholder="Decisões, diagnóstico e próximos passos" />
            <button type="button" disabled={saving || meetingSummary.trim().length < 10} onClick={() => void finishMeeting(s)} className="rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Concluir reunião</button>
            <button type="button" onClick={() => { setEditingMeetingId(null); setMeetingSummary(""); }} className="ml-2 rounded-md border px-3 py-2 text-xs">Cancelar</button>
          </div>}
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
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold">Tarefas dos planos de ação</h2>
      <form onSubmit={(e) => void createTask(e)} className="grid gap-3 md:grid-cols-4">
        <label className="text-sm">Plano de ação
          <select required value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2">
            <option value="">Selecione um plano</option>
            {plans.filter((p) => p.status !== "cancelled" && p.status !== "completed").map((p) => <option key={p.id} value={p.id}>{p.title} — {owner(p.assignment_id)}</option>)}
          </select>
        </label>
        <label className="text-sm">Descrição da tarefa
          <input required minLength={2} value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2" />
        </label>
        <label className="text-sm">Prazo (opcional)
          <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2" />
        </label>
        <button disabled={saving || loading || !selectedPlanId || taskTitle.trim().length < 2} className="self-end rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Adicionar tarefa</button>
      </form>
      {loading ? <p className="text-sm text-slate-500">Carregando tarefas…</p> : tasks.length === 0 ? <p className="text-sm text-slate-500">Nenhuma tarefa registrada.</p> :
        <div className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const plan = plans.find((p) => p.id === task.plan_id);
            if (!plan) return null;
            return <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                <p className="text-xs text-slate-500">{plan.title}{task.due_on ? ` · Prazo: ${new Date(task.due_on + "T12:00:00").toLocaleDateString("pt-BR")}` : ""}</p>
              </div>
              <label className="text-xs text-slate-600">Status
                <select disabled={saving} value={task.status} onChange={(e) => void setTaskStatus(task, e.target.value as "pending" | "doing" | "done")} className="ml-2 rounded-lg border border-slate-300 p-2">
                  <option value="pending">Pendente</option>
                  <option value="doing">Em andamento</option>
                  <option value="done">Concluída</option>
                </select>
              </label>
            </div>;
          })}
        </div>}
    </section>
    <p className="text-xs text-slate-500">Os indicadores exibem até 200 registros recentes por categoria. Dados de teste não são gerados automaticamente.</p>
  </div></AdminLayout>;
}
function Kpi({ icon, name, value }: { icon: React.ReactNode; name: string; value: number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-xs">{name}</span></div>
    <div className="mt-2 text-2xl font-bold">{value}</div>
  </div>;
}

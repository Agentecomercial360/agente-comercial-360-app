import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Calendar,
  Search,
  Pencil,
  X,
  Loader2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flag,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/followups")({
  component: FollowupsPage,
  head: () => ({ meta: [{ title: "Retornos Comerciais | Agente Comercial 360" }] }),
});

type LoadStatus = "loading" | "loaded" | "empty" | "unauthenticated" | "error";

type Priority = "baixa" | "media" | "alta";

type Followup = {
  id: string;
  title: string | null;
  description: string | null;
  message: string | null;
  scheduled_at: string | null;
  status: string | null;
  priority: string | null;
  completed_at: string | null;
  lead_id: string | null;
  customer_id: string | null;
  responsible_id: string | null;
  customers?: { name: string | null } | null;
  leads?: { interest: string | null } | null;
  responsibles?: { name: string | null } | null;
};

type Lead = { id: string; interest: string | null };
type Customer = { id: string; name: string | null };
type Responsible = { id: string; name: string | null };

type Form = {
  title: string;
  description: string;
  scheduled_at: string;
  priority: Priority;
  lead_id: string;
  customer_id: string;
  responsible_id: string;
};

const emptyForm: Form = {
  title: "",
  description: "",
  scheduled_at: "",
  priority: "media",
  lead_id: "",
  customer_id: "",
  responsible_id: "",
};

type FilterTab = "todos" | "pendente" | "concluido" | "atrasado";

function isOverdue(f: Followup): boolean {
  if (!f.scheduled_at) return false;
  if (f.status === "concluido" || f.completed_at) return false;
  return new Date(f.scheduled_at).getTime() < Date.now();
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function toDatetimeLocal(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function priorityBadge(p: string | null): string {
  switch ((p ?? "").toLowerCase()) {
    case "alta":
      return "bg-rose-100 text-rose-700 ring-rose-200";
    case "baixa":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    default:
      return "bg-amber-100 text-amber-700 ring-amber-200";
  }
}

function FollowupsPage() {
  const [items, setItems] = useState<Followup[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);

  const reload = useCallback(async (cid: string) => {
    const { data, error } = await supabase
      .from("followups")
      .select(
        "id,title,description,message,scheduled_at,status,priority,completed_at,lead_id,customer_id,responsible_id, customers(name), leads(interest), responsibles(name)",
      )
      .eq("company_id", cid)
      .order("scheduled_at", { ascending: true, nullsFirst: false });
    if (error) {
      setStatus("error");
      return;
    }
    const rows = (data ?? []) as unknown as Followup[];
    setItems(rows);
    setStatus(rows.length === 0 ? "empty" : "loaded");
  }, []);

  const loadRelations = useCallback(async (cid: string) => {
    const [leadsRes, customersRes, respRes] = await Promise.allSettled([
      supabase
        .from("leads")
        .select("id, interest")
        .eq("company_id", cid)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("customers")
        .select("id, name")
        .eq("company_id", cid)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("responsibles")
        .select("id, name")
        .eq("company_id", cid)
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);

    if (leadsRes.status === "fulfilled" && !leadsRes.value.error) {
      setLeads((leadsRes.value.data ?? []) as Lead[]);
    }
    if (customersRes.status === "fulfilled" && !customersRes.value.error) {
      setCustomers((customersRes.value.data ?? []) as Customer[]);
    }
    if (respRes.status === "fulfilled" && !respRes.value.error) {
      setResponsibles((respRes.value.data ?? []) as Responsible[]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (cancelled) return;
        if (userErr || !userData?.user) {
          setStatus("unauthenticated");
          return;
        }
        const { data: cu, error: cuErr } = await supabase
          .from("company_users")
          .select("company_id")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .maybeSingle();
        if (cancelled) return;
        if (cuErr || !cu?.company_id) {
          setStatus("error");
          return;
        }
        const cid = cu.company_id as string;
        setCompanyId(cid);
        await Promise.all([reload(cid), loadRelations(cid)]);
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload, loadRelations]);

  const counts = useMemo(() => {
    let pendente = 0;
    let concluido = 0;
    let atrasado = 0;
    for (const f of items) {
      if (f.status === "concluido" || f.completed_at) concluido++;
      else if (isOverdue(f)) atrasado++;
      else pendente++;
    }
    return { total: items.length, pendente, concluido, atrasado };
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((f) => {
      const done = f.status === "concluido" || !!f.completed_at;
      const overdue = !done && isOverdue(f);
      if (tab === "pendente" && (done || overdue)) return false;
      if (tab === "concluido" && !done) return false;
      if (tab === "atrasado" && !overdue) return false;
      if (!term) return true;
      const hay = [
        f.title,
        f.description,
        f.message,
        f.customers?.name,
        f.leads?.interest,
        f.responsibles?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [items, search, tab]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (f: Followup) => {
    setEditingId(f.id);
    setForm({
      title: f.title ?? "",
      description: f.description ?? f.message ?? "",
      scheduled_at: toDatetimeLocal(f.scheduled_at),
      priority: ((f.priority ?? "media").toLowerCase() as Priority) ?? "media",
      lead_id: f.lead_id ?? "",
      customer_id: f.customer_id ?? "",
      responsible_id: f.responsible_id ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
    setEditingId(null);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("O título do retorno é obrigatório.");
      return;
    }
    if (!companyId) {
      toast.error("Empresa vinculada não encontrada para este usuário.");
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    try {
      const scheduledISO =
        form.scheduled_at.trim() === "" ? null : new Date(form.scheduled_at).toISOString();

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        scheduled_at: scheduledISO,
        priority: form.priority,
        lead_id: form.lead_id || null,
        customer_id: form.customer_id || null,
        responsible_id: form.responsible_id || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("followups")
          .update(payload)
          .eq("id", editingId)
          .eq("company_id", companyId);
        if (error) throw error;
        toast.success("Retorno atualizado.");
      } else {
        const { error } = await supabase
          .from("followups")
          .insert({ ...payload, company_id: companyId, status: "pendente" });
        if (error) throw error;
        toast.success("Retorno criado.");
      }
      await reload(companyId);
      setModalOpen(false);
      setEditingId(null);
    } catch (e) {
      toast.error(
        "Não foi possível salvar o retorno." +
          (e instanceof Error ? ` (${e.message})` : ""),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const markDone = async (f: Followup) => {
    if (!companyId) {
      toast.error("Empresa vinculada não encontrada para este usuário.");
      return;
    }
    const { error } = await supabase
      .from("followups")
      .update({ status: "concluido", completed_at: new Date().toISOString() })
      .eq("id", f.id)
      .eq("company_id", companyId);
    if (error) {
      toast.error(
        "Não foi possível marcar como concluído." +
          (error.message ? ` (${error.message})` : ""),
      );
      return;
    }
    toast.success("Retorno concluído.");
    await reload(companyId);
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: counts.total },
    { key: "pendente", label: "Pendentes", count: counts.pendente },
    { key: "atrasado", label: "Atrasados", count: counts.atrasado },
    { key: "concluido", label: "Concluídos", count: counts.concluido },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 shadow-sm">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  ACOMPANHAMENTO ATIVO
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  RETORNOS COMERCIAIS
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Retornos Comerciais
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-blue-100/90">
                Organize follow-ups, prioridades e responsáveis para nenhum cliente ficar sem
                retorno.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:w-80">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-100/80">
                Resumo da agenda
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">
                    Pendentes
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">{counts.pendente}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">
                    Atrasados
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">{counts.atrasado}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">
                    Concluídos
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">{counts.concluido}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, cliente, lead ou responsável"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    tab === t.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Plus className="h-4 w-4" />
            Novo retorno
          </button>
        </div>

        {/* LIST */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
          {status === "loading" ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando retornos…
            </div>
          ) : status === "unauthenticated" ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Faça login para visualizar os retornos.
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              Não foi possível carregar os retornos. Tente novamente.
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {items.length === 0
                ? "Nenhum retorno cadastrado ainda."
                : "Nenhum retorno corresponde aos filtros aplicados."}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((f) => {
                const done = f.status === "concluido" || !!f.completed_at;
                const overdue = !done && isOverdue(f);
                return (
                  <li key={f.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {f.title ?? "Retorno sem título"}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${priorityBadge(
                            f.priority,
                          )}`}
                        >
                          <Flag className="h-3 w-3" />
                          {(f.priority ?? "media").toString()}
                        </span>
                        {done ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Concluído
                          </span>
                        ) : overdue ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-700 ring-1 ring-rose-200">
                            <AlertTriangle className="h-3 w-3" /> Atrasado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700 ring-1 ring-amber-200">
                            <Clock className="h-3 w-3" /> Pendente
                          </span>
                        )}
                      </div>
                      {(f.description || f.message) && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {f.description ?? f.message}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(f.scheduled_at)}
                        </span>
                        {f.customers?.name && <span>Cliente: {f.customers.name}</span>}
                        {f.leads?.interest && <span>Lead: {f.leads.interest}</span>}
                        {f.responsibles?.name && <span>Responsável: {f.responsibles.name}</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!done && (
                        <button
                          onClick={() => markDone(f)}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(f)}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  {editingId ? "Editar retorno" : "Novo retorno"}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
              <Field label="Título *" full>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Data agendada">
                <input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Prioridade">
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </Field>
              <Field label="Cliente">
                <select
                  value={form.customer_id}
                  onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">— Nenhum —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name ?? c.id}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Lead">
                <select
                  value={form.lead_id}
                  onChange={(e) => setForm({ ...form, lead_id: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">— Nenhum —</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.interest ?? l.id}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Responsável" full>
                <select
                  value={form.responsible_id}
                  onChange={(e) => setForm({ ...form, responsible_id: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">— Nenhum —</option>
                  {responsibles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name ?? r.id}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Descrição / mensagem" full>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 disabled:opacity-60"
                style={{ background: "var(--gradient-brand)" }}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {editingId ? "Salvar alterações" : "Criar retorno"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

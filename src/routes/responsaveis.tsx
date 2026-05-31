import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Users, Briefcase, ArrowRightLeft, UserX, Search, Sparkles, Pencil, Power, X } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/responsaveis")({
  component: ResponsaveisPage,
  head: () => ({ meta: [{ title: "Responsáveis | Agente Comercial 360" }] }),
});

type Setor = "Vendas" | "Financeiro" | "Administrativo" | "Gestão";
type Status = "Ativo" | "Inativo";

type Responsavel = {
  id: string;
  nome: string;
  setor: Setor;
  funcao: string;
  telefone: string;
  status: Status;
  atendimentosHoje: number;
};

const initialResponsaveis: Responsavel[] = [
  {
    id: "1",
    nome: "Amanda",
    setor: "Vendas",
    funcao: "Atendimento comercial",
    telefone: "(15) 99608-3076",
    status: "Ativo",
    atendimentosHoje: 12,
  },
  {
    id: "2",
    nome: "Thaís",
    setor: "Vendas",
    funcao: "Orçamentos e follow-up",
    telefone: "(15) 99777-1122",
    status: "Ativo",
    atendimentosHoje: 8,
  },
  {
    id: "3",
    nome: "Lorenzzo",
    setor: "Administrativo",
    funcao: "Solicitações internas",
    telefone: "(15) 99888-2233",
    status: "Ativo",
    atendimentosHoje: 5,
  },
  {
    id: "4",
    nome: "Vinicius",
    setor: "Financeiro",
    funcao: "Cobranças e pendências",
    telefone: "(15) 99999-3344",
    status: "Ativo",
    atendimentosHoje: 7,
  },
  {
    id: "5",
    nome: "Vitor",
    setor: "Vendas",
    funcao: "Peças e estoque",
    telefone: "(15) 99111-4455",
    status: "Ativo",
    atendimentosHoje: 5,
  },
  {
    id: "6",
    nome: "Ivan",
    setor: "Gestão",
    funcao: "Dono / gestor",
    telefone: "(15) 99222-5566",
    status: "Ativo",
    atendimentosHoje: 0,
  },
];

const filters = [
  "Todos",
  "Vendas",
  "Financeiro",
  "Administrativo",
  "Gestão",
  "Ativos",
  "Inativos",
];

const setorBadge: Record<Setor, string> = {
  Vendas: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  Financeiro: "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
  Administrativo: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Gestão: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
};

const statusBadge: Record<Status, string> = {
  Ativo: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Inativo: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

const setores: Setor[] = ["Vendas", "Financeiro", "Administrativo", "Gestão"];

function ResponsaveisPage() {
  const [items, setItems] = useState<Responsavel[]>(initialResponsaveis);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    nome: string;
    setor: Setor;
    funcao: string;
    telefone: string;
    status: Status;
  }>({
    nome: "",
    setor: "Vendas",
    funcao: "",
    telefone: "",
    status: "Ativo",
  });

  const [loadingResponsibles, setLoadingResponsibles] = useState(true);
  const [responsiblesLoadStatus, setResponsiblesLoadStatus] = useState<
    "loading" | "loaded" | "empty" | "unauthenticated" | "error"
  >("loading");
  const [loadedCount, setLoadedCount] = useState(0);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const normalizeSetor = (d: string | null | undefined): Setor => {
    const allowed: Setor[] = ["Vendas", "Financeiro", "Administrativo", "Gestão"];
    if (!d) return "Administrativo";
    const found = allowed.find((s) => s.toLowerCase() === d.trim().toLowerCase());
    return found ?? "Administrativo";
  };

  const resolveCompanyId = async (): Promise<{ companyId: string | null; reason?: string }> => {
    if (companyId) return { companyId };
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { companyId: null, reason: "unauthenticated" };
    }
    const { data: cu, error: cuError } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", userData.user.id)
      .eq("is_active", true)
      .maybeSingle();
    if (cuError || !cu?.company_id) {
      return { companyId: null, reason: "no_company" };
    }
    setCompanyId(cu.company_id as string);
    return { companyId: cu.company_id as string };
  };

  const loadResponsibles = async (cidOverride?: string) => {
    setLoadingResponsibles(true);
    try {
      let cid = cidOverride ?? companyId;
      if (!cid) {
        const resolved = await resolveCompanyId();
        if (!resolved.companyId) {
          setResponsiblesLoadStatus(resolved.reason === "unauthenticated" ? "unauthenticated" : "error");
          setLoadingResponsibles(false);
          return;
        }
        cid = resolved.companyId;
      }

      const { data: rows, error: rError } = await supabase
        .from("responsibles")
        .select("id,name,department,role,phone,email,is_active,created_at")
        .eq("company_id", cid)
        .order("name");

      if (rError) {
        setResponsiblesLoadStatus("error");
        setLoadingResponsibles(false);
        return;
      }

      if (!rows || rows.length === 0) {
        setItems([]);
        setLoadedCount(0);
        setResponsiblesLoadStatus("empty");
        setLoadingResponsibles(false);
        return;
      }

      const mapped: Responsavel[] = rows.map((r) => ({
        id: String(r.id),
        nome: r.name ?? "Sem nome",
        setor: normalizeSetor(r.department),
        funcao: r.role ?? "",
        telefone: r.phone ?? "",
        status: r.is_active ? "Ativo" : "Inativo",
        atendimentosHoje: 0,
      }));

      setItems(mapped);
      setLoadedCount(mapped.length);
      setResponsiblesLoadStatus("loaded");
      setLoadingResponsibles(false);
    } catch {
      setResponsiblesLoadStatus("error");
      setLoadingResponsibles(false);
    }
  };

  useEffect(() => {
    loadResponsibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ativosCount = useMemo(
    () => items.filter((r) => r.status === "Ativo").length,
    [items]
  );
  const inativosCount = useMemo(
    () => items.filter((r) => r.status === "Inativo").length,
    [items]
  );
  const setoresCobertos = useMemo(
    () => new Set(items.map((r) => r.setor)).size,
    [items]
  );
  const encaminhadosHoje = useMemo(
    () => items.reduce((sum, r) => sum + r.atendimentosHoje, 0),
    [items]
  );

  const summary = [
    { label: "Responsáveis ativos", value: ativosCount, icon: Users },
    { label: "Setores cobertos", value: setoresCobertos, icon: Briefcase },
    { label: "Atendimentos encaminhados hoje", value: encaminhadosHoje, icon: ArrowRightLeft },
    { label: "Sem responsável definido", value: inativosCount, icon: UserX },
  ];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((r) => {
      if (activeFilter === "Ativos" && r.status !== "Ativo") return false;
      if (activeFilter === "Inativos" && r.status !== "Inativo") return false;
      if (
        activeFilter !== "Todos" &&
        activeFilter !== "Ativos" &&
        activeFilter !== "Inativos" &&
        r.setor !== activeFilter
      )
        return false;

      if (!term) return true;
      return (
        r.nome.toLowerCase().includes(term) ||
        r.setor.toLowerCase().includes(term) ||
        r.funcao.toLowerCase().includes(term) ||
        r.telefone.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term)
      );
    });
  }, [items, activeFilter, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ nome: "", setor: "Vendas", funcao: "", telefone: "", status: "Ativo" });
    setModalOpen(true);
  };

  const openEdit = (r: Responsavel) => {
    setEditingId(r.id);
    setForm({
      nome: r.nome,
      setor: r.setor,
      funcao: r.funcao,
      telefone: r.telefone,
      status: r.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const saveResponsavel = async () => {
    if (isSaving) return;
    if (!form.nome.trim() || !form.funcao.trim()) {
      toast.error("Preencha nome, setor e função.");
      return;
    }

    setSaveError(null);
    setSaveSuccess(null);
    setIsSaving(true);

    try {
      const resolved = await resolveCompanyId();
      if (!resolved.companyId) {
        const msg =
          resolved.reason === "unauthenticated"
            ? "Usuário não autenticado. Faça login novamente."
            : "Empresa vinculada não encontrada para este usuário.";
        setSaveError(msg);
        toast.error(msg);
        setIsSaving(false);
        return;
      }
      const cid = resolved.companyId;

      if (editingId) {
        const numericId = Number(editingId);
        if (Number.isNaN(numericId)) {
          // local-only item (mock fallback): apenas atualiza estado
          setItems((prev) =>
            prev.map((r) =>
              r.id === editingId
                ? {
                    ...r,
                    nome: form.nome.trim(),
                    setor: form.setor,
                    funcao: form.funcao.trim(),
                    telefone: form.telefone.trim(),
                    status: form.status,
                  }
                : r
            )
          );
          toast.success("Responsável atualizado localmente.");
        } else {
          const { error } = await supabase
            .from("responsibles")
            .update({
              name: form.nome.trim(),
              department: form.setor,
              role: form.funcao.trim(),
              phone: form.telefone.trim() || null,
            })
            .eq("id", numericId)
            .eq("company_id", cid)
            .select()
            .single();

          if (error) throw error;

          toast.success("Responsável salvo no Supabase.");
          setSaveSuccess("Responsável atualizado no Supabase.");
        }
      } else {
        const { error } = await supabase
          .from("responsibles")
          .insert({
            company_id: cid,
            name: form.nome.trim(),
            department: form.setor,
            role: form.funcao.trim(),
            phone: form.telefone.trim() || null,
            email: null,
            is_active: form.status === "Ativo",
          })
          .select()
          .single();

        if (error) throw error;

        toast.success("Responsável salvo no Supabase.");
        setSaveSuccess("Responsável adicionado no Supabase.");
      }

      await loadResponsibles(cid);
      setIsSaving(false);
      closeModal();
    } catch (err) {
      const msg = "Não foi possível salvar o responsável.";
      console.error("[responsaveis] save error", err);
      setSaveError(msg);
      toast.error(msg);
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const target = items.find((r) => r.id === id);
    if (!target) return;
    const novoStatus = target.status !== "Ativo";

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      // fallback local (mock)
      setItems((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: novoStatus ? "Ativo" : "Inativo" } : r
        )
      );
      toast.success("Status atualizado localmente.");
      return;
    }

    try {
      const resolved = await resolveCompanyId();
      if (!resolved.companyId) {
        const msg =
          resolved.reason === "unauthenticated"
            ? "Usuário não autenticado. Faça login novamente."
            : "Empresa vinculada não encontrada para este usuário.";
        toast.error(msg);
        return;
      }

      const { error } = await supabase
        .from("responsibles")
        .update({ is_active: novoStatus })
        .eq("id", numericId)
        .eq("company_id", resolved.companyId)
        .select()
        .single();

      if (error) throw error;

      toast.success("Status do responsável atualizado.");
      await loadResponsibles(resolved.companyId);
    } catch (err) {
      console.error("[responsaveis] toggle error", err);
      toast.error("Não foi possível atualizar o status.");
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HERO PREMIUM */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 shadow-sm">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Gestão ativa
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  Equipe organizada
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  Setores definidos
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Responsáveis
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-blue-100/90">
                Gerencie equipe, setores e responsáveis pela continuidade dos atendimentos.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:w-80">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-100/80">
                  Resumo da equipe
                </p>
                <span className="text-[10px] font-medium text-blue-200/70">
                  {loadingResponsibles ? "Sincronizando…" : "Atualizado agora"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Responsáveis ativos</p>
                  <p className="mt-1 text-xl font-bold text-white">{ativosCount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Setores</p>
                  <p className="mt-1 text-xl font-bold text-white">{setoresCobertos}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">Contatos cadastrados</p>
                  <p className="mt-1 text-xl font-bold text-white">{items.length}</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-blue-100/80">
                Equipe organizada para distribuição, acompanhamento e continuidade dos atendimentos.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl bg-card p-5 border border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filters + search + add button */}
        <div className="rounded-2xl bg-card p-4 border border-border shadow-[var(--shadow-soft)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    activeFilter === f
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm"
            >
              Adicionar responsável
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar responsável por nome, setor ou telefone..."
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        {/* Table + AI summary + routing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-base font-semibold text-foreground">Nenhum responsável encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Revise os filtros ou tente outro termo de busca.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left">
                      {[
                        "Nome",
                        "Setor",
                        "Função",
                        "Telefone",
                        "Status",
                        "Atendimentos hoje",
                        "Ação",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition"
                      >
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                          {r.nome}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${setorBadge[r.setor]}`}
                          >
                            {r.setor}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {r.funcao}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {r.telefone}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[r.status]}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-display font-bold text-foreground">
                          {r.atendimentosHoje}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(r)}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap inline-flex items-center gap-1"
                            >
                              <Pencil className="h-3 w-3" />
                              Editar
                            </button>
                            <button
                              onClick={() => toggleStatus(r.id)}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap inline-flex items-center gap-1"
                            >
                              <Power className="h-3 w-3" />
                              Ativar/Desativar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Side cards */}
          <div className="space-y-4">
            {/* AI summary */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-[var(--brand-blue-soft)] to-card p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Resumo da IA</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A IA pode encaminhar atendimentos automaticamente para o responsável correto de acordo com o setor identificado na conversa.
              </p>
            </div>

            {/* Routing rules */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Roteamento por setor
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 ring-1 ring-blue-200 shrink-0">
                    Vendas
                  </span>
                  <span className="text-muted-foreground">Amanda, Thaís ou Vitor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-violet-100 text-violet-700 ring-1 ring-violet-200 shrink-0">
                    Financeiro
                  </span>
                  <span className="text-muted-foreground">Vinicius</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 ring-1 ring-amber-200 shrink-0">
                    Administrativo
                  </span>
                  <span className="text-muted-foreground">Lorenzzo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 shrink-0">
                    Gestão / Relatórios
                  </span>
                  <span className="text-muted-foreground">Ivan</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {editingId ? "Editar responsável" : "Adicionar responsável"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Amanda"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Setor</label>
                <select
                  value={form.setor}
                  onChange={(e) => setForm((f) => ({ ...f, setor: e.target.value as Setor }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none"
                >
                  {setores.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Função</label>
                <input
                  type="text"
                  value={form.funcao}
                  onChange={(e) => setForm((f) => ({ ...f, funcao: e.target.value }))}
                  placeholder="Ex: Atendimento comercial"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Telefone</label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                  placeholder="Ex: (15) 99608-3076"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={closeModal}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                Cancelar
              </button>
              <button
                onClick={saveResponsavel}
                disabled={isSaving}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? "Salvando..." : editingId ? "Salvar alterações" : "Salvar responsável"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

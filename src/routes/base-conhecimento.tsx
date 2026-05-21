import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { BookOpen, Tags, CheckCircle2, AlertTriangle, Search, Sparkles, Eye, Pencil, Power, X } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/base-conhecimento")({
  component: BaseConhecimentoPage,
  head: () => ({ meta: [{ title: "Base de Conhecimento | Agente Comercial 360" }] }),
});

type Categoria =
  | "Vendas"
  | "Administrativo"
  | "Financeiro"
  | "Regras"
  | "Entrega"
  | "Pagamento"
  | "Orçamento"
  | "Relatórios";

type Status = "Ativo" | "Revisar" | "Inativo";

type Conhecimento = {
  id: string;
  titulo: string;
  categoria: Categoria;
  conteudo: string;
  empresa: string;
  status: Status;
  atualizadoEm: string;
};

const initialConhecimentos: Conhecimento[] = [
  {
    id: "1",
    titulo: "Envio de preços",
    categoria: "Regras",
    conteudo: "A IA não deve enviar preços sem validação humana.",
    empresa: "União Auto Peças",
    status: "Ativo",
    atualizadoEm: "20/05/2026",
  },
  {
    id: "2",
    titulo: "Orçamentos de peças",
    categoria: "Orçamento",
    conteudo: "Solicitar modelo do veículo, ano e peça desejada antes de encaminhar.",
    empresa: "União Auto Peças",
    status: "Ativo",
    atualizadoEm: "20/05/2026",
  },
  {
    id: "3",
    titulo: "Atendimento financeiro",
    categoria: "Financeiro",
    conteudo: "Encaminhar dúvidas de cobrança para o responsável financeiro.",
    empresa: "União Auto Peças",
    status: "Ativo",
    atualizadoEm: "19/05/2026",
  },
  {
    id: "4",
    titulo: "Horário de atendimento",
    categoria: "Administrativo",
    conteudo: "Atendimento de segunda a sexta, das 08:00 às 18:00.",
    empresa: "União Auto Peças",
    status: "Ativo",
    atualizadoEm: "18/05/2026",
  },
  {
    id: "5",
    titulo: "Entregas e retiradas",
    categoria: "Entrega",
    conteudo: "Confirmar disponibilidade e endereço antes de informar prazo.",
    empresa: "União Auto Peças",
    status: "Revisar",
    atualizadoEm: "17/05/2026",
  },
  {
    id: "6",
    titulo: "Solicitação de peça",
    categoria: "Vendas",
    conteudo: "Identificar peça, veículo, ano e urgência do cliente.",
    empresa: "União Auto Peças",
    status: "Ativo",
    atualizadoEm: "16/05/2026",
  },
];

const filters = [
  "Todos",
  "Vendas",
  "Administrativo",
  "Financeiro",
  "Regras",
  "Entrega",
  "Pagamento",
  "Orçamento",
];

const categorias: Categoria[] = [
  "Vendas",
  "Administrativo",
  "Financeiro",
  "Regras",
  "Entrega",
  "Pagamento",
  "Orçamento",
  "Relatórios",
];

const categoriaBadge: Record<Categoria, string> = {
  Vendas: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  Administrativo: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Financeiro: "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
  Regras: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  Entrega: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
  Pagamento: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Orçamento: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
  Relatórios: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

const statusBadge: Record<Status, string> = {
  Ativo: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  Revisar: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Inativo: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

function BaseConhecimentoPage() {
  const [items, setItems] = useState<Conhecimento[]>(initialConhecimentos);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    titulo: string;
    categoria: Categoria;
    conteudo: string;
    empresa: string;
    status: Status;
  }>({
    titulo: "",
    categoria: "Vendas",
    conteudo: "",
    empresa: "",
    status: "Ativo",
  });

  const totalRegras = useMemo(() => items.length, [items]);
  const categoriasAtivas = useMemo(
    () => new Set(items.filter((i) => i.status === "Ativo").map((i) => i.categoria)).size,
    [items]
  );
  const conteudosRevisados = useMemo(
    () => items.filter((i) => i.status === "Ativo").length,
    [items]
  );
  const pendentesRevisao = useMemo(
    () => items.filter((i) => i.status === "Revisar").length,
    [items]
  );

  const summary = [
    { label: "Regras cadastradas", value: totalRegras, icon: BookOpen },
    { label: "Categorias ativas", value: categoriasAtivas, icon: Tags },
    { label: "Conteúdos revisados", value: conteudosRevisados, icon: CheckCircle2 },
    { label: "Pendentes de revisão", value: pendentesRevisao, icon: AlertTriangle },
  ];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((c) => {
      if (activeFilter !== "Todos" && c.categoria !== activeFilter) return false;
      if (!term) return true;
      return (
        c.titulo.toLowerCase().includes(term) ||
        c.categoria.toLowerCase().includes(term) ||
        c.conteudo.toLowerCase().includes(term) ||
        c.empresa.toLowerCase().includes(term) ||
        c.status.toLowerCase().includes(term)
      );
    });
  }, [items, activeFilter, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ titulo: "", categoria: "Vendas", conteudo: "", empresa: "", status: "Ativo" });
    setModalOpen(true);
  };

  const openEdit = (c: Conhecimento) => {
    setEditingId(c.id);
    setForm({
      titulo: c.titulo,
      categoria: c.categoria,
      conteudo: c.conteudo,
      empresa: c.empresa,
      status: c.status,
    });
    setModalOpen(true);
  };

  const openView = (c: Conhecimento) => {
    setViewingId(c.id);
    setViewModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewingId(null);
  };

  const saveConhecimento = () => {
    if (!form.titulo.trim() || !form.conteudo.trim() || !form.empresa.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (editingId) {
      setItems((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                titulo: form.titulo.trim(),
                categoria: form.categoria,
                conteudo: form.conteudo.trim(),
                empresa: form.empresa.trim(),
                status: form.status,
                atualizadoEm: "20/05/2026",
              }
            : c
        )
      );
      toast.success("Conhecimento atualizado com sucesso.");
    } else {
      const newId = String(Date.now());
      setItems((prev) => [
        ...prev,
        {
          id: newId,
          titulo: form.titulo.trim(),
          categoria: form.categoria,
          conteudo: form.conteudo.trim(),
          empresa: form.empresa.trim(),
          status: form.status,
          atualizadoEm: "20/05/2026",
        },
      ]);
      toast.success("Conhecimento adicionado com sucesso.");
    }
    closeModal();
  };

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "Ativo" ? "Inativo" : "Ativo" } : c
      )
    );
    toast.success("Status do conhecimento atualizado.");
  };

  const viewingItem = useMemo(
    () => items.find((c) => c.id === viewingId) || null,
    [items, viewingId]
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Base de Conhecimento
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Organize regras, informações e conteúdos usados pela IA para atender clientes com precisão.
          </p>
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
              Adicionar conhecimento
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar regra, categoria ou conteúdo..."
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        {/* Table + side cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-base font-semibold text-foreground">Nenhum conhecimento encontrado</p>
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
                        "Título",
                        "Categoria",
                        "Conteúdo resumido",
                        "Empresa",
                        "Status",
                        "Atualizado em",
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
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition"
                      >
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                          {c.titulo}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoriaBadge[c.categoria]}`}
                          >
                            {c.categoria}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                          {c.conteudo}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {c.empresa}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[c.status]}`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {c.atualizadoEm}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openView(c)}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap inline-flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Ver
                            </button>
                            <button
                              onClick={() => openEdit(c)}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap inline-flex items-center gap-1"
                            >
                              <Pencil className="h-3 w-3" />
                              Editar
                            </button>
                            <button
                              onClick={() => toggleStatus(c.id)}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition whitespace-nowrap inline-flex items-center gap-1"
                            >
                              <Power className="h-3 w-3" />
                              {c.status === "Ativo" ? "Desativar" : "Ativar"}
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
                <h3 className="text-base font-semibold text-foreground">Como a IA usa essa base</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A IA consulta a base de conhecimento para entender regras da empresa, orientar respostas, identificar setores e encaminhar solicitações para os responsáveis corretos.
              </p>
            </div>

            {/* Categories */}
            <div className="rounded-2xl bg-card border border-border shadow-[var(--shadow-soft)] p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Categorias principais
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Vendas", badge: categoriaBadge["Vendas"] },
                  { label: "Administrativo", badge: categoriaBadge["Administrativo"] },
                  { label: "Financeiro", badge: categoriaBadge["Financeiro"] },
                  { label: "Regras", badge: categoriaBadge["Regras"] },
                  { label: "Entrega", badge: categoriaBadge["Entrega"] },
                  { label: "Pagamento", badge: categoriaBadge["Pagamento"] },
                  { label: "Orçamento", badge: categoriaBadge["Orçamento"] },
                ].map((cat) => (
                  <li key={cat.label} className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.badge} shrink-0`}
                    >
                      {cat.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attention */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 shadow-[var(--shadow-soft)] p-5">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <h3 className="text-sm font-semibold text-amber-800">Atenção</h3>
              </div>
              <p className="text-xs leading-relaxed text-amber-700">
                Conteúdos sensíveis devem ser revisados antes de serem usados pela IA. Nesta fase, os dados são apenas visuais e ainda não estão conectados ao Supabase.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {editingId ? "Editar conhecimento" : "Adicionar conhecimento"}
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
                <label className="block text-sm font-medium text-foreground mb-1">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ex: Envio de preços"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value as Categoria }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none"
                >
                  {categorias.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Conteúdo</label>
                <textarea
                  value={form.conteudo}
                  onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
                  placeholder="Descreva a regra ou informação..."
                  rows={4}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Empresa</label>
                <input
                  type="text"
                  value={form.empresa}
                  onChange={(e) => setForm((f) => ({ ...f, empresa: e.target.value }))}
                  placeholder="Ex: União Auto Peças"
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
                  <option value="Revisar">Revisar</option>
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
                onClick={saveConhecimento}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm"
              >
                {editingId ? "Salvar alterações" : "Salvar conhecimento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{viewingItem.titulo}</h2>
              <button
                onClick={closeViewModal}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoriaBadge[viewingItem.categoria]}`}
                >
                  {viewingItem.categoria}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[viewingItem.status]}`}
                >
                  {viewingItem.status}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Conteúdo completo
                </label>
                <p className="text-sm text-foreground leading-relaxed">{viewingItem.conteudo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    Empresa
                  </label>
                  <p className="text-sm text-foreground">{viewingItem.empresa}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    Atualizado em
                  </label>
                  <p className="text-sm text-foreground">{viewingItem.atualizadoEm}</p>
                </div>
              </div>
              <div className="rounded-xl bg-[var(--brand-blue-soft)] border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Observação da IA</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A IA usará este conteúdo como referência para orientar respostas, classificar setores e manter o atendimento alinhado às regras da empresa.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end pt-1">
              <button
                onClick={closeViewModal}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

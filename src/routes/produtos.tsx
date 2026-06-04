import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Package,
  Search,
  Pencil,
  Power,
  X,
  Loader2,
  Plus,
  Tag,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/produtos")({
  component: ProdutosPage,
  head: () => ({ meta: [{ title: "Peças / Produtos | Agente Comercial 360" }] }),
});

type LoadStatus = "loading" | "loaded" | "empty" | "unauthenticated" | "error";

type Produto = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  stock_quantity: number | null;
  is_active: boolean;
  sku: string | null;
  brand: string | null;
  unit: string | null;
  segment: string | null;
};

type Form = {
  name: string;
  sku: string;
  brand: string;
  category: string;
  unit: string;
  segment: string;
  price: string;
  stock_quantity: string;
  description: string;
  is_active: boolean;
};

const emptyForm: Form = {
  name: "",
  sku: "",
  brand: "",
  category: "",
  unit: "",
  segment: "",
  price: "",
  stock_quantity: "",
  description: "",
  is_active: true,
};

function formatBRL(value: number | null): string {
  if (value == null) return "—";
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

function ProdutosPage() {
  const [items, setItems] = useState<Produto[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "ativos" | "inativos">("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(async (cid: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,description,category,price,stock_quantity,is_active,sku,brand,unit,segment")
      .eq("company_id", cid)
      .order("created_at", { ascending: false });
    if (error) {
      setStatus("error");
      return;
    }
    const rows = (data ?? []) as Produto[];
    setItems(rows);
    setStatus(rows.length === 0 ? "empty" : "loaded");
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
        await reload(cid);
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((p) => {
      if (filterStatus === "ativos" && !p.is_active) return false;
      if (filterStatus === "inativos" && p.is_active) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.category ?? "").toLowerCase().includes(term) ||
        (p.brand ?? "").toLowerCase().includes(term) ||
        (p.sku ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, search, filterStatus]);

  const totals = useMemo(() => {
    const total = items.length;
    const ativos = items.filter((i) => i.is_active).length;
    const inativos = total - ativos;
    const categorias = new Set(items.filter((i) => i.category).map((i) => i.category!)).size;
    return { total, ativos, inativos, categorias };
  }, [items]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: Produto) => {
    setEditingId(p.id);
    setForm({
      name: p.name ?? "",
      sku: p.sku ?? "",
      brand: p.brand ?? "",
      category: p.category ?? "",
      unit: p.unit ?? "",
      segment: p.segment ?? "",
      price: p.price != null ? String(p.price) : "",
      stock_quantity: p.stock_quantity != null ? String(p.stock_quantity) : "",
      description: p.description ?? "",
      is_active: p.is_active,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalOpen(false);
    setEditingId(null);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("O nome do produto é obrigatório.");
      return;
    }
    if (!companyId) {
      toast.error("Empresa vinculada não encontrada para este usuário.");
      return;
    }
    if (isSaving) return;

    const priceNum = form.price.trim() === "" ? null : Number(form.price.replace(",", "."));
    const stockNum = form.stock_quantity.trim() === "" ? null : Number(form.stock_quantity);
    if (priceNum != null && Number.isNaN(priceNum)) {
      toast.error("Preço inválido.");
      return;
    }
    if (stockNum != null && Number.isNaN(stockNum)) {
      toast.error("Quantidade inválida.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        brand: form.brand.trim() || null,
        category: form.category.trim() || null,
        unit: form.unit.trim() || null,
        segment: form.segment.trim() || null,
        price: priceNum,
        stock_quantity: stockNum,
        description: form.description.trim() || null,
        is_active: form.is_active,
      };

      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId)
          .eq("company_id", companyId);
        if (error) throw error;
        toast.success("Produto atualizado com sucesso.");
      } else {
        const { error } = await supabase
          .from("products")
          .insert({ ...payload, company_id: companyId });
        if (error) throw error;
        toast.success("Produto cadastrado com sucesso.");
      }
      await reload(companyId);
      setModalOpen(false);
      setEditingId(null);
    } catch (e) {
      toast.error(
        "Não foi possível salvar o produto." +
          (e instanceof Error ? ` (${e.message})` : ""),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (p: Produto) => {
    if (!companyId) {
      toast.error("Empresa vinculada não encontrada para este usuário.");
      return;
    }
    const { error } = await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id)
      .eq("company_id", companyId);
    if (error) {
      toast.error(
        "Não foi possível alterar o status do produto." +
          (error.message ? ` (${error.message})` : ""),
      );
      return;
    }
    toast.success(p.is_active ? "Produto desativado." : "Produto ativado.");
    await reload(companyId);
  };

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
                  CADASTRO ATIVO
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 ring-1 ring-white/20">
                  CONSULTA COMERCIAL
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Peças / Produtos
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-blue-100/90">
                Cadastro auxiliar de produtos e peças para consulta comercial. Não substitui o
                sistema oficial de estoque da empresa.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:w-80">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-100/80">
                Resumo do cadastro
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">
                    Total
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">{totals.total}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">
                    Ativos
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">{totals.ativos}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-blue-200/70">
                    Categorias
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">{totals.categorias}</p>
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
                placeholder="Buscar por nome, categoria, marca ou SKU"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
              {(["todos", "ativos", "inativos"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilterStatus(opt)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    filterStatus === opt
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </button>
        </div>

        {/* LIST */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
          {status === "loading" ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando produtos…
            </div>
          ) : status === "unauthenticated" ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Faça login para visualizar os produtos.
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              Não foi possível carregar os produtos. Tente novamente.
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {items.length === 0
                ? "Nenhum produto cadastrado ainda."
                : "Nenhum produto corresponde aos filtros aplicados."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Produto</th>
                    <th className="px-4 py-3 font-semibold">Categoria</th>
                    <th className="px-4 py-3 font-semibold">Marca / SKU</th>
                    <th className="px-4 py-3 font-semibold text-right">Preço</th>
                    <th className="px-4 py-3 font-semibold text-right">Qtde</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{p.name}</div>
                        {p.description && (
                          <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div>{p.brand ?? "—"}</div>
                        <div className="text-[11px] text-muted-foreground/80">
                          {p.sku ? `SKU ${p.sku}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatBRL(p.price)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {p.stock_quantity ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                            p.is_active
                              ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-slate-200"
                          }`}
                        >
                          {p.is_active ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Power className="h-3 w-3" />
                          )}
                          {p.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </button>
                          <button
                            onClick={() => toggleStatus(p)}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                          >
                            <Power className="h-3.5 w-3.5" />
                            {p.is_active ? "Desativar" : "Ativar"}
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
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  {editingId ? "Editar produto" : "Novo produto"}
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
              <Field label="Nome *" full>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="SKU">
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Marca">
                <input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Categoria">
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Unidade">
                <input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="ex: un, cx, kg"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Segmento">
                <input
                  value={form.segment}
                  onChange={(e) => setForm({ ...form, segment: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Preço (R$)">
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  inputMode="decimal"
                  placeholder="0,00"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Quantidade">
                <input
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Descrição" full>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="Status" full>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Produto ativo
                </label>
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
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                {editingId ? "Salvar alterações" : "Cadastrar produto"}
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

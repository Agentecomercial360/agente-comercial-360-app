import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  DollarSign,
  Tag,
  Boxes,
  Megaphone,
  Star,
  NotebookPen,
  Sparkles,
  Info,
  Layers,
  Clock,
  Plus,
  Search,
  Pencil,
  Trash2,
  Play,
  Pause,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import {
  ECOMMERCE_COMPANY_ID,
  useEcommerceActiveAccount,
} from "@/lib/ecommerce-active-account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/ecommerce/base-ia")({
  head: () => ({
    meta: [
      { title: "Regras da Operação — AC360 E-commerce Intelligence" },
      {
        name: "description",
        content:
          "Cadastre regras de margem, preço, estoque, Ads e produtos prioritários para orientar o Diagnóstico Inteligente e o Assistente Estratégico.",
      },
    ],
  }),
  component: BaseIaPage,
});

// ---------------------------------------------------------------------------
// Types & config
// ---------------------------------------------------------------------------

type Category =
  | "margem"
  | "preco"
  | "estoque"
  | "ads"
  | "prioritarios"
  | "observacoes";

type Priority = "low" | "medium" | "high" | "critical";
type Status = "active" | "paused";
type AppliesTo = "operation" | "category" | "product" | "sku" | "account";

type Rule = {
  id: string;
  company_id: string;
  account_id: string | null;
  category: Category;
  title: string;
  description: string;
  priority: Priority;
  applies_to_type: AppliesTo;
  applies_to_value: string | null;
  status: Status;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

type LoadStatus = "loading" | "connected" | "empty" | "table_missing" | "error";

const TABLE = "ecommerce_ai_knowledge_base";

const CATEGORIES: {
  key: Category;
  label: string;
  short: string;
  description: string;
  icon: typeof DollarSign;
  accent: string;
  iconCls: string;
}[] = [
  {
    key: "margem",
    label: "Margem",
    short: "Regras de margem",
    description:
      "Margem mínima aceitável, margem alvo por categoria e limites para promoções.",
    icon: DollarSign,
    accent: "from-emerald-500/10 to-emerald-500/0 border-emerald-200",
    iconCls: "bg-emerald-600 text-white",
  },
  {
    key: "preco",
    label: "Preço",
    short: "Regras de preço",
    description:
      "Estratégia de precificação, resposta à concorrência e política de descontos.",
    icon: Tag,
    accent: "from-blue-500/10 to-blue-500/0 border-blue-200",
    iconCls: "bg-blue-700 text-white",
  },
  {
    key: "estoque",
    label: "Estoque",
    short: "Regras de estoque",
    description:
      "Cobertura mínima, ponto de recompra, produtos que não podem ficar sem estoque.",
    icon: Boxes,
    accent: "from-amber-500/10 to-amber-500/0 border-amber-200",
    iconCls: "bg-amber-600 text-white",
  },
  {
    key: "ads",
    label: "Ads",
    short: "Estratégia de anúncios e Ads",
    description:
      "Escala, pausa de campanha, ROAS mínimo e produtos elegíveis para investimento.",
    icon: Megaphone,
    accent: "from-fuchsia-500/10 to-fuchsia-500/0 border-fuchsia-200",
    iconCls: "bg-fuchsia-600 text-white",
  },
  {
    key: "prioritarios",
    label: "Prioritários",
    short: "Produtos prioritários",
    description:
      "Campeões, estratégicos, protegidos, produtos que não podem ser pausados.",
    icon: Star,
    accent: "from-indigo-500/10 to-indigo-500/0 border-indigo-200",
    iconCls: "bg-indigo-600 text-white",
  },
  {
    key: "observacoes",
    label: "Observações",
    short: "Observações da operação",
    description:
      "Notas internas do time, regras comerciais e contexto para a IA considerar.",
    icon: NotebookPen,
    accent: "from-slate-500/10 to-slate-500/0 border-slate-200",
    iconCls: "bg-slate-800 text-white",
  },
];

const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<Category, (typeof CATEGORIES)[number]>;

const PRIORITY_META: Record<
  Priority,
  { label: string; cls: string }
> = {
  low: { label: "Baixa", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  medium: { label: "Média", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  high: { label: "Alta", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  critical: {
    label: "Crítica",
    cls: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const APPLIES_TO_META: Record<AppliesTo, { label: string; placeholder: string }> = {
  operation: { label: "Toda a operação", placeholder: "" },
  category: { label: "Categoria específica", placeholder: "Ex.: Automotivo" },
  product: { label: "Produto específico", placeholder: "Ex.: Suporte de TV 40\"" },
  sku: { label: "SKU específico", placeholder: "Ex.: RBX-1024" },
  account: { label: "Conta Mercado Livre", placeholder: "Nome da conta" },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function BaseIaPage() {
  const { activeAccount } = useEcommerceActiveAccount();

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [rules, setRules] = useState<Rule[]>([]);
  const [search, setSearch] = useState("");
  const [fCategory, setFCategory] = useState<"all" | Category>("all");
  const [fPriority, setFPriority] = useState<"all" | Priority>("all");
  const [fStatus, setFStatus] = useState<"all" | Status>("all");
  const [fApplies, setFApplies] = useState<"all" | AppliesTo>("all");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [viewing, setViewing] = useState<Rule | null>(null);
  const [deleting, setDeleting] = useState<Rule | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("company_id", ECOMMERCE_COMPANY_ID)
        .order("updated_at", { ascending: false });

      if (error) {
        // 42P01 = undefined_table
        if ((error as { code?: string }).code === "42P01") {
          setStatus("table_missing");
          setRules([]);
          return;
        }
        setStatus("error");
        setRules([]);
        return;
      }
      const rows = (data ?? []) as Rule[];
      setRules(rows);
      setStatus(rows.length === 0 ? "empty" : "connected");
    } catch {
      setStatus("error");
      setRules([]);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rules.filter((r) => {
      if (fCategory !== "all" && r.category !== fCategory) return false;
      if (fPriority !== "all" && r.priority !== fPriority) return false;
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (fApplies !== "all" && r.applies_to_type !== fApplies) return false;
      if (q) {
        const hay = `${r.title} ${r.description} ${r.applies_to_value ?? ""} ${(r.tags ?? []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rules, search, fCategory, fPriority, fStatus, fApplies]);

  const stats = useMemo(() => {
    const total = rules.length;
    const active = rules.filter((r) => r.status === "active").length;
    const cats = new Set(rules.map((r) => r.category)).size;
    const last = rules.reduce<string | null>((acc, r) => {
      if (!r.updated_at) return acc;
      if (!acc) return r.updated_at;
      return new Date(r.updated_at) > new Date(acc) ? r.updated_at : acc;
    }, null);
    return { total, active, cats, last };
  }, [rules]);

  const lastLabel = stats.last
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(stats.last))
    : "—";

  const statusPill = {
    loading: { label: "Carregando…", cls: "border-slate-200 bg-slate-50 text-slate-600", dot: "bg-slate-400" },
    connected: { label: "Base ativa", cls: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    empty: { label: "Base preparada — sem regras", cls: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
    table_missing: { label: "Migração pendente", cls: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    error: { label: "Falha ao carregar", cls: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  }[status];

  const openNew = () => {
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (r: Rule) => {
    setEditing(r);
    setSheetOpen(true);
  };

  const toggleStatus = async (r: Rule) => {
    const next: Status = r.status === "active" ? "paused" : "active";
    const { error } = await supabase
      .from(TABLE)
      .update({ status: next })
      .eq("id", r.id)
      .eq("company_id", ECOMMERCE_COMPANY_ID);
    if (error) {
      toast.error("Não foi possível alterar o status.");
      return;
    }
    toast.success(next === "active" ? "Regra ativada." : "Regra pausada.");
    void reload();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", deleting.id)
      .eq("company_id", ECOMMERCE_COMPANY_ID);
    setDeleting(null);
    if (error) {
      toast.error("Não foi possível excluir a regra.");
      return;
    }
    toast.success("Regra excluída.");
    void reload();
  };

  return (
    <EcommerceLayout>
      <div className="space-y-6">
        {/* Hero */}
        <section
          className="rounded-3xl border p-6 md:p-8 shadow-[var(--shadow-soft)]"
          style={{
            background:
              "linear-gradient(135deg, rgba(29,78,216,0.06) 0%, rgba(15,23,42,0.04) 100%)",
            borderColor: "var(--border-premium)",
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  Inteligência
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusPill.cls}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusPill.dot}`} />
                  {statusPill.label}
                </span>
                {activeAccount?.account_name && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    Conta ativa: {activeAccount.account_name}
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Regras da Operação
              </h1>
              <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">
                Cadastre regras de <strong>margem</strong>, <strong>preço</strong>,{" "}
                <strong>estoque</strong>, <strong>Ads</strong> e{" "}
                <strong>produtos prioritários</strong> para orientar o Diagnóstico
                Inteligente e o Assistente Estratégico da operação Mercado Livre.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={openNew}
                disabled={status === "table_missing"}
                className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Nova regra da IA
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard icon={Layers} label="Regras cadastradas" value={status === "loading" ? "—" : String(stats.total)} />
          <StatCard icon={Sparkles} label="Estratégias ativas" value={status === "loading" ? "—" : String(stats.active)} />
          <StatCard icon={Tag} label="Categorias mapeadas" value={status === "loading" ? "—" : String(stats.cats)} />
          <StatCard icon={Clock} label="Última atualização" value={status === "loading" ? "—" : lastLabel} />
        </section>

        {/* Migração pendente */}
        {status === "table_missing" && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Migração pendente no banco.</p>
              <p className="mt-0.5">
                Rode o script <code className="rounded bg-amber-100 px-1">docs/supabase/migrations/ecommerce_ai_knowledge_base.sql</code>{" "}
                no SQL editor do Supabase para habilitar o cadastro de regras.
              </p>
            </div>
          </div>
        )}

        {/* Info banner */}
        {status !== "table_missing" && (
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              As regras cadastradas aqui serão usadas como contexto para
              classificar produtos críticos, oportunidades de escala, bloqueios
              de margem, riscos de estoque e recomendações de anúncios.
            </p>
          </div>
        )}

        {/* Sections grid — visão das categorias */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {CATEGORIES.map((s) => {
            const Icon = s.icon;
            const count = rules.filter((r) => r.category === s.key).length;
            const active = rules.filter((r) => r.category === s.key && r.status === "active").length;
            return (
              <article
                key={s.key}
                className={`rounded-2xl border bg-gradient-to-br ${s.accent} p-5 shadow-sm hover:shadow-md transition`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${s.iconCls}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-foreground">{s.short}</h3>
                      <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                        {count} {count === 1 ? "regra" : "regras"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {active} ativa{active === 1 ? "" : "s"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                    onClick={() => {
                      setFCategory(s.key);
                      const el = document.getElementById("rules-list");
                      el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    Ver regras
                  </Button>
                </div>
              </article>
            );
          })}
        </section>

        {/* Listagem */}
        <section id="rules-list" className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
          <div className="p-4 md:p-5 border-b border-border/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Regras estratégicas cadastradas
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {status === "connected"
                    ? `${filtered.length} de ${rules.length} regras`
                    : "Sem regras cadastradas ainda."}
                </p>
              </div>
            </div>

            {/* Filtros */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-2">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, descrição, SKU…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={fCategory} onValueChange={(v) => setFCategory(v as typeof fCategory)}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={fPriority} onValueChange={(v) => setFPriority(v as typeof fPriority)}>
                <SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>{PRIORITY_META[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={fStatus} onValueChange={(v) => setFStatus(v as typeof fStatus)}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={fApplies} onValueChange={(v) => setFApplies(v as typeof fApplies)}>
                <SelectTrigger><SelectValue placeholder="Aplicação" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas aplicações</SelectItem>
                  {(Object.keys(APPLIES_TO_META) as AppliesTo[]).map((a) => (
                    <SelectItem key={a} value={a}>{APPLIES_TO_META[a].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 md:p-5">
            {status === "loading" && (
              <div className="py-10 text-center text-sm text-muted-foreground">Carregando regras…</div>
            )}

            {status === "error" && (
              <div className="py-10 text-center text-sm text-rose-700">
                Falha ao carregar regras. Tente novamente.
              </div>
            )}

            {(status === "empty" || status === "table_missing") && (
              <EmptyState onNew={openNew} disabled={status === "table_missing"} />
            )}

            {status === "connected" && filtered.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Nenhuma regra corresponde aos filtros aplicados.
              </div>
            )}

            {status === "connected" && filtered.length > 0 && (
              <ul className="divide-y divide-border/60">
                {filtered.map((r) => (
                  <RuleRow
                    key={r.id}
                    rule={r}
                    onView={() => setViewing(r)}
                    onEdit={() => openEdit(r)}
                    onToggle={() => toggleStatus(r)}
                    onDelete={() => setDeleting(r)}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Como a IA usará */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-700" />
            Como a IA usará essa base
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            As regras cadastradas aqui serão usadas como contexto para
            classificar produtos críticos, oportunidades de escala, bloqueios de
            margem, riscos de estoque e recomendações de anúncios no Radar IA,
            Consultor IA e Central de Ações.
          </p>
        </section>
      </div>

      {/* Formulário lateral */}
      <RuleSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
        accountId={activeAccount?.id ?? null}
        onSaved={() => {
          setSheetOpen(false);
          void reload();
        }}
      />

      {/* View drawer */}
      <ViewSheet rule={viewing} onOpenChange={(o) => !o && setViewing(null)} />

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. A regra “{deleting?.title}” será
              removida da Base da IA.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EcommerceLayout>
  );
}

// ---------------------------------------------------------------------------
// Rule row
// ---------------------------------------------------------------------------

function RuleRow({
  rule,
  onView,
  onEdit,
  onToggle,
  onDelete,
}: {
  rule: Rule;
  onView: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const cat = CATEGORY_MAP[rule.category];
  const CatIcon = cat.icon;
  const prio = PRIORITY_META[rule.priority];
  const appliesLabel = APPLIES_TO_META[rule.applies_to_type].label;
  const updated = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(rule.updated_at));

  return (
    <li className="py-3.5 flex flex-wrap items-start gap-3">
      <div className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${cat.iconCls}`}>
        <CatIcon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            {cat.label}
          </Badge>
          <Badge variant="outline" className={`text-[10px] ${prio.cls}`}>
            {prio.label}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] ${
              rule.status === "active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {rule.status === "active" ? "Ativa" : "Pausada"}
          </Badge>
          <span className="text-[11px] text-muted-foreground">{appliesLabel}{rule.applies_to_value ? ` · ${rule.applies_to_value}` : ""}</span>
        </div>
        <div className="mt-1 font-semibold text-foreground text-sm">{rule.title}</div>
        <p className="text-sm text-muted-foreground line-clamp-2">{rule.description}</p>
        <div className="mt-1 text-[11px] text-muted-foreground">Atualizada em {updated}</div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button size="sm" variant="ghost" onClick={onView} title="Ver">
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onEdit} title="Editar">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onToggle} title={rule.status === "active" ? "Pausar" : "Ativar"}>
          {rule.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} title="Excluir" className="text-rose-600 hover:text-rose-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ onNew, disabled }: { onNew: () => void; disabled: boolean }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
        <BrainCircuit className="h-6 w-6 text-blue-700" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
        Nenhuma regra estratégica cadastrada ainda. Cadastre regras de margem,
        preço, estoque e Ads para orientar o Radar IA e o Consultor IA.
      </p>
      <Button
        onClick={onNew}
        disabled={disabled}
        className="mt-4 bg-blue-700 hover:bg-blue-800 text-white"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Cadastrar primeira regra
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View sheet
// ---------------------------------------------------------------------------

function ViewSheet({
  rule,
  onOpenChange,
}: {
  rule: Rule | null;
  onOpenChange: (o: boolean) => void;
}) {
  const open = !!rule;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {rule && (
          <>
            <SheetHeader>
              <SheetTitle>{rule.title}</SheetTitle>
              <SheetDescription>
                {CATEGORY_MAP[rule.category].label} ·{" "}
                {PRIORITY_META[rule.priority].label} ·{" "}
                {APPLIES_TO_META[rule.applies_to_type].label}
                {rule.applies_to_value ? ` (${rule.applies_to_value})` : ""}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Descrição</div>
                <p className="mt-1 whitespace-pre-wrap">{rule.description}</p>
              </div>
              {rule.notes && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Observação interna</div>
                  <p className="mt-1 whitespace-pre-wrap">{rule.notes}</p>
                </div>
              )}
              <div className="text-[11px] text-muted-foreground">
                Criada em {new Date(rule.created_at).toLocaleString("pt-BR")} · Atualizada em{" "}
                {new Date(rule.updated_at).toLocaleString("pt-BR")}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Form sheet (create/edit)
// ---------------------------------------------------------------------------

type FormState = {
  title: string;
  category: Category;
  description: string;
  priority: Priority;
  applies_to_type: AppliesTo;
  applies_to_value: string;
  status: Status;
  notes: string;
};

function emptyForm(): FormState {
  return {
    title: "",
    category: "margem",
    description: "",
    priority: "medium",
    applies_to_type: "operation",
    applies_to_value: "",
    status: "active",
    notes: "",
  };
}

function RuleSheet({
  open,
  onOpenChange,
  editing,
  accountId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Rule | null;
  accountId: string | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: editing.title,
        category: editing.category,
        description: editing.description,
        priority: editing.priority,
        applies_to_type: editing.applies_to_type,
        applies_to_value: editing.applies_to_value ?? "",
        status: editing.status,
        notes: editing.notes ?? "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, editing]);

  const requiresValue = form.applies_to_type !== "operation";

  const submit = async () => {
    if (!form.title.trim()) return toast.error("Informe o título da regra.");
    if (!form.description.trim()) return toast.error("Informe a descrição.");
    if (requiresValue && !form.applies_to_value.trim()) {
      return toast.error("Informe o alvo da aplicação (categoria/SKU/produto/conta).");
    }
    setSaving(true);
    try {
      const payload = {
        company_id: ECOMMERCE_COMPANY_ID,
        account_id: accountId,
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        priority: form.priority,
        applies_to_type: form.applies_to_type,
        applies_to_value: requiresValue ? form.applies_to_value.trim() : null,
        status: form.status,
        notes: form.notes.trim() || null,
      };
      if (editing) {
        const { error } = await supabase
          .from(TABLE)
          .update(payload)
          .eq("id", editing.id)
          .eq("company_id", ECOMMERCE_COMPANY_ID);
        if (error) throw error;
        toast.success("Regra atualizada.");
      } else {
        const { error } = await supabase.from(TABLE).insert(payload);
        if (error) throw error;
        toast.success("Regra cadastrada.");
      }
      onSaved();
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? "Erro ao salvar.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? "Editar regra" : "Nova regra da IA"}</SheetTitle>
          <SheetDescription>
            Regras são usadas como contexto pela IA do E-commerce Intelligence.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <Field label="Título">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex.: Margem mínima 18% em Automotivo"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Prioridade">
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>{PRIORITY_META[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Descrição">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Explique a regra que a IA deve considerar."
              rows={4}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Aplicação">
              <Select
                value={form.applies_to_type}
                onValueChange={(v) => setForm({ ...form, applies_to_type: v as AppliesTo, applies_to_value: "" })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(APPLIES_TO_META) as AppliesTo[]).map((a) => (
                    <SelectItem key={a} value={a}>{APPLIES_TO_META[a].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {requiresValue && (
            <Field label={`Alvo (${APPLIES_TO_META[form.applies_to_type].label.toLowerCase()})`}>
              <Input
                value={form.applies_to_value}
                onChange={(e) => setForm({ ...form, applies_to_value: e.target.value })}
                placeholder={APPLIES_TO_META[form.applies_to_type].placeholder}
              />
            </Field>
          )}

          <Field label="Observação interna (opcional)">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Contexto adicional para o time."
              rows={3}
            />
          </Field>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving} className="bg-blue-700 hover:bg-blue-800 text-white">
            {saving ? "Salvando…" : editing ? "Salvar alterações" : "Cadastrar regra"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 font-display text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}

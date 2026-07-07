import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { supabase } from "@/lib/supabase";
import { ECOMMERCE_COMPANY_ID } from "@/lib/ecommerce-active-account";

export const Route = createFileRoute("/ecommerce/base-ia")({
  head: () => ({
    meta: [
      { title: "Base da IA — AC360 E-commerce Intelligence" },
      {
        name: "description",
        content:
          "Regras e orientações estratégicas que alimentam a IA do AC360 E-commerce Intelligence na análise de produtos, anúncios, margem e estoque.",
      },
    ],
  }),
  component: BaseIaPage,
});

type LoadStatus = "loading" | "connected" | "empty" | "unavailable";

type KbItem = {
  id: string;
  title: string | null;
  category: string | null;
  updated_at: string | null;
};

const SECTIONS = [
  {
    key: "margem",
    title: "Regras de margem",
    description:
      "Margem mínima aceitável, margem alvo por categoria e limites para promoções.",
    icon: DollarSign,
    accent: "from-emerald-500/10 to-emerald-500/0 border-emerald-200",
    iconCls: "bg-emerald-600 text-white",
  },
  {
    key: "preco",
    title: "Regras de preço",
    description:
      "Estratégia de precificação, resposta à concorrência e política de descontos.",
    icon: Tag,
    accent: "from-blue-500/10 to-blue-500/0 border-blue-200",
    iconCls: "bg-blue-700 text-white",
  },
  {
    key: "estoque",
    title: "Regras de estoque",
    description:
      "Cobertura mínima, ponto de recompra, produtos que não podem ficar sem estoque.",
    icon: Boxes,
    accent: "from-amber-500/10 to-amber-500/0 border-amber-200",
    iconCls: "bg-amber-600 text-white",
  },
  {
    key: "ads",
    title: "Estratégia de anúncios e Ads",
    description:
      "Orientações de títulos, descrições, fotos, kits e campanhas de mídia.",
    icon: Megaphone,
    accent: "from-fuchsia-500/10 to-fuchsia-500/0 border-fuchsia-200",
    iconCls: "bg-fuchsia-600 text-white",
  },
  {
    key: "prioritarios",
    title: "Produtos prioritários",
    description:
      "Produtos-chave, que não devem ser pausados e critérios para crítico / oportunidade / prioridade.",
    icon: Star,
    accent: "from-indigo-500/10 to-indigo-500/0 border-indigo-200",
    iconCls: "bg-indigo-600 text-white",
  },
  {
    key: "observacoes",
    title: "Observações da operação",
    description:
      "Notas internas do time (Thiago / Robomix) e contexto que a IA precisa considerar.",
    icon: NotebookPen,
    accent: "from-slate-500/10 to-slate-500/0 border-slate-200",
    iconCls: "bg-slate-800 text-white",
  },
] as const;

function BaseIaPage() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [items, setItems] = useState<KbItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("knowledge_base")
          .select("id, title, category, updated_at")
          .eq("company_id", ECOMMERCE_COMPANY_ID)
          .order("updated_at", { ascending: false })
          .limit(200);

        if (cancelled) return;
        if (error) {
          setStatus("unavailable");
          return;
        }
        const rows = (data ?? []) as KbItem[];
        setItems(rows);
        setStatus(rows.length === 0 ? "empty" : "connected");
      } catch {
        if (!cancelled) setStatus("unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const categories = new Set(
      items.map((i) => (i.category ?? "").trim()).filter(Boolean),
    );
    const last = items.reduce<string | null>((acc, i) => {
      if (!i.updated_at) return acc;
      if (!acc) return i.updated_at;
      return new Date(i.updated_at) > new Date(acc) ? i.updated_at : acc;
    }, null);
    return {
      total,
      categories: categories.size,
      strategies: Math.min(total, SECTIONS.length),
      last,
    };
  }, [items]);

  const lastLabel = stats.last
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(stats.last))
    : "—";

  const statusPill = {
    loading: {
      label: "Carregando…",
      cls: "border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
    },
    connected: {
      label: "Base conectada",
      cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
    empty: {
      label: "Base preparada — sem registros",
      cls: "border-blue-200 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    },
    unavailable: {
      label: "Persistência será conectada",
      cls: "border-amber-200 bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },
  }[status];

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
              <div className="flex items-center gap-2 mb-2">
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
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Base da IA
              </h1>
              <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">
                Cadastre regras e orientações estratégicas para a IA analisar
                produtos, anúncios, margem e estoque com mais contexto. Essa
                base alimenta o <strong>Radar IA</strong>, o{" "}
                <strong>Consultor IA</strong> e as recomendações da operação
                Mercado Livre.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-700" />
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Contexto aplicado em
                </div>
                <div className="text-sm font-semibold text-foreground">
                  Radar IA · Consultor IA · Recomendações
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={Layers}
            label="Regras cadastradas"
            value={status === "loading" ? "—" : String(stats.total)}
          />
          <StatCard
            icon={Sparkles}
            label="Estratégias ativas"
            value={status === "loading" ? "—" : String(stats.strategies)}
          />
          <StatCard
            icon={Tag}
            label="Categorias mapeadas"
            value={status === "loading" ? "—" : String(stats.categories)}
          />
          <StatCard
            icon={Clock}
            label="Última atualização"
            value={status === "loading" ? "—" : lastLabel}
          />
        </section>

        {/* Info banner */}
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            status === "unavailable"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-blue-200 bg-blue-50 text-blue-900"
          }`}
        >
          {status === "unavailable" ? (
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <p>
            {status === "connected"
              ? "Leitura conectada à base de conhecimento da operação. O cadastro/edição direto por esta tela será liberado na próxima etapa."
              : "Base da IA preparada. A persistência no Supabase será conectada na próxima etapa."}
          </p>
        </div>

        {/* Sections grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <article
                key={s.key}
                className={`rounded-2xl border bg-gradient-to-br ${s.accent} p-5 shadow-sm hover:shadow-md transition`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${s.iconCls}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-foreground">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Estrutura pronta
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Edição em breve
                  </span>
                </div>
              </article>
            );
          })}
        </section>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground">
          Esta base é usada exclusivamente pelo módulo E-commerce Intelligence
          para orientar análises, prioridades e recomendações.
        </p>
      </div>
    </EcommerceLayout>
  );
}

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
      <div className="mt-2 font-display text-xl font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

/**
 * AcademyGuideTemplate — biblioteca oficial de componentes reutilizáveis
 * usados pelos guias da Academia AC360 E-commerce.
 *
 * Todos os guias futuros devem consumir estes componentes para manter
 * consistência de identidade visual, hierarquia e experiência de aprendizado.
 *
 * Nada aqui altera lógica de negócio, Supabase, Mercado Livre ou localStorage.
 * O progresso continua sendo controlado pelo hook useAcademiaProgress.
 */
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Compass,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  ListChecks,
  Lock,
  MinusCircle,
  PlayCircle,
  PlusCircle,
  Quote,
  Sparkles,
  Table as TableIcon,
  ThumbsUp,
  Workflow,
  XCircle,
} from "lucide-react";
import type { AcademiaStatus } from "@/lib/academia-progress";

type Icon = ComponentType<{ className?: string }>;

// ---------------------------------------------------------------------------
// StatusPill — status do guia (não iniciado / em estudo / concluído)
// ---------------------------------------------------------------------------
export function StatusPill({ status }: { status: AcademiaStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Concluído
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
        <PlayCircle className="h-3 w-3" />
        Em estudo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      <Circle className="h-3 w-3" />
      Não iniciado
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section — bloco padrão com eyebrow + título + ícone
// ---------------------------------------------------------------------------
export function Section({
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  icon: Icon;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Bloco {eyebrow}
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            {title}
          </h2>
        </div>
      </div>
      <div className="prose prose-sm max-w-none text-sm md:text-[15px] text-foreground/90 leading-relaxed [&_strong]:text-foreground [&_em]:text-foreground/80 space-y-3">
        {children}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CentralQuestionCard — pergunta central do módulo
// ---------------------------------------------------------------------------
export function CentralQuestionCard({ question }: { question: string }) {
  return (
    <section
      aria-label="Pergunta central do módulo"
      className="relative overflow-hidden rounded-2xl border border-blue-200 bg-white p-6 md:p-8 shadow-[var(--shadow-card)]"
    >
      <div
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shrink-0 shadow-lg"
          style={{ background: "var(--gradient-brand)" }}
        >
          <HelpCircle className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Pergunta central deste módulo
          </div>
          <p className="font-display text-xl md:text-2xl font-bold text-foreground mt-2 leading-snug">
            “{question}”
          </p>
          <p className="text-xs md:text-sm text-muted-foreground mt-2">
            Toda vez que abrir este módulo, é essa a pergunta que ele deve
            responder para o operador.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ProblemSolutionSection — Sem × Com este módulo
// ---------------------------------------------------------------------------
export function ProblemSolutionSection({
  without,
  with_,
}: {
  without: { title: string; points: string[] };
  with_: { title: string; points: string[] };
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 to-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700">
          <MinusCircle className="h-3.5 w-3.5" />
          Cenário atual
        </div>
        <h2 className="font-display text-lg md:text-xl font-bold text-foreground mt-2 leading-tight">
          {without.title}
        </h2>
        <ul className="mt-3 space-y-2">
          {without.points.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <MinusCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
          <PlusCircle className="h-3.5 w-3.5" />
          Cenário com AC360
        </div>
        <h2 className="font-display text-lg md:text-xl font-bold text-foreground mt-2 leading-tight">
          {with_.title}
        </h2>
        <ul className="mt-3 space-y-2">
          {with_.points.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <PlusCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// LearningObjectivesSection — objetivos de aprendizagem
// ---------------------------------------------------------------------------
export function LearningObjectivesSection({ objectives }: { objectives: string[] }) {
  return (
    <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white border border-blue-700 shrink-0">
          <ListChecks className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Objetivos de aprendizagem
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            Ao concluir esta aula você será capaz de:
          </h2>
        </div>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {objectives.map((o, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-blue-100 bg-white p-3"
          >
            <CheckCircle2 className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground/90 leading-relaxed">{o}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ModuleFlow — fluxo operacional visual
// ---------------------------------------------------------------------------
export type FlowStep = { label: string; hint?: string; highlight?: boolean };

export function ModuleFlow({
  title,
  description,
  steps,
}: {
  title: string;
  description?: string;
  steps: FlowStep[];
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
          <Workflow className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Fluxo operacional
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            {title}
          </h2>
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mb-5 max-w-3xl">{description}</p>
      )}
      <ol className="flex flex-col gap-2">
        {steps.map((s, i) => (
          <li key={i} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 border ${
                  s.highlight
                    ? "bg-blue-700 text-white border-blue-700"
                    : "bg-white text-blue-700 border-blue-200"
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="w-px flex-1 bg-blue-200 my-1" />}
            </div>
            <div
              className={`flex-1 rounded-xl border p-3 md:p-4 ${
                s.highlight ? "border-blue-200 bg-blue-50/60" : "border-border/60 bg-white"
              }`}
            >
              <div className="font-display text-sm md:text-base font-bold text-foreground">
                {s.label}
              </div>
              {s.hint && (
                <div className="text-xs text-muted-foreground mt-0.5">{s.hint}</div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ImagePlaceholder — figura preparada para receber prints reais
// ---------------------------------------------------------------------------
export function ImagePlaceholder({
  order,
  title,
  caption,
  alt,
  annotations,
}: {
  order: number;
  title: string;
  caption: string;
  alt: string;
  annotations: string[];
}) {
  return (
    <figure className="mt-4 overflow-hidden rounded-2xl border border-dashed border-blue-200 bg-blue-50/30">
      <div
        role="img"
        aria-label={alt}
        className="relative aspect-[16/9] w-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-white text-blue-700"
      >
        <ImageIcon className="h-10 w-10 opacity-60" />
        <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
          Imagem {order} — aguardando captura real do AC360
        </div>
        <div className="text-[11px] text-muted-foreground max-w-md text-center px-6">
          {alt}
        </div>
      </div>
      <figcaption className="p-4 md:p-5 space-y-3 bg-white border-t border-blue-100">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
            Imagem {order}
          </div>
          <div className="font-display text-sm md:text-base font-bold text-foreground">
            {title}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{caption}</div>
        </div>
        {annotations.length > 0 && (
          <ol className="space-y-1.5">
            {annotations.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-white text-[10px] font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{a}</span>
              </li>
            ))}
          </ol>
        )}
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// ScreenTourSection — tour visual da tela com itens numerados ①②③④⑤
// ---------------------------------------------------------------------------
export function ScreenTourSection({
  title,
  description,
  mainImage,
  items,
}: {
  title: string;
  description?: string;
  mainImage: { order: number; title: string; caption: string; alt: string };
  items: { title: string; description: string }[];
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Tour da tela
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            {title}
          </h2>
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mb-5 max-w-3xl">{description}</p>
      )}
      <ImagePlaceholder
        order={mainImage.order}
        title={mainImage.title}
        caption={mainImage.caption}
        alt={mainImage.alt}
        annotations={[]}
      />
      <ol className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-white p-4"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-white font-bold text-sm shrink-0 shadow-md"
              style={{ background: "var(--gradient-brand)" }}
              aria-label={`Item ${i + 1}`}
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold text-foreground">
                {it.title}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {it.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------
// InventoryTable — inventário da tela em formato tabela reutilizável
// (Componente | Finalidade | Exemplo)
// ---------------------------------------------------------------------------
export type InventoryRow = { component: string; purpose: string; example: string };

export function InventoryTable({
  rows,
  title = "Inventário da tela",
  description = "Componentes visuais presentes nesta tela do AC360 E-commerce.",
}: {
  rows: InventoryRow[];
  title?: string;
  description?: string;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
          <TableIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Inventário da tela
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            {title}
          </h2>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4 max-w-3xl">{description}</p>
      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="grid grid-cols-[1fr,1.4fr,1.4fr] bg-muted/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <div>Componente</div>
          <div>Finalidade</div>
          <div>Exemplo</div>
        </div>
        <ul className="divide-y divide-border/60">
          {rows.map((r, i) => (
            <li
              key={i}
              className="grid grid-cols-[1fr,1.4fr,1.4fr] gap-3 px-4 py-3 bg-white"
            >
              <div className="flex items-start gap-2 text-sm font-bold text-foreground">
                <Layers className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                {r.component}
              </div>
              <div className="text-sm text-foreground/80 leading-relaxed">{r.purpose}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{r.example}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ComponentsInventory — versão em cards (mantida para compatibilidade)
// ---------------------------------------------------------------------------
export function ComponentsInventory({
  items,
}: {
  items: { label: string; icon: Icon; description: string }[];
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Componentes da tela
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            O que aparece visualmente neste módulo
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((it, i) => {
          const IconEl = it.icon;
          return (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-white p-3 flex flex-col items-start"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100 mb-2">
                <IconEl className="h-4 w-4" />
              </div>
              <div className="font-display text-sm font-bold text-foreground">
                {it.label}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {it.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// RulesSection — regras importantes do módulo
// ---------------------------------------------------------------------------
export function RulesSection({
  items,
}: {
  items: { label: string; description: string }[];
}) {
  return (
    <section className="rounded-2xl border border-amber-100 bg-amber-50/30 p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
            Regras importantes
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            Regras de negócio deste módulo
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-xl border border-amber-200/70 bg-white p-4"
          >
            <div className="font-display text-sm font-bold text-foreground">
              {it.label}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {it.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// BestPracticesSection — boas práticas
// ---------------------------------------------------------------------------
export function BestPracticesSection({ items }: { items: string[] }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
          <ThumbsUp className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Boas práticas
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            Como grandes operadores usam este módulo
          </h2>
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-white p-3"
          >
            <ThumbsUp className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground/90 leading-relaxed">{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CommonErrorsSection — erros comuns
// ---------------------------------------------------------------------------
export function CommonErrorsSection({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  return (
    <section className="rounded-2xl border border-rose-100 bg-rose-50/30 p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
          <XCircle className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700">
            Erros comuns
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            O que evitar ao usar este módulo
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-rose-200/70 bg-white p-4">
            <div className="font-display text-sm font-bold text-foreground">
              {it.title}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {it.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// LearningsSection — o que você aprendeu
// ---------------------------------------------------------------------------
export function LearningsSection({ items }: { items: string[] }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 md:p-7 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            O que você aprendeu
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            Resumo do que este guia entregou
          </h2>
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-white p-3"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground/90 leading-relaxed">{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// NextGuideCard — próximo guia (card premium)
// ---------------------------------------------------------------------------
import { Button } from "@/components/ui/button";

export function NextGuideCard({
  available,
  category,
  title,
  description,
  onCompleteCurrent,
  onContinue,
}: {
  available: boolean;
  category: string;
  title: string;
  description: string;
  onCompleteCurrent?: () => void;
  onContinue?: () => void;
}) {
  return (
    <section
      aria-label="Próximo guia"
      className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 md:p-8 shadow-[var(--shadow-card)]"
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Próximo guia
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              {category}
            </span>
            {!available && (
              <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Em breve
              </span>
            )}
          </div>
          <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mt-2 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
          {onCompleteCurrent && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCompleteCurrent}
              className="w-full md:w-auto"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Concluir guia atual
            </Button>
          )}
          <Button
            size="sm"
            disabled={!available}
            onClick={onContinue}
            className="w-full md:w-auto"
            title={available ? "Ir para o próximo guia" : "Este guia será liberado em breve"}
          >
            Continuar aprendizado
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ConsultantTipCard — dica do Consultor AC360 (card premium destacado)
// ---------------------------------------------------------------------------
export function ConsultantTipCard({
  author,
  role,
  quote,
}: {
  author: string;
  role: string;
  quote: string;
}) {
  return (
    <section
      aria-label="Dica do Consultor AC360"
      className="relative overflow-hidden rounded-3xl border border-blue-900/20 p-6 md:p-8 shadow-[var(--shadow-card)] text-white"
      style={{ background: "var(--gradient-brand)" }}
    >
      <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-start gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20 shrink-0 backdrop-blur-sm">
          <Quote className="h-7 w-7 text-white" />
        </div>
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">
            <Sparkles className="h-3 w-3" />
            Dica do Consultor AC360
          </div>
          <blockquote className="font-display text-lg md:text-2xl font-bold text-white mt-3 leading-snug">
            “{quote}”
          </blockquote>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white font-bold text-sm border border-white/25">
              {author.charAt(0)}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-white">{author}</div>
              <div className="text-[11px] text-white/80">{role}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// MentorIACard — placeholder do Mentor IA (estrutura preparada, sem IA ligada)
// ---------------------------------------------------------------------------
export function MentorIACard({
  moduleName,
  suggestedQuestions = [],
}: {
  moduleName: string;
  suggestedQuestions?: string[];
}) {
  return (
    <section
      aria-label="Mentor IA AC360"
      className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-slate-50 via-blue-50/40 to-white p-6 md:p-8 shadow-[var(--shadow-soft)]"
    >
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <Lock className="h-3 w-3" />
          Em breve
        </span>
      </div>
      <div className="flex flex-col md:flex-row md:items-start gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-blue-100 shrink-0 shadow-sm">
          <Bot className="h-7 w-7 text-blue-700" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Mentor IA AC360
          </div>
          <h3 className="font-display text-lg md:text-xl font-bold text-foreground mt-1 leading-tight">
            Em breve você poderá conversar com a IA sobre {moduleName}.
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            O Mentor IA vai responder dúvidas específicas deste módulo com base
            na Biblioteca Técnica AC360 e no contexto real da sua operação.
          </p>
          {suggestedQuestions.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Perguntas que você poderá fazer
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((q, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-xl border border-dashed border-border/70 bg-white/60 p-3 text-sm text-muted-foreground"
                  >
                    <HelpCircle className="h-4 w-4 text-blue-700/70 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">“{q}”</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-5">
            <Button size="sm" variant="outline" disabled className="cursor-not-allowed">
              <Bot className="h-4 w-4 mr-1.5" />
              Conversar com o Mentor IA
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// TechnicalLibrarySection — bloco de arquitetura (não visível ao cliente por
// padrão). Fica preparado para futura integração com a Biblioteca Técnica AC360.
// ---------------------------------------------------------------------------
export type TechnicalReference = {
  code: string;
  title: string;
  description?: string;
};

export function TechnicalLibrarySection({
  references,
  visible = false,
}: {
  references: TechnicalReference[];
  visible?: boolean;
}) {
  if (!visible) return null;
  return (
    <section
      aria-label="Biblioteca Técnica AC360"
      className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white border border-slate-800 shrink-0">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
            Biblioteca Técnica — arquitetura interna
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
            Referências técnicas ligadas a este guia
          </h2>
        </div>
      </div>
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white overflow-hidden">
        {references.map((r, i) => (
          <li key={i} className="flex items-start gap-3 p-3">
            <span className="font-mono text-[10px] font-bold text-slate-500 mt-0.5 shrink-0">
              {r.code}
            </span>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold text-foreground">{r.title}</div>
              {r.description && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {r.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Componentes visuais utilitários — callouts, checklists, tabelas, timelines
// ---------------------------------------------------------------------------
export type Tone = "blue" | "emerald" | "amber" | "rose";
const TONE: Record<Tone, { bg: string; border: string; icon: string; chip: string }> = {
  blue: { bg: "bg-blue-50/60", border: "border-blue-200", icon: "bg-blue-700 text-white", chip: "text-blue-700" },
  emerald: { bg: "bg-emerald-50/60", border: "border-emerald-200", icon: "bg-emerald-600 text-white", chip: "text-emerald-700" },
  amber: { bg: "bg-amber-50/60", border: "border-amber-200", icon: "bg-amber-500 text-white", chip: "text-amber-700" },
  rose: { bg: "bg-rose-50/60", border: "border-rose-200", icon: "bg-rose-600 text-white", chip: "text-rose-700" },
};

export function CalloutGrid({
  items,
}: {
  items: { tone: Tone; icon: Icon; title: string; text: string }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 not-prose">
      {items.map((it, i) => {
        const t = TONE[it.tone];
        const IconEl = it.icon;
        return (
          <div key={i} className={`rounded-xl border ${t.border} ${t.bg} p-4`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.icon} mb-3`}>
              <IconEl className="h-4 w-4" />
            </div>
            <div className="font-display text-sm font-bold text-foreground">{it.title}</div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{it.text}</p>
          </div>
        );
      })}
    </div>
  );
}

export function ChecklistCards({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 not-prose">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-white p-4 flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold shrink-0">
            {i + 1}
          </div>
          <div className="min-w-0">
            <div className="font-display text-sm font-bold text-foreground">{it.title}</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{it.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnatomyRow({ items }: { items: { label: string; text: string }[] }) {
  return (
    <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-2">
      {items.map((it, i) => (
        <div
          key={i}
          className="relative rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-4"
        >
          <div className="absolute top-3 right-3 text-[10px] font-mono font-bold text-blue-700/40">
            0{i + 1}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Elemento
          </div>
          <div className="font-display text-base font-bold text-foreground mt-1">{it.label}</div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{it.text}</p>
        </div>
      ))}
    </div>
  );
}

export function InterpretationTable({ rows }: { rows: { signal: string; action: string }[] }) {
  return (
    <div className="not-prose overflow-hidden rounded-xl border border-border/60 bg-white">
      <div className="grid grid-cols-[1.2fr,1.5fr] bg-muted/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <div>Sinal identificado</div>
        <div>Como interpretar</div>
      </div>
      <ul className="divide-y divide-border/60">
        {rows.map((r, i) => (
          <li key={i} className="grid grid-cols-[1.2fr,1.5fr] gap-3 px-4 py-3">
            <div className="flex items-start gap-2 text-sm font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              {r.signal}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">{r.action}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OperationalTimeline({
  steps,
}: {
  steps: { title: string; text: string; icon: Icon }[];
}) {
  return (
    <ol className="not-prose relative space-y-3">
      {steps.map((s, i) => {
        const IconEl = s.icon;
        const last = i === steps.length - 1;
        return (
          <li key={i} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white shadow-md shrink-0">
                <IconEl className="h-4 w-4" />
              </div>
              {!last && <div className="w-px flex-1 bg-blue-200 my-1" />}
            </div>
            <div className="flex-1 rounded-xl border border-border/60 bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Etapa {i + 1}
                </span>
              </div>
              <div className="font-display text-sm md:text-base font-bold text-foreground mt-0.5">
                {s.title}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                {s.text}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// PracticalExampleTimeline — Situação → Análise → Decisão → Resultado
// ---------------------------------------------------------------------------
export function PracticalExampleTimeline({
  steps,
}: {
  steps: { stage: "Situação" | "Análise" | "Decisão" | "Resultado" | string; title: string; text: string }[];
}) {
  const stageStyles: Record<string, { icon: Icon; color: string; bg: string; border: string }> = {
    Situação: { icon: BookOpen, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
    Análise: { icon: Lightbulb, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    Decisão: { icon: Compass, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
    Resultado: { icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  };
  return (
    <ol className="not-prose space-y-3">
      {steps.map((s, i) => {
        const style = stageStyles[s.stage] ?? stageStyles["Situação"];
        const IconEl = style.icon;
        const last = i === steps.length - 1;
        return (
          <li key={i} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${style.bg} ${style.color} border ${style.border} shrink-0`}
              >
                <IconEl className="h-4 w-4" />
              </div>
              {!last && <div className="w-px flex-1 bg-border my-1" />}
            </div>
            <div className={`flex-1 rounded-xl border ${style.border} ${style.bg}/40 p-4`}>
              <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${style.color}`}>
                {s.stage}
              </div>
              <div className="font-display text-sm md:text-base font-bold text-foreground mt-0.5">
                {s.title}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                {s.text}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ScenarioCard({
  scenario,
  wrong,
  right,
}: {
  scenario: string;
  wrong: string;
  right: { title: string; text: string }[];
}) {
  return (
    <div className="not-prose space-y-3">
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          Cenário
        </div>
        <p className="font-display text-base md:text-lg font-bold text-foreground mt-2 leading-snug">
          {scenario}
        </p>
      </div>
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 flex items-center gap-1.5">
          <XCircle className="h-3.5 w-3.5" />
          Reação errada
        </div>
        <p className="text-sm text-foreground/90 mt-1.5 leading-relaxed">{wrong}</p>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Caminho correto
        </div>
        <ol className="mt-3 space-y-2">
          {right.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg border border-emerald-200/70 bg-white p-3"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="font-display text-sm font-bold text-foreground">{r.title}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function NextActionsGrid({
  items,
}: {
  items: { step: string; title: string; text: string; icon: Icon }[];
}) {
  return (
    <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((it, i) => {
        const IconEl = it.icon;
        return (
          <div
            key={i}
            className="relative rounded-xl border border-border/60 bg-white p-4 overflow-hidden"
          >
            <div
              className="absolute inset-x-0 top-0 h-0.5"
              style={{ background: "var(--gradient-brand)" }}
            />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                <IconEl className="h-4 w-4" />
              </div>
              <span className="font-display text-2xl font-bold text-blue-700/30">
                {it.step}
              </span>
            </div>
            <div className="font-display text-sm font-bold text-foreground mt-2">
              {it.title}
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{it.text}</p>
          </div>
        );
      })}
    </div>
  );
}

export function WarningCallouts({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="not-prose space-y-2.5">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border-l-4 border-amber-400 border-y border-r border-y-amber-100 border-r-amber-100 bg-amber-50/50 p-4"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="font-display text-sm font-bold text-foreground">{it.title}</div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
              {it.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ClickableChecklist — checklist clicável reutilizável.
// Recebe items e uma função para persistir o estado (delegada ao route
// para manter o localStorage compartilhado com useAcademiaProgress).
// ---------------------------------------------------------------------------
export function ClickableChecklist({
  items,
  isDone,
  onToggle,
}: {
  items: string[];
  isDone: (index: number) => boolean;
  onToggle: (index: number) => void;
}) {
  return (
    <ul className="space-y-2 not-prose">
      {items.map((item, i) => {
        const done = isDone(i);
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => onToggle(i)}
              className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                done
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-border/60 bg-white hover:border-blue-300 hover:bg-blue-50/40"
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span
                className={`text-sm ${
                  done ? "text-emerald-800 font-medium" : "text-foreground"
                }`}
              >
                {item}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// Re-export utilitário para consumo pelos routes
export { ClipboardCheck };

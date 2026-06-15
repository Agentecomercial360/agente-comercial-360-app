import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  X,
  User,
  Phone,
  MessageSquare,
  Tag,
  Package,
  UserCog,
  Activity,
  DollarSign,
  CalendarClock,
  FileText,
  Save,
} from "lucide-react";

export type NovoAtendimentoData = {
  cliente: string;
  telefone: string;
  canal: string;
  tipo: string;
  produto: string;
  responsavel: string;
  status: string;
  valor: string;
  proximoRetorno: string;
  observacoes: string;
};

const initialData: NovoAtendimentoData = {
  cliente: "",
  telefone: "",
  canal: "WhatsApp",
  tipo: "Venda",
  produto: "",
  responsavel: "",
  status: "Novo",
  valor: "",
  proximoRetorno: "",
  observacoes: "",
};

const CANAIS = ["WhatsApp", "Balcão", "Telefone", "Instagram", "E-mail", "Manual"];
const TIPOS = ["Venda", "Orçamento", "Suporte", "Financeiro", "Administrativo"];
const STATUS = ["Novo", "Em andamento", "Aguardando cliente", "Fechado", "Perdido"];

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: NovoAtendimentoData) => void | Promise<void>;
};

export function NovoAtendimentoModal({ open, onClose, onSave }: Props) {
  const [data, setData] = useState<NovoAtendimentoData>(initialData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setData(initialData);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const update = <K extends keyof NovoAtendimentoData>(key: K, value: NovoAtendimentoData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.cliente.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    setSaving(true);
    try {
      await onSave?.(data);
      onClose();
    } catch {
      // O handler do parent já exibe um toast de erro.
      // Mantém o modal aberto para o usuário corrigir/re-tentar.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative my-4 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-5">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-white/20">
                <Activity className="h-3 w-3" /> Novo registro
              </span>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
                Novo atendimento
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-blue-100/80">
                Registre um atendimento de qualquer canal: WhatsApp, balcão, telefone, Instagram, e-mail ou manual.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-blue-100/80 hover:bg-white/10 hover:text-white transition"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto bg-slate-50/50">
          {/* Seção 1 — Cliente */}
          <Section title="Dados do cliente" subtitle="Identificação básica do contato">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente" required icon={User}>
                <input
                  type="text"
                  value={data.cliente}
                  onChange={(e) => update("cliente", e.target.value)}
                  placeholder="Nome completo"
                  className={inputClass}
                />
              </Field>
              <Field label="Telefone" icon={Phone}>
                <input
                  type="tel"
                  value={data.telefone}
                  onChange={(e) => update("telefone", e.target.value)}
                  placeholder="(15) 99999-0000"
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          {/* Seção 2 — Atendimento */}
          <Section title="Detalhes do atendimento" subtitle="Origem, tipo e o que foi solicitado">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Canal de origem" icon={MessageSquare}>
                <select
                  value={data.canal}
                  onChange={(e) => update("canal", e.target.value)}
                  className={inputClass}
                >
                  {CANAIS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tipo de atendimento" icon={Tag}>
                <select
                  value={data.tipo}
                  onChange={(e) => update("tipo", e.target.value)}
                  className={inputClass}
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Produto ou serviço solicitado" icon={Package}>
                  <input
                    type="text"
                    value={data.produto}
                    onChange={(e) => update("produto", e.target.value)}
                    placeholder="Ex.: Kit embreagem, consultoria, orçamento de peça..."
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </Section>

          {/* Seção 3 — Operacional */}
          <Section title="Operacional" subtitle="Responsável, status e acompanhamento">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Responsável" icon={UserCog}>
                <input
                  type="text"
                  value={data.responsavel}
                  onChange={(e) => update("responsavel", e.target.value)}
                  placeholder="Nome do atendente"
                  className={inputClass}
                />
              </Field>
              <Field label="Status" icon={Activity}>
                <select
                  value={data.status}
                  onChange={(e) => update("status", e.target.value)}
                  className={inputClass}
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Valor estimado (R$)" icon={DollarSign}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={data.valor}
                  onChange={(e) => update("valor", e.target.value)}
                  placeholder="0,00"
                  className={inputClass}
                />
              </Field>
              <Field label="Próximo retorno" icon={CalendarClock}>
                <input
                  type="datetime-local"
                  value={data.proximoRetorno}
                  onChange={(e) => update("proximoRetorno", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          {/* Seção 4 — Observações */}
          <Section title="Observações" subtitle="Contexto adicional do atendimento">
            <Field label="Notas internas" icon={FileText}>
              <textarea
                value={data.observacoes}
                onChange={(e) => update("observacoes", e.target.value)}
                placeholder="Detalhes, combinações, condições especiais..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </Section>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-blue-800 hover:to-blue-950 disabled:opacity-60 transition"
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar atendimento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200/70 px-6 py-5 last:border-b-0">
      <div className="mb-4">
        <h3 className="text-sm font-bold tracking-tight text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
        {Icon && <Icon className="h-3.5 w-3.5 text-blue-700" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

/**
 * Padronização central de status de `conversations` no Agente Comercial 360.
 *
 * Status canônicos oficiais do projeto (snake_case, feminino, em PT-BR):
 *   aberta | em_andamento | aguardando_cliente | aguardando_empresa
 *   | encaminhada | sem_resposta | finalizada
 *
 * Este módulo é puro (sem dependências externas) e pode ser importado
 * tanto no client quanto em server functions.
 */

export type ConversationStatus =
  | "aberta"
  | "em_andamento"
  | "aguardando_cliente"
  | "aguardando_empresa"
  | "encaminhada"
  | "sem_resposta"
  | "finalizada";

export const CONVERSATION_STATUSES: ConversationStatus[] = [
  "aberta",
  "em_andamento",
  "aguardando_cliente",
  "aguardando_empresa",
  "encaminhada",
  "sem_resposta",
  "finalizada",
];

const CANONICAL_SET = new Set<string>(CONVERSATION_STATUSES);

/**
 * Mapeia aliases legados (inglês, masculino, variações antigas) para o
 * status canônico equivalente.
 */
const STATUS_ALIASES: Record<string, ConversationStatus> = {
  // aberta
  open: "aberta",
  active: "aberta",
  aberto: "aberta",
  // em_andamento
  andamento: "em_andamento",
  in_progress: "em_andamento",
  // aguardando_cliente (default para "aguardando" genérico)
  aguardando: "aguardando_cliente",
  aguardando_resposta: "aguardando_cliente",
  waiting: "aguardando_cliente",
  pending: "aguardando_cliente",
  // encaminhada
  forwarded: "encaminhada",
  assigned: "encaminhada",
  // sem_resposta
  no_response: "sem_resposta",
  // finalizada
  closed: "finalizada",
  finished: "finalizada",
  finalizado: "finalizada",
};

/**
 * Converte qualquer valor bruto vindo do banco/legado para um
 * `ConversationStatus` canônico. Em caso de valor desconhecido, retorna
 * `"aberta"` como fallback seguro (não bloqueia a UI).
 */
export function normalizeConversationStatus(
  raw: string | null | undefined,
): ConversationStatus {
  const v = String(raw ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  if (!v) return "aberta";
  if (CANONICAL_SET.has(v)) return v as ConversationStatus;
  if (v in STATUS_ALIASES) return STATUS_ALIASES[v];
  return "aberta";
}

const STATUS_LABELS: Record<ConversationStatus, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  aguardando_empresa: "Aguardando empresa",
  encaminhada: "Encaminhada",
  sem_resposta: "Sem resposta",
  finalizada: "Finalizada",
};

/** Label PT-BR para exibição em badges, filtros e cards. */
export function getConversationStatusLabel(status: ConversationStatus): string {
  return STATUS_LABELS[status];
}

const STATUS_BADGE_CLASSES: Record<ConversationStatus, string> = {
  aberta: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  em_andamento: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  aguardando_cliente: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  aguardando_empresa: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  encaminhada: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  sem_resposta: "bg-red-50 text-red-700 ring-1 ring-red-200",
  finalizada: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

/** Classes Tailwind para o badge visual do status. */
export function getConversationStatusBadgeClass(status: ConversationStatus): string {
  return STATUS_BADGE_CLASSES[status];
}

/** `true` apenas quando a conversa está finalizada. */
export function isFinalConversationStatus(status: ConversationStatus): boolean {
  return status === "finalizada";
}

/** `true` para qualquer status que ainda represente uma conversa em aberto. */
export function isOpenConversationStatus(status: ConversationStatus): boolean {
  return status !== "finalizada";
}

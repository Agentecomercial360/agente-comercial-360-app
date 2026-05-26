# Schema — Agente Comercial 360

Documentação das tabelas usadas pelo sistema. Todas as tabelas operacionais
possuem `company_id` para isolamento multi-tenant.

---

## `companies`

**Finalidade:** representa cada empresa cliente (tenant) do Agente Comercial 360.

**Principais colunas:**
- `id` (uuid, PK)
- `name` (text)
- `business_type` (text) — tipo de negócio (ex: varejo, serviços, indústria).
- `segment` (text) — segmento de mercado da empresa.
- `phone` (text) — telefone principal de contato.
- `email` (text) — e-mail principal de contato.
- `address` (text) — endereço da empresa.
- `tone_of_voice` (text) — tom de voz padrão usado pela IA nas respostas.
- `created_at` (timestamptz)

**Relacionamento:** raiz do modelo multi-tenant. Todas as demais tabelas referenciam `companies.id` via `company_id`.

**Uso no front-end:** identifica o tenant do usuário logado; nome e dados aparecem em `/configuracoes` e no header do dashboard.

---

## `company_users`

**Finalidade:** vincular um usuário do Supabase Auth a uma ou mais empresas.

**Principais colunas:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → `auth.users.id`)
- `company_id` (uuid, FK → `companies.id`)
- `role` (text — ex: `owner`, `admin`, `agent`)
- `is_active` (bool) — indica se o vínculo está ativo.
- `created_at`

**Relacionamento:** ponte N:N entre `auth.users` e `companies`. Base de TODAS as políticas RLS.

**Uso no front-end:** após login, o front consulta `company_users` para descobrir a empresa do usuário e usar esse `company_id` em todas as queries.

---

## `responsibles`

**Finalidade:** cadastro de responsáveis comerciais (vendedores/atendentes) de cada empresa.

**Principais colunas:**
- `id`, `company_id`, `name`, `email`, `phone`, `is_active`, `created_at`
- `department` (text) — departamento (ex: Vendas, Suporte, Financeiro).
- `role` (text) — função/cargo do responsável.

**Relacionamento:** `company_id` → `companies.id`. Referenciado por `leads` e `conversations` para atribuição.

**Uso no front-end:** página `/responsaveis` (CRUD), seletor de atribuição em `/leads` e `/atendimentos`.

---

## `ai_settings`

**Finalidade:** configurações da IA por empresa (tom, prompt base, modelo, limites e regras de negócio).

**Principais colunas:**
- `id`, `company_id`, `prompt_base` (text), `tone` (text), `model` (text), `is_active` (bool), `updated_at`
- `agent_name` (text) — nome público do agente de IA.
- `behavior_prompt` (text) — prompt complementar de comportamento.
- `can_send_prices` (bool) — autoriza a IA a enviar preços.
- `can_create_quote` (bool) — autoriza a IA a gerar orçamentos.
- `must_call_human_when` (text) — regras que disparam encaminhamento a humano.

**Relacionamento:** `company_id` → `companies.id` (geralmente 1:1).

**Uso no front-end:** página `/ia` para visualizar e ajustar comportamento da IA.

---

## `knowledge_base`

**Finalidade:** base de conhecimento textual usada pela IA para responder com contexto da empresa.

**Principais colunas:**
- `id`, `company_id`, `title`, `content` (text), `is_active` (bool), `created_at`, `updated_at`
- `category` (text) — categoria do item (ex: FAQ, Política, Catálogo).

**Relacionamento:** `company_id` → `companies.id`. Consumida pelo backend de IA (n8n) ao montar prompts.

**Uso no front-end:** página `/base-conhecimento` (CRUD de itens, ativação/desativação, filtro por categoria).

---

## `customers`

**Finalidade:** clientes finais — pessoas/empresas que entram em contato.

**Principais colunas:**
- `id`, `company_id`, `name`, `phone`, `email`, `created_at`
- `city` (text) — cidade do cliente.
- `customer_type` (text) — tipo de cliente (ex: PF, PJ, lead, recorrente).

**Relacionamento:** `company_id` → `companies.id`. Referenciado por `leads` e `conversations`.

**Uso no front-end:** consultado indiretamente em `/conversas`, `/leads` e `/atendimentos`.

---

## `leads`

**Finalidade:** oportunidades comerciais geradas a partir de atendimentos.

**Principais colunas:**
- `id`, `company_id`, `customer_id`, `responsible_id`, `status`, `value`, `notes`, `created_at`, `updated_at`
- `interest` (text) — interesse declarado pelo cliente (produto/serviço).
- `stage` (text) — estágio do funil (ex: novo, qualificado, proposta, ganho, perdido).
- `score` (int) — pontuação de qualificação do lead.
- `estimated_value` (numeric) — valor estimado da oportunidade.
- `next_action` (text) — próxima ação planejada.
- `next_follow_up_at` (timestamptz) — data/hora do próximo follow-up.
- `conversation_id` (uuid, FK → `conversations.id`) — conversa que originou o lead.

**Relacionamento:** `company_id` → `companies.id`; `customer_id` → `customers.id`; `responsible_id` → `responsibles.id`; `conversation_id` → `conversations.id`.

**Uso no front-end:** página `/leads` (kanban/lista, criação, edição, atribuição, follow-up).

---

## `conversations`

**Finalidade:** representa uma conversa (thread) entre cliente e empresa via canal (WhatsApp etc).

**Principais colunas:**
- `id`, `company_id`, `customer_id`, `responsible_id`, `channel`, `status`, `last_message_at`, `created_at`

### `status` — valores canônicos

O front-end padroniza o vocabulário de `status` através do módulo
`src/lib/conversation-status.ts`. Os valores canônicos aceitos são:

| Valor                  | Significado |
|------------------------|-------------|
| `aberta`               | Conversa nova/recém-aberta, ainda não atendida. |
| `em_andamento`         | Atendimento em curso (humano ou IA respondendo ativamente). |
| `aguardando_cliente`   | Empresa respondeu e aguarda retorno do cliente. |
| `aguardando_empresa`   | Cliente enviou mensagem e aguarda resposta da empresa. |
| `encaminhada`          | Conversa encaminhada para outro responsável/departamento. |
| `sem_resposta`         | Cliente não respondeu por tempo prolongado. |
| `finalizada`           | Conversa concluída/encerrada. |

> Valores legados (`open`, `pending`, `closed`, `andamento`, `waiting`, `Financeiro`, `Finalizado` etc.) são normalizados para os canônicos via `normalizeConversationStatus()` no front. Uma futura migração SQL pode padronizar os valores também no banco — ver [`sql-history.md`](./sql-history.md).

**Relacionamento:** `company_id` → `companies.id`; `customer_id` → `customers.id`; `responsible_id` → `responsibles.id`. Tem N `messages`.

**Uso no front-end:** páginas `/conversas` e `/atendimentos` (listagem, filtros por status canônico, atribuição, finalização).

---

## `messages`

**Finalidade:** mensagens individuais dentro de uma conversa.

**Principais colunas:**
- `id`, `created_at`
- `conversation_id` (uuid, FK → `conversations.id`).
- `customer_id` (uuid, FK → `customers.id`) — cliente associado à mensagem.
- `company_id` (uuid, FK → `companies.id`) — denormalizado para facilitar RLS.
- `sender_type` (text) — origem da mensagem (ex: `customer`, `agent`, `ai`, `system`).
- `content` (text) — conteúdo textual da mensagem.
- `channel` (text) — canal de envio/recebimento (ex: `whatsapp`, `web`, `email`).

**Relacionamento:** `conversation_id` → `conversations.id`; `customer_id` → `customers.id`; `company_id` → `companies.id` (denormalizado para facilitar RLS).

**Uso no front-end:** exibido na visualização de conversa em `/conversas` e `/atendimentos`.

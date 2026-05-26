# Schema — Agente Comercial 360

Documentação das tabelas usadas pelo sistema. Todas as tabelas operacionais
possuem `company_id` para isolamento multi-tenant.

---

## `companies`

**Finalidade:** representa cada empresa cliente (tenant) do Agente Comercial 360.

**Principais colunas:**
- `id` (uuid, PK)
- `name` (text)
- `created_at` (timestamptz)

**Relacionamento:** raiz do modelo multi-tenant. Todas as demais tabelas referenciam `companies.id` via `company_id`.

**Uso no front-end:** identifica o tenant do usuário logado; nome aparece em `/configuracoes` e no header do dashboard.

---

## `company_users`

**Finalidade:** vincular um usuário do Supabase Auth a uma ou mais empresas.

**Principais colunas:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → `auth.users.id`)
- `company_id` (uuid, FK → `companies.id`)
- `role` (text — ex: `owner`, `admin`, `agent`)
- `created_at`

**Relacionamento:** ponte N:N entre `auth.users` e `companies`. Base de TODAS as políticas RLS.

**Uso no front-end:** após login, o front consulta `company_users` para descobrir a empresa do usuário e usar esse `company_id` em todas as queries.

---

## `responsibles`

**Finalidade:** cadastro de responsáveis comerciais (vendedores/atendentes) de cada empresa.

**Principais colunas:**
- `id`, `company_id`, `name`, `email`, `phone`, `is_active`, `created_at`

**Relacionamento:** `company_id` → `companies.id`. Referenciado por `leads` e `conversations` para atribuição.

**Uso no front-end:** página `/responsaveis` (CRUD), seletor de atribuição em `/leads` e `/atendimentos`.

---

## `ai_settings`

**Finalidade:** configurações da IA por empresa (tom, prompt base, modelo, limites).

**Principais colunas:**
- `id`, `company_id`, `prompt_base` (text), `tone` (text), `model` (text), `is_active` (bool), `updated_at`

**Relacionamento:** `company_id` → `companies.id` (geralmente 1:1).

**Uso no front-end:** página `/ia` para visualizar e ajustar comportamento da IA.

---

## `knowledge_base`

**Finalidade:** base de conhecimento textual usada pela IA para responder com contexto da empresa.

**Principais colunas:**
- `id`, `company_id`, `title`, `content` (text), `is_active` (bool), `created_at`, `updated_at`

**Relacionamento:** `company_id` → `companies.id`. Consumida pelo backend de IA (n8n) ao montar prompts.

**Uso no front-end:** página `/base-conhecimento` (CRUD de itens, ativação/desativação).

---

## `customers`

**Finalidade:** clientes finais — pessoas/empresas que entram em contato.

**Principais colunas:**
- `id`, `company_id`, `name`, `phone`, `email`, `created_at`

**Relacionamento:** `company_id` → `companies.id`. Referenciado por `leads` e `conversations`.

**Uso no front-end:** consultado indiretamente em `/conversas`, `/leads` e `/atendimentos`.

---

## `leads`

**Finalidade:** oportunidades comerciais geradas a partir de atendimentos.

**Principais colunas:**
- `id`, `company_id`, `customer_id`, `responsible_id`, `status`, `value`, `notes`, `created_at`, `updated_at`

**Relacionamento:** `company_id` → `companies.id`; `customer_id` → `customers.id`; `responsible_id` → `responsibles.id`.

**Uso no front-end:** página `/leads` (kanban/lista, criação, edição, atribuição).

---

## `conversations`

**Finalidade:** representa uma conversa (thread) entre cliente e empresa via canal (WhatsApp etc).

**Principais colunas:**
- `id`, `company_id`, `customer_id`, `responsible_id`, `channel`, `status` (ex: `open`, `pending`, `closed`), `last_message_at`, `created_at`

**Relacionamento:** `company_id` → `companies.id`; `customer_id` → `customers.id`; `responsible_id` → `responsibles.id`. Tem N `messages`.

**Uso no front-end:** páginas `/conversas` e `/atendimentos` (listagem, filtros por status, atribuição).

---

## `messages`

**Finalidade:** mensagens individuais dentro de uma conversa.

**Principais colunas:**
- `id`, `conversation_id`, `company_id`, `direction` (`in`/`out`), `sender` (`customer`/`agent`/`ai`), `content` (text), `created_at`

**Relacionamento:** `conversation_id` → `conversations.id`; `company_id` → `companies.id` (denormalizado para facilitar RLS).

**Uso no front-end:** exibido na visualização de conversa em `/conversas` e `/atendimentos`.

# RLS Policies — Agente Comercial 360

Este documento descreve o padrão de segurança via **Row Level Security (RLS)**
aplicado no Supabase do Agente Comercial 360.

## Princípio geral

> **Um usuário só acessa dados da própria empresa.**

A regra é garantida no banco — não no front-end. Mesmo que o front fosse comprometido,
as políticas RLS impedem leitura/escrita de dados de outras empresas.

## Modelo de autenticação

1. Usuário faz login via **Supabase Auth** (e-mail/senha).
2. `auth.uid()` passa a estar disponível em todas as queries.
3. A tabela `company_users` vincula `auth.uid()` → `company_id`.
4. Toda política RLS verifica se o `company_id` da linha pertence ao usuário autenticado.

## Padrão de política (SELECT)

Padrão aplicado em todas as tabelas com `company_id`:

```sql
-- Exemplo conceitual
CREATE POLICY "select_by_company"
ON public.<tabela>
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
  )
);
```

**Tabelas com SELECT por company_id já aplicado:**

- `companies` (via vínculo em `company_users`)
- `company_users` (apenas o próprio vínculo)
- `responsibles`
- `ai_settings`
- `knowledge_base`
- `customers`
- `leads`
- `conversations`
- `messages`

## Políticas de INSERT / UPDATE

Aplicadas em pontos específicos onde o front-end precisa escrever:

- **`responsibles`** — INSERT e UPDATE permitidos para `authenticated` com `WITH CHECK (company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()))`.
- **`knowledge_base`** — INSERT/UPDATE/DELETE (ou toggle de `is_active`) com a mesma checagem de `company_id`.
- **`leads`** — INSERT/UPDATE para criação e atualização de status/atribuição.
- **`conversations`** — UPDATE para mudança de `status` e `responsible_id`.

> Tabelas como `customers`, `messages` e `companies` normalmente recebem escrita
> apenas via backend (n8n / webhooks WhatsApp) usando `service_role`, e não pelo front.

## Regras críticas de segurança

- **NUNCA** usar `service_role` no front-end. Apenas `anon/publishable key`.
- **NUNCA** criar política `USING (true)` em tabelas com dados sensíveis.
- **SEMPRE** validar `company_id` em `WITH CHECK` de INSERT/UPDATE para evitar
  que um usuário grave em empresa que não é dele.
- Mudanças de schema/policy devem ser registradas em [`sql-history.md`](./sql-history.md).

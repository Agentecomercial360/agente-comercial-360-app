# SQL History — Agente Comercial 360

Histórico descritivo dos SQLs aplicados no Supabase ao longo da evolução do produto.
Use as seções abaixo para colar o SQL exato conforme for sendo executado.

> Convenção: colar SQL real entre blocos ```sql ... ``` logo abaixo de cada item.

---

## 1. Criação / validação de políticas RLS

Habilitação de RLS e criação de políticas `SELECT` padrão por `company_id` nas tabelas
operacionais (`responsibles`, `ai_settings`, `knowledge_base`, `customers`, `leads`,
`conversations`, `messages`, `company_users`).

```sql
-- (colar SQL aqui)
```

---

## 2. Grants para `authenticated`

Concessão de privilégios básicos ao role `authenticated` nas tabelas públicas
do schema `public`, complementando o RLS.

```sql
-- (colar SQL aqui)
```

---

## 3. Inserts de teste

Inserts manuais usados para validar o fluxo de criação de `companies`,
`company_users`, `responsibles`, `knowledge_base`, `leads` e `conversations`
durante o desenvolvimento.

```sql
-- (colar SQL aqui)
```

---

## 4. Updates de teste

Updates manuais para validar mudança de `status` em `leads` e `conversations`,
atribuição de `responsible_id` e toggle de `is_active` em `knowledge_base`.

```sql
-- (colar SQL aqui)
```

---

## 5. Criação / validação do `is_active` em `knowledge_base`

Adição (ou validação) da coluna `is_active boolean default true` em
`knowledge_base`, usada pela página `/base-conhecimento` para ativar/desativar
itens sem deletá-los.

```sql
-- (colar SQL aqui)
```

---

## 6. Políticas de UPDATE específicas

Criação de policies `FOR UPDATE` em:

- `responsibles` — edição de cadastro/ativação.
- `knowledge_base` — edição de conteúdo e toggle `is_active`.
- `leads` — mudança de status, valor, responsável, notas.
- `conversations` — mudança de `status` e `responsible_id`.

Todas com checagem `company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid())`.

```sql
-- (colar SQL aqui)
```

---

## 7. Ajuste de `status` permitido em `conversations`

Ajuste do conjunto de valores aceitos na coluna `status` de `conversations`
(ex: `open`, `pending`, `closed`), via `CHECK constraint` ou `enum`.

```sql
-- (colar SQL aqui)
```

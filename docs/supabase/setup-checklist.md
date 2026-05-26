# Setup Checklist — Novo Cliente / Empresa

Passo a passo para provisionar uma nova empresa (tenant) no Agente Comercial 360.

## 1. Criar a empresa (`companies`)

- [ ] Inserir registro em `companies` com `name` do cliente.
- [ ] Anotar o `id` (uuid) gerado — será o `company_id` de tudo a seguir.

## 2. Criar usuário no Supabase Auth

- [ ] Criar usuário em **Authentication → Users** com e-mail e senha inicial.
- [ ] Anotar o `user_id` (uuid).

## 3. Vincular usuário em `company_users`

- [ ] Inserir em `company_users` com `user_id`, `company_id` e `role` (ex: `owner`).
- [ ] Confirmar que `auth.uid()` do usuário retorna o `company_id` esperado via query de teste.

## 4. Cadastrar responsáveis

- [ ] Inserir em `responsibles` os vendedores/atendentes da empresa (`name`, `email`, `phone`, `is_active = true`).

## 5. Configurar `ai_settings`

- [ ] Criar registro em `ai_settings` com `prompt_base`, `tone` e `model` padrão.
- [ ] Marcar `is_active = true`.

## 6. Cadastrar base de conhecimento

- [ ] Inserir itens iniciais em `knowledge_base` (FAQ, política, catálogo resumido) com `is_active = true`.

## 7. Testes funcionais no front-end

- [ ] **Login** — acessar `/login` com o usuário criado e logar com sucesso.
- [ ] **Leitura por empresa** — abrir `/dashboard` e validar que dados exibidos são apenas do `company_id` correto.
- [ ] **Leads** — abrir `/leads`, criar um lead de teste e atribuir a um responsável.
- [ ] **Conversas** — abrir `/conversas` e validar listagem (mesmo que vazia).
- [ ] **Atendimentos** — abrir `/atendimentos` e validar filtros/atribuição.
- [ ] **Responsáveis** — abrir `/responsaveis` e validar CRUD.
- [ ] **Base de conhecimento** — abrir `/base-conhecimento` e validar ativação/desativação.
- [ ] **IA** — abrir `/ia` e validar carregamento de `ai_settings`.

## 8. Validar RLS

- [ ] Logar com um usuário de **outra empresa** e confirmar que NENHUM dado da empresa nova aparece.
- [ ] Tentar `UPDATE` direto via SQL com `auth.uid()` de outra empresa e confirmar que é bloqueado.
- [ ] Validar que `conversations.status` usa apenas os status canônicos do projeto (`aberta`, `em_andamento`, `aguardando_cliente`, `aguardando_empresa`, `encaminhada`, `sem_resposta`, `finalizada`). Valores legados devem ser normalizados ou migrados — ver `sql-history.md` seção 8.


## 9. Validar segurança de chaves

- [ ] Confirmar que `src/lib/supabase.ts` usa apenas `anon/publishable key`.
- [ ] Confirmar que **nenhuma** `service_role`, token Meta/WhatsApp, token n8n ou senha está commitada no repositório.
- [ ] Confirmar `.gitignore` bloqueando `.env`, `.env.*` (exceto `.env.example`).

## 10. Entrega

- [ ] Enviar credenciais iniciais ao cliente por canal seguro.
- [ ] Orientar troca imediata da senha no primeiro login.

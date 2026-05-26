# Back-end Supabase — Agente Comercial 360

Esta pasta documenta a estrutura back-end do **Agente Comercial 360** no Supabase.
O objetivo é manter um registro técnico claro do schema, das políticas de segurança (RLS),
do histórico de SQLs aplicados e do checklist de setup para novos clientes.

## Objetivo

- Servir como referência única da arquitetura de dados do produto.
- Permitir que novos desenvolvedores entendam rapidamente o modelo multi-tenant.
- Garantir rastreabilidade de mudanças feitas diretamente no Supabase.
- Padronizar o processo de onboarding de novas empresas (tenants).

## Tabelas principais

O sistema é multi-tenant, organizado por `company_id`. As tabelas centrais são:

- `companies` — empresas (tenants).
- `company_users` — vínculo entre usuários autenticados e empresas.
- `responsibles` — responsáveis comerciais por leads/atendimentos.
- `ai_settings` — configurações da IA por empresa.
- `knowledge_base` — base de conhecimento usada pela IA.
- `customers` — clientes finais.
- `leads` — oportunidades comerciais.
- `conversations` — conversas com clientes (WhatsApp etc).
- `messages` — mensagens individuais de cada conversa.

Detalhes completos em [`schema.md`](./schema.md).

## Relação com o front-end Lovable

- O front-end é uma SPA TanStack Start (React 19) hospedada via Lovable.
- A comunicação com o Supabase usa apenas a **anon/publishable key** (ver `src/lib/supabase.ts`).
- Toda a segurança de acesso é garantida via **RLS** no banco — o front nunca tem privilégios elevados.
- As telas (`/dashboard`, `/conversas`, `/leads`, `/atendimentos`, `/responsaveis`,
  `/base-conhecimento`, `/ia`, `/relatorios`, `/configuracoes`) consultam essas tabelas
  filtrando implicitamente pelo `company_id` do usuário logado, via políticas RLS.

## Aviso — dados reais

Este repositório **não armazena dados reais de clientes**. Nenhum dump,
export, CSV de produção ou registro pessoal deve ser commitado aqui.

## Aviso — chaves secretas

**Nunca** salvar no repositório:

- `service_role` key do Supabase
- Tokens da Meta / WhatsApp Cloud API
- Tokens do n8n
- Senhas de banco ou usuários
- Qualquer secret de webhook

Apenas a `anon/publishable key` pode aparecer em código de front-end (ela é pública por design).
Secrets de servidor ficam exclusivamente no painel do Supabase / provedor de hosting.

# Agente Comercial 360

Plataforma de automação comercial com IA, WhatsApp, Supabase, n8n, CRM e RAG.

## Visão geral

O **Agente Comercial 360** é uma aplicação voltada para empresas que precisam centralizar o atendimento comercial, organizar clientes, acompanhar leads, registrar conversas e automatizar processos de atendimento com inteligência artificial.

O projeto combina frontend, backend, banco de dados, automações e IA para criar uma solução comercial completa, com foco em atendimento via WhatsApp, gestão de oportunidades e relatórios gerenciais.

## Funcionalidades principais

- Atendimento automatizado via WhatsApp
- Cadastro e histórico de clientes
- Organização de leads comerciais
- Registro de conversas e mensagens
- Responsáveis internos por atendimento
- Configuração da IA por empresa
- Base de conhecimento para respostas inteligentes
- Relatórios gerenciais
- Estrutura multi-tenant por empresa
- Segurança com RLS no Supabase
- Preparação para WhatsApp Cloud API
- Estrutura planejada para RAG e agentes inteligentes

## Tecnologias utilizadas

- React
- TypeScript
- Supabase
- PostgreSQL
- Row Level Security
- n8n
- Railway
- WhatsApp Cloud API
- Inteligência Artificial
- RAG

## Arquitetura geral

O sistema é dividido em camadas:

- **Frontend:** interface do usuário construída em React.
- **Backend:** Supabase com PostgreSQL, autenticação e políticas RLS.
- **Banco de dados:** modelo multi-tenant baseado em `company_id`.
- **Automações:** workflows planejados no n8n para atendimento, roteamento e notificações.
- **IA:** uso de base de conhecimento, classificação de intenção e respostas automatizadas.
- **Integrações:** WhatsApp Cloud API, Supabase, n8n e serviços externos.

## Status do projeto

Projeto em desenvolvimento.

### Fase atual

- Estrutura visual criada no frontend
- Organização inicial do backend no Supabase
- Documentação técnica do banco iniciada
- Planejamento das integrações com WhatsApp, n8n e IA
- Estrutura de segurança com RLS em andamento

## Documentação

- [Documentação Supabase](./docs/supabase/README.md)
- [Schema do banco](./docs/supabase/schema.md)
- [Políticas RLS](./docs/supabase/rls-policies.md)
- [Checklist de configuração](./docs/supabase/setup-checklist.md)
- [Histórico SQL](./docs/supabase/sql-history.md)

## Segurança

Este repositório não deve armazenar dados reais de clientes, tokens, senhas ou chaves privadas.

Nunca versionar:

- `service_role` key do Supabase
- Tokens da Meta / WhatsApp Cloud API
- Tokens do n8n
- Senhas de banco
- Secrets de webhook
- Arquivos `.env` reais

Apenas arquivos de exemplo, como `.env.exemplo`, podem ser mantidos no repositório.

## Autor

Raphael Silva  
Backend Developer focused on Supabase, n8n, Railway, AI Agents and Business Automation.

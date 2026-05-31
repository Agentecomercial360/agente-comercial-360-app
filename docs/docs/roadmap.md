# Roadmap — Agente Comercial 360

## Visão geral

Este roadmap apresenta as principais fases de evolução do Agente Comercial 360, desde a estrutura visual inicial até integrações com WhatsApp, automações, inteligência artificial e relatórios gerenciais.

## Fase 1 — Estrutura visual

Status: Em andamento

Objetivo: criar a base visual do sistema antes de conectar dados reais.

Itens principais:

- Criar layout principal da aplicação
- Criar sidebar e navegação
- Criar dashboard inicial
- Criar páginas principais do sistema
- Utilizar dados mockados temporariamente
- Validar identidade visual premium e tecnológica
- Manter consistência visual entre telas

Páginas previstas:

- Dashboard
- Clientes
- Conversas
- Leads
- Responsáveis
- Configuração da IA
- Base de conhecimento
- Relatórios

## Fase 2 — Backend Supabase

Status: Em andamento

Objetivo: estruturar o banco de dados, autenticação e segurança do sistema.

Itens principais:

- Configurar autenticação
- Criar tabela de empresas
- Criar vínculo entre usuários e empresas
- Criar tabelas principais do CRM
- Configurar políticas RLS
- Garantir isolamento por `company_id`
- Documentar schema do banco
- Documentar políticas de segurança
- Criar checklist de configuração para novos clientes

Tabelas principais:

- companies
- company_users
- customers
- leads
- conversations
- messages
- responsibles
- ai_settings
- knowledge_base

## Fase 3 — Conexão frontend + Supabase

Status: Planejado

Objetivo: conectar as telas do sistema com dados reais do Supabase.

Ordem recomendada:

1. Autenticação e login
2. Companies
3. Customers
4. Leads
5. Conversations
6. Messages
7. Responsibles
8. AI Settings
9. Knowledge Base
10. Reports

## Fase 4 — Automações com n8n

Status: Planejado

Objetivo: criar automações para atendimento, registro de conversas e notificações internas.

Fluxos previstos:

- Receber mensagem do cliente
- Identificar cliente pelo telefone
- Criar cliente caso não exista
- Registrar conversa
- Registrar mensagem
- Classificar intenção
- Encaminhar para responsável
- Notificar equipe interna
- Atualizar status do lead
- Gerar resumo de atendimento

## Fase 5 — WhatsApp Cloud API

Status: Planejado

Objetivo: integrar o atendimento oficial via WhatsApp Cloud API.

Itens principais:

- Configurar aplicativo na Meta
- Configurar número oficial da empresa
- Configurar Webhook
- Receber mensagens via API oficial
- Enviar respostas automáticas
- Criar templates de mensagens
- Registrar mensagens no Supabase
- Evitar uso de soluções baseadas em QR Code para cliente real

## Fase 6 — Inteligência Artificial e RAG

Status: Planejado

Objetivo: usar IA para apoiar o atendimento comercial com base em informações da empresa.

Funcionalidades previstas:

- Classificação de intenção do cliente
- Respostas baseadas na base de conhecimento
- Busca semântica com RAG
- Resumo automático de conversas
- Sugestão de próximos passos
- Identificação de leads quentes
- Encaminhamento para humano quando necessário

## Fase 7 — Relatórios gerenciais

Status: Planejado

Objetivo: gerar visão gerencial para donos, gestores e responsáveis comerciais.

Relatórios previstos:

- Total de atendimentos do dia
- Novos clientes
- Clientes recorrentes
- Leads gerados
- Leads quentes
- Pendências comerciais
- Clientes sem resposta
- Conversas por status
- Resumo executivo da IA
- Recomendações para o próximo dia

## Fase 8 — Preparação para produção

Status: Futuro

Objetivo: preparar o sistema para uso real por empresas.

Itens principais:

- Revisar segurança
- Revisar RLS
- Revisar variáveis de ambiente
- Criar ambiente de produção
- Testar fluxo completo
- Documentar onboarding de cliente
- Criar rotina de backup
- Validar LGPD e dados sensíveis
- Monitorar erros e logs

## Objetivo final

Construir uma plataforma comercial inteligente, segura e escalável, capaz de organizar atendimentos, automatizar processos e apoiar empresas na gestão de clientes, leads e oportunidades.

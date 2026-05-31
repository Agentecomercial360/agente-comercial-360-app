# Arquitetura — Agente Comercial 360

## Visão geral

O Agente Comercial 360 é organizado em camadas para separar responsabilidades entre interface, banco de dados, automações, inteligência artificial e integrações externas.

## Camadas do sistema

### Frontend

O frontend é responsável pela interface do usuário e pela experiência visual do sistema.

Principais áreas:

- Dashboard
- Clientes
- Conversas
- Leads
- Responsáveis
- Configurações da IA
- Base de conhecimento
- Relatórios

### Backend

O backend utiliza Supabase como base principal para:

- Autenticação
- Banco de dados PostgreSQL
- Segurança com Row Level Security
- Organização multi-tenant por empresa
- Controle de acesso por usuário e empresa

### Banco de dados

O modelo de dados é baseado em `company_id`, permitindo que múltiplas empresas utilizem a mesma estrutura com isolamento lógico dos dados.

Principais tabelas:

- companies
- company_users
- customers
- leads
- conversations
- messages
- responsibles
- ai_settings
- knowledge_base

### Automações

As automações serão estruturadas com n8n para conectar o sistema com canais externos e fluxos internos.

Possíveis fluxos:

- Recebimento de mensagens
- Identificação da intenção do cliente
- Registro de atendimento
- Encaminhamento para responsável humano
- Notificações internas
- Relatórios automáticos

### Inteligência Artificial

A IA será utilizada para apoiar o atendimento comercial e a organização das informações.

Funções planejadas:

- Classificação de intenção
- Respostas baseadas na base de conhecimento
- Resumo de conversas
- Sugestão de próximos passos
- Apoio à geração de relatórios

### Integrações externas

Integrações previstas:

- WhatsApp Cloud API
- Supabase
- n8n
- Railway
- APIs externas
- Modelos de IA

## Segurança

A segurança do sistema é baseada em:

- RLS no Supabase
- Isolamento por `company_id`
- Uso de anon key no frontend
- Proibição de chaves secretas no repositório
- Controle de acesso por usuário autenticado

## Objetivo da arquitetura

Criar uma base organizada, escalável e segura para que o Agente Comercial 360 possa atender diferentes empresas sem misturar dados, regras ou históricos.

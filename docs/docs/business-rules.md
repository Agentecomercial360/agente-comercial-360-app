# Regras de Negócio — Agente Comercial 360

## Objetivo

O Agente Comercial 360 tem como objetivo centralizar e automatizar o atendimento comercial de empresas, organizando clientes, leads, conversas, responsáveis internos e informações estratégicas para tomada de decisão.

## Modelo multi-tenant

O sistema deve permitir que múltiplas empresas utilizem a mesma aplicação sem misturar dados.

Cada empresa é identificada por um `company_id`.

Todas as principais tabelas do sistema devem estar relacionadas a uma empresa.

## Empresas

Cada empresa cadastrada pode ter:

- Usuários internos
- Clientes
- Leads
- Conversas
- Mensagens
- Responsáveis
- Configurações da IA
- Base de conhecimento
- Relatórios

## Usuários internos

Os usuários internos representam pessoas da empresa que acessam o sistema.

Eles podem atuar como:

- Administrador
- Responsável comercial
- Atendente
- Gestor

Cada usuário deve visualizar apenas os dados da empresa à qual está vinculado.

## Clientes

Clientes são contatos externos que interagem com a empresa, principalmente via WhatsApp.

Cada cliente pode ter:

- Nome
- Telefone
- Empresa vinculada
- Histórico de conversas
- Leads relacionados
- Status comercial

O telefone deve ser usado como uma das principais referências para evitar duplicidade de cadastro.

## Leads

Leads representam oportunidades comerciais geradas a partir de atendimentos, conversas ou cadastros manuais.

Um lead pode ter os seguintes status:

- Novo
- Em atendimento
- Quente
- Em negociação
- Perdido
- Convertido

Cada lead pode ser vinculado a um cliente e a um responsável interno.

## Conversas

Toda conversa recebida deve ser registrada no sistema.

Uma conversa deve conter:

- Cliente relacionado
- Empresa relacionada
- Canal de origem
- Status do atendimento
- Responsável interno
- Histórico de mensagens

## Mensagens

Cada mensagem deve ser vinculada a uma conversa.

As mensagens podem ser classificadas como:

- Mensagem do cliente
- Mensagem da IA
- Mensagem de atendente humano
- Mensagem interna do sistema

## Responsáveis

Os responsáveis são pessoas internas da empresa que podem assumir atendimentos ou leads.

Um responsável pode receber:

- Leads
- Conversas
- Notificações internas
- Pendências de atendimento

## Inteligência Artificial

A IA deve atuar como apoio ao atendimento comercial.

Ela pode:

- Responder dúvidas com base na base de conhecimento
- Classificar intenção do cliente
- Sugerir próximos passos
- Gerar resumo de conversa
- Encaminhar para atendimento humano quando necessário

A IA não deve inventar informações.

Quando não souber responder, deve encaminhar para um responsável humano.

## Base de conhecimento

A base de conhecimento armazena informações utilizadas pela IA para responder clientes.

Pode conter:

- Informações da empresa
- Produtos ou serviços
- Perguntas frequentes
- Políticas comerciais
- Regras de atendimento
- Instruções internas

## Relatórios

O sistema deve permitir relatórios gerenciais com informações como:

- Total de atendimentos
- Novos clientes
- Leads gerados
- Leads quentes
- Pendências comerciais
- Clientes sem resposta
- Conversas por status
- Resumo executivo
- Recomendações para o próximo dia

## Segurança

O sistema deve garantir que cada empresa acesse apenas seus próprios dados.

As regras de segurança devem ser aplicadas no banco de dados por meio de Row Level Security no Supabase.

Nenhum usuário deve acessar dados de outra empresa.

## Regra principal

Todo dado comercial relevante deve estar vinculado a uma empresa, garantindo organização, rastreabilidade e segurança no modelo multi-tenant.

# AC360 — Marketplace Intelligence Backend Contract

## Objetivo

Este documento define o contrato necessário no backend Mercado Livre do AC360 para completar
as novas telas de Rentabilidade Real, ADS Intelligence, Concorrência & Ranking,
Expedição Inteligente e Radar de Mercado.

O frontend nunca deve receber ou armazenar access token / refresh token do Mercado Livre.
Toda chamada autenticada ao marketplace deve continuar no backend.

## 1. ADS Intelligence

### Fonte

Usar a API atual de Product Ads baseada em Ad Groups.
Não implementar novos fluxos em endpoints legados de métricas removidos em 2026.

### Persistência

Upsert em `public.ecommerce_ads_metrics`, por empresa, conta, data e dimensão
disponível (campaign/ad group/product/listing).

Campos mínimos:

- impressions
- clicks
- investment
- ads_revenue
- total_revenue
- ads_sales_count
- ads_units_sold
- organic_sales_count
- organic_units_sold
- organic_revenue
- direct_sales_count
- indirect_sales_count
- direct_units_sold
- indirect_units_sold
- direct_revenue
- indirect_revenue
- roas
- acos
- tacos
- ctr
- cpc
- cvr
- sov / impression_share quando disponível
- acos_benchmark quando disponível

### Implementação atual

A sincronização está implementada na Supabase Edge Function
`ml-marketplace-intelligence`, ação `ads_sync`.

Body:

```json
{
  "action": "ads_sync",
  "company_id": "uuid",
  "account_id": "uuid",
  "days": 30
}
```

A função valida a sessão do usuário e o acesso ao tenant, renova a sessão do Mercado
Livre pelo sincronizador existente quando necessário, resolve `ad_group_id` por
`item_id` e grava snapshots por período (1, 7, 30 ou 90 dias).

## 2. Competição de catálogo

### Persistência

Cada snapshot/mudança deve gerar registro em
`public.ecommerce_catalog_competition_history`.

Campos principais:

- listing_id
- ml_item_id
- catalog_product_id
- competition_status
- previous_status
- change_type
- own_price
- winner_item_id
- winner_price
- checked_at
- raw_payload

### Comportamento

Quando houver mudança relevante:

- winning -> competing/listed: gerar alerta de perda
- competing/listed -> winning: gerar alerta de ganho
- qualquer estado -> sharing_first_place: registrar melhoria
- preço vencedor alterado: atualizar contexto

O evento pode alimentar `ecommerce_ai_insights` / Central de Ações.

## 3. Ranking monitorado por palavra-chave

`public.ecommerce_rank_history` armazena snapshots de posição observada.

Importante: posição orgânica por busca não deve ser apresentada como uma métrica
oficial do Mercado Livre se a API não fornecer posição canônica. O AC360 deve rotular
esse dado como "posição monitorada".

Automação futura pode padronizar:

- site
- palavra-chave
- categoria
- paginação
- localização/contexto usados na coleta

para tornar comparações históricas consistentes.

## 4. Radar de Mercado

### Persistência

Popular `public.ecommerce_market_trends` com snapshots separados:

- best_seller
- growing
- desired
- popular

### Fontes

- Mais vendidos: recurso oficial de highlights/best sellers por categoria.
- Tendências: recurso oficial de trends por site/categoria.

### Implementação atual

A mesma Edge Function atende a ação `market_radar_sync`:

```json
{
  "action": "market_radar_sync",
  "company_id": "uuid",
  "account_id": "uuid",
  "category_ids": ["MLB..."]
}
```

Quando `category_ids` não é enviado, o AC360 usa as categorias presentes nos anúncios
da conta. Os snapshots diários ficam em `ecommerce_market_trends`.

## 5. Expedição e etiquetas

O frontend já agrupa os pedidos por produto/SKU e produz uma lista ordenada de
`shipment_id`.

A geração de PDF/ZPL precisa ocorrer no backend para proteger os tokens do Mercado Livre.

### Implementação atual

A ação `shipment_labels` recebe os grupos já ordenados pelo frontend:

```json
{
  "action": "shipment_labels",
  "company_id": "uuid",
  "account_id": "uuid",
  "groups": [
    {
      "sku": "ABC-123",
      "shipment_ids": ["123", "456"]
    }
  ]
}
```

A Edge Function processa até 50 `shipment_id` por chamada ao Mercado Livre, mantém
os lotes separados por grupo/SKU, mescla os PDFs no backend e devolve um único PDF em
base64 ao navegador. O AC360 limita cada arquivo a 250 etiquetas para manter a geração
estável. ZPL poderá ser adicionado como formato alternativo depois.

## 6. Rentabilidade, descontos e devoluções

O banco atual já possui os principais campos financeiros em
`ecommerce_orders`, `ecommerce_order_items`, `ecommerce_order_discounts` e
`ecommerce_shipments_financial`.

O backend deve manter sincronizados:

- marketplace_fee
- seller_shipping_cost
- ads_cost
- tax_amount
- product_cost_total
- refunded_amount
- has_refund
- has_partial_refund
- has_chargeback
- discount_amount
- net_profit
- profit_margin_percent
- profit_confidence
- financial_review_required

A fórmula de lucro precisa ter uma única implementação canônica no backend para evitar
diferenças entre telas.

## 7. Segurança

- secret/service_role somente no backend;
- `access_token`, `refresh_token` e `raw_auth_payload` não têm SELECT para o papel `authenticated`;
- frontend usa sessão Supabase normal e RLS;
- validar company_id/account_id em todo endpoint;
- nunca confiar apenas em IDs enviados pelo cliente;
- persistir raw_payload somente quando necessário para auditoria;
- evitar PII desnecessária nos logs.

## 8. Status da implementação

1. ADS sync atual por Ad Groups: implementado.
2. Consulta de competição de catálogo e histórico: implementado.
3. Radar de Mercado (highlights + trends): implementado.
4. Etiquetas oficiais PDF agrupadas por SKU: implementado.
5. Alertas automáticos para Central de Ações: implementado via triggers do Postgres.
6. Próxima evolução: ingestão automática das notificações de competição e agendamentos periódicos sem depender do clique do usuário.


## 9. Automação de sincronização

O AC360 mantém um estado de saúde em `ecommerce_marketplace_sync_state`.

### Scheduler 24/7

O Supabase executa `ml-marketplace-scheduler` a cada 15 minutos via
`pg_cron + pg_net`. A chamada é protegida por um segredo aleatório armazenado apenas
no Supabase Vault; o valor não existe no frontend nem no repositório.

Cadências por capacidade:

- autenticação Mercado Livre: verificada a cada rodada do scheduler;
- Product Ads Hoje: 30 minutos;
- Product Ads 7 dias: 2 horas;
- Product Ads 30 dias: 4 horas;
- Product Ads 90 dias: 12 horas;
- competição de catálogo: 60 minutos por anúncio;
- Radar de Mercado: 12 horas;
- falhas de módulo: retry previsto para 15 minutos.

Cada rodada é limitada a 24 execuções e no máximo 3 verificações de competição por
conta para evitar explosão de chamadas e timeout.

A Edge Function registra início, sucesso, erro, última execução e próximo vencimento.
Falhas geram automaticamente um insight na Central de Ações através de
`marketplace_sync_watch`; quando a integração volta a funcionar, o insight é
marcado como concluído.

### Proteção quando o token expira

Antes de chamar Ads, Radar ou competição, o scheduler verifica o `expires_at` da
integração. Se o token estiver vencido, ele pausa as coletas da conta e cria apenas um
estado crítico `auth`, evitando dezenas de erros derivados.

### Pendência para refresh totalmente autônomo

O scheduler 24/7 já está ativo, mas a renovação do access token ainda depende do
sincronizador Railway `sync-account-smart`, que hoje espera uma sessão autenticada do
usuário. Enquanto o Railway não expuser autenticação service-to-service (ou enquanto
App ID / Secret Key do Mercado Livre não estiverem disponíveis como secrets de backend),
uma conta com token vencido precisa ser reconectada para que as coletas retomem.

O plugin Railway pode ser conectado ao ChatGPT para permitir a configuração desse
último trecho diretamente no serviço, sem compartilhar credenciais no chat.

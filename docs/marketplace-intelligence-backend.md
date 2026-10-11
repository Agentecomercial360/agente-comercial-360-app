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

### Endpoint sugerido

`POST /api/mercadolivre/ads/sync`

Body:

```json
{
  "company_id": "uuid",
  "account_id": "uuid",
  "date_from": "YYYY-MM-DD",
  "date_to": "YYYY-MM-DD"
}
```

A autorização deve validar o tenant antes de iniciar a sincronização.

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

### Endpoint sugerido

`POST /api/mercadolivre/market-radar/sync`

Body:

```json
{
  "company_id": "uuid",
  "account_id": "uuid|null",
  "site_id": "MLB",
  "category_ids": ["MLB..."]
}
```

O backend deve salvar snapshots, não apenas sobrescrever o valor atual, para o AC360
conseguir calcular aceleração e mudança de posição ao longo das semanas.

## 5. Expedição e etiquetas

O frontend já agrupa os pedidos por produto/SKU e produz uma lista ordenada de
`shipment_id`.

A geração de PDF/ZPL precisa ocorrer no backend para proteger os tokens do Mercado Livre.

### Endpoint sugerido

`POST /api/mercadolivre/shipments/labels`

Body:

```json
{
  "company_id": "uuid",
  "account_id": "uuid",
  "format": "pdf",
  "groups": [
    {
      "sku": "ABC-123",
      "shipment_ids": ["123", "456"]
    }
  ]
}
```

Regras:

- respeitar os limites atuais da API do Mercado Livre por lote;
- processar lotes por grupo/SKU;
- retornar um arquivo final na sequência dos grupos solicitados;
- registrar falhas por shipment_id sem invalidar os grupos já processados;
- não expor token do marketplace ao navegador.

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

- service_role somente no backend;
- frontend usa sessão Supabase normal e RLS;
- validar company_id/account_id em todo endpoint;
- nunca confiar apenas em IDs enviados pelo cliente;
- persistir raw_payload somente quando necessário para auditoria;
- evitar PII desnecessária nos logs.

## 8. Ordem de implementação do backend

1. ADS sync atual (Ad Groups)
2. competição de catálogo + eventos de ganho/perda
3. Radar de Mercado (highlights + trends)
4. etiquetas PDF/ZPL por grupos ordenados
5. alertas automáticos para Central de Ações

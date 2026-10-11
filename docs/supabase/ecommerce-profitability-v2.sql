-- AC360 E-commerce Intelligence
-- Rentabilidade Real v2
-- Aplicado em produção em 2026-10-11.
--
-- Objetivos:
-- 1. Separar lucro confirmado de resultado parcial.
-- 2. Não subtrair desconto novamente.
-- 3. Completar Ads somente pela diferença não atribuída aos pedidos.
-- 4. Ratear custos de pedido por SKU de forma proporcional ao valor dos itens.
-- 5. Respeitar o acesso multi-tenant via has_ecommerce_access().
--
-- Segurança:
-- SECURITY INVOKER + EXECUTE apenas authenticated/service_role.

create or replace function public.get_ecommerce_profitability_summary_v2(
  p_company_id uuid,
  p_account_id uuid default null,
  p_days integer default 30
)
returns table(
  orders_total integer,
  orders_confirmed integer,
  orders_pending_cost integer,
  financial_review_orders integer,
  gross_revenue numeric,
  refunded_amount numeric,
  realized_revenue numeric,
  marketplace_fees numeric,
  shipping_cost numeric,
  ads_order_cost numeric,
  ads_synced_investment numeric,
  ads_unallocated numeric,
  ads_effective numeric,
  taxes numeric,
  product_cost numeric,
  total_known_costs numeric,
  result_after_known_costs numeric,
  confirmed_revenue numeric,
  blocked_revenue numeric,
  confirmed_profit numeric,
  cost_coverage_percent numeric,
  confirmed_margin_percent numeric,
  refund_orders integer,
  chargeback_orders integer,
  cancelled_orders integer
)
language sql
stable
security invoker
set search_path = public
as $$
  with params as (
    select greatest(coalesce(p_days, 30), 1) as days
  ),
  scoped_orders as (
    select
      o.*,
      case
        when coalesce(o.marketplace_fee, 0) > 0
          then coalesce(o.marketplace_fee, 0)
        else coalesce(o.mercadolivre_fee, 0) + coalesce(o.mercadopago_fee, 0)
      end as effective_marketplace_fee
    from public.ecommerce_orders o
    cross join params p
    where (select public.has_ecommerce_access(p_company_id))
      and o.company_id = p_company_id
      and (p_account_id is null or o.account_id = p_account_id)
      and o.order_date >= date_trunc('day', now()) - ((p.days - 1) * interval '1 day')
  ),
  live_orders as (
    select *
    from scoped_orders
    where coalesce(is_cancelled, false) = false
  ),
  latest_ads as (
    select am.account_id, max(am.snapshot_at) as snapshot_at
    from public.ecommerce_ads_metrics am
    cross join params p
    where (select public.has_ecommerce_access(p_company_id))
      and am.company_id = p_company_id
      and (p_account_id is null or am.account_id = p_account_id)
      and am.metric_scope = 'product_period'
      and am.period_days = p.days
    group by am.account_id
  ),
  ads_rollup as (
    select coalesce(sum(am.investment), 0)::numeric as synced_investment
    from public.ecommerce_ads_metrics am
    join latest_ads la
      on la.account_id = am.account_id
     and la.snapshot_at = am.snapshot_at
    cross join params p
    where am.company_id = p_company_id
      and (p_account_id is null or am.account_id = p_account_id)
      and am.metric_scope = 'product_period'
      and am.period_days = p.days
  ),
  order_rollup as (
    select
      count(*)::integer as orders_total,
      count(*) filter (
        where profit_confidence = 'high'
          and coalesce(financial_review_required, false) = false
      )::integer as orders_confirmed,
      count(*) filter (
        where profit_confidence is distinct from 'high'
      )::integer as orders_pending_cost,
      count(*) filter (
        where coalesce(financial_review_required, false)
      )::integer as financial_review_orders,
      coalesce(sum(total_amount), 0)::numeric as gross_revenue,
      coalesce(sum(refunded_amount), 0)::numeric as refunded_amount,
      coalesce(sum(effective_marketplace_fee), 0)::numeric as marketplace_fees,
      coalesce(sum(seller_shipping_cost), 0)::numeric as shipping_cost,
      coalesce(sum(ads_cost), 0)::numeric as ads_order_cost,
      coalesce(sum(tax_amount), 0)::numeric as taxes,
      coalesce(sum(product_cost_total), 0)::numeric as product_cost,
      coalesce(sum(total_amount) filter (
        where profit_confidence = 'high'
          and coalesce(financial_review_required, false) = false
      ), 0)::numeric as confirmed_revenue,
      coalesce(sum(total_amount) filter (
        where profit_confidence is distinct from 'high'
           or coalesce(financial_review_required, false)
      ), 0)::numeric as blocked_revenue,
      coalesce(sum(
        coalesce(total_amount, 0)
        - coalesce(refunded_amount, 0)
        - effective_marketplace_fee
        - coalesce(seller_shipping_cost, 0)
        - coalesce(ads_cost, 0)
        - coalesce(tax_amount, 0)
        - coalesce(product_cost_total, 0)
      ) filter (
        where profit_confidence = 'high'
          and coalesce(financial_review_required, false) = false
      ), 0)::numeric as confirmed_profit_before_unallocated_ads,
      count(*) filter (where coalesce(has_refund, false))::integer as refund_orders,
      count(*) filter (where coalesce(has_chargeback, false))::integer as chargeback_orders
    from live_orders
  ),
  cancelled_rollup as (
    select count(*)::integer as cancelled_orders
    from scoped_orders
    where coalesce(is_cancelled, false) = true
  ),
  combined as (
    select
      o.*,
      coalesce(a.synced_investment, 0)::numeric as ads_synced_investment,
      greatest(
        coalesce(a.synced_investment, 0) - coalesce(o.ads_order_cost, 0),
        0
      )::numeric as ads_unallocated,
      c.cancelled_orders
    from order_rollup o
    cross join ads_rollup a
    cross join cancelled_rollup c
  )
  select
    orders_total,
    orders_confirmed,
    orders_pending_cost,
    financial_review_orders,
    round(gross_revenue, 2),
    round(refunded_amount, 2),
    round(gross_revenue - refunded_amount, 2),
    round(marketplace_fees, 2),
    round(shipping_cost, 2),
    round(ads_order_cost, 2),
    round(ads_synced_investment, 2),
    round(ads_unallocated, 2),
    round(ads_order_cost + ads_unallocated, 2),
    round(taxes, 2),
    round(product_cost, 2),
    round(
      marketplace_fees + shipping_cost + ads_order_cost + ads_unallocated
      + taxes + product_cost + refunded_amount,
      2
    ),
    round(
      gross_revenue - refunded_amount - marketplace_fees - shipping_cost
      - ads_order_cost - ads_unallocated - taxes - product_cost,
      2
    ),
    round(confirmed_revenue, 2),
    round(blocked_revenue, 2),
    round(
      confirmed_profit_before_unallocated_ads
      - case
          when gross_revenue > 0
            then ads_unallocated * (confirmed_revenue / gross_revenue)
          else 0
        end,
      2
    ),
    round(
      case when gross_revenue > 0
        then (confirmed_revenue / gross_revenue) * 100
        else 0
      end,
      2
    ),
    round(
      case when confirmed_revenue > 0
        then (
          confirmed_profit_before_unallocated_ads
          - case
              when gross_revenue > 0
                then ads_unallocated * (confirmed_revenue / gross_revenue)
              else 0
            end
        ) / confirmed_revenue * 100
        else 0
      end,
      2
    ),
    refund_orders,
    chargeback_orders,
    cancelled_orders
  from combined;
$$;

revoke all on function public.get_ecommerce_profitability_summary_v2(uuid, uuid, integer) from public;
revoke all on function public.get_ecommerce_profitability_summary_v2(uuid, uuid, integer) from anon;
grant execute on function public.get_ecommerce_profitability_summary_v2(uuid, uuid, integer) to authenticated;
grant execute on function public.get_ecommerce_profitability_summary_v2(uuid, uuid, integer) to service_role;

create or replace function public.get_ecommerce_product_profitability_v2(
  p_company_id uuid,
  p_account_id uuid default null,
  p_days integer default 30,
  p_limit integer default 50
)
returns table(
  ranking integer,
  product_id uuid,
  sku text,
  product_name text,
  orders integer,
  units integer,
  revenue numeric,
  refunded_amount numeric,
  marketplace_fees numeric,
  shipping_cost numeric,
  taxes numeric,
  product_cost numeric,
  ads_order_cost numeric,
  ads_synced_investment numeric,
  ads_effective numeric,
  net_profit numeric,
  margin_percent numeric,
  cost_coverage_percent numeric,
  profit_status text
)
language sql
stable
security invoker
set search_path = public
as $$
  with params as (
    select greatest(coalesce(p_days, 30), 1) as days
  ),
  scoped_orders as (
    select
      o.id,
      o.account_id,
      o.total_amount,
      o.refunded_amount,
      o.tax_amount,
      o.seller_shipping_cost,
      o.ads_cost,
      case
        when coalesce(o.marketplace_fee, 0) > 0
          then coalesce(o.marketplace_fee, 0)
        else coalesce(o.mercadolivre_fee, 0) + coalesce(o.mercadopago_fee, 0)
      end as effective_marketplace_fee
    from public.ecommerce_orders o
    cross join params p
    where (select public.has_ecommerce_access(p_company_id))
      and o.company_id = p_company_id
      and (p_account_id is null or o.account_id = p_account_id)
      and coalesce(o.is_cancelled, false) = false
      and o.order_date >= date_trunc('day', now()) - ((p.days - 1) * interval '1 day')
  ),
  order_item_totals as (
    select
      oi.order_id,
      nullif(sum(coalesce(oi.total_price, 0)), 0) as items_total
    from public.ecommerce_order_items oi
    join scoped_orders o on o.id = oi.order_id
    where oi.company_id = p_company_id
    group by oi.order_id
  ),
  item_base as (
    select
      oi.order_id,
      oi.product_id,
      p.sku,
      p.product_name,
      coalesce(oi.quantity, 0)::numeric as quantity,
      coalesce(oi.total_price, 0)::numeric as item_revenue,
      case
        when coalesce(oi.total_cost_at_sale, 0) > 0
          then coalesce(oi.total_cost_at_sale, 0)
        when coalesce(p.cost_price, 0) > 0
          then coalesce(oi.quantity, 0) * p.cost_price
        else 0
      end::numeric as item_product_cost,
      case
        when coalesce(oi.total_cost_at_sale, 0) > 0
          or coalesce(p.cost_price, 0) > 0
          then 1
        else 0
      end as cost_known,
      case
        when oit.items_total is not null and oit.items_total > 0
          then coalesce(oi.total_price, 0) / oit.items_total
        else 0
      end::numeric as allocation_share,
      o.refunded_amount,
      o.effective_marketplace_fee,
      o.seller_shipping_cost,
      o.ads_cost,
      o.tax_amount
    from public.ecommerce_order_items oi
    join scoped_orders o on o.id = oi.order_id
    join order_item_totals oit on oit.order_id = oi.order_id
    left join public.ecommerce_products p
      on p.id = oi.product_id
     and p.company_id = oi.company_id
    where oi.company_id = p_company_id
      and oi.product_id is not null
  ),
  product_orders as (
    select
      ib.product_id,
      max(ib.sku) as sku,
      max(ib.product_name) as product_name,
      count(distinct ib.order_id)::integer as orders,
      sum(ib.quantity)::integer as units,
      sum(ib.item_revenue)::numeric as revenue,
      sum(coalesce(ib.refunded_amount, 0) * ib.allocation_share)::numeric as refunded_amount,
      sum(coalesce(ib.effective_marketplace_fee, 0) * ib.allocation_share)::numeric as marketplace_fees,
      sum(coalesce(ib.seller_shipping_cost, 0) * ib.allocation_share)::numeric as shipping_cost,
      sum(coalesce(ib.tax_amount, 0) * ib.allocation_share)::numeric as taxes,
      sum(ib.item_product_cost)::numeric as product_cost,
      sum(coalesce(ib.ads_cost, 0) * ib.allocation_share)::numeric as ads_order_cost,
      count(*)::numeric as item_rows,
      sum(ib.cost_known)::numeric as cost_known_rows
    from item_base ib
    group by ib.product_id
  ),
  latest_ads as (
    select am.account_id, max(am.snapshot_at) as snapshot_at
    from public.ecommerce_ads_metrics am
    cross join params p
    where (select public.has_ecommerce_access(p_company_id))
      and am.company_id = p_company_id
      and (p_account_id is null or am.account_id = p_account_id)
      and am.metric_scope = 'product_period'
      and am.period_days = p.days
    group by am.account_id
  ),
  product_ads as (
    select
      am.product_id,
      coalesce(sum(am.investment), 0)::numeric as ads_synced_investment
    from public.ecommerce_ads_metrics am
    join latest_ads la
      on la.account_id = am.account_id
     and la.snapshot_at = am.snapshot_at
    cross join params p
    where am.company_id = p_company_id
      and (p_account_id is null or am.account_id = p_account_id)
      and am.metric_scope = 'product_period'
      and am.period_days = p.days
      and am.product_id is not null
    group by am.product_id
  ),
  calculated as (
    select
      po.*,
      coalesce(pa.ads_synced_investment, 0)::numeric as ads_synced_investment,
      greatest(po.ads_order_cost, coalesce(pa.ads_synced_investment, 0))::numeric as ads_effective,
      case
        when po.item_rows > 0
          then (po.cost_known_rows / po.item_rows) * 100
        else 0
      end::numeric as cost_coverage_percent
    from product_orders po
    left join product_ads pa on pa.product_id = po.product_id
  ),
  final as (
    select
      c.*,
      (
        c.revenue - c.refunded_amount - c.marketplace_fees - c.shipping_cost
        - c.taxes - c.product_cost - c.ads_effective
      )::numeric as net_profit
    from calculated c
  ),
  ranked as (
    select
      row_number() over(order by f.net_profit desc, f.revenue desc)::integer as ranking,
      f.*
    from final f
  )
  select
    r.ranking,
    r.product_id,
    r.sku,
    r.product_name,
    r.orders,
    r.units,
    round(r.revenue, 2),
    round(r.refunded_amount, 2),
    round(r.marketplace_fees, 2),
    round(r.shipping_cost, 2),
    round(r.taxes, 2),
    round(r.product_cost, 2),
    round(r.ads_order_cost, 2),
    round(r.ads_synced_investment, 2),
    round(r.ads_effective, 2),
    round(r.net_profit, 2),
    round(case when r.revenue > 0 then (r.net_profit / r.revenue) * 100 else 0 end, 2),
    round(r.cost_coverage_percent, 2),
    case
      when r.cost_coverage_percent < 100 then 'pending_cost'
      when r.net_profit < 0 then 'negative'
      when r.revenue > 0 and (r.net_profit / r.revenue) * 100 < 10 then 'low_margin'
      else 'healthy'
    end::text
  from ranked r
  order by r.net_profit desc, r.revenue desc
  limit greatest(coalesce(p_limit, 50), 1);
$$;

revoke all on function public.get_ecommerce_product_profitability_v2(uuid, uuid, integer, integer) from public;
revoke all on function public.get_ecommerce_product_profitability_v2(uuid, uuid, integer, integer) from anon;
grant execute on function public.get_ecommerce_product_profitability_v2(uuid, uuid, integer, integer) to authenticated;
grant execute on function public.get_ecommerce_product_profitability_v2(uuid, uuid, integer, integer) to service_role;

-- AC360 E-commerce Intelligence
-- Custo de Produto / Importação de Custos v3
-- Aplicado em produção em 2026-10-11.
--
-- Regras:
-- 1. Custos atuais são gravados em ecommerce_products.cost_price.
-- 2. Toda alteração real gera histórico em ecommerce_product_cost_history.
-- 3. Pedidos antigos só recebem backfill se cost_price_at_sale ainda estiver vazio/zero.
-- 4. Snapshots históricos já preenchidos nunca são sobrescritos por mudança futura de custo.
-- 5. Recalculo usa receita realizada (descontando reembolso), taxa efetiva ML/MP,
--    frete, Ads, impostos e custo do produto.
-- 6. Importação pública valida acesso multi-tenant; função interna de recálculo é service-only.

create or replace function public.recalculate_ecommerce_profit_v3(
  p_company_id uuid,
  p_account_id uuid,
  p_product_id uuid default null
)
returns table(
  items_recalculated integer,
  items_backfilled integer,
  orders_recalculated integer,
  orders_high_confidence integer,
  orders_pending_cost integer
)
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $$
declare
  v_items_recalculated integer := 0;
  v_items_backfilled integer := 0;
  v_orders_recalculated integer := 0;
begin
  if p_company_id is null then
    raise exception 'p_company_id é obrigatório';
  end if;

  if p_account_id is null then
    raise exception 'p_account_id é obrigatório';
  end if;

  if not exists (
    select 1
    from public.ecommerce_accounts ea
    where ea.id = p_account_id
      and ea.company_id = p_company_id
  ) then
    raise exception 'Conta de e-commerce não encontrada dentro da empresa informada';
  end if;

  drop table if exists tmp_affected_orders_v3;
  create temp table tmp_affected_orders_v3 (
    order_id uuid primary key
  ) on commit drop;

  insert into tmp_affected_orders_v3(order_id)
  select distinct oi.order_id
  from public.ecommerce_order_items oi
  join public.ecommerce_orders o
    on o.id = oi.order_id
   and o.company_id = p_company_id
   and o.account_id = p_account_id
  where oi.company_id = p_company_id
    and (
      p_product_id is null
      or oi.product_id = p_product_id
    );

  with source_cost as (
    select
      oi.id as item_id,
      oi.cost_price_at_sale as existing_cost,
      oi.cost_source as existing_cost_source,
      oi.quantity,
      oi.total_price,
      oi.item_marketplace_fee,
      oi.item_shipping_cost,
      oi.item_ads_cost,
      oi.product_id,
      p.cost_price as current_product_cost,
      case
        when coalesce(oi.cost_price_at_sale,0) > 0
          then oi.cost_price_at_sale
        when coalesce(p.cost_price,0) > 0
          then p.cost_price
        else 0
      end::numeric as effective_cost,
      case
        when coalesce(oi.cost_price_at_sale,0) <= 0
         and coalesce(p.cost_price,0) > 0
          then true
        else false
      end as is_backfill
    from public.ecommerce_order_items oi
    join tmp_affected_orders_v3 tao
      on tao.order_id = oi.order_id
    join public.ecommerce_orders o
      on o.id = oi.order_id
     and o.company_id = p_company_id
     and o.account_id = p_account_id
    left join public.ecommerce_products p
      on p.id = oi.product_id
     and p.company_id = oi.company_id
    where oi.company_id = p_company_id
  ),
  updated as (
    update public.ecommerce_order_items oi
    set
      cost_price_at_sale = sc.effective_cost,
      total_cost_at_sale =
        case
          when sc.effective_cost > 0
            then round((coalesce(sc.quantity,0) * sc.effective_cost)::numeric,2)
          else 0
        end,
      item_gross_profit =
        round((
          coalesce(sc.total_price,0)
          - case
              when sc.effective_cost > 0
                then coalesce(sc.quantity,0) * sc.effective_cost
              else 0
            end
        )::numeric,2),
      item_net_profit =
        round((
          coalesce(sc.total_price,0)
          - case
              when sc.effective_cost > 0
                then coalesce(sc.quantity,0) * sc.effective_cost
              else 0
            end
          - coalesce(sc.item_marketplace_fee,0)
          - coalesce(sc.item_shipping_cost,0)
          - coalesce(sc.item_ads_cost,0)
        )::numeric,2),
      item_profit_margin_percent =
        case
          when coalesce(sc.total_price,0) > 0
           and sc.effective_cost > 0
          then round((
            (
              coalesce(sc.total_price,0)
              - (coalesce(sc.quantity,0) * sc.effective_cost)
              - coalesce(sc.item_marketplace_fee,0)
              - coalesce(sc.item_shipping_cost,0)
              - coalesce(sc.item_ads_cost,0)
            )
            / coalesce(sc.total_price,0)
          ) * 100,2)
          else null
        end,
      cost_source =
        case
          when coalesce(sc.existing_cost,0) > 0
            then coalesce(sc.existing_cost_source,'sale_snapshot')
          when sc.is_backfill
            then 'product_cost_backfill_v3'
          else coalesce(sc.existing_cost_source,'product_cost_price')
        end,
      profit_status =
        case
          when sc.product_id is null then 'missing_product'
          when sc.effective_cost <= 0 then 'pending_cost'
          else 'calculated'
        end,
      updated_at = now()
    from source_cost sc
    where oi.id = sc.item_id
      and oi.company_id = p_company_id
    returning sc.is_backfill
  )
  select
    count(*)::integer,
    count(*) filter (where is_backfill)::integer
  into
    v_items_recalculated,
    v_items_backfilled
  from updated;

  with order_calc as (
    select
      o.id as order_id,
      coalesce(sum(oi.total_cost_at_sale),0)::numeric as product_cost_total,
      count(oi.id) filter (
        where oi.product_id is null
           or coalesce(oi.cost_price_at_sale,0) <= 0
           or oi.profit_status <> 'calculated'
      ) as pending_items
    from public.ecommerce_orders o
    join tmp_affected_orders_v3 tao
      on tao.order_id = o.id
    left join public.ecommerce_order_items oi
      on oi.order_id = o.id
     and oi.company_id = o.company_id
    where o.company_id = p_company_id
      and o.account_id = p_account_id
    group by o.id
  ),
  final_calc as (
    select
      o.id as order_id,
      oc.product_cost_total,
      greatest(coalesce(o.total_amount,0) - coalesce(o.refunded_amount,0),0)::numeric as realized_revenue,
      case
        when coalesce(o.marketplace_fee,0) > 0
          then coalesce(o.marketplace_fee,0)
        else coalesce(o.mercadolivre_fee,0) + coalesce(o.mercadopago_fee,0)
      end::numeric as effective_marketplace_fee,
      oc.pending_items
    from public.ecommerce_orders o
    join order_calc oc on oc.order_id=o.id
    where o.company_id=p_company_id
      and o.account_id=p_account_id
  ),
  updated_orders as (
    update public.ecommerce_orders o
    set
      product_cost_total = round(fc.product_cost_total,2),
      gross_profit = round((fc.realized_revenue - fc.product_cost_total)::numeric,2),
      net_profit = round((
        fc.realized_revenue
        - fc.effective_marketplace_fee
        - coalesce(o.seller_shipping_cost,0)
        - coalesce(o.ads_cost,0)
        - coalesce(o.tax_amount,0)
        - fc.product_cost_total
      )::numeric,2),
      profit_margin_percent =
        case
          when fc.realized_revenue > 0
           and fc.pending_items = 0
          then round((
            (
              fc.realized_revenue
              - fc.effective_marketplace_fee
              - coalesce(o.seller_shipping_cost,0)
              - coalesce(o.ads_cost,0)
              - coalesce(o.tax_amount,0)
              - fc.product_cost_total
            ) / fc.realized_revenue
          ) * 100,2)
          else null
        end,
      profit_confidence =
        case
          when fc.pending_items = 0 then 'high'
          else 'pending_cost'
        end,
      profit_status =
        case
          when coalesce(o.is_cancelled,false) then 'cancelled'
          when fc.pending_items > 0 then 'pending_cost'
          when (
            fc.realized_revenue
            - fc.effective_marketplace_fee
            - coalesce(o.seller_shipping_cost,0)
            - coalesce(o.ads_cost,0)
            - coalesce(o.tax_amount,0)
            - fc.product_cost_total
          ) < 0 then 'negative'
          when fc.realized_revenue > 0
           and (
             (
               fc.realized_revenue
               - fc.effective_marketplace_fee
               - coalesce(o.seller_shipping_cost,0)
               - coalesce(o.ads_cost,0)
               - coalesce(o.tax_amount,0)
               - fc.product_cost_total
             ) / fc.realized_revenue
           ) * 100 < 10 then 'low_margin'
          else 'calculated'
        end,
      updated_at = now()
    from final_calc fc
    where o.id=fc.order_id
      and o.company_id=p_company_id
      and o.account_id=p_account_id
    returning o.id
  )
  select count(*)::integer
  into v_orders_recalculated
  from updated_orders;

  return query
  select
    v_items_recalculated,
    v_items_backfilled,
    v_orders_recalculated,
    count(*) filter (where o.profit_confidence='high')::integer,
    count(*) filter (where o.profit_confidence='pending_cost')::integer
  from public.ecommerce_orders o
  join tmp_affected_orders_v3 tao on tao.order_id=o.id
  where o.company_id=p_company_id
    and o.account_id=p_account_id;
end;
$$;

revoke all on function public.recalculate_ecommerce_profit_v3(uuid,uuid,uuid) from public;
revoke all on function public.recalculate_ecommerce_profit_v3(uuid,uuid,uuid) from anon;
revoke all on function public.recalculate_ecommerce_profit_v3(uuid,uuid,uuid) from authenticated;
grant execute on function public.recalculate_ecommerce_profit_v3(uuid,uuid,uuid) to service_role;

create or replace function public.upsert_ecommerce_product_costs_v3(
  p_company_id uuid,
  p_rows jsonb,
  p_changed_by text default 'AC360 Custos v3',
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_row jsonb;
  v_product_id uuid;
  v_sku text;
  v_cost_text text;
  v_cost numeric;
  v_old_cost numeric;
  v_product_name text;
  v_match_count integer;
  v_received integer := 0;
  v_updated integer := 0;
  v_unchanged integer := 0;
  v_invalid integer := 0;
  v_not_found integer := 0;
  v_ambiguous integer := 0;
  v_accounts_recalculated integer := 0;
  v_items_recalculated integer := 0;
  v_items_backfilled integer := 0;
  v_orders_recalculated integer := 0;
  v_orders_high_confidence integer := 0;
  v_orders_pending_cost integer := 0;
  v_account_id uuid;
  v_recalc record;
  v_details jsonb := '[]'::jsonb;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role'
     and not public.is_platform_admin()
     and not public.has_ecommerce_access(p_company_id) then
    raise exception 'Acesso negado para esta empresa.'
      using errcode='42501';
  end if;

  if p_company_id is null then
    raise exception 'p_company_id é obrigatório';
  end if;

  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'p_rows precisa ser um array JSON.';
  end if;

  if jsonb_array_length(p_rows) > 1000 then
    raise exception 'Importação limitada a 1000 linhas por operação.';
  end if;

  create temp table if not exists tmp_cost_products_v3(
    product_id uuid primary key
  ) on commit drop;
  truncate tmp_cost_products_v3;

  for v_row in
    select value from jsonb_array_elements(p_rows)
  loop
    v_received := v_received + 1;
    v_product_id := null;
    v_sku := nullif(btrim(coalesce(v_row->>'sku','')),'');
    v_cost_text := replace(btrim(coalesce(v_row->>'cost_price','')),',','.');

    if nullif(btrim(coalesce(v_row->>'product_id','')),'') is not null
       and btrim(v_row->>'product_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
      v_product_id := btrim(v_row->>'product_id')::uuid;
    end if;

    if v_cost_text !~ '^[0-9]+([.][0-9]{1,4})?$'
       or v_cost_text::numeric <= 0 then
      v_invalid := v_invalid + 1;
      v_details := v_details || jsonb_build_array(jsonb_build_object(
        'line',v_received,'sku',v_sku,'product_id',v_product_id,
        'status','invalid_cost','message','Custo inválido ou menor/igual a zero.'
      ));
      continue;
    end if;

    v_cost := round(v_cost_text::numeric,2);

    if v_product_id is not null then
      select p.id,p.sku,p.product_name,p.cost_price
      into v_product_id,v_sku,v_product_name,v_old_cost
      from public.ecommerce_products p
      where p.company_id=p_company_id
        and p.id=v_product_id;
    else
      select p.id,p.sku,p.product_name,p.cost_price
      into v_product_id,v_sku,v_product_name,v_old_cost
      from public.ecommerce_products p
      where p.company_id=p_company_id
        and p.sku=v_sku
      limit 1;

      if v_product_id is null and v_sku is not null then
        select count(*),min(p.id)
        into v_match_count,v_product_id
        from public.ecommerce_products p
        where p.company_id=p_company_id
          and lower(btrim(p.sku))=lower(v_sku);

        if v_match_count > 1 then
          v_ambiguous := v_ambiguous + 1;
          v_details := v_details || jsonb_build_array(jsonb_build_object(
            'line',v_received,'sku',v_sku,'status','ambiguous_sku',
            'message','SKU ambíguo por diferença de maiúsculas/minúsculas. Use o SKU exatamente como aparece no AC360.'
          ));
          v_product_id := null;
          continue;
        elsif v_match_count = 1 then
          select p.sku,p.product_name,p.cost_price
          into v_sku,v_product_name,v_old_cost
          from public.ecommerce_products p
          where p.company_id=p_company_id
            and p.id=v_product_id;
        end if;
      end if;
    end if;

    if v_product_id is null then
      v_not_found := v_not_found + 1;
      v_details := v_details || jsonb_build_array(jsonb_build_object(
        'line',v_received,'sku',v_sku,'status','not_found',
        'message','Produto/SKU não encontrado.'
      ));
      continue;
    end if;

    if round(coalesce(v_old_cost,0)::numeric,2)=v_cost then
      v_unchanged := v_unchanged + 1;
      v_details := v_details || jsonb_build_array(jsonb_build_object(
        'line',v_received,'sku',v_sku,'product_id',v_product_id,
        'status','unchanged','cost_price',v_cost
      ));
      continue;
    end if;

    update public.ecommerce_products
    set cost_price=v_cost,
        updated_at=now()
    where company_id=p_company_id
      and id=v_product_id;

    insert into public.ecommerce_product_cost_history(
      company_id,product_id,old_cost_price,new_cost_price,changed_by,notes
    ) values (
      p_company_id,v_product_id,v_old_cost,v_cost,
      coalesce(nullif(btrim(p_changed_by),''),'AC360 Custos v3'),
      coalesce(
        p_notes,
        'Custo atualizado no AC360. Pedidos antigos sem snapshot recebem backfill uma única vez; snapshots existentes são preservados.'
      )
    );

    insert into tmp_cost_products_v3(product_id)
    values(v_product_id)
    on conflict(product_id) do nothing;

    v_updated := v_updated + 1;
    v_details := v_details || jsonb_build_array(jsonb_build_object(
      'line',v_received,'sku',v_sku,'product_id',v_product_id,
      'product_name',v_product_name,'status','updated',
      'old_cost_price',v_old_cost,'new_cost_price',v_cost
    ));
  end loop;

  if v_updated > 0 then
    for v_account_id in
      select distinct o.account_id
      from public.ecommerce_order_items oi
      join tmp_cost_products_v3 tp on tp.product_id=oi.product_id
      join public.ecommerce_orders o
        on o.id=oi.order_id
       and o.company_id=p_company_id
      where oi.company_id=p_company_id
        and o.account_id is not null
    loop
      select *
      into v_recalc
      from public.recalculate_ecommerce_profit_v3(
        p_company_id,
        v_account_id,
        null
      );

      v_accounts_recalculated := v_accounts_recalculated + 1;
      v_items_recalculated := v_items_recalculated + coalesce(v_recalc.items_recalculated,0);
      v_items_backfilled := v_items_backfilled + coalesce(v_recalc.items_backfilled,0);
      v_orders_recalculated := v_orders_recalculated + coalesce(v_recalc.orders_recalculated,0);
      v_orders_high_confidence := v_orders_high_confidence + coalesce(v_recalc.orders_high_confidence,0);
      v_orders_pending_cost := v_orders_pending_cost + coalesce(v_recalc.orders_pending_cost,0);
    end loop;
  end if;

  return jsonb_build_object(
    'success',true,
    'rows_received',v_received,
    'products_updated',v_updated,
    'products_unchanged',v_unchanged,
    'invalid_rows',v_invalid,
    'products_not_found',v_not_found,
    'ambiguous_skus',v_ambiguous,
    'accounts_recalculated',v_accounts_recalculated,
    'items_recalculated',v_items_recalculated,
    'items_backfilled',v_items_backfilled,
    'orders_recalculated',v_orders_recalculated,
    'orders_high_confidence',v_orders_high_confidence,
    'orders_pending_cost',v_orders_pending_cost,
    'details',v_details
  );
end;
$$;

revoke all on function public.upsert_ecommerce_product_costs_v3(uuid,jsonb,text,text) from public;
revoke all on function public.upsert_ecommerce_product_costs_v3(uuid,jsonb,text,text) from anon;
grant execute on function public.upsert_ecommerce_product_costs_v3(uuid,jsonb,text,text) to authenticated;
grant execute on function public.upsert_ecommerce_product_costs_v3(uuid,jsonb,text,text) to service_role;

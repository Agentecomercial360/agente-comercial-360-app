-- AC360 Marketplace Intelligence v1
-- Adds the schema needed for Ads Intelligence, ranking/competition history,
-- and Mercado Livre market radar data.
--
-- Frontend access is tenant-scoped via has_ecommerce_access(company_id).
-- Backend ingestion should use service_role and must never expose that key client-side.

alter table public.ecommerce_ads_metrics
  add column if not exists ad_group_id text,
  add column if not exists ad_group_external_id text,
  add column if not exists organic_sales_count integer not null default 0,
  add column if not exists organic_units_sold integer not null default 0,
  add column if not exists organic_revenue numeric not null default 0,
  add column if not exists organic_metrics_synced boolean not null default false,
  add column if not exists direct_sales_count integer not null default 0,
  add column if not exists indirect_sales_count integer not null default 0,
  add column if not exists direct_units_sold integer not null default 0,
  add column if not exists indirect_units_sold integer not null default 0,
  add column if not exists direct_revenue numeric not null default 0,
  add column if not exists indirect_revenue numeric not null default 0,
  add column if not exists cvr numeric,
  add column if not exists sov numeric,
  add column if not exists impression_share numeric,
  add column if not exists top_impression_share numeric,
  add column if not exists lost_impression_share_by_budget numeric,
  add column if not exists lost_impression_share_by_ad_rank numeric,
  add column if not exists acos_benchmark numeric,
  add column if not exists source text not null default 'mercadolivre',
  add column if not exists period_days integer not null default 1,
  add column if not exists period_start date,
  add column if not exists period_end date,
  add column if not exists metric_scope text not null default 'legacy',
  add column if not exists advertiser_id text,
  add column if not exists ad_group_title text,
  add column if not exists snapshot_at timestamptz not null default now();

update public.ecommerce_ads_metrics
set
  period_start = coalesce(period_start, metric_date),
  period_end = coalesce(period_end, metric_date)
where period_start is null or period_end is null;

alter table public.ecommerce_ads_metrics
  drop constraint if exists ecommerce_ads_metrics_unique;

create index if not exists idx_ecommerce_ads_metrics_account_date
  on public.ecommerce_ads_metrics (company_id, account_id, metric_date desc);

create unique index if not exists uq_ecommerce_ads_metrics_period_group
  on public.ecommerce_ads_metrics
  (company_id, account_id, ad_group_id, metric_date, period_days);

create index if not exists idx_ecommerce_ads_metrics_period_lookup
  on public.ecommerce_ads_metrics
  (company_id, account_id, source, period_days, metric_date desc);

create table if not exists public.ecommerce_catalog_competition_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  account_id uuid not null references public.ecommerce_accounts(id) on delete cascade,
  listing_id uuid not null references public.ecommerce_listings(id) on delete cascade,
  ml_item_id text not null,
  catalog_product_id text,
  competition_status text not null,
  previous_status text,
  change_type text,
  own_price numeric,
  winner_item_id text,
  winner_price numeric,
  source text not null default 'mercadolivre',
  raw_payload jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint ecommerce_catalog_competition_status_check
    check (competition_status in ('winning','sharing_first_place','competing','listed','unknown'))
);

create index if not exists idx_ecommerce_catalog_competition_lookup
  on public.ecommerce_catalog_competition_history
  (company_id, account_id, listing_id, checked_at desc);
create index if not exists idx_ecommerce_catalog_competition_account_id
  on public.ecommerce_catalog_competition_history(account_id);
create index if not exists idx_ecommerce_catalog_competition_listing_id
  on public.ecommerce_catalog_competition_history(listing_id);

alter table public.ecommerce_catalog_competition_history enable row level security;

drop policy if exists "Company users can read ecommerce catalog competition"
  on public.ecommerce_catalog_competition_history;

create policy "Company users can read ecommerce catalog competition"
on public.ecommerce_catalog_competition_history
for select
to authenticated
using (has_ecommerce_access(company_id));

grant select on public.ecommerce_catalog_competition_history to authenticated;
grant select, insert, update, delete on public.ecommerce_catalog_competition_history to service_role;

create table if not exists public.ecommerce_rank_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  account_id uuid not null references public.ecommerce_accounts(id) on delete cascade,
  listing_id uuid not null references public.ecommerce_listings(id) on delete cascade,
  keyword text not null,
  position integer not null check (position > 0),
  previous_position integer,
  source text not null default 'manual',
  note text,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_ecommerce_rank_history_lookup
  on public.ecommerce_rank_history
  (company_id, account_id, listing_id, keyword, checked_at desc);
create index if not exists idx_ecommerce_rank_history_account_id
  on public.ecommerce_rank_history(account_id);
create index if not exists idx_ecommerce_rank_history_listing_id
  on public.ecommerce_rank_history(listing_id);

alter table public.ecommerce_rank_history enable row level security;

drop policy if exists "Company users can read ecommerce rank history"
  on public.ecommerce_rank_history;
create policy "Company users can read ecommerce rank history"
on public.ecommerce_rank_history
for select
to authenticated
using (has_ecommerce_access(company_id));

drop policy if exists "Company users can insert ecommerce rank history"
  on public.ecommerce_rank_history;
create policy "Company users can insert ecommerce rank history"
on public.ecommerce_rank_history
for insert
to authenticated
with check (has_ecommerce_access(company_id));

drop policy if exists "Company users can update ecommerce rank history"
  on public.ecommerce_rank_history;
create policy "Company users can update ecommerce rank history"
on public.ecommerce_rank_history
for update
to authenticated
using (has_ecommerce_access(company_id))
with check (has_ecommerce_access(company_id));

drop policy if exists "Company users can delete ecommerce rank history"
  on public.ecommerce_rank_history;
create policy "Company users can delete ecommerce rank history"
on public.ecommerce_rank_history
for delete
to authenticated
using (has_ecommerce_access(company_id));

grant select, insert, update, delete on public.ecommerce_rank_history
  to authenticated, service_role;

create table if not exists public.ecommerce_market_trends (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  account_id uuid references public.ecommerce_accounts(id) on delete cascade,
  site_id text not null default 'MLB',
  category_id text,
  category_name text,
  trend_type text not null,
  rank integer not null check (rank > 0),
  keyword text,
  entity_id text,
  entity_type text,
  title text,
  url text,
  image_url text,
  snapshot_date date not null default current_date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ecommerce_market_trends_type_check
    check (trend_type in ('growing','desired','popular','best_seller'))
);

create index if not exists idx_ecommerce_market_trends_lookup
  on public.ecommerce_market_trends
  (company_id, site_id, category_id, trend_type, snapshot_date desc, rank);
create index if not exists idx_ecommerce_market_trends_account_id
  on public.ecommerce_market_trends(account_id);

create unique index if not exists uq_ecommerce_market_trends_snapshot_rank
  on public.ecommerce_market_trends
  (company_id,
   coalesce(account_id, '00000000-0000-0000-0000-000000000000'::uuid),
   site_id,
   coalesce(category_id, ''),
   trend_type,
   snapshot_date,
   rank);

alter table public.ecommerce_market_trends enable row level security;

drop policy if exists "Company users can read ecommerce market trends"
  on public.ecommerce_market_trends;
create policy "Company users can read ecommerce market trends"
on public.ecommerce_market_trends
for select
to authenticated
using (has_ecommerce_access(company_id));

grant select on public.ecommerce_market_trends to authenticated;
grant select, insert, update, delete on public.ecommerce_market_trends to service_role;


-- Generate actionable AC360 insights whenever a monitored position changes materially.

create or replace function public.ac360_competition_change_to_insight()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_product_id uuid;
  v_is_gain boolean;
  v_is_loss boolean;
begin
  if new.previous_status is null
     or new.previous_status = new.competition_status then
    return new;
  end if;

  v_is_gain :=
    new.competition_status in ('winning', 'sharing_first_place')
    and new.previous_status not in ('winning', 'sharing_first_place');

  v_is_loss :=
    new.previous_status in ('winning', 'sharing_first_place')
    and new.competition_status not in ('winning', 'sharing_first_place');

  if not v_is_gain and not v_is_loss then
    return new;
  end if;

  select product_id
    into v_product_id
  from public.ecommerce_listings
  where id = new.listing_id;

  insert into public.ecommerce_ai_insights (
    company_id, account_id, product_id, listing_id, insight_type, priority,
    title, diagnosis, probable_cause, recommended_action,
    suggested_price_action, status, generated_by, confidence_score
  )
  values (
    new.company_id,
    new.account_id,
    v_product_id,
    new.listing_id,
    'other',
    case when v_is_loss then 'high' else 'medium' end,
    case
      when v_is_loss then 'Anúncio perdeu posição no catálogo'
      else 'Anúncio ganhou posição no catálogo'
    end,
    format(
      'O anúncio %s mudou de %s para %s.%s',
      new.ml_item_id,
      new.previous_status,
      new.competition_status,
      case
        when new.winner_price is not null
          then format(
            ' Preço vencedor observado: R$ %s.',
            to_char(new.winner_price, 'FM999999990D00')
          )
        else ''
      end
    ),
    case
      when v_is_loss
        then 'Mudanças de preço, frete, disponibilidade, reputação ou competitividade podem ter afetado a posição.'
      else 'A competitividade do anúncio melhorou em relação ao snapshot anterior.'
    end,
    case
      when v_is_loss
        then 'Abrir Concorrência & Ranking, comparar preço/frete e revisar margem antes de qualquer ajuste.'
      else 'Monitorar a posição nas próximas atualizações e preservar margem antes de escalar.'
    end,
    case
      when v_is_loss and new.winner_price is not null
        then format(
          'Comparar seu preço com o vencedor em R$ %s sem reduzir abaixo da margem mínima.',
          to_char(new.winner_price, 'FM999999990D00')
        )
      else null
    end,
    'pending_review',
    'rule',
    1
  );

  return new;
end;
$$;

drop trigger if exists trg_ac360_competition_change_to_insight
  on public.ecommerce_catalog_competition_history;

create trigger trg_ac360_competition_change_to_insight
after insert on public.ecommerce_catalog_competition_history
for each row
execute function public.ac360_competition_change_to_insight();

create or replace function public.ac360_rank_change_to_insight()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_product_id uuid;
  v_delta integer;
begin
  if new.previous_position is null then
    return new;
  end if;

  v_delta := new.previous_position - new.position;

  if abs(v_delta) < 3 then
    return new;
  end if;

  select product_id
    into v_product_id
  from public.ecommerce_listings
  where id = new.listing_id;

  insert into public.ecommerce_ai_insights (
    company_id, account_id, product_id, listing_id, insight_type, priority,
    title, diagnosis, probable_cause, recommended_action,
    status, generated_by, confidence_score
  )
  values (
    new.company_id,
    new.account_id,
    v_product_id,
    new.listing_id,
    'other',
    case when v_delta < 0 then 'high' else 'medium' end,
    case
      when v_delta < 0
        then format('Ranking caiu %s posições', abs(v_delta))
      else format('Ranking subiu %s posições', v_delta)
    end,
    format(
      'Palavra-chave "%s": posição %s → %s.',
      new.keyword,
      new.previous_position,
      new.position
    ),
    case
      when v_delta < 0
        then 'Pode haver perda de relevância, alteração competitiva, mudança de preço/frete ou queda de conversão.'
      else 'O anúncio ganhou visibilidade na palavra-chave monitorada.'
    end,
    case
      when v_delta < 0
        then 'Revisar concorrentes, conversão, preço, frete, estoque, título e mídia antes de alterar o anúncio.'
      else 'Monitorar a evolução e verificar se o ganho se mantém antes de ampliar investimento.'
    end,
    'pending_review',
    'rule',
    1
  );

  return new;
end;
$$;

drop trigger if exists trg_ac360_rank_change_to_insight
  on public.ecommerce_rank_history;

create trigger trg_ac360_rank_change_to_insight
after insert on public.ecommerce_rank_history
for each row
execute function public.ac360_rank_change_to_insight();


-- Integration tokens are backend-only. Authenticated users can read operational
-- connection metadata, but cannot select access_token, refresh_token or raw_auth_payload.
revoke all privileges on table public.ecommerce_integrations from authenticated;

grant select (
  id,
  company_id,
  account_id,
  marketplace,
  provider,
  integration_name,
  integration_status,
  external_user_id,
  external_account_id,
  external_nickname,
  token_type,
  scope,
  expires_at,
  last_sync_at,
  next_sync_at,
  sync_products,
  sync_orders,
  sync_ads,
  sync_inventory,
  last_error_message,
  last_error_at,
  created_at,
  updated_at
) on public.ecommerce_integrations to authenticated;

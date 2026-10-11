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
  add column if not exists source text not null default 'mercadolivre';

create index if not exists idx_ecommerce_ads_metrics_account_date
  on public.ecommerce_ads_metrics (company_id, account_id, metric_date desc);

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

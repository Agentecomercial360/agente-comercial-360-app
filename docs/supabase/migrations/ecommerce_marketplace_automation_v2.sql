-- AC360 Marketplace Automation v2
-- Tracks health, retry timing, and last successful execution for Marketplace Intelligence.
-- Applied to production Supabase on 2026-10-11.

create table if not exists public.ecommerce_marketplace_sync_state (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  account_id uuid not null references public.ecommerce_accounts(id) on delete cascade,
  capability text not null
    check (capability in ('ads','competition','market_radar','shipment_labels')),
  resource_key text not null default 'account',
  status text not null default 'idle'
    check (status in ('idle','running','success','error')),
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  next_due_at timestamptz,
  last_error_message text,
  last_result jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (company_id, account_id, capability, resource_key)
);

create index if not exists idx_ecommerce_marketplace_sync_due
  on public.ecommerce_marketplace_sync_state
  (company_id, account_id, next_due_at);

alter table public.ecommerce_marketplace_sync_state enable row level security;

drop policy if exists "Company users can read ecommerce marketplace sync state"
  on public.ecommerce_marketplace_sync_state;

create policy "Company users can read ecommerce marketplace sync state"
on public.ecommerce_marketplace_sync_state
for select
to authenticated
using (has_ecommerce_access(company_id));

grant select on public.ecommerce_marketplace_sync_state to authenticated;
grant select, insert, update, delete
  on public.ecommerce_marketplace_sync_state to service_role;

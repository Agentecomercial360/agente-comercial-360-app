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


-- Creates an actionable AC360 insight when a sync fails and automatically
-- completes the insight when the integration recovers.
create or replace function public.handle_marketplace_sync_state_insight()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_title text;
begin
  v_title := 'Falha na sincronização: ' ||
    case new.capability
      when 'ads' then 'Product Ads'
      when 'competition' then 'Competição'
      when 'market_radar' then 'Radar de Mercado'
      when 'shipment_labels' then 'Etiquetas'
      else new.capability
    end;

  if new.status = 'error'
     and (
       tg_op = 'INSERT'
       or old.status is distinct from 'error'
       or old.last_error_message is distinct from new.last_error_message
     ) then
    if not exists (
      select 1
      from public.ecommerce_ai_insights i
      where i.company_id = new.company_id
        and i.account_id is not distinct from new.account_id
        and i.generated_by = 'marketplace_sync_watch'
        and i.title = v_title
        and i.status in ('pending_review','needs_review','monitoring')
        and i.created_at >= now() - interval '6 hours'
    ) then
      insert into public.ecommerce_ai_insights (
        company_id,
        account_id,
        insight_type,
        priority,
        title,
        diagnosis,
        probable_cause,
        recommended_action,
        status,
        generated_by,
        confidence_score
      ) values (
        new.company_id,
        new.account_id,
        'other',
        'high',
        v_title,
        coalesce(new.last_error_message, 'A sincronização automática do marketplace falhou.'),
        'Falha de autenticação, indisponibilidade temporária da API ou dado de integração inválido.',
        'Abra a Saúde da Inteligência, valide a conexão da conta e execute uma atualização manual se o retry automático não recuperar.',
        'pending_review',
        'marketplace_sync_watch',
        1
      );
    end if;
  elsif new.status = 'success' and tg_op = 'UPDATE' and old.status = 'error' then
    update public.ecommerce_ai_insights i
       set status = 'completed',
           updated_at = now(),
           diagnosis = coalesce(i.diagnosis, '') || ' Recuperado automaticamente em ' ||
             to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') || '.'
     where i.company_id = new.company_id
       and i.account_id is not distinct from new.account_id
       and i.generated_by = 'marketplace_sync_watch'
       and i.title = v_title
       and i.status in ('pending_review','needs_review','monitoring');
  end if;

  return new;
end;
$$;

drop trigger if exists trg_marketplace_sync_state_insight
  on public.ecommerce_marketplace_sync_state;

create trigger trg_marketplace_sync_state_insight
after insert or update of status, last_error_message
on public.ecommerce_marketplace_sync_state
for each row
execute function public.handle_marketplace_sync_state_insight();

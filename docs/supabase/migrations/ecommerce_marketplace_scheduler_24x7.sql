-- AC360 Marketplace Scheduler 24x7
-- Enables Supabase Cron + pg_net, protects scheduler calls with Vault,
-- and tracks Mercado Livre authentication health per account.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pgcrypto with schema extensions;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

do $$
begin
  if not exists (select 1 from vault.secrets where name='ac360_scheduler_secret') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'ac360_scheduler_secret',
      'Secret used only by Supabase Cron to invoke the AC360 marketplace scheduler'
    );
  end if;

  if not exists (select 1 from vault.secrets where name='ac360_project_url') then
    perform vault.create_secret(
      'https://dmwcbecihuxqzzjouevk.supabase.co',
      'ac360_project_url',
      'AC360 Supabase project URL'
    );
  end if;
end
$$;

create or replace function public.verify_ac360_scheduler_secret(candidate text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from vault.decrypted_secrets s
    where s.name='ac360_scheduler_secret'
      and s.decrypted_secret = candidate
  );
$$;

revoke all on function public.verify_ac360_scheduler_secret(text) from public;
revoke all on function public.verify_ac360_scheduler_secret(text) from anon;
revoke all on function public.verify_ac360_scheduler_secret(text) from authenticated;
grant execute on function public.verify_ac360_scheduler_secret(text) to service_role;

alter table public.ecommerce_marketplace_sync_state
  drop constraint if exists ecommerce_marketplace_sync_state_capability_check;

alter table public.ecommerce_marketplace_sync_state
  add constraint ecommerce_marketplace_sync_state_capability_check
  check (capability in ('auth','ads','competition','market_radar','shipment_labels'));

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
      when 'auth' then 'Autenticação Mercado Livre'
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
        company_id, account_id, insight_type, priority, title, diagnosis,
        probable_cause, recommended_action, status, generated_by, confidence_score
      ) values (
        new.company_id,
        new.account_id,
        'other',
        case when new.capability='auth' then 'critical' else 'high' end,
        v_title,
        coalesce(new.last_error_message, 'A sincronização automática do marketplace falhou.'),
        case
          when new.capability='auth'
            then 'O access token da conta expirou e o refresh service-to-service ainda não está disponível.'
          else 'Falha de autenticação, indisponibilidade temporária da API ou dado de integração inválido.'
        end,
        case
          when new.capability='auth'
            then 'Reconecte a conta Mercado Livre. Depois da reconexão, o scheduler retoma Ads, Radar e competição automaticamente.'
          else 'Abra a Saúde da Inteligência, valide a conexão da conta e execute uma atualização manual se o retry automático não recuperar.'
        end,
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

do $$
begin
  if exists (select 1 from cron.job where jobname='ac360-marketplace-24x7') then
    perform cron.unschedule('ac360-marketplace-24x7');
  end if;
end
$$;

select cron.schedule(
  'ac360-marketplace-24x7',
  '*/15 * * * *',
  $cron$
    select net.http_post(
      url := (
        select decrypted_secret
        from vault.decrypted_secrets
        where name='ac360_project_url'
      ) || '/functions/v1/ml-marketplace-scheduler',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'x-ac360-cron-secret', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name='ac360_scheduler_secret'
        )
      ),
      body := jsonb_build_object(
        'source','supabase_cron',
        'scheduled_at', now()
      ),
      timeout_milliseconds := 120000
    );
  $cron$
);

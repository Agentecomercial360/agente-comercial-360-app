-- AC360 E-commerce Intelligence
-- Conciliação Financeira Automática v1
-- Adiciona a capacidade ao estado do scheduler e ao ciclo de alertas.

alter table public.ecommerce_marketplace_sync_state
  drop constraint if exists ecommerce_marketplace_sync_state_capability_check;

alter table public.ecommerce_marketplace_sync_state
  add constraint ecommerce_marketplace_sync_state_capability_check
  check (
    capability = any (
      array[
        'auth'::text,
        'ads'::text,
        'competition'::text,
        'market_radar'::text,
        'shipment_labels'::text,
        'financial_reconciliation'::text
      ]
    )
  );

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
      when 'financial_reconciliation' then 'Conciliação Financeira'
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
            then 'O access token da conta expirou e a renovação automática não conseguiu recuperar a sessão.'
          when new.capability='financial_reconciliation'
            then 'Falha ao normalizar pagamentos, frete, descontos ou devoluções salvos pelo sync do marketplace.'
          else 'Falha de autenticação, indisponibilidade temporária da API ou dado de integração inválido.'
        end,
        case
          when new.capability='auth'
            then 'Verifique a Saúde da Inteligência. Se o próximo ciclo não recuperar a conta, reconecte o Mercado Livre.'
          when new.capability='financial_reconciliation'
            then 'Abra a Saúde da Inteligência e verifique a conciliação financeira; o scheduler fará nova tentativa automaticamente.'
          else 'Abra a Saúde da Inteligência e valide o módulo; o scheduler fará nova tentativa automaticamente.'
        end,
        'pending_review',
        'marketplace_sync_watch',
        1
      );
    end if;
  elsif new.status = 'success' then
    update public.ecommerce_ai_insights i
       set status = 'completed',
           updated_at = now(),
           diagnosis = case
             when coalesce(i.diagnosis,'') like '%Recuperado automaticamente em %'
               then i.diagnosis
             else coalesce(i.diagnosis, '') || ' Recuperado automaticamente em ' ||
               to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') || '.'
           end
     where i.company_id = new.company_id
       and i.account_id is not distinct from new.account_id
       and i.generated_by = 'marketplace_sync_watch'
       and i.title = v_title
       and i.status in ('pending_review','needs_review','monitoring');
  end if;

  return new;
end;
$$;

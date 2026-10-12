-- AC360 E-commerce Intelligence
-- Central de Clientes AC360 v1
--
-- Visão agregada exclusiva de platform admin para gestão comercial/operacional.
-- Não altera políticas RLS das tabelas-base.
-- Usuários comuns continuam limitados aos próprios tenants.

create or replace function public.get_admin_ecommerce_clients_v1()
returns table(
  company_id uuid,
  company_name text,
  company_status text,
  company_email text,
  created_at timestamptz,
  owner_name text,
  owner_email text,
  ecommerce_status text,
  plan_name text,
  module_started_at timestamptz,
  module_expires_at timestamptz,
  accounts_total integer,
  accounts_connected integer,
  last_sync_at timestamptz,
  orders_total bigint,
  orders_30d bigint,
  sync_errors integer,
  sync_attention integer,
  onboarding_stage text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Acesso restrito ao administrador da plataforma.'
      using errcode='42501';
  end if;

  return query
  with owners as (
    select distinct on (cu.company_id)
      cu.company_id,
      cu.name,
      cu.email
    from public.company_users cu
    where cu.is_active = true
    order by
      cu.company_id,
      case when cu.role='owner' then 0 when cu.role='admin' then 1 else 2 end,
      cu.created_at asc
  ),
  modules as (
    select distinct on (cm.company_id)
      cm.company_id,
      cm.status,
      cm.plan_name,
      cm.started_at,
      cm.expires_at
    from public.company_modules cm
    where cm.module_key='ecommerce'
    order by cm.company_id, cm.updated_at desc nulls last, cm.created_at desc
  ),
  accounts as (
    select
      ea.company_id,
      count(*)::integer as total,
      count(*) filter (
        where ea.is_active=true
          and (
            lower(coalesce(ea.auth_status,'')) in (
              'connected','authorized','active','conectada','conectado'
            )
            or ea.ml_user_id is not null
            or ea.last_sync_at is not null
          )
      )::integer as connected,
      max(ea.last_sync_at) as last_sync_at
    from public.ecommerce_accounts ea
    where lower(replace(coalesce(ea.marketplace,''),' ','_')) in (
      'mercado_livre','mercadolivre','ml'
    )
    group by ea.company_id
  ),
  orders as (
    select
      o.company_id,
      count(*)::bigint as total,
      count(*) filter (
        where o.order_date >= now() - interval '30 days'
      )::bigint as last_30d
    from public.ecommerce_orders o
    group by o.company_id
  ),
  sync_health as (
    select
      s.company_id,
      count(*) filter (where s.status='error')::integer as errors,
      count(*) filter (
        where s.status in ('running','pending','idle')
           or (
             s.next_due_at is not null
             and s.next_due_at < now() - interval '20 minutes'
             and s.status <> 'error'
           )
      )::integer as attention
    from public.ecommerce_marketplace_sync_state s
    group by s.company_id
  )
  select
    c.id,
    c.name,
    coalesce(c.status,'active'),
    c.email,
    c.created_at,
    ow.name,
    ow.email,
    coalesce(m.status,'not_enabled'),
    m.plan_name,
    m.started_at,
    m.expires_at,
    coalesce(a.total,0),
    coalesce(a.connected,0),
    a.last_sync_at,
    coalesce(o.total,0),
    coalesce(o.last_30d,0),
    coalesce(sh.errors,0),
    coalesce(sh.attention,0),
    case
      when m.company_id is null then 'module_missing'
      when coalesce(a.total,0)=0 then 'account_missing'
      when coalesce(a.connected,0)=0 then 'authorization_pending'
      when a.last_sync_at is null then 'first_sync_pending'
      else 'ready'
    end::text
  from public.companies c
  left join owners ow on ow.company_id=c.id
  left join modules m on m.company_id=c.id
  left join accounts a on a.company_id=c.id
  left join orders o on o.company_id=c.id
  left join sync_health sh on sh.company_id=c.id
  where
    m.company_id is not null
    or a.company_id is not null
  order by c.created_at desc nulls last;
end;
$$;

revoke all on function public.get_admin_ecommerce_clients_v1() from public;
revoke all on function public.get_admin_ecommerce_clients_v1() from anon;
grant execute on function public.get_admin_ecommerce_clients_v1() to authenticated;
grant execute on function public.get_admin_ecommerce_clients_v1() to service_role;

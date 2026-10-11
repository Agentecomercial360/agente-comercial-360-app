-- AC360 E-commerce Intelligence
-- Onboarding self-service v1
--
-- Cria a primeira empresa de um usuário autenticado que ainda não possui
-- nenhum vínculo em company_users. A operação é atômica:
-- empresa + owner + módulo E-commerce em implementation.
--
-- Segurança:
-- - auth.uid() obrigatório;
-- - somente usuários sem vínculo prévio podem executar;
-- - anon bloqueado;
-- - authenticated liberado;
-- - SECURITY DEFINER usado somente para a criação inicial, com validação explícita.

create or replace function public.create_ecommerce_onboarding_company_v1(
  p_company_name text,
  p_owner_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := coalesce(auth.jwt()->>'email','');
  v_company_id uuid;
  v_company_user_id uuid;
  v_module_id uuid;
  v_name text := btrim(coalesce(p_company_name,''));
  v_owner_name text := nullif(btrim(coalesce(p_owner_name,'')),'');
begin
  if v_user_id is null then
    raise exception 'Usuário autenticado é obrigatório.'
      using errcode='42501';
  end if;

  if length(v_name) < 2 or length(v_name) > 120 then
    raise exception 'O nome da empresa deve ter entre 2 e 120 caracteres.'
      using errcode='22023';
  end if;

  if exists (
    select 1
    from public.company_users cu
    where cu.user_id = v_user_id
  ) then
    raise exception 'Este usuário já está vinculado a uma empresa.'
      using errcode='23505';
  end if;

  insert into public.companies (
    name,business_type,segment,email,status
  )
  values (
    v_name,'comercio','ecommerce',nullif(v_email,''),'active'
  )
  returning id into v_company_id;

  insert into public.company_users (
    user_id,company_id,role,is_active,name,email,department,permissions
  )
  values (
    v_user_id,
    v_company_id,
    'owner',
    true,
    coalesce(v_owner_name,split_part(v_email,'@',1)),
    nullif(v_email,''),
    'gestao',
    jsonb_build_object(
      'ecommerce',true,
      'manage_accounts',true,
      'manage_users',true
    )
  )
  returning id into v_company_user_id;

  insert into public.company_modules (
    company_id,module_key,module_name,status,plan_name
  )
  values (
    v_company_id,
    'ecommerce',
    'AC360 E-commerce Intelligence',
    'implementation',
    'Implantação inicial'
  )
  returning id into v_module_id;

  return jsonb_build_object(
    'success',true,
    'company_id',v_company_id,
    'company_user_id',v_company_user_id,
    'module_id',v_module_id,
    'company_name',v_name,
    'module_status','implementation'
  );
end;
$$;

revoke all on function public.create_ecommerce_onboarding_company_v1(text,text) from public;
revoke all on function public.create_ecommerce_onboarding_company_v1(text,text) from anon;
grant execute on function public.create_ecommerce_onboarding_company_v1(text,text) to authenticated;
grant execute on function public.create_ecommerce_onboarding_company_v1(text,text) to service_role;

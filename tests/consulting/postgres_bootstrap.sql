-- Disposable PostgreSQL-only test scaffolding. NEVER run against Supabase projects.
create role authenticated nologin;
create role anon nologin;
create schema auth;
create table auth.users (id uuid primary key);
create schema if not exists public;
create table public.platform_admins (user_id uuid primary key, is_active boolean not null default true);
create table public.companies (id uuid primary key, name text not null);
create table public.ecommerce_accounts (id uuid primary key, company_id uuid not null references public.companies(id));
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create function public.is_platform_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.platform_admins where user_id=auth.uid() and is_active)
$$;
grant usage on schema public, auth to authenticated;
grant execute on function auth.uid() to authenticated;
grant execute on function public.is_platform_admin() to authenticated;
insert into auth.users(id) values
 ('00000000-0000-4000-8000-000000000001'),
 ('00000000-0000-4000-8000-000000000002'),
 ('00000000-0000-4000-8000-000000000003');
insert into public.platform_admins(user_id) values ('00000000-0000-4000-8000-000000000001');
insert into public.companies values
 ('10000000-0000-4000-8000-000000000001','Synthetic A'),
 ('10000000-0000-4000-8000-000000000002','Synthetic B');
insert into public.ecommerce_accounts values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002');

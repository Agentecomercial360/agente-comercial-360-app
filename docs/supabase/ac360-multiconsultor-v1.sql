-- AC360 multi-consultant foundation (STAGED; review before running in production).
-- Assumes public.is_platform_admin() is already deployed and checks auth.uid().
create table if not exists public.ac360_consultants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete restrict,
  display_name text not null check (length(trim(display_name)) between 2 and 120),
  email text,
  status text not null default 'active' check (status in ('active','inactive')),
  capacity integer not null default 20 check (capacity between 0 and 1000),
  created_at timestamptz not null default now()
);
create table if not exists public.ac360_consultant_assignments (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references public.ac360_consultants(id) on delete restrict,
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null default 'lead' check (role in ('lead','support')),
  active boolean not null default true,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  check (ended_at is null or ended_at >= started_at)
);
create unique index if not exists ac360_one_lead_per_company
  on public.ac360_consultant_assignments(company_id) where active and role = 'lead';
create unique index if not exists ac360_active_consultant_company_role
  on public.ac360_consultant_assignments(consultant_id,company_id,role) where active;
create index if not exists ac360_assignments_consultant_idx
  on public.ac360_consultant_assignments(consultant_id,active);
create table if not exists public.ac360_consulting_sessions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.ac360_consultant_assignments(id) on delete restrict,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 45 check (duration_minutes between 15 and 240),
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  summary text,
  created_at timestamptz not null default now()
);
create table if not exists public.ac360_consulting_plans (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.ac360_consultant_assignments(id) on delete restrict,
  title text not null check (length(trim(title)) between 2 and 200),
  objective text,
  period_start date not null default current_date,
  period_end date,
  status text not null default 'draft' check (status in ('draft','active','completed','cancelled')),
  created_at timestamptz not null default now(),
  check (period_end is null or period_end >= period_start)
);
create table if not exists public.ac360_consulting_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.ac360_consulting_plans(id) on delete cascade,
  title text not null check (length(trim(title)) between 2 and 200),
  due_on date,
  status text not null default 'pending' check (status in ('pending','doing','done','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.ac360_consultants enable row level security;
alter table public.ac360_consultant_assignments enable row level security;
alter table public.ac360_consulting_sessions enable row level security;
alter table public.ac360_consulting_plans enable row level security;
alter table public.ac360_consulting_tasks enable row level security;

-- Consultants may only read their own profile/assignments; admins can manage.
create policy consultants_read on public.ac360_consultants
  for select to authenticated using (public.is_platform_admin() or user_id = (select auth.uid()));
create policy consultants_admin_insert on public.ac360_consultants
  for insert to authenticated with check (public.is_platform_admin());
create policy consultants_admin_update on public.ac360_consultants
  for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy assignments_read on public.ac360_consultant_assignments
  for select to authenticated using (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consultants c
      where c.id = consultant_id and c.user_id = (select auth.uid())
    )
  );
create policy assignments_admin_insert on public.ac360_consultant_assignments
  for insert to authenticated with check (public.is_platform_admin());
create policy assignments_admin_update on public.ac360_consultant_assignments
  for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

-- Session/plan/task access follows the assigned consultant only; no cross-tenant access.
create policy sessions_read on public.ac360_consulting_sessions
  for select to authenticated using (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consultant_assignments a
      join public.ac360_consultants c on c.id = a.consultant_id
      where a.id = assignment_id and a.active and c.user_id = (select auth.uid())
    )
  );
create policy sessions_insert on public.ac360_consulting_sessions
  for insert to authenticated with check (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consultant_assignments a
      join public.ac360_consultants c on c.id = a.consultant_id
      where a.id = assignment_id and a.active and c.status = 'active'
        and c.user_id = (select auth.uid())
    )
  );
create policy sessions_update on public.ac360_consulting_sessions
  for update to authenticated using (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consultant_assignments a
      join public.ac360_consultants c on c.id = a.consultant_id
      where a.id = assignment_id and a.active and c.status = 'active'
        and c.user_id = (select auth.uid())
    )
  ) with check (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consultant_assignments a
      join public.ac360_consultants c on c.id = a.consultant_id
      where a.id = assignment_id and a.active and c.status = 'active'
        and c.user_id = (select auth.uid())
    )
  );
create policy plans_read on public.ac360_consulting_plans
  for select to authenticated using (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consultant_assignments a
      join public.ac360_consultants c on c.id = a.consultant_id
      where a.id = assignment_id and a.active and c.user_id = (select auth.uid())
    )
  );
create policy plans_insert on public.ac360_consulting_plans
  for insert to authenticated with check (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consultant_assignments a
      join public.ac360_consultants c on c.id = a.consultant_id
      where a.id = assignment_id and a.active and c.status = 'active'
        and c.user_id = (select auth.uid())
    )
  );
create policy plans_update on public.ac360_consulting_plans
  for update to authenticated using (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consultant_assignments a
      join public.ac360_consultants c on c.id = a.consultant_id
      where a.id = assignment_id and a.active and c.status = 'active'
        and c.user_id = (select auth.uid())
    )
  ) with check (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consultant_assignments a
      join public.ac360_consultants c on c.id = a.consultant_id
      where a.id = assignment_id and a.active and c.status = 'active'
        and c.user_id = (select auth.uid())
    )
  );
create policy tasks_read on public.ac360_consulting_tasks
  for select to authenticated using (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consulting_plans p
      join public.ac360_consultant_assignments a on a.id = p.assignment_id
      join public.ac360_consultants c on c.id = a.consultant_id
      where p.id = plan_id and a.active and c.user_id = (select auth.uid())
    )
  );
create policy tasks_insert on public.ac360_consulting_tasks
  for insert to authenticated with check (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consulting_plans p
      join public.ac360_consultant_assignments a on a.id = p.assignment_id
      join public.ac360_consultants c on c.id = a.consultant_id
      where p.id = plan_id and a.active and c.status = 'active' and c.user_id = (select auth.uid())
    )
  );
create policy tasks_update on public.ac360_consulting_tasks
  for update to authenticated using (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consulting_plans p
      join public.ac360_consultant_assignments a on a.id = p.assignment_id
      join public.ac360_consultants c on c.id = a.consultant_id
      where p.id = plan_id and a.active and c.status = 'active' and c.user_id = (select auth.uid())
    )
  ) with check (
    public.is_platform_admin() or exists (
      select 1 from public.ac360_consulting_plans p
      join public.ac360_consultant_assignments a on a.id = p.assignment_id
      join public.ac360_consultants c on c.id = a.consultant_id
      where p.id = plan_id and a.active and c.status = 'active' and c.user_id = (select auth.uid())
    )
  );

grant select, insert, update on public.ac360_consultants,
  public.ac360_consultant_assignments,
  public.ac360_consulting_sessions,
  public.ac360_consulting_plans,
  public.ac360_consulting_tasks to authenticated;
-- Explicit no access to anonymous users.
revoke all on public.ac360_consultants,
  public.ac360_consultant_assignments,
  public.ac360_consulting_sessions,
  public.ac360_consulting_plans,
  public.ac360_consulting_tasks from anon;

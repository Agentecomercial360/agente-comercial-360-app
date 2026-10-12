\set ON_ERROR_STOP on
-- Execution order: bootstrap, AC360 migration, this fixture/assertion script.
-- All rows synthetic; run exclusively in the ephemeral GitHub Actions PostgreSQL container.
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
insert into public.ac360_consultants(user_id,display_name) values
 ('00000000-0000-4000-8000-000000000002','Test Consultant A'),
 ('00000000-0000-4000-8000-000000000003','Test Consultant B');
insert into public.ac360_consultant_assignments(consultant_id,company_id,company_display_name)
select id,'10000000-0000-4000-8000-000000000001','Synthetic A'
from public.ac360_consultants where user_id='00000000-0000-4000-8000-000000000002';
insert into public.ac360_consultant_assignments(consultant_id,company_id,company_display_name)
select id,'10000000-0000-4000-8000-000000000002','Synthetic B'
from public.ac360_consultants where user_id='00000000-0000-4000-8000-000000000003';
insert into public.ac360_consulting_plans(assignment_id,title)
select id,'Synthetic plan' from public.ac360_consultant_assignments;
insert into public.ac360_consulting_sessions(assignment_id,scheduled_at)
select id,now() from public.ac360_consultant_assignments;
insert into public.ac360_consulting_tasks(plan_id,title)
select id,'Synthetic task' from public.ac360_consulting_plans;

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
do $tests$
declare own uuid; n int;
begin
 select id into own from public.ac360_consultant_assignments where company_display_name='Synthetic A';
 select count(*) into n from public.ac360_consultant_assignments;
 if n<>1 then raise exception 'A can read % assignment rows; expected 1',n; end if;
 select count(*) into n from public.ac360_consulting_sessions;
 if n<>1 then raise exception 'A sessions: % (expected 1)',n; end if;
 select count(*) into n from public.ac360_consulting_plans;
 if n<>1 then raise exception 'A plans: % (expected 1)',n; end if;
 select count(*) into n from public.ac360_consulting_tasks;
 if n<>1 then raise exception 'A tasks: % (expected 1)',n; end if;

end
$tests$;

reset role;
select id as b_assignment from public.ac360_consultant_assignments where company_display_name='Synthetic B' \gset
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
select set_config('ac360.fixture.b_assignment', :'b_assignment', false);
do $tests$
begin
 begin
   insert into public.ac360_consulting_plans(assignment_id,title)
   values (current_setting('ac360.fixture.b_assignment')::uuid,'Forbidden plan');
   raise exception 'SECURITY FAILURE: A inserted B plan';
 exception when insufficient_privilege then null;
 end;
end
$tests$;
reset role;
update public.ac360_consultants set status='inactive' where user_id='00000000-0000-4000-8000-000000000002';
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
do $tests$
declare n int;
begin
 select count(*) into n from public.ac360_consultant_assignments;
 if n <> 0 then raise exception 'Inactive consultant retained % assignments',n; end if;
 select count(*) into n from public.ac360_consulting_tasks;
 if n <> 0 then raise exception 'Inactive consultant retained % tasks',n; end if;
end
$tests$;
reset role;

-- Verify anonymous users have no read privileges on any consultation data.
set role anon;
do $anon$
declare rec record; n integer;
begin
 for rec in select unnest(array[
   'ac360_consultants','ac360_consultant_assignments','ac360_consulting_sessions',
   'ac360_consulting_plans','ac360_consulting_tasks']) as tbl loop
   begin
     execute format('select count(*) from public.%I',rec.tbl) into n;
     if n <> 0 then raise exception 'SECURITY FAILURE: anonymous read % rows of %',n,rec.tbl; end if;
   exception when insufficient_privilege then null;
   end;
 end loop;
end
$anon$;
reset role;

-- Capture baseline before attempting cross-tenant UPDATE as consultant B.
select company_display_name as original_name from public.ac360_consultant_assignments
where id=:'b_assignment' \gset
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
update public.ac360_consultant_assignments
set company_display_name='UNAUTHORIZED EDIT'
where id=:'b_assignment';
reset role;
do $verify$
declare actual text;
begin
 select company_display_name into actual from public.ac360_consultant_assignments
 where id=current_setting('ac360.fixture.b_assignment')::uuid;
 if actual='UNAUTHORIZED EDIT' then
   raise exception 'SECURITY FAILURE: consultant A modified consultant B assignment';
 end if;
end
$verify$;

-- Administrator closes A assignment; verify former A has no portfolio data.
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
update public.ac360_consultants
set status='active'
where user_id='00000000-0000-4000-8000-000000000002';
update public.ac360_consultant_assignments
set active=false, ended_at=now()
where company_display_name='Synthetic A';
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
do $closed$
declare n integer;
begin
 select count(*) into n from public.ac360_consulting_sessions;
 if n<>0 then raise exception 'Closed assignment leaked sessions: %',n; end if;
 select count(*) into n from public.ac360_consulting_plans;
 if n<>0 then raise exception 'Closed assignment leaked plans: %',n; end if;
 select count(*) into n from public.ac360_consulting_tasks;
 if n<>0 then raise exception 'Closed assignment leaked tasks: %',n; end if;
end
$closed$;
reset role;


-- Reassign company A to consultant B without changing the historical assignment.
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
insert into public.ac360_consultant_assignments(consultant_id, company_id, company_display_name)
select id, '10000000-0000-4000-8000-000000000001', 'Synthetic A - successor'
from public.ac360_consultants
where user_id='00000000-0000-4000-8000-000000000003';

do $transfer$
declare old_id uuid; new_id uuid; n integer;
begin
 select id into old_id from public.ac360_consultant_assignments where company_display_name='Synthetic A';
 select id into new_id from public.ac360_consultant_assignments where company_display_name='Synthetic A - successor';
 if old_id = new_id then raise exception 'Transfer reused historical assignment'; end if;
 select count(*) into n from public.ac360_consulting_plans where assignment_id=old_id;
 if n<>1 then raise exception 'Historical plan was lost after transfer'; end if;
 select count(*) into n from public.ac360_consulting_plans where assignment_id=new_id;
 if n<>0 then raise exception 'Historical plan migrated to successor'; end if;
 -- Even an admin must not rewrite a historical plan's ownership.
 begin
  update public.ac360_consulting_plans set assignment_id=new_id where assignment_id=old_id;
  raise exception 'SECURITY FAILURE: historical plan owner was modified';
 exception when check_violation then null;
 end;
end
$transfer$;

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003';
do $successor$
declare n integer;
begin
 select count(*) into n from public.ac360_consultant_assignments;
 if n<>2 then raise exception 'Successor expected two active assignments, got %',n; end if;
 select count(*) into n from public.ac360_consulting_plans;
 if n<>1 then raise exception 'Successor can read old historical plans: %',n; end if;
end
$successor$;
reset role;

\echo PASS: ephemeral PostgreSQL RLS contract: tenant reads, INSERT deny, inactive revocation, anonymous access, UPDATE isolation, closed assignment


-- Verify immutable history on all three child-table variants after a portfolio transfer.
-- The synthetic fixtures have meetings, plans and tasks for both original companies.
do $history$
declare old_assignment uuid; successor uuid; old_plan uuid; other_plan uuid;
begin
 select id into old_assignment from public.ac360_consultant_assignments where company_display_name='Synthetic A';
 select id into successor from public.ac360_consultant_assignments where company_display_name='Synthetic A - successor';
 select id into old_plan from public.ac360_consulting_plans where assignment_id=old_assignment limit 1;
 select id into other_plan from public.ac360_consulting_plans where assignment_id<>old_assignment limit 1;
 begin
  update public.ac360_consulting_sessions
  set assignment_id=successor where assignment_id=old_assignment;
  raise exception 'SECURITY FAILURE: meeting ownership was moved';
 exception when check_violation then null;
 end;
 begin
  update public.ac360_consulting_tasks
  set plan_id=other_plan where plan_id=old_plan;
  raise exception 'SECURITY FAILURE: task was moved to another plan';
 exception when check_violation then null;
 end;
 if (select count(*) from public.ac360_consulting_sessions where assignment_id=old_assignment)<>1
 then raise exception 'Meeting history lost'; end if;
 if (select count(*) from public.ac360_consulting_tasks where plan_id=old_plan)<>1
 then raise exception 'Task history lost'; end if;
end
$history$;

-- Exercise actual admin session writes and RLS, not only postgres bypass mode.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
do $admin_write$
declare added_id uuid; n integer;
begin
 insert into public.ac360_consulting_plans(assignment_id,title)
 select id,'Admin-authenticated test plan'
 from public.ac360_consultant_assignments
 where company_display_name='Synthetic A - successor'
 returning id into added_id;
 if added_id is null then raise exception 'Admin authenticated insert failed'; end if;
 update public.ac360_consulting_plans
 set title='Admin-authenticated updated plan'
 where id=added_id;
 select count(*) into n from public.ac360_consulting_plans
 where id=added_id and title='Admin-authenticated updated plan';
 if n <> 1 then raise exception 'Admin authenticated update did not persist'; end if;
end
$admin_write$;
reset role;

-- Only admins may list eligible e-commerce companies through the RPC.
-- Exercise actual authenticated (non-bypassrls) role for the administrator.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
do $directory$
declare n integer;
begin
 select count(*) into n from public.ac360_admin_ecommerce_company_directory();
 if n <> 2 then raise exception 'Expected 2 synthetic ecommerce companies, got %', n; end if;
end
$directory$;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
do $directory$
begin
 begin
  perform * from public.ac360_admin_ecommerce_company_directory();
  raise exception 'SECURITY FAILURE: consultant accessed admin ecommerce directory';
 exception when insufficient_privilege then null;
 end;
end
$directory$;
reset role;


-- Non-administrators must not register staff or assign client portfolios.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003';
do $staff_denial$
declare before_count integer; after_count integer;
begin
 select count(*) into before_count from public.ac360_consultants;
 begin
   insert into public.ac360_consultants(user_id,display_name)
   values ('00000000-0000-4000-8000-000000000004','Unauthorized consultant');
   raise exception 'SECURITY FAILURE: consultant registered another consultant';
 exception when insufficient_privilege then null;
 end;
 select count(*) into after_count from public.ac360_consultants;
 if after_count<>before_count then raise exception 'SECURITY FAILURE: consultant roster modified'; end if;
 begin
   insert into public.ac360_consultant_assignments(consultant_id,company_id,company_display_name)
   select id,'10000000-0000-4000-8000-000000000002','Unauthorized assignment'
   from public.ac360_consultants
   where user_id='00000000-0000-4000-8000-000000000003';
   raise exception 'SECURITY FAILURE: consultant assigned company';
 exception when insufficient_privilege then null;
 end;
end
$staff_denial$;
reset role;
do $staff_verify$
begin
 if exists (select 1 from public.ac360_consultants where display_name='Unauthorized consultant')
 then raise exception 'SECURITY FAILURE: unauthorized staff record persists'; end if;
 if exists (select 1 from public.ac360_consultant_assignments where company_display_name='Unauthorized assignment')
 then raise exception 'SECURITY FAILURE: unauthorized company assignment persists'; end if;
end
$staff_verify$;

-- An authenticated consultant cannot disable another consultant or close a portfolio.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003';
do $admin_update_denial$
declare n integer;
begin
 update public.ac360_consultants
 set status='inactive'
 where user_id='00000000-0000-4000-8000-000000000002';
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'SECURITY FAILURE: consultant altered staff status'; end if;
 update public.ac360_consultant_assignments
 set active=false, ended_at=now()
 where company_display_name='Synthetic A - successor';
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'SECURITY FAILURE: consultant closed assignment'; end if;
end
$admin_update_denial$;
reset role;
do $admin_update_verify$
begin
 if (select status from public.ac360_consultants where user_id='00000000-0000-4000-8000-000000000002') <> 'active'
 then raise exception 'SECURITY FAILURE: staff status was changed'; end if;
 if (select active from public.ac360_consultant_assignments where company_display_name='Synthetic A - successor') is distinct from true
 then raise exception 'SECURITY FAILURE: consultant assignment was closed'; end if;
end
$admin_update_verify$;


-- An authenticated role without a valid user identity cannot access the admin RPC.
set role authenticated;
reset request.jwt.claim.sub;
do $missing_identity$
begin
 begin
  perform * from public.ac360_admin_ecommerce_company_directory();
  raise exception 'SECURITY FAILURE: missing identity accessed directory';
 exception when insufficient_privilege then null;
 end;
end
$missing_identity$;
reset role;

-- Revocation is enforced on writes, not merely on reading the portfolio.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
do $inactive_write_denial$
declare affected integer;
begin
 update public.ac360_consulting_tasks
 set status='done'
 where title='Synthetic task';
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'SECURITY FAILURE: inactive consultant updated task'; end if;
end
$inactive_write_denial$;
reset role;


-- Positive end-to-end RLS check: active consultant can update an assigned task,
-- while another consultant's task stays inaccessible.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003';
do $own_task_write$
declare n integer;
begin
 update public.ac360_consulting_tasks t
 set status='doing'
 where t.title='Synthetic task' and t.status='pending';
 get diagnostics n=row_count;
 if n<>1 then raise exception 'Active consultant expected to update exactly one own task; updated %', n; end if;
 select count(*) into n from public.ac360_consulting_tasks t where t.title='Synthetic task' and t.status='doing';
 if n<>1 then raise exception 'Updated task not visible to its active consultant'; end if;
end
$own_task_write$;
reset role;
do $own_task_verify$
declare n integer;
begin
 select count(*) into n from public.ac360_consulting_tasks t
 join public.ac360_consulting_plans p on p.id=t.plan_id
 join public.ac360_consultant_assignments a on a.id=p.assignment_id
 where t.title='Synthetic task' and t.status='doing' and a.company_display_name='Synthetic B';
 if n<>1 then raise exception 'Active consultant task update did not persist on own client'; end if;
 select count(*) into n from public.ac360_consulting_tasks t
 join public.ac360_consulting_plans p on p.id=t.plan_id
 join public.ac360_consultant_assignments a on a.id=p.assignment_id
 where t.title='Synthetic task' and t.status='pending' and a.company_display_name='Synthetic A';
 if n<>1 then raise exception 'Consultant changed former other consultant task'; end if;
end
$own_task_verify$;

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

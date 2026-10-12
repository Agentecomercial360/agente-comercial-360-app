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

\echo PASS: ephemeral PostgreSQL RLS contract: tenant reads, INSERT deny, inactive revocation, anonymous access, UPDATE isolation, closed assignment

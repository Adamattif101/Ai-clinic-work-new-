-- 0003_audit_log.sql
-- Append-only audit trail for access to / changes of personal data (GDPR accountability).

create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  clinic_id   uuid not null,
  actor_id    uuid,                 -- auth.uid() of the acting user, if any
  actor_role  text,
  action      text not null,        -- insert | update | delete | export | consent_change
  table_name  text not null,
  record_id   text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_clinic_id_idx on public.audit_log(clinic_id);
create index if not exists audit_log_created_at_idx on public.audit_log(created_at);

-- Generic trigger that records row changes on sensitive tables.
create or replace function public.fn_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clinic uuid;
  v_record text;
begin
  v_clinic := coalesce(
    (case when tg_op = 'DELETE' then old.clinic_id else new.clinic_id end),
    auth.clinic_id()
  );
  v_record := coalesce(
    (case when tg_op = 'DELETE' then old.id else new.id end)::text,
    null
  );

  insert into public.audit_log(clinic_id, actor_id, actor_role, action, table_name, record_id)
  values (v_clinic, auth.uid(), auth.user_role(), lower(tg_op), tg_table_name, v_record);

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

-- Attach the audit trigger to special-category / sensitive tables.
do $$
declare t text;
begin
  foreach t in array array[
    'session_notes','note_insights','wellbeing_checkins','journal_entries',
    'consents','intake_forms','patients'
  ] loop
    execute format(
      'drop trigger if exists trg_audit_%1$s on public.%1$s;
       create trigger trg_audit_%1$s
       after insert or update or delete on public.%1$s
       for each row execute function public.fn_audit();', t);
  end loop;
end $$;

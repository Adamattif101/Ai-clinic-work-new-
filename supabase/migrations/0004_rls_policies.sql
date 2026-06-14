-- 0004_rls_policies.sql
-- Enable RLS on EVERY table and define clinic_id-scoped policies.
-- Also index every clinic_id column. Default posture: deny unless clinic matches.

-- Index every clinic_id (profiles already indexed in 0001).
create index if not exists patients_clinic_id_idx           on public.patients(clinic_id);
create index if not exists rooms_clinic_id_idx              on public.rooms(clinic_id);
create index if not exists appointments_clinic_id_idx       on public.appointments(clinic_id);
create index if not exists intake_forms_clinic_id_idx       on public.intake_forms(clinic_id);
create index if not exists consents_clinic_id_idx           on public.consents(clinic_id);
create index if not exists session_notes_clinic_id_idx      on public.session_notes(clinic_id);
create index if not exists note_insights_clinic_id_idx      on public.note_insights(clinic_id);
create index if not exists billing_events_clinic_id_idx     on public.billing_events(clinic_id);
create index if not exists wellbeing_checkins_clinic_id_idx on public.wellbeing_checkins(clinic_id);
create index if not exists journal_entries_clinic_id_idx    on public.journal_entries(clinic_id);
create index if not exists psychoed_content_clinic_id_idx   on public.psychoed_content(clinic_id);
create index if not exists homework_clinic_id_idx           on public.homework_assignments(clinic_id);

-- Helpful composite indexes for common per-clinic lookups.
create index if not exists session_notes_clinic_patient_idx on public.session_notes(clinic_id, patient_id);
create index if not exists appointments_clinic_starts_idx   on public.appointments(clinic_id, starts_at);

-- Enable RLS everywhere.
do $$
declare t text;
begin
  foreach t in array array[
    'clinics','profiles','patients','rooms','appointments','intake_forms','consents',
    'session_notes','note_insights','billing_accounts','billing_events',
    'wellbeing_checkins','journal_entries','psychoed_content','homework_assignments',
    'audit_log'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);
  end loop;
end $$;

-- Generic clinic-scoped policy for staff-managed tables (owner/clinician/admin).
-- Every business table is matched on clinic_id = auth.clinic_id().
do $$
declare t text;
begin
  foreach t in array array[
    'patients','rooms','appointments','intake_forms','consents',
    'session_notes','note_insights','billing_events',
    'wellbeing_checkins','journal_entries','psychoed_content','homework_assignments'
  ] loop
    execute format('drop policy if exists %1$s_clinic_isolation on public.%1$s;', t);
    execute format($f$
      create policy %1$s_clinic_isolation on public.%1$s
      for all
      using (clinic_id = auth.clinic_id())
      with check (clinic_id = auth.clinic_id());
    $f$, t);
  end loop;
end $$;

-- clinics: members can read their own clinic; only owners may update it.
drop policy if exists clinics_read on public.clinics;
create policy clinics_read on public.clinics
  for select using (id = auth.clinic_id());

drop policy if exists clinics_update on public.clinics;
create policy clinics_update on public.clinics
  for update using (id = auth.clinic_id() and auth.has_role('owner'))
  with check (id = auth.clinic_id() and auth.has_role('owner'));

-- profiles: read profiles in your clinic; a user can read their own row even
-- before the hook populates the claim (e.g. first login).
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select using (clinic_id = auth.clinic_id() or id = auth.uid());

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all
  using (clinic_id = auth.clinic_id() and auth.has_role('owner','admin'))
  with check (clinic_id = auth.clinic_id() and auth.has_role('owner','admin'));

-- billing_accounts: clinic-scoped, owner/admin only.
drop policy if exists billing_accounts_policy on public.billing_accounts;
create policy billing_accounts_policy on public.billing_accounts
  for all
  using (clinic_id = auth.clinic_id() and auth.has_role('owner','admin'))
  with check (clinic_id = auth.clinic_id() and auth.has_role('owner','admin'));

-- audit_log: read-only to owners/admins of the clinic; inserts happen via the
-- SECURITY DEFINER trigger, so no INSERT policy is granted to end users.
drop policy if exists audit_log_read on public.audit_log;
create policy audit_log_read on public.audit_log
  for select using (clinic_id = auth.clinic_id() and auth.has_role('owner','admin'));

-- NOTE: the service-role key bypasses RLS and is used ONLY by server-side jobs.
-- All browser/client calls use the anon key + the user's JWT, which is subject
-- to the policies above.

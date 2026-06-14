-- 0006_seed.sql
-- DEV/DEMO SEED ONLY. Do NOT run in production.
-- One demo clinic (Edgbaston), two clinicians, three patients.

-- Fixed UUIDs for repeatable local demos.
-- clinic:    11111111-1111-1111-1111-111111111111
-- owner:     a0000000-0000-0000-0000-000000000001  (also a clinician)
-- clinician: a0000000-0000-0000-0000-000000000002
-- patients:  p1/p2/p3 below

insert into public.clinics (id, name, slug, brand_color, dpa_version, data_region)
values ('11111111-1111-1111-1111-111111111111',
        'Edgbaston Wellbeing Practice', 'edgbaston-wellbeing', '#2f6f6a', '1.0', 'uk')
on conflict (id) do nothing;

-- Local-only auth users so profiles FK resolves. Passwords are placeholders;
-- in a real environment, create users via Supabase Auth, not raw inserts.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at)
values
  ('a0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','owner@edgbaston.example',
   crypt('demo-password', gen_salt('bf')), now(), now(), now()),
  ('a0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','clinician@edgbaston.example',
   crypt('demo-password', gen_salt('bf')), now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, clinic_id, role, full_name, email)
values
  ('a0000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
   'owner','Dr Priya Sharma','owner@edgbaston.example'),
  ('a0000000-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111',
   'clinician','Tom Okafor','clinician@edgbaston.example')
on conflict (id) do nothing;

insert into public.rooms (id, clinic_id, name) values
  ('22222222-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Consulting Room A'),
  ('22222222-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Consulting Room B')
on conflict (id) do nothing;

insert into public.patients (id, clinic_id, full_name, email, primary_clinician_id, status)
values
  ('33333333-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
   'Alex Morgan','alex@example.com','a0000000-0000-0000-0000-000000000001','active'),
  ('33333333-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111',
   'Jordan Lee','jordan@example.com','a0000000-0000-0000-0000-000000000002','active'),
  ('33333333-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111',
   'Sam Patel','sam@example.com','a0000000-0000-0000-0000-000000000002','active')
on conflict (id) do nothing;

-- Explicit consent records (special-category processing granted; companion-share varies).
insert into public.consents (clinic_id, patient_id, consent_type, granted, granted_at) values
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000001','special_category_processing',true,now()),
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000001','share_companion_results_with_clinician',true,now()),
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000002','special_category_processing',true,now()),
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000003','special_category_processing',true,now())
on conflict do nothing;

-- A couple of appointments incl. utilisation/no-show examples.
insert into public.appointments (clinic_id, patient_id, clinician_id, room_id, starts_at, ends_at, status) values
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001', now() + interval '1 day', now() + interval '1 day 50 minutes','scheduled'),
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000002', now() - interval '7 days', now() - interval '7 days' + interval '50 minutes','completed'),
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000002', now() - interval '2 days', now() - interval '2 days' + interval '50 minutes','no_show')
on conflict do nothing;

-- Sample clinician-authored session notes (the input to the notes-to-insight layer).
insert into public.session_notes (clinic_id, patient_id, clinician_id, body, session_date) values
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001',
   'Client reported a steadier week. Used the breathing exercise before two work meetings and found it helped. Sleep still irregular. We revisited goals around boundary-setting with family. Homework: continue daily check-ins, read chapter on values.',
   current_date - 7),
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001',
   'Client engaged well. Boundary conversation with sibling went better than expected. Still finds mornings hard. Wants to focus next on work stress. Agreed to try a wind-down routine.',
   current_date - 1)
on conflict do nothing;

-- Psychoeducation chapters (fixed content).
insert into public.psychoed_content (clinic_id, title, slug, body, ordinal) values
  ('11111111-1111-1111-1111-111111111111','Understanding Values','understanding-values','Fixed psychoeducation content about identifying personal values...',1),
  ('11111111-1111-1111-1111-111111111111','A Simple Wind-Down Routine','wind-down-routine','Fixed psychoeducation content about evening routines...',2)
on conflict do nothing;

-- A few wellbeing check-ins (engagement signal, not a clinical scale).
insert into public.wellbeing_checkins (clinic_id, patient_id, mood, checkin_date) values
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000001',3, current_date - 3),
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000001',4, current_date - 1),
  ('11111111-1111-1111-1111-111111111111','33333333-0000-0000-0000-000000000002',2, current_date - 2)
on conflict do nothing;

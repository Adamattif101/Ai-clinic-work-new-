-- 0002_clinical_admin.sql
-- Clinician-side clinical/admin tables and patient-companion tables.
-- NOTE: framing is wellbeing + administration. No diagnosis/triage/severity fields.

-- ---------------------------------------------------------------------------
-- Patients (clients of a clinic). Health data lives in notes/check-ins.
-- ---------------------------------------------------------------------------
create table if not exists public.patients (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references public.clinics(id) on delete cascade,
  -- Optional link to an auth user for the patient-facing companion.
  user_id         uuid references auth.users(id) on delete set null,
  full_name       text not null,
  email           text,
  phone           text,
  date_of_birth   date,
  primary_clinician_id uuid references public.profiles(id) on delete set null,
  status          text not null default 'active', -- active | discharged | paused
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Rooms + appointments (scheduling, utilisation, no-shows).
-- ---------------------------------------------------------------------------
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.appointments (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  patient_id    uuid not null references public.patients(id) on delete cascade,
  clinician_id  uuid not null references public.profiles(id) on delete cascade,
  room_id       uuid references public.rooms(id) on delete set null,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  -- engagement/admin status only.
  status        text not null default 'scheduled', -- scheduled|completed|cancelled|no_show
  reminder_sent_at timestamptz,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Intake forms + consent capture (explicit consent for special-category data).
-- ---------------------------------------------------------------------------
create table if not exists public.intake_forms (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  patient_id  uuid not null references public.patients(id) on delete cascade,
  -- LHC-Forms / questionnaire JSON definition + responses.
  schema      jsonb not null default '{}'::jsonb,
  responses   jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.consents (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  patient_id    uuid not null references public.patients(id) on delete cascade,
  -- e.g. 'special_category_processing', 'share_companion_results_with_clinician'
  consent_type  text not null,
  granted       boolean not null default false,
  granted_at    timestamptz,
  withdrawn_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Session notes (clinician-authored) + AI-generated insights derived from them.
-- ---------------------------------------------------------------------------
create table if not exists public.session_notes (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  patient_id    uuid not null references public.patients(id) on delete cascade,
  clinician_id  uuid not null references public.profiles(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  body          text not null,            -- the clinician's typed/pasted notes
  session_date  date not null default current_date,
  created_at    timestamptz not null default now()
);

-- AI outputs are drafts the clinician reviews. Kinds:
--   'treatment_summary' (per-client structured summary),
--   'whats_changed' (recap vs previous session),
--   'prep_brief' (pre-session prep).
create table if not exists public.note_insights (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  patient_id    uuid not null references public.patients(id) on delete cascade,
  source_note_id uuid references public.session_notes(id) on delete set null,
  kind          text not null,
  content       jsonb not null,
  model         text,
  generated_at  timestamptz not null default now(),
  reviewed_by   uuid references public.profiles(id) on delete set null,
  reviewed_at   timestamptz
);

-- ---------------------------------------------------------------------------
-- Billing references (Stripe ids only; no card data stored).
-- ---------------------------------------------------------------------------
create table if not exists public.billing_accounts (
  clinic_id              uuid primary key references public.clinics(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  seats                  integer not null default 1,
  updated_at             timestamptz not null default now()
);

create table if not exists public.billing_events (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  kind          text not null,           -- session_metered | invoice | reminder
  appointment_id uuid references public.appointments(id) on delete set null,
  amount_pence  integer,
  stripe_ref    text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Patient companion: journaling, self-reported wellbeing check-ins, homework.
-- Wellbeing check-ins are engagement signals, NOT clinical symptom tracking.
-- ---------------------------------------------------------------------------
create table if not exists public.wellbeing_checkins (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  patient_id  uuid not null references public.patients(id) on delete cascade,
  -- simple 1-5 self-reported mood; explicitly not a clinical scale.
  mood        smallint check (mood between 1 and 5),
  note        text,
  checkin_date date not null default current_date,
  created_at  timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  patient_id  uuid not null references public.patients(id) on delete cascade,
  body        text not null,
  -- Set by the deterministic crisis layer when signposting was surfaced.
  crisis_flagged boolean not null default false,
  shared_with_clinician boolean not null default false, -- requires explicit consent
  created_at  timestamptz not null default now()
);

-- Fixed psychoeducation content (book-like chapters) authored per clinic.
create table if not exists public.psychoed_content (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  title       text not null,
  slug        text not null,
  body        text not null,
  ordinal     integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.homework_assignments (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  patient_id  uuid not null references public.patients(id) on delete cascade,
  clinician_id uuid references public.profiles(id) on delete set null,
  content_id  uuid references public.psychoed_content(id) on delete set null,
  status      text not null default 'assigned', -- assigned | in_progress | completed
  assigned_at timestamptz not null default now(),
  completed_at timestamptz
);

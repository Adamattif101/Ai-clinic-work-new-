-- 0001_core_schema.sql
-- Core multi-tenant schema: clinics, profiles (user<->clinic<->role), RLS helpers.

create extension if not exists "pgcrypto";

-- Roles within a clinic. Patients are also profiles, scoped to a clinic.
do $$ begin
  create type public.user_role as enum ('owner', 'clinician', 'admin', 'patient');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- clinics: the tenant root. Everything else carries clinic_id.
-- ---------------------------------------------------------------------------
create table if not exists public.clinics (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  brand_color     text default '#2f6f6a',
  -- Compliance / data-controller settings managed in the Settings page.
  dpa_version     text,
  dpa_accepted_at timestamptz,
  dpa_accepted_by uuid,
  data_region     text not null default 'uk',
  retention_days  integer not null default 2555, -- ~7 years default; configurable
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- profiles: links an auth.users id to exactly one clinic + role.
-- This is the source of truth the auth hook reads to build JWT claims.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  role        public.user_role not null default 'clinician',
  full_name   text,
  email       text,
  created_at  timestamptz not null default now()
);

create index if not exists profiles_clinic_id_idx on public.profiles(clinic_id);

-- ---------------------------------------------------------------------------
-- RLS helper functions. These read custom claims set by the auth hook (0005).
-- Defined in the `auth` schema so policies can call public.clinic_id().
-- ---------------------------------------------------------------------------
create or replace function public.clinic_id()
returns uuid
language sql stable
as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claims', true)::jsonb ->> 'clinic_id',
      ''
    ),
    ''
  )::uuid;
$$;

create or replace function public.jwt_role()
returns text
language sql stable
as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::jsonb ->> 'user_role',
    'patient'
  );
$$;

create or replace function public.has_role(variadic roles text[])
returns boolean
language sql stable
as $$
  select public.jwt_role() = any(roles);
$$;

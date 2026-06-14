# Wellspring

A multi-tenant SaaS (installable **PWA**) for private UK therapy/counselling
clinics — initial market Edgbaston/Birmingham.

> **Wellspring is a wellbeing + practice-administration support tool, NOT a
> medical device.** It never diagnoses, triages, screens, risk-scores, or
> monitors clinical conditions. See
> [`docs/compliance/not-a-medical-device.md`](docs/compliance/not-a-medical-device.md).

## Two role-gated experiences, one codebase

**Clinician / owner side**
- **Notes-to-insight layer** — ingest typed/pasted session notes and generate a
  structured per-client summary, a "what changed since last session" recap, and a
  pre-session prep brief. (Drafting aid the clinician reviews and owns.)
- **Automated admin** — scheduling, intake + consent capture, reminders, billing
  reminders (Stripe), GDPR record-keeping with audit logs.
- **Owner dashboard** — caseload, utilisation, no-show rate, and self-reported
  wellbeing trends (framed as *engagement*, not clinical severity).

**Patient side (clinic-branded, stubbed)**
- Wellbeing companion: journaling, daily mood/wellbeing check-ins (not clinical
  symptom tracking), therapist-assigned fixed psychoeducation "chapters".
- A **deterministic, non-LLM crisis-detection layer** sits in front of any
  free-text input and surfaces UK helplines (Samaritans 116 123, 999). It never
  attempts clinical advice. See `src/lib/crisisDetection.ts`.

## Tech stack
React + TypeScript PWA · Supabase (Postgres, Auth, Storage, Edge Functions) ·
Stripe (per-clinic subscriptions, per-seat + per-session metering) · Claude/Gemini
called **only** from server-side Edge Functions under zero-retention terms.

## Multi-tenant isolation (critical)
- Every table has a `clinic_id`; **RLS enabled on all tables** (default deny).
- Policies match `clinic_id` to a JWT custom claim set by a Supabase **Custom
  Access Token auth hook** at login (`supabase/migrations/0005_auth_hook.sql`).
- Every `clinic_id` is indexed.
- Client calls use the **anon key + user JWT**; the **service-role key** is
  restricted to server-only admin jobs (Edge Functions).

## Getting started
```bash
cp .env.example .env          # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm install
supabase start                # local stack
npm run db:reset              # apply migrations 0001–0006 (incl. demo seed)
npm run functions:serve       # Edge Functions
npm run dev                   # PWA dev server
npm test                      # crisis + compliance unit tests
```

## Repository layout
```
docs/compliance/      DPA template, APD, DPIA skeleton, not-a-medical-device memo
docs/migration-plan.md
supabase/migrations/  0001 core · 0002 clinical/admin · 0003 audit · 0004 RLS · 0005 auth hook · 0006 seed
supabase/functions/   notes-to-insight, crisis (shared lib), stripe-webhook, data-export
src/                  React PWA (clinician pages first, patient companion stubbed)
tests/                deterministic crisis + forbidden-terms guardrail tests
```

## Compliance posture
Clinic = **data controller**, Wellspring = **data processor**. Encryption in
transit/at rest, UK/EU residency, explicit consent for special-category health
data with withdrawal, configurable retention/deletion, full audit trail, and a
Settings page where each clinic manages DPA acceptance and data export.

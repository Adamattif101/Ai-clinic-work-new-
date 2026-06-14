# Wellspring — Migration & Rollout Plan

## Migration ordering

Migrations live in `supabase/migrations/` and run in filename (timestamp) order:

1. **`0001_core_schema.sql`** — extensions, enums, `clinics`, `profiles`
   (user↔clinic↔role), and the `helper` functions used by RLS
   (`auth.clinic_id()`, `auth.has_role()`).
2. **`0002_clinical_admin.sql`** — patients, appointments, rooms, intake forms,
   consents, session notes, AI insights, billing references, wellbeing check-ins,
   journal entries, homework assignments, psychoeducation content.
3. **`0003_audit_log.sql`** — append-only audit table + generic trigger.
4. **`0004_rls_policies.sql`** — enable RLS on **every** table and define
   `clinic_id`-scoped policies; create the `clinic_id` index on every table.
5. **`0005_auth_hook.sql`** — the Custom Access Token hook that injects
   `clinic_id` and `role` as JWT claims at login.
6. **`0006_seed.sql`** — one demo clinic, two clinicians, three patients (dev only).

## How the multi-tenant isolation works (critical)

- Every business table has a **non-null `clinic_id`** and an index on it.
- **RLS is enabled on all tables.** Default deny; policies grant access only when
  `clinic_id = auth.clinic_id()`.
- `auth.clinic_id()` reads the **`clinic_id` custom claim** from the user's JWT.
- The claim is set by a **Custom Access Token auth hook** (`0005`) at login, sourced
  from `profiles`. Clients never set it themselves.
- All client calls use the **anon key + the user's JWT**. The **service-role key** is
  used **only** by server-side admin jobs / Edge Functions and bypasses RLS — so it is
  never shipped to the browser.

## Local development

```bash
supabase start                 # local Postgres + auth + storage
npm run db:reset               # apply all migrations + seed
npm run functions:serve        # serve Edge Functions locally
npm run dev                    # Vite PWA dev server
```

## Configuring the auth hook

After `0005`, enable the hook in Supabase:

- Dashboard → Authentication → Hooks → **Custom Access Token** →
  select `public.custom_access_token_hook`, **or**
- `config.toml`: `[auth.hook.custom_access_token] enabled = true` and
  `uri = "pg-functions://postgres/public/custom_access_token_hook"`.

## Production rollout

1. Provision a Supabase project in a **UK/EU region**.
2. `supabase db push` (migrations `0001`–`0005`; **never** run `0006_seed` in prod).
3. `supabase secrets set` for `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, etc. The service-role key stays in the platform vault.
4. Deploy Edge Functions: `supabase functions deploy`.
5. Enable the auth hook (above).
6. Configure Stripe products/prices (per-seat + per-session metering) and the webhook.
7. Smoke-test cross-tenant isolation with the RLS test (`tests/rls.test.ts`).

## Rollback

Each migration is forward-only; to roll back a release, restore from the pre-deploy
backup or apply a new corrective migration. Never edit an already-applied migration —
add a new one.

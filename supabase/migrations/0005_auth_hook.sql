-- 0005_auth_hook.sql
-- Custom Access Token hook: injects clinic_id + user_role into the JWT at login,
-- sourced from public.profiles. Clients can NEVER set these claims themselves.
--
-- Enable in Supabase: Auth → Hooks → Custom Access Token → public.custom_access_token_hook
-- or via config.toml [auth.hook.custom_access_token].

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_claims  jsonb;
  v_profile public.profiles%rowtype;
begin
  select * into v_profile
  from public.profiles
  where id = (event ->> 'user_id')::uuid;

  v_claims := coalesce(event -> 'claims', '{}'::jsonb);

  if v_profile.id is not null then
    v_claims := jsonb_set(v_claims, '{clinic_id}', to_jsonb(v_profile.clinic_id::text));
    v_claims := jsonb_set(v_claims, '{user_role}', to_jsonb(v_profile.role::text));
  end if;

  return jsonb_set(event, '{claims}', v_claims);
end;
$$;

-- Grant the auth admin role permission to run the hook and read profiles.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
grant select on public.profiles to supabase_auth_admin;

-- Allow the auth admin to read profiles despite RLS (needed to build claims).
drop policy if exists profiles_auth_admin_read on public.profiles;
create policy profiles_auth_admin_read on public.profiles
  for select to supabase_auth_admin using (true);

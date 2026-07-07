-- Mobile RLS policies + RPCs
--
-- Native mobile clients (Expo/React Native) talk to Supabase directly with the
-- anon key + RLS -- there is no Next.js server (and therefore no service-role
-- client) in that path. This migration adds the RLS policies and
-- `security definer` RPC functions needed so a mobile client can perform every
-- mutation the web app currently performs via lib/supabase-admin.ts, without
-- weakening any existing protection for the web app.
--
-- Catalogued admin-client operations (source: app/onboarding/actions.ts,
-- app/settings/actions.ts, app/tasks/new/actions.ts, and the *.tsx pages that
-- read via the admin client):
--   1. createHouseholdWithTasks: insert household, optionally seed categories
--      + tasks from a fixed suggestion list, upsert caller profile with
--      household_id.                          -> RPC create_household_and_join
--   2. joinHousehold: look up household by invite_code (case-insensitive),
--      upsert caller profile with household_id.  -> RPC join_household_by_invite
--   3. updateProfile: update own profile row.      -> already covered by
--      existing "Users can update their own profile" policy.
--   4. updateHousehold: update household name/quota_period/quota_goal (NOT
--      scoring_mode -- immutable per CLAUDE.md; NOT invite_code -- settings
--      does not regenerate it).                -> new households UPDATE policy
--   5. uploadAvatar: storage upload + profiles.avatar_url update. -> already
--      covered by existing storage policies + own-profile UPDATE policy.
--   6. createTask/updateTask/deleteTask: insert already has a policy; update
--      and delete did not.                      -> new tasks UPDATE/DELETE policies
--   7. createCategory/updateCategory/deleteCategory: insert policy existed but
--      was `with check (true)` (any authenticated user, any household_id --
--      a pre-existing bug); delete policy existed; update policy did not.
--                                                -> tightened INSERT policy,
--                                                   new UPDATE policy
--   8. Read-only admin usage in settings/page.tsx, tasks/new/page.tsx,
--      app/page.tsx: all of these reads are already permitted for the
--      requesting user under the existing SELECT policies (profiles,
--      households, tasks, categories, task_logs, kudos) -- no new policy
--      needed, mobile can just query directly as the authenticated user.
--
-- NOT implemented (no such feature exists in the web app today, so nothing to
-- mirror): deleting kudos, deleting an account, leaving a household, invite
-- code regeneration. If/when the web app grows these features, add matching
-- RPCs/policies then.

-- ---------------------------------------------------------------------------
-- RPC: create_household_and_join
-- ---------------------------------------------------------------------------
-- Mirrors app/onboarding/actions.ts#createHouseholdWithTasks:
--   - creates the household (invite_code uses the same default generation as
--     the table default: substring(gen_random_uuid()::text, 1, 8))
--   - quota_period/quota_goal use the same table defaults ('monthly' / 100)
--   - optionally seeds categories + tasks (caller supplies the suggestion rows
--     it selected, since TASK_SUGGESTIONS lives in the mobile/web client code,
--     not the database)
--   - sets the calling user's profiles.household_id (upsert, matching the web
--     behavior of upserting the full profile row)
--   - returns the new household id
create or replace function create_household_and_join(
  p_name text,
  p_scoring_mode text,
  p_display_name text,
  p_color text,
  p_bg_color text,
  p_categories jsonb default '[]'::jsonb,
  p_tasks jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_uid uuid := auth.uid();
  v_cat jsonb;
  v_task jsonb;
begin
  if v_uid is null then
    raise exception 'Nicht angemeldet.';
  end if;

  if p_scoring_mode not in ('punkte', 'zeit') then
    raise exception 'Ungueltiger Bewertungsmodus.';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Haushaltsname darf nicht leer sein.';
  end if;

  insert into households (name, scoring_mode)
  values (p_name, p_scoring_mode)
  returning id into v_household_id;

  if jsonb_array_length(p_categories) > 0 then
    for v_cat in select * from jsonb_array_elements(p_categories)
    loop
      insert into categories (household_id, name, hue, soft, deep)
      values (
        v_household_id,
        v_cat->>'name',
        v_cat->>'hue',
        v_cat->>'soft',
        v_cat->>'deep'
      )
      on conflict (household_id, name) do nothing;
    end loop;
  end if;

  if jsonb_array_length(p_tasks) > 0 then
    for v_task in select * from jsonb_array_elements(p_tasks)
    loop
      insert into tasks (household_id, name, category, icon, pts, time_minutes, cycle_days)
      values (
        v_household_id,
        v_task->>'name',
        v_task->>'category',
        v_task->>'icon',
        coalesce((v_task->>'pts')::int, 5),
        coalesce((v_task->>'time_minutes')::int, 15),
        coalesce((v_task->>'cycle_days')::int, 7)
      );
    end loop;
  end if;

  insert into profiles (id, household_id, display_name, initial, color, bg_color)
  values (
    v_uid,
    v_household_id,
    p_display_name,
    upper(left(p_display_name, 1)),
    p_color,
    p_bg_color
  )
  on conflict (id) do update set
    household_id = excluded.household_id,
    display_name = excluded.display_name,
    initial = excluded.initial,
    color = excluded.color,
    bg_color = excluded.bg_color;

  return v_household_id;
end;
$$;

grant execute on function create_household_and_join(text, text, text, text, text, jsonb, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: join_household_by_invite
-- ---------------------------------------------------------------------------
-- Mirrors app/onboarding/actions.ts#joinHousehold:
--   - looks up household by invite_code, case-insensitive and trimmed (web
--     does `.trim().toLowerCase()` before querying)
--   - sets caller's profiles.household_id (upsert, matching web)
--   - returns household id; raises a clear exception if the code is invalid
-- Note: display name / color are required parameters (not just the invite
-- code) because web's joinHousehold upserts the full profile row in the same
-- action -- there is no separate "create empty profile" step to mirror.
create or replace function join_household_by_invite(
  p_invite_code text,
  p_display_name text,
  p_color text,
  p_bg_color text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Nicht angemeldet.';
  end if;

  select id into v_household_id
  from households
  where lower(invite_code) = lower(trim(p_invite_code));

  if v_household_id is null then
    raise exception 'Einladungscode nicht gefunden.';
  end if;

  insert into profiles (id, household_id, display_name, initial, color, bg_color)
  values (
    v_uid,
    v_household_id,
    p_display_name,
    upper(left(p_display_name, 1)),
    p_color,
    p_bg_color
  )
  on conflict (id) do update set
    household_id = excluded.household_id,
    display_name = excluded.display_name,
    initial = excluded.initial,
    color = excluded.color,
    bg_color = excluded.bg_color;

  return v_household_id;
end;
$$;

grant execute on function join_household_by_invite(text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- tasks: UPDATE / DELETE for household members
-- ---------------------------------------------------------------------------
-- Mirrors app/tasks/new/actions.ts#updateTask/#deleteTask, which only scope by
-- household_id (any member can edit/delete any task in their household -- no
-- additional restriction, e.g. no "creator only" check exists in the web
-- code).
create policy "Household members can update tasks"
  on tasks for update
  using (household_id = get_my_household_id())
  with check (household_id = get_my_household_id());

create policy "Household members can delete tasks"
  on tasks for delete
  using (household_id = get_my_household_id());

-- ---------------------------------------------------------------------------
-- categories: tighten INSERT, add UPDATE
-- ---------------------------------------------------------------------------
-- The existing insert policy was `with check (true)`, allowing any
-- authenticated user to insert a category row under any household_id. Mirror
-- app/tasks/new/actions.ts#createCategory (which always scopes the insert to
-- the caller's own household_id) by tightening this to an actual household
-- check. This is a strict tightening, not a weakening, of existing behavior.
drop policy if exists "Household members can insert categories" on categories;

create policy "Household members can insert categories"
  on categories for insert
  to authenticated
  with check (household_id = get_my_household_id());

create policy "Household members can update categories"
  on categories for update
  using (household_id = get_my_household_id())
  with check (household_id = get_my_household_id());

-- ---------------------------------------------------------------------------
-- households: UPDATE for members (settings screen)
-- ---------------------------------------------------------------------------
-- Mirrors app/settings/actions.ts#updateHousehold, which allows changing
-- name/quota_period/quota_goal. scoring_mode is intentionally NOT allowed to
-- change here (it is immutable per CLAUDE.md, even though the current web
-- form happens to resubmit the existing value) and invite_code is not
-- touched by settings today, so it must not change either.
create policy "Household members can update their household"
  on households for update
  using (id = get_my_household_id())
  with check (
    id = get_my_household_id()
    and scoring_mode = (select h.scoring_mode from households h where h.id = get_my_household_id())
    and invite_code = (select h.invite_code from households h where h.id = get_my_household_id())
  );

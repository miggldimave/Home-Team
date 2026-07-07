-- Allow household members to change scoring_mode (rule change, decided by
-- the team). The web settings UI already writes scoring_mode via the
-- service-role client (app/settings/actions.ts#updateHousehold); this
-- migration lifts the equivalent RLS restriction for mobile clients so both
-- platforms can change it going forward. Historical logs are interpreted in
-- whatever mode is currently active -- no backfill/rewrite of past entries.
--
-- invite_code remains frozen: settings never regenerates it, on web or
-- mobile, so there is no reason to allow it to change here.
drop policy if exists "Household members can update their household" on households;

create policy "Household members can update their household"
  on households for update
  using (id = get_my_household_id())
  with check (
    id = get_my_household_id()
    and invite_code = (select h.invite_code from households h where h.id = get_my_household_id())
  );

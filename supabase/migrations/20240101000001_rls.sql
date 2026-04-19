-- Row Level Security policies

alter table households enable row level security;
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table task_logs enable row level security;
alter table kudos enable row level security;

-- Helper: get the current user's household_id
create or replace function get_my_household_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select household_id from profiles where id = auth.uid()
$$;

-- households: members can read their own household
create policy "Members can view their household"
  on households for select
  using (id = get_my_household_id());

create policy "Authenticated users can create households"
  on households for insert
  to authenticated
  with check (true);

-- profiles: household members can see each other
create policy "Household members can view profiles"
  on profiles for select
  using (household_id = get_my_household_id() or id = auth.uid());

create policy "Users can insert their own profile"
  on profiles for insert
  with check (id = auth.uid());

create policy "Users can update their own profile"
  on profiles for update
  using (id = auth.uid());

-- tasks: readable by household members
create policy "Household members can view tasks"
  on tasks for select
  using (household_id = get_my_household_id());

create policy "Household members can insert tasks"
  on tasks for insert
  with check (household_id = get_my_household_id());

-- task_logs: readable by household members
create policy "Household members can view task logs"
  on task_logs for select
  using (household_id = get_my_household_id());

create policy "Household members can insert task logs"
  on task_logs for insert
  with check (household_id = get_my_household_id() and profile_id = auth.uid());

-- kudos: readable and insertable by household members
create policy "Household members can view kudos"
  on kudos for select
  using (household_id = get_my_household_id());

create policy "Household members can insert kudos"
  on kudos for insert
  with check (household_id = get_my_household_id() and from_profile_id = auth.uid());

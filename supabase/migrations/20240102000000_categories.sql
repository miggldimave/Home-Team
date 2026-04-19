create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  hue text not null,
  soft text not null,
  deep text not null,
  created_at timestamptz default now(),
  unique(household_id, name)
);

alter table categories enable row level security;

create policy "Household members can view categories"
  on categories for select
  using (household_id = get_my_household_id());

create policy "Household members can insert categories"
  on categories for insert
  to authenticated
  with check (true);

create policy "Household members can delete categories"
  on categories for delete
  using (household_id = get_my_household_id());

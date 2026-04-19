-- HomeTeam initial schema

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scoring_mode text not null check (scoring_mode in ('punkte', 'zeit')),
  invite_code text unique not null default substring(gen_random_uuid()::text, 1, 8),
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid references households(id),
  display_name text not null,
  initial char(1) not null,
  color text not null,
  bg_color text not null,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  category text not null,
  icon text not null,
  pts int not null default 5,
  time_minutes int not null default 15,
  cycle_days int not null default 7,
  created_at timestamptz default now()
);

create table if not exists task_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  completed_at timestamptz not null default now()
);

create table if not exists kudos (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references profiles(id),
  to_profile_id uuid not null references profiles(id),
  task_id uuid references tasks(id),
  household_id uuid not null references households(id),
  created_at timestamptz default now()
);

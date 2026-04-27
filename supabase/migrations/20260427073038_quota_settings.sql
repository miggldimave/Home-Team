alter table households
  add column if not exists quota_period text not null default 'monthly'
    check (quota_period in ('weekly', 'biweekly', 'monthly')),
  add column if not exists quota_goal integer not null default 80
    check (quota_goal >= 50 and quota_goal <= 100);

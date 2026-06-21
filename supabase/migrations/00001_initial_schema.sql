-- Profile / settings, 1:1 with auth.users
create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  display_name  text,
  home_timezone text not null default 'America/New_York',
  settings      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

-- Duration-bearing events (a headache; later: migraine, flare, etc.)
create table episodes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  kind        text not null default 'headache',
  started_at  timestamptz not null,
  ended_at    timestamptz,
  started_tz  text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Everything point-in-time: pain readings, meds, water, coffee, notes
create table events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  episode_id  uuid references episodes on delete set null,
  kind        text not null,
  value_text  text,
  value_num   numeric,
  metadata    jsonb not null default '{}',
  occurred_at timestamptz not null,
  occurred_tz text not null,
  created_at  timestamptz not null default now()
);

-- Menstrual cycle, for computing cycle-day on any timestamp
create table cycles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  started_at timestamptz not null,
  ended_at   timestamptz,
  created_at timestamptz not null default now()
);

-- Passive context snapshot, attached to an episode start
create table context_snapshots (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users on delete cascade,
  episode_id           uuid references episodes on delete cascade,
  captured_at          timestamptz not null,
  lat                  numeric(6,2),
  lon                  numeric(6,2),
  surface_pressure_hpa numeric,
  pressure_delta_3h    numeric,
  pressure_delta_24h   numeric,
  temperature_c        numeric,
  humidity_pct         numeric,
  weather_code         int,
  source               text not null default 'open-meteo',
  raw                  jsonb,
  created_at           timestamptz not null default now()
);

-- Indexes
create index on events (user_id, occurred_at desc);
create index on episodes (user_id, started_at desc);
create index on cycles (user_id, started_at desc);

-- RLS
alter table profiles enable row level security;
create policy own_rows on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

alter table episodes enable row level security;
create policy own_rows on episodes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table events enable row level security;
create policy own_rows on events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table cycles enable row level security;
create policy own_rows on cycles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table context_snapshots enable row level security;
create policy own_rows on context_snapshots
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Cycle-day helper function
create or replace function cycle_day_at(p_user uuid, p_ts timestamptz)
returns int language sql stable as $$
  select (date_part('day', p_ts - c.started_at))::int + 1
  from cycles c
  where c.user_id = p_user
    and c.started_at <= p_ts
    and (c.ended_at is null or p_ts <= c.ended_at + interval '40 days')
  order by c.started_at desc
  limit 1;
$$;

-- Auto-create profile on anonymous sign-in
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, home_timezone)
  values (new.id, coalesce(
    new.raw_user_meta_data->>'timezone',
    'America/New_York'
  ));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- HILL — Supabase schema (Phase 3+)
-- Run this in the Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY guards.

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  total_wins   int  not null default 0,
  total_games  int  not null default 0,
  elo          int  not null default 1000,       -- real Elo rating (K=32)
  skin_id      text not null default 'bronze',  -- bronze|silver|gold|master|champion
  is_anonymous boolean not null default true,   -- false once linked (Google)
  created_at   timestamptz not null default now()
);

-- Backfill for existing databases (idempotent — columns may already exist).
alter table profiles
  add column if not exists is_anonymous boolean not null default true;
alter table profiles
  add column if not exists elo int not null default 1000;

create table if not exists games (
  id          uuid primary key default gen_random_uuid(),
  mode        text not null,                     -- classic-2p|hill-blitz|hill-survival
  player_count int not null,
  winners     uuid[] not null,
  finished_at timestamptz not null default now()
);

create table if not exists game_players (
  game_id          uuid references games(id) on delete cascade,
  user_id          uuid references profiles(id) on delete set null,
  slot             int  not null,                -- 1..4
  was_winner       boolean not null,
  eliminated_round int,                          -- null if survived
  primary key (game_id, slot)
);

create table if not exists rooms (
  id           text primary key,                 -- 4-letter uppercase code
  host_user_id uuid references profiles(id) not null,
  mode         text not null,
  status       text not null,                    -- lobby|playing|finished
  state        jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Public leaderboard view (Phase 5 reads this)
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view leaderboard as
  select id, display_name, total_wins, total_games, skin_id, elo,
         (total_wins::float / nullif(total_games, 0)) as win_rate
  from profiles
  where total_games > 0
    and is_anonymous = false   -- authorized (Google-linked) users only
  order by elo desc,
           total_wins desc,
           (total_wins::float / nullif(total_games, 0)) desc,
           total_games desc
  limit 100;

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-create a profile row whenever an auth user is created
-- (covers anonymous sign-in and Google sign-up). The client also performs an
-- idempotent ensureProfile() upsert as a belt-and-braces fallback.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      'Player_' || substr(md5(random()::text), 1, 4)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table profiles     enable row level security;
alter table games        enable row level security;
alter table game_players enable row level security;
alter table rooms        enable row level security;

-- profiles: anyone may read (leaderboard/lobby); a user may insert/update own row
drop policy if exists profiles_select_all  on profiles;
drop policy if exists profiles_insert_self on profiles;
drop policy if exists profiles_update_self on profiles;

create policy profiles_select_all  on profiles for select using (true);
create policy profiles_insert_self on profiles for insert with check (auth.uid() = id);
create policy profiles_update_self on profiles for update using (auth.uid() = id);

-- games / game_players: readable by all; writes go through the service-role
-- API route only (Phase 4), so no client INSERT/UPDATE policy.
drop policy if exists games_select_all        on games;
drop policy if exists game_players_select_all on game_players;
create policy games_select_all        on games        for select using (true);
create policy game_players_select_all on game_players for select using (true);

-- rooms: readable by all (lookup by code); host may insert/update its rooms
drop policy if exists rooms_select_all   on rooms;
drop policy if exists rooms_insert_host  on rooms;
drop policy if exists rooms_update_host  on rooms;
create policy rooms_select_all  on rooms for select using (true);
create policy rooms_insert_host on rooms for insert with check (auth.uid() = host_user_id);
create policy rooms_update_host on rooms for update using (auth.uid() = host_user_id);

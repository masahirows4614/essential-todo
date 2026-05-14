-- ============================================================
-- Essential Flow — Supabase スキーマ
-- Supabase ダッシュボードの「SQL Editor」で実行してください
-- ============================================================

-- ── profiles（ユーザー表示名 & アバターカラー） ──────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null default '',
  avatar_color text not null default '#4361EE',
  created_at   bigint not null default extract(epoch from now()) * 1000
);

-- ── tasks ─────────────────────────────────────────────────────
create table if not exists tasks (
  id             text primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  title          text not null,
  notes          text,
  type           text not null,
  category       text not null,
  priority       text not null,
  completed      boolean not null default false,
  progress       integer not null default 0,
  deadline       text,
  deadline_date  text,
  deadline_time  text,
  deadline_ts    bigint,
  scheduled_date text,
  project_id     text,
  created_at     bigint not null,
  completed_at   bigint
);

-- ── projects ──────────────────────────────────────────────────
create table if not exists projects (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  emoji       text not null default '📁',
  color       text not null default '#4361EE',
  task_ids    text[] not null default '{}',
  created_at  bigint not null
);

-- ── settings（ユーザーごとに1行） ──────────────────────────────
create table if not exists settings (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  stale_threshold_days  integer not null default 3,
  week_starts_on        integer not null default 1,
  show_completed        boolean not null default false,
  mood_emoji            text not null default '🌊',
  mood_text             text not null default 'いい感じ！この調子でいこう ✨'
);

-- ── Row Level Security（自分のデータだけ読み書き可能） ───────────
alter table profiles  enable row level security;
alter table tasks     enable row level security;
alter table projects  enable row level security;
alter table settings  enable row level security;

-- profiles ポリシー
create policy "profiles: own" on profiles
  for all using (auth.uid() = id);

-- tasks ポリシー
create policy "tasks: own" on tasks
  for all using (auth.uid() = user_id);

-- projects ポリシー
create policy "projects: own" on projects
  for all using (auth.uid() = user_id);

-- settings ポリシー
create policy "settings: own" on settings
  for all using (auth.uid() = user_id);

-- ── 新規サインアップ時に profiles 行を自動作成 ──────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatarColor', '#4361EE')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

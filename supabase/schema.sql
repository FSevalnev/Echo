-- Echo — account history schema.
-- Run this once in your Supabase project: Dashboard -> SQL Editor -> New query
-- -> paste this whole file -> Run.

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null,
  topic_key text not null,
  mode text not null default 'text',       -- 'text' | 'audio' | 'file'
  level text,
  score int not null check (score between 0 and 100),
  summary text,
  criteria jsonb,
  mistakes jsonb,
  recommendations jsonb,
  created_at timestamptz not null default now()
);

create index if not exists attempts_user_topic_idx
  on public.attempts (user_id, topic_key, created_at desc);

-- Row Level Security: every signed-in user can only ever see or write
-- their own rows. Without this, any authenticated user could read
-- everyone else's history through the anon key.
alter table public.attempts enable row level security;

drop policy if exists "select own attempts" on public.attempts;
create policy "select own attempts"
  on public.attempts for select
  using (auth.uid() = user_id);

drop policy if exists "insert own attempts" on public.attempts;
create policy "insert own attempts"
  on public.attempts for insert
  with check (auth.uid() = user_id);

drop policy if exists "delete own attempts" on public.attempts;
create policy "delete own attempts"
  on public.attempts for delete
  using (auth.uid() = user_id);

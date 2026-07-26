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

-- Profile photo storage. Public bucket (so avatar URLs work directly in
-- <img> tags without signing), but write access is still locked down: a
-- user may only upload/replace/delete files inside a folder named after
-- their own user id (avatars/<user_id>/...), enforced below.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar public read" on storage.objects;
create policy "avatar public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatar owner insert" on storage.objects;
create policy "avatar owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar owner update" on storage.objects;
create policy "avatar owner update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar owner delete" on storage.objects;
create policy "avatar owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Study Rooms (multiplayer): a host creates a room with a short join
-- code, other signed-in users join it, and everyone answers the same
-- topic/question each round. Each participant's answer is graded by the
-- existing analyze endpoint and the score is written back here, then a
-- shared leaderboard is shown. Realtime (Postgres Changes) is used so
-- everyone's screen updates live — after running this file, also turn on
-- Realtime for these 4 tables: Dashboard -> Database -> Replication ->
-- toggle on "rooms", "room_participants", "room_rounds", "room_answers".

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_user_id uuid not null references auth.users (id) on delete cascade,
  subject text not null,
  topic text not null,
  level text not null default 'student',
  grade int check (grade between 1 and 11), -- only meaningful when level = 'schoolchild'
  lang text not null default 'en',
  total_rounds int not null default 3 check (total_rounds between 1 and 10),
  seconds_per_round int not null default 90 check (seconds_per_round between 20 and 600),
  current_round int not null default 0,
  status text not null default 'lobby', -- 'lobby' | 'in_round' | 'round_results' | 'finished'
  created_at timestamptz not null default now()
);

create table if not exists public.room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  total_score int not null default 0,
  joined_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create table if not exists public.room_rounds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_number int not null,
  question text not null,
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active', -- 'active' | 'scored'
  unique (room_id, round_number)
);

create table if not exists public.room_answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  room_round_id uuid not null references public.room_rounds (id) on delete cascade,
  participant_id uuid not null references public.room_participants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  explanation text not null,
  score int,
  summary text,
  mistakes jsonb,
  recommendations jsonb,
  submitted_at timestamptz not null default now(),
  unique (room_round_id, participant_id)
);

-- room_id is redundant with room_round_id -> room_rounds.room_id, kept
-- denormalized so Realtime subscriptions and the select policy below can
-- filter directly on room_answers without a join (Postgres Realtime
-- filters can't reference other tables).
create index if not exists room_answers_room_idx on public.room_answers (room_id);
create index if not exists room_answers_round_idx on public.room_answers (room_round_id);

alter table public.rooms enable row level security;
alter table public.room_participants enable row level security;
alter table public.room_rounds enable row level security;
alter table public.room_answers enable row level security;

-- rooms: anyone signed in can create one (as host); anyone signed in can
-- look a room up (needed to join by code — room settings aren't
-- sensitive); only the host can change its state.
drop policy if exists "create room" on public.rooms;
create policy "create room"
  on public.rooms for insert
  with check (auth.uid() = host_user_id);

drop policy if exists "select rooms" on public.rooms;
create policy "select rooms"
  on public.rooms for select
  using (auth.role() = 'authenticated');

drop policy if exists "host update room" on public.rooms;
create policy "host update room"
  on public.rooms for update
  using (auth.uid() = host_user_id);

-- room_participants: you can join yourself; any signed-in user can see
-- participant rows (same trust level as "select rooms" above — who's in
-- a study room isn't sensitive, and it sidesteps a Postgres limitation
-- where a policy on room_participants can't itself query
-- room_participants to check membership without causing "infinite
-- recursion detected in policy for relation room_participants"); you can
-- only update your own row.
drop policy if exists "join room" on public.room_participants;
create policy "join room"
  on public.room_participants for insert
  with check (auth.uid() = user_id);

drop policy if exists "select participants" on public.room_participants;
create policy "select participants"
  on public.room_participants for select
  using (auth.role() = 'authenticated');

drop policy if exists "update own participant row" on public.room_participants;
create policy "update own participant row"
  on public.room_participants for update
  using (auth.uid() = user_id);

-- room_rounds: visible to anyone in the room; only the host can start
-- rounds or change their state.
drop policy if exists "select rounds" on public.room_rounds;
create policy "select rounds"
  on public.room_rounds for select
  using (auth.role() = 'authenticated');

drop policy if exists "host insert rounds" on public.room_rounds;
create policy "host insert rounds"
  on public.room_rounds for insert
  with check (
    exists (
      select 1 from public.rooms r
      where r.id = room_rounds.room_id
        and r.host_user_id = auth.uid()
    )
  );

drop policy if exists "host update rounds" on public.room_rounds;
create policy "host update rounds"
  on public.room_rounds for update
  using (
    exists (
      select 1 from public.rooms r
      where r.id = room_rounds.room_id
        and r.host_user_id = auth.uid()
    )
  );

-- room_answers: visible to anyone in the room (so the leaderboard and
-- winner's answer can be shown); you may only write your own answer, and
-- only into a round that actually belongs to the room_id you claim.
drop policy if exists "select answers" on public.room_answers;
create policy "select answers"
  on public.room_answers for select
  using (auth.role() = 'authenticated');

drop policy if exists "insert own answer" on public.room_answers;
create policy "insert own answer"
  on public.room_answers for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.room_rounds rr
      where rr.id = room_answers.room_round_id
        and rr.room_id = room_answers.room_id
    )
  );

drop policy if exists "update own answer" on public.room_answers;
create policy "update own answer"
  on public.room_answers for update
  using (auth.uid() = user_id);

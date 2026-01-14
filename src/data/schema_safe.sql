-- Run this in Supabase SQL Editor.
-- It is safe to run even if tables already exist.

-- 1. Profiles Table
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text,
  avatar_url text,
  xp integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS (Safe to run multiple times? No, need checks, but usually separate is better)
-- Simpler approach: Drop policies first to avoid duplicates
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);


-- 2. Exam/Quiz Results
create table if not exists exam_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  score integer not null,
  total integer not null,
  correct integer not null,
  mode text not null,
  title text not null,
  time_taken integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

drop policy if exists "Users can view own results" on exam_results;
drop policy if exists "Users can insert own results" on exam_results;

alter table exam_results enable row level security;

create policy "Public results are viewable by everyone" on exam_results
  for select using (true);

create policy "Users can insert own results" on exam_results
  for insert with check (auth.uid() = user_id);


-- 3. Custom Questions
create table if not exists user_questions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  answer text not null,
  category text not null,
  type text default 'input',
  options jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

drop policy if exists "Users can view own questions" on user_questions;
drop policy if exists "Users can insert/update own questions" on user_questions;

alter table user_questions enable row level security;

create policy "Users can view own questions" on user_questions
  for select using (auth.uid() = user_id);

create policy "Users can insert/update own questions" on user_questions
  for all using (auth.uid() = user_id);


-- 4. Triggers (Drop first to avoid error)
drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, xp)
  values (new.id, new.raw_user_meta_data->>'username', 0)
  on conflict (id) do nothing; -- Prevents error if profile exists
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

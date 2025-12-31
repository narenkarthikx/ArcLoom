-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tasks Table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  due_date timestamp with time zone,
  is_completed boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.tasks enable row level security;
create policy "Users can view their own tasks" on tasks for select using (auth.uid() = user_id);
create policy "Users can insert their own tasks" on tasks for insert with check (auth.uid() = user_id);
-- Existing Policies (Keep them)

-- NEW TABLES FOR INNOVATION --

-- 1. Daily Metrics (Momentum tracking)
create table daily_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date default current_date not null,
  momentum_score int default 0,
  tasks_completed int default 0,
  habits_completed int default 0,
  focus_minutes int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);
alter table daily_metrics enable row level security;
create policy "Users can crud own metrics" on daily_metrics for all using (auth.uid() = user_id);

-- 2. Reflections (Thinking Space)
create table reflections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date default current_date not null,
  content text,
  mood text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table reflections enable row level security;
create policy "Users can crud own reflections" on reflections for all using (auth.uid() = user_id);

-- 3. Task Links (Connecting thoughts to action)
create table task_links (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  task_id uuid references tasks(id) on delete cascade,
  habit_id uuid references habits(id) on delete cascade,
  note_id uuid references notes(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table task_links enable row level security;
create policy "Users can crud own links" on task_links for all using (auth.uid() = user_id);

-- SCHEMA UPDATES FOR EXISTING TABLES --

-- Tasks: Energy & Friction
alter table tasks add column if not exists energy_level text check (energy_level in ('focus', 'light', 'admin', 'recovery'));
alter table tasks add column if not exists postponed_count int default 0;

-- Habits: Identity & Time Anchors
alter table habits add column if not exists identity text; -- "I am a reader"
alter table habits add column if not exists time_anchor text check (time_anchor in ('morning', 'afternoon', 'evening', 'anytime'));
create policy "Users can update their own tasks" on tasks for update using (auth.uid() = user_id);
create policy "Users can delete their own tasks" on tasks for delete using (auth.uid() = user_id);

-- 2. Habits Table
create table public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  color text default '#6366f1',
  icon text,
  created_at timestamp with time zone default now()
);

alter table public.habits enable row level security;
create policy "Users can view their own habits" on habits for select using (auth.uid() = user_id);
create policy "Users can insert their own habits" on habits for insert with check (auth.uid() = user_id);
create policy "Users can update their own habits" on habits for update using (auth.uid() = user_id);
create policy "Users can delete their own habits" on habits for delete using (auth.uid() = user_id);

-- 3. Habit Logs Table
create table public.habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits on delete cascade not null,
  completed_date date not null,
  created_at timestamp with time zone default now(),
  unique(habit_id, completed_date)
);

alter table public.habit_logs enable row level security;
create policy "Users can view their own habit logs" on habit_logs for select using (
  exists ( select 1 from habits where id = habit_logs.habit_id and user_id = auth.uid() )
);
create policy "Users can insert their own habit logs" on habit_logs for insert with check (
  exists ( select 1 from habits where id = habit_logs.habit_id and user_id = auth.uid() )
);
create policy "Users can delete their own habit logs" on habit_logs for delete using (
  exists ( select 1 from habits where id = habit_logs.habit_id and user_id = auth.uid() )
);

-- 4. Notes Table
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text,
  is_pinned boolean default false,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

alter table public.notes enable row level security;
create policy "Users can view their own notes" on notes for select using (auth.uid() = user_id);
create policy "Users can insert their own notes" on notes for insert with check (auth.uid() = user_id);
create policy "Users can update their own notes" on notes for update using (auth.uid() = user_id);
create policy "Users can delete their own notes" on notes for delete using (auth.uid() = user_id);

-- 5. Events Table (For Calendar specific items not in tasks)
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  type text check (type in ('work', 'personal', 'other')) default 'other',
  created_at timestamp with time zone default now()
);

alter table public.events enable row level security;
create policy "Users can view their own events" on events for select using (auth.uid() = user_id);
create policy "Users can insert their own events" on events for insert with check (auth.uid() = user_id);
create policy "Users can update their own events" on events for update using (auth.uid() = user_id);
create policy "Users can delete their own events" on events for delete using (auth.uid() = user_id);

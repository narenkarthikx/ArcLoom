-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tasks Table
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

-- RLS for Tasks
alter table public.tasks enable row level security;
create policy "Users can view their own tasks" on tasks for select using (auth.uid() = user_id);
create policy "Users can insert their own tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "Users can update their own tasks" on tasks for update using (auth.uid() = user_id);
create policy "Users can delete their own tasks" on tasks for delete using (auth.uid() = user_id);

-- Habits Table
create table public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  color text default '#6366f1',
  icon text,
  created_at timestamp with time zone default now()
);

-- RLS for Habits
alter table public.habits enable row level security;
create policy "Users can view their own habits" on habits for select using (auth.uid() = user_id);
create policy "Users can insert their own habits" on habits for insert with check (auth.uid() = user_id);
create policy "Users can update their own habits" on habits for update using (auth.uid() = user_id);
create policy "Users can delete their own habits" on habits for delete using (auth.uid() = user_id);

-- Habit Logs Table
create table public.habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits on delete cascade not null,
  completed_date date not null,
  created_at timestamp with time zone default now(),
  unique(habit_id, completed_date)
);

-- RLS for Habit Logs
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

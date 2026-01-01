-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.daily_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  mood text,
  note text,
  habits_done integer DEFAULT 0,
  tasks_done integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_log_pkey PRIMARY KEY (id),
  CONSTRAINT daily_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  UNIQUE (user_id, date)
);
CREATE TABLE public.daily_metrics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  momentum_score integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  habits_completed integer DEFAULT 0,
  focus_minutes integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT daily_metrics_pkey PRIMARY KEY (id),
  CONSTRAINT daily_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  UNIQUE (user_id, date)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  type text DEFAULT 'other'::text CHECK (type = ANY (ARRAY['work'::text, 'personal'::text, 'other'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.habit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  habit_id uuid NOT NULL,
  completed_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT habit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT habit_logs_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(id)
);
CREATE TABLE public.habits (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  color text DEFAULT '#6366f1'::text,
  icon text,
  created_at timestamp with time zone DEFAULT now(),
  identity text,
  time_anchor text CHECK (time_anchor = ANY (ARRAY['morning'::text, 'afternoon'::text, 'evening'::text, 'anytime'::text])),
  CONSTRAINT habits_pkey PRIMARY KEY (id),
  CONSTRAINT habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  is_pinned boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.reflections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  content text,
  mood text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT reflections_pkey PRIMARY KEY (id),
  CONSTRAINT reflections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.task_links (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  task_id uuid,
  habit_id uuid,
  note_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT task_links_pkey PRIMARY KEY (id),
  CONSTRAINT task_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT task_links_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT task_links_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(id),
  CONSTRAINT task_links_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  due_date timestamp with time zone,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  energy_level text CHECK (energy_level = ANY (ARRAY['focus'::text, 'light'::text, 'admin'::text, 'recovery'::text])),
  postponed_count integer DEFAULT 0,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- FUNCTIONS --

-- Ensure Daily Log Exists
CREATE OR REPLACE FUNCTION public.ensure_today_log()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into daily_log (user_id, date)
  values (auth.uid(), current_date)
  on conflict (user_id, date) do nothing;
end;
$function$;

-- Update Daily Log on Task Completion
CREATE OR REPLACE FUNCTION public.on_task_completed()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if new.is_completed = true and old.is_completed = false then
    update daily_log
    set tasks_done = tasks_done + 1,
        updated_at = now()
    where user_id = new.user_id
      and date = current_date;
  elsif new.is_completed = false and old.is_completed = true then
     update daily_log
    set tasks_done = GREATEST(tasks_done - 1, 0),
        updated_at = now()
    where user_id = new.user_id
      and date = current_date;
  end if;
  return new;
end;
$function$;

-- Update Daily Log on Habit Log
CREATE OR REPLACE FUNCTION public.on_habit_logged()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if (TG_OP = 'INSERT') then
    update daily_log
    set habits_done = habits_done + 1,
        updated_at = now()
    where user_id = (select user_id from habits where id = new.habit_id)
    and date = new.completed_date;
    return new;
  elsif (TG_OP = 'DELETE') then
     update daily_log
    set habits_done = GREATEST(habits_done - 1, 0),
        updated_at = now()
    where user_id = (select user_id from habits where id = old.habit_id)
    and date = old.completed_date;
    return old;
  end if;
  return null;
end;
$function$;

-- TRIGGERS --

CREATE TRIGGER task_complete_trigger
AFTER UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION on_task_completed();

CREATE TRIGGER habit_log_insert_trigger
AFTER INSERT ON public.habit_logs
FOR EACH ROW
EXECUTE FUNCTION on_habit_logged();

CREATE TRIGGER habit_log_delete_trigger
AFTER DELETE ON public.habit_logs
FOR EACH ROW
EXECUTE FUNCTION on_habit_logged();

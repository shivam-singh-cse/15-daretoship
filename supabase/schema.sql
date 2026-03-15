create table if not exists public.users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  xp integer not null default 0,
  level text not null default 'Explorer',
  created_at timestamp with time zone default now()
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  day_number integer not null,
  completed boolean not null default false,
  completed_at timestamp with time zone default now(),
  unique(user_id, day_number)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  day_number integer not null,
  content jsonb not null,
  unique(user_id, day_number)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('game', 'product')),
  url text not null,
  created_at timestamp with time zone default now(),
  unique(user_id, type)
);

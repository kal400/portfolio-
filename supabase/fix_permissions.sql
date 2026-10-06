-- ══════════════════════════════════════════════════════════════
-- RUN THIS IN YOUR SUPABASE SQL EDITOR (1-CLICK FIX)
-- Dashboard: https://supabase.com/dashboard/project/jbqlurtgtahvispwvfwo/sql
-- ══════════════════════════════════════════════════════════════

-- 1. Enable full read and write access for your Portfolio & Admin CMS
alter table public.projects disable row level security;
alter table public.skills disable row level security;
alter table public.experience disable row level security;
alter table public.site_settings disable row level security;
alter table public.messages disable row level security;

-- 2. Create the admin_auth table for your single-user master password
create table if not exists public.admin_auth (
  id int primary key default 1,
  email text not null default 'kaleabawoe@gmail.com',
  password text not null default 'kalab2026',
  updated_at timestamptz default now()
);
alter table public.admin_auth disable row level security;

insert into public.admin_auth (id, email, password)
values (1, 'kaleabawoe@gmail.com', 'kalab2026')
on conflict (id) do update set
  email = excluded.email,
  password = excluded.password,
  updated_at = now();

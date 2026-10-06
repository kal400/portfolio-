-- ─────────────────────────────────────────────────────────────
-- Standalone Admin Authentication Table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ─────────────────────────────────────────────────────────────

create table if not exists public.admin_auth (
  id int primary key default 1,
  email text not null default 'kaleabawoe@gmail.com',
  password text not null default 'kalab2026',
  updated_at timestamptz default now()
);

-- Enable Row Level Security and allow verification query
alter table public.admin_auth enable row level security;

drop policy if exists "Allow admin auth check" on public.admin_auth;
create policy "Allow admin auth check" on public.admin_auth for select using (true);

drop policy if exists "Allow admin update" on public.admin_auth;
create policy "Allow admin update" on public.admin_auth for all using (true) with check (true);

-- Insert or update the initial admin user with password 'kalab2026'
insert into public.admin_auth (id, email, password)
values (1, 'kaleabawoe@gmail.com', 'kalab2026')
on conflict (id) do update set
  email = excluded.email,
  password = excluded.password,
  updated_at = now();

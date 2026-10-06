-- Money Michelle auth/cloud schema.
-- Jalankan sekali di Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.mm_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  password_salt text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.mm_user_data (
  user_id uuid primary key references public.mm_users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists mm_users_email_idx on public.mm_users (email);

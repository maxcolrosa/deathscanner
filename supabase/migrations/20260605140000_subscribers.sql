create extension if not exists "pgcrypto";

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  consented boolean not null default false,
  answers jsonb not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- All access is server-side via the service role (which bypasses RLS). Enable
-- RLS with no public policies as defense-in-depth, matching public.orders.
alter table public.subscribers enable row level security;

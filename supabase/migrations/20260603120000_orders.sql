create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  answers jsonb not null,
  status text not null default 'generating'
    check (status in ('generating', 'ready', 'failed')),
  guide jsonb,
  model text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- All access is server-side via the service role (which bypasses RLS). Enable
-- RLS with no public policies as defense-in-depth: the token is the only secret.
alter table public.orders enable row level security;

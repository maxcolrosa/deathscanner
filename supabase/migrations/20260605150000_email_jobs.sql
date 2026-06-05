-- The drip send-queue. A Vercel Cron processes due jobs idempotently; the
-- in-memory store mirrors this shape for dev/tests.

create table if not exists public.email_jobs (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  kind text not null check (kind in ('value', 'winback')),
  send_after timestamptz not null,
  sent_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now()
);

-- Fast lookup for due, unsent jobs.
create index if not exists email_jobs_due_idx
  on public.email_jobs (send_after)
  where sent_at is null and canceled_at is null;

-- One scheduled job per (email, kind), so a repeat scan does not double-enroll.
create unique index if not exists email_jobs_email_kind_idx
  on public.email_jobs (email, kind);

-- Service-role only, matching public.orders / public.subscribers.
alter table public.email_jobs enable row level security;

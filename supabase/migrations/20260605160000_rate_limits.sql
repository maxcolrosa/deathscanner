-- Durable, cross-instance rate limiting for the public capture endpoint. The
-- previous limiter was in-process only (lib/marketing/rate-limit.ts), so it
-- reset per serverless instance and did not actually bound abuse on Vercel.
-- This backs a fixed-window counter in Postgres so the limit holds globally.

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null
);

-- Lets a periodic cleanup (or the drip cron) prune expired windows cheaply.
create index if not exists rate_limits_reset_at_idx on public.rate_limits (reset_at);

-- All access is server-side via the service role (which bypasses RLS). Enable
-- RLS with no public policies as defense-in-depth, matching public.subscribers.
alter table public.rate_limits enable row level security;

-- Atomic fixed-window hit: increments the window's counter and returns true if
-- the action is still within budget, false if the window's budget is spent.
-- The whole check-and-increment is a single upsert so concurrent calls cannot
-- both read a stale count and slip past the cap (the ON CONFLICT path takes a
-- row lock). A window whose reset_at has passed is rolled over to a fresh count.
create or replace function public.rate_limit_hit(
  p_key text,
  p_max integer,
  p_window_ms bigint
) returns boolean
language plpgsql
as $$
declare
  v_now timestamptz := now();
  v_count integer;
begin
  insert into public.rate_limits (key, count, reset_at)
    values (p_key, 1, v_now + make_interval(secs => p_window_ms / 1000.0))
  on conflict (key) do update
    set count = case
                  when public.rate_limits.reset_at <= v_now then 1
                  else public.rate_limits.count + 1
                end,
        reset_at = case
                  when public.rate_limits.reset_at <= v_now
                    then v_now + make_interval(secs => p_window_ms / 1000.0)
                  else public.rate_limits.reset_at
                end
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

-- Prune expired windows. Safe to call from a scheduled job; no-op if nothing is
-- expired. Keeps the table from growing unbounded with one-off keys.
create or replace function public.rate_limit_prune()
returns void
language sql
as $$
  delete from public.rate_limits where reset_at <= now();
$$;

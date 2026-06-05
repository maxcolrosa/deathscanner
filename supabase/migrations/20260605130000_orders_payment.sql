-- Stripe payment: extend orders for the awaiting_payment lifecycle + payment
-- correlation fields. Forward migration; the in-memory store mirrors these.

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('awaiting_payment', 'generating', 'ready', 'failed'));

alter table public.orders
  add column if not exists stripe_session_id text,
  add column if not exists customer_email text,
  add column if not exists paid_at timestamptz,
  add column if not exists emailed_at timestamptz;

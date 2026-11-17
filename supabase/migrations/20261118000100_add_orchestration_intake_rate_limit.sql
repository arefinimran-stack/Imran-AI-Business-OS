-- Durable per-user/per-organisation intake quota.
-- This migration is review-only until explicitly approved and applied to Supabase.
create table if not exists public.ai_orchestration_intake_limits (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

alter table public.ai_orchestration_intake_limits enable row level security;
revoke all on table public.ai_orchestration_intake_limits from public, anon, authenticated;

create or replace function public.consume_ai_orchestration_intake_quota(
  p_organization_id uuid,
  p_window_seconds integer default 300,
  p_max_requests integer default 10
)
returns table (
  allowed boolean,
  retry_after_seconds integer,
  remaining_requests integer
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count integer;
  v_allowed boolean;
  v_retry_after integer;
begin
  if v_user_id is null then
    raise insufficient_privilege using message = 'Authentication required';
  end if;

  if p_organization_id is null
     or p_window_seconds < 60 or p_window_seconds > 3600
     or p_max_requests < 1 or p_max_requests > 100 then
    raise invalid_parameter_value using message = 'Invalid quota parameters';
  end if;

  if not private.has_org_role(
    p_organization_id,
    array['owner', 'admin', 'lawyer', 'staff']::text[]
  ) then
    raise insufficient_privilege using message = 'Organisation access denied';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );

  insert into public.ai_orchestration_intake_limits as limits (
    organization_id, user_id, window_started_at, request_count, updated_at
  )
  values (
    p_organization_id, v_user_id, v_window_start, 1, v_now
  )
  on conflict (organization_id, user_id) do update
  set
    window_started_at = case
      when limits.window_started_at + make_interval(secs => p_window_seconds) <= v_now
        then v_window_start
      else limits.window_started_at
    end,
    request_count = case
      when limits.window_started_at + make_interval(secs => p_window_seconds) <= v_now
        then 1
      else limits.request_count + 1
    end,
    updated_at = v_now
  returning limits.request_count, limits.window_started_at
  into v_count, v_window_start;

  v_allowed := v_count <= p_max_requests;
  v_retry_after := greatest(
    0,
    ceil(extract(epoch from (
      v_window_start + make_interval(secs => p_window_seconds) - v_now
    )))::integer
  );

  return query
  select
    v_allowed,
    case when v_allowed then 0 else v_retry_after end,
    greatest(0, p_max_requests - v_count);
end;
$function$;

revoke all on function public.consume_ai_orchestration_intake_quota(uuid, integer, integer) from public, anon;
grant execute on function public.consume_ai_orchestration_intake_quota(uuid, integer, integer) to authenticated;

comment on function public.consume_ai_orchestration_intake_quota(uuid, integer, integer)
is 'Atomically consumes an authenticated organisation-scoped orchestration intake quota; denies access unless caller has an allowed active organisation role.';

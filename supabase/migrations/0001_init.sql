-- IMRAN AI — initial schema
-- Entities, CRM, legal, finance, content, agents, workflows, approvals, audit.

create extension if not exists "uuid-ossp";

-- Business ecosystem: departments / companies
create table if not exists entities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  kind text not null default 'company',
  created_at timestamptz not null default now()
);

-- CRM
create table if not exists contacts (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  name text not null,
  company text,
  phone text,
  email text,
  status text not null default 'lead',
  value numeric default 0,
  note text,
  entity_id uuid references entities(id),
  created_at timestamptz not null default now()
);

-- Legal chamber
create table if not exists cases (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  title text not null,
  client text,
  court text,
  next_hearing date,
  status text not null default 'open',
  fee numeric default 0,
  fee_paid numeric default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- Business development
create table if not exists opportunities (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  title text not null,
  entity_id uuid references entities(id),
  value numeric default 0,
  stage text not null default 'prospect',
  note text,
  created_at timestamptz not null default now()
);

-- Finance
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  label text not null,
  amount numeric not null,
  category text,
  occurred_on date not null default current_date,
  entity_id uuid references entities(id),
  created_at timestamptz not null default now()
);

-- Content & social
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  platform text not null,
  content text not null,
  scheduled_for date,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists videos (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  title text not null,
  status text not null default 'idea',
  planned_for date,
  note text,
  created_at timestamptz not null default now()
);

-- Tasks
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  title text not null,
  department text,
  due_on date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Agent workflow engine (persistent, resumable)
create table if not exists workflow_defs (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  name text not null,
  description text,
  trigger_kind text not null default 'manual',
  schedule_cron text,
  steps jsonb not null default '[]',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists workflow_runs (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  workflow_id uuid references workflow_defs(id),
  title text not null,
  status text not null default 'running',
  steps jsonb not null default '[]',
  log jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists approvals (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  run_id uuid references workflow_runs(id),
  step_id text,
  title text not null,
  agent_id text,
  summary text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Knowledge repository (metadata; files in Supabase Storage)
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  entity_id uuid references entities(id),
  department text,
  project text,
  title text not null,
  storage_path text not null,
  mime_type text,
  version integer not null default 1,
  confidential boolean not null default false,
  created_at timestamptz not null default now()
);

-- Audit log
create table if not exists audit_log (
  id uuid primary key default uuid_generate_v4(),
  owner uuid references auth.users(id),
  actor text not null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists idx_runs_owner_status on workflow_runs(owner, status);
create index if not exists idx_approvals_owner_status on approvals(owner, status);
create index if not exists idx_audit_owner_ts on audit_log(owner, created_at desc);

-- Row level security: users only see their own data
alter table entities enable row level security;
alter table contacts enable row level security;
alter table cases enable row level security;
alter table opportunities enable row level security;
alter table transactions enable row level security;
alter table posts enable row level security;
alter table videos enable row level security;
alter table tasks enable row level security;
alter table workflow_defs enable row level security;
alter table workflow_runs enable row level security;
alter table approvals enable row level security;
alter table documents enable row level security;
alter table audit_log enable row level security;

do $$
declare t text;
begin
  foreach t in array array['entities','contacts','cases','opportunities','transactions','posts','videos','tasks','workflow_defs','workflow_runs','approvals','documents','audit_log']
  loop
    execute format(
      'create policy %I on %I for all using (auth.uid() = owner) with check (auth.uid() = owner);',
      t || '_owner_all', t
    );
  end loop;
end $$;

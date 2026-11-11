create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','lawyer','staff','finance','viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
create table public.ventures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  category text not null default 'business',
  status text not null default 'planning' check (status in ('planning','active','paused','closed')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  organization_name text,
  email text,
  phone text,
  contact_type text not null default 'prospect' check (contact_type in ('client','prospect','partner','vendor','investor','other')),
  notes text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.legal_matters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  reference_code text not null,
  title text not null,
  matter_type text,
  court_or_forum text,
  status text not null default 'open' check (status in ('open','pending','on_hold','closed','archived')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  responsible_user_id uuid references auth.users(id),
  next_hearing_at timestamptz,
  confidential boolean not null default true,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, reference_code)
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','blocked','done','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  due_at timestamptz,
  assigned_to uuid references auth.users(id),
  related_matter_id uuid references public.legal_matters(id) on delete set null,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index organization_members_user_idx on public.organization_members(user_id);
create index ventures_org_idx on public.ventures(organization_id);
create index contacts_org_created_idx on public.contacts(organization_id, created_at desc);
create index legal_matters_org_status_idx on public.legal_matters(organization_id, status);
create index tasks_org_status_due_idx on public.tasks(organization_id, status, due_at);
create index audit_events_org_created_idx on public.audit_events(organization_id, created_at desc);

create or replace function private.is_org_member(p_org_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.organization_members m
    where m.organization_id = p_org_id and m.user_id = (select auth.uid()));
$$;
create or replace function private.has_org_role(p_org_id uuid, p_roles text[])
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.organization_members m
    where m.organization_id = p_org_id and m.user_id = (select auth.uid())
    and m.role = any(p_roles));
$$;
revoke all on function private.is_org_member(uuid) from public, anon;
revoke all on function private.has_org_role(uuid, text[]) from public, anon;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.has_org_role(uuid, text[]) to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.ventures enable row level security;
alter table public.contacts enable row level security;
alter table public.legal_matters enable row level security;
alter table public.tasks enable row level security;
alter table public.audit_events enable row level security;

create policy "members can read their organizations" on public.organizations
for select to authenticated using (private.is_org_member(id));
create policy "owners and admins update organizations" on public.organizations
for update to authenticated using (private.has_org_role(id, array['owner','admin']))
with check (private.has_org_role(id, array['owner','admin']));
create policy "users read own profile" on public.profiles
for select to authenticated using (id = (select auth.uid()));
create policy "users insert own profile" on public.profiles
for insert to authenticated with check (id = (select auth.uid()));
create policy "users update own profile" on public.profiles
for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "members read own membership or admins read all" on public.organization_members
for select to authenticated using (user_id = (select auth.uid()) or private.has_org_role(organization_id, array['owner','admin']));
create policy "admins add members" on public.organization_members
for insert to authenticated with check (private.has_org_role(organization_id, array['owner','admin']));
create policy "admins update members" on public.organization_members
for update to authenticated using (private.has_org_role(organization_id, array['owner','admin']))
with check (private.has_org_role(organization_id, array['owner','admin']));
create policy "admins remove members" on public.organization_members
for delete to authenticated using (private.has_org_role(organization_id, array['owner','admin']));
create policy "members read ventures" on public.ventures
for select to authenticated using (private.is_org_member(organization_id));
create policy "admins manage ventures" on public.ventures
for all to authenticated using (private.has_org_role(organization_id, array['owner','admin']))
with check (private.has_org_role(organization_id, array['owner','admin']));
create policy "members read contacts" on public.contacts
for select to authenticated using (private.is_org_member(organization_id));
create policy "staff manage contacts" on public.contacts
for all to authenticated using (private.has_org_role(organization_id, array['owner','admin','lawyer','staff']))
with check (private.has_org_role(organization_id, array['owner','admin','lawyer','staff']));
create policy "legal team read matters" on public.legal_matters
for select to authenticated using (private.has_org_role(organization_id, array['owner','admin','lawyer']));
create policy "legal team manage matters" on public.legal_matters
for all to authenticated using (private.has_org_role(organization_id, array['owner','admin','lawyer']))
with check (private.has_org_role(organization_id, array['owner','admin','lawyer']));
create policy "members read tasks" on public.tasks
for select to authenticated using (private.is_org_member(organization_id));
create policy "staff manage tasks" on public.tasks
for all to authenticated using (private.has_org_role(organization_id, array['owner','admin','lawyer','staff']))
with check (private.has_org_role(organization_id, array['owner','admin','lawyer','staff']));
create policy "admins read audit trail" on public.audit_events
for select to authenticated using (private.has_org_role(organization_id, array['owner','admin']));

insert into public.organizations (name, slug)
values ('IMRAN AI Workspace', 'imran-ai') on conflict (slug) do nothing;
insert into public.ventures (organization_id, name, slug, category, status)
select o.id, v.name, v.slug, v.category, 'planning'
from public.organizations o
cross join (values
  ('Arefin Legal & Corporate', 'arefin-legal-corporate', 'professional_services'),
  ('IA² Holdings', 'ia2-holdings', 'holding_company'),
  ('C3 Lifestyle', 'c3-lifestyle', 'consumer_brand'),
  ('Bold Cotton', 'bold-cotton', 'apparel_brand')
) as v(name, slug, category)
where o.slug = 'imran-ai'
on conflict (organization_id, slug) do nothing;

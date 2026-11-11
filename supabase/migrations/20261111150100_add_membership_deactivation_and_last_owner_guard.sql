alter table public.organization_members
add column is_active boolean not null default true;

create or replace function private.is_org_member(p_org_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.organization_members m
    where m.organization_id = p_org_id and m.user_id = (select auth.uid()) and m.is_active);
$$;
create or replace function private.has_org_role(p_org_id uuid, p_roles text[])
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.organization_members m
    where m.organization_id = p_org_id and m.user_id = (select auth.uid())
      and m.is_active and m.role = any(p_roles));
$$;

drop policy if exists "owners and admins remove members" on public.organization_members;
revoke delete on public.organization_members from authenticated;

create or replace function private.protect_last_active_owner()
returns trigger language plpgsql set search_path = ''
as $$
declare remaining_owners integer;
begin
  if old.role = 'owner' and old.is_active and (new.role <> 'owner' or not new.is_active) then
    select count(*) into remaining_owners from public.organization_members m
    where m.organization_id = old.organization_id and m.role = 'owner'
      and m.is_active and m.user_id <> old.user_id;
    if remaining_owners = 0 then
      raise exception 'The last active workspace owner cannot be demoted or deactivated.';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.protect_last_active_owner() from public, anon, authenticated;
create trigger protect_last_active_owner before update on public.organization_members
for each row execute function private.protect_last_active_owner();

create index contacts_org_creator_idx on public.contacts(organization_id, created_by);
create index legal_matters_org_creator_idx on public.legal_matters(organization_id, created_by);
create index legal_matters_org_responsible_idx on public.legal_matters(organization_id, responsible_user_id);
create index tasks_org_assignee_idx on public.tasks(organization_id, assigned_to);
create index tasks_org_creator_idx on public.tasks(organization_id, created_by);
create index tasks_org_related_matter_idx on public.tasks(organization_id, related_matter_id);
create index audit_events_org_actor_idx on public.audit_events(organization_id, actor_user_id);

drop policy "admins add members" on public.organization_members;
drop policy "admins update members" on public.organization_members;
drop policy "admins remove members" on public.organization_members;
create policy "owners and admins add members" on public.organization_members for insert to authenticated
with check (private.has_org_role(organization_id, array['owner']) or (private.has_org_role(organization_id, array['admin']) and role in ('lawyer','staff','finance','viewer')));
create policy "owners and admins update members" on public.organization_members for update to authenticated
using (private.has_org_role(organization_id, array['owner']) or (private.has_org_role(organization_id, array['admin']) and role in ('lawyer','staff','finance','viewer')))
with check (private.has_org_role(organization_id, array['owner']) or (private.has_org_role(organization_id, array['admin']) and role in ('lawyer','staff','finance','viewer')));
create policy "owners and admins remove members" on public.organization_members for delete to authenticated
using (private.has_org_role(organization_id, array['owner']) or (private.has_org_role(organization_id, array['admin']) and role in ('lawyer','staff','finance','viewer')));

revoke all on all tables in schema public from anon;
grant select, update on public.organizations to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select, insert, update, delete on public.ventures to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.legal_matters to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select on public.audit_events to authenticated;

create unique index legal_matters_org_id_id_unique_idx on public.legal_matters(organization_id, id);
alter table public.contacts add constraint contacts_creator_membership_fkey foreign key (organization_id, created_by) references public.organization_members(organization_id, user_id);
alter table public.legal_matters add constraint legal_matters_creator_membership_fkey foreign key (organization_id, created_by) references public.organization_members(organization_id, user_id);
alter table public.legal_matters add constraint legal_matters_responsible_membership_fkey foreign key (organization_id, responsible_user_id) references public.organization_members(organization_id, user_id);
alter table public.tasks add constraint tasks_creator_membership_fkey foreign key (organization_id, created_by) references public.organization_members(organization_id, user_id);
alter table public.tasks add constraint tasks_assignee_membership_fkey foreign key (organization_id, assigned_to) references public.organization_members(organization_id, user_id);
alter table public.tasks add constraint tasks_related_matter_same_org_fkey foreign key (organization_id, related_matter_id) references public.legal_matters(organization_id, id);
alter table public.audit_events add constraint audit_actor_membership_fkey foreign key (organization_id, actor_user_id) references public.organization_members(organization_id, user_id);

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant select, update on public.organizations to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update on public.organization_members to authenticated;
grant select, insert, update, delete on public.ventures to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.legal_matters to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select on public.audit_events to authenticated;

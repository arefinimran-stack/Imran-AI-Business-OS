create index if not exists audit_events_actor_idx on public.audit_events(actor_user_id);
create index if not exists contacts_created_by_idx on public.contacts(created_by);
create index if not exists legal_matters_created_by_idx on public.legal_matters(created_by);
create index if not exists legal_matters_responsible_user_idx on public.legal_matters(responsible_user_id);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_created_by_idx on public.tasks(created_by);
create index if not exists tasks_related_matter_idx on public.tasks(related_matter_id);

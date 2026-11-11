create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['organizations','profiles','ventures','contacts','legal_matters','tasks'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()', t);
  end loop;
end $$;

create or replace function private.capture_audit_event()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_row jsonb;
  v_org_id uuid;
  v_entity_id text;
begin
  if tg_op = 'DELETE' then v_row := to_jsonb(old); else v_row := to_jsonb(new); end if;
  v_org_id := (v_row ->> 'organization_id')::uuid;
  v_entity_id := coalesce(v_row ->> 'id', v_row ->> 'reference_code');
  if v_org_id is not null then
    insert into public.audit_events (organization_id, actor_user_id, action, entity_type, entity_id)
    values (v_org_id, (select auth.uid()), lower(tg_op), tg_table_name, v_entity_id);
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function private.capture_audit_event() from public, anon, authenticated;

create trigger audit_ventures after insert or update or delete on public.ventures
for each row execute function private.capture_audit_event();
create trigger audit_contacts after insert or update or delete on public.contacts
for each row execute function private.capture_audit_event();
create trigger audit_legal_matters after insert or update or delete on public.legal_matters
for each row execute function private.capture_audit_event();
create trigger audit_tasks after insert or update or delete on public.tasks
for each row execute function private.capture_audit_event();

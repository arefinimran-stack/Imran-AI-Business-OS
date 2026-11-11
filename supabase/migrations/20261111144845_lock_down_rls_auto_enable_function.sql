-- The event trigger remains installed and executes as its database owner.
-- Client API roles must not invoke this SECURITY DEFINER function directly.
revoke all on function public.rls_auto_enable() from public;
revoke all on function public.rls_auto_enable() from anon;
revoke all on function public.rls_auto_enable() from authenticated;
revoke all on function public.rls_auto_enable() from service_role;

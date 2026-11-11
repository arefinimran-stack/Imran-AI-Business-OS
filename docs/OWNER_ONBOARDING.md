# Founder Account Onboarding

Public sign-up is intentionally disabled. The first founder account must be invited from Supabase Auth and assigned the owner role by a trusted project administrator.

## One-time setup

1. In Supabase Dashboard, open the IMRAN AI project and go to Authentication > Users.
2. Invite the founder's verified email address. Do not share a password in chat, email, source control or an issue.
3. After the user accepts the invitation, obtain the user's UUID from the Auth user record.
4. Run the following SQL in the Supabase SQL Editor, replacing only the UUID placeholder with the verified Auth user UUID:

```sql
insert into public.organization_members (organization_id, user_id, role)
select id, '<AUTH_USER_UUID>'::uuid, 'owner'
from public.organizations
where slug = 'imran-ai'
on conflict (organization_id, user_id)
do update set role = 'owner';
```

5. Confirm that the user can sign in at the deployed application's `/login` page and sees the founder workspace.
6. Create additional team members only after confirming their role and least-privilege access.

## Important

- Never add the founder's UUID to source code or commit it to Git.
- Do not enable public registration.
- Do not add real client or matter data until the access model and legal confidentiality controls have been reviewed.
- Do not expose a Supabase secret/service-role key to the browser or in `NEXT_PUBLIC_*` variables.

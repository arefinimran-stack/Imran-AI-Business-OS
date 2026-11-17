-- Drafted for review with PR #12. This migration is NOT applied to the live Supabase project.
-- Enforce tenant-consistent foreign keys for buyer CRM opportunities. Existing RLS
-- policies already scope opportunity writes to an authenticated organisation role;
-- these composite foreign keys prevent linking a contact or venture from another org.

ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_organization_id_id_key
  UNIQUE (organization_id, id);

ALTER TABLE public.ventures
  ADD CONSTRAINT ventures_organization_id_id_key
  UNIQUE (organization_id, id);

ALTER TABLE public.business_opportunities
  DROP CONSTRAINT IF EXISTS business_opportunities_contact_id_fkey;

ALTER TABLE public.business_opportunities
  ADD CONSTRAINT business_opportunities_contact_same_org_fkey
  FOREIGN KEY (organization_id, contact_id)
  REFERENCES public.contacts (organization_id, id)
  NOT VALID;

ALTER TABLE public.business_opportunities
  DROP CONSTRAINT IF EXISTS business_opportunities_venture_id_fkey;

ALTER TABLE public.business_opportunities
  ADD CONSTRAINT business_opportunities_venture_same_org_fkey
  FOREIGN KEY (organization_id, venture_id)
  REFERENCES public.ventures (organization_id, id)
  NOT VALID;

ALTER TABLE public.business_opportunities
  VALIDATE CONSTRAINT business_opportunities_contact_same_org_fkey;

ALTER TABLE public.business_opportunities
  VALIDATE CONSTRAINT business_opportunities_venture_same_org_fkey;

-- Add notes column to facebook_accounts and facebook_pages tables for custom user comments
ALTER TABLE public.facebook_accounts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.facebook_pages ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN public.facebook_accounts.notes IS 'Optional notes and comments added by admins/staff for the account';
COMMENT ON COLUMN public.facebook_pages.notes IS 'Optional notes and comments added by admins/staff for the page';

-- Add raw_text column to facebook_accounts table to support storing raw pasted credentials
ALTER TABLE public.facebook_accounts ADD COLUMN IF NOT EXISTS raw_text TEXT;

-- Recommended: Add a comment to the column for future maintainers
COMMENT ON COLUMN public.facebook_accounts.raw_text IS 'Stores the raw, unparsed string used during the Smart Import process to enable manual editing later.';

-- Add username to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

COMMENT ON COLUMN public.user_profiles.username IS 'Unique username for the user.';

-- Add new columns to samples table
ALTER TABLE public.samples
ADD COLUMN IF NOT EXISTS institution_name TEXT,
ADD COLUMN IF NOT EXISTS institution_contact_name TEXT,
ADD COLUMN IF NOT EXISTS institution_contact_email TEXT,
ADD COLUMN IF NOT EXISTS sample_owner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.samples.institution_name IS 'Name of the institution providing the sample.';
COMMENT ON COLUMN public.samples.institution_contact_name IS 'Name of the contact person at the institution.';
COMMENT ON COLUMN public.samples.institution_contact_email IS 'Email of the contact person at the institution.';
COMMENT ON COLUMN public.samples.sample_owner_id IS 'The user responsible for managing this sample (optional).';

-- Update RLS policies on samples for logged-in users
-- Allow users to see all samples in the marketplace (no change needed if already public or anon role can select)

-- Allow users to see detailed info for their own samples (including new fields)
DROP POLICY IF EXISTS "Allow users to view their own samples" ON public.samples;
CREATE POLICY "Allow users to view their own samples" ON public.samples
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = sample_owner_id);

-- Allow users to update their own samples
DROP POLICY IF EXISTS "Allow users to update their own samples" ON public.samples;
CREATE POLICY "Allow users to update their own samples" ON public.samples
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = sample_owner_id)
WITH CHECK (auth.uid() = sample_owner_id);

-- Allow users to insert samples and set themselves as owner
DROP POLICY IF EXISTS "Allow users to insert their own samples" ON public.samples;
CREATE POLICY "Allow users to insert their own samples" ON public.samples
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sample_owner_id); 
-- Note: This might need adjustment depending on how institution samples are added.

-- Update RLS policies on user_profiles
-- Allow users to view their own profile (including username)
DROP POLICY IF EXISTS "Allow individual user read access" ON public.user_profiles;
CREATE POLICY "Allow individual user read access" ON public.user_profiles
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile (including username)
DROP POLICY IF EXISTS "Allow individual user update access" ON public.user_profiles;
CREATE POLICY "Allow individual user update access" ON public.user_profiles
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to read basic profile info (id, username, institution) of other sample owners for display?
-- Let's keep this restricted for now to avoid exposing emails/names unless necessary.
-- We can fetch institution_name directly from the samples table. 
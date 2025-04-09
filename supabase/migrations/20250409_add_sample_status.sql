-- Add status column to samples table
ALTER TABLE public.samples
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'private';

COMMENT ON COLUMN public.samples.status IS 'Tracks if the sample is private (in My Samples) or public (in marketplace).';

-- Add index for faster querying on status
CREATE INDEX IF NOT EXISTS idx_samples_status ON public.samples(status);

-- Update RLS policy for reading samples in the marketplace
-- Drop the existing policy that allows anyone to read all samples
DROP POLICY IF EXISTS "Anyone can read samples" ON public.samples;

-- Create a new policy allowing anyone to read only PUBLIC samples
CREATE POLICY "Anyone can read public samples" ON public.samples
AS PERMISSIVE FOR SELECT
USING (status = 'public');

-- Update RLS policy for authenticated users viewing their own samples
-- Drop the existing policy
DROP POLICY IF EXISTS "Allow users to view their own samples" ON public.samples;

-- Recreate policy allowing users to view ALL their own samples (private or public)
CREATE POLICY "Allow users to view their own samples" ON public.samples
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = sample_owner_id);

-- Ensure update policy allows changing the status
-- (The existing update policy based on sample_owner_id should suffice,
-- but we could add specific checks if needed) 
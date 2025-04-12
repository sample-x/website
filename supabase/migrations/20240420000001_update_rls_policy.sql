-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create their own appointments" ON demo_appointments;

-- Create a more permissive policy for testing
CREATE POLICY "Allow demo appointment creation" 
  ON demo_appointments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);  -- Allow all authenticated users to create appointments

-- If you want to revert to a stricter policy later, uncomment this:
-- CREATE POLICY "Users can create their own appointments"
--   ON demo_appointments
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = user_id); 
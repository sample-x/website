-- Create demo_appointments table
CREATE TABLE demo_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE demo_appointments ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own appointments
CREATE POLICY "Users can view their own appointments"
  ON demo_appointments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own appointments
CREATE POLICY "Users can create their own appointments"
  ON demo_appointments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own appointments
CREATE POLICY "Users can update their own appointments"
  ON demo_appointments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_demo_appointments_updated_at
  BEFORE UPDATE ON demo_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 
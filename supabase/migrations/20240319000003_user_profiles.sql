-- Create user profiles table to store additional information
-- The auth.users table is managed by Supabase Auth

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  institution TEXT,
  country TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplicates
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Create secure policies
-- Users can only view/update their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Only authenticated users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
  ON public.user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create relationship between samples and users
ALTER TABLE public.samples 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update samples policies - drop first to avoid duplicate error
DROP POLICY IF EXISTS "Users can view all samples" ON public.samples;
DROP POLICY IF EXISTS "Users can update their own samples" ON public.samples;
DROP POLICY IF EXISTS "Users can delete their own samples" ON public.samples;
DROP POLICY IF EXISTS "Users can insert their own samples" ON public.samples;

-- Create policies
CREATE POLICY "Users can view all samples"
  ON public.samples
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own samples"
  ON public.samples
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own samples"
  ON public.samples
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own samples"
  ON public.samples
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 
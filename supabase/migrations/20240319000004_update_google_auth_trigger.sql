-- Update the handle_new_user trigger function to copy metadata from auth.users

-- Drop existing function
DROP FUNCTION IF EXISTS handle_new_user();

-- Create an improved version that captures metadata
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    first_name_val TEXT;
    last_name_val TEXT;
    institution_val TEXT;
BEGIN
    -- First try to get values from raw_user_meta_data
    IF NEW.raw_user_meta_data->>'first_name' IS NOT NULL THEN
        first_name_val := NEW.raw_user_meta_data->>'first_name';
    ELSIF NEW.raw_user_meta_data->>'given_name' IS NOT NULL THEN
        -- Google Auth uses "given_name" 
        first_name_val := NEW.raw_user_meta_data->>'given_name';
    ELSE
        first_name_val := NULL;
    END IF;

    IF NEW.raw_user_meta_data->>'last_name' IS NOT NULL THEN
        last_name_val := NEW.raw_user_meta_data->>'last_name';
    ELSIF NEW.raw_user_meta_data->>'family_name' IS NOT NULL THEN
        -- Google Auth uses "family_name"
        last_name_val := NEW.raw_user_meta_data->>'family_name';
    ELSE
        last_name_val := NULL;
    END IF;
    
    -- Check for institution/organization data
    IF NEW.raw_user_meta_data->>'institution' IS NOT NULL THEN
        institution_val := NEW.raw_user_meta_data->>'institution';
    ELSIF NEW.raw_user_meta_data->>'organization' IS NOT NULL THEN
        institution_val := NEW.raw_user_meta_data->>'organization';
    ELSIF NEW.raw_user_meta_data->>'company' IS NOT NULL THEN
        institution_val := NEW.raw_user_meta_data->>'company';
    ELSE
        institution_val := NULL;
    END IF;

    -- Insert profile with metadata values
    INSERT INTO public.user_profiles (
        id, 
        first_name, 
        last_name,
        institution
    )
    VALUES (
        NEW.id, 
        first_name_val, 
        last_name_val,
        institution_val
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add a trigger for updating profile data on user update
CREATE OR REPLACE FUNCTION sync_user_profile() 
RETURNS TRIGGER AS $$
DECLARE
    first_name_val TEXT;
    last_name_val TEXT;
    institution_val TEXT;
BEGIN
    -- First try to get values from raw_user_meta_data
    IF NEW.raw_user_meta_data->>'first_name' IS NOT NULL THEN
        first_name_val := NEW.raw_user_meta_data->>'first_name';
    ELSIF NEW.raw_user_meta_data->>'given_name' IS NOT NULL THEN
        -- Google Auth uses "given_name" 
        first_name_val := NEW.raw_user_meta_data->>'given_name';
    ELSE
        first_name_val := NULL;
    END IF;

    IF NEW.raw_user_meta_data->>'last_name' IS NOT NULL THEN
        last_name_val := NEW.raw_user_meta_data->>'last_name';
    ELSIF NEW.raw_user_meta_data->>'family_name' IS NOT NULL THEN
        -- Google Auth uses "family_name"
        last_name_val := NEW.raw_user_meta_data->>'family_name';
    ELSE
        last_name_val := NULL;
    END IF;
    
    -- Check for institution/organization data
    IF NEW.raw_user_meta_data->>'institution' IS NOT NULL THEN
        institution_val := NEW.raw_user_meta_data->>'institution';
    ELSIF NEW.raw_user_meta_data->>'organization' IS NOT NULL THEN
        institution_val := NEW.raw_user_meta_data->>'organization';
    ELSIF NEW.raw_user_meta_data->>'company' IS NOT NULL THEN
        institution_val := NEW.raw_user_meta_data->>'company';
    ELSE
        institution_val := NULL;
    END IF;

    -- Only update if we have new values
    IF first_name_val IS NOT NULL OR last_name_val IS NOT NULL OR institution_val IS NOT NULL THEN
        UPDATE public.user_profiles
        SET 
            first_name = COALESCE(first_name_val, first_name),
            last_name = COALESCE(last_name_val, last_name),
            institution = COALESCE(institution_val, institution),
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add update trigger
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION sync_user_profile(); 
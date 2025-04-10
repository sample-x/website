-- Create function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS json AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = check_table_exists.table_name
  ) INTO result;
  
  IF result THEN
    RETURN json_build_object('exists', true);
  ELSE
    RETURN json_build_object('exists', false);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
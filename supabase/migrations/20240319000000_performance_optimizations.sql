-- Add performance indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_samples_type ON samples(type);
CREATE INDEX IF NOT EXISTS idx_samples_price ON samples(price);
CREATE INDEX IF NOT EXISTS idx_samples_collection_date ON samples(collection_date);

-- Update the search_samples function to be more efficient
CREATE OR REPLACE FUNCTION search_samples(
    search_term text,
    sample_type text,
    min_price numeric,
    max_price numeric,
    storage text,
    page_size integer DEFAULT 10,
    page_number integer DEFAULT 1
) RETURNS TABLE (
    id uuid,
    name text,
    type text,
    location text,
    collection_date date,
    storage_condition text,
    quantity integer,
    price decimal,
    description text,
    latitude decimal,
    longitude decimal,
    hash text,
    created_at timestamptz,
    updated_at timestamptz,
    geog geography,
    total_count bigint
) AS $$
DECLARE
    offset_val integer := (page_number - 1) * page_size;
    query_text text;
    count_val bigint;
BEGIN
    -- Build the WHERE clause dynamically
    query_text := '
    WITH filtered AS (
        SELECT * FROM samples
        WHERE (
            $1 IS NULL
            OR name ILIKE ''%'' || $1 || ''%''
            OR description ILIKE ''%'' || $1 || ''%''
        )
        AND ($2 IS NULL OR type = $2)
        AND ($3 IS NULL OR price >= $3)
        AND ($4 IS NULL OR price <= $4)
        AND ($5 IS NULL OR storage_condition = $5)
    ),
    count_table AS (
        SELECT COUNT(*) AS total_count FROM filtered
    )
    SELECT f.*, c.total_count
    FROM filtered f, count_table c
    ORDER BY f.created_at DESC
    LIMIT $6 OFFSET $7';
    
    RETURN QUERY EXECUTE query_text
    USING search_term, sample_type, min_price, max_price, storage, page_size, offset_val;
END;
$$ LANGUAGE plpgsql;

-- Add a dedicated function for sample deletion with proper authorization check
CREATE OR REPLACE FUNCTION delete_sample(sample_id uuid)
RETURNS boolean AS $$
DECLARE
    success boolean := false;
BEGIN
    -- Delete the sample if it exists
    DELETE FROM samples WHERE id = sample_id;
    
    -- Check if the deletion was successful
    IF FOUND THEN
        success := true;
    END IF;
    
    RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
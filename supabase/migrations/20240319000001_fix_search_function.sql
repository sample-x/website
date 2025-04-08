-- Fix the search_samples function to match the table structure correctly
CREATE OR REPLACE FUNCTION search_samples(
    search_term text,
    sample_type text,
    min_price numeric,
    max_price numeric,
    storage text,
    page_size integer DEFAULT 10,
    page_number integer DEFAULT 1
) 
RETURNS TABLE (
    id uuid,
    name text,
    type text,
    location text,
    collection_date date,
    storage_condition text,
    quantity integer,
    price numeric,
    description text,
    latitude numeric,
    longitude numeric,
    hash text,
    created_at timestamptz,
    updated_at timestamptz,
    geog geography,
    total_count bigint
) 
AS $$
BEGIN
    RETURN QUERY EXECUTE '
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
    SELECT 
        f.id, 
        f.name, 
        f.type, 
        f.location, 
        f.collection_date, 
        f.storage_condition, 
        f.quantity, 
        f.price, 
        f.description, 
        f.latitude, 
        f.longitude, 
        f.hash, 
        f.created_at, 
        f.updated_at, 
        f.geog,
        c.total_count
    FROM filtered f, count_table c
    ORDER BY f.created_at DESC
    LIMIT $6 OFFSET $7
    '
    USING search_term, sample_type, min_price, max_price, storage, page_size, (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql; 
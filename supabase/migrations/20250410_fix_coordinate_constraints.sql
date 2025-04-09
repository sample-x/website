-- Fix latitude and longitude constraints in samples table
-- This migration allows NULL values for coordinate fields since not all samples have geographic coordinates

-- First modify the latitude column to allow NULL values
ALTER TABLE samples ALTER COLUMN latitude DROP NOT NULL;

-- Then modify the longitude column to allow NULL values
ALTER TABLE samples ALTER COLUMN longitude DROP NOT NULL;

-- Add a comment to explain the purpose of these columns
COMMENT ON COLUMN samples.latitude IS 'Geographic latitude coordinate (optional)';
COMMENT ON COLUMN samples.longitude IS 'Geographic longitude coordinate (optional)'; 
#!/bin/bash

# Navigate to project directory
cd "$(dirname "$0")"

echo "Creating orders tables and functions..."

# Apply database migrations
echo "Applying database function for checking tables..."
psql -h localhost -p 54322 -U postgres -d postgres -f ./supabase/migrations/20240608000000_db_functions.sql

echo "Creating orders and order_items tables..."
psql -h localhost -p 54322 -U postgres -d postgres -f ./fix_database.sql

echo "Done! Database schema should be fixed now." 
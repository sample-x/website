#!/bin/bash

# Script to rollback database changes if there are issues

echo "===== Database Changes Rollback ====="
echo "This script will revert the recent database performance optimizations."

# Check if backup file is specified
if [ "$1" == "" ]; then
  echo "Error: Please specify a backup file to restore from."
  echo "Usage: ./rollback-changes.sh <backup_file>"
  echo "Available backups:"
  ls -la supabase/backups/
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' not found."
  echo "Available backups:"
  ls -la supabase/backups/
  exit 1
fi

# Confirm rollback
echo -e "\nWARNING: This will revert all database changes to the state in $BACKUP_FILE."
read -p "Are you sure you want to proceed? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Operation cancelled."
  exit 0
fi

# Create a new backup of current state
echo -e "\n[1/3] Creating backup of current state..."
CURRENT_BACKUP="supabase/backups/pre_rollback_backup_$(date +"%Y%m%d%H%M%S").sql"
npx supabase db dump -f "$CURRENT_BACKUP" || {
  echo "Failed to create backup of current state."
  exit 1
}
echo "✓ Current state backed up to $CURRENT_BACKUP"

# Drop added indexes and functions
echo -e "\n[2/3] Removing added indexes and functions..."
echo "
-- Drop the updated search_samples function
DROP FUNCTION IF EXISTS search_samples(text, text, numeric, numeric, text, integer, integer);

-- Re-create the original search_samples function
CREATE OR REPLACE FUNCTION search_samples(
    search_term text,
    sample_type text,
    min_price numeric,
    max_price numeric,
    storage text
) returns setof samples as \$\$
begin
    return query
    select *
    from samples
    where (
        search_term is null
        or name ilike '%' || search_term || '%'
        or description ilike '%' || search_term || '%'
    )
    and (sample_type is null or type = sample_type)
    and (min_price is null or price >= min_price)
    and (max_price is null or price <= max_price)
    and (storage is null or storage_condition = storage);
end;
\$\$ language plpgsql;

-- Drop the delete_sample function
DROP FUNCTION IF EXISTS delete_sample(uuid);

-- Drop the added indexes
DROP INDEX IF EXISTS idx_samples_type;
DROP INDEX IF EXISTS idx_samples_price;
DROP INDEX IF EXISTS idx_samples_collection_date;
" > rollback_sql.sql

npx supabase db execute < rollback_sql.sql || {
  echo "Failed to execute rollback SQL."
  exit 1
}
rm rollback_sql.sql
echo "✓ Added indexes and functions removed"

# Reset the code changes with git
echo -e "\n[3/3] Reverting code changes..."
git checkout main -- app/samples/page.tsx app/samples/[id]/page.tsx
if [ -f "app/samples/[id]/SampleDetailClient.tsx" ]; then
  git rm app/samples/[id]/SampleDetailClient.tsx
fi
git checkout main -- supabase/migrations/
git rm supabase/migrations/20240319000000_performance_optimizations.sql
echo "✓ Code changes reverted"

echo -e "\n===== Rollback Complete ====="
echo "The database schema has been restored to its previous state,"
echo "and code changes have been reverted."
echo "You may need to restart your application for changes to take effect." 
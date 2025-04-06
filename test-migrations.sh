#!/bin/bash

# Script to test database migrations

echo "===== Testing Database Migrations ====="
echo "This script will help identify potential issues with the migrations."

# Create a database backup before testing
echo -e "\n[1/5] Creating database backup..."
npx supabase db dump -f supabase/backups/pre_migration_backup_$(date +"%Y%m%d%H%M%S").sql || {
  echo "Failed to create database backup. Make sure Supabase CLI is installed and you're authenticated."
  exit 1
}
echo "✓ Backup created successfully"

# Check migration syntax
echo -e "\n[2/5] Checking migration syntax..."
npx supabase db lint || {
  echo "Syntax check failed. Please fix the issues in the migration files."
  exit 1
}
echo "✓ Migration syntax looks good"

# Try to reset the database (dry run)
echo -e "\n[3/5] Testing reset capability (dry run)..."
npx supabase db reset --dry-run || {
  echo "Database reset dry run failed. This could indicate migration issues."
  exit 1
}
echo "✓ Database reset dry run completed successfully"

# Test the new search_samples function
echo -e "\n[4/5] Testing database queries..."
echo "SELECT * FROM search_samples(NULL, NULL, NULL, NULL, NULL, 5, 1);" > test_query.sql
npx supabase db execute < test_query.sql || {
  echo "Test query execution failed. Check the search_samples function."
  rm test_query.sql
  exit 1
}
rm test_query.sql
echo "✓ Test query executed successfully"

# Validate delete_sample function
echo -e "\n[5/5] Testing delete_sample function..."
echo "SELECT delete_sample('00000000-0000-0000-0000-000000000000');" > test_delete.sql
npx supabase db execute < test_delete.sql || {
  echo "Delete function test failed. Check the delete_sample function."
  rm test_delete.sql
  exit 1
}
rm test_delete.sql
echo "✓ Delete function test executed successfully"

echo -e "\n===== All tests passed! ====="
echo "The migration appears to be valid. You can now apply it to your production database."
echo "If you encounter any issues, you can restore from the backup created earlier." 
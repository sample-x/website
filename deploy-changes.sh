#!/bin/bash

# Script to deploy our database changes to Supabase
echo "===== Deploying Database Changes ====="
echo "This script will apply the performance optimizations to your Supabase database."

# Create a backup before making changes
echo -e "\n[1/4] Creating database backup..."
BACKUP_FILE="supabase/backups/pre_deploy_backup_$(date +"%Y%m%d%H%M%S").sql"
npx supabase db dump -f "$BACKUP_FILE" || {
  echo "Failed to create database backup. Make sure Supabase CLI is installed and you're authenticated."
  exit 1
}
echo "✓ Backup created at $BACKUP_FILE"

# Push migrations to remote database
echo -e "\n[2/4] Applying migrations to remote database..."
npx supabase db push || {
  echo "Failed to push migrations. Check your connection and try again."
  echo "You can manually apply the SQL from supabase/migrations/20240319000000_performance_optimizations.sql"
  exit 1
}
echo "✓ Migrations applied successfully"

# Build the Next.js application
echo -e "\n[3/4] Building the application with updated code..."
npm run build || {
  echo "Build failed. Check for errors in the application code."
  exit 1
}
echo "✓ Application built successfully"

# Deploy the application
echo -e "\n[4/4] Deploying the application..."
npx wrangler pages deploy out || {
  echo "Deployment failed. Check your Cloudflare credentials and try again."
  exit 1
}
echo "✓ Application deployed successfully"

echo -e "\n===== Deployment Complete ====="
echo "The performance optimizations have been applied to your database,"
echo "and the updated application has been deployed."
echo -e "\nIf you encounter any issues, you can run the rollback script:"
echo "./rollback-changes.sh $BACKUP_FILE" 
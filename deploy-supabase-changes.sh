#!/bin/bash
set -e

echo "Pushing migration to Supabase..."
supabase db push

echo "Deploying Edge Function for email notifications..."
supabase functions deploy send-demo-notification

echo "Verifying Edge Function secrets..."
supabase secrets list

echo "Deployment complete!" 
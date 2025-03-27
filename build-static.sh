#!/bin/bash

# Script to build the Next.js app for static hosting on Cloudflare Pages

# Ensure we exit on any errors
set -e

echo "Starting build process for Cloudflare Pages deployment..."

# Check for required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set."
  echo "Please set this variable in your Cloudflare Pages environment settings."
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "Error: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set."
  echo "Please set this variable in your Cloudflare Pages environment settings."
  exit 1
fi

# Create a temporary .env.local file for the build
echo "Creating temporary .env.local file..."
cat > .env.local << EOL
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
EOL

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the Next.js app with static export
echo "Building the Next.js app with static export..."
npm run build
# Note: With next.config.js output: 'export', the output is already in the 'out' directory
# We don't need to run next export separately

# Create a Cloudflare _headers file in the output directory
echo "Creating Cloudflare _headers file..."
cat > out/_headers << EOL
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
  Access-Control-Allow-Headers: Content-Type, Authorization, x-client-info, apikey, X-Client-Info
EOL

# Copy _routes.json to the output directory
echo "Copying _routes.json to output directory..."
if [ -f "_routes.json" ]; then
  cp _routes.json out/
fi

# Clean up temporary .env.local file
echo "Cleaning up temporary files..."
rm -f .env.local

echo "Build process completed successfully. Files are in the 'out' directory."

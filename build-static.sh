#!/bin/bash

# Script to build the Next.js app for Cloudflare Pages
set -e

echo "Starting static build process..."

# Ensure required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "Error: Required environment variables are not set"
  exit 1
fi

# Create temporary .env.local file
echo "Creating .env.local file..."
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
EOL

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the Next.js app (outputs to 'out/' by default with export config)
echo "Building the Next.js app..."
NEXT_PUBLIC_IS_STATIC_EXPORT=true NEXT_TELEMETRY_DISABLED=1 npm run build

# Create Cloudflare Pages specific files in 'out' directory
echo "Creating Cloudflare Pages configuration in out/ directory..."
cat > out/_headers << EOL
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
EOL

# Clean up
echo "Cleaning up..."
rm .env.local

echo "Static build completed! Output is in out/"
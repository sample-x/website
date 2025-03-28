#!/bin/bash

# Script to build the Next.js app for Cloudflare Pages with size optimization
set -e

echo "Starting optimized build process for Cloudflare Pages deployment..."

# Check for required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set."
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "Error: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set."
  exit 1
fi

# Create temporary .env.local file
echo "Creating temporary .env.local file..."
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
EOL

# Clean install with production dependencies only
echo "Installing production dependencies..."
npm ci --omit=dev

# Build the Next.js app
echo "Building the Next.js app..."
npm run build

# Create output directory if it doesn't exist
mkdir -p out

# Copy necessary files to output
echo "Copying build files to output directory..."
cp -r .next/standalone/* out/
cp -r .next/static out/.next/
cp -r public/* out/

# Create optimized package.json for deployment
echo "Creating optimized package.json..."
cat > out/package.json << EOL
{
  "name": "sample-exchange",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18",
    "react-dom": "^18"
  }
}
EOL

# Create _headers file for Cloudflare
echo "Creating Cloudflare _headers file..."
cat > out/_headers << EOL
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
  Access-Control-Allow-Headers: Content-Type, Authorization, x-client-info, apikey, X-Client-Info
EOL

# Clean up
echo "Cleaning up..."
rm -f .env.local

# Optimize the output directory
echo "Optimizing output directory..."
find out -name "*.map" -type f -delete
find out -name "*.txt" -type f -delete

echo "Build process completed. Optimized files are in the 'out' directory." 
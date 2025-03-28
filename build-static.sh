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

# Install all dependencies (including dev dependencies needed for build)
echo "Installing dependencies..."
npm ci

# Build the Next.js app
echo "Building the Next.js app..."
NEXT_TELEMETRY_DISABLED=1 npm run build

# Set up the output directory
echo "Setting up output directory..."
rm -rf out
mkdir -p out

# Copy the export output
echo "Copying export output..."
cp -r out/* ./ || true  # Handle case where out is empty
cp -r .next/static out/_next/
cp -r public/* out/

# Create optimized package.json for deployment
echo "Creating optimized package.json..."
cat > out/package.json << EOL
{
  "name": "sample-exchange",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "next": "14.0.4",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2.39.3",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4"
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

/_next/static/chunks/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable

/_next/static/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable

*.js
  Content-Type: application/javascript
EOL

# Clean up
echo "Cleaning up..."
rm -f .env.local

# Remove unnecessary files to reduce size
echo "Removing unnecessary files..."
find out -type f -name "*.d.ts" -delete
find out -type f -name "*.map" -delete
find out -type d -name "__tests__" -exec rm -rf {} +
find out -type d -name "test" -exec rm -rf {} +
find out -type d -name "tests" -exec rm -rf {} +
find out -type d -name "docs" -exec rm -rf {} +
find out -type d -name "doc" -exec rm -rf {} +
find out -type d -name "example" -exec rm -rf {} +
find out -type d -name "examples" -exec rm -rf {} +

# Remove development-only files
find out -type f -name "*.test.js" -delete
find out -type f -name "*.spec.js" -delete
find out -type f -name "*.test.ts" -delete
find out -type f -name "*.spec.ts" -delete

# Compress JavaScript files
echo "Compressing JavaScript files..."
find out -type f -name "*.js" ! -name "*.min.js" -exec gzip -k {} \;

echo "Build process completed. Optimized files are in the 'out' directory." 
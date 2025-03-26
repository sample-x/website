#!/bin/bash
set -e

# Custom build script for Cloudflare Pages

# Set environment variables for the build
export NEXT_PUBLIC_SUPABASE_URL=https://znmkkduvzzmoxzgthwby.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWtrZHV2enptb3h6Z3Rod2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NDI2MzksImV4cCI6MjA1ODMxODYzOX0.YObW_QOjuEuvjGxi97JAIRbUWwsZ1gTSCebzNkMVqYk

# Install dependencies
npm install

# Build with Next.js
echo "Building with Next.js..."
NEXT_TELEMETRY_DISABLED=1 npx next build

# Export static files
echo "Exporting static files..."
NEXT_TELEMETRY_DISABLED=1 npx next export

# Create _routes.json for Cloudflare Pages
echo "Creating _routes.json..."
cat > out/_routes.json << EOL
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
EOL

# Check if the build was successful
if [ -d "out" ] && [ "$(find out -type f -name "*.html" | wc -l)" -gt 0 ]; then
  echo "Next.js build successful."
  
  # Copy _routes.json to output directory if it exists
  if [ -f "_routes.json" ]; then
    cp _routes.json out/
    echo "Copied _routes.json to output directory."
  fi
  
  # Create a 404 page if it doesn't exist
  if [ ! -f "out/404.html" ]; then
    cp out/index.html out/404.html
    echo "Created 404.html page."
  fi
else
  echo "Next.js build failed. Please check the error messages above."
  exit 1
fi

# Output success message
echo "Build completed successfully!"

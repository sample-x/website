#!/bin/bash

# Script to build the Next.js app for Cloudflare Pages
set -e

echo "Starting static build process..."

# Ensure required environment variables are set (These should be provided by the build environment, e.g., Cloudflare dashboard settings)
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "Error: Required environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set in the build environment."
  exit 1
fi

# Set static export flag
export STATIC_EXPORT=1

# Create temporary .env.local file FOR THE BUILD PROCESS ONLY
# Runtime values on Cloudflare Pages come from dashboard settings
echo "Creating .env.local file for build process..."
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
STATIC_EXPORT=1
EOL

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the Next.js app (outputs to 'out/' by default with export config)
echo "Building the Next.js app..."
NEXT_TELEMETRY_DISABLED=1 npm run build # Removed STATIC_EXPORT=1 here as it's set globally and in .env.local

# Create Cloudflare Pages specific files in 'out' directory
echo "Creating Cloudflare Pages configuration in out/ directory..."
cat > out/_headers << EOL
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
EOL

# Create functions directory for Cloudflare Functions
echo "Creating Cloudflare Functions directory..."
mkdir -p out/functions

# Create a Worker script for auth callback
echo "Creating auth callback worker..."
cat > out/functions/auth-callback.js << EOL
// Cloudflare Worker for handling OAuth callbacks in static deployment

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (code) {
    try {
      // Create URL for Supabase auth.exchangeCodeForSession
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '$NEXT_PUBLIC_SUPABASE_URL';
      const endpoint = \`\${supabaseUrl}/auth/v1/token?grant_type=authorization_code&code=\${code}\`;
      
      // Make the request to Supabase
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '$NEXT_PUBLIC_SUPABASE_ANON_KEY',
        },
      });
      
      if (!response.ok) {
        console.error('Error exchanging code:', await response.text());
      } else {
        const result = await response.json();
        // Successfully handled auth code exchange
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
    }
  }
  
  // Always redirect to samples regardless of outcome
  return Response.redirect(new URL('/samples', request.url).toString(), 302);
}
EOL

# Create a _routes.json file to control routing
echo "Creating routes configuration..."
cat > out/_routes.json << EOL
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/functions/*"]
}
EOL

# Add a script to detect static mode
echo "Adding static mode detector script..."
cat > out/static-mode.js << EOL
// Set a global flag to indicate we're running in static mode
window.__STATIC_MODE__ = true;
EOL

# Add the script inclusion to the HTML files
echo "Adding static mode script to HTML files..."
find out -name "*.html" -exec sed -i 's/<head>/<head><script src="\/static-mode.js"><\/script>/' {} \;

# Clean up
echo "Cleaning up..."
rm .env.local

echo "Static build completed! Output is in out/"
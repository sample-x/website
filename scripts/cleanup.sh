#!/bin/bash

# Cleanup script for Next.js + Supabase + Cloudflare Pages project
# WARNING: This script makes significant changes to your codebase
# Make sure to have a complete backup before running

set -euo pipefail

echo "Starting codebase cleanup..."

# Step 1: Create proper directory structure
mkdir -p components/{ui,form,layout,providers,features}
mkdir -p lib
mkdir -p context
mkdir -p types
mkdir -p public/assets/{images,videos}

# Step 2: Normalize file organization
echo "Organizing file structure..."

# Move components from app/components to /components
if [ -d "app/components" ]; then
  echo "Moving app/components to root components directory..."
  cp -r app/components/* components/
  # Don't delete yet, we'll do cleanup at the end
fi

# Move context providers
if [ -d "app/context" ]; then
  echo "Moving app/context to root context directory..."
  cp -r app/context/* context/
  # Don't delete yet, we'll do cleanup at the end
fi

# Move lib files
if [ -d "app/lib" ]; then
  echo "Moving app/lib to root lib directory..."
  cp -r app/lib/* lib/
  # Don't delete yet, we'll do cleanup at the end
fi

# Step 3: Remove duplicate and unused files
echo "Removing duplicate and unused files..."

# List of files to remove
FILES_TO_REMOVE=(
  "app/globals.css.backup"
  "update-build-static.sh"
  "public/assets/create-world-map.html"
  "app/index.html"
  ".nvmrc"
)

for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "Removing $file..."
    rm "$file"
  fi
done

# Step 4: Update configuration files
echo "Updating configuration files..."

# Update .nvmrc with a specific Node.js version
echo "18.17.0" > .nvmrc
echo "Updated .nvmrc to use Node.js 18.17.0"

# Update next.config.js
if [ -f "next.config.js" ]; then
  echo "Updating next.config.js..."
  cat > next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Use export mode for Cloudflare Pages
  output: 'export',
  
  // Skip trailing slash redirect
  skipTrailingSlashRedirect: true,
  
  // Images configuration
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'znmkkduvzzmoxzgthwby.supabase.co',
      },
    ],
  },
  
  // Handle dynamic routes
  trailingSlash: false,
  
  // Simplified webpack config
  webpack: (config, { isServer }) => {
    // Fix for browser APIs in Node.js environment
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '~': path.resolve(__dirname, './app'),
      '@components': path.resolve(__dirname, './components'),
      '@lib': path.resolve(__dirname, './lib'),
      '@context': path.resolve(__dirname, './context'),
    }
    
    return config;
  },
  
  // Experimental features
  experimental: {
    // Ensure proper static export
    forceSwcTransforms: true,
  },
};

module.exports = nextConfig;
EOL
  echo "next.config.js updated with optimized config"
fi

# Update _routes.json (keeping only the most complete version)
if [ -f "_routes.json" ]; then
  if [ -f "public/_routes.json" ]; then
    echo "Removing duplicate routes.json..."
    rm "public/_routes.json"
  fi
fi

# Update tsconfig.json with stricter settings
if [ -f "tsconfig.json" ]; then
  echo "Updating tsconfig.json with stricter type checking..."
  # This is a simplified approach; in reality you might want to use jq for proper JSON manipulation
  # We're using a temp file to avoid issues with redirecting to the same file
  cat > tsconfig.json.new << 'EOL'
{
  "compilerOptions": {
    "target": "es2015",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "incremental": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "~/*": ["./app/*"],
      "@components/*": ["./components/*"],
      "@lib/*": ["./lib/*"],
      "@context/*": ["./context/*"]
    },
    "downlevelIteration": true,
    "baseUrl": "."
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
EOL
  mv tsconfig.json.new tsconfig.json
  echo "tsconfig.json updated with stricter type configurations"
fi

# Step 5: Standardize on Supabase auth
echo "Standardizing Supabase authentication..."

# Create an improved version of the Supabase client
mkdir -p lib
cat > lib/supabase-client.ts << 'EOL'
import { createClient } from '@supabase/supabase-js';

// Read environment variables with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a conditional client that only initializes with valid credentials
const createSupabaseClient = () => {
  // Check if we're in a build environment without proper env vars
  if (typeof window === 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    // Return a mock client during build
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            data: null,
            error: null
          }),
          data: null,
          error: null
        }),
      }),
    };
  }

  // Create a real client for runtime
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

export const supabase = createSupabaseClient();
EOL
echo "Created improved lib/supabase-client.ts"

# Step 6: Create .env.local template if it doesn't exist
if [ ! -f ".env.local" ]; then
  echo "Creating .env.local template..."
  cat > .env.local << 'EOL'
# Supabase - Replace with your own values
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EOL
  echo ".env.local template created"
fi

# Step 7: Update wrangler.toml to use environment variables
if [ -f "wrangler.toml" ]; then
  echo "Updating wrangler.toml..."
  cat > wrangler.toml << 'EOL'
name = "sample-exchange"
compatibility_date = "2023-12-01"

# Configure static site
[site]
bucket = "./out"

# Configure build
[build]
command = "npm run build"
output_directory = "out"

# Environment variables should be configured in Cloudflare dashboard
# [vars]
# Do not store sensitive values here
EOL
  echo "wrangler.toml updated to use environment variables from Cloudflare dashboard"
fi

# Step 8: Create a polyfill cleanup
echo "Standardizing polyfills..."

mkdir -p lib
cat > lib/polyfills.js << 'EOL'
// Standard polyfills for browser-only APIs in Node.js environment
if (typeof window === 'undefined') {
  global.window = global;
  global.self = global;
  global.document = {
    createElement: () => ({}),
    getElementsByTagName: () => [],
    querySelector: () => null,
  };
  global.navigator = {
    userAgent: 'node',
    platform: process.platform,
  };
  global.location = { href: '', protocol: 'https:', host: '' };
}
EOL
echo "Created standardized lib/polyfills.js"

# Step 9: Create a README.md with cleanup instructions for manual steps
echo "Creating cleanup instructions README..."

cat > CLEANUP-INSTRUCTIONS.md << 'EOL'
# Manual Cleanup Tasks

The automated script has completed, but the following items need manual attention:

## 1. Update Imports

Update all imports to use the new path aliases:
- `@components/` for components
- `@lib/` for utilities
- `@context/` for context providers

## 2. Choose Between Duplicate Components

Several components exist in multiple locations. Choose the most complete version:
- `ImageWithFallback.tsx`
- `ContactForm.tsx`
- And others...

## 3. Styling Consolidation

Gradually migrate component-specific CSS to Tailwind classes:
- `app/login/login.css`
- `app/team/team.css`
- `app/contact/contact.css`

## 4. Authentication Standardization

Remove the custom `AuthContext.tsx` and standardize on the Supabase implementation.

## 5. Component Structure

Organize components into the provided structure:
- `/components/ui` - Basic UI components
- `/components/form` - Form components
- `/components/layout` - Layout components
- `/components/providers` - Context providers
- `/components/features` - Feature-specific components

## 6. Clean Obsolete Files

After confirming everything works, remove:
- `app/components/` (now in /components)
- `app/context/` (now in /context)
- `app/lib/` (now in /lib)

## 7. Testing

Test all functionality to ensure nothing broke during reorganization.
EOL
echo "Created CLEANUP-INSTRUCTIONS.md with manual cleanup steps"

# Step 10: Updating package.json scripts
if [ -f "package.json" ]; then
  echo "Updating package.json scripts..."
  # In a real script, you would use jq for proper JSON manipulation
  # This is a simplified approach
  cat > package.json.new << 'EOL'
{
  "name": "sample-exchange",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "prebuild": "echo 'Skipping TypeScript check for build'",
    "build": "NEXT_TELEMETRY_DISABLED=1 next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{js,ts,tsx,json,md}\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@remix-run/node": "^2.16.2",
    "@remix-run/react": "^2.16.2",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/auth-helpers-react": "^0.4.2",
    "@supabase/supabase-js": "^2.39.0",
    "leaflet": "^1.9.4",
    "next": "14.0.4",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-leaflet": "^4.2.1",
    "react-toastify": "9.1.3"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8",
    "@types/node": "20.10.4",
    "@types/react": "18.2.42",
    "@types/react-dom": "18.2.17",
    "autoprefixer": "10.4.16",
    "eslint": "8.55.0",
    "eslint-config-next": "14.0.4",
    "postcss": "8.4.32",
    "prettier": "^3.0.0",
    "tailwindcss": "3.3.6",
    "typescript": "5.3.3"
  }
}
EOL
  # Check if the file is different before replacing
  if ! cmp -s package.json package.json.new; then
    mv package.json.new package.json
    echo "package.json updated with improved scripts and added prettier"
  else
    rm package.json.new
  fi
fi

# Step 11: Create a .prettierrc for consistent formatting
echo "Creating .prettierrc for consistent formatting..."
cat > .prettierrc << 'EOL'
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
EOL
echo ".prettierrc created for consistent code formatting"

echo "Codebase cleanup script completed!"
echo "Please review the CLEANUP-INSTRUCTIONS.md file for manual steps."
echo "Run 'npm install' to ensure all dependencies are updated."
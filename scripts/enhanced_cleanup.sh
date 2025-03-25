#!/bin/bash

# Enhanced Cleanup Script for Next.js + Supabase + Cloudflare Pages project
# WARNING: This script makes significant changes to your codebase
# Make sure to have a complete backup before running

set -euo pipefail

echo "Starting enhanced codebase cleanup..."

# Step 1: Create a backup
echo "Creating backup..."
BACKUP_DIR="../samplex-backup-$(date +%Y%m%d%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR"
echo "Backup created at $BACKUP_DIR"

# Step 2: Consolidate scripts
echo "Consolidating scripts..."

# Create a single scripts directory
mkdir -p scripts

# Move all .sh files to scripts directory except this one
for script in *.sh; do
  if [ "$script" != "cleanup-enhanced.sh" ]; then
    echo "Moving $script to scripts directory..."
    mv "$script" "scripts/"
  fi
done

# Create a single build script
cat > scripts/build.sh << 'EOL'
#!/bin/bash
# Unified build script for Sample Exchange

set -euo pipefail

# Build configuration
export NEXT_TELEMETRY_DISABLED=1

# Clean previous build
rm -rf .next out

# Build for production
echo "Building Next.js application..."
npm run build

# Output success message
echo "Build completed successfully!"
echo "Output files are in the 'out' directory"
EOL
chmod +x scripts/build.sh

echo "Created unified build script at scripts/build.sh"

# Step 3: Choose one architecture (App Router)
echo "Standardizing on App Router architecture..."

# If using pages/ directory, we need to migrate components
if [ -d "pages" ]; then
  echo "Found 'pages' directory - migrating to App Router structure..."
  
  # Create a backup of pages
  mkdir -p "scripts/migration-backup"
  cp -r pages "scripts/migration-backup/"
  
  # For now, we'll keep the pages directory but mark it as deprecated
  echo "# DEPRECATED - Use App Router instead" > pages/README.md
fi

# Step 4: Properly organize directories
echo "Reorganizing project structure..."

# Create proper structure
mkdir -p components/{ui,form,layout,providers,features}
mkdir -p lib/{utils,services,hooks,api}
mkdir -p context
mkdir -p types
mkdir -p public/assets/{images,videos,icons}
mkdir -p app/_components  # App-specific components

# Step 5: Clean up app directory
echo "Cleaning up app directory..."

# Move components from app/components to proper locations
if [ -d "app/components" ]; then
  echo "Moving app/components to root components directory..."
  
  # Check for UI components and move them
  find app/components -name "*.tsx" -type f -exec cp {} components/ui/ \;
  
  # Move form components
  find app/components -name "*Form*.tsx" -type f -exec cp {} components/form/ \;
  
  # Create a record of the move
  find app/components -name "*.tsx" -type f > scripts/moved-components.txt
  
  # Don't delete yet, we'll mark it
  echo "# DEPRECATED - Components moved to /components directory" > app/components/README.md
fi

# Move context files
if [ -d "app/context" ]; then
  echo "Moving app/context to root context directory..."
  cp -r app/context/* context/
  echo "# DEPRECATED - Context moved to /context directory" > app/context/README.md
fi

# Move lib files
if [ -d "app/lib" ]; then
  echo "Moving app/lib to root lib directory..."
  cp -r app/lib/* lib/
  echo "# DEPRECATED - Lib moved to /lib directory" > app/lib/README.md
fi

# Step 6: Remove backup and temporary files
echo "Cleaning up temporary and backup files..."

# List of patterns to find backup files
BACKUP_PATTERNS=(
  "*.old"
  "*.backup"
  "*.bak"
  "*-old.*"
  "*-backup.*"
)

# Find and remove backup files
for pattern in "${BACKUP_PATTERNS[@]}"; do
  find . -name "$pattern" -type f | while read -r file; do
    echo "Removing backup file: $file"
    rm "$file"
  done
done

# Step 7: Clean up root directory
echo "Cleaning up root directory..."

# Files to remove from root
ROOT_FILES_TO_CLEAN=(
  ".DS_Store"
  "npm-debug.log"
  "yarn-debug.log"
  "yarn-error.log"
  "*.log"
  "Thumbs.db"
)

for pattern in "${ROOT_FILES_TO_CLEAN[@]}"; do
  find . -maxdepth 1 -name "$pattern" -type f | while read -r file; do
    echo "Removing file from root: $file"
    rm "$file"
  done
done

# Step 8: Update configuration files
echo "Updating configuration files..."

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
};

module.exports = nextConfig;
EOL
  echo "next.config.js updated with optimized config"
fi

# Update tsconfig.json
if [ -f "tsconfig.json" ]; then
  echo "Updating tsconfig.json..."
  cat > tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "es2015",
    "lib": ["dom", "dom.iterable", "esnext"],
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
      "@context/*": ["./context/*"],
      "@types/*": ["./types/*"]
    },
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "scripts/migration-backup"]
}
EOL
  echo "tsconfig.json updated with improved configurations"
fi

# Update package.json
if [ -f "package.json" ]; then
  echo "Updating package.json scripts..."
  
  # Use a temporary file for the new package.json
  cat > package.json.new << 'EOL'
{
  "name": "sample-exchange",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "NEXT_TELEMETRY_DISABLED=1 next build",
    "start": "next start",
    "lint": "next lint --fix",
    "format": "prettier --write \"**/*.{js,ts,tsx,json,md,css}\"",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .next out",
    "deploy": "scripts/build.sh && wrangler pages deploy out"
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
    echo "package.json updated with improved scripts"
  else
    rm package.json.new
  fi
fi

# Step 9: Create standardized lib files
echo "Creating standardized library files..."

# Create supabase client
mkdir -p lib/supabase
cat > lib/supabase/client.ts << 'EOL'
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
    } as any;
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
echo "Created standardized Supabase client at lib/supabase/client.ts"

# Create standardized polyfills
mkdir -p lib/polyfills
cat > lib/polyfills/index.js << 'EOL'
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
echo "Created standardized polyfills at lib/polyfills/index.js"

# Step 10: Create proper README and documentation
echo "Creating documentation..."

# Create main README.md
cat > README.md << 'EOL'
# Sample Exchange

A Next.js application for scientific sample exchange, built with Supabase and deployed on Cloudflare Pages.

## Project Structure

- `/app` - Next.js App Router pages and routes
- `/components` - Reusable React components
  - `/ui` - Basic UI components
  - `/form` - Form components
  - `/layout` - Layout components
  - `/providers` - Context providers
  - `/features` - Feature-specific components
- `/lib` - Utility functions and services
  - `/supabase` - Supabase client and utilities
  - `/utils` - Helper functions
  - `/hooks` - Custom React hooks
  - `/api` - API client functions
- `/context` - React Context providers
- `/types` - TypeScript type definitions
- `/public` - Static assets

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables: Copy `.env.example` to `.env.local` and fill in your values
3. Start development server: `npm run dev`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types
- `npm run deploy` - Build and deploy to Cloudflare Pages

## Environment Variables

Create a `.env.local` file with the following variables:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

## Deployment

This project is deployed on Cloudflare Pages.
EOL
echo "Created new README.md"

# Create .env.example
cat > .env.example << 'EOL'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EOL
echo "Created .env.example"

# Step 11: Fix remaining issues that require manual review
echo "Creating cleanup instructions for manual steps..."

cat > MANUAL-CLEANUP.md << 'EOL'
# Manual Cleanup Tasks

The automated script has completed, but the following items need manual attention:

## 1. Critical Tasks

1. **Update Imports**: Change all imports to use the new path aliases:
   - `@components/` instead of relative paths or app/components imports
   - `@lib/` instead of app/lib imports
   - `@context/` instead of app/context imports

2. **Remove Redundant Files**:
   - app/_app.tsx (should only exist in pages/ in the Pages Router)
   - app/root.tsx (non-standard for Next.js)
   - Any other backup or temporary files

3. **Fix CSS Organization**:
   - Move styles in app/*.css files to Tailwind classes
   - Or consolidate into dedicated component-level CSS modules

4. **Remove Backup Files**:
   - Delete any `.old`, `.bak`, or `.backup` files not caught by the script

## 2. Architecture Decisions

1. **Decide on App Router vs Pages Router**:
   - The script has standardized on App Router
   - Review any pages/ files and migrate them to app/ if needed
   - Once migration is complete, remove the pages/ directory

2. **Authentication Strategy**:
   - Standardize on Supabase Auth
   - Replace any custom auth implementations
   - Update components that use custom auth to use Supabase auth

## 3. Component Organization

1. **Organize components into proper categories**:
   - Basic UI components → components/ui/
   - Forms → components/form/
   - Layout → components/layout/
   - Feature-specific → components/features/
   - App-specific → app/_components/

2. **Remove duplicate components**:
   - ImageWithFallback.tsx
   - ContactForm.tsx
   - Navigation.tsx
   - And others...

## 4. Testing

After making all changes:

1. Run the application locally to test all functionality
2. Check that all routes work properly
3. Verify authentication flows
4. Test the build process
5. Test deployment to Cloudflare Pages

## 5. Documentation

1. Update README.md with any additional project-specific information
2. Document any custom scripts or workflows
3. Add inline documentation to complex components
EOL
echo "Created MANUAL-CLEANUP.md with comprehensive instructions"

# Create .prettierrc for consistent formatting
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

# Create .eslintrc.js with good defaults
echo "Creating .eslintrc.js with recommended settings..."
cat > .eslintrc.js << 'EOL'
module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off', // Next.js doesn't require React import
    'react/prop-types': 'off', // Use TypeScript types instead
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
EOL
echo ".eslintrc.js created with recommended settings"

echo "Enhanced codebase cleanup script completed!"
echo "Please review the MANUAL-CLEANUP.md file for the next steps."
echo "It's strongly recommended to run: npm install && npm run lint && npm run format"
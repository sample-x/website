# Deploying Sample Exchange to Cloudflare Pages

This guide covers how to deploy the Sample Exchange application to Cloudflare Pages with Supabase integration.

## Overview

The application is set up to run in two modes:
1. **Dynamic mode** - with full Supabase integration for samples data, authentication, and uploads
2. **Static mode** - running entirely from static files when deployed on Cloudflare Pages

## Deployment Steps

### 1. Prerequisites

- A Cloudflare account with Pages enabled
- A Supabase project set up with the required tables:
  - `samples` - for storing sample data
  - Auth configuration for Google login

### 2. Environment Variables

Set the following environment variables in your Cloudflare Pages project:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Build Settings

In your Cloudflare Pages project, set the following build settings:

- **Framework preset**: Next.js
- **Build command**: `./build-static.sh`
- **Build output directory**: `out`
- **Node.js version**: 18.x or higher (specified in `.nvmrc`)

## Static Mode Features

When running in static mode (on Cloudflare Pages), the application:

1. **Maps**: Displays a static representation of the map with sample locations
2. **Samples**: Loads sample data from a static JSON file
3. **Authentication**: Shows demo-mode notices on login/register pages
4. **Uploads**: Simulates uploads without actually storing data

## File Structure Overview

Key files related to static deployment:

- `lib/supabase-client.ts` - Safer Supabase client with fallback for static mode
- `app/lib/staticData.ts` - Helper functions for static data and detecting static mode
- `build-static.sh` - Build script for generating static export
- `_routes.json` - Route configuration for Cloudflare Pages

## Testing Locally

To test the static export locally:

```bash
# Set environment variables with dummy values
NEXT_PUBLIC_SUPABASE_URL=https://example.com NEXT_PUBLIC_SUPABASE_ANON_KEY=example-key ./build-static.sh

# Serve the built files
npx serve out
```

## Troubleshooting

### Common Issues

1. **Map not displaying**: Leaflet maps are loaded dynamically in the browser to avoid SSR issues
2. **Auth not working**: Authentication is simulated in static mode
3. **API routes not working**: API routes require server-side execution and don't work in static mode

### Debug Mode

The app includes a debug page at `/debug` that shows:
- Current running mode (static or dynamic)
- Supabase connection status
- Environment variables (safe to display)

## Production Setup

For production deployments, ensure:

1. Your Supabase security rules are properly configured
2. CORS settings in Supabase allow your Cloudflare Pages domain
3. Environment variables are correctly set in Cloudflare Pages dashboard

## Development Workflow

When developing features, consider both operating modes:

1. Add `isStaticExport()` checks when using Supabase directly
2. Provide fallback UI or data for static mode
3. Use the pattern in `lib/supabase-client.ts` for handling errors gracefully 
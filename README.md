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

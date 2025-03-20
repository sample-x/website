# SampleX Frontend

This is the frontend application for SampleX, built with Next.js.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy assets to the public directory:
   ```bash
   bash ../copy-assets.sh
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Start the production server:
   ```bash
   npm start
   ```

## Project Structure

- `app/` - Next.js app directory containing all pages and components
- `public/` - Static assets like images and videos
- `app/api/` - API routes for server-side functionality

## Environment Variables

Create a `.env.local` file with the following variables:

NEXT_PUBLIC_BACKEND_URL=http://localhost:3001 
/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Enable static export for Cloudflare Pages
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  
  // Skip trailing slash redirect
  skipTrailingSlashRedirect: true,
  
  // Images configuration for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'znmkkduvzzmoxzgthwby.supabase.co',
      },
    ],
    domains: ['tile.openstreetmap.org'],
  },
  
  // Handle dynamic routes
  trailingSlash: true,
  
  // Disable server API routes in static export
  experimental: {
    // This property is no longer needed in newer Next.js versions
    // but keeping it for backwards compatibility
    appDir: true,
  },
  
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

  // Environment variables are now managed through .env.local
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;

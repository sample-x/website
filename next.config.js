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

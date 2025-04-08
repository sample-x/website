/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Configure for static export
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  
  // Skip trailing slash redirect for better edge caching
  skipTrailingSlashRedirect: true,
  
  // Static export configuration
  staticPageGenerationTimeout: 300,
  
  // Images configuration for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: ['tile.openstreetmap.org'],
  },
  
  // Handle dynamic routes
  trailingSlash: true,
  
  // TypeScript configuration
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '~': path.resolve(__dirname, './app'),
      '@components': path.resolve(__dirname, './components'),
      '@lib': path.resolve(__dirname, './lib'),
      '@context': path.resolve(__dirname, './context'),
    };
    
    return config;
  },
};

module.exports = nextConfig;

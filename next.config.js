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
        hostname: '**',
      },
    ],
    domains: ['tile.openstreetmap.org'],
  },
  
  // Handle dynamic routes
  trailingSlash: true,
  
  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          lib: {
            test(module) {
              return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier());
            },
            name(module) {
              // Simple hash based on module identifier
              const moduleId = module.identifier();
              const hash = Array.from(moduleId).reduce((acc, char) => {
                return (acc << 5) - acc + char.charCodeAt(0) >>> 0;
              }, 0);
              return `chunk-${hash.toString(16).slice(0, 8)}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      },
    };

    // Handle browser APIs in Node environment
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Path aliases
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

  // Environment variables are now managed through .env.local
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;

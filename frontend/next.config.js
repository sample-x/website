/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://localhost:3001/:path*', // Adjusted to match your backend API structure
      },
    ];
  },
}

module.exports = nextConfig 
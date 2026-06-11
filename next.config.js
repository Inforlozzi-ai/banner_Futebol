/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.api-sports.io' },
      { protocol: 'https', hostname: 'media-2.api-sports.io' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['canvas', 'sharp'],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['undici'],
  },
  webpack(config) {
    config.externals.push('undici');
    return config;
  }
};

module.exports = nextConfig;

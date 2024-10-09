/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['assets.example.com'],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
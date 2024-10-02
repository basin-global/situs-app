/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['assets.example.com'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Remove the env section unless you have a specific reason to keep it
};

export default nextConfig;
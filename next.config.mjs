/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['assets.example.com'],
    unoptimized: true,
  },
};

export default nextConfig;

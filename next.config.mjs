/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'assets.example.com', 
      'cdn.simplehash.com',
      'openseauserdata.com',
      'i.seadn.io',
      'ipfs.io',
      'nft-cdn.alchemy.com',
      'metadata.ens.domains',
      'storage.googleapis.com',
      'arweave.net',
      'cloudflare-ipfs.com'
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  },
};

export default nextConfig;

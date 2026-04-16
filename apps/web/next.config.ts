import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@koblio/ui', '@koblio/shared'],
};

export default nextConfig;

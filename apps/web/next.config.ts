import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@koblio/shared', '@koblio/ui'],
};

export default nextConfig;

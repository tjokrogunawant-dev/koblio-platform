import path from 'path';
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Trace from monorepo root so @koblio/shared and @koblio/ui are included
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@koblio/shared', '@koblio/ui'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});

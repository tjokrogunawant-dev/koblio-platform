export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  auth0Domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? '',
  auth0ClientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? '',
  auth0Audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE ?? '',
} as const;

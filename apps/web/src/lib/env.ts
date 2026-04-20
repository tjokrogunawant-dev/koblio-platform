export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  auth0Domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? '',
  auth0ClientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const;

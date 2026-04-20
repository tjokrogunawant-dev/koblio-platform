export const env = {
  auth0: {
    domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? '',
    clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? '',
  },
  api: {
    url: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  },
} as const;

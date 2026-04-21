describe('env config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses defaults when env vars are not set', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    const { env } = await import('@/lib/env');
    expect(env.apiUrl).toBe('http://localhost:3001');
  });

  it('reads NEXT_PUBLIC_API_URL from environment', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    const { env } = await import('@/lib/env');
    expect(env.apiUrl).toBe('https://api.example.com');
  });
});

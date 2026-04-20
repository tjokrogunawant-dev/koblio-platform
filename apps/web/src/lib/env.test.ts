import { describe, expect, it } from 'vitest';

import { env } from './env';

describe('env', () => {
  it('provides default apiUrl', () => {
    expect(env.apiUrl).toBe('http://localhost:3001');
  });

  it('provides default appUrl', () => {
    expect(env.appUrl).toBe('http://localhost:3000');
  });

  it('has auth0 fields defined', () => {
    expect(typeof env.auth0Domain).toBe('string');
    expect(typeof env.auth0ClientId).toBe('string');
  });
});

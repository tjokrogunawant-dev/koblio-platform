import { describe, expect, it } from 'vitest';

import { env } from '../env';

describe('env configuration', () => {
  it('exports api url with default', () => {
    expect(env.api.url).toBe('http://localhost:3001');
  });

  it('exports app url with default', () => {
    expect(env.app.url).toBe('http://localhost:3000');
  });

  it('exports auth0 config structure', () => {
    expect(env.auth0).toHaveProperty('domain');
    expect(env.auth0).toHaveProperty('clientId');
  });
});

import { ConfigService } from '@nestjs/config';
import { UserRole } from '@koblio/shared';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn(() => (_req: unknown, _header: unknown, cb: (err: null, key: string) => void) => cb(null, 'test-key')),
}));

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn((key: string) => {
        const config: Record<string, string> = {
          AUTH0_ISSUER_URL: 'https://test.auth0.com/',
          AUTH0_AUDIENCE: 'https://api.koblio.com',
        };
        return config[key];
      }),
      get: jest.fn((key: string, defaultValue: string) => {
        if (key === 'AUTH0_ROLES_NAMESPACE') return 'https://koblio.com/roles';
        return defaultValue;
      }),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);
  });

  describe('validate', () => {
    it('should extract user from standard roles claim', () => {
      const payload: JwtPayload = {
        sub: 'auth0|user123',
        email: 'parent@example.com',
        roles: [UserRole.PARENT],
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'auth0|user123',
        email: 'parent@example.com',
        roles: ['parent'],
      });
    });

    it('should extract roles from Auth0 namespaced claim', () => {
      const payload = {
        sub: 'auth0|teacher456',
        email: 'teacher@school.edu',
        'https://koblio.com/roles': ['teacher'],
      } as Record<string, unknown>;

      const result = strategy.validate(payload as never);

      expect(result).toEqual({
        userId: 'auth0|teacher456',
        email: 'teacher@school.edu',
        roles: ['teacher'],
      });
    });

    it('should return empty roles when none present', () => {
      const payload = {
        sub: 'auth0|noRoles',
      };

      const result = strategy.validate(payload as never);

      expect(result).toEqual({
        userId: 'auth0|noRoles',
        email: undefined,
        roles: [],
      });
    });

    it('should handle student without email (COPPA compliance)', () => {
      const payload = {
        sub: 'auth0|student789',
        roles: ['student'],
      };

      const result = strategy.validate(payload as never);

      expect(result).toEqual({
        userId: 'auth0|student789',
        email: undefined,
        roles: ['student'],
      });
      expect(result.email).toBeUndefined();
    });
  });
});

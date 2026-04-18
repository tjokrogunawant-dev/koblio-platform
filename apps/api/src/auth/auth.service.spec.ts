import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                AUTH0_ISSUER_URL: 'https://test.auth0.com/',
                AUTH0_AUDIENCE: 'https://api.koblio.com',
                AUTH0_CLIENT_ID: 'test-client-id',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('getStatus', () => {
    it('should return operational status', () => {
      expect(service.getStatus()).toEqual({
        module: 'auth',
        status: 'operational',
      });
    });
  });

  describe('validateUserRoles', () => {
    it('should return true when user has required role', () => {
      const user: AuthenticatedUser = {
        userId: '1',
        roles: ['teacher'],
      };
      expect(service.validateUserRoles(user, ['teacher'])).toBe(true);
    });

    it('should return false when user lacks required role', () => {
      const user: AuthenticatedUser = {
        userId: '1',
        roles: ['student'],
      };
      expect(service.validateUserRoles(user, ['teacher'])).toBe(false);
    });

    it('should return true when user has one of multiple roles', () => {
      const user: AuthenticatedUser = {
        userId: '1',
        roles: ['parent'],
      };
      expect(service.validateUserRoles(user, ['teacher', 'parent'])).toBe(
        true,
      );
    });
  });

  describe('isStudentAccount', () => {
    it('should return true for student without email', () => {
      const user: AuthenticatedUser = {
        userId: '1',
        roles: ['student'],
      };
      expect(service.isStudentAccount(user)).toBe(true);
    });

    it('should return false for student with email', () => {
      const user: AuthenticatedUser = {
        userId: '1',
        email: 'student@example.com',
        roles: ['student'],
      };
      expect(service.isStudentAccount(user)).toBe(false);
    });

    it('should return false for non-student role', () => {
      const user: AuthenticatedUser = {
        userId: '1',
        roles: ['parent'],
      };
      expect(service.isStudentAccount(user)).toBe(false);
    });
  });

  describe('getAuth0Config', () => {
    it('should return Auth0 configuration', () => {
      const config = service.getAuth0Config();
      expect(config).toEqual({
        domain: 'https://test.auth0.com/',
        audience: 'https://api.koblio.com',
        clientId: 'test-client-id',
      });
    });
  });
});

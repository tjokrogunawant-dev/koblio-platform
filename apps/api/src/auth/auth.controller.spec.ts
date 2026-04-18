import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => `test-${key}`),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('getStatus', () => {
    it('should return auth module status', () => {
      const result = controller.getStatus();
      expect(result).toEqual({ module: 'auth', status: 'operational' });
    });
  });

  describe('getMe', () => {
    it('should return authenticated user info', () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|123',
        email: 'parent@example.com',
        roles: ['parent'],
      };

      const result = controller.getMe(user);

      expect(result).toEqual({
        userId: 'auth0|123',
        email: 'parent@example.com',
        roles: ['parent'],
      });
    });

    it('should return student user without email (COPPA)', () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|student1',
        roles: ['student'],
      };

      const result = controller.getMe(user);

      expect(result.email).toBeUndefined();
      expect(result.roles).toEqual(['student']);
    });
  });

  describe('adminCheck', () => {
    it('should return admin confirmation', () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|admin1',
        email: 'admin@koblio.com',
        roles: ['admin'],
      };

      const result = controller.adminCheck(user);

      expect(result).toEqual({ admin: true, userId: 'auth0|admin1' });
    });
  });

  describe('teacherCheck', () => {
    it('should return teacher confirmation', () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|teacher1',
        email: 'teacher@school.edu',
        roles: ['teacher'],
      };

      const result = controller.teacherCheck(user);

      expect(result).toEqual({ teacher: true, userId: 'auth0|teacher1' });
    });
  });
});

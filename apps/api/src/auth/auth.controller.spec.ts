import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

function mockResponse() {
  const res = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as import('express').Response;
}

function mockRequest(cookies: Record<string, string> = {}) {
  return { cookies } as unknown as import('express').Request;
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Record<string, jest.Mock>;

  beforeEach(async () => {
    authService = {
      getStatus: jest.fn().mockReturnValue({
        module: 'auth',
        status: 'operational',
      }),
      registerParent: jest.fn(),
      registerTeacher: jest.fn(),
      login: jest.fn(),
      studentLogin: jest.fn(),
      resolveClassCode: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn().mockResolvedValue(undefined),
      validateUserRoles: jest.fn(),
      isStudentAccount: jest.fn(),
      getAuth0Config: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('getStatus', () => {
    it('should return auth module status', () => {
      expect(controller.getStatus()).toEqual({
        module: 'auth',
        status: 'operational',
      });
    });
  });

  describe('registerParent', () => {
    const dto = {
      email: 'alice@example.com',
      password: 'Str0ngP@ss',
      name: 'Alice Zhang',
      country: 'SG',
    };

    it('should register parent and set refresh cookie', async () => {
      const res = mockResponse();
      authService.registerParent.mockResolvedValue({
        authResult: {
          access_token: 'at-123',
          expires_in: 900,
          user: { id: 'uuid-1', role: 'parent', name: 'Alice Zhang' },
        },
        refreshToken: 'rt-123',
      });

      const result = await controller.registerParent(dto, res);

      expect(result.access_token).toBe('at-123');
      expect(result.user.role).toBe('parent');
      expect(res.cookie).toHaveBeenCalledWith(
        'koblio_refresh',
        'rt-123',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/auth',
        }),
      );
    });

    it('should propagate ConflictException for duplicate email', async () => {
      const res = mockResponse();
      authService.registerParent.mockRejectedValue(
        new ConflictException('Email already registered'),
      );

      await expect(controller.registerParent(dto, res)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('registerTeacher', () => {
    const dto = {
      email: 'teacher@school.edu',
      password: 'T3ach3r!',
      name: 'Jane Smith',
      school_name: 'Springfield Elementary',
    };

    it('should register teacher and set refresh cookie', async () => {
      const res = mockResponse();
      authService.registerTeacher.mockResolvedValue({
        authResult: {
          access_token: 'at-teacher',
          expires_in: 900,
          user: { id: 'uuid-t1', role: 'teacher', name: 'Jane Smith' },
        },
        refreshToken: 'rt-teacher',
      });

      const result = await controller.registerTeacher(dto, res);

      expect(result.access_token).toBe('at-teacher');
      expect(res.cookie).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto = {
      kind: 'email' as const,
      email: 'alice@example.com',
      password: 'Str0ngP@ss',
    };

    it('should login and set refresh cookie', async () => {
      const res = mockResponse();
      authService.login.mockResolvedValue({
        authResult: {
          access_token: 'at-login',
          expires_in: 900,
          user: { id: 'uuid-1', role: 'parent', name: 'Alice' },
        },
        refreshToken: 'rt-login',
      });

      const result = await controller.login(dto, res);

      expect(result.access_token).toBe('at-login');
      expect(res.cookie).toHaveBeenCalledWith(
        'koblio_refresh',
        'rt-login',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('should propagate UnauthorizedException for bad credentials', async () => {
      const res = mockResponse();
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(dto, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh token and update cookie', async () => {
      const req = mockRequest({ koblio_refresh: 'rt-old' });
      const res = mockResponse();
      authService.refresh.mockResolvedValue({
        access_token: 'at-new',
        expires_in: 900,
        newRefreshToken: 'rt-new',
      });

      const result = await controller.refresh(req, res);

      expect(authService.refresh).toHaveBeenCalledWith('rt-old');
      expect(result).toEqual({
        access_token: 'at-new',
        expires_in: 900,
      });
      expect(res.cookie).toHaveBeenCalledWith(
        'koblio_refresh',
        'rt-new',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('should return 401 if no refresh cookie present', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await controller.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 401 }),
      );
    });
  });

  describe('logout', () => {
    it('should revoke token and clear cookie', async () => {
      const req = mockRequest({ koblio_refresh: 'rt-active' });
      const res = mockResponse();

      await controller.logout(req, res);

      expect(authService.logout).toHaveBeenCalledWith('rt-active');
      expect(res.clearCookie).toHaveBeenCalledWith('koblio_refresh', {
        path: '/api/auth',
      });
    });

    it('should handle logout with no cookie gracefully', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await controller.logout(req, res);

      expect(authService.logout).toHaveBeenCalledWith(undefined);
      expect(res.clearCookie).toHaveBeenCalled();
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

      expect(controller.adminCheck(user)).toEqual({
        admin: true,
        userId: 'auth0|admin1',
      });
    });
  });

  describe('teacherCheck', () => {
    it('should return teacher confirmation', () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|teacher1',
        email: 'teacher@school.edu',
        roles: ['teacher'],
      };

      expect(controller.teacherCheck(user)).toEqual({
        teacher: true,
        userId: 'auth0|teacher1',
      });
    });
  });

  describe('loginStudent', () => {
    const dto = {
      kind: 'student' as const,
      username: 'bobby1234',
      password: 'secret123',
    };

    it('should login student and set refresh cookie', async () => {
      const res = mockResponse();
      authService.studentLogin.mockResolvedValue({
        authResult: {
          access_token: 'at-student',
          expires_in: 900,
          user: { id: 'uuid-s1', role: 'student', name: 'Bobby Zhang' },
        },
        refreshToken: 'rt-student',
      });

      const result = await controller.loginStudent(dto, res);

      expect(result.access_token).toBe('at-student');
      expect(result.user.role).toBe('student');
      expect(result.user.name).toBe('Bobby Zhang');
      expect(res.cookie).toHaveBeenCalledWith(
        'koblio_refresh',
        'rt-student',
        expect.objectContaining({ httpOnly: true, sameSite: 'strict' }),
      );
    });

    it('should propagate UnauthorizedException for invalid student credentials', async () => {
      const res = mockResponse();
      authService.studentLogin.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.loginStudent(dto, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('resolveClassCode', () => {
    it('should resolve valid class code to classroom info', async () => {
      authService.resolveClassCode.mockResolvedValue({
        classroom: {
          id: 'classroom-1',
          name: 'Math 2A',
          grade: 2,
          class_code: 'SUN-DRAGON-42',
        },
        students: [
          { id: 'student-1', display_name: 'Bobby', username: 'bobby1234' },
        ],
      });

      const result = await controller.resolveClassCode('SUN-DRAGON-42');

      expect(authService.resolveClassCode).toHaveBeenCalledWith('SUN-DRAGON-42');
      expect(result.classroom.name).toBe('Math 2A');
      expect(result.students).toHaveLength(1);
    });

    it('should propagate UnauthorizedException for invalid class code', async () => {
      authService.resolveClassCode.mockRejectedValue(
        new UnauthorizedException('Invalid class code'),
      );

      await expect(
        controller.resolveClassCode('INVALID-99'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('studentCheck', () => {
    it('should return student confirmation', () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|student1',
        roles: ['student'],
      };

      expect(controller.studentCheck(user)).toEqual({
        student: true,
        userId: 'auth0|student1',
      });
    });
  });

  describe('RBAC enforcement', () => {
    it('student user should not have admin/teacher email fields', () => {
      const studentUser: AuthenticatedUser = {
        userId: 'auth0|student1',
        roles: ['student'],
      };

      const meResult = controller.getMe(studentUser);
      expect(meResult.email).toBeUndefined();
      expect(meResult.roles).toEqual(['student']);
    });

    it('each role check endpoint returns the correct role flag', () => {
      const admin: AuthenticatedUser = {
        userId: 'auth0|admin1',
        email: 'admin@koblio.com',
        roles: ['admin'],
      };
      const teacher: AuthenticatedUser = {
        userId: 'auth0|teacher1',
        email: 'teacher@school.edu',
        roles: ['teacher'],
      };
      const student: AuthenticatedUser = {
        userId: 'auth0|student1',
        roles: ['student'],
      };

      expect(controller.adminCheck(admin)).toEqual({
        admin: true,
        userId: 'auth0|admin1',
      });
      expect(controller.teacherCheck(teacher)).toEqual({
        teacher: true,
        userId: 'auth0|teacher1',
      });
      expect(controller.studentCheck(student)).toEqual({
        student: true,
        userId: 'auth0|student1',
      });
    });
  });
});

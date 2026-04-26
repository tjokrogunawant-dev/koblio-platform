import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { ROLES_KEY } from './decorators/roles.decorator';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

function createMockContext(
  user: AuthenticatedUser | undefined,
  handlerRoles: string[] | undefined,
  classRoles?: string[],
) {
  const handler = jest.fn();
  const cls = jest.fn();

  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key, targets) => {
    if (key === ROLES_KEY) {
      return handlerRoles ?? classRoles ?? undefined;
    }
    return undefined;
  });

  const context = {
    getHandler: () => handler,
    getClass: () => cls,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as any;

  return { context, reflector };
}

describe('RBAC Integration — Role Enforcement', () => {
  describe('Student role restrictions', () => {
    it('should allow student to access student-only endpoints', () => {
      const student: AuthenticatedUser = {
        userId: 'uuid-student-1',
        roles: ['student'],
      };
      const { context, reflector } = createMockContext(student, ['student']);
      const guard = new RolesGuard(reflector);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny student access to teacher endpoints (403)', () => {
      const student: AuthenticatedUser = {
        userId: 'uuid-student-1',
        roles: ['student'],
      };
      const { context, reflector } = createMockContext(student, ['teacher']);
      const guard = new RolesGuard(reflector);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny student access to admin endpoints (403)', () => {
      const student: AuthenticatedUser = {
        userId: 'uuid-student-1',
        roles: ['student'],
      };
      const { context, reflector } = createMockContext(student, ['admin']);
      const guard = new RolesGuard(reflector);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny student access to parent endpoints (403)', () => {
      const student: AuthenticatedUser = {
        userId: 'uuid-student-1',
        roles: ['student'],
      };
      const { context, reflector } = createMockContext(student, ['parent']);
      const guard = new RolesGuard(reflector);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('Teacher role restrictions', () => {
    it('should allow teacher to access teacher endpoints', () => {
      const teacher: AuthenticatedUser = {
        userId: 'auth0|teacher1',
        email: 'teacher@school.edu',
        roles: ['teacher'],
      };
      const { context, reflector } = createMockContext(teacher, ['teacher']);
      const guard = new RolesGuard(reflector);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny teacher access to admin-only endpoints (403)', () => {
      const teacher: AuthenticatedUser = {
        userId: 'auth0|teacher1',
        email: 'teacher@school.edu',
        roles: ['teacher'],
      };
      const { context, reflector } = createMockContext(teacher, ['admin']);
      const guard = new RolesGuard(reflector);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny teacher access to student-only endpoints (403)', () => {
      const teacher: AuthenticatedUser = {
        userId: 'auth0|teacher1',
        email: 'teacher@school.edu',
        roles: ['teacher'],
      };
      const { context, reflector } = createMockContext(teacher, ['student']);
      const guard = new RolesGuard(reflector);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('Parent role restrictions', () => {
    it('should allow parent to access parent endpoints', () => {
      const parent: AuthenticatedUser = {
        userId: 'auth0|parent1',
        email: 'parent@example.com',
        roles: ['parent'],
      };
      const { context, reflector } = createMockContext(parent, ['parent']);
      const guard = new RolesGuard(reflector);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny parent access to teacher endpoints (403)', () => {
      const parent: AuthenticatedUser = {
        userId: 'auth0|parent1',
        email: 'parent@example.com',
        roles: ['parent'],
      };
      const { context, reflector } = createMockContext(parent, ['teacher']);
      const guard = new RolesGuard(reflector);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny parent access to admin endpoints (403)', () => {
      const parent: AuthenticatedUser = {
        userId: 'auth0|parent1',
        email: 'parent@example.com',
        roles: ['parent'],
      };
      const { context, reflector } = createMockContext(parent, ['admin']);
      const guard = new RolesGuard(reflector);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('Admin role', () => {
    it('should allow admin to access admin endpoints', () => {
      const admin: AuthenticatedUser = {
        userId: 'auth0|admin1',
        email: 'admin@koblio.com',
        roles: ['admin'],
      };
      const { context, reflector } = createMockContext(admin, ['admin']);
      const guard = new RolesGuard(reflector);

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Multi-role endpoints', () => {
    it('should allow teacher to access teacher+admin endpoints', () => {
      const teacher: AuthenticatedUser = {
        userId: 'auth0|teacher1',
        roles: ['teacher'],
      };
      const { context, reflector } = createMockContext(teacher, ['teacher', 'admin']);
      const guard = new RolesGuard(reflector);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow admin to access teacher+admin endpoints', () => {
      const admin: AuthenticatedUser = {
        userId: 'auth0|admin1',
        roles: ['admin'],
      };
      const { context, reflector } = createMockContext(admin, ['teacher', 'admin']);
      const guard = new RolesGuard(reflector);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny student access to teacher+admin endpoints (403)', () => {
      const student: AuthenticatedUser = {
        userId: 'uuid-student-1',
        roles: ['student'],
      };
      const { context, reflector } = createMockContext(student, ['teacher', 'admin']);
      const guard = new RolesGuard(reflector);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('No roles specified (open to all authenticated)', () => {
    it('should allow any authenticated user when no roles are required', () => {
      const student: AuthenticatedUser = {
        userId: 'uuid-student-1',
        roles: ['student'],
      };
      const { context, reflector } = createMockContext(student, undefined);
      const guard = new RolesGuard(reflector);

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Unauthenticated access', () => {
    it('should throw ForbiddenException when no user and roles required', () => {
      const { context, reflector } = createMockContext(undefined, ['student']);
      const guard = new RolesGuard(reflector);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});

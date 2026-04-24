import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';

function createContext(user?: {
  userId: string;
  roles: string[];
}): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RBAC Integration — Role-based endpoint access', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const studentUser = { userId: 'student-1', roles: ['student'] };
  const parentUser = { userId: 'parent-1', roles: ['parent'] };
  const teacherUser = { userId: 'teacher-1', roles: ['teacher'] };
  const adminUser = { userId: 'admin-1', roles: ['admin'] };

  describe('student cannot access teacher endpoints', () => {
    it('should deny student access to teacher-only endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['teacher']);
      expect(() => guard.canActivate(createContext(studentUser))).toThrow(
        ForbiddenException,
      );
    });

    it('should deny student access to admin-only endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      expect(() => guard.canActivate(createContext(studentUser))).toThrow(
        ForbiddenException,
      );
    });

    it('should deny student access to parent-only endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['parent']);
      expect(() => guard.canActivate(createContext(studentUser))).toThrow(
        ForbiddenException,
      );
    });

    it('should allow student access to student-only endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['student']);
      expect(guard.canActivate(createContext(studentUser))).toBe(true);
    });
  });

  describe('teacher cannot access admin endpoints', () => {
    it('should deny teacher access to admin-only endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      expect(() => guard.canActivate(createContext(teacherUser))).toThrow(
        ForbiddenException,
      );
    });

    it('should allow teacher access to teacher-only endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['teacher']);
      expect(guard.canActivate(createContext(teacherUser))).toBe(true);
    });

    it('should allow teacher access to teacher+admin endpoint', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['teacher', 'admin']);
      expect(guard.canActivate(createContext(teacherUser))).toBe(true);
    });
  });

  describe('parent access restrictions', () => {
    it('should allow parent access to parent-only endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['parent']);
      expect(guard.canActivate(createContext(parentUser))).toBe(true);
    });

    it('should deny parent access to teacher-only endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['teacher']);
      expect(() => guard.canActivate(createContext(parentUser))).toThrow(
        ForbiddenException,
      );
    });

    it('should deny parent access to admin-only endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      expect(() => guard.canActivate(createContext(parentUser))).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('admin has admin-only access', () => {
    it('should allow admin access to admin-only endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      expect(guard.canActivate(createContext(adminUser))).toBe(true);
    });

    it('should deny admin access to student-only endpoint', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['student']);
      expect(() => guard.canActivate(createContext(adminUser))).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('403 returned on unauthorized access', () => {
    it('should throw ForbiddenException (403) when role is insufficient', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      try {
        guard.canActivate(createContext(studentUser));
        fail('Expected ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).getStatus()).toBe(403);
      }
    });

    it('should throw ForbiddenException when no user attached to request', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['teacher']);

      try {
        guard.canActivate(createContext());
        fail('Expected ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).getStatus()).toBe(403);
      }
    });
  });

  describe('unrestricted endpoints allow all roles', () => {
    it.each([studentUser, parentUser, teacherUser, adminUser])(
      'should allow $userId access to unprotected endpoint',
      (user) => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
        expect(guard.canActivate(createContext(user))).toBe(true);
      },
    );
  });
});

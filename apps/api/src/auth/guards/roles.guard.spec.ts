import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function createContext(user?: Record<string, unknown>): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('should allow access when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['teacher']);
    const context = createContext({
      userId: 'user1',
      roles: ['teacher'],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = createContext({
      userId: 'user1',
      roles: ['student'],
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny access when no user present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['teacher']);
    expect(() => guard.canActivate(createContext())).toThrow(
      ForbiddenException,
    );
  });

  it('should allow access when user has one of multiple required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['teacher', 'admin']);
    const context = createContext({
      userId: 'user1',
      roles: ['admin'],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny student access to teacher-only endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['teacher']);
    const context = createContext({
      userId: 'student1',
      roles: ['student'],
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow parent access to parent endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['parent']);
    const context = createContext({
      userId: 'parent1',
      roles: ['parent'],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny student access to admin-only endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = createContext({
      userId: 'student1',
      roles: ['student'],
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow student access to student-only endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['student']);
    const context = createContext({
      userId: 'student1',
      roles: ['student'],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny parent access to teacher-only endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['teacher']);
    const context = createContext({
      userId: 'parent1',
      roles: ['parent'],
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny student access to parent-only endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['parent']);
    const context = createContext({
      userId: 'student1',
      roles: ['student'],
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

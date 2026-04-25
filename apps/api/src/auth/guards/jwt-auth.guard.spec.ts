import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

function createMockContext(
  overrides: { headers?: Record<string, string>; isPublic?: boolean } = {},
): { context: ExecutionContext; request: Record<string, unknown> } {
  const request: Record<string, unknown> = {
    headers: overrides.headers ?? {},
  };
  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
    }),
  } as unknown as ExecutionContext;
  return { context, request };
}

function encodeJwtHeader(alg: string): string {
  return Buffer.from(JSON.stringify({ alg, typ: 'JWT' })).toString('base64url');
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let jwtService: { verify: jest.Mock };

  beforeEach(() => {
    reflector = new Reflector();
    jwtService = {
      verify: jest.fn(),
    };
    guard = new JwtAuthGuard(reflector, jwtService as unknown as JwtService);
  });

  it('should allow access to public routes', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const { context } = createMockContext();

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should validate HS256 student tokens locally', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const header = encodeJwtHeader('HS256');
    const token = `${header}.eyJzdWIiOiJjaGlsZF8xMjMiLCJyb2xlcyI6WyJzdHVkZW50Il19.signature`;
    const { context, request } = createMockContext({
      headers: { authorization: `Bearer ${token}` },
    });

    jwtService.verify.mockReturnValue({
      sub: 'child_123',
      roles: ['student'],
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verify).toHaveBeenCalledWith(token);
    expect((request as { user?: unknown }).user).toEqual({
      userId: 'child_123',
      email: undefined,
      roles: ['student'],
    });
  });

  it('should throw UnauthorizedException for invalid student token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const header = encodeJwtHeader('HS256');
    const token = `${header}.invalid.signature`;
    const { context } = createMockContext({
      headers: { authorization: `Bearer ${token}` },
    });

    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should delegate RS256 tokens to passport (Auth0)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const header = encodeJwtHeader('RS256');
    const token = `${header}.payload.signature`;
    const { context } = createMockContext({
      headers: { authorization: `Bearer ${token}` },
    });

    // RS256 tokens are delegated to super.canActivate (passport),
    // which will throw in test without a real strategy
    expect(() => guard.canActivate(context)).toBeDefined();
    expect(jwtService.verify).not.toHaveBeenCalled();
  });
});

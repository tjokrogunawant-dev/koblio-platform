import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth0ClientService } from './auth0-client.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  };
}

describe('Auth0ClientService', () => {
  let service: Auth0ClientService;

  beforeEach(async () => {
    mockFetch.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Auth0ClientService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                AUTH0_ISSUER_URL: 'https://test.auth0.com/',
                AUTH0_AUDIENCE: 'https://api.koblio.com',
                AUTH0_CLIENT_ID: 'client-id',
                AUTH0_CLIENT_SECRET: 'client-secret',
              };
              return config[key];
            }),
            get: jest.fn(
              (_key: string, defaultVal: string) => defaultVal,
            ),
          },
        },
      ],
    }).compile();

    service = module.get<Auth0ClientService>(Auth0ClientService);
  });

  describe('createUser', () => {
    it('should create user via Auth0 Management API', async () => {
      mockFetch
        .mockResolvedValueOnce(
          jsonResponse(200, {
            access_token: 'mgmt-token',
            expires_in: 86400,
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse(201, {
            user_id: 'auth0|new-user',
            email: 'test@example.com',
            name: 'Test User',
          }),
        );

      const result = await service.createUser(
        'test@example.com',
        'password123',
        'Test User',
        { role: 'parent' },
      );

      expect(result.user_id).toBe('auth0|new-user');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException on 409', async () => {
      mockFetch
        .mockResolvedValueOnce(
          jsonResponse(200, {
            access_token: 'mgmt-token',
            expires_in: 86400,
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse(409, { message: 'User already exists' }),
        );

      await expect(
        service.createUser(
          'existing@example.com',
          'password',
          'User',
          {},
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      mockFetch
        .mockResolvedValueOnce(
          jsonResponse(200, {
            access_token: 'mgmt-token',
            expires_in: 86400,
          }),
        )
        .mockResolvedValueOnce(jsonResponse(500, { error: 'Server error' }));

      await expect(
        service.createUser('test@example.com', 'password', 'User', {}),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate via Resource Owner Password Grant', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(200, {
          access_token: 'at-123',
          refresh_token: 'rt-123',
          token_type: 'Bearer',
          expires_in: 900,
        }),
      );

      const result = await service.authenticateUser(
        'test@example.com',
        'password',
      );

      expect(result.access_token).toBe('at-123');
      expect(result.refresh_token).toBe('rt-123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://test.auth0.com/oauth/token');
      const body = JSON.parse(options.body);
      expect(body.grant_type).toBe('password');
      expect(body.scope).toContain('offline_access');
    });

    it('should throw UnauthorizedException on 401', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(401, { error: 'invalid_grant' }),
      );

      await expect(
        service.authenticateUser('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should exchange refresh token for new access token', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(200, {
          access_token: 'at-new',
          expires_in: 900,
          refresh_token: 'rt-new',
        }),
      );

      const result = await service.refreshToken('rt-old');

      expect(result.access_token).toBe('at-new');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.grant_type).toBe('refresh_token');
      expect(body.refresh_token).toBe('rt-old');
    });

    it('should throw UnauthorizedException on expired token', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(401, { error: 'invalid_grant' }),
      );

      await expect(service.refreshToken('rt-expired')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeRefreshToken', () => {
    it('should call Auth0 revoke endpoint', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(200, {}));

      await service.revokeRefreshToken('rt-to-revoke');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://test.auth0.com/oauth/revoke');
      const body = JSON.parse(options.body);
      expect(body.token).toBe('rt-to-revoke');
    });

    it('should not throw on revocation failure (non-critical)', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(400, { error: 'failed' }));

      await expect(
        service.revokeRefreshToken('rt-invalid'),
      ).resolves.toBeUndefined();
    });
  });

  describe('assignRoles', () => {
    it('should assign roles to user via Management API', async () => {
      mockFetch
        .mockResolvedValueOnce(
          jsonResponse(200, {
            access_token: 'mgmt-token',
            expires_in: 86400,
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse(200, [
            { id: 'role-parent', name: 'parent' },
            { id: 'role-teacher', name: 'teacher' },
          ]),
        )
        .mockResolvedValueOnce(jsonResponse(204, {}));

      await service.assignRoles('auth0|user1', ['parent']);

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});

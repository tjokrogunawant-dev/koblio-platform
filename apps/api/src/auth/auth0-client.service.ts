import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface Auth0TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

interface Auth0UserResponse {
  user_id: string;
  email: string;
  name: string;
  [key: string]: unknown;
}

interface Auth0ManagementToken {
  access_token: string;
  expires_at: number;
}

@Injectable()
export class Auth0ClientService {
  private readonly logger = new Logger(Auth0ClientService.name);
  private readonly domain: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly audience: string;
  private readonly connection: string;
  private managementToken: Auth0ManagementToken | null = null;

  constructor(private readonly configService: ConfigService) {
    this.domain = this.configService.getOrThrow<string>('AUTH0_ISSUER_URL');
    this.clientId = this.configService.getOrThrow<string>('AUTH0_CLIENT_ID');
    this.clientSecret = this.configService.getOrThrow<string>('AUTH0_CLIENT_SECRET');
    this.audience = this.configService.getOrThrow<string>('AUTH0_AUDIENCE');
    this.connection = this.configService.get<string>(
      'AUTH0_DB_CONNECTION',
      'Username-Password-Authentication',
    );
  }

  private get baseUrl(): string {
    return this.domain.endsWith('/') ? this.domain.slice(0, -1) : this.domain;
  }

  private async getManagementToken(): Promise<string> {
    if (this.managementToken && this.managementToken.expires_at > Date.now() + 60_000) {
      return this.managementToken.access_token;
    }

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: `${this.baseUrl}/api/v2/`,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Failed to get management token: ${body}`);
      throw new InternalServerErrorException('Auth provider unavailable');
    }

    const data = (await response.json()) as Auth0TokenResponse;
    this.managementToken = {
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };

    return data.access_token;
  }

  async createUser(
    email: string,
    password: string,
    name: string,
    appMetadata: Record<string, unknown>,
  ): Promise<Auth0UserResponse> {
    const token = await this.getManagementToken();

    const response = await fetch(`${this.baseUrl}/api/v2/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        connection: this.connection,
        email_verified: false,
        app_metadata: appMetadata,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 409) {
      throw new ConflictException('Email already registered');
    }

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Auth0 create user failed: ${body}`);
      throw new InternalServerErrorException('Failed to create account');
    }

    return (await response.json()) as Auth0UserResponse;
  }

  async authenticateUser(email: string, password: string): Promise<Auth0TokenResponse> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'password',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: this.audience,
        username: email,
        password,
        scope: 'openid profile email offline_access',
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 401 || response.status === 403) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Auth0 authentication failed: ${body}`);
      throw new InternalServerErrorException('Authentication service error');
    }

    return (await response.json()) as Auth0TokenResponse;
  }

  async refreshToken(refreshToken: string): Promise<Auth0TokenResponse> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 401 || response.status === 403) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Auth0 token refresh failed: ${body}`);
      throw new InternalServerErrorException('Token refresh failed');
    }

    return (await response.json()) as Auth0TokenResponse;
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/oauth/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        token: refreshToken,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      this.logger.warn(`Auth0 revoke failed (non-critical): ${response.status}`);
    }
  }

  async assignRoles(auth0UserId: string, roles: string[]): Promise<void> {
    const token = await this.getManagementToken();

    const roleIds = await this.getRoleIds(token, roles);
    if (roleIds.length === 0) return;

    const response = await fetch(
      `${this.baseUrl}/api/v2/users/${encodeURIComponent(auth0UserId)}/roles`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles: roleIds }),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Auth0 assign roles failed: ${body}`);
    }
  }

  private async getRoleIds(token: string, roleNames: string[]): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/v2/roles`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return [];

    const allRoles = (await response.json()) as Array<{
      id: string;
      name: string;
    }>;
    return allRoles.filter((r) => roleNames.includes(r.name)).map((r) => r.id);
  }
}

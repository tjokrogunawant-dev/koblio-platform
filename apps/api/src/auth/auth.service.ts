import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly configService: ConfigService) {}

  getStatus() {
    return { module: 'auth', status: 'operational' };
  }

  validateUserRoles(user: AuthenticatedUser, requiredRoles: string[]): boolean {
    return user.roles.some((role) => requiredRoles.includes(role));
  }

  isStudentAccount(user: AuthenticatedUser): boolean {
    return user.roles.includes('student') && !user.email;
  }

  getAuth0Config() {
    return {
      domain: this.configService.getOrThrow<string>('AUTH0_ISSUER_URL'),
      audience: this.configService.getOrThrow<string>('AUTH0_AUDIENCE'),
      clientId: this.configService.getOrThrow<string>('AUTH0_CLIENT_ID'),
    };
  }
}

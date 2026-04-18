import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import {
  AuthenticatedUser,
  JwtPayload,
} from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const issuer = configService.getOrThrow<string>('AUTH0_ISSUER_URL');
    const audience = configService.getOrThrow<string>('AUTH0_AUDIENCE');

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuer}.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience,
      issuer,
      algorithms: ['RS256'],
    });

    this.logger.log('JWT strategy initialized');
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    const rolesNamespace = this.configService.get<string>(
      'AUTH0_ROLES_NAMESPACE',
      'https://koblio.com/roles',
    );

    const roles =
      (payload as unknown as Record<string, unknown>)[rolesNamespace] ??
      payload.roles ??
      [];

    return {
      userId: payload.sub,
      email: payload.email,
      roles: Array.isArray(roles) ? roles : [],
    };
  }
}

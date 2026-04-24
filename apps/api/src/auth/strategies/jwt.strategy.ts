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
    const localSecret = configService.getOrThrow<string>('JWT_SECRET');

    const jwksProvider = passportJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${issuer}.well-known/jwks.json`,
    });

    super({
      secretOrKeyProvider: (
        request: unknown,
        rawJwtToken: string,
        done: (err: unknown, secret?: string | Buffer) => void,
      ) => {
        try {
          const headerB64 = rawJwtToken.split('.')[0];
          const header = JSON.parse(
            Buffer.from(headerB64, 'base64').toString(),
          );
          if (header.alg === 'HS256') {
            done(null, localSecret);
          } else {
            jwksProvider(request, rawJwtToken, done);
          }
        } catch {
          jwksProvider(request, rawJwtToken, done);
        }
      },
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience,
      issuer,
      algorithms: ['RS256', 'HS256'],
    });

    this.logger.log('JWT strategy initialized (dual-mode: JWKS + local)');
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

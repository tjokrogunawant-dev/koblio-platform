import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import {
  AuthenticatedUser,
  JwtPayload,
} from '../interfaces/jwt-payload.interface';
import { LOCAL_JWT_ISSUER } from '../auth.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const issuer = configService.getOrThrow<string>('AUTH0_ISSUER_URL');
    const audience = configService.getOrThrow<string>('AUTH0_AUDIENCE');
    const localSecret = configService.get<string>(
      'JWT_LOCAL_SECRET',
      'koblio-local-dev-secret-change-in-production',
    );

    const jwksProvider = passportJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${issuer}.well-known/jwks.json`,
    });

    super({
      secretOrKeyProvider: (
        req: unknown,
        rawJwtToken: string,
        done: (err: Error | null, secret?: string | Buffer) => void,
      ) => {
        try {
          const headerB64 = rawJwtToken.split('.')[0];
          const header = JSON.parse(
            Buffer.from(headerB64, 'base64url').toString(),
          );

          if (header.alg === 'HS256') {
            done(null, localSecret);
          } else {
            (jwksProvider as Function)(req, rawJwtToken, done);
          }
        } catch (err) {
          done(err as Error);
        }
      },
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience,
      issuer: [issuer, LOCAL_JWT_ISSUER],
      algorithms: ['RS256', 'HS256'],
    });

    this.logger.log('JWT strategy initialized (Auth0 + local student tokens)');
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

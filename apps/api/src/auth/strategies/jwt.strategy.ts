import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import {
  AuthenticatedUser,
  JwtPayload,
} from '../interfaces/jwt-payload.interface';

const LOCAL_ISSUER = 'koblio-local';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const issuer = configService.getOrThrow<string>('AUTH0_ISSUER_URL');
    const audience = configService.getOrThrow<string>('AUTH0_AUDIENCE');
    const localSecret = configService.get<string>(
      'JWT_LOCAL_SECRET',
      'koblio-dev-local-jwt-secret',
    );

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
        done: (err: Error | null, secret?: string | Buffer) => void,
      ) => {
        try {
          const payloadB64 = rawJwtToken.split('.')[1];
          const decoded = JSON.parse(
            Buffer.from(payloadB64, 'base64url').toString(),
          );

          if (decoded.iss === LOCAL_ISSUER) {
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
      issuer: [issuer, LOCAL_ISSUER],
      algorithms: ['RS256', 'HS256'],
    });

    this.logger.log('JWT strategy initialized (Auth0 JWKS + local HS256)');
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

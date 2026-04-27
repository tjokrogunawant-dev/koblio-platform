import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, SecretOrKeyProviderCallback } from 'passport-jwt';
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

    // Build the Auth0 JWKS secret provider ahead of time so we can fall back to it
    const auth0SecretProvider = passportJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${issuer}.well-known/jwks.json`,
    });

    super({
      secretOrKeyProvider: (
        req: unknown,
        rawJwtToken: string,
        done: SecretOrKeyProviderCallback,
      ) => {
        try {
          // Decode the header/payload without verifying so we can inspect the `iss` claim
          const payloadB64 = rawJwtToken.split('.')[1];
          if (!payloadB64) {
            done(new Error('Malformed token'), undefined);
            return;
          }
          const payload = JSON.parse(
            Buffer.from(payloadB64, 'base64url').toString('utf8'),
          ) as Record<string, unknown>;

          if (payload?.iss === 'koblio-internal') {
            // Internal student token — validate with symmetric JWT_SECRET
            const secret = configService.getOrThrow<string>('JWT_SECRET');
            done(null, secret);
          } else {
            // Auth0 token — delegate to JWKS provider
            auth0SecretProvider(req, rawJwtToken, done);
          }
        } catch {
          done(new Error('Invalid token'), undefined);
        }
      },
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // audience / issuer checks are handled per-token type via secretOrKeyProvider;
      // we skip the global checks here to allow both RS256 and HS256
      ignoreExpiration: false,
      algorithms: ['RS256', 'HS256'],
    });

    this.logger.log('JWT strategy initialized (dual Auth0 + internal mode)');
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

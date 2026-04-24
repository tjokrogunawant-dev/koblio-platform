import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  AuthenticatedUser,
  JwtPayload,
} from '../interfaces/jwt-payload.interface';

@Injectable()
export class StudentJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-student',
) {
  private readonly logger = new Logger(StudentJwtStrategy.name);

  constructor(configService: ConfigService) {
    const secret = configService.getOrThrow<string>('JWT_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      issuer: 'koblio-api',
      audience: 'koblio-student',
    });

    this.logger.log('Student JWT strategy initialized');
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      roles: payload.roles ?? [],
    };
  }
}

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractBearerToken(request);

    if (token && this.isLocalStudentToken(token)) {
      return this.validateStudentToken(token, request);
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  private extractBearerToken(request: { headers?: { authorization?: string } }): string | null {
    const auth = request.headers?.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.substring(7);
  }

  private isLocalStudentToken(token: string): boolean {
    try {
      const [headerB64] = token.split('.');
      if (!headerB64) return false;
      const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
      return header.alg === 'HS256';
    } catch {
      return false;
    }
  }

  private validateStudentToken(
    token: string,
    request: { user?: AuthenticatedUser },
  ): boolean {
    try {
      const payload = this.jwtService.verify(token);
      request.user = {
        userId: payload.sub,
        email: payload.email,
        roles: Array.isArray(payload.roles) ? payload.roles : [],
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid student token');
    }
  }
}

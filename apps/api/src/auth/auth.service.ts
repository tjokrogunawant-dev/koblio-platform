import { createHash } from 'crypto';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole as PrismaUserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Auth0ClientService } from './auth0-client.service';
import { RegisterParentDto } from './dto/register-parent.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { EmailLoginDto, StudentLoginDto, ClassCodeLoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
import { LOCAL_JWT_ISSUER } from './constants';

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface AuthResult {
  access_token: string;
  expires_in: number;
  user: {
    id: string;
    role: string;
    email?: string;
    name: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly auth0Client: Auth0ClientService,
  ) {}

  getStatus() {
    return { module: 'auth', status: 'operational' };
  }

  async registerParent(dto: RegisterParentDto): Promise<{
    authResult: AuthResult;
    refreshToken: string;
  }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const auth0User = await this.auth0Client.createUser(
      dto.email,
      dto.password,
      dto.name,
      { role: 'parent' },
    );

    await this.auth0Client.assignRoles(auth0User.user_id, ['parent']);

    const user = await this.prisma.user.create({
      data: {
        auth0Id: auth0User.user_id,
        email: dto.email,
        role: PrismaUserRole.PARENT,
        displayName: dto.name,
        country: dto.country,
        locale: dto.locale,
      },
    });

    this.logger.log(`Parent registered: ${user.id}`);

    const tokens = await this.auth0Client.authenticateUser(
      dto.email,
      dto.password,
    );

    if (tokens.refresh_token) {
      await this.redis.storeRefreshToken(
        user.id,
        this.hashToken(tokens.refresh_token),
        REFRESH_TOKEN_TTL_SECONDS,
      );
    }

    return {
      authResult: {
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        user: {
          id: user.id,
          role: 'parent',
          email: user.email ?? undefined,
          name: user.displayName,
        },
      },
      refreshToken: tokens.refresh_token ?? '',
    };
  }

  async registerTeacher(dto: RegisterTeacherDto): Promise<{
    authResult: AuthResult;
    refreshToken: string;
  }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const auth0User = await this.auth0Client.createUser(
      dto.email,
      dto.password,
      dto.name,
      { role: 'teacher', school_name: dto.school_name },
    );

    await this.auth0Client.assignRoles(auth0User.user_id, ['teacher']);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          auth0Id: auth0User.user_id,
          email: dto.email,
          role: PrismaUserRole.TEACHER,
          displayName: dto.name,
          country: dto.school_country,
        },
      });

      const school = await tx.school.create({
        data: {
          name: dto.school_name,
          country: dto.school_country,
        },
      });

      await tx.schoolTeacher.create({
        data: {
          teacherId: newUser.id,
          schoolId: school.id,
          role: 'SCHOOL_ADMIN',
        },
      });

      return newUser;
    });

    this.logger.log(`Teacher registered: ${user.id}`);

    const tokens = await this.auth0Client.authenticateUser(
      dto.email,
      dto.password,
    );

    if (tokens.refresh_token) {
      await this.redis.storeRefreshToken(
        user.id,
        this.hashToken(tokens.refresh_token),
        REFRESH_TOKEN_TTL_SECONDS,
      );
    }

    return {
      authResult: {
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        user: {
          id: user.id,
          role: 'teacher',
          email: user.email ?? undefined,
          name: user.displayName,
        },
      },
      refreshToken: tokens.refresh_token ?? '',
    };
  }

  async login(dto: EmailLoginDto): Promise<{
    authResult: AuthResult;
    refreshToken: string;
  }> {
    const tokens = await this.auth0Client.authenticateUser(
      dto.email,
      dto.password,
    );

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (tokens.refresh_token) {
      await this.redis.storeRefreshToken(
        user.id,
        this.hashToken(tokens.refresh_token),
        REFRESH_TOKEN_TTL_SECONDS,
      );
    }

    return {
      authResult: {
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        user: {
          id: user.id,
          role: user.role.toLowerCase(),
          email: user.email ?? undefined,
          name: user.displayName,
        },
      },
      refreshToken: tokens.refresh_token ?? '',
    };
  }

  async refresh(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
    newRefreshToken?: string;
  }> {
    const tokenHash = this.hashToken(refreshToken);
    const isRevoked = await this.redis.isRevoked(tokenHash);
    if (isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const tokens = await this.auth0Client.refreshToken(refreshToken);

    if (tokens.refresh_token && tokens.refresh_token !== refreshToken) {
      await this.redis.addToRevocationList(
        tokenHash,
        REFRESH_TOKEN_TTL_SECONDS,
      );
    }

    return {
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
      newRefreshToken: tokens.refresh_token,
    };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;

    const tokenHash = this.hashToken(refreshToken);

    await Promise.all([
      this.redis.addToRevocationList(tokenHash, REFRESH_TOKEN_TTL_SECONDS),
      this.auth0Client.revokeRefreshToken(refreshToken),
    ]);

    this.logger.log('User logged out, refresh token revoked');
  }

  validateUserRoles(user: AuthenticatedUser, requiredRoles: string[]): boolean {
    return user.roles.some((role) => requiredRoles.includes(role));
  }

  isStudentAccount(user: AuthenticatedUser): boolean {
    return user.roles.includes('student') && !user.email;
  }

  async studentLogin(dto: StudentLoginDto): Promise<{ authResult: AuthResult }> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user || user.role !== PrismaUserRole.STUDENT || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`Student login: ${user.id}`);

    return {
      authResult: {
        access_token: this.signLocalToken(user.id, 'student'),
        expires_in: 900,
        user: {
          id: user.id,
          role: 'student',
          name: user.displayName,
        },
      },
    };
  }

  async classCodeLogin(dto: ClassCodeLoginDto): Promise<{
    authResult: AuthResult;
    classroom: { id: string; name: string; grade: number };
  }> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { classCode: dto.class_code },
      include: {
        enrollments: {
          include: { student: true },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException('Class code not found');
    }

    const picturePasswordJson = JSON.stringify(dto.picture_password);

    let matchedStudent: typeof classroom.enrollments[0]['student'] | null = null;
    for (const enrollment of classroom.enrollments) {
      const student = enrollment.student;
      if (student.picturePasswordHash) {
        const match = await bcrypt.compare(
          picturePasswordJson,
          student.picturePasswordHash,
        );
        if (match) {
          matchedStudent = student;
          break;
        }
      }
    }

    if (!matchedStudent) {
      throw new UnauthorizedException('Invalid picture password');
    }

    this.logger.log(`Class code login: student ${matchedStudent.id} via classroom ${classroom.id}`);

    return {
      authResult: {
        access_token: this.signLocalToken(matchedStudent.id, 'student'),
        expires_in: 900,
        user: {
          id: matchedStudent.id,
          role: 'student',
          name: matchedStudent.displayName,
        },
      },
      classroom: {
        id: classroom.id,
        name: classroom.name,
        grade: classroom.grade,
      },
    };
  }

  getAuth0Config() {
    return {
      domain: this.configService.getOrThrow<string>('AUTH0_ISSUER_URL'),
      audience: this.configService.getOrThrow<string>('AUTH0_AUDIENCE'),
      clientId: this.configService.getOrThrow<string>('AUTH0_CLIENT_ID'),
    };
  }

  private signLocalToken(userId: string, role: string): string {
    const secret = this.configService.get<string>(
      'JWT_LOCAL_SECRET',
      'koblio-local-dev-secret-change-in-production',
    );
    const audience = this.configService.getOrThrow<string>('AUTH0_AUDIENCE');

    return jwt.sign(
      {
        sub: userId,
        roles: [role],
      },
      secret,
      {
        algorithm: 'HS256',
        expiresIn: '15m',
        issuer: LOCAL_JWT_ISSUER,
        audience,
      },
    );
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

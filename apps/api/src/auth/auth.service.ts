import { createHash } from 'crypto';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole as PrismaUserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Auth0ClientService } from './auth0-client.service';
import { RegisterParentDto } from './dto/register-parent.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { EmailLoginDto, StudentLoginDto, ClassCodeLoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const STUDENT_TOKEN_EXPIRES_IN = 900; // 15 minutes

export interface AuthResult {
  access_token: string;
  expires_in: number;
  user: {
    id: string;
    role: string;
    email?: string;
    name: string;
    username?: string;
    grade?: number | null;
    classroom_id?: string | null;
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
    private readonly jwtService: JwtService,
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

  async studentLogin(dto: StudentLoginDto): Promise<{
    authResult: AuthResult;
    refreshToken: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: {
        enrollments: { select: { classroomId: true }, take: 1 },
      },
    });

    if (!user || user.role !== PrismaUserRole.STUDENT) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.signStudentToken(user.id);

    this.logger.log(`Student logged in: ${user.id}`);

    return {
      authResult: {
        access_token: accessToken,
        expires_in: STUDENT_TOKEN_EXPIRES_IN,
        user: {
          id: user.id,
          role: 'student',
          name: user.displayName,
          username: user.username ?? undefined,
          grade: user.grade,
          classroom_id: user.enrollments[0]?.classroomId ?? null,
        },
      },
      refreshToken: '',
    };
  }

  async classCodeLogin(dto: ClassCodeLoginDto): Promise<{
    authResult: AuthResult;
    refreshToken: string;
  }> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { classCode: dto.class_code },
      include: {
        enrollments: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException('Class code not found');
    }

    const pictureHash = this.hashPicturePassword(dto.picture_password);

    const matchedEnrollment = classroom.enrollments.find(
      (e) => e.student.picturePasswordHash === pictureHash,
    );

    if (!matchedEnrollment) {
      throw new UnauthorizedException('Invalid picture password');
    }

    const student = matchedEnrollment.student;
    const accessToken = this.signStudentToken(student.id);

    this.logger.log(`Student logged in via class code: ${student.id}`);

    return {
      authResult: {
        access_token: accessToken,
        expires_in: STUDENT_TOKEN_EXPIRES_IN,
        user: {
          id: student.id,
          role: 'student',
          name: student.displayName,
          username: student.username ?? undefined,
          grade: student.grade,
          classroom_id: classroom.id,
        },
      },
      refreshToken: '',
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

  getAuth0Config() {
    return {
      domain: this.configService.getOrThrow<string>('AUTH0_ISSUER_URL'),
      audience: this.configService.getOrThrow<string>('AUTH0_AUDIENCE'),
      clientId: this.configService.getOrThrow<string>('AUTH0_CLIENT_ID'),
    };
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static hashPicturePassword(selections: string[]): string {
    const normalized = selections.map((s) => s.toLowerCase().trim()).join('|');
    return createHash('sha256').update(normalized).digest('hex');
  }

  private signStudentToken(userId: string): string {
    const audience = this.configService.getOrThrow<string>('AUTH0_AUDIENCE');
    return this.jwtService.sign(
      {
        sub: userId,
        roles: ['student'],
      },
      { audience },
    );
  }

  private hashPicturePassword(selections: string[]): string {
    return AuthService.hashPicturePassword(selections);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

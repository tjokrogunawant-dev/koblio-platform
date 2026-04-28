import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notification/email.service';
import { RegisterParentDto } from './dto/register-parent.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { EmailLoginDto } from './dto/login.dto';
import { StudentLoginDto } from './dto/student-login.dto';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

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
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  getStatus() {
    return { module: 'auth', status: 'operational' };
  }

  private issueToken(id: string, role: string, email: string | undefined, name: string): AuthResult {
    const payload = { sub: id, roles: [role], iss: 'koblio-internal', email };
    return { access_token: this.jwtService.sign(payload), expires_in: 3600, user: { id, role, email, name } };
  }

  async registerParent(dto: RegisterParentDto): Promise<{ authResult: AuthResult; refreshToken: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, role: PrismaUserRole.PARENT, displayName: dto.name, passwordHash, country: dto.country, locale: dto.locale },
    });

    this.logger.log(`Parent registered: ${user.id}`);
    return { authResult: this.issueToken(user.id, 'parent', user.email ?? undefined, user.displayName), refreshToken: '' };
  }

  async registerTeacher(dto: RegisterTeacherDto): Promise<{ authResult: AuthResult; refreshToken: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email: dto.email, role: PrismaUserRole.TEACHER, displayName: dto.name, passwordHash, country: dto.school_country },
      });
      const school = await tx.school.create({ data: { name: dto.school_name, country: dto.school_country } });
      await tx.schoolTeacher.create({ data: { teacherId: newUser.id, schoolId: school.id, role: 'SCHOOL_ADMIN' } });
      return newUser;
    });

    this.logger.log(`Teacher registered: ${user.id}`);
    return { authResult: this.issueToken(user.id, 'teacher', user.email ?? undefined, user.displayName), refreshToken: '' };
  }

  async login(dto: EmailLoginDto): Promise<{ authResult: AuthResult; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return { authResult: this.issueToken(user.id, user.role.toLowerCase(), user.email ?? undefined, user.displayName), refreshToken: '' };
  }

  async logout(_refreshToken: string | undefined): Promise<void> {
    // No-op for MVP — JWTs expire after 1h, no server-side revocation needed
  }

  async registerStudent(dto: RegisterStudentDto): Promise<AuthResult> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { classCode: dto.classCode.toUpperCase() },
    });
    if (!classroom) {
      throw new ConflictException('Class code not found');
    }

    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const student = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          role: PrismaUserRole.STUDENT,
          displayName: dto.displayName,
          username: dto.username,
          passwordHash,
          grade: classroom.grade,
        },
      });
      await tx.enrollment.create({
        data: { studentId: user.id, classroomId: classroom.id },
      });
      return user;
    });

    this.logger.log(`Student registered: ${student.id} joined classroom ${classroom.id}`);

    const payload = {
      sub: student.id,
      roles: ['student'],
      iss: 'koblio-internal',
      username: student.username,
      grade: student.grade,
    };

    return {
      access_token: this.jwtService.sign(payload),
      expires_in: 3600,
      user: { id: student.id, role: 'student', name: student.displayName },
    };
  }

  async loginStudent(dto: StudentLoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user || user.role !== PrismaUserRole.STUDENT) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      roles: ['student'],
      iss: 'koblio-internal',
      username: user.username,
      grade: user.grade,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      expires_in: 3600,
      // COPPA: no email field — only safe, non-PII fields returned
      user: {
        id: user.id,
        role: 'student',
        name: user.displayName,
      },
    };
  }

  validateUserRoles(user: AuthenticatedUser, requiredRoles: string[]): boolean {
    return user.roles.some((role) => requiredRoles.includes(role));
  }

  isStudentAccount(user: AuthenticatedUser): boolean {
    return user.roles.includes('student') && !user.email;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && user.email) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      });

      await this.prisma.passwordResetToken.create({
        data: { tokenHash, userId: user.id, expiresAt },
      });

      const webBase = process.env.WEB_BASE_URL ?? 'http://localhost:3001';
      const resetUrl = `${webBase}/reset-password?token=${rawToken}`;
      await this.emailService.sendPasswordReset(user.email, resetUrl);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt !== null || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }

}

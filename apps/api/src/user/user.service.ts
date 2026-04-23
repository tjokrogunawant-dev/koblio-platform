import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from '../auth/password.util';
import { CreateChildAccountDto } from './dto/create-child-account.dto';
import { CreateSchoolDto } from './dto/create-school.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'user', status: 'operational' };
  }

  async findByAuth0Id(auth0Id: string) {
    return this.prisma.user.findUnique({ where: { auth0Id } });
  }

  async createChildAccount(
    parentAuth0Id: string,
    dto: CreateChildAccountDto,
    ipAddress: string,
  ) {
    const parent = await this.prisma.user.findUnique({
      where: { auth0Id: parentAuth0Id },
    });

    if (!parent) {
      throw new NotFoundException('Parent account not found');
    }

    if (parent.role !== PrismaUserRole.PARENT) {
      throw new ForbiddenException('Only parents can create child accounts');
    }

    if (!dto.consent.accepted) {
      throw new ForbiddenException(
        'Parental consent must be accepted to create a child account',
      );
    }

    const username = this.generateUsername(dto.name);

    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException(
        'Generated username already taken, please try again',
      );
    }

    const passwordHashed = await hashPassword(dto.password);

    const child = await this.prisma.$transaction(async (tx) => {
      const newChild = await tx.user.create({
        data: {
          auth0Id: `child_${parent.id}_${Date.now()}`,
          role: PrismaUserRole.STUDENT,
          displayName: dto.name,
          username,
          passwordHash: passwordHashed,
          grade: dto.grade,
          country: parent.country,
        },
      });

      await tx.parentChildLink.create({
        data: {
          parentId: parent.id,
          childId: newChild.id,
        },
      });

      await tx.parentalConsent.create({
        data: {
          parentId: parent.id,
          childId: newChild.id,
          accepted: dto.consent.accepted,
          consentVersion: dto.consent.consent_version ?? 'v1.0',
          ipAddress,
          timestamp: new Date(dto.consent.timestamp),
        },
      });

      return newChild;
    });

    this.logger.log(
      `Child account created: ${child.id} linked to parent: ${parent.id}`,
    );

    return {
      id: child.id,
      role: 'student',
      name: child.displayName,
      username: child.username,
      grade: child.grade,
      country: child.country,
      linked_parent_ids: [parent.id],
    };
  }

  async listChildren(parentAuth0Id: string) {
    const parent = await this.prisma.user.findUnique({
      where: { auth0Id: parentAuth0Id },
      include: {
        parentLinks: {
          include: {
            child: {
              include: {
                enrollments: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Parent account not found');
    }

    return parent.parentLinks.map((link) => ({
      id: link.child.id,
      role: 'student',
      name: link.child.displayName,
      username: link.child.username,
      grade: link.child.grade,
      country: link.child.country,
      classroom_id: link.child.enrollments[0]?.classroomId ?? null,
      linked_parent_ids: [parent.id],
    }));
  }

  async createSchool(teacherAuth0Id: string, dto: CreateSchoolDto) {
    const teacher = await this.prisma.user.findUnique({
      where: { auth0Id: teacherAuth0Id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher account not found');
    }

    if (
      teacher.role !== PrismaUserRole.TEACHER &&
      teacher.role !== PrismaUserRole.ADMIN
    ) {
      throw new ForbiddenException('Only teachers can create schools');
    }

    const school = await this.prisma.$transaction(async (tx) => {
      const newSchool = await tx.school.create({
        data: {
          name: dto.name,
          country: dto.country,
        },
      });

      await tx.schoolTeacher.create({
        data: {
          teacherId: teacher.id,
          schoolId: newSchool.id,
          role: 'SCHOOL_ADMIN',
        },
      });

      return newSchool;
    });

    this.logger.log(
      `School created: ${school.id} by teacher: ${teacher.id}`,
    );

    return {
      id: school.id,
      name: school.name,
      country: school.country,
    };
  }

  private generateUsername(name: string): string {
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 12);
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${sanitized}${suffix}`;
  }
}

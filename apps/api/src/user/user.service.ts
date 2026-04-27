import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChildAccountDto } from './dto/create-child-account.dto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { JoinClassDto } from './dto/join-class.dto';
import { AvatarSlug } from './dto/update-avatar.dto';

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

    const child = await this.prisma.$transaction(async (tx) => {
      const passwordHash = await bcrypt.hash(dto.password, 10);

      const newChild = await tx.user.create({
        data: {
          auth0Id: `child_${parent.id}_${Date.now()}`,
          role: PrismaUserRole.STUDENT,
          displayName: dto.name,
          username,
          passwordHash,
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

  async getChild(parentAuth0Id: string, childId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { auth0Id: parentAuth0Id },
    });

    if (!parent) {
      throw new NotFoundException('Parent account not found');
    }

    const link = await this.prisma.parentChildLink.findUnique({
      where: {
        parentId_childId: {
          parentId: parent.id,
          childId,
        },
      },
      include: {
        child: {
          include: {
            enrollments: {
              include: { classroom: true },
            },
          },
        },
      },
    });

    if (!link) {
      throw new NotFoundException('Child not found or does not belong to this parent');
    }

    const child = link.child;
    return {
      id: child.id,
      role: 'student',
      name: child.displayName,
      username: child.username,
      grade: child.grade,
      country: child.country,
      classroom_id: child.enrollments[0]?.classroomId ?? null,
      linked_parent_ids: [parent.id],
    };
  }

  async joinClassByCode(
    parentAuth0Id: string,
    childId: string,
    dto: JoinClassDto,
  ) {
    const parent = await this.prisma.user.findUnique({
      where: { auth0Id: parentAuth0Id },
    });

    if (!parent) {
      throw new NotFoundException('Parent account not found');
    }

    const link = await this.prisma.parentChildLink.findUnique({
      where: {
        parentId_childId: {
          parentId: parent.id,
          childId,
        },
      },
      include: { child: true },
    });

    if (!link) {
      throw new NotFoundException('Child not found or does not belong to this parent');
    }

    const classroom = await this.prisma.classroom.findUnique({
      where: { classCode: dto.class_code.toUpperCase() },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with code "${dto.class_code}" not found`);
    }

    const enrollment = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.enrollment.findUnique({
        where: { studentId_classroomId: { studentId: childId, classroomId: classroom.id } },
      });
      if (existing) {
        throw new ConflictException('Child is already enrolled in this classroom');
      }
      return tx.enrollment.create({
        data: { studentId: childId, classroomId: classroom.id },
      });
    });

    this.logger.log(
      `Child ${childId} joined classroom ${classroom.id} via code ${dto.class_code}`,
    );

    const child = link.child;
    return {
      id: child.id,
      role: 'student',
      name: child.displayName,
      username: child.username,
      grade: child.grade,
      country: child.country,
      classroom_id: enrollment.classroomId,
      classroom_name: classroom.name,
      classroom_grade: classroom.grade,
      linked_parent_ids: [parent.id],
    };
  }

  async getSchool(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        _count: {
          select: {
            teachers: true,
            classrooms: true,
          },
        },
      },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return {
      id: school.id,
      name: school.name,
      country: school.country,
      teacher_count: school._count.teachers,
      classroom_count: school._count.classrooms,
    };
  }

  async updateAvatar(auth0Id: string, avatarSlug: AvatarSlug) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { avatarSlug },
    });
    return {
      id: updated.id,
      displayName: updated.displayName,
      avatarSlug: updated.avatarSlug,
    };
  }

  async getStudentProfileByAuth0Id(auth0Id: string) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== PrismaUserRole.STUDENT) {
      throw new ForbiddenException('Only students have a profile page');
    }
    return {
      id: user.id,
      displayName: user.displayName,
      grade: user.grade,
      avatarSlug: user.avatarSlug,
      coins: user.coins,
      xp: user.xp,
      level: user.level,
      streakCount: user.streakCount,
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

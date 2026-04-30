import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';

@Injectable()
export class ClassroomService {
  private readonly logger = new Logger(ClassroomService.name);

  constructor(private readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'classroom', status: 'operational' };
  }

  async createClassroom(teacherId: string, dto: CreateClassroomDto) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher account not found');
    }

    if (teacher.role !== PrismaUserRole.TEACHER && teacher.role !== PrismaUserRole.ADMIN) {
      throw new ForbiddenException('Only teachers can create classrooms');
    }

    if (dto.schoolId) {
      const schoolTeacher = await this.prisma.schoolTeacher.findUnique({
        where: {
          teacherId_schoolId: {
            teacherId: teacher.id,
            schoolId: dto.schoolId,
          },
        },
      });
      if (!schoolTeacher) {
        throw new ForbiddenException('You are not a member of the specified school');
      }
    }

    const classCode = this.generateClassCode();

    const classroom = await this.prisma.classroom.create({
      data: {
        name: dto.name,
        grade: dto.grade,
        classCode,
        teacherId: teacher.id,
        schoolId: dto.schoolId ?? null,
      },
    });

    this.logger.log(`Classroom created: ${classroom.id} by teacher: ${teacher.id}`);

    return {
      id: classroom.id,
      name: classroom.name,
      grade: classroom.grade,
      classCode: classroom.classCode,
      teacherId: classroom.teacherId,
      schoolId: classroom.schoolId,
      studentCount: 0,
    };
  }

  async listTeacherClassrooms(teacherId: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher account not found');
    }

    const classrooms = await this.prisma.classroom.findMany({
      where: { teacherId: teacher.id },
      include: { _count: { select: { enrollments: true } } },
    });

    return classrooms.map((c) => ({
      id: c.id,
      name: c.name,
      grade: c.grade,
      classCode: c.classCode,
      teacherId: c.teacherId,
      schoolId: c.schoolId,
      studentCount: c._count.enrollments,
    }));
  }

  async enrollStudent(classroomId: string, teacherId: string, dto: EnrollStudentDto) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const teacher = await this.prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher || classroom.teacherId !== teacher.id) {
      throw new ForbiddenException('You do not own this classroom');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.role !== PrismaUserRole.STUDENT) {
      throw new ForbiddenException('Only students can be enrolled');
    }

    const existing = await this.prisma.enrollment.findUnique({
      where: {
        studentId_classroomId: {
          studentId: dto.studentId,
          classroomId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Student is already enrolled in this classroom');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId: dto.studentId,
        classroomId,
      },
    });

    this.logger.log(`Student ${dto.studentId} enrolled in classroom ${classroomId}`);

    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      classroomId: enrollment.classroomId,
      enrolledAt: enrollment.enrolledAt.toISOString(),
    };
  }

  async listClassroomStudents(classroomId: string, teacherId?: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    if (teacherId) {
      const teacher = await this.prisma.user.findUnique({
        where: { id: teacherId },
      });
      if (!teacher || classroom.teacherId !== teacher.id) {
        throw new ForbiddenException('You do not own this classroom');
      }
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { classroomId },
      include: { student: true },
    });

    return enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.displayName,
      role: (e.student.role as string).toLowerCase(),
      grade: e.student.grade,
      streakCount: e.student.streakCount,
      coins: e.student.coins,
      xp: e.student.xp,
    }));
  }

  async getClassroomProgress(classroomId: string, teacherId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || classroom.teacherId !== teacher.id) {
      throw new ForbiddenException('You do not own this classroom');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { classroomId },
      include: { student: true },
    });

    const studentProgressList = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = enrollment.student;

        const attempts = await this.prisma.studentProblemAttempt.findMany({
          where: { studentId: student.id },
          include: { problem: { select: { topic: true } } },
        });

        const totalAttempts = attempts.length;
        const correctAttempts = attempts.filter((a) => a.correct).length;
        const accuracyPercent =
          totalAttempts === 0 ? 0 : Math.round((correctAttempts / totalAttempts) * 100);

        const topicMap = new Map<string, { attempted: number; correct: number }>();
        for (const attempt of attempts) {
          const topic = attempt.problem.topic;
          const entry = topicMap.get(topic) ?? { attempted: 0, correct: 0 };
          entry.attempted += 1;
          if (attempt.correct) entry.correct += 1;
          topicMap.set(topic, entry);
        }

        const topicBreakdown = Array.from(topicMap.entries()).map(([topic, stats]) => ({
          topic,
          attempted: stats.attempted,
          correct: stats.correct,
        }));

        return {
          studentId: student.id,
          name: student.displayName,
          totalAttempts,
          correctAttempts,
          accuracyPercent,
          streakCount: student.streakCount,
          topicBreakdown,
        };
      }),
    );

    return { students: studentProgressList };
  }

  private generateClassCode(): string {
    const adjectives = ['SUN', 'STAR', 'MOON', 'SKY', 'BLUE', 'RED', 'GOLD', 'PINE'];
    const nouns = ['DRAGON', 'TIGER', 'EAGLE', 'PANDA', 'LION', 'HAWK', 'BEAR', 'WOLF'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(10 + Math.random() * 90);
    return `${adj}-${noun}-${num}`;
  }
}

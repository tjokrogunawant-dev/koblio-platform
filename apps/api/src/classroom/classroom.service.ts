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

  async createClassroom(teacherAuth0Id: string, dto: CreateClassroomDto) {
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
      throw new ForbiddenException('Only teachers can create classrooms');
    }

    if (dto.school_id) {
      const schoolTeacher = await this.prisma.schoolTeacher.findUnique({
        where: {
          teacherId_schoolId: {
            teacherId: teacher.id,
            schoolId: dto.school_id,
          },
        },
      });
      if (!schoolTeacher) {
        throw new ForbiddenException(
          'You are not a member of the specified school',
        );
      }
    }

    const classCode = this.generateClassCode();

    const classroom = await this.prisma.classroom.create({
      data: {
        name: dto.name,
        grade: dto.grade,
        classCode,
        teacherId: teacher.id,
        schoolId: dto.school_id ?? null,
      },
    });

    this.logger.log(
      `Classroom created: ${classroom.id} by teacher: ${teacher.id}`,
    );

    return {
      id: classroom.id,
      name: classroom.name,
      grade: classroom.grade,
      class_code: classroom.classCode,
      teacher_id: classroom.teacherId,
      school_id: classroom.schoolId,
      student_count: 0,
    };
  }

  async listTeacherClassrooms(teacherAuth0Id: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { auth0Id: teacherAuth0Id },
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
      class_code: c.classCode,
      teacher_id: c.teacherId,
      school_id: c.schoolId,
      student_count: c._count.enrollments,
    }));
  }

  async enrollStudent(classroomId: string, dto: EnrollStudentDto) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: dto.student_id },
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
          studentId: dto.student_id,
          classroomId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Student is already enrolled in this classroom');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId: dto.student_id,
        classroomId,
      },
    });

    this.logger.log(
      `Student ${dto.student_id} enrolled in classroom ${classroomId}`,
    );

    return {
      id: enrollment.id,
      student_id: enrollment.studentId,
      classroom_id: enrollment.classroomId,
      enrolled_at: enrollment.enrolledAt.toISOString(),
    };
  }

  async listClassroomStudents(classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { classroomId },
      include: { student: true },
    });

    return enrollments.map((e) => ({
      id: e.student.id,
      role: 'student',
      name: e.student.displayName,
      username: e.student.username,
      grade: e.student.grade,
      country: e.student.country,
      enrolled_at: e.enrolledAt.toISOString(),
    }));
  }

  private generateClassCode(): string {
    const adjectives = [
      'SUN',
      'STAR',
      'MOON',
      'SKY',
      'BLUE',
      'RED',
      'GOLD',
      'PINE',
    ];
    const nouns = [
      'DRAGON',
      'TIGER',
      'EAGLE',
      'PANDA',
      'LION',
      'HAWK',
      'BEAR',
      'WOLF',
    ];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(10 + Math.random() * 90);
    return `${adj}-${noun}-${num}`;
  }
}

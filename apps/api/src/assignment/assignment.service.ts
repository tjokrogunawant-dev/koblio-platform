import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttemptService } from '../attempt/attempt.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly attemptService: AttemptService,
  ) {}

  // ─── P1-T30: Create assignment ────────────────────────────────────────────

  async createAssignment(teacherAuth0Id: string, dto: CreateAssignmentDto) {
    const teacher = await this.prisma.user.findUnique({
      where: { auth0Id: teacherAuth0Id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher account not found');
    }

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: dto.classroomId },
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    if (classroom.teacherId !== teacher.id) {
      throw new ForbiddenException('You do not own this classroom');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        classroomId: dto.classroomId,
        teacherId: teacher.id,
        title: dto.title,
        topic: dto.topic,
        strand: dto.strand,
        grade: dto.grade,
        difficulty: dto.difficulty,
        problemIds: dto.problemIds,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });

    this.logger.log(
      `Assignment created: ${assignment.id} by teacher: ${teacher.id}`,
    );

    return this.formatAssignment(assignment, classroom.name, 0);
  }

  // ─── P1-T30: List teacher's assignments ──────────────────────────────────

  async listTeacherAssignments(teacherAuth0Id: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { auth0Id: teacherAuth0Id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher account not found');
    }

    const assignments = await this.prisma.assignment.findMany({
      where: { teacherId: teacher.id },
      include: {
        classroom: { select: { name: true } },
        _count: {
          select: {
            submissions: {
              where: { submittedAt: { not: null } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return assignments.map((a) =>
      this.formatAssignment(a, a.classroom.name, a._count.submissions),
    );
  }

  // ─── P1-T31: Student pending assignments ─────────────────────────────────

  async getStudentAssignments(studentAuth0Id: string) {
    const student = await this.prisma.user.findUnique({
      where: { auth0Id: studentAuth0Id },
    });

    if (!student) {
      throw new NotFoundException('Student account not found');
    }

    const now = new Date();

    // Find assignments for classrooms the student is enrolled in, not yet past due
    const assignments = await this.prisma.assignment.findMany({
      where: {
        classroom: {
          enrollments: { some: { studentId: student.id } },
        },
        OR: [{ dueDate: null }, { dueDate: { gte: now } }],
      },
      include: {
        classroom: { select: { name: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    // For each assignment, figure out which problems are still pending for this student
    const result = await Promise.all(
      assignments.map(async (a) => {
        const submittedProblemIds = await this.prisma.assignmentSubmission
          .findMany({
            where: {
              assignmentId: a.id,
              studentId: student.id,
              submittedAt: { not: null },
            },
            select: { problemId: true },
          })
          .then((rows) => rows.map((r) => r.problemId));

        const pendingCount = a.problemIds.filter(
          (pid) => !submittedProblemIds.includes(pid),
        ).length;

        return {
          id: a.id,
          title: a.title,
          classroomName: a.classroom.name,
          topic: a.topic,
          strand: a.strand,
          grade: a.grade,
          difficulty: a.difficulty,
          problemIds: a.problemIds,
          dueDate: a.dueDate?.toISOString() ?? null,
          pendingCount,
          totalProblems: a.problemIds.length,
          createdAt: a.createdAt.toISOString(),
        };
      }),
    );

    // Only include assignments with remaining problems
    return result.filter((a) => a.pendingCount > 0);
  }

  // ─── P1-T31: Submit assignment ────────────────────────────────────────────

  async submitAssignment(
    studentAuth0Id: string,
    assignmentId: string,
    dto: SubmitAssignmentDto,
  ) {
    const student = await this.prisma.user.findUnique({
      where: { auth0Id: studentAuth0Id },
    });

    if (!student) {
      throw new NotFoundException('Student account not found');
    }

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        classroom: {
          include: { enrollments: { where: { studentId: student.id } } },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Verify student is enrolled in the classroom
    if (assignment.classroom.enrollments.length === 0) {
      throw new ForbiddenException('You are not enrolled in this classroom');
    }

    const results: { problemId: string; correct: boolean; correctAnswer: string }[] =
      [];
    let correct = 0;

    for (const answer of dto.answers) {
      // Only allow answers for problems in this assignment
      if (!assignment.problemIds.includes(answer.problemId)) {
        continue;
      }

      // Call AttemptService to record the attempt and award gamification
      const attemptResult = await this.attemptService.submitAnswer(student.id, {
        problemId: answer.problemId,
        answer: answer.answer,
        timeSpentMs: 0,
        hintUsed: false,
      });

      // Upsert the submission record
      await this.prisma.assignmentSubmission.upsert({
        where: {
          assignmentId_studentId_problemId: {
            assignmentId,
            studentId: student.id,
            problemId: answer.problemId,
          },
        },
        update: {
          attemptId: attemptResult.attemptId,
          submittedAt: new Date(),
          correct: attemptResult.correct,
        },
        create: {
          assignmentId,
          studentId: student.id,
          problemId: answer.problemId,
          attemptId: attemptResult.attemptId,
          submittedAt: new Date(),
          correct: attemptResult.correct,
        },
      });

      if (attemptResult.correct) correct += 1;

      results.push({
        problemId: answer.problemId,
        correct: attemptResult.correct,
        correctAnswer: attemptResult.correctAnswer,
      });
    }

    this.logger.log(
      `Assignment ${assignmentId} submitted by student ${student.id}: ${correct}/${results.length}`,
    );

    return {
      correct,
      total: results.length,
      results,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private formatAssignment(
    a: {
      id: string;
      title: string;
      classroomId: string;
      teacherId: string;
      topic: string;
      strand: string;
      grade: number;
      difficulty: string;
      problemIds: string[];
      dueDate: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
    classroomName: string,
    submissionCount: number,
  ) {
    return {
      id: a.id,
      title: a.title,
      classroomId: a.classroomId,
      classroomName,
      teacherId: a.teacherId,
      topic: a.topic,
      strand: a.strand,
      grade: a.grade,
      difficulty: a.difficulty,
      problemIds: a.problemIds,
      dueDate: a.dueDate?.toISOString() ?? null,
      submissionCount,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    };
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StudentProblemAttempt } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../badge/badge.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class AttemptService {
  private readonly logger = new Logger(AttemptService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly badgeService: BadgeService,
  ) {}

  /**
   * Record a student's attempt — validates the answer against the problem's
   * stored content and persists the result.
   */
  async submitAnswer(
    studentId: string,
    dto: SubmitAnswerDto,
  ): Promise<{
    correct: boolean;
    correctAnswer: string;
    solution: string;
    attemptId: string;
    badgesEarned: string[];
  }> {
    const problem = await this.prisma.problem.findUnique({
      where: { id: dto.problemId },
    });

    if (!problem) {
      throw new NotFoundException(
        `Problem with id "${dto.problemId}" not found`,
      );
    }

    // Extract answer and solution from the JSONB content field
    const content = problem.content as Record<string, unknown>;
    const correctAnswer = String(content['answer'] ?? '');
    const solution = String(content['solution'] ?? '');

    const correct =
      dto.answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    const attempt = await this.prisma.studentProblemAttempt.create({
      data: {
        studentId,
        problemId: dto.problemId,
        answer: dto.answer,
        correct,
        timeSpentMs: dto.timeSpentMs,
        hintUsed: dto.hintUsed ?? false,
      },
    });

    this.logger.log(
      `Attempt recorded: student=${studentId} problem=${dto.problemId} correct=${correct}`,
    );

    // ── Badge side-effects (synchronous, idempotent) ────────────────────────
    let badgesEarned: string[] = [];
    try {
      const [totalAttempts, correctTotal] = await Promise.all([
        this.prisma.studentProblemAttempt.count({ where: { studentId } }),
        this.prisma.studentProblemAttempt.count({
          where: { studentId, correct: true },
        }),
      ]);

      badgesEarned = await this.badgeService.checkAndAwardBadges(studentId, {
        correct,
        timeSpentMs: dto.timeSpentMs,
        problem: {
          grade: problem.grade,
          topic: problem.topic,
          strand: problem.strand,
        },
        studentStats: {
          totalAttempts,
          correctTotal,
          // streakCount will be wired up when GamificationService tracks it
          streakCount: 0,
        },
      });
    } catch (err) {
      this.logger.warn(
        `Badge check failed for student=${studentId}: ${(err as Error).message}`,
      );
    }

    return { correct, correctAnswer, solution, attemptId: attempt.id, badgesEarned };
  }

  /**
   * Get all attempts for a student (most recent first, paginated).
   */
  async getStudentAttempts(
    studentId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ data: StudentProblemAttempt[]; total: number }> {
    const [data, total] = await Promise.all([
      this.prisma.studentProblemAttempt.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.studentProblemAttempt.count({ where: { studentId } }),
    ]);

    return { data, total };
  }

  /**
   * Get attempts for a specific problem by a student.
   */
  async getStudentProblemAttempts(
    studentId: string,
    problemId: string,
  ): Promise<StudentProblemAttempt[]> {
    return this.prisma.studentProblemAttempt.findMany({
      where: { studentId, problemId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get student stats: total attempts, correct count, accuracy %, topics attempted.
   */
  async getStudentStats(studentId: string): Promise<{
    totalAttempts: number;
    correctAttempts: number;
    accuracyPercent: number;
    topicsAttempted: string[];
  }> {
    const [totalAttempts, correctAttempts, attemptedProblems] =
      await Promise.all([
        this.prisma.studentProblemAttempt.count({ where: { studentId } }),
        this.prisma.studentProblemAttempt.count({
          where: { studentId, correct: true },
        }),
        this.prisma.studentProblemAttempt.findMany({
          where: { studentId },
          distinct: ['problemId'],
          include: { problem: { select: { topic: true } } },
        }),
      ]);

    const topicsSet = new Set<string>(
      attemptedProblems.map((a) => a.problem.topic),
    );
    const topicsAttempted = Array.from(topicsSet).sort();

    const accuracyPercent =
      totalAttempts === 0
        ? 0
        : Math.round((correctAttempts / totalAttempts) * 100);

    return { totalAttempts, correctAttempts, accuracyPercent, topicsAttempted };
  }
}

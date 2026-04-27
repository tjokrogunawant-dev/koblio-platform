import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StudentProblemAttempt } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class AttemptService {
  private readonly logger = new Logger(AttemptService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
  ) {}

  /**
   * Record a student's attempt — validates the answer against the problem's
   * stored content and persists the result. Awards coins/XP and updates streak.
   */
  async submitAnswer(
    studentId: string,
    dto: SubmitAnswerDto,
  ): Promise<{
    correct: boolean;
    correctAnswer: string;
    solution: string;
    attemptId: string;
    coinsEarned: number;
    xpEarned: number;
    leveledUp: boolean;
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

    // Award coins/XP and update streak — failures do not block the attempt response
    let coinsEarned = 0;
    let xpEarned = 0;
    let leveledUp = false;

    try {
      const award = await this.gamificationService.awardForAttempt(
        studentId,
        String(problem.difficulty),
        correct,
        attempt.id,
      );
      coinsEarned = award.coinsEarned;
      xpEarned = award.xpEarned;
      leveledUp = award.leveledUp;

      if (correct) {
        await this.gamificationService.updateStreak(studentId);
      }
    } catch (err) {
      this.logger.error(
        `Gamification side-effects failed for attempt ${attempt.id}: ${err}`,
      );
    }

    return { correct, correctAnswer, solution, attemptId: attempt.id, coinsEarned, xpEarned, leveledUp };
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

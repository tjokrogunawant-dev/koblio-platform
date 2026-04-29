import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StudentProblemAttempt } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { BadgeService } from '../badge/badge.service';
import { MasteryService } from '../mastery/mastery.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class AttemptService {
  private readonly logger = new Logger(AttemptService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
    private readonly badgeService: BadgeService,
    private readonly masteryService: MasteryService,
    private readonly schedulerService: SchedulerService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

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
    badgesEarned: string[];
    justMastered: boolean;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { subscriptionStatus: true },
    });

    if (!user || user.subscriptionStatus !== 'active') {
      const todayUtc = new Date(new Date().toISOString().slice(0, 10));
      const todayCount = await this.prisma.studentProblemAttempt.count({
        where: { studentId, createdAt: { gte: todayUtc } },
      });
      if (todayCount >= 5) {
        throw new ForbiddenException('Daily problem limit reached');
      }
    }

    const problem = await this.prisma.problem.findUnique({
      where: { id: dto.problemId },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with id "${dto.problemId}" not found`);
    }

    const content = problem.content as Record<string, unknown>;
    const correctAnswer = String(content['answer'] ?? '');
    const solution = String(content['solution'] ?? '');

    const correct = dto.answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

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

    // Resolve classroom once — used for both leaderboard write and rank check
    let classroomId: string | null = null;
    try {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { studentId },
        select: { classroomId: true },
      });
      if (enrollment) classroomId = enrollment.classroomId;
    } catch (err) {
      this.logger.warn(`Could not resolve classroom for student ${studentId}: ${err}`);
    }

    // Award coins/XP, update streak, and check badges — failures never block the attempt response
    let coinsEarned = 0;
    let xpEarned = 0;
    let leveledUp = false;
    let badgesEarned: string[] = [];
    let streakCount = 0;

    try {
      const award = await this.gamificationService.awardForAttempt(
        studentId,
        String(problem.difficulty),
        correct,
        attempt.id,
        classroomId,
      );
      coinsEarned = award.coinsEarned;
      xpEarned = award.xpEarned;
      leveledUp = award.leveledUp;

      if (correct) {
        const streakResult = await this.gamificationService.updateStreak(studentId);
        streakCount = streakResult.streakCount;
      }
    } catch (err) {
      this.logger.error(`Gamification side-effects failed for attempt ${attempt.id}: ${err}`);
    }

    try {
      const [totalAttempts, correctTotal] = await Promise.all([
        this.prisma.studentProblemAttempt.count({ where: { studentId } }),
        this.prisma.studentProblemAttempt.count({ where: { studentId, correct: true } }),
      ]);

      // Resolve classroom rank for TOP_OF_CLASS badge
      let classroomRank: number | null = null;
      if (classroomId) {
        try {
          classroomRank = await this.leaderboardService.getStudentRank(classroomId, studentId);
        } catch (err) {
          this.logger.warn(`Could not resolve classroom rank for badge check: ${err}`);
        }
      }

      badgesEarned = await this.badgeService.checkAndAwardBadges(studentId, {
        correct,
        timeSpentMs: dto.timeSpentMs,
        problem: {
          grade: problem.grade,
          topic: problem.topic,
          strand: problem.strand,
        },
        studentStats: { totalAttempts, correctTotal, streakCount },
        classroomRank,
      });
    } catch (err) {
      this.logger.error(`Badge side-effects failed for attempt ${attempt.id}: ${err}`);
    }

    // Update BKT mastery — failures never block the attempt response
    let justMastered = false;
    try {
      const skill = `grade${problem.grade}:${problem.strand}:${problem.topic}`;
      const masteryResult = await this.masteryService.recordAttempt(studentId, skill, correct);
      justMastered = masteryResult.justMastered;
    } catch (err) {
      this.logger.error(`Mastery side-effects failed for attempt ${attempt.id}: ${err}`);
    }

    // Update FSRS card state — failures never block the attempt response
    try {
      const rating = correct ? 3 : 1; // Good on correct, Again on incorrect
      await this.schedulerService.recordReview(studentId, dto.problemId, rating as 1 | 3);
    } catch (err) {
      this.logger.error(`FSRS scheduler side-effects failed for attempt ${attempt.id}: ${err}`);
    }

    return {
      correct,
      correctAnswer,
      solution,
      attemptId: attempt.id,
      coinsEarned,
      xpEarned,
      leveledUp,
      badgesEarned,
      justMastered,
    };
  }

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

  async getStudentProblemAttempts(
    studentId: string,
    problemId: string,
  ): Promise<StudentProblemAttempt[]> {
    return this.prisma.studentProblemAttempt.findMany({
      where: { studentId, problemId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudentStats(studentId: string): Promise<{
    totalAttempts: number;
    correctAttempts: number;
    accuracyPercent: number;
    topicsAttempted: string[];
  }> {
    const [totalAttempts, correctAttempts, attemptedProblems] = await Promise.all([
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

    const topicsSet = new Set<string>(attemptedProblems.map((a) => a.problem.topic));
    const topicsAttempted = Array.from(topicsSet).sort();

    const accuracyPercent =
      totalAttempts === 0 ? 0 : Math.round((correctAttempts / totalAttempts) * 100);

    return { totalAttempts, correctAttempts, accuracyPercent, topicsAttempted };
  }
}

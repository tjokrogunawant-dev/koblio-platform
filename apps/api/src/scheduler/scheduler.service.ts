import { Injectable, Logger } from '@nestjs/common';
import { Problem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FsrsService } from './fsrs.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fsrs: FsrsService,
  ) {}

  /**
   * Get the next N due cards for a student (dueDate <= now, ordered by dueDate ASC).
   * Returns the CardState records (with embedded problem via include if needed).
   */
  async getDueCards(studentId: string, limit: number) {
    const now = new Date();
    return this.prisma.cardState.findMany({
      where: {
        studentId,
        dueDate: { lte: now },
      },
      orderBy: { dueDate: 'asc' },
      take: limit,
      include: { problem: true },
    });
  }

  /**
   * Get N problems the student hasn't seen yet for a given grade/topic.
   * "New" = no CardState record exists for this student+problem pair.
   */
  async getNewCards(
    studentId: string,
    grade: number,
    topic: string,
    limit: number,
  ): Promise<Problem[]> {
    // Find problems in this grade+topic that the student has already touched
    const seenStates = await this.prisma.cardState.findMany({
      where: { studentId },
      select: { problemId: true },
    });
    const seenIds = seenStates.map((s) => s.problemId);

    return this.prisma.problem.findMany({
      where: {
        grade,
        topic,
        ...(seenIds.length > 0 ? { id: { notIn: seenIds } } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Record a review outcome for a student+problem pair, updating FSRS state.
   * Uses upsert so first-time reviews create the card state.
   */
  async recordReview(
    studentId: string,
    problemId: string,
    rating: 1 | 2 | 3 | 4,
  ): Promise<void> {
    const now = new Date();

    // Fetch existing card state (if any)
    const existing = await this.prisma.cardState.findUnique({
      where: { studentId_problemId: { studentId, problemId } },
    });

    let newStability: number;
    let newDifficulty: number;
    let dueDate: Date;

    if (!existing || existing.reviewCount === 0) {
      // First review — use FSRS initial state
      const initial = this.fsrs.getInitialState(rating);
      newStability = initial.stability;
      newDifficulty = initial.difficulty;
      // Next interval = S * 0.9
      const intervalDays = newStability * 0.9;
      dueDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    } else {
      // Subsequent review — compute retrievability then update state
      const daysSinceLast = existing.lastReview
        ? (now.getTime() - existing.lastReview.getTime()) / (1000 * 60 * 60 * 24)
        : 0;

      const retrievability = this.fsrs.computeRetrievability(
        existing.stability,
        daysSinceLast,
      );

      const result = this.fsrs.computeNextState(
        {
          stability: existing.stability,
          difficulty: existing.difficulty,
          reviewCount: existing.reviewCount,
        },
        rating,
        retrievability,
      );

      newStability = result.newStability;
      newDifficulty = result.newDifficulty;
      dueDate = result.dueDate;
    }

    await this.prisma.cardState.upsert({
      where: { studentId_problemId: { studentId, problemId } },
      create: {
        studentId,
        problemId,
        stability: newStability,
        difficulty: newDifficulty,
        dueDate,
        lastReview: now,
        reviewCount: 1,
      },
      update: {
        stability: newStability,
        difficulty: newDifficulty,
        dueDate,
        lastReview: now,
        reviewCount: { increment: 1 },
      },
    });

    this.logger.debug(
      `FSRS review: student=${studentId} problem=${problemId} rating=${rating} ` +
        `newStability=${newStability.toFixed(2)} dueDate=${dueDate.toISOString()}`,
    );
  }

  /**
   * Get the next recommended problem for a student.
   * Priority: due cards first, then new cards.
   * Returns null if no problems are available.
   */
  async getNextProblem(
    studentId: string,
    grade: number,
    topic: string,
  ): Promise<Problem | null> {
    // 1. Check for a due card
    const dueCards = await this.getDueCards(studentId, 1);
    if (dueCards.length > 0) {
      return dueCards[0].problem;
    }

    // 2. Fall back to a new card
    const newCards = await this.getNewCards(studentId, grade, topic, 1);
    if (newCards.length > 0) {
      return newCards[0];
    }

    return null;
  }
}

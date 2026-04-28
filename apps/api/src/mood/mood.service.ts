import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MoodState, MoodWeights } from './mood.types';

const WINDOW_SIZE = 5;

const MOOD_WEIGHTS: Record<MoodState, MoodWeights> = {
  [MoodState.FLOW]: {
    fsrsWeight: 0.5,
    bktWeight: 0.3,
    noveltyWeight: 0.2,
    difficultyOffset: 0,
  },
  [MoodState.FRUSTRATED]: {
    fsrsWeight: 0.3,
    bktWeight: 0.5,
    noveltyWeight: 0.2,
    difficultyOffset: -1,
  },
  [MoodState.CONFUSED]: {
    fsrsWeight: 0.2,
    bktWeight: 0.6,
    noveltyWeight: 0.2,
    difficultyOffset: -2,
  },
  [MoodState.BORED]: {
    fsrsWeight: 0.4,
    bktWeight: 0.2,
    noveltyWeight: 0.4,
    difficultyOffset: 1,
  },
};

@Injectable()
export class MoodService {
  private readonly logger = new Logger(MoodService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Infer current mood from the last 5 StudentProblemAttempt records.
   * Uses however many exist when fewer than 5 are available.
   * Returns FLOW when there are 0 attempts.
   */
  async detectMood(studentId: string): Promise<MoodState> {
    const attempts = await this.prisma.studentProblemAttempt.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: WINDOW_SIZE,
      select: { correct: true, timeSpentMs: true },
    });

    if (attempts.length === 0) {
      this.logger.debug(`No attempts for student ${studentId} — defaulting to FLOW`);
      return MoodState.FLOW;
    }

    const correctCount = attempts.filter((a) => a.correct).length;
    const accuracy = correctCount / attempts.length;
    const avgTimeMs = attempts.reduce((sum, a) => sum + a.timeSpentMs, 0) / attempts.length;

    this.logger.debug(
      `Mood detection: student=${studentId} window=${attempts.length} accuracy=${accuracy.toFixed(2)} avgTimeMs=${Math.round(avgTimeMs)}`,
    );

    // BORED checked before FLOW — subset condition (accuracy>=0.8 satisfies both)
    if (accuracy >= 0.8 && avgTimeMs < 5000) return MoodState.BORED;
    if (accuracy < 0.4 && avgTimeMs < 10000) return MoodState.FRUSTRATED;
    if (accuracy < 0.4 && avgTimeMs >= 10000) return MoodState.CONFUSED;
    return MoodState.FLOW;
  }

  /**
   * Get the scheduler weight shifts for a given mood state.
   */
  getWeights(mood: MoodState): MoodWeights {
    return MOOD_WEIGHTS[mood];
  }

  /**
   * Combined: detect current mood and return its weights.
   */
  async getMoodWeights(studentId: string): Promise<{ mood: MoodState; weights: MoodWeights }> {
    const mood = await this.detectMood(studentId);
    const weights = this.getWeights(mood);
    return { mood, weights };
  }
}

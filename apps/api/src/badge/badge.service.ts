import { Injectable, Logger } from '@nestjs/common';
import { BadgeType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface BadgeAwardContext {
  correct: boolean;
  timeSpentMs: number;
  problem: {
    grade: number;
    topic: string;
    strand: string;
  };
  studentStats: {
    totalAttempts: number;
    correctTotal: number;
    streakCount: number;
  };
}

export interface BadgeMeta {
  name: string;
  description: string;
  iconEmoji: string;
}

const BADGE_META: Record<BadgeType, BadgeMeta> = {
  FIRST_CORRECT: {
    name: 'First Steps',
    description: 'Get your first correct answer',
    iconEmoji: '⭐',
  },
  PERFECT_10: {
    name: 'Perfect 10',
    description: 'Get 10 correct answers in a row',
    iconEmoji: '🔟',
  },
  STREAK_7: {
    name: 'Week Warrior',
    description: 'Keep a 7-day learning streak',
    iconEmoji: '🔥',
  },
  STREAK_30: {
    name: 'Monthly Master',
    description: 'Keep a 30-day learning streak',
    iconEmoji: '🏆',
  },
  PROBLEMS_100: {
    name: 'Century Club',
    description: 'Attempt 100 problems',
    iconEmoji: '💯',
  },
  CORRECT_50: {
    name: 'Sharpshooter',
    description: 'Get 50 correct answers',
    iconEmoji: '🎯',
  },
  FRACTION_MASTER: {
    name: 'Fraction Master',
    description: 'Master 10+ fraction problems',
    iconEmoji: '½',
  },
  SPEED_DEMON: {
    name: 'Speed Demon',
    description: 'Answer correctly in under 10 seconds',
    iconEmoji: '⚡',
  },
  MATH_EXPLORER: {
    name: 'Math Explorer',
    description: 'Try problems from 5 different topics',
    iconEmoji: '🗺️',
  },
  TOP_OF_CLASS: {
    name: 'Top of Class',
    description: 'Reach rank #1 on the weekly leaderboard',
    iconEmoji: '👑',
  },
};

/** Canonical slug used in API responses — maps BadgeType enum to a URL-safe string. */
const BADGE_SLUG: Record<BadgeType, string> = {
  FIRST_CORRECT: 'first_correct',
  PERFECT_10: 'perfect_10',
  STREAK_7: 'streak_7',
  STREAK_30: 'streak_30',
  PROBLEMS_100: 'problems_100',
  CORRECT_50: 'correct_50',
  FRACTION_MASTER: 'fraction_master',
  SPEED_DEMON: 'speed_demon',
  MATH_EXPLORER: 'math_explorer',
  TOP_OF_CLASS: 'top_of_class',
};

@Injectable()
export class BadgeService {
  private readonly logger = new Logger(BadgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check all applicable badge conditions after an attempt and award any that
   * are newly earned. Idempotent — will never award the same badge twice.
   *
   * @returns Array of slug strings for each newly awarded badge (may be empty).
   */
  async checkAndAwardBadges(
    studentId: string,
    context: BadgeAwardContext,
  ): Promise<string[]> {
    // Fetch badges the student already has — used to short-circuit per-badge
    const existingBadges = await this.prisma.badge.findMany({
      where: { studentId },
      select: { type: true },
    });
    const alreadyHas = new Set<BadgeType>(existingBadges.map((b) => b.type));

    const toAward: BadgeType[] = [];

    // ── FIRST_CORRECT ──────────────────────────────────────────────────────────
    if (
      context.correct &&
      !alreadyHas.has(BadgeType.FIRST_CORRECT)
    ) {
      toAward.push(BadgeType.FIRST_CORRECT);
    }

    // ── SPEED_DEMON ────────────────────────────────────────────────────────────
    if (
      context.correct &&
      context.timeSpentMs < 10_000 &&
      !alreadyHas.has(BadgeType.SPEED_DEMON)
    ) {
      toAward.push(BadgeType.SPEED_DEMON);
    }

    // ── STREAK_7 ───────────────────────────────────────────────────────────────
    if (
      context.studentStats.streakCount >= 7 &&
      !alreadyHas.has(BadgeType.STREAK_7)
    ) {
      toAward.push(BadgeType.STREAK_7);
    }

    // ── STREAK_30 ──────────────────────────────────────────────────────────────
    if (
      context.studentStats.streakCount >= 30 &&
      !alreadyHas.has(BadgeType.STREAK_30)
    ) {
      toAward.push(BadgeType.STREAK_30);
    }

    // ── PROBLEMS_100 ──────────────────────────────────────────────────────────
    if (
      context.studentStats.totalAttempts >= 100 &&
      !alreadyHas.has(BadgeType.PROBLEMS_100)
    ) {
      toAward.push(BadgeType.PROBLEMS_100);
    }

    // ── CORRECT_50 ────────────────────────────────────────────────────────────
    if (
      context.studentStats.correctTotal >= 50 &&
      !alreadyHas.has(BadgeType.CORRECT_50)
    ) {
      toAward.push(BadgeType.CORRECT_50);
    }

    // ── PERFECT_10 ────────────────────────────────────────────────────────────
    if (!alreadyHas.has(BadgeType.PERFECT_10)) {
      const last10 = await this.prisma.studentProblemAttempt.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { correct: true },
      });
      if (last10.length === 10 && last10.every((a) => a.correct)) {
        toAward.push(BadgeType.PERFECT_10);
      }
    }

    // ── FRACTION_MASTER ───────────────────────────────────────────────────────
    if (!alreadyHas.has(BadgeType.FRACTION_MASTER)) {
      const fractionAttempts = await this.prisma.studentProblemAttempt.findMany(
        {
          where: {
            studentId,
            problem: {
              grade: 3,
              topic: { contains: 'fraction', mode: 'insensitive' },
            },
          },
          select: { correct: true },
        },
      );
      if (
        fractionAttempts.length >= 10 &&
        fractionAttempts.every((a) => a.correct)
      ) {
        toAward.push(BadgeType.FRACTION_MASTER);
      }
    }

    // ── MATH_EXPLORER ─────────────────────────────────────────────────────────
    if (!alreadyHas.has(BadgeType.MATH_EXPLORER)) {
      const distinctTopicAttempts =
        await this.prisma.studentProblemAttempt.findMany({
          where: { studentId },
          distinct: ['problemId'],
          include: { problem: { select: { topic: true } } },
        });
      const distinctTopics = new Set(
        distinctTopicAttempts.map((a) => a.problem.topic),
      );
      if (distinctTopics.size >= 5) {
        toAward.push(BadgeType.MATH_EXPLORER);
      }
    }

    // ── TOP_OF_CLASS — deferred to Sprint 09 ──────────────────────────────────
    // (requires leaderboard context not available in the attempt flow)

    if (toAward.length === 0) {
      return [];
    }

    // Bulk-create all newly earned badges, using skipDuplicates for extra safety
    await this.prisma.badge.createMany({
      data: toAward.map((type) => ({ studentId, type })),
      skipDuplicates: true,
    });

    const slugs = toAward.map((type) => BADGE_SLUG[type]);
    this.logger.log(
      `Badges awarded to student=${studentId}: ${slugs.join(', ')}`,
    );
    return slugs;
  }

  /**
   * Return all badges earned by a student, enriched with display metadata.
   */
  async getStudentBadges(studentId: string): Promise<
    Array<{
      type: BadgeType;
      slug: string;
      name: string;
      description: string;
      iconEmoji: string;
      awardedAt: Date;
    }>
  > {
    const badges = await this.prisma.badge.findMany({
      where: { studentId },
      orderBy: { awardedAt: 'asc' },
    });

    return badges.map((b) => ({
      type: b.type,
      slug: BADGE_SLUG[b.type],
      ...BADGE_META[b.type],
      awardedAt: b.awardedAt,
    }));
  }
}

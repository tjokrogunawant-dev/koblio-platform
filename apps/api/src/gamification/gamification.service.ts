import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Cumulative XP required to reach each level index (1-indexed, level 1 = index 0)
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000];

export interface LevelInfo {
  level: number;
  xpToNextLevel: number;
  progressPercent: number;
}

export interface AwardResult {
  coinsEarned: number;
  xpEarned: number;
  newLevel: number;
  leveledUp: boolean;
}

export interface StreakResult {
  streakCount: number;
  streakBonusMultiplier: number;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  displayName: string;
  weeklyCoins: number;
}

export interface LeaderboardResult {
  rank: number;
  leaderboard: LeaderboardEntry[];
}

export interface StudentProfile {
  coins: number;
  xp: number;
  level: number;
  streakCount: number;
  levelInfo: LevelInfo;
}

interface WeeklyScoreRow {
  student_id: string;
  display_name: string;
  weekly_coins: bigint;
  rank: bigint;
}

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── P1-T24: Level info ───────────────────────────────────────────────────

  getLevelInfo(xp: number): LevelInfo {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }

    const isMaxLevel = level >= LEVEL_THRESHOLDS.length;
    const currentThreshold = LEVEL_THRESHOLDS[level - 1];
    const nextThreshold = isMaxLevel
      ? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
      : LEVEL_THRESHOLDS[level];

    const xpIntoLevel = xp - currentThreshold;
    const xpForLevel = nextThreshold - currentThreshold;
    const progressPercent = isMaxLevel
      ? 100
      : Math.min(100, Math.floor((xpIntoLevel / xpForLevel) * 100));
    const xpToNextLevel = isMaxLevel ? 0 : nextThreshold - xp;

    return { level, xpToNextLevel, progressPercent };
  }

  // ─── P1-T23: Award coins + XP for attempt ────────────────────────────────

  async awardForAttempt(
    studentId: string,
    problemDifficulty: string,
    correct: boolean,
    attemptId?: string,
  ): Promise<AwardResult> {
    let coinsEarned = 0;
    let xpEarned = 0;

    if (correct) {
      switch (problemDifficulty.toUpperCase()) {
        case 'EASY':
          coinsEarned = 3;
          xpEarned = 5;
          break;
        case 'MEDIUM':
          coinsEarned = 5;
          xpEarned = 10;
          break;
        case 'HARD':
          coinsEarned = 10;
          xpEarned = 20;
          break;
        default:
          coinsEarned = 3;
          xpEarned = 5;
      }
    } else {
      // Wrong answer — award XP for trying, no coins
      xpEarned = 1;
    }

    // Persist the award in a transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: studentId },
        data: {
          coins: { increment: coinsEarned },
          xp: { increment: xpEarned },
        },
        select: { xp: true, level: true, coins: true },
      });

      if (coinsEarned > 0) {
        await tx.pointsLedger.create({
          data: {
            studentId,
            amount: coinsEarned,
            reason: `correct_answer_${problemDifficulty.toLowerCase()}`,
            ...(attemptId ? { attemptId } : {}),
          },
        });
      }

      return updated;
    });

    const newLevelInfo = this.getLevelInfo(user.xp);
    const previousLevelInfo = this.getLevelInfo(user.xp - xpEarned);
    const leveledUp = newLevelInfo.level > previousLevelInfo.level;

    if (leveledUp) {
      await this.prisma.user.update({
        where: { id: studentId },
        data: { level: newLevelInfo.level },
      });
      this.logger.log(
        `Student ${studentId} leveled up to level ${newLevelInfo.level}`,
      );
    }

    return {
      coinsEarned,
      xpEarned,
      newLevel: newLevelInfo.level,
      leveledUp,
    };
  }

  // ─── P1-T25: Daily streak ─────────────────────────────────────────────────

  async updateStreak(studentId: string): Promise<StreakResult> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { streakCount: true, lastActiveDate: true },
    });

    if (!student) {
      return { streakCount: 1, streakBonusMultiplier: 1.0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreakCount = student.streakCount;

    if (student.lastActiveDate) {
      const lastActive = new Date(student.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const lastActiveTime = lastActive.getTime();
      const todayTime = today.getTime();
      const yesterdayTime = yesterday.getTime();

      if (lastActiveTime === todayTime) {
        // Already active today — no change
        const multiplier = student.streakCount >= 7 ? 1.5 : 1.0;
        return { streakCount: student.streakCount, streakBonusMultiplier: multiplier };
      } else if (lastActiveTime === yesterdayTime) {
        // Consecutive day — increment
        newStreakCount = student.streakCount + 1;
      } else {
        // Gap — reset
        newStreakCount = 1;
      }
    } else {
      // First time ever
      newStreakCount = 1;
    }

    await this.prisma.user.update({
      where: { id: studentId },
      data: {
        streakCount: newStreakCount,
        lastActiveDate: new Date(),
      },
    });

    const streakBonusMultiplier = newStreakCount >= 7 ? 1.5 : 1.0;

    this.logger.log(
      `Streak updated for student ${studentId}: ${newStreakCount} days (bonus: ${streakBonusMultiplier}x)`,
    );

    return { streakCount: newStreakCount, streakBonusMultiplier };
  }

  // ─── P1-T26: Class leaderboard ────────────────────────────────────────────

  async getClassLeaderboard(
    classroomId: string,
    studentId: string,
  ): Promise<LeaderboardResult> {
    const rows = await this.prisma.$queryRaw<WeeklyScoreRow[]>`
      WITH weekly_scores AS (
        SELECT pl.student_id, u.display_name,
               SUM(pl.amount) as weekly_coins,
               RANK() OVER (ORDER BY SUM(pl.amount) DESC) as rank
        FROM points_ledger pl
        JOIN users u ON u.id = pl.student_id
        JOIN enrollments e ON e.student_id = pl.student_id AND e.classroom_id = ${classroomId}::uuid
        WHERE pl.created_at >= NOW() - INTERVAL '7 days'
        GROUP BY pl.student_id, u.display_name
      )
      SELECT * FROM weekly_scores ORDER BY rank LIMIT 10
    `;

    const leaderboard: LeaderboardEntry[] = rows.map((row) => ({
      rank: Number(row.rank),
      studentId: row.student_id,
      displayName: row.display_name,
      weeklyCoins: Number(row.weekly_coins),
    }));

    // Find the calling student's rank (may or may not be in top 10)
    let myRank = 0;
    const myEntry = leaderboard.find((e) => e.studentId === studentId);
    if (myEntry) {
      myRank = myEntry.rank;
    } else {
      // Student not in top 10 — fetch their rank separately
      const rankRows = await this.prisma.$queryRaw<{ rank: bigint }[]>`
        WITH weekly_scores AS (
          SELECT pl.student_id,
                 RANK() OVER (ORDER BY SUM(pl.amount) DESC) as rank
          FROM points_ledger pl
          JOIN enrollments e ON e.student_id = pl.student_id AND e.classroom_id = ${classroomId}::uuid
          WHERE pl.created_at >= NOW() - INTERVAL '7 days'
          GROUP BY pl.student_id
        )
        SELECT rank FROM weekly_scores WHERE student_id = ${studentId}::uuid
      `;
      myRank = rankRows.length > 0 ? Number(rankRows[0].rank) : 0;
    }

    return { rank: myRank, leaderboard };
  }

  // ─── Student profile ──────────────────────────────────────────────────────

  async getStudentProfile(studentId: string): Promise<StudentProfile> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: studentId },
      select: { coins: true, xp: true, level: true, streakCount: true },
    });

    const levelInfo = this.getLevelInfo(user.xp);

    return {
      coins: user.coins,
      xp: user.xp,
      level: user.level,
      streakCount: user.streakCount,
      levelInfo,
    };
  }

  // ─── P1-T27: Daily challenge ──────────────────────────────────────────────

  async getDailyChallenge(grade: number): Promise<{
    id: string;
    grade: number;
    strand: string;
    topic: string;
    difficulty: string;
    type: string;
    content: unknown;
  } | null> {
    const problems = await this.prisma.problem.findMany({
      where: { grade },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        grade: true,
        strand: true,
        topic: true,
        difficulty: true,
        type: true,
        content: true,
      },
    });

    if (problems.length === 0) {
      return null;
    }

    const dayIndex = Math.floor(Date.now() / 86400000);
    const index = dayIndex % problems.length;
    return problems[index];
  }

  // Legacy status check
  getStatus() {
    return { module: 'gamification', status: 'operational' };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface LeaderboardEntry {
  studentId: string;
  displayName?: string;
  avatarSlug?: string | null;
  score: number;
  rank: number; // 1-indexed
}

const TTL_SECONDS = 691200; // 8 days

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Add / increment a student's weekly XP score in Redis.
   * Writes to both the classroom sorted set (if classroomId provided) and
   * the global weekly sorted set.  Never throws — Redis errors are logged and
   * swallowed so that a Redis outage cannot disrupt the learning session.
   */
  async addScore(
    classroomId: string | null | undefined,
    studentId: string,
    xpDelta: number,
  ): Promise<void> {
    const weekKey = this.getWeekKey();
    const client = this.redis.getClient();

    try {
      const pipeline = client.pipeline();

      if (classroomId) {
        const classKey = `leaderboard:weekly:classroom:${classroomId}:${weekKey}`;
        pipeline.zincrby(classKey, xpDelta, studentId);
        pipeline.expire(classKey, TTL_SECONDS);
      }

      const globalKey = `leaderboard:weekly:global:${weekKey}`;
      pipeline.zincrby(globalKey, xpDelta, studentId);
      pipeline.expire(globalKey, TTL_SECONDS);

      await pipeline.exec();
    } catch (err) {
      this.logger.error(
        `LeaderboardService.addScore failed for student ${studentId}: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Top-N students for a classroom this week.
   * Falls back to an empty array on Redis error (caller handles cold-start
   * fallback to SQL).
   */
  async getClassroomLeaderboard(
    classroomId: string,
    limit = 10,
  ): Promise<LeaderboardEntry[]> {
    const weekKey = this.getWeekKey();
    const classKey = `leaderboard:weekly:classroom:${classroomId}:${weekKey}`;

    try {
      const client = this.redis.getClient();
      // ZREVRANGE key 0 limit-1 WITHSCORES
      const raw = await client.zrevrange(classKey, 0, limit - 1, 'WITHSCORES');
      return this.hydrateEntries(raw);
    } catch (err) {
      this.logger.error(
        `LeaderboardService.getClassroomLeaderboard failed: ${(err as Error).message}`,
      );
      return [];
    }
  }

  /**
   * 0-indexed ZREVRANK for a student in their classroom leaderboard.
   * Returns null if the student has no score yet.
   */
  async getStudentRank(
    classroomId: string,
    studentId: string,
  ): Promise<number | null> {
    const weekKey = this.getWeekKey();
    const classKey = `leaderboard:weekly:classroom:${classroomId}:${weekKey}`;

    try {
      const client = this.redis.getClient();
      const rank = await client.zrevrank(classKey, studentId);
      return rank; // ioredis returns null when member is absent
    } catch (err) {
      this.logger.error(
        `LeaderboardService.getStudentRank failed: ${(err as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Global top-N students this week.
   */
  async getGlobalLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const weekKey = this.getWeekKey();
    const globalKey = `leaderboard:weekly:global:${weekKey}`;

    try {
      const client = this.redis.getClient();
      const raw = await client.zrevrange(globalKey, 0, limit - 1, 'WITHSCORES');
      return this.hydrateEntries(raw);
    } catch (err) {
      this.logger.error(
        `LeaderboardService.getGlobalLeaderboard failed: ${(err as Error).message}`,
      );
      return [];
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Returns current ISO week key in YYYY-WNN format, e.g. "2026-W17".
   * Computed without external dependencies:
   *   ISO week 1 is the week containing the first Thursday of the year.
   */
  getWeekKey(): string {
    const now = new Date();
    // Copy date and set to nearest Thursday (ISO week date calculation)
    const target = new Date(now);
    // Set to current day's Thursday: day 4 in ISO (Mon=1 … Sun=7)
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // convert Sun=0 → 7
    target.setDate(now.getDate() + (4 - dayOfWeek));

    const year = target.getFullYear();

    // Week number: ordinal day in the year, divided by 7
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear =
      Math.floor((target.getTime() - startOfYear.getTime()) / 86400000) + 1;
    const weekNum = Math.ceil(dayOfYear / 7);

    const paddedWeek = String(weekNum).padStart(2, '0');
    return `${year}-W${paddedWeek}`;
  }

  /**
   * Parse WITHSCORES flat array [ member, score, member, score, … ] and
   * enrich with displayName + avatarSlug from a single batched Prisma query.
   */
  private async hydrateEntries(raw: string[]): Promise<LeaderboardEntry[]> {
    if (raw.length === 0) return [];

    const entries: Array<{ studentId: string; score: number }> = [];
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({
        studentId: raw[i],
        score: parseFloat(raw[i + 1]),
      });
    }

    const studentIds = entries.map((e) => e.studentId);

    const users = await this.prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, displayName: true, avatarSlug: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return entries.map((entry, index) => {
      const user = userMap.get(entry.studentId);
      return {
        studentId: entry.studentId,
        displayName: user?.displayName,
        avatarSlug: user?.avatarSlug ?? null,
        score: entry.score,
        rank: index + 1,
      };
    });
  }
}

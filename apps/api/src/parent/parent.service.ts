import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParentService {
  private readonly logger = new Logger(ParentService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── P1-T33: Parent views child progress ─────────────────────────────────

  async getChildProgress(parentAuth0Id: string, childId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { auth0Id: parentAuth0Id },
    });

    if (!parent) {
      throw new NotFoundException('Parent account not found');
    }

    // Verify parent → child link exists
    const link = await this.prisma.parentChildLink.findUnique({
      where: {
        parentId_childId: {
          parentId: parent.id,
          childId,
        },
      },
    });

    if (!link) {
      throw new ForbiddenException(
        'You are not linked as a parent of this child',
      );
    }

    const child = await this.prisma.user.findUnique({
      where: { id: childId },
      select: {
        id: true,
        displayName: true,
        coins: true,
        xp: true,
        level: true,
        streakCount: true,
      },
    });

    if (!child) {
      throw new NotFoundException('Child account not found');
    }

    const attempts = await this.prisma.studentProblemAttempt.findMany({
      where: { studentId: childId },
      include: { problem: { select: { topic: true } } },
    });

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.correct).length;
    const accuracyPercent =
      totalAttempts === 0
        ? 0
        : Math.round((correctAttempts / totalAttempts) * 100);

    const topicMap = new Map<string, { attempted: number; correct: number }>();
    for (const attempt of attempts) {
      const topic = attempt.problem.topic;
      const entry = topicMap.get(topic) ?? { attempted: 0, correct: 0 };
      entry.attempted += 1;
      if (attempt.correct) entry.correct += 1;
      topicMap.set(topic, entry);
    }

    const topicBreakdown = Array.from(topicMap.entries()).map(
      ([topic, stats]) => ({
        topic,
        attempted: stats.attempted,
        correct: stats.correct,
      }),
    );

    this.logger.log(
      `Parent ${parent.id} viewed progress for child ${childId}`,
    );

    return {
      totalAttempts,
      correctAttempts,
      accuracyPercent,
      streakCount: child.streakCount,
      coins: child.coins,
      xp: child.xp,
      level: child.level,
      topicBreakdown,
    };
  }
}

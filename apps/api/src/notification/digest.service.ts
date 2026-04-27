import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService, WeeklyChildSummary } from './email.service';

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Cron('0 8 * * 1')
  async handleWeeklyCron(): Promise<void> {
    this.logger.log('Weekly digest cron triggered');
    await this.sendWeeklyDigests();
  }

  async sendWeeklyDigests(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const parents = await this.prisma.user.findMany({
      where: { role: 'PARENT', email: { not: null } },
      select: {
        id: true,
        email: true,
        displayName: true,
        parentLinks: {
          select: {
            child: {
              select: {
                id: true,
                displayName: true,
                grade: true,
                streakCount: true,
              },
            },
          },
        },
      },
    });

    for (const parent of parents) {
      if (!parent.email) continue;

      const summaries: WeeklyChildSummary[] = [];

      for (const link of parent.parentLinks) {
        const child = link.child;

        const attempts = await this.prisma.studentProblemAttempt.findMany({
          where: {
            studentId: child.id,
            createdAt: { gte: sevenDaysAgo },
          },
          select: { correct: true },
        });

        const xpRows = await this.prisma.pointsLedger.findMany({
          where: {
            studentId: child.id,
            createdAt: { gte: sevenDaysAgo },
          },
          select: { amount: true },
        });

        const badges = await this.prisma.badge.findMany({
          where: {
            studentId: child.id,
            awardedAt: { gte: sevenDaysAgo },
          },
          select: { type: true },
        });

        summaries.push({
          name: child.displayName,
          grade: child.grade ?? 0,
          xpEarned: xpRows.reduce((sum, r) => sum + r.amount, 0),
          attemptsCount: attempts.length,
          correctCount: attempts.filter((a) => a.correct).length,
          badgesEarned: badges.map((b) => b.type),
          streakCount: child.streakCount,
        });
      }

      try {
        await this.emailService.sendWeeklyDigest(
          parent.email,
          parent.displayName,
          summaries,
        );
      } catch (err) {
        this.logger.error(
          `Failed to send digest to parent ${parent.id}: ${String(err)}`,
        );
      }
    }

    this.logger.log(`Weekly digests dispatched to ${parents.length} parents`);
  }
}
